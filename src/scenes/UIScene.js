import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UI');
    }

    create() {
        this.createStatusBar();
        this.createMiniMap();
        this.createMenuButton();
    }

    createStatusBar() {
        this.statusBar = this.add.container(20, 20);
        
        const bg = this.add.rectangle(0, 0, 200, 120, 0x1a2a4a, 0.9);
        bg.setStrokeStyle(2, 0xffd700);
        this.statusBar.add(bg);
        
        this.add.text(10, -45, '状态', {
            fontSize: '18px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }, this.statusBar);
        
        this.hpText = this.add.text(10, -15, '生命: 100/100', {
            fontSize: '16px',
            color: '#ff6666',
            fontFamily: 'Microsoft YaHei'
        }, this.statusBar);
        
        this.mpText = this.add.text(10, 10, '内力: 50/50', {
            fontSize: '16px',
            color: '#6666ff',
            fontFamily: 'Microsoft YaHei'
        }, this.statusBar);
        
        this.levelText = this.add.text(10, 35, '等级: 1', {
            fontSize: '16px',
            color: '#ffff66',
            fontFamily: 'Microsoft YaHei'
        }, this.statusBar);
    }

    createMiniMap() {
        this.miniMap = this.add.container(1024 - 20, 20);
        
        const bg = this.add.rectangle(0, 0, 180, 135, 0x1a2a4a, 0.9);
        bg.setStrokeStyle(2, 0xffd700);
        this.miniMap.add(bg);
        this.miniMap.setOrigin(1, 0);
        
        this.miniMapPlayer = this.add.circle(0, 0, 5, 0x4a90d9);
        this.miniMap.add(this.miniMapPlayer);
        
        this.add.text(-90, -55, '小地图', {
            fontSize: '16px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }, this.miniMap).setOrigin(0.5);
    }

    createMenuButton() {
        const menuBtn = this.add.text(1024 - 100, 768 - 40, '菜单 [ESC]', {
            fontSize: '18px',
            color: '#ffffff',
            backgroundColor: '#2d3a5c',
            padding: { left: 20, right: 20, top: 8, bottom: 8 },
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(1, 1).setInteractive({ useHandCursor: true });
        
        menuBtn.on('pointerover', () => {
            menuBtn.setStyle({ backgroundColor: '#4a5a8c' });
        });
        
        menuBtn.on('pointerout', () => {
            menuBtn.setStyle({ backgroundColor: '#2d3a5c' });
        });
        
        menuBtn.on('pointerdown', () => {
            this.toggleMenu();
        });
        
        this.input.keyboard.addKey('ESC').on('down', () => {
            this.toggleMenu();
        }, this);
    }

    toggleMenu() {
        if (this.menuContainer) {
            this.menuContainer.destroy();
            this.menuContainer = null;
        } else {
            this.showInGameMenu();
        }
    }

    showInGameMenu() {
        this.menuContainer = this.add.container(512, 384);
        
        const bg = this.add.rectangle(0, 0, 400, 350, 0x1a2a4a, 0.95);
        bg.setStrokeStyle(2, 0xffd700);
        
        const title = this.add.text(0, -140, '游戏菜单', {
            fontSize: '28px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.menuContainer.add([bg, title]);
        
        this.createMenuItem('继续游戏', -60, () => {
            this.toggleMenu();
        });
        
        this.createMenuItem('状态面板', 0, () => {
            this.showStatusPanel();
        });
        
        this.createMenuItem('物品背包', 60, () => {
            this.showInventory();
        });
        
        this.createMenuItem('返回主菜单', 120, () => {
            this.scene.stop('Game');
            this.scene.stop('UI');
            this.scene.start('MainMenu');
        });
    }

    createMenuItem(text, y, callback) {
        const item = this.add.text(0, y, text, {
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#2d3a5c',
            padding: { left: 40, right: 40, top: 10, bottom: 10 },
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        item.on('pointerover', () => {
            item.setStyle({ backgroundColor: '#4a5a8c' });
        });
        
        item.on('pointerout', () => {
            item.setStyle({ backgroundColor: '#2d3a5c' });
        });
        
        item.on('pointerdown', callback);
        
        this.menuContainer.add(item);
    }

    showStatusPanel() {
        alert('状态面板开发中...\n\n生命值: 100/100\n内力: 50/50\n等级: 1\n经验: 0/100\n攻击力: 25\n防御力: 10');
    }

    showInventory() {
        alert('背包系统开发中...\n\n当前无物品');
    }

    update() {
        this.updateMiniMap();
    }

    updateMiniMap() {
        const gameScene = this.scene.get('Game');
        if (gameScene && gameScene.player) {
            const mapScale = 0.08;
            const miniX = (gameScene.player.x - 1024) * mapScale;
            const miniY = (gameScene.player.y - 768) * mapScale;
            
            this.miniMapPlayer.setPosition(
                Math.max(-80, Math.min(80, miniX)),
                Math.max(-57, Math.min(57, miniY))
            );
        }
    }
}
