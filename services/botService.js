var CharacterFactory = require('services/characterFactory');
var characterService = require('services/characterService');
var randomService = require('services/randomService');
var Chance = require('chance');
var chance = new Chance();

module.exports = {
    //создание команды ботов
    generateBotTeam: function(){
        var self = this;
        var newTeam = {
            _id: chance.integer({min: 1000000, max: 9999999}),
            teamName: chance.word({length: 8})
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
            charName: chance.first(),
            gender: characterService.generateRandomGender(),
            race: characterService.generateRandomRace(),
            isBot: true,
            _team: teamId
        };

        char.role = characterService.generateRandomRole(char.race);
        char.portrait = characterService.getRandomPortrait(char.race, char.gender);
        var abilitiesArrays = characterService.generateAbilitiesArrays(char.role, char.race);
        char.abilities = abilitiesArrays[0];
        char.availableAbilities = abilitiesArrays[1];
        char.params = characterService.getStartParams(char.gender, char.race, char.role);
        char.equip = characterService.getEquip(char.role);
        //ToDo: create random gems here
        return CharacterFactory(char);
    }
}