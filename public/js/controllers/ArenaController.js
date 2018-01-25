(function (module) {
    module.controller("ArenaController", ArenaController);

    //Контроллер выбора пати
    function ArenaController($scope, $rootScope, $location, $timeout, $interval, arenaService, hotkeys, mainSocket, gettextCatalog, soundService, chatService, currentTeam, characterService) {
        $scope.botBattle = arenaService.battle.bots;
        $scope.trainingBattle = arenaService.battle.training;
        var currentTeamId = arenaService.battle.bots ? arenaService.battle.team1Id : currentTeam.get().id;
        $scope.map = arenaService.fillMap(arenaService.battle.groundType, arenaService.battle.wallPositions, arenaService.battle["team_"+currentTeamId].lead); //Карта - двумерный массив на стороне клиента
        $scope.CombatLog = []; //Массив сообщений с информацией
        $scope.myTurn = false; //переменная, показывающая, мой ли сейчас игрок ходит
        $scope.battleEnd={ended: false};
        $scope.opponentWaiting=true; //Ждём загрузки контроллера оппонента
        $scope.enemyTeamLoaded=false; //Ждём загрузки команды оппонента

        //Возвращает процентные показатели ресурсов при наведении мышки
        $scope.calculateInPercent = function(cur, max) {
          return Math.ceil(cur / max * 100);
        };

        //Функция формирует подсказку для эффекта
        $scope.getEffectTooltip = function(effect) {
            if(!effect) return;
            var tooltip = "";
            tooltip+="<p class='name'>"+effect.localName()+" "+effect.variant+"</p>";
            tooltip+="<p class='desc'>"+effect.desc()+"</p>";
            if(effect.stacked) tooltip+=gettextCatalog.getString("<p>Stacks: {{one}}/{{two}}</p>",{one: effect.stacks, two: effect.maxStacks});
            tooltip+="<p></p>";
            if(!effect.infinite) tooltip+=gettextCatalog.getString("<p>Left: {{one}}</p>",{one: effect.left});
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
            if($scope.myTurn && !$scope.botBattle){
                if($scope.secondsForTurn <= 30){
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
            log($scope.myTeam.teamName+" retreats!","#ffffff", true);
            mainSocket.emit("teamRetreat", $scope.myTeam.id);
        };

        $scope.testFunction =  function(){
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
                if(char._team==$scope.myTeam.id){
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
            var preparedAbilityName;
            if($scope.preparedAbility && $scope.preparedAbility.targetType == "move") {
                preparedAbilityName = $scope.preparedAbility.name;
            }
            else {
                $scope.preparedAbility = undefined;
            }
            if(tile.move){
                //ПЕРЕВОРОТ ДЛЯ НЕ LEAD
                mainSocket.emit("moveCharTo", $scope.myTeam.lead ? {x: tile.x, y: tile.y} : {x: tile.y, y: tile.x}, $scope.myTeam.id, $scope.enemyTeam.id, preparedAbilityName ? preparedAbilityName : null);
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
                    //Сбросим передвижение, если была выбрана абилка передвижения
                    if($scope.preparedAbility.targetType == "move") {
                        mapUpdate();
                    }
                }
                //активируем новую после проверки
                if($scope.checkAbilityForUse($scope.activeChar.abilities[index],$scope.activeChar)) {
                    $scope.preparedAbility = $scope.activeChar.abilities[index];
                    if ($scope.preparedAbility.targetType == "self") {
                        $scope.waitServ = true;
                        mainSocket.emit('castAbility', $scope.activeChar.id, $scope.myTeam.id, $scope.enemyTeam.id, $scope.preparedAbility.name, function(battle) {
                            resetCharOverlays();
                            $scope.preparedAbility = undefined;
                        });
                    }
                    else if ($scope.preparedAbility.targetType == "enemy") {
                        //находим противников в зоне поражения
                        mainSocket.emit('findEnemies', $scope.myTeam.id, $scope.enemyTeam.id, $scope.preparedAbility.name, function(enemies) {
                            for (var i = 0; i < enemies.length; i++) {
                                for (var j = 0; j < $scope.enemyTeam.characters.length; j++) {
                                    if($scope.preparedAbility.name == "My Last Words") {
                                        if ($scope.enemyTeam.characters[j].id == enemies[i].id && (enemies[i].curHealth/enemies[i].maxHealth)<=0.5) {
                                            $scope.enemyTeam.characters[j].underAbility = true;
                                        }
                                    }
                                    else {
                                        if ($scope.enemyTeam.characters[j].id == enemies[i].id) {
                                            $scope.enemyTeam.characters[j].underAbility = true;
                                        }
                                    }
                                }
                            }
                        });
                    }
                    else if ($scope.preparedAbility.targetType == "ally") {
                        //находим союзников в зоне поражения
                        mainSocket.emit('findAllies', $scope.myTeam.id, $scope.enemyTeam.id, $scope.preparedAbility.name, function(allies) {
                            for (var i = 0; i < allies.length; i++) {
                                for (var j = 0; j < $scope.myTeam.characters.length; j++) {
                                    if ($scope.myTeam.characters[j].id == allies[i].id) {
                                        $scope.myTeam.characters[j].underAbility = true;
                                    }
                                }
                            }
                        });
                    }
                    else if ($scope.preparedAbility.targetType == "allyNotMe") {
                        //находим союзников в зоне поражения
                        mainSocket.emit('findAllies', $scope.myTeam.id, $scope.enemyTeam.id, $scope.preparedAbility.name, function(allies) {
                            for (var i = 0; i < allies.length; i++) {
                                for (var j = 0; j < $scope.myTeam.characters.length; j++) {
                                    if ($scope.myTeam.characters[j].id == allies[i].id && $scope.activeChar.id != allies[i].id) {
                                        $scope.myTeam.characters[j].underAbility = true;
                                    }
                                }
                            }
                        });
                    }
                    else if ($scope.preparedAbility.targetType == "ally&enemy") {
                        //находим всех в зоне поражения
                        mainSocket.emit('findCharacters', $scope.myTeam.id, $scope.enemyTeam.id, $scope.preparedAbility.name, function(characters) {
                            for (var i = 0; i < characters.length; i++) {
                                for (var j = 0; j < $scope.enemyTeam.characters.length; j++) {
                                    if ($scope.enemyTeam.characters[j].id == characters[i].id) {
                                        $scope.enemyTeam.characters[j].underAbility = true;
                                    }
                                }
                                for (j = 0; j < $scope.myTeam.characters.length; j++) {
                                    if ($scope.myTeam.characters[j].id == characters[i].id) {
                                        $scope.myTeam.characters[j].underAbility = true;
                                    }
                                }
                            }
                        });
                    }
                    else if ($scope.preparedAbility.targetType == "move") {
                        if(!$scope.activeChar.immobilized) {
                            //Находим точки для движения
                            mainSocket.emit('findMovePoints', $scope.myTeam.id, $scope.enemyTeam.id, $scope.preparedAbility.name, function(movePoints){
                                for (var i = 0; i < movePoints.length; i++) {
                                    $scope.map[arenaService.map2Dto1D(movePoints[i])].move = true;
                                }
                            });
                        }
                    }
                }
            }
        };

        //Функция проверяет, можно ли использовать способность
        $scope.checkAbilityForUse = function(ability, char) {
            if ($scope.myTurn || $scope.botBattle) {
                if(char.id == $scope.activeChar.id){ //Абилка доступна только тому, кто сейчас ходит
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
                if(ability.name == $scope.preparedAbility.name && char.id == $scope.activeChar.id) return true;
            }
            return false;
        };

        //использование способности на игроках
        $scope.castAbility = function(char){
            if($scope.myTurn && $scope.preparedAbility && char.underAbility) {
                $scope.waitServ = true;
                mainSocket.emit('castAbility', char.id, $scope.myTeam.id, $scope.enemyTeam.id, $scope.preparedAbility.name, function(battle) {
                    resetCharOverlays();
                    $scope.preparedAbility = undefined;
                    $scope.setCharForArrow(undefined);
                });
            }
            return false;
        };

        //Функция возвращает игрока в город после результатов боя
        $scope.backToCity = function(){
            $location.path('/city');
        };

        //Функция подготавливает всё необходимое для начала хода
        function turnPrepare (){
            $scope.queue = arenaService.getQueue($scope.myTeam.characters, $scope.enemyTeam.characters);
            $scope.myTurn = arenaService.checkTurn($scope.myTeam.characters, $scope.queue[0]); //проверка, мой ли сейчас ход
            $scope.activeChar = $scope.queue[0]; //назначаем активного персонажа

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

                if($scope.myTurn || $scope.botBattle) {
                    mainSocket.emit('findMovePoints', $scope.myTeam.id, $scope.enemyTeam.id, null, function(movePoints){
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

        //Функция проигрывает звуки, пришедшие от сервера
        function playSounds(){
            for(var i=0;i<$scope.myTeam.characters.length;i++){
                if ($scope.myTeam.characters[i].soundBuffer.length>0) {
                    for (var j = 0; j < $scope.myTeam.characters[i].soundBuffer.length; j++) {
                        soundService.playSound($scope.myTeam.characters[i].soundBuffer[j]);
                    }
                    $scope.myTeam.characters[i].soundBuffer = [];
                }
            }
            for(i=0;i<$scope.enemyTeam.characters.length;i++){
                if ($scope.enemyTeam.characters[i].soundBuffer.length>0) {
                    for (j = 0; j < $scope.enemyTeam.characters[i].soundBuffer.length; j++) {
                        soundService.playSound($scope.enemyTeam.characters[i].soundBuffer[j]);
                    }
                    $scope.enemyTeam.characters[i].soundBuffer = [];
                }
            }
        }

        function chooseAction(){
            $scope.waitServ = true;
            if($scope.activeChar._team !== currentTeamId){
                mainSocket.emit("botAction", $scope.enemyTeam.id, $scope.myTeam.id);
            }
            else {
                mainSocket.emit("botAction", $scope.myTeam.id, $scope.enemyTeam.id);
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

            if($scope.botBattle || $scope.trainingBattle){
                opponentReadyForBattle();
            }
            else{
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
            }
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
        mainSocket.on("opponentReady", opponentReadyForBattle);

        function opponentReadyForBattle() {
            $interval.cancel($scope.waitOpponentTimer);
            $scope.waitServ = true;
            startTurnTimer(); //Сразу включаем таймер, чтобы рассинхрон был небольшой
            if(!$scope.opponentWaiting) { //Таймер срабатывает лишний раз, так что обрываем, если бой уже начался
                $scope.waitServ = false;
                return;
            }

            $scope.myTeam = arenaService.prepareMyTeam(arenaService.battle["team_"+currentTeamId]);
            for(var key in arenaService.battle) {
                if(arenaService.battle.hasOwnProperty(key) && key.indexOf("team_")>-1 && key!="team_"+currentTeamId){
                    $scope.enemyTeam = arenaService.prepareEnemyTeam(arenaService.battle[key]);
                    break;
                }
            }

            //ИЗМЕНЁННАЯ ВЕРСИЯ turnPrepare для первого хода
            $scope.queue = arenaService.getQueue($scope.myTeam.characters, $scope.enemyTeam.characters);
            $scope.myTurn = arenaService.checkTurn($scope.myTeam.characters, $scope.queue[0]); //проверка, мой ли сейчас ход
            $scope.activeChar = $scope.queue[0]; //назначаем активного персонажа

            showLogs(); //выводим сообщения персонажей
            mapUpdate(); //обновляем карту

            //объявление о начале боя
            log("Battle begins! First move for "+$scope.activeChar.charName+".", $scope.activeChar.battleColor);
            $scope.opponentWaiting = false;
            $scope.waitServ = false;
            if($scope.botBattle || $scope.trainingBattle) {
                $scope.enemyTeamLoaded = true;
                if($scope.activeChar.isBot){
                    chooseAction();
                }
            }
            else{
                mainSocket.emit("enemyTeamLoaded", arenaService.battle.room);
            }
        }

        //Завершение хода
        $scope.endTurn =  function() {
            $scope.preparedAbility = undefined;
            resetCharOverlays();
            $scope.waitServ = true;
            mainSocket.emit("turnEnded", $scope.myTeam.id, $scope.enemyTeam.id);
        };

        mainSocket.on('turnEndedResult', function(battle){
            startTurnTimer(); //Сразу включаем таймер, чтобы рассинхрон был небольшой
            $scope.waitServ = false;
            arenaService.battle = battle;

            $scope.myTeam = arenaService.prepareMyTeam(arenaService.battle["team_"+currentTeamId]);
            for(var key in arenaService.battle) {
                if(arenaService.battle.hasOwnProperty(key) && key.indexOf("team_")>-1 && key!="team_"+currentTeamId){
                    $scope.enemyTeam = arenaService.prepareEnemyTeam(arenaService.battle[key]);
                    break;
                }
            }

            mainSocket.emit('checkForWin', $scope.myTeam.id, $scope.enemyTeam.id, false, function(isEnded, result, rating, ratingChange, gainedSouls){
                if(isEnded){
                    battleEnd(result, rating, ratingChange, gainedSouls)
                }
                else {
                    turnPrepare();

                    //Если персонаж в стане
                    if($scope.activeChar.stunned) {
                        log($scope.activeChar.charName + " is stunned and skip turn", $scope.activeChar.battleColor);
                        
                        if($scope.myTurn || $scope.activeChar.isBot) {
                            $scope.endTurn();
                            return;
                        }
                    }                    

                    //объявление о начале хода
                    log("Now is turn of "+$scope.activeChar.charName+".", $scope.activeChar.battleColor); //<- Цвет
                    //объявление об исходе боя в ничью
                    if($scope.turnsSpended>=40){
                        log("The battle ends after "+(50-$scope.turnsSpended)+" turns.");
                    }

                    if($scope.botBattle || ($scope.trainingBattle && $scope.activeChar.isBot)) {
                        chooseAction();
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
                mainSocket.emit('checkForWin', $scope.myTeam.id, $scope.enemyTeam.id, true, function(isEnded, result, rating, ratingChange, gainedSouls){
                    $interval.cancel($scope.waitOpponentTimer);
                    $rootScope.showInfoMessage(gettextCatalog.getString("Your enemy was disconnected"));
                    battleEnd(result, rating, ratingChange, gainedSouls);
                });
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

        mainSocket.on('moveCharToResult', function(invisible){
            if(invisible) {
                log("Someone invisible stands on that cell!", $scope.activeChar.battleColor,false);
            }
            else {
                $scope.preparedAbility = undefined;
                resetCharOverlays();
            }
        });

        mainSocket.on('updateTeams', updateTeams);

        function updateTeams(battle) {
            $scope.waitServ = false;

            arenaService.battle = battle;

            $scope.myTeam = arenaService.prepareMyTeam(arenaService.battle["team_"+currentTeamId]);
            for(var key in arenaService.battle) {
                if(arenaService.battle.hasOwnProperty(key) && key.indexOf("team_")>-1 && key!="team_"+currentTeamId){
                    $scope.enemyTeam = arenaService.prepareEnemyTeam(arenaService.battle[key]);
                    break;
                }
            }

            $scope.queue = arenaService.getQueue($scope.myTeam.characters, $scope.enemyTeam.characters);
            $scope.myTurn = arenaService.checkTurn($scope.myTeam.characters, $scope.queue[0]); //проверка, мой ли сейчас ход
            $scope.activeChar = $scope.queue[0]; //назначаем активного персонажа
            showLogs(); //выводим сообщения персонажей
            playSounds(); //Проигрываем звуки
            mapUpdate();

            mainSocket.emit('checkForWin', $scope.myTeam.id, $scope.enemyTeam.id, false, function(isEnded, result, rating, ratingChange, gainedSouls){
                if(isEnded){
                    battleEnd(result, rating, ratingChange, gainedSouls);
                }
                else {
                    //Если вдруг после своего действия персонаж оказался в стане, ход сразу же завершается
                    if($scope.activeChar.stunned && ($scope.myTurn || $scope.activeChar.isBot)) {
                        $scope.endTurn();
                        return;
                    }
                    if($scope.botBattle || ($scope.trainingBattle && $scope.activeChar.isBot)) {
                        chooseAction();
                    }
                }
            });
        }

        //Завершение боя
        function battleEnd(result, rating, ratingChange, gainedSouls) {
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
