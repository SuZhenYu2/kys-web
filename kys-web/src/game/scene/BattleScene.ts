import { Scene } from './Scene';
import { RunNode } from './RunNode';
import { Engine } from '../core/Engine';
import { BattleMode } from '../data/Types';

export class BattleScene extends Scene {
  private mode_: BattleMode = BattleMode.TurnBased;
  private turnCount_: number = 0;
  private selectedAction_: number = 0;
  private actionMenuItems_: string[] = ['攻击', '武学', '物品', '防御', '逃跑'];
  private isPlayerTurn_: boolean = true;
  private messageText_: string = '';

  constructor() {
    super();
    this.fullWindow_ = 1;
  }

  setMode(mode: BattleMode): void {
    this.mode_ = mode;
  }

  async onEntrance(): Promise<void> {
    this.turnCount_ = 0;
    this.isPlayerTurn_ = true;
    this.selectedAction_ = 0;
    this.messageText_ = '战斗开始！';
  }

  backRun(): void {
    if (!this.isPlayerTurn_) {
      this.handleAI();
    }
  }

  private handleAI(): void {
    this.isPlayerTurn_ = true;
    this.turnCount_++;
    this.messageText_ = `回合 ${this.turnCount_} - 请选择行动`;
  }

  draw(): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    this.drawBackground(ctx);
    this.drawEnemy(ctx);
    this.drawPlayer(ctx);
    this.drawActionMenu(ctx);
    this.drawMessage(ctx);
    this.drawHUD(ctx);
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const engine = Engine.getInstance();
    const grad = ctx.createLinearGradient(0, 0, 0, engine.uiHeight);
    grad.addColorStop(0, '#1a2a3a');
    grad.addColorStop(0.5, '#2a1a0a');
    grad.addColorStop(1, '#1a0a00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, engine.uiWidth, engine.uiHeight);
  }

  private drawEnemy(ctx: CanvasRenderingContext2D): void {
    const engine = Engine.getInstance();
    const cx = engine.uiWidth * 0.5;
    const cy = engine.uiHeight * 0.2;

    ctx.fillStyle = '#c04040';
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ff6666';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('强敌', cx, cy + 8);

    ctx.fillStyle = '#333';
    ctx.fillRect(cx - 80, cy - 60, 160, 12);
    ctx.fillStyle = '#c04040';
    ctx.fillRect(cx - 80, cy - 60, 160, 12);

    ctx.fillStyle = '#aaa';
    ctx.font = '14px serif';
    ctx.fillText('HP: 500/500', cx, cy - 70);
    ctx.textAlign = 'start';
  }

  private drawPlayer(ctx: CanvasRenderingContext2D): void {
    const engine = Engine.getInstance();
    const cx = engine.uiWidth * 0.3;
    const cy = engine.uiHeight * 0.55;

    ctx.fillStyle = '#4080c0';
    ctx.beginPath();
    ctx.arc(cx, cy, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('主角', cx, cy + 7);

    ctx.fillStyle = '#333';
    ctx.fillRect(cx - 70, cy - 50, 140, 10);
    ctx.fillStyle = '#4080c0';
    ctx.fillRect(cx - 70, cy - 50, 140, 10);

    ctx.fillStyle = '#aaa';
    ctx.font = '12px serif';
    ctx.fillText('HP: 200/200  MP: 100/100', cx, cy - 58);
    ctx.textAlign = 'start';
  }

  private drawActionMenu(ctx: CanvasRenderingContext2D): void {
    if (!this.isPlayerTurn_) return;

    const engine = Engine.getInstance();
    const menuX = engine.uiWidth * 0.55;
    const menuY = engine.uiHeight * 0.4;
    const menuW = 200;
    const itemH = 36;

    ctx.fillStyle = 'rgba(20, 10, 5, 0.85)';
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1;
    ctx.fillRect(menuX, menuY, menuW, this.actionMenuItems_.length * itemH + 8);
    ctx.strokeRect(menuX, menuY, menuW, this.actionMenuItems_.length * itemH + 8);

    for (let i = 0; i < this.actionMenuItems_.length; i++) {
      const iy = menuY + 4 + i * itemH;
      const isSelected = i === this.selectedAction_;

      if (isSelected) {
        ctx.fillStyle = 'rgba(139, 105, 20, 0.4)';
        ctx.fillRect(menuX + 2, iy, menuW - 4, itemH);
      }

      ctx.fillStyle = isSelected ? '#D4A040' : '#8B7A5A';
      ctx.font = `${isSelected ? 20 : 18}px serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      const prefix = isSelected ? '▸ ' : '    ';
      ctx.fillText(prefix + this.actionMenuItems_[i], menuX + 16, iy + itemH / 2 + 1);
    }
    ctx.textAlign = 'start';
  }

  private drawMessage(ctx: CanvasRenderingContext2D): void {
    if (!this.messageText_) return;
    const engine = Engine.getInstance();
    const my = engine.uiHeight - 60;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(20, my, engine.uiWidth - 40, 44);
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, my, engine.uiWidth - 40, 44);

    ctx.fillStyle = '#D4C090';
    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.messageText_, engine.uiWidth / 2, my + 26);
    ctx.textAlign = 'start';
  }

  private drawHUD(ctx: CanvasRenderingContext2D): void {
    const engine = Engine.getInstance();
    ctx.fillStyle = '#8B7A5A';
    ctx.font = '14px serif';
    ctx.textAlign = 'right';
    ctx.fillText(`模式: ${BattleMode[this.mode_]} | 回合: ${this.turnCount_}`, engine.uiWidth - 20, 24);
    ctx.textAlign = 'start';
  }

  dealEvent(): void {
    if (!this.isPlayerTurn_) return;
    const engine = Engine.getInstance();

    if (engine.isKeyJustPressed('ArrowUp')) {
      this.selectedAction_ = (this.selectedAction_ - 1 + this.actionMenuItems_.length) % this.actionMenuItems_.length;
    }
    if (engine.isKeyJustPressed('ArrowDown')) {
      this.selectedAction_ = (this.selectedAction_ + 1) % this.actionMenuItems_.length;
    }
  }

  onPressedOK(): void {
    if (!this.isPlayerTurn_) return;

    switch (this.selectedAction_) {
      case 0:
        this.messageText_ = '发起攻击！';
        break;
      case 1:
        this.messageText_ = '选择武学...';
        break;
      case 2:
        this.messageText_ = '打开物品栏...';
        break;
      case 3:
        this.messageText_ = '进入防御姿态...';
        break;
      case 4:
        this.messageText_ = '尝试逃跑...';
        break;
    }

    this.isPlayerTurn_ = false;
    setTimeout(() => this.handleAI(), 1000);
  }

  onPressedCancel(): void {
    this.selectedAction_ = 4;
    this.onPressedOK();
  }
}