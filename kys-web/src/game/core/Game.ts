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
    const startMap = this.createStartMap();

    const subScene = new SubScene();
    subScene.setSubMap(startMap);
    subScene.setManPosition(startMap.EntranceX, startMap.EntranceY);

    await subScene.run(true);
  }

  private async continueGame(): Promise<void> {
    useGameStore.getState().setCurrentScene('game');
    const startMap = this.createStartMap();
    const subScene = new SubScene();
    subScene.setSubMap(startMap);
    await subScene.run(true);
  }

  private createPlayerRole(): ReturnType<typeof createRole> {
    const role = createRole();
    role.Name = '主角';
    role.Nick = '江湖侠客';
    role.HeadID = 1;
    role.Level = 1;
    role.Exp = 0;
    role.HP = 100;
    role.MaxHP = 100;
    role.MP = 50;
    role.MaxMP = 50;
    role.Attack = 20;
    role.Defence = 15;
    role.Speed = 18;
    role.Medicine = 15;
    role.Fist = 20;
    role.Sword = 5;
    role.MagicID[0] = 1;
    role.MagicLevel[0] = 1;
    role.MagicID[1] = 0;
    role.MagicLevel[1] = 1;
    return role;
  }

  private createStartMap(): SubMapInfo {
    const earth = new Int16Array(64 * 64);
    const building = new Int16Array(64 * 64);
    const decoration = new Int16Array(64 * 64);
    const eventIndex = new Int16Array(64 * 64);
    const buildingHeight = new Int16Array(64 * 64);
    const decorationHeight = new Int16Array(64 * 64);

    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 64; x++) {
        const idx = x + y * 64;
        if (y >= 20 && y <= 40 && x >= 20 && x <= 40) {
          earth[idx] = 2;
        } else if (y < 15 || y > 50) {
          earth[idx] = 5;
        } else if (x < 15 || x > 50) {
          earth[idx] = 1;
        } else {
          earth[idx] = ((x + y) % 3) + 1;
        }
        building[idx] = 0;
        decoration[idx] = 0;
        eventIndex[idx] = 0;
        buildingHeight[idx] = 0;
        decorationHeight[idx] = 0;
      }
    }

    for (let x = 22; x <= 38; x++) {
      building[x + 22 * 64] = 10;
      buildingHeight[x + 22 * 64] = 18;
      building[x + 38 * 64] = 10;
      buildingHeight[x + 38 * 64] = 18;
    }
    for (let y = 22; y <= 38; y++) {
      building[22 + y * 64] = 11;
      buildingHeight[22 + y * 64] = 18;
      building[38 + y * 64] = 12;
      buildingHeight[38 + y * 64] = 18;
    }
    building[22 + 22 * 64] = 13;
    building[38 + 22 * 64] = 14;
    building[22 + 38 * 64] = 15;
    building[38 + 38 * 64] = 16;

    return {
      ID: 1,
      Name: '襄阳城',
      ExitMusic: 0,
      EntranceMusic: 0,
      JumpSubMap: 0,
      EntranceCondition: 0,
      MainEntranceX1: 30, MainEntranceY1: 30,
      MainEntranceX2: 30, MainEntranceY2: 30,
      EntranceX: 30,
      EntranceY: 30,
      ExitX: [25, 35, 30, 30],
      ExitY: [30, 30, 25, 35],
      JumpX: 0, JumpY: 0,
      JumpReturnX: 0, JumpReturnY: 0,
      Earth: earth,
      Building: building,
      Decoration: decoration,
      EventIndex: eventIndex,
      BuildingHeight: buildingHeight,
      DecorationHeight: decorationHeight,
      Events: [],
    };
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