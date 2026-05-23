export const SUBMAP_COORD_COUNT = 64;
export const SUBMAP_LAYER_COUNT = 6;
export const MAINMAP_COORD_COUNT = 480;
export const SUBMAP_EVENT_COUNT = 200;
export const ITEM_IN_BAG_COUNT = 1000;
export const TEAMMATE_COUNT = 6;
export const ROLE_MAGIC_COUNT = 10;
export const ROLE_TAKING_ITEM_COUNT = 4;
export const ROLE_INTERNAL_COUNT = 4;
export const SHOP_ITEM_COUNT = 5;

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

export interface RoleSaveData {
  ID: number;
  HeadID: number;
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

export const defaultRoleSaveData = (): RoleSaveData => ({
  ID: 0,
  HeadID: 0,
  Name: '',
  Nick: '',
  Sexual: 0,
  Level: 1,
  Exp: 0,
  HP: 50,
  MaxHP: 50,
  Hurt: 0,
  Poison: 0,
  PhysicalPower: 100,
  ExpForMakeItem: 0,
  Equip0: -1,
  Equip1: -1,
  EquipMagic: [],
  EquipMagic2: [],
  EquipItem: -1,
  MPType: 0,
  MP: 0,
  MaxMP: 0,
  Attack: 10,
  Speed: 10,
  Defence: 10,
  Medicine: 10,
  UsePoison: 10,
  Detoxification: 10,
  AntiPoison: 10,
  Fist: 10,
  Sword: 10,
  Knife: 10,
  Unusual: 10,
  HiddenWeapon: 10,
  Knowledge: 0,
  Morality: 50,
  AttackWithPoison: 0,
  AttackTwice: 0,
  Fame: 0,
  IQ: 50,
  PracticeItem: -1,
  ExpForItem: 0,
  MagicID: [],
  MagicLevel: [],
  TakingItem: [],
  TakingItemCount: [],
  InternalID: [],
  InternalLevel: [],
});

export interface ItemData {
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

export interface MagicData {
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

export interface SubMapEventData {
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

export interface SubMapInfoData {
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
  Earth: Int16Array;
  Building: Int16Array;
  Decoration: Int16Array;
  EventIndex: Int16Array;
  BuildingHeight: Int16Array;
  DecorationHeight: Int16Array;
  Events: SubMapEventData[];
}

export interface ShopData {
  ItemID: number[];
  Total: number[];
  Price: number[];
}

export interface SaveData {
  version: number;
  timestamp: number;
  slotName: string;
  teamRoles: RoleSaveData[];
  allRoles: RoleSaveData[];
  items: ItemData[];
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