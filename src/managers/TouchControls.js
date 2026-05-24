import Phaser from 'phaser';

export default class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.isMobile = this.checkIfMobile();
        this.activeControls = new Set();
        // 始终显示控件，方便测试
        this.showControls = true;
        this.createControls();
    }

    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    createControls() {
        if (!this.showControls) return;

        this.createJoystick();
        this.createActionButtons();
    }

    createJoystick() {
        const joystickX = 120;
        const joystickY = this.scene.scale.height - 120;
        
        // 创建摇杆背景
        this.joystickBg = this.scene.add.circle(joystickX, joystickY, 70, 0x222222, 0.7);
        this.joystickBg.setStrokeStyle(4, 0x444444);
        this.joystickBg.setDepth(100);
        
        // 创建摇杆中心点
        this.joystickStick = this.scene.add.circle(joystickX, joystickY, 40, 0x4a90d9, 0.8);
        this.joystickStick.setStrokeStyle(3, 0x6ab0ff);
        this.joystickStick.setDepth(101);
        
        this.joystickActive = false;
        this.joystickOriginX = joystickX;
        this.joystickOriginY = joystickY;
        
        // 设置可交互
        this.joystickBg.setInteractive({ useHandCursor: true });
        this.joystickStick.setInteractive({ useHandCursor: true, hitArea: new Phaser.Geom.Circle(0, 0, 40), hitAreaCallback: Phaser.Geom.Circle.Contains });
        
        // 绑定事件
        this.joystickBg.on('pointerdown', (pointer) => this.onJoystickDown(pointer));
        this.joystickStick.on('pointerdown', (pointer) => this.onJoystickDown(pointer));
        
        this.scene.input.on('pointermove', (pointer) => this.onJoystickMove(pointer));
        this.scene.input.on('pointerup', () => this.onJoystickUp());
    }

    onJoystickDown(pointer) {
        this.joystickActive = true;
        this.onJoystickMove(pointer);
        this.joystickStick.setFillStyle(0x6ab0ff, 0.9);
    }

    onJoystickMove(pointer) {
        if (!this.joystickActive) return;
        
        // 计算相对于摇杆原点的位置
        let dx = pointer.x - this.joystickOriginX;
        let dy = pointer.y - this.joystickOriginY;
        
        // 限制最大距离
        const maxDistance = 50;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > maxDistance) {
            const ratio = maxDistance / distance;
            dx *= ratio;
            dy *= ratio;
        }
        
        // 移动摇杆
        this.joystickStick.x = this.joystickOriginX + dx;
        this.joystickStick.y = this.joystickOriginY + dy;
        
        // 处理方向输入
        this.handleJoystickInput(dx, dy);
    }

    onJoystickUp() {
        this.joystickActive = false;
        this.joystickStick.x = this.joystickOriginX;
        this.joystickStick.y = this.joystickOriginY;
        this.joystickStick.setFillStyle(0x4a90d9, 0.8);
        this.clearDirectionControls();
    }

    handleJoystickInput(dx, dy) {
        const threshold = 15;
        
        this.clearDirectionControls();

        if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
            const angle = Math.atan2(dy, dx);
            const degree = (angle * 180 / Math.PI + 360) % 360;

            if (degree >= 315 || degree < 45) {
                this.activeControls.add('right');
            } else if (degree >= 45 && degree < 135) {
                this.activeControls.add('down');
            } else if (degree >= 135 && degree < 225) {
                this.activeControls.add('left');
            } else if (degree >= 225 && degree < 315) {
                this.activeControls.add('up');
            }
        }
    }

    clearDirectionControls() {
        this.activeControls.delete('up');
        this.activeControls.delete('down');
        this.activeControls.delete('left');
        this.activeControls.delete('right');
    }

    createActionButtons() {
        const buttonSpacing = 90;
        const startX = this.scene.scale.width - 80;
        const startY = this.scene.scale.height - 150;

        this.createActionButton(startX, startY, '⚔️', '互动', () => this.emitAction('space'));
        this.createActionButton(startX - buttonSpacing, startY, '📋', '菜单', () => this.emitAction('esc'));
        this.createActionButton(startX - buttonSpacing * 2, startY, '🎒', '背包', () => this.emitAction('inventory'));
    }

    createActionButton(x, y, icon, label, callback) {
        // 按钮背景
        const btn = this.scene.add.circle(x, y, 38, 0x2d3a5c, 0.85);
        btn.setStrokeStyle(3, 0x4a5a8c);
        btn.setDepth(100);
        
        // 按钮图标
        const iconText = this.scene.add.text(x, y, icon, {
            fontSize: '28px'
        }).setOrigin(0.5).setDepth(101);
        
        // 按钮标签
        const labelText = this.scene.add.text(x, y + 50, label, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(100);
        
        // 设置可交互
        btn.setInteractive({ useHandCursor: true });
        
        // 按钮事件
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
        
        // 为触屏设备添加 touch 事件
        btn.on('touchstart', () => {
            btn.setFillStyle(0x4a5a8c, 0.95);
            btn.setStrokeStyle(3, 0x6a7aac);
        });
        
        btn.on('touchend', () => {
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
        if (this.joystickBg) this.joystickBg.destroy();
        if (this.joystickStick) this.joystickStick.destroy();
    }
}
