import { RunNode, NodeState, Direction } from './RunNode';
import { Engine } from '../core/Engine';
import { Audio } from '../core/Audio';

export class MainMenuScene extends RunNode {
  private menuItems_: string[] = ['新的故事', '读取存档', '系统设置', '离开江湖'];
  private selectedIndex_: number = 0;
  private bgImage_: ImageBitmap | HTMLImageElement | null = null;

  constructor() {
    super();
    this.fullWindow_ = 1;
  }

  async onEntrance(): Promise<void> {
    const engine = Engine.getInstance();
    try {
      this.bgImage_ = await engine.loadImage('textures/menu_bg.png');
    } catch {
      this.bgImage_ = null;
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
      ctx.globalAlpha = 0.3;
      ctx.drawImage(this.bgImage_, 0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    const panelW = 360;
    const panelH = 380;
    const panelX = (w - panelW) / 2;
    const panelY = (h - panelH) / 2 - 30;

    ctx.fillStyle = 'rgba(30, 15, 5, 0.85)';
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    this.roundRect(ctx, panelX, panelY, panelW, panelH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#6B4914';
    ctx.lineWidth = 1;
    this.roundRect(ctx, panelX + 6, panelY + 6, panelW - 12, panelH - 12, 8);
    ctx.stroke();

    ctx.fillStyle = '#C8A050';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText('江湖之路', panelX + panelW / 2, panelY + 60);

    ctx.strokeStyle = '#6B4914';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 40, panelY + 80);
    ctx.lineTo(panelX + panelW - 40, panelY + 80);
    ctx.stroke();

    const itemStartY = panelY + 110;
    const itemHeight = 50;
    const itemSpacing = 4;

    for (let i = 0; i < this.menuItems_.length; i++) {
      const iy = itemStartY + i * (itemHeight + itemSpacing);
      const isSelected = i === this.selectedIndex_;

      if (isSelected) {
        ctx.fillStyle = 'rgba(139, 105, 20, 0.3)';
        ctx.fillRect(panelX + 30, iy - 2, panelW - 60, itemHeight + 4);

        ctx.fillStyle = '#D4A040';
        ctx.font = 'bold 24px serif';
        ctx.fillText('▶ ' + this.menuItems_[i], panelX + panelW / 2, iy + itemHeight / 2 + 2);

        const pulse = Math.sin(Date.now() * 0.005) * 3 + 7;
        ctx.shadowColor = 'rgba(200, 150, 50, 0.6)';
        ctx.shadowBlur = pulse;
        ctx.fillText('▶ ' + this.menuItems_[i], panelX + panelW / 2, iy + itemHeight / 2 + 2);
        ctx.shadowBlur = 0;
      } else {
        ctx.fillStyle = '#8B7A5A';
        ctx.font = '22px serif';
        ctx.fillText('    ' + this.menuItems_[i], panelX + panelW / 2, iy + itemHeight / 2 + 2);
      }
    }

    ctx.fillStyle = '#6B5A3A';
    ctx.font = '14px serif';
    ctx.textAlign = 'center';
    ctx.fillText('基于 kys-cpp 移植 | BSD 3-Clause', w / 2, h - 30);
    ctx.textAlign = 'start';
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

  dealEvent(): void {
    const engine = Engine.getInstance();

    if (engine.isKeyJustPressed('ArrowUp')) {
      this.selectedIndex_ = (this.selectedIndex_ - 1 + this.menuItems_.length) % this.menuItems_.length;
    }
    if (engine.isKeyJustPressed('ArrowDown')) {
      this.selectedIndex_ = (this.selectedIndex_ + 1) % this.menuItems_.length;
    }
  }

  onPressedOK(): void {
    this.exitWithResult(this.selectedIndex_);
  }

  onPressedCancel(): void {
    if (this.selectedIndex_ === this.menuItems_.length - 1) {
      this.exitWithResult(-1);
    } else {
      this.selectedIndex_ = this.menuItems_.length - 1;
    }
  }
}