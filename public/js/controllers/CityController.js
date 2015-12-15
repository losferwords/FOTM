angular.module('fotm').register.controller("CityController", ["$scope", '$rootScope', '$location', '$interval', '$uibModal', '$route', 'characterService', 'mainSocket', 'gettextCatalog', 'soundService', CityController]);

//Контроллер выбора пати
function CityController($scope, $rootScope, $location, $interval, $uibModal, $route, characterService, mainSocket, gettextCatalog, soundService) {
    var searchTimer;
    var searchProcessStep=0;
    var charSetFlag;
    var deleteCharInterval;
    var rollDiceTimer;

    $scope.searchBattle = false;

    soundService.getMusicObj.cityAmbience.play();
    soundService.getMusicObj.battleAmbience.stop();

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

    $scope.characterClick = function(char){
        $rootScope.interestingChar=char;
        $location.path("/charInfo");
    };

    $scope.abilitiesClick = function(char){
        $rootScope.interestingChar=char;
        $location.path("/abilitiesInfo");
    };

    $scope.inventoryClick = function(char){
        $rootScope.interestingChar=char;
        $location.path("/inventoryInfo");
    };

    //Получает стоимость роли в ресурсах
    $scope.getRoleCost = function(role, color) {
        return characterService.getRoleCost(role)[color];
    };

    $scope.resurrectClick = function(char){
        mainSocket.emit('setChar', {
            _id: char._id,
            lose: false
        });
        mainSocket.emit('setTeam', {
            _id: $scope.team._id,
            souls: {
                red: $scope.team.souls.red-characterService.getRoleCost(char.role).red,
                green: $scope.team.souls.green-characterService.getRoleCost(char.role).green,
                blue: $scope.team.souls.blue-characterService.getRoleCost(char.role).blue
            }
        });
    };

    mainSocket.on("setCharResult", function () {
        charSetFlag=true;
        //На сервер отправили 2 сообщения, так что переход будет успешным только когда ответ придёт от обоих
    });
    mainSocket.on("setTeamResult", function () {
        deleteCharInterval=$interval(function(){
            if(charSetFlag) {
                mainSocket.emit("getUserTeam");
                $interval.cancel(deleteCharInterval);
                deleteCharInterval = undefined;
            }
        }, 500);
    });

    $scope.checkResurrectCost = function(char){
        if(($scope.team.souls.red-characterService.getRoleCost(char.role).red>=0) &&
            ($scope.team.souls.green-characterService.getRoleCost(char.role).green>=0) &&
            ($scope.team.souls.blue-characterService.getRoleCost(char.role).blue>=0)) {
            return false;
        }
        return true;
    };

    $scope.createCharClick = function(char){
        $rootScope.interestingChar=char;
        $location.path("/createChar");
    };

    $scope.burnClick = function(char){
        //Эта метка нужна для того, чтобы не удалять пока персонажа из базы, а просто пометить его, как сожжённого
        char.charName=char._id;
        mainSocket.emit('setChar', {
            _id: char._id,
            charName: char._id
        });
    };

    //Функция возвращает портрет персонажа для background
    $scope.getCharPortrait = function(char) {
        return "url(."+char.portrait+")";
    };

    //Функция запускает modal удаления команды
    $scope.deleteTeamClick = function() {
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
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
            animation: $scope.animationsEnabled,
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
        if(!rollDiceTimer) {
            return gettextCatalog.getString("Roll Dices");
        }
        else {
            return $scope.nextRollLeft;
        }
    };

    $scope.$on('$destroy', function (event) {
        $interval.cancel(deleteCharInterval);
        $interval.cancel(rollDiceTimer);
        $interval.cancel(searchTimer);
    });

    mainSocket.on("startBattle", function(data){
        $rootScope.currentBattle={
            room: data.battleRoom,
            groundType: data.groundType,
            allyPositions: data.allyPartyPositions,
            enemyPositions: data.enemyPartyPositions
        };
        $location.path("/arena");
    });

    $scope.$on('$routeChangeSuccess', function () {
        mainSocket.emit("getUserTeam");
    });
    mainSocket.on('getUserTeamResult', function(team, rank, nextRollLeft){
        if(team){
            $scope.team = team;
            $scope.team.characters[0].battleColor="#2a9fd6";
            $scope.team.characters[1].battleColor="#0055AF";
            $scope.team.characters[2].battleColor="#9933cc";
            $rootScope.interestingTeam = $scope.team;
            $scope.rank = rank;

            var left = new Date(3600000-(nextRollLeft));
            if(nextRollLeft<3600000) { //Если не прошло достаточно времени
                $scope.nextRollLeft=leftTimeFormat(left);
            }
            else { // уже можно ролить
                $scope.nextRollLeft=0;
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
        }
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

angular.module('fotm').register.controller("CityModalController", ["$scope", '$location', 'mainSocket', '$uibModalInstance', 'teamId', CityModalController]);

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

angular.module('fotm').register.controller("diceModalController", ["$scope", '$interval', 'mainSocket', '$uibModalInstance', 'gettextCatalog', 'randomService', 'team', diceModalController]);

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
            mainSocket.emit('setTeam',
            {
                _id: team._id,
                souls: {
                    red: team.souls.red+$scope.dices.red,
                    green: team.souls.green+$scope.dices.green,
                    blue: team.souls.blue+$scope.dices.blue
                },
                lastRoll: new Date()
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