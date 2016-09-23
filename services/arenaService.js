//Сервис для работы арены

var map = [];

module.exports = {
    //поиск возможных для хода клеток
    findMoves: function(char, myTeam, enemyTeam, walls, radius){
        var self = this;
        var points = self.findNearestPoints(char.position, radius);

        var availablePoints = [];
        for(var i=0;i<points.length;i++){
            if(!self.checkTile(points[i], char, myTeam, enemyTeam, walls, true)){
                availablePoints[availablePoints.length]=points[i];
            }
        }
        return availablePoints;
    },
    //поиск всех клеток в заданном радиусе
    findNearestPoints: function(position, rad) {
        var points = [];
        for(var i=-rad;i<=rad;i++){
            if(position.x+i>=0 && position.x+i<=9) {
                for(var j=-rad;j<=rad;j++){
                    if(position.y+j>=0 && position.y+j<=9){
                        points[points.length] = {x: position.x+i, y: position.y+j};
                    }
                }
            }
        }
        return points;
    },
    //Проверка на наличие персонажа или препятствия на этом тайле
    checkTile: function(position, char, myTeam, enemyTeam, walls, skipInvisible){
        var self = this;
        //var queue = myTeam.concat(enemyTeam);
        for(var i=0;i<myTeam.length;i++){
            if(myTeam[i].position.x==position.x &&
                myTeam[i].position.y==position.y &&
                !myTeam[i].isDead)
            {
                if(skipInvisible){ //Невидимые персонажи будут считаться клетками, доступными для хода
                    //Все
                    if(!myTeam[i].invisible){
                        return true;
                    }
                    else if(myTeam[i].invisible && myTeam[i].charName==char.charName){
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        }

        for(i=0;i<enemyTeam.length;i++){
            var convertedPos = this.convertEnemyPosition(enemyTeam[i].position.x, enemyTeam[i].position.y);
            if(convertedPos.x==position.x &&
                convertedPos.y==position.y &&
                !enemyTeam[i].isDead)
            {
                if(skipInvisible){ //Невидимые персонажи будут считаться клетками, доступными для хода
                    //Все
                    if(!enemyTeam[i].invisible){
                        return true;
                    }
                    else if(enemyTeam[i].invisible && enemyTeam[i].charName==char.charName){
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        }

        for(i=0;i<walls.length;i++){
            var wallPos = self.map1Dto2D(walls[i]);
            if(wallPos.x == position.x && wallPos.y == position.y) return true; //Проверяем на препятствие
        }
        return false;
    },
    //Функция перемещения вплотную к сопернику
    charge: function(target, char, myTeam, enemyTeam, walls) {
        var self = this;

        var points = self.findNearestPoints(target.position, 1);

        var availablePoints = [];

        //Убираем себя из списка тимы, потому что на своём месте можно остаться при чардже
        var targetEnemies = self.findEnemies(char, enemyTeam, 1, walls);
        for(var k=0;k<targetEnemies.length;k++){
            if(targetEnemies[k].charName == char.charName){
                return true;
            }
        }

        for(var i=0;i<points.length;i++){
            if(!self.checkTile(points[i], char, enemyTeam, myTeam, walls, false)){
                availablePoints[availablePoints.length]=points[i];
            }
        }
        if(availablePoints.length===0) return false;

        availablePoints.sort(function (a, b) {
            var aDistance = Math.sqrt(Math.pow(a.x-char.position.x,2)+Math.pow(a.y-char.position.y,2));
            var bDistance = Math.sqrt(Math.pow(b.x-char.position.x,2)+Math.pow(b.y-char.position.y,2));
            if (aDistance > bDistance) {
                return 1;
            }
            if (aDistance < bDistance) {
                return -1;
            }
            return 0;
        });

        char.position=availablePoints[0];
        return true;
    },
    //Функция отбрасывания соперника на клетку назад
    knockBack: function(target, char, myTeam, enemyTeam, walls) {
        var self = this;
        var direction = {x:0,y:0};
        var direction1 = {x:0,y:0};
        var direction2 = {x:0,y:0};
        if (char.position.x < target.position.x)
        {
            direction.x = 1;
        }
        else if (char.position.x > target.position.x)
        {
            direction.x = -1;
        }
        else
        {
            direction.x = 0;
        }

        if (char.position.y < target.position.y)
        {
            direction.y = 1;
            if (direction.x == 1)
            {
                direction1.x = 1;
                direction1.y = 0;
                direction2.x = 0;
                direction2.y = 1;
            }
            if (direction.x == -1)
            {
                direction1.x = -1;
                direction1.y = 0;
                direction2.x = 0;
                direction2.y = 1;
            }
            if (direction.x == 0)
            {
                direction1.x = 1;
                direction1.y = 1;
                direction2.x = -1;
                direction2.y = 1;
            }
        }
        else if (char.position.y > target.position.y)
        {
            direction.y = -1;
            if (direction.x == 1)
            {
                direction1.x = 0;
                direction1.y = -1;
                direction2.x = 1;
                direction2.y = 0;
            }
            if (direction.x == -1)
            {
                direction1.x = -1;
                direction1.y = 0;
                direction2.x = 0;
                direction2.y = -1;
            }
            if (direction.x == 0)
            {
                direction1.x = -1;
                direction1.y = -1;
                direction2.x = 1;
                direction2.y = -1;
            }
        }
        else
        {
            direction.y = 0;
            if (direction.x == 1)
            {
                direction1.x = 1;
                direction1.y = -1;
                direction2.x = 1;
                direction2.y = 1;
            }
            if (direction.x == -1)
            {
                direction1.x = -1;
                direction1.y = -1;
                direction2.x = -1;
                direction2.y = 1;
            }
        }

        var newPosition = {x: target.position.x + direction.x, y: target.position.y + direction.y};

        if (!target.checkTile(newPosition, char, enemyTeam, myTeam, walls, false) && newPosition.x >= 0 && newPosition.x <= 9 && newPosition.y >= 0 && newPosition.y <= 9)
        {
            target.position = newPosition;
        }
        else
        {
            newPosition = {x: target.position.x + direction1.x, y: target.position.y + direction1.y};
            if (!target.checkTile(newPosition, char, enemyTeam, myTeam, walls, false) && newPosition.x >= 0 && newPosition.x <= 9 && newPosition.y >= 0 && newPosition.y <= 9)
            {
                target.position = newPosition;
            }
            else
            {
                newPosition = {x: target.position.x + direction2.x, y: target.position.y + direction2.y};
                if (!target.checkTile(newPosition, char, enemyTeam, myTeam, walls, false) && newPosition.x >= 0 && newPosition.x <= 9 && newPosition.y >= 0 && newPosition.y <= 9)
                {
                    target.position = newPosition;
                }
            }
        }
    },
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
        var queue = [];

        for(var i=0;i<myTeam.length;i++){
            if(!myTeam[i].isDead) queue[queue.length]=myTeam[i];
        }
        for(i=0;i<enemyTeam.length;i++){
            if(!enemyTeam[i].isDead) queue[queue.length]=enemyTeam[i];
        }
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

        var result = [];
        for(i=0; i<queue.length;i++){
            result.push({_id: queue[i]._id, charName: queue[i].charName});
        }
        return result;
    },
    //Находит персонажа в очереди по ID
    findCharInQueue: function(id, myTeam, enemyTeam) {
        var char;
        for(var i=0; i<myTeam.length; i++){
            if(id == myTeam[i]._id){
                char = myTeam[i];
                break;
            }
        }
        if(!char) {
            for(i=0; i<enemyTeam.length; i++){
                if(id == enemyTeam[i]._id){
                    char = enemyTeam[i];
                    break;
                }
            }
        }
        return char;
    },
    //Создаёт стэйты эффектов для персонажей в очереди
    createEffectsStates: function(myTeamChars, enemyTeamChars) {
        for(var i=0; i<myTeamChars.length; i++){
            myTeamChars[i].createEffectsState();
        }
        for(i=0; i<enemyTeamChars.length; i++){
            enemyTeamChars[i].createEffectsState();
        }
    },
    //Пересчитываем персонажей
    calcCharacters: function(myTeamChars, enemyTeamChars) {
        for(var i=0; i<myTeamChars.length; i++){
            myTeamChars[i].calcChar();
        }
        for(i=0; i<enemyTeamChars.length; i++){
            enemyTeamChars[i].calcChar();
        }
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
    //Переворот позиции противников
    convertEnemyPosition: function(x, y) {
        return {x: y, y: x};
    },
    //преобразование карты к линейному массиву
    map2Dto1D: function(map2D) {
        return map2D.x+map2D.y*10;
    },
    //преобразование карты к двумерному массиву
    map1Dto2D: function(map1D) {
        return { x: map1D%10, y: (map1D/10 | 0)}
    },
    //поиск союзников в заданном диапазоне
    findAllies: function(char, charArray, range, walls){
        var self = this;
        var points = self.findNearestPoints(char.position, range);

        var result = [];
        for(var i=0;i<points.length;i++){
            for(var j=0;j<charArray.length;j++){
                if(points[i].x == charArray[j].position.x &&
                    points[i].y == charArray[j].position.y &&
                    !charArray[j].isDead &&
                    !self.rayTrace({x: char.position.x*32+16, y: char.position.y*32+16},{x: points[i].x*32+16, y: points[i].y*32+16}, walls)
                ){
                    result.push(charArray[j]);
                }
            }
        }
        return result;
    },
    //поиск противников в заданном диапазоне
    findEnemies: function(char, charArray, range, walls){
        var self = this;
        var points = self.findNearestPoints(char.position, range);

        var result = [];
        for(var i=0;i<points.length;i++){
            for(var j=0;j<charArray.length;j++){
                var convertedPos = self.convertEnemyPosition(charArray[j].position.x, charArray[j].position.y);
                if(points[i].x == convertedPos.x &&
                    points[i].y == convertedPos.y &&
                    !charArray[j].isDead &&
                    !self.rayTrace({x: char.position.x*32+16, y: char.position.y*32+16},{x: points[i].x*32+16, y: points[i].y*32+16}, walls)
                ){
                    result.push(charArray[j]);
                }
            }
        }
        return result;
    },
    //Функция трассировки для нахождения препятствий между двумя точками (алгоритм Брезенхема)
    rayTrace: function(startCoordinates, endCoordinates, walls) {
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

            //Исключаем варианты, когда точка находится ровно в уголке тайла, чтобы исключить диагонали
            if(x%32===0 && y%32===0) continue;

            var tile={
                x:Math.floor(x/32),
                y:Math.floor(y/32)
            };
            var mapIndex=this.map2Dto1D(tile);

            for(var j=0;j<walls.length;j++) {
                if(walls[j]==mapIndex) return true
            }
        }
        //Если стенок не встретилось
        return false;
    },
    //Возвращаем способность по её имени для персонажа
    getAbilityForCharByName: function(char, name) {
        for(var i=0; i<char.abilities.length;i++){
            if(char.abilities[i].name == name) {
                return char.abilities[i];
            }
        }
        return null;
    }
};