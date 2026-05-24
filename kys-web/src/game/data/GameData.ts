import { RoleSave, ItemSave, MagicSave, SubMapInfo, SubMapEventSave, COORD_COUNT } from './Types';

class GameDataLoader {
  private roles_: RoleSave[] = [];
  private items_: ItemSave[] = [];
  private magics_: MagicSave[] = [];
  private loaded_: boolean = false;

  async loadAll(): Promise<void> {
    if (this.loaded_) return;

    try {
      const rolesResp = await fetch('/assets/data/roles.json');
      if (rolesResp.ok) this.roles_ = await rolesResp.json();
    } catch {}

    try {
      const itemsResp = await fetch('/assets/data/items.json');
      if (itemsResp.ok) this.items_ = await itemsResp.json();
    } catch {}

    try {
      const magicsResp = await fetch('/assets/data/magics.json');
      if (magicsResp.ok) this.magics_ = await magicsResp.json();
    } catch {}

    this.loaded_ = true;
  }

  getRole(id: number): RoleSave | undefined {
    return this.roles_.find(r => r.ID === id);
  }

  getAllRoles(): RoleSave[] {
    return this.roles_;
  }

  getItem(id: number): ItemSave | undefined {
    return this.items_.find(i => i.ID === id);
  }

  getAllItems(): ItemSave[] {
    return this.items_;
  }

  getMagic(id: number): MagicSave | undefined {
    return this.magics_.find(m => m.ID === id);
  }

  getAllMagics(): MagicSave[] {
    return this.magics_;
  }
}

export const GameData = new GameDataLoader();

export function createSubMapFromData(
  id: number,
  name: string,
  entranceX: number,
  entranceY: number,
  layout: number[][],
  events: SubMapEventSave[] = []
): SubMapInfo {
  const size = COORD_COUNT;
  const earth = new Int16Array(size * size);
  const building = new Int16Array(size * size);
  const decoration = new Int16Array(size * size);
  const eventIndex = new Int16Array(size * size);
  const buildingHeight = new Int16Array(size * size);
  const decorationHeight = new Int16Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = x + y * size;
      if (y < layout.length && x < layout[y].length) {
        const val = layout[y][x];
        if (val > 0) {
          earth[idx] = val;
        } else if (val < 0) {
          building[idx] = -val;
          if (-val >= 61 && -val <= 70) {
            buildingHeight[idx] = 36;
          } else {
            buildingHeight[idx] = 18;
          }
        }
      } else {
        earth[idx] = 1;
      }
    }
  }

  return {
    ID: id,
    Name: name,
    ExitMusic: 0,
    EntranceMusic: 0,
    JumpSubMap: 0,
    EntranceCondition: 0,
    MainEntranceX1: entranceX,
    MainEntranceY1: entranceY,
    MainEntranceX2: entranceX,
    MainEntranceY2: entranceY,
    EntranceX: entranceX,
    EntranceY: entranceY,
    ExitX: [entranceX],
    ExitY: [entranceY - 1],
    JumpX: 0, JumpY: 0,
    JumpReturnX: 0, JumpReturnY: 0,
    Earth: earth,
    Building: building,
    Decoration: decoration,
    EventIndex: eventIndex,
    BuildingHeight: buildingHeight,
    DecorationHeight: decorationHeight,
    Events: events,
  };
}

