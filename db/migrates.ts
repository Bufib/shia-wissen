// db/migrate.ts
import type { SQLiteDatabase } from "expo-sqlite";
import { migrationSQL } from "./migrations";

export const DB_NAME = "bufib.db";
export const SCHEMA_VERSION = 1; // bump when you change the schema

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // Safe to repeat even if also inside migrationSQL
  await db.execAsync(`
    PRAGMA journal_mode=WAL;
    PRAGMA busy_timeout=5000;
  `);

  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;"
  );
  const current = row?.user_version ?? 0;
  if (current >= SCHEMA_VERSION) return;

  const runInTx =
    (db as any).withExclusiveTransactionAsync?.bind(db) ??
    (async (fn: (txn: SQLiteDatabase) => Promise<void>) => {
      await db.execAsync("BEGIN IMMEDIATE;");
      try {
        await fn(db);
        await db.execAsync("COMMIT;");
      } catch (e) {
        await db.execAsync("ROLLBACK;");
        throw e;
      }
    });

  await runInTx(async (tx: any) => {
    await tx.execAsync(migrationSQL);
    await tx.execAsync(`PRAGMA user_version=${SCHEMA_VERSION};`);
  });
}
