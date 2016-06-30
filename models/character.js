var async = require('async');
var util = require('util');

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
});

//GET------------------------------------------------------------------------

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

//DELETE---------------------------------------------------------------------

exports.Character = mongoose.model('Character', schema);

function CustomError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, CustomError);

    this.message = message;
}

util.inherits(CustomError, Error);

CustomError.prototype.name = 'CustomError';

exports.CustomError = CustomError;