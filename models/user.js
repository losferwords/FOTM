var crypto = require('crypto');
var async = require('async');
var util = require('util');

var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema;

// схема модели пользователя
var schema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    team: {
        type: Schema.Types.ObjectId,
        ref: 'Team'
    },
    created: {
        type: Date,
        default: Date.now
    },
    lastVisit: {
        type: Date
    }
});

//GET---------------------------------------------------------------------

schema.statics.getById = function(userId, callback) {
    this.findById(userId, callback); //находим юзера
};

schema.statics.getAll = function(callback) {
    this.find({}, callback); //находим всех юзеров
};

schema.statics.authorize = function (username, password, callback) {

    /**
     * 1. Получить пользователя с таким username из базы данных
     * 2. Такой пользователь найден?
     *      Да - сверить пароль вызовом user.checkPassword
     *      Нет - ошибка, пользователь не найден
     * 3. Авторизация успешна?
     *      Да - сохранить id посетителя в сессию session.user = user.id и ответить 200
     *      Нет - вывести ошибку (403 или другую)
     */

    var User = this;
    async.waterfall([
        function (callback) {
            User.findOne({username: username}, callback);
        },
        function (user, callback) {
            if (user) {
                if (user.checkPassword(password)) {
                    callback(null, user)
                } else {
                    callback(new CustomError('Password incorrect'));
                }
            } else {
                callback(new CustomError('User not found'));
            }
        }
    ], callback);
};

schema.methods.encryptPassword = function (password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
    .set(function (password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._plainPassword;
    });

schema.virtual('id').get(function() {
    return this._id;
});

schema.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

//CREATE---------------------------------------------------------------------

schema.statics.register = function (username, password, email, callback) {
    /**
     * 1. ПРоверить, есть ли такой пользователь или email в базе данных
     * 2. Такой пользователь или email найден?
     *      Да - ошибка регистрации
     *      Нет - регистрируем нового User
     * 3. Авторизация успешна?
     *      Да - сохранить id посетителя в сессию session.user = user.id и ответить 200
     *      Нет - вывести ошибку (403 или другую)
     */
    var User = this;

    async.waterfall([
        function (callback) {
            User.findOne({username: username}, callback); //сперва проверяем login
        },
        function (user, callback) {
            //если такого пользователя нет, то проверим и email
            if(!user) {
                User.findOne({email: email}, callback);
            }
            //а если есть, то просто отправляем его дальше
            else {
                callback(null, user);
            }
        },
        function (data, callback) {
            //если data есть, значит либо пользователь, либо email заняты
            if(data){
                //выдаём соответствующие ошибки
                if (data.username==username) {
                    callback(new CustomError('User is already created'));
                } else if (data.email==email) {
                    callback(new CustomError('This e-mail is in use'));
                }
            }
            else {
                //если нет, то создаём нового пользователя
                var new_user = new User({username: username, password: password, email: email});
                new_user.save(function (err) {
                    if (err) return callback(err);
                    callback(null, new_user);
                });
            }
        }
    ], callback);
};

//UPDATE---------------------------------------------------------------------

schema.statics.setById = function(userId, setter, callback) {
    this.findByIdAndUpdate(userId,
        {$set: setter}, {upsert: true, new: true},
        callback);
};

//DELETE---------------------------------------------------------------------

module.exports.User = mongoose.model('User', schema);



function CustomError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, CustomError);

    this.message = message;
}

util.inherits(CustomError, Error);

CustomError.prototype.name = 'CustomError';

module.exports.CustomError = CustomError;

