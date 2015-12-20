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
                name: "Plate Helmet",
                slot: "head",
                image: "url(./images/icons/inventory/black-knight-helm.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.001875,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            chest: {
                name: "Breastplate",
                slot: "chest",
                image: "url(./images/icons/inventory/breastplate.svg)",
                basicPhysRes: 0.015,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            hands: {
                name: "Plate gloves",
                slot: "hands",
                image: "url(./images/icons/inventory/forearm.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.001875,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            legs: {
                name: "Plate greaves",
                slot: "legs",
                image: "url(./images/icons/inventory/trousers.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.001875,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            boots: {
                name: "Plate sabatons",
                slot: "boots",
                image: "url(./images/icons/inventory/boots.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.001875,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            mainHandWeapon: {
                name: "Seraph Spear",
                slot: "mainHandWeapon",
                image: "url(./images/icons/inventory/spear-feather.svg)",
                minDamage: 240,
                maxDamage: 400,
                basicMagicRes: 0.015,
                basicMaxHealth: 500,
                range: 2,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            offHandWeapon: {
                name: "Sentinel Shield",
                slot: "offHandWeapon",
                image: "url(./images/icons/inventory/templar-shield.svg)",
                basicPhysRes: 0.015,
                basicBlockChance: 0.025,
                minDamage: 0,
                maxDamage: 0,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            leftRing: {
                name: "Ring",
                slot: "leftRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            rightRing: {
                name: "Ring",
                slot: "rightRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            amulet: {
                name: "Amulet",
                slot: "amulet",
                image: "url(./images/icons/inventory/gem-pendant.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            }
        },
        slayer:
        {
            head: {
                name: "Plate Helmet",
                slot: "head",
                image: "url(./images/icons/inventory/brutal-helm.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.001875,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            chest: {
                name: "Breastplate",
                slot: "chest",
                image: "url(./images/icons/inventory/lamellar.svg)",
                basicPhysRes: 0.015,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            hands: {
                name: "Plate gloves",
                slot: "hands",
                image: "url(./images/icons/inventory/forearm.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.001875,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            legs: {
                name: "Plate greaves",
                slot: "legs",
                image: "url(./images/icons/inventory/trousers.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.001875,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            boots: {
                name: "Plate sabatons",
                slot: "boots",
                image: "url(./images/icons/inventory/boots.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.001875,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            mainHandWeapon: {
                name: "Abaddon Blade",
                slot: "mainHandWeapon",
                image: "url(./images/icons/inventory/relic-blade.svg)",
                minDamage: 666,
                maxDamage: 900,
                basicAttackPower: 0.1,
                basicCritChance: 0.0125,
                basicPhysRes: 0.015,
                basicHealthReg: 0.002,
                range: 1,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"},{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            offHandWeapon: {
                name: "Void",
                slot: "offHandWeapon"
            },
            leftRing: {
                name: "Ring",
                slot: "leftRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            rightRing: {
                name: "Ring",
                slot: "rightRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            amulet: {
                name: "Amulet",
                slot: "amulet",
                image: "url(./images/icons/inventory/gem-pendant.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            }
        },
        redeemer:
        {
            head: {
                name: "Leather hood",
                slot: "head",
                image: "url(./images/icons/inventory/hood.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.005625,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            chest: {
                name: "Leather vest",
                slot: "chest",
                image: "url(./images/icons/inventory/leather-vest.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.01125,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            hands: {
                name: "Leather gloves",
                slot: "hands",
                image: "url(./images/icons/inventory/forearm.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.005625,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            legs: {
                name: "Leather pants",
                slot: "legs",
                image: "url(./images/icons/inventory/trousers.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.005625,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            boots: {
                name: "Leather boots",
                slot: "boots",
                image: "url(./images/icons/inventory/boots.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.005625,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            mainHandWeapon: {
                name: "Best Faith Gun",
                slot: "mainHandWeapon",
                image: "url(./images/icons/inventory/laser-blast.svg)",
                minDamage: 450,
                maxDamage: 700,
                basicHitChance: 0.05,
                basicMaxEnergy: 50,
                basicDodgeChance: 0.045,
                basicSpellPower: 0.05,
                range: 3,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"},{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            offHandWeapon: {
                name: "Void",
                slot: "offHandWeapon"
            },
            leftRing: {
                name: "Ring",
                slot: "leftRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            rightRing: {
                name: "Ring",
                slot: "rightRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            amulet: {
                name: "Amulet",
                slot: "amulet",
                image: "url(./images/icons/inventory/gem-pendant.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            }
        },
        ripper:
        {
            head: {
                name: "Leather hood",
                slot: "head",
                image: "url(./images/icons/inventory/hood.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.005625,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            chest: {
                name: "Leather cloak",
                slot: "chest",
                image: "url(./images/icons/inventory/cloak-dagger.svg)",
                basicPhysRes: 0.0075,
                basicMagicRes: 0.01125,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            hands: {
                name: "Leather gloves",
                slot: "hands",
                image: "url(./images/icons/inventory/forearm.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.005625,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            legs: {
                name: "Leather pants",
                slot: "legs",
                image: "url(./images/icons/inventory/trousers.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.005625,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            boots: {
                name: "Leather boots",
                slot: "boots",
                image: "url(./images/icons/inventory/boots.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.005625,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            mainHandWeapon: {
                name: "Tormentor Dagger",
                slot: "mainHandWeapon",
                image: "url(./images/icons/inventory/curvy-knife.svg)",
                minDamage: 210,
                maxDamage: 350,
                basicHitChance: 0.025,
                basicCritChance: 0.025,
                range: 1,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            offHandWeapon: {
                name: "Slaughter Dagger",
                slot: "offHandWeapon",
                image: "url(./images/icons/inventory/sacrificial-dagger.svg)",
                minDamage: 210,
                maxDamage: 350,
                basicAttackPower: 0.05,
                basicLuck: 0.0125,
                range: 1,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            leftRing: {
                name: "Ring",
                slot: "leftRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            rightRing: {
                name: "Ring",
                slot: "rightRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            amulet: {
                name: "Amulet",
                slot: "amulet",
                image: "url(./images/icons/inventory/gem-pendant.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            }
        },
        prophet:
        {
            head: {
                name: "Cloth Hat",
                slot: "head",
                image: "url(./images/icons/inventory/pointy-hat.svg)",
                basicPhysRes: 0.001875,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            chest: {
                name: "Cloth robe",
                slot: "chest",
                image: "url(./images/icons/inventory/robe.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.015,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            hands: {
                name: "Cloth gloves",
                slot: "hands",
                image: "url(./images/icons/inventory/forearm.svg)",
                basicPhysRes: 0.001875,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            legs: {
                name: "Cloth pants",
                slot: "legs",
                image: "url(./images/icons/inventory/trousers.svg)",
                basicPhysRes: 0.001875,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            boots: {
                name: "Cloth boots",
                slot: "boots",
                image: "url(./images/icons/inventory/boots.svg)",
                basicPhysRes: 0.001875,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            mainHandWeapon: {
                name: "Clairvoyant Wand",
                slot: "mainHandWeapon",
                image: "url(./images/icons/inventory/lunar-wand.svg)",
                minDamage: 360,
                maxDamage: 600,
                basicSpellPower: 0.05,
                basicHitChance: 0.025,
                range: 3,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            offHandWeapon: {
                name: "Book Of Souls",
                slot: "offHandWeapon",
                image: "url(./images/icons/inventory/bookmarklet.svg)",
                minDamage: 0,
                maxDamage: 0,
                basicMagicRes: 0.015,
                basicManaReg: 0.005,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            leftRing: {
                name: "Ring",
                slot: "leftRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            rightRing: {
                name: "Ring",
                slot: "rightRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            amulet: {
                name: "Amulet",
                slot: "amulet",
                image: "url(./images/icons/inventory/gem-pendant.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            }
        },
        malefic:
        {
            head: {
                name: "Cloth mask",
                slot: "head",
                image: "url(./images/icons/inventory/imp-laugh.svg)",
                basicPhysRes: 0.001875,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            chest: {
                name: "Cloth robe",
                slot: "chest",
                image: "url(./images/icons/inventory/robe.svg)",
                basicPhysRes: 0.00375,
                basicMagicRes: 0.015,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            hands: {
                name: "Cloth gloves",
                slot: "hands",
                image: "url(./images/icons/inventory/forearm.svg)",
                basicPhysRes: 0.001875,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            legs: {
                name: "Cloth pants",
                slot: "legs",
                image: "url(./images/icons/inventory/trousers.svg)",
                basicPhysRes: 0.001875,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            boots: {
                name: "Cloth boots",
                slot: "boots",
                image: "url(./images/icons/inventory/boots.svg)",
                basicPhysRes: 0.001875,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            mainHandWeapon: {
                name: "Zaqqum Branch",
                slot: "mainHandWeapon",
                image: "url(./images/icons/inventory/wizard-staff.svg)",
                minDamage: 510,
                maxDamage: 850,
                basicSpellPower: 0.1,
                basicCritChance: 0.0125,
                basicMaxMana: 400,
                basicInitiative: 17,
                range: 1,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"},{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            offHandWeapon: {
                name: "Void",
                slot: "offHandWeapon"
            },
            leftRing: {
                name: "Ring",
                slot: "leftRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            rightRing: {
                name: "Ring",
                slot: "rightRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            amulet: {
                name: "Amulet",
                slot: "amulet",
                image: "url(./images/icons/inventory/gem-pendant.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            }
        },
        cleric:
        {
            head: {
                name: "Cleric crown",
                slot: "head",
                image: "url(./images/icons/inventory/pope-crown.svg)",
                basicPhysRes: 0.005625,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            chest: {
                name: "Mail plastron",
                slot: "chest",
                image: "url(./images/icons/inventory/plastron.svg)",
                basicPhysRes: 0.01125,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            hands: {
                name: "Mail gloves",
                slot: "hands",
                image: "url(./images/icons/inventory/forearm.svg)",
                basicPhysRes: 0.005625,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            legs: {
                name: "Mail pants",
                slot: "legs",
                image: "url(./images/icons/inventory/trousers.svg)",
                basicPhysRes: 0.005625,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            boots: {
                name: "Mail boots",
                slot: "boots",
                image: "url(./images/icons/inventory/boots.svg)",
                basicPhysRes: 0.005625,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            mainHandWeapon: {
                name: "Malleus Maleficarum",
                slot: "mainHandWeapon",
                image: "url(./images/icons/inventory/claw-hammer.svg)",
                minDamage: 300,
                maxDamage: 500,
                basicAttackPower: 0.075,
                basicLuck: 0.0125,
                range: 1,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            offHandWeapon: {
                name: "Salvation Crucifix",
                slot: "offHandWeapon",
                image: "url(./images/icons/inventory/crucifix.svg)",
                minDamage: 0,
                maxDamage: 0,
                basicSpellPower: 0.075,
                basicManaReg: 0.0025,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            leftRing: {
                name: "Ring",
                slot: "leftRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            rightRing: {
                name: "Ring",
                slot: "rightRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            amulet: {
                name: "Amulet",
                slot: "amulet",
                image: "url(./images/icons/inventory/gem-pendant.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            }
        },
        heretic:
        {
            head: {
                name: "Heretic crown",
                slot: "head",
                image: "url(./images/icons/inventory/crowned-skull.svg)",
                basicPhysRes: 0.005625,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            chest: {
                name: "Rib armor",
                slot: "chest",
                image: "url(./images/icons/inventory/ribcage.svg)",
                basicPhysRes: 0.01125,
                basicMagicRes: 0.0075,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            hands: {
                name: "Mail gloves",
                slot: "hands",
                image: "url(./images/icons/inventory/forearm.svg)",
                basicPhysRes: 0.005625,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            legs: {
                name: "Mail pants",
                slot: "legs",
                image: "url(./images/icons/inventory/trousers.svg)",
                basicPhysRes: 0.005625,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            boots: {
                name: "Mail boots",
                slot: "boots",
                image: "url(./images/icons/inventory/boots.svg)",
                basicPhysRes: 0.005625,
                basicMagicRes: 0.00375,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            mainHandWeapon: {
                name: "Incubus Dagger",
                slot: "mainHandWeapon",
                image: "url(./images/icons/inventory/bone-knife.svg)",
                minDamage: 240,
                maxDamage: 400,
                basicSpellPower: 0.075,
                basicMaxMana: 400,
                range: 1,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            offHandWeapon: {
                name: "Succubus Shield",
                slot: "offHandWeapon",
                image: "url(./images/icons/inventory/magic-shield.svg)",
                basicMaxEnergy: 50,
                basicBlockChance: 0.01875,
                minDamage: 0,
                maxDamage: 0,
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            leftRing: {
                name: "Ring",
                slot: "leftRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            rightRing: {
                name: "Ring",
                slot: "rightRing",
                image: "url(./images/icons/inventory/ring.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
            },
            amulet: {
                name: "Amulet",
                slot: "amulet",
                image: "url(./images/icons/inventory/gem-pendant.svg)",
                sockets: [{gem: "Void"},{gem: "Void"},{gem: "Void"}]
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