export const TILE_W_0 = 18;
export const TILE_H_0 = 9;
export let TILE_W = 18;
export let TILE_H = 9;

export function setTileScale(scale: number): void {
  TILE_W = TILE_W_0 * scale;
  TILE_H = TILE_H_0 * scale;
}

export enum Towards {
  RightUp = 0,
  RightDown = 1,
  LeftUp = 2,
  LeftDown = 3,
  None = 4,
}

export const COORD_COUNT = 64;
export const MAINMAP_COORD_COUNT = 480;
export const SUBMAP_EVENT_COUNT = 200;
export const ITEM_IN_BAG_COUNT = 1000;
export const TEAMMATE_COUNT = 6;
export const ROLE_MAGIC_COUNT = 10;
export const ROLE_TAKING_ITEM_COUNT = 4;
export const ROLE_INTERNAL_COUNT = 4;
export const SHOP_ITEM_COUNT = 5;
export const MAX_MAGIC_LEVEL = 999;
export const MAX_MAGIC_LEVEL_INDEX = 9;

export const MAN_PIC_0 = 2;
export const MAN_PIC_COUNT = 4;
export const SHIP_PIC_0 = 122;
export const SHIP_PIC_COUNT = 4;
export const REST_PIC_0 = 170;
export const REST_PIC_COUNT = 2;
export const REST_INTERVAL = 20;
export const BEGIN_REST_TIME = 300;
export const BATTLEMAP_COORD_COUNT = 40;
export const BATTLE_ENEMY_COUNT = 5;
export const ANIMATION_DELAY = 2;
export const DEAD_ALPHA = 255;

export interface Point {
  x: number;
  y: number;
}

