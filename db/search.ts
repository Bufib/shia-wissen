// // src/db/queries/search.ts
// import {
//   QuestionType,
//   PrayerWithCategory,
//   Language,
//   QuranVerseType,
// } from "@/constants/Types";
// import { getDatabase } from ".";

// /* -------------------------- helpers & types -------------------------- */

// export type PagedResult<T> = {
//   rows: T[];
//   total: number;
//   limit: number;
//   offset: number;
//   nextOffset: number | null;
//   hasMore: boolean;
// };

// const DEFAULT_LIMIT = 30;
// const HARD_MAX_LIMIT = 200;

// function clampLimit(limit?: number) {
//   const l = limit ?? DEFAULT_LIMIT;
//   return Math.max(1, Math.min(HARD_MAX_LIMIT, l));
// }

// /** Escape \ % _ so they’re literal in LIKE */
// function escapeLike(s: string) {
//   return s.replace(/[\\%_]/g, "\\$&");
// }

// /** Build %...% or prefix... pattern */
// function likePattern(term: string, mode: "contains" | "prefix" = "contains") {
//   const t = escapeLike(term.trim());
//   return mode === "prefix" ? `${t}%` : `%${t}%`;
// }

// function pageMeta<T>(
//   rows: T[],
//   total: number,
//   limit: number,
//   offset: number
// ): PagedResult<T> {
//   const nextOffset = offset + rows.length < total ? offset + rows.length : null;
//   return {
//     rows,
//     total,
//     limit,
//     offset,
//     nextOffset,
//     hasMore: nextOffset != null,
//   };
// }

// function emptyResult<T>(limit: number, offset: number): PagedResult<T> {
//   return {
//     rows: [],
//     total: 0,
//     limit,
//     offset,
//     nextOffset: null,
//     hasMore: false,
//   };
// }

// /* ------------------------------- QUR’AN ------------------------------ */

// function quranTableFor(lang: Language) {
//   if (lang === "ar")
//     return { table: "aya_ar", col: "quran_arabic_text" as const, alias: "a" };
//   if (lang === "de")
//     return { table: "aya_de", col: "quran_german_text" as const, alias: "d" };
//   return { table: "aya_en", col: "quran_english_text" as const, alias: "e" };
// }

// /** Search Qur’an by verse text (selected language) + transliteration + surah titles.
//  *  - AR titles in `sura.label`
//  *  - EN titles in `sura.label_en`
//  *  - DE titles in **both** `sura.label_en` and `sura.label_de`
//  */
// export async function searchQuran(
//   lang: Language,
//   term: string,
//   opts?: { limit?: number; offset?: number }
// ): Promise<PagedResult<QuranVerseType & { transliteration: string | null }>> {
//   const limit = clampLimit(opts?.limit);
//   const offset = opts?.offset ?? 0;
//   if (!term.trim())
//     return {
//       rows: [],
//       total: 0,
//       limit,
//       offset,
//       nextOffset: null,
//       hasMore: false,
//     };

//   const db = getDatabase();
//   const { table, col, alias } = quranTableFor(lang);
//   const pat = likePattern(term);

//   // Build the title WHERE + params based on lang
//   let titleWhere = "";
//   let titleParams: any[] = [];
//   if (lang === "ar") {
//     titleWhere = `LOWER(COALESCE(s.label,'')) LIKE LOWER(?) ESCAPE '\\'`;
//     titleParams = [pat];
//   } else if (lang === "de") {
//     // Search both label_en and label_de for German
//     titleWhere = `(
//       LOWER(COALESCE(s.label_en,'')) LIKE LOWER(?) ESCAPE '\\'
//       OR LOWER(COALESCE(s.label_de,'')) LIKE LOWER(?) ESCAPE '\\'
//     )`;
//     titleParams = [pat, pat];
//   } else {
//     // EN (and other non-AR languages) → label_en
//     titleWhere = `LOWER(COALESCE(s.label_en,'')) LIKE LOWER(?) ESCAPE '\\'`;
//     titleParams = [pat];
//   }

