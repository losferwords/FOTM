var async = require('async');
var util = require('util');
var Character = require('models/character').Character;

var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema;

// схема модели пользователя
var schema = new Schema({
    teamName: {
        type: String,
        unique: true,
        required: true
    },
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    characters: [{
        type: Schema.Types.ObjectId,
        ref: 'Character'
    }],
    rating: {
        type: Number,
        unique: false,
        required: false
    },
    wins: {
        type: Number,
        unique: false,
        required: false
    },
    loses: {
        type: Number,
        unique: false,
        required: false
    },
    inventory: [{
        type: Schema.Types.Mixed,
        unique: false,
        required: false
    }],
    souls: {
        type: Object,
        unique: false,
        required: false
    },
    lastRoll: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    }
});

//Создаём новую команду (пока пустую)
schema.statics.create = function(userId, callback){
    var Team = this;

    async.waterfall([
        function (callback) {
            Team.findOneAndRemove({teamName: "newTeam_"+userId}, callback); //Смотрим, вдруг предыдущая dummyTeam осталась за юзером
        },
        function (deletedTeam, callback) {
            //создадим новую dummy-тиму
            var dummyTeam = new Team({teamName: "newTeam_"+userId, _user: userId, souls: {red: 8, green: 8, blue: 8}});
            dummyTeam.save(function (err) {
                if (err) return callback(err);
                callback(null, dummyTeam);
            });
        },
        function (dummyTeam, callback) {
            //Добавляем созданную тиму в массив команд юзера
            dummyTeam.populate('_user', function(err, team){
                if (err) return callback(err);
                team._user.team=team._id;
                team._user.save(function(err, user){
                    if (err) callback(err);
                    callback(null, team);
                });
            });
        }
    ], callback);
};

//Вычисляем ранг команды
schema.statics.findRank = function(teamId, callback){
    var Team = this;

    async.waterfall([
        function (callback) {
            Team.find({}, callback);
        },
        function (foundedTeams, callback) {
            if(!foundedTeams){
                callback(null, null); //здесь нет ошибки, просто не найдено команд
            }
            else {
                foundedTeams.sort(function (a, b) {
                    if (a.rating < b.rating) {
                        return 1;
                    }
                    if (a.rating > b.rating) {
                        return -1;
                    }
                    //если рейтинг одинаковый, смотрим по числу побед
                    if (a.rating == b.rating) {
                        if(a.wins < b.wins){
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    }
                    return 0;
                });
                for(var i=0;i<foundedTeams.length;i++){
                    if((foundedTeams[i]._id+"")==(teamId+"")){
                        callback(null, i+1); //возвращаем ранг команды
                        break;
                    }
                }
            }
        }
    ], callback);
};

//Выборка тимы (Со всеми персонажами)
schema.statics.getPopTeam = function(cond, callback){
    var Team = this;

    async.waterfall([
        function (callback) {
            Team.findOne(cond, callback);
        },
        function (foundedTeam, callback) {
            if(!foundedTeam){
                callback(null, null); //здесь нет ошибки, просто не найдено команд
            }
            else {
                //Добавляем созданную тиму в массив команд юзера
                foundedTeam.populate('characters', function (err, popTeam) {
                    if (err) return callback(err);
                    callback(null, popTeam);
                });
            }
        }
    ], callback);
};

//Выборка Dummy тимы
schema.statics.getDummy = function(userId, callback){
    var Team = this;
    var dummyTeam;
    var dummyChar;

    async.waterfall([
        function (callback) {
            Team.findOne({teamName: "newTeam_"+userId}, callback);
        },
        function (foundedTeam, callback) {
            if(!foundedTeam){
                callback(null, null); //здесь нет ошибки, просто не найдено команд
            }
            else {
                dummyTeam=foundedTeam;
                Character.findOne({charName: "newChar_"+foundedTeam._id}, callback);
            }
        },
        function (foundedChar, callback) {
            if(!foundedChar){
                callback(null, dummyTeam); //здесь нет ошибки, просто не найдено персонажей
            }
            else {
                dummyChar=foundedChar;
                dummyTeam.characters.pull(foundedChar._id);
                dummyTeam.save(function(err){
                    if(err) return callback(err);
                    callback(null, dummyTeam);
                });
            }
        },
        function(newTeam, callback){
            if(!dummyChar){
                callback(null, newTeam);
            }
            else {
                Character.findByIdAndRemove(dummyChar._id, function(err, char){
                    if(err) return callback(err);
                    else{
                        callback(null, newTeam)
                    }
                });
            }
        },
        function(completeTeam, callback){
            if(completeTeam) Team.getPopTeam({_id: completeTeam._id}, callback);
            else callback(null, null);
        }
    ], callback);
};

//Удаление тимы
schema.statics.deleteTeam = function(teamId, callback){
    var Team = this;
    Team.findById(teamId, function(err, team){
        if(err) {
            return callback(err);
        }
        if(team){
            //Сперва удалим персонажей
            team.populate('characters', function(err, popTeam){
                if (err) return callback(err);
                for(var j=0;j<popTeam.characters.length;j++) {
                    popTeam.characters[j].remove(function (err, chars) {
                        if (err) callback(err);
                    });
                }
            });
            //Затем удалим записи о созданных тимах у юзера
            team.populate('_user', function(err, popTeam){
                if (err) return callback(err);
                popTeam._user.team=undefined;
                popTeam._user.save(function(err, user){
                    if (err) callback(err);
                });
            });
            //затем удалим сами тимы
            team.remove(function(err){
                if (err) return callback(err);
                callback(null);
            });
        }
        else {
            callback(new CustomError("Team Deleted"));
        }
    });
};

exports.Team = mongoose.model('Team', schema);

function CustomError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, CustomError);

    this.message = message;
}

util.inherits(CustomError, Error);

CustomError.prototype.name = 'CustomError';

exports.CustomError = CustomError;

