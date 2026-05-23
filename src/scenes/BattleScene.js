import Phaser from 'phaser';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super('Battle');
    }

    init(data) {
        this.enemyData = data.enemy;
        this.playerData = data.player;
        
        this.playerHP = 100;
        this.playerMaxHP = 100;
        this.playerMP = 50;
        this.playerMaxMP = 50;
        
        this.enemyHP = this.enemyData.hp || 50;
        this.enemyMaxHP = this.enemyHP;
        this.enemyName = this.enemyData.name || '敌人';
        this.enemyAtk = this.enemyData.attack || 10;
        
        this.turn = 'player';
        this.battleEnded = false;
    }

    create() {
        this.add.rectangle(512, 384, 1024, 768, 0x2d1f1f).setOrigin(0.5);
        
        this.createBattleBackground();
        this.createPlayerSprites();
        this.createEnemySprites();
        this.createHUD();
        this.createBattleMenu();
        this.createBattleLog();
    }

    createBattleBackground() {
        this.add.rectangle(512, 400, 800, 300, 0x1a3a1a).setOrigin(0.5);
        this.add.rectangle(512, 400, 800, 300).setStrokeStyle(3, 0x4a6a4a);
    }

    createPlayerSprites() {
        this.playerSprite = this.add.rectangle(250, 400, 80, 120, 0x4a90d9).setOrigin(0.5);
        this.add.text(250, 480, '少侠', {
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
        this.playerHPBar = this.createHPBar(100, 100, '少侠', this.playerHP, this.playerMaxHP, '#4a90d9');
        this.enemyHPBar = this.createHPBar(600, 100, this.enemyName, this.enemyHP, this.enemyMaxHP, '#d94a4a');
    }

    createHPBar(x, y, name, hp, maxHP, color) {
        const container = this.add.container(x, y);
        
        this.add.text(0, -20, name, {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }, container);
        
        const bg = this.add.rectangle(0, 0, 300, 30, 0x333333).setOrigin(0, 0.5);
        container.add(bg);
        
        const bar = this.add.rectangle(0, 0, 300, 30, color).setOrigin(0, 0.5);
        container.add(bar);
        
        const text = this.add.text(150, 0, `${hp}/${maxHP}`, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        container.add(text);
        
        return { container, bar, text, maxHP };
    }

    updateHPBar(hpBar, hp, maxHP) {
        const ratio = Math.max(0, hp / maxHP);
        hpBar.bar.setScale(ratio, 1);
        hpBar.text.setText(`${Math.max(0, hp)}/${maxHP}`);
    }

    createBattleMenu() {
        this.battleMenu = this.add.container(512, 650);
        
        this.createMenuButton('攻击', -150, 0, () => this.playerAttack());
        this.createMenuButton('武功', -50, 0, () => this.showSkillMenu());
        this.createMenuButton('物品', 50, 0, () => this.showItemMenu());
        this.createMenuButton('逃跑', 150, 0, () => this.tryEscape());
    }

    createMenuButton(text, x, y, callback) {
        const button = this.add.text(x, y, text, {
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#2d3a5c',
            padding: { left: 25, right: 25, top: 12, bottom: 12 },
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: '#4a5a8c' });
        });
        
        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: '#2d3a5c' });
        });
        
        button.on('pointerdown', callback);
        
        this.battleMenu.add(button);
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

    playerAttack() {
        if (this.turn !== 'player' || this.battleEnded) return;
        
        const damage = Phaser.Math.Between(15, 25);
        this.enemyHP -= damage;
        this.addBattleLog(`你发动攻击，造成 ${damage} 点伤害！`);
        
        this.animateAttack(this.playerSprite, this.enemySprite);
        
        this.updateHPBar(this.enemyHPBar, this.enemyHP, this.enemyMaxHP);
        
        if (this.enemyHP <= 0) {
            this.endBattle(true);
        } else {
            this.turn = 'enemy';
            this.time.delayedCall(1000, () => this.enemyTurn());
        }
    }

    showSkillMenu() {
        if (this.turn !== 'player' || this.battleEnded) return;
        
        this.addBattleLog('武功系统开发中...');
    }

    showItemMenu() {
        if (this.turn !== 'player' || this.battleEnded) return;
        
        this.addBattleLog('物品系统开发中...');
    }

    tryEscape() {
        if (this.turn !== 'player' || this.battleEnded) return;
        
        const escapeChance = Math.random();
        if (escapeChance > 0.5) {
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
        
        const damage = Phaser.Math.Between(this.enemyAtk - 5, this.enemyAtk + 5);
        this.playerHP -= damage;
        this.addBattleLog(`${this.enemyName} 发动攻击，造成 ${damage} 点伤害！`);
        
        this.animateAttack(this.enemySprite, this.playerSprite);
        
        this.updateHPBar(this.playerHPBar, this.playerHP, this.playerMaxHP);
        
        if (this.playerHP <= 0) {
            this.endBattle(false);
        } else {
            this.turn = 'player';
        }
    }

    animateAttack(attacker, target) {
        this.tweens.add({
            targets: attacker,
            x: attacker.x + (target.x > attacker.x ? 50 : -50),
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

    endBattle(victory, escaped = false) {
        this.battleEnded = true;
        
        if (victory) {
            this.addBattleLog(`战斗胜利！击败了 ${this.enemyName}！`);
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
}
