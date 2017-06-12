(function (module) {
    module.controller("AbilitiesInfoController", AbilitiesInfoController);
    //Контроллер информации о способностях
    function AbilitiesInfoController($scope, $route, $location, mainSocket, abilityService, gettextCatalog, currentTeam, characterService) {
        $scope.abilityFilter = 'all';
        $scope.abilitiesBook = []; //Массив способностей
        $scope.movingAbility = undefined; //Перемещаемая способность
        $scope.movingAbilityIndex = undefined; //Индекс перемещаемой способностити (если перемещаение между слотами)

        $scope.$on('$routeChangeSuccess', function () {
            $scope.char = currentTeam.get().characters[currentTeam.getCurrentCharIndex()];
            $scope.char.getParamTooltip = characterService.getParamTooltip;
            $scope.char.abilities = abilityService.translateAbilities($scope.char.state.abilities);
            $scope.char.equip = $scope.char.state.equip;
            $scope.populateAbilitiesBook('all');
        });

        function setAbilities() {
            var rawAbilities = [];
            for(var i=0;i<$scope.char.abilities.length;i++){
                rawAbilities.push({name: $scope.char.abilities[i].name, variant: $scope.char.abilities[i].variant})
            }
            mainSocket.emit('setCharAbilities', $scope.char._id, rawAbilities, function(char) {
                $scope.char = char;
                $scope.char.getParamTooltip = characterService.getParamTooltip;
                $scope.char.abilities = abilityService.translateAbilities($scope.char.state.abilities);
                $scope.char.equip = $scope.char.state.equip;
                if($scope.interestingAbility){
                    for(var i=0;i<$scope.char.abilities.length;i++){
                        if($scope.interestingAbility.name==$scope.char.abilities[i].name) {
                            $scope.interestingAbility = $scope.char.abilities[i];
                            break;
                        }
                    }
                }
                currentTeam.setChar($scope.char);
            });
        }

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
            setAbilities();
        };

        //Следующий вариант способности
        $scope.nextVersion = function(){
            $scope.interestingAbility.variant++;
            setAbilities();
        };

        //Функция отбирает способности, доступные для данной роли
        $scope.populateAbilitiesBook = function (filter){
            mainSocket.emit('getAbilities', $scope.char.availableAbilities, function(abilities) {
                $scope.abilitiesBook = [];
                abilities = abilityService.translateAbilities(abilities);
                for(var i=0;i<abilities.length;i++){
                    if(!checkAbilityInDeck(abilities[i].name)){
                        if($scope.movingAbility)
                        {
                            if($scope.movingAbility.name===abilities[i].name) continue;
                        }
                        if(filter==='all') $scope.abilitiesBook.push(abilities[i]);
                        else {
                            if(abilities[i].role===filter){
                                $scope.abilitiesBook.push(abilities[i]);
                            }
                        }
                    }
                }
            });
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
            if(ability.needWeapon) tooltip+=gettextCatalog.getString("<p class='tooltip-need-weapon'>Need weapon</p>");
            else tooltip+=gettextCatalog.getString("<p class='tooltip-spell'>Spell</p>");
            if(ability.range>0) tooltip+=gettextCatalog.getString("<p>Range: {{one}}</p>",{one: ability.range});
            else tooltip+=gettextCatalog.getString("<p>Range: Self</p>");
            tooltip+=gettextCatalog.getString("<p>Cooldown: {{one}}</p>",{one: ability.cooldown});
            if(ability.duration>0) tooltip+=gettextCatalog.getString("<p>Duration: {{one}}</p>",{one: ability.duration});
            tooltip+=gettextCatalog.getString("<p>Energy Cost: {{one}}</p>",{one: ability.energyCost});
            tooltip+=gettextCatalog.getString("<p>Mana Cost: {{one}}</p>",{one: ability.manaCost});
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
            setAbilities();
        };

        $scope.removeAbilityFromPanel = function() {
            $scope.populateAbilitiesBook($scope.abilityFilter);
            $scope.movingAbility=undefined;
            $scope.movingAbilityIndex = undefined;
            setAbilities();
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
                if(ability.role=="void"){
                    return "#cccccc";
                }
                else {
                    return characterService.getRoleColor(ability.role);
                }
            }
            else {
                return '#000';
            }
        };

        $scope.getRoleColor = function(role) {
            return characterService.getRoleColor(role);
        }
    }
})(angular.module("fotm"));