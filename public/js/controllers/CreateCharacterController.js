(function (module) {
    module.controller("CreateCharacterController", CreateCharacterController);

    //Контроллер создания персонажа
    function CreateCharacterController($scope, $rootScope, $location, mainSocket, characterService, abilityService, randomService, gettextCatalog) {
        $scope.characterObj = {
            _team: "",
            _id: "",
            charName: "",
            gender: "male",
            race: "human",
            role: "random"
        };
        var teamId;

        $scope.activePortrait = {
            value: 0
        };
        $scope.createCharPending = false;

        //Кнопка сохранения персонажа на экране создания персонажа
        $scope.submitCharClick = function() {
            mainSocket.emit("getChar", {charName: $scope.characterObj.charName});
            $scope.createCharPending = true;
        };

        //При нажатии на "отмена" dummy персонаж должен удалиться
        $scope.cancelCharClick = function() {
            if($rootScope.interestingChar){
                $location.path('/city');
            }
            else{
                mainSocket.emit("removeChar", $scope.characterObj._team, $scope.characterObj._id);
                $scope.createCharPending = true;
            }
        };
        mainSocket.on("removeCharResult", function() {
            $location.path('/createTeam');
        });

        //Получаем результаты проверки персонажа
        mainSocket.on("getCharResult", function (char) {
            if(char){
                $scope.changeInfoCSS("error"); //применяем ng-class
                $scope.info=gettextCatalog.getString("Name {{one}} is already in use", {one: $scope.characterObj.charName});
                $scope.createCharPending = false;
            }
            else {
                //Набираем базовые скилы для данной роли
                if($scope.characterObj.role==="random"){
                    if($scope.characterObj.race==="human"){
                        switch (randomService.randomInt(0,7)) {
                            case 0: $scope.characterObj.role="sentinel"; break;
                            case 1: $scope.characterObj.role="slayer"; break;
                            case 2: $scope.characterObj.role="redeemer"; break;
                            case 3: $scope.characterObj.role="ripper"; break;
                            case 4: $scope.characterObj.role="prophet"; break;
                            case 5: $scope.characterObj.role="malefic"; break;
                            case 6: $scope.characterObj.role="cleric"; break;
                            case 7: $scope.characterObj.role="heretic"; break;
                        }
                    }
                    else if($scope.characterObj.race==="nephilim"){
                        switch (randomService.randomInt(0,3)) {
                            case 0: $scope.characterObj.role="sentinel"; break;
                            case 1: $scope.characterObj.role="redeemer"; break;
                            case 2: $scope.characterObj.role="prophet"; break;
                            case 3: $scope.characterObj.role="cleric"; break;
                        }
                    }
                    else {
                        switch (randomService.randomInt(0,3)) {
                            case 0: $scope.characterObj.role="slayer"; break;
                            case 1: $scope.characterObj.role="ripper"; break;
                            case 2: $scope.characterObj.role="malefic"; break;
                            case 3: $scope.characterObj.role="heretic"; break;
                        }
                    }
                }
                updateCharInfo();
                var abilitiesArr = characterService.getStartAbilities($scope.characterObj.role);
                var availableAbilitiesArr = characterService.getBasicAbilities($scope.characterObj.role, $scope.characterObj.race);

                var abilitiesObjectsArr = [];
                for(var i=0;i<abilitiesArr.length;i++){
                    abilitiesObjectsArr.push(abilityService.ability(abilitiesArr[i]));
                }
                mainSocket.emit('setChar', {
                    _id: $scope.characterObj._id,
                    charName: $scope.characterObj.charName,
                    gender: $scope.characterObj.gender,
                    race: $scope.characterObj.race,
                    role: $scope.characterObj.role,
                    portrait: $scope.portraits[$scope.activePortrait.value].image,
                    params: $scope.params,
                    equip: characterService.getEquip($scope.characterObj.role),
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
                $scope.characterObj._id=$rootScope.interestingChar._id;
                $scope.teamSouls=$rootScope.interestingTeam.souls;
                teamId = $rootScope.interestingTeam._id;
            }
            else {
                //Получаем dummy персонажа
                mainSocket.emit("getDummyChar");
            }
        });
        mainSocket.on("getDummyCharResult", function(dummyChar){
            $scope.characterObj._id=dummyChar._id;
            $scope.teamSouls=dummyChar._team.souls;
            teamId = dummyChar._team._id;
        });

        $scope.races=["nephilim","human","cambion"];
        $scope.racePortraitPaths = function(number){
            return {"background-image" : "url(./images/assets/img/portraits/"+$scope.races[number]+"/"+$scope.characterObj.gender+"/"+$scope.races[number]+"_"+$scope.characterObj.gender+"_1.jpg)"};
        };
        $scope.getRaceName=function(name){
            switch (name) {
                case 'nephilim': return gettextCatalog.getString('Nephilim'); break;
                case 'human': return gettextCatalog.getString('Human'); break;
                case 'cambion': return gettextCatalog.getString('Cambion'); break;
            }
        };
        $scope.getRaceBtnClass=function(race){
            if(race==$scope.characterObj.race) return 'btn-success';
            return 'btn-primary'
        };

        $scope.$watch('characterObj.race', function() {
            if($scope.characterObj.race=='cambion'){
                switch($scope.characterObj.role){
                    case 'sentinel': $scope.characterObj.role="slayer"; break;
                    case 'redeemer': $scope.characterObj.role="ripper"; break;
                    case 'prophet':  $scope.characterObj.role="malefic"; break;
                    case 'cleric':   $scope.characterObj.role="heretic"; break;
                }
            }
            else if($scope.characterObj.race=='nephilim'){
                switch($scope.characterObj.role){
                    case 'slayer':   $scope.characterObj.role="sentinel"; break;
                    case 'ripper':   $scope.characterObj.role="redeemer"; break;
                    case 'malefic':  $scope.characterObj.role="prophet"; break;
                    case 'heretic':  $scope.characterObj.role="cleric"; break;
                }
            }

            $scope.portraits = getPortraits();
            updateCharInfo();
        });
        $scope.$watch('characterObj.gender', function() {
            $scope.portraits = getPortraits();
            updateCharInfo();
        },true);
        $scope.$watch('characterObj.role', function() {
            updateCharInfo();
            $scope.roleCost = characterService.getRoleCost($scope.characterObj.role);
        });

        $scope.getRaceInfo = function() {
            return characterService.getRaceinfo($scope.characterObj.race);
        };

        $scope.getRoleInfo = function() {
            return characterService.getRoleinfo($scope.characterObj.role);
        };

        //Функция обновляет информацию о персонаже
        function updateCharInfo(){
            if($scope.characterObj.role!=="random"){
                $scope.params = characterService.getStartParams($scope.characterObj.gender, $scope.characterObj.race, $scope.characterObj.role);
            }
        }

        //Функция динамически загружает портреты
        function getPortraits(){
            var portraits=[];
            for(var i=1;i<=4;i++){
                portraits.push({image: "./images/assets/img/portraits/"+$scope.characterObj.race+"/"+$scope.characterObj.gender+"/"+$scope.characterObj.race+"_"+$scope.characterObj.gender+"_"+i+".jpg"});
            }
            return portraits;
        }
    }
})(angular.module("fotm"));
