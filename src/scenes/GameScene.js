import Phaser from 'phaser';
import Player from '../objects/Player.js';
import NPC from '../objects/NPC.js';
import Enemy from '../objects/Enemy.js';
import { getGameManager } from '../managers/GameManager.js';
import { touchController } from '../managers/TouchController.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('Game');
        this.gameManager = getGameManager();
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
        
        this.setupTouchEvents();
        
        // 更新顶部状态栏
        this.updateStatusBar();
    }

    updateStatusBar() {
        touchController.updateStatusBar({
            hp: this.gameManager.player.hp,
            maxHP: this.gameManager.player.maxHP,
            mp: this.gameManager.player.mp,
            maxMP: this.gameManager.player.maxMP
        });
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
            const water = this.add.rectangle(x, y, 128, 96, 0x165080);
            water.setDepth(-1);
        }
    }

    createMountains() {
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, this.mapWidth);
            const y = Phaser.Math.Between(0, this.mapHeight);
            const size = Phaser.Math.Between(64, 128);
            const mountain = this.add.rectangle(x, y, size, size, 0x4a3525);
            mountain.setDepth(-2);
        }
    }

    createTrees() {
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, this.mapWidth);
            const y = Phaser.Math.Between(0, this.mapHeight);
            const tree = this.add.rectangle(x, y, 24, 48, 0x204020);
            tree.setDepth(-1);
        }
    }

    createRoad() {
        const roadH = this.add.rectangle(this.mapWidth / 2, this.mapHeight / 2, this.mapWidth, 48, 0x605030);
        const roadV = this.add.rectangle(this.mapWidth / 2, this.mapHeight / 2, 48, this.mapHeight, 0x605030);
        roadH.setDepth(-1);
        roadV.setDepth(-1);
    }

    createBuildings() {
        this.createBuilding(600, 400, 160, 128, 0x8b5a2b, '客栈', 'welcome');
        this.createBuilding(1200, 600, 192, 144, 0x6b2222, '武馆', 'martial');
        this.createBuilding(800, 1000, 128, 96, 0x455a64, '药铺', 'pharmacy');
        this.createBuilding(1400, 900, 128, 96, 0x5d4037, '铁匠铺', 'blacksmith');
    }

    createBuilding(x, y, width, height, color, name, id) {
        const building = this.add.rectangle(x, y, width, height, color);
        building.setDepth(1);
        
        const label = this.add.text(x, y - height / 2 - 20, name, {
            fontSize: '24px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5).setDepth(2);
        
        building.buildingName = name;
        building.buildingId = id;
    }

    createPlayer() {
        this.player = new Player(this, this.mapWidth / 2, this.mapHeight / 2);
    }

    createNPCs() {
        this.npcs = this.physics.add.group();
        
        const innkeeper = new NPC(this, 600, 480, '店小二', '欢迎来到客栈！要不要休息一下？');
        innkeeper.npcType = 'inn';
        this.npcs.add(innkeeper);
        
        const martialArtist = new NPC(this, 1200, 720, '武师', '年轻人，想不想学两招？');
        martialArtist.npcType = 'teacher';
        this.npcs.add(martialArtist);
        
        const healer = new NPC(this, 800, 1120, '郎中', '有什么不舒服的吗？');
        healer.npcType = 'healer';
        this.npcs.add(healer);
        
        const villager = new NPC(this, 400, 800, '村民', '最近山里不太平，有强盗出没...');
        villager.npcType = 'normal';
        this.npcs.add(villager);
    }

    createEnemies() {
        this.enemies = this.physics.add.group();
        
        const bandit1 = new Enemy(this, 1500, 300, '强盗', 80, 18);
        this.enemies.add(bandit1);
        
        const bandit2 = new Enemy(this, 300, 1200, '山贼', 70, 15);
        this.enemies.add(bandit2);
        
        const wolf = new Enemy(this, 1700, 1000, '野狼', 60, 22);
        this.enemies.add(wolf);
        
        const bandit3 = new Enemy(this, 600, 1300, '土匪', 90, 20);
        this.enemies.add(bandit3);
    }

    createCollisions() {
        this.physics.add.overlap(this.player, this.npcs, (player, npc) => {
            // 碰撞检测，但不自动触发
        }, null, this);
        
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            // 碰撞检测，但不自动触发
        }, null, this);
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
        
        this.dialogBox = dialogBox;
        this.dialogContentText = contentText;
        
        // 显示文本
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
    }

    closeDialog() {
        if (this.dialogBox) {
            this.dialogBox.destroy();
            this.dialogBox = null;
        }
        this.dialogActive = false;
        this.player.unfreeze();
    }

    setupTouchEvents() {
        // 监听窗口事件
        window.addEventListener('touch-action', (e) => {
            const action = e.detail.action;
            this.handleTouchAction(action);
        });
    }

    handleTouchAction(action) {
        switch(action) {
            case 'interact':
                if (this.dialogActive) {
                    this.closeDialog();
                } else {
                    const nearbyNPC = this.findNearbyNPC();
                    if (nearbyNPC) {
                        this.showDialog(nearbyNPC.name, nearbyNPC.dialog);
                    } else {
                        const nearbyEnemy = this.findNearbyEnemy();
                        if (nearbyEnemy) {
                            this.startBattle(nearbyEnemy);
                        }
                    }
                }
                break;
            case 'menu':
                this.scene.get('UIScene').toggleMenu();
                break;
            case 'inventory':
                this.scene.get('UIScene').openInventory();
                break;
            case 'skill':
                this.scene.get('UIScene').scene.launch('Skill');
                break;
        }
    }

    findNearbyNPC() {
        let closestNPC = null;
        let minDistance = 100;
        
        this.npcs.getChildren().forEach((npc) => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                npc.x, npc.y
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestNPC = npc;
            }
        });
        
        return closestNPC;
    }

    findNearbyEnemy() {
        let closestEnemy = null;
        let minDistance = 100;
        
        this.enemies.getChildren().forEach((enemy) => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            if (distance < minDistance) {
                minDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        return closestEnemy;
    }

    startBattle(enemy) {
        this.scene.pause();
        this.scene.launch('Battle', {
            enemy: enemy,
            player: this.player
        });
    }

    update() {
        // 处理触屏输入
        this.handleTouchInput();
        
        // 键盘关闭对话框
        if (this.dialogActive && Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('SPACE'))) {
            this.closeDialog();
        }
    }

    handleTouchInput() {
        const direction = touchController.getDirection();
        const hasTouchInput = direction.up || direction.down || direction.left || direction.right;
        
        if (hasTouchInput) {
            this.updatePlayerFromDirection(direction);
        } else {
            // 如果没有触摸输入，则让Player使用键盘输入
            this.player.update();
        }
    }

    updatePlayerFromDirection(direction) {
        let velocityX = 0;
        let velocityY = 0;
        const speed = 200;

        if (direction.up) velocityY = -speed;
        if (direction.down) velocityY = speed;
        if (direction.left) velocityX = -speed;
        if (direction.right) velocityX = speed;

        if (velocityX !== 0 && velocityY !== 0) {
            velocityX *= 0.707;
            velocityY *= 0.707;
        }

        this.player.setVelocity(velocityX, velocityY);
    }
}
