import { publicUrl } from "./publicUrl";
import { normalizeOripa, type Oripa } from "./types";

const DB_NAME = "oripa-preview";
const STORE = "oripas";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadCatalog(): Promise<Oripa[]> {
  const [fromFile, local] = await Promise.all([fetchCatalog(), loadAll().catch(() => [])]);
  const localUpdated = local.reduce((max, oripa) => Math.max(max, oripa.updatedAt), 0);
  if (local.length > 0 && localUpdated > fromFile.updatedAt) return local;
  if (fromFile.oripas.length > 0) {
    await replaceAll(fromFile.oripas).catch(() => undefined);
    return fromFile.oripas;
  }
  return local;
}

async function fetchCatalog(): Promise<{ updatedAt: number; oripas: Oripa[] }> {
  try {
    const response = await fetch(publicUrl("/oripa.json"), { cache: "no-store" });
    if (!response.ok) return { updatedAt: 0, oripas: [] };
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") return { updatedAt: 0, oripas: [] };
    const record = data as { updatedAt?: unknown; oripas?: unknown };
    const updatedAt = typeof record.updatedAt === "number" ? record.updatedAt : 0;
    const list = Array.isArray(record.oripas) ? record.oripas : [];
    const oripas = list.flatMap((item) => {
      const oripa = normalizeOripa(item as Partial<Oripa>);
      return oripa ? [oripa] : [];
    });
    return { updatedAt, oripas };
  } catch {
    return { updatedAt: 0, oripas: [] };
  }
}

export async function loadAll(): Promise<Oripa[]> {
  const db = await openDb();
  const rows = await requestResult<unknown[]>(db, "readonly", (store) => store.getAll());
  return rows
    .flatMap((row) => {
      const oripa = normalizeOripa(row as Partial<Oripa>);
      return oripa ? [oripa] : [];
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveOripa(oripa: Oripa): Promise<void> {
  const db = await openDb();
  await runTransaction(db, (store) => store.put(oripa));
}

export async function deleteOripa(id: string): Promise<void> {
  const db = await openDb();
  await runTransaction(db, (store) => store.delete(id));
}

export async function replaceAll(oripas: Oripa[]): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.clear();
    for (const oripa of oripas) store.put(oripa);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function requestResult<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = run(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction(db: IDBDatabase, run: (store: IDBObjectStore) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    run(tx.objectStore(STORE));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
