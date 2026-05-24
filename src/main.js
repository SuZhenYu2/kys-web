import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import PreloadScene from './scenes/PreloadScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import GameScene from './scenes/GameScene.js';
import BattleScene from './scenes/BattleScene.js';
import UIScene from './scenes/UIScene.js';
import InventoryScene from './scenes/InventoryScene.js';
import SkillScene from './scenes/SkillScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#0d1321',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
        touch: true,
        activePointers: 2
    },
    pixelArt: false,
    scene: [BootScene, PreloadScene, MainMenuScene, GameScene, BattleScene, UIScene, InventoryScene, SkillScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

class Game extends Phaser.Game {
    constructor() {
        super(config);
    }
}

new Game();