export function generateTownMap(): SubMapInfo {
  const S = COORD_COUNT;
  const layout: number[][] = [];

  for (let y = 0; y < S; y++) {
    const row: number[] = [];
    for (let x = 0; x < S; x++) {
      if (y < 5 || y >= S - 5 || x < 5 || x >= S - 5) {
        row.push(30);
      } else if (y < 8 || y >= S - 8 || x < 8 || x >= S - 8) {
        row.push(1);
      } else {
        row.push(1);
      }
    }
    layout.push(row);
  }

  for (let x = 8; x < S - 8; x++) {
    layout[S / 2 - 1][x] = 8;
    layout[S / 2][x] = 8;
    layout[S / 2 + 1][x] = 8;
  }

  for (let y = 8; y < S - 8; y++) {
    layout[y][S / 2 - 1] = 8;
    layout[y][S / 2] = 8;
    layout[y][S / 2 + 1] = 8;
  }

  // Buildings - top-left quarter
  for (let by = 10; by < 22; by++) {
    for (let bx = 10; bx < 22; bx++) {
      if (by === 10 || by === 21 || bx === 10 || bx === 21) {
        layout[by][bx] = -1;
      } else {
        layout[by][bx] = 12;
      }
    }
  }
  layout[16][10] = 12;
  layout[16][21] = 12;
  layout[10][16] = -21;
  layout[21][16] = 12;

  // Buildings - top-right quarter
  for (let by = 10; by < 22; by++) {
    for (let bx = S - 22; bx < S - 10; bx++) {
      if (by === 10 || by === 21 || bx === S - 22 || bx === S - 11) {
        layout[by][bx] = -2;
      } else {
        layout[by][bx] = 12;
      }
    }
  }
  layout[16][S - 22] = 12;
  layout[16][S - 11] = 12;
  layout[10][S - 16] = -22;
  layout[21][S - 16] = 12;

  // Buildings - bottom-left quarter
  for (let by = S - 22; by < S - 10; by++) {
    for (let bx = 10; bx < 22; bx++) {
      if (by === S - 22 || by === S - 11 || bx === 10 || bx === 21) {
        layout[by][bx] = -3;
      } else {
        layout[by][bx] = 12;
      }
    }
  }
  layout[S - 16][10] = 12;
  layout[S - 16][21] = 12;
  layout[S - 22][16] = -23;
  layout[S - 11][16] = 12;

  // Trees
  const treePositions = [
    [9, 9], [9, 25], [9, 38], [25, 9], [38, 9],
    [S - 9, 9], [S - 9, 25], [S - 9, 38],
    [9, S - 9], [25, S - 9], [38, S - 9],
    [S - 9, S - 9],
  ];
  for (const [ty, tx] of treePositions) {
    if (ty < S && tx < S) layout[ty][tx] = -(61 + (ty + tx) % 10);
  }

  // Pond
  for (let py = S / 2 + 5; py < S / 2 + 10; py++) {
    for (let px = S / 2 + 5; px < S / 2 + 10; px++) {
      if (py < S && px < S) layout[py][px] = 4;
    }
  }

  const events: SubMapEventSave[] = [
    { CannotWalk: 1, Index: 1, Event1: 1, Event2: 0, Event3: 0, CurrentPic: 16, EndPic: 16, BeginPic: 16, PicDelay: 0, X: 15, Y: 11 },
    { CannotWalk: 1, Index: 2, Event1: 2, Event2: 0, Event3: 0, CurrentPic: 32, EndPic: 32, BeginPic: 32, PicDelay: 0, X: S - 16, Y: 11 },
    { CannotWalk: 1, Index: 3, Event1: 3, Event2: 0, Event3: 0, CurrentPic: 48, EndPic: 48, BeginPic: 48, PicDelay: 0, X: 15, Y: S - 16 },
    { CannotWalk: 0, Index: 4, Event1: 10, Event2: 0, Event3: 0, CurrentPic: 64, EndPic: 64, BeginPic: 64, PicDelay: 0, X: S / 2 + 3, Y: S / 2 - 5 },
    { CannotWalk: 0, Index: 5, Event1: 11, Event2: 0, Event3: 0, CurrentPic: 80, EndPic: 80, BeginPic: 80, PicDelay: 0, X: S / 2 - 5, Y: S / 2 + 3 },
    { CannotWalk: 0, Index: 6, Event1: 12, Event2: 0, Event3: 0, CurrentPic: 96, EndPic: 96, BeginPic: 96, PicDelay: 0, X: S / 2 + 8, Y: S / 2 + 8 },
  ];

  const map = createSubMapFromData(1, '襄阳城', S / 2, S / 2 + 3, layout, events);

  for (const evt of events) {
    const idx = evt.X + evt.Y * S;
    if (idx >= 0 && idx < S * S) {
      map.EventIndex[idx] = evt.Index;
    }
  }

  return map;
}

