export const MartialArts = {
    basicAttack: {
        id: 'basicAttack',
        name: '普通攻击',
        type: 'attack',
        level: 0,
        maxLevel: 10,
        description: '最基本的攻击方式，无消耗',
        damage: 15,
        mpCost: 0,
        range: 'single',
        effect: null,
        learnFrom: null,
        learnLevel: 0,
        color: '#888888'
    },
    
    straightSword: {
        id: 'straightSword',
        name: '长虹剑法',
        type: 'attack',
        level: 0,
        maxLevel: 10,
        description: '华山派入门剑法，威力一般',
        damage: 25,
        mpCost: 10,
        range: 'single',
        effect: null,
        learnFrom: '武师',
        learnLevel: 1,
        color: '#4a90d9'
    },
    
    nineYang: {
        id: 'nineYang',
        name: '九阳神功',
        type: 'buff',
        level: 0,
        maxLevel: 10,
        description: '绝顶内功，提升攻击力',
        damage: 0,
        mpCost: 20,
        range: 'self',
        effect: {
            type: 'attack_boost',
            value: 20,
            duration: 3
        },
        learnFrom: '武师',
        learnLevel: 3,
        color: '#ffd700'
    },
    
    dragonSubduing: {
        id: 'dragonSubduing',
        name: '降龙十八掌',
        type: 'attack',
        level: 0,
        maxLevel: 10,
        description: '丐帮绝世神功，威力惊人',
        damage: 50,
        mpCost: 30,
        range: 'single',
        effect: {
            type: 'knockback',
            value: 10,
            duration: 1
        },
        learnFrom: '武师',
        learnLevel: 5,
        color: '#ff6b35'
    },
    
    sixSteps: {
        id: 'sixSteps',
        name: '六脉神剑',
        type: 'attack',
        level: 0,
        maxLevel: 10,
        description: '大理段氏绝学，远程剑气攻击',
        damage: 45,
        mpCost: 25,
        range: 'single',
        effect: null,
        learnFrom: '武师',
        learnLevel: 4,
        color: '#9b59b6'
    },
    
    doubleSwords: {
        id: 'doubleSwords',
        name: '玉女剑法',
        type: 'attack',
        level: 0,
        maxLevel: 10,
        description: '古墓派剑法，轻灵飘逸',
        damage: 30,
        mpCost: 15,
        range: 'single',
        effect: {
            type: 'speed_boost',
            value: 10,
            duration: 2
        },
        learnFrom: '武师',
        learnLevel: 2,
        color: '#e91e63'
    },
    
    healSkill: {
        id: 'healSkill',
        name: '疗伤术',
        type: 'heal',
        level: 0,
        maxLevel: 10,
        description: '运功疗伤，恢复生命',
        damage: -30,
        mpCost: 15,
        range: 'self',
        effect: null,
        learnFrom: '郎中',
        learnLevel: 2,
        color: '#4caf50'
    },
    
    poisonPalm: {
        id: 'poisonPalm',
        name: '玄冥神掌',
        type: 'attack',
        level: 0,
        maxLevel: 10,
        description: '阴毒武功，造成持续伤害',
        damage: 35,
        mpCost: 20,
        range: 'single',
        effect: {
            type: 'poison',
            value: 5,
            duration: 3
        },
        learnFrom: null,
        learnLevel: 0,
        color: '#2e7d32'
    },
    
    taiChi: {
        id: 'taiChi',
        name: '太极拳',
        type: 'defense',
        level: 0,
        maxLevel: 10,
        description: '以柔克刚，提升防御',
        damage: 0,
        mpCost: 15,
        range: 'self',
        effect: {
            type: 'defense_boost',
            value: 30,
            duration: 2
        },
        learnFrom: '武师',
        learnLevel: 3,
        color: '#00bcd4'
    }
};

export const ItemTypes = {
    consumable: 'consumable',
    equipment: 'equipment',
    quest: 'quest'
};

