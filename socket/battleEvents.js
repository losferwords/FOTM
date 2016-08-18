var log = require('lib/log')(module);
var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;
var socketUtils = require('socket/socketUtils');

module.exports = function (serverIO) {
    var io = serverIO;
    io.on('connection', function (socket) {

        socket.on('checkOpponent', function(room) {
            socket.broadcast.to(room).emit('areYouReadyToBattle');
        });

        socket.on('areYouReadyToBattleResponse', function(room) {
            socket.broadcast.to(room).emit('opponentReady');
        });

        //socket.on('getAlliesAndEnemies', function(room) {
        //    if(!socket.serSt.battleRoom) {
        //        socket.serSt.battleRoom = room; //������������ battleRoom ��� ������� ������
        //    }
        //    if(!room || !socket.serSt.battleRoom) return;
        //    var battleSocket=Object.keys(io.nsps["/"].adapter.rooms[room].sockets);
        //    var allyUserId;
        //    var enemyUserId;
        //    var allyTeam ={};
        //    var enemyTeam ={};
        //    if(battleSocket[0]==socket.id){
        //        allyUserId = io.sockets.connected[battleSocket[0]].handshake.user._id;
        //        enemyUserId = io.sockets.connected[battleSocket[1]].handshake.user._id;
        //    }
        //    else {
        //        allyUserId = io.sockets.connected[battleSocket[1]].handshake.user._id;
        //        enemyUserId = io.sockets.connected[battleSocket[0]].handshake.user._id;
        //    }
        //
        //    //������ ���� ���� �������
        //    User.getById(allyUserId, function(err, allyUser){
        //        if(err) socket.emit("customError", err);
        //        //��������� �
        //        Team.getTeamPop({_id: allyUser.team}, function(err, popAllyTeam){
        //            if(err) socket.emit("customError", err);
        //            allyTeam=popAllyTeam;
        //            //���� �� ������ ������
        //            if(allyTeam){
        //                //���� ����� �������
        //                User.getById(enemyUserId, function(err, enemyUser) {
        //                    if (err) socket.emit("customError", err);
        //                    //��������� �
        //                    Team.getTeamPop({_id: enemyUser.team}, function (err, popEnemyTeam) {
        //                        if (err) socket.emit("customError", err);
        //                        enemyTeam = popEnemyTeam;
        //                        //���� �� ������, �� ���������� ���� �������
        //                        if(enemyTeam){
        //                            socket.batSt.battleStart=true;
        //                            socket.emit('getAlliesAndEnemiesResult', allyTeam, enemyTeam);
        //                        }
        //                    });
        //                });
        //            }
        //        });
        //    });
        //});

        socket.on('enemyTeamLoaded', function(room) {
            socket.broadcast.to(room).emit('enemyTeamLoadedResult');
        });

        socket.on('combatLogUpdate', function(room, message) {
            socket.broadcast.to(room).emit('combatLogUpdateSend', message);
        });

        socket.on('turnEnded', function(room, char, turnsSpended) {
            io.sockets.in(room).emit('turnEndedResult', char, ++turnsSpended);
        });

        socket.on('updateActiveTeam', function(room, chars) {
            socket.broadcast.to(room).emit('updateActiveTeamResult', chars);
        });

        socket.on('updateTeams', function(room, chars1, chars2) {
            io.sockets.in(room).emit('updateTeamsResult', chars1, chars2);
        });

    });
};
