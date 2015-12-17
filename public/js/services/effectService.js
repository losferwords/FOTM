//Сервис эффектов в игре
angular.module('fotm').register.service('effectService', ["randomService", "gettextCatalog", function(randomService, gettextCatalog) {
    return {
        effect: function(name, variant){
            switch(name){

                //SENTINEL

                case "Strong Arm Of The Law": return {
                    name : "Strong Arm Of The Law",
                    localName: function(){return gettextCatalog.getString("Strong Arm Of The Law")},
                    variant: variant,
                    role : function(){ return "sentinel"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Hit Chance increased to {{one}}%.",{
                                one: (this.variant*10).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/StrongArmOfTheLaw.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.hitChanceMod+=this.variant*0.1;
                    },
                    duration: function(){return 18-this.variant*2},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Defender Of The Faith": return {
                    name : "Defender Of The Faith",
                    localName: function(){return gettextCatalog.getString("Defender Of The Faith")},
                    variant: variant,
                    role : function(){ return "sentinel"},
                    desc: function() {
                        switch(this.variant){
                            case 1: return gettextCatalog.getString("Block Chance increased to 10%.<br>Physical Resistance increased to 10%.<br>Magical Resistance increased to 10%."); break;
                            case 2: return gettextCatalog.getString("Block Chance increased to 10%.<br>Physical Resistance increased to 10%.<br>Magical Resistance increased to 10%."); break;
                            case 3: return gettextCatalog.getString("Block Chance increased to 20%.<br>Physical Resistance increased to 20%.<br>Magical Resistance increased to 20%."); break;
                            case 4: return gettextCatalog.getString("Block Chance increased to 20%.<br>Physical Resistance increased to 20%.<br>Magical Resistance increased to 20%."); break;
                            case 5: return gettextCatalog.getString("Block Chance increased to 40%.<br>Physical Resistance increased to 40%.<br>Magical Resistance increased to 40%."); break;
                        }

                    },
                    icon : function(){ return "url(../images/icons/abilities/DefenderOfTheFaith.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        switch(this.variant){
                            case 1:
                                owner.blockChanceMod+=0.1;
                                owner.physResMod+=0.1;
                                owner.magicResMod+=0.1;
                                break;
                            case 2:
                                owner.blockChanceMod+=0.1;
                                owner.physResMod+=0.1;
                                owner.magicResMod+=0.1;
                                break;
                            case 3:
                                owner.blockChanceMod+=0.2;
                                owner.physResMod+=0.2;
                                owner.magicResMod+=0.2;
                                break;
                            case 4:
                                owner.blockChanceMod+=0.2;
                                owner.physResMod+=0.2;
                                owner.magicResMod+=0.2;
                                break;
                            case 5:
                                owner.blockChanceMod+=0.4;
                                owner.physResMod+=0.4;
                                owner.magicResMod+=0.4;
                                break;
                        }

                    },
                    duration: function(){return 22-this.variant*2},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Disarm": return {
                    name : "Disarm",
                    localName: function(){return gettextCatalog.getString("Disarm")},
                    variant: variant,
                    role : function(){ return "sentinel"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Disarmed. Can't use abilities, what needs weapon.");
                        str+=" ";
                        str+=gettextCatalog.getString(
                            "Physical Resistance decreased to {{one}}%.",{
                                one: (this.variant*7).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/Disarm.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.disarmed=true;
                        owner.physResMod-=this.variant*0.07;
                    },
                    duration: function(){return 5+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Walk Away": return {
                    name : "Walk Away",
                    localName: function(){return gettextCatalog.getString("Walk Away")},
                    variant: variant,
                    role : function(){ return "sentinel"},
                    desc: function() {
                        return gettextCatalog.getString("Stunned. Skip next turn.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/WalkAway.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.stunned=true;
                    },
                    duration: function(){return 3+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Sanctuary": return {
                    name : "Sanctuary",
                    localName: function(){return gettextCatalog.getString("Sanctuary")},
                    variant: variant,
                    role : function(){ return "sentinel"},
                    desc: function() {
                        var str = this.caster;
                        str+=" ";
                        str+=gettextCatalog.getString(
                            "takes {{one}}% of damage from this character.",{
                                one: (this.variant*15).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/Sanctuary.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {

                    },
                    duration: function(){return 4+this.variant*2},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "The Punishment Due": return {
                    name : "The Punishment Due",
                    localName: function(){return gettextCatalog.getString("The Punishment Due")},
                    variant: variant,
                    role : function(){ return "sentinel"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Every turn deals {{one}} physical damage.",{
                                one: (this.bleedDamage).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/ThePunishmentDue.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var debuffer = {};
                        for(var i=0;i<enemyTeam.length;i++){
                            if(enemyTeam[i].charName===this.caster) debuffer=enemyTeam[i];
                        }
                        var physicalDamage = this.bleedDamage*(1+debuffer.attackPower);
                        var critical = debuffer.checkCrit();
                        if(critical){
                            physicalDamage=debuffer.applyCrit(physicalDamage);
                        }
                        physicalDamage=owner.applyResistance(physicalDamage, false);
                        owner.takeDamage(physicalDamage, debuffer, this.name +" (DOT effect)", false, false, critical, myTeam, enemyTeam);
                    },
                    duration: function(){return 4+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return false}
                };break;

                //SLAYER

                case "Reign In Blood": return {
                    name : "Reign In Blood",
                    localName: function(){return gettextCatalog.getString("Reign In Blood")},
                    variant: variant,
                    role : function(){ return "slayer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Attack Power increased to {{one}}% until miss.",{
                                one: (2*this.variant*this.stacks).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/ReignInBlood.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.attackPowerMod+=0.02*this.variant*this.stacks;
                    },
                    duration: function(){return 0},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return true},
                    infinite: function() {return true},
                    maxStacks: function() {return 5},
                    onlyStat: function() {return true}
                };break;

                case "Made In Hell": return {
                    name : "Made In Hell",
                    localName: function(){return gettextCatalog.getString("Made In Hell")},
                    variant: variant,
                    role : function(){ return "slayer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Immune to magical attacks.");
                        str+=" ";
                        str+=gettextCatalog.getString(
                            "Mana Regeneration increased to {{one}}%.",{
                                one: (this.variant*60).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/MadeInHell.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.magicImmune=true;
                        owner.manaRegMod+=this.variant*0.6;
                    },
                    duration: function(){return 4+this.variant*2},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Spill The Blood": return {
                    name : "Spill The Blood",
                    localName: function(){return gettextCatalog.getString("Spill The Blood")},
                    variant: variant,
                    role : function(){ return "slayer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Attack Power increased to {{one}}%.",{
                                one: (this.variant*10).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Health Regeneration increased to {{one}}%.",{
                                one: (this.variant*15).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/SpillTheBlood.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.attackPowerMod+=this.variant*0.1;
                        owner.healthRegMod+=this.variant*0.15;
                    },
                    duration: function(){return 12+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Dyers Eve": return {
                    name : "Dyers Eve",
                    localName: function(){return gettextCatalog.getString("Dyers Eve")},
                    variant: variant,
                    role : function(){ return "slayer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Critical Chance increased to {{one}}%.",{
                                one: (this.variant*20).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/DyersEve.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.criticalChanceMod+=this.variant*0.2;
                    },
                    duration: function(){return this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "I Dont Wanna Stop": return {
                    name : "I Dont Wanna Stop",
                    localName: function(){return gettextCatalog.getString("I Dont Wanna Stop")},
                    variant: variant,
                    role : function(){ return "slayer"},
                    desc: function() {
                        return gettextCatalog.getString("Immunity to control abilities.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/IDontWannaStop.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.controlImmune=true;
                    },
                    duration: function(){return 6+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                //REDEEMER

                case "Lights In The Sky": return {
                    name : "Lights In The Sky",
                    localName: function(){return gettextCatalog.getString("Lights In The Sky")},
                    variant: variant,
                    role : function(){ return "redeemer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Hit Chance increased to {{one}}%.",{
                                one: (15+this.variant*2).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Critical Chance increased to {{one}}%.",{
                                one: (25-this.variant*2).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/LightsInTheSky.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.hitChanceMod+=0.15+this.variant*0.02;
                        owner.hitChanceMod+=0.25-this.variant*0.02;
                    },
                    duration: function(){return 12},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Thunderstruck": return {
                    name : "Thunderstruck",
                    localName: function(){return gettextCatalog.getString("Thunderstruck")},
                    variant: variant,
                    role : function(){ return "redeemer"},
                    desc: function() {
                        return gettextCatalog.getString("Stunned. Skip next turn.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/Thunderstruck.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.stunned=true;
                    },
                    duration: function(){return 3+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "You Aint No Angel": return {
                    name : "You Aint No Angel",
                    localName: function(){return gettextCatalog.getString("You Aint No Angel")},
                    variant: variant,
                    role : function(){ return "redeemer"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Immune to physical attacks.");
                        str+=" ";
                        str+=gettextCatalog.getString(
                            "Health Regeneration increased to {{one}}%.",{
                                one: (this.variant*60).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/YouAintNoAngel.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.physImmune=true;
                        owner.healthRegMod+=this.variant*0.6;
                    },
                    duration: function(){return 4+this.variant*2},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "State Of Grace": return {
                    name : "State Of Grace",
                    localName: function(){return gettextCatalog.getString("State Of Grace")},
                    variant: variant,
                    role : function(){ return "redeemer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Every turn restores {{one}} health and {{two}} mana.",{
                                one: (100+this.variant*60).toFixed(0),
                                two: (460-this.variant*60).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/StateOfGrace.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var buffer = {};
                        for(var i=0;i<myTeam.length;i++){
                            if(myTeam[i].charName===this.caster) buffer=myTeam[i];
                        }
                        var heal = (100+this.variant*60)*(1+buffer.spellPower);
                        var mana = (460-this.variant*60);
                        var critical = buffer.checkCrit();
                        if(critical){
                            heal=buffer.applyCrit(heal);
                        }
                        owner.takeHeal(heal, buffer, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                        owner.takeMana(mana, buffer, this.name, false);
                    },
                    duration: function(){return 7},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return false}
                };break;

                case "Come Cover Me": return {
                    name : "Come Cover Me",
                    localName: function(){return gettextCatalog.getString("Come Cover Me")},
                    variant: variant,
                    role : function(){ return "redeemer"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Every turn restores {{one}} health.",{
                                one: (100+this.variant*50).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/ComeCoverMe.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var buffer = {};
                        for(var i=0;i<myTeam.length;i++){
                            if(myTeam[i].charName===this.caster) buffer=myTeam[i];
                        }
                        var heal = (100+this.variant*50)*(1+buffer.spellPower);
                        var critical = buffer.checkCrit();
                        if(critical){
                            heal=buffer.applyCrit(heal);
                        }
                        owner.takeHeal(heal, buffer, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                    },
                    duration: function(){return 10-this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return false}
                };break;

                //RIPPER

                case "Inject The Venom": return {
                    name : "Inject The Venom",
                    localName: function(){return gettextCatalog.getString("Inject The Venom")},
                    variant: variant,
                    role : function(){ return "ripper"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Every turn deals {{one}} magical damage.",{
                                one: (this.variant*75).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/InjectTheVenom.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var debuffer = {};
                        for(var i=0;i<enemyTeam.length;i++){
                            if(enemyTeam[i].charName===this.caster) debuffer=enemyTeam[i];
                        }
                        var magicDamage = 75*this.variant*(1+debuffer.spellPower);
                        var critical = debuffer.checkCrit();
                        if(critical){
                            magicDamage=debuffer.applyCrit(magicDamage);
                        }
                        magicDamage=owner.applyResistance(magicDamage, true);
                        owner.takeDamage(magicDamage, debuffer, this.name +" (DOT effect)", false, false, critical, myTeam, enemyTeam);
                    },
                    duration: function(){return 12-this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return false}
                };break;

                case "Invisible": return {
                    name : "Invisible",
                    localName: function(){return gettextCatalog.getString("Invisible")},
                    variant: variant,
                    role : function(){ return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "This character is invisible for enemy. Effect fades if character takes or deals damage.");
                        str+=" ";
                        str+=gettextCatalog.getString(
                            "Attack Power increased to {{one}}%.",{
                                one: (this.variant*20).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/Invisible.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.invisible=true;
                        owner.attackPowerMod+=this.variant*0.2;
                    },
                    duration: function(){return 3+this.variant*3},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Jawbreaker": return {
                    name : "Jawbreaker",
                    localName: function(){return gettextCatalog.getString("Jawbreaker")},
                    variant: variant,
                    role : function(){ return "ripper"},
                    desc: function() {
                        return gettextCatalog.getString("Silenced. Can't cast spells.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/Jawbreaker.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.silenced=true;
                    },
                    duration: function(){return 5+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Hog Tied": return {
                    name : "Hog Tied",
                    localName: function(){return gettextCatalog.getString("Hog Tied")},
                    variant: variant,
                    role : function(){ return "ripper"},
                    desc: function() {
                        return gettextCatalog.getString("Immobilized. Can't move.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/HogTied.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.immobilized=true;
                    },
                    duration: function(){return 5+this.variant*2},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Running Free": return {
                    name : "Running Free",
                    localName: function(){return gettextCatalog.getString("Running Free")},
                    variant: variant,
                    role : function(){ return "ripper"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Movement cost decreased to {{one}} energy.",{
                                one: (this.variant*40).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/RunningFree.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        //На первом тике удалим все обездвиживающие эффекты (это нужно, если бафф украли)
                        if(this.left===this.duration()) owner.removeImmobilization(myTeam, enemyTeam);
                        owner.moveCost = 300-this.variant*40;
                    },
                    duration: function(){return 7+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Fast As The Shark": return {
                    name : "Fast As The Shark",
                    localName: function(){return gettextCatalog.getString("Fast As The Shark")},
                    variant: variant,
                    role : function(){ return "ripper"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Luck increased to {{one}}%.",{
                                one: (this.variant*15).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Dodge Chance increased to {{one}}%.",{
                                one: (this.variant*20).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/FastAsTheShark.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.luckMod+=this.variant*0.15;
                        owner.dodgeChanceMod+=this.variant*0.2;
                    },
                    duration: function(){return 5+this.variant*2},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Prowler": return {
                    name : "Prowler",
                    localName: function(){return gettextCatalog.getString("Prowler")},
                    variant: variant,
                    role : function(){ return "ripper"},
                    desc: function() {
                        return gettextCatalog.getString("Stunned. Skip next turn.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/Prowler.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.stunned=true;
                    },
                    duration: function(){return 4+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Fade To Black": return {
                    name : "Fade To Black",
                    localName: function(){return gettextCatalog.getString("Fade To Black")},
                    variant: variant,
                    role : function(){ return "ripper"},
                    desc: function() {
                        return gettextCatalog.getString("This character is invisible for enemy. Effect fades if character takes or deals damage.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/FadeToBlack.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.invisible=true;
                    },
                    duration: function(){return 3+this.variant*2},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                //PROPHET

                case "Stargazer": return {
                    name : "Stargazer",
                    localName: function(){return gettextCatalog.getString("Stargazer")},
                    variant: variant,
                    role : function(){ return "prophet"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Spell Power increased to {{one}}%.",{
                                one: (this.variant*this.stacks).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/Stargazer.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.spellPowerMod+=this.variant*0.01*this.stacks;
                    },
                    duration: function(){return 5+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return true},
                    infinite: function() {return false},
                    maxStacks: function() {return 5},
                    onlyStat: function() {return true}
                };break;

                case "Never A Word": return {
                    name : "Never A Word",
                    localName: function(){return gettextCatalog.getString("Never A Word")},
                    variant: variant,
                    role : function(){ return "prophet"},
                    desc: function() {
                        return gettextCatalog.getString("Silenced. Can't cast spells.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/NeverAWord.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.silenced=true;
                    },
                    duration: function(){return 5+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Prophecy": return {
                    name : "Prophecy",
                    localName: function(){return gettextCatalog.getString("Prophecy")},
                    variant: variant,
                    role : function(){ return "prophet"},
                    desc: function() {
                        var str = gettextCatalog.getString("Enemy can see spells of that character.");
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Magical Resistance decreased to {{one}}%.",{
                                one: (this.variant*10).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Initiative decreased to {{one}}%.",{
                                one: (this.variant*10).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/Prophecy.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.underProphecy=true;
                        owner.magicResMod-=this.variant*0.1;
                        owner.initiativeMod-=this.variant*0.1;
                    },
                    duration: function(){return 11+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Infinite Dreams": return {
                    name : "Infinite Dreams",
                    localName: function(){return gettextCatalog.getString("Infinite Dreams")},
                    variant: variant,
                    role : function(){ return "prophet"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Every turn restore {{one}}% mana.",{
                                one: (this.variant*2).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Initiative increased to {{one}}%.",{
                                one: (this.variant*15).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/InfiniteDreams.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.takeMana(owner.maxMana*(this.variant*2)*0.01, owner, this.name, false);
                        owner.initiativeMod+=this.variant*0.15;
                    },
                    duration: function(){return 5+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Caught Somewhere In Time": return {
                    name : "Caught Somewhere In Time",
                    localName: function(){return gettextCatalog.getString("Caught Somewhere In Time")},
                    variant: variant,
                    role : function(){ return "prophet"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Every turn deals {{one}} magical damage.",{
                                one: (75*this.variant+(75*this.variant)*((35-this.variant*5)*0.01)*(this.duration()-this.left)).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString("Immobilized. Can't move.");
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/CaughtSomewhereInTime.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.immobilized=true;
                        var debuffer = {};
                        for(var i=0;i<enemyTeam.length;i++){
                            if(enemyTeam[i].charName===this.caster) debuffer=enemyTeam[i];
                        }
                        var magicDamage = (75*this.variant+(75*this.variant)*((35-this.variant*5)*0.01)*(this.duration()-this.left))*(1+debuffer.spellPower);
                        var critical = debuffer.checkCrit();
                        if(critical){
                            magicDamage=debuffer.applyCrit(magicDamage);
                        }
                        magicDamage=owner.applyResistance(magicDamage, true);
                        owner.takeDamage(magicDamage, debuffer, this.name, false, false, critical, myTeam, enemyTeam);
                    },
                    duration: function(){return 12-this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return false}
                };break;

                //MALEFIC

                case "Burning Ambition": return {
                    name : "Burning Ambition",
                    localName: function(){return gettextCatalog.getString("Burning Ambition")},
                    variant: variant,
                    role : function(){ return "malefic"},
                    desc: function() {
                        return gettextCatalog.getString("Disarmed. Can't use abilities, what needs weapon.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/BurningAmbition.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.disarmed=true;
                    },
                    duration: function(){return 4+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Thank God For The Bomb": return {
                    name : "Thank God For The Bomb",
                    localName: function(){return gettextCatalog.getString("Thank God For The Bomb")},
                    variant: variant,
                    role : function(){ return "malefic"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Every turn deals {{one}} magical damage.",{
                                one: (this.variant*100).toFixed(0)
                            });
                        str+=" ";
                        str+=gettextCatalog.getString(
                            "When this effect ends, all allies of this character in one cell radius gets {{one}} magical damage and becomes stunned for 3 turns.",{
                                one: (300*this.variant).toFixed(0)
                            });
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/ThankGodForTheBomb.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var debuffer = {};
                        for(var i=0;i<enemyTeam.length;i++){
                            if(enemyTeam[i].charName===this.caster) debuffer=enemyTeam[i];
                        }
                        if(this.left>1) {
                            var magicDamage = (this.variant * 100) * (1 + debuffer.spellPower);
                            var critical = debuffer.checkCrit();
                            if (critical) {
                                magicDamage = debuffer.applyCrit(magicDamage);
                            }
                            magicDamage = owner.applyResistance(magicDamage, true);
                            owner.takeDamage(magicDamage, debuffer, this.name + " (DOT effect)", false, false, critical, myTeam, enemyTeam);
                        }
                        else {
                            magicDamage = (this.variant * 300) * (1 + debuffer.spellPower);

                            var nearbyAllies = owner.findAllies(myTeam, 1);
                            owner.playSound("Thank God For The Bomb (explode)");
                            for (i = 0; i < nearbyAllies.length; i++) {
                                critical = debuffer.checkCrit();
                                if (critical) {
                                    magicDamage = debuffer.applyCrit(magicDamage);
                                }
                                magicDamage = nearbyAllies[i].applyResistance(magicDamage, true);
                                if(nearbyAllies[i].takeDamage(magicDamage, debuffer, this.name+" (explosion)", true, true, critical, myTeam, enemyTeam)){
                                    if(nearbyAllies[i].controlImmune) {
                                        owner.logBuffer.push(nearbyAllies[i].charName+" has immunity to control effects!");
                                    }
                                    else {
                                        nearbyAllies[i].addDebuff(nearbyAllies[i].addEffectFromEffects("Thank God For The Bomb (Stun)", this.variant), debuffer.charName, enemyTeam, myTeam);
                                    }
                                }
                            }
                        }
                    },
                    duration: function(){return 5+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return false}
                };break;

                case "Thank God For The Bomb (Stun)": return {
                    name : "Thank God For The Bomb (Stun)",
                    localName: function(){return gettextCatalog.getString("Thank God For The Bomb (Stun)")},
                    variant: variant,
                    role : function(){ return "malefic"},
                    desc: function() {
                        return gettextCatalog.getString("Stunned. Skip next turn.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/ThankGodForTheBomb.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.stunned=true;
                    },
                    duration: function(){return 3},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Powerslave": return {
                    name : "Powerslave",
                    localName: function(){return gettextCatalog.getString("Powerslave")},
                    variant: variant,
                    role : function(){ return "malefic"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Spell Power increased to {{one}}%.",{
                                one: (this.variant*100).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Clearcasting state. Don't spend mana on spells.");
                        str+=" ";
                        str+=gettextCatalog.getString(
                            "Effect fades if you use ability.");
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/Powerslave.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.clearCast=true;
                        owner.spellPowerMod+=this.variant*0.15;
                    },
                    duration: function(){return 0},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return true},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Cauterization": return {
                    name : "Cauterization",
                    localName: function(){return gettextCatalog.getString("Cauterization")},
                    variant: variant,
                    role : function(){ return "malefic"},
                    desc: function() {
                        return gettextCatalog.getString("Every turn restores {{one}} health and burns {{two}} mana.", {
                            one: (this.variant*100).toFixed(0),
                            two: (this.variant*75).toFixed(0)
                        });
                    },
                    icon : function(){ return "url(../images/icons/abilities/Cauterization.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var buffer = {};
                        for (var i = 0; i < myTeam.length; i++) {
                            if (myTeam[i].charName === this.caster) buffer = myTeam[i];
                        }

                        var heal = (this.variant*100)*(1+buffer.spellPower);
                        var manaSpend = (this.variant*75).toFixed(0);

                        var critical = buffer.checkCrit();
                        if (critical) {
                            heal = buffer.applyCrit(heal);
                        }
                        owner.takeHeal(heal, buffer, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                        owner.spendMana(manaSpend);
                    },
                    duration: function(){return 4+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return false}
                };break;

                case "Down In Flames": return {
                    name : "Down In Flames",
                    localName: function(){return gettextCatalog.getString("Down In Flames")},
                    variant: variant,
                    role : function(){ return "malefic"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Spell Power increased to {{one}}%.",{
                                one: (this.variant*this.stacks).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Critical Chance increased to {{one}}%.",{
                                one: (this.variant*this.stacks).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Effect fades if character miss.");
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/DownInFlames.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.spellPowerMod+=0.01*this.variant*this.stacks;
                        owner.attackPowerMod+=0.01*this.variant*this.stacks;
                    },
                    duration: function(){return 0},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return true},
                    infinite: function() {return true},
                    maxStacks: function() {return 10},
                    onlyStat: function() {return true}
                };break;

                case "Fight Fire With Fire": return {
                    name : "Fight Fire With Fire",
                    localName: function(){return gettextCatalog.getString("Fight Fire With Fire")},
                    variant: variant,
                    role : function(){ return "malefic"},
                    desc: function() {
                        return gettextCatalog.getString("Returns {{one}}% of damage back to the attacker.", {
                            one: (20+this.variant*10).toFixed(0)
                        });
                    },
                    icon : function(){ return "url(../images/icons/abilities/FightFireWithFire.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                    },
                    duration: function(){return 7+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                //CLERIC

                case "Mercyful Fate": return {
                    name : "Mercyful Fate",
                    localName: function(){return gettextCatalog.getString("Mercyful Fate")},
                    variant: variant,
                    role : function(){ return "cleric"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Every turn restores {{one}} health.",{
                                one: ((50+this.variant*10)*this.stacks).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/MercyfulFate.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var buffer = {};
                        for(var i=0;i<myTeam.length;i++){
                            if(myTeam[i].charName===this.caster) buffer=myTeam[i];
                        }
                        var heal = (50+this.variant*10)*(1+buffer.spellPower)*this.stacks;
                        var critical = buffer.checkCrit();
                        if(critical){
                            heal=buffer.applyCrit(heal);
                        }
                        owner.takeHeal(heal, buffer, {name: this.name, icon: this.icon(), role: this.role()}, critical);
                    },
                    duration: function(){return 12-this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return true},
                    infinite: function() {return false},
                    maxStacks: function() {return 3},
                    onlyStat: function() {return false}
                };break;

                case "Hallowed Be Thy Name": return {
                    name : "Hallowed Be Thy Name",
                    localName: function(){return gettextCatalog.getString("Hallowed Be Thy Name")},
                    variant: variant,
                    role : function(){ return "cleric"},
                    desc: function() {
                        switch(this.variant){
                            case 1: return gettextCatalog.getString("Attack Power increased to 25%.<br>Block Chance increased to 25%."); break;
                            case 2: return gettextCatalog.getString("Critical Chance increased to 25%.<br>Dodge Chance increased to 25%."); break;
                            case 3: return gettextCatalog.getString("Spell Power increased to 25%.<br>Hit Chance increased to 25%."); break;
                            case 4: return gettextCatalog.getString("Physical Resistance increased to 25%.<br>Health Regeneration increased to 25%."); break;
                            case 5: return gettextCatalog.getString("Magical Resistance increased to 25%.<br>Mana Regeneration increased to 25%."); break;
                        }

                    },
                    icon : function(){ return "url(../images/icons/abilities/HallowedBeThyName.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        switch(this.variant){
                            case 1:
                                owner.attackPowerMod+=0.25;
                                owner.blockChanceMod+=0.25;
                                break;
                            case 2:
                                owner.critChanceMod+=0.25;
                                owner.dodgeChanceMod+=0.25;
                                break;
                            case 3:
                                owner.spellPowerMod+=0.25;
                                owner.hitChanceMod+=0.25;
                                break;
                            case 4:
                                owner.physResMod+=0.25;
                                owner.healthRegMod+=0.25;
                                break;
                            case 5:
                                owner.magicResMod+=0.25;
                                owner.manaRegMod+=0.25;
                                break;
                        }

                    },
                    duration: function(){return 12},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Heaven Can Wait": return {
                    name : "Heaven Can Wait",
                    localName: function(){return gettextCatalog.getString("Heaven Can Wait")},
                    variant: variant,
                    role : function(){ return "cleric"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Immune to physical and magical attacks.");
                        str += "<br>";
                        str += gettextCatalog.getString("Stunned. Skip next turn.");
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/HeavenCanWait.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        owner.physImmune=true;
                        owner.magicImmune=true;
                        owner.stunned=true;
                    },
                    duration: function(){return 4+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                //HERETIC

                case "Fear Of The Dark": return {
                    name : "Fear Of The Dark",
                    localName: function(){return gettextCatalog.getString("Fear Of The Dark")},
                    variant: variant,
                    role : function(){ return "heretic"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Every turn deals {{one}} magical damage.",{
                                one: (40+this.variant*60).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/FearOfTheDark.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var debuffer = {};
                        for(var i=0;i<enemyTeam.length;i++){
                            if(enemyTeam[i].charName===this.caster) debuffer=enemyTeam[i];
                        }
                        var magicDamage = (40+this.variant*60)*(1+debuffer.spellPower);
                        var critical = debuffer.checkCrit();
                        if(critical){
                            magicDamage=debuffer.applyCrit(magicDamage);
                        }
                        magicDamage=owner.applyResistance(magicDamage, true);
                        owner.takeDamage(magicDamage, debuffer, this.name +" (DOT effect)", false, false, critical, myTeam, enemyTeam);
                    },
                    duration: function(){return 12-this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return false}
                };break;

                case "Creeping Death": return {
                    name : "Creeping Death",
                    localName: function(){return gettextCatalog.getString("Creeping Death")},
                    variant: variant,
                    role : function(){ return "heretic"},
                    desc: function() {
                        return gettextCatalog.getString(
                            "Every turn deals {{one}} magical damage.",{
                                one: (30*this.variant*this.stacks).toFixed(0)
                            });
                    },
                    icon : function(){ return "url(../images/icons/abilities/CreepingDeath.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var debuffer = {};
                        for(var i=0;i<enemyTeam.length;i++){
                            if(enemyTeam[i].charName===this.caster) debuffer=enemyTeam[i];
                        }
                        var magicDamage = 30*this.variant*(1+debuffer.spellPower)*this.stacks;
                        var critical = debuffer.checkCrit();
                        if(critical){
                            magicDamage=debuffer.applyCrit(magicDamage);
                        }
                        magicDamage=owner.applyResistance(magicDamage, true);
                        owner.takeDamage(magicDamage, debuffer, this.name, false, false, critical, myTeam, enemyTeam);
                    },
                    duration: function(){return 12-this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return true},
                    infinite: function() {return false},
                    maxStacks: function() {return 5},
                    onlyStat: function() {return false}
                };break;

                case "Spreading The Disease": return {
                    name : "Spreading The Disease",
                    localName: function(){return gettextCatalog.getString("Spreading The Disease")},
                    variant: variant,
                    role : function(){ return "heretic"},
                    desc: function() {
                        var str = gettextCatalog.getString(
                            "Every turn deals {{one}} magical damage.",{
                                one: (20*this.variant*this.stacks).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Attack Power decreased to {{one}}%.",{
                                one: (this.variant*this.stacks).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Spell Power decreased to {{one}}%.",{
                                one: (this.variant*this.stacks).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Critical Chance decreased to {{one}}%.",{
                                one: (this.variant*this.stacks).toFixed(0)
                            });
                        str+="<br>";
                        str+=gettextCatalog.getString(
                            "Character infects nearby allies in 1 cell radius.");
                        return str;
                    },
                    icon : function(){ return "url(../images/icons/abilities/SpreadingTheDisease.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        var debuffer = {};
                        for(var i=0;i<enemyTeam.length;i++){
                            if(enemyTeam[i].charName===this.caster) debuffer=enemyTeam[i];
                        }
                        var magicDamage = 20*this.variant*(1+debuffer.spellPower)*this.stacks;
                        var critical = debuffer.checkCrit();
                        if(critical){
                            magicDamage=debuffer.applyCrit(magicDamage);
                        }
                        magicDamage=owner.applyResistance(magicDamage, true);
                        owner.takeDamage(magicDamage, debuffer, this.name, false, false, critical, myTeam, enemyTeam);

                        owner.attackPowerMod-=this.variant*0.01*this.stacks;
                        owner.spellPowerMod-=this.variant*0.01*this.stacks;
                        owner.critChanceMod-=this.variant*0.01*this.stacks;

                        var nearbyAllies = owner.findAllies(myTeam, 1);
                        for (i = 0; i < nearbyAllies.length; i++) {
                            if(nearbyAllies[i].charName!==owner.charName) {
                                if(nearbyAllies[i].findEffect("Spreading The Disease")===-1){
                                    nearbyAllies[i].addDebuff(nearbyAllies[i].addEffectFromEffects("Spreading The Disease", this.variant), debuffer.charName, enemyTeam, myTeam);
                                }
                            }
                        }
                    },
                    duration: function(){return 12+this.variant},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return true},
                    infinite: function() {return false},
                    maxStacks: function() {return 5},
                    onlyStat: function() {return false}
                };break;

                case "Children Of The Damned": return {
                    name : "Children Of The Damned",
                    localName: function(){return gettextCatalog.getString("Children Of The Damned")},
                    variant: variant,
                    role : function(){ return "heretic"},
                    desc: function() {
                        switch(this.variant){
                            case 1: return gettextCatalog.getString("Attack Power decreased to 25%.<br>Block Chance decreased to 25%."); break;
                            case 2: return gettextCatalog.getString("Critical Chance decreased to 25%.<br>Dodge Chance decreased to 25%."); break;
                            case 3: return gettextCatalog.getString("Spell Power decreased to 25%.<br>Hit Chance decreased to 25%."); break;
                            case 4: return gettextCatalog.getString("Physical Resistance decreased to 25%.<br>Health Regeneration decreased to 25%."); break;
                            case 5: return gettextCatalog.getString("Magical Resistance decreased to 25%.<br>Mana Regeneration decreased to 25%."); break;
                        }

                    },
                    icon : function(){ return "url(../images/icons/abilities/ChildrenOfTheDamned.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                        switch(this.variant){
                            case 1:
                                owner.attackPowerMod-=0.25;
                                owner.blockChanceMod-=0.25;
                                break;
                            case 2:
                                owner.critChanceMod-=0.25;
                                owner.dodgeChanceMod-=0.25;
                                break;
                            case 3:
                                owner.spellPowerMod-=0.25;
                                owner.hitChanceMod-=0.25;
                                break;
                            case 4:
                                owner.physResMod-=0.25;
                                owner.healthRegMod-=0.25;
                                break;
                            case 5:
                                owner.magicResMod-=0.25;
                                owner.manaRegMod-=0.25;
                                break;
                        }

                    },
                    duration: function(){return 12},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;

                case "Locked And Loaded": return {
                    name : "Locked And Loaded",
                    localName: function(){return gettextCatalog.getString("Locked And Loaded")},
                    variant: variant,
                    role : function(){ return "heretic"},
                    desc: function() {
                        return gettextCatalog.getString("Buffs and debuffs of this character can't be dispelled or stolen.");
                    },
                    icon : function(){ return "url(../images/icons/abilities/LockedAndLoaded.svg)"},
                    apply : function (owner, myTeam, enemyTeam) {
                    },
                    duration: function(){return 4+this.variant*3},
                    left : 0,
                    stacks: 0,
                    stacked: function() {return false},
                    infinite: function() {return false},
                    maxStacks: function() {return 0},
                    onlyStat: function() {return true}
                };break;
            }
        }
    }
}]);