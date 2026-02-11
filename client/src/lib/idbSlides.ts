// src/lib/idbSlides.ts
// Simple IndexedDB helpers for storing slide images without localStorage quota issues.

const DB_NAME = "diyp-slides-db";
const STORE_NAME = "slides";
const DB_VERSION = 1;
const SLIDES_KEY = "latest";

type SlidesPayload = Record<string, string>;

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });

export const saveSlidesToIdb = async (slides: SlidesPayload) => {
  const db = await openDb();
  return await new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(slides, SLIDES_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    } catch (e) {
      reject(e);
    }
  });
};

export const loadSlidesFromIdb = async (): Promise<SlidesPayload | null> => {
  const db = await openDb();
  return await new Promise<SlidesPayload | null>((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(SLIDES_KEY);
      req.onsuccess = () => {
        const res = req.result;
        resolve(res && typeof res === "object" ? res : null);
      };
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
};

export const clearSlidesFromIdb = async () => {
  const db = await openDb();
  return await new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(SLIDES_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    } catch (e) {
      reject(e);
    }
  });
};

