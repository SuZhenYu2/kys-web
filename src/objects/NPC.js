import Phaser from 'phaser';

export default class NPC extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, name, dialog) {
        super(scene, x, y, 'npc');
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.name = name;
        this.dialog = dialog;
        
        this.setImmovable(true);
        this.setDepth(5);
        
        this.createGraphics();
        this.createNameLabel();
        this.createInteractionHint();
    }

    createGraphics() {
        const graphics = this.scene.make.graphics({ add: false });
        
        graphics.fillStyle(0x4ad94a, 1);
        graphics.fillCircle(32, 32, 26);
        
        graphics.fillStyle(0xffd4a3, 1);
        graphics.fillCircle(32, 22, 10);
        
        graphics.fillStyle(0x3a3a3a, 1);
        graphics.fillCircle(29, 20, 2);
        graphics.fillCircle(35, 20, 2);
        
        graphics.fillStyle(0x5a4a3a, 1);
        graphics.fillRect(25, 38, 14, 16);
        
        graphics.generateTexture(`npc_${this.name}`, 64, 64);
        this.setTexture(`npc_${this.name}`);
        this.setDisplaySize(44, 44);
    }

    createNameLabel() {
        this.nameLabel = this.scene.add.text(this.x, this.y - 40, this.name, {
            fontSize: '16px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#000000',
            padding: { left: 5, right: 5, top: 2, bottom: 2 }
        }).setOrigin(0.5).setDepth(15);
    }

    createInteractionHint() {
        this.interactionHint = this.scene.add.text(this.x, this.y - 65, '按空格对话', {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setDepth(15).setVisible(false);
    }

    update() {
        this.nameLabel.setPosition(this.x, this.y - 40);
        this.interactionHint.setPosition(this.x, this.y - 65);
    }
}
