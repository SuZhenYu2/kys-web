import { RunNode } from './RunNode';
import { Engine } from '../core/Engine';

export class Scene extends RunNode {
  static readonly TILE_W_0 = 18;
  static readonly TILE_H_0 = 9;
  static TILE_W = 18;
  static TILE_H = 9;

  static setTileScale(scale: number): void {
    Scene.TILE_W = Scene.TILE_W_0 * scale;
    Scene.TILE_H = Scene.TILE_H_0 * scale;
  }

  protected renderCenterX_: number = 0;
  protected renderCenterY_: number = 0;

  protected viewWidthRegion_: number = 0;
  protected viewSumRegion_: number = 0;

  protected manX_: number = 0;
  protected manY_: number = 0;
  protected towards_: number = 0;
  protected step_: number = 0;
  protected manPic_: number = 0;

  protected totalStep_: number = 0;
  protected prePressed_: string = '';
  protected prePressedTicks_: number = 0;
  static keyWalkDelay: number = 20;

  protected mouseEventX_: number = -1;
  protected mouseEventY_: number = -1;
  protected cursorX_: number = 0;
  protected cursorY_: number = 0;
  protected restTime_: number = 0;

  static COORD_COUNT = 0;

  constructor() {
    super();
    this.fullWindow_ = 1;
  }

  calViewRegion(): void {
    const engine = Engine.getInstance();
    const w = engine.uiWidth;
    const h = engine.uiHeight;
    this.viewWidthRegion_ = Math.floor(w / (Scene.TILE_W * 2)) + 2;
    this.viewSumRegion_ = this.viewWidthRegion_ * this.viewWidthRegion_;
  }

  setManPosition(x: number, y: number): void {
    this.manX_ = x;
    this.manY_ = y;
  }

  getManPosition(): { x: number; y: number } {
    return { x: this.manX_, y: this.manY_ };
  }

  setTowards(t: number): void {
    this.towards_ = t;
  }

  setManPic(pic: number): void {
    this.manPic_ = pic;
  }

  static toScreenCoord(mapX: number, mapY: number): { sx: number; sy: number } {
    const sx = (mapX - mapY) * Scene.TILE_W;
    const sy = (mapX + mapY) * Scene.TILE_H;
    return { sx, sy };
  }

  static toMapCoord(screenX: number, screenY: number): { mx: number; my: number } {
    const mx = Math.floor((screenX / Scene.TILE_W + screenY / Scene.TILE_H) / 2);
    const my = Math.floor((screenY / Scene.TILE_H - screenX / Scene.TILE_W) / 2);
    return { mx, my };
  }

  calTowards(x1: number, y1: number, x2: number, y2: number): number {
    if (x1 < x2 && y1 === y2) return 0;
    if (x1 === x2 && y1 < y2) return 1;
    if (x1 > x2 && y1 === y2) return 2;
    if (x1 === x2 && y1 > y2) return 3;
    return 0;
  }

  calDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  getTowardsByKey(key: string): number {
    switch (key) {
      case 'ArrowUp': return 1;
      case 'ArrowDown': return 3;
      case 'ArrowLeft': return 2;
      case 'ArrowRight': return 0;
      default: return -1;
    }
  }

  changeTowardsByKey(key: string): void {
    const dir = this.getTowardsByKey(key);
    if (dir >= 0) this.towards_ = dir;
  }

  static getTowardsPosition(x0: number, y0: number, towards: number): { x1: number; y1: number } {
    switch (towards) {
      case 0: return { x1: x0 + 1, y1: y0 };
      case 1: return { x1: x0, y1: y0 + 1 };
      case 2: return { x1: x0 - 1, y1: y0 };
      case 3: return { x1: x0, y1: y0 - 1 };
      default: return { x1: x0, y1: y0 };
    }
  }

  isOutLine(x: number, y: number): boolean {
    return x < 0 || y < 0 || x >= Scene.COORD_COUNT || y >= Scene.COORD_COUNT;
  }
}