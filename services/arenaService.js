//Сервис для работы арены

var map=[];
module.exports = {
        //Заполнение карты DIV-ами
        fillMap: function(groundType, walls) {
            for (var i = 0; i < 100; i++) {
                map[i]={};
                map[i].x = i%10;
                map[i].y = (i/10 | 0);
                map[i].move=false;
                if(walls.indexOf(i)===-1){
                    map[i].wall=false;
                    map[i].image= function() {
                        var ground;
                        switch (groundType) {
                            case(0):
                                ground = "url(./images/assets/img/tiles/grass.jpg)";
                                break;
                            case(1):
                                ground = "url(./images/assets/img/tiles/sand.jpg)";
                                break;
                            case(2):
                                ground = "url(./images/assets/img/tiles/snow.jpg)";
                                break;
                        }
                        return ground;
                    }();
                }
                else {
                    map[i].wall=true;
                    map[i].image= function() {
                        var ground;
                        switch (groundType) {
                            case(0):
                                ground = "url(./images/assets/img/tiles/grass_wall.jpg)";
                                break;
                            case(1):
                                ground = "url(./images/assets/img/tiles/sand_wall.jpg)";
                                break;
                            case(2):
                                ground = "url(./images/assets/img/tiles/snow_wall.jpg)";
                                break;
                        }
                        return ground;
                    }();
                }

            }

            return map;
        },
        getMap: function(){
            return map;
        },
        //Функция определяет начальные позиции игроков
        getStartPosition: function(ally, pos){
            if(ally) {
                switch (pos) {
                    case 0: return {x:0,y:7};break;
                    case 1: return {x:1,y:8};break;
                    case 2: return {x:2,y:9};break;
                }
            }
            else {
                switch (pos) {
                    case 0: return {x:7,y:0};break;
                    case 1: return {x:8,y:1};break;
                    case 2: return {x:9,y:2};break;
                }
            }
        },
        //переключение цветов для противника
        colorSwap: function (color){
            switch(color){
                case "#2a9fd6": return "#cc0000"; break;
                case "#0055AF": return "#ff8800"; break;
                case "#9933cc": return "#FFDD00"; break;
                case "#cc0000": return "#2a9fd6"; break;
                case "#ff8800": return "#0055AF"; break;
                case "#FFDD00": return "#9933cc"; break;
                default: return color;
            }
        },
        //расчёт игровой очереди
        calcQueue: function(myTeam, enemyTeam, currentChar) {

            var activeQueue = []; //Активная очередь
            var endedQueue = []; //отходившая очередь
            var queue = [];
            var removedActive = {};

            for(var i=0;i<myTeam.length;i++){
                if(!myTeam[i].isDead) queue[queue.length]=myTeam[i];
            }
            for(i=0;i<enemyTeam.length;i++){
                if(!enemyTeam[i].isDead) queue[queue.length]=enemyTeam[i];
            }

            if(currentChar) {
                for(i = 0;i<queue.length;i++){
                    if(queue[i]._id==currentChar._id) {
                        removedActive = queue[i];
                        queue.splice(i,1);
                    }
                }
            } //Не включаем персонажа, который в данный момент совершает ход

            for(i=0;i<queue.length;i++){
                if(queue[i].turnEnded){
                    endedQueue[endedQueue.length]=queue[i];
                }
                else {
                    activeQueue[activeQueue.length]=queue[i];
                }
            }

            //Если все персонажи сходили по разу, делаем их снова активными
            if(activeQueue.length==0){
                activeQueue=endedQueue;
                endedQueue = [];
                for(var k=0;k<activeQueue.length;k++){
                    activeQueue[k].turnEnded=false;
                }
            }

            activeQueue.sort(function (a, b) {
                if (a.initiative < b.initiative) {
                    return 1;
                }
                if (a.initiative > b.initiative) {
                    return -1;
                }
                //если инициатива одинаковая, тогда смотрим, у кого больше id
                if (a.initiative == b.initiative) {
                    if(a._id > b._id){
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }
                return 0;
            });

            endedQueue.sort(function (a, b) {
                if (a.initiative < b.initiative) {
                    return 1;
                }
                if (a.initiative > b.initiative) {
                    return -1;
                }
                //если инициатива одинаковая, тогда смотрим, у кого больше id
                if (a.initiative == b.initiative) {
                    if(a._id > b._id){
                        return 1;
                    }
                    else {
                        return -1;
                    }
                }
                return 0;
            });

            var ready = activeQueue.concat(endedQueue);

            //Вставляем текущего персонажа вперёд массива
            if(currentChar) {
                ready.unshift(removedActive);
            }

            return ready;
        },
        //Проверка, мой ли сейчас ход
        checkTurn: function(myTeam, queue) {
            for (var i = 0; i < myTeam.length; i++) {
                if (myTeam[i] == queue) return true;
            }
            return false;
        },
        //Преобразование команды противника
        convertEnemyTeam: function(team) {
            for(var i=0;i<team.length;i++)
            {
                //цвет
                team[i].battleColor=this.colorSwap(team[i].battleColor);
                //положение
                var l = team[i].position.x;
                var t = team[i].position.y;
                team[i].position.x=t;
                team[i].position.y=l;
            }
        return team;
        },
        //Преобразование игрока противника
        convertEnemyChar: function(char) {
            //цвет
            char.battleColor=this.colorSwap(char.battleColor);
            //положение
            var l = char.position.x;
            var t = char.position.y;
            char.position.x=t;
            char.position.y=l;
            return char;
        },
        //преобразование карты к линейному массиву
        map2Dto1D: function(map2D) {
            return map2D.x+map2D.y*10;
        },
        //преобразование карты к двумерному массиву
        map1Dto2D: function(map1D) {
            return { x: map1D%10, y: (map1D/10 | 0)}
        },
        //Функция трассировки для нахождения препятствий между двумя точками (алгоритм Брезенхема)
        rayTrace: function(startCoordinates, endCoordinates) {
            var coordinatesArray = [];
            //Получаем координаты
            var x1 = startCoordinates.x;
            var y1 = startCoordinates.y;
            var x2 = endCoordinates.x;
            var y2 = endCoordinates.y;
            // Определяем разницы и ошибку
            var dx = Math.abs(x2 - x1);
            var dy = Math.abs(y2 - y1);
            var sx = (x1 < x2) ? 1 : -1;
            var sy = (y1 < y2) ? 1 : -1;
            var err = dx - dy;
            // Устанавливаем начальные координаты
            coordinatesArray.push({x:x1,y:y1});
            // Основной цикл
            while (!((x1 == x2) && (y1 == y2))) {
                var e2 = err << 1;
                if (e2 > -dy) {
                    err -= dy;
                    x1 += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y1 += sy;
                }
                //Устанавливаем координаты
                //Список всех пикселей по пути
                coordinatesArray.push({x:x1,y:y1});
            }

            for(var i=0;i<coordinatesArray.length;i++){
                //определяем клетку на карте, которой принадлежит эта точка
                var x=coordinatesArray[i].x;
                var y=coordinatesArray[i].y;
                var map = this.getMap();

                //Исключаем варианты, когда точка находится ровно в уголке тайла, чтобы исключить диагонали
                if(x%32===0 && y%32===0) continue;

                var tile={
                    x:Math.floor(x/32),
                    y:Math.floor(y/32)
                };
                var mapIndex=this.map2Dto1D(tile);

                if(map[mapIndex].wall) return true;
            }
            //Если стенок не встретилось
            return false;
        },
        //Функция отвечает за перевод сообщений в логе
        localizeMessage: function(message) {
            if(message.indexOf("Battle begins! First move for")!=-1) {
                message=message.replace("Battle begins! First move for", gettextCatalog.getString("Battle begins! First move for"));
            }
            if(message.indexOf("Now is turn of")!=-1) {
                message=message.replace("Now is turn of", gettextCatalog.getString("Now is turn of"));
            }
            if(message.indexOf("The battle ends after")!=-1) {
                message=message.replace("The battle ends after", gettextCatalog.getString("The battle ends after"));
                message=message.replace("turns", gettextCatalog.getString("turns"));
            }
            if(message.indexOf("Someone invisible stands on that cell!")!=-1) {
                message=message.replace("Someone invisible stands on that cell!", gettextCatalog.getString("Someone invisible stands on that cell!"));
            }
            if(message.indexOf("miss against")!=-1) {
                message=message.replace("miss against", gettextCatalog.getString("miss against"));
                message=message.replace("with", gettextCatalog.getString("with"));
            }
            if(message.indexOf("area effect")!=-1) {
                message=message.replace("area effect", gettextCatalog.getString("area effect"));
            }
            if(message.indexOf("DOT effect")!=-1) {
                message=message.replace("DOT effect", gettextCatalog.getString("DOT effect"));
            }
            if(message.indexOf("explosion")!=-1) {
                message=message.replace("explosion", gettextCatalog.getString("explosion"));
            }
            if(message.indexOf("'s grinder looking for meat!")!=-1) {
                message=message.replace("'s grinder looking for meat!", gettextCatalog.getString("'s grinder looking for meat!"));
            }
            if(message.indexOf("can't calculate the distance and miss with")!=-1) {
                message=message.replace("can't calculate the distance and miss with", gettextCatalog.getString("can't calculate the distance and miss with"));
            }
            if(message.indexOf("Buffs can't be stolen, because target is under 'Locked And Loaded' effect!")!=-1) {
                message=message.replace("Buffs can't be stolen, because target is under 'Locked And Loaded' effect!", gettextCatalog.getString("Buffs can't be stolen, because target is under 'Locked And Loaded' effect!"));
            }
            if(message.indexOf("Debuffs can't be removed, because target is under 'Locked And Loaded' effect!")!=-1) {
                message=message.replace("Debuffs can't be removed, because target is under 'Locked And Loaded' effect!", gettextCatalog.getString("Debuffs can't be removed, because target is under 'Locked And Loaded' effect!"));
            }
            if(message.indexOf("Buffs can't be removed, because target is under 'Locked And Loaded' effect!")!=-1) {
                message=message.replace("Buffs can't be removed, because target is under 'Locked And Loaded' effect!", gettextCatalog.getString("Buffs can't be removed, because target is under 'Locked And Loaded' effect!"));
            }
            if(message.indexOf("has immunity to control effects!")!=-1) {
                message=message.replace("has immunity to control effects!", gettextCatalog.getString("has immunity to control effects!"));
            }
            if(message.indexOf("drop cooldown for")!=-1) {
                message=message.replace("drop cooldown for", gettextCatalog.getString("drop cooldown for"));
            }
            if(message.indexOf("didn't take damage from")!=-1) {
                message=message.replace("didn't take damage from", gettextCatalog.getString("didn't take damage from"));
                message=message.replace("of", gettextCatalog.getString("of"));
                message=message.replace("because immunity", gettextCatalog.getString("because immunity"));
            }
            if(message.indexOf("didn't get effect")!=-1) {
                message=message.replace("didn't get effect", gettextCatalog.getString("didn't get effect"));
                message=message.replace("because immunity", gettextCatalog.getString("because immunity"));
            }
            if(message.indexOf("dodged from")!=-1) {
                message=message.replace("dodged from", gettextCatalog.getString("dodged from"));
                message=message.replace("of", gettextCatalog.getString("of"));
            }
            if(message.indexOf("damage from")!=-1) {
                message=message.replace("got", gettextCatalog.getString("got"));
                message=message.replace("blocked", gettextCatalog.getString("blocked"));
                message=message.replace("damage from", gettextCatalog.getString("damage from"));
                message=message.replace("CRITICAL", gettextCatalog.getString("CRITICAL"));
                message=message.replace("of", gettextCatalog.getString("of"));
            }
            if(message.indexOf("is dead")!=-1) {
                message=message.replace("is dead", gettextCatalog.getString("is dead"));
            }
            if(message.indexOf("healed for")!=-1) {
                message=message.replace("healed for", gettextCatalog.getString("healed for"));
                message=message.replace("CRITICAL", gettextCatalog.getString("CRITICAL"));
                message=message.replace("with", gettextCatalog.getString("with"));
            }
            if(message.indexOf("was healed by")!=-1) {
                message=message.replace("was healed by", gettextCatalog.getString("was healed by"));
                message=message.replace("for", gettextCatalog.getString("for"));
                message=message.replace("CRITICAL", gettextCatalog.getString("CRITICAL"));
                message=message.replace("with", gettextCatalog.getString("with"));
            }
            if(message.indexOf("energy with")!=-1) {
                message=message.replace("restore", gettextCatalog.getString("restore"));
                message=message.replace("energy with", gettextCatalog.getString("energy with"));
                message=message.replace("used by", gettextCatalog.getString("used by"));
            }
            if(message.indexOf("mana with")!=-1) {
                message=message.replace("restore", gettextCatalog.getString("restore"));
                message=message.replace("mana with", gettextCatalog.getString("mana with"));
                message=message.replace("used by", gettextCatalog.getString("used by"));
            }
            if(message.indexOf("is very lucky and save his energy")!=-1) {
                message=message.replace("is very lucky and save his energy", gettextCatalog.getString("is very lucky and save his energy"));
            }
            if(message.indexOf("is in clearcasting state and save mana")!=-1) {
                message=message.replace("is in clearcasting state and save mana", gettextCatalog.getString("is in clearcasting state and save mana"));
            }
            if(message.indexOf("retreats")!=-1) {
                message=message.replace(new RegExp("\\bretreats\\b"), gettextCatalog.getString("retreats"));
            }
            if(message.indexOf("is stunned and skip turn")!=-1) {
                message=message.replace("is stunned and skip turn", gettextCatalog.getString("is stunned and skip turn"));
            }
            if(message.indexOf("cast")!=-1 && message.indexOf("on")!=-1) {
                message=message.replace(new RegExp('\\bcast\\b'), gettextCatalog.getString("cast"));
                message=message.replace(new RegExp('\\bon\\b'), gettextCatalog.getString("on"));
            }
            if(message.indexOf("cast")!=-1) {
                message=message.replace(new RegExp("\\bcast\\b"), gettextCatalog.getString("cast"));
            }

            if(message.indexOf("Void")!=-1) {
                message=message.replace(new RegExp("\\bVoid\\b"), gettextCatalog.getString("Void"));
            }
            if(message.indexOf("Strong Arm Of The Law")!=-1) {
                message=message.replace("Strong Arm Of The Law", gettextCatalog.getString("Strong Arm Of The Law"));
            }
            if(message.indexOf("Defender Of The Faith")!=-1) {
                message=message.replace("Defender Of The Faith", gettextCatalog.getString("Defender Of The Faith"));
            }
            if(message.indexOf("Disarm")!=-1) {
                message=message.replace(new RegExp("\\bDisarm\\b"), gettextCatalog.getString("Disarm"));
            }
            if(message.indexOf("Walk Away")!=-1) {
                message=message.replace("Walk Away", gettextCatalog.getString("Walk Away"));
            }
            if(message.indexOf("Sanctuary")!=-1) {
                message=message.replace(new RegExp("\\bSanctuary\\b"), gettextCatalog.getString("Sanctuary"));
            }
            if(message.indexOf("The Punishment Due")!=-1) {
                message=message.replace("The Punishment Due", gettextCatalog.getString("The Punishment Due"));
            }
            if(message.indexOf("Come And Get It")!=-1) {
                message=message.replace("Come And Get It", gettextCatalog.getString("Come And Get It"));
            }
            if(message.indexOf("New Faith")!=-1) {
                message=message.replace("New Faith", gettextCatalog.getString("New Faith"));
            }
            if(message.indexOf("Die By The Sword")!=-1) {
                message=message.replace("Die By The Sword", gettextCatalog.getString("Die By The Sword"));
            }
            if(message.indexOf("Reign In Blood")!=-1) {
                message=message.replace("Reign In Blood", gettextCatalog.getString("Reign In Blood"));
            }
            if(message.indexOf("Grinder")!=-1) {
                message=message.replace(new RegExp("\\bGrinder\\b"), gettextCatalog.getString("Grinder"));
            }
            if(message.indexOf("Follow The Tears")!=-1) {
                message=message.replace("Follow The Tears", gettextCatalog.getString("Follow The Tears"));
            }
            if(message.indexOf("Made In Hell")!=-1) {
                message=message.replace("Made In Hell", gettextCatalog.getString("Made In Hell"));
            }
            if(message.indexOf("Spill The Blood")!=-1) {
                message=message.replace("Spill The Blood", gettextCatalog.getString("Spill The Blood"));
            }
            if(message.indexOf("Dyers Eve")!=-1) {
                message=message.replace("Dyers Eve", gettextCatalog.getString("Dyers Eve"));
            }
            if(message.indexOf("I Dont Wanna Stop")!=-1) {
                message=message.replace("I Dont Wanna Stop", gettextCatalog.getString("I Dont Wanna Stop"));
            }
            if(message.indexOf("Shot Down In Flames")!=-1) {
                message=message.replace("Shot Down In Flames", gettextCatalog.getString("Shot Down In Flames"));
            }
            if(message.indexOf("Electric Eye")!=-1) {
                message=message.replace("Electric Eye", gettextCatalog.getString("Electric Eye"));
            }
            if(message.indexOf("Lights In The Sky")!=-1) {
                message=message.replace("Lights In The Sky", gettextCatalog.getString("Lights In The Sky"));
            }
            if(message.indexOf("Thunderstruck")!=-1) {
                message=message.replace(new RegExp("\\bThunderstruck\\b"), gettextCatalog.getString("Thunderstruck"));
            }
            if(message.indexOf("You Aint No Angel")!=-1) {
                message=message.replace("You Aint No Angel", gettextCatalog.getString("You Aint No Angel"));
            }
            if(message.indexOf("State Of Grace")!=-1) {
                message=message.replace("State Of Grace", gettextCatalog.getString("State Of Grace"));
            }
            if(message.indexOf("My Last Words")!=-1) {
                message=message.replace("My Last Words", gettextCatalog.getString("My Last Words"));
            }
            if(message.indexOf("Come Cover Me")!=-1) {
                message=message.replace("Come Cover Me", gettextCatalog.getString("Come Cover Me"));
            }
            if(message.indexOf("Inject The Venom")!=-1) {
                message=message.replace("Inject The Venom", gettextCatalog.getString("Inject The Venom"));
            }
            if(message.indexOf("Invisible")!=-1) {
                message=message.replace(new RegExp("\\bInvisible\\b"), gettextCatalog.getString("Invisible"));
            }
            if(message.indexOf("Jawbreaker")!=-1) {
                message=message.replace(new RegExp("\\bJawbreaker\\b"), gettextCatalog.getString("Jawbreaker"));
            }
            if(message.indexOf("Hog Tied")!=-1) {
                message=message.replace("Hog Tied", gettextCatalog.getString("Hog Tied"));
            }
            if(message.indexOf("Running Free")!=-1) {
                message=message.replace("Running Free", gettextCatalog.getString("Running Free"));
            }
            if(message.indexOf("Fast As The Shark")!=-1) {
                message=message.replace("Fast As The Shark", gettextCatalog.getString("Fast As The Shark"));
            }
            if(message.indexOf("Prowler")!=-1) {
                message=message.replace(new RegExp("\\bProwler\\b"), gettextCatalog.getString("Prowler"));
            }
            if(message.indexOf("Fade To Black")!=-1) {
                message=message.replace("Fade To Black", gettextCatalog.getString("Fade To Black"));
            }
            if(message.indexOf("Stargazer")!=-1) {
                message=message.replace(new RegExp("\\bStargazer\\b"), gettextCatalog.getString("Stargazer"));
            }
            if(message.indexOf("Speed Of Light")!=-1) {
                message=message.replace("Speed Of Light", gettextCatalog.getString("Speed Of Light"));
            }
            if(message.indexOf("Never A Word")!=-1) {
                message=message.replace("Never A Word", gettextCatalog.getString("Never A Word"));
            }
            if(message.indexOf("Prophecy")!=-1) {
                message=message.replace(new RegExp("\\bProphecy\\b"), gettextCatalog.getString("Prophecy"));
            }
            if(message.indexOf("Lets Me Take It")!=-1) {
                message=message.replace("Lets Me Take It", gettextCatalog.getString("Lets Me Take It"));
            }
            if(message.indexOf("Brain Damage")!=-1) {
                message=message.replace("Brain Damage", gettextCatalog.getString("Brain Damage"));
            }
            if(message.indexOf("Infinite Dreams")!=-1) {
                message=message.replace("Infinite Dreams", gettextCatalog.getString("Infinite Dreams"));
            }
            if(message.indexOf("Caught Somewhere In Time")!=-1) {
                message=message.replace("Caught Somewhere In Time", gettextCatalog.getString("Caught Somewhere In Time"));
            }
            if(message.indexOf("Family Tree")!=-1) {
                message=message.replace("Family Tree", gettextCatalog.getString("Family Tree"));
            }
            if(message.indexOf("Burning Ambition")!=-1) {
                message=message.replace("Burning Ambition", gettextCatalog.getString("Burning Ambition"));
            }
            if(message.indexOf("Fireball")!=-1) {
                message=message.replace(new RegExp("\\bFireball\\b"), gettextCatalog.getString("Fireball"));
            }
            if(message.indexOf("Thank God For The Bomb")!=-1) {
                message=message.replace("Thank God For The Bomb", gettextCatalog.getString("Thank God For The Bomb"));
            }
            if(message.indexOf("Powerslave")!=-1) {
                message=message.replace(new RegExp("\\bPowerslave\\b"), gettextCatalog.getString("Powerslave"));
            }
            if(message.indexOf("Cauterization")!=-1) {
                message=message.replace(new RegExp("\\bCauterization\\b"), gettextCatalog.getString("Cauterization"));
            }
            if(message.indexOf("Down In Flames")!=-1) {
                message=message.replace("Down In Flames", gettextCatalog.getString("Down In Flames"));
            }
            if(message.indexOf("Fight Fire With Fire")!=-1) {
                message=message.replace("Fight Fire With Fire", gettextCatalog.getString("Fight Fire With Fire"));
            }
            if(message.indexOf("Hammer Of The Gods")!=-1) {
                message=message.replace("Hammer Of The Gods", gettextCatalog.getString("Hammer Of The Gods"));
            }
            if(message.indexOf("Mercyful Fate")!=-1) {
                message=message.replace("Mercyful Fate", gettextCatalog.getString("Mercyful Fate"));
            }
            if(message.indexOf("Laying On Hands")!=-1) {
                message=message.replace("Laying On Hands", gettextCatalog.getString("Laying On Hands"));
            }
            if(message.indexOf("Holy Smoke")!=-1) {
                message=message.replace("Holy Smoke", gettextCatalog.getString("Holy Smoke"));
            }
            if(message.indexOf("Cleanse The Soul")!=-1) {
                message=message.replace("Cleanse The Soul", gettextCatalog.getString("Cleanse The Soul"));
            }
            if(message.indexOf("Hallowed Be Thy Name")!=-1) {
                message=message.replace("Hallowed Be Thy Name", gettextCatalog.getString("Hallowed Be Thy Name"));
            }
            if(message.indexOf("Hit The Lights")!=-1) {
                message=message.replace("Hit The Lights", gettextCatalog.getString("Hit The Lights"));
            }
            if(message.indexOf("Heaven Can Wait")!=-1) {
                message=message.replace("Heaven Can Wait", gettextCatalog.getString("Heaven Can Wait"));
            }
            if(message.indexOf("Bloodsucker")!=-1) {
                message=message.replace(new RegExp("\\bBloodsucker\\b"), gettextCatalog.getString("Bloodsucker"));
            }
            if(message.indexOf("Fear Of The Dark")!=-1) {
                message=message.replace("Fear Of The Dark", gettextCatalog.getString("Fear Of The Dark"));
            }
            if(message.indexOf("Creeping Death")!=-1) {
                message=message.replace("Creeping Death", gettextCatalog.getString("Creeping Death"));
            }
            if(message.indexOf("Spreading The Disease")!=-1) {
                message=message.replace("Spreading The Disease", gettextCatalog.getString("Spreading The Disease"));
            }
            if(message.indexOf("Purgatory")!=-1) {
                message=message.replace(new RegExp("\\bPurgatory\\b"), gettextCatalog.getString("Purgatory"));
            }
            if(message.indexOf("Children Of The Damned")!=-1) {
                message=message.replace("Children Of The Damned", gettextCatalog.getString("Children Of The Damned"));
            }
            if(message.indexOf("Locked And Loaded")!=-1) {
                message=message.replace("Locked And Loaded", gettextCatalog.getString("Locked And Loaded"));
            }
            if(message.indexOf("A Touch Of Evil")!=-1) {
                message=message.replace("A Touch Of Evil", gettextCatalog.getString("A Touch Of Evil"));
            }

            return message;
        }
    };