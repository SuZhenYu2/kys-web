import Phaser from 'phaser';

export default class TouchControls {
    constructor(scene) {
        this.scene = scene;
        this.isMobile = this.checkIfMobile();
        this.activeControls = new Set();
        this.createControls();
    }

    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    createControls() {
        if (!this.isMobile) return;

        this.createJoystick();
        this.createActionButtons();
    }

    createJoystick() {
        const joystickContainer = this.scene.add.container(120, this.scene.scale.height - 120);
        
        const bg = this.scene.add.circle(0, 0, 80, 0x222222, 0.6);
        bg.setStrokeStyle(3, 0x444444);
        
        const stick = this.scene.add.circle(0, 0, 40, 0x444444, 0.8);
        stick.setStrokeStyle(2, 0x666666);
        
        joystickContainer.add([bg, stick]);
        joystickContainer.setDepth(100);
        
        this.joystickBg = bg;
        this.joystickStick = stick;
        this.joystickContainer = joystickContainer;
        this.joystickActive = false;
        this.joystickInitialX = 0;
        this.joystickInitialY = 0;

        stick.setInteractive({ useHandCursor: true, draggable: true, hitArea: new Phaser.Geom.Circle(0, 0, 40), hitAreaCallback: Phaser.Geom.Circle.Contains });

        this.scene.input.setDraggable(stick);

        this.scene.input.on('dragstart', (pointer, gameObject) => {
            if (gameObject === stick) {
                this.joystickActive = true;
                this.joystickInitialX = pointer.x;
                this.joystickInitialY = pointer.y;
                gameObject.setFillStyle(0x555555, 0.9);
            }
        });

        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if (gameObject === stick) {
                const dx = dragX - joystickContainer.x;
                const dy = dragY - joystickContainer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 60;

                if (distance > maxDistance) {
                    const ratio = maxDistance / distance;
                    dragX = joystickContainer.x + dx * ratio;
                    dragY = joystickContainer.y + dy * ratio;
                }

                gameObject.x = dragX;
                gameObject.y = dragY;

                this.handleJoystickInput(dragX - joystickContainer.x, dragY - joystickContainer.y);
            }
        });

        this.scene.input.on('dragend', (pointer, gameObject) => {
            if (gameObject === stick) {
                this.joystickActive = false;
                this.joystickStick.x = 0;
                this.joystickStick.y = 0;
                this.joystickStick.setFillStyle(0x444444, 0.8);
                this.clearDirectionControls();
            }
        });
    }

    handleJoystickInput(dx, dy) {
        const threshold = 20;
        
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
        const buttonSpacing = 80;
        const startX = this.scene.scale.width - 80;
        const startY = this.scene.scale.height - 200;

        this.spaceBtn = this.createButton(startX, startY, '⚔️', () => this.emitAction('space'));
        this.spaceBtn.label = this.scene.add.text(startX, startY + 50, '互动', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(100);

        this.menuBtn = this.createButton(startX - buttonSpacing, startY, '📋', () => this.emitAction('esc'));
        this.menuBtn.label = this.scene.add.text(startX - buttonSpacing, startY + 50, '菜单', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(100);

        this.inventoryBtn = this.createButton(startX - buttonSpacing * 2, startY, '🎒', () => this.emitAction('inventory'));
        this.inventoryBtn.label = this.scene.add.text(startX - buttonSpacing * 2, startY + 50, '背包', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(100);
    }

    createButton(x, y, text, callback) {
        const btn = this.scene.add.circle(x, y, 35, 0x333333, 0.8);
        btn.setStrokeStyle(3, 0x555555);
        
        const btnText = this.scene.add.text(x, y, text, {
            fontSize: '28px'
        }).setOrigin(0.5);
        
        const container = this.scene.add.container(0, 0, [btn, btnText]);
        container.setDepth(100);
        
        btn.setInteractive({ useHandCursor: true });
        
        btn.on('pointerdown', () => {
            btn.setFillStyle(0x555555, 0.9);
            btn.setStrokeStyle(3, 0x777777);
            callback();
        });
        
        btn.on('pointerup', () => {
            btn.setFillStyle(0x333333, 0.8);
            btn.setStrokeStyle(3, 0x555555);
        });
        
        btn.on('pointerout', () => {
            btn.setFillStyle(0x333333, 0.8);
            btn.setStrokeStyle(3, 0x555555);
        });
        
        return { btn, btnText };
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
        if (this.joystickContainer) this.joystickContainer.destroy();
        if (this.spaceBtn) {
            this.spaceBtn.btn.destroy();
            this.spaceBtn.btnText.destroy();
            this.spaceBtn.label.destroy();
        }
        if (this.menuBtn) {
            this.menuBtn.btn.destroy();
            this.menuBtn.btnText.destroy();
            this.menuBtn.label.destroy();
        }
        if (this.inventoryBtn) {
            this.inventoryBtn.btn.destroy();
            this.inventoryBtn.btnText.destroy();
            this.inventoryBtn.label.destroy();
        }
    }
}
