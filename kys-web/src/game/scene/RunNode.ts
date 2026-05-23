import { Engine } from '../core/Engine';

export interface GameEvent {
  type: 'keydown' | 'keyup' | 'mousedown' | 'mouseup' | 'mousemove';
  key?: string;
  button?: number;
  x?: number;
  y?: number;
}

export enum NodeState {
  Normal = 0,
  Pass = 1,
  Press = 2,
}

export enum Direction {
  None = 0,
  Left = 1,
  Up = 2,
  Right = 3,
  Down = 4,
}

export { Direction as Dir };

export class RunNode {
  static root: RunNode[] = [];
  static refreshInterval: number = 16.67;
  static renderMessage: number = 0;

  protected children_: RunNode[] = [];
  protected visible_: boolean = true;
  protected result_: number = -1;
  protected fullWindow_: number = 0;
  protected exit_: boolean = false;
  protected running_: boolean = false;
  protected state_: NodeState = NodeState.Normal;
  protected tag_: number = 0;

  protected x_: number = 0;
  protected y_: number = 0;
  protected w_: number = 0;
  protected h_: number = 0;

  protected activeChild_: number = -1;
  protected dark_: number = 0;
  protected stayFrame_: number = -1;
  protected currentFrame_: number = 0;
  protected dealEvent_: number = 1;

  protected prevPresentTicks_: number = 0;

  get x(): number { return this.x_; }
  get y(): number { return this.y_; }
  get w(): number { return this.w_; }
  get h(): number { return this.h_; }
  get visible(): boolean { return this.visible_; }
  get result(): number { return this.result_; }
  get state(): NodeState { return this.state_; }
  get children(): RunNode[] { return this.children_; }
  get childCount(): number { return this.children_.length; }

  setPosition(x: number, y: number): void {
    this.x_ = x;
    this.y_ = y;
  }

  setSize(w: number, h: number): void {
    this.w_ = w;
    this.h_ = h;
  }

  setVisible(v: boolean): void {
    this.visible_ = v;
  }

  setResult(r: number): void {
    this.result_ = r;
  }

  setState(s: NodeState): void {
    this.state_ = s;
  }

  setTag(t: number): void {
    this.tag_ = t;
  }

  getTag(): number {
    return this.tag_;
  }

  setStayFrame(s: number): void {
    this.stayFrame_ = s;
  }

  setIsDark(d: number): void {
    this.dark_ = d;
  }

  getDealEvent(): number {
    return this.dealEvent_;
  }

  setDealEvent(d: number): void {
    this.dealEvent_ = d;
  }

  setExit(e: boolean): void {
    this.exit_ = e;
  }

  isRunning(): boolean {
    return this.running_;
  }

  exitWithResult(r: number): void {
    this.setExit(true);
    this.result_ = r;
  }

  isFullWindow(): boolean {
    return this.fullWindow_ > 0;
  }

  inSide(x: number, y: number): boolean {
    if (!this.visible_) return false;
    const engine = Engine.getInstance();
    const { ux, uy } = engine.windowToUISpace(x, y);
    return ux > this.x_ && ux < this.x_ + this.w_ && uy > this.y_ && uy < this.y_ + this.h_;
  }

  mouseIn(): boolean {
    const { x, y } = Engine.getInstance().getMouseState();
    return this.inSide(x, y);
  }

  checkPrevTimeElapsed(ms: number): boolean {
    const t = Engine.getTicks();
    if (t - this.prevPresentTicks_ >= ms) {
      this.prevPresentTicks_ = t;
      return true;
    }
    return false;
  }

  addChild<T extends RunNode>(child: T, x?: number, y?: number): T {
    if (x !== undefined && y !== undefined) {
      child.setPosition(x, y);
    }
    this.children_.push(child);
    if (this.activeChild_ < 0) {
      this.activeChild_ = 0;
    }
    return child;
  }

  removeChild(element: RunNode): void {
    const idx = this.children_.indexOf(element);
    if (idx >= 0) {
      this.children_.splice(idx, 1);
    }
  }

  getChild(index: number): RunNode | undefined {
    return this.children_[index];
  }

  clearChildren(): void {
    this.children_ = [];
    this.activeChild_ = -1;
  }

  getActiveChildIndex(): number {
    return this.activeChild_;
  }

  forceActiveChild(index?: number): void {
    if (index !== undefined) {
      this.activeChild_ = index;
    }
    if (this.activeChild_ < 0 && this.children_.length > 0) {
      this.activeChild_ = 0;
    }
  }

  findFirstVisibleChild(): number {
    for (let i = 0; i < this.children_.length; i++) {
      if (this.children_[i].visible_) return i;
    }
    return -1;
  }

