import { Scene } from './Scene';
import { Engine } from '../core/Engine';
import { TileMap, TileCamera } from '../map/TileMap';
import { SubMapInfoData, SUBMAP_COORD_COUNT, TEAMMATE_COUNT } from '../data/Types';
import { Color, Rect } from '../utils/math';

export class SubScene extends Scene {
  private tileMap_: TileMap;
  private subMap_: SubMapInfoData | null = null;
  private playerPic_: ImageBitmap | HTMLImageElement | null = null;
  private keyWalkDelay_: number = 150;
  private lastWalkTime_: number = 0;
  private menuOpen_: boolean = false;

  constructor() {
    super();
    this.fullWindow_ = 1;
    this.tileMap_ = new TileMap(36, 18);
    Scene.COORD_COUNT = SUBMAP_COORD_COUNT;
  }

  setSubMap(map: SubMapInfoData): void {
    this.subMap_ = map;
    this.tileMap_.camera.moveTo(this.manX_, this.manY_);
  }

  setPlayerPic(pic: ImageBitmap | HTMLImageElement): void {
    this.playerPic_ = pic;
  }

  backRun(): void {
    if (!this.subMap_) return;
    this.handleMovement();
    this.tileMap_.camera.smoothMoveTo(this.manX_, this.manY_, 0.08);
  }

  private handleMovement(): void {
    const engine = Engine.getInstance();
    const now = performance.now();

    if (now - this.lastWalkTime_ < this.keyWalkDelay_) return;

    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    for (const key of keys) {
      if (engine.getKeyState(key)) {
        const dir = this.getTowardsByKey(key);
        if (dir >= 0) {
          const pos = Scene.getTowardsPosition(this.manX_, this.manY_, dir);
          if (!this.isOutLine(pos.x1, pos.y1) && this.canWalk(pos.x1, pos.y1)) {
            this.manX_ = pos.x1;
            this.manY_ = pos.y1;
            this.towards_ = dir;
            this.step_++;
            this.lastWalkTime_ = now;
          } else {
            this.towards_ = dir;
          }
        }
        break;
      }
    }
  }

  canWalk(x: number, y: number): boolean {
    if (!this.subMap_) return false;
    const idx = x + y * SUBMAP_COORD_COUNT;
    if (this.subMap_.Building[idx] > 0) return false;

    for (const evt of this.subMap_.Events) {
      if (evt.X === x && evt.Y === y && evt.CannotWalk !== 0) {
        return false;
      }
    }
    return true;
  }

  isOutScreen(x: number, y: number): boolean {
    return this.isOutLine(x, y);
  }

  draw(): void {
    if (!this.subMap_) return;

    this.tileMap_.renderPlaceholder(this.subMap_);

    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const { sx, sy } = this.tileMap_.toScreenCoord(
      this.manX_, this.manY_,
      this.tileMap_.camera.x, this.tileMap_.camera.y
    );

    if (this.playerPic_) {
      ctx.drawImage(this.playerPic_, sx - 18, sy - 12, 36, 48);
    } else {
      ctx.fillStyle = '#4488cc';
      ctx.beginPath();
      ctx.arc(sx, sy, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      const dirAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
      const angle = dirAngles[this.towards_] || 0;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(sx + Math.cos(angle) * 14, sy + Math.sin(angle) * 14);
      ctx.lineTo(sx + Math.cos(angle - 0.5) * 8, sy + Math.sin(angle - 0.5) * 8);
      ctx.lineTo(sx + Math.cos(angle + 0.5) * 8, sy + Math.sin(angle + 0.5) * 8);
      ctx.closePath();
      ctx.fill();
    }

    this.drawHUD();
  }

  private drawHUD(): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(engine.uiWidth - 220, 10, 210, 160);

    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1;
    ctx.strokeRect(engine.uiWidth - 220, 10, 210, 160);

    ctx.fillStyle = '#C8A050';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'left';
    ctx.fillText('金庸群侠传', engine.uiWidth - 210, 38);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px serif';
    ctx.fillText(`坐标: (${this.manX_}, ${this.manY_})`, engine.uiWidth - 210, 62);
    if (this.subMap_) {
      ctx.fillText(`场景: ${this.subMap_.Name || '未知'}`, engine.uiWidth - 210, 82);
    }
    ctx.fillText(`步数: ${this.step_}`, engine.uiWidth - 210, 102);

    ctx.fillStyle = '#D4A040';
    ctx.font = '13px serif';
    ctx.fillText('方向键 移动', engine.uiWidth - 210, 130);
    ctx.fillText('空格 菜单 | Esc 返回', engine.uiWidth - 210, 150);
  }

  dealEvent(): void {
    const engine = Engine.getInstance();

    if (engine.isMouseButtonJustPressed(0)) {
      const { x: mx, y: my } = engine.getMouseState();
      const { ux, uy } = engine.windowToUISpace(mx, my);
      const mapPos = this.tileMap_.toMapCoord(
        ux, uy,
        this.tileMap_.camera.x, this.tileMap_.camera.y
      );
      if (!this.isOutLine(mapPos.mx, mapPos.my) && this.canWalk(mapPos.mx, mapPos.my)) {
        this.mouseEventX_ = mapPos.mx;
        this.mouseEventY_ = mapPos.my;
      }
    }

    if (engine.isKeyJustPressed(' ') || engine.isKeyJustPressed('Enter')) {
      this.menuOpen_ = !this.menuOpen_;
    }
  }
}