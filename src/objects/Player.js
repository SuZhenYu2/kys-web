import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.setDepth(10);
        
        this.speed = 200;
        this.frozen = false;
        
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = scene.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        
        this.createGraphics();
    }

    createGraphics() {
        const graphics = this.scene.make.graphics({ add: false });
        
        graphics.fillStyle(0x4a90d9, 1);
        graphics.fillCircle(32, 32, 28);
        
        graphics.fillStyle(0xffd4a3, 1);
        graphics.fillCircle(32, 20, 12);
        
        graphics.fillStyle(0x2a2a2a, 1);
        graphics.fillCircle(28, 18, 3);
        graphics.fillCircle(36, 18, 3);
        
        graphics.fillStyle(0x6b4423, 1);
        graphics.fillRect(24, 38, 16, 20);
        
        graphics.generateTexture('player_tex', 64, 64);
        this.setTexture('player_tex');
        this.setDisplaySize(48, 48);
    }

    freeze() {
        this.frozen = true;
        this.setVelocity(0, 0);
    }

    unfreeze() {
        this.frozen = false;
    }

    update() {
        if (this.frozen) {
            return;
        }
        
        // 始终支持键盘输入
        this.handleKeyboardInput();
    }

    handleKeyboardInput() {
        let velocityX = 0;
        let velocityY = 0;
        
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            velocityX = -this.speed;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            velocityX = this.speed;
        }
        
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            velocityY = -this.speed;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            velocityY = this.speed;
        }
        
        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }
        
        this.setVelocity(velocityX, velocityY);
    }
}
