var User = require('models/user').User;
var CustomError = require('models/user').CustomError;
var HttpError = require('error').HttpError;

exports.post = function (req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    User.register(username, password, email, function (err, user) {
        if (err) {
            if (err instanceof CustomError) {
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }
        res.send({});
    });
};