(function (module) {
    module.controller("ArenaController", ArenaController);

    //Контроллер выбора пати
    function ArenaController($scope, $rootScope, $location, $timeout, $interval, arenaService, hotkeys, mainSocket, gettextCatalog, soundService, chatService, currentTeam, characterService) {
        $scope.map = arenaService.fillMap(arenaService.battle.groundType, arenaService.battle.wallPositions); //Карта - двумерный массив на стороне клиента
        $scope.CombatLog = []; //Массив сообщений с информацией
        $scope.myTurn = false; //переменная, показывающая, мой ли сейчас игрок ходит
        $scope.battleEnd={ended: false};
        $scope.opponentWaiting=true; //Ждём загрузки контроллера оппонента
        $scope.enemyTeamLoaded=false; //Ждём загрузки команды оппонента

        //Возвращает процентные показатели ресурсов при наведении мышки
        $scope.calculateInPercent = function(cur, max) {
          return Math.ceil(cur/max*100);
        };

        //Функция формирует подсказку для эффекта
        $scope.getEffectTooltip = function(effect) {
            if(!effect) return;
            var tooltip = "";
            tooltip+="<p class='name'>"+effect.localName()+" "+effect.variant+"</p>";
            tooltip+="<p class='desc'>"+effect.desc()+"</p>";
            if(effect.stacked()) tooltip+=gettextCatalog.getString("<p>Stacks: {{one}}/{{two}}</p>",{one: effect.stacks, two: effect.maxStacks()});
            tooltip+="<p></p>";
            if(!effect.infinite()) tooltip+=gettextCatalog.getString("<p>Left: {{one}}</p>",{one: effect.left});
            return tooltip;
        };

        //Функция формирует подсказку для способности
        $scope.getAbilityTooltip = function(ability){
            if(!ability || ability.name==="Void") return;
            var tooltip = "";
            tooltip+="<p class='name'>"+ability.localName()+" "+ability.variant+"</p>";
            tooltip+="<p class='desc'>"+ability.desc()+"</p>";
            if(ability.needWeapon) tooltip+=gettextCatalog.getString("<p class='tooltip-need-weapon'>Need weapon</p>");
            else tooltip+=gettextCatalog.getString("<p class='tooltip-spell'>Spell</p>");
            if(ability.range>0) tooltip+=gettextCatalog.getString("<p>Range: {{one}}</p>",{one: ability.range});
            else tooltip+=gettextCatalog.getString("<p>Range: Self</p>");
            tooltip+=gettextCatalog.getString("<p>Cooldown: {{one}}</p>",{one: ability.cooldown});
            if(ability.duration>0) tooltip+=gettextCatalog.getString("<p>Duration: {{one}}</p>",{one: ability.duration});
            tooltip+=gettextCatalog.getString("<p>Energy Cost: {{one}}</p>",{one: ability.energyCost});
            tooltip+=gettextCatalog.getString("<p>Mana Cost: {{one}}</p>",{one: ability.manaCost});
            return tooltip;
        };

        //Функция возвращает портрет персонажа для background
        $scope.getCharPortrait = function(char) {
            return "url(."+char.portrait+")";
        };

        //Функция выбирает цвет для способности по её роли
        $scope.getAbilityColor = function(ability) {
            if(ability) {
                if(ability.role=="void"){
                    return "#cccccc";
                }
                else {
                    return characterService.getRoleColor(ability.role);
                }
            }
            else {
                return '#000';
            }
        };

        //Функция возвращает значение оставшегося до конца хода времени
        $scope.getTurnTime =  function(){
            if($scope.myTurn){
                if($scope.secondsForTurn<=30){
                    return $scope.secondsForTurn;
                }
                else {
                    return "";
                }
            }
            else {
                return $scope.secondsForTurn;
            }
        };

        //Кнопка покинуть поле боя
        $scope.retreatClick =  function(){
            for(var i=0;i<3;i++){
                $scope.myTeam.characters[i].isDead=true;
            }
            log($scope.myTeam.teamName+" retreats!","#ffffff", true);
            mainSocket.emit("updateTeams", arenaService.battle.room, $scope.myTeam.characters, $scope.enemyTeam.characters);
        };

        $scope.testFunction =  function(){

            var str="";
            for(var i=0;i<$scope.myTeam.characters.length;i++){
                str+="-----------------------------------------------------------------------";
                str+=JSON.stringify($scope.myTeam.characters[i], function(key, value) {
                    if (key == '_id') return undefined;
                    if (key == '_team') return undefined;
                    if (key == '__v') return undefined;
                    if (key == 'portrait') return undefined;
                    if (key == 'gender') return undefined;
                    if (key == 'created') return undefined;
                    if (key == 'logBuffer') return undefined;
                    if (key == 'race') return undefined;
                    if (key == 'role') return undefined;
                    //if (key == 'equip') return undefined;
                    if (key == 'abilities') return undefined;
                    if (key == 'buffs') return undefined;
                    if (key == 'debuffs') return undefined;
                    if (key == 'battleColor') return undefined;
                    if (key == '$$hashKey') return undefined;
                    return value;
                },4);
            }
            for(i=0;i<$scope.enemyTeam.characters.length;i++){
                str+="-----------------------------------------------------------------------";
                str+=JSON.stringify($scope.enemyTeam.characters[i], function(key, value) {
                    if (key == '_id') return undefined;
                    if (key == '_team') return undefined;
                    if (key == '__v') return undefined;
                    if (key == 'portrait') return undefined;
                    if (key == 'gender') return undefined;
                    if (key == 'created') return undefined;
                    if (key == 'logBuffer') return undefined;
                    if (key == 'race') return undefined;
                    if (key == 'role') return undefined;
                    //if (key == 'equip') return undefined;
                    if (key == 'abilities') return undefined;
                    if (key == 'buffs') return undefined;
                    if (key == 'debuffs') return undefined;
                    if (key == 'battleColor') return undefined;
                    if (key == '$$hashKey') return undefined;
                    return value;
                },4);
            }
            console.log(str);

        };

        //Функция устанавливает клетку карты под курсором конечной точкой для стрелки
        $scope.setTileForArrow = function(tile) {
            if(tile.move) {
                $scope.tileForArrow=tile;
                $scope.arrowColor = "#009900";
            }
            else $scope.tileForArrow = undefined;
        };

        //Функция устанавливает клетку карты под курсором конечной точкой для стрелки
        $scope.setCharForArrow = function(char) {
            if(!char) {
                $scope.charForArrow = undefined;
                return;
            }
            if(char.underAbility) {
                $scope.charForArrow=char;
                if(char._team==$scope.myTeam._id){
                    $scope.arrowColor = "#00b3ee";
                }
                else {
                    $scope.arrowColor = "#ff0906"
                }
            }
            else $scope.charForArrow = undefined;
        };

        //Функция удаляет клетку карты под курсором конечной точкой для стрелки
        $scope.resetArrow = function() {
            $scope.tileForArrow = undefined;
            $scope.charForArrow = undefined;
        };

        //Функция перемещает персонажа на указанную клетку
        $scope.moveToTile = function(tile) {
            if(tile.move){
                if($scope.activeChar.checkTile({x: tile.x, y: tile.y}, $scope.myTeam.characters, $scope.enemyTeam.characters, false)){
                    log("Someone invisible stands on that cell!", $scope.activeChar.battleColor,false);
                    return;
                }
                //Если это была абилка для передвижения
                if($scope.preparedAbility && $scope.preparedAbility.targetType()==="move") {
                    $scope.preparedAbility.cast($scope.activeChar, $scope.activeChar, $scope.myTeam.characters, $scope.enemyTeam.characters);
                    $scope.preparedAbility = undefined;
                    resetCharOverlays();
                    $scope.activeChar.position = {x: tile.x, y: tile.y};
                    mainSocket.emit("updateActiveTeam", arenaService.battle.room, $scope.myTeam.characters);
                    cleanSoundBuffers(); //Звуки были отправлены, так что можно очищать буфер
                    showLogs();
                    mapUpdate();
                }
                else {
                    $scope.preparedAbility = undefined; //Если способность подготавливается, выключаем её
                    resetCharOverlays(); //сбрасываем оверлеи
                    $scope.activeChar.position = {x: tile.x, y: tile.y};
                    $scope.activeChar.playSound("move");
                    $scope.activeChar.spendEnergy($scope.activeChar.moveCost);
                    mainSocket.emit("updateActiveTeam", arenaService.battle.room, $scope.myTeam.characters);
                    cleanSoundBuffers(); //Звуки были отправлены, так что можно очищать буфер
                    showLogs();
                    mapUpdate();
                }
            }
        };

        //Функция подготавливает способность к использованию
        $scope.prepareAbility = function(index) {
            if ($scope.myTurn) {
                resetCharOverlays(); //Сбрасываем все оверлэи персов
                //смотрим, есть ли способность на подготовке
                if($scope.preparedAbility){
                    //если есть и это таже самая, что и нажали
                    if($scope.activeChar.abilities[index].name==$scope.preparedAbility.name){
                        $scope.preparedAbility = undefined; //Если способность уже подготавливается, выключаем её
                        mapUpdate();
                        return false;
                    }
                    //Сбросим передвижение, если была выбрана абилка Speed Of Light
                    if($scope.preparedAbility.name == "Speed Of Light") {
                        mapUpdate();
                    }
                }
                //активируем новую после проверки
                if($scope.checkAbilityForUse($scope.activeChar.abilities[index],$scope.activeChar)) {
                    $scope.preparedAbility = $scope.activeChar.abilities[index];
                    if ($scope.preparedAbility.targetType() == "self") {
                        $scope.preparedAbility.cast($scope.activeChar, $scope.activeChar, $scope.myTeam.characters, $scope.enemyTeam.characters);
                        resetCharOverlays();
                        mapUpdate();
                        $scope.preparedAbility = undefined;
                        mainSocket.emit("updateTeams", arenaService.battle.room, $scope.myTeam.characters, $scope.enemyTeam.characters);
                        $scope.waitServ = true;
                    }
                    else if ($scope.preparedAbility.targetType() == "enemy") {
                        //находим противников в зоне поражения
                        var enemies = $scope.activeChar.findEnemies($scope.enemyTeam.characters, $scope.preparedAbility.range());
                        for (var i = 0; i < enemies.length; i++) {
                            for (var j = 0; j < $scope.enemyTeam.characters.length; j++) {
                                if($scope.preparedAbility.name == "My Last Words") {
                                    if ($scope.enemyTeam.characters[j]._id == enemies[i]._id && (enemies[i].curHealth/enemies[i].maxHealth)<=0.5) {
                                        $scope.enemyTeam.characters[j].underAbility = true;
                                    }
                                }
                                else {
                                    if ($scope.enemyTeam.characters[j]._id == enemies[i]._id) {
                                        $scope.enemyTeam.characters[j].underAbility = true;
                                    }
                                }
                            }
                        }
                    }
                    else if ($scope.preparedAbility.targetType() == "ally") {
                        //находим союзников в зоне поражения
                        var allies = $scope.activeChar.findAllies($scope.myTeam.characters, $scope.preparedAbility.range());
                        for (i = 0; i < allies.length; i++) {
                            for (j = 0; j < $scope.myTeam.characters.length; j++) {
                                if ($scope.myTeam.characters[j]._id == allies[i]._id) {
                                    $scope.myTeam.characters[j].underAbility = true;
                                }
                            }
                        }
                    }
                    else if ($scope.preparedAbility.targetType() == "allyNotMe") {
                        //находим союзников в зоне поражения
                        allies = $scope.activeChar.findAllies($scope.myTeam.characters, $scope.preparedAbility.range());
                        for (i = 0; i < allies.length; i++) {
                            for (j = 0; j < $scope.myTeam.characters.length; j++) {
                                if ($scope.myTeam.characters[j]._id == allies[i]._id && $scope.activeChar._id != allies[i]._id) {
                                    $scope.myTeam.characters[j].underAbility = true;
                                }
                            }
                        }
                    }
                    else if ($scope.preparedAbility.targetType() == "ally&enemy") {
                        //находим противников в зоне поражения
                        enemies = $scope.activeChar.findEnemies($scope.enemyTeam.characters, $scope.preparedAbility.range());
                        for (i = 0; i < enemies.length; i++) {
                            for (j = 0; j < $scope.enemyTeam.characters.length; j++) {
                                if ($scope.enemyTeam.characters[j]._id == enemies[i]._id) {
                                    $scope.enemyTeam.characters[j].underAbility = true;
                                }
                            }
                        }

                        //находим союзников в зоне поражения
                        allies = $scope.activeChar.findAllies($scope.myTeam.characters, $scope.preparedAbility.range());
                        for (i = 0; i < allies.length; i++) {
                            for (j = 0; j < $scope.myTeam.characters.length; j++) {
                                if ($scope.myTeam.characters[j]._id == allies[i]._id) {
                                    $scope.myTeam.characters[j].underAbility = true;
                                }
                            }
                        }
                    }
                    else if ($scope.preparedAbility.targetType() == "move") {
                        if(!$scope.activeChar.immobilized) {
                            //Находим точки для движения
                            var movePoints = $scope.activeChar.findMoves($scope.myTeam.characters, $scope.enemyTeam.characters, $scope.preparedAbility.range());
                            for (i = 0; i < movePoints.length; i++) {
                                $scope.map[arenaService.map2Dto1D(movePoints[i])].move = true;
                            }
                        }
                    }
                }
            }
        };

        //Функция проверяет, можно ли использовать способность
        $scope.checkAbilityForUse = function(ability, char) {
            if ($scope.myTurn) {
                if(char._id == $scope.activeChar._id){ //Абилка доступна только тому, кто сейчас ходит
                    if(ability.name==="Void") return false;
                    if(ability.name==="Dyers Eve" && ($scope.activeChar.curHealth/$scope.activeChar.maxHealth)>0.5) return false;
                    if(ability.targetType==="move" && char.immobilized) return false;
                    if(ability.cd==0){ //если она не на кулдауне
                        if(char.curEnergy-ability.energyCost>0){ //на неё есть энергия
                            if(char.curMana-ability.manaCost>0){ //и мана
                                if(ability.needWeapon){ //Если для абилки нужно оружие
                                    if(!char.disarmed){ //и персонаж не в дизарме
                                        return true;
                                    }
                                }
                                else { //Если это магия
                                    if(!char.silenced){ //и персонаж не в молчанке
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false;
        };

        //Функция проверяет, какая способность в данный момент приготовлена
        $scope.checkPreparedAbility = function(ability, char){
            if($scope.preparedAbility) {
                if(ability.name == $scope.preparedAbility.name && char._id == $scope.activeChar._id) return true;
            }
            return false;
        };

        //использование способности на игроках
        $scope.castAbility = function(char){
            if($scope.myTurn && $scope.preparedAbility && char.underAbility) {
                $scope.preparedAbility.cast($scope.activeChar, char, $scope.myTeam.characters, $scope.enemyTeam.characters);
                $scope.preparedAbility = undefined;
                $scope.setCharForArrow(undefined);
                resetCharOverlays();
                mapUpdate();
                mainSocket.emit("updateTeams", arenaService.battle.room, $scope.myTeam.characters, $scope.enemyTeam.characters);
                $scope.waitServ = true;
            }
            return false;
        };

        //Функция возвращает игрока в город после результатов боя
        $scope.backToCity = function(){
            $location.path('/city');
        };

        //Функция подготавливает всё необходимое для начала хода
        function turnPrepare (){
            $scope.queue = arenaService.battle.queue;
            $scope.myTurn = arenaService.checkTurn($scope.myTeam.characters, $scope.queue[0]); //проверка, мой ли сейчас ход
            $scope.activeChar = $scope.queue[0]; //назначаем активного персонажа

            cleanSoundBuffers(); //Звуки были отправлены, так что можно очищать буфер
            showLogs(); //выводим сообщения персонажей
            mapUpdate(); //обновляем карту
        }

        //Функция очищает карту и находит точки для передвижения
        function mapUpdate () {
            $timeout(function(){
                //сбрасываем окраску overlay для карты
                for(var j=0;j<$scope.map.length;j++){
                    $scope.map[j].move=false;
                }

                if($scope.myTurn) {
                    mainSocket.emit('findMovePoints', $scope.myTeam._id, $scope.enemyTeam._id, function(movePoints){
                        for (var i = 0; i < movePoints.length; i++) {
                            $scope.map[arenaService.map2Dto1D(movePoints[i])].move = true;
                        }
                    });
                }
            },10);
        }

        //таймер хода для игрока
        function startTurnTimer() {
            var now, before = new Date();
            $scope.secondsForTurn = 90;
            stopTurnTimer();
            //Здесь костыль, для того, чтобы в неактивной вкладке браузера время не отставало
            $scope.turnTime=$interval(function(){
                now = new Date();
                var elapsedTime = (now.getTime() - before.getTime());
                if(elapsedTime > 1000)
                //Recover the motion lost while inactive.
                    $scope.secondsForTurn -= Math.floor(elapsedTime/1000);
                else
                    $scope.secondsForTurn--;
                before = new Date();

                if($scope.secondsForTurn<=0){
                    stopTurnTimer();
                    //Если сейчас мой ход, то завершаем его
                    if($scope.myTurn) {
                        $scope.endTurn();
                    }
                }
            },1000);
        }

        //Остановка таймера
        function stopTurnTimer(){
            if (angular.isDefined($scope.turnTime)) {
                $interval.cancel($scope.turnTime);
                $scope.turnTime = undefined;
            }
        }

        //Функция вывода сообщений
        function log (text, color, send) {
            var message = {
                text: text,
                color: color
            };

            //если указан параметр send, то сообщение посылается и противнику
            if(send) mainSocket.emit("combatLogUpdate", arenaService.battle.room, message); //отправляем сообщение другому игроку

            //Функция возврщает время в формате hh:mm
            function currentTime() {
                var date = new Date();
                var h = date.getHours();
                var m = date.getMinutes();
                if (h < 10) h = '0' + h;
                if (m < 10) m = '0' + m;
                return h+":"+m;
            }

            message.time=currentTime(); //Определяем время прихода сообщения

            //Очищаем первый элемент лога, если он переполнен
            if($scope.CombatLog.length==50){
                $scope.CombatLog.splice(0,1);
            }

            message.text=arenaService.localizeMessage(message.text);

            //обновляем лог на клиенте
            $scope.CombatLog[$scope.CombatLog.length] = message;
        }

        //Функция сбрасыват всю подсветку для персонажей
        function resetCharOverlays() {
            for(var i=0;i<$scope.queue.length;i++){
                $scope.queue[i].underAbility = false;
            }
        }

        //Функция выводит все сообщения из буферов персонажей
        function showLogs(){
            for(var i=0;i<$scope.myTeam.characters.length;i++){
                if ($scope.myTeam.characters[i].logBuffer.length>0) {
                    for (var j = 0; j < $scope.myTeam.characters[i].logBuffer.length; j++) {
                        log($scope.myTeam.characters[i].logBuffer[j], $scope.myTeam.characters[i].battleColor);
                    }
                    $scope.myTeam.characters[i].logBuffer = [];
                }
            }

            for(i=0;i<$scope.enemyTeam.characters.length;i++){
                if ($scope.enemyTeam.characters[i].logBuffer.length>0) {
                    for (j = 0; j < $scope.enemyTeam.characters[i].logBuffer.length; j++) {
                        log($scope.enemyTeam.characters[i].logBuffer[j], $scope.enemyTeam.characters[i].battleColor);
                    }
                    $scope.enemyTeam.characters[i].logBuffer = [];
                }
            }
        }

        //Функция проигрывает звуки, пришедшие от противника
        function playSounds(){
            for(var i=0;i<$scope.enemyTeam.characters.length;i++){
                if ($scope.enemyTeam.characters[i].soundBuffer.length>0) {
                    for (var j = 0; j < $scope.enemyTeam.characters[i].soundBuffer.length; j++) {
                        soundService.playSound($scope.enemyTeam.characters[i].soundBuffer[j]);
                    }
                    $scope.enemyTeam.characters[i].soundBuffer = [];
                }
            }
        }

        //Функция удаляет звуки из буфера после отправления на сервер
        function cleanSoundBuffers(){
            for(var i=0;i<$scope.myTeam.characters.length;i++){
                $scope.myTeam.characters[i].soundBuffer = [];
            }
        }

        //После загрузки контроллера проверяем, загрузился ли контроллер у противника
        $scope.$on('$routeChangeSuccess', function () {
            //Музыка
            if(soundService.getMusicObj().cityMusic){
                soundService.getMusicObj().cityMusic.pause();
            }
            if(!soundService.getMusicObj().battleMusic || soundService.getMusicObj().battleMusic.paused){
                soundService.chooseAmbient(arenaService.battle.groundType);
                soundService.initMusic('battle');
            }

            soundService.loadSounds(); //Загружаем все необходимые для боя звуки

            chatService.clearMessages('arena');
            $scope.opponentWaiting=true;

            var timerCount = 0;
            $scope.waitOpponentTimer=$interval(function(){
                mainSocket.emit("checkOpponent", arenaService.battle.room);
                timerCount++;
                //60 секунд ожидания другого игрока, потом покидаем битву
                if(timerCount==60){
                    $location.path('/city');
                    $rootScope.showInfoMessage(gettextCatalog.getString("Your enemy not ready to battle"));
                }
            },1000);
        });

        $scope.$watch(function(){
            if(soundService.getMusicObj().battleMusic) {
                return soundService.getMusicObj().battleMusic.progress
            }
        }, function(newVal){
            if(newVal>=1){
                soundService.getMusicObj().battleMusic.pause();
                soundService.nextTrack('battle');
            }
        });

        //Если противник готов, начинаем первый ход
        mainSocket.on("opponentReady", function() {
            $interval.cancel($scope.waitOpponentTimer);
            $scope.waitServ = true;
            startTurnTimer(); //Сразу включаем таймер, чтобы рассинхрон был небольшой
            if(!$scope.opponentWaiting) { //Таймер срабатывает лишний раз, так что обрываем, если бой уже начался
                $scope.waitServ = false;
                return;
            }

            $scope.myTeam = arenaService.prepareMyTeam(arenaService.battle["team_"+currentTeam.get()._id]);
            for(var key in arenaService.battle) {
                if(arenaService.battle.hasOwnProperty(key) && key.indexOf("team_")>-1 && key!="team_"+currentTeam.get()._id){
                    $scope.enemyTeam = arenaService.prepareEnemyTeam(arenaService.battle[key]);
                    break;
                }
            }

            //ИЗМЕНЁННАЯ ВЕРСИЯ turnPrepare для первого хода
            $scope.queue = arenaService.battle.queue;
            $scope.myTurn = arenaService.checkTurn($scope.myTeam.characters, $scope.queue[0]); //проверка, мой ли сейчас ход
            $scope.activeChar = $scope.queue[0]; //назначаем активного персонажа

            showLogs(); //выводим сообщения персонажей
            mapUpdate(); //обновляем карту

            //объявление о начале боя
            log("Battle begins! First move for "+$scope.activeChar.charName+".", $scope.activeChar.battleColor);
            $scope.opponentWaiting = false;
            $scope.waitServ = false;
            mainSocket.emit("enemyTeamLoaded", arenaService.battle.room);
        });

        //Завершение хода
        $scope.endTurn =  function() {
            $scope.preparedAbility = undefined;
            resetCharOverlays();
            $scope.waitServ = true;
            mainSocket.emit("turnEnded", $scope.myTeam._id, $scope.enemyTeam._id);
        };

        mainSocket.on('turnEndedResult', function(battle){
            startTurnTimer(); //Сразу включаем таймер, чтобы рассинхрон был небольшой
            $scope.waitServ = false;
            arenaService.battle = battle;

            $scope.myTeam = arenaService.prepareMyTeam(arenaService.battle["team_"+currentTeam.get()._id]);
            for(var key in arenaService.battle) {
                if(arenaService.battle.hasOwnProperty(key) && key.indexOf("team_")>-1 && key!="team_"+currentTeam.get()._id){
                    $scope.enemyTeam = arenaService.prepareEnemyTeam(arenaService.battle[key]);
                    break;
                }
            }

            mainSocket.emit('checkForWin', $scope.myTeam._id, $scope.enemyTeam._id, false, function(isEnded, result, rating, ratingChange, gainedSouls){
                if(isEnded){
                    $scope.battleEnd= {
                        ended: true,
                        rating: rating,
                        souls: gainedSouls
                    };

                    stopTurnTimer();

                    if(result == "win"){
                        soundService.getMusicObj().winMusic.play();
                        $scope.battleEnd.title = gettextCatalog.getString("You win");
                        $scope.battleEnd.ratingChange = "+"+ratingChange;
                    }
                    else if(result == "lose"){
                        soundService.getMusicObj().loseMusic.play();
                        $scope.battleEnd.title = gettextCatalog.getString("You lose");
                        $scope.battleEnd.ratingChange = "-"+ratingChange;
                    }
                    else {
                        soundService.getMusicObj().winMusic.play();
                        $scope.battleEnd.title = gettextCatalog.getString("Draw");
                        $scope.battleEnd.ratingChange = ratingChange;
                    }
                }
                else {
                    turnPrepare();

                    //Если персонаж в стане
                    if($scope.activeChar.stunned) {
                        log($scope.activeChar.charName+" is stunned and skip turn", $scope.activeChar.battleColor);
                    }
                    if($scope.activeChar.stunned && $scope.myTurn) {
                        $scope.endTurn();
                        return;
                    }

                    //объявление о начале хода
                    log("Now is turn of "+$scope.activeChar.charName+".", $scope.activeChar.battleColor); //<- Цвет
                    //объявление об исходе боя в ничью
                    if($scope.turnsSpended>=90){
                        log("The battle ends after "+(100-$scope.turnsSpended)+" turns.");
                    }
                }
            });
        });

        mainSocket.on('enemyTeamLoadedResult', function(){
            $scope.enemyTeamLoaded=true;
        });

        //Ответ серверу произойдёт только когда этот контроллер загружен
        mainSocket.on("areYouReadyToBattle", function() {
            mainSocket.emit("areYouReadyToBattleResponse", arenaService.battle.room);
        });

        mainSocket.on('enemyLeave', function(){
            if($scope.enemyTeamLoaded){
                checkForWin(true);
                $interval.cancel($scope.waitOpponentTimer);
                $rootScope.showInfoMessage(gettextCatalog.getString("Your enemy was disconnected"));
            }
            else {
                $location.path("/city");
                $interval.cancel($scope.waitOpponentTimer);
                $rootScope.showInfoMessage(gettextCatalog.getString("Your enemy was disconnected"));
            }
        });

        mainSocket.on('combatLogUpdateSend', function(message){
            log(message.text, arenaService.colorSwap(message.color)); //выводим полученное от противника сообщение
        });

        mainSocket.on('updateActiveTeamResult', function(chars){
            $scope.waitServ = false;

            //Обновим методы
            for(var i=0;i<chars.length;i++){
                chars[i] = new character(chars[i]);
                chars[i].calcChar();
            }

            $scope.enemyTeam.characters = arenaService.convertEnemyTeam(chars);
            $scope.queue = arenaService.calcQueue($scope.myTeam.characters, $scope.enemyTeam.characters, $scope.activeChar); //вычисляем очередь хода
            $scope.myTurn = arenaService.checkTurn($scope.myTeam.characters, $scope.queue[0]); //проверка, мой ли сейчас ход
            $scope.activeChar = $scope.queue[0]; //назначаем активного персонажа

            showLogs(); //выводим сообщения персонажей
            playSounds(); //Проигрываем звуки
            checkForWin();
        });

        mainSocket.on('updateTeamsResult', function(chars1, chars2){
            $scope.waitServ = false;

            if($scope.myTeam._id==chars1[0]._team){
                for(var i=0;i<chars1.length;i++) {
                    $scope.myTeam.characters[i] = new character(chars1[i]);
                    $scope.myTeam.characters[i].calcChar();
                    $scope.enemyTeam.characters[i] = new character(chars2[i]);
                    $scope.enemyTeam.characters[i].calcChar();
                }
            }
            else {
                for(var j=0;j<chars2.length;j++) {
                    $scope.myTeam.characters[j] = arenaService.convertEnemyChar(new character(chars2[j]));
                    $scope.myTeam.characters[j].calcChar();
                    $scope.enemyTeam.characters[j] = arenaService.convertEnemyChar(new character(chars1[j]));
                    $scope.enemyTeam.characters[j].calcChar();
                }
            }
            cleanSoundBuffers(); //Звуки были отправлены, так что можно очищать буфер
            $scope.queue = arenaService.calcQueue($scope.myTeam.characters, $scope.enemyTeam.characters, $scope.activeChar); //вычисляем очередь хода
            $scope.activeChar = $scope.queue[0]; //назначаем активного персонажа
            showLogs(); //выводим сообщения персонажей
            playSounds(); //Проигрываем звуки
            checkForWin();

            //Если вдруг после своего действия персонаж оказался в стане, ход сразу же завершается
            if($scope.activeChar.stunned && $scope.myTurn) {
                $scope.endTurn();
            }
        });

        //Назначения горячих клавиш
        hotkeys.bindTo($scope)
            .add({
                combo: '1',
                description: 'ability[0]',
                callback: function() {
                    $scope.prepareAbility(0);
                }
            }).add({
                combo: '2',
                description: 'ability[1]',
                callback: function() {
                    $scope.prepareAbility(1);
                }
            }).add({
                combo: '3',
                description: 'ability[2]',
                callback: function() {
                    $scope.prepareAbility(2);
                }
            }).add({
                combo: '4',
                description: 'ability[3]',
                callback: function() {
                    $scope.prepareAbility(3);
                }
            }).add({
                combo: '5',
                description: 'ability[4]',
                callback: function() {
                    $scope.prepareAbility(4);
                }
            }).add({
                combo: '6',
                description: 'ability[5]',
                callback: function() {
                    $scope.prepareAbility(5);
                }
            }).add({
                combo: '7',
                description: 'ability[6]',
                callback: function() {
                    $scope.prepareAbility(6);
                }
            })
    }

        //Директива авто-прокрутки комбат-лога
        module.directive('autoscroll', function () {
            return {
                link: function postLink(scope, element, attrs) {
                    scope.$watch(
                        function () {
                            return element.children().length;
                        },scroll
                    );

                    scope.$watch(
                        function () {
                            return element.is(":visible")
                        },scroll
                    );

                    function scroll() {
                        element.animate({ scrollTop: element.prop('scrollHeight')}, 0);
                    }
                }
            };
        });

        //Директива, отвечающая за рисование стрелок
        module.directive("arrows", function(){
            return {
                restrict: "A",
                link: function(scope, element, attrs){
                    var ctx = element[0].getContext('2d');
                    var start;
                    var end;
                    var color;

                    //следим за изменением цвета
                    scope.$watch(attrs.arrowColor, function(newValue) {
                        if(newValue) {
                            color = newValue;
                        }
                    });

                    //следим за изменением начальной точки
                    scope.$watch(attrs.start, function(newValue) {
                        ctx.clearRect(0, 0, element[0].width, element[0].height);
                        if(newValue) {
                            start = {x: newValue.x * 32+16, y: newValue.y * 32+16};
                        }
                    });

                    //следим за изменением конечной точки
                    scope.$watch(attrs.endTile, function(newValue) {
                        ctx.clearRect(0, 0, element[0].width, element[0].height);
                        if(newValue) {
                            end = {x: newValue.x*32+16, y: newValue.y*32+16};
                            if(start) {
                                canvas_arrow(ctx, start.x, start.y, end.x, end.y, color);
                            }
                        }
                    });

                    //следим за изменением конечной точки
                    scope.$watch(attrs.endChar, function(newValue) {
                        ctx.clearRect(0, 0, element[0].width, element[0].height);
                        if(newValue) {
                            end = {x: newValue.x*32+16, y: newValue.y*32+16};
                            if(start) {
                                if(!(start.x===end.x && start.y===end.y)){
                                    canvas_arrow(ctx, start.x, start.y, end.x, end.y, color);
                                }
                            }
                        }
                    });

                    function canvas_arrow(ctx, fromx, fromy, tox, toy, color){
                        var headlen = 10; //высота головы стрелки

                        var angle = Math.atan2(toy-fromy,tox-fromx);

                        //Рисуем базовую линию
                        ctx.beginPath();
                        ctx.moveTo(fromx, fromy);
                        ctx.lineTo(tox, toy);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 3;
                        ctx.stroke();

                        //Рисуем одно ухо стрелки
                        ctx.beginPath();
                        ctx.moveTo(tox, toy);
                        ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

                        //переходим на противоположную сторону к концу другого уха стрелки
                        ctx.moveTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

                        //проводим линию к вершине стрелки
                        ctx.lineTo(tox, toy);
                        ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

                        ctx.strokeStyle = color;
                        ctx.lineWidth = 3;
                        ctx.stroke();
                    }
                }
            };
        });

        //Директива, отвечающая за рисование стрелок
        module.directive("battleText", function($interval, $timeout){
            return {
                restrict: "C",
                scope: {
                    buffer: '='
                },
                link: function(scope, element, attrs){
                    var childCount=1; //Счётчик вылетевших сообщений
                    var createdElementsCount=0; //Количество созданных элементов
                    //следим за изменением буфера
                    scope.$watchCollection('buffer', function(newValue, oldValue) {
                        var buf = [];
                        var createdElements = [];
                        if(newValue.length===0){
                            childCount=1;
                            var childs=element.find('.battle-text-cont');
                            if(childs.length>createdElementsCount){
                                childs.remove();
                            }
                        }
                        if(newValue.length>oldValue.length && newValue.length>0) {
                            buf = newValue.slice();
                            //Если старый массив ещё не очищен
                            if(oldValue.length>0){
                                for(var i=0;i<oldValue.length;i++){
                                    for(var j=0;j<newValue.length;j++){
                                        if(oldValue[i].caster===newValue[j].caster &&
                                            oldValue[i].text===newValue[j].text &&
                                            oldValue[i].icon===newValue[j].icon){
                                            buf.splice(j,1);
                                        }
                                    }
                                }
                            }

                            createBattleText();

                            if(buf.length>0){
                                var textInterval = $interval(createBattleText,1000);
                            }
                            else {
                                $timeout(function(){
                                    for(var i=0;i<createdElements.length;i++){
                                        createdElements[i].remove();
                                        if(createdElementsCount>0) createdElementsCount--;
                                    }
                                    scope.buffer=[];
                                },3000);
                            }

                            function createBattleText(){
                                if(buf.length>0){
                                    var isCritical = "";
                                    if(buf[buf.length-1].crit) isCritical="crit";

                                    element.append("<div class='battle-text-cont child_"+childCount+" "+isCritical+"'><div class='battle-text-icon icon' style='background-image: "+buf[buf.length-1].icon+"; background-color: "+buf[buf.length-1].color+"'></div><span style='color: "+getTextTypeColor(buf[buf.length-1].type)+"'>"+buf[buf.length-1].text+"</span></div>");
                                    $timeout(function(){
                                        var childName='.battle-text-cont.child_'+childCount;
                                        createdElements.push(element.find(childName));
                                        createdElementsCount++;
                                        element.find(childName).css('opacity', 0);
                                        var round=4*Math.floor(childCount/4);
                                        if((childCount-round)%4===0) {
                                            element.find(childName).css('top', -32);
                                            element.find(childName).css('left', -32);
                                        }
                                        else if ((childCount-round)%3===0){
                                            element.find(childName).css('top', 32);
                                            element.find(childName).css('left', -32);
                                        }
                                        else if((childCount-round)%2===0) {
                                            element.find(childName).css('top', 32);
                                            element.find(childName).css('left', 32);
                                        }
                                        else {
                                            element.find(childName).css('top', -32);
                                            element.find(childName).css('left', 32);
                                        }

                                        childCount++;
                                    },100);

                                    buf.pop();
                                }
                                else {
                                    $timeout(function(){
                                        scope.buffer=[];
                                        for(var i=0;i<createdElements.length;i++){
                                            createdElements[i].remove();
                                            if(createdElementsCount>0) createdElementsCount--;
                                        }
                                        textShow=false;
                                        $interval.cancel(textInterval);
                                    },3000);
                                }
                            }
                        }
                    });

                    function getTextTypeColor(type) {
                        switch (type) {
                            case "heal":
                                return "#0055AF";
                                break;
                            case "damage":
                                return "#ff0906";
                                break;
                            case "other":
                                return "#000";
                                break;
                        }
                    }

                }
            };
    });

})(angular.module("fotm"));
