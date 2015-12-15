//Контроллер сокетов
angular.module('fotm').controller("SocketController", ["$scope", '$window', '$location', '$rootScope', '$timeout', 'mainSocket', SocketController]);

function SocketController($scope, $window, $location, $rootScope, $timeout, mainSocket) {

    mainSocket.on("leave", function (serverOnlineUsers) {
        $rootScope.onlineUsers = serverOnlineUsers;
    });

    mainSocket.on("join", function (serverOnlineUsers) {
        $rootScope.onlineUsers = serverOnlineUsers;
    });

    mainSocket.on("connect", function () {

    });

    mainSocket.on("disconnect", function (message) {
        if (message == "io server disconnect") {
            return mainSocket.emit('error', message);
        }
        mainSocket.emit('error');
    });

    mainSocket.on('kicked', function () {
        mainSocket.disconnect();
        $window.location.href="/";
    });

    //Обработка ошибок
    mainSocket.on('connect_error', function () {
        $scope.errorHandler = "disconnected from server";
        mainSocket.disconnect();
    });

    mainSocket.on('connect_timeout', function () {
        $scope.errorHandler = "server timeout is reached";
        mainSocket.disconnect();
    });

    mainSocket.on('error', function (err) {
        $scope.errorHandler = "socket error: " + err;
        mainSocket.disconnect();
    });

    mainSocket.on('customError', function (reason) {
        $scope.errorHandler = "Error: " + JSON.stringify(reason.message);
        mainSocket.disconnect();
    });

    $scope.$on('$destroy', function (event) {
        mainSocket.removeAllListeners();
    });

    //Получение имени игрока от сервера
    $scope.$on('$routeChangeSuccess', function () {
        mainSocket.emit("getUserName");
    });
    mainSocket.on("getUserNameResult", function(name){
        $scope.userName = name;
    });

    //Показ информации
    $rootScope.showInfoMessage = function(message){
        $rootScope.infoMessage=message;
        $timeout(function(){$rootScope.infoMessage=""},4000);
    };

}

angular.module('fotm').factory('mainSocket', function (socketFactory) {
    return socketFactory();
});


