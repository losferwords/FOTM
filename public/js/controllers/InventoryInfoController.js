(function (module) {
    module.controller("InventoryInfoController", InventoryInfoController);

    //Контроллер инвентаря
    function InventoryInfoController($scope, $route, $location, $timeout, mainSocket, randomService, gettextCatalog, currentTeam, characterService) {
        var craftTimer; //Таймер информации о созданном камне
        var disTimer; //Таймер информации о разрушенном камне
        $scope.gemFilter = "all";

        $scope.$on('$routeChangeSuccess', function () {
            $scope.char = currentTeam.get().characters[currentTeam.getCurrentCharIndex()];
            $scope.char.equip = $scope.char.state.equip;
            $scope.char.getParamTooltip = characterService.getParamTooltip;
            $scope.roleColor = characterService.getRoleColor($scope.char.role);
            $scope.inventory = currentTeam.get().inventory;
            $scope.interestingItem = undefined;

            $scope.souls = currentTeam.get().souls;

        });

        $scope.$watch('gemFilter', function(newVal) {
            if(newVal) $scope.gemsArray = $scope.getGems(newVal);
        });

        $scope.$watch('inventory', function(newVal) {
            if(newVal) $scope.gemsArray = $scope.getGems($scope.gemFilter);
        }, true);

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

        //Функция выбирает предмет, чтобы показать информацию о нём
        $scope.chooseSlot = function(slot) {
            if($scope.interestingItem) {
                if ($scope.interestingItem.slot == slot) {
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
            if(socket.gem=="Void") return 'url(../images/assets/svg/view/sprites.svg#inventory--cut-diamond)';
            return socket.gem.image;
        };

        //Функция устанавливает цвет границы для сокета
        $scope.getSocketBorder = function(socket) {
            switch(socket.type){
                case 'red' : return "#cc0000";
                case 'green' : return "#77b300";
                case 'blue' : return "#2a9fd6";
            }
        };

        //Функция возвращает камни нужного цвета для инвентаря
        $scope.getGems = function(color) {
            var gems = [];
            for (var i = 0; i < $scope.inventory.length; i++) {
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
                else if (a.quality > b.quality) {
                    return -1;
                }
                //если качество одинаковое, тогда сортируем просто по цвету
                else {
                    if(a.color > b.color){
                        return -1;
                    }
                    else if(a.color < b.color){
                        return 1;
                    }
                    //если цвет одинаковый, тогда сортируем по названию
                    else {
                        if(a.name > b.name){
                            return 1;
                        }
                        else if(a.name < b.name){
                            return -1;
                        }
                    }
                }
                return 0;
            });

            return gems;
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
            if(gem.name=="Void") return "";

            switch(gem.name){
                case "Soul Of Strength": return gettextCatalog.getString("Strength: + {{one}}",{one: gem.str});
                case "Soul Of Power": return gettextCatalog.getString("Attack Power: + {{one}}%",{one: (gem.attackPower*100).toFixed(2)});
                case "Soul Of Vitality": return gettextCatalog.getString("Health: + {{one}}",{one: gem.maxHealth});
                case "Soul Of Regeneration": return gettextCatalog.getString("Health Reg.: + {{one}}%",{one: (gem.healthReg*100).toFixed(2)});
                case "Soul Of Stone": return gettextCatalog.getString("Physical Resist.: + {{one}}%",{one: (gem.physRes*100).toFixed(2)});
                case "Soul Of Wall": return gettextCatalog.getString("Block Chance: + {{one}}%",{one: (gem.blockChance*100).toFixed(2)});
                case "Soul Of Dexterity": return gettextCatalog.getString("Dexterity: + {{one}}",{one: gem.dxt});
                case "Soul Of Extremum": return gettextCatalog.getString("Critical Rating: + {{one}}%",{one: (gem.critChance*100).toFixed(2)});
                case "Soul Of Energy": return gettextCatalog.getString("Energy: + {{one}}",{one: gem.maxEnergy});
                case "Soul Of Accuracy": return gettextCatalog.getString("Hit Chance: + {{one}}%",{one: (gem.hitChance*100).toFixed(2)});
                case "Soul Of Swiftness": return gettextCatalog.getString("Dodge Chance: + {{one}}%",{one: (gem.dodgeChance*100).toFixed(2)});
                case "Soul Of Destiny": return gettextCatalog.getString("Luck: + {{one}}%",{one: (gem.luck*100).toFixed(2)});
                case "Soul Of Intellect": return gettextCatalog.getString("Intellect: + {{one}}",{one: gem.int});
                case "Soul Of Magic": return gettextCatalog.getString("Spell Power: + {{one}}%",{one: (gem.spellPower*100).toFixed(2)});
                case "Soul Of Wisdom": return gettextCatalog.getString("Mana: + {{one}}",{one: gem.maxMana});
                case "Soul Of Meditation": return gettextCatalog.getString("Mana Reg.: + {{one}}%",{one: (gem.manaReg*100).toFixed(2)});
                case "Soul Of Will": return gettextCatalog.getString("Magic Resist.: + {{one}}%",{one: (gem.magicRes*100).toFixed(2)});
                case "Soul Of Tactic": return gettextCatalog.getString("Initiative: + {{one}}",{one: gem.initiative});
            }
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
            var found = -1;
            for(var i=0;i<$scope.inventory.length;i++){
                if(gem.id==$scope.inventory[i].id) found = i;
            }
            if(found>=0) $scope.inventory.splice(found,1); //временно удаляем его из вкладки
        };

        //Если он никуда не положился
        $scope.inventoryDragEnd = function() {
            if($scope.dragGem) {
                $scope.inventory.push($scope.dragGem); //Помещаем камень обратно в инвентарь
            }
            $scope.dragGem=undefined;
        };

        //Присваиваем сокету камень
        $scope.setGemToSocket = function(socketIndex) {
            var slot = $scope.interestingItem.slot;
            mainSocket.emit('setGemToSocket', currentTeam.get().id, $scope.char.id, slot, socketIndex, $scope.dragGem.id, function(team) {
                currentTeam.set(team);
                $scope.char = currentTeam.get().characters[currentTeam.getCurrentCharIndex()];
                $scope.char.equip = $scope.char.state.equip;
                $scope.char.getParamTooltip = characterService.getParamTooltip;
                $scope.inventory = currentTeam.get().inventory;
                $scope.interestingItem = $scope.char.equip[slot];
            });

            //Предсказание до ответа от сервера
            //Если в сокете есть камень, вернём его в инвентарь
            if($scope.char.equip[slot].sockets[socketIndex].gem!=="Void") {
                $scope.inventory.push($scope.char.equip[slot].sockets[socketIndex].gem);
            }
            $scope.char.equip[slot].sockets[socketIndex].gem = angular.copy($scope.dragGem);
            $scope.dragGem = undefined;
        };

        //Берём камень из сокета
        $scope.socketDragStart = function(socket) {
            $scope.dragSocketGem = socket.gem; //запоминаем перемещаемый камень
            socket.gem="Void";
        };

        //Если он никуда не положился
        $scope.socketDragEnd = function(socket) {
            if($scope.dragSocketGem) {
                socket.gem=$scope.dragSocketGem; //Помещаем камень обратно в сокет
            }
            $scope.dragSocketGem=undefined;
        };

        //Возвращаем камень из сокета в инвентарь
        $scope.setGemToInventory = function() {
            var slot = $scope.interestingItem.slot;
            mainSocket.emit('setGemToInventory', currentTeam.get().id, $scope.char.id, slot, $scope.dragSocketGem.id, function(team) {
                currentTeam.set(team);
                $scope.char = currentTeam.get().characters[currentTeam.getCurrentCharIndex()];
                $scope.char.equip = $scope.char.state.equip;
                $scope.char.getParamTooltip = characterService.getParamTooltip;
                $scope.inventory = currentTeam.get().inventory;
                $scope.interestingItem = $scope.char.equip[slot];
            });

            //Предсказание до ответа от сервера
            $scope.inventory.push($scope.dragSocketGem);
            $scope.dragSocketGem=undefined;
        };

        //Разрушение камня
        $scope.destroyGem = function() {
            mainSocket.emit('destroyGem', currentTeam.get().id, $scope.dragGem, function(newSoul, team) {
                currentTeam.set(team);
                $scope.inventory = currentTeam.get().inventory;
                $scope.souls = currentTeam.get().souls;
                $scope.newSoul = newSoul;

                $timeout.cancel(disTimer);
                disTimer = $timeout(function(){
                    $scope.newSoul=undefined;
                },5000);
            });
            $scope.dragGem = undefined;
        };

        //Создание камня
        $scope.craftGem = function(color) {
            mainSocket.emit('craftGem', currentTeam.get().id, color, function(newGem, team) {
                currentTeam.set(team);
                $scope.inventory = currentTeam.get().inventory;
                $scope.souls = currentTeam.get().souls;
                $scope.newGem = newGem;

                $timeout.cancel(craftTimer);
                craftTimer=$timeout(function(){
                    $scope.newGem=undefined;
                },5000);
            });
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