export const Items = {
    smallPill: {
        id: 'smallPill',
        name: '小还丹',
        type: ItemTypes.consumable,
        description: '恢复50点生命值',
        effect: {
            type: 'heal',
            value: 50
        },
        price: 50,
        stackable: true,
        maxStack: 10,
        color: '#ff6b6b'
    },
    
    mediumPill: {
        id: 'mediumPill',
        name: '中还丹',
        type: ItemTypes.consumable,
        description: '恢复100点生命值',
        effect: {
            type: 'heal',
            value: 100
        },
        price: 120,
        stackable: true,
        maxStack: 10,
        color: '#ee5a5a'
    },
    
    bigPill: {
        id: 'bigPill',
        name: '大还丹',
        type: ItemTypes.consumable,
        description: '恢复全部生命值',
        effect: {
            type: 'heal_full',
            value: 0
        },
        price: 300,
        stackable: true,
        maxStack: 5,
        color: '#ff3535'
    },
    
    mpPill: {
        id: 'mpPill',
        name: '回气散',
        type: ItemTypes.consumable,
        description: '恢复30点内力值',
        effect: {
            type: 'restore_mp',
            value: 30
        },
        price: 40,
        stackable: true,
        maxStack: 10,
        color: '#5a8dee'
    },
    
    antidote: {
        id: 'antidote',
        name: '解毒丸',
        type: ItemTypes.consumable,
        description: '解除中毒状态',
        effect: {
            type: 'cure_poison',
            value: 0
        },
        price: 80,
        stackable: true,
        maxStack: 10,
        color: '#7dcea0'
    },
    
    ironSword: {
        id: 'ironSword',
        name: '精钢剑',
        type: ItemTypes.equipment,
        description: '攻击+15',
        effect: {
            type: 'equip_attack',
            value: 15
        },
        slot: 'weapon',
        price: 200,
        stackable: false,
        color: '#95a5a6'
    },
    
    steelSword: {
        id: 'steelSword',
        name: '玄铁剑',
        type: ItemTypes.equipment,
        description: '攻击+30',
        effect: {
            type: 'equip_attack',
            value: 30
        },
        slot: 'weapon',
        price: 500,
        stackable: false,
        color: '#7f8c8d'
    },
    
    leatherArmor: {
        id: 'leatherArmor',
        name: '皮甲',
        type: ItemTypes.equipment,
        description: '防御+10',
        effect: {
            type: 'equip_defense',
            value: 10
        },
        slot: 'armor',
        price: 150,
        stackable: false,
        color: '#d35400'
    },
    
    ironArmor: {
        id: 'ironArmor',
        name: '铁甲',
        type: ItemTypes.equipment,
        description: '防御+25',
        effect: {
            type: 'equip_defense',
            value: 25
        },
        slot: 'armor',
        price: 400,
        stackable: false,
        color: '#c0392b'
    },
    
    skillBook: {
        id: 'skillBook',
        name: '武功秘籍',
        type: ItemTypes.consumable,
        description: '使用后可学习新武功',
        effect: {
            type: 'learn_skill',
            value: 'dragonSubduing'
        },
        price: 1000,
        stackable: true,
        maxStack: 3,
        color: '#f1c40f'
    },
    
    expBook: {
        id: 'expBook',
        name: '修为丹',
        type: ItemTypes.consumable,
        description: '获得500点经验值',
        effect: {
            type: 'gain_exp',
            value: 500
        },
        price: 200,
        stackable: true,
        maxStack: 5,
        color: '#9b59b6'
    }
};

export const CharacterClasses = {
    swordsman: {
        id: 'swordsman',
        name: '剑客',
        baseHP: 100,
        baseMP: 60,
        baseAttack: 20,
        baseDefense: 15,
        baseSpeed: 25,
        skills: ['basicAttack', 'straightSword', 'doubleSwords'],
        description: '擅长剑法，攻击速度快'
    },
    
    warrior: {
        id: 'warrior',
        name: '拳师',
        baseHP: 130,
        baseMP: 40,
        baseAttack: 25,
        baseDefense: 20,
        baseSpeed: 20,
        skills: ['basicAttack', 'dragonSubduing', 'taiChi'],
        description: '内功深厚，生命力强'
    },
    
    mage: {
        id: 'mage',
        name: '气功师',
        baseHP: 80,
        baseMP: 80,
        baseAttack: 30,
        baseDefense: 10,
        baseSpeed: 22,
        skills: ['basicAttack', 'sixSteps', 'healSkill'],
        description: '内力充沛，擅长远程攻击'
    }
};

export default {
    MartialArts,
    Items,
    ItemTypes,
    CharacterClasses
};