export interface Pointf {
  x: number;
  y: number;
  z?: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export enum ActType {
  None = -1,
  Medcine = 0,
  Fist = 1,
  Sword = 2,
  Knife = 3,
  Unusual = 4,
}

export enum OperationType {
  None = -1,
  Light = 0,
  Heavy = 1,
  Long = 2,
  Slash = 3,
  Item = 4,
}

export enum ItemType {
  Story = 0,
  Equipment = 1,
  Manual = 2,
  Medicine = 3,
  HiddenWeapon = 4,
}

export enum MagicType {
  Fist = 1,
  Sword = 2,
  Knife = 3,
  Unusual = 4,
}

export enum AttackAreaType {
  Point = 0,
  Line = 1,
  Cross = 2,
  Area = 3,
}

export enum BattleMode {
  TurnBased = 0,
  SemiRealtime = 1,
  Hades = 2,
  Sekiro = 3,
  Paper = 4,
}

export enum ObjectMaterial {
  None = 0,
  Water = 1,
  Wood = 2,
}

export interface RoleSave {
  ID: number;
  HeadID: number;
  IncLife: number;
  UnUse: number;
  Name: string;
  Nick: string;
  Sexual: number;
  Level: number;
  Exp: number;
  HP: number;
  MaxHP: number;
  Hurt: number;
  Poison: number;
  PhysicalPower: number;
  ExpForMakeItem: number;
  Equip0: number;
  Equip1: number;
  EquipMagic: number[];
  EquipMagic2: number[];
  EquipItem: number;
  Frame: number[];
  MPType: number;
  MP: number;
  MaxMP: number;
  Attack: number;
  Speed: number;
  Defence: number;
  Medicine: number;
  UsePoison: number;
  Detoxification: number;
  AntiPoison: number;
  Fist: number;
  Sword: number;
  Knife: number;
  Unusual: number;
  HiddenWeapon: number;
  Knowledge: number;
  Morality: number;
  AttackWithPoison: number;
  AttackTwice: number;
  Fame: number;
  IQ: number;
  PracticeItem: number;
  ExpForItem: number;
  MagicID: number[];
  MagicLevel: number[];
  TakingItem: number[];
  TakingItemCount: number[];
  InternalID: number[];
  InternalLevel: number[];
}

export interface Role extends RoleSave {
  Team: number;
  FaceTowards: number;
  Dead: number;
  Step: number;
  Pic: number;
  BattleSpeed: number;
  ExpGot: number;
  Auto: number;
  FightFrame: number[];
  FightingFrame: number;
  Moved: number;
  Acted: number;
  ActTeam: number;
  SelectedMagic: number;
  Progress: number;
  Show: RoleShowInfo;
  X_: number;
  Y_: number;
  PrevX: number;
  PrevY: number;
  AI_Action: number;
  AI_MoveX: number;
  AI_MoveY: number;
  AI_ActionX: number;
  AI_ActionY: number;
  Network_Action: number;
  Network_MoveX: number;
  Network_MoveY: number;
  Network_ActionX: number;
  Network_ActionY: number;
  Pos: Pointf;
  RealTowards: Pointf;
  Velocity: Pointf;
  Acceleration: Pointf;
  HurtFrame: number;
  CoolDown: number;
  Attention: number;
  Invincible: number;
  Frozen: number;
  Shake: number;
  HaveAction: number;
  ActType: number;
  ActFrame: number;
  PreActTimer: number;
  OperationType: number;
  OperationCount: number;
  HurtThisFrame: number;
  FindingWay: number;
  Posture: number;
  Breathless: number;
  WalkingStep: number;
}

export interface RoleShowInfo {
  ShowStrings: RoleShowString[];
  BattleHurt: number;
  ProgressChange: number;
  Effect: number;
}

export interface RoleShowString {
  Text: string;
  Color: Color;
  Size: number;
}

export interface ItemSave {
  ID: number;
  Name: string;
  Introduction: string;
  MagicID: number;
  HiddenWeaponEffectID: number;
  User: number;
  EquipType: number;
  ShowIntroduction: number;
  ItemType: number;
  AddHP: number;
  AddMaxHP: number;
  AddPoison: number;
  AddPhysicalPower: number;
  ChangeMPType: number;
  AddMP: number;
  AddMaxMP: number;
  AddAttack: number;
  AddSpeed: number;
  AddDefence: number;
  AddMedicine: number;
  AddUsePoison: number;
  AddDetoxification: number;
  AddAntiPoison: number;
  AddFist: number;
  AddSword: number;
  AddKnife: number;
  AddUnusual: number;
  AddHiddenWeapon: number;
  AddKnowledge: number;
  AddMorality: number;
  AddAttackTwice: number;
  AddAttackWithPoison: number;
  OnlySuitableRole: number;
  NeedMPType: number;
  NeedMP: number;
  NeedAttack: number;
  NeedSpeed: number;
  NeedUsePoison: number;
  NeedMedicine: number;
  NeedDetoxification: number;
  NeedFist: number;
  NeedSword: number;
  NeedKnife: number;
  NeedUnusual: number;
  NeedHiddenWeapon: number;
  NeedIQ: number;
  NeedExp: number;
  NeedExpForMakeItem: number;
  NeedMaterial: number;
  MakeItem: number[];
  MakeItemCount: number[];
}

export interface MagicSave {
  ID: number;
  Name: string;
  SoundID: number;
  MagicType: number;
  EffectID: number;
  HurtType: number;
  AttackAreaType: number;
  NeedMP: number;
  WithPoison: number;
  Attack: number[];
  SelectDistance: number[];
  AttackDistance: number[];
  AddMP: number[];
  HurtMP: number[];
}

export interface SubMapEventSave {
  CannotWalk: number;
  Index: number;
  Event1: number;
  Event2: number;
  Event3: number;
  CurrentPic: number;
  EndPic: number;
  BeginPic: number;
  PicDelay: number;
  X: number;
  Y: number;
}

export interface SubMapInfoSave {
  ID: number;
  Name: string;
  ExitMusic: number;
  EntranceMusic: number;
  JumpSubMap: number;
  EntranceCondition: number;
  MainEntranceX1: number;
  MainEntranceY1: number;
  MainEntranceX2: number;
  MainEntranceY2: number;
  EntranceX: number;
  EntranceY: number;
  ExitX: number[];
  ExitY: number[];
  JumpX: number;
  JumpY: number;
  JumpReturnX: number;
  JumpReturnY: number;
}

export interface SubMapInfo extends SubMapInfoSave {
  Earth: Int16Array;
  Building: Int16Array;
  Decoration: Int16Array;
  EventIndex: Int16Array;
  BuildingHeight: Int16Array;
  DecorationHeight: Int16Array;
  Events: SubMapEventSave[];
}

export interface ShopSave {
  ItemID: number[];
  Total: number[];
  Price: number[];
}

export interface SaveData {
  version: number;
  timestamp: number;
  slotName: string;
  teamRoles: RoleSave[];
  allRoles: RoleSave[];
  items: ItemSave[];
  currentSubMap: number;
  playerX: number;
  playerY: number;
  eventFlags: number[];
  visitedMaps: number[];
  settings: GameSettings;
}

export interface GameSettings {
  bgmVolume: number;
  seVolume: number;
  battleMode: BattleMode;
  fullscreen: boolean;
  keyConfig: Record<string, string>;
}

export const defaultGameSettings = (): GameSettings => ({
  bgmVolume: 0.7,
  seVolume: 1.0,
  battleMode: BattleMode.TurnBased,
  fullscreen: false,
  keyConfig: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    ok: 'Enter',
    cancel: 'Escape',
    menu: 'Space',
  },
});

