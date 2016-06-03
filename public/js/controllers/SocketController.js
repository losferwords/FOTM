//Контроллер сокетов
angular.module('fotm').controller("SocketController", ["$scope", '$window', '$location', '$rootScope', '$timeout', 'mainSocket', SocketController]);

function SocketController($scope, $window, $location, $rootScope, $timeout, mainSocket) {
    $scope.chatOpened = false;
    $scope.commonChat = [];
    $scope.arenaChat = [];
    $scope.newCommonMsg = {
        text: ""
    };
    $scope.newArenaMsg = {
        text: ""
    };

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

    mainSocket.on('newCommonMessage', function(msg){
        $scope.commonChat.push(msg);
    });

    $scope.sendMsg = function(channel){
        //Функция возврщает время в формате hh:mm
        function currentTime() {
            var date = new Date();
            var h = date.getHours();
            var m = date.getMinutes();
            if (h < 10) h = '0' + h;
            if (m < 10) m = '0' + m;
            return h+":"+m;
        }

        function processMsg(msgType, msgArray){
                msgType.time = currentTime();
                mainSocket.emit('sendChatMessage', channel, msgType);
                msgType.text="";
                //Очищаем первый элемент чата, если он переполнен
                if(msgArray.length==100){
                    msgArray.splice(0,1);
                }

                //обновляем чат на клиенте
                msgArray.push(msgType);
            }

        switch(channel){
            case 'common' : 
                processMsg(newCommonMsg, commonChat);
                break;
            case 'arena' : 
                processMsg(newArenaMsg, arenaChat);
                break;            
        }
    }

    //Показ информации
    $rootScope.showInfoMessage = function(message){
        $rootScope.infoMessage=message;
        $timeout(function(){$rootScope.infoMessage=""},4000);
    };

}

angular.module('fotm').factory('mainSocket', function (socketFactory) {
    return socketFactory();
});