  findNextVisibleChild(fromIndex: number, direction: Direction): number {
    const len = this.children_.length;
    if (len === 0) return -1;

    let i = fromIndex;
    const inc = direction === Direction.Down || direction === Direction.Right ? 1 : -1;
    for (let step = 0; step < len; step++) {
      i = (i + inc + len) % len;
      if (this.children_[i].visible_) return i;
    }
    return -1;
  }

  setAllChildState(s: NodeState): void {
    for (const child of this.children_) {
      child.state_ = s;
    }
  }

  setAllChildVisible(v: boolean): void {
    for (const child of this.children_) {
      child.visible_ = v;
    }
  }

  checkFrame(): void {
    if (this.stayFrame_ > 0) {
      this.currentFrame_++;
      if (this.currentFrame_ >= this.stayFrame_) {
        this.exitWithResult(0);
      }
    }
  }

  isPressOK(): boolean {
    const engine = Engine.getInstance();
    return engine.isKeyJustPressed('Enter') ||
           engine.isKeyJustPressed(' ') ||
           engine.isMouseButtonJustPressed(0);
  }

  isPressCancel(): boolean {
    const engine = Engine.getInstance();
    return engine.isKeyJustPressed('Escape') ||
           engine.isMouseButtonJustPressed(2);
  }

  onEntrance(): void {}
  onExit(): void {}
  backRun(): void {}
  draw(): void {}
  dealEvent(): void {}
  dealEvent2(): void {}

  onPressedOK(): void {
    this.exitWithResult(0);
  }

  onPressedCancel(): void {
    this.exitWithResult(-1);
  }

  async run(inRoot: boolean = true): Promise<number> {
    if (inRoot) {
      RunNode.root.push(this);
    }
    this.running_ = true;
    this.onEntrance();

    return new Promise<number>((resolve) => {
      const loop = () => {
        if (!this.running_) {
          resolve(this.result_);
          return;
        }
        if (this.exit_) {
          this.running_ = false;
          this.onExit();
          if (inRoot) {
            RunNode.removeFromDraw(this);
          }
          resolve(this.result_);
          return;
        }

        this.backRun();
        this.checkFrame();

        if (this.isPressOK()) {
          this.onPressedOK();
        }
        if (this.isPressCancel()) {
          this.onPressedCancel();
        }

        this.dealEvent();
        for (const child of this.children_) {
          if (child.visible_ && child.dealEvent_) {
            child.dealEvent();
          }
        }

        this.draw();
        for (const child of this.children_) {
          if (child.visible_) {
            child.draw();
          }
        }

        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    });
  }

  async runAtPosition(x: number, y: number, inRoot: boolean = true): Promise<number> {
    this.setPosition(x, y);
    return this.run(inRoot);
  }

  drawAndPresent(times: number = 1): void {
    for (let i = 0; i < times; i++) {
      Engine.getInstance().renderClear();
      RunNode.drawAll();
      Engine.getInstance().renderPresent();
    }
  }

  static addIntoDrawTop(element: RunNode): void {
    RunNode.root.push(element);
  }

  static removeFromDraw(element: RunNode): RunNode | null {
    const idx = RunNode.root.indexOf(element);
    if (idx >= 0) {
      RunNode.root.splice(idx, 1);
      return element;
    }
    return null;
  }

  static getCurrentTopDraw(): RunNode | null {
    return RunNode.root.length > 0 ? RunNode.root[RunNode.root.length - 1] : null;
  }

  static drawAll(): void {
    let startIndex = 0;
    for (let i = RunNode.root.length - 1; i >= 0; i--) {
      if (RunNode.root[i].isFullWindow()) {
        startIndex = i;
        break;
      }
    }

    for (let i = startIndex; i < RunNode.root.length; i++) {
      const node = RunNode.root[i];
      if (node.visible_) {
        node.draw();
        node.drawChildren();
      }
    }
  }

  private drawChildren(): void {
    for (const child of this.children_) {
      if (child.visible_) {
        child.draw();
        child.drawChildren();
      }
    }
  }

  static exitAll(begin: number = 0): void {
    for (let i = begin; i < RunNode.root.length; i++) {
      RunNode.root[i].setExit(true);
    }
  }

  static getPointerFromRoot<T extends RunNode>(type: new (...args: never[]) => T): T | null {
    for (let i = RunNode.root.length - 1; i >= 0; i--) {
      if (RunNode.root[i] instanceof type) {
        return RunNode.root[i] as T;
      }
    }
    return null;
  }

  static topIsType<T extends RunNode>(type: new (...args: never[]) => T): boolean {
    return RunNode.root.length > 0 && RunNode.root[RunNode.root.length - 1] instanceof type;
  }
}

export const OK_EXIT = {
  onPressedOK(): void {
    this.exitWithResult(0);
  }
};

export const CANCEL_EXIT = {
  onPressedCancel(): void {
    this.exitWithResult(-1);
  }
};