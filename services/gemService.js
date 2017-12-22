var randomService = require('services/randomService');
var FlakeId = require('flake-idgen');
var intformat = require('biguint-format');
var flakeIdGen = new FlakeId();

//������ ��� �������� ������
module.exports = {
    //������� ������ ��������� ������
    randomizeGem: function (color) {
        var newGem = {};
        newGem.id = intformat(flakeIdGen.next(), 'dec');
        if(color){
            newGem.color = color;
        }
        else {
            switch(Math.floor(Math.random() * 3)){
                case 0: newGem.color='red';break;
                case 1: newGem.color='green';break;
                case 2: newGem.color='blue';break;
            }
        }

        switch(newGem.color){
            case 'red':
                newGem.image = 'url(../images/assets/svg/view/sprites.svg#inventory--rupee)';
                newGem.bgColor = "#cc0000";
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.str=randomService.randomInt(5, 10);
                        newGem.quality=newGem.str/10;
                        newGem.name="Soul Of Strength";
                        break;
                    case 1:
                        newGem.attackPower=randomService.randomFloat(0.0165, 0.0333, 4);
                        newGem.quality=newGem.attackPower/0.0333;
                        newGem.name="Soul Of Power";
                        break;
                    case 2:
                        newGem.maxHealth=randomService.randomInt(250, 500);
                        newGem.quality=newGem.maxHealth/500;
                        newGem.name="Soul Of Vitality";
                        break;
                    case 3:
                        newGem.healthReg=randomService.randomFloat(0.001, 0.002, 4);
                        newGem.quality=newGem.healthReg/0.002;
                        newGem.name="Soul Of Regeneration";
                        break;
                    case 4:
                        newGem.physRes=randomService.randomFloat(0.0075, 0.015, 4);
                        newGem.quality=newGem.physRes/0.015;
                        newGem.name="Soul Of Stone";
                        break;
                    case 5:
                        newGem.blockChance=randomService.randomFloat(0.00625, 0.0125, 4);
                        newGem.quality=newGem.blockChance/0.0125;
                        newGem.name="Soul Of Wall";
                        break;
                }
                break;
            case 'green':
                newGem.image = 'url(../images/assets/svg/view/sprites.svg#inventory--emerald)';
                newGem.bgColor = "#77b300";
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.dxt=randomService.randomInt(5, 10);
                        newGem.quality=newGem.dxt/10;
                        newGem.name="Soul Of Dexterity";
                        break;
                    case 1:
                        newGem.critChance=randomService.randomFloat(0.004165, 0.00833, 4);
                        newGem.quality=newGem.critChance/0.00833;
                        newGem.name="Soul Of Extremum";
                        break;
                    case 2:
                        newGem.maxEnergy=randomService.randomInt(25, 50);
                        newGem.quality=newGem.maxEnergy/50;
                        newGem.name="Soul Of Energy";
                        break;
                    case 3:
                        newGem.hitChance=randomService.randomFloat(0.00375, 0.0075, 4);
                        newGem.quality=newGem.hitChance/0.0075;
                        newGem.name="Soul Of Accuracy";
                        break;
                    case 4:
                        newGem.dodgeChance=randomService.randomFloat(0.0075, 0.015, 4);
                        newGem.quality=newGem.dodgeChance/0.015;
                        newGem.name="Soul Of Swiftness";
                        break;
                    case 5:
                        newGem.luck=randomService.randomFloat(0.00625, 0.0125, 4);
                        newGem.quality=newGem.luck/0.0125;
                        newGem.name="Soul Of Destiny";
                        break;
                }
                break;
            case 'blue':
                newGem.image = 'url(../images/assets/svg/view/sprites.svg#inventory--saphir)';
                newGem.bgColor = "#2a9fd6";
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.int=randomService.randomInt(5, 10);
                        newGem.quality=newGem.int/10;
                        newGem.name="Soul Of Intellect";
                        break;
                    case 1:
                        newGem.spellPower=randomService.randomFloat(0.025, 0.05, 4);
                        newGem.quality=newGem.spellPower/0.05;
                        newGem.name="Soul Of Magic";
                        break;
                    case 2:
                        newGem.maxMana=randomService.randomInt(200, 400);
                        newGem.quality=newGem.maxMana/400;
                        newGem.name="Soul Of Wisdom";
                        break;
                    case 3:
                        newGem.manaReg=randomService.randomFloat(0.00125, 0.0025, 4);
                        newGem.quality=newGem.manaReg/0.0025;
                        newGem.name="Soul Of Meditation";
                        break;
                    case 4:
                        newGem.magicRes=randomService.randomFloat(0.0075, 0.015, 4);
                        newGem.quality=newGem.magicRes/0.015;
                        newGem.name="Soul Of Will";
                        break;
                    case 5:
                        newGem.initiative=randomService.randomInt(9, 17);
                        newGem.quality=newGem.initiative/17;
                        newGem.name="Soul Of Tactic";
                        break;
                }
                break;
        }

        return newGem;
    },
    //������� ������ ��������� ������� ������
    randomizeTopGem: function(color){
        var newGem = {};
        if(color){
            newGem.color=color;
        }
        else {
            switch(Math.floor(Math.random() * 3)){
                case 0: newGem.color='red';break;
                case 1: newGem.color='green';break;
                case 2: newGem.color='blue';break;
            }
        }

        switch(newGem.color){
            case 'red':
                newGem.image = function(){return 'url(../images/assets/svg/view/sprites.svg#inventory--rupee)'};
                newGem.bgColor=function(){return "#cc0000"};
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.str=10;
                        newGem.quality=newGem.str/10;
                        newGem.name="Soul Of Strength";
                        break;
                    case 1:
                        newGem.attackPower=0.0333;
                        newGem.quality=newGem.attackPower/0.0333;
                        newGem.name="Soul Of Power";
                        break;
                    case 2:
                        newGem.maxHealth=500;
                        newGem.quality=newGem.maxHealth/500;
                        newGem.name="Soul Of Vitality";
                        break;
                    case 3:
                        newGem.healthReg=0.002;
                        newGem.quality=newGem.healthReg/0.002;
                        newGem.name="Soul Of Regeneration";
                        break;
                    case 4:
                        newGem.physRes=0.015;
                        newGem.quality=newGem.physRes/0.015;
                        newGem.name="Soul Of Stone";
                        break;
                    case 5:
                        newGem.blockChance=0.0125;
                        newGem.quality=newGem.blockChance/0.0125;
                        newGem.name="Soul Of Wall";
                        break;
                }
                break;
            case 'green':
                newGem.image = function(){return 'url(../images/assets/svg/view/sprites.svg#inventory--emerald)'};
                newGem.bgColor=function(){return "#77b300"};
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.dxt=10;
                        newGem.quality=newGem.dxt/10;
                        newGem.name="Soul Of Dexterity";
                        break;
                    case 1:
                        newGem.critChance=0.00833;
                        newGem.quality=newGem.critChance/0.00833;
                        newGem.name="Soul Of Extremum";
                        break;
                    case 2:
                        newGem.maxEnergy=50;
                        newGem.quality=newGem.maxEnergy/50;
                        newGem.name="Soul Of Energy";
                        break;
                    case 3:
                        newGem.hitChance=0.0075;
                        newGem.quality=newGem.hitChance/0.0075;
                        newGem.name="Soul Of Accuracy";
                        break;
                    case 4:
                        newGem.dodgeChance=0.015;
                        newGem.quality=newGem.dodgeChance/0.015;
                        newGem.name="Soul Of Swiftness";
                        break;
                    case 5:
                        newGem.luck=0.0125;
                        newGem.quality=newGem.luck/0.0125;
                        newGem.name="Soul Of Destiny";
                        break;
                }
                break;
            case 'blue':
                newGem.image = function(){return 'url(../images/assets/svg/view/sprites.svg#inventory--saphir)'};
                newGem.bgColor=function(){return "#2a9fd6"};
                switch(Math.floor(Math.random() * 6)){
                    case 0:
                        newGem.int=10;
                        newGem.quality=newGem.int/10;
                        newGem.name="Soul Of Intellect";
                        break;
                    case 1:
                        newGem.spellPower=0.05;
                        newGem.quality=newGem.spellPower/0.05;
                        newGem.name="Soul Of Magic";
                        break;
                    case 2:
                        newGem.maxMana=400;
                        newGem.quality=newGem.maxMana/400;
                        newGem.name="Soul Of Wisdom";
                        break;
                    case 3:
                        newGem.manaReg=0.0025;
                        newGem.quality=newGem.manaReg/0.0025;
                        newGem.name="Soul Of Meditation";
                        break;
                    case 4:
                        newGem.magicRes=0.015;
                        newGem.quality=newGem.magicRes/0.015;
                        newGem.name="Soul Of Will";
                        break;
                    case 5:
                        newGem.initiative=17;
                        newGem.quality=newGem.initiative/17;
                        newGem.name="Soul Of Tactic";
                        break;
                }
                break;
        }

        return newGem;
    }
};
