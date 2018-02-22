var AbilityFactory = require('services/abilityFactory');
var characterService = require('services/characterService');
var arenaService = require('services/arenaService');
var randomService = require('services/randomService');
var effectFactory = require('services/effectFactory');
var deepClone = require('fast-deepclone');

//Character factory
var Character = function(char, ignoreEquip) {

    for (var key in char) {
        if (char.hasOwnProperty(key)) {
            this[key] = char[key];
        }
    }

    this.state = {
        abilities: [],
        equip: {},
        buffs: [],
        debuffs: []
    };

    this.createEquipState();
    this.createAbilitiesState();
    this.initChar();

    if(ignoreEquip){
        delete this.state.equip;
        delete this.equip;
    }
};

Character.prototype.initChar = function(){
    this.logBuffer = []; //buffer of messages to show on UI
    this.soundBuffer = []; //buffer of sounds to play
    this.battleTextBuffer = []; //buffer of messages on the map
    this.buffs = []; //positive effects
    this.debuffs = []; //negative effects

    this.resetState();

    this.calcChar(false);
    this.curHealth = this.maxHealth;
    this.curEnergy = this.maxEnergy;
    this.curMana = this.maxMana;
    this.initiativePoints = (10 + this.initiative / 400) * 10;
};

//refresh character state in battle
Character.prototype.refreshChar = function(myTeam, enemyTeam, walls){
    if(this.isDead) return;
    this.resetState(); //drop state to recalulate
    this.applyEffects(myTeam, enemyTeam, walls); //apply all effects
    if(this.isDead) return; //check again because after DOT character can die
    this.calcChar(true); //recalculate char params

    this.initiativePoints += 10 + this.initiative / 400;

    //restore full energy
    this.curEnergy = this.maxEnergy;

    //Regenerate health
    var hpRegAmount = Math.floor(this.maxHealth * this.healthReg);
    if(this.curHealth + hpRegAmount < this.maxHealth){
        this.curHealth += hpRegAmount;
    }
    else {
        this.curHealth = this.maxHealth;
    }

    //Regenerate mana
    var manaRegAmount = Math.floor(this.maxMana * this.manaReg);
    if(this.curMana + manaRegAmount < this.maxMana){
        this.curMana += manaRegAmount;
    }
    else {
        this.curMana = this.maxMana;
    }

    //Decrease CD for abilities
    for(var i = 0; i < this.abilities.length;i++){
        if(this.abilities[i].cd>0){
            //check initiative proc
            if(this.checkCooldownDrop()){
                this.abilities[i].cd=0;
                this.logBuffer.push(this.charName+" drop cooldown for '"+this.abilities[i].name+"'");
                this.soundBuffer.push("initiative");
            }
            else this.abilities[i].cd--;
        }
    }

    this.createAbilitiesState();
    this.createEffectsState();
};

//������� ������ ��������� ������������ ��� �������
Character.prototype.createAbilitiesState = function() {
    //������ ����� ������������
    if(this.abilities) {
        var abilitiesForClient = [];
        for (var i = 0; i < this.abilities.length; i++) {
            //���� ����������� ������ ��� ������ �� ��, �������� �� ��������
            if(!this.abilities[i].cast){
                var variant = this.abilities[i].variant;
                this.abilities[i] = AbilityFactory(this.abilities[i].name);
                this.abilities[i].variant = variant;
            }
            abilitiesForClient.push(characterService.abilityForClient(this.abilities[i]));
        }
        this.state.abilities = abilitiesForClient;
    }
};

//������� ������ ��������� ��������� ��� �������
Character.prototype.createEquipState = function() {
    //������ ����� ���������
    if(this.equip) {
        var equip = characterService.getEquip(this.role); //���� ����������� ��������� ��� ���� ����
        for (var slot in equip) {
            if (equip.hasOwnProperty(slot)) {

                if(!this.equip[slot]) {
                    this.state.equip[slot] = {};
                    //���� ������ ���, ������ ��� �������
                    this.state.equip[slot].name = "Void";
                    this.state.equip[slot].slot = "offHandWeapon";
                    continue;
                }
                else {
                    this.state.equip[slot] = this.equip[slot];
                }

                //�������� ���������
                for(var slotKey in equip[slot]){
                    if (equip[slot].hasOwnProperty(slotKey)) {
                        if(slotKey !== "sockets"){
                            this.state.equip[slot][slotKey] = equip[slot][slotKey]();                            
                        }
                    }
                }
            }
        }
    }
};

//������� ������ ��������� �������� ��� �������
Character.prototype.createEffectsState = function() {
    var buffsForClient = [];
    var debuffsForClient = [];

    if(this.buffs.length>0) {
        for (var i = 0; i < this.buffs.length; i++) {
            buffsForClient.push(characterService.effectForClient(this.buffs[i]));
        }
    }
    if(this.debuffs.length>0) {
        for (i = 0; i < this.debuffs.length; i++) {
            debuffsForClient.push(characterService.effectForClient(this.debuffs[i]));
        }
    }

    this.state.buffs = buffsForClient;
    this.state.debuffs = debuffsForClient;
};

//������� �������� ��������� ��������� � ���
Character.prototype.resetState = function() {
    //���������
    this.moveCost = 300; //��������� ������� ��� ������������

    //���������
    this.isDead = false; //����
    this.clearCast = false; //�������� (���������� ����������)
    this.invisible = false; //�����
    this.silenced = false; //� ���������
    this.disarmed = false; //��� ������
    this.stunned = false; //�������
    this.immobilized = false; //����������
    this.underProphecy = false; //����� ���� ����������, ����� �� �� Prophecy
    this.physImmune = false; //����������������� � ������ �������� ���
    this.magicImmune = false; //����������������� � �����
    this.controlImmune = false; //����������������� � ��������

    //������������
    this.attackPowerMod = 1;
    this.healthRegMod = 1;
    this.physResMod = 1;
    this.blockChanceMod = 1;

    this.critChanceMod = 1;
    this.hitChanceMod = 1;
    this.dodgeChanceMod = 1;
    this.luckMod = 1;

    this.spellPowerMod = 1;
    this.manaRegMod = 1;
    this.magicResMod = 1;
    this.initiativeMod = 1;
};

