import { Color, Rect } from '../utils/math';

export class Engine {
  private static instance: Engine;

  private canvas_: HTMLCanvasElement | null = null;
  private ctx_: CanvasRenderingContext2D | null = null;
  private offscreen_: HTMLCanvasElement | null = null;
  private offCtx_: CanvasRenderingContext2D | null = null;

  private uiWidth_: number = 1024;
  private uiHeight_: number = 640;
  private presentRect_: Rect = { x: 0, y: 0, w: 1024, h: 640 };
  private ratioX_: number = 1;
  private ratioY_: number = 1;
  private keepRatio_: boolean = true;

  private keyState_: Map<string, boolean> = new Map();
  private keyJustPressed_: Map<string, boolean> = new Map();
  private mouseX_: number = 0;
  private mouseY_: number = 0;
  private mouseButtons_: number = 0;
  private mouseJustPressed_: number = 0;
  private mouseJustReleased_: number = 0;
  private mouseWheel_: number = 0;

  private textureMap_: Map<string, ImageBitmap> = new Map();
  private imageCache_: Map<string, HTMLImageElement> = new Map();

  private assetBasePath_: string = '/assets/';

  private constructor() {}

  static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }
    return Engine.instance;
  }

  init(canvas: HTMLCanvasElement): void {
    this.canvas_ = canvas;
    this.ctx_ = canvas.getContext('2d')!;
    this.ctx_.imageSmoothingEnabled = false;

    this.offscreen_ = document.createElement('canvas');
    this.offscreen_.width = this.uiWidth_;
    this.offscreen_.height = this.uiHeight_;
    this.offCtx_ = this.offscreen_.getContext('2d')!;
    this.offCtx_.imageSmoothingEnabled = false;

    this.setupInputListeners(canvas);
    this.updatePresentRect();
  }

  get canvas(): HTMLCanvasElement | null {
    return this.canvas_;
  }

  get ctx(): CanvasRenderingContext2D | null {
    return this.ctx_;
  }

  get offCtx(): CanvasRenderingContext2D | null {
    return this.offCtx_;
  }

  get uiWidth(): number {
    return this.uiWidth_;
  }

  get uiHeight(): number {
    return this.uiHeight_;
  }

  setUISize(w: number, h: number): void {
    this.uiWidth_ = w;
    this.uiHeight_ = h;
    if (this.offscreen_) {
    this.offscreen_.width = w;
    this.offscreen_.height = h;
    }
    if (this.offCtx_) {
      this.offCtx_.imageSmoothingEnabled = false;
    }
    this.updatePresentRect();
  }

  setAssetBasePath(path: string): void {
    this.assetBasePath_ = path;
  }

  get assetBasePath(): string {
    return this.assetBasePath_;
  }

  private updatePresentRect(): void {
    if (!this.canvas_) return;
    const cw = this.canvas_.width;
    const ch = this.canvas_.height;
    if (this.keepRatio_) {
      const ratio = Math.min(cw / this.uiWidth_, ch / this.uiHeight_);
      const pw = Math.floor(this.uiWidth_ * ratio);
      const ph = Math.floor(this.uiHeight_ * ratio);
      this.presentRect_ = {
        x: Math.floor((cw - pw) / 2),
        y: Math.floor((ch - ph) / 2),
        w: pw,
        h: ph,
      };
      this.ratioX_ = pw / this.uiWidth_;
      this.ratioY_ = ph / this.uiHeight_;
    } else {
      this.presentRect_ = { x: 0, y: 0, w: cw, h: ch };
      this.ratioX_ = cw / this.uiWidth_;
      this.ratioY_ = ch / this.uiHeight_;
    }
  }

  resizeCanvas(w: number, h: number): void {
    if (!this.canvas_) return;
    this.canvas_.width = w;
    this.canvas_.height = h;
    this.updatePresentRect();
  }

  windowToUISpace(wx: number, wy: number): { ux: number; uy: number } {
    if (!this.canvas_) return { ux: wx, uy: wy };
    const rect = this.canvas_.getBoundingClientRect();
    const sx = (wx - rect.left) / rect.width;
    const sy = (wy - rect.top) / rect.height;
    const cx = sx * this.canvas_.width;
    const cy = sy * this.canvas_.height;
    const ux = (cx - this.presentRect_.x) / this.ratioX_;
    const uy = (cy - this.presentRect_.y) / this.ratioY_;
    return { ux, uy };
  }

  getDisplayScale(): number {
    return Math.max(1, this.presentRect_.w / this.uiWidth_);
  }

  getPresentWidth(): number {
    return this.presentRect_.w;
  }

  getPresentHeight(): number {
    return this.presentRect_.h;
  }

  private setupInputListeners(canvas: HTMLCanvasElement): void {
    window.addEventListener('keydown', (e) => {
      if (!this.keyState_.get(e.key)) {
        this.keyJustPressed_.set(e.key, true);
      }
      this.keyState_.set(e.key, true);
    });

    window.addEventListener('keyup', (e) => {
      this.keyState_.set(e.key, false);
      this.keyJustPressed_.set(e.key, false);
    });

    canvas.addEventListener('mousemove', (e) => {
      this.mouseX_ = e.clientX;
      this.mouseY_ = e.clientY;
    });

    canvas.addEventListener('mousedown', (e) => {
      this.mouseX_ = e.clientX;
      this.mouseY_ = e.clientY;
      this.mouseButtons_ |= (1 << e.button);
      this.mouseJustPressed_ |= (1 << e.button);
    });

    canvas.addEventListener('mouseup', (e) => {
      this.mouseButtons_ &= ~(1 << e.button);
      this.mouseJustReleased_ |= (1 << e.button);
    });

    canvas.addEventListener('wheel', (e) => {
      this.mouseWheel_ = e.deltaY;
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      this.mouseX_ = t.clientX;
      this.mouseY_ = t.clientY;
      this.mouseButtons_ |= 1;
      this.mouseJustPressed_ |= 1;
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      this.mouseX_ = t.clientX;
      this.mouseY_ = t.clientY;
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.mouseButtons_ &= ~1;
      this.mouseJustReleased_ |= 1;
    }, { passive: false });
  }

  getKeyState(key: string): boolean {
    return this.keyState_.get(key) === true;
  }

  isKeyJustPressed(key: string): boolean {
    return this.keyJustPressed_.get(key) === true;
  }

  getMouseState(): { x: number; y: number; buttons: number } {
    return { x: this.mouseX_, y: this.mouseY_, buttons: this.mouseButtons_ };
  }

  isMouseButtonDown(button: number): boolean {
    return (this.mouseButtons_ & (1 << button)) !== 0;
  }

  isMouseButtonJustPressed(button: number): boolean {
    return (this.mouseJustPressed_ & (1 << button)) !== 0;
  }

  isMouseButtonJustReleased(button: number): boolean {
    return (this.mouseJustReleased_ & (1 << button)) !== 0;
  }

  getMouseWheel(): number {
    return this.mouseWheel_;
  }

  flushInput(): void {
    this.keyJustPressed_.clear();
    this.mouseJustPressed_ = 0;
    this.mouseJustReleased_ = 0;
    this.mouseWheel_ = 0;
  }

  setRenderTargetToMain(): void {
    if (!this.offCtx_) return;
    this.ctx_ = this.offCtx_;
  }

  setRenderTargetToScreen(): void {
    if (!this.canvas_) return;
    this.ctx_ = this.canvas_.getContext('2d')!;
  }

  renderClear(): void {
    if (!this.offscreen_ || !this.offCtx_) return;
    this.offCtx_.clearRect(0, 0, this.uiWidth_, this.uiHeight_);
  }

  renderTexture(
    tex: ImageBitmap | HTMLImageElement | null,
    x: number,
    y: number,
    w?: number,
    h?: number
  ): void {
    if (!tex || !this.offCtx_) return;
    const rw = w ?? tex.width;
    const rh = h ?? tex.height;
    this.offCtx_.drawImage(tex, x, y, rw, rh);
  }

  renderTextureEx(
    tex: ImageBitmap | HTMLImageElement | null,
    srcRect: Rect | null,
    dstRect: Rect,
    angle: number = 0
  ): void {
    if (!tex || !this.offCtx_) return;
    this.offCtx_.save();
    const cx = dstRect.x + dstRect.w / 2;
    const cy = dstRect.y + dstRect.h / 2;
    this.offCtx_.translate(cx, cy);
    if (angle !== 0) {
      this.offCtx_.rotate(angle);
    }
    if (srcRect) {
      this.offCtx_.drawImage(
        tex,
    srcRect.x, srcRect.y, srcRect.w, srcRect.h,
        -dstRect.w / 2, -dstRect.h / 2, dstRect.w, dstRect.h
      );
    } else {
      this.offCtx_.drawImage(
        tex,
        -dstRect.w / 2, -dstRect.h / 2, dstRect.w, dstRect.h
      );
    }
    this.offCtx_.restore();
  }

  renderTextureScaled(
    tex: ImageBitmap | HTMLImageElement | null,
    srcRect: Rect | null,
    dstRect: Rect,
    angle: number = 0,
    flipX: boolean = false,
    flipY: boolean = false
  ): void {
    if (!tex || !this.offCtx_) return;
    this.offCtx_.save();
    const cx = dstRect.x + dstRect.w / 2;
    const cy = dstRect.y + dstRect.h / 2;
    this.offCtx_.translate(cx, cy);
    if (angle !== 0) this.offCtx_.rotate(angle);
    const sx = flipX ? -1 : 1;
    const sy = flipY ? -1 : 1;
    this.offCtx_.scale(sx, sy);
    if (srcRect) {
      this.offCtx_.drawImage(
        tex,
        srcRect.x, srcRect.y, srcRect.w, srcRect.h,
        -dstRect.w / 2, -dstRect.h / 2, dstRect.w, dstRect.h
      );
    } else {
      this.offCtx_.drawImage(
        tex,
        -dstRect.w / 2, -dstRect.h / 2, dstRect.w, dstRect.h
      );
    }
    this.offCtx_.restore();
  }

  fillColor(color: Color, x: number, y: number, w: number, h: number): void {
    if (!this.offCtx_) return;
    this.offCtx_.fillStyle = `rgba(${color.r},${color.g},${color.b},${(color.a ?? 255) / 255})`;
    this.offCtx_.fillRect(x, y, w, h);
  }

  fillRect(color: string, x: number, y: number, w: number, h: number): void {
    if (!this.offCtx_) return;
    this.offCtx_.fillStyle = color;
    this.offCtx_.fillRect(x, y, w, h);
  }

  setAlpha(alpha: number): void {
    if (!this.offCtx_) return;
    this.offCtx_.globalAlpha = alpha;
  }

  resetAlpha(): void {
    if (!this.offCtx_) return;
    this.offCtx_.globalAlpha = 1;
  }

  async loadImage(path: string): Promise<ImageBitmap> {
    const fullPath = this.assetBasePath_ + path;
    const cached = this.textureMap_.get(fullPath);
    if (cached) return cached;

    try {
      const response = await fetch(fullPath);
      if (response.ok) {
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        this.textureMap_.set(fullPath, bitmap);
        return bitmap;
      }
    } catch {}

    const { getGeneratedTexture } = await import('./TextureGenerator');
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    const nameWithoutExt = fileName.replace(/\.(png|jpg|webp)$/, '');
    const generated = getGeneratedTexture(nameWithoutExt);
    if (generated) {
      this.textureMap_.set(fullPath, generated);
      return generated;
    }

    const fallback = this.createFallbackTexture(path);
    this.textureMap_.set(fullPath, fallback);
    return fallback;
  }

  private createFallbackTexture(path: string): ImageBitmap {
    const c = document.createElement('canvas');
    c.width = 36;
    c.height = 36;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, 36, 36);
    ctx.fillStyle = '#666';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = path.split('/').pop()?.substring(0, 6) || '?';
    ctx.fillText(label, 18, 18);

    const bitmap = createImageBitmap(c);
    return bitmap as unknown as ImageBitmap;
  }

  async loadImageElement(path: string): Promise<HTMLImageElement> {
    const fullPath = this.assetBasePath_ + path;
    const cached = this.imageCache_.get(fullPath);
    if (cached) return cached;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache_.set(fullPath, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = fullPath;
    });
  }

  getTexture(name: string): ImageBitmap | undefined {
    return this.textureMap_.get(name);
  }

  clearTextures(): void {
    this.textureMap_.clear();
    this.imageCache_.clear();
  }

  renderPresent(): void {
    if (!this.canvas_ || !this.ctx_ || !this.offscreen_) return;
    const ctx = this.canvas_.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
    ctx.drawImage(
      this.offscreen_,
      this.presentRect_.x,
      this.presentRect_.y,
      this.presentRect_.w,
      this.presentRect_.h
    );
  }

  static getTicks(): number {
    return performance.now();
  }

  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}