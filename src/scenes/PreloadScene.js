import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super('Preload');
    }

    preload() {
        this.add.text(1024 / 2, 768 / 2 - 50, '加载中...', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 400, 544, 50);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 410, 524 * value, 30);
        });

        this.load.on('complete', () => {
            this.scene.start('MainMenu');
        });

        this.createPlaceholders();
    }

    createPlaceholders() {
        this.createPlaceholderImage('player', 64, 64, '#4a90d9');
        this.createPlaceholderImage('enemy', 64, 64, '#d94a4a');
        this.createPlaceholderImage('npc', 64, 64, '#4ad94a');
        this.createPlaceholderImage('tiles', 32, 32, '#2d5016');
        this.createPlaceholderImage('water', 32, 32, '#165050');
        this.createPlaceholderImage('mountain', 32, 32, '#504020');
        this.createPlaceholderImage('tree', 32, 48, '#103010');
    }

    createPlaceholderImage(key, width, height, color) {
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture(key, width, height);
    }
}
