(function (module) {
    module.controller("AbilitiesInfoController", AbilitiesInfoController);
    //Контроллер информации о способностях
    function AbilitiesInfoController($scope, $rootScope, $route, $location, mainSocket, character, abilityService, gettextCatalog) {
    $scope.abilityFilter = 'all';
    $scope.abilitiesBook = []; //Массив способностей
    $scope.movingAbility = undefined; //Перемещаемая способность
    $scope.movingAbilityIndex = undefined; //Индекс перемещаемой способностити (если перемещаение между слотами)

    $scope.$on('$routeChangeSuccess', function () {
        $scope.char = new character($rootScope.interestingChar);
        $scope.char.initChar();
        $scope.populateAbilitiesBook('all');
    });

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

    $scope.changeTuneAbilitiesMode = function() {
        if($scope.tuneMode) $scope.tuneMode=false;
        else $scope.tuneMode = true;
    };

    //Выбор способности для настройки
    $scope.chooseAbilityForTune = function(ability){
        if(!$scope.tuneMode) return;
        if($scope.interestingAbility) {
            if (ability.name === $scope.interestingAbility.name) {
                $scope.interestingAbility = undefined;
                return;
            }
        }
        $scope.interestingAbility = ability;
    };

    //Предидущий вариант способности
    $scope.prevVersion = function(){
        $scope.interestingAbility.variant--;
        mainSocket.emit('setChar', {_id: $scope.char._id, abilities: $scope.char.abilities});
    };

    //Следующий вариант способности
    $scope.nextVersion = function(){
        $scope.interestingAbility.variant++;
        mainSocket.emit('setChar', {_id: $scope.char._id, abilities: $scope.char.abilities});
    };

    //Функция отбирает способности, доступные для данной роли
    $scope.populateAbilitiesBook = function (filter){
        $scope.abilitiesBook = [];
        var abilityNames = $scope.char.availableAbilities;
        for(var i=0;i<abilityNames.length;i++){
            if(!checkAbilityInDeck(abilityNames[i])){
                if($scope.movingAbility)
                {
                    if($scope.movingAbility.name===abilityNames[i]) continue;
                }
                if(filter==='all') $scope.abilitiesBook.push(new abilityService.ability(abilityNames[i]));
                else {
                    var ability = new abilityService.ability(abilityNames[i]);
                    if(ability.role()===filter){
                        $scope.abilitiesBook.push(ability);
                    }
                }
            }

        }
    };

    //Функция проверяет, есть ли такая способность в активных слотах
    function checkAbilityInDeck(abilityName){
        for(var j=0;j<$scope.char.abilities.length;j++){
            if(abilityName===$scope.char.abilities[j].name) {
                return true;
            }
        }
    }

    //Функция формирует подсказку для способности
    $scope.getAbilityTooltip = function(ability){
        if(!ability || ability.name==="Void") return;
        var tooltip = "";
        tooltip+="<p class='name'>"+ability.localName()+" "+ability.variant+"</p>";
        tooltip+="<p class='desc'>"+ability.desc()+"</p>";
        if(ability.needWeapon()) tooltip+=gettextCatalog.getString("<p class='tooltip-need-weapon'>Need weapon</p>");
        else tooltip+=gettextCatalog.getString("<p class='tooltip-spell'>Spell</p>");
        if(ability.range()>0) tooltip+=gettextCatalog.getString("<p>Range: {{one}}</p>",{one: ability.range()});
        else tooltip+=gettextCatalog.getString("<p>Range: Self</p>");
        tooltip+=gettextCatalog.getString("<p>Cooldown: {{one}}</p>",{one: ability.cooldown()});
        if(ability.duration()>0) tooltip+=gettextCatalog.getString("<p>Duration: {{one}}</p>",{one: ability.duration()});
        tooltip+=gettextCatalog.getString("<p>Energy Cost: {{one}}</p>",{one: ability.energyCost()});
        tooltip+=gettextCatalog.getString("<p>Mana Cost: {{one}}</p>",{one: ability.manaCost()});
        return tooltip;
    };

    //Начинаем перетаскивать способность
    $scope.abilityDragStart = function(ability, type, index) {
        $scope.interestingAbility = undefined;
        $scope.movingAbility = ability;
        $scope.populateAbilitiesBook($scope.abilityFilter);
        if(type==='slot') {
            $scope.movingAbilityIndex = index;
            $scope.char.abilities[index]=new abilityService.ability('Void');
        }
    };

    //Если она никуда не применилась
    $scope.abilityDragEnd = function(type, index) {
        if($scope.movingAbility && type==='slot'){
            $scope.char.abilities[index]=$scope.movingAbility;
        }
        $scope.movingAbility=undefined;
        $scope.populateAbilitiesBook($scope.abilityFilter);
    };

    $scope.addAbilityToPanel = function(index) {
        if($scope.tuneMode) return;
        if($scope.movingAbilityIndex!==undefined) {
            $scope.char.abilities[$scope.movingAbilityIndex]=$scope.char.abilities[index];
            $scope.movingAbilityIndex = undefined;
        }
        $scope.char.abilities[index]=$scope.movingAbility;
        $scope.populateAbilitiesBook($scope.abilityFilter);
        $scope.movingAbility=undefined;
        mainSocket.emit('setChar', {_id: $scope.char._id, abilities: $scope.char.abilities});
    };

    $scope.removeAbilityFromPanel = function() {
        $scope.populateAbilitiesBook($scope.abilityFilter);
        $scope.movingAbility=undefined;
        $scope.movingAbilityIndex = undefined;
        mainSocket.emit('setChar', {_id: $scope.char._id, abilities: $scope.char.abilities});
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

    //Функция переносит нас в окно персонажа
    $scope.charClick = function(){
        $location.path('/charInfo');
    };

    //Функция переносит нас в окно инвентаря
    $scope.inventoryClick = function(){
        $location.path('/inventoryInfo');
    };

    //Функция отменяет изменения персонажа
    $scope.exitClick = function(){
        $location.path('/city');
    };

    //Функция выбирает цвет для способности по её роли
    $scope.getAbilityColor = function(ability) {
        if(ability) {
            switch (ability.role()) {
                case "void":
                    return "#cccccc";
                    break;
                case "sentinel":
                    return "#f7f7f7";
                    break;
                case "slayer":
                    return "#ff0906";
                    break;
                case "redeemer":
                    return "#0055AF";
                    break;
                case "ripper":
                    return "#61dd45";
                    break;
                case "prophet":
                    return "#00b3ee";
                    break;
                case "malefic":
                    return "#f05800";
                    break;
                case "cleric":
                    return "#ffc520";
                    break;
                case "heretic":
                    return "#862197";
                    break;
            }
        }
        else {
            return '#000';
        }
    }
}
})(angular.module("fotm"));