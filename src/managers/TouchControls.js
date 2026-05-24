import Phaser from 'phaser';

export default class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.isMobile = this.checkIfMobile();
        this.activeControls = new Set();
        this.showControls = true;
        this.createControls();
    }

    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    createControls() {
        if (!this.showControls) return;

        this.createDpad();
        this.createActionButtons();
    }

    createDpad() {
        const dpadX = 100;
        const dpadY = this.scene.scale.height - 150;
        
        // 创建方向键背景
        this.dpadBg = this.scene.add.circle(dpadX, dpadY, 80, 0x000000, 0.5);
        this.dpadBg.setStrokeStyle(4, 0x444444);
        this.dpadBg.setDepth(100);
        
        // 创建四个方向按钮
        this.upBtn = this.createDpadButton(dpadX, dpadY - 50, '↑', 'up');
        this.downBtn = this.createDpadButton(dpadX, dpadY + 50, '↓', 'down');
        this.leftBtn = this.createDpadButton(dpadX - 50, dpadY, '←', 'left');
        this.rightBtn = this.createDpadButton(dpadX + 50, dpadY, '→', 'right');
    }

    createDpadButton(x, y, text, direction) {
        const btn = this.scene.add.rectangle(x, y, 60, 60, 0x333333, 0.8);
        btn.setStrokeStyle(3, 0x555555);
        btn.setDepth(101);
        
        const btnText = this.scene.add.text(x, y, text, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(102);
        
        btn.setInteractive({ useHandCursor: true });
        
        // 触摸和点击事件
        btn.on('pointerdown', () => {
            btn.setFillStyle(0x555555, 1);
            btn.setStrokeStyle(3, 0x888888);
            this.activeControls.add(direction);
        });
        
        btn.on('pointerup', () => {
            btn.setFillStyle(0x333333, 0.8);
            btn.setStrokeStyle(3, 0x555555);
            this.activeControls.delete(direction);
        });
        
        btn.on('pointerout', () => {
            btn.setFillStyle(0x333333, 0.8);
            btn.setStrokeStyle(3, 0x555555);
            this.activeControls.delete(direction);
        });
        
        // 触屏事件
        btn.on('touchstart', (pointer) => {
            pointer.preventDefault();
            btn.setFillStyle(0x555555, 1);
            btn.setStrokeStyle(3, 0x888888);
            this.activeControls.add(direction);
        });
        
        btn.on('touchend', (pointer) => {
            pointer.preventDefault();
            btn.setFillStyle(0x333333, 0.8);
            btn.setStrokeStyle(3, 0x555555);
            this.activeControls.delete(direction);
        });
        
        return { btn, btnText };
    }

    createActionButtons() {
        const buttonSpacing = 100;
        const startX = this.scene.scale.width - 80;
        const startY = this.scene.scale.height - 150;

        // 互动按钮
        this.createActionButton(startX, startY, '⚔️', '互动', () => this.emitAction('space'));
        
        // 菜单按钮
        this.createActionButton(startX - buttonSpacing, startY, '📋', '菜单', () => this.emitAction('esc'));
        
        // 背包按钮
        this.createActionButton(startX - buttonSpacing * 2, startY, '🎒', '背包', () => this.emitAction('inventory'));
    }

    createActionButton(x, y, icon, label, callback) {
        const btn = this.scene.add.circle(x, y, 40, 0x2d3a5c, 0.85);
        btn.setStrokeStyle(3, 0x4a5a8c);
        btn.setDepth(100);
        
        const iconText = this.scene.add.text(x, y, icon, {
            fontSize: '32px'
        }).setOrigin(0.5).setDepth(101);
        
        const labelText = this.scene.add.text(x, y + 55, label, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(100);
        
        btn.setInteractive({ useHandCursor: true });
        
        // 点击事件
        btn.on('pointerdown', () => {
            btn.setFillStyle(0x4a5a8c, 0.95);
            btn.setStrokeStyle(3, 0x6a7aac);
        });
        
        btn.on('pointerup', () => {
            btn.setFillStyle(0x2d3a5c, 0.85);
            btn.setStrokeStyle(3, 0x4a5a8c);
            callback();
        });
        
        btn.on('pointerout', () => {
            btn.setFillStyle(0x2d3a5c, 0.85);
            btn.setStrokeStyle(3, 0x4a5a8c);
        });
        
        // 触屏事件
        btn.on('touchstart', (pointer) => {
            pointer.preventDefault();
            btn.setFillStyle(0x4a5a8c, 0.95);
            btn.setStrokeStyle(3, 0x6a7aac);
        });
        
        btn.on('touchend', (pointer) => {
            pointer.preventDefault();
            btn.setFillStyle(0x2d3a5c, 0.85);
            btn.setStrokeStyle(3, 0x4a5a8c);
            callback();
        });
        
        return { btn, iconText, labelText };
    }

    emitAction(action) {
        this.scene.events.emit('touch-action', action);
    }

    getDirection() {
        const direction = { up: false, down: false, left: false, right: false };
        
        if (this.activeControls.has('up')) direction.up = true;
        if (this.activeControls.has('down')) direction.down = true;
        if (this.activeControls.has('left')) direction.left = true;
        if (this.activeControls.has('right')) direction.right = true;
        
        return direction;
    }

    destroy() {
        if (this.dpadBg) this.dpadBg.destroy();
        if (this.upBtn) this.upBtn.btn.destroy();
        if (this.downBtn) this.downBtn.btn.destroy();
        if (this.leftBtn) this.leftBtn.btn.destroy();
        if (this.rightBtn) this.rightBtn.btn.destroy();
    }
}
