import Phaser from 'phaser';
import Player from '../objects/Player.js';
import NPC from '../objects/NPC.js';
import Enemy from '../objects/Enemy.js';
import { getGameManager } from '../managers/GameManager.js';

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
        
        const innkeeper = new NPC(this, 600, 480, '店小二', '欢迎来到客栈！要不要休息一下？这里可以恢复生命和内力哦！');
        innkeeper.npcType = 'inn';
        this.npcs.add(innkeeper);
        
        const martialArtist = new NPC(this, 1200, 720, '武师', '年轻人，想不想学两招？我这里可以教你高深的武功！');
        martialArtist.npcType = 'teacher';
        this.npcs.add(martialArtist);
        
        const healer = new NPC(this, 800, 1120, '郎中', '有什么不舒服的吗？我这里有各种灵丹妙药！');
        healer.npcType = 'healer';
        this.npcs.add(healer);
        
        const villager = new NPC(this, 400, 800, '村民', '最近山里不太平，有强盗出没...');
        villager.npcType = 'normal';
        this.npcs.add(villager);
        
        const blacksmith = new NPC(this, 1400, 1020, '铁匠', '打造兵器，修复装备，找我就对了！');
        blacksmith.npcType = 'shop';
        this.npcs.add(blacksmith);
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
            this.handleNPCInteraction(npc);
        }, null, this);
        
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            this.handleBattleStart(enemy);
        }, null, this);
    }

    handleNPCInteraction(npc) {
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('SPACE'))) {
            if (this.dialogActive) return;
            
            this.showDialog(npc.name, npc.dialog);
            
            if (npc.npcType === 'inn') {
                this.showInnMenu();
            } else if (npc.npcType === 'teacher') {
                this.showTeacherMenu();
            } else if (npc.npcType === 'healer') {
                this.showShopMenu();
            }
        }
    }

    showInnMenu() {
        if (this.innMenuShown) return;
        this.innMenuShown = true;
        
        this.time.delayedCall(500, () => {
            this.showDialogChoice('客栈休息', [
                { text: '住宿一晚 (50两)', action: () => this.restAtInn() },
                { text: '继续探索', action: () => {} }
            ]);
        });
    }

    restAtInn() {
        const player = this.gameManager.player;
        if (player.gold >= 50) {
            player.gold -= 50;
            player.hp = player.maxHP;
            player.mp = player.maxMP;
            this.showDialogText('客栈掌柜', '休息得很好！欢迎下次光临！');
            this.scene.get('UIScene').updateStatus();
        } else {
            this.showDialogText('客栈掌柜', '客官，银两不够啊...');
        }
    }

    showTeacherMenu() {
        if (this.teacherMenuShown) return;
        this.teacherMenuShown = true;
        
        this.time.delayedCall(500, () => {
            this.showDialogChoice('武师', [
                { text: '学习武功', action: () => this.showSkillLearn() },
                { text: '切磋武艺', action: () => this.sparring() },
                { text: '继续探索', action: () => {} }
            ]);
        });
    }

    showSkillLearn() {
        const learnableSkills = [];
        const skills = ['straightSword', 'doubleSwords', 'nineYang', 'dragonSubduing', 'sixSteps', 'taiChi', 'healSkill'];
        
        skills.forEach(skillId => {
            const canLearn = this.gameManager.canLearnSkill(skillId);
            if (canLearn.canLearn) {
                learnableSkills.push({
                    text: `学习 ${canLearn.skill.name}`,
                    action: () => {
                        this.gameManager.learnSkill(skillId);
                        this.showDialogText('武师', `很好！你已学会了「${canLearn.skill.name}」！`);
                    }
                });
            }
        });
        
        if (learnableSkills.length === 0) {
            this.showDialogText('武师', '你已经学会所有我会的武功了，去江湖上闯荡吧！');
        } else {
            learnableSkills.push({ text: '暂时不学', action: () => {} });
            this.showDialogChoice('学习武功', learnableSkills);
        }
    }

    sparring() {
        this.showDialogText('武师', '切磋就免了，等你再强一些再来吧！');
    }

    showShopMenu() {
        if (this.shopMenuShown) return;
        this.shopMenuShown = true;
        
        this.time.delayedCall(500, () => {
            this.showDialogChoice('药铺', [
                { text: '购买药品', action: () => this.showBuyMenu() },
                { text: '继续探索', action: () => {} }
            ]);
        });
    }

    showBuyMenu() {
        const player = this.gameManager.player;
        const items = [
            { name: '小还丹 (50两)', cost: 50, id: 'smallPill' },
            { name: '中还丹 (120两)', cost: 120, id: 'mediumPill' },
            { name: '大还丹 (300两)', cost: 300, id: 'bigPill' },
            { name: '回气散 (40两)', cost: 40, id: 'mpPill' }
        ];
        
        const choices = items
            .filter(item => player.gold >= item.cost)
            .map(item => ({
                text: `购买 ${item.name}`,
                action: () => {
                    player.gold -= item.cost;
                    this.gameManager.addItem(item.id, 1);
                    this.showDialogText('郎中', '成交！这是您的药品。');
                    this.scene.get('UIScene').updateStatus();
                }
            }));
        
        if (choices.length === 0) {
            this.showDialogText('郎中', '客官，您银两不够啊...');
        } else {
            choices.push({ text: '不买了', action: () => {} });
            this.showDialogChoice('购买药品', choices);
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

        this.dialogBox = dialogBox;
        this.dialogContentText = contentText;
        this.dialogNameText = nameText;
    }

    showDialogText(name, text) {
        if (this.dialogBox) {
            this.dialogBox.destroy();
        }
        
        this.showDialog(name, text);
    }

    showDialogChoice(title, choices) {
        if (this.dialogBox) {
            this.dialogBox.destroy();
        }
        
        this.dialogActive = true;
        this.player.freeze();
        
        const choiceBox = this.add.container(this.cameras.main.scrollX + 512, this.cameras.main.scrollY + 400);
        
        const bg = this.add.rectangle(0, 0, 400, 50 + choices.length * 50, 0x1a2a4a, 0.95);
        bg.setStrokeStyle(2, 0xffd700);
        
        const titleText = this.add.text(0, -20 - (choices.length - 1) * 25, title, {
            fontSize: '22px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        choiceBox.add([bg, titleText]);
        
        choices.forEach((choice, index) => {
            const btn = this.add.text(0, 20 + index * 50, choice.text, {
                fontSize: '18px',
                color: '#ffffff',
                backgroundColor: '#2d3a5c',
                padding: { left: 20, right: 20, top: 8, bottom: 8 },
                fontFamily: 'Microsoft YaHei'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            
            btn.on('pointerover', () => {
                btn.setStyle({ backgroundColor: '#4a5a8c' });
            });
            
            btn.on('pointerout', () => {
                btn.setStyle({ backgroundColor: '#2d3a5c' });
            });
            
            btn.on('pointerdown', () => {
                choiceBox.destroy();
                this.dialogActive = false;
                this.player.unfreeze();
                choice.action();
            });
            
            choiceBox.add(btn);
        });
        
        this.dialogBox = choiceBox;
    }

    closeDialog() {
        if (this.dialogBox) {
            this.dialogBox.destroy();
            this.dialogBox = null;
        }
        this.dialogActive = false;
        this.player.unfreeze();
    }

    update() {
        this.player.update();
        
        if (this.dialogActive && Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('SPACE'))) {
            this.closeDialog();
        }
    }
}
