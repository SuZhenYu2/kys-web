import { Engine } from './Engine';
import { Audio } from './Audio';
import { GameLoop } from './GameLoop';
import { TitleScene } from '../scene/TitleScene';
import { MainMenuScene } from '../scene/MainMenuScene';
import { RunNode } from '../scene/RunNode';
import { useGameStore } from '../data/GameState';
import { SaveManager } from '../data/SaveManager';
import { defaultGameSettings } from '../data/Types';

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
    store.setCurrentScene('title');

    store.setLoading(false);
    store.setLoadProgress(1);

    this.gameLoop_.start();

    await this.showTitleScene();
  }

  private async showTitleScene(): Promise<void> {
    const titleScene = new TitleScene();
    const result = await titleScene.run(true);

    if (result >= 0) {
      await this.showMainMenu();
    }
  }

  private async showMainMenu(): Promise<void> {
    const menuScene = new MainMenuScene();
    const result = await menuScene.run(true);

    switch (result) {
      case 0:
        await this.startNewGame();
        break;
      case 1:
        await this.showLoadGame();
        break;
      case 2:
        await this.showSettings();
        break;
      case 3:
      case -1:
        this.gameLoop_.stop();
        break;
      default:
        break;
    }
  }

  private async startNewGame(): Promise<void> {
    useGameStore.getState().setCurrentScene('game');
    await Engine.delay(500);
  }

  private async showLoadGame(): Promise<void> {
    await Engine.delay(500);
    await this.showMainMenu();
  }

  private async showSettings(): Promise<void> {
    await Engine.delay(500);
    await this.showMainMenu();
  }

  destroy(): void {
    this.gameLoop_.stop();
    this.audio_.destroy();
    this.engine_.clearTextures();
    RunNode.root = [];
    this.initialized_ = false;
  }
}