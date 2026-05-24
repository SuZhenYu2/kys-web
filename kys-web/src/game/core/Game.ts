import { Engine } from './Engine';
import { Audio } from './Audio';
import { GameLoop } from './GameLoop';
import { TitleScene } from '../scene/TitleScene';
import { MainMenuScene } from '../scene/MainMenuScene';
import { SubScene } from '../scene/SubScene';
import { BattleScene } from '../scene/BattleScene';
import { RunNode } from '../scene/RunNode';
import { useGameStore } from '../data/GameState';
import { SaveManager } from '../data/SaveManager';
import { defaultGameSettings, BattleMode, createRole, SubMapInfo } from '../data/Types';
import { generateAllPlaceholderTextures } from './TextureGenerator';
import { GameData, generateTownMap, generateForestMap, generateCaveMap } from '../data/GameData';

export class Game {
  private engine_: Engine;
  private audio_: Audio;
  private gameLoop_: GameLoop;
  private initialized_: boolean = false;

  constructor() {
    this.engine_ = Engine.getInstance();
    this.audio_ = Audio.getInstance();
    this.gameLoop_ = new GameLoop();
  }

  init(canvas: HTMLCanvasElement): void {
    this.engine_.init(canvas);
    this.engine_.setAssetBasePath('/assets/');
    this.engine_.setUISize(1024, 640);

    this.audio_.setAssetBasePath('/assets/');
    this.audio_.init();

    this.initialized_ = true;
  }

  resize(w: number, h: number): void {
    if (!this.initialized_) return;
    this.engine_.resizeCanvas(w, h);
  }

  async start(): Promise<void> {
    if (!this.initialized_) return;
    const store = useGameStore.getState();
    store.setLoading(true);
    store.setLoadProgress(0);
    store.setCurrentScene('loading');

    await generateAllPlaceholderTextures();
    await GameData.loadAll();

    store.setLoading(false);
    store.setLoadProgress(1);
    store.setCurrentScene('title');

    this.gameLoop_.start();

    while (true) {
      const titleResult = await this.showTitleScene();
      if (titleResult < 0) break;

      const menuResult = await this.showMainMenu();
      if (menuResult === -1 || menuResult === 4) break;
    }

    this.gameLoop_.stop();
  }

  private async showTitleScene(): Promise<number> {
    const titleScene = new TitleScene();
    return titleScene.run(true);
  }

  private async showMainMenu(): Promise<number> {
    const menuScene = new MainMenuScene();
    const result = await menuScene.run(true);

    switch (result) {
      case 0:
        await this.startNewGame();
        return 0;
      case 1:
        await this.continueGame();
        return 0;
      case 2:
        await this.showLoadGame();
        return 0;
      case 3:
        await this.showSettings();
        return 0;
      case 4:
      case -1:
        return -1;
      default:
        return -1;
    }
  }

  private async startNewGame(): Promise<void> {
    useGameStore.getState().setCurrentScene('game');
    const role = this.createPlayerRole();
    const startMap = generateTownMap();

    const subScene = new SubScene();
    subScene.setSubMap(startMap);
    subScene.setManPosition(startMap.EntranceX, startMap.EntranceY);

    await subScene.run(true);
  }

  private async continueGame(): Promise<void> {
    useGameStore.getState().setCurrentScene('game');
    const startMap = generateTownMap();
    const subScene = new SubScene();
    subScene.setSubMap(startMap);
    await subScene.run(true);
  }

  private createPlayerRole(): ReturnType<typeof createRole> {
    const role = createRole();
    const data = GameData.getRole(0);
    if (data) {
      Object.assign(role, data);
    } else {
      role.Name = '主角';
      role.Nick = '江湖侠客';
      role.HeadID = 1;
      role.Level = 1;
      role.HP = 100;
      role.MaxHP = 100;
      role.MP = 50;
      role.MaxMP = 50;
      role.Attack = 20;
      role.Defence = 15;
      role.Speed = 18;
      role.Medicine = 15;
      role.Fist = 20;
      role.Sword = 10;
      role.MagicID[0] = 1;
      role.MagicLevel[0] = 1;
      role.MagicID[1] = 2;
      role.MagicLevel[1] = 1;
    }
    return role;
  }

  private async showLoadGame(): Promise<void> {
    useGameStore.getState().setCurrentScene('load');
    const slots = await SaveManager.getAllSlotInfos();
    await Engine.delay(500);
  }

  private async showSettings(): Promise<void> {
    useGameStore.getState().setCurrentScene('settings');
    const store = useGameStore.getState();
    await Engine.delay(500);
  }

  destroy(): void {
    this.gameLoop_.stop();
    this.audio_.destroy();
    this.engine_.clearTextures();
    RunNode.root = [];
    this.initialized_ = false;
  }
}