import { RunNode } from './RunNode';
import { Engine } from '../core/Engine';
import { Audio } from '../core/Audio';
import { Color } from '../utils/math';

export class TitleScene extends RunNode {
  private bgImage_: HTMLImageElement | ImageBitmap | null = null;
  private logoImage_: HTMLImageElement | ImageBitmap | null = null;
  private titleText_: string = '金庸群侠传';
  private subtitleText_: string = 'Web 复刻版';
  private alpha_: number = 0;
  private fadeIn_: boolean = true;
  private blinkTimer_: number = 0;
  private showPrompt_: boolean = true;

  constructor() {
    super();
    this.fullWindow_ = 1;
  }

  async onEntrance(): Promise<void> {
    const engine = Engine.getInstance();
    try {
      this.bgImage_ = await engine.loadImage('textures/title_bg.png');
    } catch {
      this.bgImage_ = null;
    }
    try {
      this.logoImage_ = await engine.loadImage('textures/logo.png');
    } catch {
      this.logoImage_ = null;
    }

    try {
      Audio.getInstance().playBGM('title.mp3');
    } catch {}
  }

  onExit(): void {
    Audio.getInstance().stopBGM();
  }

  backRun(): void {
    if (this.fadeIn_) {
      this.alpha_ += 0.01;
      if (this.alpha_ >= 1) {
        this.alpha_ = 1;
        this.fadeIn_ = false;
      }
    }

    this.blinkTimer_++;
    if (this.blinkTimer_ >= 30) {
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

    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(0, 0, w, h);

    if (this.bgImage_) {
      ctx.globalAlpha = this.alpha_;
      ctx.drawImage(this.bgImage_, 0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    const overlayGrad = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.8);
    overlayGrad.addColorStop(0, 'rgba(26, 10, 0, 0)');
    overlayGrad.addColorStop(1, 'rgba(26, 10, 0, 0.6)');
    ctx.fillStyle = overlayGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = 'rgba(200, 150, 50, 0.8)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#C8A050';
    ctx.font = 'bold 64px serif';
    ctx.fillText(this.titleText_, w / 2, h * 0.35);

    ctx.shadowBlur = 10;
    ctx.fillStyle = '#A08040';
    ctx.font = 'italic 28px serif';
    ctx.fillText(this.subtitleText_, w / 2, h * 0.45);

    ctx.shadowBlur = 0;

    if (this.showPrompt_ && this.alpha_ >= 1) {
      ctx.fillStyle = '#D4A060';
      ctx.font = '20px serif';
      const promptY = h * 0.75;
      const pulse = Math.sin(Date.now() * 0.004) * 0.3 + 0.7;
      ctx.globalAlpha = pulse;
      ctx.fillText('按任意键开始游戏', w / 2, promptY);
      ctx.globalAlpha = 1;
    } else if (this.fadeIn_) {
      ctx.fillStyle = '#D4A060';
      ctx.font = '18px serif';
      ctx.fillText('加载中...', w / 2, h * 0.75);
    }
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
    const engine = Engine.getInstance();
    if (!this.fadeIn_ && (engine.isKeyJustPressed('Enter') ||
        engine.isKeyJustPressed(' ') ||
        engine.isMouseButtonJustPressed(0))) {
      this.exitWithResult(0);
    }
  }
}