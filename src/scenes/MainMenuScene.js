import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        this.add.rectangle(512, 384, 1024, 768, 0x1a1a2e).setOrigin(0.5);

        this.add.text(512, 200, '武侠江湖', {
            fontSize: '72px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.createMenuButton('开始游戏', 350, () => {
            this.scene.start('Game');
            this.scene.launch('UI');
        });

        this.createMenuButton('游戏说明', 450, () => {
            this.showInstructions();
        });

        this.createMenuButton('退出游戏', 550, () => {
            if (confirm('确定要退出游戏吗？')) {
                window.close();
            }
        });

        this.add.text(1024 - 20, 768 - 20, '使用 WASD/方向键 移动', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(1, 1);
    }

    createMenuButton(text, y, callback) {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const padding = isMobile ? { left: 60, right: 60, top: 25, bottom: 25 } : { left: 40, right: 40, top: 15, bottom: 15 };
        const fontSize = isMobile ? '36px' : '28px';
        
        const button = this.add.text(512, y, text, {
            fontSize: fontSize,
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#2d3a5c',
            padding: padding
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            button.setStyle({ backgroundColor: '#4a5a8c' });
        });

        button.on('pointerout', () => {
            button.setStyle({ backgroundColor: '#2d3a5c' });
        });

        button.on('pointerdown', callback);
    }

    showInstructions() {
        const instructions = this.add.container(512, 384);
        
        const bg = this.add.rectangle(0, 0, 500, 400, 0x1a2a4a, 0.95);
        bg.setStrokeStyle(2, 0xffd700);
        
        const title = this.add.text(0, -150, '游戏说明', {
            fontSize: '32px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const content = this.add.text(-220, -80, [
            '🎮 操作说明：',
            '',
            '• WASD / 方向键：移动角色',
            '• 空格键：互动/对话',
            '• ESC 键：打开菜单',
            '',
            '⚔️ 游戏目标：',
            '',
            '• 探索江湖世界',
            '• 与 NPC 对话',
            '• 与敌人战斗',
            '• 提升武功修为'
        ], {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei',
            lineSpacing: 8
        });
        
        const closeBtn = this.add.text(0, 140, '关闭', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#d94a4a',
            padding: { left: 30, right: 30, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerdown', () => {
            instructions.destroy();
        });
        
        instructions.add([bg, title, content, closeBtn]);
    }
}
