import { RunNode, NodeState } from '../scene/RunNode';
import { Engine } from '../core/Engine';
import { Color } from '../utils/math';

export class Button extends RunNode {
  private text_: string = '';
  private textColor_: Color = { r: 200, g: 160, b: 80, a: 255 };
  private hoverColor_: Color = { r: 220, g: 180, b: 100, a: 255 };
  private normalColor_: Color = { r: 180, g: 140, b: 60, a: 255 };
  private bgColor_: Color = { r: 40, g: 20, b: 10, a: 200 };
  private hoverBgColor_: Color = { r: 60, g: 30, b: 15, a: 220 };
  private fontSize_: number = 20;
  private onClick_: (() => void) | null = null;

  constructor(text: string, x: number, y: number, w: number, h: number) {
    super();
    this.text_ = text;
    this.x_ = x;
    this.y_ = y;
    this.w_ = w;
    this.h_ = h;
  }

  setText(text: string): void {
    this.text_ = text;
  }

  setOnClick(callback: () => void): void {
    this.onClick_ = callback;
  }

  draw(): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    const isHover = this.mouseIn();
    const isPressed = this.state_ === NodeState.Press;

    const bgColor = isHover || isPressed ? this.hoverBgColor_ : this.bgColor_;
    ctx.fillStyle = `rgba(${bgColor.r},${bgColor.g},${bgColor.b},${bgColor.a / 255})`;
    ctx.strokeStyle = isHover ? '#C8A050' : '#8B6914';
    ctx.lineWidth = isHover ? 2 : 1;

    this.roundRect(ctx, this.x_, this.y_, this.w_, this.h_, 6);
    ctx.fill();
    ctx.stroke();

    const tc = isHover ? this.hoverColor_ : this.normalColor_;
    ctx.fillStyle = `rgb(${tc.r},${tc.g},${tc.b})`;
    ctx.font = `${this.fontSize_}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text_, this.x_ + this.w_ / 2, this.y_ + this.h_ / 2);
    ctx.textAlign = 'start';
    ctx.textBaseline = 'alphabetic';
  }

  dealEvent(): void {
    if (this.mouseIn() && Engine.getInstance().isMouseButtonJustPressed(0)) {
      if (this.onClick_) {
        this.onClick_();
      }
    }
  }

  onPressedOK(): void {
    if (this.onClick_) {
      this.onClick_();
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