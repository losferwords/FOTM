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

        socket.on('getAllUsersPop', function(cb){
            var usersList = [];
            User.getAll(function(err, users){
                if (err) {
                    socket.emit("customError", err);
                    return;
                }
                var serverSockets = io.of('/').in(socket.serSt.serverRoom).connected;
                async.each(users, function(user, callback) {
                    var currentUser = user;
                    currentUser._doc.isOnline = false;
                    //��������� ������ ������
                    for (var socketId in io.nsps["/"].adapter.rooms[socket.serSt.serverRoom].sockets) {
                        if(io.nsps["/"].adapter.rooms[socket.serSt.serverRoom].sockets.hasOwnProperty(socketId)){
                            var socketItem = serverSockets[socketId];
                            if (currentUser.id === socketItem.handshake.user.id) {
                                currentUser._doc.isOnline=true;
                            }
                        }
                    }
                    if(user.team){
                        Team.getByUserIdFull(user._id, function(err, fullTeam) {
                            currentUser.team = fullTeam;
                            usersList.push(currentUser._doc);
                            callback(null);
                        });
                    }
                    else {
                        usersList.push(currentUser._doc);
                        callback(null);
                    }
                }, function(err){
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }
                    cb(usersList);
                });
            });
        });

        socket.on('deleteUser', function(id, cb) {
            var userId = id;
            User.getById(userId, function(err, foundedUser) {
                if(foundedUser.team) {
                    Team.deleteTeam(foundedUser.team, function(err){
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        User.remove({_id: userId}, function(err) {
                            if (err) {
                                socket.emit("customError", err);
                                return;
                            }
                            socket.emit("deleteUserResult");
                        });
                    });
                }
                else {
                    User.remove({_id: userId}, function(err) {
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        cb()
                    });
                }

            });
        });

    });
};