//Recalculate char parameters
Character.prototype.calcChar = function(isSameEquip) {
    if(!isSameEquip) {
        //Recalculate items
        for (var key in this.equip) {
            if (this.equip.hasOwnProperty(key)) {
                if(this.equip[key].name !== "Void"){
                    this.calcItem(this.equip[key]);
                }
            }
        }

        this.strFromEq = this.paramFromEquip('str');
        this.attackPowerFromEq = this.paramFromEquip('attackPower');
        this.maxHealthFromEq = this.paramFromEquip('maxHealth');
        this.healthRegFromEq = this.paramFromEquip('healthReg');
        this.physResFromEq = this.paramFromEquip('physRes');
        this.blockChanceFromEq = this.paramFromEquip('blockChance');

        this.dxtFromEq = this.paramFromEquip('dxt');
        this.critChanceFromEq = this.paramFromEquip('critChance');
        this.maxEnergyFromEq = this.paramFromEquip('maxEnergy');
        this.hitChanceFromEq = this.paramFromEquip('hitChance');
        this.dodgeChanceFromEq = this.paramFromEquip('dodgeChance');
        this.luckFromEq = this.paramFromEquip('luck');

        this.intFromEq = this.paramFromEquip('int');
        this.spellPowerFromEq = this.paramFromEquip('spellPower');
        this.maxManaFromEq = this.paramFromEquip('maxMana');
        this.manaRegFromEq = this.paramFromEquip('manaReg');
        this.magicResFromEq = this.paramFromEquip('magicRes');
        this.initiativeFromEq = this.paramFromEquip('initiative');

        if(this.equip.offHandWeapon && this.equip.offHandWeapon.name !== "Void"){
            this.minDamageFromEq = this.equip.mainHandWeapon.minDamage + this.equip.offHandWeapon.minDamage;
            this.maxDamageFromEq = this.equip.mainHandWeapon.maxDamage + this.equip.offHandWeapon.maxDamage;
        }
        else {
            this.minDamageFromEq = this.equip.mainHandWeapon.minDamage;
            this.maxDamageFromEq = this.equip.mainHandWeapon.maxDamage;
        }
    }    

    this.basicHealth = 5000;
    this.basicHitChance = 0.8;
    this.basicEnergy = 1000;
    this.basicMana = 4000;

    //Drop modifiers to 0 in case of negative values
    if(this.attackPowerMod < 0) this.attackPowerMod = 0;
    if(this.healthRegMod < 0) this.healthRegMod = 0;
    if(this.physResMod < 0) this.physResMod = 0;
    if(this.blockChanceMod < 0) this.blockChanceMod = 0;

    if(this.critChanceMod < 0) this.critChanceMod = 0;
    if(this.hitChanceMod < 0) this.hitChanceMod = 0;
    if(this.dodgeChanceMod < 0) this.dodgeChanceMod = 0;
    if(this.luckMod < 0) this.luckMod = 0;

    if(this.spellPowerMod < 0) this.spellPowerMod = 0;
    if(this.manaRegMod < 0) this.manaRegMod = 0;
    if(this.magicResMod < 0) this.magicResMod = 0;
    if(this.initiativeMod < 0) this.initiativeMod = 0;

    //Strength
    this.str = Math.floor((this.params.strMax + this.strFromEq) * this.params.strProc);

    this.attackPowerFromStr = this.str * 0.002;
    this.attackPower = (this.attackPowerFromStr + this.attackPowerFromEq) * this.attackPowerMod;

    this.maxHealthFromStr = this.str * 20 + this.basicHealth;    
    this.maxHealth = Math.floor(this.maxHealthFromStr + this.maxHealthFromEq);

    this.healthRegFromStr = this.str * 0.00012;    
    this.healthReg = (this.healthRegFromStr + this.healthRegFromEq) * this.healthRegMod;
    if(this.healthReg > 0.03) this.healthReg = 0.03;

    this.physResFromStr = this.str * 0.0009;    
    this.physRes = (this.physResFromStr + this.physResFromEq) * this.physResMod;
    if(this.physRes > 0.6) this.physRes = 0.6;

    this.blockChanceFromStr = this.str * 0.00075;    
    this.blockChance = (this.blockChanceFromStr + this.blockChanceFromEq) * this.blockChanceMod;
    if(this.blockChance > 0.5) this.blockChance = 0.5;

    //Dexterity    
    this.dxt = Math.floor((this.params.dxtMax + this.dxtFromEq) * this.params.dxtProc);

    this.critChanceFromDxt = this.dxt * 0.0005;    
    this.critChance = (this.critChanceFromDxt + this.critChanceFromEq) * this.critChanceMod;
    if(this.critChance > 0.5) this.critChance = 0.5;

    this.maxEnergyFromDxt = this.dxt * 3 + this.basicEnergy;    
    this.maxEnergy = Math.floor(this.maxEnergyFromDxt + this.maxEnergyFromEq);

    this.hitChanceFromDxt = this.basicHitChance + this.dxt * 0.00045;    
    this.hitChance = (this.hitChanceFromDxt + this.hitChanceFromEq) * this.hitChanceMod;
    if(this.hitChance > 1) this.hitChance = 1;

    this.dodgeChanceFromDxt = this.dxt * 0.0009;
    this.dodgeChance = (this.dodgeChanceFromDxt + this.dodgeChanceFromEq) * this.dodgeChanceMod;
    if(this.dodgeChance > 0.6) this.dodgeChance = 0.6;

    this.luckFromDxt = this.dxt * 0.00075;
    this.luck = (this.luckFromDxt + this.luckFromEq) * this.luckMod;
    if(this.luck > 0.5) this.luck = 0.5;

    //Intellect    
    this.int = Math.floor((this.params.intMax + this.intFromEq) * this.params.intProc);

    this.spellPowerFromInt = this.int * 0.003;    
    this.spellPower = (this.spellPowerFromInt + this.spellPowerFromEq) * this.spellPowerMod;

    this.maxManaFromInt = this.int * 16 + this.basicMana;    
    this.maxMana = Math.floor(this.maxManaFromInt + this.maxManaFromEq);

    this.manaRegFromInt = this.int * 0.00015;    
    this.manaReg = (this.manaRegFromInt + this.manaRegFromEq) * this.manaRegMod;
    if(this.manaReg > 0.04) this.manaReg = 0.04;

    this.magicResFromInt = this.int * 0.0009;    
    this.magicRes = (this.magicResFromInt + this.magicResFromEq) * this.magicResMod;
    if(this.magicRes > 0.6) this.magicRes = 0.6;

    this.initiativeFromInt = this.int;    
    this.initiative = Math.floor((this.initiativeFromInt + this.initiativeFromEq) * this.initiativeMod);

    this.minDamage = Math.floor(this.minDamageFromEq * (1 + this.attackPower));
    this.maxDamage = Math.floor(this.maxDamageFromEq * (1 + this.attackPower));
};

