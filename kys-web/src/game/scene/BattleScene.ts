import { Scene } from './Scene';
import { RunNode } from './RunNode';
import { Engine } from '../core/Engine';
import {
  BattleMode, Towards, Role, Point,
  BATTLEMAP_COORD_COUNT, BATTLE_ENEMY_COUNT,
  MAN_PIC_0, MAN_PIC_COUNT, ANIMATION_DELAY
} from '../data/Types';
import { Menu } from '../ui/Menu';
import { TextBox } from '../ui/TextBox';

enum BattleState {
  Begin,
  SelectAction,
  SelectTarget,
  SelectMagic,
  SelectItem,
  Action,
  Animation,
  Exp,
  End,
}

export class BattleScene extends Scene {
  private mode_: BattleMode = BattleMode.TurnBased;
  private battleState_: BattleState = BattleState.Begin;
  private turnCount_: number = 0;
  private turnOrder_: number[] = [];
  private currentActor_: number = 0;
  private selectedAction_: number = 0;
  private selectedMagic_: number = -1;
  private selectedItem_: number = -1;
  private selectedTarget_: number = -1;

  private actionMenu_: Menu | null = null;
  private magicMenu_: Menu | null = null;
  private itemMenu_: Menu | null = null;
  private targetMenu_: Menu | null = null;
  private textBox_: TextBox | null = null;
  private resultText_: TextBox | null = null;

  private teamRoles_: Role[] = [];
  private enemies_: Role[] = [];
  private turnOrderRoles_: Role[] = [];

  private cursorX_: number = 0;
  private cursorY_: number = 0;
  private actionAnimationFrame_: number = 0;
  private actionAnimationCount_: number = 0;
  private moveAnimation_: boolean = false;
  private moveFrom_: Point = { x: 0, y: 0 };
  private moveTo_: Point = { x: 0, y: 0 };
  private moveProgress_: number = 0;

  private showNumberAnimations_: { x: number; y: number; text: string; color: string; timer: number; }[] = [];
  private deadAlpha_: Map<Role, number> = new Map();

  private battleResult_: number = 0;
  private showExp_: boolean = false;
  private showExpTimer_: number = 0;
  private totalExpGot_: number = 0;

  private personTextures_: Map<number, ImageBitmap> = new Map();
  private effectTextures_: Map<number, ImageBitmap> = new Map();

  constructor() {
    super();
    this.fullWindow_ = 1;
    this.coordCount = BATTLEMAP_COORD_COUNT;
  }

  setMode(mode: BattleMode): void {
    this.mode_ = mode;
  }

  setTeamRoles(roles: Role[]): void {
    this.teamRoles_ = roles;
  }

  setEnemies(roles: Role[]): void {
    this.enemies_ = roles;
  }

  async onEntrance(): Promise<void> {
    this.calViewRegion();
    this.turnCount_ = 0;
    this.battleState_ = BattleState.Begin;
    this.showNumberAnimations_ = [];
    this.deadAlpha_.clear();
    this.totalExpGot_ = 0;

    this.actionMenu_ = new Menu(Engine.getInstance().uiWidth - 260, 60, 240);
    this.actionMenu_.setItems([
      { text: '攻击', enabled: true, tag: 0 },
      { text: '武学', enabled: true, tag: 1 },
      { text: '物品', enabled: true, tag: 2 },
      { text: '防御', enabled: true, tag: 3 },
      { text: '逃跑', enabled: true, tag: 4 },
    ]);
    this.actionMenu_.setStayFrame(-1);
    this.addChild(this.actionMenu_);

    this.textBox_ = new TextBox(60, Engine.getInstance().uiHeight - 160, Engine.getInstance().uiWidth - 120, 120);
    this.textBox_.setText('战斗开始！');
    this.addChild(this.textBox_);

    await this.loadTextures();
  }

  onExit(): void {
    this.clearChildren();
    this.actionMenu_ = null;
    this.magicMenu_ = null;
    this.itemMenu_ = null;
    this.targetMenu_ = null;
    this.textBox_ = null;
    this.resultText_ = null;
    this.personTextures_.clear();
    this.effectTextures_.clear();
    this.showNumberAnimations_ = [];
    this.deadAlpha_.clear();
  }

  private async loadTextures(): Promise<void> {
    const { getGeneratedTexture } = await import('../core/TextureGenerator');
    for (let i = 0; i <= 255; i++) {
      const tex = getGeneratedTexture(`person_${i}`);
      if (tex) this.personTextures_.set(i, tex);
    }
    for (let i = 1; i <= 100; i++) {
      const tex = getGeneratedTexture(`effect_${i}`);
      if (tex) this.effectTextures_.set(i, tex);
    }
  }

