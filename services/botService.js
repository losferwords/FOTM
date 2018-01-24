var CharacterFactory = require('services/characterFactory');
var characterService = require('services/characterService');
var randomService = require('services/randomService');
var Chance = require('chance');
var chance = new Chance();
var arenaService = require('services/arenaService');
var gemService = require('services/gemService');
var async = require('async');
var fs = require('fs');
var sizeof = require('object-sizeof');

module.exports = {
    thinkTimeLimit: 5000,
    generateBotTeam: function(){
        var newTeam = {
            id: chance.integer({min: 1000000, max: 9999999}),
            teamName: chance.last(),
            isBot: true
        };
        newTeam.characters = this.generateBotCharacters(newTeam.id);
        return newTeam;
    },
    generateBotCharacters: function(teamId){
        var chars = [];
        for(var i = 0; i < 3; i++){
            chars.push(this.generateBotCharacter(teamId));
        }
        return chars;
    },
    generateBotCharacter: function(teamId){
        var char = {
            id: chance.integer({min: 1000000, max: 9999999}),
            gender: characterService.generateRandomGender(),
            race: characterService.generateRandomRace(),
            isBot: true,
            _team: teamId
        };

        char.charName = chance.first({ gender: char.gender.toLowerCase() });
        char.role = characterService.generateRandomRole(char.race);
        char.portrait = characterService.getRandomPortrait(char.race, char.gender);
        var abilitiesArrays = characterService.generateAbilitiesArrays(char.role, char.race, 2);
        char.abilities = abilitiesArrays[0];
        char.params = characterService.getStartParams(char.gender, char.race, char.role);
        char.equip = characterService.getEquip(char.role);
        this.generateGemsForEquip(char);
        return CharacterFactory(char, true);
    },
    generateGemsForEquip: function(char){
        for (var slot in char.equip) {
            if (char.equip.hasOwnProperty(slot) && char.equip[slot] && char.equip[slot].name() !== 'Void') {
                for(var i = 0; i < char.equip[slot].sockets.length; i++){
                    char.equip[slot].sockets[i].gem = gemService.randomizeGem(char.equip[slot].sockets[i].type);
                }             
            }
        }
    },
    buildActionBranchSync: function(myTeam, enemyTeam, activeCharId, wallPositions, thinkTimeStart, actionsCounter){
        var actionList = this.createActionList(myTeam, enemyTeam, activeCharId, wallPositions, thinkTimeStart);

        for(var z = 0; z < actionList.length; z++){
            if(actionList[z].type != "endTurn") {
                actionList[z].branch = this.buildActionBranchSync(actionList[z].myTeamState, actionList[z].enemyTeamState, actionList[z].activeCharId, wallPositions, thinkTimeStart, actionsCounter);
                actionsCounter.value += actionList[z].branch.length;
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
            //this.logTree(actionList[z]);
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
    buildActionBranchAsync: function(myTeam, enemyTeam, activeCharId, wallPositions, thinkTimeStart, cb){
        var self = this;        
        var actionList = this.createActionList(myTeam, enemyTeam, activeCharId, wallPositions);
        var actionsCounter = {
            value: actionList.length
        };

        async.eachOf(actionList, function(actionInList, index, cb){
            process.nextTick(function() {
                if(actionInList.type != "endTurn" ) {
                    actionInList.branch = self.buildActionBranchSync(actionInList.myTeamState, actionInList.enemyTeamState, actionInList.activeCharId, wallPositions, thinkTimeStart, actionsCounter);
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
                //this.logTree(actionInList);
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
            cb(actionList, actionsCounter.value);
        })                            
    },    
    createActionList: function(myTeam, enemyTeam, activeCharId, wallPositions, thinkTimeStart) {    
        var activeChar = arenaService.findCharInMyTeam(activeCharId, myTeam.characters);  
        var score = 0;        
        var actionList = [];
        var bestMovePoints = [];

        if(+(new Date()) - thinkTimeStart > this.thinkTimeLimit) {
            return [{
                type: "endTurn",
                selfScore: this.situationCost(activeChar, myTeam, enemyTeam, wallPositions)
            }];
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
                        var abilityAction = this.abilitySimulation(myTeam, enemyTeam, activeChar, activeChar, checkedAbility, wallPositions);
                        if(abilityAction){
                            actionList.push(abilityAction);
                        }
                        break;
                    case "enemy":
                        enemies = arenaService.findEnemiesForAbility(myTeam, enemyTeam, activeChar, checkedAbility.name, wallPositions, function(){});
                        for (i = 0; i < enemies.length; i++) {
                            for (var j = 0; j < enemyTeam.characters.length; j++) {
                                if(enemyTeam.characters[j].id == enemies[i].id) {
                                    abilityAction = this.abilitySimulation(myTeam, enemyTeam, activeChar, enemies[i], checkedAbility, wallPositions);
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
                                if (myTeam.characters[j].id == allies[i].id) {
                                    abilityAction = this.abilitySimulation(myTeam, enemyTeam, activeChar, allies[i], checkedAbility, wallPositions);
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
                                if (myTeam.characters[j].id == allies[i].id && activeChar.id != allies[i].id) {
                                    abilityAction = this.abilitySimulation(myTeam, enemyTeam, activeChar, allies[i], checkedAbility, wallPositions);
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
                                if (enemyTeam.characters[j].id == characters[i].id) {
                                    abilityAction = this.abilitySimulation(myTeam, enemyTeam, activeChar, characters[i], checkedAbility, wallPositions);
                                    if(abilityAction){
                                        actionList.push(abilityAction);
                                    }
                                }
                            }
                            for (j = 0; j < myTeam.characters.length; j++) {
                                if(!checkedAbility.usageLogic(activeChar, myTeam.characters[j], myTeam.characters, enemyTeam.characters, wallPositions)) continue;
                                if (myTeam.characters[j].id == characters[i].id) {
                                    abilityAction = this.abilitySimulation(myTeam, enemyTeam, activeChar, characters[i], checkedAbility, wallPositions);
                                    if(abilityAction){
                                        actionList.push(abilityAction);
                                    }
                                }
                            }
                        }
                        break;
                    case "move":
                        var abilityMovePoints = arenaService.findMovePoints(myTeam, enemyTeam, activeChar, checkedAbility.name, wallPositions, function(){});
                        var bestPositions = [];
                        //find only 3 best positions 
                        for(i = 0; i < abilityMovePoints.length; i++){                                                      
                            var weights = arenaService.calculatePositionWeight(abilityMovePoints[i], activeChar, myTeam.characters, enemyTeam.characters, arenaService.getOptimalRange(activeChar), wallPositions);
                            bestPositions.push({
                                point: abilityMovePoints[i],
                                weightScore: weights[0] * 6 + weights[1] * 4
                            })
                        }

                        bestPositions.sort(function (a, b) {
                            if (a.weightScore <= b.weightScore) {
                                return 1;
                            }
                            else if (a.weightScore > b.weightScore) {
                                return -1;
                            }
                        }); 

                        bestPositions = bestPositions.slice(0, 3);

                        for(var j = 0; j < bestPositions.length; j++) {
                            var castMoveSituationObject = arenaService.moveCharSimulation(bestPositions[j].point, myTeam, enemyTeam, activeChar.id, checkedAbility.name, wallPositions);
                            score = this.situationCost(castMoveSituationObject.activeChar, castMoveSituationObject.myTeam, castMoveSituationObject.enemyTeam, wallPositions);
                            actionList.push({
                                type: "move",
                                ability: checkedAbility.name,
                                point: bestPositions[j].point,
                                selfScore: score,
                                myTeamState: castMoveSituationObject.myTeam,
                                enemyTeamState: castMoveSituationObject.enemyTeam,
                                activeCharId: castMoveSituationObject.activeChar.id
                            });
                        }
                        break;
                }
            }
        }     

        var movePoints = arenaService.findMovePoints(myTeam, enemyTeam, activeChar, false, wallPositions, function(){});
        
        //find only 3 best positions 
        for(var i = 0; i < movePoints.length; i++){                                                      
            var weights = arenaService.calculatePositionWeight(movePoints[i], activeChar, myTeam.characters, enemyTeam.characters, arenaService.getOptimalRange(activeChar), wallPositions);
            bestMovePoints.push({
                point: movePoints[i],
                weightScore: weights[0] * 6 + weights[1] * 4
            })
        }

        bestMovePoints.sort(function (a, b) {
            if (a.weightScore <= b.weightScore) {
                return 1;
            }
            else if (a.weightScore > b.weightScore) {
                return -1;
            }
        }); 

        bestMovePoints = bestMovePoints.slice(0, 3);

        for(j = 0; j < bestMovePoints.length; j++){
            var newSituationObject = arenaService.moveCharSimulation(bestMovePoints[j].point, myTeam, enemyTeam, activeCharId, false, wallPositions);
            score = this.situationCost(newSituationObject.activeChar, newSituationObject.myTeam, newSituationObject.enemyTeam, wallPositions);
            actionList.push({
                type: "move",
                point: bestMovePoints[j].point,
                selfScore: score,
                myTeamState: newSituationObject.myTeam,
                enemyTeamState: newSituationObject.enemyTeam,
                activeCharId: newSituationObject.activeChar.id
            });
        }

        if(+(new Date()) - thinkTimeStart > this.thinkTimeLimit) {
            actionList = [];
        }

        actionList.push({
            type: "endTurn",
            selfScore: actionList.length == 0 ? this.situationCost(activeChar, myTeam, enemyTeam, wallPositions) : 0
        });

        return actionList;
    },
    abilitySimulation: function(myTeam, enemyTeam, activeChar, target, checkedAbility, wallPositions){                
        if(checkedAbility.usageLogic(activeChar, target, myTeam.characters, enemyTeam.characters, wallPositions)) {
            var situationObject = arenaService.castAbilitySimulation(myTeam, enemyTeam, activeChar.id, target.id, checkedAbility.name, wallPositions);
            var score = this.situationCost(situationObject.activeChar, situationObject.myTeam, situationObject.enemyTeam, wallPositions);
            return {
                type: "cast",
                ability: checkedAbility.name,
                selfScore: score,
                targetId: target.id,
                myTeamState: situationObject.myTeam,
                enemyTeamState: situationObject.enemyTeam,
                activeCharId: situationObject.activeChar.id
            } 
        }
    },
    situationCost: function(activeChar, myTeam, enemyTeam, wallPositions){
        var score = 0;
        var effectScore = 0;

        //active
        score += activeChar.curHealth / activeChar.maxHealth * 110;
        score += activeChar.curMana / activeChar.maxMana * 55;
        var positionWeights = arenaService.calculatePositionWeight(activeChar.position, activeChar, myTeam.characters, enemyTeam.characters, arenaService.getOptimalRange(activeChar), wallPositions);
        score += positionWeights[0] * 250 + Math.random();
        score += positionWeights[1] * 125 + Math.random();

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
            if(myTeam.characters[i].id !== activeChar.id) {
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
        }

        //enemyTeam
        for(i = 0; i < enemyTeam.characters.length; i++){            
            var enemy = enemyTeam.characters[i];
            score -= Math.exp(enemy.curHealth / enemy.maxHealth * 3) * 15 - 200;
            score -= enemy.curMana / enemy.maxMana * 50;            

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
        //var str = "\n" + name;
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
        var path = "./decisionTreeBuilder/trees/treeLog_";
        var fileIndex = 0;
        while (fs.existsSync(path + fileIndex + ".json")) {
            fileIndex++;
        }  
        var tree = this.buildDebugTreeBranch(actions);
        fs.appendFile(path + fileIndex + ".json", JSON.stringify({"type" : "root", "children" : tree}), function() {}); 
    },
    buildDebugTreeBranch: function(parent){
        var branch = []
        for(var i = 0; i < parent.length; i++) {
            branch.push({
                type: parent[i].type,
                ability: parent[i].ability,
                score: parent[i].score,
                selfScore: parent[i].selfScore,
                children: parent[i].branch ? this.buildDebugTreeBranch(parent[i].branch) : undefined
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
            delete char.updateMods;
            delete char.removeRandomBuff;
            delete char.removeRandomDebuff;
            delete char.removeAllDebuffs;
            delete char.removeRandomDOT;
            delete char.stealRandomBuff;
            delete char.afterDealingDamage;
            delete char.afterDamageTaken;
            delete char.afterMiss;
            delete char.removeImmobilization;
            delete char.afterCast;
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
    },
    checkForRetreat: function(myTeam, enemyTeam) {
        var myTeamTotalHealth = 0;
        var enemyTeamTotalHealth = 0;
        for(var i = 0; i < myTeam.characters.length; i++) {
            myTeamTotalHealth += myTeam.characters[i].curHealth / myTeam.characters[i].maxHealth;
        }

        for(i = 0; i < enemyTeam.characters.length; i++) {
            enemyTeamTotalHealth += enemyTeam.characters[i].curHealth / enemyTeam.characters[i].maxHealth;
        }

        return enemyTeamTotalHealth - myTeamTotalHealth > 1.5;
    }
};