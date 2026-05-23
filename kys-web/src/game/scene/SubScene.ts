import { Scene } from './Scene';
import { Engine } from '../core/Engine';
import { RunNode } from './RunNode';
import {
  Towards, SubMapInfo, Point,
  COORD_COUNT, SUBMAP_EVENT_COUNT,
  MAN_PIC_0, MAN_PIC_COUNT, REST_PIC_0,
  REST_PIC_COUNT, REST_INTERVAL, BEGIN_REST_TIME
} from '../data/Types';
import { Menu } from '../ui/Menu';
import { TextBox } from '../ui/TextBox';

interface BuildingRenderInfo {
  x: number;
  y: number;
  w: number;
  h: number;
  pic: number;
  tile: number;
}

export class SubScene extends Scene {
  private subMap_: SubMapInfo | null = null;
  private earthTextures_: Map<number, ImageBitmap> = new Map();
  private buildTextures_: Map<number, ImageBitmap> = new Map();
  private personTextures_: Map<number, ImageBitmap> = new Map();
  private buildingRender_: BuildingRenderInfo[] = [];
  private fade_: number = 0;
  private fadeDirection_: number = 0;
  private textBox_: TextBox | null = null;
  private menu_: Menu | null = null;
  private mouseX_: number = 0;
  private mouseY_: number = 0;
  private restTime_: number = 0;
  private step_: number = 0;
  private walk_: boolean = false;
  private menuOpen_: boolean = false;
  private entering_: boolean = true;

  constructor() {
    super();
    this.fullWindow_ = 1;
    this.coordCount = COORD_COUNT;
  }

  async onEntrance(): Promise<void> {
    this.calViewRegion();
    await this.loadTextures();
    this.entering_ = true;
    this.fade_ = 255;
    this.fadeDirection_ = -1;

    if (this.subMap_ && this.subMap_.Name) {
      this.textBox_ = new TextBox(80, Engine.getInstance().uiHeight - 160, Engine.getInstance().uiWidth - 160, 120);
      this.textBox_.setText(`【${this.subMap_.Name}】`);
      this.addChild(this.textBox_);
      this.textBox_.setStayFrame(60);
    }
  }

  onExit(): void {
    this.clearChildren();
    this.earthTextures_.clear();
    this.buildTextures_.clear();
    this.personTextures_.clear();
  }

  private async loadTextures(): Promise<void> {
    try {
      for (let i = 1; i <= 500; i++) {
        const tex = await Engine.getInstance().loadImage(`textures/earth/earth_${i}.png`);
        this.earthTextures_.set(i, tex);
      }
    } catch {}
    try {
      for (let i = 1; i <= 500; i++) {
        const tex = await Engine.getInstance().loadImage(`textures/building/building_${i}.png`);
        this.buildTextures_.set(i, tex);
      }
    } catch {}
    try {
      for (let i = 0; i <= 255; i++) {
        const tex = await Engine.getInstance().loadImage(`textures/person/person_${i}.png`);
        this.personTextures_.set(i, tex);
      }
    } catch {}
  }

  setSubMap(map: SubMapInfo): void {
    this.subMap_ = map;
  }

  private canWalkOnEvent(x: number, y: number): boolean {
    if (!this.subMap_) return true;
    const idx = x + y * COORD_COUNT;
    const tile = this.subMap_.Earth[idx];
    if (tile === 4 || tile === 12) return false;
    for (const evt of this.subMap_.Events) {
      if (evt.X === x && evt.Y === y && evt.CannotWalk !== 0) return false;
    }
    return true;
  }

  canWalk(x: number, y: number): boolean {
    if (this.isOutLine(x, y)) return false;
    return this.canWalkOnEvent(x, y);
  }

  private checkEvent(x: number, y: number): number {
    if (!this.subMap_) return -1;
    const idx = x + y * COORD_COUNT;
    const eventIndex = this.subMap_.EventIndex[idx];
    if (eventIndex > 0 && eventIndex < this.subMap_.Events.length) {
      const evt = this.subMap_.Events[eventIndex];
      if (evt.Event1 > 0) return eventIndex;
    }
    return -1;
  }

