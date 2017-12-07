var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;
var arenaService = require('services/arenaService');
var characterService = require('services/characterService');
var botService = require('services/botService');
var randomService = require('services/randomService');
var characterFactory = require('services/characterFactory');

module.exports = function (serverIO) {
    var io = serverIO;
    io.on('connection', function (socket) {

        socket.on('checkOpponent', function(room) {
            socket.broadcast.to(room).emit('areYouReadyToBattle');
        });

        socket.on('areYouReadyToBattleResponse', function(room) {
            socket.broadcast.to(room).emit('opponentReady');
        });

        socket.on('startBotsBattle', function() {
            socket.serSt.battleRoom = "battle: bots";

            var availablePositions = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

            var availableWallPos=[];
            for(var i=0;i<100;i++){
                if(!(i<=10 || i%10===0 || i%10===9 || i>=90 || i===18 || i===81)){
                    availableWallPos.push(i);
                }
            }

            var battleData = {
                bots: true,
                room: socket.serSt.battleRoom,
                groundType: Math.floor(Math.random() * 3),
                wallPositions: randomService.shuffle(availableWallPos).slice(0, 10),
                turnsSpended: 0 //Количество ходов, потраченное с начала боя
            };

            var allyPositions = availablePositions[Math.floor(Math.random() * 6)];
            var enemyPositions = availablePositions[Math.floor(Math.random() * 6)];

            var team1 = botService.generateBotTeam();
            var team2 = botService.generateBotTeam();

            for(i=0; i<3; i++) {
                var allyPosition = arenaService.getStartPosition(allyPositions[i]);
                team1.characters[i].position={x: allyPosition.x, y:allyPosition.y};
                switch (i) {
                    case 0: team1.characters[i].battleColor="#2a9fd6"; break;
                    case 1: team1.characters[i].battleColor="#0055AF"; break;
                    case 2: team1.characters[i].battleColor="#9933cc"; break;
                }
            }

            for(i=0; i<3; i++) {
                var startPos = arenaService.getStartPosition(enemyPositions[i]);
                var enemyPosition = arenaService.convertEnemyPosition(startPos.x, startPos.y);
                team2.characters[i].position={x: enemyPosition.x, y:enemyPosition.y};
                switch (i) {
                    case 0: team2.characters[i].battleColor="#2a9fd6"; break;
                    case 1: team2.characters[i].battleColor="#0055AF"; break;
                    case 2: team2.characters[i].battleColor="#9933cc"; break;
                }
            }

            team1.lead = true;
            team2.lead = false;

            battleData['team_'+team1._id] = team1;
            battleData['team_'+team2._id] = team2;

            battleData.team1Id = team1._id;
            battleData.team2Id = team2._id;

            battleData.queue = arenaService.calcQueue(team1.characters, team2.characters);

            console.log("Battle of bots begins");
            socket.emit('startBattle', battleData);
            socket.join(socket.serSt.battleRoom);

            io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData = battleData;
        });

        socket.on('findMovePoints', function(myTeamId, enemyTeamId, preparedAbility, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            arenaService.findMovePoints(myTeam, enemyTeam, activeChar, preparedAbility, battleData.wallPositions, cb);
        });

        socket.on('findEnemies', function(myTeamId, enemyTeamId, preparedAbility, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            arenaService.findEnemiesForAbility(myTeam, enemyTeam, activeChar, preparedAbility, battleData.wallPositions, cb);
        });

        socket.on('findAllies', function(myTeamId, enemyTeamId, preparedAbility, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            arenaService.findAlliesForAbility(myTeam, enemyTeam, activeChar, preparedAbility, battleData.wallPositions, cb);
        });

        socket.on('findCharacters', function(myTeamId, enemyTeamId, preparedAbility, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            arenaService.findCharactersForAbility(myTeam, enemyTeam, activeChar, preparedAbility, battleData.wallPositions, cb);
        });

        socket.on('turnEnded', function(myTeamId, enemyTeamId) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            arenaService.turnEnded(myTeam, enemyTeam, activeChar, battleData.wallPositions, function() {
                battleData.turnsSpended++;
                battleData.queue = arenaService.calcQueue(myTeam.characters, enemyTeam.characters);
                io.sockets.in(socket.serSt.battleRoom).emit('turnEndedResult', battleData);
            });
        });

        //Is battle over?
        socket.on('checkForWin', function(myTeamId, enemyTeamId, enemyLeave, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];

            arenaService.checkForWin(myTeam, enemyTeam, battleData, enemyLeave, function(isEnded, result, rating, ratingChange, gainedSouls){
                cb(isEnded, result, rating, ratingChange, gainedSouls);
                if(enemyLeave) {
                    socket.leave(socket.serSt.battleRoom);
                }
            });           
        });

        socket.on('moveCharTo', function(tile, myTeamId, enemyTeamId, preparedAbility){
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            arenaService.moveCharTo(tile, myTeam, enemyTeam, activeChar, preparedAbility, wallPositions, 
            function(){
                socket.emit("moveCharToResult", null, true);                
            },
            function() {
                io.sockets.in(socket.serSt.battleRoom).emit('updateTeams', battleData);
                socket.emit("moveCharToResult");
            })
        });

        socket.on('castAbility', function(targetId, myTeamId, enemyTeamId, preparedAbility, cb){
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_' + myTeamId];
            var enemyTeam = battleData['team_' + enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            var targetChar = arenaService.findCharInQueue(targetId, myTeam.characters, enemyTeam.characters);
            arenaService.castAbility(targetChar, myTeam, enemyTeam, activeChar, preparedAbility, battleData.wallPositions, function(){
                io.sockets.in(socket.serSt.battleRoom).emit('updateTeams', battleData);
                cb();
            })
        });

        socket.on('teamRetreat', function(myTeamId){
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            for(var i=0;i<myTeam.characters.length;i++){
                myTeam.characters[i].isDead = true;
            }
            io.sockets.in(socket.serSt.battleRoom).emit('updateTeams', battleData);
        });

        socket.on('enemyTeamLoaded', function(room) {
            socket.broadcast.to(room).emit('enemyTeamLoadedResult');
        });

        socket.on('combatLogUpdate', function(room, message) {
            socket.broadcast.to(room).emit('combatLogUpdateSend', message);
        });

        socket.on('botAction', function(myTeamId, enemyTeamId) {
            setTimeout(function(){
                var chooseActionTimeStart = new Date();
                var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
                var myTeam = battleData['team_'+myTeamId];
                var enemyTeam = battleData['team_'+enemyTeamId];
                var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);

                botService.buildActionBranchAsync(myTeam, enemyTeam, activeChar._id, battleData.wallPositions, function(actions) {
                    arenaService.cleanBuffers(myTeam, enemyTeam);
                    var action = actions[0];   
                    var chooseActionTimeEnd = new Date();
    
                    botService.buildDubugTree(actions);
    
                    console.log("Think time: " + (chooseActionTimeEnd.getTime() - chooseActionTimeStart.getTime()) + "ms");
    
                    switch(action.type){
                        case "move":
                            arenaService.moveCharTo(action.point, myTeam, enemyTeam, activeChar, action.ability ? action.ability : false, battleData.wallPositions, 
                            function(){
                                socket.emit("moveCharToResult", null, true);
                            },
                            function() {
                                io.sockets.in(socket.serSt.battleRoom).emit('updateTeams', battleData);
                                socket.emit("moveCharToResult");
                            });
                            break;
                        case "cast":
                            var targetChar = arenaService.findCharInQueue(action.targetId, myTeam.characters, enemyTeam.characters);
                            arenaService.castAbility(targetChar, myTeam, enemyTeam, activeChar, action.ability, battleData.wallPositions, 
                            function(){
                                io.sockets.in(socket.serSt.battleRoom).emit('updateTeams', battleData);
                            });
                            break;
                        case "endTurn":
                            arenaService.turnEnded(myTeam, enemyTeam, activeChar, battleData.wallPositions, function() {
                                battleData.turnsSpended++;
                                battleData.queue = arenaService.calcQueue(myTeam.characters, enemyTeam.characters);
                                io.sockets.in(socket.serSt.battleRoom).emit('turnEndedResult', battleData);
                            });
                            break;
                    }
                });                            
            }, 2000);
        });
    });
};
