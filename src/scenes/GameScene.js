import Phaser from 'phaser';
import Player from '../objects/Player.js';
import NPC from '../objects/NPC.js';
import Enemy from '../objects/Enemy.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.createMap();
        this.createPlayer();
        this.createNPCs();
        this.createEnemies();
        
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.mapWidth, this.mapHeight);
        
        this.createCollisions();
        this.createDialogSystem();
    }

    createMap() {
        this.mapWidth = 2048;
        this.mapHeight = 1536;
        
        this.add.rectangle(this.mapWidth / 2, this.mapHeight / 2, this.mapWidth, this.mapHeight, 0x3a6b35).setOrigin(0.5);
        
        this.createWater();
        this.createMountains();
        this.createTrees();
        this.createRoad();
        this.createBuildings();
    }

    createWater() {
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, this.mapWidth);
            const y = Phaser.Math.Between(0, this.mapHeight);
            this.add.rectangle(x, y, 128, 96, 0x165080);
        }
    }

    createMountains() {
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, this.mapWidth);
            const y = Phaser.Math.Between(0, this.mapHeight);
            const size = Phaser.Math.Between(64, 128);
            this.add.rectangle(x, y, size, size, 0x4a3525);
        }
    }

    createTrees() {
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, this.mapWidth);
            const y = Phaser.Math.Between(0, this.mapHeight);
            this.add.rectangle(x, y, 24, 48, 0x204020);
        }
    }

    createRoad() {
        this.add.rectangle(this.mapWidth / 2, this.mapHeight / 2, this.mapWidth, 48, 0x605030);
        this.add.rectangle(this.mapWidth / 2, this.mapHeight / 2, 48, this.mapHeight, 0x605030);
    }

    createBuildings() {
        this.add.rectangle(600, 400, 160, 128, 0x8b5a2b);
        this.add.text(600, 340, '客栈', {
            fontSize: '24px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        this.add.rectangle(1200, 600, 192, 144, 0x6b2222);
        this.add.text(1200, 530, '武馆', {
            fontSize: '24px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        this.add.rectangle(800, 1000, 128, 96, 0x455a64);
        this.add.text(800, 950, '药铺', {
            fontSize: '24px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
    }

    createPlayer() {
        this.player = new Player(this, this.mapWidth / 2, this.mapHeight / 2);
    }

    createNPCs() {
        this.npcs = this.physics.add.group();
        
        const innkeeper = new NPC(this, 600, 450, '店小二', '欢迎来到客栈！要不要休息一下？');
        this.npcs.add(innkeeper);
        
        const martialArtist = new NPC(this, 1200, 650, '武师', '年轻人，想不想学两招？');
        this.npcs.add(martialArtist);
        
        const healer = new NPC(this, 800, 1050, '郎中', '有什么不舒服的吗？');
        this.npcs.add(healer);
        
        const villager = new NPC(this, 400, 800, '村民', '最近山里不太平，有强盗出没...');
        this.npcs.add(villager);
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        
        const bandit1 = new Enemy(this, 1500, 300, '强盗', 50, 15);
        this.enemies.add(bandit1);
        
        const bandit2 = new Enemy(this, 300, 1200, '强盗', 45, 12);
        this.enemies.add(bandit2);
        
        const wolf = new Enemy(this, 1700, 1000, '野狼', 40, 18);
        this.enemies.add(wolf);
    }

    createCollisions() {
        this.physics.add.overlap(this.player, this.npcs, (player, npc) => {
            this.handleNPCInteraction(npc);
        }, null, this);
        
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            this.handleBattleStart(enemy);
        }, null, this);
    }

    handleNPCInteraction(npc) {
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('SPACE'))) {
            this.showDialog(npc.name, npc.dialog);
        }
    }

    handleBattleStart(enemy) {
        if (!this.inBattle) {
            this.inBattle = true;
            this.scene.pause();
            this.scene.launch('Battle', {
                enemy: enemy,
                player: this.player
            });
        }
    }

    createDialogSystem() {
        this.dialogActive = false;
    }

    showDialog(name, text) {
        if (this.dialogActive) return;
        this.dialogActive = true;

        this.player.freeze();

        const dialogBox = this.add.container(this.cameras.main.scrollX + 512, this.cameras.main.scrollY + 600);
        
        const bg = this.add.rectangle(0, 0, 800, 150, 0x1a2a4a, 0.95);
        bg.setStrokeStyle(2, 0xffd700);
        
        const nameText = this.add.text(-380, -50, name, {
            fontSize: '24px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        });
        
        const contentText = this.add.text(-380, 0, '', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 760 }
        });
        
        dialogBox.add([bg, nameText, contentText]);
        
        let charIndex = 0;
        const displayText = () => {
            if (charIndex < text.length) {
                contentText.text += text[charIndex];
                charIndex++;
            }
        };
        
        this.tweens.addCounter({
            from: 0,
            to: text.length,
            duration: text.length * 30,
            onUpdate: displayText
        });

        const closeDialog = () => {
            dialogBox.destroy();
            this.dialogActive = false;
            this.player.unfreeze();
        };

        this.input.keyboard.addKey('SPACE').on('down', closeDialog, this);
        this.input.once('pointerdown', closeDialog, this);
    }

    update() {
        this.player.update();
    }
}