//   // 1) Verse text + transliteration matches (no LIMIT here; paginate in JS)
//   const textRows = await db.getAllAsync<
//     QuranVerseType & { transliteration: string | null }
//   >(
//     `
//     SELECT ${alias}.sura, ${alias}.aya,
//            ${alias}.${col} AS text,
//            t.quran_transliteration_text AS transliteration
//     FROM ${table} ${alias}
//     LEFT JOIN aya_en_transliteration t
//       ON t.sura = ${alias}.sura AND t.aya = ${alias}.aya
//     WHERE LOWER(${alias}.${col}) LIKE LOWER(?) ESCAPE '\\'
//        OR LOWER(COALESCE(t.quran_transliteration_text,'')) LIKE LOWER(?) ESCAPE '\\'
//     `,
//     [pat, pat]
//   );

//   // 2) Surah-title matches → return ayah 1 of each matched sūrah
//   const titleRows = await db.getAllAsync<
//     QuranVerseType & { transliteration: string | null }
//   >(
//     `
//     SELECT v.sura, v.aya, v.${col} AS text, tr.quran_transliteration_text AS transliteration
//     FROM sura s
//     JOIN ${table} v
//       ON v.sura = s.id AND v.aya = 1
//     LEFT JOIN aya_en_transliteration tr
//       ON tr.sura = v.sura AND tr.aya = v.aya
//     WHERE ${titleWhere}
//     `,
//     titleParams
//   );

//   // 3) Merge + de-dupe by (sura, aya), then sort
//   const byKey = new Map<
//     string,
//     QuranVerseType & { transliteration: string | null }
//   >();
//   for (const r of [...textRows, ...titleRows]) {
//     const k = `${r.sura}:${r.aya}`;
//     if (!byKey.has(k)) byKey.set(k, r);
//   }
//   const merged = Array.from(byKey.values()).sort(
//     (a, b) => a.sura - b.sura || a.aya - b.aya
//   );

//   // 4) Paginate in JS
//   const total = merged.length;
//   const paged = merged.slice(offset, offset + limit);
//   const nextOffset =
//     offset + paged.length < total ? offset + paged.length : null;

//   return {
//     rows: paged,
//     total,
//     limit,
//     offset,
//     nextOffset,
//     hasMore: nextOffset != null,
//   };
// }

// /* ------------------------------ QUESTIONS ---------------------------- */

// /** Search questions (by language) across title/question/answers. */
// export async function searchQuestions(
//   language: string,
//   term: string,
//   opts?: { limit?: number; offset?: number }
// ): Promise<PagedResult<QuestionType>> {
//   const limit = clampLimit(opts?.limit);
//   const offset = opts?.offset ?? 0;
//   if (!term.trim()) return emptyResult(limit, offset);

//   const db = getDatabase();
//   const pat = likePattern(term);
//   const patPrefix = likePattern(term, "prefix");

//   const totalRow = await db.getFirstAsync<{ total: number }>(
//     `
//     SELECT COUNT(*) AS total
//     FROM questions
//     WHERE language_code = ?
//       AND (
//         title                           LIKE ? ESCAPE '\\'
//         OR question                     LIKE ? ESCAPE '\\'
//         OR COALESCE(answer,'')          LIKE ? ESCAPE '\\'
//         OR COALESCE(answer_khamenei,'') LIKE ? ESCAPE '\\'
//         OR COALESCE(answer_sistani,'')  LIKE ? ESCAPE '\\'
//       );
//     `,
//     [language, pat, pat, pat, pat, pat]
//   );
//   const total = totalRow?.total ?? 0;

//   const rows = await db.getAllAsync<QuestionType>(
//     `
//     SELECT *
//     FROM questions
//     WHERE language_code = ?
//       AND (
//         title                           LIKE ? ESCAPE '\\'
//         OR question                     LIKE ? ESCAPE '\\'
//         OR COALESCE(answer,'')          LIKE ? ESCAPE '\\'
//         OR COALESCE(answer_khamenei,'') LIKE ? ESCAPE '\\'
//         OR COALESCE(answer_sistani,'')  LIKE ? ESCAPE '\\'
//       )
//     ORDER BY
//       CASE WHEN title LIKE ? ESCAPE '\\' THEN 0
//            WHEN title LIKE ? ESCAPE '\\' THEN 1
//            ELSE 2 END,
//       datetime(created_at) DESC
//     LIMIT ? OFFSET ?;
//     `,
//     [language, pat, pat, pat, pat, pat, patPrefix, pat, limit, offset]
//   );

