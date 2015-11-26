var crypto = require('crypto');
var async = require('async');
var util = require('util');
var Team = require('models/team').Team;
var Character = require('models/character').Character;

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
    }
});

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

schema.methods.checkPassword = function (password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function (username, password, callback) {

    /**
     * 1. Получить пользователя с таким username из базы данных
     * 2. Такой пользователь найден?
     *      Да - сверить пароль вызовом user.checkPassword
     *      Нет - ошибка, пользователь не найден
     * 3. Авторизация успешна?
     *      Да - сохранить _id посетителя в сессию session.user = user._id и ответить 200
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

schema.statics.register = function (username, password, email, callback) {
    /**
     * 1. ПРоверить, есть ли такой пользователь или email в базе данных
     * 2. Такой пользователь или email найден?
     *      Да - ошибка регистрации
     *      Нет - регистрируем нового User
     * 3. Авторизация успешна?
     *      Да - сохранить _id посетителя в сессию session.user = user._id и ответить 200
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

//Удаление недоделанных команд и персонажей
schema.statics.deleteDummies = function(team, callback){
    var User = this;
        //Сперва удалим персонажей
        team.populate('characters', function(err, popTeam){
            if (err) {
                return callback(err);
            }
            for(var j=0;j<popTeam.characters.length;j++) {
                popTeam.characters[j].remove(function (err, chars) {
                    if (err) {
                        callback(err);
                    }
                });
            }
        });
        //Затем удалим записи о созданных тимах у юзера
        team.populate('_user', function(err, team){
            if (err) {
                return callback(err);
            }
            team._user.team=undefined;
            team._user.save(function(err, user){
                if (err) {
                    callback(err);
                }
            });
        });
        //затем удалим сами тимы
        team.remove(function(err){
            if (err) {
                return callback(err);
            }
            callback(null);
        });
};

//Получение заполненной активной команды со всеми персонажами
schema.statics.getTeam = function(userId, callback){
    var User = this;
    async.waterfall([
        function (callback) {
            User.findById(userId, callback); //находим юзера
        },
        function (user, callback) {
            Team.findById(user.team, function(err, team){
                if (err) return callback(err);
                callback(null, team);
            });
        },
        function (team, callback) {
            team.populate('characters', function(err, popTeam){ //заполняем команду персонажами
                if (err) return callback(err);
                callback(null, popTeam);
            });
        }
    ], callback);
};

exports.User = mongoose.model('User', schema);


function CustomError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, CustomError);

    this.message = message;
}

util.inherits(CustomError, Error);

CustomError.prototype.name = 'CustomError';

exports.CustomError = CustomError;

