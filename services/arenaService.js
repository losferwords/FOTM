//Сервис для работы арены
var async = require('async');
var sizeof = require('object-sizeof');
var deepClone = require('fast-deepclone');
var randomService = require('services/randomService');
var Team = require('models/team');
var Character = require('models/character');
var map = [];

module.exports = {
    //поиск возможных для хода клеток
    findMoves: function(char, myTeam, enemyTeam, walls, radius){
        var points = this.findNearestPoints(char.position, radius);

        var availablePoints = [];
        for(var i = 0; i < points.length; i++){
            if(!this.checkTile(points[i], char, myTeam, enemyTeam, walls, true)){
                availablePoints[availablePoints.length] = points[i];
            }
        }
        return availablePoints;
    },
    //поиск всех клеток в заданном радиусе
    findNearestPoints: function(position, rad) {
        var points = [];
        for(var i =- rad; i <= rad; i++){
            if(position.x + i >= 0 && position.x + i <= 9) {
                for(var j =- rad; j <= rad; j++){
                    if(position.y + j >= 0 && position.y + j <= 9){
                        points[points.length] = {x: position.x + i, y: position.y + j};
                    }
                }
            }
        }
        return points;
    },
    //Проверка на наличие персонажа или препятствия на этом тайле
    checkTile: function(position, char, myTeam, enemyTeam, walls, skipInvisible){
        var queue = myTeam.concat(enemyTeam);
        for(var i=0;i<queue.length;i++){
            if(queue[i].position.x==position.x &&
                queue[i].position.y==position.y &&
                !queue[i].isDead)
            {
                if(skipInvisible){ //Невидимые персонажи будут считаться клетками, доступными для хода
                    //Все
                    if(!queue[i].invisible){
                        return true;
                    }
                    else if(queue[i].invisible && queue[i].charName==char.charName){
                        return true;
                    }
                }
                else {
                    return true;
                }
            }
        }

        for(i=0;i<walls.length;i++){
            var wallPos = this.map1Dto2D(walls[i]);
            if(wallPos.x == position.x && wallPos.y == position.y) return true; //Проверяем на препятствие
        }
        return false;
    },
    //Функция перемещения вплотную к сопернику
    charge: function(target, char, myTeam, enemyTeam, walls) {
        var points = this.findNearestPoints(target.position, 1);
        var availablePoints = [];

        //Если уже стоим вплотную к сопернику, остаёмся на своём месте
        var targetEnemies = this.findEnemies(target, myTeam, 1, walls);
        for(var k = 0; k < targetEnemies.length; k++){
            if(targetEnemies[k].charName == char.charName){
                return true;
            }
        }

        for(var i = 0; i < points.length; i++){
            if(!this.checkTile(points[i], char, enemyTeam, myTeam, walls, false)){
                availablePoints.push(points[i]);
            }
        }
        if(availablePoints.length === 0) return false;

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
        var direction = {x:0,y:0};
        var direction1 = {x:0,y:0};
        var direction2 = {x:0,y:0};

        var targetPosition = target.position;

        if (char.position.x < targetPosition.x)
        {
            direction.x = 1;
        }
        else if (char.position.x > targetPosition.x)
        {
            direction.x = -1;
        }
        else
        {
            direction.x = 0;
        }

        if (char.position.y < targetPosition.y)
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
        else if (char.position.y > targetPosition.y)
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

        var newPosition = {x: targetPosition.x + direction.x, y: targetPosition.y + direction.y};

        if (!this.checkTile(newPosition, char, myTeam, enemyTeam, walls, false) && newPosition.x >= 0 && newPosition.x <= 9 && newPosition.y >= 0 && newPosition.y <= 9)
        {
            target.position = {x: newPosition.x, y: newPosition.y};
        }
        else
        {
            newPosition = {x: targetPosition.x + direction1.x, y: targetPosition.y + direction1.y};
            if (!this.checkTile(newPosition, char, myTeam, enemyTeam, walls, false) && newPosition.x >= 0 && newPosition.x <= 9 && newPosition.y >= 0 && newPosition.y <= 9)
            {
                target.position = {x: newPosition.x, y: newPosition.y};
            }
            else
            {
                newPosition = {x: targetPosition.x + direction2.x, y: targetPosition.y + direction2.y};
                if (!this.checkTile(newPosition, char, myTeam, enemyTeam, walls, false) && newPosition.x >= 0 && newPosition.x <= 9 && newPosition.y >= 0 && newPosition.y <= 9)
                {
                    target.position = {x: newPosition.x, y: newPosition.y};
                }
            }
        }
    },
    //Функция определяет начальные позиции игроков
    getStartPosition: function(pos){
        switch (pos) {
            case 0: return {x:0,y:7};
            case 1: return {x:1,y:8};
            case 2: return {x:2,y:9};
        }
    },
    //переключение цветов для противника
    colorSwap: function (color){
        switch(color){
            case "#2a9fd6": return "#cc0000";
            case "#0055AF": return "#ff8800";
            case "#9933cc": return "#FFDD00";
            case "#cc0000": return "#2a9fd6";
            case "#ff8800": return "#0055AF";
            case "#FFDD00": return "#9933cc";
            default: return color;
        }
    },
    checkForWin: function(myTeam, enemyTeam, battleData, enemyLeave, cb){
        var myDeaths = 0;
        var enemyDeaths = 0;        
        var gainedSouls = {red: 0, green:0, blue: 0};

        for(var i = 0; i < myTeam.characters.length; i++){
            if(myTeam.characters[i].isDead) {
                myDeaths++;
            }
        }

        for(i = 0; i < enemyTeam.characters.length; i++){
            if(enemyTeam.characters[i].isDead || enemyLeave) {
                enemyDeaths++;
                //Add souls for every killed
                switch(enemyTeam.characters[i].role){
                    case "sentinel" : gainedSouls.red += 4; break;
                    case "slayer" : gainedSouls.red += 4; break;
                    case "redeemer" : gainedSouls.green += 4; break;
                    case "ripper" : gainedSouls.green += 4; break;
                    case "prophet" : gainedSouls.blue += 4; break;
                    case "malefic" : gainedSouls.blue += 4; break;
                    case "cleric" : switch(Math.floor(Math.random() * 3)) {
                        case 0 : gainedSouls.red += 4; break;
                        case 1 : gainedSouls.green += 4; break;
                        case 2 : gainedSouls.blue += 4; break;
                    }
                        break;
                    case "heretic" : switch(Math.floor(Math.random() * 3)) {
                        case 0 : gainedSouls.red += 4;break;
                        case 1 : gainedSouls.green += 4;break;
                        case 2 : gainedSouls.blue += 4;break;
                    }
                        break;
                }
            }
        }

        if(myDeaths == 3){
            if(battleData.training) {
                this.makeLoseTraining(myTeam, gainedSouls, cb);
            }
            else {
                this.makeLose(myTeam, enemyTeam, gainedSouls, battleData, cb);
            }           
        } 
        else if(enemyDeaths == 3){
            if(battleData.training) {
                this.makeWinTraining(myTeam, gainedSouls, cb);
            }
            else {
                this.makeWin(myTeam, enemyTeam, gainedSouls, battleData, cb);
            }            
        }
        //game is over after some turns
        else if(battleData.turnsSpended >= 50){
            if(myDeaths > enemyDeaths){
                if(battleData.training && !myTeam.isBot) {
                    this.makeLoseTraining(myTeam, gainedSouls, cb);
                }
                else {
                    this.makeLose(myTeam, enemyTeam, gainedSouls, battleData, cb);
                }
            }
            else if(myDeaths < enemyDeaths){
                if(battleData.training && !myTeam.isBot) {
                    this.makeWinTraining(myTeam, gainedSouls, cb);
                }
                else {
                    this.makeWin(myTeam, enemyTeam, gainedSouls, battleData, cb);
                } 
            }
            else if(!battleData.training || (battleData.training && !myTeam.isBot)){
                this.makeDraw(myTeam, gainedSouls, battleData, cb);
            }
        }
        else {
            cb(false);
        }
    },
    makeWin: function(myTeam, enemyTeam, gainedSouls, battleData, cb){
        var cb = cb;
        var ratingChange = 0;
        if(battleData.bots){
            cb(true, 'win', 0, 0, gainedSouls);
            return;
        }

        if(myTeam.rating > enemyTeam.rating){
            ratingChange = myTeam.rating - enemyTeam.rating;
            if(ratingChange > 25) ratingChange = 25;
        }
        else if (myTeam.rating < enemyTeam.rating){
            ratingChange = (enemyTeam.rating - myTeam.rating) * 2;
            if(ratingChange > 25) ratingChange = 25;
        }
        else {
            ratingChange = 10;
        }

        myTeam.rating += ratingChange;

        gainedSouls.red += 4;
        gainedSouls.green += 4;
        gainedSouls.blue += 4;

        myTeam.souls.red += gainedSouls.red;
        myTeam.souls.green += gainedSouls.green;
        myTeam.souls.blue += gainedSouls.blue;

        Team.Team.setById(myTeam.id, {
            rating: myTeam.rating,
            wins: myTeam.wins + 1,
            souls: myTeam.souls
        }, function(err, team){
            if (err) {
                console.error(err);
                return;
            }
            cb(true, 'win', myTeam.rating, ratingChange, gainedSouls);
        });
    },
    makeWinTraining: function(myTeam, gainedSouls, cb){
        var cb = cb;
        gainedSouls.red += 2;
        gainedSouls.green += 2;
        gainedSouls.blue += 2;

        myTeam.souls.red += gainedSouls.red;
        myTeam.souls.green += gainedSouls.green;
        myTeam.souls.blue += gainedSouls.blue;
        
        Team.Team.setById(myTeam.id, {
            souls: myTeam.souls
        }, function(err, team){
            if (err) {
                console.error(err);
                return;
            }
            cb(true, 'win', myTeam.rating, 0, gainedSouls);
        });
    },
    makeLose: function(myTeam, enemyTeam, gainedSouls, battleData, cb) {
        var cb = cb;
        var ratingChange = 0;
        if(battleData.bots){
            cb(true, 'lose', 0, 0, gainedSouls);
            return;
        }

        if(myTeam.rating > enemyTeam.rating){
            ratingChange = (myTeam.rating - enemyTeam.rating) * 2;
            if(ratingChange > 25) ratingChange = 25;
        }
        else if (myTeam.rating < enemyTeam.rating){
            ratingChange = enemyTeam.rating - myTeam.rating;
            if(ratingChange > 25) ratingChang = 25;
        }
        else {
            ratingChange = 10;
        }

        if(myTeam.rating - ratingChange < 1000) {
            ratingChange = myTeam.rating - 1000;
            myTeam.rating = 1000;
        }
        else {
            myTeam.rating -= ratingChange;
        }

        //Consolation prize
        gainedSouls.red += 2;
        gainedSouls.green += 2;
        gainedSouls.blue += 2;

        myTeam.souls.red += gainedSouls.red;
        myTeam.souls.green += gainedSouls.green;
        myTeam.souls.blue += gainedSouls.blue;

        Team.Team.setById(myTeam.id, {
            rating: myTeam.rating,
            wins: myTeam.loses + 1,
            souls: myTeam.souls
        }, function(err, team){
            if (err) {
                console.error(err);
                return;
            }
            //Set lose flag for characters
            async.each(myTeam.characters, function(char, callback) {
                Character.Character.setById(char.id, {lose: true}, function(err, char){
                    if (err) {
                        console.error(err);
                        return;
                    }
                    callback(null);
                });
            }, function(err){
                if (err) {
                    console.error(err);
                    return;
                }
                cb(true, 'lose', myTeam.rating, ratingChange, gainedSouls);
            });
        });
    },
    makeLoseTraining: function(myTeam, gainedSouls, cb){
        var cb = cb;

        myTeam.souls.red += gainedSouls.red;
        myTeam.souls.green += gainedSouls.green;
        myTeam.souls.blue += gainedSouls.blue;

        Team.Team.setById(myTeam.id, {
            souls: myTeam.souls
        }, function(err, team){
            if (err) {
                console.error(err);
                return;
            }
            cb(true, 'lose', myTeam.rating, 0, gainedSouls);
        });
    },
    makeDraw: function(myTeam, gainedSouls, battleData, cb) {
        var cb = cb;
        if(battleData.bots){
            cb(true, 'draw', 0, 0, gainedSouls);
            return;
        }
        gainedSouls.red += 1;
        gainedSouls.green += 1;
        gainedSouls.blue += 1;

        myTeam.souls.red += gainedSouls.red;
        myTeam.souls.green += gainedSouls.green;
        myTeam.souls.blue += gainedSouls.blue;

        Team.Team.setById(myTeam.id, {
            souls: myTeam.souls
        }, function(err, team){
            if (err) {
                console.error(err);
                return;
            }
            cb(true, 'draw', myTeam.rating, 0, gainedSouls);
        });
    },
    //calculation of queue
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
                if(a.id > b.id){
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
            result.push({id: queue[i].id, charName: queue[i].charName});
        }
        return result;
    },
    //Находит персонажа в очереди по ID
    findCharInQueue: function(id, myTeam, enemyTeam) {
        var char;
        for(var i=0; i<myTeam.length; i++){
            if(id == myTeam[i].id){
                char = myTeam[i];
                break;
            }
        }
        if(!char) {
            for(i=0; i<enemyTeam.length; i++){
                if(id == enemyTeam[i].id){
                    char = enemyTeam[i];
                    break;
                }
            }
        }
        return char;
    },
    //Находит персонажа в команде по ID
    findCharInMyTeam: function(id, myTeam) {
        var char;
        for(var i=0; i < myTeam.length; i++){
            if(id == myTeam[i].id){
                char = myTeam[i];
                break;
            }
        }
        return char;
    },
    //Make copy of team
    cloneTeam: function(team){
        //var start = process.hrtime();
        var newTeam = deepClone(team, true);
        //randomService.elapsedTime(start, "cloneTeam");
        return newTeam;
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
    //Recalculate characters
    calcCharacters: function(myTeamChars, enemyTeamChars) {
        for(var i = 0; i < myTeamChars.length; i++){
            myTeamChars[i].calcChar(true);
        }
        for(i = 0; i < enemyTeamChars.length; i++){
            enemyTeamChars[i].calcChar(true);
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
    //find allies in selected range
    //charArray - array of characters
    findAllies: function(char, charArray, range, walls){
        var charPos = {x: char.position.x, y: char.position.y};
        var points = this.findNearestPoints(charPos, range);

        var result = [];
        for(var i=0;i<points.length;i++){
            for(var j=0;j<charArray.length;j++){
                if(points[i].x == charArray[j].position.x &&
                    points[i].y == charArray[j].position.y &&
                    !charArray[j].isDead &&
                    !this.rayTrace({x: charPos.x * 32 + 16, y: charPos.y * 32 + 16}, {x: points[i].x * 32 + 16, y: points[i].y * 32 + 16}, walls)
                ){
                    result.push(charArray[j]);
                }
            }
        }
        return result;
    },
    findAlliesForAbility: function(myTeam, enemyTeam, activeChar, preparedAbility, wallPositions, cb) {            
        if(preparedAbility){
            var ability = this.getAbilityForCharByName(activeChar, preparedAbility);
            var result = this.findAllies(activeChar, myTeam.characters, ability.range(), wallPositions);
            cb(result);
            return result;
        }
    },
    //find enemies in selected range
    //charArray - array of characters
    findEnemies: function(char, charArray, range, walls){
        var charPos = {x: char.position.x, y: char.position.y};
        var points = this.findNearestPoints(charPos, range);

        var result = [];
        for(var i=0;i<points.length;i++){
            for(var j=0;j<charArray.length;j++){
                if(points[i].x == charArray[j].position.x &&
                    points[i].y == charArray[j].position.y &&
                    !charArray[j].isDead &&
                    !this.rayTrace({x: charPos.x * 32 + 16, y: charPos.y * 32 + 16}, {x: points[i].x * 32 + 16, y: points[i].y * 32 + 16}, walls)
                ){
                    result.push(charArray[j]);
                }
            }
        }
        return result;
    },
    findEnemiesForAbility: function(myTeam, enemyTeam, activeChar, preparedAbility, wallPositions, cb) {      
        if(preparedAbility){
            var ability = this.getAbilityForCharByName(activeChar, preparedAbility);
            var result = this.findEnemies(activeChar, enemyTeam.characters, ability.range(), wallPositions);
            cb(result);
            return result;
        }
    },
    findCharactersForAbility: function(myTeam, enemyTeam, activeChar, preparedAbility, wallPositions, cb) {
        if(preparedAbility){
            var ability = this.getAbilityForCharByName(activeChar, preparedAbility);
            var result = this.findAllies(activeChar, myTeam.characters, ability.range(), wallPositions).concat(this.findEnemies(activeChar, enemyTeam.characters, ability.range(), wallPositions));
            cb(result);
            return result;
        }
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
        coordinatesArray.push({x: x1, y: y1});
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
            coordinatesArray.push({x: x1, y: y1});
        }

        for(var i = 0; i < coordinatesArray.length; i++){
            //определяем клетку на карте, которой принадлежит эта точка
            var x = coordinatesArray[i].x;
            var y = coordinatesArray[i].y;

            //Исключаем варианты, когда точка находится ровно в уголке тайла, чтобы исключить диагонали
            if(x % 32 === 0 && y % 32 === 0) {
                continue;
            }

            var tile = {
                x: Math.floor(x / 32),
                y: Math.floor(y / 32)
            };

            var mapIndex = this.map2Dto1D(tile);

            for(var j = 0; j < walls.length; j++) {
                if(walls[j] == mapIndex) {
                    return true;
                }
            }
        }
        //Если стенок не встретилось
        return false;
    },
    //Возвращаем способность по её имени для персонажа
    getAbilityForCharByName: function(char, name) {
        for(var i = 0; i < char.abilities.length; i++){
            if(char.abilities[i].name == name) {
                return char.abilities[i];
            }
        }
        return null;
    },
    //Функция проверяет, можно ли использовать способность
    checkAbilityForUse: function(ability, char) {
        if(ability.name == "Void") return false;
        if(ability.name == "Dyers Eve" && (char.curHealth/char.maxHealth)>0.5) return false;
        if(ability.targetType() == "move" && char.immobilized) return false;
        if(ability.cd == 0){ //если она не на кулдауне
            if(char.curEnergy - ability.energyCost()>0){ //на неё есть энергия
                if(char.curMana - ability.manaCost()>0){ //и мана
                    if(ability.needWeapon()){ //Если для абилки нужно оружие
                        if(!char.disarmed){ //и персонаж не в дизарме
                            return true;
                        }
                    }
                    else { //Если это магия
                        if(!char.silenced){ //и персонаж не в молчанке
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    },
    intDistanceBetweenPoints: function(start, end){
        var maxX = Math.abs(end.x - start.x);
        var maxY = Math.abs(end.y - start.y);
        return maxX > maxY ? maxX : maxY;
    },
    getOptimalRange: function(activeChar){
        var rangeSum = 0;
        var rangeCount = 0;
        for(var i = 0; i < activeChar.abilities.length; i++){
            if(activeChar.abilities[i].range() !== 'self'){
                rangeSum += activeChar.abilities[i].range();
                rangeCount++;
            }
        }
        if(rangeSum > 0 && rangeCount > 0) {
            return rangeSum / rangeCount;
        } 
        else {
            return 0;
        }        
    },
    calculatePositionWeight: function(position, char, myTeam, enemyTeam, optimalRange, walls){
        var weight = [0, 0];

        for(var i = 0; i < enemyTeam.length; i++){
            if(enemyTeam[i].isDead) {
                continue;
            }
            weight[0] += 0.3 - Math.abs(optimalRange - this.intDistanceBetweenPoints(position, enemyTeam[i].position)) * 0.03 - Number(this.rayTrace({x: position.x * 32 + 16, y: position.y * 32 + 16}, {x: enemyTeam[i].position.x * 32 + 16, y: enemyTeam[i].position.y * 32 + 16}, walls)) * 0.05;
        }

        if(weight[0] < 0) {
            weight[0] = 0;
        }

        for(i = 0; i < myTeam.length; i++){
            if(myTeam[i].id == char.id || myTeam[i].isDead) {
                continue;
            }
            weight[1] += 0.5 - Math.abs(optimalRange - this.intDistanceBetweenPoints(position, myTeam[i].position)) * 0.05 - Number(this.rayTrace({x: position.x * 32 + 16, y: position.y * 32 + 16}, {x: myTeam[i].position.x * 32 + 16, y: myTeam[i].position.y * 32 + 16}, walls)) * 0.125;
        }

        if(weight[1] < 0) {
            weight[1] = 0;
        }

        return weight;
    },
    calculateExpectedDamage: function(damage, caster){
        return (caster.hitChance) * ((1 - caster.critChance) * damage + caster.critChance * (1.5 + caster.critChance) * damage);
    },
    calculateExpectedHeal: function(heal, caster){
        return (1 - caster.critChance) * heal + caster.critChance * (1.5 + caster.critChance) * heal;
    },
    cleanBuffers: function(myTeam, enemyTeam){
        for(var i = 0; i < myTeam.characters.length; i++){
            if (myTeam.characters[i].logBuffer.length > 0) {
                myTeam.characters[i].logBuffer = [];
            }
            if (myTeam.characters[i].soundBuffer.length > 0) {
                myTeam.characters[i].soundBuffer = [];
            }
            if (myTeam.characters[i].battleTextBuffer.length > 0) {
                myTeam.characters[i].battleTextBuffer = [];
            }
        }

        for(i = 0; i < enemyTeam.characters.length; i++){
            if (enemyTeam.characters[i].logBuffer.length > 0) {
                enemyTeam.characters[i].logBuffer = [];
            }
            if (enemyTeam.characters[i].soundBuffer.length > 0) {
                enemyTeam.characters[i].soundBuffer = [];
            }
            if (enemyTeam.characters[i].battleTextBuffer.length > 0) {
                enemyTeam.characters[i].battleTextBuffer = [];
            }
        }
    },
    findMovePoints: function(myTeam, enemyTeam, activeChar, preparedAbility, wallPositions, cb){
        var result = [];        
        if(!activeChar.immobilized) {
            var range = 0;
            if(preparedAbility){
                var ability = this.getAbilityForCharByName(activeChar, preparedAbility);
                if(ability){
                    range = ability.range();
                }
            }
            else if(activeChar.canMove()){
                range = 1;
            }

            if(range > 0)
            {
                result = this.findMoves(activeChar, myTeam.characters, enemyTeam.characters, wallPositions, range);
                cb(result);
                return result;
            }
        }
        cb(result);
        return result;
    },
    moveCharTo: function(tile, myTeam, enemyTeam, activeChar, preparedAbility, wallPositions, invisibleCb, moveCompleteCb){
        if(!activeChar.immobilized) {
            if(this.checkTile({x: tile.x, y: tile.y}, activeChar, myTeam.characters, enemyTeam.characters, wallPositions, false)) {
                invisibleCb();
            }
            else if(preparedAbility){
                var ability = this.getAbilityForCharByName(activeChar, preparedAbility);
                if(ability && this.checkAbilityForUse(ability, activeChar)){
                    ability.cast(activeChar, null, myTeam.characters, enemyTeam.characters, wallPositions);
                    activeChar.createAbilitiesState();
                    activeChar.position = {x: tile.x, y: tile.y};
                    moveCompleteCb();
                }
            }
            else if(Math.abs(activeChar.position.x - tile.x) < 2 && Math.abs(activeChar.position.y - tile.y) < 2 && activeChar.canMove()){
                activeChar.soundBuffer.push('move');
                activeChar.position = {x: tile.x, y: tile.y};
                activeChar.spendEnergy(activeChar.moveCost);
                moveCompleteCb();
            }
        }
        this.cleanBuffers(myTeam, enemyTeam);
    },
    moveCharSimulation: function(tile, myTeamOrig, enemyTeamOrig, activeCharId, preparedAbility, wallPositions){
        var myTeam = this.cloneTeam(myTeamOrig);
        var enemyTeam = this.cloneTeam(enemyTeamOrig);
        var activeChar = this.findCharInMyTeam(activeCharId, myTeam.characters);
        if(!activeChar.immobilized) {
            if(this.checkTile({x: tile.x, y: tile.y}, activeChar, myTeam.characters, enemyTeam.characters, wallPositions, false)) {
                //invisible char on tile
            }
            else if(preparedAbility){
                var ability = this.getAbilityForCharByName(activeChar, preparedAbility);
                if(ability && this.checkAbilityForUse(ability, activeChar) && ability.castSimulation){ 
                    ability.castSimulation(activeChar, null, myTeam.characters, enemyTeam.characters, wallPositions);
                    activeChar.position = {x: tile.x, y: tile.y};
                    this.calcCharacters(myTeam.characters, enemyTeam.characters);
                }
            }
            else if(Math.abs(activeChar.position.x - tile.x) < 2 && Math.abs(activeChar.position.y - tile.y) < 2 && activeChar.canMove()){
                activeChar.position = {x: tile.x, y: tile.y};
                activeChar.spendEnergy(activeChar.moveCost, true);
            }
        }
        return {myTeam: myTeam, enemyTeam: enemyTeam, activeChar: activeChar};
    },
    castAbility: function(targetChar, myTeam, enemyTeam, activeChar, preparedAbility, wallPositions, castCb){ 
        if(preparedAbility){
            var ability = this.getAbilityForCharByName(activeChar, preparedAbility);
            if(ability && this.checkAbilityForUse(ability, activeChar)){
                ability.cast(activeChar, targetChar, myTeam.characters, enemyTeam.characters, wallPositions);
                activeChar.createAbilitiesState();
                this.createEffectsStates(myTeam.characters, enemyTeam.characters);
                this.calcCharacters(myTeam.characters, enemyTeam.characters);
                castCb();
            }
        }
        this.cleanBuffers(myTeam, enemyTeam);
    },
    castAbilitySimulation: function(myTeamOrig, enemyTeamOrig, activeCharId, targetCharId, preparedAbility, wallPositions){       
        var myTeam = this.cloneTeam(myTeamOrig);
        var enemyTeam = this.cloneTeam(enemyTeamOrig);
        var activeChar = this.findCharInMyTeam(activeCharId, myTeam.characters);
        var targetChar = this.findCharInQueue(targetCharId, myTeam.characters, enemyTeam.characters);
        if(preparedAbility){
            var ability = this.getAbilityForCharByName(activeChar, preparedAbility);
            if(ability && this.checkAbilityForUse(ability, activeChar) && ability.castSimulation){                    
                ability.castSimulation(activeChar, targetChar, myTeam.characters, enemyTeam.characters, wallPositions);
                this.calcCharacters(myTeam.characters, enemyTeam.characters);
            }
        }
        return {myTeam: myTeam, enemyTeam: enemyTeam, activeChar: activeChar};
    },
    turnEnded: function(myTeam, enemyTeam, activeChar, wallPositions, cb) {
        activeChar.initiativePoints = activeChar.initiativePoints * 0.2;
        for(var i = 0; i < myTeam.characters.length; i++){
            myTeam.characters[i].refreshChar(myTeam.characters, enemyTeam.characters, wallPositions);
        }
        for(i = 0; i < enemyTeam.characters.length; i++){
            enemyTeam.characters[i].refreshChar(enemyTeam.characters, myTeam.characters, wallPositions);
        }
        cb();  
        this.cleanBuffers(myTeam, enemyTeam);        
    }
};