import { Engine } from '../core/Engine';
import { SubMapInfoData } from '../data/Types';
import { SUBMAP_COORD_COUNT } from '../data/Types';
import { Rect } from '../utils/math';

export class TileCamera {
  x: number = 0;
  y: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;

  moveTo(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  smoothMoveTo(targetX: number, targetY: number, speed: number = 0.1): void {
    this.x += (targetX - this.x) * speed;
    this.y += (targetY - this.y) * speed;
  }
}

export class TileMap {
  private tileTextures_: (ImageBitmap | HTMLImageElement)[] = [];
  private tileW_: number = 36;
  private tileH_: number = 18;
  private camera_: TileCamera = new TileCamera();

  constructor(tileW: number = 36, tileH: number = 18) {
    this.tileW_ = tileW;
    this.tileH_ = tileH;
  }

  get camera(): TileCamera {
    return this.camera_;
  }

  setTileSize(w: number, h: number): void {
    this.tileW_ = w;
    this.tileH_ = h;
  }

  setTileTextures(textures: (ImageBitmap | HTMLImageElement)[]): void {
    this.tileTextures_ = textures;
  }

  toScreenCoord(mapX: number, mapY: number, camX: number, camY: number): { sx: number; sy: number } {
    const engine = Engine.getInstance();
    const sx = engine.uiWidth / 2 + (mapX - mapY - (camX - camY)) * this.tileW_;
    const sy = (mapX + mapY - (camX + camY)) * this.tileH_;
    return { sx, sy };
  }

  toMapCoord(screenX: number, screenY: number, camX: number, camY: number): { mx: number; my: number } {
    const engine = Engine.getInstance();
    const cx = screenX - engine.uiWidth / 2;
    const mx = Math.floor(cx / (2 * this.tileW_) + screenY / (2 * this.tileH_) + camX + 0.5);
    const my = Math.floor(screenY / (2 * this.tileH_) - cx / (2 * this.tileW_) + camY + 0.5);
    return { mx, my };
  }

  render(subMap: SubMapInfoData): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const camX = this.camera_.x;
    const camY = this.camera_.y;

    const w = engine.uiWidth;
    const h = engine.uiHeight;

    const tilesWide = Math.ceil(w / (2 * this.tileW_)) + 4;
    const tilesHigh = Math.ceil(h / this.tileH_) + 4;

    const startX = Math.max(0, Math.floor(camX - tilesWide / 2));
    const startY = Math.max(0, Math.floor(camY - tilesHigh / 2));
    const endX = Math.min(SUBMAP_COORD_COUNT, Math.ceil(camX + tilesWide / 2));
    const endY = Math.min(SUBMAP_COORD_COUNT, Math.ceil(camY + tilesHigh / 2));

    this.renderLayer(ctx, subMap.Earth, subMap.Earth, startX, startY, endX, endY, camX, camY, -1);

    this.renderLayer(ctx, subMap.Building, subMap.Earth, startX, startY, endX, endY, camX, camY, 0);

    this.renderLayer(ctx, subMap.Decoration, subMap.Earth, startX, startY, endX, endY, camX, camY, 1);
  }

  private renderLayer(
    ctx: CanvasRenderingContext2D,
    layerData: Int16Array,
    earthData: Int16Array,
    startX: number, startY: number, endX: number, endY: number,
    camX: number, camY: number,
    pass: number
  ): void {
    const count = SUBMAP_COORD_COUNT;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = x + y * count;
        const tileId = layerData[idx];
        if (tileId <= 0) continue;

        const { sx, sy } = this.toScreenCoord(x, y, camX, camY);
        const texture = this.tileTextures_[tileId];
        if (!texture) continue;

        ctx.drawImage(texture, sx - this.tileW_, sy, this.tileW_ * 2, this.tileH_ * 2);
      }
    }
  }

  renderPlaceholder(subMap: SubMapInfoData): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const w = engine.uiWidth;
    const h = engine.uiHeight;
    const camX = this.camera_.x;
    const camY = this.camera_.y;

    ctx.fillStyle = '#2a1f14';
    ctx.fillRect(0, 0, w, h);

    const tilesWide = Math.ceil(w / (2 * this.tileW_)) + 4;
    const tilesHigh = Math.ceil(h / this.tileH_) + 4;

    const startX = Math.max(0, Math.floor(camX - tilesWide / 2));
    const startY = Math.max(0, Math.floor(camY - tilesHigh / 2));
    const endX = Math.min(SUBMAP_COORD_COUNT, Math.ceil(camX + tilesWide / 2));
    const endY = Math.min(SUBMAP_COORD_COUNT, Math.ceil(camY + tilesHigh / 2));

    const colors = ['#3a2a1a', '#4a3520', '#3d2d18', '#453020'];

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const { sx, sy } = this.toScreenCoord(x, y, camX, camY);
        const colorIndex = ((x + y) % colors.length + colors.length) % colors.length;

        ctx.fillStyle = colors[colorIndex];
        ctx.strokeStyle = '#5a4530';
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.moveTo(sx, sy + this.tileH_);
        ctx.lineTo(sx + this.tileW_, sy);
        ctx.lineTo(sx + this.tileW_ * 2, sy + this.tileH_);
        ctx.lineTo(sx + this.tileW_, sy + this.tileH_ * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}