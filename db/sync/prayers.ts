// // import { supabase } from "@/utils/supabase";
// // import { getDatabase } from "..";
// // import {
// //   PrayerCategoryType,
// //   PrayerType,
// //   PrayerWithTranslationType,
// // } from "@/constants/Types";

// // /**
// //  * Syncs prayer categories, prayers, and translations from Supabase into local SQLite.
// //  * Wraps all operations in a single exclusive transaction to avoid database locks.
// //  * @param language - language code (e.g. 'en', 'de') for filtered translations.
// //  */
// // async function syncPrayers(language: string): Promise<void> {
// //   try {
// //     // 1) Fetch remote categories
// //     const { data: categories, error: catErr } = await supabase
// //       .from("prayer_categories")
// //       .select("id, title, parent_id, language_code");
// //     if (catErr) throw catErr;

// //     // 2) Fetch remote prayers
// //     const { data: prayers, error: prayerErr } = await supabase
// //       .from("prayers")
// //       .select(
// //         `id, name, arabic_title, category_id, arabic_introduction,
// //          arabic_text, arabic_notes, transliteration_text, source,
// //          translated_languages, created_at, updated_at`
// //       );

// //     if (prayerErr) throw prayerErr;

// //     // 3) Fetch translations for current language
// //     const { data: translations, error: transErr } = await supabase
// //       .from("prayer_translations")
// //       .select(
// //         `id, prayer_id, language_code, translated_introduction,
// //          translated_text, translated_notes, source, created_at, updated_at`
// //       )
// //       .eq("language_code", language);

// //     if (transErr) throw transErr;

// //     const db = getDatabase();

// //     // 4) Perform all DB writes in one exclusive transaction
// //     await db.withExclusiveTransactionAsync(async (txn) => {
// //       const catStmt = await txn.prepareAsync(
// //         `INSERT OR REPLACE INTO prayer_categories (id, title, parent_id) VALUES (?, ?, ?);`
// //       );
// //       const prayerStmt = await txn.prepareAsync(
// //         `INSERT OR REPLACE INTO prayers
// //            (id, name, arabic_title, category_id, arabic_introduction,
// //             arabic_text, arabic_notes, transliteration_text, source,
// //             translated_languages, created_at, updated_at)
// //          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
// //       );
// //       const transStmt = await txn.prepareAsync(
// //         `INSERT OR REPLACE INTO prayer_translations
// //            (id, prayer_id, language_code, translated_introduction,
// //             translated_text, translated_notes, source, created_at, updated_at)
// //          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
// //       );

// //       try {
// //         // a) Sync categories
// //         for (const c of categories as PrayerCategoryType[]) {
// //           const parentField = Array.isArray(c.parent_id)
// //             ? JSON.stringify(c.parent_id)
// //             : null;
// //           await catStmt.executeAsync([c.id, c.title, parentField]);
// //         }

// //         // b) Sync prayers
// //         for (const p of prayers as PrayerType[]) {
// //           await prayerStmt.executeAsync([
// //             p.id,
// //             p.name,
// //             p.arabic_title ?? null,
// //             p.category_id ?? null,
// //             p.arabic_introduction ?? null,
// //             p.arabic_text ?? null,
// //             p.arabic_notes ?? null,
// //             p.transliteration_text ?? null,
// //             p.source ?? null,
// //             JSON.stringify(p.translated_languages ?? []),
// //             typeof p.created_at === "string"
// //               ? p.created_at
// //               : p.created_at?.toISOString(),
// //             typeof p.updated_at === "string"
// //               ? p.updated_at
// //               : p.updated_at?.toISOString(),
// //           ]);
// //         }

// //         // c) Sync translations
// //         for (const t of translations as PrayerWithTranslationType[]) {
// //           await transStmt.executeAsync([
// //             t.id,
// //             t.prayer_id,
// //             t.language_code,
// //             t.translated_introduction ?? null,
// //             t.translated_text ?? null,
// //             t.translated_notes ?? null,
// //             t.source ?? null,
// //             typeof t.created_at === "string"
// //               ? t.created_at
// //               : t.created_at?.toISOString(),
// //             typeof t.updated_at === "string"
// //               ? t.updated_at
// //               : t.updated_at?.toISOString(),
// //           ]);
// //         }
// //       } catch (e) {
// //         console.error("Transaction error in syncPrayers:", e);
// //       } finally {
// //         await catStmt.finalizeAsync();
// //         await prayerStmt.finalizeAsync();
// //         await transStmt.finalizeAsync();
// //       }
// //     });

