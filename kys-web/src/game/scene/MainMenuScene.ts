import { RunNode } from './RunNode';
import { Engine } from '../core/Engine';
import { Audio } from '../core/Audio';

export class MainMenuScene extends RunNode {
  private menuItems_: string[] = ['新的故事', '继续游戏', '读取存档', '系统设置', '离开江湖'];
  private selectedIndex_: number = 0;
  private bgImage_: ImageBitmap | HTMLImageElement | null = null;
  private itemYOffsets_: number[] = [];
  private canExit_: boolean = false;

  constructor() {
    super();
    this.fullWindow_ = 1;
    this.recalcItemPositions();
  }

  private recalcItemPositions(): void {
    this.itemYOffsets_ = [];
    for (let i = 0; i < this.menuItems_.length; i++) {
      this.itemYOffsets_.push(0);
    }
  }

  async onEntrance(): Promise<void> {
    const engine = Engine.getInstance();
    try {
      this.bgImage_ = await engine.loadImage('textures/menu_bg.png');
    } catch {}
    this.selectedIndex_ = 0;
    this.canExit_ = false;
  }

  draw(): void {
    const engine = Engine.getInstance();
    const w = engine.uiWidth;
    const h = engine.uiHeight;
    const ctx = engine.offCtx;
    if (!ctx) return;

    ctx.fillStyle = '#0a0300';
    ctx.fillRect(0, 0, w, h);

    if (this.bgImage_) {
      ctx.globalAlpha = 0.25;
      ctx.drawImage(this.bgImage_, 0, 0, w, h);
      ctx.globalAlpha = 1;
    }

    const panelW = 380;
    const panelH = this.menuItems_.length * 52 + 100;
    const panelX = (w - panelW) / 2;
    const panelY = (h - panelH) / 2 - 10;

    ctx.fillStyle = 'rgba(25, 12, 4, 0.88)';
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 2;
    this.roundRect(ctx, panelX, panelY, panelW, panelH, 12);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(100, 70, 20, 0.4)';
    ctx.lineWidth = 1;
    this.roundRect(ctx, panelX + 6, panelY + 6, panelW - 12, panelH - 12, 8);
    ctx.stroke();

    ctx.fillStyle = '#C8A050';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('江 湖 之 旅', panelX + panelW / 2, panelY + 52);
    ctx.textAlign = 'start';

    ctx.strokeStyle = '#6B4914';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, panelY + 72);
    ctx.lineTo(panelX + panelW - 30, panelY + 72);
    ctx.stroke();

    const itemStartY = panelY + 90;
    const itemH = 48;
    const itemSpacing = 4;

    for (let i = 0; i < this.menuItems_.length; i++) {
      const iy = itemStartY + i * (itemH + itemSpacing) + this.itemYOffsets_[i];
      const isSelected = i === this.selectedIndex_;

      if (isSelected) {
        ctx.fillStyle = 'rgba(139, 105, 20, 0.35)';
        this.roundRect(ctx, panelX + 24, iy - 4, panelW - 48, itemH + 2, 6);
        ctx.fill();

        const glowPulse = Math.sin(Date.now() * 0.005) * 4 + 8;
        ctx.shadowColor = 'rgba(220, 160, 50, 0.7)';
        ctx.shadowBlur = glowPulse;
        ctx.fillStyle = '#D4A030';
        ctx.font = 'bold 22px serif';
        ctx.textAlign = 'center';
        ctx.fillText('▶  ' + this.menuItems_[i], panelX + panelW / 2, iy + itemH / 2 + 3);
        ctx.shadowBlur = 0;
        ctx.textAlign = 'start';
      } else {
        ctx.fillStyle = '#7A6A4A';
        ctx.font = '20px serif';
        ctx.textAlign = 'center';
        ctx.fillText('    ' + this.menuItems_[i], panelX + panelW / 2, iy + itemH / 2 + 2);
        ctx.textAlign = 'start';
      }
    }

    ctx.fillStyle = 'rgba(80, 60, 30, 0.5)';
    ctx.font = '12px serif';
    ctx.textAlign = 'center';
    ctx.fillText('↑↓ 选择  Enter 确定  Esc 取消', w / 2, panelY + panelH + 24);
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
    Audio.getInstance().playSE('cursor.mp3');
    this.exitWithResult(this.selectedIndex_);
  }

  onPressedCancel(): void {
    this.selectedIndex_ = this.menuItems_.length - 1;
    Audio.getInstance().playSE('cancel.mp3');
    this.exitWithResult(-1);
  }
}