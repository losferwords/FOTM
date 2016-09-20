var log = require('lib/log')(module);
var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;
var socketUtils = require('socket/socketUtils');
var arenaService = require('services/arenaService');
var characterService = require('services/characterService');

module.exports = function (serverIO) {
    var io = serverIO;
    io.on('connection', function (socket) {

        socket.on('checkOpponent', function(room) {
            socket.broadcast.to(room).emit('areYouReadyToBattle');
        });

        socket.on('areYouReadyToBattleResponse', function(room) {
            socket.broadcast.to(room).emit('opponentReady');
        });

        socket.on('findMovePoints', function(myTeamId, enemyTeamId, preparedAbility, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.getActiveChar(battleData.queue[0], myTeam.characters, enemyTeam.characters);
            if(activeChar.canMove()) {
                var range = 1;
                if(preparedAbility){
                    var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                    if(ability){
                        range = ability.range;
                    }
                }
                cb(arenaService.findMoves(activeChar, myTeam.characters, enemyTeam.characters, battleData.wallPositions, range));
                return;
            }
            cb([]);
        });

        socket.on('turnEnded', function(myTeamId, enemyTeamId) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.getActiveChar(battleData.queue[0], myTeam.characters, enemyTeam.characters);
            battleData.turnsSpended++;
            activeChar.initiativePoints = activeChar.initiativePoints*0.2;
            for(var i=0;i<myTeam.characters.length;i++){
                myTeam.characters[i].refreshChar(myTeam.characters, enemyTeam.characters);
            }//Обновляем своих персонажей
            for(i=0;i<enemyTeam.characters.length;i++){
                enemyTeam.characters[i].refreshChar(enemyTeam.characters, myTeam.characters);
            }//Обновляем персонажей противника

            battleData.queue = arenaService.calcQueue(myTeam.characters, enemyTeam.characters);
            io.sockets.in(socket.serSt.battleRoom).emit('turnEndedResult', battleData);
            cleanBuffers(myTeam, enemyTeam);
        });

        //Функция проверяет, закончен ли бой
        socket.on('checkForWin', function(myTeamId, enemyTeamId, enemyLeave, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];

            var myDeaths=0;
            var enemyDeaths=0;
            var ratingChange=0;
            var gainedSouls ={red: 0, green:0, blue: 0};

            for(var i=0;i<myTeam.characters.length;i++){
                if(myTeam.characters[i].isDead) {
                    myDeaths++;
                }
            }

            for(i=0;i<enemyTeam.characters.length;i++){
                if(enemyTeam.characters[i].isDead || enemyLeave) {
                    enemyDeaths++;
                    //Добавляем душ за каждого убитого
                    switch(enemyTeam.characters[i].role){
                        case "sentinel" : gainedSouls.red+=4;break;
                        case "slayer" : gainedSouls.red+=4;break;
                        case "redeemer" : gainedSouls.green+=4;break;
                        case "ripper" : gainedSouls.green+=4;break;
                        case "prophet" : gainedSouls.blue+=4;break;
                        case "malefic" : gainedSouls.blue+=4;break;
                        case "cleric" : switch(Math.floor(Math.random() * 3)) {
                            case 0 : gainedSouls.red+=4;break;
                            case 1 : gainedSouls.green+=4;break;
                            case 2 : gainedSouls.blue+=4;break;
                        }
                            break;
                        case "heretic" : switch(Math.floor(Math.random() * 3)) {
                            case 0 : gainedSouls.red+=4;break;
                            case 1 : gainedSouls.green+=4;break;
                            case 2 : gainedSouls.blue+=4;break;
                        }
                            break;
                    }
                }
            }

            if(myDeaths==3){
                makeLose();
            }
            else if(enemyDeaths==3){
                makeWin();
            }
            //Вышло время
            else if(battleData.turnsSpended>=100){
                if(myDeaths>enemyDeaths){
                    makeLose();
                }
                else if(myDeaths<enemyDeaths){
                    makeWin();
                }
                else {
                    makeDraw();
                }
            }
            else {
                cb(false);
            }

            function makeWin(){
                if(myTeam.rating>enemyTeam.rating){
                    ratingChange = myTeam.rating-enemyTeam.rating;
                    if(ratingChange>25) ratingChange=25;
                }
                else if (myTeam.rating<enemyTeam.rating){
                    ratingChange = (enemyTeam.rating-myTeam.rating)*2;
                    if(ratingChange>25) ratingChange=25;
                }
                else {
                    ratingChange = 10;
                }

                myTeam.rating+=ratingChange;

                gainedSouls.red+=4;
                gainedSouls.green+=4;
                gainedSouls.blue+=4;

                myTeam.souls.red+=gainedSouls.red;
                myTeam.souls.green+=gainedSouls.green;
                myTeam.souls.blue+=gainedSouls.blue;

                Team.setById(myTeam._id, {
                    rating: myTeam.rating,
                    wins: myTeam.wins+1,
                    souls: myTeam.souls
                }, function(err, team){
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }
                    cb(true, 'win', myTeam.rating, ratingChange, gainedSouls);
                });
            }

            function makeLose() {
                if(myTeam.rating>enemyTeam.rating){
                    ratingChange = (myTeam.rating-enemyTeam.rating)*2;
                    if(ratingChange>25) ratingChange=25;
                }
                else if (myTeam.rating<enemyTeam.rating){
                    ratingChange = enemyTeam.rating-myTeam.rating;
                    if(ratingChange>25) ratingChange=25;
                }
                else {
                    ratingChange = 10;
                }

                if(myTeam.rating-ratingChange<1000) {
                    ratingChange=myTeam.rating-1000;
                    myTeam.rating=1000;
                }
                else {
                    myTeam.rating-=ratingChange;
                }

                //Утешительный приз
                gainedSouls.red+=2;
                gainedSouls.green+=2;
                gainedSouls.blue+=2;

                myTeam.souls.red+=gainedSouls.red;
                myTeam.souls.green+=gainedSouls.green;
                myTeam.souls.blue+=gainedSouls.blue;

                Team.setById(myTeam._id, {
                    rating: myTeam.rating,
                    wins: myTeam.loses+1,
                    souls: myTeam.souls
                }, function(err, team){
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }
                    //Устанавливаем флаг проигрыша для персонажей
                    async.each(myTeam.characters, function(char, callback) {
                        Character.setById(char._id, {lose: true}, function(err, char){
                            if (err) {
                                socket.emit("customError", err);
                                return;
                            }
                            callback(null);
                        });
                    }, function(err){
                        if (err) {
                            socket.emit("customError", err);
                            return;
                        }
                        cb(true, 'lose', myTeam.rating, ratingChange, gainedSouls);
                    });
                });
            }

            function makeDraw() {
                gainedSouls.red+=1;
                gainedSouls.green+=1;
                gainedSouls.blue+=1;

                myTeam.souls.red+=gainedSouls.red;
                myTeam.souls.green+=gainedSouls.green;
                myTeam.souls.blue+=gainedSouls.blue;

                Team.setById(myTeam._id, {
                    souls: myTeam.souls
                }, function(err, team){
                    if (err) {
                        socket.emit("customError", err);
                        return;
                    }
                    cb(true, 'draw', myTeam.rating, 0, gainedSouls);
                });
            }
        });

        socket.on('moveCharTo', function(tile, myTeamId, enemyTeamId, preparedAbility, cb){
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.getActiveChar(battleData.queue[0], myTeam.characters, enemyTeam.characters);
            if(activeChar.canMove()) {
                if(arenaService.checkTile({x: tile.x, y: tile.y}, activeChar, myTeam.characters, enemyTeam.characters, battleData.wallPositions, false)) {
                    cb(null, true);
                }
                else if(preparedAbility){
                    var clientAbility = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                    var serverAbility = characterService.abilityForServer(clientAbility);
                    if(serverAbility){
                        serverAbility.cast(activeChar, null, myTeam.characters, enemyTeam.characters);
                        clientAbility = characterService.abilityForClient(serverAbility.name, serverAbility.variant);
                        activeChar.position = {x: tile.x, y: tile.y};
                        cb(battleData);
                    }
                }
                else if(Math.abs(activeChar.position.x-tile.x)<2 && Math.abs(activeChar.position.y-tile.y)<2){
                    activeChar.soundBuffer.push('move');
                    activeChar.position = {x: tile.x, y: tile.y};
                    activeChar.spendEnergy(activeChar.moveCost);
                    cb(battleData);
                }
            }
            cleanBuffers(myTeam, enemyTeam);
        });

        function cleanBuffers(myTeam, enemyTeam){
            for(var i=0;i<myTeam.characters.length;i++){
                if (myTeam.characters[i].logBuffer.length>0) {
                    myTeam.characters[i].logBuffer = [];
                }
                if (myTeam.characters[i].soundBuffer.length>0) {
                    myTeam.characters[i].soundBuffer = [];
                }
            }

            for(i=0;i<enemyTeam.characters.length;i++){
                if (enemyTeam.characters[i].logBuffer.length>0) {
                    enemyTeam.characters[i].logBuffer = [];
                }
                if (enemyTeam.characters[i].soundBuffer.length>0) {
                    enemyTeam.characters[i].soundBuffer = [];
                }
            }
        }

        socket.on('enemyTeamLoaded', function(room) {
            socket.broadcast.to(room).emit('enemyTeamLoadedResult');
        });

        socket.on('combatLogUpdate', function(room, message) {
            socket.broadcast.to(room).emit('combatLogUpdateSend', message);
        });

        socket.on('updateActiveTeam', function(room, chars) {
            socket.broadcast.to(room).emit('updateActiveTeamResult', chars);
        });

        socket.on('updateTeams', function(room, chars1, chars2) {
            io.sockets.in(room).emit('updateTeamsResult', chars1, chars2);
        });

    });
};