// //     console.log(`Prayers and translations synced for '${language}'.`);
// //   } catch (error) {
// //     console.error("Critical error in syncPrayers:", error);
// //   }
// // }

// // export default syncPrayers;

//! Without delte
// import { supabase } from "@/utils/supabase";
// import { getDatabase } from "..";
// import {
//   PrayerCategoryType,
//   PrayerType,
//   PrayerWithTranslationType,
// } from "@/constants/Types";

// async function syncPrayers(language: string): Promise<void> {
//   try {
//     // 1) Categories
//     const { data: categories, error: catErr } = await supabase
//       .from("prayer_categories")
//       .select("id, title, parent_id, language_code");
//     if (catErr) throw catErr;

//     // 2) Prayers
//     const { data: prayers, error: prayerErr } = await supabase.from("prayers")
//       .select(`
//         id, name, arabic_title, category_id, arabic_introduction,
//         arabic_text, arabic_notes, transliteration_text, source,
//         translated_languages, created_at, updated_at
//       `);
//     if (prayerErr) throw prayerErr;

//     // 3) Translations (filtered)
//     const { data: translations, error: transErr } = await supabase
//       .from("prayer_translations")
//       .select(
//         `
//         id, prayer_id, language_code, translated_introduction,
//         translated_text, translated_notes, source, created_at, updated_at
//       `
//       )
//       .eq("language_code", language);
//     if (transErr) throw transErr;

//     const db = getDatabase();
//     const runTx =
//       (db as any).withExclusiveTransactionAsync?.bind(db) ??
//       db.withTransactionAsync.bind(db);

//     await runTx(async (txn: any) => {
//       const catStmt = await txn.prepareAsync(
//         `INSERT OR REPLACE INTO prayer_categories
//            (id, title, parent_id, language_code)
//          VALUES (?, ?, ?, ?);`
//       );
//       const prayerStmt = await txn.prepareAsync(
//         `INSERT OR REPLACE INTO prayers
//            (id, name, arabic_title, category_id, arabic_introduction,
//             arabic_text, arabic_notes, transliteration_text, source,
//             translated_languages, created_at, updated_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
//       );
//       const transStmt = await txn.prepareAsync(
//         `INSERT OR REPLACE INTO prayer_translations
//            (id, prayer_id, language_code, translated_introduction,
//             translated_text, translated_notes, source, created_at, updated_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`
//       );

//       try {
//         // a) categories
//         for (const c of (categories ?? []) as PrayerCategoryType[]) {
//           const parentJson = Array.isArray(c.parent_id)
//             ? JSON.stringify(c.parent_id)
//             : c.parent_id ?? null;
//           await catStmt.executeAsync([
//             c.id,
//             c.title,
//             parentJson,
//             c.language_code, // REQUIRED by migration
//           ]);
//         }

//         // b) prayers
//         for (const p of (prayers ?? []) as PrayerType[]) {
//           await prayerStmt.executeAsync([
//             p.id,
//             p.name,
//             p.arabic_title ?? null,
//             p.category_id, // schema says NOT NULL; we trust it's set
//             p.arabic_introduction ?? null,
//             p.arabic_text ?? null,
//             p.arabic_notes ?? null,
//             p.transliteration_text ?? null,
//             p.source ?? null,
//             JSON.stringify(p.translated_languages ?? []), // NOT NULL column
//             p.created_at as any, // Supabase returns ISO strings; pass-through is fine
//             p.updated_at as any,
//           ]);
//         }

//         // c) translations
//         for (const t of (translations ?? []) as PrayerWithTranslationType[]) {
//           await transStmt.executeAsync([
//             t.id,
//             t.prayer_id,
//             t.language_code,
//             t.translated_introduction ?? null,
//             t.translated_text ?? null,
//             t.translated_notes ?? null,
//             t.source ?? null,
//             t.created_at as any,
//             t.updated_at as any,
//           ]);
//         }
//       } finally {
//         await Promise.allSettled([
//           catStmt.finalizeAsync(),
//           prayerStmt.finalizeAsync(),
//           transStmt.finalizeAsync(),
//         ]);
//       }
//     });

//     console.log(`Prayers and translations synced for '${language}'.`);
//   } catch (error) {
//     console.error("Critical error in syncPrayers:", error);
//   }
// }

// export default syncPrayers;

import { supabase } from "../../utils/supabase";
import { getDatabase } from "..";
import {
  PrayerCategoryType,
  PrayerType,
  PrayerWithTranslationType,
} from "@/constants/Types";
import { useDataVersionStore } from "../../stores/dataVersionStore";

