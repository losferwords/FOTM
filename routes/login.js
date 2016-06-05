var User = require('models/user').User;
var CustomError = require('models/user').CustomError;
var HttpError = require('error').HttpError;

exports.post = function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;

    User.authorize(username, password, function (err, user) {
        if (err) {
            if (err instanceof CustomError) {
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }

        //Выкидываем с сервера юзера, если тот находится в игре
        var io = req.app.get('io');
        var sid = req.session.id;
        var userRoom = "user:room:" + user.username;
        var connectedSockets = io.of('/').in(userRoom).connected;

        if(io.nsps["/"].adapter.rooms[userRoom]){
            for (var socketId in io.nsps["/"].adapter.rooms[userRoom].sockets) {
                var socket = connectedSockets[socketId];
                socket.emit('kicked');
            }
        }


        req.session.user = user._id;
        res.send({});
    });
};