//   return pageMeta(rows, total, limit, offset);
// }

// /* ------------------------------- PRAYERS ----------------------------- */

// /** Search prayers by name + localized/Arabic/transliteration text. */
// export async function searchPrayers(
//   language: string,
//   term: string,
//   opts?: { limit?: number; offset?: number; categoryId?: number | null }
// ): Promise<PagedResult<PrayerWithCategory>> {
//   const limit = clampLimit(opts?.limit);
//   const offset = opts?.offset ?? 0;
//   if (!term.trim()) return emptyResult(limit, offset);

//   const db = getDatabase();
//   const pat = likePattern(term);
//   const patPrefix = likePattern(term, "prefix");

//   const baseParams: any[] = [language, pat, pat, pat, pat];
//   const catFilter = opts?.categoryId != null ? " AND p.category_id = ? " : "";
//   if (opts?.categoryId != null) baseParams.push(opts.categoryId);

//   const totalRow = await db.getFirstAsync<{ total: number }>(
//     `
//     SELECT COUNT(*) AS total
//     FROM prayers p
//     LEFT JOIN prayer_translations t
//       ON t.prayer_id = p.id AND t.language_code = ?
//     WHERE (p.name LIKE ? ESCAPE '\\'
//            OR LOWER(COALESCE(t.translated_text,''))   LIKE LOWER(?) ESCAPE '\\'
//            OR LOWER(COALESCE(p.arabic_text,''))       LIKE LOWER(?) ESCAPE '\\'
//            OR LOWER(COALESCE(p.transliteration_text,'')) LIKE LOWER(?) ESCAPE '\\')
//     ${catFilter};
//     `,
//     baseParams
//   );
//   const total = totalRow?.total ?? 0;

//   const rows = await db.getAllAsync<PrayerWithCategory>(
//     `
//     SELECT
//       p.id,
//       p.name,
//       COALESCE(t.translated_text, p.arabic_text, '') AS prayer_text,
//       p.category_id
//     FROM prayers p
//     LEFT JOIN prayer_translations t
//       ON t.prayer_id = p.id AND t.language_code = ?
//     WHERE (p.name LIKE ? ESCAPE '\\'
//            OR LOWER(COALESCE(t.translated_text,''))   LIKE LOWER(?) ESCAPE '\\'
//            OR LOWER(COALESCE(p.arabic_text,''))       LIKE LOWER(?) ESCAPE '\\'
//            OR LOWER(COALESCE(p.transliteration_text,'')) LIKE LOWER(?) ESCAPE '\\')
//     ${catFilter}
//     ORDER BY
//       CASE WHEN p.name LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END,
//       p.name COLLATE NOCASE
//     LIMIT ? OFFSET ?;
//     `,
//     [
//       language,
//       pat,
//       pat,
//       pat,
//       pat,
//       ...(opts?.categoryId != null ? [opts.categoryId] : []),
//       patPrefix,
//       limit,
//       offset,
//     ]
//   );

//   return pageMeta(rows, total, limit, offset);
// }

// src/db/queries/search.ts
import {
  QuestionType,
  PrayerWithCategory,
  Language,
  QuranVerseType,
} from "@/constants/Types";
import { getDatabase } from ".";

/* -------------------------- helpers & types -------------------------- */

export type PagedResult<T> = {
  rows: T[];
  total: number;
  limit: number;
  offset: number;
  nextOffset: number | null;
  hasMore: boolean;
};

const DEFAULT_LIMIT = 30;
const HARD_MAX_LIMIT = 200;

function clampLimit(limit?: number) {
  const l = limit ?? DEFAULT_LIMIT;
  return Math.max(1, Math.min(HARD_MAX_LIMIT, l));
}

