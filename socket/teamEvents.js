var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;
var characterService = require('services/characterService');
var gemService = require('services/gemService');

module.exports = function (serverIO) {
    var io = serverIO;
    io.on('connection', function (socket) {

        socket.on('createTeam', function(){
            Team.create(socket.handshake.user._id, function(err, data){
                if (err) {
                    socket.emit("customError", err);
                }
            });
        });

        socket.on('getDummyTeam', function(cb){
            var userId = socket.handshake.user._id;
            Team.getDummy(userId, function (err, team) {
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                if(team){
                    cb(team);
                }
                else
                {
                    Team.create(socket.handshake.user._id, function(err, newTeam){
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        cb(newTeam);
                    });
                }
            });
        });

        socket.on('checkTeamBeforeCreate', function(cond, cb){
            Team.findOne(cond, function(err, team){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                if(team) cb(team);
                else cb();
            });
        });

        socket.on('saveNewTeam', function(teamObj, cb){
            Team.setById(teamObj._id, {
                teamName: teamObj.teamName,
                rating: 1000,
                wins: 0,
                loses: 0,
                inventory: [],
                souls: teamObj.souls,
                lastRoll: new Date()
            }, function(err, team){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                cb();
            });
        });

        socket.on('setTeam', function(cond, cb){
            Team.setById(cond._id, cond, function(err, team){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                cb(team);
            });
        });

        socket.on('addSoulsAfterRoll', function(teamId, souls){
            Team.getById(teamId, function(err, team) {
                if (err) {
                    socket.emit("customError", err);
                    return;
                }

                for(var soul in souls) {
                    if(souls.hasOwnProperty(soul)){
                        if(souls[soul]<1 || souls[soul]>6) {
                            socket.emit("customError", {message: "wrong soul number"});
                            return;
                        }
                    }
                }
                Team.setById(team._id, {
                    souls: {
                        red: team.souls.red+souls.red,
                        green: team.souls.green+souls.green,
                        blue: team.souls.blue+souls.blue
                    },
                    lastRoll: new Date()
                }, function(err, team){
                    if (err) {
                        socket.emit("customError", err);
                    }
                });
            });
        });

        socket.on('removeDummyTeam', function(){
            Team.deleteDummies(socket.handshake.user._id, function (err, data) {
                if (err && err.status!='no team') socket.emit("customError", err);
            });
        });

        socket.on('deleteTeam', function(teamId){
            Team.deleteTeam(teamId, function(err){
                if (err) {
                    socket.emit("customError", err);
                }
            });
        });

        socket.on('getTeamRoleCost', function(teamId, cb){
            Team.getTeamPop({_id: teamId}, function(err, team){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                if(team) {
                    var resArray = [];
                    for(var i=0;i<team.characters.length;i++){
                        resArray.push(characterService.getRoleCost(team.characters[i].role));
                    }
                    cb(resArray);
                }
            });

        });

        socket.on('checkUserTeam', function(cb){
            var userId = socket.handshake.user._id;
            Team.deleteDummies(userId, function (err, data) {
                if (err && err.status!='no team') {
                    socket.emit("customError", err);
                    return;
                }

                User.getById(userId, function(err, findedUser) {
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }
                    if(findedUser.team) {
                        cb(findedUser.team);
                    }
                    else {
                        cb(null);
                    }
                });
            });
        });

        socket.on('getUserTeam', function(cb){
            var userId=0;

            if(socket.serSt.battleRoom) {
                socket.leave(socket.serSt.battleRoom);
                socket.serSt.battleRoom=undefined;
            }
            userId = socket.handshake.user._id;

            Team.getByUserIdFull(userId, function(err, team){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                if(!team) {
                    User.setById(userId, {team: undefined}, function(err, user){
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        cb(null);
                    });
                }
                else {
                    var teamForSocket = team._doc;
                    var charactersForSocket = [];
                    for(var i=0;i<team.characters.length;i++){
                        charactersForSocket.push(team.characters[i]._doc);
                    }
                    teamForSocket.characters = charactersForSocket;
                    socket.team = teamForSocket;

                    Team.findRank(team._id, function (err, rank) {
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }

                        var nowTime = new Date();

                        cb(team, rank, (nowTime - team.lastRoll));
                    });
                }
            });
        });

        socket.on('craftGem', function(teamId, color, cb){
            Team.getById(teamId, function (err, team) {
                if (err) {
                    socket.emit("customError", err);
                    return;
                }

                var newSouls = team.souls;

                if(color) newSouls[color]-=4;
                else {
                    newSouls.red--;
                    newSouls.green--;
                    newSouls.blue--;
                }

                var newGem = gemService.randomizeGem(color);
                var newInventory = team.inventory;
                newInventory.push(newGem);

                Team.setById(teamId, {inventory: newInventory, souls: newSouls}, function(err, newTeam) {
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }
                    Team.getByTeamIdFull(teamId, function (err, newPopTeam) {
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }

                        cb(newGem, newPopTeam);
                    });
                });
            });
        });

        socket.on('destroyGem', function(teamId, gemToDestroy, cb){
            Team.getById(teamId, function (err, team) {
                if (err) {
                    socket.emit("customError", err);
                    return;
                }

                var found = -1;

                for (var i = 0; i < team.inventory.length; i++) {
                    if (gemToDestroy.id == team.inventory[i].id) {
                        found = i;
                        break;
                    }
                }

                team.inventory.splice(found, 1);

                if (found<0) {
                    socket.emit("customError", {message: "Can't find gem in inventory"});
                    return;
                }

                var delta;
                var newSoul = {};
                var rand = Math.floor(Math.random() * 6);
                if(rand<=2) {
                    delta=2;
                }
                else if(rand>2 && rand<=4) {
                    delta=3;
                }
                else {
                    delta=4
                }
                team.souls[gemToDestroy.color]+=delta;
                newSoul.delta=delta;

                switch(gemToDestroy.color){
                    case 'red': newSoul.image = 'url(../images/assets/svg/view/sprites.svg#inventory--crystal-shine-red)';break;
                    case 'green': newSoul.image = 'url(../images/assets/svg/view/sprites.svg#inventory--crystal-shine-green)';break;
                    case 'blue': newSoul.image = 'url(../images/assets/svg/view/sprites.svg#inventory--crystal-shine-blue)';break;
                }

                Team.setById(teamId, {inventory: team.inventory, souls: team.souls}, function(err, newTeam) {
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }
                    Team.getByTeamIdFull(teamId, function (err, newPopTeam) {
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        cb(newSoul, newPopTeam);
                    });
                });
            });
        });

        socket.on('setGemToSocket', function(teamId, charId, slot, socketIndex, gemId, cb){
            Team.getById(teamId, function (err, team) {
                if (err) {
                    socket.emit("customError", err);
                    return;
                }

                Character.getById(charId, function(err, char){
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }

                    if(!char.equip[slot]) {
                        socket.emit("customError", {message: "Slot not found"});
                        return;
                    }

                    var foundGem = -1;

                    for(var i = 0; i < team.inventory.length; i++){
                        if(team.inventory[i].id == gemId) {
                            foundGem = i;
                            break;
                        }
                    }

                    if (foundGem<0) {
                        socket.emit("customError", {message: "Can't find gem in inventory"});
                        return;
                    }

                    //If socket has gem, return it to inventory
                    if(char.equip[slot].sockets[socketIndex].gem !== "Void") {
                        team.inventory.push(char.equip[slot].sockets[socketIndex].gem);
                    }

                    char.equip[slot].sockets[socketIndex].gem = team.inventory[foundGem];

                    team.inventory.splice(foundGem, 1);

                    Character.setById(charId, {equip: char.equip}, function(err, newChar) {
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }

                        Team.setById(teamId, {inventory: team.inventory}, function(err, newTeam) {
                            if (err) {
                                socket.emit("customError", err);
                                return;
                            }

                            Team.getByTeamIdFull(teamId, function (err, newPopTeam) {
                                if (err) {
                                    socket.emit("customError", err);
                                    return;
                                }

                                var teamForSocket = newPopTeam._doc;
                                var charactersForSocket = [];
                                for(var i=0;i<newPopTeam.characters.length;i++){
                                    charactersForSocket.push(newPopTeam.characters[i]._doc);
                                }
                                teamForSocket.characters = charactersForSocket;
                                socket.team = teamForSocket;

                                cb(newPopTeam);
                            });
                        });
                    });
                });

            });
        });

        socket.on('setGemToInventory', function(teamId, charId, slot, gemId, cb){
            Team.getById(teamId, function (err, team) {
                if (err) {
                    socket.emit("customError", err);
                    return;
                }

                Character.getById(charId, function(err, char){
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }

                    if(!char.equip[slot]) {
                        socket.emit("customError", {message: "Slot not found"});
                        return;
                    }

                    var foundSocket = -1;

                    for(var i=0;i<char.equip[slot].sockets.length;i++){
                        if(char.equip[slot].sockets[i].gem.id == gemId) {
                            foundSocket = i;
                            break;
                        }
                    }

                    if (foundSocket<0) {
                        socket.emit("customError", {message: "Can't find gem in sockets"});
                        return;
                    }

                    team.inventory.push(char.equip[slot].sockets[foundSocket].gem);

                    char.equip[slot].sockets[foundSocket].gem = "Void";

                    Character.setById(charId, {equip: char.equip}, function(err, newChar) {
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        Team.setById(teamId, {inventory: team.inventory}, function(err, newTeam) {
                            if (err) {
                                socket.emit("customError", err);
                                return;
                            }
                            Team.getByTeamIdFull(teamId, function (err, newPopTeam) {
                                if (err) {
                                    socket.emit("customError", err);
                                    return;
                                }

                                var teamForSocket = newPopTeam._doc;
                                var charactersForSocket = [];
                                for(var i=0;i<newPopTeam.characters.length;i++){
                                    charactersForSocket.push(newPopTeam.characters[i]._doc);
                                }
                                teamForSocket.characters = charactersForSocket;
                                socket.team = teamForSocket;

                                cb(newPopTeam);
                            });
                        });
                    });
                });

            });
        });

    });
};