//calculate params on equipment
Character.prototype.paramFromEquip = function(key) {
    var value = 0;
    for (var slot in this.equip) {
        if(this.equip.hasOwnProperty(slot)){
            if(this.equip[slot].hasOwnProperty(key)){
                value += Number(this.equip[slot][key]);
            }
        }
    }
    return value;
}

//Calculate params by coordinates from params triangle
Character.prototype.calcParamsByPoint = function(point) {
    var leftY = Math.tan(2*Math.PI/3)*(point.left+5)+Math.sqrt(3)*75;
    var rightY = Math.tan(Math.PI/3)*(point.left+5)-Math.sqrt(3)*75;
    if(point.top<leftY){
        point.top=leftY;
    }
    if(point.top<rightY){
        point.top=rightY;
    }

    this.params.paramPoint = {left: point.left, top: point.top};

    var strLen = Math.sqrt(Math.pow(point.left+5,2)+(Math.pow(point.top+5-Math.sqrt(3)*75,2)))-5;
    if(strLen>=138) strLen = 140;
    if(strLen<=3) strLen = 0;
    this.params.strProc = 1-strLen/140;

    var dxtLen = Math.sqrt(Math.pow(point.left+5-75,2)+(Math.pow(point.top+5,2)))-5;
    if(dxtLen>=138) dxtLen = 140;
    if(dxtLen<=3) dxtLen = 0;
    this.params.dxtProc = 1-dxtLen/140;

    var intLen = Math.sqrt(Math.pow(point.left+5-150,2)+(Math.pow(point.top+5-Math.sqrt(3)*75,2)))-5;
    if(intLen>=138)intLen = 140;
    if(intLen<=3) intLen = 0;
    this.params.intProc = 1-intLen/140;
    this.calcChar(true);
};

//Recalculate item with sockets
Character.prototype.calcItem = function(item) {
    if(item.name == "Void") return;

    item.str=Math.floor(calcSockets(item.sockets, 'str'));

    if(item.hasOwnProperty('basicAttackPower')) item.attackPower = item.basicAttackPower+calcSockets(item.sockets, 'attackPower');
    else item.attackPower=calcSockets(item.sockets, 'attackPower');

    if(item.hasOwnProperty('basicMaxHealth')) item.maxHealth = Math.floor(item.basicMaxHealth+calcSockets(item.sockets, 'maxHealth'));
    else item.maxHealth=Math.floor(calcSockets(item.sockets, 'maxHealth'));

    if(item.hasOwnProperty('basicHealthReg')) item.healthReg = item.basicHealthReg+calcSockets(item.sockets, 'healthReg');
    else item.healthReg=calcSockets(item.sockets, 'healthReg');

    if(item.hasOwnProperty('basicPhysRes')) item.physRes = item.basicPhysRes+calcSockets(item.sockets, 'physRes');
    else item.physRes=calcSockets(item.sockets, 'physRes');

    if(item.hasOwnProperty('basicBlockChance')) item.blockChance = item.basicBlockChance+calcSockets(item.sockets, 'blockChance');
    else item.blockChance=calcSockets(item.sockets, 'blockChance');

    item.dxt=Math.floor(calcSockets(item.sockets, 'dxt'));

    if(item.hasOwnProperty('basicHitChance')) item.hitChance = item.basicHitChance+calcSockets(item.sockets, 'hitChance');
    else item.hitChance=calcSockets(item.sockets, 'hitChance');

    if(item.hasOwnProperty('basicMaxEnergy')) item.maxEnergy = Math.floor(item.basicMaxEnergy+calcSockets(item.sockets, 'maxEnergy'));
    else item.maxEnergy=calcSockets(item.sockets, 'maxEnergy');

    if(item.hasOwnProperty('basicCritChance')) item.critChance = item.basicCritChance+calcSockets(item.sockets, 'critChance');
    else item.critChance=calcSockets(item.sockets, 'critChance');

    if(item.hasOwnProperty('basicDodgeChance')) item.dodgeChance = item.basicDodgeChance+calcSockets(item.sockets, 'dodgeChance');
    else item.dodgeChance=calcSockets(item.sockets, 'dodgeChance');

    if(item.hasOwnProperty('basicLuck')) item.luck = item.basicLuck+calcSockets(item.sockets, 'luck');
    else item.luck=calcSockets(item.sockets, 'luck');

    item.int=Math.floor(calcSockets(item.sockets, 'int'));

    if(item.hasOwnProperty('basicSpellPower')) item.spellPower = item.basicSpellPower+calcSockets(item.sockets, 'spellPower');
    else item.spellPower=calcSockets(item.sockets, 'spellPower');

    if(item.hasOwnProperty('basicMaxMana')) item.maxMana = Math.floor(item.basicMaxMana+calcSockets(item.sockets, 'maxMana'));
    else item.maxMana=Math.floor(calcSockets(item.sockets, 'maxMana'));

    if(item.hasOwnProperty('basicManaReg')) item.manaReg = item.basicManaReg+calcSockets(item.sockets, 'manaReg');
    else item.manaReg=calcSockets(item.sockets, 'manaReg');

    if(item.hasOwnProperty('basicMagicRes')) item.magicRes = item.basicMagicRes+calcSockets(item.sockets, 'magicRes');
    else item.magicRes=calcSockets(item.sockets, 'magicRes');

    if(item.hasOwnProperty('basicInitiative')) item.initiative = Math.floor(item.basicInitiative+calcSockets(item.sockets, 'initiative'));
    else item.initiative=Math.floor(calcSockets(item.sockets, 'initiative'));

    //calculate socket properties
    function calcSockets(sockets, key){
        var value = 0;
        for(var i = 0; i < sockets.length; i++){
            var bonusValue = 0;
            if(sockets[i].gem.hasOwnProperty(key)){
                if(sockets[i].gem.color === sockets[i].type){
                    bonusValue = Number(sockets[i].gem[key]) * 0.5;
                }
                value += Number(sockets[i].gem[key]) + bonusValue;
            }
        }
        return value;
    }
    return item;
};

