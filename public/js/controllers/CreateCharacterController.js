angular.module('fotm').register.controller("CreateCharacterController", ["$scope", '$rootScope', '$location', '$timeout', 'mainSocket', 'characterService', 'abilityService', 'randomService', 'gettextCatalog', CreateCharacterController]);

//Контроллер создания персонажа
function CreateCharacterController($scope, $rootScope, $location, $interval, mainSocket, characterService, abilityService, randomService, gettextCatalog) {
    var characterObj = {};
    var teamId;

    $scope.activePortrait = 0;

    //Кнопка сохранения персонажа на экране создания персонажа
    $scope.submitCharClick = function() {
        characterObj.charName = $scope.charName;
        mainSocket.emit("getChar", {charName: characterObj.charName});
    };

    //При нажатии на "отмена" dummy персонаж должен удалиться
    $scope.cancelCharClick = function() {
        if($rootScope.interestingChar){
            $location.path('/city');
        }
        else{
            mainSocket.emit("removeChar", characterObj._team, characterObj._id);
        }
    };
    mainSocket.on("removeCharResult", function() {
        $location.path('/createTeam');
    });

    //Получаем результаты проверки персонажа
    mainSocket.on("getCharResult", function (char) {
        if(char){
            $scope.changeInfoCSS("error"); //применяем ng-class
            $scope.info=gettextCatalog.getString("Name {{one}} is already in use", {one: char.charName});
        }
        else {
            //Набираем базовые скилы для данной роли
            if($scope.role==="random"){
                if($scope.currentRace.name==="human"){
                    switch (randomService.randomInt(0,7)) {
                        case 0: $scope.role="sentinel"; break;
                        case 1: $scope.role="slayer"; break;
                        case 2: $scope.role="redeemer"; break;
                        case 3: $scope.role="ripper"; break;
                        case 4: $scope.role="prophet"; break;
                        case 5: $scope.role="malefic"; break;
                        case 6: $scope.role="cleric"; break;
                        case 7: $scope.role="heretic"; break;
                    }
                }
                else if($scope.currentRace.name==="nephilim"){
                    switch (randomService.randomInt(0,3)) {
                        case 0: $scope.role="sentinel"; break;
                        case 1: $scope.role="redeemer"; break;
                        case 2: $scope.role="prophet"; break;
                        case 3: $scope.role="cleric"; break;
                    }
                }
                else {
                    switch (randomService.randomInt(0,3)) {
                        case 0: $scope.role="slayer"; break;
                        case 1: $scope.role="ripper"; break;
                        case 2: $scope.role="malefic"; break;
                        case 3: $scope.role="heretic"; break;
                    }
                }
            }
            updateCharInfo();
            var abilitiesArr = characterService.getStartAbilities($scope.role);
            var availableAbilitiesArr = characterService.getBasicAbilities($scope.role, $scope.currentRace.name);

            var abilitiesObjectsArr = [];
            for(var i=0;i<abilitiesArr.length;i++){
                abilitiesObjectsArr.push(abilityService.ability(abilitiesArr[i]));
            }
            mainSocket.emit('setChar', {
                _id: characterObj._id,
                charName: characterObj.charName,
                gender: $scope.gender,
                race: $scope.currentRace.name,
                role: $scope.role,
                portrait: $scope.portraits[$scope.activePortrait].image,
                params: $scope.params,
                equip: characterService.getEquip($scope.role),
                abilities: abilitiesObjectsArr,
                availableAbilities: availableAbilitiesArr,
                lose: false
            });            
        }
    });
    mainSocket.on("setCharResult", function () {
        mainSocket.emit('setTeam', {
            _id: teamId,
            souls: {
                red: $scope.teamSouls.red-$scope.roleCost.red,
                green: $scope.teamSouls.green-$scope.roleCost.green,
                blue: $scope.teamSouls.blue-$scope.roleCost.blue
            }
        });
    });
    mainSocket.on("setTeamResult", function () {
        $scope.changeInfoCSS("success"); //применяем ng-class
        $scope.info=gettextCatalog.getString("Successful");
        if($rootScope.interestingChar){
            $location.path('/city');
        }
        else{
            $location.path('/createTeam');
        }
    });

    $scope.$on('$routeChangeSuccess', function () {
        if($rootScope.interestingChar){
            characterObj=$rootScope.interestingChar;
            $scope.teamSouls=$rootScope.interestingTeam.souls;
            teamId = $rootScope.interestingTeam._id;
        }
        else {
            //Получаем dummy персонажа
            mainSocket.emit("getDummyChar");
        }
    });
    mainSocket.on("getDummyCharResult", function(dummyChar){
        characterObj=dummyChar;
        $scope.teamSouls=characterObj._team.souls;
        teamId = characterObj._team._id;
    });

    $scope.gender="male";

    $scope.races=["nephilim","human","cambion"];
    $scope.currentRace={name: "human"};
    $scope.racePortraitPaths = function(number){
        return {"background-image" : "url(./images/portraits/"+$scope.races[number]+"/"+$scope.gender+"/"+$scope.races[number]+"_"+$scope.gender+"_1.jpg)"};
    };
    $scope.getRaceName=function(name){
        switch (name) {
            case 'nephilim': return gettextCatalog.getString('Nephilim'); break;
            case 'human': return gettextCatalog.getString('Human'); break;
            case 'cambion': return gettextCatalog.getString('Cambion'); break;
        }
    };
    $scope.getRaceBtnClass=function(race){
        if(race==$scope.currentRace.name) return 'btn-success';
        return 'btn-primary'
    };

    $scope.role="random";

    $scope.$watch('currentRace.name', function() {
        if($scope.currentRace.name=='cambion'){
            switch($scope.role){
                case 'sentinel': $scope.role="slayer"; break;
                case 'redeemer': $scope.role="ripper"; break;
                case 'prophet':  $scope.role="malefic"; break;
                case 'cleric':   $scope.role="heretic"; break;
            }
        }
        else if($scope.currentRace.name=='nephilim'){
            switch($scope.role){
                case 'slayer':   $scope.role="sentinel"; break;
                case 'ripper':   $scope.role="redeemer"; break;
                case 'malefic':  $scope.role="prophet"; break;
                case 'heretic':  $scope.role="cleric"; break;
            }
        }

        $scope.portraits = getPortraits();
        updateCharInfo();
    });
    $scope.$watch('gender', function() {
        $scope.portraits = getPortraits();
        updateCharInfo();
    });
    $scope.$watch('role', function() {
        updateCharInfo();
        $scope.roleCost = characterService.getRoleCost($scope.role);
    });

    $scope.getRaceInfo = function() {
        return characterService.getRaceinfo($scope.currentRace.name);
    };

    $scope.getRoleInfo = function() {
        return characterService.getRoleinfo($scope.role);
    };

    //Функция обновляет информацию о персонаже
    function updateCharInfo(){
        if($scope.role!=="random"){
            $scope.params = characterService.getStartParams($scope.gender, $scope.currentRace.name, $scope.role);
        }
    }

    //Функция динамически загружает портреты
    function getPortraits(){
        var portraits=[];
        for(var i=1;i<=4;i++){
            portraits.push({image: "./images/portraits/"+$scope.currentRace.name+"/"+$scope.gender+"/"+$scope.currentRace.name+"_"+$scope.gender+"_"+i+".jpg"});
        }
        return portraits;
    }
}
