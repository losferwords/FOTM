var log = require('lib/log')(module);
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

            log.info("Battle of bots begins");
            socket.emit('startBattle', battleData);
            socket.join(socket.serSt.battleRoom);

            io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData = battleData;
        });

        socket.on('findMovePoints', findMovePoints);

        function findMovePoints(myTeamId, enemyTeamId, preparedAbility, cb){
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var result = [];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            if(!activeChar.immobilized) {
                var range = 0;
                if(preparedAbility){
                    var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                    if(ability){
                        range = ability.range();
                    }
                }
                else if(activeChar.canMove()){
                    range = 1;
                }

                if(range>0)
                {
                    result = arenaService.findMoves(activeChar, myTeam.characters, enemyTeam.characters, battleData.wallPositions, range);
                    cb(result);
                    return result;
                }
            }
            cb(result);
            return result;
        }

        function findMovePointsSimulation(myTeam, enemyTeam, activeChar, preparedAbility, wallPositions){
            var result = [];
            if(!activeChar.immobilized) {
                var range = 0;
                if(preparedAbility){
                    var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                    if(ability){
                        range = ability.range();
                    }
                }
                else if(activeChar.canMove()){
                    range = 1;
                }

                if(range>0)
                {
                    result = arenaService.findMoves(activeChar, myTeam.characters, enemyTeam.characters, wallPositions, range);
                    return result;
                }
            }
            return result;
        }

        socket.on('findEnemies', findEnemies);

        function findEnemies(myTeamId, enemyTeamId, preparedAbility, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            if(preparedAbility){
                var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                var result = arenaService.findEnemies(activeChar, enemyTeam.characters, ability.range(), battleData.wallPositions);
                cb(result);
                return result;
            }
        }

        socket.on('findAllies', findAllies);

        function findAllies(myTeamId, enemyTeamId, preparedAbility, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            if(preparedAbility){
                var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                var result = arenaService.findAllies(activeChar, myTeam.characters, ability.range(), battleData.wallPositions);
                cb(result);
                return result;
            }
        }

        socket.on('findCharacters', findCharacters);

        function findCharacters(myTeamId, enemyTeamId, preparedAbility, cb) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            if(preparedAbility){
                var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                var result = arenaService.findAllies(activeChar, myTeam.characters, ability.range(), battleData.wallPositions).concat(arenaService.findEnemies(activeChar, enemyTeam.characters, ability.range(), battleData.wallPositions));
                cb(result);
                return result;
            }
        }

        socket.on('turnEnded', turnEnded);

        function turnEnded(myTeamId, enemyTeamId) {
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            battleData.turnsSpended++;
            activeChar.initiativePoints = activeChar.initiativePoints*0.2;
            for(var i=0;i<myTeam.characters.length;i++){
                myTeam.characters[i].refreshChar(myTeam.characters, enemyTeam.characters, battleData.wallPositions);
            }//Обновляем своих персонажей
            for(i=0;i<enemyTeam.characters.length;i++){
                enemyTeam.characters[i].refreshChar(enemyTeam.characters, myTeam.characters, battleData.wallPositions);
            }//Обновляем персонажей противника

            battleData.queue = arenaService.calcQueue(myTeam.characters, enemyTeam.characters);
            io.sockets.in(socket.serSt.battleRoom).emit('turnEndedResult', battleData);
            cleanBuffers(myTeam, enemyTeam);
        }

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
                if(battleData.bots){
                    cb(true, 'win', 0, 0, gainedSouls);
                    return;
                }

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
                if(battleData.bots){
                    cb(true, 'lose', 0, 0, gainedSouls);
                    return;
                }
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
                if(battleData.bots){
                    cb(true, 'draw', 0, 0, gainedSouls);
                    return;
                }
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

            if(enemyLeave) {
                socket.leave(socket.serSt.battleRoom);
            }
        });

        socket.on('moveCharTo', moveCharTo);

        function moveCharTo(tile, myTeamId, enemyTeamId, preparedAbility){
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            if(activeChar.canMove()) {
                if(arenaService.checkTile({x: tile.x, y: tile.y}, activeChar, myTeam.characters, enemyTeam.characters, battleData.wallPositions, false)) {
                    socket.emit("moveCharToResult", null, true);
                }
                else if(preparedAbility){
                    var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                    if(ability && arenaService.checkAbilityForUse(ability, activeChar)){
                        ability.cast(activeChar, null, myTeam.characters, enemyTeam.characters, battleData.wallPositions);
                        activeChar.createAbilitiesState();
                        activeChar.position = {x: tile.x, y: tile.y};
                        io.sockets.in(socket.serSt.battleRoom).emit('updateTeams', battleData);
                        socket.emit("moveCharToResult");

                    }
                }
                else if(Math.abs(activeChar.position.x-tile.x)<2 && Math.abs(activeChar.position.y-tile.y)<2){
                    activeChar.soundBuffer.push('move');
                    activeChar.position = {x: tile.x, y: tile.y};
                    activeChar.spendEnergy(activeChar.moveCost);
                    io.sockets.in(socket.serSt.battleRoom).emit('updateTeams', battleData);
                    socket.emit("moveCharToResult");
                }
            }
            cleanBuffers(myTeam, enemyTeam);
        }

        function moveCharSimulation(tile, myTeamOrig, enemyTeamOrig, activeCharOrig, preparedAbility, wallPositions){
            var myTeam = randomService.clone(myTeamOrig);
            var enemyTeam = randomService.clone(enemyTeamOrig);
            var activeChar = randomService.clone(activeCharOrig);
            if(activeChar.canMove()) {
                if(arenaService.checkTile({x: tile.x, y: tile.y}, activeChar, myTeam.characters, enemyTeam.characters, wallPositions, false)) {
                    //invisible char on tile
                }
                else if(preparedAbility){
                    var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                    if(ability && arenaService.checkAbilityForUse(ability, activeChar)){
                        ability.cast(activeChar, null, myTeam.characters, enemyTeam.characters, wallPositions);
                        activeChar.createAbilitiesState();
                        activeChar.position = {x: tile.x, y: tile.y};
                    }
                }
                else if(Math.abs(activeChar.position.x-tile.x)<2 && Math.abs(activeChar.position.y-tile.y)<2){
                    activeChar.position = {x: tile.x, y: tile.y};
                    activeChar.spendEnergy(activeChar.moveCost);
                }
            }
            cleanBuffers(myTeam, enemyTeam);
            return {myTeam: myTeam, enemyTeam: enemyTeam, activeChar: activeChar};
        }

        socket.on('castAbility', castAbility);

        function castAbility(targetId, myTeamId, enemyTeamId, preparedAbility, cb){
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            var enemyTeam = battleData['team_'+enemyTeamId];
            var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);
            var targetChar = arenaService.findCharInQueue(targetId, myTeam.characters, enemyTeam.characters);
            if(preparedAbility){
                var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                if(ability && arenaService.checkAbilityForUse(ability, activeChar)){
                    ability.cast(activeChar, targetChar, myTeam.characters, enemyTeam.characters, battleData.wallPositions);
                    activeChar.createAbilitiesState();
                    arenaService.createEffectsStates(myTeam.characters, enemyTeam.characters);
                    arenaService.calcCharacters(myTeam.characters, enemyTeam.characters);
                    io.sockets.in(socket.serSt.battleRoom).emit('updateTeams', battleData);
                    cb();
                }
            }
            cleanBuffers(myTeam, enemyTeam);
        }

        function castAbilitySimulation(myTeamOrig, enemyTeamOrig, activeCharOrig, targetCharOrig, preparedAbility, wallPositions){
            var myTeam = randomService.clone(myTeamOrig);
            var enemyTeam = randomService.clone(enemyTeamOrig);
            var activeChar = randomService.clone(activeCharOrig);
            var targetChar = randomService.clone(targetCharOrig);
            if(preparedAbility){
                var ability = arenaService.getAbilityForCharByName(activeChar, preparedAbility);
                if(ability && arenaService.checkAbilityForUse(ability, activeChar)){
                    ability.cast(activeChar, targetChar, myTeam.characters, enemyTeam.characters, wallPositions);
                    activeChar.createAbilitiesState();
                    arenaService.createEffectsStates(myTeam.characters, enemyTeam.characters);
                    arenaService.calcCharacters(myTeam.characters, enemyTeam.characters);
                }
            }
            cleanBuffers(myTeam, enemyTeam);
            return {myTeam: myTeam, enemyTeam: enemyTeam, activeChar: activeChar};
        }

        socket.on('teamRetreat', function(myTeamId){
            var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
            var myTeam = battleData['team_'+myTeamId];
            for(var i=0;i<myTeam.characters.length;i++){
                myTeam.characters[i].isDead = true;
            }
            io.sockets.in(socket.serSt.battleRoom).emit('updateTeams', battleData);
        });

        function cleanBuffers(myTeam, enemyTeam){
            for(var i=0;i<myTeam.characters.length;i++){
                if (myTeam.characters[i].logBuffer.length>0) {
                    myTeam.characters[i].logBuffer = [];
                }
                if (myTeam.characters[i].soundBuffer.length>0) {
                    myTeam.characters[i].soundBuffer = [];
                }
                if (myTeam.characters[i].battleTextBuffer.length>0) {
                    myTeam.characters[i].battleTextBuffer = [];
                }
            }

            for(i=0;i<enemyTeam.characters.length;i++){
                if (enemyTeam.characters[i].logBuffer.length>0) {
                    enemyTeam.characters[i].logBuffer = [];
                }
                if (enemyTeam.characters[i].soundBuffer.length>0) {
                    enemyTeam.characters[i].soundBuffer = [];
                }
                if (enemyTeam.characters[i].battleTextBuffer.length>0) {
                    enemyTeam.characters[i].battleTextBuffer = [];
                }
            }
        }

        socket.on('enemyTeamLoaded', function(room) {
            socket.broadcast.to(room).emit('enemyTeamLoadedResult');
        });

        socket.on('combatLogUpdate', function(room, message) {
            socket.broadcast.to(room).emit('combatLogUpdateSend', message);
        });



        function buildActionBranch(myTeamOrig, enemyTeamOrig, activeCharOrig, wallPositions, parentAction){
            var myTeam = randomService.clone(myTeamOrig);
            var enemyTeam = randomService.clone(enemyTeamOrig);
            var activeChar = randomService.clone(activeCharOrig);

            var actionList = [];
            var situation = botService.createSituation(wallPositions, myTeam, enemyTeam, activeChar);
            var movePoints = findMovePointsSimulation(myTeam, enemyTeam, activeChar, false, wallPositions);
            for(var i=0;i<movePoints.length;i++){
                var newSituationObject = moveCharSimulation(movePoints[i], myTeam, enemyTeam, activeChar, false, wallPositions);
                actionList.push({
                    type: "move",
                    point: movePoints[i],
                    score: parentAction.score + botService.situationCost(botService.createSituation(wallPositions, newSituationObject.myTeam, newSituationObject.enemyTeam, newSituationObject.activeChar)),
                    myTeamState: newSituationObject.myTeam,
                    enemyTeamState: newSituationObject.enemyTeam,
                    activeCharState: newSituationObject.activeChar
                });
            }
            //for(var v=0;v<activeChar.abilities.length;v++){
            //    var checkedAbility = activeChar.abilities[v];
            //    var enemies;
            //    var allies;
            //    var characters;
            //    var targetChar;
            //    var totalScore = 0;
            //    var predictionCount = 10;
            //    if(arenaService.checkAbilityForUse(checkedAbility, activeChar)){
            //        switch(checkedAbility.targetType()){
            //            case "self":
            //                for(var p=0; p<predictionCount; p++){
            //                    totalScore += castAbilitySimulation(myTeam, enemyTeam, activeChar, activeChar, checkedAbility.name, wallPositions);
            //                }
            //                actionList.push({
            //                    type: "cast",
            //                    ability: checkedAbility.name,
            //                    score: totalScore/predictionCount
            //                }); break;
            //            case "enemy":
            //                enemies = findEnemies(myTeam._id, enemyTeam._id, checkedAbility.name, function(){});
            //                for (i = 0; i < enemies.length; i++) {
            //                    for (var j = 0; j < enemyTeam.characters.length; j++) {
            //                        if(!checkedAbility.usageLogic(activeChar, enemyTeam.characters[j], myTeam.characters, enemyTeam.characters, wallPositions)) continue;
            //                        if(enemyTeam.characters[j]._id == enemies[i]._id) {
            //                            targetChar = clone(arenaService.findCharInQueue(enemyTeam.characters[j]._id, myTeam.characters, enemyTeam.characters));
            //                            totalScore = 0;
            //                            for(p=0; p<predictionCount; p++){
            //                                totalScore += castAbilitySimulation(myTeam, enemyTeam, activeChar, targetChar, checkedAbility.name, wallPositions);
            //                            }
            //                            actionList.push({
            //                                type: "cast",
            //                                ability: checkedAbility.name,
            //                                target: enemyTeam.characters[j]._id,
            //                                score: totalScore/predictionCount
            //                            });
            //                        }
            //                    }
            //                }
            //                break;
            //            case "ally":
            //                allies = findAllies(myTeam._id, enemyTeam._id, checkedAbility.name, function(){});
            //                for (i = 0; i < allies.length; i++) {
            //                    for (j = 0; j < myTeam.characters.length; j++) {
            //                        if(!checkedAbility.usageLogic(activeChar, myTeam.characters[j], myTeam.characters, enemyTeam.characters, wallPositions)) continue;
            //                        if (myTeam.characters[j]._id == allies[i]._id) {
            //                            targetChar = randomService.clone(arenaService.findCharInQueue(myTeam.characters[j]._id, myTeam.characters, enemyTeam.characters));
            //                            totalScore = 0;
            //                            for(p=0; p<predictionCount; p++){
            //                                totalScore += castAbilitySimulation(myTeam, enemyTeam, activeChar, targetChar, checkedAbility.name, wallPositions);
            //                            }
            //                            actionList.push({
            //                                type: "cast",
            //                                ability: checkedAbility.name,
            //                                target: myTeam.characters[j]._id,
            //                                score: totalScore/predictionCount
            //                            });
            //                        }
            //                    }
            //                }
            //                break;
            //            case "allyNotMe":
            //                allies = findAllies(myTeam._id, enemyTeam._id, checkedAbility.name, function(){});
            //                for (i = 0; i < allies.length; i++) {
            //                    for (j = 0; j < myTeam.characters.length; j++) {
            //                        if(!checkedAbility.usageLogic(activeChar, myTeam.characters[j], myTeam.characters, enemyTeam.characters, wallPositions)) continue;
            //                        if (myTeam.characters[j]._id == allies[i]._id && activeChar._id != allies[i]._id) {
            //                            targetChar = randomService.clone(arenaService.findCharInQueue(myTeam.characters[j]._id, myTeam.characters, enemyTeam.characters));
            //                            totalScore = 0;
            //                            for(p=0; p<predictionCount; p++){
            //                                totalScore += castAbilitySimulation(myTeam, enemyTeam, activeChar, targetChar, checkedAbility.name, wallPositions);
            //                            }
            //                            actionList.push({
            //                                type: "cast",
            //                                ability: checkedAbility.name,
            //                                target: myTeam.characters[j]._id,
            //                                score: totalScore/predictionCount
            //                            });
            //                        }
            //                    }
            //                }
            //                break;
            //            case "ally&enemy":
            //                characters = findCharacters(myTeam._id, enemyTeam._id, checkedAbility.name, function(){});
            //                for (i = 0; i < characters.length; i++) {
            //                    for (j = 0; j < enemyTeam.characters.length; j++) {
            //                        if(!checkedAbility.usageLogic(activeChar, enemyTeam.characters[j], myTeam.characters, enemyTeam.characters, wallPositions)) continue;
            //                        if (enemyTeam.characters[j]._id == characters[i]._id) {
            //                            targetChar = randomService.clone(arenaService.findCharInQueue(enemyTeam.characters[j]._id, myTeam.characters, enemyTeam.characters));
            //                            totalScore = 0;
            //                            for(p=0; p<predictionCount; p++){
            //                                totalScore += castAbilitySimulation(myTeam, enemyTeam, activeChar, targetChar, checkedAbility.name, wallPositions);
            //                            }
            //                            actionList.push({
            //                                type: "cast",
            //                                ability: checkedAbility.name,
            //                                target: enemyTeam.characters[j]._id,
            //                                score: totalScore/predictionCount
            //                            });
            //                        }
            //                    }
            //                    for (j = 0; j < myTeam.characters.length; j++) {
            //                        if(!checkedAbility.usageLogic(activeChar, myTeam.characters[j], myTeam.characters, enemyTeam.characters, wallPositions)) continue;
            //                        if (myTeam.characters[j]._id == characters[i]._id) {
            //                            targetChar = randomService.clone(arenaService.findCharInQueue(myTeam.characters[j]._id, myTeam.characters, enemyTeam.characters));
            //                            totalScore = 0;
            //                            for(p=0; p<predictionCount; p++){
            //                                totalScore += castAbilitySimulation(myTeam, enemyTeam, activeChar, targetChar, checkedAbility.name, wallPositions);
            //                            }
            //                            actionList.push({
            //                                type: "cast",
            //                                ability: checkedAbility.name,
            //                                target: myTeam.characters[j]._id,
            //                                score: totalScore/predictionCount
            //                            });
            //                        }
            //                    }
            //                }
            //                break;
            //            case "move":
            //                var abilityMovePoints = findMovePoints(myTeam._id, enemyTeam._id, checkedAbility.name, function(){});
            //                for(i=0;i<abilityMovePoints.length;i++){
            //                    totalScore = moveCharSimulation(abilityMovePoints[i], myTeam, enemyTeam, activeChar, checkedAbility.name, wallPositions);
            //                    actionList.push({
            //                        type: "move",
            //                        point: abilityMovePoints[i],
            //                        score: totalScore
            //                    });
            //                }
            //                break;
            //        }
            //    }
            //}

            actionList.push({
                type: "endTurn",
                score: parentAction.score + botService.situationCost(situation)
            });

            for(i=0;i<actionList.length;i++){
                if(actionList[i].type != "endTurn"){
                    actionList[i].branch = buildActionBranch(actionList[i].myTeamState, actionList[i].enemyTeamState, actionList[i].activeCharState, wallPositions, actionList[i]);
                }
            }

            actionList.sort(function (a, b) {
                if (a.score <= b.score) {
                    return 1;
                }
                else if (a.score > b.score) {
                    return -1;
                }
            });

            if(parentAction.score<actionList[0].score) parentAction.score=actionList[0].score;

            return actionList;
        }

        socket.on('botAction', function(myTeamId, enemyTeamId) {
            setTimeout(function(){
                var chooseActionTimeStart = new Date();
                var battleData = io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData;
                var myTeam = battleData['team_'+myTeamId];
                var enemyTeam = battleData['team_'+enemyTeamId];
                var activeChar = arenaService.findCharInQueue(battleData.queue[0]._id, myTeam.characters, enemyTeam.characters);

                var maxScoreAction = {score: 0};
                var actions = buildActionBranch(myTeam, enemyTeam, activeChar, battleData.wallPositions, maxScoreAction);

                actions.sort(function (a, b) {
                    if (a.score <= b.score) {
                        return 1;
                    }
                    else if (a.score > b.score) {
                        return -1;
                    }
                });

                var action = actions[0];

                var chooseActionTimeEnd = new Date();

                console.log("Think time: " + (chooseActionTimeEnd.getTime() - chooseActionTimeStart.getTime()) + "ms");

                switch(action.type){
                    case "move":
                        moveCharTo(action.point, myTeamId, enemyTeamId, action.ability ? action.ability : false);
                        break;
                    case "cast":
                        castAbility(action.target, myTeamId, enemyTeamId, action.ability, function(){});
                        break;
                    case "endTurn":
                        turnEnded(myTeamId, enemyTeamId);
                        break;
                }

            }, 2000);
        });
    });
};
