var log = require('lib/log')(module);
var async = require('async');
var User = require('models/user').User;
var Team = require('models/team').Team;
var Character = require('models/character').Character;
var randomService = require('services/randomService');

module.exports = function (serverIO) {
    var io = serverIO;
    io.on('connection', function (socket) {

        socket.on('joinArenaLobby', function(){
            socket.join(socket.serSt.arenaLobby);
            log.info("User "+socket.serSt.username+" join arena");
            io.sockets.in(socket.serSt.serverRoom).emit('someoneJoinArena');
            var queue = Object.keys(io.nsps["/"].adapter.rooms[socket.serSt.arenaLobby].sockets);
            io.sockets.in(socket.serSt.serverRoom).emit('arenaQueueChanged', queue.length);
            //���� ������� 2 �������� � �������
            if(queue.length>1){
                //��������� ���������� ���� ������� ��� ���
                socket.serSt.battleRoom = "battle:"+queue[0]+"_VS_"+queue[1];
                if (io.sockets.connected[queue[0]] && io.sockets.connected[queue[1]]) {
                    var groundType = Math.floor(Math.random() * 3); //�������� ��� ��������� �����, ����� �� ������ � �������
                    var availablePositions = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]; //��� �������� ����������� ������
                    var allyPositions = availablePositions[Math.floor(Math.random() * 6)];
                    var enemyPositions = availablePositions[Math.floor(Math.random() * 6)];

                    //����������� �� �����
                    var availableWallPos=[];
                    for(var i=0;i<100;i++){
                        if(!(i<=10 || i%10===0 || i%10===9 || i>=90 || i===18 || i===81)){
                            availableWallPos.push(i);
                        }
                    }
                    var shuffledWallPos= randomService.shuffle(availableWallPos);
                    var allyWallPositions = [];
                    var enemyWallPositions = [];
                    for(i=0;i<10;i++) {
                        allyWallPositions.push(shuffledWallPos[i]);
                        //��� ���������� ������ ������� ���������� �����������
                        var reversedIndex=""+Math.floor(shuffledWallPos[i]%10)+Math.floor(shuffledWallPos[i]/10);
                        enemyWallPositions.push(+reversedIndex);
                    }

                    //����������� ������ ��� �����
                    var allyBattleData = {
                        battleRoom: socket.serSt.battleRoom,
                        groundType: groundType,
                        allyPartyPositions: allyPositions,
                        enemyPartyPositions: enemyPositions,
                        wallPositions: allyWallPositions
                    };
                    //��� �������������� ��� ����� �������� �������
                    var enemyBattleData = {
                        battleRoom: socket.serSt.battleRoom,
                        groundType: groundType,
                        allyPartyPositions: enemyPositions,
                        enemyPartyPositions: allyPositions,
                        wallPositions: enemyWallPositions
                    };

                    log.info("User "+io.sockets.connected[queue[0]].handshake.user.username+" start battle with "+io.sockets.connected[queue[1]].handshake.user.username);
                    io.sockets.connected[queue[0]].emit('startBattle', allyBattleData);
                    io.sockets.connected[queue[1]].emit('startBattle', enemyBattleData);
                    io.sockets.connected[queue[0]].leave(socket.serSt.arenaLobby);
                    io.sockets.connected[queue[1]].leave(socket.serSt.arenaLobby);
                    io.sockets.in(socket.serSt.serverRoom).emit('arenaQueueChanged', 0);
                    io.sockets.connected[queue[0]].join(socket.serSt.battleRoom);
                    io.sockets.connected[queue[1]].join(socket.serSt.battleRoom);
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

