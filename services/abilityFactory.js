
//Фабрика создания способностей по имени
var Ability = function(name){
    switch(name){
        case "Void": return {
            name : "Void",
            role : function() {return "void"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--void)"},
            variant: 3,
            cast : function (caster, target, myTeam, enemyTeam) {
                return false;
            },
            targetType : function() { return "self"},
            range: function() {return 0},
            duration: function(){return 0},
            energyCost : function() {return 99999},
            manaCost : function() {return 99999},
            cooldown : function() {return 6},
            needWeapon : function() {return false},
            cd : 0
        };break;

        //SENTINEL

        case "Strong Arm Of The Law": return {
            name : "Strong Arm Of The Law",
            variant: 3,
            role : function() {return "sentinel"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--StrongArmOfTheLaw)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(1+this.variant*0.2), caster.maxDamage*(1+this.variant*0.2));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);
                    caster.playSound(this.name);
                    if(target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        target.addDebuff(effectService.effect("Strong Arm Of The Law", this.variant), caster.charName, myTeam, enemyTeam);
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 2},
            duration: function(){return 18-this.variant*2},
            energyCost : function(){return 100+this.variant*50},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 1},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Defender Of The Faith": return {
            name : "Defender Of The Faith",
            variant: 3,
            role : function() {return "sentinel"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--DefenderOfTheFaith)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.playSound(this.name);
                if(this.variant===1 || this.variant===3 || this.variant===5){
                    caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                    target.addBuff(effectService.effect("Defender Of The Faith", this.variant), caster.charName, myTeam, enemyTeam);
                }
                else {
                    caster.logBuffer.push(caster.charName+" cast '"+this.name);
                    for(var i=0; i<myTeam.length;i++){
                        if(!myTeam[i].isDead) {
                            myTeam[i].addBuff(effectService.effect("Defender Of The Faith", this.variant), caster.charName, myTeam, enemyTeam);
                        }

                    }
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() {
                if (this.variant === 1 || this.variant === 3 || this.variant === 5) {
                    return "ally";
                }
                else {
                    return "self";
                }
            },
            range : function(){
                if (this.variant === 1 || this.variant === 3 || this.variant === 5) {
                    return 3;
                }
                else {
                    return 0;
                }
            },
            duration: function(){return 22-this.variant*2},
            energyCost : function(){return 50+this.variant*100},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 12+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Disarm": return {
            name : "Disarm",
            variant: 3,
            role : function() {return "sentinel"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Disarm)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                    caster.playSound(this.name);

                    if(target.controlImmune) {
                        caster.logBuffer.push(target.charName+" has immunity to control effects!");
                    }
                    else {
                        target.addDebuff(effectService.effect("Disarm", this.variant), caster.charName, myTeam, enemyTeam);
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 5+this.variant},
            energyCost : function(){return 150+this.variant*75},
            manaCost : function(){return 200+this.variant*75},
            cooldown : function(){return 11+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Walk Away": return {
            name : "Walk Away",
            variant: 3,
            role : function() {return "sentinel"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--WalkAway)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(0.8+this.variant*0.3), caster.maxDamage*(0.8+this.variant*0.3));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    if(target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        if(target.controlImmune) {
                            caster.logBuffer.push(target.charName+" has immunity to control effects!");
                        }
                        else {
                            caster.knockBack(target, myTeam, enemyTeam);
                            target.addDebuff(effectService.effect("Walk Away", this.variant), caster.charName, myTeam, enemyTeam);
                        }
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 3+this.variant},
            energyCost : function(){return 250+this.variant*100},
            manaCost : function(){return 200+this.variant*150},
            cooldown : function(){return 12+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Sanctuary": return {
            name : "Sanctuary",
            variant: 3,
            role : function() {return "sentinel"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Sanctuary)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();

                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);
                target.addBuff(effectService.effect("Sanctuary", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "allyNotMe"},
            range : function(){return 3},
            duration: function(){return 4+this.variant*2},
            energyCost : function(){return 100+this.variant*100},
            manaCost : function(){return 100+this.variant*150},
            cooldown : function(){return 10+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "The Punishment Due": return {
            name : "The Punishment Due",
            variant: 3,
            role : function() {return "sentinel"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--ThePunishmentDue)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(0.9+this.variant*0.1), caster.maxDamage*(0.9+this.variant*0.1));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    if(target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        var newEffect=effectService.effect("The Punishment Due", this.variant);
                        newEffect.bleedDamage=physDamage*this.variant*0.1;
                        target.addDebuff(newEffect, caster.charName, myTeam, enemyTeam);
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 2},
            duration: function(){return 4+this.variant},
            energyCost : function(){return 100+this.variant*75},
            manaCost : function(){return 150+this.variant*50},
            cooldown : function(){return 7+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Come And Get It": return {
            name : "Come And Get It",
            variant: 3,
            role : function() {return "sentinel"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--ComeAndGetIt)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(0.5+this.variant*0.2), caster.maxDamage*(0.5+this.variant*0.2));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    if(target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        if(target.controlImmune) {
                            caster.logBuffer.push(target.charName+" has immunity to control effects!");
                        }
                        else {
                            target.charge(caster, enemyTeam, myTeam);
                        }
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*75},
            manaCost : function(){return 100+this.variant*50},
            cooldown : function(){return 11+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "New Faith": return {
            name : "New Faith",
            variant: 3,
            role : function() {return "sentinel"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--NewFaith)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);

                caster.playSound(this.name);

                if(target.findEffect("Locked And Loaded")!==-1) {
                    caster.logBuffer.push("Debuffs can't be removed, because target is under 'Locked And Loaded' effect!");
                }
                else {
                    for(var i=0;i<3;i++) {
                        target.removeRandomDOT(myTeam, enemyTeam);
                    }
                }

                var heal=(200+this.variant*175)*(1+caster.spellPower);
                var critical = caster.checkCrit();
                if (critical) {
                    heal = caster.applyCrit(heal);
                }
                target.takeHeal(heal, caster, {name: this.name, icon: this.icon(), role: this.role()}, critical);

                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*50},
            manaCost : function(){return 150+this.variant*100},
            cooldown : function(){return 5+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        //SLAYER

        case "Die By The Sword": return {
            name : "Die By The Sword",
            variant: 3,
            role : function() {return "slayer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--DieByTheSword)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(1+this.variant*0.35), caster.maxDamage*(1+this.variant*0.35));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 0},
            energyCost : function(){return 150+this.variant*100},
            manaCost : function(){return 100+this.variant*75},
            cooldown : function(){return 11+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Reign In Blood": return {
            name : "Reign In Blood",
            variant: 3,
            role : function() {return "slayer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--ReignInBlood)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(0.8+this.variant*0.1), caster.maxDamage*(0.8+this.variant*0.1));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    if(target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        caster.addBuff(effectService.effect("Reign In Blood", this.variant), caster.charName, myTeam, enemyTeam);
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*75},
            manaCost : function(){return 100+this.variant*75},
            cooldown : function(){return 1},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Grinder": return {
            name : "Grinder",
            variant: 3,
            role : function() {return "slayer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Grinder)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());

                if(Math.random()>=((36-this.variant*6)*0.01)) {
                    this.cd=this.cooldown();
                }
                else {
                    caster.logBuffer.push(caster.charName+"'s grinder looking for meat!");
                }

                caster.playSound(this.name);
                var nearbyEnemies = caster.findEnemies(enemyTeam, 1);
                for (var i = 0; i < nearbyEnemies.length; i++) {
                    //Для той же цели не проверяем miss
                    if(caster.checkHit() || nearbyEnemies[i].charName===target.charName){
                        var physDamage = randomService.randomInt(caster.minDamage*(0.5+this.variant*0.2), caster.maxDamage*(0.5+this.variant*0.2));

                        var critical = caster.checkCrit();
                        if(critical){
                            physDamage=caster.applyCrit(physDamage);
                        }
                        physDamage=nearbyEnemies[i].applyResistance(physDamage, false);
                        nearbyEnemies[i].takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                    }
                    else {
                        caster.afterMiss(nearbyEnemies[i].charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                    }
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*75},
            manaCost : function(){return 150+this.variant*150},
            cooldown : function(){return 11+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Follow The Tears": return {
            name : "Follow The Tears",
            variant: 3,
            role : function() {return "slayer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--FollowTheTears)"},
            cast : function (caster, target, myTeam, enemyTeam) {

                if(caster.immobilized){
                    caster.logBuffer.push(caster.charName+" can't calculate the distance and miss with '"+this.name+"'");
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam, true);
                    return;
                }
                //Пробуем сделать чардж, если не удалось, пишем в лог
                if(!caster.charge(target, myTeam, enemyTeam)) {
                    caster.logBuffer.push(caster.charName+" can't calculate the distance and miss with '"+this.name+"'");
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam, true);
                    return;
                }

                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();

                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(0.5+this.variant*0.3), caster.maxDamage*(0.5+this.variant*0.3));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*100},
            manaCost : function(){return 150+this.variant*75},
            cooldown : function(){return 11+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Made In Hell": return {
            name : "Made In Hell",
            variant: 3,
            role : function() {return "slayer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--MadeInHell)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.addBuff(effectService.effect("Made In Hell", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 4+this.variant*2},
            energyCost : function(){return 200+this.variant*50},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 16+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Spill The Blood": return {
            name : "Spill The Blood",
            variant: 3,
            role : function() {return "slayer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--SpillTheBlood)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.addBuff(effectService.effect("Spill The Blood", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 12+this.variant},
            energyCost : function(){return 50+this.variant*100},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 12+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Dyers Eve": return {
            name : "Dyers Eve",
            variant: 3,
            role : function() {return "slayer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--DyersEve)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.addBuff(effectService.effect("Dyers Eve", this.variant), caster.charName, myTeam, enemyTeam);
                var heal=(500+this.variant*500)*(1+caster.spellPower);
                var critical = caster.checkCrit();
                if (critical) {
                    heal = caster.applyCrit(heal);
                }
                caster.takeHeal(heal, caster, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return this.variant},
            energyCost : function(){return 100+this.variant*50},
            manaCost : function(){return 100+this.variant*75},
            cooldown : function(){return 12+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "I Dont Wanna Stop": return {
            name : "I Dont Wanna Stop",
            variant: 3,
            role : function() {return "slayer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--IDontWannaStop)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.takeEnergy(100+this.variant*150, caster, this.name, false);
                caster.addBuff(effectService.effect("I Dont Wanna Stop", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 6+this.variant},
            energyCost : function(){return 300},
            manaCost : function(){return 100+this.variant*50},
            cooldown : function(){return 12+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        //REDEEMER

        case "Shot Down In Flames": return {
            name : "Shot Down In Flames",
            variant: 3,
            role : function() {return "redeemer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--ShotDownInFlames)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(0.6+(6-this.variant)*0.1), caster.maxDamage*(0.6+(6-this.variant)*0.1));
                    var magicDamage = (400+this.variant*50)*(1+caster.spellPower);
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);
                    magicDamage=target.applyResistance(magicDamage, true);

                    var totalDamage = physDamage+magicDamage;

                    caster.playSound(this.name);
                    target.takeDamage(totalDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 500},
            manaCost : function(){return 700},
            cooldown : function(){return 6},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Electric Eye": return {
            name : "Electric Eye",
            variant: 3,
            role : function() {return "redeemer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--ElectricEye)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(0.9+this.variant*0.1), caster.maxDamage*(0.9+this.variant*0.1));
                    var magicDamage = (300+this.variant*50)*(1+caster.spellPower);
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);
                    magicDamage=target.applyResistance(magicDamage, true);

                    var totalDamage = physDamage+magicDamage;

                    caster.playSound(this.name);
                    target.takeDamage(totalDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 4},
            duration: function(){return 0},
            energyCost : function(){return 250+this.variant*100},
            manaCost : function(){return 200+this.variant*100},
            cooldown : function(){return 17+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Lights In The Sky": return {
            name : "Lights In The Sky",
            variant: 3,
            role : function() {return "redeemer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--LightsInTheSky)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();

                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);
                target.addBuff(effectService.effect("Lights In The Sky", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 12},
            energyCost : function(){return 400},
            manaCost : function(){return 500},
            cooldown : function(){return 18},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Thunderstruck": return {
            name : "Thunderstruck",
            variant: 3,
            role : function() {return "redeemer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Thunderstruck)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var magicDamage = (80+this.variant*150)*(1+caster.spellPower);
                    var critical = caster.checkCrit();
                    if(critical){
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    magicDamage=target.applyResistance(magicDamage, true);

                    caster.playSound(this.name);
                    if(target.takeDamage(magicDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        if(target.controlImmune) {
                            caster.logBuffer.push(target.charName+" has immunity to control effects!");
                        }
                        else {
                            target.addDebuff(effectService.effect("Thunderstruck", this.variant), caster.charName, myTeam, enemyTeam);
                        }
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 2+this.variant},
            energyCost : function(){return 150+this.variant*100},
            manaCost : function(){return 200+this.variant*100},
            cooldown : function(){return 6+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "You Aint No Angel": return {
            name : "You Aint No Angel",
            variant: 3,
            role : function() {return "redeemer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--YouAintNoAngel)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.addBuff(effectService.effect("You Aint No Angel", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 4+this.variant*2},
            energyCost : function(){return 200+this.variant*50},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 16+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "State Of Grace": return {
            name : "State Of Grace",
            variant: 3,
            role : function() {return "redeemer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--StateOfGrace)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.takeEnergy(caster.maxEnergy, caster, this.name, false);
                caster.addBuff(effectService.effect("State Of Grace", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 7},
            energyCost : function(){return 450},
            manaCost : function(){return 1000},
            cooldown : function(){return 24},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "My Last Words": return {
            name : "My Last Words",
            variant: 3,
            role : function() {return "redeemer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--MyLastWords)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(1+this.variant*0.2), caster.maxDamage*(1+this.variant*0.2));
                    var magicDamage = (400+this.variant*100)*(1+caster.spellPower);
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);
                    magicDamage=target.applyResistance(magicDamage, true);

                    var totalDamage = physDamage+magicDamage;

                    caster.playSound(this.name);
                    target.takeDamage(totalDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 150+this.variant*100},
            manaCost : function(){return 200+this.variant*150},
            cooldown : function(){return 10+this.variant*2},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Come Cover Me": return {
            name : "Come Cover Me",
            variant: 3,
            role : function() {return "redeemer"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--ComeCoverMe)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);
                target.charge(caster, myTeam, enemyTeam);
                target.addBuff(effectService.effect("Come Cover Me", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "allyNotMe"},
            range : function(){return 3},
            duration: function(){return 10-this.variant},
            energyCost : function(){return 250+this.variant*50},
            manaCost : function(){return 250+this.variant*100},
            cooldown : function(){return 7+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        //RIPPER

        case "Inject The Venom": return {
            name : "Inject The Venom",
            variant: 3,
            role : function() {return "ripper"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--InjectTheVenom)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(1+this.variant*0.1), caster.maxDamage*(1+this.variant*0.1));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    if(target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        target.addDebuff(effectService.effect("Inject The Venom", this.variant), caster.charName, myTeam, enemyTeam);
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 16-this.variant*2},
            energyCost : function(){return 150+this.variant*75},
            manaCost : function(){return 150+this.variant*100},
            cooldown : function(){return 5+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Invisible": return {
            name : "Invisible",
            variant: 3,
            role : function() {return "ripper"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Invisible)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.addBuff(effectService.effect("Invisible", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 3+this.variant*3},
            energyCost : function(){return 50+this.variant*100},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 3+this.variant*3},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Jawbreaker": return {
            name : "Jawbreaker",
            variant: 3,
            role : function() {return "ripper"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Jawbreaker)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(0.8+this.variant*0.1), caster.maxDamage*(0.8+this.variant*0.1));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    if(target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        if(target.controlImmune) {
                            caster.logBuffer.push(target.charName+" has immunity to control effects!");
                        }
                        else {
                            target.addDebuff(effectService.effect("Jawbreaker", this.variant), caster.charName, myTeam, enemyTeam);
                        }
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 5+this.variant},
            energyCost : function(){return 100+this.variant*100},
            manaCost : function(){return 150+this.variant*75},
            cooldown : function(){return 15+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Hog Tied": return {
            name : "Hog Tied",
            variant: 3,
            role : function() {return "ripper"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--HogTied)"},
            cast : function (caster, target, myTeam, enemyTeam) {

                if(caster.immobilized){
                    caster.logBuffer.push(caster.charName+" can't calculate the distance and miss with '"+this.name+"'");
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam, true);
                    return;
                }
                //Пробуем сделать чардж, если не удалось, пишем в лог
                if(!caster.charge(target, myTeam, enemyTeam)) {
                    caster.logBuffer.push(caster.charName+" can't calculate the distance and miss with '"+this.name+"'");
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam, true);
                    return;
                }

                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(0.8+this.variant*0.15), caster.maxDamage*(0.8+this.variant*0.15));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    if(target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        if(target.controlImmune) {
                            caster.logBuffer.push(target.charName+" has immunity to control effects!");
                        }
                        else {
                            target.addDebuff(effectService.effect("Hog Tied", this.variant), caster.charName, myTeam, enemyTeam);
                        }
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 2},
            duration: function(){return 7+this.variant},
            energyCost : function(){return 150+this.variant*100},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 15+this.variant*2},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Running Free": return {
            name : "Running Free",
            variant: 3,
            role : function() {return "ripper"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--RunningFree)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.addBuff(effectService.effect("Running Free", this.variant), caster.charName, myTeam, enemyTeam);
                caster.removeImmobilization(myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 7+this.variant},
            energyCost : function(){return 50+this.variant*50},
            manaCost : function(){return 100+this.variant*75},
            cooldown : function(){return 12+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Fast As The Shark": return {
            name : "Fast As The Shark",
            variant: 3,
            role : function() {return "ripper"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--FastAsTheShark)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.addBuff(effectService.effect("Fast As The Shark", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 5+this.variant*2},
            energyCost : function(){return 50+this.variant*100},
            manaCost : function(){return 50+this.variant*100},
            cooldown : function(){return 10+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Prowler": return {
            name : "Prowler",
            variant: 3,
            role : function() {return "ripper"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Prowler)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(1+this.variant*0.1), caster.maxDamage*(1+this.variant*0.1));
                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);

                    caster.playSound(this.name);
                    if(target.takeDamage(physDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        if(target.controlImmune) {
                            caster.logBuffer.push(target.charName+" has immunity to control effects!");
                        }
                        else {
                            target.addDebuff(effectService.effect("Prowler", this.variant), caster.charName, myTeam, enemyTeam);
                        }
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 4+this.variant},
            energyCost : function(){return 100+this.variant*100},
            manaCost : function(){return 150+this.variant*75},
            cooldown : function(){return 12+this.variant*2},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Fade To Black": return {
            name : "Fade To Black",
            variant: 3,
            role : function() {return "ripper"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--FadeToBlack)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);
                target.addBuff(effectService.effect("Fade To Black", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "allyNotMe"},
            range : function(){return 3},
            duration: function(){return 3+this.variant*2},
            energyCost : function(){return 50+this.variant*100},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 3+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        //PROPHET

        case "Stargazer": return {
            name : "Stargazer",
            variant: 3,
            role : function() {return "prophet"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Stargazer)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(1+this.variant*0.1), caster.maxDamage*(1+this.variant*0.1));
                    var magicDamage = (250+this.variant*0.1*250)*(1+caster.spellPower);

                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);
                    magicDamage=target.applyResistance(magicDamage, true);

                    var totalDamage = physDamage+magicDamage;

                    caster.playSound(this.name);
                    if(target.takeDamage(totalDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        caster.addBuff(effectService.effect("Stargazer", this.variant), caster.charName, myTeam, enemyTeam);
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 5+this.variant},
            energyCost : function(){return 100+this.variant*100},
            manaCost : function(){return 200+this.variant*100},
            cooldown : function(){return 1},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Speed Of Light": return {
            name : "Speed Of Light",
            variant: 3,
            role : function() {return "prophet"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--SpeedOfLight)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.soundBuffer.push(this.name);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "move"},
            range : function(){return 1+this.variant},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*50},
            manaCost : function(){return 200+this.variant*100},
            cooldown : function(){return 12+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Never A Word": return {
            name : "Never A Word",
            variant: 3,
            role : function() {return "prophet"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--NeverAWord)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();

                if(caster.checkHit()) {
                    caster.logBuffer.push(caster.charName + " cast '" + this.name + "' on " + target.charName);
                    caster.playSound(this.name);

                    var nearbyEnemies = target.findAllies(enemyTeam, 1);
                    for (var i = 0; i < nearbyEnemies.length; i++) {
                        if (caster.checkHit()) {
                            if(nearbyEnemies[i].controlImmune) {
                                caster.logBuffer.push(nearbyEnemies[i].charName+" has immunity to control effects!");
                            }
                            else {
                                nearbyEnemies[i].addDebuff(effectService.effect("Never A Word", this.variant), caster.charName, myTeam, enemyTeam);
                            }
                        }
                        else {
                            caster.afterMiss(nearbyEnemies[i].charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                        }
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 5+this.variant},
            energyCost : function(){return 100+this.variant*75},
            manaCost : function(){return 150+this.variant*100},
            cooldown : function(){return 11+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Prophecy": return {
            name : "Prophecy",
            variant: 3,
            role : function() {return "prophet"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Prophecy)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                    caster.playSound(this.name);
                    target.addDebuff(effectService.effect("Prophecy", this.variant), caster.charName, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 11+this.variant},
            energyCost : function(){return 75+this.variant*50},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 5+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Lets Me Take It": return {
            name : "Lets Me Take It",
            variant: 3,
            role : function() {return "prophet"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--LetsMeTakeIt)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);
                if(target.findEffect("Locked And Loaded")!==-1) {
                    caster.logBuffer.push("Buffs can't be stolen, because target is under 'Locked And Loaded' effect!");
                    caster.afterCast(this.name, myTeam, enemyTeam);
                }
                else {
                    var stealedSpell = caster.stealRandomBuff(target, myTeam, enemyTeam);
                    if(stealedSpell==="Powerslave") caster.afterCast(this.name+"_Powerslave", myTeam, enemyTeam);
                    else caster.afterCast(this.name, myTeam, enemyTeam);
                }
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*25},
            manaCost : function(){return 200+this.variant*25},
            cooldown : function(){return 15-this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Brain Damage": return {
            name : "Brain Damage",
            variant: 3,
            role : function() {return "prophet"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--BrainDamage)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var magicDamage=0;
                    for(var i=0;i<target.abilities.length;i++){
                        magicDamage+=target.abilities[i].cd;
                    }
                    magicDamage = magicDamage*this.variant*12*(1+caster.spellPower);

                    var critical = caster.checkCrit();
                    if(critical){
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    magicDamage=target.applyResistance(magicDamage, true);

                    caster.playSound(this.name);
                    target.takeDamage(magicDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 125+this.variant*100},
            manaCost : function(){return 150+this.variant*150},
            cooldown : function(){return 8+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Infinite Dreams": return {
            name : "Infinite Dreams",
            variant: 3,
            role : function() {return "prophet"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--InfiniteDreams)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);
                target.addBuff(effectService.effect("Infinite Dreams", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 5+this.variant},
            energyCost : function(){return 100+this.variant*50},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 11+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Caught Somewhere In Time": return {
            name : "Caught Somewhere In Time",
            variant: 3,
            role : function() {return "prophet"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--CaughtSomewhereInTime)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                    caster.playSound(this.name);
                    target.addDebuff(effectService.effect("Caught Somewhere In Time", this.variant), caster.charName, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 12-this.variant},
            energyCost : function(){return 350},
            manaCost : function(){return 500},
            cooldown : function(){return 15},
            needWeapon : function() {return false},
            cd : 0
        };break;

        //MALEFIC

        case "Family Tree": return {
            name : "Family Tree",
            variant: 3,
            role : function() {return "malefic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--FamilyTree)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");

                var physDamage = randomService.randomInt(caster.minDamage*(this.variant*0.1+0.8), caster.maxDamage*(this.variant*0.1+0.8));
                var magicDamage = (150+this.variant*70)*(1+caster.spellPower);

                caster.playSound(this.name);
                var nearbyEnemies = caster.findEnemies(enemyTeam, 2);
                for (var i = 0; i < nearbyEnemies.length; i++) {
                    if(caster.checkHit()){
                        var critical = caster.checkCrit();
                        if(critical){
                            physDamage=caster.applyCrit(physDamage);
                            magicDamage=caster.applyCrit(magicDamage);
                        }
                        physDamage=nearbyEnemies[i].applyResistance(physDamage, false);
                        magicDamage=nearbyEnemies[i].applyResistance(magicDamage, true);

                        var totalDamage = physDamage+magicDamage;
                        nearbyEnemies[i].takeDamage(totalDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                    }
                    else {
                        caster.afterMiss(nearbyEnemies[i].charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                    }
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*50},
            manaCost : function(){return 100+this.variant*50},
            cooldown : function(){return 5+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Burning Ambition": return {
            name : "Burning Ambition",
            variant: 3,
            role : function() {return "malefic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--BurningAmbition)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var magicDamage = (200+this.variant*150)*(1+caster.spellPower);
                    var critical = caster.checkCrit();
                    if(critical){
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    magicDamage=target.applyResistance(magicDamage, true);

                    caster.playSound(this.name);
                    if(target.takeDamage(magicDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        if(target.controlImmune) {
                            caster.logBuffer.push(target.charName+" has immunity to control effects!");
                        }
                        else {
                            target.addDebuff(effectService.effect("Burning Ambition", this.variant), caster.charName, myTeam, enemyTeam);
                        }
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 4+this.variant},
            energyCost : function(){return 150+this.variant*75},
            manaCost : function(){return 200+this.variant*75},
            cooldown : function(){return 10+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Fireball": return {
            name : "Fireball",
            variant: 3,
            role : function() {return "malefic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Fireball)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()) {
                    //По цели
                    var magicDamage = (1250 + this.variant * 200) * (1 + caster.spellPower);
                    var critical = caster.checkCrit();
                    if (critical) {
                        magicDamage = caster.applyCrit(magicDamage);
                    }
                    magicDamage = target.applyResistance(magicDamage, true);

                    caster.playSound(this.name);
                    target.takeDamage(magicDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);

                    //АОЕ
                    magicDamage = (1500 - this.variant * 200) * (1 + caster.spellPower);

                    var nearbyEnemies = target.findAllies(enemyTeam, 1);
                    for (var i = 0; i < nearbyEnemies.length; i++) {
                        if (nearbyEnemies[i].charName !== target.charName) {
                            if (caster.checkHit()) {
                                critical = caster.checkCrit();
                                if (critical) {
                                    magicDamage = caster.applyCrit(magicDamage);
                                }
                                magicDamage = nearbyEnemies[i].applyResistance(magicDamage, true);
                                nearbyEnemies[i].takeDamage(magicDamage, caster, {name: this.name + " (area effect)", icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                            }
                            else {
                                caster.afterMiss(nearbyEnemies[i].charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                            }
                        }
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 300},
            manaCost : function(){return 500},
            cooldown : function(){return 12},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Thank God For The Bomb": return {
            name : "Thank God For The Bomb",
            variant: 3,
            role : function() {return "malefic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--ThankGodForTheBomb)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                    caster.playSound(this.name);
                    target.addDebuff(effectService.effect("Thank God For The Bomb", this.variant), caster.charName, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 5+this.variant},
            energyCost : function(){return 100+this.variant*100},
            manaCost : function(){return 200+this.variant*150},
            cooldown : function(){return 5+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Powerslave": return {
            name : "Powerslave",
            variant: 3,
            role : function() {return "malefic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Powerslave)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.addBuff(effectService.effect("Powerslave", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*75},
            manaCost : function(){return 100+this.variant*100},
            cooldown : function(){return 18+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Cauterization": return {
            name : "Cauterization",
            variant: 3,
            role : function() {return "malefic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Cauterization)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);
                target.addBuff(effectService.effect("Cauterization", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 4+this.variant},
            energyCost : function(){return 150+this.variant*50},
            manaCost : function(){return 100+this.variant*50},
            cooldown : function(){return 10+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Down In Flames": return {
            name : "Down In Flames",
            variant: 3,
            role : function() {return "malefic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--DownInFlames)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                caster.addBuff(effectService.effect("Down In Flames", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 0},
            energyCost : function(){return 75+this.variant*50},
            manaCost : function(){return 150+this.variant*100},
            cooldown : function(){return 0},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Fight Fire With Fire": return {
            name : "Fight Fire With Fire",
            variant: 3,
            role : function() {return "malefic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--FightFireWithFire)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);
                target.addBuff(effectService.effect("Fight Fire With Fire", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 10+this.variant},
            energyCost : function(){return 125+this.variant*50},
            manaCost : function(){return 150+this.variant*50},
            cooldown : function(){return 13+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        //CLERIC

        case "Hammer Of The Gods": return {
            name : "Hammer Of The Gods",
            variant: 3,
            role : function() {return "cleric"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--HammerOfTheGods)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(1+this.variant*0.15), caster.maxDamage*(1+this.variant*0.15));
                    var magicDamage = (400+this.variant*75)*(1+caster.spellPower);

                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);
                    magicDamage=target.applyResistance(magicDamage, true);

                    var totalDamage = physDamage+magicDamage;

                    caster.playSound(this.name);
                    if(target.takeDamage(totalDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        caster.takeMana(totalDamage*0.5, caster, this.name, critical);
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 0},
            energyCost : function(){return 100+this.variant*75},
            manaCost : function(){return 75+this.variant*75},
            cooldown : function(){return 5+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Mercyful Fate": return {
            name : "Mercyful Fate",
            variant: 3,
            role : function() {return "cleric"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--MercyfulFate)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);
                target.addBuff(effectService.effect("Mercyful Fate", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 12-this.variant},
            energyCost : function(){return 150+this.variant*50},
            manaCost : function(){return 150+this.variant*100},
            cooldown : function(){return 0},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Laying On Hands": return {
            name : "Laying On Hands",
            variant: 3,
            role : function() {return "cleric"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--LayingOnHands)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                var heal= target.maxHealth*(0.1+this.variant*0.15)*(1+caster.spellPower);
                var critical = caster.checkCrit();
                if (critical) {
                    heal = caster.applyCrit(heal);
                }

                caster.playSound(this.name);
                target.takeHeal(heal, caster, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 50+this.variant*150},
            manaCost : function(){return 150+this.variant*150},
            cooldown : function(){return 15+this.variant*3},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Holy Smoke": return {
            name : "Holy Smoke",
            variant: 3,
            role : function() {return "cleric"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--HolySmoke)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();

                var targetIsAlly=false;
                for(var i=0;i<myTeam.length;i++){
                    if(myTeam[i].charName===target.charName) targetIsAlly=true;
                }
                if(targetIsAlly) {
                    var heal=(250+this.variant*250)*(1+caster.spellPower);
                    var critical = caster.checkCrit();
                    if (critical) {
                        heal = caster.applyCrit(heal);
                    }
                    caster.playSound(this.name);
                    target.takeHeal(heal, caster, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                }
                else {
                    if(caster.checkHit()){
                        var magicDamage = (150+this.variant*150)*(1+caster.spellPower);
                        critical = caster.checkCrit();
                        if(critical){
                            magicDamage=caster.applyCrit(magicDamage);
                        }
                        magicDamage=target.applyResistance(magicDamage, true);

                        caster.playSound(this.name);
                        target.takeDamage(magicDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                    }
                    else {
                        caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                    }
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally&enemy"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 250+this.variant*100},
            manaCost : function(){return 200+this.variant*150},
            cooldown : function(){return 5+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Cleanse The Soul": return {
            name : "Cleanse The Soul",
            variant: 3,
            role : function() {return "cleric"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--CleanseTheSoul)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);

                if(target.findEffect("Locked And Loaded")!==-1) {
                    caster.logBuffer.push("Debuffs can't be removed, because target is under 'Locked And Loaded' effect!");
                }
                else {
                    for(var i=0;i<this.variant;i++) {
                        target.removeRandomDebuff(myTeam, enemyTeam);
                    }
                }

                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 150+this.variant*50},
            manaCost : function(){return 200+this.variant*75},
            cooldown : function(){return 5+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Hallowed Be Thy Name": return {
            name : "Hallowed Be Thy Name",
            variant: 3,
            role : function() {return "cleric"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--HallowedBeThyName)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);
                target.addBuff(effectService.effect("Hallowed Be Thy Name", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 12},
            energyCost : function(){return 200},
            manaCost : function(){return 400},
            cooldown : function(){return 12},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Hit The Lights": return {
            name : "Hit The Lights",
            variant: 3,
            role : function() {return "cleric"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--HitTheLights)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                caster.playSound(this.name);

                var magicDamage = (775-this.variant*75)*(1+caster.spellPower);
                var nearbyEnemies = caster.findEnemies(enemyTeam, 2);
                for (var i = 0; i < nearbyEnemies.length; i++) {
                    if(caster.checkHit()){
                        var critical = caster.checkCrit();
                        if(critical){
                            magicDamage=caster.applyCrit(magicDamage);
                        }
                        magicDamage=nearbyEnemies[i].applyResistance(magicDamage, true);

                        nearbyEnemies[i].takeDamage(magicDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                    }
                    else {
                        caster.afterMiss(nearbyEnemies[i].charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                    }
                }

                var heal=(325+this.variant*75)*(1+caster.spellPower);
                var nearbyAllies = caster.findAllies(myTeam, 2);
                for (i = 0; i < nearbyAllies.length; i++) {
                    critical = caster.checkCrit();
                    if (critical) {
                        heal = caster.applyCrit(heal);
                    }
                    nearbyAllies[i].takeHeal(heal, caster, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                }

                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "self"},
            range : function(){return 0},
            duration: function(){return 0},
            energyCost : function(){return 400},
            manaCost : function(){return 750},
            cooldown : function(){return 12},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Heaven Can Wait": return {
            name : "Heaven Can Wait",
            variant: 3,
            role : function() {return "cleric"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--HeavenCanWait)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);

                target.removeAllDebuffs(myTeam, enemyTeam);

                target.addBuff(effectService.effect("Heaven Can Wait", this.variant), caster.charName, myTeam, enemyTeam);
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally"},
            range : function(){return 3},
            duration: function(){return 4+this.variant},
            energyCost : function(){return 150+this.variant*75},
            manaCost : function(){return 150+this.variant*100},
            cooldown : function(){return 28-this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        //HERETIC

        case "Bloodsucker": return {
            name : "Bloodsucker",
            variant: 3,
            role : function() {return "heretic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Bloodsucker)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var physDamage = randomService.randomInt(caster.minDamage*(1+this.variant*0.1), caster.maxDamage*(1+this.variant*0.1));
                    var magicDamage = (150+this.variant*15)*(1+caster.spellPower);

                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);
                    magicDamage=target.applyResistance(magicDamage, true);

                    caster.playSound(this.name);
                    var totalDamage = physDamage+magicDamage;

                    if(target.takeDamage(totalDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        caster.takeHeal(totalDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 0},
            energyCost : function(){return 150+this.variant*75},
            manaCost : function(){return 175+this.variant*125},
            cooldown : function(){return 5+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

        case "Fear Of The Dark": return {
            name : "Fear Of The Dark",
            variant: 3,
            role : function() {return "heretic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--FearOfTheDark)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var magicDamage = (300 + this.variant * 60) * (1 + caster.spellPower);
                    var critical = caster.checkCrit();
                    if (critical) {
                        magicDamage = caster.applyCrit(magicDamage);
                    }
                    magicDamage = target.applyResistance(magicDamage, true);

                    caster.playSound(this.name);
                    if(target.takeDamage(magicDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                        target.addDebuff(effectService.effect("Fear Of The Dark", this.variant), caster.charName, myTeam, enemyTeam);
                    }
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 12-this.variant},
            energyCost : function(){return 150+this.variant*50},
            manaCost : function(){return 250+this.variant*150},
            cooldown : function(){return 12+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Creeping Death": return {
            name : "Creeping Death",
            variant: 3,
            role : function() {return "heretic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--CreepingDeath)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                    caster.playSound(this.name);
                    target.addDebuff(effectService.effect("Creeping Death", this.variant), caster.charName, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 12-this.variant},
            energyCost : function(){return 150+this.variant*50},
            manaCost : function(){return 300+this.variant*100},
            cooldown : function(){return 0},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Spreading The Disease": return {
            name : "Spreading The Disease",
            variant: 3,
            role : function() {return "heretic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--SpreadingTheDisease)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                    caster.playSound(this.name);
                    target.addDebuff(effectService.effect("Spreading The Disease", this.variant), caster.charName, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 6+this.variant},
            energyCost : function(){return 150+this.variant*50},
            manaCost : function(){return 300+this.variant*100},
            cooldown : function(){return  8-this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Purgatory": return {
            name : "Purgatory",
            variant: 3,
            role : function() {return "heretic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--Purgatory)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                caster.playSound(this.name);

                if(target.findEffect("Locked And Loaded")!==-1) {
                    caster.logBuffer.push("Buffs can't be removed, because target is under 'Locked And Loaded' effect!");
                }
                else{
                    for(var i=0;i<this.variant;i++) {
                        target.removeRandomBuff(enemyTeam, myTeam);
                    }
                }

                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 0},
            energyCost : function(){return 150+this.variant*50},
            manaCost : function(){return 200+this.variant*75},
            cooldown : function(){return 5+this.variant},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Children Of The Damned": return {
            name : "Children Of The Damned",
            variant: 3,
            role : function() {return "heretic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--ChildrenOfTheDamned)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();

                if(caster.checkHit()){
                    caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                    caster.playSound(this.name);
                    target.addDebuff(effectService.effect("Children Of The Damned", this.variant), caster.charName, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 3},
            duration: function(){return 12},
            energyCost : function(){return 200},
            manaCost : function(){return 400},
            cooldown : function(){return 12},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "Locked And Loaded": return {
            name : "Locked And Loaded",
            variant: 3,
            role : function() {return "heretic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--LockedAndLoaded)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();

                var targetIsAlly=false;
                for(var i=0;i<myTeam.length;i++){
                    if(myTeam[i].charName===target.charName) targetIsAlly=true;
                }
                if(targetIsAlly) {
                    caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                    caster.playSound(this.name);
                    target.addDebuff(effectService.effect("Locked And Loaded", this.variant), caster.charName, enemyTeam, myTeam);
                }
                else {
                    if(caster.checkHit()){
                        caster.logBuffer.push(caster.charName+" cast '"+this.name+"' on "+target.charName);
                        caster.playSound(this.name);
                        target.addDebuff(effectService.effect("Locked And Loaded", this.variant), caster.charName, myTeam, enemyTeam);
                    }
                    else {
                        caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                    }
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "ally&enemy"},
            range : function(){return 3},
            duration: function(){return 4+this.variant*2},
            energyCost : function(){return 50+this.variant*50},
            manaCost : function(){return 100+this.variant*50},
            cooldown : function(){return 20+this.variant*2},
            needWeapon : function() {return false},
            cd : 0
        };break;

        case "A Touch Of Evil": return {
            name : "A Touch Of Evil",
            variant: 3,
            role : function() {return "heretic"},
            icon : function() { return "url(../images/assets/svg/view/sprites.svg#abilities--ATouchOfEvil)"},
            cast : function (caster, target, myTeam, enemyTeam) {
                caster.spendEnergy(this.energyCost());
                caster.spendMana(this.manaCost());
                this.cd=this.cooldown();
                if(caster.checkHit()){
                    var totalEffects=0;
                    for(var i=0;i<target.buffs.length;i++){
                        if(target.buffs[i].stacked()) totalEffects+=target.buffs[i].stacks;
                        else totalEffects++;
                    }
                    for(i=0;i<target.debuffs.length;i++){
                        if(target.debuffs[i].stacked()) totalEffects+=target.debuffs[i].stacks;
                        else totalEffects++;
                    }

                    var physDamage = randomService.randomInt(caster.minDamage*(0.1+this.variant*0.06)*totalEffects, caster.maxDamage*(0.1+this.variant*0.06)*totalEffects);
                    var magicDamage = (40+this.variant*25)*(1+caster.spellPower)*totalEffects;

                    var critical = caster.checkCrit();
                    if(critical){
                        physDamage=caster.applyCrit(physDamage);
                        magicDamage=caster.applyCrit(magicDamage);
                    }
                    physDamage=target.applyResistance(physDamage, false);
                    magicDamage=target.applyResistance(magicDamage, true);

                    caster.playSound(this.name);
                    var totalDamage = physDamage+magicDamage;

                    target.takeDamage(totalDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);
                }
                else {
                    caster.afterMiss(target.charName, {name: this.name, icon: this.icon(), role: this.role()}, myTeam, enemyTeam);
                }
                caster.afterCast(this.name, myTeam, enemyTeam);
            },
            targetType : function() { return "enemy"},
            range : function(){return 1},
            duration: function(){return 0},
            energyCost : function(){return 125+this.variant*75},
            manaCost : function(){return 150+this.variant*125},
            cooldown : function(){return 7+this.variant},
            needWeapon : function() {return true},
            cd : 0
        };break;

    }
};

module.exports = function(name) {
    return new Ability(name);
};

