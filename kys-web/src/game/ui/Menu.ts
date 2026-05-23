import { RunNode, NodeState, Direction } from '../scene/RunNode';
import { Engine } from '../core/Engine';

export interface MenuItem {
  text: string;
  enabled: boolean;
  tag: number;
}

export class Menu extends RunNode {
  private items_: MenuItem[] = [];
  private selectedIndex_: number = 0;
  private itemHeight_: number = 36;
  private fontSize_: number = 20;
  private bgColor_: string = 'rgba(30, 15, 5, 0.9)';
  private borderColor_: string = '#8B6914';
  private paddingX_: number = 20;

  constructor(x: number, y: number, w: number) {
    super();
    this.x_ = x;
    this.y_ = y;
    this.w_ = w;
  }

  setItems(items: MenuItem[]): void {
    this.items_ = items;
    this.h_ = items.length * this.itemHeight_ + 16;
    this.selectedIndex_ = 0;
  }

  getSelectedIndex(): number {
    return this.selectedIndex_;
  }

  getSelectedItem(): MenuItem | null {
    if (this.selectedIndex_ >= 0 && this.selectedIndex_ < this.items_.length) {
      return this.items_[this.selectedIndex_];
    }
    return null;
  }

  draw(): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    ctx.fillStyle = this.bgColor_;
    ctx.strokeStyle = this.borderColor_;
    ctx.lineWidth = 2;
    this.roundRect(ctx, this.x_, this.y_, this.w_, this.h_, 8);
    ctx.fill();
    ctx.stroke();

    const startY = this.y_ + 8;
    for (let i = 0; i < this.items_.length; i++) {
      const item = this.items_[i];
      const iy = startY + i * this.itemHeight_;
      const isSelected = i === this.selectedIndex_;

      if (isSelected) {
        ctx.fillStyle = 'rgba(139, 105, 20, 0.3)';
        ctx.fillRect(this.x_ + 4, iy, this.w_ - 8, this.itemHeight_);
      }

      ctx.fillStyle = item.enabled
        ? isSelected ? '#D4A040' : '#8B7A5A'
        : '#4a3a2a';
      ctx.font = `${this.fontSize_}px serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      const prefix = isSelected ? '▶ ' : '    ';
      ctx.fillText(prefix + item.text, this.x_ + this.paddingX_, iy + this.itemHeight_ / 2 + 1);
      ctx.textAlign = 'start';
    }
  }

  dealEvent(): void {
    const engine = Engine.getInstance();

    if (engine.isKeyJustPressed('ArrowUp')) {
      do {
        this.selectedIndex_ = (this.selectedIndex_ - 1 + this.items_.length) % this.items_.length;
      } while (!this.items_[this.selectedIndex_].enabled);
    }

    if (engine.isKeyJustPressed('ArrowDown')) {
      do {
        this.selectedIndex_ = (this.selectedIndex_ + 1) % this.items_.length;
      } while (!this.items_[this.selectedIndex_].enabled);
    }
  }

  onPressedOK(): void {
    this.exitWithResult(this.selectedIndex_);
  }

  onPressedCancel(): void {
    this.exitWithResult(-1);
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