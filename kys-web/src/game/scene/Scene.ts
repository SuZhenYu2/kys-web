import { RunNode } from './RunNode';
import { Engine } from '../core/Engine';
import {
  Towards, TILE_W, TILE_H, TILE_W_0, TILE_H_0,
  COORD_COUNT, Point, MAN_PIC_0, MAN_PIC_COUNT,
  SHIP_PIC_0, SHIP_PIC_COUNT,
  REST_PIC_0, REST_PIC_COUNT, REST_INTERVAL, BEGIN_REST_TIME
} from '../data/Types';

export class Scene extends RunNode {
  static readonly TILE_W_0 = TILE_W_0;
  static readonly TILE_H_0 = TILE_H_0;
  static TILE_W = TILE_W;
  static TILE_H = TILE_H;

  static setTileScale(scale: number): void {
    Scene.TILE_W = Scene.TILE_W_0 * scale;
    Scene.TILE_H = Scene.TILE_H_0 * scale;
  }

  static setKeyWalkDelay(d: number): void {
    Scene.keyWalkDelay = d;
  }

  static keyWalkDelay = 20;
  static firstStepDelay = 5;

  renderCenterX: number = 0;
  renderCenterY: number = 0;
  viewWidthRegion: number = 0;
  viewSumRegion: number = 0;

  manX: number = 0;
  manY: number = 0;
  towards: Towards = Towards.RightUp;
  step: number = 0;
  manPic: number = MAN_PIC_0;

  totalStep: number = 0;
  prePressed: string = '';
  prePressedTicks: number = 0;

  mouseEventX: number = -1;
  mouseEventY: number = -1;
  cursorX: number = 0;
  cursorY: number = 0;
  restTime: number = 0;

  coordCount: number = COORD_COUNT;

  wayQue: Point[] = [];

  constructor() {
    super();
    this.fullWindow_ = 1;
  }

  calViewRegion(): void {
    this.renderCenterX = Math.floor(Engine.getInstance().uiWidth / 2);
    this.renderCenterY = Math.floor(Engine.getInstance().uiHeight / 2);
    this.viewWidthRegion = Math.floor(this.renderCenterX / Scene.TILE_W / 2) + 3;
    this.viewSumRegion = Math.floor(this.renderCenterY / Scene.TILE_H) + 2;
  }

  setManPosition(x: number, y: number): void {
    this.manX = x;
    this.manY = y;
  }

  getManPosition(): Point {
    return { x: this.manX, y: this.manY };
  }

  setTowards(t: Towards): void {
    this.towards = t;
  }

  setManPic(pic: number): void {
    this.manPic = pic;
  }

  getManPic(): number {
    return this.manPic;
  }

  isWater(x: number, y: number): boolean {
    return false;
  }

  canWalk(x: number, y: number): boolean {
    return !this.isOutLine(x, y);
  }

  isOutScreen(x: number, y: number): boolean {
    return Math.abs(this.manX - x) >= 2 * this.viewWidthRegion ||
           Math.abs(this.manY - y) >= this.viewSumRegion;
  }

  isOutLine(x: number, y: number): boolean {
    return x < 0 || y < 0 || x >= this.coordCount || y >= this.coordCount;
  }

  isBuilding(x: number, y: number): boolean {
    return false;
  }

  isRole(x: number, y: number): boolean {
    return false;
  }

  calTowards(x1: number, y1: number, x2: number, y2: number): Towards {
    const d1 = y2 - y1;
    const d2 = x2 - x1;
    const dm = Math.abs(d1) - Math.abs(d2);
    if (d1 !== 0 || d2 !== 0) {
      if (dm >= 0) {
        return d1 < 0 ? Towards.RightUp : Towards.LeftDown;
      } else {
        return d2 < 0 ? Towards.LeftUp : Towards.RightDown;
      }
    }
    return Towards.None;
  }

  getTowardsByKey(key: string): Towards {
    switch (key) {
      case 'ArrowLeft': return Towards.LeftUp;
      case 'ArrowRight': return Towards.RightDown;
      case 'ArrowUp': return Towards.RightUp;
      case 'ArrowDown': return Towards.LeftDown;
      default: return Towards.None;
    }
  }

  getTowardsByMouse(mouseX: number, mouseY: number): Towards {
    const cx = this.renderCenterX;
    const cy = this.renderCenterY;
    if (mouseX < cx && mouseY < cy) return Towards.LeftUp;
    if (mouseX < cx && mouseY > cy) return Towards.LeftDown;
    if (mouseX > cx && mouseY < cy) return Towards.RightUp;
    if (mouseX > cx && mouseY > cy) return Towards.RightDown;
    return Towards.None;
  }

  changeTowardsByKey(key: string): void {
    const tw = this.getTowardsByKey(key);
    if (tw !== Towards.None) this.towards = tw;
  }

  getTowardsPosition(x0: number, y0: number, tw: Towards): Point {
    switch (tw) {
      case Towards.LeftUp: return { x: x0 - 1, y: y0 };
      case Towards.RightDown: return { x: x0 + 1, y: y0 };
      case Towards.RightUp: return { x: x0, y: y0 - 1 };
      case Towards.LeftDown: return { x: x0, y: y0 + 1 };
      default: return { x: x0, y: y0 };
    }
  }

