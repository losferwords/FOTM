var CharacterFactory = require('services/characterFactory');
var characterService = require('services/characterService');
var randomService = require('services/randomService');
var Chance = require('chance');
var chance = new Chance();
var arenaService = require('services/arenaService');
var async = require('async');
var fs = require('fs');
var sizeof = require('object-sizeof');

module.exports = {
    generateBotTeam: function(){
        var self = this;
        var newTeam = {
            _id: chance.integer({min: 1000000, max: 9999999}),
            teamName: chance.last()
        };
        newTeam.characters = self.generateBotCharacters(newTeam._id);
        return newTeam;
    },
    generateBotCharacters: function(teamId){
        var self = this;
        var chars = [];
        for(var i = 0; i < 3; i++){
            chars.push(self.generateBotCharacter(teamId));
        }
        return chars;
    },
    generateBotCharacter: function(teamId){
        var self = this;
        var char = {
            _id: chance.integer({min: 1000000, max: 9999999}),
            gender: characterService.generateRandomGender(),
            race: characterService.generateRandomRace(),
            isBot: true,
            _team: teamId
        };

        char.charName = chance.first({ gender: char.gender.toLowerCase() });
        char.role = characterService.generateRandomRole(char.race);
        char.portrait = characterService.getRandomPortrait(char.race, char.gender);
        var abilitiesArrays = characterService.generateAbilitiesArrays(char.role, char.race);
        char.abilities = abilitiesArrays[0];
        char.params = characterService.getStartParams(char.gender, char.race, char.role);
        char.equip = characterService.getEquip(char.role);
        //ToDo: create random gems here
        return CharacterFactory(char, true);
    },
    buildActionBranchSync: function(myTeam, enemyTeam, activeCharId, wallPositions){
        var self = this;
        var actionList = self.createActionList(myTeam, enemyTeam, activeCharId, wallPositions);

        for(var z = 0; z < actionList.length; z++){
            if(actionList[z].type != "endTurn") {
                actionList[z].branch = self.buildActionBranchSync(actionList[z].myTeamState, actionList[z].enemyTeamState, actionList[z].activeCharId, wallPositions);
                if(actionList[z].branch && actionList[z].branch[0]) {
                    actionList[z].score = actionList[z].selfScore + actionList[z].branch[0].score;
                    delete actionList[z].branch;
                }
                else {
                    actionList[z].score = actionList[z].selfScore;
                }
            }
            else {
                actionList[z].score = actionList[z].selfScore;
            }
            //self.logTree(actionList[z]);
        }

        actionList.sort(function (a, b) {
            if (a.score <= b.score) {
                return 1;
            }
            else if (a.score > b.score) {
                return -1;
            }
        });

        return actionList;                     
    }, 
    buildActionBranchAsync: function(myTeam, enemyTeam, activeCharId, wallPositions, cb){
        var self = this;
        var actionList = self.createActionList(myTeam, enemyTeam, activeCharId, wallPositions);

        async.eachOf(actionList, function(actionInList, index, cb){
            process.nextTick(function() {
                if(actionInList.type != "endTurn" ) {
                    actionInList.branch = self.buildActionBranchSync(actionInList.myTeamState, actionInList.enemyTeamState, actionInList.activeCharId, wallPositions);
                    if(actionInList.branch && actionInList.branch[0]) {
                        actionInList.score = actionInList.selfScore + actionInList.branch[0].score;
                        delete actionInList.branch;
                    }
                    else {
                        actionInList.score = actionInList.selfScore;
                    }
                }
                else {
                    actionInList.score = actionInList.selfScore;
                }
                //self.logTree(actionInList);
                cb(null, null);
            });      
        }, function(err, actions){
            if(err){
                return console.error(err);
            }

            actionList.sort(function (a, b) {
                if (a.score <= b.score) {
                    return 1;
                }
                else if (a.score > b.score) {
                    return -1;
                }
            });     
            cb(actionList); 
        })                            
    },    
    createActionList: function(myTeam, enemyTeam, activeCharId, wallPositions) {
        var self = this;
        var activeChar = arenaService.findCharInMyTeam(activeCharId, myTeam.characters);
        var score = 0;        
        var actionList = [];
        var movePoints = arenaService.findMovePoints(myTeam, enemyTeam, activeChar, false, wallPositions, function(){});
        for(var i = 0; i < movePoints.length; i++){
            var newSituationObject = arenaService.moveCharSimulation(movePoints[i], myTeam, enemyTeam, activeCharId, false, wallPositions);
            score = self.situationCost(newSituationObject.activeChar, newSituationObject.myTeam, newSituationObject.enemyTeam, wallPositions);
            actionList.push({
                type: "move",
                point: movePoints[i],
                selfScore: score,
                myTeamState: newSituationObject.myTeam,
                enemyTeamState: newSituationObject.enemyTeam,
                activeCharId: newSituationObject.activeChar._id
            });
        }
        for(var v = 0; v < activeChar.abilities.length; v++){
            var checkedAbility = activeChar.abilities[v];
            var enemies;
            var allies;
            var characters;
            var targetChar;
            var abilityAction;
            if(arenaService.checkAbilityForUse(checkedAbility, activeChar) && checkedAbility.castSimulation){
                switch(checkedAbility.targetType()){
                    case "self":
                        var abilityAction = self.abilitySimulation(myTeam, enemyTeam, activeChar, activeChar, checkedAbility, wallPositions);
                        if(abilityAction){
                            actionList.push(abilityAction);
                        }
                        break;
                    case "enemy":
                        enemies = arenaService.findEnemiesForAbility(myTeam, enemyTeam, activeChar, checkedAbility.name, wallPositions, function(){});
                        for (i = 0; i < enemies.length; i++) {
                            for (var j = 0; j < enemyTeam.characters.length; j++) {
                                if(enemyTeam.characters[j]._id == enemies[i]._id) {
                                    abilityAction = self.abilitySimulation(myTeam, enemyTeam, activeChar, enemies[i], checkedAbility, wallPositions);
                                    if(abilityAction){
                                        actionList.push(abilityAction);
                                    }
                                }
                            }
                        }
                        break;
                    case "ally":
                        allies = arenaService.findAlliesForAbility(myTeam, enemyTeam, activeChar, checkedAbility.name, wallPositions, function(){});
                        for (i = 0; i < allies.length; i++) {
                            for (j = 0; j < myTeam.characters.length; j++) {
                                if (myTeam.characters[j]._id == allies[i]._id) {
                                    abilityAction = self.abilitySimulation(myTeam, enemyTeam, activeChar, allies[i], checkedAbility, wallPositions);
                                    if(abilityAction){
                                        actionList.push(abilityAction);
                                    }
                                }
                            }
                        }
                        break;
                    case "allyNotMe":
                        allies = arenaService.findAlliesForAbility(myTeam, enemyTeam, activeChar, checkedAbility.name, wallPositions, function(){});
                        for (i = 0; i < allies.length; i++) {
                            for (j = 0; j < myTeam.characters.length; j++) {
                                if (myTeam.characters[j]._id == allies[i]._id && activeChar._id != allies[i]._id) {
                                    abilityAction = self.abilitySimulation(myTeam, enemyTeam, activeChar, allies[i], checkedAbility, wallPositions);
                                    if(abilityAction){
                                        actionList.push(abilityAction);
                                    }
                                }
                            }
                        }
                        break;
                    case "ally&enemy":
                        characters = arenaService.findCharactersForAbility(myTeam, enemyTeam, activeChar, checkedAbility.name, wallPositions, function(){});
                        for (i = 0; i < characters.length; i++) {
                            for (j = 0; j < enemyTeam.characters.length; j++) {
                                if (enemyTeam.characters[j]._id == characters[i]._id) {
                                    actionList.push(self.abilitySimulation(myTeam, enemyTeam, activeChar, characters[i], checkedAbility, wallPositions));
                                    abilityAction = self.abilitySimulation(myTeam, enemyTeam, activeChar, characters[i], checkedAbility, wallPositions);
                                    if(abilityAction){
                                        actionList.push(abilityAction);
                                    }
                                }
                            }
                            for (j = 0; j < myTeam.characters.length; j++) {
                                if(!checkedAbility.usageLogic(activeChar, myTeam.characters[j], myTeam.characters, enemyTeam.characters, wallPositions)) continue;
                                if (myTeam.characters[j]._id == characters[i]._id) {
                                    abilityAction = self.abilitySimulation(myTeam, enemyTeam, activeChar, characters[i], checkedAbility, wallPositions);
                                    if(abilityAction){
                                        actionList.push(abilityAction);
                                    }
                                }
                            }
                        }
                        break;
                    case "move":
                        var abilityMovePoints = arenaService.findMovePoints(myTeam, enemyTeam, activeChar, checkedAbility.name, wallPositions, function(){});
                        for(i = 0; i < abilityMovePoints.length; i++){
                            var castMoveSituationObject = arenaService.moveCharSimulation(abilityMovePoints[i], myTeam, enemyTeam, activeChar._id, checkedAbility.name, wallPositions);
                            score = self.situationCost(castMoveSituationObject.activeChar, castMoveSituationObject.myTeam, castMoveSituationObject.enemyTeam, wallPositions);
                            actionList.push({
                                type: "move",
                                ability: checkedAbility.name,
                                point: abilityMovePoints[i],
                                selfScore: score,
                                myTeamState: castMoveSituationObject.myTeam,
                                enemyTeamState: castMoveSituationObject.enemyTeam,
                                activeCharId: castMoveSituationObject.activeChar._id
                            });
                        }
                        break;
                }
            }
        }

        actionList.push({
            type: "endTurn",
            selfScore: self.situationCost(activeChar, myTeam, enemyTeam, wallPositions)
        });

        return actionList;
    },
    abilitySimulation: function(myTeam, enemyTeam, activeChar, target, checkedAbility, wallPositions){                
        var self = this;
        if(checkedAbility.usageLogic(activeChar, target, myTeam.characters, enemyTeam.characters, wallPositions)) {
            var situationObject = arenaService.castAbilitySimulation(myTeam, enemyTeam, activeChar._id, target._id, checkedAbility.name, wallPositions);
            var score = self.situationCost(situationObject.activeChar, situationObject.myTeam, situationObject.enemyTeam, wallPositions);
            return {
                type: "cast",
                ability: checkedAbility.name,
                selfScore: score,
                targetId: target._id,
                myTeamState: situationObject.myTeam,
                enemyTeamState: situationObject.enemyTeam,
                activeCharId: situationObject.activeChar._id
            } 
        }
    },
    situationCost: function(activeChar, myTeam, enemyTeam, wallPositions){
        var self = this;
        var score = 0;
        var effectScore = 0;

        //active
        score += activeChar.curHealth / activeChar.maxHealth * 110;
        score += activeChar.curMana / activeChar.maxMana * 55;
        var positionWeights = arenaService.calculatePositionWeight(activeChar.position, activeChar, myTeam.characters, enemyTeam.characters, arenaService.getOptimalRange(activeChar), wallPositions);
        score += positionWeights[0] * 600;
        score += positionWeights[1] * 400;

        for(var j = 0; j < activeChar.buffs.length; j++){
            if(activeChar.buffs[j].score) {
                effectScores = activeChar.buffs[j].score(activeChar, myTeam.characters, enemyTeam.characters, wallPositions);
                score += this.calculateEffectScore(effectScores, activeChar.buffs[j].name);
            }
        }

        for(j = 0; j < activeChar.debuffs.length; j++){
            if(activeChar.debuffs[j].score) {
                effectScores = activeChar.debuffs[j].score(activeChar, myTeam.characters, enemyTeam.characters, wallPositions);
                score -= this.calculateEffectScore(effectScores, activeChar.debuffs[j].name);
            }
        }

        //myTeam
        for(var i = 0; i < myTeam.characters.length; i++){
            var ally = myTeam.characters[i];
            score += ally.curHealth / ally.maxHealth * 100;
            score += ally.curMana / ally.maxMana * 50;
            for(j = 0; j < ally.buffs.length; j++){
                if(ally.buffs[j].score) {
                    effectScores = ally.buffs[j].score(ally, myTeam.characters, enemyTeam.characters, wallPositions);
                    score += this.calculateEffectScore(effectScores, ally.buffs[j].name);
                }
            }

            for(j = 0; j < ally.debuffs.length; j++){
                if(ally.debuffs[j].score) {
                    effectScores = ally.debuffs[j].score(ally, myTeam.characters, enemyTeam.characters, wallPositions);
                    score -= this.calculateEffectScore(effectScores, ally.debuffs[j].name);
                }
            }
        }

        //enemyTeam
        for(i = 0; i < enemyTeam.characters.length; i++){
            var enemy = enemyTeam.characters[i];
            score -= enemy.curHealth/enemy.maxHealth * 100;
            score -= enemy.curMana/enemy.maxMana * 50;

            for(j = 0; j < enemy.buffs.length; j++){
                if(enemy.buffs[j].score) {
                    effectScores = enemy.buffs[j].score(enemy, enemyTeam.characters, myTeam.characters, wallPositions);
                    score -= this.calculateEffectScore(effectScores, enemy.buffs[j].name);
                }
            }

            for(j = 0; j < enemy.debuffs.length; j++){
                if(enemy.debuffs[j].score) {
                    effectScores = enemy.debuffs[j].score(enemy, enemyTeam.characters, myTeam.characters, wallPositions);
                    score += this.calculateEffectScore(effectScores, enemy.debuffs[j].name);
                }
            }
        }
        return score;
    },
    calculateEffectScore: function(effectScores, name){
        var totalScore = 0;
        var str = "\n" + name;
        for(var key in effectScores){
            totalScore += effectScores[key] ? effectScores[key] : 0;
        }
        // str += "\t " + (effectScores['effectScore'] ? Math.round(effectScores['effectScore']) : 0);
        // str += "\t " + (effectScores['leftScore'] ? Math.round(effectScores['leftScore']) : 0);
        // str += "\t " + (effectScores['offensivePositionScore'] ? Math.round(effectScores['offensivePositionScore']) : 0);
        // str += "\t " + (effectScores['defensivePositionScore'] ? Math.round(effectScores['defensivePositionScore']) : 0);
        // str += "\t " + (effectScores['healthScore'] ? Math.round(effectScores['healthScore']) : 0);
        // str += "\t " + (effectScores['manaScore'] ? Math.round(effectScores['manaScore']) : 0);
        // str += "\t " + (Math.round(totalScore));
        // fs.appendFile("./effectLog.txt", str, function() {});
        return totalScore;
    },
    logTree: function(actionInList){
        var str = "action: ";
        switch(actionInList.type){
            case "move": 
                if(actionInList.ability){
                    str += "cast\t";
                    str += "ability: " + actionInList.ability;
                }
                else {
                    str += "move\t";
                }
                str += "\tpoint: " + actionInList.point.x + "," + actionInList.point.y;
                break;
            case "cast":
                str += "cast\t";
                str += "ability: " + actionInList.ability;
                str += "\ttarget: " + actionInList.targetId;
                break;
            case "endTurn":
                str += "endTurn\t";
                break;
        }
        str += "\tscore: " + Math.floor(actionInList.selfScore) + "\ttotalScore: " + Math.floor(actionInList.score);
        console.log(str);
    },
    buildDubugTree: function(actions) {
        var self = this;
        var path = "./decisionTreeBuilder/trees/treeLog_";
        var fileIndex = 0;
        while (fs.existsSync(path + fileIndex + ".json")) {
            fileIndex++;
        }  
        var tree = self.buildDebugTreeBranch(actions);
        fs.appendFile(path + fileIndex + ".json", JSON.stringify({"type" : "root", "children" : tree}), function() {}); 
    },
    buildDebugTreeBranch: function(parent){
        var self = this;
        var branch = []
        for(var i = 0; i < parent.length; i++) {
            branch.push({
                type: parent[i].type,
                ability: parent[i].ability,
                score: parent[i].score,
                selfScore: parent[i].selfScore,
                children: parent[i].branch ? self.buildDebugTreeBranch(parent[i].branch) : undefined
            })
        }
        return branch;
    },
    lightWeightTeamBeforeSimulation: function(team){
        delete team.teamName;
        delete team.lead;
        for(var i = 0; i < team.characters.length; i++){
            var char = team.characters[i];
            delete char.battleTextBuffer;
            delete char.logBuffer;
            delete char.soundBuffer;
            delete char.battleColor;
            delete char.charName;
            delete char.gender;
            delete char.isBot;
            delete char.portrait;
            delete char.race;
            delete char.role;
            delete char.state;
            delete char.calcParamsByPoint;
            delete char.calcItem;
            delete char.getSize;

            for(var j = 0; j < char.abilities.length; j++){
                var ability = char.abilities[j];
                delete ability.cast;
                delete ability.icon;
                delete ability.role;
            }

            for(j = 0; j < char.buffs.length; j++){
                var effect = char.buffs[j];
                delete effect.icon;
                delete effect.role;
                delete effect.apply;
            }

            for(j = 0; j < char.debuffs.length; j++){
                var effect = char.debuffs[j];
                delete effect.icon;
                delete effect.role;
                delete effect.apply;
            }
        }

        return team;
    }
};