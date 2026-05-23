import { MartialArts, Items, ItemTypes, CharacterClasses } from '../data/GameData.js';

class GameManager {
    constructor() {
        this.player = {
            name: '少侠',
            level: 1,
            exp: 0,
            expToNextLevel: 100,
            hp: 100,
            maxHP: 100,
            mp: 50,
            maxMP: 50,
            attack: 25,
            defense: 10,
            speed: 25,
            gold: 200,
            class: 'swordsman',
            skills: [],
            inventory: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            buffs: [],
            statusEffects: []
        };
        
        this.learnedSkills = new Set(['basicAttack']);
        this.inventoryItems = new Map();
        
        this.initializePlayer();
    }
    
    initializePlayer() {
        const basicAttack = { ...MartialArts.basicAttack };
        this.player.skills.push(basicAttack);
        
        this.addItem('smallPill', 3);
        this.addItem('mpPill', 2);
    }
    
    addItem(itemId, quantity = 1) {
        const itemData = Items[itemId];
        if (!itemData) return false;
        
        if (itemData.stackable) {
            if (this.inventoryItems.has(itemId)) {
                const existing = this.inventoryItems.get(itemId);
                existing.quantity += quantity;
            } else {
                this.inventoryItems.set(itemId, {
                    ...itemData,
                    quantity: quantity
                });
            }
        } else {
            for (let i = 0; i < quantity; i++) {
                const uniqueId = `${itemId}_${Date.now()}_${Math.random()}`;
                this.inventoryItems.set(uniqueId, {
                    ...itemData,
                    uniqueId: uniqueId
                });
            }
        }
        
        return true;
    }
    
    removeItem(itemId, quantity = 1) {
        if (this.inventoryItems.has(itemId)) {
            const item = this.inventoryItems.get(itemId);
            if (item.quantity > quantity) {
                item.quantity -= quantity;
            } else {
                this.inventoryItems.delete(itemId);
            }
            return true;
        }
        
        for (const [key, value] of this.inventoryItems) {
            if (key.startsWith(itemId) && value.uniqueId === itemId) {
                this.inventoryItems.delete(key);
                return true;
            }
        }
        
        return false;
    }
    
    useItem(itemId) {
        const item = this.inventoryItems.get(itemId);
        if (!item) return { success: false, message: '没有这个物品' };
        
        if (item.type === ItemTypes.consumable) {
            return this.applyItemEffect(item);
        } else if (item.type === ItemTypes.equipment) {
            return this.equipItem(item);
        }
        
        return { success: false, message: '无法使用该物品' };
    }
    
    applyItemEffect(item) {
        const effect = item.effect;
        
        switch (effect.type) {
            case 'heal':
                const healAmount = Math.min(effect.value, this.player.maxHP - this.player.hp);
                this.player.hp += healAmount;
                this.removeItem(item.id, 1);
                return { success: true, message: `使用了${item.name}，恢复了${healAmount}点生命` };
            
            case 'heal_full':
                const oldHP = this.player.hp;
                this.player.hp = this.player.maxHP;
                this.removeItem(item.id, 1);
                return { success: true, message: `使用了${item.name}，完全恢复了生命` };
            
            case 'restore_mp':
                const mpAmount = Math.min(effect.value, this.player.maxMP - this.player.mp);
                this.player.mp += mpAmount;
                this.removeItem(item.id, 1);
                return { success: true, message: `使用了${item.name}，恢复了${mpAmount}点内力` };
            
            case 'cure_poison':
                this.player.statusEffects = this.player.statusEffects.filter(e => e !== 'poison');
                this.removeItem(item.id, 1);
                return { success: true, message: `使用了${item.name}，解除了中毒状态` };
            
            case 'gain_exp':
                this.gainExp(effect.value);
                this.removeItem(item.id, 1);
                return { success: true, message: `使用了${item.name}，获得了${effect.value}点经验` };
            
            case 'learn_skill':
                const skillLearned = this.learnSkill(effect.value);
                if (skillLearned) {
                    this.removeItem(item.id, 1);
                    return { success: true, message: `使用了${item.name}，学会了新武功！` };
                }
                return { success: false, message: '已经学会了这个武功' };
            
            default:
                return { success: false, message: '未知效果' };
        }
    }
    
    equipItem(item) {
        const slot = item.slot;
        if (!slot) return { success: false, message: '这个物品无法装备' };
        
        const oldEquipment = this.player.equipment[slot];
        if (oldEquipment) {
            this.addItem(oldEquipment.id, 1);
            this.removeEquipmentBonus(oldEquipment);
        }
        
        this.player.equipment[slot] = item;
        this.removeItem(item.id, 1);
        this.applyEquipmentBonus(item);
        
        return { success: true, message: `装备了${item.name}` };
    }
    