  getPositionOnRender(x: number, y: number, viewX: number, viewY: number): Point {
    const dx = x - viewX;
    const dy = y - viewY;
    return {
      x: -dy * Scene.TILE_W + dx * Scene.TILE_W + this.renderCenterX,
      y: dy * Scene.TILE_H + dx * Scene.TILE_H + this.renderCenterY,
    };
  }

  getPositionOnWindow(x: number, y: number, viewX: number, viewY: number): Point {
    const p = this.getPositionOnRender(x, y, viewX, viewY);
    const w = Engine.getInstance().uiWidth;
    const h = Engine.getInstance().uiHeight;
    return {
      x: Math.floor(p.x * w / this.renderCenterX / 2),
      y: Math.floor(p.y * h / this.renderCenterY / 2),
    };
  }

  getMousePosition(mouseX: number, mouseY: number, viewX: number, viewY: number): Point {
    const w = Engine.getInstance().uiWidth;
    const h = Engine.getInstance().uiHeight;
    const mouseX1 = mouseX * this.renderCenterX * 2.0 / w;
    const mouseY1 = mouseY * this.renderCenterY * 2.0 / h + Scene.TILE_H * 2;

    return {
      x: Math.floor(((mouseX1 - this.renderCenterX) / Scene.TILE_W + (mouseY1 - this.renderCenterY) / Scene.TILE_H) / 2 + viewX),
      y: Math.floor(((-mouseX1 + this.renderCenterX) / Scene.TILE_W + (mouseY1 - this.renderCenterY) / Scene.TILE_H) / 2 + viewY),
    };
  }

  getMousePositionInView(viewX: number, viewY: number): Point {
    const { x, y } = Engine.getInstance().getMouseState();
    return this.getMousePosition(x, y, viewX, viewY);
  }

  calCursorPosition(x: number, y: number): void {
    const p = this.getMousePositionInView(x, y);
    this.cursorX = p.x;
    this.cursorY = p.y;
  }

  calDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }

  FindWay(Mx: number, My: number, Fx: number, Fy: number): void {
    this.wayQue = [];

    interface AStarNode extends Point { g: number; f: number; parent: AStarNode | null; }

    const dirs: Point[] = [{ x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

    const pointMap = new Map<string, AStarNode>();
    const openList: AStarNode[] = [];

    const h = (x: number, y: number) => 2 * (Math.abs(x - Fx) + Math.abs(y - Fy));

    const start: AStarNode = { x: Mx, y: My, g: 0, f: h(Mx, My), parent: null };
    pointMap.set(`${Mx},${My}`, start);
    openList.push(start);

    let steps = 0;
    while (openList.length > 0 && steps <= 4096) {
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;
      steps++;

      if (current.x === Fx && current.y === Fy) {
        this.wayQue.unshift({ x: current.x, y: current.y });
        let t: AStarNode | null = current.parent;
        while (t) {
          this.wayQue.unshift({ x: t.x, y: t.y });
          t = t.parent;
        }
        break;
      }

      for (const dir of dirs) {
        const nx = current.x + dir.x;
        const ny = current.y + dir.y;
        if (this.isOutLine(nx, ny)) continue;
        if (!this.canWalk(nx, ny) && !(nx === Fx && ny === Fy)) continue;
        if (pointMap.has(`${nx},${ny}`)) continue;

        const g = current.g + 1;
        const f = g + h(nx, ny);
        const node: AStarNode = { x: nx, y: ny, g, f, parent: current };
        pointMap.set(`${nx},${ny}`, node);
        openList.push(node);
      }
    }
  }

  lightScene(): void {
    for (let i = 10; i >= 0; i--) {
      if (this.exit_) break;
      const alpha = clamp(i * 25, 0, 255);
      Engine.getInstance().fillColor({ r: 0, g: 0, b: 0, a: alpha }, 0, 0, -1, -1);
      this.drawAndPresent(1);
    }
  }

  darkScene(): void {
    for (let i = 0; i <= 10; i++) {
      if (this.exit_) break;
      const alpha = clamp(i * 25, 0, 255);
      Engine.getInstance().fillColor({ r: 0, g: 0, b: 0, a: alpha }, 0, 0, -1, -1);
      this.drawAndPresent(1);
    }
  }

  tryWalk(x: number, y: number): void {
    if (this.canWalk(x, y)) {
      this.manX = x;
      this.manY = y;
    }
    this.step++;
    if (this.isWater(this.manX, this.manY)) {
      this.step = this.step % SHIP_PIC_COUNT;
    } else {
      if (this.step >= MAN_PIC_COUNT) this.step = 1;
    }
    this.restTime = 0;
    this.updateManPic();
  }

  public updateManPic(): void {
    if (this.restTime > BEGIN_REST_TIME) {
      this.manPic = REST_PIC_0 + this.towards * REST_PIC_COUNT +
        Math.floor((this.restTime - BEGIN_REST_TIME) / REST_INTERVAL) % REST_PIC_COUNT;
    } else {
      this.manPic = MAN_PIC_0 + this.towards * MAN_PIC_COUNT + this.step;
    }
  }

  getPositionOnWholeEarth(x: number, y: number): Point {
    const p = this.getPositionOnRender(x, y, 0, 0);
    return {
      x: p.x + this.coordCount * Scene.TILE_W - this.renderCenterX,
      y: p.y + 2 * Scene.TILE_H - this.renderCenterY,
    };
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}