Character.prototype.addBuff = function(buff, caster, myTeam, enemyTeam, walls){
    if(this.isDead) return;

    if(buff.stacked()) buff.stacks = 1;
    buff.casterId = caster.id;
    buff.casterName = caster.charName;
    buff.left = buff.duration();

    for(var i = 0; i < this.buffs.length; i++){
        if(this.buffs[i].name === buff.name && this.buffs[i].casterId === caster.id){
            if(buff.stacked()) {
                if(this.buffs[i].stacks < this.buffs[i].maxStacks()) this.buffs[i].stacks++;
                this.buffs[i].apply(this, myTeam, enemyTeam, walls);
            }
            this.buffs[i].left = buff.duration();
            return;
        }
    }
    this.buffs.push(buff);
    buff.apply(this, myTeam, enemyTeam, walls);
};

Character.prototype.addDebuff = function(debuff, caster, myTeam, enemyTeam, walls){
    if(this.isDead) return;
    if(this.checkImmune(debuff.magicEffect())){
        this.logBuffer.push(this.charName + " didn't get effect '" + debuff.name + "' because immunity.");
        this.battleTextBuffer.push({type: "other", icon: debuff.icon(), color: getAbilityColor(debuff.role()), caster: caster.charName, text: "Immune", crit: false});
        this.soundBuffer.push("dodge");
        return;
    }

    if(debuff.stacked()) debuff.stacks = 1;
    debuff.casterId = caster.id;
    debuff.casterName = caster.charName;
    debuff.left = debuff.duration();

    for(var i = 0; i < this.debuffs.length; i++){
        if(this.debuffs[i].name === debuff.name && this.debuffs[i].casterId === caster.id){
            if(debuff.stacked()) {
                if(this.debuffs[i].stacks < this.debuffs[i].maxStacks()) this.debuffs[i].stacks++;
                this.debuffs[i].apply(this, enemyTeam, myTeam, walls);
            }
            if(this.isDead) return;
            this.debuffs[i].left=debuff.duration();
            return;
        }
    }
    this.debuffs.push(debuff);
    debuff.apply(this, enemyTeam, myTeam, walls);
};

Character.prototype.addBuffSimulation = function(buff, caster, myTeam, enemyTeam, walls){
    if(this.isDead) return;

    if(buff.stacked()) buff.stacks = 1;
    buff.casterId = caster.id;
    buff.casterName = caster.charName;
    buff.left = buff.duration();

    for(var i = 0; i < this.buffs.length; i++){
        if(this.buffs[i].name === buff.name && this.buffs[i].casterId === caster.id){
            if(buff.stacked()) {
                if(this.buffs[i].stacks < this.buffs[i].maxStacks()) this.buffs[i].stacks++;
            }
            this.buffs[i].left = buff.duration();
            return;
        }
    }
    this.buffs.push(buff);
};

Character.prototype.addDebuffSimulation = function(debuff, caster, myTeam, enemyTeam, walls){
    if(this.isDead) return;

    if(debuff.stacked()) debuff.stacks = 1;
    debuff.casterId = caster.id;
    debuff.casterName = caster.charName;
    debuff.left = debuff.duration();

    for(var i = 0; i < this.debuffs.length; i++){
        if(this.debuffs[i].name === debuff.name && this.debuffs[i].casterId === caster.id){
            if(debuff.stacked()) {
                if(this.debuffs[i].stacks < this.debuffs[i].maxStacks()) this.debuffs[i].stacks++;
            }
            if(this.isDead) return;
            this.debuffs[i].left=debuff.duration();
            return;
        }
    }
    this.debuffs.push(debuff);
};

Character.prototype.updateMods = function(myTeam, enemyTeam, walls) {
    for(var i=0; i<this.buffs.length; i++){
        if(this.buffs[i].onlyStat()) {
            this.buffs[i].apply(this, myTeam, enemyTeam, walls);
        }
    }

    for(i=0; i<this.debuffs.length; i++){
        if(this.debuffs[i].onlyStat()) {
            this.debuffs[i].apply(this, myTeam, enemyTeam, walls);
        }
    }
};

Character.prototype.applyEffects = function(myTeam, enemyTeam, walls) {
    var buffsForRemove = [];
    var debuffsForRemove = [];

    this.battleTextBuffer = [];

    for(var i=0; i<this.buffs.length; i++){
        if(!this.buffs[i].infinite()) {
            this.buffs[i].left--;
            if (this.buffs[i].left < 1) {
                buffsForRemove.push(i);
            }
            else {
                this.buffs[i].apply(this, myTeam, enemyTeam, walls);
            }
        }
        else {
            this.buffs[i].apply(this, myTeam, enemyTeam, walls);
        }
    }

    for(i=0;i<buffsForRemove.length;i++){
        this.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0; i<this.debuffs.length; i++){
        if(!this.debuffs[i].infinite()) {
            this.debuffs[i].left--;
            if (this.debuffs[i].left < 1) {
                debuffsForRemove.push(i);
            }
            else {
                this.debuffs[i].apply(this, myTeam, enemyTeam, walls);
            }
        }
        else {
            this.debuffs[i].apply(this, myTeam, enemyTeam, walls);
        }
    }

    for(i=0;i<debuffsForRemove.length;i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }
};