/** Escape \ % _ so they’re literal in LIKE */
function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, "\\$&");
}

/** Build %...% or prefix... pattern */
function likePattern(term: string, mode: "contains" | "prefix" = "contains") {
  const t = escapeLike(term.trim());
  return mode === "prefix" ? `${t}%` : `%${t}%`;
}

function pageMeta<T>(
  rows: T[],
  total: number,
  limit: number,
  offset: number,
): PagedResult<T> {
  const nextOffset = offset + rows.length < total ? offset + rows.length : null;
  return {
    rows,
    total,
    limit,
    offset,
    nextOffset,
    hasMore: nextOffset != null,
  };
}

function emptyResult<T>(limit: number, offset: number): PagedResult<T> {
  return {
    rows: [],
    total: 0,
    limit,
    offset,
    nextOffset: null,
    hasMore: false,
  };
}

/* ------------------------------- QUR’AN ------------------------------ */

function quranTableFor(lang: Language) {
  if (lang === "ar")
    return { table: "aya_ar", col: "quran_arabic_text" as const, alias: "a" };
  if (lang === "de")
    return { table: "aya_de", col: "quran_german_text" as const, alias: "d" };
  return { table: "aya_en", col: "quran_english_text" as const, alias: "e" };
}

/** Search Qur’an by verse text (selected language) + transliteration + surah titles.
 *  - AR titles in `sura.label`
 *  - EN titles in `sura.label_en`
 *  - DE titles in **both** `sura.label_en` and `sura.label_de`
 */
export async function searchQuran(
  lang: Language,
  term: string,
  opts?: { limit?: number; offset?: number },
): Promise<
  PagedResult<QuranVerseType & { id?: number; transliteration: string | null }>
> {
  const limit = clampLimit(opts?.limit);
  const offset = opts?.offset ?? 0;
  if (!term.trim())
    return {
      rows: [],
      total: 0,
      limit,
      offset,
      nextOffset: null,
      hasMore: false,
    };

  const db = getDatabase();
  const { table, col, alias } = quranTableFor(lang);
  const pat = likePattern(term);

  // Build the title WHERE + params based on lang
  let titleWhere = "";
  let titleParams: any[] = [];
  if (lang === "ar") {
    titleWhere = `LOWER(COALESCE(s.label,'')) LIKE LOWER(?) ESCAPE '\\'`;
    titleParams = [pat];
  } else if (lang === "de") {
    // Search both label_en and label_de for German
    titleWhere = `(
      LOWER(COALESCE(s.label_en,'')) LIKE LOWER(?) ESCAPE '\\'
      OR LOWER(COALESCE(s.label_de,'')) LIKE LOWER(?) ESCAPE '\\'
    )`;
    titleParams = [pat, pat];
  } else {
    // EN (and other non-AR languages) → label_en
    titleWhere = `LOWER(COALESCE(s.label_en,'')) LIKE LOWER(?) ESCAPE '\\'`;
    titleParams = [pat];
  }

  // 1) Verse text + transliteration matches (no LIMIT here; paginate in JS)
  const textRows = await db.getAllAsync<
    QuranVerseType & { id?: number; transliteration: string | null }
  >(
    `
    SELECT ${alias}.id            AS id,
           ${alias}.sura          AS sura,
           ${alias}.aya           AS aya,
           ${alias}.${col}        AS text,
           t.quran_transliteration_text AS transliteration
    FROM ${table} ${alias}
    LEFT JOIN aya_en_transliteration t
      ON t.sura = ${alias}.sura AND t.aya = ${alias}.aya
    WHERE LOWER(${alias}.${col}) LIKE LOWER(?) ESCAPE '\\'
       OR LOWER(COALESCE(t.quran_transliteration_text,'')) LIKE LOWER(?) ESCAPE '\\'
    `,
    [pat, pat],
  );

  // 2) Surah-title matches → return ayah 1 of each matched sūrah
  const titleRows = await db.getAllAsync<
    QuranVerseType & { id?: number; transliteration: string | null }
  >(
    `
    SELECT v.id                   AS id,
           v.sura                 AS sura,
           v.aya                  AS aya,
           v.${col}               AS text,
           tr.quran_transliteration_text AS transliteration
    FROM sura s
    JOIN ${table} v
      ON v.sura = s.id AND v.aya = 1
    LEFT JOIN aya_en_transliteration tr
      ON tr.sura = v.sura AND tr.aya = v.aya
    WHERE ${titleWhere}
    `,
    titleParams,
  );

  // 3) Merge + de-dupe by (sura, aya), then sort
  const byKey = new Map<
    string,
    QuranVerseType & { id?: number; transliteration: string | null }
  >();
  for (const r of [...textRows, ...titleRows]) {
    const k = `${r.sura}:${r.aya}`;
    if (!byKey.has(k)) byKey.set(k, r);
  }
  const merged = Array.from(byKey.values()).sort(
    (a, b) => a.sura - b.sura || a.aya - b.aya,
  );

  // 4) Paginate in JS
  const total = merged.length;
  const paged = merged.slice(offset, offset + limit);
  const nextOffset =
    offset + paged.length < total ? offset + paged.length : null;

  return {
    rows: paged,
    total,
    limit,
    offset,
    nextOffset,
    hasMore: nextOffset != null,
  };
}