export interface SlotInfo {
  slot: number;
  timestamp: number;
  slotName: string;
  hasData: boolean;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function realTowardsToFaceTowards(t: Pointf): Towards {
  if (t.x >= 0 && t.y > 0) return Towards.RightDown;
  if (t.x > 0 && t.y <= 0) return Towards.RightUp;
  if (t.x < 0 && t.y >= 0) return Towards.LeftDown;
  if (t.x <= 0 && t.y < 0) return Towards.LeftUp;
  return Towards.None;
}

export function getTowardsPosition(x0: number, y0: number, tw: Towards): Point {
  switch (tw) {
    case Towards.LeftUp: return { x: x0 - 1, y: y0 };
    case Towards.RightDown: return { x: x0 + 1, y: y0 };
    case Towards.RightUp: return { x: x0, y: y0 - 1 };
    case Towards.LeftDown: return { x: x0, y: y0 + 1 };
    default: return { x: x0, y: y0 };
  }
}

export function createRole(): Role {
  return {
    ID: 0, HeadID: 0, IncLife: 0, UnUse: 0,
    Name: '', Nick: '',
    Sexual: 0, Level: 1, Exp: 0,
    HP: 100, MaxHP: 100, Hurt: 0, Poison: 0, PhysicalPower: 100,
    ExpForMakeItem: 0, Equip0: -1, Equip1: -1,
    EquipMagic: [-1, -1, -1, -1], EquipMagic2: [-1, -1, -1, -1], EquipItem: -1,
    Frame: [0, 0, 0, 0, 0, 0],
    MPType: 0, MP: 0, MaxMP: 0,
    Attack: 10, Speed: 10, Defence: 10,
    Medicine: 10, UsePoison: 10, Detoxification: 10, AntiPoison: 10,
    Fist: 10, Sword: 10, Knife: 10, Unusual: 10, HiddenWeapon: 10,
    Knowledge: 0, Morality: 50, AttackWithPoison: 0, AttackTwice: 0, Fame: 0, IQ: 50,
    PracticeItem: -1, ExpForItem: 0,
    MagicID: [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
    MagicLevel: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    TakingItem: [-1, -1, -1, -1],
    TakingItemCount: [0, 0, 0, 0],
    InternalID: [-1, -1, -1, -1],
    InternalLevel: [0, 0, 0, 0],
    Team: 0, FaceTowards: 0, Dead: 0, Step: 0,
    Pic: 0, BattleSpeed: 0, ExpGot: 0, Auto: 0,
    FightFrame: [-1, -1, -1, -1, -1],
    FightingFrame: 0, Moved: 0, Acted: 0, ActTeam: 0,
    SelectedMagic: -1, Progress: 0,
    Show: { ShowStrings: [], BattleHurt: 0, ProgressChange: 0, Effect: -1 },
    X_: 0, Y_: 0, PrevX: 0, PrevY: 0,
    AI_Action: 0, AI_MoveX: 0, AI_MoveY: 0, AI_ActionX: 0, AI_ActionY: 0,
    Network_Action: 0, Network_MoveX: 0, Network_MoveY: 0,
    Network_ActionX: 0, Network_ActionY: 0,
    Pos: { x: 0, y: 0, z: 0 }, RealTowards: { x: 0, y: 0, z: 0 },
    Velocity: { x: 0, y: 0, z: 0 }, Acceleration: { x: 0, y: 0, z: 0 },
    HurtFrame: 0, CoolDown: 0, Attention: 0, Invincible: 0,
    Frozen: 0, Shake: 0, HaveAction: 0, ActType: -1, ActFrame: 0,
    PreActTimer: 0, OperationType: -1, OperationCount: 0,
    HurtThisFrame: 0, FindingWay: 0, Posture: 0, Breathless: 0,
    WalkingStep: 0,
  };
}