Character.prototype.removeRandomBuff = function(myTeam, enemyTeam) {
    if(this.buffs.length>0){
        var removableBuffIndex = randomService.randomInt(0, this.buffs.length - 1);
        if(this.buffs[removableBuffIndex].stacked()){
            if(this.buffs[removableBuffIndex].stacks === 1){
                this.buffs.splice(removableBuffIndex, 1);
            }
            else {
                this.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            this.buffs.splice(removableBuffIndex, 1);
        }

        this.resetState();
        this.updateMods(myTeam, enemyTeam);
        this.calcChar(true);
    }
};

Character.prototype.removeRandomBuffSimulation = function() {
    if(this.buffs.length>0){
        var removableBuffIndex = randomService.randomInt(0, this.buffs.length - 1);
        if(this.buffs[removableBuffIndex].stacked()){
            if(this.buffs[removableBuffIndex].stacks === 1){
                this.buffs.splice(removableBuffIndex, 1);
            }
            else {
                this.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            this.buffs.splice(removableBuffIndex, 1);
        }
    }
};

Character.prototype.removeRandomDebuff = function(myTeam, enemyTeam) {
    if(this.debuffs.length > 0){
        var removableDebuffIndex = randomService.randomInt(0, this.debuffs.length - 1);
        if(this.debuffs[removableDebuffIndex].stacked()){
            if(this.debuffs[removableDebuffIndex].stacks === 1){
                this.debuffs.splice(removableDebuffIndex, 1);
            }
            else {
                this.debuffs[removableDebuffIndex].stacks--;
            }
        }
        else {
            this.debuffs.splice(removableDebuffIndex, 1);
        }

        this.resetState();
        this.updateMods(myTeam, enemyTeam);
        this.calcChar(true);
    }    
};

Character.prototype.removeRandomDebuffSimulation = function() {
    if(this.debuffs.length > 0){
        var removableDebuffIndex = randomService.randomInt(0, this.debuffs.length - 1);
        if(this.debuffs[removableDebuffIndex].stacked()){
            if(this.debuffs[removableDebuffIndex].stacks === 1){
                this.debuffs.splice(removableDebuffIndex, 1);
            }
            else {
                this.debuffs[removableDebuffIndex].stacks--;
            }
        }
        else {
            this.debuffs.splice(removableDebuffIndex, 1);
        }
    }
};

Character.prototype.removeAllDebuffs = function(myTeam, enemyTeam) {
    if(this.debuffs.length > 0){
        this.debuffs = [];
        this.resetState();
        this.updateMods(myTeam, enemyTeam);
        this.calcChar(true);
    }
};

Character.prototype.removeAllDebuffsSimulation = function() {
    this.debuffs = [];
};

Character.prototype.removeRandomDOT = function(myTeam, enemyTeam) {
    if(this.debuffs.length>0){
        var DOTS = [];
        for(var i=0; i<this.debuffs.length; i++){
            if(!this.debuffs[i].onlyStat()) DOTS.push({index: i, dot: this.debuffs[i]});
        }

        if(DOTS.length > 0){
            var removableDOTIndex = randomService.randomInt(0, DOTS.length - 1);
            var removableDebuffIndex = DOTS[removableDOTIndex].index;
            if(this.debuffs[removableDebuffIndex].stacked()){
                if(this.debuffs[removableDebuffIndex].stacks === 1){
                    this.debuffs.splice(removableDebuffIndex, 1);
                }
                else {
                    this.debuffs[removableDebuffIndex].stacks--;
                }
            }
            else {
                this.debuffs.splice(removableDebuffIndex, 1);
            }

            this.resetState();
            this.updateMods(myTeam, enemyTeam);
            this.calcChar(true);
        }
    }
};

Character.prototype.removeRandomDOTSimulation = function() {
    if(this.debuffs.length>0){
        var DOTS = [];
        for(var i = 0; i < this.debuffs.length; i++){
            if(!this.debuffs[i].onlyStat()) DOTS.push({index: i, dot: this.debuffs[i]});
        }

        if(DOTS.length > 0){
            var removableDOTIndex = randomService.randomInt(0, DOTS.length - 1);
            var removableDebuffIndex = DOTS[removableDOTIndex].index;
            if(this.debuffs[removableDebuffIndex].stacked()){
                if(this.debuffs[removableDebuffIndex].stacks === 1){
                    this.debuffs.splice(removableDebuffIndex, 1);
                }
                else {
                    this.debuffs[removableDebuffIndex].stacks--;
                }
            }
            else {
                this.debuffs.splice(removableDebuffIndex, 1);
            }
        }
    }
};

Character.prototype.stealRandomBuff = function(target, myTeam, enemyTeam, walls) {
    var stealedBuffName = false;

    if(target.buffs.length > 0){
        var removableBuffIndex = randomService.randomInt(0, target.buffs.length - 1);
        stealedBuffName = target.buffs[removableBuffIndex].name;
        if(target.buffs[removableBuffIndex].stacked()){
            if(target.buffs[removableBuffIndex].stacks === 1){
                this.addBuff(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), this, myTeam, enemyTeam, walls);
                target.buffs.splice(removableBuffIndex, 1);
            }
            else {
                this.addBuff(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), this, myTeam, enemyTeam, walls);
                target.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            if(target.buffs[removableBuffIndex].name === "Sanctuary"){
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i].id == target.buffs[removableBuffIndex].casterId) {
                        debuffer = enemyTeam[i];
                        break;
                    }
                }
                if(debuffer){
                    this.addBuff(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), debuffer, myTeam, enemyTeam, walls);
                }                
            }
            else {
                this.addBuff(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), this, myTeam, enemyTeam, walls);
            }
            target.buffs.splice(removableBuffIndex, 1);
        }

        target.resetState();
        target.updateMods(myTeam, enemyTeam);
        target.calcChar(true);
    }
    return stealedBuffName;
};

