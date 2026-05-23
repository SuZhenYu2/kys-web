import Phaser from 'phaser';
import { getGameManager } from '../managers/GameManager.js';

export default class InventoryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'Inventory' });
        this.gameManager = getGameManager();
    }

    create() {
        this.createInventoryUI();
        this.createCloseButton();
    }

    createInventoryUI() {
        const bg = this.add.rectangle(512, 384, 800, 600, 0x1a2a4a, 0.98);
        bg.setStrokeStyle(3, 0xffd700);

        this.add.text(512, 100, '背包', {
            fontSize: '36px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        this.add.text(100, 150, `银两: ${this.gameManager.player.gold}`, {
            fontSize: '20px',
            color: '#ffd700',
            fontFamily: 'Microsoft YaHei'
        });

        this.add.text(700, 150, '点击物品使用/装备', {
            fontSize: '16px',
            color: '#888888',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);

        this.createItemSlots();
    }

    createItemSlots() {
        this.itemSlots = [];
        this.slotGraphics = [];
        
        const startX = 140;
        const startY = 200;
        const slotWidth = 140;
        const slotHeight = 100;
        const cols = 5;
        const rows = 3;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * slotWidth;
                const y = startY + row * slotHeight;
                
                const slot = this.add.container(x, y);
                
                const bg = this.add.rectangle(0, 0, 120, 80, 0x2d3a5c, 0.8);
                bg.setStrokeStyle(1, 0x4a5a8c);
                
                slot.add(bg);
                slot.setSize(120, 80);
                slot.setInteractive({ useHandCursor: true });
                
                this.itemSlots.push(slot);
                this.slotGraphics.push({ bg, text: null, quantity: null, itemData: null });
                
                slot.on('pointerover', () => {
                    this.showItemTooltip(slot, this.slotGraphics[this.itemSlots.indexOf(slot)]);
                });
                
                slot.on('pointerout', () => {
                    this.hideTooltip();
                });
                
                slot.on('pointerdown', () => {
                    const index = this.itemSlots.indexOf(slot);
                    this.useItem(index);
                });
            }
        }
        
        this.updateInventoryDisplay();
    }

    updateInventoryDisplay() {
        const items = this.gameManager.getInventoryArray();
        
        this.slotGraphics.forEach((slotData, index) => {
            if (slotData.text) slotData.text.destroy();
            if (slotData.quantity) slotData.quantity.destroy();
            slotData.itemData = null;
            
            if (index < items.length) {
                const item = items[index];
                slotData.itemData = item;
                
                slotData.bg.setFillStyle(0x2d5016, 0.8);
                slotData.bg.setStrokeStyle(2, Phaser.Display.Color.HexStringToColor(item.color).color);
                
                slotData.text = this.add.text(0, -10, item.name, {
                    fontSize: '16px',
                    color: '#ffffff',
                    fontFamily: 'Microsoft YaHei'
                }).setOrigin(0.5);
                
                if (item.quantity > 1) {
                    slotData.quantity = this.add.text(50, 25, `×${item.quantity}`, {
                        fontSize: '14px',
                        color: '#ffd700',
                        fontFamily: 'Microsoft YaHei'
                    });
                }
                
                slotData.bg.setInteractive();
                
                this.itemSlots[index].add(slotData.text);
                if (slotData.quantity) {
                    this.itemSlots[index].add(slotData.quantity);
                }
            } else {
                slotData.bg.setFillStyle(0x2d3a5c, 0.8);
                slotData.bg.setStrokeStyle(1, 0x4a5a8c);
            }
        });
    }

    showItemTooltip(slot, slotData) {
        if (!slotData.itemData) return;
        
        const item = slotData.itemData;
        const bounds = slot.getBounds();
        
        this.tooltip = this.add.container(bounds.left, bounds.top - 100);
        
        const tooltipBg = this.add.rectangle(0, 0, 200, 80, 0x1a1a2e, 0.95);
        tooltipBg.setStrokeStyle(2, 0xffd700);
        
        const tooltipText = this.add.text(0, -20, item.name, {
            fontSize: '18px',
            color: Phaser.Display.Color.HexStringToColor(item.color).rgba,
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        const tooltipDesc = this.add.text(0, 5, item.description, {
            fontSize: '14px',
            color: '#cccccc',
            fontFamily: 'Microsoft YaHei',
            wordWrap: { width: 180 }
        }).setOrigin(0.5);
        
        const tooltipEffect = this.add.text(0, 35, `效果: ${item.effect.type}`, {
            fontSize: '12px',
            color: '#88ff88',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.tooltip.add([tooltipBg, tooltipText, tooltipDesc, tooltipEffect]);
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.destroy();
            this.tooltip = null;
        }
    }

    useItem(index) {
        const items = this.gameManager.getInventoryArray();
        if (index >= items.length) return;
        
        const item = items[index];
        const result = this.gameManager.useItem(item.key || item.id);
        
        this.showMessage(result.message);
        
        this.updateInventoryDisplay();
        
        this.scene.get('UIScene').updateStatus();
    }

    showMessage(text) {
        const msg = this.add.text(512, 700, text, {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#2d5016',
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: msg,
            alpha: 0,
            y: 650,
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
