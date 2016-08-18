var AbilityFactory = require('services/abilityFactory');
var characterService = require('services/characterService');

//�������, ������� �� ���� �������� "�������" character
var Character = function(char) {

    for (var key in char) {
        if (char.hasOwnProperty(key)) {
            this[key] = char[key];
        }
    }

    //��������� ������ ������������ ���������� � Character Factory, ����� ��������� �� ������
    if(this.abilities) {
        var abilitiesForClient = [];
        for (var i = 0; i < this.abilities.length; i++) {
            abilitiesForClient.push(characterService.abilityForClient(this.abilities[i].name, this.abilities[i].variant));
        }
        this.abilities = abilitiesForClient;
    }

    //��������� ���������, ���� �� ��������� ����� �������
    if(this.equip) {
        var equip = characterService.getEquip(this.role); //���� ����������� ��������� ��� ���� ����
        for (var slot in equip) {
            if (equip.hasOwnProperty(slot)) {
                if(!this.equip[slot]) {
                    //���� ������ ���, ������ ��� �������
                    this.equip[slot]={};
                    this.equip[slot].name="Void";
                    this.equip[slot].slot="offHandWeapon";
                    continue;
                }
                //�������� ���������
                for(var slotKey in equip[slot]){
                    if (equip[slot].hasOwnProperty(slotKey)) {
                        if(slotKey!=="sockets"){
                            this.equip[slot][slotKey]=equip[slot][slotKey]();
                        }
                    }
                }
            }
        }
    }

    this.initChar();
};

//������ ������������� ��������� � ���������� ���� ����������� �������
Character.prototype.initChar = function(){
    var self = this;
    self.logBuffer = []; //������ ��������� ��� ������-����
    self.soundBuffer = []; //������ ��������� ��� ������
    self.battleTextBuffer = []; //������ ������������ ������
    self.buffs = []; //������ ������������� ��������
    self.debuffs = []; //������ ������������� ��������

    self.resetState();

    self.calcChar();
    self.curHealth=self.maxHealth;
    self.curEnergy=self.maxEnergy;
    self.curMana=self.maxMana;
    self.initiativePoints = Math.round(self.initiative*10);
};

//���������� ��������� � ���
Character.prototype.refreshChar = function(myTeam, enemyTeam){
    var self = this;

    if(self.isDead) return; //���� ������, �� ��� ������ ������ �� ����
    self.resetState(); //���������� ��������� �� ��������
    self.applyEffects(myTeam, enemyTeam); //��������� ��� �������
    if(self.isDead) return; //���� ������ �� ���, ������ ������ �� ������
    self.calcChar(); //������������� ��� ���������

    //��������������� �������
    self.curEnergy = self.maxEnergy;

    //��������������� ��������
    var hpRegAmount = Math.floor(self.maxHealth*self.healthReg);
    if(self.curHealth + hpRegAmount<self.maxHealth){
        self.curHealth += hpRegAmount;
    }
    else {
        self.curHealth = self.maxHealth;
    }

    //��������������� ����
    var manaRegAmount = Math.floor(self.maxMana*self.manaReg);
    if(self.curMana + manaRegAmount<self.maxMana){
        self.curMana += manaRegAmount;
    }
    else {
        self.curMana = self.maxMana;
    }

    //��������� �� ��� ������������
    for(var i=0;i<self.abilities.length;i++){
        if(self.abilities[i].cd>0){
            //������ ��
            if(self.checkCooldownDrop()){
                self.abilities[i].cd=0;
                self.logBuffer.push(self.charName+" drop cooldown for '"+self.abilities[i].name+"'");
                self.playSound("initiative");
            }
            else self.abilities[i].cd--;
        }
    }
};

