angular.module('fotm').register.controller("InventoryInfoController", ["$scope", '$rootScope', '$route', '$location', '$timeout', 'mainSocket', 'character', 'randomService', 'gettextCatalog', InventoryInfoController]);

//Контроллер инвентаря
function InventoryInfoController($scope, $rootScope, $route, $location, $timeout, mainSocket, character, randomService, gettextCatalog) {
    var craftTimer; //Таймер информации о созданном камне
    var disTimer; //Таймер информации о разрушенном камне
    $scope.gemFilter = "all";

    $scope.$on('$routeChangeSuccess', function () {
        $scope.char = new character($rootScope.interestingChar);
        $scope.char.initChar();
        $scope.inventory = $rootScope.interestingTeam.inventory;
        $scope.souls = $rootScope.interestingTeam.souls;
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

    //Функция берёт картинку для ылотов инвентаря
    $scope.getSlotImage = function(slot) {
        if($scope.char.equip[slot].name!="Void") return $scope.char.equip[slot].image;
    };

    //Функция выбирает предмет, чтобы показать информацию о нём
    $scope.chooseSlot = function(slot) {
        if($scope.interestingItem) {
            if ($scope.interestingItem.slot === slot) {
                $scope.interestingItem = undefined;
                return;
            }
        }
        $scope.interestingItem = $scope.char.equip[slot];
    };

    //Функция форматирует имена слотов для хорошего вывода
    $scope.formatSlotName = function(slot) {
        switch (slot) {
            case "head" : return gettextCatalog.getString('Head');break;
            case "chest" : return gettextCatalog.getString('Chest');break;
            case "hands" : return gettextCatalog.getString('Hands');break;
            case "legs" : return gettextCatalog.getString('Legs');break;
            case "boots" : return gettextCatalog.getString('Boots');break;
            case "amulet" : return gettextCatalog.getString('Amulet');break;
            case "leftRing" : return gettextCatalog.getString('Left ring');break;
            case "rightRing" : return gettextCatalog.getString('Right ring');break;
            case "mainHandWeapon" : return gettextCatalog.getString('Right hand weapon');break;
            case "offHandWeapon" : return gettextCatalog.getString('Left hand weapon');break;
        }
    };

    //Функция форматирует имена предметов для хорошего вывода
    $scope.formatItemName = function(item) {
        switch (item) {
            case "Plate Helmet" : return gettextCatalog.getString('Plate Helmet');break;
            case "Breastplate" : return gettextCatalog.getString('Breastplate');break;
            case "Plate gloves" : return gettextCatalog.getString('Plate gloves');break;
            case "Plate greaves" : return gettextCatalog.getString('Plate greaves');break;
            case "Plate sabatons" : return gettextCatalog.getString('Plate sabatons');break;
            case "Leather hood" : return gettextCatalog.getString('Leather hood');break;
            case "Leather vest" : return gettextCatalog.getString('Leather vest');break;
            case "Leather gloves" : return gettextCatalog.getString('Leather gloves');break;
            case "Leather pants" : return gettextCatalog.getString('Leather pants');break;
            case "Leather boots" : return gettextCatalog.getString('Leather boots');break;
            case "Leather cloak" : return gettextCatalog.getString('Leather cloak');break;
            case "Cloth Hat" : return gettextCatalog.getString('Cloth Hat');break;
            case "Cloth robe" : return gettextCatalog.getString('Cloth robe');break;
            case "Cloth gloves" : return gettextCatalog.getString('Cloth gloves');break;
            case "Cloth pants" : return gettextCatalog.getString('Cloth pants');break;
            case "Cloth boots" : return gettextCatalog.getString('Cloth boots');break;
            case "Cloth mask" : return gettextCatalog.getString('Cloth mask');break;
            case "Cleric crown" : return gettextCatalog.getString('Cleric crown');break;
            case "Mail plastron" : return gettextCatalog.getString('Mail plastron');break;
            case "Mail gloves" : return gettextCatalog.getString('Mail gloves');break;
            case "Mail pants" : return gettextCatalog.getString('Mail pants');break;
            case "Mail boots" : return gettextCatalog.getString('Mail boots');break;
            case "Heretic crown" : return gettextCatalog.getString('Heretic crown');break;
            case "Rib armor" : return gettextCatalog.getString('Rib armor');break;

            case "Seraph Spear" : return gettextCatalog.getString('Seraph Spear');break;
            case "Sentinel Shield" : return gettextCatalog.getString('Sentinel Shield');break;
            case "Abaddon Blade" : return gettextCatalog.getString('Abaddon Blade');break;
            case "Best Faith Gun" : return gettextCatalog.getString('Best Faith Gun');break;
            case "Tormentor Dagger" : return gettextCatalog.getString('Tormentor Dagger');break;
            case "Slaughter Dagger" : return gettextCatalog.getString('Slaughter Dagger');break;
            case "Clairvoyant Wand" : return gettextCatalog.getString('Clairvoyant Wand');break;
            case "Book Of Souls" : return gettextCatalog.getString('Book Of Souls');break;
            case "Zaqqum Branch" : return gettextCatalog.getString('Zaqqum Branch');break;
            case "Malleus Maleficarum" : return gettextCatalog.getString('Malleus Maleficarum');break;
            case "Salvation Crucifix" : return gettextCatalog.getString('Salvation Crucifix');break;
            case "Incubus Dagger" : return gettextCatalog.getString('Incubus Dagger');break;
            case "Succubus Shield" : return gettextCatalog.getString('Succubus Shield');break;

            case "Ring" : return gettextCatalog.getString('Ring');break;
            case "Amulet" : return gettextCatalog.getString('Amulet');break;
        }
    };

    //Функция вычисляет отступ для 3 или 6 сокетов
    $scope.checkSocketCount = function() {
        if($scope.interestingItem) {
            if ($scope.interestingItem.sockets.length > 3) return 'six';
        }
        return '';
    };

    //Функция устанавливает картинку для сокета
    $scope.getSocketImage = function(socket) {
        if(socket.gem=="Void") return 'url(../images/icons/inventory/cut-diamond.svg)';
        return socket.gem.image;
    };

    //Функция возвращает камни нужного цвета для инвентаря
    $scope.getGems = function(color) {
        var gems = [];
        for (var i = 0; i < $scope.inventory.length; i++) {
            $scope.inventory[i].index=i;
            if(color!='all'){
                if ($scope.inventory[i].color == color) {
                    gems.push($scope.inventory[i]);
                }
            }
            else {
                gems.push($scope.inventory[i]);
            }
        }

        gems.sort(function (a, b) {
            if (a.quality < b.quality) {
                return 1;
            }
            if (a.quality > b.quality) {
                return -1;
            }
            //если качество одинаковое, тогда сортируем просто по цвету
            if (a.quality == b.quality) {
                if(a.color > b.color){
                    return -1;
                }
                else {
                    return 1;
                }
            }
            return 0;
        });

        return gems;
    };

    //Функция создаёт случайный камень
    $scope.addGem = function() {
        for(var i=0;i<10;i++) {
            $scope.inventory.push(randomizeTopGem());
        }
        $scope.getGems($scope.gemFilter);
    };

    //Функция формирует подсказку для камней
    $scope.getGemTooltip = function(gem) {
        if(gem) {
            return "<h6 class='text-left'>"+transformName(gem)+"</h6>"+
                "<p class='text-left'>"+transformTooltip(gem)+"</p>"+
                "<p class='text-left'>"+transformQuality(gem)+"</p>";
        }
    };

    function transformName (gem) {
        switch(gem.name){
            case "Soul Of Strength": return gettextCatalog.getString("Soul Of Strength");
            case "Soul Of Power": return gettextCatalog.getString("Soul Of Power");
            case "Soul Of Vitality": return gettextCatalog.getString("Soul Of Vitality");
            case "Soul Of Regeneration": return gettextCatalog.getString("Soul Of Regeneration");
            case "Soul Of Stone": return gettextCatalog.getString("Soul Of Stone");
            case "Soul Of Wall": return gettextCatalog.getString("Soul Of Wall");
            case "Soul Of Dexterity": return gettextCatalog.getString("Soul Of Dexterity");
            case "Soul Of Extremum": return gettextCatalog.getString("Soul Of Extremum");
            case "Soul Of Energy": return gettextCatalog.getString("Soul Of Energy");
            case "Soul Of Accuracy": return gettextCatalog.getString("Soul Of Accuracy");
            case "Soul Of Swiftness": return gettextCatalog.getString("Soul Of Swiftness");
            case "Soul Of Destiny": return gettextCatalog.getString("Soul Of Destiny");
            case "Soul Of Intellect": return gettextCatalog.getString("Soul Of Intellect");
            case "Soul Of Magic": return gettextCatalog.getString("Soul Of Magic");
            case "Soul Of Wisdom": return gettextCatalog.getString("Soul Of Wisdom");
            case "Soul Of Meditation": return gettextCatalog.getString("Soul Of Meditation");
            case "Soul Of Will": return gettextCatalog.getString("Soul Of Will");
            case "Soul Of Tactic": return gettextCatalog.getString("Soul Of Tactic");
        }
        return gem.name;
    }

    function transformTooltip(gem) {
        if(gem.tootip.indexOf("Strength:")!=-1) return gem.tootip.replace("Strength:",gettextCatalog.getString("Strength:"));
        else if(gem.tootip.indexOf("Attack Power:")!=-1) return gem.tootip.replace("Attack Power:",gettextCatalog.getString("Attack Power:"));
        else if(gem.tootip.indexOf("Health:")!=-1) return gem.tootip.replace("Health:",gettextCatalog.getString("Health:"));
        else if(gem.tootip.indexOf("Health Reg.:")!=-1) return gem.tootip.replace("Health Reg.:",gettextCatalog.getString("Health Reg.:"));
        else if(gem.tootip.indexOf("Physical Resist.:")!=-1) return gem.tootip.replace("Physical Resist.:",gettextCatalog.getString("Physical Resist.:"));
        else if(gem.tootip.indexOf("Block Chance:")!=-1) return gem.tootip.replace("Block Chance:",gettextCatalog.getString("Block Chance:"));
        else if(gem.tootip.indexOf("Dexterity:")!=-1) return gem.tootip.replace("Dexterity:",gettextCatalog.getString("Dexterity:"));
        else if(gem.tootip.indexOf("Critical Rating:")!=-1) return gem.tootip.replace("Critical Rating:",gettextCatalog.getString("Critical Rating:"));
        else if(gem.tootip.indexOf("Energy:")!=-1) return gem.tootip.replace("Energy:",gettextCatalog.getString("Energy:"));
        else if(gem.tootip.indexOf("Hit Chance:")!=-1) return gem.tootip.replace("Hit Chance:",gettextCatalog.getString("Hit Chance:"));
        else if(gem.tootip.indexOf("Dodge Chance:")!=-1) return gem.tootip.replace("Dodge Chance:",gettextCatalog.getString("Dodge Chance:"));
        else if(gem.tootip.indexOf("Luck:")!=-1) return gem.tootip.replace("Luck:",gettextCatalog.getString("Luck:"));
        else if(gem.tootip.indexOf("Intellect:")!=-1) return gem.tootip.replace("Intellect:",gettextCatalog.getString("Intellect:"));
        else if(gem.tootip.indexOf("Spell Power:")!=-1) return gem.tootip.replace("Spell Power:",gettextCatalog.getString("Spell Power:"));
        else if(gem.tootip.indexOf("Mana:")!=-1) return gem.tootip.replace("Mana:",gettextCatalog.getString("Mana:"));
        else if(gem.tootip.indexOf("Mana Reg.:")!=-1) return gem.tootip.replace("Mana Reg.:",gettextCatalog.getString("Mana Reg.:"));
        else if(gem.tootip.indexOf("Magic Resist.:")!=-1) return gem.tootip.replace("Magic Resist.:",gettextCatalog.getString("Magic Resist.:"));
        else if(gem.tootip.indexOf("Initiative:")!=-1) return gem.tootip.replace("Initiative:",gettextCatalog.getString("Initiative:"));
    }

    function transformQuality(gem) {
        return gettextCatalog.getString("Quality: {{one}}%",{one: (gem.quality * 100).toFixed(0)});
    }

    //Функция формирует подсказки для крафта
    $scope.getCraftTooltip = function(color) {
        switch(color) {
            case 'any' : return gettextCatalog.getString("<p>Create random soul gem</p><p>Cost:</p><p>1 red shard</p><p>1 green shard</p><p>1 blue shard</p>"); break;
            case 'red' : return gettextCatalog.getString("<p>Create red soul gem</p><p>Cost: 4 red shards</p>"); break;
            case 'green' : return gettextCatalog.getString("<p>Create green soul gem</p><p>Cost: 4 green shards</p>"); break;
            case 'blue' : return gettextCatalog.getString("<p>Create blue soul gem</p><p>Cost: 4 blue shards</p>"); break;
        }
    };

    //Взяли камень из инвентаря
    $scope.inventoryDragStart = function(gem) {
        $scope.dragGem = gem; //запоминаем перемещаемый камень
        $scope.inventory.splice(gem.index,1); //временно удаляем его из вкладки
    };

    //Если он никуда не положился
    $scope.inventoryDragEnd = function() {
        if($scope.dragGem) {
            $scope.inventory.push($scope.dragGem); //Помещаем камень обратно в инвентарь
        }
        $scope.dragGem=undefined;
    };

    //Присваиваем сокету камень
    $scope.setGemToSocket = function(socket) {
        //Если в сокете есть камень, вернём его в инвентарь
        if(socket.gem!=="Void") {
            $scope.inventory.push(socket.gem);
        }
        socket.gem = $scope.dragGem;
        $scope.dragGem = undefined;
        $scope.interestingItem = $scope.char.calcItem($scope.interestingItem);
        $scope.char.initChar();
        mainSocket.emit('setChar', {_id: $scope.char._id, equip: $scope.char.equip});
        mainSocket.emit('setTeam', {_id: $rootScope.interestingTeam._id, inventory: $scope.inventory});
    };

    //Берём камень из сокета
    $scope.socketDragStart = function(socket) {
        $scope.dragSocketGem = socket.gem; //запоминаем перемещаемый камень
        socket.gem="Void";
        $scope.interestingItem = $scope.char.calcItem($scope.interestingItem);
        $scope.char.initChar();
    };

    //Если он никуда не положился
    $scope.socketDragEnd = function(socket) {
        if($scope.dragSocketGem) {
            socket.gem=$scope.dragSocketGem; //Помещаем камень обратно в сокет
        }
        $scope.dragSocketGem=undefined;
        $scope.interestingItem = $scope.char.calcItem($scope.interestingItem);
        $scope.char.initChar();
    };

    //Возвращаем камень из сокета в инвентарь
    $scope.setGemToInventory = function(socket) {
        $scope.inventory.push($scope.dragSocketGem);
        $scope.dragSocketGem=undefined;
        mainSocket.emit('setChar', {_id: $scope.char._id, equip: $scope.char.equip});
        mainSocket.emit('setTeam', {_id: $rootScope.interestingTeam._id, inventory: $scope.inventory});
    };

    //Разрушение камня
    $scope.destroyGem = function() {
        var delta;
        $scope.newSoul = {};
        var rand =Math.floor(Math.random() * 6);
        if(rand<=2) {
            delta=2;
        }
        else if(rand>2 && rand<=4) {
            delta=3;
        }
        else {
            delta=4
        }
        $scope.souls[$scope.dragGem.color]+=delta;
        $scope.newSoul.delta=delta;

        switch($scope.dragGem.color){
            case 'red': $scope.newSoul.image = 'url(../images/icons/inventory/crystal-shine-red.svg)';break;
            case 'green': $scope.newSoul.image = 'url(../images/icons/inventory/crystal-shine-green.svg)';break;
            case 'blue': $scope.newSoul.image = 'url(../images/icons/inventory/crystal-shine-blue.svg)';break;
        }

        $scope.dragGem=undefined;

        mainSocket.emit('setTeam', {_id: $rootScope.interestingTeam._id, inventory: $scope.inventory, souls: $scope.souls});

        $timeout.cancel(disTimer);
        disTimer = $timeout(function(){
            $scope.newSoul=undefined;
        },5000);
    };

    //Создание камня
    $scope.craftGem = function(color) {
        $scope.newGem = {};
        var gem;
        if(color) $scope.souls[color]-=4;
        else {
            $scope.souls.red--;
            $scope.souls.green--;
            $scope.souls.blue--;
        }
        gem = randomizeGem(color);
        $scope.newGem = gem;
        $scope.inventory.push(gem);

        mainSocket.emit('setTeam', {_id: $rootScope.interestingTeam._id, inventory: $scope.inventory, souls: $scope.souls});

        $timeout.cancel(craftTimer);
        craftTimer=$timeout(function(){
            $scope.newGem=undefined;
        },5000);
    };

    //Функция переносит нас в окно навыков
    $scope.abilitiesClick = function(){
        $location.path('/abilitiesInfo');
    };

    //Функция переносит нас в окно персонажа
    $scope.characterClick = function(){
        $location.path('/charInfo');
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

    //Функция создаёт случайный камень
    function randomizeGem(color){
        var newGem = {};
        if(color){
            newGem.color=color;
        }
        else {
            switch(Math.floor(Math.random() * 3)){
                case 0: newGem.color='red';break;
                case 1: newGem.color='green';break;
                case 2: newGem.color='blue';break;
            }
        }

        switch(newGem.color){
            case 'red':
            newGem.image = 'url(../images/icons/inventory/rupee.svg)';
            newGem.bgColor="#cc0000";
            switch(Math.floor(Math.random() * 6)){
                case 0:
                    newGem.str=randomService.randomInt(5, 10);
                    newGem.quality=newGem.str/10;
                    newGem.name="Soul Of Strength";
                    newGem.tootip="Strength: + "+newGem.str;
                    break;
                case 1:
                    newGem.attackPower=randomService.randomFloat(0.025, 0.05, 4);
                    newGem.quality=newGem.attackPower/0.05;
                    newGem.name="Soul Of Power";
                    newGem.tootip="Attack Power: + "+(newGem.attackPower*100).toFixed(2)+"%";
                    break;
                case 2:
                    newGem.maxHealth=randomService.randomInt(250, 500);
                    newGem.quality=newGem.maxHealth/500;
                    newGem.name="Soul Of Vitality";
                    newGem.tootip="Health: + "+newGem.maxHealth;
                    break;
                case 3:
                    newGem.healthReg=randomService.randomFloat(0.001, 0.002, 4);
                    newGem.quality=newGem.healthReg/0.002;
                    newGem.name="Soul Of Regeneration";
                    newGem.tootip="Health Reg.: + "+(newGem.healthReg*100).toFixed(2)+"%";
                    break;
                case 4:
                    newGem.physRes=randomService.randomFloat(0.0075, 0.015, 4);
                    newGem.quality=newGem.physRes/0.015;
                    newGem.name="Soul Of Stone";
                    newGem.tootip="Physical Resist.: + "+(newGem.physRes*100).toFixed(2)+"%";
                    break;
                case 5:
                    newGem.blockChance=randomService.randomFloat(0.00625, 0.0125, 4);
                    newGem.quality=newGem.blockChance/0.0125;
                    newGem.name="Soul Of Wall";
                    newGem.tootip="Block Chance: + "+(newGem.blockChance*100).toFixed(2)+"%";
                    break;
            }
            break;
            case 'green':
                newGem.image = 'url(../images/icons/inventory/emerald.svg)';
                newGem.bgColor="#77b300";
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.dxt=randomService.randomInt(5, 10);
                        newGem.quality=newGem.dxt/10;
                        newGem.name="Soul Of Dexterity";
                        newGem.tootip="Dexterity: + "+newGem.dxt;
                        break;
                    case 1:
                        newGem.critChance=randomService.randomFloat(0.00625, 0.0125, 4);
                        newGem.quality=newGem.critChance/0.0125;
                        newGem.name="Soul Of Extremum";
                        newGem.tootip="Critical Rating: + "+(newGem.critChance*100).toFixed(2)+"%";
                        break;
                    case 2:
                        newGem.maxEnergy=randomService.randomInt(25, 50);
                        newGem.quality=newGem.maxEnergy/100;
                        newGem.name="Soul Of Energy";
                        newGem.tootip="Energy: + "+newGem.maxEnergy;
                        break;
                    case 3:
                        newGem.hitChance=randomService.randomFloat(0.0125, 0.025, 4);
                        newGem.quality=newGem.hitChance/0.025;
                        newGem.name="Soul Of Accuracy";
                        newGem.tootip="Hit Chance: + "+(newGem.hitChance*100).toFixed(2)+"%";
                        break;
                    case 4:
                        newGem.dodgeChance=randomService.randomFloat(0.0075, 0.015, 4);
                        newGem.quality=newGem.dodgeChance/0.015;
                        newGem.name="Soul Of Swiftness";
                        newGem.tootip="Dodge Chance: + "+(newGem.dodgeChance*100).toFixed(2)+"%";
                        break;
                    case 5:
                        newGem.luck=randomService.randomFloat(0.00625, 0.0125, 4);
                        newGem.quality=newGem.luck/0.0125;
                        newGem.name="Soul Of Destiny";
                        newGem.tootip="Luck: + "+(newGem.luck*100).toFixed(2)+"%";
                        break;
                }
                break;
            case 'blue':
                newGem.image = 'url(../images/icons/inventory/saphir.svg)';
                newGem.bgColor="#2a9fd6";
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.int=randomService.randomInt(5, 10);
                        newGem.quality=newGem.int/10;
                        newGem.name="Soul Of Intellect";
                        newGem.tootip="Intellect: + "+newGem.int;
                        break;
                    case 1:
                        newGem.spellPower=randomService.randomFloat(0.025, 0.05, 4);
                        newGem.quality=newGem.spellPower/0.05;
                        newGem.name="Soul Of Magic";
                        newGem.tootip="Spell Power: + "+(newGem.spellPower*100).toFixed(2)+"%";
                        break;
                    case 2:
                        newGem.maxMana=randomService.randomInt(200, 400);
                        newGem.quality=newGem.maxMana/400;
                        newGem.name="Soul Of Wisdom";
                        newGem.tootip="Mana: + "+newGem.maxMana;
                        break;
                    case 3:
                        newGem.manaReg=randomService.randomFloat(0.00125, 0.0025, 4);
                        newGem.quality=newGem.manaReg/0.0025;
                        newGem.name="Soul Of Meditation";
                        newGem.tootip="Mana Reg.: + "+(newGem.manaReg*100).toFixed(2)+"%";
                        break;
                    case 4:
                        newGem.magicRes=randomService.randomFloat(0.0075, 0.015, 4);
                        newGem.quality=newGem.magicRes/0.015;
                        newGem.name="Soul Of Will";
                        newGem.tootip="Magic Resist.: + "+(newGem.magicRes*100).toFixed(2)+"%";
                        break;
                    case 5:
                        newGem.initiative=randomService.randomInt(9, 17);
                        newGem.quality=newGem.initiative/17;
                        newGem.name="Soul Of Tactic";
                        newGem.tootip="Initiative: + "+newGem.initiative;
                        break;
                }
                break;
        }

        return newGem;
    }

    //Функция создаёт случайный топовый камень
    function randomizeTopGem(color){
        var newGem = {};
        if(color){
            newGem.color=color;
        }
        else {
            switch(Math.floor(Math.random() * 3)){
                case 0: newGem.color='red';break;
                case 1: newGem.color='green';break;
                case 2: newGem.color='blue';break;
            }
        }

        switch(newGem.color){
            case 'red':
                newGem.image = 'url(../images/icons/inventory/rupee.svg)';
                newGem.bgColor="#cc0000";
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.str=10;
                        newGem.quality=newGem.str/10;
                        newGem.name="Soul Of Strength";
                        newGem.tootip="Strength: + "+newGem.str;
                        break;
                    case 1:
                        newGem.attackPower=0.05;
                        newGem.quality=newGem.attackPower/0.05;
                        newGem.name="Soul Of Power";
                        newGem.tootip="Attack Power: + "+(newGem.attackPower*100).toFixed(2)+"%";
                        break;
                    case 2:
                        newGem.maxHealth=500;
                        newGem.quality=newGem.maxHealth/500;
                        newGem.name="Soul Of Vitality";
                        newGem.tootip="Health: + "+newGem.maxHealth;
                        break;
                    case 3:
                        newGem.healthReg=0.002;
                        newGem.quality=newGem.healthReg/0.002;
                        newGem.name="Soul Of Regeneration";
                        newGem.tootip="Health Reg.: + "+(newGem.healthReg*100).toFixed(2)+"%";
                        break;
                    case 4:
                        newGem.physRes=0.015;
                        newGem.quality=newGem.physRes/0.015;
                        newGem.name="Soul Of Stone";
                        newGem.tootip="Physical Resist.: + "+(newGem.physRes*100).toFixed(2)+"%";
                        break;
                    case 5:
                        newGem.blockChance=0.0125;
                        newGem.quality=newGem.blockChance/0.0125;
                        newGem.name="Soul Of Wall";
                        newGem.tootip="Block Chance: + "+(newGem.blockChance*100).toFixed(2)+"%";
                        break;
                }
                break;
            case 'green':
                newGem.image = 'url(../images/icons/inventory/emerald.svg)';
                newGem.bgColor="#77b300";
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.dxt=10;
                        newGem.quality=newGem.dxt/10;
                        newGem.name="Soul Of Dexterity";
                        newGem.tootip="Dexterity: + "+newGem.dxt;
                        break;
                    case 1:
                        newGem.critChance=0.0125;
                        newGem.quality=newGem.critChance/0.0125;
                        newGem.name="Soul Of Extremum";
                        newGem.tootip="Critical Rating: + "+(newGem.critChance*100).toFixed(2)+"%";
                        break;
                    case 2:
                        newGem.maxEnergy=50;
                        newGem.quality=newGem.maxEnergy/100;
                        newGem.name="Soul Of Energy";
                        newGem.tootip="Energy: + "+newGem.maxEnergy;
                        break;
                    case 3:
                        newGem.hitChance=0.025;
                        newGem.quality=newGem.hitChance/0.025;
                        newGem.name="Soul Of Accuracy";
                        newGem.tootip="Hit Chance: + "+(newGem.hitChance*100).toFixed(2)+"%";
                        break;
                    case 4:
                        newGem.dodgeChance=0.015;
                        newGem.quality=newGem.dodgeChance/0.015;
                        newGem.name="Soul Of Swiftness";
                        newGem.tootip="Dodge Chance: + "+(newGem.dodgeChance*100).toFixed(2)+"%";
                        break;
                    case 5:
                        newGem.luck=0.0125;
                        newGem.quality=newGem.luck/0.0125;
                        newGem.name="Soul Of Destiny";
                        newGem.tootip="Luck: + "+(newGem.luck*100).toFixed(2)+"%";
                        break;
                }
                break;
            case 'blue':
                newGem.image = 'url(../images/icons/inventory/saphir.svg)';
                newGem.bgColor="#2a9fd6";
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.int=10;
                        newGem.quality=newGem.int/10;
                        newGem.name="Soul Of Intellect";
                        newGem.tootip="Intellect: + "+newGem.int;
                        break;
                    case 1:
                        newGem.spellPower=0.05;
                        newGem.quality=newGem.spellPower/0.05;
                        newGem.name="Soul Of Magic";
                        newGem.tootip="Spell Power: + "+(newGem.spellPower*100).toFixed(2)+"%";
                        break;
                    case 2:
                        newGem.maxMana=400;
                        newGem.quality=newGem.maxMana/400;
                        newGem.name="Soul Of Wisdom";
                        newGem.tootip="Mana: + "+newGem.maxMana;
                        break;
                    case 3:
                        newGem.manaReg=0.0025;
                        newGem.quality=newGem.manaReg/0.0025;
                        newGem.name="Soul Of Meditation";
                        newGem.tootip="Mana Reg.: + "+(newGem.manaReg*100).toFixed(2)+"%";
                        break;
                    case 4:
                        newGem.magicRes=0.015;
                        newGem.quality=newGem.magicRes/0.015;
                        newGem.name="Soul Of Will";
                        newGem.tootip="Magic Resist.: + "+(newGem.magicRes*100).toFixed(2)+"%";
                        break;
                    case 5:
                        newGem.initiative=17;
                        newGem.quality=newGem.initiative/17;
                        newGem.name="Soul Of Tactic";
                        newGem.tootip="Initiative: + "+newGem.initiative;
                        break;
                }
                break;
        }

        return newGem;
    }
}