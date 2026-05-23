import { Engine } from './Engine';
import { RunNode } from '../scene/RunNode';
import { useGameStore } from '../data/GameState';

export class GameLoop {
  private engine_: Engine;
  private animFrameId_: number = 0;
  private running_: boolean = false;

  constructor() {
    this.engine_ = Engine.getInstance();
  }

  start(): void {
    this.running_ = true;
    useGameStore.getState().setRunning(true);
    this.loop();
  }

  stop(): void {
    this.running_ = false;
    if (this.animFrameId_) {
      cancelAnimationFrame(this.animFrameId_);
      this.animFrameId_ = 0;
    }
    useGameStore.getState().setRunning(false);
  }

  private loop = (): void => {
    if (!this.running_) return;

    for (let i = RunNode.root.length - 1; i >= 0; i--) {
      RunNode.root[i].frameUpdate();
    }

    this.engine_.setRenderTargetToMain();
    this.engine_.renderClear();
    RunNode.drawAll();
    this.engine_.renderPresent();
    this.engine_.flushInput();

    this.animFrameId_ = requestAnimationFrame(this.loop);
  };
}