import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDatabase, whenDatabaseReady, safeInitializeDatabase } from "../db";
import { migrateDbIfNeeded } from "./migrates";
import { runDatabaseSync } from "../db/runDatabaseSync";

type SqliteMasterRow = { type: string; name: string };

/**
 * Full hard reset (good > perfect):
 * - Drop all user-defined objects (tables/views/indexes/triggers) atomically
 * - Reset PRAGMA user_version → migration will re-run
 * - Re-apply schema via migrateDbIfNeeded
 * - Clear version markers + cached PayPal link
 * - WAL checkpoint + VACUUM
 * - Re-sync datasets
 */
export async function hardResetAllData(): Promise<void> {
  await safeInitializeDatabase(async () => {
    await whenDatabaseReady();
    const db = getDatabase();

    // Exclusive TX helper (works on older/newer SDKs)
    const runInTx =
      (db as any).withExclusiveTransactionAsync?.bind(db) ??
      (async (fn: (txn: any) => Promise<void>) => {
        await db.execAsync("BEGIN IMMEDIATE;");
        try {
          await fn(db);
          await db.execAsync("COMMIT;");
        } catch (e) {
          await db.execAsync("ROLLBACK;");
          throw e;
        }
      });

    // 1) Nuke everything user-defined 
    await runInTx(async (tx: any) => {
      await tx.execAsync("PRAGMA foreign_keys=OFF;");
      await tx.execAsync("PRAGMA wal_checkpoint(TRUNCATE);");

      const objs = (await tx.getAllAsync(`
        SELECT type, name
        FROM sqlite_master
        WHERE name NOT LIKE 'sqlite_%'
          AND name NOT LIKE 'pragma_%'
      `)) as SqliteMasterRow[];

      for (const { type, name } of objs) {
        if (type === "table")   await tx.execAsync(`DROP TABLE IF EXISTS "${name}";`);
        if (type === "view")    await tx.execAsync(`DROP VIEW IF EXISTS "${name}";`);
        if (type === "trigger") await tx.execAsync(`DROP TRIGGER IF EXISTS "${name}";`);
        if (type === "index")   await tx.execAsync(`DROP INDEX IF EXISTS "${name}";`);
      }

      // Force migrations to re-run
      await tx.execAsync("PRAGMA user_version=0;");
      await tx.execAsync("PRAGMA foreign_keys=ON;");
    });

    // 2) Recreate schema atomically and bump user_version
    await migrateDbIfNeeded(db);

    // 3) Clear version markers + cached PayPal link (so sync runs)
    const exactKeys = [
      "question_data_version",
      "quran_data_version",
      "calendar_data_version",
      "prayer_data_version",
      "paypal_data_version",
      "paypal", // cached link itself
    ];
    const allKeys = await AsyncStorage.getAllKeys();
    const toRemove = allKeys.filter((k) => exactKeys.includes(k));
    if (toRemove.length) await AsyncStorage.multiRemove(toRemove);

    // 4) Compact the file
    await db.execAsync("PRAGMA wal_checkpoint(TRUNCATE);");
    await db.execAsync("VACUUM;");

    // 5) Re-sync everything (no force needed because keys are gone)
    try {
      await runDatabaseSync();
    } catch (e) {
      console.warn("runDatabaseSync after hard reset failed:", e);
    }
  });
}
