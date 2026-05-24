import { RunNode } from '../scene/RunNode';
import { Engine } from '../core/Engine';

export class TextBox extends RunNode {
  private text_: string = '';
  private displayedLength_: number = 0;
  private charsPerSecond_: number = 30;
  private lastCharTime_: number = 0;
  private finishDisplay_: boolean = false;
  private fontSize_: number = 20;
  private lineHeight_: number = 28;
  private paddingX_: number = 20;
  private paddingY_: number = 16;

  constructor(x: number, y: number, w: number, h: number) {
    super();
    this.x_ = x;
    this.y_ = y;
    this.w_ = w;
    this.h_ = h;
  }

  setText(text: string): void {
    this.text_ = text;
    this.displayedLength_ = 0;
    this.finishDisplay_ = false;
    this.lastCharTime_ = performance.now();
  }

  get finishDisplay(): boolean {
    return this.finishDisplay_;
  }

  skipToEnd(): void {
    this.displayedLength_ = this.text_.length;
    this.finishDisplay_ = true;
  }

  backRun(): void {
    if (this.finishDisplay_) return;

    const now = performance.now();
    const elapsed = now - this.lastCharTime_;
    const charsToAdd = Math.floor(elapsed / (1000 / this.charsPerSecond_));

    if (charsToAdd > 0) {
      this.displayedLength_ = Math.min(this.text_.length, this.displayedLength_ + charsToAdd);
      this.lastCharTime_ = now;
      if (this.displayedLength_ >= this.text_.length) {
        this.finishDisplay_ = true;
      }
    }
  }

  draw(): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    ctx.fillStyle = 'rgba(20, 10, 5, 0.92)';
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    this.roundRect(ctx, this.x_, this.y_, this.w_, this.h_, 8);
    ctx.fill();
    ctx.stroke();

    const displayText = this.text_.substring(0, this.displayedLength_);
    const lines = this.wrapText(displayText, this.w_ - this.paddingX_ * 2);

    ctx.fillStyle = '#D4C090';
    ctx.font = `${this.fontSize_}px serif`;
    ctx.textBaseline = 'top';

    let lineY = this.y_ + this.paddingY_;
    for (const line of lines) {
      ctx.fillText(line, this.x_ + this.paddingX_, lineY);
      lineY += this.lineHeight_;
      if (lineY > this.y_ + this.h_ - this.paddingY_) break;
    }

    if (!this.finishDisplay_ && this.displayedLength_ < this.text_.length) {
      ctx.fillStyle = '#D4A040';
      ctx.font = `${this.fontSize_}px serif`;
      ctx.fillText('▼', this.x_ + this.w_ - 30, this.y_ + this.h_ - 28);
    }
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    let currentLine = '';

    for (const char of text) {
      if (char === '\n') {
        lines.push(currentLine);
        currentLine = '';
        continue;
      }
      currentLine += char;
      if (currentLine.length * (this.fontSize_ * 0.6) > maxWidth) {
        lines.push(currentLine);
        currentLine = '';
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines.length > 0 ? lines : [''];
  }

  dealEvent(): void {
    const engine = Engine.getInstance();
    if (engine.isKeyJustPressed('Enter') || engine.isKeyJustPressed(' ') ||
        engine.isMouseButtonJustPressed(0)) {
      if (!this.finishDisplay_) {
        this.skipToEnd();
      }
    }
  }

  onPressedOK(): void {
    if (!this.finishDisplay_) {
      this.skipToEnd();
    } else {
      this.exitWithResult(0);
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }
}