export function generateForestMap(): SubMapInfo {
  const S = COORD_COUNT;
  const layout: number[][] = [];
  const rng = ((seed: number) => {
    let s = seed;
    return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  })(42);

  for (let y = 0; y < S; y++) {
    const row: number[] = [];
    for (let x = 0; x < S; x++) {
      if (y < 3 || y >= S - 3 || x < 3 || x >= S - 3) {
        row.push(30);
      } else {
        const r = rng();
        if (r < 0.05) {
          row.push(-(61 + Math.floor(rng() * 10)));
        } else if (r < 0.08) {
          row.push(8);
        } else {
          row.push(1 + Math.floor(rng() * 3));
        }
      }
    }
    layout.push(row);
  }

  for (let y = S / 2 - 1; y <= S / 2 + 1; y++) {
    for (let x = 5; x < S - 5; x++) {
      layout[y][x] = 8;
    }
  }
  for (let y = 5; y < S - 5; y++) {
    for (let x = S / 2 - 1; x <= S / 2 + 1; x++) {
      layout[y][x] = 8;
    }
  }

  const events: SubMapEventSave[] = [
    { CannotWalk: 0, Index: 1, Event1: 20, Event2: 0, Event3: 0, CurrentPic: 112, EndPic: 112, BeginPic: 112, PicDelay: 0, X: S / 2 + 5, Y: S / 2 - 3 },
    { CannotWalk: 0, Index: 2, Event1: 21, Event2: 0, Event3: 0, CurrentPic: 128, EndPic: 128, BeginPic: 128, PicDelay: 0, X: S / 2 - 8, Y: S / 2 + 5 },
  ];

  const map = createSubMapFromData(2, '黑木崖密林', S / 2, S / 2 + 3, layout, events);

  for (const evt of events) {
    const idx = evt.X + evt.Y * S;
    if (idx >= 0 && idx < S * S) {
      map.EventIndex[idx] = evt.Index;
    }
  }

  return map;
}

export function generateCaveMap(): SubMapInfo {
  const S = COORD_COUNT;
  const layout: number[][] = [];

  for (let y = 0; y < S; y++) {
    const row: number[] = [];
    for (let x = 0; x < S; x++) {
      if (y < 3 || y >= S - 3 || x < 3 || x >= S - 3) {
        row.push(30);
      } else {
        row.push(12);
      }
    }
    layout.push(row);
  }

  for (let by = 10; by < 25; by++) {
    for (let bx = 10; bx < 25; bx++) {
      if (by === 10 || by === 24 || bx === 10 || bx === 24) {
        layout[by][bx] = -1;
      } else {
        layout[by][bx] = 12;
      }
    }
  }
  layout[17][10] = -21;

  for (let by = 10; by < 25; by++) {
    for (let bx = 39; bx < 54; bx++) {
      if (by === 10 || by === 24 || bx === 39 || bx === 53) {
        layout[by][bx] = -2;
      } else {
        layout[by][bx] = 12;
      }
    }
  }
  layout[17][53] = -22;

  for (let by = 39; by < 54; by++) {
    for (let bx = 25; bx < 39; bx++) {
      if (by === 39 || by === 53 || bx === 25 || bx === 38) {
        layout[by][bx] = -3;
      } else {
        layout[by][bx] = 12;
      }
    }
  }
  layout[39][32] = -23;

  const events: SubMapEventSave[] = [
    { CannotWalk: 0, Index: 1, Event1: 30, Event2: 0, Event3: 0, CurrentPic: 144, EndPic: 144, BeginPic: 144, PicDelay: 0, X: 17, Y: 17 },
    { CannotWalk: 0, Index: 2, Event1: 31, Event2: 0, Event3: 0, CurrentPic: 160, EndPic: 160, BeginPic: 160, PicDelay: 0, X: 46, Y: 17 },
    { CannotWalk: 0, Index: 3, Event1: 32, Event2: 0, Event3: 0, CurrentPic: 176, EndPic: 176, BeginPic: 176, PicDelay: 0, X: 32, Y: 46 },
  ];

  const map = createSubMapFromData(3, '古墓寒潭', S / 2, S / 2, layout, events);

  for (const evt of events) {
    const idx = evt.X + evt.Y * S;
    if (idx >= 0 && idx < S * S) {
      map.EventIndex[idx] = evt.Index;
    }
  }

  return map;
}