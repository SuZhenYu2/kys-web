import Phaser from 'phaser';
import { getGameManager } from '../managers/GameManager.js';
import { MartialArts } from '../data/GameData.js';

export default class SkillScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Skill' });
        this.gameManager = getGameManager();
        this.selectedSkillIndex = -1;
    }

    create() {
        this.createSkillUI();
        this.createCloseButton();
    }

    createSkillUI() {
        const bg = this.add.rectangle(512, 384, 850, 650, 0x1a2a4a, 0.98);
        bg.setStrokeStyle(3, 0xffd700);

        this.add.text(512, 80, '武功面板', {
            fontSize: '36px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        this.add.text(100, 130, `银两: ${this.gameManager.player.gold}`, {
            fontSize: '20px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        });

        this.add.text(750, 130, '当前武功', {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        this.createSkillList();
        this.createSkillDetail();
        this.createUpgradeButton();
    }

    createSkillList() {
        this.skillItems = [];
        
        const startX = 80;
        const startY = 180;
        const itemHeight = 60;

        this.gameManager.player.skills.forEach((skill, index) => {
            const item = this.createSkillItem(startX, startY + index * itemHeight, skill, index);
            this.skillItems.push(item);
        });
    }

    createSkillItem(x, y, skill, index) {
        const container = this.add.container(x, y);
        
        const bg = this.add.rectangle(0, 0, 350, 50, 0x2d3a5c, 0.8);
        bg.setStrokeStyle(1, 0x4a5a8c);
        
        const nameText = this.add.text(-160, 0, skill.name, {
            fontSize: '20px',
            color: Phaser.Display.Color.HexStringToColor(skill.color).rgba,
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0, 0.5);
        
        const levelText = this.add.text(140, 0, `Lv.${skill.level}`, {
            fontSize: '16px',
            color: '#888888',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const mpText = this.add.text(60, 0, `${skill.mpCost}内力`, {
            fontSize: '14px',
            color: '#6666ff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        container.add([bg, nameText, levelText, mpText]);
        
        container.setSize(350, 50);
        container.setInteractive({ useHandCursor: true });
        
        container.on('pointerover', () => {
            bg.setFillStyle(0x4a5a8c, 0.8);
        });
        
        container.on('pointerout', () => {
            if (this.selectedSkillIndex === index) {
                bg.setFillStyle(0x5a6a9c, 0.8);
            } else {
                bg.setFillStyle(0x2d3a5c, 0.8);
            }
        });
        
        container.on('pointerdown', () => {
            this.selectSkill(index);
        });
        
        return {
            container,
            bg,
            nameText,
            levelText,
            skill,
            index
        };
    }

    selectSkill(index) {
        this.skillItems.forEach((item, i) => {
            if (i === index) {
                item.bg.setFillStyle(0x5a6a9c, 0.8);
                item.bg.setStrokeStyle(2, 0xffd700);
            } else {
                item.bg.setFillStyle(0x2d3a5c, 0.8);
                item.bg.setStrokeStyle(1, 0x4a5a8c);
            }
        });
        
        this.selectedSkillIndex = index;
        this.updateSkillDetail(index);
    }

    createSkillDetail() {
        this.detailContainer = this.add.container(550, 280);
        
        this.detailBg = this.add.rectangle(0, 0, 280, 300, 0x2d3a5c, 0.8);
        this.detailBg.setStrokeStyle(2, 0xffd700);
        
        this.detailName = this.add.text(0, -130, '选择武功', {
            fontSize: '24px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.detailType = this.add.text(0, -90, '', {
            fontSize: '16px',
            color: '#888888',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.detailLevel = this.add.text(0, -55, '', {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.detailDamage = this.add.text(0, -20, '', {
            fontSize: '16px',
            color: '#ff6666',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.detailMPCost = this.add.text(0, 15, '', {
            fontSize: '16px',
            color: '#6666ff',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.detailEffect = this.add.text(0, 50, '', {
            fontSize: '14px',
            color: '#88ff88',
            fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 250 }
        }).setOrigin(0.5);
        
        this.detailDesc = this.add.text(0, 110, '', {
            fontSize: '14px',
            color: '#aaaaaa',
            fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 250 }
        }).setOrigin(0.5);
        
        this.detailContainer.add([
            this.detailBg,
            this.detailName,
            this.detailType,
            this.detailLevel,
            this.detailDamage,
            this.detailMPCost,
            this.detailEffect,
            this.detailDesc
        ]);
    }

    updateSkillDetail(index) {
        if (index < 0 || index >= this.skillItems.length) return;
        
        const skill = this.skillItems[index].skill;
        
        this.detailName.setText(skill.name);
        this.detailName.setColor(Phaser.Display.Color.HexStringToColor(skill.color).rgba);
        
        const typeNames = {
            'attack': '攻击型',
            'defense': '防御型',
            'heal': '治疗型',
            'buff': '辅助型'
        };
        this.detailType.setText(`类型: ${typeNames[skill.type] || skill.type}`);
        
        this.detailLevel.setText(`等级: ${skill.level} / ${skill.maxLevel}`);
        
        if (skill.damage > 0) {
            this.detailDamage.setText(`伤害: ${skill.damage}`);
        } else {
            this.detailDamage.setText('');
        }
        
        this.detailMPCost.setText(`内力消耗: ${skill.mpCost}`);
        
        if (skill.effect) {
            const effectNames = {
                'attack_boost': '提升攻击力',
                'defense_boost': '提升防御力',
                'speed_boost': '提升速度',
                'poison': '造成中毒',
                'knockback': '击退效果'
            };
            this.detailEffect.setText(`特效: ${effectNames[skill.effect.type] || skill.effect.type}`);
        } else {
            this.detailEffect.setText('');
        }
        
        this.detailDesc.setText(skill.description);
        
        this.updateUpgradeButton(skill);
    }

    createUpgradeButton() {
        this.upgradeBtn = this.add.text(550, 520, '升级武功', {
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#2d5016',
            padding: { left: 25, right: 25, top: 12, bottom: 12 },
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        this.upgradeBtn.on('pointerover', () => {
            if (this.canUpgrade()) {
                this.upgradeBtn.setStyle({ backgroundColor: '#4a7a2a' });
            }
        });
        
        this.upgradeBtn.on('pointerout', () => {
            this.upgradeBtn.setStyle({ backgroundColor: this.canUpgrade() ? '#2d5016' : '#444444' });
        });
        
        this.upgradeBtn.on('pointerdown', () => {
            this.upgradeSkill();
        });
    }

    updateUpgradeButton(skill) {
        if (!skill || skill.level >= skill.maxLevel) {
            this.upgradeBtn.setText('已达满级');
            this.upgradeBtn.setStyle({ backgroundColor: '#444444', color: '#888888' });
            this.upgradeBtn.disableInteractive();
        } else {
            const cost = (skill.level + 1) * 50;
            this.upgradeBtn.setText(`升级 (${cost}两)`);
            this.upgradeBtn.setStyle({ backgroundColor: '#2d5016', color: '#ffffff' });
            this.upgradeBtn.setInteractive({ useHandCursor: true });
        }
    }

    canUpgrade() {
        if (this.selectedSkillIndex < 0) return false;
        const skill = this.skillItems[this.selectedSkillIndex].skill;
        return skill && skill.level < skill.maxLevel;
    }

    upgradeSkill() {
        if (this.selectedSkillIndex < 0) return;
        
        const skill = this.skillItems[this.selectedSkillIndex].skill;
        const result = this.gameManager.upgradeSkill(skill.id);
        
        this.showMessage(result.message);
        
        this.updateSkillList();
        this.updateSkillDetail(this.selectedSkillIndex);
        
        this.scene.get('UIScene').updateStatus();
    }

    updateSkillList() {
        this.skillItems.forEach(item => item.container.destroy());
        this.skillItems = [];
        this.createSkillList();
    }

    showMessage(text) {
        const msg = this.add.text(512, 600, text, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#2d5016',
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: 550,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => msg.destroy()
        });
    }

    createCloseButton() {
        const closeBtn = this.add.text(512, 680, '返回游戏', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#d94a4a',
            padding: { left: 30, right: 30, top: 10, bottom: 10 },
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        closeBtn.on('pointerover', () => {
            closeBtn.setStyle({ backgroundColor: '#ff6b6b' });
        });
        
        closeBtn.on('pointerout', () => {
            closeBtn.setStyle({ backgroundColor: '#d94a4a' });
        });
        
        closeBtn.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('Game');
        });
    }
}
