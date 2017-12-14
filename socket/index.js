var async = require('async');
var config = require('config');
var cookieParser = require('cookie-parser');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;
var socketUtils = require('socket/socketUtils');

module.exports = function (server) {

    var secret = config.get('session:secret');
    var sessionKey = config.get('session:key');

    var io = require('socket.io').listen(server,
        {
            pingInterval: 90000,
            pingTimeout: 30000
        });

    io.use(function (socket, next) {
        var handshakeData = socket.request;

        async.waterfall([
            function (callback) {
                //получить sid
                var parser = cookieParser(secret);
                parser(handshakeData, {}, function (err) {
                    if (err) return callback(err);

                    var sid = handshakeData.signedCookies[sessionKey];
                    socketUtils.loadSession(sid, callback);
                });
            },
            function (session, callback) {
                if (!session) {
                    return callback(new HttpError(401, "No session"));
                }
                socket.handshake.session = session;
                socketUtils.loadUser(session, callback);
            },
            function (user, callback) {
                if (!user) {
                    return callback(new HttpError(403, "Anonymous session may not connect"));
                }
                callback(null, user);
            }
        ], function (err, user) {

            if (err) {
                if (err instanceof HttpError) {
                    return next(new Error('not authorized'));
                }
                next(err);
            }

            socket.handshake.user = user;
            next();
        });
    });

    io.on('connection', function (socket) {
        //Server State для сокета
        socket.serSt = {
            username: "",
            serverRoom: "",
            userRoom: "",
            arenaLobby: "",
            battleRoom: ""
        };
        socket.serSt.username = socket.handshake.user.username;
        //Первоначально юзер входит в комнату всего сервера
        socket.serSt.serverRoom = "server:room";
        socket.join(socket.serSt.serverRoom);
        //а затем в свою собственную комнату
        socket.serSt.userRoom = "user:room:" + socket.serSt.username;
        socket.join(socket.serSt.userRoom);

        socket.serSt.arenaLobby = "arenaLobby:room"; //Очередь на арену

        //Отправляем всем игрокам на сервере сообщение об изменении
        //количества человек на сервере
        var serverOnlineUsers = Object.keys(io.nsps["/"].adapter.rooms[socket.serSt.serverRoom].sockets).length;
        io.sockets.in(socket.serSt.serverRoom).emit('join', serverOnlineUsers, socket.serSt.username);
        console.log("User "+socket.serSt.username+" join game");

        //Обновляем у пользователя время последнего визита
        User.setById(socket.handshake.user._id, {lastVisit: new Date()}, function(err, user) {
            if (err) {
                socket.emit("customError", err);
            }
        });

        socket.on('disconnect', function () {
            if(io.nsps["/"].adapter.rooms[socket.serSt.serverRoom]) { //Проверка на то, что я последний человек на сервере
                serverOnlineUsers = Object.keys(io.nsps["/"].adapter.rooms[socket.serSt.serverRoom].sockets).length;
                socket.broadcast.to(socket.serSt.serverRoom).emit('leave', serverOnlineUsers); //Покидаем сервер
                console.log("User "+socket.serSt.username+" leave game");
                //И выкидываем из боя оппонента, если сами вышли
                if (socket.serSt.battleRoom) {
                    //Вылетевшей команде засчитываем поражение
                    var userId = socket.handshake.user._id;
                    Team.getByUserIdFull(userId, function(err, team){
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        var rateChange = 0;
                        if(team.rating-25>=1000) rateChange=25;
                        Team.setById(team._id, {
                            rating: team.rating-rateChange,
                            souls: {red: team.souls.red+2, green: team.souls.green+2, blue: team.souls.blue+2},
                            loses: team.loses+1
                        }, function(err, team){
                            if (err) {
                                socket.emit("customError", err);
                                return;
                            }
                            Character.getAllByAny({_team: team._id}, function(err, chars){
                                if (err) {
                                    socket.emit("customError", err);
                                    return;
                                }
                                for(var i=0;i<chars.length;i++){
                                    Character.setById(chars[i]._id, {lose: true}, function(err){
                                        if (err) {
                                            socket.emit("customError", err);
                                        }
                                    });
                                }
                            });
                        });
                    });

                    //Выкидываем оппонента
                    if(io.nsps["/"].adapter.rooms[socket.serSt.battleRoom]){
                        var battleSockets = Object.keys(io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].sockets);
                    }
                    if (battleSockets) {
                        socket.broadcast.to(socket.serSt.battleRoom).emit('enemyLeave');
                    }
                }
            }
            Team.deleteDummies(socket.handshake.user._id);
        });

    });

    return io;
};

//ОЧИСТКА ПОСЛЕ ВАЙПА
//User.find({}, function(err, users){
//    if (err) socket.emit("customError", err);
//    console.log("Total users: "+users.length);
//    users.forEach(function(user, i) {
//        if(user.team)
//        {
//            user.team = undefined;
//            user.save(function(err, user){
//                console.log("team clean ready for "+i+": "+user.username);
//                if (err) socket.emit("customError", err);
//            });
//        }
//    });
//    console.log("READY");
//});