  backRun(): void {
    this.updateAnimation();
    this.updateShowNumbers();
    this.updateDeadAlpha();
    this.updateMoveAnimation();
  }

  private updateAnimation(): void {
    if (this.battleState_ !== BattleState.Animation) return;
    this.actionAnimationCount_++;
    if (this.actionAnimationCount_ >= ANIMATION_DELAY) {
      this.actionAnimationCount_ = 0;
      this.actionAnimationFrame_++;
    }
  }

  private updateShowNumbers(): void {
    for (let i = this.showNumberAnimations_.length - 1; i >= 0; i--) {
      this.showNumberAnimations_[i].timer--;
      if (this.showNumberAnimations_[i].timer <= 0) {
        this.showNumberAnimations_.splice(i, 1);
      }
    }
  }

  private updateDeadAlpha(): void {
    for (const [role, alpha] of this.deadAlpha_.entries()) {
      const newAlpha = Math.max(0, alpha - 2);
      if (newAlpha <= 0) {
        this.deadAlpha_.delete(role);
      } else {
        this.deadAlpha_.set(role, newAlpha);
      }
    }
  }

  private updateMoveAnimation(): void {
    if (!this.moveAnimation_) return;
    this.moveProgress_ += 0.05;
    if (this.moveProgress_ >= 1) {
      this.moveAnimation_ = false;
      this.moveProgress_ = 1;
    }
  }

