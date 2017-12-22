var async = require('async');
var util = require('util');
var Character = require('models/character').Character;
var User = require('models/user').User;
var CharacterFactory = require('services/characterFactory');

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

schema.virtual('id').get(function() {
    return this._id;
});

//GET---------------------------------------------------------------------------

schema.statics.getById = function(teamId, callback) {
    this.findById(teamId, callback); //находим тиму
};

//Получение заполненной активной команды со всеми персонажами
schema.statics.getByUserIdFull = function(userId, callback){
    var Team = this;
    async.waterfall([
        function (callback) {
            User.findById(userId, callback); //находим юзера
        },
        function (user, callback) {
            Team.findById(user.team, function(err, team){
                if (err) return callback(err);
                if(team!==null){
                    callback(null, team);
                }
                else {
                    callback(null, null);
                }
            });
        },
        function (team, callback) {
            if(team){
                team.populate('characters', function(err, popTeam){ //заполняем команду персонажами
                    if (err) return callback(err);
                    for(var i = 0; i < popTeam.characters.length; i++) {
                        popTeam.characters[i] = CharacterFactory(popTeam.characters[i].toObject({virtuals: true}))
                    }
                    callback(null, popTeam);
                });
            }
            else {
                callback(null, null);
            }

        }
    ], callback);
};

//Выборка тимы (Со всеми персонажами)
schema.statics.getTeamPop = function(cond, callback){
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
                foundedTeam.populate('characters', function (err, popTeam) {
                    if (err) return callback(err);
                    callback(null, popTeam);
                });
            }
        }
    ], callback);
};

//Выборка тимы (Со всеми заполнеными персонажами)
schema.statics.getByTeamIdFull = function(teamId, callback){
    var Team = this;

    async.waterfall([
        function (callback) {
            Team.findById(teamId, callback);
        },
        function (foundedTeam, callback) {
            if(!foundedTeam){
                callback(null, null); //здесь нет ошибки, просто не найдено команд
            }
            else {
                foundedTeam.populate('characters', function(err, popTeam){ //заполняем команду персонажами
                    if (err) return callback(err);
                    for(var i = 0; i < popTeam.characters.length; i++) {
                        popTeam.characters[i] = CharacterFactory(popTeam.characters[i].toObject({virtuals: true}))
                    }
                    callback(null, popTeam);
                });
            }
        }
    ], callback);
};

//Выборка тим по любому условию
schema.statics.getAllByAny = function(cond, callback){
    this.find(cond, callback);
};

//Выборка тимы по любому условию
schema.statics.getByAny = function(cond, callback){
    this.findOne(cond, callback);
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
                for(var i = 0; i < foundedTeams.length; i++){
                    if((foundedTeams[i].id + "") == (teamId + "")){
                        callback(null, i + 1); //возвращаем ранг команды
                        break;
                    }
                }
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
                Character.findOne({charName: "newChar_"+foundedTeam.id}, callback);
            }
        },
        function (foundedChar, callback) {
            if(!foundedChar){
                callback(null, dummyTeam); //здесь нет ошибки, просто не найдено персонажей
            }
            else {
                dummyChar=foundedChar;
                dummyTeam.characters.pull(foundedChar.id);
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
                Character.findByIdAndRemove(dummyChar.id, function(err, char){
                    if(err) return callback(err);
                    else{
                        callback(null, newTeam)
                    }
                });
            }
        },
        function(completeTeam, callback){
            if(completeTeam) Team.getTeamPop({_id: completeTeam.id}, callback);
            else callback(null, null);
        }
    ], callback);
};

//CREATE---------------------------------------------------------------------

//Создаём новую команду (пока пустую)
schema.statics.create = function(userId, callback){
    var Team = this;

    async.waterfall([
        function (callback) {
            Team.findOneAndRemove({teamName: "newTeam_"+userId}, callback); //Смотрим, вдруг предыдущая dummyTeam осталась за юзером
        },
        function (deletedTeam, callback) {
            //создадим новую dummy-тиму
            var dummyTeam = new Team({teamName: "newTeam_"+userId, _user: userId, souls: {red: 16, green: 16, blue: 16}});
            dummyTeam.save(function (err) {
                if (err) return callback(err);
                callback(null, dummyTeam);
            });
        },
        function (dummyTeam, callback) {
            //Добавляем созданную тиму в массив команд юзера
            dummyTeam.populate('_user', function(err, team){
                if (err) return callback(err);
                team._user.team=team.id;
                team._user.save(function(err, user){
                    if (err) callback(err);
                    callback(null, team);
                });
            });
        }
    ], callback);
};

//UPDATE---------------------------------------------------------------------

schema.statics.setById = function(teamId, setter, callback) {
    this.findByIdAndUpdate(teamId, {$set: setter}, {upsert: true, new: true}, callback);
};

//DELETE---------------------------------------------------------------------

//Удаление тимы
schema.statics.deleteTeam = function(teamId, callback){
    var Team = this;
    Team.findById(teamId, function(err, team){
        if(err) callback(err);

        if(team){
            //Сперва удалим персонажей
            team.populate('characters', function(err, popTeam){
                if (err) return callback(err);
                async.each(popTeam.characters, function(characterInTeam, callback) {
                    characterInTeam.remove(function (err) {
                        if (err) callback(err);
                        else callback(null, null);
                    });
                }, function(err){
                    if (err) callback(err);

                    //Затем удалим записи о созданных тимах у юзера
                    popTeam.populate('_user', function(err, popTeam){
                        if (err) return callback(err);
                        popTeam._user.team=undefined;
                        popTeam._user.save(function(err, user){
                            if (err) callback(err);
                        });
                        //затем удалим сами тимы
                        popTeam.remove(function(err){
                            if (err) return callback(err);
                            callback(null);
                        });
                    });
                });
            });
        }
        else {
            callback(new CustomError("Team For deletion not found"));
        }
    });
};

//Удаление недоделанных команд и персонажей
schema.statics.deleteDummies = function(userId, callback){
    var Team = this;
    async.waterfall([
        function (callback) {
            //Сперва удалим персонажей
            Team.findOne({teamName: "newTeam_"+userId}, function(err, team){
                if(err) return callback(err);
                //Если найдена хоть одна dummy тима, удалим её
                if(team) return callback(null, team);
                else return callback({status: 'no team'}, null); //выход из waterfall
            });
        },
        function (team, callback) {
            team.populate('characters', function(err, popTeam){
                if (err) return callback(err);
                async.each(popTeam.characters, function(characterInTeam, callback) {
                    characterInTeam.remove(function (err) {
                        if (err) callback(err);
                        else callback(null, null);
                    });
                }, function(err) {
                    if (err) callback(err);
                    callback(null, popTeam);
                });
            });
        },
        function (popTeam, callback) {
            //Затем удалим записи о созданных тимах у юзера
            popTeam.populate('_user', function(err, popUserTeam){
                if (err) {
                    return callback(err);
                }
                popUserTeam._user.team=undefined;
                popUserTeam._user.save(function(err, user){
                    if (err) {
                        callback(err);
                    }
                    callback(null, popUserTeam);
                });
            });
        },
        function (team, callback) {
            var deletedTeam = team;
            //затем удалим сами тимы
            team.remove(function(err){
                if (err) return callback(err);
                console.log("Team "+deletedTeam.teamName+" was deleted");
                callback(null);
            });
        }
    ], callback);
};

module.exports.Team = mongoose.model('Team', schema);

function CustomError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, CustomError);

    this.message = message;
}

util.inherits(CustomError, Error);

CustomError.prototype.name = 'CustomError';

module.exports.CustomError = CustomError;

