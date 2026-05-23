import { SaveData, SlotInfo } from './Types';

const DB_NAME = 'kys-web-saves';
const DB_VERSION = 1;
const STORE_NAME = 'saves';

export class SaveManager {
  static readonly SLOT_COUNT = 10;

  private static db(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'slot' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  static async save(slot: number, data: SaveData): Promise<void> {
    const db = await this.db();
    const record = { slot, data, timestamp: Date.now() };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  static async load(slot: number): Promise<SaveData | null> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(slot);
      req.onsuccess = () => {
        const record = req.result;
        resolve(record ? record.data : null);
      };
      req.onerror = () => reject(req.error);
    });
  }

  static async delete(slot: number): Promise<void> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(slot);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  static async getSlotInfo(slot: number): Promise<SlotInfo> {
    const db = await this.db();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(slot);
      req.onsuccess = () => {
        const record = req.result;
        if (record && record.data) {
          resolve({
            slot,
            timestamp: record.timestamp,
            slotName: record.data.slotName || `存档 ${slot + 1}`,
            hasData: true,
          });
        } else {
          resolve({
            slot,
            timestamp: 0,
            slotName: `空槽位 ${slot + 1}`,
            hasData: false,
          });
        }
      };
    });
  }

  static async getAllSlotInfos(): Promise<SlotInfo[]> {
    const infos: SlotInfo[] = [];
    for (let i = 0; i < this.SLOT_COUNT; i++) {
      infos.push(await this.getSlotInfo(i));
    }
    return infos;
  }

  static async exportSave(slot: number): Promise<Blob> {
    const data = await this.load(slot);
    if (!data) throw new Error('存档不存在');
    const json = JSON.stringify(data, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  static async importSave(file: File, targetSlot: number): Promise<void> {
    const text = await file.text();
    const data = JSON.parse(text) as SaveData;
    await this.save(targetSlot, data);
  }
}