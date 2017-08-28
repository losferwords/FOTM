var CharacterFactory = require('services/characterFactory');
var characterService = require('services/characterService');
var randomService = require('services/randomService');
var Chance = require('chance');
var chance = new Chance();
var arenaService = require('services/arenaService');
var fs = require('fs');

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
        for(var i=0;i<3;i++){
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
        char.availableAbilities = abilitiesArrays[1];
        char.params = characterService.getStartParams(char.gender, char.race, char.role);
        char.equip = characterService.getEquip(char.role);
        //ToDo: create random gems here
        return CharacterFactory(char);
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
    calculateEffectScore(effectScores, name){
        var totalScore = 0;
        var str = "\n" + name;
        for(var key in effectScores){
            totalScore += effectScores[key] ? effectScores[key] : 0;
        }
        str += "\t " + (effectScores['effectScore'] ? Math.round(effectScores['effectScore']) : 0);
        str += "\t " + (effectScores['leftScore'] ? Math.round(effectScores['leftScore']) : 0);
        str += "\t " + (effectScores['offensivePositionScore'] ? Math.round(effectScores['offensivePositionScore']) : 0);
        str += "\t " + (effectScores['defensivePositionScore'] ? Math.round(effectScores['defensivePositionScore']) : 0);
        str += "\t " + (effectScores['healthScore'] ? Math.round(effectScores['healthScore']) : 0);
        str += "\t " + (effectScores['manaScore'] ? Math.round(effectScores['manaScore']) : 0);
        str += "\t " + (Math.round(totalScore));
        fs.appendFile("./effectLog.txt", str, function() {});
        return totalScore;
    }    
};