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

        socket.on('createChar', function(){
            var userId = socket.handshake.user._id;
            Team.getByAny({teamName: "newTeam_"+userId}, function(err, team){
                if(err) socket.emit("customError", err);
                if(team!=null){
                    Character.create(team._id, function(err, char){
                        if (err) socket.emit("customError", err);
                        if(char) socket.emit("createCharResult");
                        else log.error("Can't create character");
                    });
                }
                else {
                    socket.emit("customError", "Team not found");
                }
            });
        });

        socket.on('removeChar', function(teamId, charId){
            //Сперва удалим персонажа у команды
            Team.findByIdAndUpdate(teamId, {$pull: {characters: charId}}, function(err, team){
                if(err) socket.emit("customError", err);
                //А потом удалим и его самого
                Character.deleteById(charId, function(err){
                    if (err) socket.emit("customError", err);
                    socket.emit("removeCharResult");
                });
            });
        });

        socket.on('getChar', function(cond){
            Character.getByAny(cond, function(err, char){
                if (err) socket.emit("customError", err);
                if(char) socket.emit("getCharResult", char);
                else socket.emit("getCharResult");
            });
        });

        socket.on('getDummyChar', function(){
            var userId = socket.handshake.user._id;
            Team.findOne({teamName: "newTeam_"+userId}, function(err, team){
                if(err) socket.emit("customError", err);
                Character.getByAny({charName: "newChar_"+team._id}, function(err, char){
                    if (err) socket.emit("customError", err);
                    if(char){
                        char.populate('_team', function(err, popChar) {
                            if (err) socket.emit("customError", err);
                            socket.emit("getDummyCharResult", popChar);
                        });
                    }
                    else {
                        log.error("Can't populate null dummy character.");
                        if(userId) { log.error("userId: "+userId)};
                        if(team) { log.error("newChar: newChar_"+team._id)};
                    }
                });
            });
        });

        socket.on('setChar', function(cond, cb){
            Character.setById(cond._id, cond, function(err, char){
                if (err) socket.emit("customError", err);
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
