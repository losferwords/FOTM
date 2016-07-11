(function (module) {
    module.controller("CreateTeamController", CreateTeamController);

    //Контроллер создания пати
    function CreateTeamController($scope, $location, $window, $timeout, mainSocket, gettextCatalog, currentTeam) {
        var teamObj = {};
        $scope.createdChars = [];
        $scope.dummyTeamCreated = false;
        $scope.createCharPending = false;
        $scope.createTeamPending = false;
        $scope.teamName = {
            value: ""
        };

        //Кнопка создания персонажа на экране команды
        $scope.createCharClick = function(index) {
            currentTeam.setCurrentCharIndex(index);
            mainSocket.emit("createChar", function(){
                $location.path('/createChar');
            });
            $scope.createCharPending = true;
        };

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
            teamObj.teamName = $scope.teamName.value;
            $scope.createTeamPending = true;
            mainSocket.emit("checkTeamBeforeCreate", {teamName: $scope.teamName.value}, function(team){
                //Получаем результаты проверки тимы
                if(team){
                    $scope.changeInfoCSS("error"); //применяем ng-class
                    $scope.info=gettextCatalog.getString("Team name {{one}} is already in use",{one: $scope.teamName.value});
                    $scope.createTeamPending = false;
                }
                else {
                    $scope.createTeamPending = true;
                    mainSocket.emit('saveNewTeam', {
                        _id: teamObj._id,
                        teamName: $scope.teamName.value,
                        souls: teamObj.souls
                    }, function() {
                        $scope.changeInfoCSS("success"); //применяем ng-class
                        $scope.info=gettextCatalog.getString("Successful");
                        $timeout(function(){
                            $location.path('/city');
                        }, 1000);
                    });

                }
            });
        };

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
            currentTeam.set(undefined);
            mainSocket.emit("getDummyTeam", function(team){
                teamObj=team;
                $scope.dummyTeamCreated = true;
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
                currentTeam.set($scope.team);
            });
        });
    }
})(angular.module("fotm"));