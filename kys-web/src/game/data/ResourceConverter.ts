const DEFAULT_PALETTE: number[] = [];
for (let i = 0; i < 256; i++) {
  DEFAULT_PALETTE.push(i, i, i);
}

export class GrpIdxConverter {
  private palette: number[];

  constructor(palette?: number[]) {
    this.palette = palette || DEFAULT_PALETTE;
  }

  setPalette(palette: number[]): void {
    this.palette = palette;
  }

  async convertGrpIdx(
    idxBuffer: ArrayBuffer,
    grpBuffer: ArrayBuffer,
    slash: boolean = false,
    onProgress?: (current: number, total: number) => void
  ): Promise<Map<string, ImageBitmap>> {
    const result = new Map<string, ImageBitmap>();
    const idx = new Int32Array(idxBuffer);
    const grp = new Uint8Array(grpBuffer);

    const totalImages = idx.length;

    for (let m = 0; m < totalImages; m++) {
      if (onProgress) onProgress(m, totalImages);

      const start = idx[m];
      const end = m + 1 < totalImages ? idx[m + 1] : grp.length;

      if (start < 0 || end <= start + 8 || start >= grp.length) continue;

      const w = grp[start] | (grp[start + 1] << 8);
      const h = grp[start + 2] | (grp[start + 3] << 8);

      if (w > 255 || h > 255 || w <= 1 || h <= 1) continue;

      const maxN = this.detectMaxN(grp, start, end);
      const actualMax = slash ? maxN : 1;

      for (let n = 0; n < actualMax; n++) {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        const imageData = ctx.createImageData(w, h);
        const pixels = imageData.data;

        const col = this.shiftPalette(n);

        let p = 8;
        for (let i = 0; i < h; i++) {
          if (start + p >= end) break;
          const row = grp[start + p];
          p++;
          if (row > 0) {
            let x = 0;
            while (p - 8 < row && x < w) {
              if (start + p >= end) break;
              x += grp[start + p];
              if (x >= w) break;
              p++;
              if (start + p >= end) break;
              const solidNum = grp[start + p];
              p++;
              for (let j = 0; j < solidNum; j++) {
                if (start + p >= end) break;
                const colorIdx = grp[start + p];
                p++;
                if (x < w) {
                  const pi = (i * w + x) * 4;
                  pixels[pi] = 4 * col[colorIdx * 3];
                  pixels[pi + 1] = 4 * col[colorIdx * 3 + 1];
                  pixels[pi + 2] = 4 * col[colorIdx * 3 + 2];
                  pixels[pi + 3] = 0xff;
                }
                x++;
                if (x >= w) break;
              }
              if (x >= w) break;
              if (p - 8 >= row) break;
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const bitmap = await createImageBitmap(canvas);

        const key = slash && actualMax > 1 ? `${m}_${n}` : `${m}`;
        result.set(key, bitmap);
      }

      if (!slash || 1 >= actualMax) {
        const canvas2 = document.createElement('canvas');
        canvas2.width = w;
        canvas2.height = h;
        const ctx2 = canvas2.getContext('2d')!;
        const imageData2 = ctx2.createImageData(w, h);
        const pixels2 = imageData2.data;

        const col = this.palette;
        let p2 = 8;
        for (let i = 0; i < h; i++) {
          if (start + p2 >= end) break;
          const row = grp[start + p2];
          p2++;
          if (row > 0) {
            let x = 0;
            while (p2 - 8 < row && x < w) {
              if (start + p2 >= end) break;
              x += grp[start + p2];
              if (x >= w) break;
              p2++;
              if (start + p2 >= end) break;
              const solidNum = grp[start + p2];
              p2++;
              for (let j = 0; j < solidNum; j++) {
                if (start + p2 >= end) break;
                const colorIdx = grp[start + p2];
                p2++;
                if (x < w) {
                  const pi = (i * w + x) * 4;
                  pixels2[pi] = 4 * col[colorIdx * 3];
                  pixels2[pi + 1] = 4 * col[colorIdx * 3 + 1];
                  pixels2[pi + 2] = 4 * col[colorIdx * 3 + 2];
                  pixels2[pi + 3] = 0xff;
                }
                x++;
                if (x >= w) break;
              }
              if (x >= w) break;
              if (p2 - 8 >= row) break;
            }
          }
        }
        ctx2.putImageData(imageData2, 0, 0);
        const bitmap2 = await createImageBitmap(canvas2);
        result.set(`${m}`, bitmap2);
      }
    }

    return result;
  }

  private detectMaxN(grp: Uint8Array, start: number, end: number): number {
    let maxN = 1;
    let p = 8;
    for (let i = 0; i < Math.min(end - start, 65536); i++) {
      if (start + p >= end) break;
      const row = grp[start + p];
      p++;
      if (row > 0) {
        let x = 0;
        while (p - 8 < row) {
          if (start + p >= end) break;
          x += grp[start + p];
          if (x >= 255) break;
          p++;
          if (start + p >= end) break;
          const solidNum = grp[start + p];
          p++;
          for (let j = 0; j < solidNum; j++) {
            if (start + p >= end) break;
            const idx = grp[start + p];
            if (idx >= 0xe0 && idx <= 0xe7) {
              if (maxN === 1 || maxN === 9) maxN = 8;
            }
            if (idx >= 0xf4 && idx <= 0xfc) {
              if (maxN === 1) maxN = 9;
            }
            p++;
          }
          if (x >= 255) break;
          if (p - 8 >= row) break;
        }
      }
    }
    return maxN;
  }

  private shiftPalette(n: number): number[] {
    const col = [...this.palette];
    for (let i = 0; i < n; i++) {
      this.rotateRange(col, 0xe0, 0xe7);
      this.rotateRange(col, 0xf4, 0xfc);
    }
    return col;
  }

  private rotateRange(col: number[], begin: number, end: number): void {
    const temp0 = col[end * 3];
    const temp1 = col[end * 3 + 1];
    const temp2 = col[end * 3 + 2];
    for (let j = end; j > begin; j--) {
      col[j * 3] = col[(j - 1) * 3];
      col[j * 3 + 1] = col[(j - 1) * 3 + 1];
      col[j * 3 + 2] = col[(j - 1) * 3 + 2];
    }
    col[begin * 3] = temp0;
    col[begin * 3 + 1] = temp1;
    col[begin * 3 + 2] = temp2;
  }
}

export const RESOURCE_TYPES = [
  { id: 'smap-earth', label: '子场景地面', idxFile: 'smap.idx', grpFile: 'smap.grp', slash: false },
  { id: 'smap-build', label: '子场景建筑', idxFile: 'smap.idx', grpFile: 'smap.grp', slash: false },
  { id: 'smap-smap', label: '子场景贴图', idxFile: 'smap.idx', grpFile: 'smap.grp', slash: false },
  { id: 'mmap-earth', label: '大地图地面', idxFile: 'mmap.idx', grpFile: 'mmap.grp', slash: false },
  { id: 'fight', label: '战斗贴图', idxFile: 'fight.idx', grpFile: 'fight.grp', slash: true },
  { id: 'head', label: '头像', idxFile: 'head.idx', grpFile: 'head.grp', slash: false },
  { id: 'eft', label: '特效', idxFile: 'eft.idx', grpFile: 'eft.grp', slash: false },
  { id: 'cloud', label: '云层', idxFile: 'cloud.idx', grpFile: 'cloud.grp', slash: false },
] as const;

export type ResourceTypeId = typeof RESOURCE_TYPES[number]['id'];

const DB_NAME = 'kys-web-resources';
const DB_VERSION = 1;
const STORE_NAME = 'textures';

async function openResourceDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTexturesToDB(
  typeId: ResourceTypeId,
  textures: Map<string, ImageBitmap>
): Promise<void> {
  const db = await openResourceDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (const [name, bitmap] of textures.entries()) {
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b!), 'image/png');
    });

