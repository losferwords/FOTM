var AbilityFactory = require('services/abilityFactory');
var characterService = require('services/characterService');
var arenaService = require('services/arenaService');
var randomService = require('services/randomService');
var effectFactory = require('services/effectFactory');

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
    var self = this;
    self.logBuffer = []; //buffer of messages to show on UI
    self.soundBuffer = []; //buffer of sounds to play
    self.battleTextBuffer = []; //buffer of messages on the map
    self.buffs = []; //positive effects
    self.debuffs = []; //negative effects

    self.resetState();

    self.calcChar(false);
    self.curHealth=self.maxHealth;
    self.curEnergy=self.maxEnergy;
    self.curMana=self.maxMana;
    self.initiativePoints = (10+self.initiative/400)*10;
};

//refresh character state in battle
Character.prototype.refreshChar = function(myTeam, enemyTeam, walls){
    var self = this;

    if(self.isDead) return;
    self.resetState(); //drop state to recalulate
    self.applyEffects(myTeam, enemyTeam, walls); //apply all effects
    if(self.isDead) return; //check again because after DOT character can die
    self.calcChar(true); //recalculate char params

    self.initiativePoints += 10+self.initiative/400;

    //restore full energy
    self.curEnergy = self.maxEnergy;

    //Regenerate health
    var hpRegAmount = Math.floor(self.maxHealth * self.healthReg);
    if(self.curHealth + hpRegAmount<self.maxHealth){
        self.curHealth += hpRegAmount;
    }
    else {
        self.curHealth = self.maxHealth;
    }

    //Regenerate mana
    var manaRegAmount = Math.floor(self.maxMana*self.manaReg);
    if(self.curMana + manaRegAmount<self.maxMana){
        self.curMana += manaRegAmount;
    }
    else {
        self.curMana = self.maxMana;
    }

    //Decrease CD for abilities
    for(var i=0;i<self.abilities.length;i++){
        if(self.abilities[i].cd>0){
            //check initiative proc
            if(self.checkCooldownDrop()){
                self.abilities[i].cd=0;
                self.logBuffer.push(self.charName+" drop cooldown for '"+self.abilities[i].name+"'");
                self.soundBuffer.push("initiative");
            }
            else self.abilities[i].cd--;
        }
    }

    self.createAbilitiesState();
    self.createEffectsState();
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
    var self=this;
    //������ ����� ���������
    if(self.equip) {
        var equip = characterService.getEquip(self.role); //���� ����������� ��������� ��� ���� ����
        for (var slot in equip) {
            if (equip.hasOwnProperty(slot)) {

                if(!self.equip[slot]) {
                    self.state.equip[slot] = {};
                    //���� ������ ���, ������ ��� �������
                    self.state.equip[slot].name="Void";
                    self.state.equip[slot].slot="offHandWeapon";
                    continue;
                }
                else {
                    self.state.equip[slot]=self.equip[slot];
                }

                //�������� ���������
                for(var slotKey in equip[slot]){
                    if (equip[slot].hasOwnProperty(slotKey)) {
                        if(slotKey!=="sockets"){
                            self.state.equip[slot][slotKey]=equip[slot][slotKey]();
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
    var self = this;

    //���������
    self.moveCost = 300; //��������� ������� ��� ������������

    //���������
    self.isDead = false; //����
    self.clearCast = false; //�������� (���������� ����������)
    self.invisible = false; //�����
    self.silenced = false; //� ���������
    self.disarmed = false; //��� ������
    self.stunned = false; //�������
    self.immobilized = false; //����������
    self.underProphecy = false; //����� ���� ����������, ����� �� �� Prophecy
    self.physImmune = false; //����������������� � ������ �������� ���
    self.magicImmune = false; //����������������� � �����
    self.controlImmune = false; //����������������� � ��������

    //������������
    self.attackPowerMod = 1;
    self.healthRegMod = 1;
    self.physResMod = 1;
    self.blockChanceMod = 1;

    self.critChanceMod = 1;
    self.hitChanceMod = 1;
    self.dodgeChanceMod = 1;
    self.luckMod = 1;

    self.spellPowerMod = 1;
    self.manaRegMod = 1;
    self.magicResMod = 1;
    self.initiativeMod = 1;
};

//Recalculate char parameters
Character.prototype.calcChar = function(isSameEquip) {
    var self = this;

    if(!isSameEquip) {
        //Recalculate items
        for (var key in self.equip) {
            if (self.equip.hasOwnProperty(key)) {
                if(self.equip[key].name !== "Void"){
                    self.calcItem(self.equip[key]);
                }
            }
        }

        self.strFromEq = paramFromEquip('str');
        self.attackPowerFromEq = paramFromEquip('attackPower');
        self.maxHealthFromEq = paramFromEquip('maxHealth');
        self.healthRegFromEq = paramFromEquip('healthReg');
        self.physResFromEq = paramFromEquip('physRes');
        self.blockChanceFromEq = paramFromEquip('blockChance');

        self.dxtFromEq = paramFromEquip('dxt');
        self.critChanceFromEq = paramFromEquip('critChance');
        self.maxEnergyFromEq = paramFromEquip('maxEnergy');
        self.hitChanceFromEq = paramFromEquip('hitChance');
        self.dodgeChanceFromEq = paramFromEquip('dodgeChance');
        self.luckFromEq = paramFromEquip('luck');

        self.intFromEq = paramFromEquip('int');
        self.spellPowerFromEq = paramFromEquip('spellPower');
        self.maxManaFromEq = paramFromEquip('maxMana');
        self.manaRegFromEq = paramFromEquip('manaReg');
        self.magicResFromEq = paramFromEquip('magicRes');
        self.initiativeFromEq = paramFromEquip('initiative');

        if(self.equip.offHandWeapon.name != "Void"){
            self.minDamageFromEq = self.equip.mainHandWeapon.minDamage + self.equip.offHandWeapon.minDamage;
            self.maxDamageFromEq = self.equip.mainHandWeapon.maxDamage + self.equip.offHandWeapon.maxDamage;
        }
        else {
            self.minDamageFromEq = self.equip.mainHandWeapon.minDamage;
            self.maxDamageFromEq = self.equip.mainHandWeapon.maxDamage;
        }
    }    

    self.basicHealth = 10000;
    self.basicHitChance = 0.8;
    self.basicEnergy = 1000;
    self.basicMana = 9000;

    //Drop modifiers to 0 in case of negative values
    if(self.attackPowerMod < 0) self.attackPowerMod = 0;
    if(self.healthRegMod < 0) self.healthRegMod = 0;
    if(self.physResMod < 0) self.physResMod = 0;
    if(self.blockChanceMod < 0) self.blockChanceMod = 0;

    if(self.critChanceMod < 0) self.critChanceMod = 0;
    if(self.hitChanceMod < 0) self.hitChanceMod = 0;
    if(self.dodgeChanceMod < 0) self.dodgeChanceMod = 0;
    if(self.luckMod < 0) self.luckMod = 0;

    if(self.spellPowerMod < 0) self.spellPowerMod = 0;
    if(self.manaRegMod < 0) self.manaRegMod = 0;
    if(self.magicResMod < 0) self.magicResMod = 0;
    if(self.initiativeMod < 0) self.initiativeMod = 0;

    //Strength
    self.str = Math.floor((self.params.strMax + self.strFromEq) * self.params.strProc);

    self.attackPowerFromStr = self.str * 0.002;
    self.attackPower = (self.attackPowerFromStr + self.attackPowerFromEq) * self.attackPowerMod;

    self.maxHealthFromStr = self.str * 30 + self.basicHealth;    
    self.maxHealth = Math.floor(self.maxHealthFromStr + self.maxHealthFromEq);

    self.healthRegFromStr = self.str * 0.00012;    
    self.healthReg = (self.healthRegFromStr + self.healthRegFromEq) * self.healthRegMod;
    if(self.healthReg > 0.03) self.healthReg = 0.03;

    self.physResFromStr = self.str * 0.0009;    
    self.physRes = (self.physResFromStr + self.physResFromEq) * self.physResMod;
    if(self.physRes > 0.6) self.physRes = 0.6;

    self.blockChanceFromStr = self.str * 0.00075;    
    self.blockChance = (self.blockChanceFromStr + self.blockChanceFromEq) * self.blockChanceMod;
    if(self.blockChance > 0.5) self.blockChance = 0.5;

    //Dexterity    
    self.dxt = Math.floor((self.params.dxtMax + self.dxtFromEq) * self.params.dxtProc);

    self.critChanceFromDxt = self.dxt * 0.0005;    
    self.critChance = (self.critChanceFromDxt + self.critChanceFromEq) * self.critChanceMod;
    if(self.critChance > 0.5) self.critChance = 0.5;

    self.maxEnergyFromDxt = self.dxt * 3 + self.basicEnergy;    
    self.maxEnergy = Math.floor(self.maxEnergyFromDxt + self.maxEnergyFromEq);

    self.hitChanceFromDxt = self.basicHitChance + self.dxt * 0.00045;    
    self.hitChance = (self.hitChanceFromDxt + self.hitChanceFromEq) * self.hitChanceMod;
    if(self.hitChance > 1) self.hitChance = 1;

    self.dodgeChanceFromDxt = self.dxt * 0.0009;
    self.dodgeChance = (self.dodgeChanceFromDxt + self.dodgeChanceFromEq) * self.dodgeChanceMod;
    if(self.dodgeChance > 0.6) self.dodgeChance = 0.6;

    self.luckFromDxt = self.dxt * 0.00075;
    self.luck = (self.luckFromDxt + self.luckFromEq) * self.luckMod;
    if(self.luck > 0.5) self.luck = 0.5;

    //Intellect    
    self.int = Math.floor((self.params.intMax + self.intFromEq) * self.params.intProc);

    self.spellPowerFromInt = self.int * 0.003;    
    self.spellPower = (self.spellPowerFromInt + self.spellPowerFromEq) * self.spellPowerMod;

    self.maxManaFromInt = self.int * 24 + self.basicMana;    
    self.maxMana = Math.floor(self.maxManaFromInt + self.maxManaFromEq);

    self.manaRegFromInt = self.int * 0.00015;    
    self.manaReg = (self.manaRegFromInt + self.manaRegFromEq) * self.manaRegMod;
    if(self.manaReg > 0.04) self.manaReg = 0.04;

    self.magicResFromInt = self.int * 0.0009;    
    self.magicRes = (self.magicResFromInt + self.magicResFromEq) * self.magicResMod;
    if(self.magicRes > 0.6) self.magicRes = 0.6;

    self.initiativeFromInt = self.int;    
    self.initiative = Math.floor((self.initiativeFromInt + self.initiativeFromEq) * self.initiativeMod);

    self.minDamage = Math.floor(self.minDamageFromEq * (1 + self.attackPower));
    self.maxDamage = Math.floor(self.maxDamageFromEq * (1 + self.attackPower));

    //calculate params on equipment
    function paramFromEquip(key){
        var value = 0;
        for (var slot in self.equip) {
            if(self.equip.hasOwnProperty(slot)){
                if(self.equip[slot].hasOwnProperty(key)){
                    value += Number(self.equip[slot][key]);
                }
            }
        }
        return value;
    }
};

//Calculate params by coordinates from params triangle
Character.prototype.calcParamsByPoint = function(point) {
    var self = this;

    var leftY = Math.tan(2*Math.PI/3)*(point.left+5)+Math.sqrt(3)*75;
    var rightY = Math.tan(Math.PI/3)*(point.left+5)-Math.sqrt(3)*75;
    if(point.top<leftY){
        point.top=leftY;
    }
    if(point.top<rightY){
        point.top=rightY;
    }

    self.params.paramPoint = {left: point.left, top: point.top};

    var strLen = Math.sqrt(Math.pow(point.left+5,2)+(Math.pow(point.top+5-Math.sqrt(3)*75,2)))-5;
    if(strLen>=138) strLen = 140;
    if(strLen<=3) strLen = 0;
    self.params.strProc = 1-strLen/140;

    var dxtLen = Math.sqrt(Math.pow(point.left+5-75,2)+(Math.pow(point.top+5,2)))-5;
    if(dxtLen>=138) dxtLen = 140;
    if(dxtLen<=3) dxtLen = 0;
    self.params.dxtProc = 1-dxtLen/140;

    var intLen = Math.sqrt(Math.pow(point.left+5-150,2)+(Math.pow(point.top+5-Math.sqrt(3)*75,2)))-5;
    if(intLen>=138)intLen = 140;
    if(intLen<=3) intLen = 0;
    self.params.intProc = 1-intLen/140;
    self.calcChar(true);
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
    var self=this;

    if(self.isDead) return;

    if(buff.stacked()) buff.stacks = 1;
    buff.casterId = caster._id;
    buff.casterName = caster.charName;
    buff.left = buff.duration();

    for(var i = 0; i < self.buffs.length; i++){
        if(self.buffs[i].name === buff.name && self.buffs[i].casterId === caster._id){
            if(buff.stacked()) {
                if(self.buffs[i].stacks < self.buffs[i].maxStacks()) self.buffs[i].stacks++;
                self.buffs[i].apply(self, myTeam, enemyTeam, walls);
            }
            self.buffs[i].left = buff.duration();
            return;
        }
    }
    self.buffs.push(buff);
    buff.apply(self, myTeam, enemyTeam, walls);
};

Character.prototype.addDebuff = function(debuff, caster, myTeam, enemyTeam, walls){
    var self=this;

    if(self.isDead) return;
    if(self.checkImmune(debuff.magicEffect())){
        self.logBuffer.push(self.charName + " didn't get effect '" + debuff.name + "' because immunity.");
        self.battleTextBuffer.push({type: "other", icon: debuff.icon(), color: getAbilityColor(debuff.role()), caster: caster.charName, text: "Immune", crit: false});
        self.soundBuffer.push("dodge");
        return;
    }

    if(debuff.stacked()) debuff.stacks = 1;
    debuff.casterId = caster._id;
    debuff.casterName = caster.charName;
    debuff.left = debuff.duration();

    for(var i = 0; i < self.debuffs.length; i++){
        if(self.debuffs[i].name === debuff.name && self.debuffs[i].casterId === caster._id){
            if(debuff.stacked()) {
                if(self.debuffs[i].stacks < self.debuffs[i].maxStacks()) self.debuffs[i].stacks++;
                self.debuffs[i].apply(self, enemyTeam, myTeam, walls);
            }
            if(self.isDead) return;
            self.debuffs[i].left=debuff.duration();
            return;
        }
    }
    self.debuffs.push(debuff);
    debuff.apply(self, enemyTeam, myTeam, walls);
};

Character.prototype.addBuffSimulation = function(buff, caster, myTeam, enemyTeam, walls){
    var self=this;

    if(self.isDead) return;

    if(buff.stacked()) buff.stacks = 1;
    buff.casterId = caster._id;
    buff.casterName = caster.charName;
    buff.left = buff.duration();

    for(var i = 0; i < self.buffs.length; i++){
        if(self.buffs[i].name === buff.name && self.buffs[i].casterId === caster._id){
            if(buff.stacked()) {
                if(self.buffs[i].stacks < self.buffs[i].maxStacks()) self.buffs[i].stacks++;
            }
            self.buffs[i].left = buff.duration();
            return;
        }
    }
    self.buffs.push(buff);
};

Character.prototype.addDebuffSimulation = function(debuff, caster, myTeam, enemyTeam, walls){
    var self = this;

    if(self.isDead) return;

    if(debuff.stacked()) debuff.stacks = 1;
    debuff.casterId = caster._id;
    debuff.casterName = caster.charName;
    debuff.left = debuff.duration();

    for(var i = 0; i < self.debuffs.length; i++){
        if(self.debuffs[i].name === debuff.name && self.debuffs[i].casterId === caster._id){
            if(debuff.stacked()) {
                if(self.debuffs[i].stacks < self.debuffs[i].maxStacks()) self.debuffs[i].stacks++;
            }
            if(self.isDead) return;
            self.debuffs[i].left=debuff.duration();
            return;
        }
    }
    self.debuffs.push(debuff);
};

Character.prototype.updateMods = function(myTeam, enemyTeam, walls) {
    var self = this;

    for(var i=0; i<self.buffs.length; i++){
        if(self.buffs[i].onlyStat()) {
            self.buffs[i].apply(self, myTeam, enemyTeam, walls);
        }
    }

    for(i=0; i<self.debuffs.length; i++){
        if(self.debuffs[i].onlyStat()) {
            self.debuffs[i].apply(self, myTeam, enemyTeam, walls);
        }
    }
};

Character.prototype.applyEffects = function(myTeam, enemyTeam, walls) {
    var self = this;
    var buffsForRemove = [];
    var debuffsForRemove = [];

    self.battleTextBuffer = [];

    for(var i=0; i<self.buffs.length; i++){
        if(!self.buffs[i].infinite()) {
            self.buffs[i].left--;
            if (self.buffs[i].left < 1) {
                buffsForRemove.push(i);
            }
            else {
                self.buffs[i].apply(self, myTeam, enemyTeam, walls);
            }
        }
        else {
            self.buffs[i].apply(self, myTeam, enemyTeam, walls);
        }
    }

    for(i=0;i<buffsForRemove.length;i++){
        self.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0; i<self.debuffs.length; i++){
        if(!self.debuffs[i].infinite()) {
            self.debuffs[i].left--;
            if (self.debuffs[i].left < 1) {
                debuffsForRemove.push(i);
            }
            else {
                self.debuffs[i].apply(self, myTeam, enemyTeam, walls);
            }
        }
        else {
            self.debuffs[i].apply(self, myTeam, enemyTeam, walls);
        }
    }

    for(i=0;i<debuffsForRemove.length;i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }
};

Character.prototype.removeRandomBuff = function(myTeam, enemyTeam) {
    var self = this;

    if(self.buffs.length>0){
        var removableBuffIndex = randomService.randomInt(0, self.buffs.length - 1);
        if(self.buffs[removableBuffIndex].stacked()){
            if(self.buffs[removableBuffIndex].stacks === 1){
                self.buffs.splice(removableBuffIndex, 1);
            }
            else {
                self.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            self.buffs.splice(removableBuffIndex, 1);
        }

        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar(true);
    }
};

Character.prototype.removeRandomBuffSimulation = function() {
    var self = this;

    if(self.buffs.length>0){
        var removableBuffIndex = randomService.randomInt(0, self.buffs.length - 1);
        if(self.buffs[removableBuffIndex].stacked()){
            if(self.buffs[removableBuffIndex].stacks === 1){
                self.buffs.splice(removableBuffIndex, 1);
            }
            else {
                self.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            self.buffs.splice(removableBuffIndex, 1);
        }
    }
};

Character.prototype.removeRandomDebuff = function() {
    var self = this;

    if(self.debuffs.length > 0){
        var removableDebuffIndex = randomService.randomInt(0, self.debuffs.length - 1);
        if(self.debuffs[removableDebuffIndex].stacked()){
            if(self.debuffs[removableDebuffIndex].stacks === 1){
                self.debuffs.splice(removableDebuffIndex, 1);
            }
            else {
                self.debuffs[removableDebuffIndex].stacks--;
            }
        }
        else {
            self.debuffs.splice(removableDebuffIndex, 1);
        }

        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar(true);
    }    
};

Character.prototype.removeRandomDebuffSimulation = function() {
    var self = this;

    if(self.debuffs.length > 0){
        var removableDebuffIndex = randomService.randomInt(0, self.debuffs.length - 1);
        if(self.debuffs[removableDebuffIndex].stacked()){
            if(self.debuffs[removableDebuffIndex].stacks === 1){
                self.debuffs.splice(removableDebuffIndex, 1);
            }
            else {
                self.debuffs[removableDebuffIndex].stacks--;
            }
        }
        else {
            self.debuffs.splice(removableDebuffIndex, 1);
        }
    }
};

Character.prototype.removeAllDebuffs = function(myTeam, enemyTeam) {
    var self = this;

    if(self.debuffs.length > 0){
        self.debuffs = [];
        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar(true);
    }
};

Character.prototype.removeAllDebuffsSimulation = function() {
    this.debuffs = [];
};

Character.prototype.removeRandomDOT = function(myTeam, enemyTeam) {
    var self = this;

    if(self.debuffs.length>0){
        var DOTS = [];
        for(var i=0; i<self.debuffs.length; i++){
            if(!self.debuffs[i].onlyStat()) DOTS.push({index: i, dot: self.debuffs[i]});
        }

        if(DOTS.length > 0){
            var removableDOTIndex = randomService.randomInt(0, DOTS.length - 1);
            var removableDebuffIndex = DOTS[removableDOTIndex].index;
            if(self.debuffs[removableDebuffIndex].stacked()){
                if(self.debuffs[removableDebuffIndex].stacks === 1){
                    self.debuffs.splice(removableDebuffIndex, 1);
                }
                else {
                    self.debuffs[removableDebuffIndex].stacks--;
                }
            }
            else {
                self.debuffs.splice(removableDebuffIndex, 1);
            }

            self.resetState();
            self.updateMods(myTeam, enemyTeam);
            self.calcChar(true);
        }
    }
};

Character.prototype.removeRandomDOTSimulation = function() {
    var self = this;

    if(self.debuffs.length>0){
        var DOTS = [];
        for(var i = 0; i < self.debuffs.length; i++){
            if(!self.debuffs[i].onlyStat()) DOTS.push({index: i, dot: self.debuffs[i]});
        }

        if(DOTS.length > 0){
            var removableDOTIndex = randomService.randomInt(0, DOTS.length - 1);
            var removableDebuffIndex = DOTS[removableDOTIndex].index;
            if(self.debuffs[removableDebuffIndex].stacked()){
                if(self.debuffs[removableDebuffIndex].stacks === 1){
                    self.debuffs.splice(removableDebuffIndex, 1);
                }
                else {
                    self.debuffs[removableDebuffIndex].stacks--;
                }
            }
            else {
                self.debuffs.splice(removableDebuffIndex, 1);
            }
        }
    }
};

Character.prototype.stealRandomBuff = function(target, myTeam, enemyTeam, walls) {
    var self = this;
    var stealedBuffName = false;

    if(target.buffs.length > 0){
        var removableBuffIndex = randomService.randomInt(0, target.buffs.length - 1);
        stealedBuffName = target.buffs[removableBuffIndex].name;
        if(target.buffs[removableBuffIndex].stacked()){
            if(target.buffs[removableBuffIndex].stacks === 1){
                self.addBuff(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), self, myTeam, enemyTeam, walls);
                target.buffs.splice(removableBuffIndex, 1);
            }
            else {
                self.addBuff(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), self, myTeam, enemyTeam, walls);
                target.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            if(target.buffs[removableBuffIndex].name === "Sanctuary"){
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == target.buffs[removableBuffIndex].casterId) {
                        debuffer = enemyTeam[i];
                        break;
                    }
                }
                if(debuffer){
                    self.addBuff(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), debuffer, myTeam, enemyTeam, walls);
                }                
            }
            else {
                self.addBuff(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), self, myTeam, enemyTeam, walls);
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
    var self = this;
    var stealedBuffName = false;

    if(target.buffs.length > 0){
        var removableBuffIndex = randomService.randomInt(0, target.buffs.length - 1);
        stealedBuffName = target.buffs[removableBuffIndex].name;
        if(target.buffs[removableBuffIndex].stacked()){
            if(target.buffs[removableBuffIndex].stacks === 1){
                self.addBuffSimulation(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), self, myTeam, enemyTeam, walls);
                target.buffs.splice(removableBuffIndex, 1);
            }
            else {
                self.addBuffSimulation(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), self, myTeam, enemyTeam, walls);
                target.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            if(target.buffs[removableBuffIndex].name === "Sanctuary"){
                var debuffer = {};
                for(var i = 0; i < enemyTeam.length; i++){
                    if(enemyTeam[i]._id == target.buffs[removableBuffIndex].casterId) {
                        debuffer = enemyTeam[i];
                        break;
                    }
                }
                if(debuffer){
                    self.addBuffSimulation(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), debuffer, myTeam, enemyTeam, walls);
                }                
            }
            else {
                self.addBuffSimulation(effectFactory(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), self, myTeam, enemyTeam, walls);
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
    var self = this;
    var blockedDamage = 0;
    var str = "";

    if(value===0) {
        self.logBuffer.push(self.charName + " didn't take damage from '" + ability.name + "' of " + caster.charName + ", because immunity.");
        self.battleTextBuffer.push({type: "other", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: "Immune", crit: false});
        self.soundBuffer.push("dodge");
        return false;
    }

    if(canDodge){
        if(self.checkDodge()){
            self.logBuffer.push(self.charName + " dodged from '"+ability.name+"' of "+caster.charName);
            self.soundBuffer.push("dodge");
            self.battleTextBuffer.push({type: "other", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: "Dodge", crit: false});
            return false;
        }
    }

    //Check for Sanctuary
    for(var i=0;i<self.buffs.length;i++){
        if(self.buffs[i].name==="Sanctuary") {
            var sanctBuff=self.buffs[i];
            var sanctValue = value*sanctBuff.variant*0.15;
            value-=sanctValue;
            for(var j=0;j<enemyTeam.length;j++){
                if(enemyTeam[j]._id == sanctBuff.casterId && !enemyTeam[j].isDead && enemyTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    var sanctCaster = enemyTeam[j];
                    sanctCaster.takeDamage(sanctValue, caster, {name: ability.name+" (Sanctuary)", icon: ability.icon, role: ability.role}, canBlock, canDodge, isCritical, myTeam, enemyTeam);
                }
            }
            //�� ������ ������ ���������, ����� ��� ��� �������
            for(j=0;j<myTeam.length;j++){
                if(myTeam[j]._id == sanctBuff.casterId && !myTeam[j].isDead && myTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    sanctCaster = myTeam[j];
                    sanctCaster.takeDamage(sanctValue, caster, {name: ability.name+" (Sanctuary)", icon: ability.icon, role: ability.role}, canBlock, canDodge, isCritical, enemyTeam, myTeam);
                }
            }
        }
    }

    //Check for Fight Fire With Fire
    for(i=0;i<self.buffs.length;i++){
        if(self.buffs[i].name==="Fight Fire With Fire") {
            var fffBuff=self.buffs[i];
            var fffValue = value*(0.2+fffBuff.variant*0.1);
            //value-=fffValue; ����� �� �����������, � ������ ������������ ����������
            fffValue = fffValue*(1+self.spellPower);
            if(!caster.isDead && caster.findEffect("Fight Fire With Fire")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Fight Fire With Fire
                caster.takeDamage(fffValue, self, {name: "Fight Fire With Fire", icon: "url(../images/assets/svg/view/sprites.svg#abilities--FightFireWithFire)", role: "malefic"}, true, true, isCritical, enemyTeam, myTeam);
            }
        }
    }

    if(canBlock){
        if(self.checkBlock()){
            blockedDamage = Math.round(value*self.blockChance*1.5);
            value-=blockedDamage;
            self.soundBuffer.push("block");
        }
    }

    value=Math.round(value);

    self.curHealth -= value;

    self.battleTextBuffer.push({type: "damage", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: value, crit: isCritical});

    str+=self.charName + " got "+value;

    if(blockedDamage>0) str+=" ("+blockedDamage+" blocked)";
    if(isCritical) str+= " CRITICAL";
    str+=" damage from '"+ability.name+"' of "+caster.charName;
    self.logBuffer.push(str);

    caster.afterDealingDamage(enemyTeam, myTeam); //� ������� ����������� ������� ����� ��������� �����
    self.afterDamageTaken(myTeam, enemyTeam); //� � ���� ����� ��������� �����

    if(self.curHealth<=0){ //Death
        self.curHealth=0;
        self.buffs=[];
        self.debuffs=[];
        self.isDead=true;
        self.portrait = "./images/assets/img/portraits/death.jpg";
        self.logBuffer.push(self.charName + " is dead");
        self.soundBuffer.push("death");
    }
    return true;
};

Character.prototype.takeDamageSimulation = function(value, caster, canBlock, canDodge, myTeam, enemyTeam){
    var self = this;

    if(value===0) {
        return false;
    }

    if(canDodge){
        value = (1 - self.dodgeChance) * value;
    }

    //Check for Sanctuary
    for(var i=0;i<self.buffs.length;i++){
        if(self.buffs[i].name==="Sanctuary") {
            var sanctBuff=self.buffs[i];
            var sanctValue = value * sanctBuff.variant * 0.15;
            value-=sanctValue;
            for(var j=0;j<enemyTeam.length;j++){
                if(enemyTeam[j]._id === sanctBuff.casterId && !enemyTeam[j].isDead && enemyTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    var sanctCaster = enemyTeam[j];
                    sanctCaster.takeDamageSimulation(sanctValue, caster, canBlock, canDodge, myTeam, enemyTeam);
                }
            }            
            for(j=0;j<myTeam.length;j++){
                if(myTeam[j]._id == sanctBuff.casterId && !myTeam[j].isDead && myTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    sanctCaster = myTeam[j];
                    sanctCaster.takeDamageSimulation(sanctValue, caster, canBlock, canDodge, enemyTeam, myTeam);
                }
            }
        }
    }

    //Check for Fight Fire With Fire
    for(i=0;i<self.buffs.length;i++){
        if(self.buffs[i].name==="Fight Fire With Fire") {
            var fffBuff=self.buffs[i];
            var fffValue = value*(0.2+fffBuff.variant*0.1);
            //value-=fffValue; ����� �� �����������, � ������ ������������ ����������
            fffValue = fffValue*(1+self.spellPower);
            if(!caster.isDead && caster.findEffect("Fight Fire With Fire")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Fight Fire With Fire
                caster.takeDamageSimulation(fffValue, self, true, true, enemyTeam, myTeam);
            }
        }
    }

    if(canBlock){
        value -= Math.round(value * self.blockChance * 1.5) * self.blockChance;
    }

    self.curHealth -= value;

    caster.afterDealingDamageSimulation();
    self.afterDamageTakenSimulation();

    if(self.curHealth<=0){ //Death
        self.curHealth=0;
        self.buffs=[];
        self.debuffs=[];
        self.isDead=true;
    }
    return true;
};

//������� ��������� ���������
Character.prototype.takeHeal = function(value, caster, ability, isCritical){
    var self = this;
    var str = "";

    value=Math.round(value);

    if(self.curHealth+value>=self.maxHealth) self.curHealth=self.maxHealth;
    else self.curHealth += value;

    //battleText
    self.battleTextBuffer.push({type: "heal", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: value, crit: isCritical});

    if(self._id === caster._id){
        str+=self.charName + " healed for "+value;
        if(isCritical) str+= " (CRITICAL)";
        str+=" with '"+ability.name+"'";
    }
    else {
        str+=self.charName + " was healed by "+caster.charName+" for "+value;
        if(isCritical) str+= " (CRITICAL)";
        str+=" with '"+ability.name+"'";
    }
    self.logBuffer.push(str);
};

Character.prototype.takeHealSimulation = function(value){
    var self = this;

    if(self.curHealth+value>=self.maxHealth) self.curHealth=self.maxHealth;
    else self.curHealth += value;    
};

//Get some energy
Character.prototype.takeEnergy = function(value, caster, ability, isCritical){
    var self = this;
    var str = "";

    value=Math.round(value);

    if(self.curEnergy+value>=self.maxEnergy) self.curEnergy=self.maxEnergy;
    else self.curEnergy += value;

    if(self._id === caster._id){
        str+=self.charName + " restore "+value;
        str+=" energy with '"+ability+"'";
    }
    else {
        str+=self.charName + " restore "+value;
        str+=" energy with '"+ability+"' used by "+caster.charName;
    }
    self.logBuffer.push(str);
};

Character.prototype.takeEnergySimulation = function(value){
    var self = this;

    if(self.curEnergy + value >= self.maxEnergy) self.curEnergy = self.maxEnergy;
    else self.curEnergy += value;
};

//Get some mana
Character.prototype.takeMana = function(value, caster, ability, isCritical){
    var self = this;
    var str = "";

    value=Math.round(value);

    if(self.curMana+value>=self.maxMana) self.curMana=self.maxMana;
    else self.curMana += value;

    if(self._id === caster._id){
        str+=self.charName + " restore "+value;
        str+=" mana with '"+ability+"'";
    }
    else {
        str+=self.charName + " restore "+value;
        str+=" mana with '"+ability+"' used by "+caster.charName;
    }
    self.logBuffer.push(str);
};

//Get some mana (simulation)
Character.prototype.takeManaSimulation = function(value){
    var self = this;

    if(self.curMana+value >= self.maxMana) self.curMana = self.maxMana;
    else self.curMana += value;
};

//������� ����� �������
Character.prototype.spendEnergy = function(value, simulation) {
    var self=this;
    if(!simulation && self.checkLuck()){
        self.logBuffer.push(self.charName+" is very lucky and save his energy");
        self.soundBuffer.push("luck");
    }
    else {
        if(self.curEnergy-value>0) {
            self.curEnergy-=value;
        }
        else {
            self.curEnergy = 0;
        }
    }
};

//������� ����� ����
Character.prototype.spendMana = function(value, simulation) {
    var self=this;
    if(self.clearCast && !simulation){
        self.logBuffer.push(self.charName+" is in clearcasting state and save mana");
    }
    else {
        if(self.curMana-value>0) {
            self.curMana-=value;
        }
        else {
            self.curMana = 0;
        }
    }
};

//������� ������� ������������ �����
Character.prototype.applyCrit = function (value) {
    var self=this;
    return Math.round(value*(1.5+self.critChance));
};

//������� ��������� ����� ��������, ���� �������� ���� ����
Character.prototype.afterDealingDamage = function (myTeam, enemyTeam) {
    var self=this;
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    currentEffect = self.findEffect("Invisible");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }
    currentEffect = self.findEffect("Fade To Black");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }

    for(var i=0;i<buffsForRemove.length;i++){
        self.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0;i<debuffsForRemove.length;i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(buffsForRemove.length>0 || debuffsForRemove.length>0){
        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar(true);
    }
};

Character.prototype.afterDealingDamageSimulation = function () {
    var self=this;
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    currentEffect = self.findEffect("Invisible");
    if(currentEffect >- 1){
        buffsForRemove.push(currentEffect);
    }
    currentEffect = self.findEffect("Fade To Black");
    if(currentEffect >- 1){
        buffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < buffsForRemove.length; i++){
        self.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0; i<debuffsForRemove.length; i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }
};

Character.prototype.afterDamageTaken = function (myTeam, enemyTeam) {
    var self=this;
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    currentEffect = self.findEffect("Invisible");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }
    currentEffect = self.findEffect("Fade To Black");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }

    for(var i=0;i<buffsForRemove.length;i++){
        self.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0;i<debuffsForRemove.length;i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(buffsForRemove.length>0 || debuffsForRemove.length>0){
        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar(true);
    }
};

Character.prototype.afterDamageTakenSimulation = function () {
    var self = this;
    var buffsForRemove = [];
    var debuffsForRemove = [];
    var currentEffect;

    currentEffect = self.findEffect("Invisible");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }
    currentEffect = self.findEffect("Fade To Black");
    if(currentEffect > -1){
        buffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < buffsForRemove.length;i++){
        self.buffs.splice(buffsForRemove[i], 1);
    }

    for(i = 0; i < debuffsForRemove.length; i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }
};

Character.prototype.afterMiss = function (target, ability, myTeam, enemyTeam, doNotLog) {
    var self=this;
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    self.soundBuffer.push("miss");
    if(!doNotLog) self.logBuffer.push(self.charName+" miss against "+target+" with '"+ability.name+"'");
    self.battleTextBuffer.push({type: "other", icon: ability.icon, color: getAbilityColor(ability.role), caster: self.charName, text: "Miss", crit: false});

    currentEffect = self.findEffect("Reign In Blood");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }

    currentEffect = self.findEffect("Down In Flames");
    if(currentEffect>-1){
        buffsForRemove.push(currentEffect);
    }

    for(var i=0;i<buffsForRemove.length;i++){
        self.buffs.splice(buffsForRemove[i], 1);
    }

    for(i=0;i<debuffsForRemove.length;i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(buffsForRemove.length>0 || debuffsForRemove.length>0){
        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar(true);
    }
};

Character.prototype.afterCast = function (castedSpell) {
    var self = this;
    var buffsForRemove = [];
    var debuffsForRemove = [];
    var currentEffect;

    currentEffect = self.findEffect("Powerslave");
    if(currentEffect > -1 && castedSpell !== "Powerslave" && castedSpell !== "Lets Me Take It_Powerslave"){
        buffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < buffsForRemove.length; i++){
        self.buffs.splice(buffsForRemove[i], 1);
    }

    for(i = 0; i < debuffsForRemove.length; i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(buffsForRemove.length>0 || debuffsForRemove.length>0){
        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar(true);
    }
};

Character.prototype.afterCastSimulation = function (castedSpell) {
    var self = this;
    var buffsForRemove = [];
    var debuffsForRemove = [];
    var currentEffect;

    currentEffect = self.findEffect("Powerslave");
    if(currentEffect > -1 && castedSpell !== "Powerslave" && castedSpell !== "Lets Me Take It_Powerslave"){
        buffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < buffsForRemove.length; i++){
        self.buffs.splice(buffsForRemove[i], 1);
    }

    for(i = 0; i < debuffsForRemove.length; i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }
};

Character.prototype.removeImmobilization = function (myTeam, enemyTeam) {
    var self=this;
    var debuffsForRemove=[];
    var currentEffect;

    currentEffect = self.findEffect("Hog Tied");
    if(currentEffect>-1){
        debuffsForRemove.push(currentEffect);
    }

    currentEffect = self.findEffect("Caught Somewhere In Time");
    if(currentEffect>-1){
        debuffsForRemove.push(currentEffect);
    }

    for(var i=0;i<debuffsForRemove.length;i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }

    if(debuffsForRemove.length>0){
        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar(true);
    }
};

Character.prototype.removeImmobilizationSimulation = function () {
    var self = this;
    var debuffsForRemove = [];
    var currentEffect;

    currentEffect = self.findEffect("Hog Tied");
    if(currentEffect >- 1){
        debuffsForRemove.push(currentEffect);
    }

    currentEffect = self.findEffect("Caught Somewhere In Time");
    if(currentEffect >- 1){
        debuffsForRemove.push(currentEffect);
    }

    for(var i = 0; i < debuffsForRemove.length; i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }
};

//������� �������� �����
Character.prototype.applyResistance = function (value, magic) {
    var self=this;
    if(magic) {
        if(self.magicImmune) return 0;
        return Math.round(value-value*self.magicRes);
    }
    else {
        if(self.physImmune) return 0;
        return Math.round(value-value*self.physRes);
    }
};

//������� �������� �����
Character.prototype.checkBlock = function () {
    var self=this;
    return (Math.random()<=self.blockChance);
};

//������� �������� �� ���������
Character.prototype.checkImmune = function (magicEffect) {
    var self=this;
    return (!magicEffect && self.physImmune) || (magicEffect && self.magicImmune);
};

//������� �������� ����
Character.prototype.checkHit = function () {
    var self=this;
    return (Math.random()<=self.hitChance);
};

//������� �������� �����
Character.prototype.checkCrit = function () {
    var self=this;
    return (Math.random()<=self.critChance);
};

//������� �������� ���������
Character.prototype.checkDodge = function () {
    var self=this;
    return (Math.random()<=self.dodgeChance);
};

//������� �������� �����
Character.prototype.checkLuck = function () {
    var self=this;
    return (Math.random()<=self.luck);
};

//������� �������� ������ ��������
Character.prototype.checkCooldownDrop = function () {
    var self = this;
    return (Math.random() <= (self.initiative * 0.0001));
};

//������� �������� �������
Character.prototype.findEffect = function (effect) {
    var self=this;
    for(var i=0;i<self.buffs.length;i++){
        if(self.buffs[i].name===effect) return i;
    }
    for(i=0;i<self.debuffs.length;i++){
        if(self.debuffs[i].name===effect) return i;
    }
    return -1;
};

Character.prototype.getSize = function() {
    var self = this;
    console.log("Character "+self.charName+" length: "+byteLength(JSON.stringify(self))+" bytes");
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