var async = require('async');
var util = require('util');
var CharacterFactory = require('services/characterFactory');

var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema;

// схема модели пользователя
var schema = new Schema({
    charName: {
        type: String,
        required: true
    },
    _team: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        required:true
    },
    gender: {
        type: String
    },
    race: {
        type: String
    },
    role: {
        type: String
    },
    portrait: {
        type: String
    },
    params: {
        type: Object
    },
    equip: {
        type: Object
    },
    abilities: [{
        type: Schema.Types.Mixed,
        unique: false,
        required: false
    }],
    availableAbilities: [{
        type: Schema.Types.Mixed,
        unique: false,
        required: false
    }],
    lose: {
        type: Boolean
    },
    created: {
        type: Date,
        default: Date.now
    }
}, { usePushEach: true });

schema.virtual('id').get(function() {
    return this._id;
});

//GET------------------------------------------------------------------------

schema.statics.getById = function(charId, callback) {
    this.findById(charId, callback);
};

schema.statics.getByIdFull = function(charId, callback){
    async.waterfall([
        function (callback) {
            this.findById(charId, callback);
        },
        function (foundedChar, callback) {
            if(!foundedChar){
                callback(null, null); //здесь нет ошибки, просто не найдено чаров
            }
            else {
                foundedChar = CharacterFactory(foundedChar);
                callback(null, foundedChar);
            }
        }
    ], callback);
};

//Выборка чара по любому условию
schema.statics.getByAny = function(cond, callback){
    this.findOne(cond, callback);
};

//Выборка чаров по любому условию
schema.statics.getAllByAny = function(cond, callback){
    this.find(cond, callback);
};

//CREATE---------------------------------------------------------------------

//Создаём нового персонажа (пока пустого)
schema.statics.create = function(teamId, callback){
    var Character = this;

    async.waterfall([
        function (callback) {
            var dummyChar = new Character({charName: "newChar_"+teamId, _team: teamId});
            dummyChar.save(function (err) {
                if (err) return callback(err);
                callback(null, dummyChar);
            });
        },
        function (dummyChar, callback) {
            //Добавляем созданного персонажа в массив персонажей команды
            dummyChar.populate('_team', function(err, char){
                if (err) return callback(err);
                if(!char._team) callback(new CustomError("Team Not Found"));
                char._team.characters.push(char._id);
                char._team.save(function(err, team){
                    if (err) return callback(err);
                    callback(null, dummyChar);
                });
            });
        }
    ], callback);
};

//UPDATE---------------------------------------------------------------------

schema.statics.setById = function(charId, setter, callback) {
    this.findByIdAndUpdate(charId,
        {$set: setter}, {upsert: true, new: true},
        callback);
};

//DELETE---------------------------------------------------------------------

schema.statics.deleteById = function(charId, callback) {
    this.findByIdAndRemove(charId, callback);
};

module.exports.Character = mongoose.model('Character', schema);

function CustomError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, CustomError);

    this.message = message;
}

util.inherits(CustomError, Error);

CustomError.prototype.name = 'CustomError';

module.exports.CustomError = CustomError;

//Вариант обновления всей базы
//Character.find({}, function(err, chars){
//    if (err) socket.emit("customError", err);
//    console.log("Total chars: "+chars.length);
//    chars.forEach(function(char, i) {
//        if(char.portrait)
//        {
//            if(char.portrait.length>0){
//                char.portrait = char.portrait.replace("images/portraits/", "images/assets/img/portraits/");
//                char.save(function(err, char){
//                    console.log("RENAME ready for "+i+": "+char.charName);
//                    if (err) socket.emit("customError", err);
//                });
//            }
//        }
//    });
//    console.log("READY");
//});