    store.put({
      key: `${typeId}/${name}`,
      blob,
      width: bitmap.width,
      height: bitmap.height,
    });
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadTextureFromDB(
  typeId: ResourceTypeId,
  name: string
): Promise<ImageBitmap | null> {
  const db = await openResourceDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(`${typeId}/${name}`);
    req.onsuccess = async () => {
      if (!req.result) {
        resolve(null);
        return;
      }
      const bitmap = await createImageBitmap(req.result.blob);
      resolve(bitmap);
    };
    req.onerror = () => resolve(null);
  });
}

export async function hasResourceInDB(typeId: ResourceTypeId): Promise<boolean> {
  const db = await openResourceDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const range = IDBKeyRange.bound(`${typeId}/`, `${typeId}/\uffff`);
    const req = store.count(range);
    req.onsuccess = () => resolve(req.result > 0);
    req.onerror = () => resolve(false);
  });
}

export async function getAllTextureKeysFromDB(typeId: ResourceTypeId): Promise<string[]> {
  const db = await openResourceDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const range = IDBKeyRange.bound(`${typeId}/`, `${typeId}/\uffff`);
    const req = store.getAllKeys(range);
    req.onsuccess = () => {
      const keys = req.result.map((k: string) => k.replace(`${typeId}/`, ''));
      resolve(keys);
    };
    req.onerror = () => resolve([]);
  });
}

export async function clearResourceDB(): Promise<void> {
  const db = await openResourceDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  tx.objectStore(STORE_NAME).clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
