import Phaser from 'phaser';
import { getGameManager } from '../managers/GameManager.js';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('Battle');
    }

    init(data) {
        this.enemyData = data.enemy;
        this.playerData = data.player;
        this.gameManager = getGameManager();
        
        this.playerHP = this.gameManager.player.hp;
        this.playerMaxHP = this.gameManager.player.maxHP;
        this.playerMP = this.gameManager.player.mp;
        this.playerMaxMP = this.gameManager.player.maxMP;
        
        this.enemyHP = this.enemyData.hp || 50;
        this.enemyMaxHP = this.enemyHP;
        this.enemyName = this.enemyData.name || '敌人';
        this.enemyAtk = this.enemyData.attack || 10;
        
        this.turn = 'player';
        this.battleEnded = false;
        this.buffs = [];
        this.selectedSkillIndex = 0;
    }

    create() {
        this.add.rectangle(512, 384, 1024, 768, 0x2d1f1f).setOrigin(0.5);
        
        this.createBattleBackground();
        this.createPlayerSprites();
        this.createEnemySprites();
        this.createHUD();
        this.createBattleMenu();
        this.createSkillPanel();
        this.createBattleLog();
        this.createEnemyHPBar();
        
        this.updateSkillButtons();
    }

    createBattleBackground() {
        this.add.rectangle(512, 400, 800, 300, 0x1a3a1a).setOrigin(0.5);
        this.add.rectangle(512, 400, 800, 300).setStrokeStyle(3, 0x4a6a4a);
        
        for (let i = 0; i < 5; i++) {
            this.add.rectangle(100 + i * 180, 550, 30, 60, 0x204020);
        }
    }

    createPlayerSprites() {
        this.playerSprite = this.add.rectangle(250, 400, 80, 120, 0x4a90d9).setOrigin(0.5);
        this.add.text(250, 480, this.gameManager.player.name, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
    }

    createEnemySprites() {
        this.enemySprite = this.add.rectangle(774, 400, 80, 120, 0xd94a4a).setOrigin(0.5);
        this.add.text(774, 480, this.enemyName, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
    }

    createHUD() {
        this.add.text(100, 60, this.gameManager.player.name, {
            fontSize: '22px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        });
        
        this.add.text(100, 90, `等级 ${this.gameManager.player.level}`, {
            fontSize: '16px',
            color: '#888888',
            fontFamily: 'Microsoft YaHei'
        });
        
        this.createHPBar(100, 130, 'HP', this.playerHP, this.playerMaxHP, '#4a90d9', true);
        this.createMPBar(100, 165, 'MP', this.playerMP, this.playerMaxMP, '#4a90d9', true);
        
        this.add.text(700, 60, this.enemyName, {
            fontSize: '22px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
    }

    createEnemyHPBar() {
        this.enemyHPBarBg = this.add.rectangle(774, 130, 300, 30, 0x333333).setOrigin(0.5);
        this.enemyHPBarFill = this.add.rectangle(774, 130, 300, 30, 0xd94a4a).setOrigin(0.5);
        this.enemyHPBarText = this.add.text(774, 130, `${this.enemyHP}/${this.enemyMaxHP}`, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
    }

    createHPBar(x, y, label, current, max, color, isPlayer = false) {
        if (isPlayer) {
            this.playerHPBarBg = this.add.rectangle(x, y, 300, 30, 0x333333).setOrigin(0, 0.5);
            this.playerHPBarFill = this.add.rectangle(x, y, 300, 30, color).setOrigin(0, 0.5);
            this.playerHPBarText = this.add.text(x + 150, y, `${current}/${max}`, {
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);
        }
    }

    createMPBar(x, y, label, current, max, color, isPlayer = false) {
        if (isPlayer) {
            this.playerMPBarBg = this.add.rectangle(x, y, 300, 25, 0x333333).setOrigin(0, 0.5);
            this.playerMPBarFill = this.add.rectangle(x, y, 300, 25, color).setOrigin(0, 0.5);
            this.playerMPBarText = this.add.text(x + 150, y, `${current}/${max}`, {
                fontSize: '14px',
                color: '#ffffff',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5);
        }
    }

    updateHPBars() {
        const hpRatio = Math.max(0, this.playerHP / this.playerMaxHP);
        this.playerHPBarFill.setScale(hpRatio, 1);
        this.playerHPBarText.setText(`${Math.max(0, this.playerHP)}/${this.playerMaxHP}`);
        
        const enemyHPRatio = Math.max(0, this.enemyHP / this.enemyMaxHP);
        this.enemyHPBarFill.setScale(enemyHPRatio, 1);
        this.enemyHPBarText.setText(`${Math.max(0, this.enemyHP)}/${this.enemyMaxHP}`);
    }

    updateMPBars() {
        const mpRatio = Math.max(0, this.playerMP / this.playerMaxMP);
        this.playerMPBarFill.setScale(mpRatio, 1);
        this.playerMPBarText.setText(`${Math.max(0, this.playerMP)}/${this.playerMaxMP}`);
    }

    createBattleMenu() {
        this.menuContainer = this.add.container(512, 620);
        
        this.add.text(-350, -40, '战斗选项', {
            fontSize: '18px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        });
        
        this.createMenuButton('武功 [1]', -250, 0, () => this.showSkillPanel());
        this.createMenuButton('物品 [2]', -125, 0, () => this.showItemPanel());
        this.createMenuButton('攻击 [3]', 0, 0, () => this.playerBasicAttack());
        this.createMenuButton('逃跑 [4]', 125, 0, () => this.tryEscape());
    }

    createMenuButton(text, x, y, callback) {
        const button = this.add.text(x, y, text, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#2d3a5c',
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: '#4a5a8c' });
        });
        
        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: '#2d3a5c' });
        });
        
        button.on('pointerdown', callback);
        
        this.menuContainer.add(button);
        return button;
    }

    createSkillPanel() {
        this.skillPanel = this.add.container(512, 384).setVisible(false);
        
        const bg = this.add.rectangle(0, 0, 600, 450, 0x1a2a4a, 0.98);
        bg.setStrokeStyle(3, 0xffd700);
        
        this.add.text(0, -200, '选择武功', {
            fontSize: '28px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.add.text(0, -170, '按数字键 1-4 选择，空格或点击使用', {
            fontSize: '14px',
            color: '#888888',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.skillButtons = [];
        this.skillButtonTexts = [];
        
        const startY = -120;
        for (let i = 0; i < 4; i++) {
            const skillBtn = this.add.container(0, startY + i * 70);
            
            const bg = this.add.rectangle(0, 0, 500, 60, 0x2d3a5c, 0.8);
            bg.setStrokeStyle(1, 0x4a5a8c);
            
            const nameText = this.add.text(-220, 0, '', {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0, 0.5);
            
            const infoText = this.add.text(100, 0, '', {
                fontSize: '16px',
                color: '#888888',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0, 0.5);
            
            const costText = this.add.text(200, 0, '', {
                fontSize: '16px',
                color: '#6666ff',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0, 0.5);
            
            skillBtn.add([bg, nameText, infoText, costText]);
            this.skillPanel.add(skillBtn);
            
            this.skillButtons.push(skillBtn);
            this.skillButtonTexts.push({ bg, nameText, infoText, costText });
            
            skillBtn.setSize(500, 60);
            skillBtn.setInteractive({ useHandCursor: true });
            
            const index = i;
            skillBtn.on('pointerdown', () => {
                this.selectAndUseSkill(index);
            });
        }
        
        this.skillPanel.add(bg);
        
        this.add.text(0, 190, '按 ESC 返回', {
            fontSize: '16px',
            color: '#888888',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
    }

    updateSkillButtons() {
        const skills = this.gameManager.player.skills;
        
        this.skillButtons.forEach((btn, i) => {
            if (i < skills.length) {
                const skill = skills[i];
                const texts = this.skillButtonTexts[i];
                
                texts.bg.setFillStyle(0x2d3a5c, 0.8);
                texts.nameText.setText(`${i + 1}. ${skill.name} Lv.${skill.level}`);
                texts.nameText.setColor(Phaser.Display.Color.HexStringToColor(skill.color).rgba);
                texts.infoText.setText(`伤害: ${skill.damage}`);
                texts.costText.setText(`${skill.mpCost}内力`);
                
                btn.setVisible(true);
            } else {
                btn.setVisible(false);
            }
        });
    }

    showSkillPanel() {
        if (this.turn !== 'player' || this.battleEnded) return;
        
        this.updateSkillButtons();
        this.skillPanel.setVisible(true);
        this.selectedSkillIndex = 0;
        this.highlightSelectedSkill();
    }

    hideSkillPanel() {
        this.skillPanel.setVisible(false);
    }

    highlightSelectedSkill() {
        this.skillButtonTexts.forEach((texts, i) => {
            if (i === this.selectedSkillIndex) {
                texts.bg.setFillStyle(0x5a6a9c, 0.8);
                texts.bg.setStrokeStyle(2, 0xffd700);
            } else {
                texts.bg.setFillStyle(0x2d3a5c, 0.8);
                texts.bg.setStrokeStyle(1, 0x4a5a8c);
            }
        });
    }

    selectAndUseSkill(index) {
        const skills = this.gameManager.player.skills;
        if (index >= skills.length) return;
        
        const skill = skills[index];
        
        if (this.playerMP < skill.mpCost) {
            this.addBattleLog(`内力不足，无法使用 ${skill.name}！`);
            return;
        }
        
        this.useSkill(skill);
    }

    useSkill(skill) {
        if (this.turn !== 'player' || this.battleEnded) return;
        
        this.playerMP -= skill.mpCost;
        this.updateMPBars();
        
        this.addBattleLog(`你施展了「${skill.name}」！`);
        
        let damage = this.gameManager.calculateDamage(skill, this.enemyData.attack || 10);
        
        if (skill.type === 'heal') {
            const healAmount = Math.abs(skill.damage);
            this.playerHP = Math.min(this.playerMaxHP, this.playerHP + healAmount);
            this.addBattleLog(`恢复了 ${healAmount} 点生命！`);
            this.updateHPBars();
        } else if (skill.type === 'buff') {
            this.applyBuff(skill);
            damage = Math.floor(damage * 0.5);
            this.enemyHP -= damage;
            this.addBattleLog(`造成了 ${damage} 点伤害！并获得增益效果！`);
        } else {
            this.enemyHP -= damage;
            this.addBattleLog(`造成了 ${damage} 点伤害！`);
        }
        
        if (skill.effect && skill.effect.type === 'poison') {
            this.enemyPoisonTurns = skill.effect.duration;
            this.addBattleLog(`${this.enemyName} 中毒了！`);
        }
        
        this.animateAttack(this.playerSprite, this.enemySprite);
        this.updateHPBars();
        
        if (this.enemyHP <= 0) {
            this.endBattle(true);
        } else {
            this.turn = 'enemy';
            this.time.delayedCall(1000, () => this.enemyTurn());
        }
    }

    applyBuff(skill) {
        const buff = {
            name: skill.name,
            type: skill.effect.type,
            value: skill.effect.value,
            duration: skill.effect.duration,
            turnsRemaining: skill.effect.duration
        };
        
        this.buffs.push(buff);
        
        switch (buff.type) {
            case 'attack_boost':
                this.buffAttack = buff.value;
                break;
            case 'defense_boost':
                this.buffDefense = buff.value;
                break;
            case 'speed_boost':
                this.buffSpeed = buff.value;
                break;
        }
    }

    processBuffs() {
        this.buffs = this.buffs.filter(buff => {
            if (buff.type === 'poison') {
                const poisonDamage = buff.value;
                this.playerHP -= poisonDamage;
                this.addBattleLog(`中毒效果造成了 ${poisonDamage} 点伤害！`);
                this.updateHPBars();
            }
            
            buff.turnsRemaining--;
            
            if (buff.turnsRemaining <= 0) {
                switch (buff.type) {
                    case 'attack_boost':
                        this.buffAttack = 0;
                        break;
                    case 'defense_boost':
                        this.buffDefense = 0;
                        break;
                    case 'speed_boost':
                        this.buffSpeed = 0;
                        break;
                }
                this.addBattleLog(`${buff.name} 效果消失了`);
                return false;
            }
            
            return true;
        });
    }

    showItemPanel() {
        if (this.turn !== 'player' || this.battleEnded) return;
        
        this.addBattleLog('战斗中物品系统开发中...');
    }

    playerBasicAttack() {
        if (this.turn !== 'player' || this.battleEnded) return;
        
        const basicAttack = this.gameManager.player.skills.find(s => s.id === 'basicAttack');
        if (basicAttack) {
            this.useSkill(basicAttack);
        } else {
            const damage = this.gameManager.player.attack;
            this.enemyHP -= damage;
            this.addBattleLog(`你发动攻击，造成 ${damage} 点伤害！`);
            
            this.animateAttack(this.playerSprite, this.enemySprite);
            this.updateHPBars();
            
            if (this.enemyHP <= 0) {
                this.endBattle(true);
            } else {
                this.turn = 'enemy';
                this.time.delayedCall(1000, () => this.enemyTurn());
            }
        }
    }

    tryEscape() {
        if (this.turn !== 'player' || this.battleEnded) return;
        
        const escapeChance = Math.random();
        if (escapeChance > 0.4) {
            this.addBattleLog('逃跑成功！');
            this.time.delayedCall(1000, () => this.endBattle(false, true));
        } else {
            this.addBattleLog('逃跑失败！');
            this.turn = 'enemy';
            this.time.delayedCall(1000, () => this.enemyTurn());
        }
    }

    enemyTurn() {
        if (this.battleEnded) return;
        
        this.processBuffs();
        
        if (this.playerHP <= 0) {
            this.endBattle(false);
            return;
        }
        
        const damage = Phaser.Math.Between(this.enemyAtk - 5, this.enemyAtk + 5);
        const finalDamage = Math.max(1, damage - this.gameManager.player.defense - (this.buffDefense || 0));
        
        this.playerHP -= finalDamage;
        this.addBattleLog(`${this.enemyName} 发动攻击，造成 ${finalDamage} 点伤害！`);
        
        this.animateAttack(this.enemySprite, this.playerSprite);
        this.updateHPBars();
        
        if (this.playerHP <= 0) {
            this.endBattle(false);
        } else {
            this.turn = 'player';
        }
    }

    animateAttack(attacker, target) {
        this.tweens.add({
            targets: attacker,
            x: attacker.x + (target.x > attacker.x ? 80 : -80),
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });
        
        this.tweens.add({
            targets: target,
            alpha: 0.3,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
    }

    createBattleLog() {
        this.battleLog = [];
        this.battleLogText = this.add.text(100, 550, '', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 824 }
        });
    }

    addBattleLog(text) {
        this.battleLog.push(text);
        if (this.battleLog.length > 4) {
            this.battleLog.shift();
        }
        this.battleLogText.setText(this.battleLog.join('\n'));
    }

    endBattle(victory, escaped = false) {
        this.battleEnded = true;
        this.hideSkillPanel();
        
        if (victory) {
            const expGain = Math.floor(this.enemyMaxHP * 2);
            const goldGain = Math.floor(this.enemyMaxHP);
            
            this.addBattleLog(`战斗胜利！击败了 ${this.enemyName}！`);
            this.addBattleLog(`获得 ${expGain} 点经验，${goldGain} 两银子`);
            
            const expResult = this.gameManager.gainExp(expGain);
            this.gameManager.player.gold += goldGain;
            
            if (expResult.levelUps > 0) {
                this.addBattleLog(`升级了！现在是 ${this.gameManager.player.level} 级！`);
            }
            
            this.gameManager.player.hp = this.playerHP;
            this.gameManager.player.mp = this.playerMP;
            
        } else if (escaped) {
            this.addBattleLog('成功逃离战斗！');
        } else {
            this.addBattleLog('战斗失败...');
        }
        
        this.time.delayedCall(2000, () => {
            this.scene.stop('Battle');
            this.scene.resume('Game');
            this.scene.get('Game').inBattle = false;
        });
    }

    update() {
        this.input.keyboard.on('keydown-ONE', () => {
            if (this.skillPanel.visible) {
                this.selectedSkillIndex = 0;
                this.highlightSelectedSkill();
            }
        });
        
        this.input.keyboard.on('keydown-TWO', () => {
            if (this.skillPanel.visible) {
                this.selectedSkillIndex = 1;
                this.highlightSelectedSkill();
            }
        });
        
        this.input.keyboard.on('keydown-THREE', () => {
            if (this.skillPanel.visible) {
                this.selectedSkillIndex = 2;
                this.highlightSelectedSkill();
            }
        });
        
        this.input.keyboard.on('keydown-FOUR', () => {
            if (this.skillPanel.visible) {
                this.selectedSkillIndex = 3;
                this.highlightSelectedSkill();
            }
        });
        
        this.input.keyboard.on('keydown-SPACE', () => {
            if (this.skillPanel.visible) {
                this.selectAndUseSkill(this.selectedSkillIndex);
            }
        });
        
        this.input.keyboard.on('keydown-ESC', () => {
            if (this.skillPanel.visible) {
                this.hideSkillPanel();
            }
        });
        
        this.input.keyboard.on('keydown-ONE', () => this.showSkillPanel());
        this.input.keyboard.on('keydown-TWO', () => this.showItemPanel());
        this.input.keyboard.on('keydown-THREE', () => this.playerBasicAttack());
        this.input.keyboard.on('keydown-FOUR', () => this.tryEscape());
    }
}
