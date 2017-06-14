var CharacterFactory = require('services/characterFactory');
var characterService = require('services/characterService');
var randomService = require('services/randomService');
var Chance = require('chance');
var chance = new Chance();
var arenaService = require('services/arenaService');

module.exports = {
    //создание команды ботов
    generateBotTeam: function(){
        var self = this;
        var newTeam = {
            _id: chance.integer({min: 1000000, max: 9999999}),
            teamName: chance.last()
        };
        newTeam.characters = self.generateBotCharacters(newTeam._id);
        return newTeam;
    },
    //создание массива персонажей для команды ботов
    generateBotCharacters: function(teamId){
        var self = this;
        var chars = [];
        for(var i=0;i<3;i++){
            chars.push(self.generateBotCharacter(teamId));
        }
        return chars;
    },
    //создание персонажа для команды ботов
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
        char.availableAbilities = abilitiesArrays[1];
        char.params = characterService.getStartParams(char.gender, char.race, char.role);
        char.equip = characterService.getEquip(char.role);
        //ToDo: create random gems here
        return CharacterFactory(char);
    },
    createSituation: function(wallPositions, myTeam, enemyTeam, activeChar){
        var self = this;
        var situation = {};

        situation.activeChar = self.charState(wallPositions, myTeam, enemyTeam, activeChar);
        var myTeamStates = [];
        for(var i=0; i<myTeam.characters.length;i++){
            if(myTeam.characters[i]._id == activeChar._id) continue;
            myTeamStates.push(self.charState(wallPositions, myTeam, enemyTeam, myTeam.characters[i]));
        }
        situation.myTeamStates = myTeamStates;
        var enemyTeamStates = [];
        for(i=0; i<enemyTeam.characters.length;i++){
            if(enemyTeam.characters[i]._id == activeChar._id) continue;
            enemyTeamStates.push(self.charState(wallPositions, enemyTeam, myTeam, enemyTeam.characters[i]));
        }
        situation.enemyTeamStates = enemyTeamStates;
        return situation;
    },
    charState: function(wallPositions, myTeam, enemyTeam, char){
        var self = this;
        var allChars = myTeam.characters.concat(enemyTeam.characters);
        var state = {
            isDead: char.isDead,
            clearCast: char.clearCast,
            invisible: char.invisible,
            silenced: char.silenced,
            disarmed: char.disarmed,
            stunned: char.stunned,
            immobilized: char.immobilized,
            underProphecy: char.underProphecy,
            physImmune: char.physImmune,
            magicImmune: char.magicImmune,
            controlImmune: char.controlImmune,
            attackPower: char.attackPower,
            maxHealth: char.maxHealth,
            healthReg: char.healthReg,
            physRes: char.physRes,
            blockChance: char.blockChance,
            critChance: char.critChance,
            maxEnergy: char.maxEnergy,
            hitChance: char.hitChance,
            dodgeChance: char.dodgeChance,
            luck: char.luck,
            spellPower: char.spellPower,
            maxMana: char.maxMana,
            manaReg: char.manaReg,
            magicRes: char.magicRes,
            initiative: char.initiative,
            maxDamage: char.maxDamage,
            buffs: self.numberOfEffects(char, "buffs"),
            debuffs: self.numberOfEffects(char, "debuffs"),
            curHealth: char.curHealth/char.maxHealth,
            curEnergy: char.curEnergy/char.maxEnergy,
            curMana: char.curMana/char.maxMana,
            optimalRange: self.getOptimalRange(char)
        };

        var positionWeights = arenaService.calculatePositionWeight(char.position, char, myTeam.characters, enemyTeam.characters, state.optimalRange, wallPositions);
        state.positionWeightOff = positionWeights[0];
        state.positionWeightDef = positionWeights[1];

        //var normalizedAbilities = self.normalizeAbilities(char);
        //for(var i=0;i<normalizedAbilities.length;i++){
        //    for(var j=0;j<normalizedAbilities[i].length;j++){
        //        state["ability"+i+j] = normalizedAbilities[i][j];
        //    }
        //}

        return state;
    },
    situationCost: function(situation){
        var score = 0;

        //active
        score+=situation.activeChar.curHealth * 110;
        score+=situation.activeChar.positionWeightOff * 150;
        score+=situation.activeChar.positionWeightDef * 100;

        score+=situation.activeChar.spellPower * 15;

        //myTeam
        for(var i=0; i<situation.myTeamStates.length;i++){
            var ally = situation.myTeamStates[i];
            score+=ally.curHealth * 100;
            score+=ally.spellPower * 10;
        }

        //enemyTeam
        for(i=0; i<situation.enemyTeamStates.length;i++){
            var enemy = situation.enemyTeamStates[i];
            score-=enemy.curHealth * 100;
            score-=enemy.spellPower * 10;
        }
        return score;
    },
    getPrediction: function(activeChar, situation, actionList){
        var newSituation;
        for(var i=0; i<actionList.length; i++){
            switch(actionList[i].type){
                case 'move':
                    newSituation = extend({}, situation);
                    //newSituation.activeChar.
                    //    actionList[i].weight = moveOWeight>= moveDWeight ? moveOWeight : moveDWeight;
                    break;
                case 'cast':
                    var ability = arenaService.getAbilityForCharByName(activeChar, actionList[i].ability);
                    var abilityUsage = ability.usage();
                    var usageWeights = [];
                    for(var key in ability.usage()){
                        if(abilityUsage.hasOwnProperty(key)){
                            usageWeights.push(prediction[key] * Math.abs(prediction[key]-abilityUsage[key]));
                        }
                    }
                    var usageWeightsSum = 0;
                    for(var j = 0; j < usageWeights.length; j++){
                        usageWeightsSum += usageWeights[j];
                    }

                    actionList[i].weight = usageWeights/abilityUsage.length;
                    break;
                case 'endTurn':
                    actionList[i].weight = prediction.endTurn;
            }
        }
        return actionList;
    },
    normalizeParam: function(param, activeChar, allChars){
        var maxParam = 0;
        for(var i=0;i<allChars.length;i++){
            if(allChars[i][param]>maxParam) maxParam = allChars[i][param];
        }
        return maxParam > 0 ? activeChar[param]/maxParam : 0;
    },
    numberOfEffects: function(activeChar, effectType){
        var totalEffects=0;
        for(var i=0;i<activeChar[effectType].length;i++){
            if(activeChar[effectType][i].stacked) totalEffects+=activeChar[effectType][i].stacks;
            else totalEffects++;
        }
        return totalEffects;
    },
    normalizeRole: function(activeChar){
        var charRoleNorm = {offensive: 0, defensive: 0, control: 0, support: 0, gain: 0, weakening: 0, aoe: 0};
        for(var i=0;i<activeChar.abilities.length;i++){
            var usage = activeChar.abilities[i].usage();
            for(var key in usage){
                if(usage.hasOwnProperty(key)){
                    charRoleNorm[key] += usage[key];
                }
            }
        }
        for(key in charRoleNorm){
            if(charRoleNorm.hasOwnProperty(key)){
                charRoleNorm[key] = charRoleNorm[key]/activeChar.abilities.length;
            }
        }
        return charRoleNorm;
    },
    getOptimalRange: function(activeChar){
        var rangeSum = 0;
        var rangeCount = 0;
        for(var i=0;i<activeChar.abilities.length;i++){
            if(activeChar.abilities[i].range() != 'self'){
                rangeSum+=activeChar.abilities[i].range();
                rangeCount++;
            }
        }
        return rangeSum/rangeCount;
    },
    normalizeAbilities: function(activeChar){
        var normalizedAbilities = [];
        for(var i=0;i<activeChar.abilities.length;i++){
            var abilityNorm = [];
            var usage = activeChar.abilities[i].usage();
            for(var key in usage){
                if(usage.hasOwnProperty(key)){
                    abilityNorm.push(usage[key]);
                }
            }
            abilityNorm.push(Number(arenaService.checkAbilityForUse(activeChar.abilities[i], activeChar)));
            normalizedAbilities.push(abilityNorm);
        }
        return normalizedAbilities;
    }
};