import { RunNode } from '../scene/RunNode';
import { Engine } from '../core/Engine';

export class DialogBox extends RunNode {
  private text_: string = '';
  private speaker_: string = '';
  private displayedLength_: number = 0;
  private finishDisplay_: boolean = false;
  private lastCharTime_: number = 0;
  private charsPerSecond_: number = 40;

  constructor() {
    super();
  }

  show(text: string, speaker: string = ''): void {
    this.text_ = text;
    this.speaker_ = speaker;
    this.displayedLength_ = 0;
    this.finishDisplay_ = false;
    this.lastCharTime_ = performance.now();
  }

  get isFinish(): boolean {
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

    const w = engine.uiWidth;
    const h = engine.uiHeight;
    const boxH = 150;
    const boxY = h - boxH - 10;
    const boxX = 20;
    const boxW = w - 40;

    ctx.fillStyle = 'rgba(15, 8, 3, 0.93)';
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    this.roundRect(ctx, boxX, boxY, boxW, boxH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#5a3a14';
    ctx.lineWidth = 1;
    this.roundRect(ctx, boxX + 5, boxY + 5, boxW - 10, boxH - 10, 8);
    ctx.stroke();

    if (this.speaker_) {
      const tagX = boxX + 30;
      const tagY = boxY + 28;
      ctx.fillStyle = '#D4A040';
      ctx.font = 'bold 18px serif';
      ctx.textAlign = 'left';
      ctx.fillText(this.speaker_, tagX, tagY);

      ctx.strokeStyle = '#6B4914';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(tagX + ctx.measureText(this.speaker_).width + 10, tagY - 10);
      ctx.lineTo(tagX + ctx.measureText(this.speaker_).width + 10, tagY + 6);
      ctx.stroke();
    }

    const displayText = this.text_.substring(0, this.displayedLength_);
    const textStartY = this.speaker_ ? boxY + 55 : boxY + 35;

    ctx.fillStyle = '#D4C090';
    ctx.font = '18px serif';
    ctx.textAlign = 'left';

    const lines = this.wrapText(ctx, displayText, boxW - 60);
    let lineY = textStartY;
    for (const line of lines) {
      ctx.fillText(line, boxX + 30, lineY);
      lineY += 26;
      if (lineY > boxY + boxH - 20) break;
    }

    if (!this.finishDisplay_ && this.displayedLength_ < this.text_.length) {
      const pulse = Math.sin(Date.now() * 0.005) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(200, 150, 50, ${pulse})`;
      ctx.font = '16px serif';
      ctx.fillText('▼', boxX + boxW - 40, boxY + boxH - 20);
    }
    ctx.textAlign = 'start';
  }

  private wrapText(
    ctx: CanvasRenderingContext2D, text: string, maxWidth: number
  ): string[] {
    const lines: string[] = [];
    let current = '';
    for (const char of text) {
      if (char === '\n') {
        lines.push(current);
        current = '';
        continue;
      }
      const test = current + char;
      if (ctx.measureText(test).width > maxWidth) {
        lines.push(current);
        current = char;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
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