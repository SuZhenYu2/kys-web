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

  private waterFrame_: number = 0;
  private waterTimer_: number = 0;

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
    const { getGeneratedTexture } = await import('../core/TextureGenerator');
    for (let i = 1; i <= 500; i++) {
      const tex = getGeneratedTexture(`earth_${i}`);
      if (tex) this.earthTextures_.set(i, tex);
    }
    for (let i = 1; i <= 500; i++) {
      const tex = getGeneratedTexture(`building_${i}`);
      if (tex) this.buildTextures_.set(i, tex);
    }
    for (let i = 0; i <= 255; i++) {
      const tex = getGeneratedTexture(`person_${i}`);
      if (tex) this.personTextures_.set(i, tex);
    }
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

  private dialogText_: string = '';
  private dialogTimer_: number = 0;
  private dialogDuration_: number = 120;

  private triggerEvent(eventIndex: number): void {
    if (!this.subMap_) return;
    const evt = this.subMap_.Events[eventIndex];
    if (evt && evt.Event1 > 0) {
      const dialogMap: Record<number, string> = {
        1: '掌柜：客官里边请，本店有上好客房！',
        2: '铁匠：需要打造兵器吗？我的手艺可是一流的！',
        3: '药铺老板：这位大侠，买些金创药防身吧。',
        10: '路人：听说最近黑木崖那边不太平……',
        11: '小贩：新鲜的包子！刚出笼的包子！',
        12: '老者：年轻人，江湖险恶，多加小心啊。',
        20: '神秘人：……你来黑木崖做什么？',
        21: '樵夫：这条路上有猛兽出没，要小心！',
        30: '石壁上刻着：活死人墓，外人止步。',
        31: '寒潭水面泛着幽幽蓝光……',
        32: '古墓入口处有一道石门，似乎可以推开。',
      };
      this.dialogText_ = dialogMap[evt.Event1] || '……';
      this.dialogTimer_ = this.dialogDuration_;
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

    if (this.dialogTimer_ > 0) {
      this.dialogTimer_--;
    }

    this.waterTimer_++;
    if (this.waterTimer_ >= 15) {
      this.waterTimer_ = 0;
      this.waterFrame_ = (this.waterFrame_ + 1) % 4;
    }

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
    this.drawDialog();
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
        let tileId = this.subMap_.Earth[idx];
        if (tileId <= 0) continue;

        if (tileId >= 4 && tileId <= 7) {
          tileId = 4 + this.waterFrame_;
        }

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

      const tex = this.personTextures_.get(evt.CurrentPic);
      if (tex) {
        ctx.drawImage(tex, sx - TW * 2, sy - TH * 3, TW * 4, TH * 4);
      } else {
        ctx.fillStyle = 'rgba(255, 200, 50, 0.7)';
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#C8A050';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  private drawDialog(): void {
    if (this.dialogTimer_ <= 0 || !this.dialogText_) return;
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const w = engine.uiWidth;
    const h = engine.uiHeight;
    const boxW = w - 120;
    const boxH = 80;
    const boxX = 60;
    const boxY = h - boxH - 30;

    const alpha = Math.min(1, this.dialogTimer_ / 20);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(15, 8, 2, 0.92)';
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boxX + 8, boxY);
    ctx.lineTo(boxX + boxW - 8, boxY);
    ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + 8, 8);
    ctx.lineTo(boxX + boxW, boxY + boxH - 8);
    ctx.arcTo(boxX + boxW, boxY + boxH, boxX + boxW - 8, boxY + boxH, 8);
    ctx.lineTo(boxX + 8, boxY + boxH);
    ctx.arcTo(boxX, boxY + boxH, boxX, boxY + boxH - 8, 8);
    ctx.lineTo(boxX, boxY + 8);
    ctx.arcTo(boxX, boxY, boxX + 8, boxY, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(100, 70, 20, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + 6, boxY + 6);
    ctx.lineTo(boxX + boxW - 6, boxY + 6);
    ctx.lineTo(boxX + boxW - 6, boxY + boxH - 6);
    ctx.lineTo(boxX + 6, boxY + boxH - 6);
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = '#D4A050';
    ctx.font = '18px serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.dialogText_, boxX + 20, boxY + boxH / 2);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
    ctx.globalAlpha = 1;
  }

  private drawHUD(): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const w = engine.uiWidth;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(w - 240, 8, 232, 140);
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1;
    ctx.strokeRect(w - 240, 8, 232, 140);

    ctx.fillStyle = '#C8A050';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'left';
    ctx.fillText('金庸群侠传', w - 228, 32);

    ctx.fillStyle = '#aaa';
    ctx.font = '13px serif';
    ctx.fillText(`坐标: (${this.manX}, ${this.manY})`, w - 228, 52);
    ctx.fillText(`朝向: ${Towards[this.towards]}`, w - 228, 68);

    const barX = w - 228;
    const barW = 200;
    const barH = 12;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, 78, barW, barH);
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(barX, 78, barW * 0.85, barH);
    ctx.strokeStyle = '#661111';
    ctx.strokeRect(barX, 78, barW, barH);
    ctx.fillStyle = '#fff';
    ctx.font = '10px serif';
    ctx.textAlign = 'center';
    ctx.fillText('HP 85/100', barX + barW / 2, 88);

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, 94, barW, barH);
    ctx.fillStyle = '#3366cc';
    ctx.fillRect(barX, 94, barW * 0.7, barH);
    ctx.strokeStyle = '#112266';
    ctx.strokeRect(barX, 94, barW, barH);
    ctx.fillStyle = '#fff';
    ctx.fillText('MP 35/50', barX + barW / 2, 104);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#888';
    ctx.font = '11px serif';
    ctx.fillText('↑←↓→移动  空格菜单  ESC返回', w - 228, 124);
    ctx.fillText(`地图: ${this.subMap_?.Name || '未知'}`, w - 228, 140);
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
      if (this.dialogTimer_ > 0) {
        this.dialogTimer_ = 0;
      } else {
        this.menuOpen_ = !this.menuOpen_;
      }
    }

    if (engine.isKeyJustPressed('Escape')) {
      this.fadeDirection_ = 1;
    }
  }
}