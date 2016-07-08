var log = require('lib/log')(module);
var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;

module.exports = function (serverIO) {
    var io = serverIO;
    io.on('connection', function (socket) {

        socket.on('createTeam', function(){
            Team.create(socket.handshake.user._id, function(err, data){
                if (err) socket.emit("customError", err);
            });
        });

        socket.on('getDummyTeam', function(){
            var userId = socket.handshake.user._id;
            //Пытаемся найти уже существующую dummy
            Team.getDummy(userId, function (err, team) {
                if (err) socket.emit("customError", err);
                if(team){
                    socket.emit("getDummyTeamResult", team);
                }
                //Если не нашли, создаём её
                else
                {
                    Team.create(socket.handshake.user._id, function(err, newTeam){
                        if (err) socket.emit("customError", err);
                        socket.emit("getDummyTeamResult", newTeam);
                    });
                }
            });
        });

        socket.on('getTeam', function(cond){
            Team.findOne(cond, function(err, team){
                if (err) socket.emit("customError", err);
                if(team) socket.emit("getTeamResult", team);
                else socket.emit("getTeamResult");
            });
        });

        socket.on('setTeam', function(cond){
            Team.setById(cond._id, cond, function(err, team){
                if (err) socket.emit("customError", err);
                socket.emit("setTeamResult");
            });
        });

        socket.on('removeDummyTeam', function(){
            Team.deleteDummies(socket.handshake.user._id, function (err, data) {
                if (err && err.status!='no team') socket.emit("customError", err);
            });
        });

        socket.on('deleteTeam', function(teamId){
            Team.deleteTeam(teamId, function(err){
                if (err) {
                    socket.emit("customError", err);
                }
            });
        });

        socket.on('checkUserTeam', function(){
            var userId = socket.handshake.user._id;
            Team.deleteDummies(userId, function (err, data) {
                if (err && err.status!='no team') socket.emit("customError", err);

                User.getById(userId, function(err, findedUser) {
                    if (err) socket.emit("customError", err);
                    if(findedUser.team) {
                        socket.emit("checkUserTeamResult", findedUser.team);
                    }
                    else {
                        socket.emit("checkUserTeamResult");
                    }
                });
            });
        });

        socket.on('getUserTeam', function(){
            var userId=0;

            //ОЧИСТКА БОЕВЫХ КОМНАТ
            if(socket.serSt.battleRoom) {
                socket.leave(socket.serSt.battleRoom);
                socket.serSt.battleRoom=undefined;
            }
            userId = socket.handshake.user._id;

            Team.getByUserIdFull(userId, function(err, team){
                if (err) socket.emit("customError", err);
                if(!team) {
                    //Если тима не найдена, значит она была удалена, а ссылка на неё осталась
                    User.setById(userId, {team: undefined}, function(err, user){
                        if (err) socket.emit("customError", err);
                        socket.emit("getUserTeamResult", null);
                    });
                }
                else {
                    //Устанавливаем команду на сокете (выбираем только документы, отсекаем методы модели)
                    var teamForSocket = team._doc;
                    var charactersForSocket = [];
                    for(var i=0;i<team._doc.characters.length;i++){
                        charactersForSocket.push(team._doc.characters[i]._doc);
                    }
                    teamForSocket.characters = charactersForSocket;
                    socket.team = teamForSocket;
                    //ищем ранк
                    Team.findRank(team._id, function (err, rank) {
                        if (err) socket.emit("customError", err);

                        //Отправим (текущее время на сервере - время последнего рола)
                        var nowTime = new Date();

                        socket.emit("getUserTeamResult", team, rank, (nowTime - team.lastRoll));
                    });
                }
            });
        });

    });
};
