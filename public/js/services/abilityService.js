//Сервис способностей в игре
(function (module) {
    module.service('abilityService', function(randomService, effectService, gettextCatalog) {
        return {
            ability: function(name){
                switch(name){
                    case "Void": return {
                        name : "Void",
                        localName: function(){return gettextCatalog.getString("Void")},
                        role : "void",
                        variant: 3,
                        desc: function(){
                            return "Empty";
                        },
                        icon : "url(../images/assets/svg/view/sprites.svg#abilities--void)",
                        targetType : "self",
                        range: 0,
                        energyCost : 99999,
                        manaCost : 99999,
                        cooldown : 6,
                        needWeapon : false,
                        duration: 0,
                        cd : 0
                    };break;
                }
            },
            translateAbilities: function(abilities) {
                for(var i=0;i<abilities.length;i++){
                    switch(abilities[i].name) {
                        //SENTINEL

                        case "Strong Arm Of The Law":
                            abilities[i].localName = function () {
                                return gettextCatalog.getString("Strong Arm Of The Law")
                            };
                            abilities[i].desc = function () {
                                var str = gettextCatalog.getString(
                                    "Strikes enemy, deals {{one}}% of weapon damage and decreases target Hit Chance to {{two}}%", {
                                        one: (this.variant * 20 + 100).toFixed(0),
                                        two: (this.variant * 7)
                                    });
                                str += " ";
                                str += gettextCatalog.getPlural(this.duration, "for next turn.", "for next {{$count}} turns.", {});
                                return str;
                            };
                            break;

                        case "Defender Of The Faith":
                            abilities[i].localName = function(){return gettextCatalog.getString("Defender Of The Faith")};
                            abilities[i].desc = function() {
                                switch(this.variant){
                                    case 1: return gettextCatalog.getString("Cast on ally target. Increases Block Chance, Magical and Physical Resistances for 10%."); break;
                                    case 2: return gettextCatalog.getString("Increases Block Chance, Magical and Physical Resistances of all party members for 10%"); break;
                                    case 3: return gettextCatalog.getString("Cast on ally target. Increases Block Chance, Magical and Physical Resistances for 20%"); break;
                                    case 4: return gettextCatalog.getString("Increases Block Chance, Magical and Physical Resistances of all party members for 20%"); break;
                                    case 5: return gettextCatalog.getString("Cast on ally target. Increases Block Chance, Magical and Physical Resistances for 40%"); break;
                                }
                            };
                            break;

                        case "Disarm":
                            abilities[i].localName = function(){return gettextCatalog.getString("Disarm")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Takes off target weapon and some armor. Reduces target physical resistance and dodge chance for {{one}}%.",{
                                        one: (this.variant*7).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Walk Away":
                            abilities[i].localName = function(){return gettextCatalog.getString("Walk Away")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Strikes enemy with shield, deals {{one}}% of weapon damage, throws enemy away and stuns him",{
                                        one: (this.variant*30+80).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Sanctuary":
                            abilities[i].localName = function(){return gettextCatalog.getString("Sanctuary")};
                            abilities[i].desc = function() {
                            var str = gettextCatalog.getString(
                                "Cast on ally target. Caster takes {{one}}% of damage taken by target ally.",{
                                    one: (this.variant*15).toFixed(0)
                                });
                            str+=" ";
                            str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                            return str;
                            };
                            break;

                        case "The Punishment Due":
                            abilities[i].localName = function(){return gettextCatalog.getString("The Punishment Due")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Strikes enemy, deals {{one}}% of weapon damage. After that causes bleeding for {{two}}% of dealing damage",{
                                        one: (this.variant*10+90).toFixed(0),
                                        two: (this.variant*10).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Come And Get It":
                            abilities[i].localName = function(){return gettextCatalog.getString("Come And Get It")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Throws spear to enemy, deals {{one}}% of weapon damage and draws the target to caster.",{
                                        one: (this.variant*20+50).toFixed(0)
                                    });
                            };
                            break;

                        case "New Faith":
                            abilities[i].localName = function(){return gettextCatalog.getString("New Faith")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString("Cast on ally target. Removes 3 random negative effects, that cause periodic damage. Restore {{one}} health.",
                                    {one: (200+this.variant*175).toFixed(0)});
                            };
                            break;

                        //SLAYER

                        case "Die By The Sword":
                            abilities[i].localName = function(){return gettextCatalog.getString("Die By The Sword")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Strikes enemy, deals {{one}}% of weapon damage.",{
                                        one: (this.variant*35+100).toFixed(0)
                                    });
                            };
                            break;

                        case "Reign In Blood":
                            abilities[i].localName = function(){return gettextCatalog.getString("Reign In Blood")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Strikes enemy, deals {{one}}% of weapon damage and increases Attack Power to {{two}}% until miss. Stacks up 5 times.",{
                                        one: (this.variant*10+80).toFixed(0),
                                        two: (this.variant*2)
                                    });
                            };
                            break;

                        case "Grinder":
                            abilities[i].localName = function(){return gettextCatalog.getString("Grinder")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Strikes all enemies in 1 cell radius, deals {{one}}% of weapon damage. Ability has {{two}}% chance to restore it's cooldown immediately.",{
                                        one: (this.variant*20+50).toFixed(0),
                                        two: (36-this.variant*6)
                                    });
                            };
                            break;

                        case "Follow The Tears":
                            abilities[i].localName = function(){return gettextCatalog.getString("Follow The Tears")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Charges to enemy and deals {{one}}% of weapon damage.",{
                                        one: (this.variant*30+50).toFixed(0)
                                    });
                            };
                            break;

                        case "Made In Hell":
                            abilities[i].localName = function(){return gettextCatalog.getString("Made In Hell")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Calls to hell and becomes immune to magical damage");
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                str+=" ";
                                str+= gettextCatalog.getString(
                                    "Mana Regeneration increased to {{one}} %.",{
                                        one: (this.variant*60).toFixed(0)
                                    });
                                return str;
                            };
                            break;

                        case "Spill The Blood":
                            abilities[i].localName = function(){return gettextCatalog.getString("Spill The Blood")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Attack Power increased to {{one}}%. Health Regeneration increased to {{two}}%.",{
                                        one: (this.variant*10).toFixed(0),
                                        two: (this.variant*15).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Dyers Eve":
                            abilities[i].localName = function(){return gettextCatalog.getString("Dyers Eve")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Ability can be used only if character health is less than 50%. Heals up caster for {{one}} and increases Critical Chance for {{two}}%.",{
                                        one: (500+this.variant*500).toFixed(0),
                                        two: (this.variant*20).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "I Dont Wanna Stop":
                            abilities[i].localName = function(){return gettextCatalog.getString("I Dont Wanna Stop")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Character becomes immune to control abilities");
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                str+=" ";
                                str+= gettextCatalog.getString(
                                    "Restores {{one}} energy.",{
                                        one: (100+this.variant*150).toFixed(0)
                                    });
                                str+=" ";
                                str+= gettextCatalog.getString(
                                    "This ability doesn't remove control effects, which is already on character.");
                                return str;
                            };
                            break;

                        //REDEEMER

                        case "Shot Down In Flames":
                            abilities[i].localName = function(){return gettextCatalog.getString("Shot Down In Flames")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Shoots the enemy, deals {{one}}% of weapon damage and {{two}} magical damage.",{
                                        one: ((6-this.variant)*10+60).toFixed(0),
                                        two: (400+this.variant*50).toFixed(0)
                                    });
                            };
                            break;

                        case "Electric Eye":
                            abilities[i].localName = function(){return gettextCatalog.getString("Electric Eye")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Shoots the enemy, deals {{one}}% of weapon damage and {{two}} magical damage.",{
                                        one: (this.variant*10+90).toFixed(0),
                                        two: (300+this.variant*50).toFixed(0)
                                    });
                            };
                            break;

                        case "Lights In The Sky":
                            abilities[i].localName = function(){return gettextCatalog.getString("Lights In The Sky")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Cast on ally target. Increases Hit Chance for {{one}}% and Critical Chance for {{two}}%.",{
                                        one: (15+this.variant*2).toFixed(0),
                                        two: (25-this.variant*2).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Thunderstruck":
                            abilities[i].localName = function(){return gettextCatalog.getString("Thunderstruck")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Throws lightning which deals {{one}} magical damage and stuns target",{
                                        one: (80+this.variant*150).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "You Aint No Angel":
                            abilities[i].localName = function(){return gettextCatalog.getString("You Aint No Angel")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Up in the air and becomes immune to physical damage");
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                str+=" ";
                                str+= gettextCatalog.getString(
                                    "Health Regeneration increased to {{one}} %.",{
                                        one: (this.variant*60).toFixed(0)
                                    });
                                return str;
                            };
                            break;

                        case "State Of Grace":
                            abilities[i].localName = function(){return gettextCatalog.getString("State Of Grace")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Fully restores energy. Every turn restores {{one}} health and {{two}} mana",{
                                        one: (100+this.variant*60).toFixed(0),
                                        two: (460-this.variant*60).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "My Last Words":
                            abilities[i].localName = function(){return gettextCatalog.getString("My Last Words")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "This ability can be used only against characters with less than 50% health. Shoots the enemy, deals {{one}}% of weapon damage and {{two}} magical damage.",{
                                        one: (this.variant*20+100).toFixed(0),
                                        two: (400+this.variant*100).toFixed(0)
                                    });
                            };
                            break;

                        case "Come Cover Me":
                            abilities[i].localName = function(){return gettextCatalog.getString("Come Cover Me")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Cast on ally target. Draws the target to caster. Every turn restores {{one}} target's health.",{
                                        one: (100+this.variant*50).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        //RIPPER

                        case "Inject The Venom":
                            abilities[i].localName = function(){return gettextCatalog.getString("Inject The Venom")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Strikes enemy, deals {{one}}% of weapon damage and injects the venom, what deals {{two}} magical damage",{
                                        one: (this.variant*10+100).toFixed(0),
                                        two: (this.variant*75)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"during next turn", "during next {{$count}} turns",{});
                                return str;
                            };
                            break;

                        case "Invisible":
                            abilities[i].localName = function(){return gettextCatalog.getString("Invisible")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Character becomes invisible. Invisibility fades if owner takes or deals damage. While character is invisible, his Attack Power increased to {{one}}%.",{
                                        one: (this.variant*20).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Jawbreaker":
                            abilities[i].localName = function(){return gettextCatalog.getString("Jawbreaker")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Strikes enemy, deals {{one}}% of weapon damage and makes target silenced",{
                                        one: (this.variant*10+80).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Hog Tied":
                            abilities[i].localName = function(){return gettextCatalog.getString("Hog Tied")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Charges to enemy, deals {{one}}% of weapon damage and immobilizes target",{
                                        one: (this.variant*15+80).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Running Free":
                            abilities[i].localName = function(){return gettextCatalog.getString("Running Free")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Decreases movement cost to {{one}} energy. Remove all immobilize effects.",{
                                        one: (this.variant*40).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Fast As The Shark":
                            abilities[i].localName = function(){return gettextCatalog.getString("Fast As The Shark")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Increases Luck for {{one}}% and Dodge Chance for {{two}}%",{
                                        one: (this.variant*15).toFixed(0),
                                        two: (this.variant*20).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Prowler":
                            abilities[i].localName = function(){return gettextCatalog.getString("Prowler")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Strikes enemy, deals {{one}}% of weapon damage and stuns target",{
                                        one: (this.variant*10+100).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Fade To Black":
                            abilities[i].localName = function(){return gettextCatalog.getString("Fade To Black")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString("Cast on ally target. Target becomes invisible");
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                str+=" ";
                                str+=gettextCatalog.getString("Effect fades if owner takes or deals damage.");
                                return str;
                            };
                            break;

                        //PROPHET

                        case "Stargazer":
                            abilities[i].localName = function(){return gettextCatalog.getString("Stargazer")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Shoots the enemy with wand, deals {{one}}% of weapon damage, {{two}} magical damage and increases Spell Power to {{three}}%",{
                                        one: (this.variant*10+100).toFixed(0),
                                        two: (250+this.variant*0.1*250).toFixed(0),
                                        three: this.variant
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                str+=" ";
                                str+=gettextCatalog.getString("Stacks up 5 times.");
                                return str;
                            };
                            break;

                        case "Speed Of Light":
                            abilities[i].localName = function(){return gettextCatalog.getString("Speed Of Light")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getPlural((1+this.variant),"Teleports character to any cell in {{$count}} cell radius.","Teleports character to any cell in {{$count}} cells radius.",{});
                            };
                            break;

                        case "Never A Word":
                            abilities[i].localName = function(){return gettextCatalog.getString("Never A Word")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "All enemies in 1 cell radius becomes silenced");
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Prophecy":
                            abilities[i].localName = function(){return gettextCatalog.getString("Prophecy")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Shows current spells of the target. Decreases Magical Resistance and Initiative of the target to {{one}}%.",{
                                        one: (this.variant*10).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Lets Me Take It":
                            abilities[i].localName = function(){return gettextCatalog.getString("Lets Me Take It")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Steals 1 random positive effect from enemy to caster.");
                            };
                            break;

                        case "Brain Damage":
                            abilities[i].localName = function(){return gettextCatalog.getString("Brain Damage")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Deals {{one}} magical damage for every turn, that lefts for every target ability.",{
                                        one: (this.variant*12).toFixed(0)
                                    });
                            };
                            break;

                        case "Infinite Dreams":
                            abilities[i].localName = function(){return gettextCatalog.getString("Infinite Dreams")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Cast on ally target. Increases Initiative for {{one}}%. Every turn restores {{two}}% mana.",{
                                        one: (this.variant*15).toFixed(0),
                                        two: (this.variant).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Caught Somewhere In Time":
                            abilities[i].localName = function(){return gettextCatalog.getString("Caught Somewhere In Time")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Every turn deals {{one}} magical damage",{
                                        one: (75*this.variant).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"during next turn", "during next {{$count}} turns",{});
                                str+=" ";
                                str+=gettextCatalog.getString("Immobilize target. Every turn damage from this effect rise up for {{one}}%.", {
                                    one: (35-this.variant*5).toFixed(0)
                                });
                                return str;
                            };
                            break;

                        //MALEFIC

                        case "Family Tree":
                            abilities[i].localName = function(){return gettextCatalog.getString("Family Tree")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Malefic staff transforms into the burning tree. Deals {{one}}% of weapon damage and {{two}} magical damage to all enemies in 2 cell radius.",{
                                        one: (this.variant*10+80).toFixed(0),
                                        two: (150+this.variant*70).toFixed(0)
                                    });
                            };
                            break;

                        case "Burning Ambition":
                            abilities[i].localName = function(){return gettextCatalog.getString("Burning Ambition")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Burns target weapon and deals {{one}} magical damage.",{
                                        one: (200+this.variant*150).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Disarm lasts {{$count}} turn.", "Disarm lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Fireball":
                            abilities[i].localName = function(){return gettextCatalog.getString("Fireball")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Deals {{one}} magical damage to target and {{two}} magical damage to all enemy targets in 1 cell radius.",{
                                        one: (1250+this.variant*200).toFixed(0),
                                        two: (1500-this.variant*200).toFixed(0)
                                    });
                            };
                            break;

                        case "Thank God For The Bomb":
                            abilities[i].localName = function(){return gettextCatalog.getString("Thank God For The Bomb")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Target becomes living bomb and every turn gets {{one}} magical damage",{
                                        one: (100*this.variant).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"for next turn.", "for next {{$count}} turns.",{});
                                str+=" ";
                                str+=gettextCatalog.getString(
                                    "When this effect ends, all enemies in one cell radius around target gets {{one}} magical damage and becomes stunned for 3 turns.",{
                                        one: (300*this.variant).toFixed(0)
                                    });
                                return str;
                            };
                            break;

                        case "Powerslave":
                            abilities[i].localName = function(){return gettextCatalog.getString("Powerslave")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Increases Spell Power for {{one}}%. Brings you in clearcasting state. In this state you doesn't need mana for abilities. This effect is active until you use any ability.",{
                                        one: (this.variant*15).toFixed(0)
                                    });
                            };
                            break;

                        case "Cauterization":
                            abilities[i].localName = function(){return gettextCatalog.getString("Cauterization")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString("Cast on ally target. Every turn restores {{one}} health and burns {{two}} mana.", {
                                    one: (this.variant*80).toFixed(0),
                                    two: (this.variant*60).toFixed(0)
                                });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Down In Flames":
                            abilities[i].localName = function(){return gettextCatalog.getString("Down In Flames")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Increases Spell Power and Critical Chance for {{one}}%. Effect fades if you miss. Stacks up 10 times.",{
                                        one: (this.variant*3).toFixed(0)
                                    });
                            };
                            break;

                        case "Fight Fire With Fire":
                            abilities[i].localName = function(){return gettextCatalog.getString("Fight Fire With Fire")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString("Returns {{one}}% of damage back to the attacker.", {
                                    one: (20+this.variant*10).toFixed(0)
                                });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        //CLERIC

                        case "Hammer Of The Gods":
                            abilities[i].localName = function(){return gettextCatalog.getString("Hammer Of The Gods")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Strikes enemy with hammer, deals {{one}}% of weapon damage, {{two}} magical damage and restores mana equal to dealing damage.",{
                                        one: (this.variant*15+100).toFixed(0),
                                        two: (400+this.variant*75).toFixed(0)
                                    });
                            };
                            break;

                        case "Mercyful Fate":
                            abilities[i].localName = function(){return gettextCatalog.getString("Mercyful Fate")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Cast on ally target. Every turn restores {{one}} health. Stacks up 3 times.",{
                                        one: (75+this.variant*15).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        case "Laying On Hands":
                            abilities[i].localName = function(){return gettextCatalog.getString("Laying On Hands")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString("Restore {{one}}% health for one target.", {
                                    one: (10+this.variant*15).toFixed(0)
                                });
                            };
                            break;

                        case "Holy Smoke":
                            abilities[i].localName = function(){return gettextCatalog.getString("Holy Smoke")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Heals up ally target for {{one}}. Or deals {{two}} magical damage to enemy target.",{
                                        one: (250+this.variant*250).toFixed(0),
                                        two: (150+this.variant*150).toFixed(0)
                                    });
                            };
                            break;

                        case "Cleanse The Soul":
                            abilities[i].localName = function(){return gettextCatalog.getString("Cleanse The Soul")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getPlural(this.variant,"Removes {{$count}} random negative effects from ally.", "Removes {{$count}} random negative effect from ally.",{});
                            };
                            break;

                        case "Hallowed Be Thy Name":
                            abilities[i].localName = function(){return gettextCatalog.getString("Hallowed Be Thy Name")};
                            abilities[i].desc = function() {
                                switch(this.variant){
                                    case 1: return gettextCatalog.getString("Cast on ally target. Increases Attack Power and Block Chance for 25%."); break;
                                    case 2: return gettextCatalog.getString("Cast on ally target. Increases Critical Chance and Dodge Chance for 25%."); break;
                                    case 3: return gettextCatalog.getString("Cast on ally target. Increases Spell Power and Hit Chance for 25%."); break;
                                    case 4: return gettextCatalog.getString("Cast on ally target. Increases Physical Resistance and Health Regeneration for 25%."); break;
                                    case 5: return gettextCatalog.getString("Cast on ally target. Increases Magical Resistance and Mana Regeneration for 25%."); break;
                                }
                            };
                            break;

                        case "Hit The Lights":
                            abilities[i].localName = function(){return gettextCatalog.getString("Hit The Lights")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Cleric shines on all targets in 2 cell radius. Deals {{one}} magical damage to all enemies. And heals up allies for {{two}}.",{
                                        one: (775-this.variant*75).toFixed(0),
                                        two: (325+this.variant*75).toFixed(0)
                                    });
                            };
                            break;

                        case "Heaven Can Wait":
                            abilities[i].localName = function(){return gettextCatalog.getString("Heaven Can Wait")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Cast on ally target. Removes all debuffs from target and makes it immune to all damage and control.");
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                return str;
                            };
                            break;

                        //HERETIC

                        case "Bloodsucker":
                            abilities[i].localName = function(){return gettextCatalog.getString("Bloodsucker")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Strikes enemy with dagger, deals {{one}}% of weapon damage, {{two}} magical damage and restores health equal to dealing damage.",{
                                        one: (this.variant*10+100).toFixed(0),
                                        two: (150+this.variant*15).toFixed(0)
                                    });
                            };
                            break;

                        case "Fear Of The Dark":
                            abilities[i].localName = function(){return gettextCatalog.getString("Fear Of The Dark")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Deals {{one}} magical damage and infects target with Fear Of The Dark, which deals {{two}} magical damage",{
                                        one: (300+this.variant*60).toFixed(0),
                                        two: (40+this.variant*60).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"during next turn", "during next {{$count}} turns",{});
                                return str;
                            };
                            break;

                        case "Creeping Death":
                            abilities[i].localName = function(){return gettextCatalog.getString("Creeping Death")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Every turn deals {{one}} magical damage",{
                                        one: (30*this.variant).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"during next turn", "during next {{$count}} turns",{});
                                str+=" ";
                                str+=gettextCatalog.getString("Stacks up 5 times.");
                                return str;
                            };
                            break;

                        case "Spreading The Disease":
                            abilities[i].localName = function(){return gettextCatalog.getString("Spreading The Disease")};
                            abilities[i].desc = function() {
                                var str = gettextCatalog.getString(
                                    "Every turn deals {{one}} magical damage. Decreases target's Attack Power, Spell Power and Critical Chance to {{two}}%. This effect spreads on all enemies in 1 cell radius around target.",{
                                        one: (20*this.variant).toFixed(0),
                                        two: (this.variant).toFixed(0)
                                    });
                                str+=" ";
                                str+=gettextCatalog.getPlural(this.duration,"Lasts {{$count}} turn.", "Lasts {{$count}} turns.",{});
                                str+=" ";
                                str+=gettextCatalog.getString("Stacks up 5 times.");
                                return str;
                            };
                            break;

                        case "Purgatory":
                            abilities[i].localName = function(){return gettextCatalog.getString("Purgatory")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getPlural(this.variant,"Removes {{$count}} random positive effects from enemy.", "Removes {{$count}} random positive effect from enemy.",{});
                            };
                            break;

                        case "Children Of The Damned":
                            abilities[i].localName = function(){return gettextCatalog.getString("Children Of The Damned")};
                            abilities[i].desc = function() {
                                switch(this.variant){
                                    case 1: return gettextCatalog.getString("Cast on enemy target. Decreases Attack Power and Block Chance for 25%."); break;
                                    case 2: return gettextCatalog.getString("Cast on enemy target. Decreases Critical Chance and Dodge Chance for 25%."); break;
                                    case 3: return gettextCatalog.getString("Cast on enemy target. Decreases Spell Power and Hit Chance for 25%."); break;
                                    case 4: return gettextCatalog.getString("Cast on enemy target. Decreases Physical Resistance and Health Regeneration for 25%."); break;
                                    case 5: return gettextCatalog.getString("Cast on enemy target. Decreases Magical Resistance and Mana Regeneration for 25%."); break;
                                }
                            };
                            break;

                        case "Locked And Loaded":
                            abilities[i].localName = function(){return gettextCatalog.getString("Locked And Loaded")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString("Cast on any target. While this effect active, owner's buffs and debuffs can't be dispelled or stolen.");
                            };
                            break;

                        case "A Touch Of Evil":
                            abilities[i].localName = function(){return gettextCatalog.getString("A Touch Of Evil")};
                            abilities[i].desc = function() {
                                return gettextCatalog.getString(
                                    "Strikes enemy with dagger, deals {{one}}% of weapon damage and {{two}} magical damage for each effect on target.",{
                                        one: (this.variant*6+10).toFixed(0),
                                        two: (40+this.variant*25).toFixed(0)
                                    });
                            };
                            break;

                    }
                }

                return abilities;
            }
        }
    });
})(angular.module("fotm"));