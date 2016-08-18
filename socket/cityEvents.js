var log = require('lib/log')(module);
var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;
var randomService = require('services/randomService');
var arenaService = require('services/arenaService');

module.exports = function (serverIO) {
    var io = serverIO;
    io.on('connection', function (socket) {

        socket.on('joinArenaLobby', function(){
            socket.join(socket.serSt.arenaLobby);
            log.info("User "+socket.serSt.username+" join arena");
            io.sockets.in(socket.serSt.serverRoom).emit('someoneJoinArena');
            var queue = Object.keys(io.nsps["/"].adapter.rooms[socket.serSt.arenaLobby].sockets);
            io.sockets.in(socket.serSt.serverRoom).emit('arenaQueueChanged', queue.length);
            if(queue.length>1){
                socket.serSt.battleRoom = "battle:"+queue[0]+"_VS_"+queue[1];
                if (io.sockets.connected[queue[0]] && io.sockets.connected[queue[1]]) {
                    var availablePositions = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];

                    var availableWallPos=[];
                    for(var i=0;i<100;i++){
                        if(!(i<=10 || i%10===0 || i%10===9 || i>=90 || i===18 || i===81)){
                            availableWallPos.push(i);
                        }
                    }

                    var battleData = {
                        room: socket.serSt.battleRoom,
                        groundType: Math.floor(Math.random() * 3),
                        wallPositions: randomService.shuffle(availableWallPos).slice(0, 10),
                        turnsSpended: 0 //Количество ходов, потраченное с начала боя
                    };

                    var allyPositions = availablePositions[Math.floor(Math.random() * 6)];
                    var enemyPositions = availablePositions[Math.floor(Math.random() * 6)];

                    for(i=0; i<3;i++) {
                        var allyPosition = arenaService.getStartPosition(allyPositions[i]);
                        io.sockets.connected[queue[0]].team.characters[i].position={x: allyPosition.x, y:allyPosition.y};
                        switch (i) {
                            case 0: io.sockets.connected[queue[0]].team.characters[i].battleColor="#2a9fd6"; break;
                            case 1: io.sockets.connected[queue[0]].team.characters[i].battleColor="#0055AF"; break;
                            case 2: io.sockets.connected[queue[0]].team.characters[i].battleColor="#9933cc"; break;
                        }
                    }

                    for(i=0; i<3;i++) {
                        var enemyPosition = arenaService.getStartPosition(enemyPositions[i]);
                        io.sockets.connected[queue[1]].team.characters[i].position={x: enemyPosition.x, y:enemyPosition.y};
                        switch (i) {
                            case 0: io.sockets.connected[queue[1]].team.characters[i].battleColor="#2a9fd6"; break;
                            case 1: io.sockets.connected[queue[1]].team.characters[i].battleColor="#0055AF"; break;
                            case 2: io.sockets.connected[queue[1]].team.characters[i].battleColor="#9933cc"; break;
                        }
                    }

                    battleData['team_'+io.sockets.connected[queue[0]].team._id] = io.sockets.connected[queue[0]].team;
                    battleData['team_'+io.sockets.connected[queue[1]].team._id] = io.sockets.connected[queue[1]].team;

                    battleData.queue = arenaService.calcQueue(io.sockets.connected[queue[0]].team.characters, io.sockets.connected[queue[1]].team.characters);

                    log.info("User "+io.sockets.connected[queue[0]].handshake.user.username+" start battle with "+io.sockets.connected[queue[1]].handshake.user.username);
                    io.sockets.in(socket.serSt.serverRoom).emit('startBattle', battleData);
                    io.sockets.connected[queue[0]].leave(socket.serSt.arenaLobby);
                    io.sockets.connected[queue[1]].leave(socket.serSt.arenaLobby);
                    io.sockets.in(socket.serSt.serverRoom).emit('arenaQueueChanged', 0);
                    io.sockets.connected[queue[0]].join(socket.serSt.battleRoom);
                    io.sockets.connected[queue[1]].join(socket.serSt.battleRoom);

                    io.nsps["/"].adapter.rooms[socket.serSt.battleRoom].battleData = battleData;
                }
            }
        });

        socket.on('getArenaQueue', function(){
            if(io.nsps["/"].adapter.rooms[socket.serSt.arenaLobby]) {
                var queue = Object.keys(io.nsps["/"].adapter.rooms[socket.serSt.arenaLobby].sockets);
                io.sockets.in(socket.serSt.serverRoom).emit('arenaQueueChanged', queue.length);
            }
        });

        socket.on('leaveArenaLobby', function(){
            log.info("User "+socket.serSt.username+" leave arena");
            io.sockets.in(socket.serSt.serverRoom).emit('arenaQueueChanged', 0);
            socket.leave(socket.serSt.arenaLobby);
        });

        socket.on('sendChatMessage', function (channel, msg) {
            log.info("User "+msg.sender+" wrote: "+msg.text);
            switch(channel) {
                case 'common' : io.sockets.in(socket.serSt.serverRoom).emit('newMessage', msg, channel); break;
                case 'arena' : if(socket.serSt.battleRoom) io.sockets.in(socket.serSt.battleRoom).emit('newMessage', msg, channel); break;
            }
        });

    });
};

