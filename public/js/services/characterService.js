//Сервис для создания персонажа
angular.module('fotm').register.service('characterService', ["gettextCatalog", "randomService", function(gettextCatalog, randomService) {
    var genderParams = {
        male: {str:5, dxt:0, int:5},
        female: {str:0, dxt:5, int:5}
    };
    var raceParams = {
        nephilim:  {str:15,dxt:10,int:25},
        human:    {str:10,dxt:25,int:15},
        cambion:  {str:25,dxt:10,int:15}
    };
    var roleParams = {
        sentinel:       {str:160,dxt:60,int:80},
        slayer:         {str:170,dxt:90,int:40},
        redeemer:       {str:60,dxt:170,int:70},
        ripper:         {str:100,dxt:160,int:40},
        prophet:        {str:60,dxt:70,int:170},
        malefic:        {str:70,dxt:70,int:160},
        cleric:         {str:120,dxt:80,int:100},
        heretic:        {str:100,dxt:100,int:100}
    };
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
    var roleCosts = {
        sentinel:       {red: 3, green: 0, blue: 3},
        slayer:         {red: 4, green: 2, blue: 0},
        redeemer:       {red: 0, green: 3, blue: 3},
        ripper:         {red: 2, green: 4, blue: 0},
        prophet:        {red: 0, green: 2, blue: 4},
        malefic:        {red: 2, green: 0, blue: 4},
        cleric:         {red: 2, green: 1, blue: 3},
        heretic:        {red: 1, green: 2, blue: 3},
        random:         {red: 1, green: 1, blue: 1}
    };
    var roleEquip = {
        sentinel:
        {
            head: {
                name: function(){return "Plate Helmet"},
                slot: function(){return "head"},
                image: function(){return "url(./images/icons/inventory/black-knight-helm.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Breastplate"},
                slot: function(){return "chest"},
                image: function(){return"url(./images/icons/inventory/breastplate.svg)"},
                basicPhysRes: function(){return 0.015},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            hands: {
                name: function(){return "Plate gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(./images/icons/inventory/forearm.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Plate greaves"},
                slot: function(){return "legs"},
                image: function(){return "url(./images/icons/inventory/trousers.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Plate sabatons"},
                slot: function(){return "boots"},
                image: function(){return"url(./images/icons/inventory/boots.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            mainHandWeapon: {
                name: function(){return "Seraph Spear"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return"url(./images/icons/inventory/spear-feather.svg)"},
                minDamage: function(){return 240},
                maxDamage: function(){return 400},
                basicMagicRes: function(){return 0.015},
                basicMaxHealth: function(){return 500},
                range: function(){return 2},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            offHandWeapon: {
                name: function(){return "Sentinel Shield"},
                slot: function(){return "offHandWeapon"},
                image: function(){return "url(./images/icons/inventory/templar-shield.svg)"},
                basicPhysRes: function(){return 0.015},
                basicBlockChance: function(){return 0.025},
                minDamage: function(){return 0},
                maxDamage: function(){return 0},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "blue"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(./images/icons/inventory/gem-pendant.svg)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            }
        },
        slayer:
        {
            head: {
                name: function(){return "Plate Helmet"},
                slot: function(){return "head"},
                image: function(){return "url(./images/icons/inventory/brutal-helm.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            chest: {
                name: function(){return "Breastplate"},
                slot: function(){return "chest"},
                image: function(){return "url(./images/icons/inventory/lamellar.svg)"},
                basicPhysRes: function(){return 0.015},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            hands: {
                name: function(){return "Plate gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(./images/icons/inventory/forearm.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Plate greaves"},
                slot: function(){return "legs"},
                image: function(){return "url(./images/icons/inventory/trousers.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Plate sabatons"},
                slot: function(){return "boots"},
                image: function(){return "url(./images/icons/inventory/boots.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            mainHandWeapon: {
                name: function(){return "Abaddon Blade"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(./images/icons/inventory/relic-blade.svg)"},
                minDamage: function(){return 666},
                maxDamage: function(){return 900},
                basicAttackPower: function(){return 0.1},
                basicCritChance: function(){return 0.0125},
                basicPhysRes: function(){return 0.015},
                basicHealthReg: function(){return 0.002},
                range: function(){return 1},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            offHandWeapon: {
                name: function(){return "Void"},
                slot: function(){return "offHandWeapon"}
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(./images/icons/inventory/gem-pendant.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            }
        },
        redeemer:
        {
            head: {
                name: function(){return "Leather hood"},
                slot: function(){return "head"},
                image: function(){return "url(./images/icons/inventory/hood.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Leather vest"},
                slot: function(){return "chest"},
                image: function(){return "url(./images/icons/inventory/leather-vest.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.01125},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            hands: {
                name: function(){return "Leather gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(./images/icons/inventory/forearm.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Leather pants"},
                slot: function(){return "legs"},
                image: function(){return "url(./images/icons/inventory/trousers.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Leather boots"},
                slot: function(){return "boots"},
                image: function(){return "url(./images/icons/inventory/boots.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            mainHandWeapon: {
                name: function(){return "Best Faith Gun"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(./images/icons/inventory/laser-blast.svg)"},
                minDamage: function(){return 450},
                maxDamage: function(){return 700},
                basicHitChance: function(){return 0.05},
                basicMaxEnergy: function(){return 50},
                basicDodgeChance: function(){return 0.045},
                basicSpellPower: function(){return 0.05},
                range: function(){return 3},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            offHandWeapon: {
                name: function(){return "Void"},
                slot: function(){return "offHandWeapon"}
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(./images/icons/inventory/gem-pendant.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            }
        },
        ripper:
        {
            head: {
                name: function(){return "Leather hood"},
                slot: function(){return "head"},
                image: function(){return "url(./images/icons/inventory/hood.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Leather cloak"},
                slot: function(){return "chest"},
                image: function(){return "url(./images/icons/inventory/cloak-dagger.svg)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.01125},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            hands: {
                name: function(){return "Leather gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(./images/icons/inventory/forearm.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Leather pants"},
                slot: function(){return "legs"},
                image: function(){return "url(./images/icons/inventory/trousers.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            boots: {
                name: function(){return "Leather boots"},
                slot: function(){return "boots"},
                image: function(){return "url(./images/icons/inventory/boots.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            mainHandWeapon: {
                name: function(){return "Tormentor Dagger"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(./images/icons/inventory/curvy-knife.svg)"},
                minDamage: function(){return 210},
                maxDamage: function(){return 350},
                basicHitChance: function(){return 0.025},
                basicCritChance: function(){return 0.025},
                range: function(){return 1},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "red"}]
            },
            offHandWeapon: {
                name: function(){return "Slaughter Dagger"},
                slot: function(){return "offHandWeapon"},
                image: function(){return "url(./images/icons/inventory/sacrificial-dagger.svg)"},
                minDamage: function(){return 210},
                maxDamage: function(){return 350},
                basicAttackPower: function(){return 0.05},
                basicLuck: function(){return 0.0125},
                range: function(){return 1},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(./images/icons/inventory/gem-pendant.svg)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            }
        },
        prophet:
        {
            head: {
                name: function(){return "Cloth Hat"},
                slot: function(){return "head"},
                image: function(){return "url(./images/icons/inventory/pointy-hat.svg)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Cloth robe"},
                slot: function(){return "chest"},
                image: function(){return "url(./images/icons/inventory/robe.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.015},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            hands: {
                name: function(){return "Cloth gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(./images/icons/inventory/forearm.svg)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Cloth pants"},
                slot: function(){return "legs"},
                image: function(){return "url(./images/icons/inventory/trousers.svg)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Cloth boots"},
                slot: function(){return "boots"},
                image: function(){return "url(./images/icons/inventory/boots.svg)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            mainHandWeapon: {
                name: function(){return "Clairvoyant Wand"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(./images/icons/inventory/lunar-wand.svg)"},
                minDamage: function(){return 360},
                maxDamage: function(){return 600},
                basicSpellPower: function(){return 0.05},
                basicHitChance: function(){return 0.025},
                range: function(){return 3},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            offHandWeapon: {
                name: function(){return "Book Of Souls"},
                slot: function(){return "offHandWeapon"},
                image: function(){return "url(./images/icons/inventory/bookmarklet.svg)"},
                minDamage: function(){return 0},
                maxDamage: function(){return 0},
                basicMagicRes: function(){return 0.015},
                basicManaReg: function(){return 0.005},
                sockets: [{gem: "Void", type: "blue"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(./images/icons/inventory/gem-pendant.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            }
        },
        malefic:
        {
            head: {
                name: function(){return "Cloth mask"},
                slot: function(){return "head"},
                image: function(){return "url(./images/icons/inventory/imp-laugh.svg)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Cloth robe"},
                slot: function(){return "chest"},
                image: function(){return "url(./images/icons/inventory/robe.svg)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.015},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            hands: {
                name: function(){return "Cloth gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(./images/icons/inventory/forearm.svg)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Cloth pants"},
                slot: function(){return "legs"},
                image: function(){return "url(./images/icons/inventory/trousers.svg)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Cloth boots"},
                slot: function(){return "boots"},
                image: function(){return "url(./images/icons/inventory/boots.svg)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            mainHandWeapon: {
                name: function(){return "Zaqqum Branch"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(./images/icons/inventory/wizard-staff.svg)"},
                minDamage: function(){return 510},
                maxDamage: function(){return 850},
                basicSpellPower: function(){return 0.1},
                basicCritChance: function(){return 0.0125},
                basicMaxMana: function(){return 400},
                basicInitiative: function(){return 17},
                range: function(){return 1},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            offHandWeapon: {
                name: function(){return "Void"},
                slot: function(){return "offHandWeapon"}
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(./images/icons/inventory/gem-pendant.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            }
        },
        cleric:
        {
            head: {
                name: function(){return "Cleric crown"},
                slot: function(){return "head"},
                image: function(){return "url(./images/icons/inventory/pope-crown.svg)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Mail plastron"},
                slot: function(){return "chest"},
                image: function(){return "url(./images/icons/inventory/plastron.svg)"},
                basicPhysRes: function(){return 0.01125},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            hands: {
                name: function(){return "Mail gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(./images/icons/inventory/forearm.svg)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Mail pants"},
                slot: function(){return "legs"},
                image: function(){return "url(./images/icons/inventory/trousers.svg)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Mail boots"},
                slot: function(){return "boots"},
                image: function(){return "url(./images/icons/inventory/boots.svg)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            mainHandWeapon: {
                name: function(){return "Malleus Maleficarum"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(./images/icons/inventory/claw-hammer.svg)"},
                minDamage: function(){return 300},
                maxDamage: function(){return 500},
                basicAttackPower: function(){return 0.075},
                basicLuck: function(){return 0.0125},
                range: function(){return 1},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            offHandWeapon: {
                name: function(){return "Salvation Crucifix"},
                slot: function(){return "offHandWeapon"},
                image: function(){return "url(./images/icons/inventory/crucifix.svg)"},
                minDamage: function(){return 0},
                maxDamage: function(){return 0},
                basicSpellPower: function(){return 0.075},
                basicManaReg: function(){return 0.0025},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(./images/icons/inventory/gem-pendant.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            }
        },
        heretic:
        {
            head: {
                name: function(){return "Heretic crown"},
                slot: function(){return "head"},
                image: function(){return "url(./images/icons/inventory/crowned-skull.svg)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Rib armor"},
                slot: function(){return "chest"},
                image: function(){return "url(./images/icons/inventory/ribcage.svg)"},
                basicPhysRes: function(){return 0.01125},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            hands: {
                name: function(){return "Mail gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(./images/icons/inventory/forearm.svg)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Mail pants"},
                slot: function(){return "legs"},
                image: function(){return "url(./images/icons/inventory/trousers.svg)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            boots: {
                name: function(){return "Mail boots"},
                slot: function(){return "boots"},
                image: function(){return "url(./images/icons/inventory/boots.svg)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            mainHandWeapon: {
                name: function(){return "Incubus Dagger"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(./images/icons/inventory/bone-knife.svg)"},
                minDamage: function(){return 240},
                maxDamage: function(){return 400},
                basicSpellPower: function(){return 0.075},
                basicMaxMana: function(){return 400},
                range: function(){return 1},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            offHandWeapon: {
                name: function(){return "Succubus Shield"},
                slot: function(){return "offHandWeapon"},
                image: function(){return "url(./images/icons/inventory/magic-shield.svg)"},
                basicMaxEnergy: function(){return 50},
                basicBlockChance: function(){return 0.01875},
                minDamage: function(){return 0},
                maxDamage: function(){return 0},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(./images/icons/inventory/ring.svg)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(./images/icons/inventory/gem-pendant.svg)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            }
        }
    };

    //Доступные способности для каждой роли
    var roleAvailableAbilities = {
        sentinel:   [
            'Strong Arm Of The Law',
            'Defender Of The Faith',
            'Disarm',
            'Walk Away',
            'Sanctuary',
            'The Punishment Due',
            'Come And Get It',
            'New Faith'
        ],
        slayer:     [
            'Die By The Sword',
            'Reign In Blood',
            'Grinder',
            'Follow The Tears',
            'Made In Hell',
            'Spill The Blood',
            'Dyers Eve',
            'I Dont Wanna Stop'
            ],
        redeemer:   [
            'Shot Down In Flames',
            'Electric Eye',
            'Lights In The Sky',
            'Thunderstruck',
            'You Aint No Angel',
            'State Of Grace',
            'My Last Words',
            'Come Cover Me'
        ],
        ripper:     [
            'Inject The Venom',
            'Invisible',
            'Jawbreaker',
            'Hog Tied',
            'Running Free',
            'Fast As The Shark',
            'Prowler',
            'Fade To Black'
        ],
        prophet:    [
            'Stargazer',
            'Speed Of Light',
            'Never A Word',
            'Prophecy',
            'Lets Me Take It',
            'Brain Damage',
            'Infinite Dreams',
            'Caught Somewhere In Time'
        ],
        malefic:    [
            'Family Tree',
            'Fireball',
            'Burning Ambition',
            'Thank God For The Bomb',
            'Powerslave',
            'Cauterization',
            'Down In Flames',
            'Fight Fire With Fire'
        ],
        cleric:     [
            'Hammer Of The Gods',
            'Mercyful Fate',
            'Holy Smoke',
            'Laying On Hands',
            'Cleanse The Soul',
            'Hallowed Be Thy Name',
            'Hit The Lights',
            'Heaven Can Wait'
        ],
        heretic:    [
            'Bloodsucker',
            'Fear Of The Dark',
            'Creeping Death',
            'Spreading The Disease',
            'Purgatory',
            'Children Of The Damned',
            'Locked And Loaded',
            'A Touch Of Evil'
        ]
    };

    //Функция набирает из имеющихся способностей дополнительные, которые доступны расе
    var raceAvailableAbilities = function (role, race){
        var totalAbilities = [];
        var abilities = {
            sentinel: [
                'Defender Of The Faith',
                'Disarm',
                'Sanctuary',
                'New Faith'
            ],
            slayer: [
                'Made In Hell',
                'Spill The Blood',
                'Dyers Eve',
                'I Dont Wanna Stop'
            ],
            redeemer: [
                'Lights In The Sky',
                'Thunderstruck',
                'Come Cover Me',
                'You Aint No Angel'
            ],
            ripper: [
                'Invisible',
                'Jawbreaker',
                'Running Free',
                'Fast As The Shark'
            ],
            prophet: [
                'Never A Word',
                'Lets Me Take It',
                'Speed Of Light',
                'Infinite Dreams'
            ],
            malefic: [
                'Burning Ambition',
                'Powerslave',
                'Cauterization',
                'Down In Flames'
            ],
            cleric: [
                'Mercyful Fate',
                'Holy Smoke',
                'Cleanse The Soul',
                'Hallowed Be Thy Name'
            ],
            heretic: [
                'Creeping Death',
                'Purgatory',
                'Children Of The Damned',
                'Locked And Loaded'
            ]
        };
        switch(race){
            case 'nephilim' :
                switch(role) {
                    case 'sentinel' : totalAbilities=abilities['redeemer'].concat(abilities['prophet'],abilities['cleric']); break;
                    case 'redeemer' : totalAbilities=abilities['sentinel'].concat(abilities['prophet'],abilities['cleric']); break;
                    case 'prophet' : totalAbilities=abilities['sentinel'].concat(abilities['redeemer'],abilities['cleric']); break;
                    case 'cleric' : totalAbilities=abilities['sentinel'].concat(abilities['redeemer'],abilities['prophet']); break;
                } break;
            case 'human' :
                switch(role) {
                    case 'sentinel' : totalAbilities=abilities['slayer'].concat(abilities['redeemer'],abilities['ripper'],abilities['prophet'],abilities['malefic'],abilities['cleric'],abilities['heretic']); break;
                    case 'slayer' : totalAbilities=abilities['sentinel'].concat(abilities['redeemer'],abilities['ripper'],abilities['prophet'],abilities['malefic'],abilities['cleric'],abilities['heretic']); break;
                    case 'redeemer' : totalAbilities=abilities['sentinel'].concat(abilities['slayer'],abilities['ripper'],abilities['prophet'],abilities['malefic'],abilities['cleric'],abilities['heretic']); break;
                    case 'ripper' : totalAbilities=abilities['sentinel'].concat(abilities['slayer'],abilities['redeemer'],abilities['prophet'],abilities['malefic'],abilities['cleric'],abilities['heretic']); break;
                    case 'prophet' : totalAbilities=abilities['sentinel'].concat(abilities['slayer'],abilities['redeemer'],abilities['ripper'],abilities['malefic'],abilities['cleric'],abilities['heretic']); break;
                    case 'malefic' : totalAbilities=abilities['sentinel'].concat(abilities['slayer'],abilities['redeemer'],abilities['ripper'],abilities['prophet'],abilities['cleric'],abilities['heretic']); break;
                    case 'cleric' : totalAbilities=abilities['sentinel'].concat(abilities['slayer'],abilities['redeemer'],abilities['ripper'],abilities['prophet'],abilities['malefic'],abilities['heretic']); break;
                    case 'heretic' : totalAbilities=abilities['sentinel'].concat(abilities['slayer'],abilities['redeemer'],abilities['ripper'],abilities['prophet'],abilities['malefic'],abilities['cleric']); break;
                } break;
            case 'cambion' :
                switch(role) {
                    case 'slayer' : totalAbilities=abilities['ripper'].concat(abilities['malefic'],abilities['heretic']); break;
                    case 'ripper' : totalAbilities=abilities['slayer'].concat(abilities['malefic'],abilities['heretic']); break;
                    case 'malefic' : totalAbilities=abilities['slayer'].concat(abilities['ripper'],abilities['heretic']); break;
                    case 'heretic' : totalAbilities=abilities['slayer'].concat(abilities['ripper'],abilities['malefic']); break;
                } break;
        }
        return totalAbilities;
    };

    //Функция выбирает из имеющихся рассовых способностей только 4 случайных
    var getRandomExtraAbilities = function(extraAbilitiesArray){
        var extraAbilitiesIndexes = [];
        var totalArray=[];
        for (var i = 0; i < extraAbilitiesArray.length; i++)
            extraAbilitiesIndexes.push(i);
        var indexesArray = randomService.shuffle(extraAbilitiesIndexes);
        for(i=0;i<4;i++){
            totalArray.push(extraAbilitiesArray[indexesArray[i]]);
        }
        return totalArray;
    };

    var startAbilities = {
        sentinel:   [
            'Strong Arm Of The Law',
            'Defender Of The Faith',
            'Disarm',
            'Walk Away',
            'Sanctuary',
            'The Punishment Due',
            'Come And Get It'
        ],
        slayer:     [
            'Die By The Sword',
            'Reign In Blood',
            'Grinder',
            'Follow The Tears',
            'Made In Hell',
            'Spill The Blood',
            'Dyers Eve'
        ],
        redeemer:   [
            'Shot Down In Flames',
            'Electric Eye',
            'Lights In The Sky',
            'Thunderstruck',
            'You Aint No Angel',
            'State Of Grace',
            'My Last Words'
        ],
        ripper:     [
            'Inject The Venom',
            'Invisible',
            'Jawbreaker',
            'Hog Tied',
            'Running Free',
            'Fast As The Shark',
            'Prowler'
        ],
        prophet:    [
            'Stargazer',
            'Speed Of Light',
            'Never A Word',
            'Prophecy',
            'Lets Me Take It',
            'Brain Damage',
            'Infinite Dreams'
        ],
        malefic:    [
            'Family Tree',
            'Fireball',
            'Burning Ambition',
            'Thank God For The Bomb',
            'Powerslave',
            'Cauterization',
            'Down In Flames'
        ],
        cleric:     [
            'Hammer Of The Gods',
            'Mercyful Fate',
            'Holy Smoke',
            'Laying On Hands',
            'Cleanse The Soul',
            'Hallowed Be Thy Name',
            'Hit The Lights'
        ],
        heretic:    [
            'Bloodsucker',
            'Fear Of The Dark',
            'Creeping Death',
            'Spreading The Disease',
            'Purgatory',
            'Children Of The Damned',
            'Locked And Loaded'
        ]
    };

    return {
        //Получение параметров персонажа при создании
        getStartParams: function (gender,race,role) {
            return {
                strMax: genderParams[gender].str+raceParams[race].str+roleParams[role].str,
                dxtMax: genderParams[gender].dxt+raceParams[race].dxt+roleParams[role].dxt,
                intMax: genderParams[gender].int+raceParams[race].int+roleParams[role].int,
                strProc: 0.4171,
                dxtProc: 0.4171,
                intProc: 0.4171,
                paramPoint: {left: 70, top: 81}
            };
        },
        //Описание расы персонажа
        getRaceinfo: function (race) {
            return raceDescs[race]();
        },
        //Описание роли персонажа
        getRoleinfo: function (role) {
            return roleDescs[role]();
        },
        //Стоимости ролей персонажа
        getRoleCost: function (role) {
            return roleCosts[role];
        },
        //обмундирование
        getEquip: function (role) {
            return roleEquip[role];
        },
        //способности
        getBasicAbilities: function (role, race) {
            var roleAbilities = roleAvailableAbilities[role];
            var raceAbilities = getRandomExtraAbilities(raceAvailableAbilities(role, race));
            return roleAbilities.concat(raceAbilities);
        },
        //стартовые способности
        getStartAbilities: function (role) {
            return startAbilities[role];
        }
    }
}]);