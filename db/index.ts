import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;

// Single-flight init state
let ongoingInit: Promise<void> | null = null;
let rerunRequested = false;

// Always keep the MOST RECENT init function so reruns use the latest intent
let latestInitFn: (() => Promise<unknown>) | null = null;

// Promise that resolves once the Provider passes us the db handle.
let resolveReady: (() => void) | null = null;
const readyPromise = new Promise<void>((res) => (resolveReady = res));

export function setDatabase(instance: SQLite.SQLiteDatabase) {
  db = instance;
  resolveReady?.();
}

export async function whenDatabaseReady(): Promise<void> {
  if (db) return;
  await readyPromise;
}

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) throw new Error("Database not ready yet (Provider not initialized)");
  return db;
}

/**
 * Safely runs an initialization function with proper queueing.
 *
 * - Single-flight: ensures only one init runs at a time.
 * - Rerun-on-demand: if a second caller arrives while running, we mark a rerun
 *   and, when the current run finishes, we run AGAIN using the MOST RECENT fn.
 *
 * NOTE ON TYPING:
 *   The init function can return ANY promise (e.g., runDatabaseSync
 *   returns an object); we discard the value and only resolve when done.
 *   This fixes the "Promise<void>" vs "Promise<{...}>" mismatch.
 */
export async function safeInitializeDatabase(
  initFn: () => Promise<unknown> // <— accept any Promise return type
): Promise<void> {
  // Always remember the latest function so the next rerun uses it
  latestInitFn = initFn;
  // If an init is already running, request a rerun and return that same promise
  if (ongoingInit) {
    rerunRequested = true;
    return ongoingInit; // still Promise<void>
  }

  // Start a new single-flight init
  ongoingInit = (async () => {
    try {
      do {
        rerunRequested = false;
        const fn = latestInitFn;
        if (!fn) return; // nothing to do
        await fn(); // run the LATEST requested init each pass
      } while (rerunRequested);
    } finally {
      ongoingInit = null;
    }
  })();

  return ongoingInit;
}
