var sessionStore = require('lib/sessionStore');
var HttpError = require('error').HttpError;
var User = require('models/user').User;

exports.loadSession = function(sid, callback) {
    sessionStore.load(sid, function (err, session) {
        if (arguments.length == 0) {
            //no arguments => no session
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });
};

exports.loadUser = function(session, callback) {
    if (!session.user) {
        return callback(null, null);
    }

    User.getById(session.user, function (err, user) {
        if (err) return callback(err);

        if (!user) {
            return callback(null, null);
        }
        callback(null, user);
    })
};