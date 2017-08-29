var arenaService = require('services/arenaService');

//Factory for ability effects
var Effect = function(name, abilityVariant) {
    switch (name) {

        //SENTINEL
        case "Strong Arm Of The Law": return {
            name : "Strong Arm Of The Law",
            variant: abilityVariant,
            role : function(){ return "sentinel"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--StrongArmOfTheLaw)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.hitChanceMod -= this.variant * 0.07;
            },
            duration: function(){ return 18 - this.variant * 2 },
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: - owner.hitChance * (1 - this.variant * 0.07) * 100,
                    leftScore: this.left * 5,
                    offensivePositionScore: positionWeights[0] * 75
                };
            }
        };

        case "Defender Of The Faith": return {
            name : "Defender Of The Faith",
            variant: abilityVariant,
            role : function(){ return "sentinel"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--DefenderOfTheFaith)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                switch(this.variant){
                    case 1:
                    case 2:
                        owner.blockChanceMod+=0.1;
                        owner.physResMod+=0.1;
                        owner.magicResMod+=0.1;
                        break;
                    case 3:
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
            duration: function(){return 22 - this.variant * 2},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                switch(this.variant){
                    case 1:
                    case 2:
                        var effectScore = owner.blockChance * 250 + owner.physRes * 250 + owner.magicRes * 250;
                        break;
                    case 3:
                    case 4:
                        effectScore = owner.blockChance * 270 + owner.physRes * 270 + owner.magicRes * 270;
                        break;                    
                    case 5:
                        effectScore = owner.blockChance * 315 + owner.physRes * 315 + owner.magicRes * 315;
                        break;
                }

                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: effectScore,
                    leftScore: this.left * 1.5,
                    defensivePositionScore: - positionWeights[1] * 25,
                    healthScore: - owner.curHealth / owner.maxHealth * 25
                };
            }
        };

        case "Disarm": return {
            name : "Disarm",
            variant: abilityVariant,
            role : function(){ return "sentinel"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Disarm)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.disarmed = true;
                owner.physResMod -= this.variant * 0.07;
                owner.dodgeChanceMod -= this.variant * 0.07;
            },
            duration: function(){return 5 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: - (owner.physRes * (1 - this.variant * 0.07) * 200 + owner.dodgeChance * (1 - this.variant * 0.07) * 200),
                    leftScore: this.left * 8,
                    offensivePositionScore: positionWeights[0] * 75
                };
            }
        };

        case "Walk Away": return {
            name : "Walk Away",
            variant: abilityVariant,
            role : function(){ return "sentinel"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--WalkAway)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.stunned = true;
            },
            duration: function(){return 3+this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {                    
                    leftScore: this.left * 10,
                    offensivePositionScore: positionWeights[0] * 75,
                    defensivePositionScore: -positionWeights[1] * 50
                };
            }
        };

        case "Sanctuary": return {
            name : "Sanctuary",
            variant: abilityVariant,
            role : function(){ return "sentinel"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Sanctuary)"},
            apply : function (owner, myTeam, enemyTeam, walls) {

            },
            duration: function(){return 4+this.variant*2},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    leftScore: this.left * 10,
                    defensivePositionScore: - positionWeights[1] * 30,
                    healthScore: - owner.curHealth / owner.maxHealth * 30 
                };
            }
        };

        case "The Punishment Due": return {
            name : "The Punishment Due",
            variant: abilityVariant,
            role : function(){ return "sentinel"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--ThePunishmentDue)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i=0;i<enemyTeam.length;i++){
                    if(enemyTeam[i]._id===this.casterId) debuffer=enemyTeam[i];
                }
                var physicalDamage = this.bleedDamage*(1+debuffer.attackPower);
                var critical = debuffer.checkCrit();
                if(critical){
                    physicalDamage=debuffer.applyCrit(physicalDamage);
                }
                physicalDamage=owner.applyResistance(physicalDamage, false);
                owner.takeDamage(physicalDamage, debuffer, {name: this.name +" (DOT effect)", icon: this.icon(), role: this.role()}, false, false, critical, myTeam, enemyTeam);
            },
            duration: function(){return 4+this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return false},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                var physicalDamage = this.bleedDamage * (1 + debuffer.attackPower);
                physicalDamage = arenaService.calculateExpectedDamage(physicalDamage, debuffer);
                physicalDamage = owner.applyResistance(physicalDamage, false);
                
                return {
                    effectScore: physicalDamage / 18,
                    leftScore: this.left * 8
                };
            }
        };

        //SLAYER

        case "Reign In Blood": return {
            name : "Reign In Blood",
            variant: abilityVariant,
            role : function(){ return "slayer"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--ReignInBlood)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.attackPowerMod += 0.02 * this.variant * this.stacks;
            },
            duration: function(){return 0},
            left : 0,
            stacks: 0,
            stacked: function() {return true},
            infinite: function() {return true},
            maxStacks: function() {return 5},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: owner.attackPower * (1 + 0.02 * this.variant * this.stacks) *150,
                    offensivePositionScore: positionWeights[0] * 50
                };
            }
        };

        case "Made In Hell": return {
            name : "Made In Hell",
            variant: abilityVariant,
            role : function(){ return "slayer"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--MadeInHell)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.magicImmune = true;
                owner.manaRegMod += this.variant * 0.6;
            },
            duration: function(){return 4 + this.variant * 2},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: owner.manaReg * (1 + this.variant * 0.6) * 100,
                    leftScore: this.left * 2,
                    defensivePositionScore: - positionWeights[1] * 25,
                    healthScore: - owner.curHealth / owner.maxHealth * 25 
                };
            }
        };

        case "Spill The Blood": return {
            name: "Spill The Blood",
            variant: abilityVariant,
            role: function() { return "slayer"},
            icon: function() { return "url(../images/assets/svg/view/sprites.svg#abilities--SpillTheBlood)"},
            apply: function (owner, myTeam, enemyTeam, walls) {
                owner.attackPowerMod += this.variant * 0.1;
                owner.healthRegMod += this.variant * 0.15;
            },
            duration: function() { return 12 + this.variant },
            left : 0,
            stacks: 0,
            stacked: function() { return false },
            infinite: function() { return false },
            maxStacks: function() { return 0 },
            onlyStat: function() { return true },
            magicEffect: function() { return false },
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: owner.attackPower * (1 + this.variant * 0.1) * 40 + owner.healthReg * (1 + this.variant * 0.15) * 20,
                    leftScore: this.left * 2,
                    offensivePositionScore: positionWeights[0] * 30
                };
            }
        };

        case "Dyers Eve": return {
            name : "Dyers Eve",
            variant: abilityVariant,
            role : function(){ return "slayer"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--DyersEve)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.criticalChanceMod += this.variant * 0.2;
            },
            duration: function(){return this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: owner.criticalChance * (1 + this.variant * 0.2) * 60,
                    leftScore: this.left * 6,
                    offensivePositionScore: positionWeights[0] * 30
                };
            }
        };

        case "I Dont Wanna Stop": return {
            name : "I Dont Wanna Stop",
            variant: abilityVariant,
            role : function(){ return "slayer"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--IDontWannaStop)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.controlImmune=true;
            },
            duration: function(){return 6 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    leftScore: this.left * 4,
                    offensivePositionScore: positionWeights[0] * 50,
                    defensivePositionScore: - positionWeights[1] * 50
                };
            }
        };

        //REDEEMER

        case "Lights In The Sky": return {
            name : "Lights In The Sky",
            variant: abilityVariant,
            role : function(){ return "redeemer"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--LightsInTheSky)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.hitChanceMod += 0.15 + this.variant * 0.02;
                owner.critChanceMod += 0.25 - this.variant * 0.02;
            },
            duration: function(){return 12},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: owner.hitChance * (1 + 0.15 + this.variant * 0.02) * 15 + owner.critChance * (1 + 0.25 - this.variant * 0.02) * 300,
                    leftScore: this.left * 2,
                    offensivePositionScore: positionWeights[0] * 30
                };
            }
        };

        case "Thunderstruck": return {
            name : "Thunderstruck",
            variant: abilityVariant,
            role : function(){ return "redeemer"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Thunderstruck)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.stunned=true;
            },
            duration: function(){return 2+this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {                    
                    leftScore: this.left * 7,
                    offensivePositionScore: positionWeights[0] * 50,
                    defensivePositionScore: -positionWeights[1] * 50
                };
            }
        };

        case "You Aint No Angel": return {
            name : "You Aint No Angel",
            variant: abilityVariant,
            role : function(){ return "redeemer"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--YouAintNoAngel)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.physImmune = true;
                owner.healthRegMod += this.variant * 0.6;
            },
            duration: function(){return 4+this.variant*2},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: owner.healthReg * (1 +this.variant * 0.6) * 100,
                    leftScore: this.left * 2,
                    defensivePositionScore: - positionWeights[1] * 25,
                    healthScore: - owner.curHealth / owner.maxHealth * 25 
                };
            }
        };

        case "State Of Grace": return {
            name : "State Of Grace",
            variant: abilityVariant,
            role : function(){ return "redeemer"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--StateOfGrace)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var buffer = {};
                for(var i = 0; i < myTeam.length; i++){
                    if(myTeam[i]._id == this.casterId) buffer = myTeam[i];
                }
                var heal = (100 + this.variant * 60) * (1 + buffer.spellPower);
                var mana = (460 - this.variant * 60);
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
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var buffer = {};
                for(var i = 0; i < myTeam.length; i++){
                    if(myTeam[i]._id == this.casterId) buffer = myTeam[i];
                }
                var heal = (100 + this.variant * 60) * (1 + buffer.spellPower);
                var mana = (460 - this.variant * 60);
                heal = arenaService.calculateExpectedHeal(heal, buffer);

                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: (heal + mana) / 25,
                    leftScore: this.left * 4,
                    offensivePositionScore: positionWeights[0] * 30,
                    defensivePositionScore: - positionWeights[1] * 30,
                    healthScore: - owner.curHealth / owner.maxHealth * 30,
                    manaScore: - owner.curMana / owner.maxMana * 30 
                };
            }
        };

        case "Come Cover Me": return {
            name : "Come Cover Me",
            variant: abilityVariant,
            role : function(){ return "redeemer"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--ComeCoverMe)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var buffer = {};
                for(var i=0;i<myTeam.length;i++){
                    if(myTeam[i]._id===this.casterId) buffer=myTeam[i];
                }
                var heal = (100 + this.variant * 50) * (1 + buffer.spellPower);
                var critical = buffer.checkCrit();
                if(critical){
                    heal=buffer.applyCrit(heal);
                }
                owner.takeHeal(heal, buffer, {name: this.name, icon: this.icon(), role: this.role()}, critical);
            },
            duration: function(){return 10 - this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var buffer = {};
                for(var i = 0; i < myTeam.length; i++){
                    if(myTeam[i]._id == this.casterId) buffer = myTeam[i];
                }
                var heal = (100 + this.variant * 50) * (1 + buffer.spellPower);
                heal = arenaService.calculateExpectedHeal(heal, buffer);
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: heal / 5,
                    leftScore: this.left * 8,
                    defensivePositionScore: - positionWeights[1] * 25,
                    healthScore: - owner.curHealth / owner.maxHealth * 25
                };
            }
        };

        //RIPPER

        case "Inject The Venom": return {
            name : "Inject The Venom",
            variant: abilityVariant,
            role : function(){ return "ripper"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--InjectTheVenom)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i=0;i<enemyTeam.length;i++){
                    if(enemyTeam[i]._id===this.casterId) debuffer=enemyTeam[i];
                }
                var magicDamage = 75*this.variant*(1+debuffer.spellPower);
                var critical = debuffer.checkCrit();
                if(critical){
                    magicDamage=debuffer.applyCrit(magicDamage);
                }
                magicDamage=owner.applyResistance(magicDamage, true);
                owner.takeDamage(magicDamage, debuffer, {name: this.name +" (DOT effect)", icon: this.icon(), role: this.role()}, false, false, critical, myTeam, enemyTeam);
            },
            duration: function(){return 12-this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                var magicDamage = 75 * this.variant * (1 + debuffer.spellPower);
                magicDamage = arenaService.calculateExpectedDamage(magicDamage, debuffer);
                magicDamage = owner.applyResistance(magicDamage, true);
                
                return {
                    effectScore: magicDamage / 9,
                    leftScore: this.left * 3
                };
            }
        };

        case "Invisible": return {
            name : "Invisible",
            variant: abilityVariant,
            role : function(){ return "ripper"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Invisible)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.invisible=true;
                owner.attackPowerMod+=this.variant * 0.2;
            },
            duration: function(){return 3 + this.variant * 3},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                return {
                    effectScore: owner.attackPower * (1 + this.variant * 0.2) * 100,
                    leftScore: this.left * 3
                };
            }
        };

        case "Jawbreaker": return {
            name : "Jawbreaker",
            variant: abilityVariant,
            role : function(){ return "ripper"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Jawbreaker)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.silenced=true;
            },
            duration: function(){ return 5 + this.variant },
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    leftScore: this.left * 5,
                    offensivePositionScore: positionWeights[0] * 50
                };
            }
        };

        case "Hog Tied": return {
            name : "Hog Tied",
            variant: abilityVariant,
            role : function(){ return "ripper"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--HogTied)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.immobilized = true;
            },
            duration: function(){return 7+this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {                    
                    leftScore: this.left * 4,
                    offensivePositionScore: positionWeights[0] * 50
                };
            }
        };

        case "Running Free": return {
            name : "Running Free",
            variant: abilityVariant,
            role : function(){ return "ripper"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--RunningFree)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                if(this.left == this.duration()) owner.removeImmobilization(myTeam, enemyTeam);
                owner.moveCost = 300 - this.variant * 40;
            },
            duration: function(){return 7 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {                    
                    leftScore: this.left * 3,
                    offensivePositionScore: - positionWeights[0] * 30,
                    defensivePositionScore: - positionWeights[1] * 30
                };
            }
        };

        case "Fast As The Shark": return {
            name : "Fast As The Shark",
            variant: abilityVariant,
            role : function(){ return "ripper"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--FastAsTheShark)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.luckMod += this.variant * 0.15;
                owner.dodgeChanceMod += this.variant * 0.2;
            },
            duration: function(){return 5 + this.variant * 2},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: owner.luck * (1 + this.variant * 0.15) * 150 + owner.dodgeChance * (1 + this.variant * 0.2) * 125,
                    leftScore: this.left * 3,
                    defensivePositionScore: - positionWeights[1] * 25,
                    healthScore: - owner.curHealth / owner.maxHealth * 25,
                };
            }
        };

        case "Prowler": return {
            name : "Prowler",
            variant: abilityVariant,
            role : function(){ return "ripper"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Prowler)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.stunned = true;
            },
            duration: function(){return 4 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {                    
                    leftScore: this.left * 5,
                    offensivePositionScore: positionWeights[0] * 50
                };
            }
        };

        case "Fade To Black": return {
            name : "Fade To Black",
            variant: abilityVariant,
            role : function(){ return "ripper"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--FadeToBlack)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.invisible = true;
            },
            duration: function(){return 3 + this.variant * 2},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return false},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    leftScore: this.left * 10,
                    defensivePositionScore: - positionWeights[1] * 25,
                    healthScore: - owner.curHealth / owner.maxHealth * 25,
                };
            }
        };

        //PROPHET

        case "Stargazer": return {
            name : "Stargazer",
            variant: abilityVariant,
            role : function(){ return "prophet"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Stargazer)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.spellPowerMod+=this.variant*0.01*this.stacks;
            },
            duration: function(){return 5+this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return true},
            infinite: function() {return false},
            maxStacks: function() {return 5},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                return {
                    effectScore: owner.spellPower * (1 + this.variant * 0.01 * this.stacks) * 150,
                    leftScore: this.left * 5
                };
            }
        };

        case "Never A Word": return {
            name : "Never A Word",
            variant: abilityVariant,
            role : function(){ return "prophet"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--NeverAWord)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.silenced = true;
            },
            duration: function(){return 5 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {                    
                    leftScore: this.left * 5,
                    offensivePositionScore: positionWeights[0] * 50
                };
            }
        };

        case "Prophecy": return {
            name : "Prophecy",
            variant: abilityVariant,
            role : function(){ return "prophet"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Prophecy)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.underProphecy = true;
                owner.magicResMod -= this.variant * 0.1;
                owner.initiativeMod -= this.variant * 0.1;
            },
            duration: function(){return 11 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                return {
                    effectScore: - (owner.magicRes * (1 - this.variant * 0.1) * 320 + owner.initiative * (1 - this.variant * 0.1) * 320),
                    leftScore: this.left * 5
                };
            }
        };

        case "Infinite Dreams": return {
            name : "Infinite Dreams",
            variant: abilityVariant,
            role : function(){ return "prophet"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--InfiniteDreams)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.takeMana(owner.maxMana * (this.variant) * 0.01, owner, this.name, false);
                owner.initiativeMod += this.variant * 0.15;
            },
            duration: function(){return 5+this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var mana = owner.maxMana * (this.variant) * 0.01;                
                return {
                    effectScore: mana / 12.5 + owner.initiative * (1 + this.variant * 0.15) * 0.75,
                    leftScore: this.left * 8,
                    manaScore: - owner.curMana / owner.maxMana * 50
                };
            }
        };

        case "Caught Somewhere In Time": return {
            name : "Caught Somewhere In Time",
            variant: abilityVariant,
            role : function(){ return "prophet"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--CaughtSomewhereInTime)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.immobilized=true;
                var debuffer = {};
                for(var i=0;i<enemyTeam.length;i++){
                    if(enemyTeam[i]._id===this.casterId) debuffer = enemyTeam[i];
                }
                var magicDamage = (75*this.variant+(75*this.variant)*((35-this.variant*5)*0.01)*(this.duration()-this.left))*(1+debuffer.spellPower);
                var critical = debuffer.checkCrit();
                if(critical){
                    magicDamage=debuffer.applyCrit(magicDamage);
                }
                magicDamage=owner.applyResistance(magicDamage, true);
                owner.takeDamage(magicDamage, debuffer, {name: this.name, icon: this.icon(), role: this.role()}, false, false, critical, myTeam, enemyTeam);
            },
            duration: function(){return 12-this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                var magicDamage = (75 * this.variant + (75 * this.variant) * ((35 - this.variant * 5) * 0.01) * (this.duration() - this.left)) * (1 + debuffer.spellPower);
                magicDamage = arenaService.calculateExpectedDamage(magicDamage, debuffer);
                magicDamage = owner.applyResistance(magicDamage, true);
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);

                return {
                    effectScore: magicDamage / 15,
                    leftScore: this.left * 3,
                    offensivePositionScore: positionWeights[0] * 30
                };
            }
        };

        //MALEFIC

        case "Burning Ambition": return {
            name : "Burning Ambition",
            variant: abilityVariant,
            role : function(){ return "malefic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--BurningAmbition)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.disarmed = true;
            },
            duration: function(){return 4 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    leftScore: this.left * 6,
                    offensivePositionScore: positionWeights[0] * 50
                };
            }
        };

        case "Thank God For The Bomb": return {
            name : "Thank God For The Bomb",
            variant: abilityVariant,
            role : function(){ return "malefic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--ThankGodForTheBomb)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i=0;i<enemyTeam.length;i++){
                    if(enemyTeam[i]._id===this.casterId) debuffer=enemyTeam[i];
                }
                if(this.left>1) {
                    var magicDamage = (this.variant * 100) * (1 + debuffer.spellPower);
                    var critical = debuffer.checkCrit();
                    if (critical) {
                        magicDamage = debuffer.applyCrit(magicDamage);
                    }
                    magicDamage = owner.applyResistance(magicDamage, true);
                    owner.takeDamage(magicDamage, debuffer, {name: this.name +" (DOT effect)", icon: this.icon(), role: this.role()}, false, false, critical, myTeam, enemyTeam);
                }
                else {
                    magicDamage = (this.variant * 300) * (1 + debuffer.spellPower);

                    var nearbyAllies = arenaService.findAllies(owner, myTeam, 1, walls);
                    owner.soundBuffer.push("Thank God For The Bomb (explode)");
                    for (i = 0; i < nearbyAllies.length; i++) {
                        var localMagicDamage = magicDamage;
                        critical = debuffer.checkCrit();
                        if (critical) {
                            localMagicDamage = debuffer.applyCrit(localMagicDamage);
                        }
                        localMagicDamage = nearbyAllies[i].applyResistance(localMagicDamage, true);
                        if(nearbyAllies[i].takeDamage(localMagicDamage, debuffer, {name: this.name +" (explosion)", icon: this.icon(), role: this.role()}, true, true, critical, myTeam, enemyTeam)){
                            if(nearbyAllies[i].controlImmune) {
                                owner.logBuffer.push(nearbyAllies[i].charName+" has immunity to control effects!");
                            }
                            else {
                                nearbyAllies[i].addDebuff(nearbyAllies[i].addEffectFromEffects("Thank God For The Bomb (Stun)", this.variant), debuffer, enemyTeam, myTeam, walls);
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
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                if(this.left > 1) {
                    var magicDamage = (this.variant * 100) * (1 + debuffer.spellPower);
                    magicDamage = arenaService.calculateExpectedDamage(magicDamage, debuffer);
                    magicDamage = owner.applyResistance(magicDamage, true); 
                    
                    return {
                        effectScore: magicDamage / 20,
                        leftScore: this.left * 3,
                        offensivePositionScore: positionWeights[0] * 30
                    };
                }
                else {
                    magicDamage = (this.variant * 300) * (1 + debuffer.spellPower);
                    var nearbyAllies = arenaService.findAllies(owner, myTeam, 1, walls);
                    var totalMagicDamage = 0;

                    for (i = 0; i < nearbyAllies.length; i++) {
                        var localMagicDamage = magicDamage;
                        localMagicDamage = nearbyAllies[i].applyResistance(localMagicDamage, true);
                        totalMagicDamage += localMagicDamage;
                    }

                    return {
                        effectScore: totalMagicDamage / 180,
                        leftScore: this.left * 3,
                        offensivePositionScore: positionWeights[0] * 30
                    };
                }
            }
        };

        case "Thank God For The Bomb (Stun)": return {
            name : "Thank God For The Bomb (Stun)",
            variant: abilityVariant,
            role : function(){ return "malefic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--ThankGodForTheBomb)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.stunned = true;
            },
            duration: function(){return 3},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {                    
                    leftScore: this.left * 16,
                    offensivePositionScore: positionWeights[0] * 50
                };
            }
        };

        case "Powerslave": return {
            name : "Powerslave",
            variant: abilityVariant,
            role : function(){ return "malefic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Powerslave)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.clearCast = true;
                owner.spellPowerMod += this.variant * 0.15;
            },
            duration: function(){return 0},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return true},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: owner.spellPower * (1 + this.variant * 0.15) * 100,
                    offensivePositionScore: positionWeights[0] * 50
                };
            }
        };

        case "Cauterization": return {
            name : "Cauterization",
            variant: abilityVariant,
            role : function(){ return "malefic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--Cauterization)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var buffer = {};
                for (var i = 0; i < myTeam.length; i++) {
                    if (myTeam[i]._id === this.casterId) buffer = myTeam[i];
                }

                var heal = (this.variant*80)*(1+buffer.spellPower);
                var manaSpend = +((this.variant*60).toFixed(0));

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
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var buffer = {};
                for (var i = 0; i < myTeam.length; i++) {
                    if (myTeam[i]._id === this.casterId) buffer = myTeam[i];
                }

                var heal = (this.variant * 80) * (1 + buffer.spellPower);

                heal = arenaService.calculateExpectedHeal(heal, buffer);

                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: heal / 10,
                    leftScore: this.left * 5,
                    defensivePositionScore: - positionWeights[1] * 25,
                    healthScore: - owner.curHealth / owner.maxHealth * 25,
                    manaScore: owner.curMana / owner.maxMana * 50 
                };
            }
        };

        case "Down In Flames": return {
            name: "Down In Flames",
            variant: abilityVariant,
            role: function () {
                return "malefic"
            },
            icon: function () {
                return "url(../images/assets/svg/view/sprites.svg#abilities--DownInFlames)"
            },
            apply: function (owner, myTeam, enemyTeam, walls) {                
                if (this.stacks > 1) {
                    owner.spellPowerMod -= 0.03 * this.variant * (this.stacks - 1);
                    owner.critChanceMod -= 0.03 * this.variant * (this.stacks - 1);
                }
                owner.spellPowerMod += 0.03 * this.variant * this.stacks;
                owner.critChanceMod += 0.03 * this.variant * this.stacks;
            },
            duration: function () { return 0 },
            left: 0,
            stacks: 0,
            stacked: function () {return true},
            infinite: function () {return true},
            maxStacks: function () {return 10},
            onlyStat: function () {return true},
            magicEffect: function () {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: owner.spellPower * (1 + 0.03 * this.variant * this.stacks) * 60 + owner.critChance * (1 + 0.03 * this.variant * this.stacks) * 60,
                    offensivePositionScore: positionWeights[0] * 50
                };
            }
        };

        case "Fight Fire With Fire": return {
            name : "Fight Fire With Fire",
            variant: abilityVariant,
            role : function(){ return "malefic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--FightFireWithFire)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
            },
            duration: function(){return 10 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    leftScore: this.left * 8,
                    defensivePositionScore: - positionWeights[1] * 50,
                    healthScore: - owner.curHealth / owner.maxHealth * 50 
                };
            }
        };

        //CLERIC

        case "Mercyful Fate": return {
            name : "Mercyful Fate",
            variant: abilityVariant,
            role : function(){ return "cleric"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--MercyfulFate)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var buffer = {};
                for(var i = 0; i < myTeam.length; i++){
                    if(myTeam[i]._id === this.casterId) buffer = myTeam[i];
                }
                var heal = (75 + this.variant * 15) * (1 + buffer.spellPower) * this.stacks;
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
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var buffer = {};
                for (var i = 0; i < myTeam.length; i++) {
                    if (myTeam[i]._id === this.casterId) buffer = myTeam[i];
                }

                var heal = (75 + this.variant * 15) * (1 + buffer.spellPower) * this.stacks;

                heal = arenaService.calculateExpectedHeal(heal, buffer);

                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: heal / 7,
                    leftScore: this.left * 7,
                    defensivePositionScore: - positionWeights[1] * 25,
                    healthScore: - owner.curHealth / owner.maxHealth * 25
                };
            }
        };

        case "Hallowed Be Thy Name": return {
            name : "Hallowed Be Thy Name",
            variant: abilityVariant,
            role : function(){ return "cleric"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--HallowedBeThyName)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                switch(this.variant){
                    case 1:
                        owner.attackPowerMod += 0.25;
                        owner.blockChanceMod += 0.25;
                        break;
                    case 2:
                        owner.critChanceMod += 0.25;
                        owner.dodgeChanceMod += 0.25;
                        break;
                    case 3:
                        owner.spellPowerMod += 0.25;
                        owner.hitChanceMod += 0.25;
                        break;
                    case 4:
                        owner.physResMod += 0.25;
                        owner.healthRegMod += 0.25;
                        break;
                    case 5:
                        owner.magicResMod += 0.25;
                        owner.manaRegMod += 0.25;
                        break;
                }
            },
            duration: function(){return 12},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var effectScore = 0;
                switch(this.variant){
                    case 1:
                        effectScore = owner.attackPower * (1 + 0.25) * 60 + owner.blockChance * (1 + 0.25) * 60;
                        break;
                    case 2:
                        effectScore = owner.critChance * (1 + 0.25) * 60 + owner.dodgeChance * (1 + 0.25) * 60;
                        break;
                    case 3:
                        effectScore = owner.spellPower * (1 + 0.25) * 60 + owner.hitChance * (1 + 0.25) * 15;
                        break;
                    case 4:
                        effectScore = owner.physRes * (1 + 0.25) * 60 + owner.healthReg * (1 + 0.25) * 240;
                        break;
                    case 5:
                        effectScore = owner.magicRes * (1 + 0.25) * 60 + owner.manaReg * (1 + 0.25) * 240;
                        break;
                }
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: effectScore,
                    leftScore: this.left * 3,
                    offensivePositionScore: positionWeights[0] * 30
                };
            }
        };

        case "Heaven Can Wait": return {
            name : "Heaven Can Wait",
            variant: abilityVariant,
            role : function(){ return "cleric"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--HeavenCanWait)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                owner.physImmune = true;
                owner.magicImmune = true;
                owner.controlImmune = true;
            },
            duration: function(){return 4 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    leftScore: this.left * 13,
                    defensivePositionScore: - positionWeights[1] * 25,
                    healthScore: - owner.curHealth / owner.maxHealth * 25 
                };
            }
        };

        //HERETIC

        case "Fear Of The Dark": return {
            name : "Fear Of The Dark",
            variant: abilityVariant,
            role : function(){ return "heretic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--FearOfTheDark)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                var magicDamage = (40 + this.variant * 60) * (1 + debuffer.spellPower);
                var critical = debuffer.checkCrit();
                if(critical){
                    magicDamage=debuffer.applyCrit(magicDamage);
                }
                magicDamage = owner.applyResistance(magicDamage, true);
                owner.takeDamage(magicDamage, debuffer, {name: this.name +" (DOT effect)", icon: this.icon(), role: this.role()}, false, false, critical, myTeam, enemyTeam);
            },
            duration: function(){return 12 - this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                var magicDamage = (40 + this.variant * 60) * (1 + debuffer.spellPower);
                magicDamage = arenaService.calculateExpectedDamage(magicDamage, debuffer);
                magicDamage = owner.applyResistance(magicDamage, true);
                
                return {
                    effectScore: magicDamage / 9,
                    leftScore: this.left * 5
                };
            }
        };

        case "Creeping Death": return {
            name : "Creeping Death",
            variant: abilityVariant,
            role : function(){ return "heretic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--CreepingDeath)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                var magicDamage = 30 * this.variant * (1 + debuffer.spellPower) * this.stacks;
                var critical = debuffer.checkCrit();
                if(critical){
                    magicDamage = debuffer.applyCrit(magicDamage);
                }
                magicDamage = owner.applyResistance(magicDamage, true);
                owner.takeDamage(magicDamage, debuffer, {name: this.name, icon: this.icon(), role: this.role()}, false, false, critical, myTeam, enemyTeam);
            },
            duration: function(){return 12-this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return true},
            infinite: function() {return false},
            maxStacks: function() {return 5},
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                var magicDamage = 30 * this.variant * (1 + debuffer.spellPower) * this.stacks;
                magicDamage = arenaService.calculateExpectedDamage(magicDamage, debuffer);
                magicDamage = owner.applyResistance(magicDamage, true);
                
                return {
                    effectScore: magicDamage / 11,
                    leftScore: this.left * 5
                };
            }
        };

        case "Spreading The Disease": return {
            name : "Spreading The Disease",
            variant: abilityVariant,
            role : function(){ return "heretic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--SpreadingTheDisease)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                var magicDamage = 20 * this.variant * (1 + debuffer.spellPower) * this.stacks;
                var critical = debuffer.checkCrit();
                if(critical){
                    magicDamage=debuffer.applyCrit(magicDamage);
                }
                magicDamage = owner.applyResistance(magicDamage, true);
                owner.takeDamage(magicDamage, debuffer, {name: this.name, icon: this.icon(), role: this.role()}, false, false, critical, myTeam, enemyTeam);

                owner.attackPowerMod -= this.variant * 0.01 * this.stacks;
                owner.spellPowerMod -= this.variant * 0.01 * this.stacks;
                owner.critChanceMod -= this.variant * 0.01 * this.stacks;

                var nearbyAllies = arenaService.findAllies(owner, myTeam, 1, walls);
                for (i = 0; i < nearbyAllies.length; i++) {
                    if(nearbyAllies[i]._id !== owner._id) {
                        if(nearbyAllies[i].findEffect("Spreading The Disease")===-1){
                            nearbyAllies[i].addDebuff(nearbyAllies[i].addEffectFromEffects("Spreading The Disease", this.variant), debuffer, enemyTeam, myTeam, walls);
                        }
                    }
                }
            },
            duration: function(){return 6 + this.variant},
            left : 0,
            stacks: 0,
            stacked: function() {return true},
            infinite: function() {return false},
            maxStacks: function() {return 5},
            onlyStat: function() {return false},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == this.casterId) debuffer = enemyTeam[i];
                }
                var magicDamage = 20 * this.variant * (1 + debuffer.spellPower) * this.stacks;
                magicDamage = arenaService.calculateExpectedDamage(magicDamage, debuffer);
                magicDamage = owner.applyResistance(magicDamage, true);

                var nearbyAllies = arenaService.findAllies(owner, myTeam, 1, walls);            
                
                return {
                    effectScore: (magicDamage / 2 - (owner.attackPower * (1 - this.variant * 0.01 * this.stacks) * 15 + owner.spellPower * (1 - this.variant * 0.01 * this.stacks) * 15 + owner.critChance * (1 - this.variant * 0.01 * this.stacks) * 15)) * (nearbyAllies.length + 1),
                    leftScore: this.left * 5
                };
            }
        };

        case "Children Of The Damned": return {
            name : "Children Of The Damned",
            variant: abilityVariant,
            role : function(){ return "heretic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--ChildrenOfTheDamned)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
                switch(this.variant){
                    case 1:
                        owner.attackPowerMod -= 0.25;
                        owner.blockChanceMod -= 0.25;
                        break;
                    case 2:
                        owner.critChanceMod -= 0.25;
                        owner.dodgeChanceMod -= 0.25;
                        break;
                    case 3:
                        owner.spellPowerMod -= 0.25;
                        owner.hitChanceMod -= 0.25;
                        break;
                    case 4:
                        owner.physResMod -= 0.25;
                        owner.healthRegMod -= 0.25;
                        break;
                    case 5:
                        owner.magicResMod -= 0.25;
                        owner.manaRegMod -= 0.25;
                        break;
                }

            },
            duration: function(){return 12},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var effectScore = 0;
                switch(this.variant){
                    case 1:
                        effectScore = owner.attackPower * (1 - 0.25) * 60 + owner.blockChance * (1 - 0.25) * 60;
                        break;
                    case 2:
                        effectScore = owner.critChance * (1 - 0.25) * 60 + owner.dodgeChance * (1 - 0.25) * 60;
                        break;
                    case 3:
                        effectScore = owner.spellPower * (1 - 0.25) * 60 + owner.hitChance * (1 - 0.25) * 15;
                        break;
                    case 4:
                        effectScore = owner.physRes * (1 - 0.25) * 60 + owner.healthReg * (1 - 0.25) * 240;
                        break;
                    case 5:
                        effectScore = owner.magicRes * (1 - 0.25) * 60 + owner.manaReg * (1 - 0.25) * 240;
                        break;
                }
                var positionWeights = arenaService.calculatePositionWeight(owner.position, owner, myTeam, enemyTeam, arenaService.getOptimalRange(owner), walls);
                return {
                    effectScore: - effectScore,
                    leftScore: this.left * 5,
                    offensivePositionScore: positionWeights[0] * 60
                };
            }
        };

        case "Locked And Loaded": return {
            name : "Locked And Loaded",
            variant: abilityVariant,
            role : function(){ return "heretic"},
            icon : function(){ return "url(../images/assets/svg/view/sprites.svg#abilities--LockedAndLoaded)"},
            apply : function (owner, myTeam, enemyTeam, walls) {
            },
            duration: function(){return 4 + this.variant * 2},
            left : 0,
            stacks: 0,
            stacked: function() {return false},
            infinite: function() {return false},
            maxStacks: function() {return 0},
            onlyStat: function() {return true},
            magicEffect: function() {return true},
            score: function(owner, myTeam, enemyTeam, walls) {
                var targetIsAlly = false;

                for(var i = 0; i < myTeam.length; i++){
                    if(myTeam[i]._id == this.casterId) targetIsAlly = true;
                }   

                var totalEffects = 0;
                if(targetIsAlly){
                    for(i = 0; i < owner.buffs.length; i++){
                        if(owner.buffs[i].stacked()) totalEffects += owner.buffs[i].stacks;
                        else totalEffects++;
                    }
                }
                else {
                    for(i = 0; i < owner.debuffs.length; i++){
                        if(owner.debuffs[i].stacked()) totalEffects += owner.debuffs[i].stacks;
                        else totalEffects++;
                    }
                } 
                
                return {
                    effectScore: totalEffects * 10,
                    leftScore: this.left * 4
                };
            }
        };

    }
};

module.exports = function(name, abilityVariant) {
    return new Effect(name, abilityVariant);
};
