var log = require('lib/log')(module);
var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;

module.exports = function (serverIO) {
    var io = serverIO;
    io.on('connection', function (socket) {

        socket.on('getUserName', function () {
            socket.emit("getUserNameResult", socket.serSt.username);
        });

        socket.on('removeUsersDummies', function() {
            User.getAll(function (err, users) {
                if (err) socket.emit("customError", err);

                for (var i = 0; i < users.length; i++) {
                    Team.deleteDummies(users[i]._id);
                }
            });
        });

        socket.on('getAllUsersPop', function(){
            var usersList = [];
            User.getAll(function(err, users){
                if (err) socket.emit("customError", err);
                var serverSockets = io.of('/').in(socket.serSt.serverRoom).connected;
                async.each(users, function(user, callback) {
                    var currentUser = user;
                    currentUser._doc.isOnline = false;
                    //Проверяем онлайн игрока
                    for (var socketId in io.nsps["/"].adapter.rooms[socket.serSt.serverRoom].sockets) {
                        if(io.nsps["/"].adapter.rooms[socket.serSt.serverRoom].sockets.hasOwnProperty(socketId)){
                            var socketItem = serverSockets[socketId];
                            if (currentUser.id === socketItem.handshake.user.id) {
                                currentUser._doc.isOnline=true;
                            }
                        }
                    }
                    if(user.team){
                        user.populate('team', function(err, userWithTeam){
                            if (err) return callback(err);
                            currentUser = userWithTeam;
                            currentUser.team.populate('characters', function(err, teamWithChars){
                                if (err) return callback(err);
                                currentUser.team = teamWithChars;
                                usersList.push(currentUser);
                                callback(null);
                            });
                        })
                    }
                    else {
                        usersList.push(currentUser);
                        callback(null);
                    }
                }, function(err){
                    if (err) socket.emit("customError", err);
                    socket.emit('getAllUsersPopResult', usersList);
                });
            });
        });

        socket.on('deleteUser', function(id) {
            var userId = id;
            User.getById(userId, function(err, foundedUser) {
                if(foundedUser.team) {
                    Team.deleteTeam(foundedUser.team, function(err){
                        if (err) socket.emit("customError", err);
                        User.remove({_id: userId}, function(err) {
                            if (err) socket.emit("customError", err);
                            socket.emit("deleteUserResult");
                        });
                    });
                }
                else {
                    User.remove({_id: userId}, function(err) {
                        if (err) socket.emit("customError", err);
                        socket.emit("deleteUserResult");
                    });
                }

            });
        });

    });
};


