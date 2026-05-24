import Phaser from 'phaser';
import { getGameManager } from '../managers/GameManager.js';
import { touchController } from '../managers/TouchController.js';

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
        
        // 更新顶部状态栏
        touchController.updateStatusBar({
            hp: this.playerHP,
            maxHP: this.playerMaxHP,
            mp: this.playerMP,
            maxMP: this.playerMaxMP
        });
        
        // 启用战斗按钮
        touchController.setBattleMode(true);
        
        // 监听战斗按钮事件
        this.setupBattleTouchEvents();
    }

    setupBattleTouchEvents() {
        window.addEventListener('touch-action', (e) => {
            if (this.battleEnded) return;
            
            const action = e.detail.action;
            
            switch(action) {
                case 'battle-attack':
                    this.playerBasicAttack();
                    break;
                case 'battle-skill':
                    this.showSkillPanel();
                    break;
                case 'battle-item':
                    this.showItemPanel();
                    break;
                case 'battle-escape':
                    this.tryEscape();
                    break;
            }
        });
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

    createHPBar(x, y, label, current, max, color, isPlayer) {
        this.add.text(x, y, label, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        });
        
        const bgBar = this.add.rectangle(x + 40, y + 8, 200, 20, 0x333333);
        bgBar.setOrigin(0, 0.5);
        
        const hpPercent = current / max;
        const hpBar = this.add.rectangle(x + 40, y + 8, 200 * hpPercent, 20, isPlayer ? 0x4CAF50 : 0xd94a4a);
        hpBar.setOrigin(0, 0.5);
        
        const hpText = this.add.text(x + 250, y + 8, `${current}/${max}`, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        });
        hpText.setOrigin(0, 0.5);
        
        if (isPlayer) {
            this.playerHPBar = hpBar;
            this.playerHPText = hpText;
        }
    }

    createMPBar(x, y, label, current, max, color, isPlayer) {
        this.add.text(x, y, label, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        });
        
        const bgBar = this.add.rectangle(x + 40, y + 8, 200, 20, 0x333333);
        bgBar.setOrigin(0, 0.5);
        
        const mpPercent = current / max;
        const mpBar = this.add.rectangle(x + 40, y + 8, 200 * mpPercent, 20, 0x2196F3);
        mpBar.setOrigin(0, 0.5);
        
        const mpText = this.add.text(x + 250, y + 8, `${current}/${max}`, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        });
        mpText.setOrigin(0, 0.5);
        
        if (isPlayer) {
            this.playerMPBar = mpBar;
            this.playerMPText = mpText;
        }
    }

    createEnemyHPBar() {
        const x = 700;
        const y = 90;
        
        const bgBar = this.add.rectangle(x, y, 200, 20, 0x333333);
        bgBar.setOrigin(0.5, 0);
        
        const hpPercent = this.enemyHP / this.enemyMaxHP;
        const hpBar = this.add.rectangle(x - 100, y, 200 * hpPercent, 20, 0xd94a4a);
        hpBar.setOrigin(0, 0);
        
        const hpText = this.add.text(x, y + 25, `${this.enemyHP}/${this.enemyMaxHP}`, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        });
        hpText.setOrigin(0.5, 0);
        
        this.enemyHPBar = hpBar;
        this.enemyHPText = hpText;
    }

    createBattleMenu() {
        const menuContainer = this.add.container(512, 700);
        
        const bg = this.add.rectangle(0, 0, 800, 100, 0x1a1a2a, 0.95);
        bg.setStrokeStyle(2, 0x4a5a8c);
        
        const buttons = [
            { text: '[1] 武功', x: -250, action: 'skill' },
            { text: '[2] 物品', x: -80, action: 'item' },
            { text: '[3] 攻击', x: 80, action: 'attack' },
            { text: '[4] 逃跑', x: 250, action: 'escape' }
        ];
        
        this.menuButtons = [];
        
        buttons.forEach((btn, index) => {
            const btnText = this.add.text(btn.x, 0, btn.text, {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btnText.btnAction = btn.action;
            btnText.btnIndex = index;
            
            btnText.on('pointerover', () => {
                btnText.setColor('#ffd700');
            });
            
            btnText.on('pointerout', () => {
                btnText.setColor('#ffffff');
            });
            
            btnText.on('pointerdown', () => {
                this.handleMenuAction(btn.action);
            });
            
            this.menuButtons.push(btnText);
            menuContainer.add(btnText);
        });
        
        menuContainer.add(bg);
    }

    createSkillPanel() {
        this.skillPanel = this.add.container(512, 400);
        this.skillPanel.setVisible(false);
        
        const bg = this.add.rectangle(0, 0, 600, 400, 0x1a1a2a, 0.98);
        bg.setStrokeStyle(3, 0xffd700);
        this.skillPanel.add(bg);
        
        const title = this.add.text(0, -170, '选择武功', {
            fontSize: '28px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        this.skillPanel.add(title);
        
        this.skillButtons = [];
        this.skillNames = ['普通攻击'];
        
        const skills = this.gameManager.player.skills || [];
        skills.forEach((skill, index) => {
            if (!this.skillNames.includes(skill.name)) {
                this.skillNames.push(skill.name);
            }
        });
        
        this.skillNames.forEach((skillName, index) => {
            const btn = this.add.text(-200, -100 + index * 60, `[${index + 1}] ${skillName}`, {
                fontSize: '22px',
                color: '#ffffff',
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
            
            btn.skillIndex = index;
            
            btn.on('pointerover', () => {
                btn.setColor('#ffd700');
            });
            
            btn.on('pointerout', () => {
                btn.setColor('#ffffff');
            });
            
            btn.on('pointerdown', () => {
                this.selectAndUseSkill(index);
            });
            
            this.skillButtons.push(btn);
            this.skillPanel.add(btn);
        });
        
        const closeBtn = this.add.text(250, -170, '返回', {
            fontSize: '22px',
            color: '#888888',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerover', () => {
            closeBtn.setColor('#ffd700');
        });
        
        closeBtn.on('pointerout', () => {
            closeBtn.setColor('#888888');
        });
        
        closeBtn.on('pointerdown', () => {
            this.hideSkillPanel();
        });
        
        this.skillPanel.add(closeBtn);
    }

    updateSkillButtons() {
        if (this.skillButtons) {
            this.skillButtons.forEach(btn => btn.destroy());
            this.skillButtons = [];
            this.skillNames = ['普通攻击'];
            
            const skills = this.gameManager.player.skills || [];
            skills.forEach((skill, index) => {
                if (!this.skillNames.includes(skill.name)) {
                    this.skillNames.push(skill.name);
                }
            });
            
            this.skillNames.forEach((skillName, index) => {
                const btn = this.add.text(-200, -100 + index * 60, `[${index + 1}] ${skillName}`, {
                    fontSize: '22px',
                    color: '#ffffff',
                    fontFamily: 'Microsoft YaHei'
                }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
                
                btn.skillIndex = index;
                
                btn.on('pointerover', () => {
                    btn.setColor('#ffd700');
                });
                
                btn.on('pointerout', () => {
                    btn.setColor('#ffffff');
                });
                
                btn.on('pointerdown', () => {
                    this.selectAndUseSkill(index);
                });
                
                this.skillButtons.push(btn);
                this.skillPanel.add(btn);
            });
        }
    }

    createBattleLog() {
        const logContainer = this.add.container(512, 350);
        
        const bg = this.add.rectangle(0, 0, 400, 80, 0x000000, 0.7);
        logContainer.add(bg);
        
        this.logText = this.add.text(0, 0, '战斗开始！', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 380 },
            align: 'center'
        }).setOrigin(0.5);
        logContainer.add(this.logText);
        
        this.battleLogContainer = logContainer;
    }

    showSkillPanel() {
        this.skillPanel.setVisible(true);
        this.selectedSkillIndex = 0;
        this.highlightSelectedSkill();
    }

    hideSkillPanel() {
        this.skillPanel.setVisible(false);
    }

    highlightSelectedSkill() {
        this.skillButtons.forEach((btn, index) => {
            btn.setColor(index === this.selectedSkillIndex ? '#ffd700' : '#ffffff');
        });
    }

    showItemPanel() {
        this.addBattleLog('物品系统开发中...');
    }

    handleMenuAction(action) {
        if (this.battleEnded || this.turn !== 'player') return;
        
        switch(action) {
            case 'skill':
                this.showSkillPanel();
                break;
            case 'item':
                this.showItemPanel();
                break;
            case 'attack':
                this.playerBasicAttack();
                break;
            case 'escape':
                this.tryEscape();
                break;
        }
    }

    playerBasicAttack() {
        if (this.battleEnded || this.turn !== 'player') return;
        
        this.turn = 'enemy';
        this.playerAttack(this.enemyAtk);
    }

    selectAndUseSkill(index) {
        if (this.battleEnded || this.turn !== 'player') return;
        
        this.hideSkillPanel();
        this.turn = 'enemy';
        
        if (index === 0) {
            this.playerAttack(this.enemyAtk);
        } else {
            const skills = this.gameManager.player.skills || [];
            const skillIndex = index - 1;
            if (skills[skillIndex]) {
                this.addBattleLog(`${this.gameManager.player.name}使用了${skills[skillIndex].name}！`);
                this.playerAttack(Math.floor(this.enemyAtk * (1 + skills[skillIndex].damage / 100)));
            }
        }
    }

    playerAttack(damage) {
        this.tweens.add({
            targets: this.playerSprite,
            x: '+=100',
            duration: 200,
            yoyo: true,
            onComplete: () => {
                const actualDamage = Math.max(1, damage + Math.floor(Math.random() * 5) - 2);
                this.enemyHP = Math.max(0, this.enemyHP - actualDamage);
                
                this.updateEnemyHP();
                this.addBattleLog(`${this.gameManager.player.name}对${this.enemyName}造成了${actualDamage}点伤害！`);
                
                this.tweens.add({
                    targets: this.enemySprite,
                    alpha: 0.3,
                    duration: 100,
                    yoyo: true,
                    repeat: 2,
                    onComplete: () => {
                        if (this.enemyHP <= 0) {
                            this.endBattle(true);
                        } else {
                            this.enemyTurn();
                        }
                    }
                });
            }
        });
    }

    enemyTurn() {
        this.time.delayedCall(800, () => {
            if (this.battleEnded) return;
            
            this.tweens.add({
                targets: this.enemySprite,
                x: '-=100',
                duration: 200,
                yoyo: true,
                onComplete: () => {
                    const damage = Math.max(1, 15 + Math.floor(Math.random() * 10) - 5);
                    this.playerHP = Math.max(0, this.playerHP - damage);
                    
                    this.updatePlayerHP();
                    this.addBattleLog(`${this.enemyName}对${this.gameManager.player.name}造成了${damage}点伤害！`);
                    
                    this.tweens.add({
                        targets: this.playerSprite,
                        alpha: 0.3,
                        duration: 100,
                        yoyo: true,
                        repeat: 2,
                        onComplete: () => {
                            if (this.playerHP <= 0) {
                                this.endBattle(false);
                            } else {
                                this.turn = 'player';
                            }
                        }
                    });
                }
            });
        });
    }

    updatePlayerHP() {
        const hpPercent = this.playerHP / this.playerMaxHP;
        this.playerHPBar.width = 200 * hpPercent;
        this.playerHPText.text = `${this.playerHP}/${this.playerMaxHP}`;
        
        // 更新顶部状态栏
        touchController.updateStatusBar({
            hp: this.playerHP,
            maxHP: this.playerMaxHP,
            mp: this.playerMP,
            maxMP: this.playerMaxMP
        });
    }

    updateEnemyHP() {
        const hpPercent = this.enemyHP / this.enemyMaxHP;
        this.enemyHPBar.width = 200 * hpPercent;
        this.enemyHPText.text = `${this.enemyHP}/${this.enemyMaxHP}`;
    }

    addBattleLog(text) {
        this.logText.text = text;
    }

    tryEscape() {
        if (this.battleEnded || this.turn !== 'player') return;
        
        this.addBattleLog('逃跑中...');
        this.time.delayedCall(500, () => {
            this.endBattle(false, true);
        });
    }

    endBattle(victory, escaped = false) {
        this.battleEnded = true;
        
        if (victory) {
            this.addBattleLog('战斗胜利！');
            this.gameManager.player.hp = this.playerHP;
            this.gameManager.player.mp = this.playerMP;
            this.gameManager.gainExp(50);
        } else if (escaped) {
            this.addBattleLog('成功逃跑！');
            this.gameManager.player.hp = this.playerHP;
            this.gameManager.player.mp = this.playerMP;
        } else {
            this.addBattleLog('战斗失败...');
            this.gameManager.player.hp = Math.floor(this.gameManager.player.maxHP * 0.3);
            this.gameManager.player.mp = Math.floor(this.gameManager.player.maxMP * 0.3);
        }
        
        this.time.delayedCall(1500, () => {
            touchController.setBattleMode(false);
            this.scene.stop('Battle');
            this.scene.resume('Game');
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
