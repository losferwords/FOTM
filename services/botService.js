var CharacterFactory = require('services/characterFactory');
var characterService = require('services/characterService');
var randomService = require('services/randomService');
var Chance = require('chance');
var chance = new Chance();
var arenaService = require('services/arenaService');

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
        score += activeChar.curHealth/activeChar.maxHealth * 110;
        score += activeChar.curMana/activeChar.maxMana * 55;
        var positionWeights = arenaService.calculatePositionWeight(activeChar.position, activeChar, myTeam.characters, enemyTeam.characters, arenaService.getOptimalRange(activeChar), wallPositions);
        score += positionWeights[0] * 150;
        score += positionWeights[1] * 100;;

        for(var i=0; i<activeChar.buffs.length; i++){
            if(activeChar.buffs[i].score) {
                effectScore = activeChar.buffs[i].score(activeChar, myTeam.characters, enemyTeam.characters, wallPositions);
                console.log("Active char Buff " + activeChar.buffs[i].name +" score: +" + effectScore);
                score += effectScore;
            }
        }

        for(i=0; i<activeChar.debuffs.length; i++){
            if(activeChar.debuffs[i].score) {
                effectScore = activeChar.debuffs[i].score(activeChar, myTeam.characters, enemyTeam.characters, wallPositions);
                console.log("Active char Debuff " + activeChar.buffs[i].name +" score: -" + effectScore);
                score -= effectScore;
            }
        }

        //myTeam
        for(i=0; i<myTeam.characters.length;i++){
            var ally = myTeam.characters[i];
            score += ally.curHealth/ally.maxHealth * 100;
            score += ally.curMana/ally.maxMana * 50;
            for(var j=0; i<ally.buffs.length; i++){
                if(ally.buffs[i].score) {
                    effectScore = ally.buffs[i].score(ally, myTeam.characters, enemyTeam.characters, wallPositions);
                    console.log("Ally Buff " + activeChar.buffs[i].name +" score: +" + effectScore);
                    score += effectScore;
                }
            }

            for(j=0; i<ally.debuffs.length; i++){
                if(ally.debuffs[i].score) {
                    effectScore = ally.debuffs[i].score(ally, myTeam.characters, enemyTeam.characters, wallPositions);
                    console.log("Ally Debuff " + activeChar.buffs[i].name +" score: -" + effectScore);
                    score -= effectScore;
                }
            }
        }

        //enemyTeam
        for(i=0; i<enemyTeam.characters.length;i++){
            var enemy = enemyTeam.characters[i];
            score -= enemy.curHealth/enemy.maxHealth * 100;
            score -= enemy.curMana/enemy.maxMana * 50;

            for(j=0; i<enemy.buffs.length; i++){
                if(enemy.buffs[i].score) {
                    effectScore = enemy.buffs[i].score(enemy, enemyTeam.characters, myTeam.characters, wallPositions);
                    console.log("Enemy Buff " + activeChar.buffs[i].name +" score: -" + effectScore);
                    score -= effectScore;
                }
            }

            for(j=0; i<ally.debuffs.length; i++){
                if(enemy.debuffs[i].score) {
                    effectScore = enemy.debuffs[i].score(enemy, enemyTeam.characters, myTeam.characters, wallPositions);
                    console.log("Enemy Debuff " + activeChar.buffs[i].name +" score: +" + effectScore);
                    score += effectScore;
                }
            }
        }
        return score;
    }    
};