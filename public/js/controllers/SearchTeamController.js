(function (module) {
    module.controller("SearchTeamController", SearchTeamController);

    //Контроллер выбора пати
    function SearchTeamController($scope, $location, mainSocket) {

        $scope.$on('$routeChangeSuccess', function () {
            mainSocket.emit("checkUserTeam", function(userTeam) {
                if(userTeam){
                    $location.path('/city');
                }
                else {
                    $location.path('/createTeam');
                }
            });
        });
    }
})(angular.module("fotm"));