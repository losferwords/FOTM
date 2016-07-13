(function (module) {
    module.controller("CityController", CityController);

    //Контроллер выбора пати
    function CityController($scope, $rootScope, $location, $interval, $uibModal, $route, characterService, mainSocket, gettextCatalog, soundService, currentTeam) {
        var searchTimer;
        var searchProcessStep=0;
        var rollDiceTimer;

        $scope.searchBattle = false;
        $scope.arenaQueue = 0;
        $scope.pending = false; //ожидание ответа от сервера
        $scope.resurectCostArray = [];

        //Кнопка "Встать в очередь на арену"
        $scope.joinArenaClick = function () {
            searchTimer = $interval(function(){
                switch (searchProcessStep){
                    case 0: searchProcessStep++; break;
                    case 1: searchProcessStep++; break;
                    case 2: searchProcessStep=0; break;
                }
            },1000);

            $scope.searchBattle = true;
            mainSocket.emit("joinArenaLobby");
        };

        $scope.joinBattleBtnHtml = function() {
            if(!searchTimer || !$scope.searchBattle){
                return gettextCatalog.getString("Join Battle");
            }
            else {
                switch (searchProcessStep){
                    case 0: return gettextCatalog.getString("searching."); break;
                    case 1: return gettextCatalog.getString("searching.."); break;
                    case 2: return gettextCatalog.getString("searching..."); break;
                }
            }
        };

        //Проверка, умер ли кто-то из команды
        $scope.checkForLose = function() {
            if($scope.team){
                for(var i=0;i<$scope.team.characters.length;i++){
                    if($scope.team.characters[i].lose) return true;
                }
            }
            return false;
        };

        $scope.leaveArenaClick = function () {
            $scope.searchBattle = false;
            mainSocket.emit("leaveArenaLobby");
            $interval.cancel(searchTimer);
        };

        $scope.characterClick = function(index){
            currentTeam.setCurrentCharIndex(index);
            $location.path("/charInfo");
        };

        $scope.abilitiesClick = function(index){
            currentTeam.setCurrentCharIndex(index);
            $location.path("/abilitiesInfo");
        };

        $scope.inventoryClick = function(index){
            currentTeam.setCurrentCharIndex(index);
            $location.path("/inventoryInfo");
        };

        //Получает стоимость роли в ресурсах
        $scope.checkResurectCost = function(index) {
            if(($scope.team.souls.red-$scope.resurectCostArray[index].red>=0) &&
                ($scope.team.souls.green-$scope.resurectCostArray[index].green>=0) &&
                ($scope.team.souls.blue-$scope.resurectCostArray[index].blue>=0))
            {
                return true;
            }
            else {
                return false;
            }
        };

        $scope.resurrectClick = function(char){
            $scope.pending = true;
            mainSocket.emit('resurectChar', char._id, function(team) {
                $scope.pending = false;
                currentTeam.set(team);
            });
        };

        $scope.createCharClick = function(index){
            currentTeam.setCurrentCharIndex(index);
            $location.path("/createChar");
        };

        $scope.burnClick = function(char){
            $scope.pending=true;
            mainSocket.emit('burnChar', char._id, function(burnedChar) {
                currentTeam.setChar(burnedChar);
                $scope.pending=false;
            });
        };

        //Функция возвращает портрет персонажа для background
        $scope.getCharPortrait = function(char) {
            return "url(."+char.portrait+")";
        };

        //Функция запускает modal удаления команды
        $scope.deleteTeamClick = function() {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'deleteModal.html',
                controller: 'CityModalController',
                size: 'sm',
                resolve: {
                    teamId: function () {
                        return $scope.team._id;
                    }
                }
            });
        };

        //Функция запускает modal костей
        $scope.rollDicesClick = function() {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'diceModal.html',
                controller: 'diceModalController',
                size: 'sm',
                backdrop: false,
                resolve: {
                    team: function () {
                        return $scope.team;
                    }
                }
            });

            modalInstance.result.then(function () {
                $route.reload();
            }, function () {

            });
        };

        $scope.rollDicesBtnText = function () {
            if(rollDiceTimer && $scope.nextRollLeft!==0) {
                return $scope.nextRollLeft;
            }
            else {
                return gettextCatalog.getString("Roll Dices");
            }
        };

        $scope.openAdmin = function () {
            $location.path("/admin");
        };

        $scope.$on('$destroy', function (event) {
            $interval.cancel(rollDiceTimer);
            $interval.cancel(searchTimer);
        });

        mainSocket.on("startBattle", function(data){
            $rootScope.currentBattle={
                room: data.battleRoom,
                groundType: data.groundType,
                allyPositions: data.allyPartyPositions,
                enemyPositions: data.enemyPartyPositions,
                wallPositions: data.wallPositions
            };
            $location.path("/arena");
        });

        mainSocket.on("arenaQueueChanged", function(queue){
            $scope.arenaQueue = queue;
        });

        $scope.$on('$routeChangeSuccess', function () {
            if(!soundService.getMusicObj().cityMusic || soundService.getMusicObj().cityMusic.paused){
                soundService.initMusic('city');
            }
            if(soundService.getMusicObj().battleAmbience){
                soundService.getMusicObj().battleAmbience.pause();
                soundService.getMusicObj().battleMusic.pause();
            }
            $scope.pending=true;
            mainSocket.emit("getUserTeam", function(team, rank, nextRollLeft) {
                if(team){
                    $scope.team = team;
                    $scope.team.characters[0].battleColor="#2a9fd6";
                    $scope.team.characters[1].battleColor="#0055AF";
                    $scope.team.characters[2].battleColor="#9933cc";
                    $scope.rank = rank;
                    currentTeam.set(team);
                    mainSocket.emit('getTeamRoleCost', team._id, function(costArray){
                        $scope.resurectCostArray = costArray;
                    });

                    var left = new Date(3600000-(nextRollLeft));
                    if(nextRollLeft<3600000) { //Если не прошло достаточно времени
                        $scope.nextRollLeft=leftTimeFormat(left);
                    }
                    else { // уже можно ролить
                        $scope.nextRollLeft=0;
                        rollDiceTimer=undefined;
                    }

                    rollDiceTimer = $interval(function(){
                        nextRollLeft+=1000;
                        left = new Date(3600000-(nextRollLeft));
                        if(nextRollLeft<3600000) { //Если не прошло достаточно времени
                            $scope.nextRollLeft=leftTimeFormat(left);
                        }
                        else { // уже можно ролить
                            $interval.cancel(rollDiceTimer);
                            $scope.nextRollLeft=0;
                            rollDiceTimer=undefined;
                        }
                    }, 1000);
                    $scope.pending = false;
                    mainSocket.emit("getArenaQueue");
                }
                else {
                    $location.path("/searchTeam");
                }
            });
        });

        function leftTimeFormat (time) {
            var hh = time.getUTCHours();
            if(hh<10) hh='0'+hh;
            var mm = time.getUTCMinutes();
            if(mm<10) mm='0'+mm;
            var ss = time.getUTCSeconds();
            if(ss<10) ss='0'+ss;
            return hh+":"+mm+":"+ss;
        }
    }

    module.controller("CityModalController", CityModalController);

    //Контроллер подтверждения удаления команды
    function CityModalController($scope, $location, mainSocket, $uibModalInstance, teamId) {

        $scope.deleteYes = function () {
            mainSocket.emit("deleteTeam", teamId);
            $location.path("/createTeam");
            $uibModalInstance.close('cancel');
        };

        $scope.deleteNo = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

    module.controller("diceModalController", diceModalController);

    //Контроллер костей
    function diceModalController($scope, $interval, mainSocket, $uibModalInstance, gettextCatalog, randomService, team) {
        $scope.dices = {
            red: 0,
            green: 0,
            blue: 0
        };
        $scope.rollComplete=false;

        var rollingTimer; //Таймер ролла

        $scope.rollDicesText = function () {
            if(rollingTimer) {
                return gettextCatalog.getString("Stop");
            }
            else {
                return gettextCatalog.getString("Roll Dices");
            }
        };

        //Запуск/остановка рола
        $scope.rollDices = function () {
            if(rollingTimer){
                $scope.dicesRolling=false;
                $interval.cancel(rollingTimer);
                rollingTimer=undefined;
                $scope.rollComplete=true;
                mainSocket.emit('addSoulsAfterRoll', team._id, {
                        red: $scope.dices.red,
                        green: $scope.dices.green,
                        blue: $scope.dices.blue
                    });
            }
            else {
                $scope.dicesRolling=true;
                rollingTimer=$interval(function(){
                    $scope.dices.red=randomService.randomInt(1,6);
                    $scope.dices.green=randomService.randomInt(1,6);
                    $scope.dices.blue=randomService.randomInt(1,6);
                },500);
            }
        };

        $scope.$on('$destroy', $interval.cancel(rollingTimer));

        $scope.rollBack = function () {
            $uibModalInstance.close('cancel');
        };
    }
})(angular.module("fotm"));