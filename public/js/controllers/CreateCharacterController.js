(function (module) {
    module.controller("CreateCharacterController", CreateCharacterController);

    //Контроллер создания персонажа
    function CreateCharacterController($scope, $location, mainSocket, characterService, randomService, gettextCatalog, currentTeam) {
        var defaultGenderIndex = randomService.randomInt(0,1);
        var defaultGender = "";
        switch(defaultGenderIndex) {
            case 0 : defaultGender = "male"; break;
            case 1 : defaultGender = "female"; break;
        }

        var defaultRaceIndex = randomService.randomInt(0,2);
        var defaultRace = "";
        switch(defaultRaceIndex) {
            case 0 : defaultRace = "nephilim"; break;
            case 1 : defaultRace = "human"; break;
            case 2 : defaultRace = "cambion"; break;
        }

        $scope.characterObj = {
            _team: "",
            _id: "",
            charName: "",
            gender: defaultGender,
            race: defaultRace,
            role: "random"
        };
        var teamId;

        $scope.activePortrait = {
            value: randomService.randomInt(0,3)
        };
        $scope.createCharPending = false;

        //Кнопка сохранения персонажа на экране создания персонажа
        $scope.submitCharClick = function() {
            $scope.createCharPending = true;
            mainSocket.emit("checkCharBeforeCreate", {charName: $scope.characterObj.charName}, function(char) {
                if(char){
                    $scope.changeInfoCSS("error"); //применяем ng-class
                    $scope.info=gettextCatalog.getString("Name {{one}} is already in use", {one: $scope.characterObj.charName});
                    $scope.createCharPending = false;
                }
                else {
                    mainSocket.emit('saveNewChar', {
                        _id: $scope.characterObj._id,
                        charName: $scope.characterObj.charName,
                        gender: $scope.characterObj.gender,
                        race: $scope.characterObj.race,
                        role: $scope.characterObj.role,
                        portrait: $scope.portraits[$scope.activePortrait.value].image
                    }, function(changedTeam) {
                        $scope.changeInfoCSS("success"); //применяем ng-class
                        $scope.info=gettextCatalog.getString("Successful");
                        if(currentTeam.get().rating){
                            $location.path('/city');
                        }
                        else{
                            $location.path('/createTeam');
                        }
                    });
                }
            });
        };

        //При нажатии на "отмена" dummy персонаж должен удалиться
        $scope.cancelCharClick = function() {
            //Только у созданной тимы есть рейтинг, проверка на то, куда вернуться
            if(currentTeam.get().rating){
                $location.path('/city');
            }
            else {
                $scope.createCharPending = true;
                mainSocket.emit("removeChar", teamId, $scope.characterObj._id, function() {
                    $location.path('/createTeam');
                });
            }
        };

        $scope.$on('$routeChangeSuccess', function () {
            //Только у созданной тимы есть рейтинг
            if(currentTeam.get().rating){
                //попали сюда из City
                $scope.characterObj._id=currentTeam.get().characters[currentTeam.getCurrentCharIndex()]._id;
                $scope.teamSouls=currentTeam.get().souls;
                teamId = currentTeam.get()._id;
            }
            else {
                //Если не нашли, значит это создание команды
                //Получаем dummy персонажа
                mainSocket.emit("getDummyChar", function(dummyChar) {
                    $scope.characterObj._id=dummyChar._id;
                    $scope.teamSouls=dummyChar._team.souls;
                    teamId = dummyChar._team._id;
                });
            }
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
                mainSocket.emit('getStartParams', $scope.characterObj.gender, $scope.characterObj.race, $scope.characterObj.role, function(params) {
                    $scope.params = params;
                });
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