    applyEquipmentBonus(item) {
        const effect = item.effect;
        if (effect.type === 'equip_attack') {
            this.player.attack += effect.value;
        } else if (effect.type === 'equip_defense') {
            this.player.defense += effect.value;
        }
    }
    
    removeEquipmentBonus(item) {
        const effect = item.effect;
        if (effect.type === 'equip_attack') {
            this.player.attack -= effect.value;
        } else if (effect.type === 'equip_defense') {
            this.player.defense -= effect.value;
        }
    }
    
    learnSkill(skillId) {
        if (this.learnedSkills.has(skillId)) {
            return false;
        }
        
        const skillData = MartialArts[skillId];
        if (!skillData) return false;
        
        this.learnedSkills.add(skillId);
        this.player.skills.push({ ...skillData });
        
        return true;
    }
    
    canLearnSkill(skillId) {
        if (this.learnedSkills.has(skillId)) {
            return { canLearn: false, reason: '已经学会了这个武功' };
        }
        
        const skillData = MartialArts[skillId];
        if (!skillData) {
            return { canLearn: false, reason: '武功不存在' };
        }
        
        if (skillData.learnFrom === null) {
            return { canLearn: false, reason: '无法学习此武功' };
        }
        
        if (this.player.level < skillData.learnLevel) {
            return { canLearn: false, reason: `需要等级 ${skillData.learnLevel} 才能学习` };
        }
        
        return { canLearn: true, skill: skillData };
    }
    
    upgradeSkill(skillId) {
        const skill = this.player.skills.find(s => s.id === skillId);
        if (!skill) return { success: false, message: '没有这个武功' };
        
        if (skill.level >= skill.maxLevel) {
            return { success: false, message: '这个武功已经满级了' };
        }
        
        const upgradeCost = (skill.level + 1) * 50;
        if (this.player.gold < upgradeCost) {
            return { success: false, message: `升级需要${upgradeCost}两银子` };
        }
        
        this.player.gold -= upgradeCost;
        skill.level += 1;
        skill.damage = Math.floor(skill.damage * 1.2);
        
        return { success: true, message: `${skill.name} 升级到了 ${skill.level} 级！` };
    }
    
    gainExp(amount) {
        this.player.exp += amount;
        
        let levelUps = 0;
        while (this.player.exp >= this.player.expToNextLevel) {
            this.player.exp -= this.player.expToNextLevel;
            this.levelUp();
            levelUps++;
        }
        
        return {
            expGained: amount,
            levelUps: levelUps
        };
    }
    
    levelUp() {
        this.player.level += 1;
        this.player.expToNextLevel = Math.floor(this.player.expToNextLevel * 1.5);
        
        this.player.maxHP += 20;
        this.player.maxMP += 10;
        this.player.hp = this.player.maxHP;
        this.player.mp = this.player.maxMP;
        this.player.attack += 5;
        this.player.defense += 3;
        this.player.speed += 2;
    }
    
    calculateDamage(skill, targetDefense = 0) {
        const baseDamage = skill.damage;
        const attackBonus = this.player.attack;
        const levelBonus = this.player.level * 2;
        const skillLevelBonus = skill.level * 3;
        
        let damage = baseDamage + attackBonus + levelBonus + skillLevelBonus;
        damage -= targetDefense * 0.5;
        damage = Math.max(1, Math.floor(damage));
        
        return damage;
    }
    
    getInventoryArray() {
        return Array.from(this.inventoryItems.entries()).map(([key, value]) => ({
            key: key,
            ...value
        }));
    }
    
    saveGame() {
        const saveData = {
            player: this.player,
            learnedSkills: Array.from(this.learnedSkills),
            inventoryItems: Array.from(this.inventoryItems.entries()),
            timestamp: Date.now()
        };
        
        localStorage.setItem('wuxia_save', JSON.stringify(saveData));
        return true;
    }
    
    loadGame() {
        const saveData = localStorage.getItem('wuxia_save');
        if (!saveData) return false;
        
        try {
            const data = JSON.parse(saveData);
            this.player = data.player;
            this.learnedSkills = new Set(data.learnedSkills);
            this.inventoryItems = new Map(data.inventoryItems);
            return true;
        } catch (e) {
            console.error('Failed to load save:', e);
            return false;
        }
    }
}

let gameManagerInstance = null;

export function getGameManager() {
    if (!gameManagerInstance) {
        gameManagerInstance = new GameManager();
    }
    return gameManagerInstance;
}

export default GameManager;