  draw(): void {
    const engine = Engine.getInstance();
    const ctx = engine.offCtx;
    if (!ctx) return;

    this.drawBackground(ctx);
    this.drawBattleMap(ctx);

    for (const enemy of this.enemies_) {
      if (enemy.Dead) continue;
      this.drawRole(ctx, enemy);
    }

    for (const role of this.teamRoles_) {
      if (role.Dead) continue;
      this.drawRole(ctx, role);
    }

    this.drawActionCursor(ctx);
    this.drawShowNumbers(ctx);
    this.drawHUD(ctx);
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const engine = Engine.getInstance();
    const grad = ctx.createLinearGradient(0, 0, 0, engine.uiHeight);
    grad.addColorStop(0, '#1a2a3a');
    grad.addColorStop(0.4, '#0a1a2a');
    grad.addColorStop(0.6, '#1a1a0a');
    grad.addColorStop(1, '#1a0a00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, engine.uiWidth, engine.uiHeight);

    for (let i = 0; i < 20; i++) {
      const x = (i * 137 + this.turnCount_ * 2) % engine.uiWidth;
      const y = (i * 89) % Math.floor(engine.uiHeight * 0.6);
      ctx.fillStyle = 'rgba(200, 200, 180, 0.05)';
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawBattleMap(ctx: CanvasRenderingContext2D): void {
    const engine = Engine.getInstance();
    const w = engine.uiWidth;
    const h = engine.uiHeight;
    const TW = Scene.TILE_W;
    const TH = Scene.TILE_H;
    const battleCenterX = w * 0.4;
    const battleCenterY = h * 0.5;

    for (let y = -2; y < h / TH + 2; y++) {
      for (let x = -2; x < w / (2 * TW) + 2; x++) {
        const sx = -y * TW + x * TW + battleCenterX;
        const sy = y * TH + x * TH + battleCenterY;

        const ci = ((x + y) & 3);
        const colors = ['#1a2030', '#1c2232', '#1a2133', '#1e2435'];
        ctx.fillStyle = colors[ci];
        ctx.strokeStyle = '#2a3040';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(sx, sy + TH);
        ctx.lineTo(sx + TW, sy);
        ctx.lineTo(sx + 2 * TW, sy + TH);
        ctx.lineTo(sx + TW, sy + 2 * TH);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  private getBattlePosition(mapX: number, mapY: number): { sx: number; sy: number } {
    const engine = Engine.getInstance();
    const w = engine.uiWidth;
    const h = engine.uiHeight;
    const TW = Scene.TILE_W;
    const TH = Scene.TILE_H;
    const battleCenterX = w * 0.4;
    const battleCenterY = h * 0.5;

    return {
      sx: -mapY * TW + mapX * TW + battleCenterX,
      sy: mapY * TH + mapX * TH + battleCenterY,
    };
  }

  private drawRole(ctx: CanvasRenderingContext2D, role: Role): void {
    const pos = this.getBattlePosition(role.X_, role.Y_);
    const alpha = this.deadAlpha_.get(role);
    if (alpha !== undefined) {
      ctx.globalAlpha = alpha / 255;
    }

    const tex = this.personTextures_.get(role.Pic);
    if (tex) {
      ctx.drawImage(tex, pos.sx - 18, pos.sy - 36, 36, 48);
    } else {
      const isTeam = role.Team === 0;
      ctx.fillStyle = isTeam ? '#4488cc' : '#c04040';
      ctx.beginPath();
      ctx.arc(pos.sx, pos.sy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (alpha !== undefined) {
      ctx.globalAlpha = 1;
    }

    const hpRatio = role.HP / role.MaxHP;
    const hpBarW = 40;
    ctx.fillStyle = '#333';
    ctx.fillRect(pos.sx - hpBarW / 2, pos.sy - 42, hpBarW, 5);
    ctx.fillStyle = hpRatio > 0.5 ? '#44cc44' : hpRatio > 0.25 ? '#cccc44' : '#cc4444';
    ctx.fillRect(pos.sx - hpBarW / 2, pos.sy - 42, hpBarW * hpRatio, 5);

    ctx.fillStyle = '#aaa';
    ctx.font = '11px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${role.HP}/${role.MaxHP}`, pos.sx, pos.sy - 46);

    if (role.Show.ShowStrings.length > 0) {
      ctx.fillStyle = '#ff0';
      ctx.font = '12px serif';
      for (let i = 0; i < role.Show.ShowStrings.length; i++) {
        ctx.fillText(role.Show.ShowStrings[i].Text, pos.sx, pos.sy - 55 - i * 14);
      }
    }
    ctx.textAlign = 'left';
  }

  private drawActionCursor(ctx: CanvasRenderingContext2D): void {
    if (this.battleState_ !== BattleState.SelectTarget && this.battleState_ !== BattleState.SelectAction) return;
    const pos = this.getBattlePosition(this.cursorX_, this.cursorY_);

    ctx.strokeStyle = '#ff0';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.strokeRect(pos.sx - 20, pos.sy - 40, 40, 50);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
    ctx.fillRect(pos.sx - 20, pos.sy - 40, 40, 50);
  }

  private drawShowNumbers(ctx: CanvasRenderingContext2D): void {
    for (const anim of this.showNumberAnimations_) {
      const y = anim.y - (60 - anim.timer) * 0.5;
      ctx.fillStyle = anim.color;
      ctx.font = `bold 18px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(anim.text, anim.x, y);
    }
    ctx.textAlign = 'left';
  }

  private drawHUD(ctx: CanvasRenderingContext2D): void {
    const engine = Engine.getInstance();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, engine.uiWidth, 50);
    ctx.fillStyle = '#aaa';
    ctx.font = '14px serif';
    ctx.textAlign = 'right';
    ctx.fillText(`回合: ${this.turnCount_}  模式: ${BattleMode[this.mode_]}`, engine.uiWidth - 10, 30);
    ctx.textAlign = 'left';

    if (this.showExp_) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(engine.uiWidth / 2 - 120, engine.uiHeight / 2 - 30, 240, 60);
      ctx.strokeStyle = '#8B6914';
      ctx.strokeRect(engine.uiWidth / 2 - 120, engine.uiHeight / 2 - 30, 240, 60);
      ctx.fillStyle = '#D4A040';
      ctx.font = 'bold 20px serif';
      ctx.textAlign = 'center';
      ctx.fillText(`获得经验: +${this.totalExpGot_}`, engine.uiWidth / 2, engine.uiHeight / 2);
      ctx.textAlign = 'left';
    }
  }

  dealEvent(): void {
    const engine = Engine.getInstance();
    if (this.battleState_ === BattleState.SelectAction) {
      if (this.actionMenu_) {
        if (engine.isKeyJustPressed('ArrowUp')) {
          const idx = this.actionMenu_.getSelectedIndex();
          this.actionMenu_.forceActiveChild((idx - 1 + 5) % 5);
        }
        if (engine.isKeyJustPressed('ArrowDown')) {
          const idx = this.actionMenu_.getSelectedIndex();
          this.actionMenu_.forceActiveChild((idx + 1) % 5);
        }
      }
    }

    if (this.battleState_ === BattleState.SelectTarget) {
      if (engine.isKeyJustPressed('ArrowLeft')) this.cursorX_--;
      if (engine.isKeyJustPressed('ArrowRight')) this.cursorX_++;
      if (engine.isKeyJustPressed('ArrowUp')) this.cursorY_--;
      if (engine.isKeyJustPressed('ArrowDown')) this.cursorY_++;
      this.cursorX_ = Math.max(0, Math.min(BATTLEMAP_COORD_COUNT - 1, this.cursorX_));
      this.cursorY_ = Math.max(0, Math.min(BATTLEMAP_COORD_COUNT - 1, this.cursorY_));
    }
  }

  onPressedOK(): void {
    switch (this.battleState_) {
      case BattleState.Begin:
        this.battleState_ = BattleState.SelectAction;
        this.turnCount_ = 1;
        break;

      case BattleState.SelectAction:
        this.selectedAction_ = this.actionMenu_ ? this.actionMenu_.getSelectedIndex() : 0;
        if (this.selectedAction_ === 0) {
          this.battleState_ = BattleState.SelectTarget;
        } else if (this.selectedAction_ === 1) {
          this.battleState_ = BattleState.SelectMagic;
        } else if (this.selectedAction_ === 2) {
          this.battleState_ = BattleState.SelectItem;
        } else if (this.selectedAction_ === 3) {
          this.performDefend();
        } else if (this.selectedAction_ === 4) {
          this.performEscape();
        }
        break;

      case BattleState.SelectTarget:
        this.performAttack();
        break;

      case BattleState.Animation:
        this.battleState_ = BattleState.SelectAction;
        break;

      case BattleState.Exp:
        this.battleState_ = BattleState.End;
        break;

      case BattleState.End:
        this.exitWithResult(this.battleResult_);
        break;
    }
  }

  onPressedCancel(): void {
    if (this.battleState_ === BattleState.SelectTarget ||
        this.battleState_ === BattleState.SelectMagic ||
        this.battleState_ === BattleState.SelectItem) {
      this.battleState_ = BattleState.SelectAction;
    }
  }

  private performAttack(): void {
    const attacker = this.teamRoles_[0];
    if (!attacker || attacker.Dead) return;

    let targetIdx = -1;
    for (let i = 0; i < this.enemies_.length; i++) {
      const e = this.enemies_[i];
      if (!e.Dead) {
        targetIdx = i;
        break;
      }
    }
    if (targetIdx < 0) return;

    const target = this.enemies_[targetIdx];
    const damage = this.calPhysicalHurt(attacker, target);
    target.HP = Math.max(0, target.HP - damage);
    target.Show.BattleHurt = damage;

    const pos = this.getBattlePosition(target.X_, target.Y_);
    this.showNumberAnimations_.push({
      x: pos.sx, y: pos.sy - 20,
      text: `-${damage}`,
      color: '#ff4444',
      timer: 60,
    });

    if (target.HP <= 0) {
      target.Dead = 1;
      this.deadAlpha_.set(target, 255);
    }

    this.battleState_ = BattleState.Animation;
    this.actionAnimationFrame_ = 0;
    setTimeout(() => this.onAnimationEnd(), 1500);
  }

  private performDefend(): void {
    this.showNumberAnimations_.push({
      x: 200, y: 400,
      text: '进入防御姿态',
      color: '#44aaff',
      timer: 40,
    });
    this.battleState_ = BattleState.Animation;
    setTimeout(() => this.onAnimationEnd(), 800);
  }

  private performEscape(): void {
    if (Math.random() < 0.5) {
      this.showNumberAnimations_.push({
        x: 400, y: 300,
        text: '逃跑成功！',
        color: '#44ff44',
        timer: 60,
      });
      this.battleResult_ = 1;
      this.battleState_ = BattleState.End;
    } else {
      this.showNumberAnimations_.push({
        x: 400, y: 300,
        text: '逃跑失败！',
        color: '#ff4444',
        timer: 40,
      });
      this.battleState_ = BattleState.Animation;
      setTimeout(() => this.onAnimationEnd(), 800);
    }
  }

  private calPhysicalHurt(attacker: Role, defender: Role): number {
    const baseHurt = attacker.Attack - defender.Defence / 2;
    const randomFactor = 0.9 + Math.random() * 0.2;
    return Math.max(1, Math.floor(baseHurt * randomFactor));
  }

  private calMagicHurt(magic: { Attack: number[] }, attacker: Role, defender: Role): number {
    const level = 1;
    const attack = magic.Attack[Math.min(level, magic.Attack.length - 1)];
    const baseHurt = attack - defender.Defence / 3;
    const randomFactor = 0.85 + Math.random() * 0.3;
    return Math.max(1, Math.floor(baseHurt * randomFactor));
  }

  private onAnimationEnd(): void {
    let allDead = true;
    for (const e of this.enemies_) {
      if (!e.Dead) { allDead = false; break; }
    }

    if (allDead) {
      this.battleResult_ = 1;
      this.totalExpGot_ = this.calTotalExp();
      this.showExp_ = true;
      this.showExpTimer_ = 120;
      this.battleState_ = BattleState.Exp;
    } else {
      this.battleState_ = BattleState.SelectAction;
    }
  }

  private calTotalExp(): number {
    let exp = 0;
    for (const e of this.enemies_) {
      if (e.Dead) {
        exp += e.Level * 10;
      }
    }
    return exp;
  }
}