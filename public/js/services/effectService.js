//Сервис эффектов в игре
(function (module) {
    module.service('effectService', function(randomService, gettextCatalog) {
    return {
        translateEffects: function(effects) {
            for (var i = 0; i < effects.length; i++) {
                switch (effects[i].name) {

                    //SENTINEL
                    case "Strong Arm Of The Law":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Strong Arm Of The Law")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Hit Chance decreased to {{one}}%.",{
                                    one: (this.variant*7).toFixed(0)
                                });
                        };
                        break;

                    case "Defender Of The Faith":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Defender Of The Faith")
                        };
                        effects[i].desc = function() {
                            switch(this.variant){
                                case 1: return gettextCatalog.getString("Block Chance increased to 10%.<br>Physical Resistance increased to 10%.<br>Magical Resistance increased to 10%."); break;
                                case 2: return gettextCatalog.getString("Block Chance increased to 10%.<br>Physical Resistance increased to 10%.<br>Magical Resistance increased to 10%."); break;
                                case 3: return gettextCatalog.getString("Block Chance increased to 20%.<br>Physical Resistance increased to 20%.<br>Magical Resistance increased to 20%."); break;
                                case 4: return gettextCatalog.getString("Block Chance increased to 20%.<br>Physical Resistance increased to 20%.<br>Magical Resistance increased to 20%."); break;
                                case 5: return gettextCatalog.getString("Block Chance increased to 40%.<br>Physical Resistance increased to 40%.<br>Magical Resistance increased to 40%."); break;
                            }
                        };
                        break;

                    case "Disarm":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Disarm")
                        };
                        effects[i].desc = function() {
                            var str = gettextCatalog.getString(
                                "Disarmed. Can't use abilities, what needs weapon.");
                            str+=" ";
                            str+=gettextCatalog.getString(
                                "Physical Resistance decreased to {{one}}%.",{
                                    one: (this.variant*7).toFixed(0)
                                });
                            str+=" ";
                            str+=gettextCatalog.getString(
                                "Dodge Chance decreased to {{one}}%.",{
                                    one: (this.variant*7).toFixed(0)
                                });
                            return str;
                        };
                        break;

                    case "Walk Away":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Walk Away")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Stunned. Skip next turn.");
                        };
                        break;

                    case "Sanctuary":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Sanctuary")
                        };
                        effects[i].desc = function() {
                            var str = this.caster;
                            str+=" ";
                            str+=gettextCatalog.getString(
                                "takes {{one}}% of damage from this character.",{
                                    one: (this.variant*15).toFixed(0)
                                });
                            return str;
                        };
                        break;

                    case "The Punishment Due":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("The Punishment Due")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Every turn deals {{one}} physical damage.",{
                                    one: (this.bleedDamage).toFixed(0)
                                });
                        };
                        break;

                    //SLAYER

                    case "Reign In Blood":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Reign In Blood")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Attack Power increased to {{one}}% until miss.",{
                                    one: (2*this.variant*this.stacks).toFixed(0)
                                });
                        };
                        break;

                    case "Made In Hell":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Made In Hell")
                        };
                        effects[i].desc = function() {
                            var str = gettextCatalog.getString(
                                "Immune to magical attacks.");
                            str+=" ";
                            str+=gettextCatalog.getString(
                                "Mana Regeneration increased to {{one}}%.",{
                                    one: (this.variant*60).toFixed(0)
                                });
                            return str;
                        };
                        break;

                    case "Spill The Blood":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Spill The Blood")
                        };
                        effects[i].desc = function() {
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
                        };
                        break;

                    case "Dyers Eve":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Dyers Eve")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Critical Chance increased to {{one}}%.",{
                                    one: (this.variant*20).toFixed(0)
                                });
                        };
                        break;

                    case "I Dont Wanna Stop":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("I Dont Wanna Stop")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Immunity to control abilities.");
                        };
                        break;

                    //REDEEMER

                    case "Lights In The Sky":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Lights In The Sky")
                        };
                        effects[i].desc = function() {
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
                        };
                        break;

                    case "Thunderstruck":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Thunderstruck")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Stunned. Skip next turn.");
                        };
                        break;

                    case "You Aint No Angel":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("You Aint No Angel")
                        };
                        effects[i].desc = function() {
                            var str = gettextCatalog.getString(
                                "Immune to physical attacks.");
                            str+=" ";
                            str+=gettextCatalog.getString(
                                "Health Regeneration increased to {{one}}%.",{
                                    one: (this.variant*60).toFixed(0)
                                });
                            return str;
                        };
                        break;

                    case "State Of Grace":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("State Of Grace")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Every turn restores {{one}} health and {{two}} mana.",{
                                    one: (100+this.variant*60).toFixed(0),
                                    two: (460-this.variant*60).toFixed(0)
                                });
                        };
                        break;

                    case "Come Cover Me":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Come Cover Me")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Every turn restores {{one}} health.",{
                                    one: (100+this.variant*50).toFixed(0)
                                });
                        };
                        break;

                    //RIPPER

                    case "Inject The Venom":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Inject The Venom")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Every turn deals {{one}} magical damage.",{
                                    one: (this.variant*75).toFixed(0)
                                });
                        };
                        break;

                    case "Invisible":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Invisible")
                        };
                        effects[i].desc = function() {
                            var str = gettextCatalog.getString(
                                "This character is invisible for enemy. Effect fades if character takes or deals damage.");
                            str+=" ";
                            str+=gettextCatalog.getString(
                                "Attack Power increased to {{one}}%.",{
                                    one: (this.variant*20).toFixed(0)
                                });
                            return str;
                        };
                        break;

                    case "Jawbreaker":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Jawbreaker")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Silenced. Can't cast spells.");
                        };
                        break;

                    case "Hog Tied":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Hog Tied")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Immobilized. Can't move.");
                        };
                        break;

                    case "Running Free":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Running Free")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Movement cost decreased to {{one}} energy.",{
                                    one: (this.variant*40).toFixed(0)
                                });
                        };
                        break;

                    case "Fast As The Shark":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Fast As The Shark")
                        };
                        effects[i].desc = function() {
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
                        };
                        break;

                    case "Prowler":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Prowler")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Stunned. Skip next turn.");
                        };
                        break;

                    case "Fade To Black":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Fade To Black")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("This character is invisible for enemy. Effect fades if character takes or deals damage.");
                        };
                        break;

                    //PROPHET

                    case "Stargazer":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Stargazer")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Spell Power increased to {{one}}%.",{
                                    one: (this.variant*this.stacks).toFixed(0)
                                });
                        };
                        break;

                    case "Never A Word":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Never A Word")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Silenced. Can't cast spells.");
                        };
                        break;

                    case "Prophecy":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Prophecy")
                        };
                        effects[i].desc = function() {
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
                        };
                        break;

                    case "Infinite Dreams":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Infinite Dreams")
                        };
                        effects[i].desc = function() {
                            var str = gettextCatalog.getString(
                                "Every turn restore {{one}}% mana.",{
                                    one: (this.variant).toFixed(0)
                                });
                            str+="<br>";
                            str+=gettextCatalog.getString(
                                "Initiative increased to {{one}}%.",{
                                    one: (this.variant*15).toFixed(0)
                                });
                            return str;
                        };
                        break;

                    case "Caught Somewhere In Time":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Caught Somewhere In Time")
                        };
                        effects[i].desc = function() {
                            var str = gettextCatalog.getString(
                                "Every turn deals {{one}} magical damage.",{
                                    one: (75*this.variant+(75*this.variant)*((35-this.variant*5)*0.01)*(this.duration()-this.left)).toFixed(0)
                                });
                            str+="<br>";
                            str+=gettextCatalog.getString("Immobilized. Can't move.");
                            return str;
                        };
                        break;

                    //MALEFIC

                    case "Burning Ambition":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Burning Ambition")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Disarmed. Can't use abilities, what needs weapon.");
                        };
                        break;

                    case "Thank God For The Bomb":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Thank God For The Bomb")
                        };
                        effects[i].desc = function() {
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
                        };
                        break;

                    case "Thank God For The Bomb (Stun)":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Thank God For The Bomb (Stun)")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Stunned. Skip next turn.");
                        };
                        break;

                    case "Powerslave":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Powerslave")
                        };
                        effects[i].desc = function() {
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
                        };
                        break;

                    case "Cauterization":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Cauterization")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Every turn restores {{one}} health and burns {{two}} mana.", {
                                one: (this.variant*80).toFixed(0),
                                two: (this.variant*60).toFixed(0)
                            });
                        };
                        break;

                    case "Down In Flames":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Down In Flames")
                        };
                        effects[i].desc = function () {
                            var str = gettextCatalog.getString(
                                "Spell Power increased to {{one}}%.", {
                                    one: (this.variant * 3 * this.stacks).toFixed(0)
                                });
                            str += "<br>";
                            str += gettextCatalog.getString(
                                "Critical Chance increased to {{one}}%.", {
                                    one: (this.variant * 3 * this.stacks).toFixed(0)
                                });
                            str += "<br>";
                            str += gettextCatalog.getString(
                                "Effect fades if character miss.");
                            return str;
                        };
                        break;

                    case "Fight Fire With Fire":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Fight Fire With Fire")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Returns {{one}}% of damage back to the attacker.", {
                                one: (20+this.variant*10).toFixed(0)
                            });
                        };
                        break;

                    //CLERIC

                    case "Mercyful Fate":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Mercyful Fate")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Every turn restores {{one}} health.",{
                                    one: ((75+this.variant*15)*this.stacks).toFixed(0)
                                });
                        };
                        break;

                    case "Hallowed Be Thy Name":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Hallowed Be Thy Name")
                        };
                        effects[i].desc = function() {
                            switch(this.variant){
                                case 1: return gettextCatalog.getString("Attack Power increased to 25%.<br>Block Chance increased to 25%."); break;
                                case 2: return gettextCatalog.getString("Critical Chance increased to 25%.<br>Dodge Chance increased to 25%."); break;
                                case 3: return gettextCatalog.getString("Spell Power increased to 25%.<br>Hit Chance increased to 25%."); break;
                                case 4: return gettextCatalog.getString("Physical Resistance increased to 25%.<br>Health Regeneration increased to 25%."); break;
                                case 5: return gettextCatalog.getString("Magical Resistance increased to 25%.<br>Mana Regeneration increased to 25%."); break;
                            }

                        };
                        break;

                    case "Heaven Can Wait":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Heaven Can Wait")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Immune to all damage and control.");
                        };
                        break;

                    //HERETIC

                    case "Fear Of The Dark":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Fear Of The Dark")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Every turn deals {{one}} magical damage.",{
                                    one: (40+this.variant*60).toFixed(0)
                                });
                        };
                        break;

                    case "Creeping Death":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Creeping Death")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString(
                                "Every turn deals {{one}} magical damage.",{
                                    one: (30*this.variant*this.stacks).toFixed(0)
                                });
                        };
                        break;

                    case "Spreading The Disease":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Spreading The Disease")
                        };
                        effects[i].desc = function() {
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
                        };
                        break;

                    case "Children Of The Damned":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Children Of The Damned")
                        };
                        effects[i].desc = function() {
                            switch(this.variant){
                                case 1: return gettextCatalog.getString("Attack Power decreased to 25%.<br>Block Chance decreased to 25%."); break;
                                case 2: return gettextCatalog.getString("Critical Chance decreased to 25%.<br>Dodge Chance decreased to 25%."); break;
                                case 3: return gettextCatalog.getString("Spell Power decreased to 25%.<br>Hit Chance decreased to 25%."); break;
                                case 4: return gettextCatalog.getString("Physical Resistance decreased to 25%.<br>Health Regeneration decreased to 25%."); break;
                                case 5: return gettextCatalog.getString("Magical Resistance decreased to 25%.<br>Mana Regeneration decreased to 25%."); break;
                            }

                        };
                        break;

                    case "Locked And Loaded":
                        effects[i].localName = function () {
                            return gettextCatalog.getString("Locked And Loaded")
                        };
                        effects[i].desc = function() {
                            return gettextCatalog.getString("Buffs and debuffs of this character can't be dispelled or stolen.");
                        };
                        break;
                }
            }

            return effects;
        }
    }
});
})(angular.module("fotm"));