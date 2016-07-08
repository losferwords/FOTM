(function (module) {
    module.controller("CharInfoController", CharInfoController);
    //Контроллер информации о персонаже
    function CharInfoController($scope, $route, $location, mainSocket, gettextCatalog, currentTeam) {
        var tempParamPoint; //Снимок характеристик для возможности отмены изменений

        //Функция выставляет ползунок статов в нужное положение
        function setPointerPosition(){
            $scope.paramPoint = {left: $scope.char.params.paramPoint.left, top: $scope.char.params.paramPoint.top, width: '10px', height: '10px'};
        }

        $scope.$on('$routeChangeSuccess', function () {
            $scope.char = currentTeam.get().characters[currentTeam.getCurrentCharIndex()];
            $scope.charChanged=false;
            setPointerPosition();
            tempParamPoint = {
                left: $scope.paramPoint.left,
                top: $scope.paramPoint.top
            };
        });

        //Функция-обработчик движения ползунка статов
        $scope.changeParams = function() {
            $scope.charChanged=true;

            mainSocket.emit('calcCharByParams', $scope.char._id, $scope.paramPoint, function (char) {
                $scope.char = char;
            });
        };

        $scope.getCharRace=function(){
            switch ($scope.char.race) {
                case 'nephilim': return gettextCatalog.getString('Nephilim'); break;
                case 'human': return gettextCatalog.getString('Human'); break;
                case 'cambion': return gettextCatalog.getString('Cambion'); break;
            }
        };

        $scope.getCharRole=function(){
            switch ($scope.char.role) {
                case 'sentinel': return gettextCatalog.getString('Sentinel'); break;
                case 'slayer': return gettextCatalog.getString('Slayer'); break;
                case 'redeemer': return gettextCatalog.getString('Redeemer'); break;
                case 'ripper': return gettextCatalog.getString('Ripper'); break;
                case 'prophet': return gettextCatalog.getString('Prophet'); break;
                case 'malefic': return gettextCatalog.getString('Malefic'); break;
                case 'cleric': return gettextCatalog.getString('Cleric'); break;
                case 'heretic': return gettextCatalog.getString('Heretic'); break;
            }
        };

        //Функция принимает изменения персонажа
        $scope.acceptChangesClick = function(){
            mainSocket.emit('setChar', {
                _id: $scope.char._id,
                params: $scope.char.params
            },
            function(char){
                $scope.char = char;
                currentTeam.setChar($scope.char);
                setPointerPosition();
                tempParamPoint = {
                    left: $scope.paramPoint.left,
                    top: $scope.paramPoint.top
                };
                $scope.charChanged=false;
            });
        };

        //Функция отменяет изменения персонажа
        $scope.declineChangesClick = function(){
            mainSocket.emit('calcCharByParams', $scope.char._id, tempParamPoint, function (char) {
                $scope.char = char;
                $scope.charChanged=false;
                setPointerPosition();
            });
        };

        //Функция переносит нас в окно навыков
        $scope.abilitiesClick = function(){
            $location.path('/abilitiesInfo');
        };

        //Функция переносит нас в окно инвентаря
        $scope.inventoryClick = function(){
            $location.path('/inventoryInfo');
        };

        //Функция отменяет изменения персонажа
        $scope.exitClick = function(){
            $location.path('/city');
        };

        //Функция переносит нас на предыдущего персонажа
        $scope.prevCharClick = function(){
            currentTeam.selectPrevChar();
            $route.reload();
        };

        //Функция переносит нас на следующего персонажа
        $scope.nextCharClick = function(){
            currentTeam.selectNextChar();
            $route.reload();
        };

        //Функция проверяет, живы ли другие участники команды
        $scope.checkForLosers = function(){
            switch(currentTeam.getCurrentCharIndex()){
                case 0: return (currentTeam.get().characters[1].lose && currentTeam.get().characters[2].lose); break;
                case 1: return (currentTeam.get().characters[0].lose && currentTeam.get().characters[2].lose); break;
                case 2: return (currentTeam.get().characters[0].lose && currentTeam.get().characters[1].lose); break;
            }
        };
    }
})(angular.module("fotm"));
