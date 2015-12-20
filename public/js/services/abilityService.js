//Сервис способностей в игре
angular.module('fotm').register.service('abilityService', ["randomService", "effectService","gettextCatalog", function(randomService, effectService, gettextCatalog) {
    return {
        ability: function(name){
            switch(name){
                case "Void": return {
                    name : "Void",
                    localName: function(){return gettextCatalog.getString("Void")},
                    role : function() {return "void"},
                    desc: function(){
                        return "Empty";
                    },
                    icon : function() { return "url(../images/icons/abilities/void.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        return false;
                    },
                    targetType : function() { return "self"},
                    range: function() {return 0},
                    energyCost : function() {return 99999},
                    manaCost : function() {return 99999},
                    cooldown : function() {return 6},
                    needWeapon : function() {return false},
                    cd : 0
                };break;

                //SENTINEL

                case "Strong Arm Of The Law": return {
                    name : "Strong Arm Of The Law",
                    localName: function(){return gettextCatalog.getString("Strong Arm Of The Law")},
                    variant: 3,
                    role : function() {return "sentinel"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Strikes enemy, deals {{one}}% of weapon damage and increases Hit Chance to {{two}}%",{
                                one: (this.variant*20+100).toFixed(0),
                                two: (this.variant*10)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/StrongArmOfTheLaw.svg)"},
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
                                caster.addBuff(effectService.effect("Strong Arm Of The Law", this.variant), caster.charName, myTeam, enemyTeam);
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
                    localName: function(){return gettextCatalog.getString("Defender Of The Faith")},
                    variant: 3,
                    role : function() {return "sentinel"},
                    desc: function() {
                        switch(this.variant){
                            case 1: return gettextCatalog.getString("Cast on ally target. Increases Block Chance, Magical and Physical Resistances for 10%."); break;
                            case 2: return gettextCatalog.getString("Increases Block Chance, Magical and Physical Resistances of all party members for 10%"); break;
                            case 3: return gettextCatalog.getString("Cast on ally target. Increases Block Chance, Magical and Physical Resistances for 20%"); break;
                            case 4: return gettextCatalog.getString("Increases Block Chance, Magical and Physical Resistances of all party members for 20%"); break;
                            case 5: return gettextCatalog.getString("Cast on ally target. Increases Block Chance, Magical and Physical Resistances for 40%"); break;
                        }

                    },
                    icon : function() { return "url(../images/icons/abilities/DefenderOfTheFaith.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Disarm")},
                    variant: 3,
                    role : function() {return "sentinel"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Takes off target weapon and some armor. Reduces target physical resistance for {{one}}%.",{
                                one: (this.variant*7).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/Disarm.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Walk Away")},
                    variant: 3,
                    role : function() {return "sentinel"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Strikes enemy with shield, deals {{one}}% of weapon damage, throws enemy away and stuns him",{
                                one: (this.variant*30+80).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/WalkAway.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Sanctuary")},
                    variant: 3,
                    role : function() {return "sentinel"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Cast on ally target. Caster takes {{one}}% of damage taken by target ally.",{
                                one: (this.variant*15).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/Sanctuary.svg)"},
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
                    localName: function(){return gettextCatalog.getString("The Punishment Due")},
                    variant: 3,
                    role : function() {return "sentinel"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Strikes enemy, deals {{one}}% of weapon damage. After that causes bleeding for {{two}}% of dealing damage",{
                                one: (this.variant*10+90).toFixed(0),
                                two: (this.variant*10).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/ThePunishmentDue.svg)"},
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
                    energyCost : function(){return 150+this.variant*100},
                    manaCost : function(){return 100+this.variant*100},
                    cooldown : function(){return 11+this.variant},
                    needWeapon : function() {return true},
                    cd : 0
                };break;

                case "Come And Get It": return {
                    name : "Come And Get It",
                    localName: function(){return gettextCatalog.getString("Come And Get It")},
                    variant: 3,
                    role : function() {return "sentinel"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Throws spear to enemy, deals {{one}}% of weapon damage and draws the target to caster.",{
                                one: (this.variant*20+50).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/ComeAndGetIt.svg)"},
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
                            caster.logBuffer.push(caster.charName+" miss against "+target.charName+" with '"+this.name+"'");
                        }
                        caster.afterCast(this.name, myTeam, enemyTeam);
                    },
                    targetType : function() { return "enemy"},
                    range : function(){return 3},
                    duration: function(){return 0},
                    energyCost : function(){return 150+this.variant*75},
                    manaCost : function(){return 200+this.variant*100},
                    cooldown : function(){return 11+this.variant},
                    needWeapon : function() {return true},
                    cd : 0
                };break;

                case "New Faith": return {
                    name : "New Faith",
                    localName: function(){return gettextCatalog.getString("New Faith")},
                    variant: 3,
                    role : function() {return "sentinel"},
                    desc: function() {
                        return gettextCatalog.getString("Cast on ally target. Removes 3 random negative effects, that cause periodic damage. Restore {{one}} health.",{one: (100+this.variant*150).toFixed(0)});
                    },
                    icon : function() { return "url(../images/icons/abilities/NewFaith.svg)"},
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

                        var heal=(100+this.variant*150)*(1+caster.spellPower);
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
                    cooldown : function(){return 8+this.variant},
                    needWeapon : function() {return false},
                    cd : 0
                };break;

                //SLAYER

                case "Die By The Sword": return {
                    name : "Die By The Sword",
                    localName: function(){return gettextCatalog.getString("Die By The Sword")},
                    variant: 3,
                    role : function() {return "slayer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Strikes enemy, deals {{one}}% of weapon damage.",{
                                one: (this.variant*35+100).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/DieByTheSword.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Reign In Blood")},
                    variant: 3,
                    role : function() {return "slayer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Strikes enemy, deals {{one}}% of weapon damage and increases Attack Power to {{two}}% until miss. Stacks up 5 times.",{
                                one: (this.variant*10+80).toFixed(0),
                                two: (this.variant*2)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/ReignInBlood.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Grinder")},
                    variant: 3,
                    role : function() {return "slayer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Strikes all enemies in 1 cell radius, deals {{one}}% of weapon damage. Ability has {{two}}% chance to restore it's cooldown immediately.",{
                                one: (this.variant*10+50).toFixed(0),
                                two: (36-this.variant*6)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/Grinder.svg)"},
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
                            if(caster.checkHit()){
                                var physDamage = randomService.randomInt(caster.minDamage*(0.5+this.variant*0.1), caster.maxDamage*(0.5+this.variant*0.1));

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
                    localName: function(){return gettextCatalog.getString("Follow The Tears")},
                    variant: 3,
                    role : function() {return "slayer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Charges to enemy and deals {{one}}% of weapon damage.",{
                                one: (this.variant*30+70).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/FollowTheTears.svg)"},
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
                            var physDamage = randomService.randomInt(caster.minDamage*(0.7+this.variant*0.3), caster.maxDamage*(0.7+this.variant*0.3));
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
                    localName: function(){return gettextCatalog.getString("Made In Hell")},
                    variant: 3,
                    role : function() {return "slayer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Calls to hell and becomes immune to magical attacks");
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        str+=" ";
                        str+= gettextCatalog.getString(
                            "Mana Regeneration increased to {{one}} %.",{
                                one: (this.variant*60).toFixed(0)
                            });
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/MadeInHell.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Spill The Blood")},
                    variant: 3,
                    role : function() {return "slayer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Attack Power increased to {{one}}%. Health Regeneration increased to {{two}}%.",{
                                one: (this.variant*10).toFixed(0),
                                two: (this.variant*15).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/SpillTheBlood.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Dyers Eve")},
                    variant: 3,
                    role : function() {return "slayer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Ability can be used only if character health is less than 50%. Heals up caster for {{one}} and increases Critical Chance for {{two}}%.",{
                                one: (300+this.variant*200).toFixed(0),
                                two: (this.variant*20).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/DyersEve.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();
                        caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                        caster.playSound(this.name);
                        caster.addBuff(effectService.effect("Dyers Eve", this.variant), caster.charName, myTeam, enemyTeam);
                        var heal=(300+this.variant*200)*(1+caster.spellPower);
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
                    localName: function(){return gettextCatalog.getString("I Dont Wanna Stop")},
                    variant: 3,
                    role : function() {return "slayer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Character becomes immune to control abilities");
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        str+=" ";
                        str+= gettextCatalog.getString(
                            "Restores {{one}} energy.",{
                                one: (100+this.variant*100).toFixed(0)
                            });
                        str+=" ";
                        str+= gettextCatalog.getString(
                            "This ability doesn't remove control effects, which is already on character.");
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/IDontWannaStop.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();
                        caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                        caster.playSound(this.name);
                        caster.takeEnergy(100+this.variant*100, caster, this.name, false);
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
                    localName: function(){return gettextCatalog.getString("Shot Down In Flames")},
                    variant: 3,
                    role : function() {return "redeemer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Shoots the enemy, deals {{one}}% of weapon damage and {{two}} magical damage.",{
                                one: ((6-this.variant)*10+80).toFixed(0),
                                two: (600+this.variant*70).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/ShotDownInFlames.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();
                        if(caster.checkHit()){
                            var physDamage = randomService.randomInt(caster.minDamage*(0.8+(6-this.variant)*0.1), caster.maxDamage*(0.8+(6-this.variant)*0.1));
                            var magicDamage = (600+this.variant*70)*(1+caster.spellPower);
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
                    localName: function(){return gettextCatalog.getString("Electric Eye")},
                    variant: 3,
                    role : function() {return "redeemer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Shoots the enemy, deals {{one}}% of weapon damage and {{two}} magical damage.",{
                                one: (this.variant*10+90).toFixed(0),
                                two: (400+this.variant*60).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/ElectricEye.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();
                        if(caster.checkHit()){
                            var physDamage = randomService.randomInt(caster.minDamage*(0.9+this.variant*0.1), caster.maxDamage*(0.9+this.variant*0.1));
                            var magicDamage = (400+this.variant*60)*(1+caster.spellPower);
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
                    localName: function(){return gettextCatalog.getString("Lights In The Sky")},
                    variant: 3,
                    role : function() {return "redeemer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Cast on ally target. Increases Hit Chance for {{one}}% and Critical Chance for {{two}}%.",{
                                one: (15+this.variant*2).toFixed(0),
                                two: (25-this.variant*2).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/LightsInTheSky.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Thunderstruck")},
                    variant: 3,
                    role : function() {return "redeemer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Throws lightning which deals {{one}} magical damage and stuns target",{
                                one: (80+this.variant*150).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/Thunderstruck.svg)"},
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
                    duration: function(){return 3+this.variant},
                    energyCost : function(){return 150+this.variant*100},
                    manaCost : function(){return 200+this.variant*100},
                    cooldown : function(){return 6+this.variant*2},
                    needWeapon : function() {return false},
                    cd : 0
                };break;

                case "You Aint No Angel": return {
                    name : "You Aint No Angel",
                    localName: function(){return gettextCatalog.getString("You Aint No Angel")},
                    variant: 3,
                    role : function() {return "redeemer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Up in the air and becomes immune to physical attacks");
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        str+=" ";
                        str+= gettextCatalog.getString(
                            "Health Regeneration increased to {{one}} %.",{
                                one: (this.variant*60).toFixed(0)
                            });
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/YouAintNoAngel.svg)"},
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
                    localName: function(){return gettextCatalog.getString("State Of Grace")},
                    variant: 3,
                    role : function() {return "redeemer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Fully restores energy. Every turn restores {{one}} health and {{two}} mana",{
                                one: (100+this.variant*60).toFixed(0),
                                two: (460-this.variant*60).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/StateOfGrace.svg)"},
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
                    localName: function(){return gettextCatalog.getString("My Last Words")},
                    variant: 3,
                    role : function() {return "redeemer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "This ability can be used only against characters with less than 50% health. Shoots the enemy, deals {{one}}% of weapon damage and {{two}} magical damage.",{
                                one: (this.variant*20+100).toFixed(0),
                                two: (400+this.variant*100).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/MyLastWords.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Come Cover Me")},
                    variant: 3,
                    role : function() {return "redeemer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Cast on ally target. Draws the target to caster. Every turn restores {{one}} target's health.",{
                                one: (100+this.variant*50).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/ComeCoverMe.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Inject The Venom")},
                    variant: 3,
                    role : function() {return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Strikes enemy, deals {{one}}% of weapon damage and injects the venom, what deals {{two}} magical damage",{
                                one: (this.variant*10+100).toFixed(0),
                                two: (this.variant*75)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"during next turn", "during next {{$count}} turns",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/InjectTheVenom.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Invisible")},
                    variant: 3,
                    role : function() {return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Character becomes invisible. Invisibility fades if owner takes or deals damage. While character is invisible, his Attack Power increased to {{one}}%.",{
                                one: (this.variant*20).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/Invisible.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Jawbreaker")},
                    variant: 3,
                    role : function() {return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Strikes enemy, deals {{one}}% of weapon damage and makes target silenced",{
                                one: (this.variant*10+80).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/Jawbreaker.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Hog Tied")},
                    variant: 3,
                    role : function() {return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Charges to enemy, deals {{one}}% of weapon damage and immobilizes target",{
                                one: (this.variant*15+80).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/HogTied.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Running Free")},
                    variant: 3,
                    role : function() {return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Decreases movement cost to {{one}} energy. Remove all immobilize effects.",{
                                one: (this.variant*40).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/RunningFree.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Fast As The Shark")},
                    variant: 3,
                    role : function() {return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Increases Luck for {{one}}% and Dodge Chance for {{two}}%",{
                                one: (this.variant*15).toFixed(0),
                                two: (this.variant*20).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/FastAsTheShark.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Prowler")},
                    variant: 3,
                    role : function() {return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Strikes enemy, deals {{one}}% of weapon damage and stuns target",{
                                one: (this.variant*10+100).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/Prowler.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Fade To Black")},
                    variant: 3,
                    role : function() {return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString("Cast on ally target. Target becomes invisible");
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        str+=" ";
                        str+=gettextCatalog.getString("Effect fades if owner takes or deals damage.");
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/FadeToBlack.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Stargazer")},
                    variant: 3,
                    role : function() {return "prophet"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Shoots the enemy with wand, deals {{one}}% of weapon damage, {{two}} magical damage and increases Spell Power to {{three}}%",{
                                one: (this.variant*10+100).toFixed(0),
                                two: (250+this.variant*0.1*250).toFixed(0),
                                three: this.variant
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        str+=" ";
                        str+=gettextCatalog.getString("Stacks up 5 times.");
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/Stargazer.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Speed Of Light")},
                    variant: 3,
                    role : function() {return "prophet"},
                    desc: function() {
                        return gettextCatalog.getPlural((1+this.variant),"Teleports character to any cell in {{$count}} cell radius.","Teleports character to any cell in {{$count}} cells radius.",{});
                    },
                    icon : function() { return "url(../images/icons/abilities/SpeedOfLight.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();
                        caster.logBuffer.push(caster.charName+" cast '"+this.name+"'");
                        caster.playSound(this.name);
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
                    localName: function(){return gettextCatalog.getString("Never A Word")},
                    variant: 3,
                    role : function() {return "prophet"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "All enemies in 1 cell radius becomes silenced");
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/NeverAWord.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();

                        if(caster.checkHit()) {
                            caster.logBuffer.push(caster.charName + " cast '" + this.name + "' on " + target.charName);
                            caster.playSound(this.name);
                            target.addDebuff(effectService.effect("Never A Word", this.variant), caster.charName, myTeam, enemyTeam);
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
                    localName: function(){return gettextCatalog.getString("Prophecy")},
                    variant: 3,
                    role : function() {return "prophet"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Shows current spells of the target. Decreases Magical Resistance and Initiative of the target to {{one}}%.",{
                                one: (this.variant*10).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/Prophecy.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Lets Me Take It")},
                    variant: 3,
                    role : function() {return "prophet"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Steals 1 random positive effect from enemy to caster.");
                    },
                    icon : function() { return "url(../images/icons/abilities/LetsMeTakeIt.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Brain Damage")},
                    variant: 3,
                    role : function() {return "prophet"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Deals {{one}} magical damage for every turn, that lefts for every target ability.",{
                                one: (this.variant*10).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/BrainDamage.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();
                        if(caster.checkHit()){
                            var magicDamage=0;
                            for(var i=0;i<target.abilities.length;i++){
                                magicDamage+=target.abilities[i].cd;
                            }
                            magicDamage = magicDamage*this.variant*10*(1+caster.spellPower);

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
                    energyCost : function(){return 125+this.variant*50},
                    manaCost : function(){return 150+this.variant*100},
                    cooldown : function(){return 7+this.variant},
                    needWeapon : function() {return false},
                    cd : 0
                };break;

                case "Infinite Dreams": return {
                    name : "Infinite Dreams",
                    localName: function(){return gettextCatalog.getString("Infinite Dreams")},
                    variant: 3,
                    role : function() {return "prophet"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Cast on ally target. Increases Initiative for {{one}}%. Every turn restores {{two}}% mana.",{
                                one: (this.variant*15).toFixed(0),
                                two: (this.variant*2).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/InfiniteDreams.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Caught Somewhere In Time")},
                    variant: 3,
                    role : function() {return "prophet"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Every turn deals {{one}} magical damage",{
                                one: (75*this.variant).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"during next turn", "during next {{$count}} turns",{});
                        str+=" ";
                        str+=gettextCatalog.getString("Immobilize target. Every turn damage from this effect rise up for {{one}}%.", {
                            one: (35-this.variant*5).toFixed(0)
                            });
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/CaughtSomewhereInTime.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Family Tree")},
                    variant: 3,
                    role : function() {return "malefic"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Malefic staff transforms into the burning tree. Deals {{one}}% of weapon damage and {{two}} magical damage to all enemies in 2 cell radius.",{
                                one: (this.variant*10+80).toFixed(0),
                                two: (150+this.variant*70).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/FamilyTree.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Burning Ambition")},
                    variant: 3,
                    role : function() {return "malefic"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Burns target weapon and deals {{one}} magical damage.",{
                                one: (200+this.variant*150).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Disarm lasts {{$count}} turn.", "Disarm lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/BurningAmbition.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Fireball")},
                    variant: 3,
                    role : function() {return "malefic"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Deals {{one}} magical damage to target and {{two}} magical damage to all enemy targets in 1 cell radius.",{
                                one: (1000+this.variant*150).toFixed(0),
                                two: (1250-this.variant*150).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/Fireball.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();
                        if(caster.checkHit()) {
                            //По цели
                            var magicDamage = (1000 + this.variant * 150) * (1 + caster.spellPower);
                            var critical = caster.checkCrit();
                            if (critical) {
                                magicDamage = caster.applyCrit(magicDamage);
                            }
                            magicDamage = target.applyResistance(magicDamage, true);

                            caster.playSound(this.name);
                            target.takeDamage(magicDamage, caster, {name: this.name, icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam);

                            //АОЕ
                            magicDamage = (1250 - this.variant * 150) * (1 + caster.spellPower);

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
                    localName: function(){return gettextCatalog.getString("Thank God For The Bomb")},
                    variant: 3,
                    role : function() {return "malefic"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Target becomes living bomb and every turn gets {{one}} magical damage",{
                                one: (100*this.variant).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"for next turn.", "for next {{$count}} turns.",{});
                        str+=" ";
                        str+=gettextCatalog.getString(
                            "When this effect ends, all enemies in one cell radius around target gets {{one}} magical damage and becomes stunned for 3 turns.",{
                                one: (300*this.variant).toFixed(0)
                            });
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/ThankGodForTheBomb.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Powerslave")},
                    variant: 3,
                    role : function() {return "malefic"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Increases Spell Power for {{one}}%. Brings you in clearcasting state. In this state you doesn't need mana for abilities. This effect is active until you use any ability.",{
                                one: (this.variant*15).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/Powerslave.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Cauterization")},
                    variant: 3,
                    role : function() {return "malefic"},
                    desc: function() {
                        var str = gettextCatalog.getString("Cast on ally target. Every turn restores {{one}} health and burns {{two}} mana.", {
                            one: (this.variant*100).toFixed(0),
                            two: (this.variant*75).toFixed(0)
                    });
                    str+=" ";
                    str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                    return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/Cauterization.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Down In Flames")},
                    variant: 3,
                    role : function() {return "malefic"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Increases Spell Power and Critical Chance for {{one}}%. Effect fades if you miss. Stacks up 10 times.",{
                                one: (this.variant).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/DownInFlames.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Fight Fire With Fire")},
                    variant: 3,
                    role : function() {return "malefic"},
                    desc: function() {
                        var str = gettextCatalog.getString("Returns {{one}}% of damage back to the attacker.", {
                            one: (20+this.variant*10).toFixed(0)
                        });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/FightFireWithFire.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Hammer Of The Gods")},
                    variant: 3,
                    role : function() {return "cleric"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Strikes enemy with hammer, deals {{one}}% of weapon damage, {{two}} magical damage and restores mana equal to dealing damage.",{
                                one: (this.variant*15+100).toFixed(0),
                                two: (200+this.variant*25).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/HammerOfTheGods.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();
                        if(caster.checkHit()){
                            var physDamage = randomService.randomInt(caster.minDamage*(1+this.variant*0.15), caster.maxDamage*(1+this.variant*0.15));
                            var magicDamage = (200+this.variant*25)*(1+caster.spellPower);

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
                                caster.takeMana(totalDamage, caster, this.name, critical);
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
                    cooldown : function(){return 7+this.variant},
                    needWeapon : function() {return true},
                    cd : 0
                };break;

                case "Mercyful Fate": return {
                    name : "Mercyful Fate",
                    localName: function(){return gettextCatalog.getString("Mercyful Fate")},
                    variant: 3,
                    role : function() {return "cleric"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Cast on ally target. Every turn restores {{one}} health. Stacks up 3 times.",{
                                one: (50+this.variant*10).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/MercyfulFate.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Laying On Hands")},
                    variant: 3,
                    role : function() {return "cleric"},
                    desc: function() {
                        switch(this.variant){
                            case 1: return gettextCatalog.getString("Heals 500 health for one target"); break;
                            case 2: return gettextCatalog.getString("Heals 1000 health for one target"); break;
                            case 3: return gettextCatalog.getString("Heals 2000 health for one target"); break;
                            case 4: return gettextCatalog.getString("Heals 5000 health for one target"); break;
                            case 5: return gettextCatalog.getString("Restore full health for one target"); break;
                        }
                    },
                    icon : function() { return "url(../images/icons/abilities/LayingOnHands.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();
                        var heal=0;
                        switch(this.variant){
                            case 1: heal=500*(1+caster.spellPower); break;
                            case 2: heal=1000*(1+caster.spellPower); break;
                            case 3: heal=2000*(1+caster.spellPower); break;
                            case 4: heal=5000*(1+caster.spellPower); break;
                            case 5: heal=target.maxHealth; break;
                        }
                        if(this.variant<5) {
                            var critical = caster.checkCrit();
                            if (critical) {
                                heal = caster.applyCrit(heal);
                            }
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
                    cooldown : function(){return 18+this.variant*4},
                    needWeapon : function() {return false},
                    cd : 0
                };break;

                case "Holy Smoke": return {
                    name : "Holy Smoke",
                    localName: function(){return gettextCatalog.getString("Holy Smoke")},
                    variant: 3,
                    role : function() {return "cleric"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Heals up ally target for {{one}}. Or deals {{two}} magical damage to enemy target.",{
                                one: (250+this.variant*200).toFixed(0),
                                two: (150+this.variant*100).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/HolySmoke.svg)"},
                    cast : function (caster, target, myTeam, enemyTeam) {
                        caster.spendEnergy(this.energyCost());
                        caster.spendMana(this.manaCost());
                        this.cd=this.cooldown();

                        var targetIsAlly=false;
                        for(var i=0;i<myTeam.length;i++){
                            if(myTeam[i].charName===target.charName) targetIsAlly=true;
                        }
                        if(targetIsAlly) {
                            var heal=(250+this.variant*200)*(1+caster.spellPower);
                            var critical = caster.checkCrit();
                            if (critical) {
                                heal = caster.applyCrit(heal);
                            }
                            caster.playSound(this.name);
                            target.takeHeal(heal, caster, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                        }
                        else {
                            if(caster.checkHit()){
                                var magicDamage = (150+this.variant*100)*(1+caster.spellPower);
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
                    localName: function(){return gettextCatalog.getString("Cleanse The Soul")},
                    variant: 3,
                    role : function() {return "cleric"},
                    desc: function() {
                        return gettextCatalog.getPlural(this.variant,"Removes {{$count}} random negative effects from ally.", "Removes {{$count}} random negative effect from ally.",{});
                    },
                    icon : function() { return "url(../images/icons/abilities/CleanseTheSoul.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Hallowed Be Thy Name")},
                    variant: 3,
                    role : function() {return "cleric"},
                    desc: function() {
                        switch(this.variant){
                            case 1: return gettextCatalog.getString("Cast on ally target. Increases Attack Power and Block Chance for 25%."); break;
                            case 2: return gettextCatalog.getString("Cast on ally target. Increases Critical Chance and Dodge Chance for 25%."); break;
                            case 3: return gettextCatalog.getString("Cast on ally target. Increases Spell Power and Hit Chance for 25%."); break;
                            case 4: return gettextCatalog.getString("Cast on ally target. Increases Physical Resistance and Health Regeneration for 25%."); break;
                            case 5: return gettextCatalog.getString("Cast on ally target. Increases Magical Resistance and Mana Regeneration for 25%."); break;
                        }

                    },
                    icon : function() { return "url(../images/icons/abilities/HallowedBeThyName.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Hit The Lights")},
                    variant: 3,
                    role : function() {return "cleric"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Cleric shines on all targets in 2 cell radius. Deals {{one}} magical damage to all enemies. And heals up allies for {{two}}.",{
                                one: (775-this.variant*75).toFixed(0),
                                two: (325+this.variant*75).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/HitTheLights.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Heaven Can Wait")},
                    variant: 3,
                    role : function() {return "cleric"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Cast on ally target. Removes all debuffs from target and makes it immune to physical and magical attacks.");
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/HeavenCanWait.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Bloodsucker")},
                    variant: 3,
                    role : function() {return "heretic"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Strikes enemy with dagger, deals {{one}}% of weapon damage, {{two}} magical damage and restores health equal to dealing damage.",{
                                one: (this.variant*10+100).toFixed(0),
                                two: (150+this.variant*15).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/Bloodsucker.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Fear Of The Dark")},
                    variant: 3,
                    role : function() {return "heretic"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Deals {{one}} magical damage and infects target with Fear Of The Dark, which deals {{two}} magical damage",{
                                one: (300+this.variant*60).toFixed(0),
                                two: (40+this.variant*60).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"during next turn", "during next {{$count}} turns",{});
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/FearOfTheDark.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Creeping Death")},
                    variant: 3,
                    role : function() {return "heretic"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Every turn deals {{one}} magical damage",{
                                one: (30*this.variant).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"during next turn", "during next {{$count}} turns",{});
                        str+=" ";
                        str+=gettextCatalog.getString("Stacks up 5 times.");
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/CreepingDeath.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Spreading The Disease")},
                    variant: 3,
                    role : function() {return "heretic"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Every turn deals {{one}} magical damage. Decreases target's Attack Power, Spell Power and Critical Chance to {{two}}%. This effect spreads on all enemies in 1 cell radius around target.",{
                                one: (20*this.variant).toFixed(0),
                                two: (this.variant).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getPlural(this.duration(),"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                        str+=" ";
                        str+=gettextCatalog.getString("Stacks up 5 times.");
                        return str;
                    },
                    icon : function() { return "url(../images/icons/abilities/SpreadingTheDisease.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Purgatory")},
                    variant: 3,
                    role : function() {return "heretic"},
                    desc: function() {
                        return gettextCatalog.getPlural(this.variant,"Removes {{$count}} random positive effects from enemy.", "Removes {{$count}} random positive effect from enemy.",{});
                    },
                    icon : function() { return "url(../images/icons/abilities/Purgatory.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Children Of The Damned")},
                    variant: 3,
                    role : function() {return "heretic"},
                    desc: function() {
                        switch(this.variant){
                            case 1: return gettextCatalog.getString("Cast on enemy target. Decreases Attack Power and Block Chance for 25%."); break;
                            case 2: return gettextCatalog.getString("Cast on enemy target. Decreases Critical Chance and Dodge Chance for 25%."); break;
                            case 3: return gettextCatalog.getString("Cast on enemy target. Decreases Spell Power and Hit Chance for 25%."); break;
                            case 4: return gettextCatalog.getString("Cast on enemy target. Decreases Physical Resistance and Health Regeneration for 25%."); break;
                            case 5: return gettextCatalog.getString("Cast on enemy target. Decreases Magical Resistance and Mana Regeneration for 25%."); break;
                        }

                    },
                    icon : function() { return "url(../images/icons/abilities/ChildrenOfTheDamned.svg)"},
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
                    localName: function(){return gettextCatalog.getString("Locked And Loaded")},
                    variant: 3,
                    role : function() {return "heretic"},
                    desc: function() {
                        return gettextCatalog.getString("Cast on any target. While this effect active, owner's buffs and debuffs can't be dispelled or stolen.");
                    },
                    icon : function() { return "url(../images/icons/abilities/LockedAndLoaded.svg)"},
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
                    localName: function(){return gettextCatalog.getString("A Touch Of Evil")},
                    variant: 3,
                    role : function() {return "heretic"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Strikes enemy with dagger, deals {{one}}% of weapon damage and {{two}} magical damage for each effect on target.",{
                                one: (this.variant*6+10).toFixed(0),
                                two: (40+this.variant*25).toFixed(0)
                            });
                    },
                    icon : function() { return "url(../images/icons/abilities/ATouchOfEvil.svg)"},
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
        }
    }
}]);