Character.prototype.stealRandomBuffSimulation = function(target, myTeam, enemyTeam, walls) {
    var stealedBuffName = false;

    if(target.buffs.length > 0){
        var removableBuffIndex = randomService.randomInt(0, target.buffs.length - 1);
        stealedBuffName = target.buffs[removableBuffIndex].name;
        if(target.buffs[removableBuffIndex].stacked()){
            if(target.buffs[removableBuffIndex].stacks === 1){
                this.addBuffSimulation(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), this, myTeam, enemyTeam, walls);
                target.buffs.splice(removableBuffIndex, 1);
            }
            else {
                this.addBuffSimulation(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), this, myTeam, enemyTeam, walls);
                target.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            if(target.buffs[removableBuffIndex].name === "Sanctuary"){
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i].id == target.buffs[removableBuffIndex].casterId) {
                        debuffer = enemyTeam[i];
                        break;
                    }
                }
                if(debuffer){
                    this.addBuffSimulation(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), debuffer, myTeam, enemyTeam, walls);
                }                
            }
            else {
                this.addBuffSimulation(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), this, myTeam, enemyTeam, walls);
            }
            target.buffs.splice(removableBuffIndex, 1);
        }
    }
    return stealedBuffName;
};

Character.prototype.addEffectFromEffects = function(name, variant) {
    return effectFactory(name, variant);
};

Character.prototype.canMove = function(){
    return (this.curEnergy - this.moveCost) >= 0;
};

Character.prototype.takeDamage = function(value, caster, ability, canBlock, canDodge, isCritical, myTeam, enemyTeam){
    var blockedDamage = 0;
    var str = "";

    if(value===0) {
        this.logBuffer.push(this.charName + " didn't take damage from '" + ability.name + "' of " + caster.charName + ", because immunity.");
        this.battleTextBuffer.push({type: "other", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: "Immune", crit: false});
        this.soundBuffer.push("dodge");
        return false;
    }

    if(canDodge){
        if(this.checkDodge()){
            this.logBuffer.push(this.charName + " dodged from '"+ability.name+"' of "+caster.charName);
            this.soundBuffer.push("dodge");
            this.battleTextBuffer.push({type: "other", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: "Dodge", crit: false});
            return false;
        }
    }

    //Check for Sanctuary
    for(var i=0;i<this.buffs.length;i++){
        if(this.buffs[i].name==="Sanctuary") {
            var sanctBuff=this.buffs[i];
            var sanctValue = value*sanctBuff.variant*0.15;
            value-=sanctValue;
            for(var j=0;j<enemyTeam.length;j++){
                if(enemyTeam[j].id == sanctBuff.casterId && !enemyTeam[j].isDead && enemyTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    var sanctCaster = enemyTeam[j];
                    sanctCaster.takeDamage(sanctValue, caster, {name: ability.name+" (Sanctuary)", icon: ability.icon, role: ability.role}, canBlock, canDodge, isCritical, myTeam, enemyTeam);
                }
            }
            //�� ������ ������ ���������, ����� ��� ��� �������
            for(j=0;j<myTeam.length;j++){
                if(myTeam[j].id == sanctBuff.casterId && !myTeam[j].isDead && myTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    sanctCaster = myTeam[j];
                    sanctCaster.takeDamage(sanctValue, caster, {name: ability.name+" (Sanctuary)", icon: ability.icon, role: ability.role}, canBlock, canDodge, isCritical, enemyTeam, myTeam);
                }
            }
        }
    }

    //Check for Fight Fire With Fire
    for(i=0;i<this.buffs.length;i++){
        if(this.buffs[i].name==="Fight Fire With Fire") {
            var fffBuff=this.buffs[i];
            var fffValue = value*(0.2+fffBuff.variant*0.1);
            //value-=fffValue; ����� �� �����������, � ������ ������������ ����������
            fffValue = fffValue*(1+this.spellPower);
            if(!caster.isDead && caster.findEffect("Fight Fire With Fire")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Fight Fire With Fire
                caster.takeDamage(fffValue, this, {name: "Fight Fire With Fire", icon: "url(../images/assets/svg/view/sprites.svg#abilities--FightFireWithFire)", role: "malefic"}, true, true, isCritical, enemyTeam, myTeam);
            }
        }
    }

    if(canBlock){
        if(this.checkBlock()){
            blockedDamage = Math.round(value*this.blockChance*1.5);
            value-=blockedDamage;
            this.soundBuffer.push("block");
        }
    }

    value=Math.round(value);

    this.curHealth -= value;

    this.battleTextBuffer.push({type: "damage", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: value, crit: isCritical});

    str+=this.charName + " got "+value;

    if(blockedDamage>0) str+=" ("+blockedDamage+" blocked)";
    if(isCritical) str+= " CRITICAL";
    str+=" damage from '"+ability.name+"' of "+caster.charName;
    this.logBuffer.push(str);

    caster.afterDealingDamage(enemyTeam, myTeam); //� ������� ����������� ������� ����� ��������� �����
    this.afterDamageTaken(myTeam, enemyTeam); //� � ���� ����� ��������� �����

    if(this.curHealth<=0){ //Death
        this.curHealth=0;
        this.buffs=[];
        this.debuffs=[];
        this.isDead=true;
        this.portrait = "./images/assets/img/portraits/death.jpg";
        this.logBuffer.push(this.charName + " is dead");
        this.soundBuffer.push("death");
    }
    return true;
};