// function normalizeParentId(parent: unknown): string | null {
//   if (parent == null) return null;
//   if (typeof parent === "string") return parent; // already JSON
//   try {
//     return JSON.stringify(parent); // array/object → JSON string
//   } catch {
//     return null;
//   }
// }

function normalizeParentId(parent: unknown): string {
  return parent == null ? "[]" : JSON.stringify(parent); // int8[] -> JSON array
}

/**
 * Full replace of prayers & translations for ALL languages.
 * Mirrors your "questions" approach (delete-then-insert),
 * but for the entire prayers dataset.
 */
export default async function syncPrayers(): Promise<void> {
  try {
    // 1) Fetch everything needed from Supabase (NO language filters)
    const [
      { data: categories, error: catErr },
      { data: prayers, error: prayerErr },
      { data: translations, error: transErr },
    ] = await Promise.all([
      supabase
        .from("prayer_categories")
        .select("id, title, parent_id, language_code"),
      supabase.from("prayers").select(`
          id, name, arabic_title, category_id, arabic_introduction,
          arabic_text, arabic_notes, transliteration_text, source,
          translated_languages, created_at, updated_at
        `),
      supabase.from("prayer_translations").select(`
          id, prayer_id, language_code, translated_introduction, translated_title,
          translated_text, translated_notes, source, created_at, updated_at
        `),
    ]);

    if (catErr) throw catErr;
    if (prayerErr) throw prayerErr;
    if (transErr) throw transErr;

    const db = getDatabase();
    const runTx =
      (db as any).withExclusiveTransactionAsync?.bind(db) ??
      db.withTransactionAsync.bind(db);

    await runTx(async (txn: any) => {
      // Prepared statements (INSERT OR ... like your questions sync)
      const insertCat = await txn.prepareAsync(
        `INSERT OR IGNORE INTO prayer_categories
           (id, title, parent_id, language_code)
         VALUES (?, ?, ?, ?);`
      );

      const insertPrayer = await txn.prepareAsync(
        `INSERT OR REPLACE INTO prayers
           (id, name, arabic_title, category_id, arabic_introduction,
            arabic_text, arabic_notes, transliteration_text, source,
            translated_languages, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
      );

      const insertTrans = await txn.prepareAsync(
        `INSERT OR REPLACE INTO prayer_translations
           (id, prayer_id, language_code, translated_introduction, translated_title,
            translated_text, translated_notes, source, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
      );

      try {
        // A) FULL REPLACE — wipe local tables (ALL languages)
        await txn.runAsync(`DELETE FROM prayer_translations;`);
        await txn.runAsync(`DELETE FROM prayers;`);
        await txn.runAsync(`DELETE FROM prayer_categories;`);

        // B) Upsert categories (insert-if-missing)
        for (const c of (categories ?? []) as PrayerCategoryType[]) {
          await insertCat.executeAsync([
            c.id,
            c.title,
            normalizeParentId(c.parent_id),
            c.language_code,
          ]);
        }

        // C) Re-insert prayers (all languages)
        for (const p of (prayers ?? []) as PrayerType[]) {
          await insertPrayer.executeAsync([
            p.id,
            p.name,
            p.arabic_title ?? null,
            p.category_id,
            p.arabic_introduction ?? null,
            p.arabic_text ?? null,
            p.arabic_notes ?? null,
            p.transliteration_text ?? null,
            p.source ?? null,
            JSON.stringify(p.translated_languages ?? []), // NOT NULL column in schema
            p.created_at as any,
            p.updated_at as any,
          ]);
        }

        // D) Re-insert translations (ALL languages)
        for (const t of (translations ?? []) as PrayerWithTranslationType[]) {
          await insertTrans.executeAsync([
            t.id,
            t.prayer_id,
            t.language_code,
            t.translated_title,
            t.translated_introduction ?? null,
            t.translated_text ?? null,
            t.translated_notes ?? null,
            t.source ?? null,
            t.created_at as any,
            t.updated_at as any,
          ]);
        }

        // E) Orphan sweeps
        await txn.runAsync(`
        DELETE FROM favorite_prayers
        WHERE prayer_id NOT IN (SELECT id FROM prayers);
      `);
      } finally {
        await Promise.allSettled([
          insertCat.finalizeAsync(),
          insertPrayer.finalizeAsync(),
          insertTrans.finalizeAsync(),
        ]);
      }
    });

    console.log(`Prayers & translations synced (full replace, ALL languages).`);
    // Increment the prayer version after successful sync
    const { incrementPrayersVersion } = useDataVersionStore.getState();
    incrementPrayersVersion();
  } catch (error) {
    console.error("Critical error in syncPrayers:", error);
  }
}