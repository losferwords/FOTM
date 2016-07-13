var log = require('lib/log')(module);
var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;
var characterService = require('services/characterService');

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
            //�������� ����� ��� ������������ dummy
            Team.getDummy(userId, function (err, team) {
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                if(team){
                    cb(team);
                }
                //���� �� �����, ������ �
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
                //���������, ������� ��� � ��� ������
                for(var soul in souls) {
                    if(souls[soul]<1 || souls[soul]>6) {
                        socket.emit("customError", {message: "wrong soul number"});
                        return;
                    }
                }
                Team.setById(team._id, {
                    souls: {
                        red: team.souls.red+souls.red,
                        green: team.souls.green+souls.green,
                        blue: team.souls.blue+souls.blue
                    }
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

            //������� ������ ������
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
                    //���� ���� �� �������, ������ ��� ���� �������, � ������ �� �� ��������
                    User.setById(userId, {team: undefined}, function(err, user){
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        cb(null);
                    });
                }
                else {
                    //������������� ������� �� ������ (�������� ������ ���������, �������� ������ ������)
                    var teamForSocket = team._doc;
                    var charactersForSocket = [];
                    for(var i=0;i<team._doc.characters.length;i++){
                        charactersForSocket.push(team._doc.characters[i]._doc);
                    }
                    teamForSocket.characters = charactersForSocket;
                    socket.team = teamForSocket;
                    //���� ����
                    Team.findRank(team._id, function (err, rank) {
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }

                        //�������� (������� ����� �� ������� - ����� ���������� ����)
                        var nowTime = new Date();

                        cb(team, rank, (nowTime - team.lastRoll));
                    });
                }
            });
        });

    });
};
