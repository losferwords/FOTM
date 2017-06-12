//Сервис для создания персонажа
(function (module) {
    module.service('characterService', function(gettextCatalog, randomService) {
    var raceDescs = {
        nephilim:  function() {return gettextCatalog.getString("Nephilims are children of angels and humans. They revere the light and eradicate the evil of this world."+
        "Nephilims get random extra-abilities of Sentinel, Redeemer, Prophet and Cleric.")},
        human:    function() {return gettextCatalog.getString("Humans are free to choose their own path."+
        "They get random extra-abilities of all available roles.")},
        cambion:  function() {return gettextCatalog.getString("Cambions are children of demons and humans. They follow the path of chaos and destruction."+
        "Cambions get random extra-abilities of Slayer, Ripper, Malefic and Heretic.")}
    };
    var roleDescs = {
        sentinel:       function() {return gettextCatalog.getString("Sentinels are pain for all casters on the battlefield. " +
        "They use shields to protect themselves and other party members from damage.")},
        slayer:         function() {return gettextCatalog.getString("Slayers are weapon of Devil itself. " +
        "They destroy enemies in melee combat with huge sword and deals a lot of damage.")},
        redeemer:       function() {return gettextCatalog.getString("Redeemers judge all their enemies from long distance. " +
        "They use their range weapons to control situation on battlefield.")},
        ripper:         function() {return gettextCatalog.getString("Rippers are designed to shred the bodies of their victims when they do not expect it. " +
        "Craziness of rippers make them unpredictable.")},
        prophet:        function() {return gettextCatalog.getString("Prophets know a lot about the future. "+
        "They use this knowledge as a weapon to control the fate of their enemies.")},
        malefic:        function() {return gettextCatalog.getString("Malefics bring down fire and death on the battlefield. "+
        "The forces of hell are helping them to inflict enormous damage on their victims.")},
        cleric:         function() {return gettextCatalog.getString("Clerics are called to bring the light of healing into battlefield. "+
        "Their prayers and blessings protect allies from a terrible fate.")},
        heretic:        function() {return gettextCatalog.getString("Heretics sends diseases and curses on the heads of their enemies. "+
        "Their only faith is to drain all life and energy from enemy.")},
        random:         function() {return gettextCatalog.getString("You will get random role of available for chosen race.")}
    };

    return {
        //Описание расы персонажа
        getRaceinfo: function (race) {
            return raceDescs[race]();
        },
        //Описание роли персонажа
        getRoleinfo: function (role) {
            return roleDescs[role]();
        },
        //Функция возвращает цвет согласно классу
        getRoleColor : function(role) {
            switch (role) {
                case "sentinel" : return '#f7f7f7';
                case "slayer" : return '#ff0906';
                case "redeemer" : return '#0055AF';
                case "ripper" : return '#61dd45';
                case "prophet" : return '#00b3ee';
                case "malefic" : return '#f05800';
                case "cleric" : return '#ffc520';
                case "heretic" : return '#862197';
            }
        },
        //Пересчёт всех характерситик оружия
        getParamTooltip: function(param) {
            var self=this;
            switch(param){
                case 'str': return gettextCatalog.getString(
                    "<p><strong>Strength</strong> increases your Attack Power, Health, Health Regeneration, Physical Resistance and Block Chance.</p>"+
                    "<p><strong>Strength Maximum</strong> is a potential, which your current strength can achieve in character triangle.</p>"+
                    "<p>Maximum: {{one}}</p>"+
                    "<p>Basic: {{two}}</p>"+
                    "<p>From items: {{three}}</p>"+
                    "<p>Percent: {{four}}%</p>"+
                    "<p>Current: {{five}}</p>",
                    {
                        one: Math.floor(self.params.strMax+self.strFromEq),
                        two: Math.floor(self.params.strMax),
                        three: Math.floor(self.strFromEq),
                        four: (self.params.strProc*100).toFixed(2),
                        five: self.str
                    }); break;

                case 'attackPower': return gettextCatalog.getString(
                    "<p><strong>Attack Power</strong> increases your physical damage from weapons and abilities.</p>"+
                    "<p>From strength: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>"+
                    "<p>Damage: {{four}}-{{five}}</p>",
                    {
                        one: (self.attackPowerFromStr*100).toFixed(2),
                        two: (self.attackPowerFromEq*100).toFixed(2),
                        three: (self.attackPower*100).toFixed(2),
                        four: self.minDamage,
                        five: self.maxDamage
                    }); break;

                case 'maxHealth': return gettextCatalog.getString(
                    "<p>Amount of <strong>health</strong> determines how long you can fight. If you lose your health you die.</p>"+
                    "<p>Basic: {{one}}</p>"+
                    "<p>From strength: {{two}}</p>"+
                    "<p>From items: {{three}}</p>"+
                    "<p>Total: {{four}}</p>",
                    {
                        one: self.basicHealth,
                        two: (self.maxHealthFromStr-self.basicHealth),
                        three: self.maxHealthFromEq,
                        four: self.maxHealth
                    }); break;

                case 'healthReg': return gettextCatalog.getString(
                    "<p><strong>Health Regeneration</strong> is a percent from maximum health, which you restore every turn.</p>"+
                    "<p>From strength: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>"+
                    "<p>Every turn you restore {{four}} health</p>"+
                    "<p>Limit: 3%</p>",
                    {
                        one: (self.healthRegFromStr*100).toFixed(2),
                        two: (self.healthRegFromEq*100).toFixed(2),
                        three: (self.healthReg*100).toFixed(2),
                        four: Math.round(self.maxHealth*self.healthReg)
                    }); break;

                case 'physRes': return gettextCatalog.getString(
                    "<p><strong>Physical Resistance</strong> decrease physical damage what you take.</p>"+
                    "<p>From strength: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>"+
                    "<p>Limit: 60%</p>",
                    {
                        one: (self.physResFromStr*100).toFixed(2),
                        two: (self.physResFromEq*100).toFixed(2),
                        three: (self.physRes*100).toFixed(2)
                    }); break;

                case 'blockChance': return gettextCatalog.getString(
                    "<p><strong>Block Chance</strong> is a chance to block some damage.</p>"+
                    "<p>From strength: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>"+
                    "<p>{{four}}% damage will be blocked</p>"+
                    "<p>Limit: 50%</p>",
                    {
                        one: (self.blockChanceFromStr*100).toFixed(2),
                        two: (self.blockChanceFromEq*100).toFixed(2),
                        three: (self.blockChance*100).toFixed(2),
                        four: (self.blockChance*1.5*100).toFixed(2)
                    }); break;

                case 'dxt': return gettextCatalog.getString(
                    "<p><strong>Dexterity</strong> increases your Critical Rating, Energy, Hit Chance, Dodge Chance and Luck.</p>"+
                    "<p><strong>Dexterity Maximum</strong> is a potential, which your current dexterity can achieve in character triangle.</p>"+
                    "<p>Maximum: {{one}}</p>"+
                    "<p>Basic: {{two}}</p>"+
                    "<p>From items: {{three}}</p>"+
                    "<p>Percent: {{four}}%</p>"+
                    "<p>Current: {{five}}</p>",
                    {
                        one: Math.floor(self.params.dxtMax+self.dxtFromEq),
                        two: Math.floor(self.params.dxtMax),
                        three: Math.floor(self.dxtFromEq),
                        four: (self.params.dxtProc*100).toFixed(2),
                        five: self.dxt
                    }); break;

                case 'critChance': return gettextCatalog.getString(
                    "<p><strong>Critical Rating</strong> is a chance to deal more damage with weapon or ability. Besides, it increases your damage when you deal critically hit.</p>"+
                    "<p>From dexterity: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>"+
                    "<p>Critical Damage from weapon: {{four}}-{{five}}</p>"+
                    "<p>Limit: 50%</p>",
                    {
                        one: (self.critChanceFromDxt*100).toFixed(2),
                        two: (self.critChanceFromEq*100).toFixed(2),
                        three: (self.critChance*100).toFixed(2),
                        four: Math.round(self.minDamage*(1.5+self.critChance)),
                        five: Math.round(self.maxDamage*(1.5+self.critChance))
                    }); break;

                case 'maxEnergy': return gettextCatalog.getString(
                    "<p>Amount of <strong>energy</strong> determines how many actions you can do in this turn. Energy needs to move and use abilities.</p>"+
                    "<p>Basic: {{one}}</p>"+
                    "<p>From dexterity: {{two}}</p>"+
                    "<p>From items: {{three}}</p>"+
                    "<p>Total: {{four}}</p>",
                    {
                        one: self.basicEnergy,
                        two: (self.maxEnergyFromDxt-self.basicEnergy),
                        three: self.maxEnergyFromEq,
                        four: self.maxEnergy
                    }); break;

                case 'hitChance': return gettextCatalog.getString(
                    "<p><strong>Hit Chance</strong> decreases your chances to miss with your abilities.</p>"+
                    "<p>Basic: {{one}}%</p>"+
                    "<p>From dexterity: {{two}}%</p>"+
                    "<p>From items: {{three}}%</p>"+
                    "<p>Total: {{four}}%</p>"+
                    "<p>Limit: 100%</p>",
                    {
                        one: (self.basicHitChance*100).toFixed(0),
                        two: ((self.hitChanceFromDxt-self.basicHitChance)*100).toFixed(2),
                        three: (self.hitChanceFromEq*100).toFixed(2),
                        four: (self.hitChance*100).toFixed(2)
                    }); break;

                case 'dodgeChance': return gettextCatalog.getString(
                    "<p><strong>Dodge Chance</strong> is a chance to completely avoid enemy attack.</p>"+
                    "<p>From dexterity: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>"+
                    "<p>Limit: 60%</p>",
                    {
                        one: (self.dodgeChanceFromDxt*100).toFixed(2),
                        two: (self.dodgeChanceFromEq*100).toFixed(2),
                        three: (self.dodgeChance*100).toFixed(2)
                    }); break;

                case 'luck': return gettextCatalog.getString(
                    "<p><strong>Luck</strong> is a chance to save your energy when you do some action.</p>"+
                    "<p>From dexterity: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>"+
                    "<p>Limit: 50%</p>",
                    {
                        one: (self.luckFromDxt*100).toFixed(2),
                        two: (self.luckFromEq*100).toFixed(2),
                        three: (self.luck*100).toFixed(2)
                    }); break;

                case 'int': return gettextCatalog.getString(
                    "<p><strong>Intellect</strong> increases your Spell Power, Mana, Mana Regeneration, Magic Resistance and Initiative.</p>"+
                    "<p><strong>Intellect Maximum</strong> is a potential, which your current intellect can achieve in character triangle.</p>"+
                    "<p>Maximum: {{one}}</p>"+
                    "<p>Basic: {{two}}</p>"+
                    "<p>From items: {{three}}</p>"+
                    "<p>Percent: {{four}}%</p>"+
                    "<p>Current: {{five}}</p>",
                    {
                        one: Math.floor(self.params.intMax+self.intFromEq),
                        two: Math.floor(self.params.intMax),
                        three: Math.floor(self.intFromEq),
                        four: (self.params.intProc*100).toFixed(2),
                        five: self.int
                    }); break;

                case 'spellPower': return gettextCatalog.getString(
                    "<p><strong>Spell Power</strong> increases your magical damage from abilities.</p>"+
                    "<p>From intellect: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>",
                    {
                        one: (self.spellPowerFromInt*100).toFixed(2),
                        two: (self.spellPowerFromEq*100).toFixed(2),
                        three: (self.spellPower*100).toFixed(2)
                    }); break;

                case 'maxMana': return gettextCatalog.getString(
                    "<p><strong>Mana</strong> is a resource, what needs to use your abilities.</p>"+
                    "<p>Basic: {{one}}</p>"+
                    "<p>From intellect: {{two}}</p>"+
                    "<p>From items: {{three}}</p>"+
                    "<p>Total: {{four}}</p>",
                    {
                        one: self.basicMana,
                        two: (self.maxManaFromInt-self.basicMana),
                        three: self.maxManaFromEq,
                        four: self.maxMana
                    }); break;

                case 'manaReg': return gettextCatalog.getString(
                    "<p><strong>Mana Regeneration</strong> is a percent from maximum mana, which you restore every turn.</p>"+
                    "<p>From intellect: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>"+
                    "<p>Every turn you restore {{four}} mana</p>"+
                    "<p>Limit: 4%</p>",
                    {
                        one: (self.manaRegFromInt*100).toFixed(2),
                        two: (self.manaRegFromEq*100).toFixed(2),
                        three: (self.manaReg*100).toFixed(2),
                        four: Math.round(self.maxMana*self.manaReg)
                    }); break;

                case 'magicRes': return gettextCatalog.getString(
                    "<p><strong>Magical Resistance</strong> decreases magical damage what you take.</p>"+
                    "<p>From intellect: {{one}}%</p>"+
                    "<p>From items: {{two}}%</p>"+
                    "<p>Total: {{three}}%</p>"+
                    "<p>Limit: 60%</p>",
                    {
                        one: (self.magicResFromInt*100).toFixed(2),
                        two: (self.magicResFromEq*100).toFixed(2),
                        three: (self.magicRes*100).toFixed(2)
                    }); break;

                case 'initiative': return gettextCatalog.getString(
                    "<p><strong>Initiative</strong> determines this character position in turns queue. Besides, it give you a chance to drop cooldown of any ability when turn starts.</p>"+
                    "<p>From intellect: {{one}}</p>"+
                    "<p>From items: {{two}}</p>"+
                    "<p>Total: {{three}}</p>"+
                    "<p>Drop cooldown chance: {{four}}%</p>",
                    {
                        one: self.initiativeFromInt,
                        two: self.initiativeFromEq,
                        three: self.initiative,
                        four: (self.initiative*0.01).toFixed(2)
                    }); break;
            }
    }

    }
});
})(angular.module("fotm"));