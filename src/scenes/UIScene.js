import Phaser from 'phaser';
import { getGameManager } from '../managers/GameManager.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UI');
        this.gameManager = getGameManager();
    }

    create() {
        this.createStatusBar();
        this.createMiniMap();
        this.createMenuButton();
        this.createKeyboardShortcuts();
    }

    createStatusBar() {
        this.statusBar = this.add.container(20, 20);
        
        const bg = this.add.rectangle(0, 0, 220, 150, 0x1a2a4a, 0.9);
        bg.setStrokeStyle(2, 0xffd700);
        this.statusBar.add(bg);
        
        this.add.text(10, -65, '状态', {
            fontSize: '18px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }, this.statusBar);
        
        this.levelText = this.add.text(10, -40, '等级: 1', {
            fontSize: '16px',
            color: '#ffff66',
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
        
        this.expText = this.add.text(10, 35, '经验: 0/100', {
            fontSize: '14px',
            color: '#88ff88',
            fontFamily: 'Microsoft YaHei'
        }, this.statusBar);
        
        this.goldText = this.add.text(10, 55, '银两: 200', {
            fontSize: '14px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }, this.statusBar);
    }

    updateStatus() {
        const player = this.gameManager.player;
        
        this.levelText.setText(`等级: ${player.level}`);
        this.hpText.setText(`生命: ${player.hp}/${player.maxHP}`);
        this.mpText.setText(`内力: ${player.mp}/${player.maxMP}`);
        this.expText.setText(`经验: ${player.exp}/${player.expToNextLevel}`);
        this.goldText.setText(`银两: ${player.gold}`);
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
    }

    createKeyboardShortcuts() {
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
        
        const bg = this.add.rectangle(0, 0, 400, 450, 0x1a2a4a, 0.95);
        bg.setStrokeStyle(2, 0xffd700);
        
        const title = this.add.text(0, -200, '游戏菜单', {
            fontSize: '32px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.menuContainer.add([bg, title]);
        
        this.createMenuItem('继续游戏', -130, () => {
            this.toggleMenu();
        });
        
        this.createMenuItem('背包 [B]', -60, () => {
            this.openInventory();
        });
        
        this.createMenuItem('武功 [S]', 10, () => {
            this.openSkills();
        });
        
        this.createMenuItem('状态面板 [C]', 80, () => {
            this.showStatusPanel();
        });
        
        this.createMenuItem('游戏说明', 150, () => {
            this.showHelp();
        });
        
        this.createMenuItem('返回主菜单', 220, () => {
            this.returnToMainMenu();
        });
    }

    createMenuItem(text, y, callback) {
        const item = this.add.text(0, y, text, {
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#2d3a5c',
            padding: { left: 40, right: 40, top: 12, bottom: 12 },
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

    openInventory() {
        this.toggleMenu();
        this.scene.pause('Game');
        this.scene.launch('Inventory');
    }

    openSkills() {
        this.toggleMenu();
        this.scene.pause('Game');
        this.scene.launch('Skill');
    }

    showStatusPanel() {
        const player = this.gameManager.player;
        
        const statusText = `
═══════════════════════════════
          【角色状态】
═══════════════════════════════
姓名: ${player.name}
等级: ${player.level}
职业: ${player.class}
─────────────────────────────
生命: ${player.hp} / ${player.maxHP}
内力: ${player.mp} / ${player.maxMP}
─────────────────────────────
攻击力: ${player.attack}
防御力: ${player.defense}
速度: ${player.speed}
─────────────────────────────
经验: ${player.exp} / ${player.expToNextLevel}
银两: ${player.gold}
─────────────────────────────
已学武功: ${player.skills.length} 种
═══════════════════════════════
`;
        
        this.showInfoPanel('状态面板', statusText);
    }

    showHelp() {
        const helpText = `
═══════════════════════════════
          【游戏说明】
═══════════════════════════════
🎮 操作指南：

移动：
  • WASD / 方向键

互动：
  • 空格键 - 与 NPC 对话
  • 空格键 - 触发战斗

战斗：
  • [1] - 打开武功列表
  • [2] - 使用物品
  • [3] - 普通攻击
  • [4] - 逃跑

菜单：
  • ESC - 打开/关闭菜单
  • B - 打开背包
  • S - 打开武功面板
  • C - 查看状态

═══════════════════════════════
`;
        
        this.showInfoPanel('游戏说明', helpText);
    }

    showInfoPanel(title, content) {
        const panel = this.add.container(512, 384);
        
        const bg = this.add.rectangle(0, 0, 600, 500, 0x1a2a4a, 0.98);
        bg.setStrokeStyle(3, 0xffd700);
        
        const titleText = this.add.text(0, -220, title, {
            fontSize: '32px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const contentText = this.add.text(0, 0, content, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Consolas',
            align: 'center'
        }).setOrigin(0.5);
        
        const closeBtn = this.add.text(0, 220, '关闭', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#d94a4a',
            padding: { left: 30, right: 30, top: 10, bottom: 10 },
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerover', () => {
            closeBtn.setStyle({ backgroundColor: '#ff6b6b' });
        });
        
        closeBtn.on('pointerout', () => {
            closeBtn.setStyle({ backgroundColor: '#d94a4a' });
        });
        
        closeBtn.on('pointerdown', () => {
            panel.destroy();
        });
        
        panel.add([bg, titleText, contentText, closeBtn]);
    }

    returnToMainMenu() {
        if (confirm('确定要返回主菜单吗？当前未保存的进度将丢失。')) {
            this.scene.stop('Game');
            this.scene.stop('UI');
            this.scene.start('MainMenu');
        }
    }

    update() {
        this.updateMiniMap();
        this.updateStatus();
        
        if (this.input.keyboard.addKey('B').isDown) {
            if (!this.inventoryKeyDown) {
                this.inventoryKeyDown = true;
                this.openInventory();
            }
        } else {
            this.inventoryKeyDown = false;
        }
        
        if (this.input.keyboard.addKey('S').isDown) {
            if (!this.skillKeyDown) {
                this.skillKeyDown = true;
                this.openSkills();
            }
        } else {
            this.skillKeyDown = false;
        }
        
        if (this.input.keyboard.addKey('C').isDown) {
            if (!this.statusKeyDown) {
                this.statusKeyDown = true;
                this.showStatusPanel();
            }
        } else {
            this.statusKeyDown = false;
        }
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
