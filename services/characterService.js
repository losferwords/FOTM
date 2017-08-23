var AbilityFactory = require('services/abilityFactory');
var randomService = require('services/randomService');
var Chance = require('chance');
var chance = new Chance();

//������ ��� �������� ���������
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
var roleEquip = function(role){
    switch(role){
        case "sentinel": return {
            head: {
                name: function(){return "Plate Helmet"},
                slot: function(){return "head"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--black-knight-helm)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Breastplate"},
                slot: function(){return "chest"},
                image: function(){return"url(../images/assets/svg/view/sprites.svg#inventory--breastplate)"},
                basicPhysRes: function(){return 0.015},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            hands: {
                name: function(){return "Plate gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--forearm)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Plate greaves"},
                slot: function(){return "legs"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--trousers)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Plate sabatons"},
                slot: function(){return "boots"},
                image: function(){return"url(../images/assets/svg/view/sprites.svg#inventory--boots)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            mainHandWeapon: {
                name: function(){return "Seraph Spear"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return"url(../images/assets/svg/view/sprites.svg#inventory--spear-feather)"},
                minDamage: function(){return 440},
                maxDamage: function(){return 600},
                basicMagicRes: function(){return 0.015},
                basicMaxHealth: function(){return 500},
                range: function(){return 2},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            offHandWeapon: {
                name: function(){return "Sentinel Shield"},
                slot: function(){return "offHandWeapon"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--templar-shield)"},
                basicPhysRes: function(){return 0.015},
                basicBlockChance: function(){return 0.025},
                minDamage: function(){return 0},
                maxDamage: function(){return 0},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "blue"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--gem-pendant)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            }
        };
        case "slayer": return {
            head: {
                name: function(){return "Plate Helmet"},
                slot: function(){return "head"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--brutal-helm)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            chest: {
                name: function(){return "Breastplate"},
                slot: function(){return "chest"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--lamellar)"},
                basicPhysRes: function(){return 0.015},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            hands: {
                name: function(){return "Plate gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--forearm)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Plate greaves"},
                slot: function(){return "legs"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--trousers)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Plate sabatons"},
                slot: function(){return "boots"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--boots)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.001875},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            mainHandWeapon: {
                name: function(){return "Abaddon Blade"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--relic-blade)"},
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
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--gem-pendant)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            }
        };
        case "redeemer": return {
            head: {
                name: function(){return "Leather hood"},
                slot: function(){return "head"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--hood)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Leather vest"},
                slot: function(){return "chest"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--leather-vest)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.01125},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            hands: {
                name: function(){return "Leather gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--forearm)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Leather pants"},
                slot: function(){return "legs"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--trousers)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Leather boots"},
                slot: function(){return "boots"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--boots)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            mainHandWeapon: {
                name: function(){return "Best Faith Gun"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--laser-blast)"},
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
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--gem-pendant)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            }
        };
        case "ripper": return {
            head: {
                name: function(){return "Leather hood"},
                slot: function(){return "head"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--hood)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Leather cloak"},
                slot: function(){return "chest"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--cloak-dagger)"},
                basicPhysRes: function(){return 0.0075},
                basicMagicRes: function(){return 0.01125},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            hands: {
                name: function(){return "Leather gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--forearm)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Leather pants"},
                slot: function(){return "legs"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--trousers)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "green"}]
            },
            boots: {
                name: function(){return "Leather boots"},
                slot: function(){return "boots"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--boots)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.005625},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            mainHandWeapon: {
                name: function(){return "Tormentor Dagger"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--curvy-knife)"},
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
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--sacrificial-dagger)"},
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
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--gem-pendant)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            }
        };
        case "prophet": return {
            head: {
                name: function(){return "Cloth Hat"},
                slot: function(){return "head"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--pointy-hat)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Cloth robe"},
                slot: function(){return "chest"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--robe)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.015},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            hands: {
                name: function(){return "Cloth gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--forearm)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Cloth pants"},
                slot: function(){return "legs"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--trousers)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Cloth boots"},
                slot: function(){return "boots"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--boots)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            mainHandWeapon: {
                name: function(){return "Clairvoyant Wand"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--lunar-wand)"},
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
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--bookmarklet)"},
                minDamage: function(){return 0},
                maxDamage: function(){return 0},
                basicMagicRes: function(){return 0.015},
                basicManaReg: function(){return 0.005},
                sockets: [{gem: "Void", type: "blue"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--gem-pendant)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            }
        };
        case "malefic": return {
            head: {
                name: function(){return "Cloth mask"},
                slot: function(){return "head"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--imp-laugh)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Cloth robe"},
                slot: function(){return "chest"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--robe)"},
                basicPhysRes: function(){return 0.00375},
                basicMagicRes: function(){return 0.015},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            hands: {
                name: function(){return "Cloth gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--forearm)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Cloth pants"},
                slot: function(){return "legs"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--trousers)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Cloth boots"},
                slot: function(){return "boots"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--boots)"},
                basicPhysRes: function(){return 0.001875},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            mainHandWeapon: {
                name: function(){return "Zaqqum Branch"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--wizard-staff)"},
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
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--gem-pendant)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            }
        };
        case "cleric": return {
            head: {
                name: function(){return "Cleric crown"},
                slot: function(){return "head"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--pope-crown)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Mail plastron"},
                slot: function(){return "chest"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--plastron)"},
                basicPhysRes: function(){return 0.01125},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            hands: {
                name: function(){return "Mail gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--forearm)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Mail pants"},
                slot: function(){return "legs"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--trousers)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            boots: {
                name: function(){return "Mail boots"},
                slot: function(){return "boots"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--boots)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            mainHandWeapon: {
                name: function(){return "Malleus Maleficarum"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--claw-hammer)"},
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
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--crucifix)"},
                minDamage: function(){return 0},
                maxDamage: function(){return 0},
                basicSpellPower: function(){return 0.075},
                basicManaReg: function(){return 0.0025},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--gem-pendant)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            }
        };
        case "heretic": return {
            head: {
                name: function(){return "Heretic crown"},
                slot: function(){return "head"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--crowned-skull)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            chest: {
                name: function(){return "Rib armor"},
                slot: function(){return "chest"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ribcage)"},
                basicPhysRes: function(){return 0.01125},
                basicMagicRes: function(){return 0.0075},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            hands: {
                name: function(){return "Mail gloves"},
                slot: function(){return "hands"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--forearm)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            },
            legs: {
                name: function(){return "Mail pants"},
                slot: function(){return "legs"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--trousers)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            boots: {
                name: function(){return "Mail boots"},
                slot: function(){return "boots"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--boots)"},
                basicPhysRes: function(){return 0.005625},
                basicMagicRes: function(){return 0.00375},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            mainHandWeapon: {
                name: function(){return "Incubus Dagger"},
                slot: function(){return "mainHandWeapon"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--bone-knife)"},
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
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--magic-shield)"},
                basicMaxEnergy: function(){return 50},
                basicBlockChance: function(){return 0.01875},
                minDamage: function(){return 0},
                maxDamage: function(){return 0},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "red"},{gem: "Void", type: "blue"}]
            },
            leftRing: {
                name: function(){return "Ring"},
                slot: function(){return "leftRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "green"}]
            },
            rightRing: {
                name: function(){return "Ring"},
                slot: function(){return "rightRing"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--ring)"},
                sockets: [{gem: "Void", type: "red"},{gem: "Void", type: "green"},{gem: "Void", type: "blue"}]
            },
            amulet: {
                name: function(){return "Amulet"},
                slot: function(){return "amulet"},
                image: function(){return "url(../images/assets/svg/view/sprites.svg#inventory--gem-pendant)"},
                sockets: [{gem: "Void", type: "green"},{gem: "Void", type: "blue"},{gem: "Void", type: "blue"}]
            }
        }
    }
};

//��������� ����������� ��� ������ ����
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

//������� �������� �� ��������� ������������ ��������������, ������� �������� ����
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

//������� �������� �� ��������� �������� ������������ ������ 4 ���������
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

module.exports = {
    //��������� ���������� ��������� ��� ��������
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
    //��������� ����� ���������
    getRoleCost: function (role) {
        return roleCosts[role];
    },
    //��������������
    getEquip: function (role) {
        return roleEquip(role);
    },
    //�����������
    getBasicAbilities: function (role, race) {
        var roleAbilities = roleAvailableAbilities[role];
        var raceAbilities = getRandomExtraAbilities(raceAvailableAbilities(role, race));
        return roleAbilities.concat(raceAbilities);
    },
    getRoleAbilities: function (role) {
        return roleAvailableAbilities[role];
    },
    //randomize positions of basic abilities
    getStartAbilities: function (basicAbilities) {
        return randomService.shuffle(basicAbilities).splice(0,7);
    },
    //get ability state for client
    abilityForClient: function (ability) {
        var clientAbility = {};
        for(var key in ability){
            if(typeof ability[key] == 'function' && key !== 'cast' && key !== 'castSimulation' && key !== 'usageLogic'){
                clientAbility[key] = ability[key]();
            }
            if(typeof ability[key] != 'function') {
                clientAbility[key] = ability[key];
            }
        }
        return clientAbility;
    },
    //get effect state for client
    effectForClient: function (effect) {
        var clientEffect = {};
        for(var key in effect){
            if(typeof effect[key] == 'function' && key !== 'apply' && key !== 'score'){
                clientEffect[key] = effect[key]();
            }
            if(typeof effect[key] != 'function') {
                clientEffect[key] = effect[key];
            }
        }
        return clientEffect;
    },
    generateRandomRole: function(race) {
        var role;
        if(race=="human"){
            switch (randomService.randomInt(0,7)) {
                case 0: role="sentinel"; break;
                case 1: role="slayer"; break;
                case 2: role="redeemer"; break;
                case 3: role="ripper"; break;
                case 4: role="prophet"; break;
                case 5: role="malefic"; break;
                case 6: role="cleric"; break;
                case 7: role="heretic"; break;
            }
        }
        else if(race=="nephilim"){
            switch (randomService.randomInt(0,3)) {
                case 0: role="sentinel"; break;
                case 1: role="redeemer"; break;
                case 2: role="prophet"; break;
                case 3: role="cleric"; break;
            }
        }
        else {
            switch (randomService.randomInt(0,3)) {
                case 0: role="slayer"; break;
                case 1: role="ripper"; break;
                case 2: role="malefic"; break;
                case 3: role="heretic"; break;
            }
        }
        return role;
    },
    //��������� ���������� ����
    generateRandomGender: function() {
        var gender;
        switch (randomService.randomInt(0,1)) {
            case 0: gender="male"; break;
            case 1: gender="female"; break;
        }
        return gender;
    },
    //��������� ��������� ����
    generateRandomRace: function() {
        var race;
        switch (randomService.randomInt(0,2)) {
            case 0: race="nephilim"; break;
            case 1: race="human"; break;
            case 2: race="cambion"; break;
        }
        return race;
    },
    //��������� ���������� ��������
    getRandomPortrait: function(race, gender) {
        var portraits=[];
        for(var i=1;i<=4;i++){
            portraits.push("./images/assets/img/portraits/"+race+"/"+gender+"/"+race+"_"+gender+"_"+i+".jpg");
        }
        return portraits[randomService.randomInt(0,3)];
    },
    //������������ �������� � ��������� ������������
    generateAbilitiesArrays: function(role, race) {
        var self = this;
        //�������� ������� ����� ��� ������ ����
        var availableAbilitiesArr = self.getBasicAbilities(role, race);
        var abilitiesArr = self.getStartAbilities(availableAbilitiesArr.slice());

        var abilitiesObjectsArr = [];
        for(var i=0;i<abilitiesArr.length;i++){
            abilitiesObjectsArr.push({name: abilitiesArr[i], variant: randomService.randomInt(1,5)});
        }

        return [abilitiesObjectsArr, availableAbilitiesArr];
    }

};
