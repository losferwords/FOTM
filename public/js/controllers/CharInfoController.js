(function (module) {
    module.controller("CharInfoController", CharInfoController);
    //Контроллер информации о персонаже
    function CharInfoController($scope, $rootScope, $route, $location, mainSocket, character, gettextCatalog) {
        var tempParams; //Снимок характеристик для возможности отмены изменений

        //Функция выставляет ползунок статов в нужное положение
        function setPointerPosition(){
            $scope.paramPoint = {left: $scope.char.params.paramPoint.left, top: $scope.char.params.paramPoint.top, width: '10px', height: '10px'};
        }

        $scope.$on('$routeChangeSuccess', function () {
            $scope.char = new character($rootScope.interestingChar);
            $scope.char.initChar();
            tempParams = {strProc: $scope.char.params.strProc,
                dxtProc: $scope.char.params.dxtProc,
                intProc: $scope.char.params.intProc,
                paramPoint: $scope.char.params.paramPoint};
            $scope.charChanged=false;
            setPointerPosition();
        });

        //Функция-обработчик движения ползунка статов
        $scope.changeParams = function() {
            $scope.charChanged=true;

            var leftY = Math.tan(2*Math.PI/3)*($scope.paramPoint.left+5)+Math.sqrt(3)*75;
            var rightY = Math.tan(Math.PI/3)*($scope.paramPoint.left+5)-Math.sqrt(3)*75;
            if($scope.paramPoint.top<leftY){
                $scope.paramPoint.top=leftY;
            }
            if($scope.paramPoint.top<rightY){
                $scope.paramPoint.top=rightY;
            }

            $scope.char.params.paramPoint = {left: $scope.paramPoint.left, top: $scope.paramPoint.top};

            var strLen = Math.sqrt(Math.pow($scope.paramPoint.left+5,2)+(Math.pow($scope.paramPoint.top+5-Math.sqrt(3)*75,2)))-5;
            if(strLen>=138) strLen = 140;
            if(strLen<=3) strLen = 0;
            $scope.char.params.strProc = 1-strLen/140;

            var dxtLen = Math.sqrt(Math.pow($scope.paramPoint.left+5-75,2)+(Math.pow($scope.paramPoint.top+5,2)))-5;
            if(dxtLen>=138) dxtLen = 140;
            if(dxtLen<=3) dxtLen = 0;
            $scope.char.params.dxtProc = 1-dxtLen/140;

            var intLen = Math.sqrt(Math.pow($scope.paramPoint.left+5-150,2)+(Math.pow($scope.paramPoint.top+5-Math.sqrt(3)*75,2)))-5;
            if(intLen>=138)intLen = 140;
            if(intLen<=3) intLen = 0;
            $scope.char.params.intProc = 1-intLen/140;

            $scope.char.calcChar();
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
            });
        };

        //Функция отменяет изменения персонажа
        $scope.declineChangesClick = function(){
            $scope.char.params.strProc = tempParams.strProc;
            $scope.char.params.dxtProc = tempParams.dxtProc;
            $scope.char.params.intProc = tempParams.intProc;
            $scope.char.params.paramPoint = tempParams.paramPoint;
            $scope.char.calcChar();
            $scope.charChanged=false;
            setPointerPosition();
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
            var index;
            var prevCharIndex;
            for(var i=0;i<$rootScope.interestingTeam.characters.length;i++){
                if($rootScope.interestingChar._id===$rootScope.interestingTeam.characters[i]._id){
                    index=i;
                    break;
                }
            }
            switch(index){
                case 0:
                    if(!$rootScope.interestingTeam.characters[2].lose) {
                        prevCharIndex=2;
                    }
                    else {
                        prevCharIndex=1;
                    }
                    break;
                case 1:
                    if(!$rootScope.interestingTeam.characters[0].lose) {
                        prevCharIndex=0;
                    }
                    else {
                        prevCharIndex=2;
                    }
                    break;
                case 2:
                    if(!$rootScope.interestingTeam.characters[1].lose) {
                        prevCharIndex=1;
                    }
                    else {
                        prevCharIndex=0;
                    }
                    break;
            }
            if($rootScope.interestingTeam.characters[prevCharIndex])
                $rootScope.interestingChar=$rootScope.interestingTeam.characters[prevCharIndex];
            $route.reload();
        };

        //Функция переносит нас на следующего персонажа
        $scope.nextCharClick = function(){
            var index;
            var nextCharIndex;
            for(var i=0;i<$rootScope.interestingTeam.characters.length;i++){
                if($rootScope.interestingChar._id===$rootScope.interestingTeam.characters[i]._id){
                    index=i;
                    break;
                }
            }
            switch(index){
                case 0:
                    if(!$rootScope.interestingTeam.characters[1].lose) {
                        nextCharIndex=1;
                    }
                    else {
                        nextCharIndex=2;
                    }
                    break;
                case 1:
                    if(!$rootScope.interestingTeam.characters[2].lose) {
                        nextCharIndex=2;
                    }
                    else {
                        nextCharIndex=0;
                    }
                    break;
                case 2:
                    if(!$rootScope.interestingTeam.characters[0].lose) {
                        nextCharIndex=0;
                    }
                    else {
                        nextCharIndex=1;
                    }
                    break;
            }
            $rootScope.interestingChar=$rootScope.interestingTeam.characters[nextCharIndex];
            $route.reload();
        };

        //Функция проверяет, живы ли другие участники команды
        $scope.checkForLosers = function(){
            var index;
            for(var i=0;i<$rootScope.interestingTeam.characters.length;i++){
                if($rootScope.interestingChar._id===$rootScope.interestingTeam.characters[i]._id){
                    index=i;
                    break;
                }
            }
            switch(index){
                case 0: return ($rootScope.interestingTeam.characters[1].lose && $rootScope.interestingTeam.characters[2].lose); break;
                case 1: return ($rootScope.interestingTeam.characters[0].lose && $rootScope.interestingTeam.characters[2].lose); break;
                case 2: return ($rootScope.interestingTeam.characters[0].lose && $rootScope.interestingTeam.characters[1].lose); break;
            }
        };

        mainSocket.on("setCharResult", function () {
            tempParams = {strProc: $scope.char.params.strProc,
                dxtProc: $scope.char.params.dxtProc,
                intProc: $scope.char.params.intProc,
                paramPoint: $scope.char.params.paramPoint};
            $scope.charChanged=false;
        });
    }
})(angular.module("fotm"));