Character.prototype.takeDamageSimulation = function(value, caster, canBlock, canDodge, myTeam, enemyTeam){
    if(value===0) {
        return false;
    }

    if(canDodge){
        value = (1 - this.dodgeChance) * value;
    }

    //Check for Sanctuary
    for(var i=0;i<this.buffs.length;i++){
        if(this.buffs[i].name==="Sanctuary") {
            var sanctBuff=this.buffs[i];
            var sanctValue = value * sanctBuff.variant * 0.15;
            value-=sanctValue;
            for(var j=0;j<enemyTeam.length;j++){
                if(enemyTeam[j].id === sanctBuff.casterId && !enemyTeam[j].isDead && enemyTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    var sanctCaster = enemyTeam[j];
                    sanctCaster.takeDamageSimulation(sanctValue, caster, canBlock, canDodge, myTeam, enemyTeam);
                }
            }            
            for(j=0;j<myTeam.length;j++){
                if(myTeam[j].id == sanctBuff.casterId && !myTeam[j].isDead && myTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    sanctCaster = myTeam[j];
                    sanctCaster.takeDamageSimulation(sanctValue, caster, canBlock, canDodge, enemyTeam, myTeam);
                }
            }
        }
    }

    //Check for Fight Fire With Fire
    for(i=0;i<this.buffs.length;i++){
        if(this.buffs[i].name==="Fight Fire With Fire") {
            var fffBuff=this.buffs[i];
            var fffValue = value*(0.2+fffBuff.variant*0.1);
            //value-=fffValue; ����� �� �����������, � ������ ������������ ����������
            fffValue = fffValue*(1+this.spellPower);
            if(!caster.isDead && caster.findEffect("Fight Fire With Fire")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Fight Fire With Fire
                caster.takeDamageSimulation(fffValue, this, true, true, enemyTeam, myTeam);
            }
        }
    }

    if(canBlock){
        value -= Math.round(value * this.blockChance * 1.5) * this.blockChance;
    }

    this.curHealth -= value;

    caster.afterDealingDamageSimulation();
    this.afterDamageTakenSimulation();

    if(this.curHealth<=0){ //Death
        this.curHealth=0;
        this.buffs=[];
        this.debuffs=[];
        this.isDead=true;
    }
    return true;
};

//������� ��������� ���������
Character.prototype.takeHeal = function(value, caster, ability, isCritical){
    var str = "";

    value=Math.round(value);

    if(this.curHealth+value>=this.maxHealth) this.curHealth=this.maxHealth;
    else this.curHealth += value;

    //battleText
    this.battleTextBuffer.push({type: "heal", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: value, crit: isCritical});

    if(this.id === caster.id){
        str+=this.charName + " healed for "+value;
        if(isCritical) str+= " (CRITICAL)";
        str+=" with '"+ability.name+"'";
    }
    else {
        str+=this.charName + " was healed by "+caster.charName+" for "+value;
        if(isCritical) str+= " (CRITICAL)";
        str+=" with '"+ability.name+"'";
    }
    this.logBuffer.push(str);
};

Character.prototype.takeHealSimulation = function(value){
    if(this.curHealth+value>=this.maxHealth) this.curHealth=this.maxHealth;
    else this.curHealth += value;    
};

//Get some energy
Character.prototype.takeEnergy = function(value, caster, ability, isCritical){
    var str = "";

    value=Math.round(value);

    if(this.curEnergy+value>=this.maxEnergy) this.curEnergy=this.maxEnergy;
    else this.curEnergy += value;

    if(this.id === caster.id){
        str+=this.charName + " restore "+value;
        str+=" energy with '"+ability+"'";
    }
    else {
        str+=this.charName + " restore "+value;
        str+=" energy with '"+ability+"' used by "+caster.charName;
    }
    this.logBuffer.push(str);
};

Character.prototype.takeEnergySimulation = function(value){
    if(this.curEnergy + value >= this.maxEnergy) this.curEnergy = this.maxEnergy;
    else this.curEnergy += value;
};

//Get some mana
Character.prototype.takeMana = function(value, caster, ability, isCritical){
    var str = "";

    value=Math.round(value);

    if(this.curMana+value>=this.maxMana) this.curMana=this.maxMana;
    else this.curMana += value;

    if(this.id === caster.id){
        str+=this.charName + " restore "+value;
        str+=" mana with '"+ability+"'";
    }
    else {
        str+=this.charName + " restore "+value;
        str+=" mana with '"+ability+"' used by "+caster.charName;
    }
    this.logBuffer.push(str);
};

//Get some mana (simulation)
Character.prototype.takeManaSimulation = function(value){
    if(this.curMana+value >= this.maxMana) this.curMana = this.maxMana;
    else this.curMana += value;
};

//������� ����� �������
Character.prototype.spendEnergy = function(value, simulation) {
    if(!simulation && this.checkLuck()){
        this.logBuffer.push(this.charName+" is very lucky and save his energy");
        this.soundBuffer.push("luck");
    }
    else {
        if(this.curEnergy-value>0) {
            this.curEnergy-=value;
        }
        else {
            this.curEnergy = 0;
        }
    }
};

//������� ����� ����
Character.prototype.spendMana = function(value, simulation) {
    if(this.clearCast && !simulation){
        this.logBuffer.push(this.charName+" is in clearcasting state and save mana");
    }
    else {
        if(this.curMana-value>0) {
            this.curMana-=value;
        }
        else {
            this.curMana = 0;
        }
    }
};

//������� ������� ������������ �����
Character.prototype.applyCrit = function (value) {
    return Math.round(value*(1.5+this.critChance));
};

//������� ��������� ����� ��������, ���� �������� ���� ����
Character.prototype.afterDealingDamage = function (myTeam, enemyTeam) {
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    currentEffect = this.findEffect("Invisible");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }
    currentEffect = this.findEffect("Fade To Black");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }

    for(var i=0;i<buffsForRemove.length;i++){
        this.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0;i<debuffsForRemove.length;i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(buffsForRemove.length>0 || debuffsForRemove.length>0){
        this.resetState();
        this.updateMods(myTeam, enemyTeam);
        this.calcChar(true);
    }
};

Character.prototype.afterDealingDamageSimulation = function () {
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    currentEffect = this.findEffect("Invisible");
    if(currentEffect >- 1){
        buffsForRemove.push(currentEffect);
    }
    currentEffect = this.findEffect("Fade To Black");
    if(currentEffect >- 1){
        buffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < buffsForRemove.length; i++){
        this.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0; i<debuffsForRemove.length; i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }
};

Character.prototype.afterDamageTaken = function (myTeam, enemyTeam) {
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    currentEffect = this.findEffect("Invisible");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }
    currentEffect = this.findEffect("Fade To Black");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }

    for(var i=0;i<buffsForRemove.length;i++){
        this.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0;i<debuffsForRemove.length;i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(buffsForRemove.length>0 || debuffsForRemove.length>0){
        this.resetState();
        this.updateMods(myTeam, enemyTeam);
        this.calcChar(true);
    }
};