  private handleWalk(): void {
    const engine = Engine.getInstance();
    const keys = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];

    for (const key of keys) {
      if (engine.getKeyState(key)) {
        if (engine.isKeyJustPressed(key) || this.walk_) {
          const tw = this.getTowardsByKey(key);
          if (tw !== Towards.None) {
            const pos = this.getTowardsPosition(this.manX, this.manY, tw);
            if (this.canWalk(pos.x, pos.y)) {
              this.manX = pos.x;
              this.manY = pos.y;
              this.towards = tw;
              this.step_++;
              if (this.step_ >= MAN_PIC_COUNT) this.step_ = 1;
              this.restTime_ = 0;
              this.updateManPic();

              const evtIdx = this.checkEvent(this.manX, this.manY);
              if (evtIdx >= 0) {
                this.triggerEvent(evtIdx);
              }
            } else {
              this.towards = tw;
            }
          }
        }
        this.walk_ = true;
        return;
      }
    }
    this.walk_ = false;
  }

  private triggerEvent(eventIndex: number): void {
    if (!this.subMap_) return;
    const evt = this.subMap_.Events[eventIndex];
    if (evt && evt.Event1 > 0) {
      // TODO: trigger script by event ID
    }
  }

  backRun(): void {
    if (this.entering_) {
      this.handleEntrance();
      return;
    }

    this.handleWalk();

    if (!this.walk_) {
      this.restTime_++;
      if (this.restTime_ > BEGIN_REST_TIME + REST_INTERVAL * REST_PIC_COUNT * 3) {
        this.restTime_ = BEGIN_REST_TIME;
      }
    }
    this.updateManPic();

    if (this.fadeDirection_ !== 0) {
      this.fade_ += this.fadeDirection_ * 3;
      if (this.fade_ <= 0) {
        this.fade_ = 0;
        this.fadeDirection_ = 0;
      } else if (this.fade_ >= 255) {
        this.fade_ = 255;
        this.fadeDirection_ = 0;
        this.exitWithResult(0);
      }
    }
  }

  private handleEntrance(): void {
    this.fade_ += this.fadeDirection_ * 3;
    if (this.fade_ <= 0) {
      this.fade_ = 0;
      this.entering_ = false;
    }
  }

  updateManPic(): void {
    if (this.restTime_ > BEGIN_REST_TIME) {
      const tw = this.towards;
      this.manPic = REST_PIC_0 + tw * REST_PIC_COUNT +
        Math.floor((this.restTime_ - BEGIN_REST_TIME) / REST_INTERVAL) % REST_PIC_COUNT;
    } else {
      this.manPic = MAN_PIC_0 + this.towards * MAN_PIC_COUNT + this.step_;
    }
  }

  draw(): void {
    if (!this.subMap_) {
      this.drawPlaceholder();
      return;
    }

    this.drawEarth();
    this.drawBuilding();
    this.drawMan();
    this.drawDecoration();
    this.drawEvent();
    this.drawHUD();

    if (this.fade_ > 0) {
      Engine.getInstance().setAlpha(this.fade_ / 255);
      Engine.getInstance().fillColor({ r: 0, g: 0, b: 0, a: 255 }, 0, 0, -1, -1);
      Engine.getInstance().resetAlpha();
    }
  }

  private drawPlaceholder(): void {
    const engine = Engine.getInstance();
    const w = engine.uiWidth;
    const h = engine.uiHeight;
    const ctx = engine.offCtx;
    if (!ctx) return;

    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(0, 0, w, h);

    const colors = ['#2a1f14', '#322414', '#2d2118', '#352216'];
    const TW = Scene.TILE_W;
    const TH = Scene.TILE_H;

    for (let y = -5; y < h / TH + 5; y++) {
      for (let x = -5; x < w / (2 * TW) + 5; x++) {
        const px = x * 2 * TW - y * TW + w / 2;
        const py = x * TH + y * TH + h / 2;
        const ci = ((x + y) & 3);
        ctx.fillStyle = colors[ci];
        ctx.strokeStyle = '#3a2a1a';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(px, py + TH);
        ctx.lineTo(px + TW, py);
        ctx.lineTo(px + 2 * TW, py + TH);
        ctx.lineTo(px + TW, py + 2 * TH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    this.drawMan();
    this.drawHUD();
  }

  private drawEarth(): void {
    if (!this.subMap_) return;
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const w = engine.uiWidth;
    const h = engine.uiHeight;
    const TW = Scene.TILE_W;
    const TH = Scene.TILE_H;

    for (let y = -2; y < h / TH + 2; y++) {
      for (let x = -2; x < w / (2 * TW) + 2; x++) {
        const mapX = this.manX + x;
        const mapY = this.manY + y;
        if (this.isOutLine(mapX, mapY)) continue;

        const idx = mapX + mapY * COORD_COUNT;
        const tileId = this.subMap_.Earth[idx];
        if (tileId <= 0) continue;

        const dx = mapX - this.manX;
        const dy = mapY - this.manY;
        const sx = -dy * TW + dx * TW + engine.uiWidth / 2;
        const sy = dy * TH + dx * TH + engine.uiHeight / 2;

        const tex = this.earthTextures_.get(tileId);
        if (tex) {
          ctx.drawImage(tex, sx - TW, sy - TH, TW * 2, TH * 2);
        } else {
          ctx.fillStyle = `hsl(${(tileId * 30) % 360}, 30%, 25%)`;
          ctx.strokeStyle = '#3a2a1a';
          ctx.beginPath();
          ctx.moveTo(sx, sy + TH);
          ctx.lineTo(sx + TW, sy);
          ctx.lineTo(sx + 2 * TW, sy + TH);
          ctx.lineTo(sx + TW, sy + 2 * TH);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  }

  private drawBuilding(): void {
    if (!this.subMap_) return;
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    this.buildingRender_ = [];
    const TW = Scene.TILE_W;
    const TH = Scene.TILE_H;
    const w = engine.uiWidth;
    const h = engine.uiHeight;

    for (let y = -2; y < h / TH + 2; y++) {
      for (let x = -2; x < w / (2 * TW) + 2; x++) {
        const mapX = this.manX + x;
        const mapY = this.manY + y;
        if (this.isOutLine(mapX, mapY)) continue;

        const idx = mapX + mapY * COORD_COUNT;
        const tileId = this.subMap_.Building[idx];
        if (tileId <= 0) continue;

        const dx = mapX - this.manX;
        const dy = mapY - this.manY;
        const sx = -dy * TW + dx * TW + engine.uiWidth / 2;
        const sy = dy * TH + dx * TH + engine.uiHeight / 2;

        const tex = this.buildTextures_.get(tileId);
        if (tex) {
          ctx.drawImage(tex, sx - TW, sy - TH, TW * 2, TH * 2);
        }

        const buildingHeight = this.subMap_.BuildingHeight[idx];
        if (buildingHeight > 0) {
          this.buildingRender_.push({
            x: sx, y: sy, w: TW * 2, h: TH * 2,
            pic: tileId, tile: buildingHeight,
          });
        }
      }
    }

    this.buildingRender_.sort((a, b) => (a.x + a.y) - (b.x + b.y));
    for (const b of this.buildingRender_) {
      const tex = this.buildTextures_.get(b.pic);
      if (tex) {
        ctx.drawImage(tex, b.x - TW, b.y - TH - b.tile, TW * 2, TH * 2 + b.tile);
      }
    }
  }

  private drawMan(): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const TW = Scene.TILE_W;
    const TH = Scene.TILE_H;
    const dx = 0;
    const dy = 0;
    const sx = -dy * TW + dx * TW + engine.uiWidth / 2;
    const sy = dy * TH + dx * TH + engine.uiHeight / 2;

    const tex = this.personTextures_.get(this.manPic);
    if (tex) {
      ctx.drawImage(tex, sx - TW * 2, sy - TH * 3, TW * 4, TH * 4);
    } else {
      const colors = ['#4488cc', '#55aaee', '#66bbee', '#88ccee'];
      const ci = this.manPic % colors.length;
      ctx.fillStyle = colors[ci];
      ctx.beginPath();
      ctx.arc(sx, sy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      const dirOffsets: [number, number][] = [[0, -1], [1, 0], [0, 1], [-1, 0]];
      const ti = Math.min(this.towards, 3);
      const [ox, oy] = dirOffsets[ti];
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(sx + ox * 8, sy + oy * 8, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawDecoration(): void {
    if (!this.subMap_) return;
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const TW = Scene.TILE_W;
    const TH = Scene.TILE_H;
    const w = engine.uiWidth;
    const h = engine.uiHeight;

    for (let y = -2; y < h / TH + 2; y++) {
      for (let x = -2; x < w / (2 * TW) + 2; x++) {
        const mapX = this.manX + x;
        const mapY = this.manY + y;
        if (this.isOutLine(mapX, mapY)) continue;

        const idx = mapX + mapY * COORD_COUNT;
        const tileId = this.subMap_.Decoration[idx];
        if (tileId <= 0) continue;

        const dx = mapX - this.manX;
        const dy = mapY - this.manY;
        const sx = -dy * TW + dx * TW + engine.uiWidth / 2;
        const sy = dy * TH + dx * TH + engine.uiHeight / 2;

        ctx.fillStyle = `rgba(200, 150, 50, 0.5)`;
        ctx.beginPath();
        ctx.arc(sx + TW, sy + TH, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private drawEvent(): void {
    if (!this.subMap_) return;
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const TW = Scene.TILE_W;
    const TH = Scene.TILE_H;

    for (const evt of this.subMap_.Events) {
      if (evt.X < 0 || evt.Y < 0) continue;
      if (this.isOutScreen(evt.X, evt.Y)) continue;

      const dx = evt.X - this.manX;
      const dy = evt.Y - this.manY;
      const sx = -dy * TW + dx * TW + engine.uiWidth / 2;
      const sy = dy * TH + dx * TH + engine.uiHeight / 2;

      ctx.fillStyle = 'rgba(255, 100, 50, 0.6)';
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawHUD(): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const w = engine.uiWidth;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(w - 230, 10, 220, 120);
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1;
    ctx.strokeRect(w - 230, 10, 220, 120);

    ctx.fillStyle = '#C8A050';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'left';
    ctx.fillText('金庸群侠传', w - 220, 36);
    ctx.textAlign = 'start';

    ctx.fillStyle = '#aaa';
    ctx.font = '14px serif';
    ctx.textAlign = 'left';
    ctx.fillText(`坐标: (${this.manX}, ${this.manY})`, w - 220, 60);
    ctx.fillText(`朝向: ${Towards[this.towards]}`, w - 220, 80);
    ctx.fillText(`步数: ${this.step_}`, w - 220, 100);
    ctx.fillText('↑←↓→移动 空格菜单 ESC返回', w - 220, 118);
    ctx.textAlign = 'start';
  }

  dealEvent(): void {
    const engine = Engine.getInstance();
    const { x, y } = engine.getMouseState();

    if (engine.isMouseButtonJustPressed(0)) {
      const mapPos = this.getMousePositionInView(this.manX, this.manY);
      if (!this.isOutLine(mapPos.x, mapPos.y) && this.canWalk(mapPos.x, mapPos.y)) {
        this.FindWay(this.manX, this.manY, mapPos.x, mapPos.y);
      }
    }

    if (engine.isKeyJustPressed(' ') || engine.isKeyJustPressed('Enter')) {
      this.menuOpen_ = !this.menuOpen_;
    }

    if (engine.isKeyJustPressed('Escape')) {
      this.fadeDirection_ = 1;
    }
  }
}