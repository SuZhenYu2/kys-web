import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, hp, attack) {
        super(scene, x, y, 'enemy');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.name = name;
        this.hp = hp;
        this.maxHp = hp;
        this.attack = attack;
        
        this.setImmovable(true);
        this.setDepth(5);
        
        this.createGraphics();
        this.createNameLabel();
        this.createPatrol();
    }

    createGraphics() {
        const graphics = this.scene.make.graphics({ add: false });
        
        graphics.fillStyle(0xd94a4a, 1);
        graphics.fillCircle(32, 32, 28);
        
        graphics.fillStyle(0xe0b0a0, 1);
        graphics.fillCircle(32, 20, 12);
        
        graphics.fillStyle(0xff0000, 1);
        graphics.fillCircle(28, 18, 3);
        graphics.fillCircle(36, 18, 3);
        
        graphics.fillStyle(0x2a2a2a, 1);
        graphics.fillRect(24, 38, 16, 20);
        
        graphics.generateTexture(`enemy_${this.name}`, 64, 64);
        this.setTexture(`enemy_${this.name}`);
        this.setDisplaySize(50, 50);
    }

    createNameLabel() {
        this.nameLabel = this.scene.add.text(this.x, this.y - 45, `⚔️ ${this.name}`, {
            fontSize: '16px',
            color: '#ff6666',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#000000',
            padding: { left: 5, right: 5, top: 2, bottom: 2 }
        }).setOrigin(0.5).setDepth(15);
    }

    createPatrol() {
        this.patrolStartX = this.x - 100;
        this.patrolEndX = this.x + 100;
        this.patrolDirection = 1;
        this.patrolSpeed = 50;
    }

    update() {
        this.nameLabel.setPosition(this.x, this.y - 45);
        
        this.x += this.patrolDirection * this.patrolSpeed * 0.016;
        
        if (this.x >= this.patrolEndX) {
            this.patrolDirection = -1;
        } else if (this.x <= this.patrolStartX) {
            this.patrolDirection = 1;
        }
    }
}
