import { RunNode } from './RunNode';
import { Engine } from '../core/Engine';
import { Audio } from '../core/Audio';

export class TitleScene extends RunNode {
  private bgImage_: ImageBitmap | HTMLImageElement | null = null;
  private logoImage_: ImageBitmap | HTMLImageElement | null = null;
  private titleText_: string = '金庸群侠传';
  private subtitleText_: string = 'Web 复刻版';
  private alpha_: number = 0;
  private fadeIn_: boolean = true;
  private blinkTimer_: number = 0;
  private showPrompt_: boolean = true;
  private versionText_: string = 'v1.0 | 基于 kys-cpp 移植';

  constructor() {
    super();
    this.fullWindow_ = 1;
  }

  async onEntrance(): Promise<void> {
    this.alpha_ = 0;
    this.fadeIn_ = true;
    this.showPrompt_ = false;

    const engine = Engine.getInstance();
    try {
      this.bgImage_ = await engine.loadImage('textures/title_bg.png');
    } catch {}
    try {
      this.logoImage_ = await engine.loadImage('textures/logo.png');
    } catch {}

    try {
      Audio.getInstance().playBGM('title.mp3');
    } catch {}
  }

  onExit(): void {
    Audio.getInstance().stopBGM();
  }

  backRun(): void {
    if (this.fadeIn_) {
      this.alpha_ = Math.min(1, this.alpha_ + 0.008);
      if (this.alpha_ >= 1) {
        this.alpha_ = 1;
        this.fadeIn_ = false;
        this.showPrompt_ = true;
      }
    }

    this.blinkTimer_++;
    if (this.blinkTimer_ >= 25) {
      this.blinkTimer_ = 0;
      this.showPrompt_ = !this.showPrompt_;
    }
  }

  draw(): void {
    const engine = Engine.getInstance();
    const w = engine.uiWidth;
    const h = engine.uiHeight;
    const ctx = engine.offCtx;
    if (!ctx) return;

    ctx.fillStyle = '#0d0500';
    ctx.fillRect(0, 0, w, h);

    if (this.bgImage_) {
      ctx.globalAlpha = this.alpha_;
      ctx.drawImage(this.bgImage_, 0, 0, w, h);
    }

    ctx.globalAlpha = this.alpha_ * 0.7;
    const grad = ctx.createRadialGradient(w / 2, h * 0.4, 0, w / 2, h * 0.4, w * 0.7);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.6, 'rgba(20, 10, 2, 0.4)');
    grad.addColorStop(1, 'rgba(20, 10, 2, 0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    ctx.globalAlpha = this.alpha_;
    ctx.shadowColor = 'rgba(200, 120, 20, 0.9)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#C8903A';
    ctx.font = `bold 72px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.titleText_, w / 2, h * 0.32);

    ctx.shadowBlur = 12;
    ctx.fillStyle = '#A07030';
    ctx.font = `italic 26px serif`;
    ctx.fillText(this.subtitleText_, w / 2, h * 0.44);
    ctx.shadowBlur = 0;

    const separatorY = h * 0.50;
    ctx.strokeStyle = `rgba(139, 105, 20, ${this.alpha_ * 0.6})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.3, separatorY);
    ctx.lineTo(w * 0.7, separatorY);
    ctx.stroke();

    if (this.showPrompt_ && !this.fadeIn_) {
      const pulse = Math.sin(Date.now() * 0.004) * 0.15 + 0.85;
      ctx.globalAlpha = this.alpha_ * pulse;
      ctx.fillStyle = '#D4A050';
      ctx.font = '22px serif';
      ctx.fillText('按 任意键 开始游戏', w / 2, h * 0.62);
    }

    ctx.globalAlpha = this.alpha_ * 0.5;
    ctx.fillStyle = '#6B5A3A';
    ctx.font = '13px serif';
    ctx.fillText(this.versionText_, w / 2, h - 30);
    ctx.textAlign = 'start';
    ctx.globalAlpha = 1;
  }

  onPressedOK(): void {
    if (this.fadeIn_) return;
    this.exitWithResult(0);
  }

  onPressedCancel(): void {
    if (this.fadeIn_) return;
    this.exitWithResult(0);
  }

  dealEvent(): void {
    if (this.fadeIn_) return;
    const engine = Engine.getInstance();
    if (engine.isKeyJustPressed('Enter') ||
        engine.isKeyJustPressed(' ') ||
        engine.isMouseButtonJustPressed(0)) {
      this.exitWithResult(0);
    }
  }
}