angular.module('fotm').register.controller("SearchTeamController", ["$scope", '$location', 'mainSocket', SearchTeamController]);

//Контроллер выбора пати
function SearchTeamController($scope, $location, mainSocket) {

    $scope.$on('$routeChangeSuccess', function () {
        mainSocket.emit("checkUserTeam");
    });
    mainSocket.on('checkUserTeamResult', function(userTeam){
        if(userTeam){
            $location.path('/city');
        }
        else {
            $location.path('/createTeam');
        }
    });
}