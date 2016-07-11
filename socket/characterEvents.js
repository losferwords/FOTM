var log = require('lib/log')(module);
var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;
var CharacterFactory = require('services/characterFactory');
var AbilityFactory = require('services/abilityFactory');
var characterService = require('services/characterService');

module.exports = function (serverIO) {
    var io = serverIO;
    io.on('connection', function (socket) {

        socket.on('createChar', function(cb){
            var userId = socket.handshake.user._id;
            Team.getByAny({teamName: "newTeam_"+userId}, function(err, team){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                if(team!=null){
                    Character.create(team._id, function(err, char){
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        if(char) cb();
                        else log.error("Can't create character");
                    });
                }
                else {
                    socket.emit("customError", "Team not found");
                }
            });
        });

        socket.on('removeChar', function(teamId, charId, cb){
            Team.findByIdAndUpdate(teamId, {$pull: {characters: charId}}, function(err, team){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                Character.deleteById(charId, function(err){
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }
                    cb();
                });
            });
        });

        socket.on('checkCharBeforeCreate', function(cond, cb){
            //Проверяем имя персонажа
            Character.getByAny(cond, function(err, char){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                if(char) cb(char);
                else cb(null);
            });
        });

        socket.on('getStartParams', function(gender, race, role, cb) {
            cb(characterService.getStartParams(gender, race, role));
        });

        socket.on('saveNewChar', function(charObj, cb){
            if(charObj.role=='random') charObj.role = characterService.generateRandomRole(charObj.race);
            var abilitiesArrays = characterService.generateAbilitiesArrays(charObj.role, charObj.race);

            Character.setById(charObj._id, {
                charName: charObj.charName,
                gender: charObj.gender,
                race: charObj.race,
                role: charObj.role,
                portrait: charObj.portrait,
                abilities: abilitiesArrays[0],
                availableAbilities: abilitiesArrays[1],
                params: characterService.getStartParams(charObj.gender, charObj.race, charObj.role),
                equip: characterService.getEquip(charObj.role),
                lose: false
            }, function(err, char){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                var roleCost = characterService.getRoleCost(char._doc.role);
                Team.getById(char._doc._team, function(err, team){
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }

                    Team.setById(team._id, {
                        souls: {
                            red: team.souls.red-roleCost.red,
                            green: team.souls.green-roleCost.green,
                            blue: team.souls.blue-roleCost.blue
                        }
                    }, function(err, team) {
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }

                        cb(team._doc);
                    });
                });

            });
        });

        socket.on('getDummyChar', function(cb){
            var userId = socket.handshake.user._id;
            Team.findOne({teamName: "newTeam_"+userId}, function(err, team){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                Character.getByAny({charName: "newChar_"+team._id}, function(err, char){
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }
                    if(char){
                        char.populate('_team', function(err, popChar) {
                            if (err) {
                                socket.emit("customError", err);
                                return;
                            }
                            cb(popChar);
                        });
                    }
                    else {
                        log.error("Can't populate null dummy character.");
                        if(userId) { log.error("userId: "+userId)}
                        if(team) { log.error("newChar: newChar_"+team._id)}
                    }
                });
            });
        });

        socket.on('setChar', function(cond, cb){
            Character.setById(cond._id, cond, function(err, char){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                cb(CharacterFactory(char._doc));
            });
        });

        socket.on('calcCharByParams', function(charId, point, cb){
            if(socket.team){
                for(var i=0;i<socket.team.characters.length;i++) {
                    if(socket.team.characters[i]._id==charId) {
                        socket.team.characters[i].calcParamsByPoint(point);
                        cb(socket.team.characters[i]);
                        break;
                    }
                }
            }
        });

        socket.on('getAbility', function(name, cb){
            cb(characterService.abilityForClient(AbilityFactory(name).name, 3));
        });

        socket.on('getAbilities', function(nameArray, cb){
            var abilityArray = [];
            for(var i=0;i<nameArray.length;i++){
                abilityArray.push(characterService.abilityForClient(AbilityFactory(nameArray[i]).name, 3));
            }
            cb(abilityArray);
        });

    });
};