//������� �������� ��������� ��������� � ���
Character.prototype.resetState = function() {
    var self = this;

    //���������
    self.moveCost = 300; //��������� ������� ��� ������������

    //���������
    self.immobilize = false; //����������
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

//�������� ���� ������������� ���������
Character.prototype.calcChar = function() {
    var self = this;

    //������������ ������
    for (var key in self.equip) {
        if (self.equip.hasOwnProperty(key)) {
            if(self.equip[key].name!=="Void"){
                self.calcItem(self.equip[key]);
            }
        }
    }

    self.basicHealth = 10000;
    self.basicHitChance = 0.8;
    self.basicEnergy = 1000;
    self.basicMana = 9000;

    //�������� �� ������������� ������������
    if(self.attackPowerMod<0) self.attackPowerMod = 0;
    if(self.healthRegMod<0) self.healthRegMod = 0;
    if(self.physResMod<0) self.physResMod = 0;
    if(self.blockChanceMod<0) self.blockChanceMod = 0;

    if(self.critChanceMod<0) self.critChanceMod = 0;
    if(self.hitChanceMod<0) self.hitChanceMod = 0;
    if(self.dodgeChanceMod<0) self.dodgeChanceMod = 0;
    if(self.luckMod<0) self.luckMod = 0;

    if(self.spellPowerMod<0) self.spellPowerMod = 0;
    if(self.manaRegMod<0) self.manaRegMod = 0;
    if(self.magicResMod<0) self.magicResMod = 0;
    if(self.initiativeMod<0) self.initiativeMod = 0;

    //����
    self.strFromEq = paramFromEquip('str');
    self.str = Math.floor((self.params.strMax+self.strFromEq)*self.params.strProc);

    self.attackPowerFromStr = self.str*0.002;
    self.attackPowerFromEq = paramFromEquip('attackPower');
    self.attackPower = (self.attackPowerFromStr+self.attackPowerFromEq)*self.attackPowerMod;

    self.maxHealthFromStr = self.str*30+self.basicHealth;
    self.maxHealthFromEq = paramFromEquip('maxHealth');
    self.maxHealth = Math.floor(self.maxHealthFromStr+self.maxHealthFromEq);

    self.healthRegFromStr = self.str*0.00012;
    self.healthRegFromEq = paramFromEquip('healthReg');
    self.healthReg = (self.healthRegFromStr+self.healthRegFromEq)*self.healthRegMod;
    if(self.healthReg>0.03) self.healthReg=0.03;

    self.physResFromStr = self.str*0.0009;
    self.physResFromEq = paramFromEquip('physRes');
    self.physRes = (self.physResFromStr+self.physResFromEq)*self.physResMod;
    if(self.physRes>0.6) self.physRes=0.6;

    self.blockChanceFromStr = self.str*0.00075;
    self.blockChanceFromEq = paramFromEquip('blockChance');
    self.blockChance = (self.blockChanceFromStr+self.blockChanceFromEq)*self.blockChanceMod;
    if(self.blockChance>0.5) self.blockChance=0.5;

    //��������
    self.dxtFromEq = paramFromEquip('dxt');
    self.dxt = Math.floor((self.params.dxtMax+self.dxtFromEq)*self.params.dxtProc);

    self.critChanceFromDxt = self.dxt*0.0005;
    self.critChanceFromEq = paramFromEquip('critChance');
    self.critChance = (self.critChanceFromDxt+self.critChanceFromEq)*self.critChanceMod;
    if(self.critChance>0.5) self.critChance=0.5;

    self.maxEnergyFromDxt = self.dxt*3+self.basicEnergy;
    self.maxEnergyFromEq = paramFromEquip('maxEnergy');
    self.maxEnergy = Math.floor(self.maxEnergyFromDxt+self.maxEnergyFromEq);

    self.hitChanceFromDxt = self.basicHitChance+self.dxt*0.00045;
    self.hitChanceFromEq = paramFromEquip('hitChance');
    self.hitChance = (self.hitChanceFromDxt+self.hitChanceFromEq)*self.hitChanceMod;
    if(self.hitChance>1) self.hitChance=1;

    self.dodgeChanceFromDxt = self.dxt*0.0009;
    self.dodgeChanceFromEq = paramFromEquip('dodgeChance');
    self.dodgeChance = (self.dodgeChanceFromDxt+self.dodgeChanceFromEq)*self.dodgeChanceMod;
    if(self.dodgeChance>0.6) self.dodgeChance=0.6;

    self.luckFromDxt = self.dxt*0.00075;
    self.luckFromEq = paramFromEquip('luck');
    self.luck = (self.luckFromDxt+self.luckFromEq)*self.luckMod;
    if(self.luck>0.5) self.luck=0.5;

    //���������
    self.intFromEq = paramFromEquip('int');
    self.int = Math.floor((self.params.intMax+self.intFromEq)*self.params.intProc);

    self.spellPowerFromInt = self.int*0.003;
    self.spellPowerFromEq = paramFromEquip('spellPower');
    self.spellPower = (self.spellPowerFromInt+self.spellPowerFromEq)*self.spellPowerMod;

    self.maxManaFromInt = self.int*24+self.basicMana;
    self.maxManaFromEq = paramFromEquip('maxMana');
    self.maxMana = Math.floor(self.maxManaFromInt+self.maxManaFromEq);

    self.manaRegFromInt = self.int*0.00015;
    self.manaRegFromEq = paramFromEquip('manaReg');
    self.manaReg = (self.manaRegFromInt+self.manaRegFromEq)*self.manaRegMod;
    if(self.manaReg>0.04) self.manaReg=0.04;

    self.magicResFromInt = self.int*0.0009;
    self.magicResFromEq = paramFromEquip('magicRes');
    self.magicRes = (self.magicResFromInt+self.magicResFromEq)*self.magicResMod;
    if(self.magicRes>0.6) self.magicRes=0.6;

    self.initiativeFromInt = self.int;
    self.initiativeFromEq = paramFromEquip('initiative');
    self.initiative = Math.floor((self.initiativeFromInt+self.initiativeFromEq)*self.initiativeMod);

    if(self.equip.offHandWeapon.name!="Void"){
        self.minDamage=Math.floor((self.equip.mainHandWeapon.minDamage+self.equip.offHandWeapon.minDamage)*(1+self.attackPower));
        self.maxDamage=Math.floor((self.equip.mainHandWeapon.maxDamage+self.equip.offHandWeapon.maxDamage)*(1+self.attackPower));
    }
    else {
        self.minDamage=Math.floor(self.equip.mainHandWeapon.minDamage*(1+self.attackPower));
        self.maxDamage=Math.floor(self.equip.mainHandWeapon.maxDamage*(1+self.attackPower));
    }

    //������� ���������� ��� �������� ������ ���� ��������� � equip'�
    function paramFromEquip(key){
        var value=0; //�������� ����� ���������
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

//�������� ���������� �� ����� �� ������������ ������������
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
    self.calcChar();
};

//�������� ���� ������������� ������
Character.prototype.calcItem = function(item) {
    if(item.name=="Void") return;

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

    //������� ������������ ��������� � �������
    function calcSockets(sockets, key){
        var value=0; //�������� ����� ���������
        for(var i=0;i<sockets.length;i++){
            var bonusValue=0; //�������� �������� �� ����������� �����
            if(sockets[i].gem.hasOwnProperty(key)){
                //���� ���� ����� ������ � ������ ������
                if(sockets[i].gem.color===sockets[i].type){
                    bonusValue=Number(sockets[i].gem[key])*0.5;
                }
                value += Number(sockets[i].gem[key])+bonusValue;
            }
        }
        return value;
    }
    return item;
};

//���������� �����
Character.prototype.addBuff = function(buff, caster, myTeam, enemyTeam){
    var self=this;

    if(self.isDead) return;

    if(buff.stacked()) buff.stacks=1;
    buff.caster=caster;
    buff.left=buff.duration();

    for(var i=0;i<self.buffs.length;i++){
        if(self.buffs[i].name===buff.name && self.buffs[i].caster===caster){
            if(buff.stacked()) {
                if(self.buffs[i].stacks<self.buffs[i].maxStacks()) self.buffs[i].stacks++;
                self.buffs[i].apply(self, myTeam, enemyTeam);
            }
            self.buffs[i].left=buff.duration();
            return;
        }
    }
    self.buffs.push(buff);
    buff.apply(self, myTeam, enemyTeam);
};

//���������� �������
Character.prototype.addDebuff = function(debuff, caster, myTeam, enemyTeam){
    var self=this;

    if(self.isDead) return;
    if(self.checkImmune(debuff.magicEffect())){
        self.logBuffer.push(self.charName + " didn't get effect '" + debuff.name + "' because immunity.");
        self.battleTextBuffer.push({type: "other", icon: debuff.icon(), color: getAbilityColor(debuff.role()), caster: caster, text: "Immune", crit: false});
        self.playSound("dodge");
        return;
    }

    if(debuff.stacked()) debuff.stacks=1;
    debuff.caster=caster;
    debuff.left=debuff.duration();

    for(var i=0;i<self.debuffs.length;i++){
        if(self.debuffs[i].name===debuff.name && self.debuffs[i].caster===caster){
            if(debuff.stacked()) {
                if(self.debuffs[i].stacks<self.debuffs[i].maxStacks()) self.debuffs[i].stacks++;
                self.debuffs[i].apply(self, enemyTeam, myTeam); //��� ������� �������� �������
            }
            self.debuffs[i].left=debuff.duration();
            return;
        }
    }
    self.debuffs.push(debuff);
    debuff.apply(self, enemyTeam, myTeam); //��� ������� �������� �������
};

//���������� �������� �� ����������� ��� � ��� � ��� ������ left
Character.prototype.updateMods = function(myTeam, enemyTeam) {
    var self = this;

    for(var i=0; i<self.buffs.length; i++){
        if(self.buffs[i].onlyStat()) {
            self.buffs[i].apply(self, myTeam, enemyTeam);
        }
    }

    for(i=0; i<self.debuffs.length; i++){
        if(self.debuffs[i].onlyStat()) {
            self.debuffs[i].apply(self, myTeam, enemyTeam);
        }
    }
};

//���������� ��������
Character.prototype.applyEffects = function(myTeam, enemyTeam) {
    var self = this;
    var buffsForRemove = [];
    var debuffsForRemove = [];

    self.battleTextBuffer = []; //������� �����, �.�. � �� ������ ���� ����� ����� ����������� �����

    for(var i=0; i<self.buffs.length; i++){
        if(!self.buffs[i].infinite()) {
            self.buffs[i].left--;
            if (self.buffs[i].left < 1) {
                buffsForRemove.push(i);
            }
            else {
                self.buffs[i].apply(self, myTeam, enemyTeam);
            }
        }
        else {
            self.buffs[i].apply(self, myTeam, enemyTeam);
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
                self.debuffs[i].apply(self, myTeam, enemyTeam);
            }
        }
        else {
            self.debuffs[i].apply(self, myTeam, enemyTeam);
        }
    }

    for(i=0;i<debuffsForRemove.length;i++){
        self.debuffs.splice(debuffsForRemove[i], 1);
    }
};

//������� ������� � ������ ��������� �������
Character.prototype.removeRandomBuff = function(myTeam, enemyTeam) {
    var self = this;

    if(self.buffs.length>0){
        var removableBuffIndex = randomService.randomInt(0, self.buffs.length-1);
        if(self.buffs[removableBuffIndex].stacked()){
            if(self.buffs[removableBuffIndex].stacks===1){
                self.buffs.splice(removableBuffIndex,1);
            }
            else {
                self.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            self.buffs.splice(removableBuffIndex,1);
        }

        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar();
    }
};

//������� ������� � ������ ��������� �������
Character.prototype.removeRandomDebuff = function(myTeam, enemyTeam) {
    var self = this;

    if(self.debuffs.length>0){
        var removableDebuffIndex = randomService.randomInt(0, self.debuffs.length-1);
        if(self.debuffs[removableDebuffIndex].stacked()){
            if(self.debuffs[removableDebuffIndex].stacks===1){
                self.debuffs.splice(removableDebuffIndex,1);
            }
            else {
                self.debuffs[removableDebuffIndex].stacks--;
            }
        }
        else {
            self.debuffs.splice(removableDebuffIndex,1);
        }

        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar();
    }
};

//������� ������� � ������ ��� �������
Character.prototype.removeAllDebuffs = function(myTeam, enemyTeam) {
    var self = this;

    if(self.debuffs.length>0){
        self.debuffs=[];
        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar();
    }
};

//������� ������� � ������ ��������� ����
Character.prototype.removeRandomDOT = function(myTeam, enemyTeam) {
    var self = this;

    if(self.debuffs.length>0){
        var DOTS = [];
        for(var i=0;i<self.debuffs.length;i++){
            if(!self.debuffs[i].onlyStat()) DOTS.push({index: i, dot: self.debuffs[i]});
        }

        if(DOTS.length>0){
            var removableDOTIndex = randomService.randomInt(0, DOTS.length-1);
            var removableDebuffIndex = DOTS[removableDOTIndex].index;
            if(self.debuffs[removableDebuffIndex].stacked()){
                if(self.debuffs[removableDebuffIndex].stacks===1){
                    self.debuffs.splice(removableDebuffIndex,1);
                }
                else {
                    self.debuffs[removableDebuffIndex].stacks--;
                }
            }
            else {
                self.debuffs.splice(removableDebuffIndex,1);
            }

            self.resetState();
            self.updateMods(myTeam, enemyTeam);
            self.calcChar();
        }
    }
};

//������� ����� � ���� ��������� �����
Character.prototype.stealRandomBuff = function(target, myTeam, enemyTeam) {
    var self = this;
    var stealedBuffName=false;

    if(target.buffs.length>0){
        var removableBuffIndex = randomService.randomInt(0, target.buffs.length-1);
        stealedBuffName = target.buffs[removableBuffIndex].name;
        if(target.buffs[removableBuffIndex].stacked()){
            if(target.buffs[removableBuffIndex].stacks===1){
                self.addBuff(effectService.effect(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), self.charName, myTeam, enemyTeam);
                target.buffs.splice(removableBuffIndex,1);
            }
            else {
                self.addBuff(effectService.effect(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), self.charName, myTeam, enemyTeam);
                target.buffs[removableBuffIndex].stacks--;
            }
        }
        else {
            //��� ��������� ������ �������� ����� �������� ������ ������� ����������� �������
            if(target.buffs[removableBuffIndex].name==="Sanctuary"){
                self.addBuff(effectService.effect(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), target.buffs[removableBuffIndex].caster, myTeam, enemyTeam);
            }
            else {
                self.addBuff(effectService.effect(target.buffs[removableBuffIndex].name, target.buffs[removableBuffIndex].variant), self.charName, myTeam, enemyTeam);
            }
            target.buffs.splice(removableBuffIndex,1);
        }

        //��������� ������� �� ����
        target.resetState();
        target.updateMods(myTeam, enemyTeam);
        target.calcChar();

        //��������� ������� �� ����
        self.resetState();
        self.updateMods(myTeam, enemyTeam);
        self.calcChar();
    }
    return stealedBuffName;
};

//������� ������������ �����, ����� ���� �� �������� ��������� ������ �������
Character.prototype.addEffectFromEffects = function(name, variant) {
    return effectService.effect(name, variant);
};

//����� �� ��������� ���������
Character.prototype.canMove = function(){
    var self = this;
    if(self.immobilized){ //���� ����������
        return false;
    }
    else if((self.curEnergy-self.moveCost)<0){ //���� �� ������ �������
        return false;
    }
    return true;
};

//������� ��������� �����
Character.prototype.takeDamage = function(value, caster, ability, canBlock, canDodge, isCritical, myTeam, enemyTeam){
    var self = this;
    var blockedDamage = 0;
    var str = "";

    if(value===0) {
        self.logBuffer.push(self.charName + " didn't take damage from '" + ability.name + "' of " + caster.charName + ", because immunity.");
        self.battleTextBuffer.push({type: "other", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: "Immune", crit: false});
        self.playSound("dodge");
        return false;
    }

    if(canDodge){
        if(self.checkDodge()){
            self.logBuffer.push(self.charName + " dodged from '"+ability.name+"' of "+caster.charName);
            self.playSound("dodge");
            self.battleTextBuffer.push({type: "other", icon: ability.icon, color: getAbilityColor(ability.role), caster: caster.charName, text: "Dodge", crit: false});
            return false;
        }
    }

    //�������� �� Sanctuary
    for(var i=0;i<self.buffs.length;i++){
        if(self.buffs[i].name==="Sanctuary") {
            var sanctBuff=self.buffs[i];
            var sanctValue = value*sanctBuff.variant*0.15;
            value-=sanctValue;
            for(var j=0;j<enemyTeam.length;j++){
                if(enemyTeam[j].charName===sanctBuff.caster && !enemyTeam[j].isDead && enemyTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    var sanctCaster = enemyTeam[j];
                    sanctCaster.takeDamage(sanctValue, caster, {name: ability.name+" (Sanctuary)", icon: ability.icon, role: ability.role}, canBlock, canDodge, isCritical, myTeam, enemyTeam);
                }
            }
            //�� ������ ������ ���������, ����� ��� ��� �������
            for(j=0;j<myTeam.length;j++){
                if(myTeam[j].charName===sanctBuff.caster && !myTeam[j].isDead && myTeam[j].findEffect("Sanctuary")===-1) { //�� ��������� ����������� �������� ������ ���������� ����� �� ����, � ���� ���� ���� Sanctuary
                    sanctCaster = myTeam[j];
                    sanctCaster.takeDamage(sanctValue, caster, {name: ability.name+" (Sanctuary)", icon: ability.icon, role: ability.role}, canBlock, canDodge, isCritical, enemyTeam, myTeam);
                }
            }
        }
    }

    //�������� �� Fight Fire With Fire
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
            self.playSound("block");
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

    if(self.curHealth<=0){ //������
        self.curHealth=0;
        self.buffs=[];
        self.debuffs=[];
        self.isDead=true;
        self.portrait = "./images/assets/img/portraits/death.jpg";
        self.logBuffer.push(self.charName + " is dead");
        self.playSound("death");
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

    if(self.charName===caster.charName){
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

//������� ��������� �������
Character.prototype.takeEnergy = function(value, caster, ability, isCritical){
    var self = this;
    var str = "";

    value=Math.round(value);

    if(self.curEnergy+value>=self.maxEnergy) self.curEnergy=self.maxEnergy;
    else self.curEnergy += value;

    if(self.charName===caster.charName){
        str+=self.charName + " restore "+value;
        str+=" energy with '"+ability+"'";
    }
    else {
        str+=self.charName + " restore "+value;
        str+=" energy with '"+ability+"' used by "+caster.charName;
    }
    self.logBuffer.push(str);
};

//������� ��������� ����
Character.prototype.takeMana = function(value, caster, ability, isCritical){
    var self = this;
    var str = "";

    value=Math.round(value);

    if(self.curMana+value>=self.maxMana) self.curMana=self.maxMana;
    else self.curMana += value;

    if(self.charName===caster.charName){
        str+=self.charName + " restore "+value;
        str+=" mana with '"+ability+"'";
    }
    else {
        str+=self.charName + " restore "+value;
        str+=" mana with '"+ability+"' used by "+caster.charName;
    }
    self.logBuffer.push(str);
};

//������� ����� �������
Character.prototype.spendEnergy = function(value) {
    var self=this;
    if(self.checkLuck()){
        self.logBuffer.push(self.charName+" is very lucky and save his energy");
        self.playSound("luck");
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
Character.prototype.spendMana = function(value) {
    var self=this;
    if(self.clearCast){
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
        self.calcChar();
    }
};

//������� ��������� ����� ��������, ���� �������� ������� ����
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
        self.calcChar();
    }
};

//������� ��������� ����� ��������, ���� �������� ��������
Character.prototype.afterMiss = function (target, ability, myTeam, enemyTeam, doNotLog) {
    var self=this;
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    self.playSound("miss");
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
        self.calcChar();
    }
};

//������� ��������� ����� ��������, ���� �������� ����������� ����������
Character.prototype.afterCast = function (castedSpell, myTeam, enemyTeam) {
    var self=this;
    var buffsForRemove=[];
    var debuffsForRemove=[];
    var currentEffect;

    currentEffect = self.findEffect("Powerslave");
    if(currentEffect>-1 && castedSpell!=="Powerslave" && castedSpell!=="Lets Me Take It_Powerslave"){
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
        self.calcChar();
    }
};

//������� ������� ��� ������� ���������� ���������
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
        self.calcChar();
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
    var self=this;
    return (Math.random()<=(self.initiative*0.0001));
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

//����� ���� ������ � �������� �������
Character.prototype.findNearestPoints = function(position, rad){
    var points = [];
    for(var i=-rad;i<=rad;i++){
        if(position.x+i>=0 && position.x+i<=9) {
            for(var j=-rad;j<=rad;j++){
                if(position.y+j>=0 && position.y+j<=9){
                    points[points.length] = {x: position.x+i, y: position.y+j};
                }
            }
        }
    }
    return points;
};

//�������� �� ������� ��������� ��� ����������� �� ���� �����
Character.prototype.checkTile = function(position, myTeam, enemyTeam, skipInvisible) {
    var self = this;
    var queue = myTeam.concat(enemyTeam);
    var map = arenaService.getMap();
    for(var i=0;i<queue.length;i++){
        if(queue[i].position.x==position.x &&
            queue[i].position.y==position.y &&
            !queue[i].isDead)
        {
            if(skipInvisible){ //��������� ��������� ����� ��������� ��������, ���������� ��� ����
                //���
                if(!queue[i].invisible){
                    return true;
                }
                else if(queue[i].invisible && queue[i].charName===self.charName){
                    return true;
                }
            }
            else {
                return true;
            }
        }
    }

    if(map[Math.floor(position.x+position.y*10)].wall) return true; //��������� �� �����������
    return false;
};

//����� ��������� ��� ���� ������
Character.prototype.findMoves = function(myTeam, enemyTeam, radius){
    var self = this;
    var points = self.findNearestPoints(self.position, radius);

    var availablePoints = [];
    for(var i=0;i<points.length;i++){
        if(!self.checkTile(points[i], myTeam, enemyTeam, true)){
            availablePoints[availablePoints.length]=points[i];
        }
    }
    return availablePoints;
};

//����� ������ � �������� ���������
Character.prototype.findEnemies = function(enemyTeam, range){
    var self = this;
    var points = self.findNearestPoints(self.position, range);

    var enemies = [];
    for(var i=0;i<points.length;i++){
        for(j=0;j<enemyTeam.length;j++){
            if(points[i].x==enemyTeam[j].position.x &&
                points[i].y==enemyTeam[j].position.y &&
                !enemyTeam[j].isDead &&
                !arenaService.rayTrace({x: self.position.x*32+16, y: self.position.y*32+16},{x: points[i].x*32+16, y: points[i].y*32+16})
            ){
                enemies[enemies.length]=enemyTeam[j];
            }
        }
    }
    return enemies;
};

//����� ��������� � �������� ���������
Character.prototype.findAllies = function(myTeam, range){
    var self = this;
    var points = self.findNearestPoints(self.position, range);

    var allies = [];
    for(var i=0;i<points.length;i++){
        for(j=0;j<myTeam.length;j++){
            if(points[i].x==myTeam[j].position.x &&
                points[i].y==myTeam[j].position.y &&
                !myTeam[j].isDead &&
                !arenaService.rayTrace({x: self.position.x*32+16, y: self.position.y*32+16},{x: points[i].x*32+16, y: points[i].y*32+16})
            ){
                allies[allies.length]=myTeam[j];
            }
        }
    }
    return allies;
};

//������� ����������� �������� � ���������
Character.prototype.charge = function(target, myTeam, enemyTeam) {
    var self = this;

    var points = target.findNearestPoints(target.position, 1);

    var availablePoints = [];

    //������� ���� �� ������ ����, ������ ��� �� ���� ����� ����� �������� ��� ������
    var targetEnemies = target.findEnemies(myTeam, 1);
    for(var k=0;k<targetEnemies.length;k++){
        if(targetEnemies[k].charName===self.charName){
            return true;
        }
    }

    for(var i=0;i<points.length;i++){
        if(!target.checkTile(points[i], enemyTeam, myTeam, false)){
            availablePoints[availablePoints.length]=points[i];
        }
    }
    if(availablePoints.length===0) return false;

    availablePoints.sort(function (a, b) {
        var aDistance = Math.sqrt(Math.pow(a.x-self.position.x,2)+Math.pow(a.y-self.position.y,2));
        var bDistance = Math.sqrt(Math.pow(b.x-self.position.x,2)+Math.pow(b.y-self.position.y,2));
        if (aDistance > bDistance) {
            return 1;
        }
        if (aDistance < bDistance) {
            return -1;
        }
        return 0;
    });

    self.position=availablePoints[0];
    return true;
};

//������� ������������ ��������� �� ������ �����
Character.prototype.knockBack = function(target, myTeam, enemyTeam) {
    var self = this;
    var direction = {x:0,y:0};
    var direction1 = {x:0,y:0};
    var direction2 = {x:0,y:0};
    if (self.position.x < target.position.x)
    {
        direction.x = 1;
    }
    else if (self.position.x > target.position.x)
    {
        direction.x = -1;
    }
    else
    {
        direction.x = 0;
    }

    if (self.position.y < target.position.y)
    {
        direction.y = 1;
        if (direction.x == 1)
        {
            direction1.x = 1;
            direction1.y = 0;
            direction2.x = 0;
            direction2.y = 1;
        }
        if (direction.x == -1)
        {
            direction1.x = -1;
            direction1.y = 0;
            direction2.x = 0;
            direction2.y = 1;
        }
        if (direction.x == 0)
        {
            direction1.x = 1;
            direction1.y = 1;
            direction2.x = -1;
            direction2.y = 1;
        }
    }
    else if (self.position.y > target.position.y)
    {
        direction.y = -1;
        if (direction.x == 1)
        {
            direction1.x = 0;
            direction1.y = -1;
            direction2.x = 1;
            direction2.y = 0;
        }
        if (direction.x == -1)
        {
            direction1.x = -1;
            direction1.y = 0;
            direction2.x = 0;
            direction2.y = -1;
        }
        if (direction.x == 0)
        {
            direction1.x = -1;
            direction1.y = -1;
            direction2.x = 1;
            direction2.y = -1;
        }
    }
    else
    {
        direction.y = 0;
        if (direction.x == 1)
        {
            direction1.x = 1;
            direction1.y = -1;
            direction2.x = 1;
            direction2.y = 1;
        }
        if (direction.x == -1)
        {
            direction1.x = -1;
            direction1.y = -1;
            direction2.x = -1;
            direction2.y = 1;
        }
    }

    var newPosition = {x: target.position.x + direction.x, y: target.position.y + direction.y};

    if (!target.checkTile(newPosition, enemyTeam, myTeam, false) && newPosition.x >= 0 && newPosition.x <= 9 && newPosition.y >= 0 && newPosition.y <= 9)
    {
        target.position = newPosition;
    }
    else
    {
        newPosition = {x: target.position.x + direction1.x, y: target.position.y + direction1.y};
        if (!target.checkTile(newPosition, enemyTeam, myTeam, false) && newPosition.x >= 0 && newPosition.x <= 9 && newPosition.y >= 0 && newPosition.y <= 9)
        {
            target.position = newPosition;
        }
        else
        {
            newPosition = {x: target.position.x + direction2.x, y: target.position.y + direction2.y};
            if (!target.checkTile(newPosition, enemyTeam, myTeam, false) && newPosition.x >= 0 && newPosition.x <= 9 && newPosition.y >= 0 && newPosition.y <= 9)
            {
                target.position = newPosition;
            }
        }
    }
};

//������� ������������� ���� �� ������� � ���������� ��� � �����, ����� ��������� �� ������
Character.prototype.playSound = function(sound) {
    var self = this;
    soundService.playSound(sound);
    self.soundBuffer.push(sound);
};

Character.prototype.getSize = function() {
    var self = this;
    console.log("Character "+self.charName+" length: "+byteLength(JSON.stringify(self))+" bytes");
};

//������� �������� ���� ��� ����������� �� � ����
function getAbilityColor (role) {
    switch (role) {
        case "sentinel":
            return "#f7f7f7";
            break;
        case "slayer":
            return "#ff0906";
            break;
        case "redeemer":
            return "#0055AF";
            break;
        case "ripper":
            return "#61dd45";
            break;
        case "prophet":
            return "#00b3ee";
            break;
        case "malefic":
            return "#f05800";
            break;
        case "cleric":
            return "#ffc520";
            break;
        case "heretic":
            return "#862197";
            break;
    }
}

module.exports = function(char) {
    return new Character(char);
};