Character.prototype.afterDamageTakenSimulation = function () {
    var buffsForRemove = [];
    var debuffsForRemove = [];
    var currentEffect;

    currentEffect = this.findEffect("Invisible");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }
    currentEffect = this.findEffect("Fade To Black");
    if(currentEffect > -1){
        buffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < buffsForRemove.length;i++){
        this.buffs.splice(buffsForRemove[i], 1);
    }

    for(i = 0; i < debuffsForRemove.length; i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }
};

Character.prototype.afterMiss = function (target, ability, myTeam, enemyTeam, doNotLog) {
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    this.soundBuffer.push("miss");
    if(!doNotLog) this.logBuffer.push(this.charName+" miss against "+target+" with '"+ability.name+"'");
    this.battleTextBuffer.push({type: "other", icon: ability.icon, color: getAbilityColor(ability.role), caster: this.charName, text: "Miss", crit: false});

    currentEffect = this.findEffect("Reign In Blood");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }

    currentEffect = this.findEffect("Down In Flames");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }

    for(var i=0;i<buffsForRemove.length;i++){
        this.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0;i<debuffsForRemove.length;i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(buffsForRemove.length > 0 || debuffsForRemove.length > 0){
        this.resetState();
        this.updateMods(myTeam, enemyTeam);
        this.calcChar(true);
    }
};

Character.prototype.afterCast = function (castedSpell, myTeam, enemyTeam) {
    var buffsForRemove = [];
    var debuffsForRemove = [];
    var currentEffect;

    currentEffect = this.findEffect("Powerslave");
    if(currentEffect > -1 && castedSpell !== "Powerslave" && castedSpell !== "Lets Me Take It_Powerslave"){
        buffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < buffsForRemove.length; i++){
        this.buffs.splice(buffsForRemove[i], 1);
    }

    for(i = 0; i < debuffsForRemove.length; i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(buffsForRemove.length>0 || debuffsForRemove.length>0){
        this.resetState();
        this.updateMods(myTeam, enemyTeam);
        this.calcChar(true);
    }
};

Character.prototype.afterCastSimulation = function (castedSpell) {
    var buffsForRemove = [];
    var debuffsForRemove = [];
    var currentEffect;

    currentEffect = this.findEffect("Powerslave");
    if(currentEffect > -1 && castedSpell !== "Powerslave" && castedSpell !== "Lets Me Take It_Powerslave"){
        buffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < buffsForRemove.length; i++){
        this.buffs.splice(buffsForRemove[i], 1);
    }

    for(i = 0; i < debuffsForRemove.length; i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }
};

Character.prototype.removeImmobilization = function (myTeam, enemyTeam) {
    var debuffsForRemove=[];
    var currentEffect;

    currentEffect = this.findEffect("Hog Tied");
    if(currentEffect>-1){
        debuffsForRemove.push(currentEffect);
    }

    currentEffect = this.findEffect("Caught Somewhere In Time");
    if(currentEffect>-1){
        debuffsForRemove.push(currentEffect);
    }

    for(var i=0;i<debuffsForRemove.length;i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(debuffsForRemove.length>0){
        this.resetState();
        this.updateMods(myTeam, enemyTeam);
        this.calcChar(true);
    }
};

Character.prototype.removeImmobilizationSimulation = function () {
    var debuffsForRemove = [];
    var currentEffect;

    currentEffect = this.findEffect("Hog Tied");
    if(currentEffect >- 1){
        debuffsForRemove.push(currentEffect);
    }

    currentEffect = this.findEffect("Caught Somewhere In Time");
    if(currentEffect >- 1){
        debuffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < debuffsForRemove.length; i++){
        this.debuffs.splice(debuffsForRemove[i], 1);
    }
};

//������� �������� �����
Character.prototype.applyResistance = function (value, magic) {
    if(magic) {
        if(this.magicImmune) return 0;
        return Math.round(value-value*this.magicRes);
    }
    else {
        if(this.physImmune) return 0;
        return Math.round(value-value*this.physRes);
    }
};

//������� �������� �����
Character.prototype.checkBlock = function () {
    return (Math.random()<=this.blockChance);
};

//������� �������� �� ���������
Character.prototype.checkImmune = function (magicEffect) {
    return (!magicEffect && this.physImmune) || (magicEffect && this.magicImmune);
};

//������� �������� ����
Character.prototype.checkHit = function () {
    return (Math.random()<=this.hitChance);
};

//������� �������� �����
Character.prototype.checkCrit = function () {
    return (Math.random()<=this.critChance);
};

//������� �������� ���������
Character.prototype.checkDodge = function () {
    return (Math.random()<=this.dodgeChance);
};

//������� �������� �����
Character.prototype.checkLuck = function () {
    return (Math.random()<=this.luck);
};

//������� �������� ������ ��������
Character.prototype.checkCooldownDrop = function () {
    return (Math.random() <= (this.initiative * 0.0001));
};

//������� �������� �������
Character.prototype.findEffect = function (effect) {
    for(var i=0;i<this.buffs.length;i++){
        if(this.buffs[i].name===effect) return i;
    }
    for(i=0;i<this.debuffs.length;i++){
        if(this.debuffs[i].name===effect) return i;
    }
    return -1;
};

Character.prototype.getSize = function() {
    console.log("Character "+this.charName+" length: "+byteLength(JSON.stringify(this))+" bytes");
};

function getAbilityColor (role) {
    switch (role) {
        case "sentinel":
            return "#f7f7f7";
        case "slayer":
            return "#ff0906";
        case "redeemer":
            return "#0055AF";
        case "ripper":
            return "#61dd45";
        case "prophet":
            return "#00b3ee";
        case "malefic":
            return "#f05800";
        case "cleric":
            return "#ffc520";
        case "heretic":
            return "#862197";
    }
}

module.exports = function(char, ignoreEquip) {
    return new Character(char, ignoreEquip);
};