/* ------------------------------ QUESTIONS ---------------------------- */

/** Search questions (by language) across title/question/answers. */
export async function searchQuestions(
  language: string,
  term: string,
  opts?: { limit?: number; offset?: number },
): Promise<PagedResult<QuestionType>> {
  const limit = clampLimit(opts?.limit);
  const offset = opts?.offset ?? 0;
  if (!term.trim()) return emptyResult(limit, offset);

  const db = getDatabase();
  const pat = likePattern(term);
  const patPrefix = likePattern(term, "prefix");

  const totalRow = await db.getFirstAsync<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM questions
    WHERE language_code = ?
      AND (
        title                           LIKE ? ESCAPE '\\'
        OR question                     LIKE ? ESCAPE '\\'
        OR COALESCE(answer,'')          LIKE ? ESCAPE '\\'
        OR COALESCE(answer_khamenei,'') LIKE ? ESCAPE '\\'
        OR COALESCE(answer_sistani,'')  LIKE ? ESCAPE '\\'
      );
    `,
    [language, pat, pat, pat, pat, pat],
  );
  const total = totalRow?.total ?? 0;

  const rows = await db.getAllAsync<QuestionType>(
    `
    SELECT *
    FROM questions
    WHERE language_code = ?
      AND (
        title                           LIKE ? ESCAPE '\\'
        OR question                     LIKE ? ESCAPE '\\'
        OR COALESCE(answer,'')          LIKE ? ESCAPE '\\'
        OR COALESCE(answer_khamenei,'') LIKE ? ESCAPE '\\'
        OR COALESCE(answer_sistani,'')  LIKE ? ESCAPE '\\'
      )
    ORDER BY
      CASE WHEN title LIKE ? ESCAPE '\\' THEN 0
           WHEN title LIKE ? ESCAPE '\\' THEN 1
           ELSE 2 END,
      datetime(created_at) DESC
    LIMIT ? OFFSET ?;
    `,
    [language, pat, pat, pat, pat, pat, patPrefix, pat, limit, offset],
  );

  return pageMeta(rows, total, limit, offset);
}

/* ------------------------------- PRAYERS ----------------------------- */

/** Search prayers by name + localized/Arabic/transliteration text. */
// export async function searchPrayers(
//   language: string,
//   term: string,
//   opts?: { limit?: number; offset?: number; categoryId?: number | null }
// ): Promise<PagedResult<PrayerWithCategory>> {
//   const limit = clampLimit(opts?.limit);
//   const offset = opts?.offset ?? 0;
//   if (!term.trim()) return emptyResult(limit, offset);

//   const db = getDatabase();
//   const pat = likePattern(term);
//   const patPrefix = likePattern(term, "prefix");

//   const baseParams: any[] = [language, pat, pat, pat, pat];
//   const catFilter = opts?.categoryId != null ? " AND p.category_id = ? " : "";
//   if (opts?.categoryId != null) baseParams.push(opts.categoryId);

//   const totalRow = await db.getFirstAsync<{ total: number }>(
//     `
//     SELECT COUNT(*) AS total
//     FROM prayers p
//     LEFT JOIN prayer_translations t
//       ON t.prayer_id = p.id AND t.language_code = ?
//     WHERE (p.name LIKE ? ESCAPE '\\'
//            OR LOWER(COALESCE(t.translated_text,''))   LIKE LOWER(?) ESCAPE '\\'
//            OR LOWER(COALESCE(p.arabic_text,''))       LIKE LOWER(?) ESCAPE '\\'
//            OR LOWER(COALESCE(p.transliteration_text,'')) LIKE LOWER(?) ESCAPE '\\')
//     ${catFilter};
//     `,
//     baseParams
//   );
//   const total = totalRow?.total ?? 0;

//   const rows = await db.getAllAsync<PrayerWithCategory>(
//     `
//     SELECT
//       p.id,
//       p.name,
//       COALESCE(t.translated_text, p.arabic_text, '') AS prayer_text,
//       p.category_id
//     FROM prayers p
//     LEFT JOIN prayer_translations t
//       ON t.prayer_id = p.id AND t.language_code = ?
//     WHERE (p.name LIKE ? ESCAPE '\\'
//            OR LOWER(COALESCE(t.translated_text,''))   LIKE LOWER(?) ESCAPE '\\'
//            OR LOWER(COALESCE(p.arabic_text,''))       LIKE LOWER(?) ESCAPE '\\'
//            OR LOWER(COALESCE(p.transliteration_text,'')) LIKE LOWER(?) ESCAPE '\\')
//     ${catFilter}
//     ORDER BY
//       CASE WHEN p.name LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END,
//       p.name COLLATE NOCASE
//     LIMIT ? OFFSET ?;
//     `,
//     [
//       language,
//       pat,
//       pat,
//       pat,
//       pat,
//       ...(opts?.categoryId != null ? [opts.categoryId] : []),
//       patPrefix,
//       limit,
//       offset,
//     ]
//   );

//   return pageMeta(rows, total, limit, offset);
// }

export async function searchPrayers(
  language: string,
  term: string,
  opts?: { limit?: number; offset?: number; categoryId?: number | null },
): Promise<PagedResult<PrayerWithCategory>> {
  const limit = clampLimit(opts?.limit);
  const offset = opts?.offset ?? 0;
  if (!term.trim()) return emptyResult(limit, offset);

  const db = getDatabase();
  const pat = likePattern(term);
  const patPrefix = likePattern(term, "prefix");

  const baseParams: any[] = [language, pat, pat, pat, pat, pat];
  const catFilter = opts?.categoryId != null ? " AND p.category_id = ? " : "";
  if (opts?.categoryId != null) baseParams.push(opts.categoryId);

  const totalRow = await db.getFirstAsync<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM prayers p
    LEFT JOIN prayer_translations t
      ON t.prayer_id = p.id AND t.language_code = ?
    WHERE (
           COALESCE(t.translated_title,'') LIKE ? ESCAPE '\\'
           OR COALESCE(p.arabic_title,'')  LIKE ? ESCAPE '\\'
           OR LOWER(COALESCE(t.translated_text,''))      LIKE LOWER(?) ESCAPE '\\'
           OR LOWER(COALESCE(p.arabic_text,''))          LIKE LOWER(?) ESCAPE '\\'
           OR LOWER(COALESCE(p.transliteration_text,'')) LIKE LOWER(?) ESCAPE '\\')
    ${catFilter};
    `,
    baseParams,
  );
  const total = totalRow?.total ?? 0;

  const rows = await db.getAllAsync<PrayerWithCategory>(
    `
    SELECT
      p.id,
      COALESCE(t.translated_title, p.arabic_title, p.name, '') AS name,
      COALESCE(t.translated_text, p.arabic_text, '') AS prayer_text,
      p.category_id
    FROM prayers p
    LEFT JOIN prayer_translations t
      ON t.prayer_id = p.id AND t.language_code = ?
    WHERE (
           COALESCE(t.translated_title,'') LIKE ? ESCAPE '\\'
           OR COALESCE(p.arabic_title,'')  LIKE ? ESCAPE '\\'
           OR LOWER(COALESCE(t.translated_text,''))      LIKE LOWER(?) ESCAPE '\\'
           OR LOWER(COALESCE(p.arabic_text,''))          LIKE LOWER(?) ESCAPE '\\'
           OR LOWER(COALESCE(p.transliteration_text,'')) LIKE LOWER(?) ESCAPE '\\')
    ${catFilter}
    ORDER BY
      CASE WHEN COALESCE(t.translated_title, p.arabic_title, '') LIKE ? ESCAPE '\\' THEN 0 ELSE 1 END,
      COALESCE(t.translated_title, p.arabic_title, p.name, '') COLLATE NOCASE
    LIMIT ? OFFSET ?;
    `,
    [
      language,
      pat,
      pat,
      pat,
      pat,
      pat,
      ...(opts?.categoryId != null ? [opts.categoryId] : []),
      patPrefix,
      limit,
      offset,
    ],
  );

  return pageMeta(rows, total, limit, offset);
}
/* -------------------------- QUR’AN LABELS ONLY -------------------------- */

export type QuranLabelRow = {
  sura: number;
  label: string; // what we show to the user
  identifier: string; // "sura:1" for quranLink
};

/**
 * Search only surah labels (not ayat).
 *
 * Matches if term is in:
 *  - s.label      (Arabic)
 *  - s.label_en
 *  - s.label_de
 *
 * Display:
 *  - lang === "ar"  -> use Arabic label
 *  - lang === "de"  -> prefer label_en (fallback: label_de, label)
 *  - lang === "en"  -> prefer label_en (fallback: label, label_de)
 */
export async function searchQuranLabels(
  lang: Language,
  term: string,
  opts?: { limit?: number; offset?: number },
): Promise<PagedResult<QuranLabelRow>> {
  const limit = clampLimit(opts?.limit);
  const offset = opts?.offset ?? 0;
  if (!term.trim()) return emptyResult(limit, offset);

  const db = getDatabase();
  const pat = likePattern(term);

  // Count: search across all label fields
  const totalRow = await db.getFirstAsync<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM sura s
    WHERE
      LOWER(COALESCE(s.label,''))    LIKE LOWER(?) ESCAPE '\\'
      OR LOWER(COALESCE(s.label_en,'')) LIKE LOWER(?) ESCAPE '\\'
      OR LOWER(COALESCE(s.label_de,'')) LIKE LOWER(?) ESCAPE '\\'
    `,
    [pat, pat, pat],
  );
  const total = totalRow?.total ?? 0;
  if (!total) return emptyResult(limit, offset);

  // Choose what to show based on lang
  let labelExpr: string;
  if (lang === "ar") {
    // Prefer Arabic, fallback to anything
    labelExpr = `COALESCE(s.label, s.label_en, s.label_de, '')`;
  } else {
    // For "de" and "en" (and others) always prefer English label
    labelExpr = `COALESCE(s.label_en, s.label_de, s.label, '')`;
  }

  const rows = await db.getAllAsync<{ sura: number; label: string }>(
    `
    SELECT
      s.id        AS sura,
      ${labelExpr} AS label
    FROM sura s
    WHERE
      LOWER(COALESCE(s.label,''))    LIKE LOWER(?) ESCAPE '\\'
      OR LOWER(COALESCE(s.label_en,'')) LIKE LOWER(?) ESCAPE '\\'
      OR LOWER(COALESCE(s.label_de,'')) LIKE LOWER(?) ESCAPE '\\'
    ORDER BY s.id
    LIMIT ? OFFSET ?;
    `,
    [pat, pat, pat, limit, offset],
  );

  const mapped: QuranLabelRow[] = rows.map((r) => ({
    sura: r.sura,
    label: r.label || String(r.sura),
    identifier: `${r.sura}:1`, // internal quranLink anchor
  }));

  return pageMeta(mapped, total, limit, offset);
}
