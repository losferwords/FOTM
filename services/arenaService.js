//Сервис для работы арены

module.exports = {
    //Функция определяет начальные позиции игроков
    getStartPosition: function(pos){
        switch (pos) {
            case 0: return {x:0,y:7};break;
            case 1: return {x:1,y:8};break;
            case 2: return {x:2,y:9};break;
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
    calcQueue: function(myTeam, enemyTeam) {

        //var activeQueue = []; //Активная очередь
        //var endedQueue = []; //отходившая очередь
        var queue = [];
        //var removedActive = {};

        for(var i=0;i<myTeam.length;i++){
            if(!myTeam[i].isDead) queue[queue.length]=myTeam[i];
        }
        for(i=0;i<enemyTeam.length;i++){
            if(!enemyTeam[i].isDead) queue[queue.length]=enemyTeam[i];
        }
        //
        //if(currentChar) {
        //    for(i = 0;i<queue.length;i++){
        //        if(queue[i]._id==currentChar._id) {
        //            removedActive = queue[i];
        //            queue.splice(i,1);
        //        }
        //    }
        //} //Не включаем персонажа, который в данный момент совершает ход
        //
        //for(i=0;i<queue.length;i++){
        //    if(queue[i].turnEnded){
        //        endedQueue[endedQueue.length]=queue[i];
        //    }
        //    else {
        //        activeQueue[activeQueue.length]=queue[i];
        //    }
        //}
        //
        ////Если все персонажи сходили по разу, делаем их снова активными
        //if(activeQueue.length==0){
        //    activeQueue=endedQueue;
        //    endedQueue = [];
        //    for(var k=0;k<activeQueue.length;k++){
        //        activeQueue[k].turnEnded=false;
        //    }
        //}
        //
        queue.sort(function (a, b) {
            if (a.initiativePoints < b.initiativePoints) {
                return 1;
            }
            if (a.initiativePoints > b.initiativePoints) {
                return -1;
            }
            //если инициатива одинаковая, тогда смотрим, у кого больше id
            if (a.initiativePoints == b.initiativePoints) {
                if(a._id > b._id){
                    return 1;
                }
                else {
                    return -1;
                }
            }
            return 0;
        });
        //activeQueue.sort(function (a, b) {
        //    if (a.initiative < b.initiative) {
        //        return 1;
        //    }
        //    if (a.initiative > b.initiative) {
        //        return -1;
        //    }
        //    //если инициатива одинаковая, тогда смотрим, у кого больше id
        //    if (a.initiative == b.initiative) {
        //        if(a._id > b._id){
        //            return 1;
        //        }
        //        else {
        //            return -1;
        //        }
        //    }
        //    return 0;
        //});
        //
        //endedQueue.sort(function (a, b) {
        //    if (a.initiative < b.initiative) {
        //        return 1;
        //    }
        //    if (a.initiative > b.initiative) {
        //        return -1;
        //    }
        //    //если инициатива одинаковая, тогда смотрим, у кого больше id
        //    if (a.initiative == b.initiative) {
        //        if(a._id > b._id){
        //            return 1;
        //        }
        //        else {
        //            return -1;
        //        }
        //    }
        //    return 0;
        //});
        //
        //var ready = activeQueue.concat(endedQueue);
        //
        ////Вставляем текущего персонажа вперёд массива
        //if(currentChar) {
        //    ready.unshift(removedActive);
        //}

        return queue;
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
    }
};