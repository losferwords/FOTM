(function (module) {
    module.controller("AdminController", AdminController);
    //Контроллер администратора
    function AdminController($scope, $rootScope, $location, $timeout, mainSocket, character, characterService, gettextCatalog, $route) {
        var teamsLoad=false; //Загрузка тим уже была вызвана
        $scope.roleChart = {};
        $scope.currentUser = {user: undefined};
        $scope.chosenTeam = undefined;
        $scope.chosenRole = undefined;
        $scope.chosenAbility = undefined;

        $scope.teamList = [];

        $scope.rolesStatData = [0, 0, 0, 0, 0, 0, 0, 0];
        $scope.rolesStatLabels = ['Sentinel' , 'Slayer', 'Redeemer', 'Ripper', 'Prophet', 'Malefic', 'Cleric', 'Heretic'];
        $scope.rolesColors = ['#f7f7f7','#ff0906','#0055AF','#61dd45', '#00b3ee', '#f05800', '#ffc520', '#862197'];
        $scope.roleChartOptions = {
            showTooltips: true
        };

        $scope.currentGem = {type: undefined};
        $scope.gemsData = [[0,0,0,0,0,0,0,0]];
        $scope.gemsLabels = [];
        $scope.gemsColors = [];
        $scope.roleChartOptions = {
            showTooltips: true
        };

        $scope.abilitiesLabels = [];
        $scope.abilitiesData = [[0,0,0,0,0,0,0,0]];
        $scope.abilitiesColors = ['#fff','#fff','#fff','#fff', '#fff', '#fff', '#fff', '#fff'];
        $scope.abilityChartOptions = {
            showTooltips: true,
            scaleShowLabels: false,
            scaleFontSize: 0
        };

        $scope.levelsLabels = ["1","2","3","4","5"];
        $scope.levelsData = [[0,0,0,0,0]];
        $scope.levelsColors = ['#fff','#fff','#fff','#fff', '#fff'];
        $scope.levelsChartOptions = {
            showTooltips: true
        };

        $scope.$on('$routeChangeSuccess', function () {
            mainSocket.emit("getAllUsersPop");
        });

        $scope.loadTeam = function(user){
            if(user.team){
                $scope.chosenTeam = user.team;
                for(var i=0;i<$scope.chosenTeam.characters.length;i++){
                    $scope.chosenTeam.characters[i] = new character($scope.chosenTeam.characters[i]);
                    $scope.chosenTeam.characters[i].initChar();
                }
            }
            else {
                $scope.chosenTeam = undefined;
            }
        };

        $scope.deleteUser = function(user) {
            if(user){
                mainSocket.emit("deleteUser", user.id);
            }
        };

        $scope.clearDummies = function() {
            if(!teamsLoad) return;
            mainSocket.emit("removeUsersDummies");
        };

        $scope.chooseRole = function chooseRole(event){
            $scope.chosenRole=undefined;
            $scope.chosenLevel=undefined;
            var chosenRole = event[0].label.toLowerCase();
            $scope.abilitiesLabels = characterService.getRoleAbilities(chosenRole);
            $scope.abilitiesData = [[0,0,0,0,0,0,0,0]];
            for(var i=0;i<$scope.abilitiesLabels.length;i++){
                for(var j=0;j<$scope.teamList.length;j++){
                    for(var k=0;k<$scope.teamList[j].characters.length;k++){
                        for(var l=0;l<$scope.teamList[j].characters[k].abilities.length;l++){
                            if($scope.abilitiesLabels[i]===$scope.teamList[j].characters[k].abilities[l].name){
                                $scope.abilitiesData[0][i]++;
                                break;
                            }
                        }
                    }
                }
            }
            for(i=0;i<$scope.abilitiesColors.length;i++){
                $scope.abilitiesColors[i]=$scope.getAbilityColor(chosenRole, true);
            }
            $timeout(function(){
                $scope.chosenRole=chosenRole;
            },100);
        };

        $scope.chooseAbility = function chooseAbility(event){
            $scope.chosenAbility=undefined;
            var chosenAbility = event[0].label;
            $scope.levelsData = [[0,0,0,0,0]];
            for(var i=0;i<$scope.levelsLabels.length;i++){
                for(var j=0;j<$scope.teamList.length;j++){
                    for(var k=0;k<$scope.teamList[j].characters.length;k++){
                        if($scope.teamList[j].characters[k].role===$scope.chosenRole){
                            for(var l=0;l<$scope.teamList[j].characters[k].abilities.length;l++){
                                if(chosenAbility===$scope.teamList[j].characters[k].abilities[l].name &&
                                    $scope.levelsLabels[i]===$scope.teamList[j].characters[k].abilities[l].variant.toString())
                                {
                                    $scope.levelsData[0][i]++;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            for(i=0;i<$scope.levelsColors.length;i++){
                $scope.levelsColors[i]=$scope.getAbilityColor($scope.chosenRole, true);
            }
            $timeout(function(){
                $scope.chosenAbility=chosenAbility;
            },100);
        };

        $scope.chooseGem = function(){
            var allGemsData = [[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]];
            $scope.gemsData = [[0,0,0,0,0,0,0,0]];

            for(var j=0;j<$scope.teamList.length;j++){
                for(var k=0;k<$scope.teamList[j].characters.length;k++){
                    var equip = $scope.teamList[j].characters[k].equip;
                    for (var slot in equip) {
                        if (equip.hasOwnProperty(slot)) {
                            if (!equip[slot]) {
                                //Если такого нет, значит это оффхэнд
                                continue;
                            }
                            for (var slotKey in equip[slot]) {
                                if (equip[slot].hasOwnProperty(slotKey)) {
                                    if (slotKey === "sockets") {
                                        for(var l=0;l<equip[slot][slotKey].length;l++){
                                            if(equip[slot][slotKey][l].gem.name!=="Void"){
                                                switch(equip[slot][slotKey][l].gem.name){
                                                    case "Soul Of Strength": allGemsData[0][0]++; break;
                                                    case "Soul Of Power":allGemsData[0][1]++; break;
                                                    case "Soul Of Vitality": allGemsData[0][2]++; break;
                                                    case "Soul Of Regeneration": allGemsData[0][3]++; break;
                                                    case "Soul Of Stone": allGemsData[0][4]++; break;
                                                    case "Soul Of Wall": allGemsData[0][5]++; break;
                                                    case "Soul Of Dexterity": allGemsData[1][0]++; break;
                                                    case "Soul Of Extremum": allGemsData[1][1]++; break;
                                                    case "Soul Of Energy": allGemsData[1][2]++; break;
                                                    case "Soul Of Accuracy": allGemsData[1][3]++; break;
                                                    case "Soul Of Swiftness": allGemsData[1][4]++; break;
                                                    case "Soul Of Destiny": allGemsData[1][5]++; break;
                                                    case "Soul Of Intellect": allGemsData[2][0]++; break;
                                                    case "Soul Of Magic": allGemsData[2][1]++; break;
                                                    case "Soul Of Wisdom": allGemsData[2][2]++; break;
                                                    case "Soul Of Meditation": allGemsData[2][3]++; break;
                                                    case "Soul Of Will": allGemsData[2][4]++; break;
                                                    case "Soul Of Tactic": allGemsData[2][5]++; break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            switch($scope.currentGem.type) {
                case 'red':
                    $scope.gemsLabels = ['Strength','Attack Power','Health','Health Reg.','Physical Resist.','Block Chance'];
                    $scope.gemsColors = ['#cc0000','#cc0000','#cc0000','#cc0000','#cc0000','#cc0000'];
                    $scope.gemsData[0] = allGemsData[0];
                    break;
                case 'green':
                    $scope.gemsLabels = ['Dexterity','Crit. Rating','Energy','Hit Chance','Dodge Chance','Luck'];
                    $scope.gemsColors = ['#77b300','#77b300','#77b300','#77b300','#77b300','#77b300'];
                    $scope.gemsData[0] = allGemsData[1];
                    break;
                case 'blue':
                    $scope.gemsLabels = ['Intellect','Spell Power','Mana','Mana Reg.','Magical Resist.','Initiative'];
                    $scope.gemsColors = ['#2a9fd6','#2a9fd6','#2a9fd6','#2a9fd6','#2a9fd6','#2a9fd6'];
                    $scope.gemsData[0] = allGemsData[2];
                    break;
            }
        };

        $scope.exitClick = function(){
            $location.path('/city');
        };

        $scope.refresh = function() {
            $route.reload();
        };

        $scope.sortBy = function(param) {
            switch(param) {
                case 'isOnline' :
                    $scope.users.sort(function (a, b) {
                        if (a.isOnline < b.isOnline) {
                            return 1;
                        }
                        else if (a.isOnline > b.isOnline) {
                            return -1;
                        }
                        return 0
                    });
                    break;
                case 'az' :
                    $scope.users.sort(function (a, b) {
                        if(a.username.toLowerCase() < b.username.toLowerCase()){
                            return -1;
                        }
                        else if(a.username.toLowerCase() > b.username.toLowerCase()){
                            return 1;
                        }
                        return 0;
                    });
                    break;
                case 'lastVisit' :
                    $scope.users.sort(function (a, b) {
                        var visitTimeA = 0;
                        var visitTimeB = 0;
                        if(a.lastVisit) visitTimeA = new Date(a.lastVisit).getTime();
                        if(b.lastVisit) visitTimeB = new Date(b.lastVisit).getTime();
                        if(visitTimeA > visitTimeB){
                            return -1;
                        }
                        else if(visitTimeA < visitTimeB){
                            return 1;
                        }
                        return 0;
                    });
                    break;
                case 'created' :
                    $scope.users.sort(function (a, b) {
                        if(new Date(a.created).getTime() > new Date(b.created).getTime()){
                            return -1;
                        }
                        else if(new Date(a.created).getTime() < new Date(b.created).getTime()){
                            return 1;
                        }
                        return 0;
                    });
                    break;
            }
        };

        //Функция возвращает портрет персонажа для background
        $scope.getCharPortrait = function(char) {
            return "url(."+char.portrait+")";
        };

        $scope.formatDateTime = function(date){
            if(!date) return "Not set";
            return new Date(date).toLocaleString("ru", {year: 'numeric', month: 'long', day: 'numeric',hour: 'numeric',minute: 'numeric', second: 'numeric'});
        };

        //Функция выбирает цвет для способности по её роли
        $scope.getAbilityColor = function(ability, string) {
            if(ability) {
                var str="";
                if(string){
                    str=ability;
                }
                else {
                    str=ability.role();
                }
                switch (str) {
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
        };

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

        function updateRoleStat() {
            $scope.rolesStatData = [0, 0, 0, 0, 0, 0, 0, 0];
            for(var i=0; i<$scope.teamList.length;i++){
                for(var j=0;j<$scope.teamList[i].characters.length;j++){
                    var char = $scope.teamList[i].characters[j];
                    switch(char.role){
                        case 'sentinel': $scope.rolesStatData[0]++; break;
                        case 'slayer': $scope.rolesStatData[1]++; break;
                        case 'redeemer': $scope.rolesStatData[2]++; break;
                        case 'ripper': $scope.rolesStatData[3]++; break;
                        case 'prophet': $scope.rolesStatData[4]++; break;
                        case 'malefic': $scope.rolesStatData[5]++; break;
                        case 'cleric': $scope.rolesStatData[6]++; break;
                        case 'heretic': $scope.rolesStatData[7]++; break;
                    }
                }
            }
        }

        function calculateRankings() {
            $scope.teamList.sort(function (a, b) {
                if (a.rating < b.rating) {
                    return 1;
                }
                if (a.rating > b.rating) {
                    return -1;
                }
                //если рейтинг одинаковый, смотрим по числу побед
                if (a.rating == b.rating) {
                    if(a.wins < b.wins){
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }
                return 0;
            });
        }

        mainSocket.on('getAllUsersPopResult', function(users){
            users.sort(function (a, b) {
                if(a.username.toLowerCase() < b.username.toLowerCase()){
                    return -1;
                }
                else if(a.username.toLowerCase() > b.username.toLowerCase()){
                    return 1;
                }
                return 0;
            });
            $scope.users = users;
            $scope.teamList = [];
            for(var i=0;i<$scope.users.length;i++){
                if(users[i].team) {
                    users[i].team.username = users[i].username;
                    $scope.teamList.push($scope.users[i].team);
                }
            }
            updateRoleStat();
            calculateRankings();
        });

        mainSocket.on('deleteUserResult', function(){
            $rootScope.showInfoMessage("Successfully deleted");
            $scope.chosenTeam = undefined;
            mainSocket.emit("getAllUsersPop");
        });

    }
})(angular.module("fotm"));