angular.module('fotm').register.controller("CreateTeamController", ["$scope", '$rootScope', '$location', '$window', '$timeout', 'mainSocket', 'gettextCatalog', CreateTeamController]);

//Контроллер создания пати
function CreateTeamController($scope, $rootScope, $location, $window, $timeout, mainSocket, gettextCatalog) {
    var teamObj = {};
    $scope.createdChars = [];

    //Кнопка создания персонажа на экране команды
    $scope.createCharClick = function() {
        mainSocket.emit("createChar");
    };

    mainSocket.on("createCharResult", function() {
        $location.path('/createChar');
    });

    //Количество персонажей
    $scope.moreChars = function() {
        if($scope.team) {
            if($scope.team.characters.length===3){
                return gettextCatalog.getString("Give a name for your team");
            }
            else {
                return gettextCatalog.getPlural(3-$scope.team.characters.length, "Create 1 more member", "Create {{$count}} more members", {});
            }
        }
    };

    //Кнопка сохранения тимы
    $scope.submitTeamClick = function() {
        teamObj.teamName = $scope.teamName;
        mainSocket.emit("getTeam", {teamName: teamObj.teamName});
    };
    //Получаем результаты проверки тимы
    mainSocket.on("getTeamResult", function (team) {
        if(team){
            $scope.changeInfoCSS("error"); //применяем ng-class
            $scope.info=gettextCatalog.getString("Team name {{one}} is already in use",{one: team.teamName});
        }
        else {
            mainSocket.emit('setTeam', {
                _id: teamObj._id,
                teamName: teamObj.teamName,
                rating: 1000,
                wins: 0,
                loses: 0,
                inventory: [],
                souls: teamObj.souls,
                lastRoll: new Date()});
        }
    });
    mainSocket.on("setTeamResult", function () {
        $scope.changeInfoCSS("success"); //применяем ng-class
        $scope.info=gettextCatalog.getString("Successful");
        $timeout(function(){
            $location.path('/city');
        }, 1000);
    });

    //При нажатии на "отмена" dummy тима должена удалиться вместе с персонажами
    $scope.cancelTeamClick = function() {
        mainSocket.emit("removeDummyTeam");
        $window.location.href="/"; //выкидываем на логин скрин
    };

    //Функция возвращает портрет персонажа для background
    $scope.getCharPortrait = function(char) {
        if(char) return "url(."+char.portrait+")";
    };

    $scope.$on('$routeChangeSuccess', function () {
        $rootScope.interestingChar=undefined;
        mainSocket.emit("getDummyTeam");
    });
    mainSocket.on('getDummyTeamResult', function(team){
        teamObj=team;
        if(team.characters[0]){
            $scope.createdChars[0]=team.characters[0];
        }
        if(team.characters[1]){
            $scope.createdChars[1]=team.characters[1];
        }
        if(team.characters[2]){
            $scope.createdChars[2]=team.characters[2];
        }

        $scope.team=team;
    });
}