//! Neu geordnet

import { addFavoriteToast, removeFavoriteToast } from "@/constants/messages";
import { getDatabase } from "../index";
import {
  Language,
  QuranVerseType,
  SuraRowType,
  MarkerRowType,
  JuzRow,
  JuzStartType,
  JuzBoundsType,
  LanguageCode,
  QuranInternalResultType,
  FavoritePageType,
  FavoriteJuzType,
  FavoriteSuraType,
} from "@/constants/Types";

// --- helpers ---------------------------------------------------------------

/** Map language → table/column/select (used where convenient). */
function verseSelectFor(lang: Language) {
  if (lang === "ar") {
    return {
      table: "aya_ar",
      col: "quran_arabic_text",
      select: "id, sura, aya, quran_arabic_text AS text",
    } as const;
  }
  if (lang === "de") {
    return {
      table: "aya_de",
      col: "quran_german_text",
      select: "id, sura, aya, quran_german_text AS text",
    } as const;
  }
  // en
  return {
    table: "aya_en",
    col: "quran_english_text",
    select: "id, sura, aya, quran_english_text AS text",
  } as const;
}

/** Internal: common juz-row lookup used by getPageForAyah/getJuzOfAyah. */
async function getJuzRowAtOrBefore(
  sura: number,
  aya: number
): Promise<{ id: number; page: number; sura: number; aya: number } | null> {
  try {
    const db = getDatabase();
    return await db.getFirstAsync(
      `
      SELECT id, page, sura, aya
      FROM juz
      WHERE (sura < ? OR (sura = ? AND aya <= ?))
      ORDER BY sura DESC, aya DESC
      LIMIT 1;
      `,
      [sura, sura, aya]
    );
  } catch (err) {
    console.error("getJuzRowAtOrBefore error", { sura, aya, err });
    return null;
  }
}

// --- queries ---------------------------------------------------------------

/** Get a single ayah (always with Arabic transliteration). */
export async function getAyah(
  lang: Language,
  sura: number,
  aya: number
): Promise<QuranVerseType | null> {
  try {
    const db = getDatabase();

    if (lang === "ar") {
      const row = await db.getFirstAsync<
        QuranVerseType & { transliteration: string | null }
      >(
        `
        SELECT a.sura, a.aya, a.quran_arabic_text AS text, 
               t.quran_transliteration_text AS transliteration
        FROM aya_ar a
        LEFT JOIN aya_en_transliteration t
          ON t.sura = a.sura AND t.aya = a.aya
        WHERE a.sura = ? AND a.aya = ?
        LIMIT 1;
        `,
        [sura, aya]
      );
      return row ?? null;
    }

    if (lang === "de") {
      const row = await db.getFirstAsync<
        QuranVerseType & { transliteration: string | null }
      >(
        `
        SELECT d.sura, d.aya, d.quran_german_text AS text, 
               t.quran_transliteration_text AS transliteration
        FROM aya_de d
        LEFT JOIN aya_en_transliteration t
          ON t.sura = d.sura AND t.aya = d.aya
        WHERE d.sura = ? AND d.aya = ?
        LIMIT 1;
        `,
        [sura, aya]
      );
      return row ?? null;
    }

    const row = await db.getFirstAsync<
      QuranVerseType & { transliteration: string | null }
    >(
      `
      SELECT e.sura, e.aya, e.quran_english_text AS text, 
             t.quran_transliteration_text AS transliteration
      FROM aya_en e
      LEFT JOIN aya_en_transliteration t
        ON t.sura = e.sura AND t.aya = e.aya
      WHERE e.sura = ? AND e.aya = ?
      LIMIT 1;
      `,
      [sura, aya]
    );
    return row ?? null;
  } catch (err) {
    console.error("getAyah error", { lang, sura, aya, err });
    return null;
  }
}

/** Get all verses for a surah (always with Arabic transliteration). */
export async function getSurahVerses(
  lang: Language,
  sura: number
): Promise<QuranVerseType[]> {
  try {
    const db = getDatabase();

    if (lang === "ar") {
      return await db.getAllAsync<
        QuranVerseType & { transliteration: string | null }
      >(
        `
        SELECT a.sura, a.aya, a.quran_arabic_text AS text,
               t.quran_transliteration_text AS transliteration
        FROM aya_ar a
        LEFT JOIN aya_en_transliteration t
          ON t.sura = a.sura AND t.aya = a.aya
        WHERE a.sura = ?
        ORDER BY a.aya;
        `,
        [sura]
      );
    }

    if (lang === "de") {
      return await db.getAllAsync<
        QuranVerseType & { transliteration: string | null }
      >(
        `
        SELECT d.sura, d.aya, d.quran_german_text AS text,
               t.quran_transliteration_text AS transliteration
        FROM aya_de d
        LEFT JOIN aya_en_transliteration t
          ON t.sura = d.sura AND t.aya = d.aya
        WHERE d.sura = ?
        ORDER BY d.aya;
        `,
        [sura]
      );
    }

    return await db.getAllAsync<
      QuranVerseType & { transliteration: string | null }
    >(
      `
      SELECT e.sura, e.aya, e.quran_english_text AS text, 
             t.quran_transliteration_text AS transliteration
      FROM aya_en e
      LEFT JOIN aya_en_transliteration t
        ON t.sura = e.sura AND t.aya = e.aya
      WHERE e.sura = ?
      ORDER BY e.aya;
      `,
      [sura]
    );
  } catch (err) {
    console.error("getSurahVerses error", { lang, sura, err });
    return [];
  }
}

/** List all surahs (metadata). */
export async function getSurahList(): Promise<SuraRowType[]> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<SuraRowType>(
      `
      SELECT
        id, orderId, label, label_en, label_de,
        nbAyat, nbWord, nbLetter, startPage, endPage, makki, ruku
      FROM sura
      ORDER BY id;
      `
    );
  } catch (err) {
    console.error("getSurahList error", err);
    return [];
  }
}

export async function getSurahInfoByNumber(
  surahNumber: number
): Promise<SuraRowType | null> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<SuraRowType>(
      `
      SELECT
        id, orderId, label, label_en, label_de,
        nbAyat, nbWord, nbLetter, startPage, endPage, makki, ruku
      FROM sura
      WHERE id = ?          
      LIMIT 1;
      `,
      [surahNumber]
    );
    return row ?? null;
  } catch (err) {
    console.error("getSurahInfoByNumber error", { surahNumber, err });
    return null;
  }
}

/** Localized display name helper. */
export async function getSurahDisplayName(
  surahNumber: number,
  lang: Language
): Promise<string | null> {
  try {
    const info = await getSurahInfoByNumber(surahNumber);
    if (!info) return null;
    if (lang === "en" || lang === "de") return info.label_en ?? info.label;
    if (lang === "ar") return info.label;
    return info.label;
  } catch (err) {
    console.error("getSurahDisplayName error", { surahNumber, lang, err });
    return null;
  }
}

/** Markers for a given surah. */
export async function getHizbForSurah(sura: number): Promise<MarkerRowType[]> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<MarkerRowType>(
      `SELECT id, sura, aya FROM hizb WHERE sura = ? ORDER BY aya;`,
      [sura]
    );
  } catch (err) {
    console.error("getHizbForSurah error", { sura, err });
    return [];
  }
}

export async function getRukuForSurah(sura: number): Promise<MarkerRowType[]> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<MarkerRowType>(
      `SELECT id, sura, aya FROM ruku WHERE sura = ? ORDER BY aya;`,
      [sura]
    );
  } catch (err) {
    console.error("getRukuForSurah error", { sura, err });
    return [];
  }
}

export async function getSajdaForSurah(
  sura: number
): Promise<(MarkerRowType & { type: number | null })[]> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<MarkerRowType & { type: number | null }>(
      `SELECT id, sura, aya, type FROM sajda WHERE sura = ? ORDER BY aya;`,
      [sura]
    );
  } catch (err) {
    console.error("getSajdaForSurah error", { sura, err });
    return [];
  }
}

export async function getJuzForSurah(sura: number): Promise<JuzRow[]> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<JuzRow>(
      `SELECT id, sura, aya, page FROM juz WHERE sura = ? ORDER BY aya;`,
      [sura]
    );
  } catch (err) {
    console.error("getJuzForSurah error", { sura, err });
    return [];
  }
}

/** Find the page that contains a particular ayah (based on page markers in juz). */
export async function getPageForAyah(
  sura: number,
  aya: number
): Promise<number | null> {
  try {
    const row = await getJuzRowAtOrBefore(sura, aya);
    return row?.page ?? null;
  } catch (err) {
    console.error("getPageForAyah error", { sura, aya, err });
    return null;
  }
}

/** Which juz does (sura, aya) belong to? Handy for highlighting the active juz button. */
export async function getJuzOfAyah(
  sura: number,
  aya: number
): Promise<number | null> {
  try {
    const row = await getJuzRowAtOrBefore(sura, aya);
    return row?.id ?? null;
  } catch (err) {
    console.error("getJuzOfAyah error", { sura, aya, err });
    return null;
  }
}

/** Start (sura/aya) for a specific juz (1..30). */
export async function getJuzStart(juz: number): Promise<JuzStartType | null> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<{
      id: number;
      sura: number;
      aya: number;
      page: number | null;
    }>(`SELECT id, sura, aya, page FROM juz WHERE id = ? LIMIT 1;`, [juz]);
    return row
      ? { juz: row.id, sura: row.sura, aya: row.aya, page: row.page ?? null }
      : null;
  } catch (err) {
    console.error("getJuzStart error", { juz, err });
    return null;
  }
}

/** All juz starts in order 1..30. */
export async function getAllJuzStarts(): Promise<JuzStartType[]> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<{
      id: number;
      sura: number;
      aya: number;
      page: number | null;
    }>(`SELECT id, sura, aya, page FROM juz ORDER BY id;`);
    return rows.map((r) => ({
      juz: r.id,
      sura: r.sura,
      aya: r.aya,
      page: r.page ?? null,
    }));
  } catch (err) {
    console.error("getAllJuzStarts error", err);
    return [];
  }
}

/** Optional: labels like "Juz 1 — Al-Fātiḥa 1" in UI language. */
export async function getJuzButtonLabels(
  lang: Language
): Promise<{ juz: number; label: string; sura: number; aya: number }[]> {
  try {
    const starts = await getAllJuzStarts();
    const out: {
      juz: number;
      label: string;
      sura: number;
      aya: number;
    }[] = [];
    for (const s of starts) {
      const surahName =
        (await getSurahDisplayName(s.sura, lang)) ?? `Sura ${s.sura}`;
      out.push({
        juz: s.juz,
        label: `Juz ${s.juz} — ${surahName} ${s.aya}`,
        sura: s.sura,
        aya: s.aya,
      });
    }
    return out;
  } catch (err) {
    console.error("getJuzButtonLabels error", { lang, err });
    return [];
  }
}

/** Compute [start, end) bounds for a juz (1..30). */
export async function getJuzBounds(juz: number): Promise<JuzBoundsType | null> {
  if (juz < 1 || juz > 30) return null;
  try {
    const db = getDatabase();

    const start = await db.getFirstAsync<{ sura: number; aya: number }>(
      `SELECT sura, aya FROM juz WHERE id = ? LIMIT 1;`,
      [juz]
    );
    if (!start) return null;

    // next juz start → exclusive end bound
    const next = await db.getFirstAsync<{ sura: number; aya: number }>(
      `SELECT sura, aya FROM juz WHERE id = ? LIMIT 1;`,
      [juz + 1]
    );

    if (next) {
      return {
        startSura: start.sura,
        startAya: start.aya,
        endSura: next.sura,
        endAya: next.aya,
      };
    }

    // Juz 30 → end at the very last ayah of the Quran
    const last = await db.getFirstAsync<{ sura: number; nbAyat: number }>(
      `SELECT id AS sura, nbAyat FROM sura ORDER BY id DESC LIMIT 1;`
    );
    return {
      startSura: start.sura,
      startAya: start.aya,
      endSura: last?.sura ?? 114,
      endAya: last?.nbAyat ?? 6, // fallback (An-Nas has 6)
    };
  } catch (err) {
    console.error("getJuzBounds error", { juz, err });
    return null;
  }
}

/** Return only (sura, aya) pairs belonging to a juz. */
export async function getJuzAyahRefs(
  juz: number
): Promise<{ sura: number; aya: number }[]> {
  try {
    const db = getDatabase();
    const bounds = await getJuzBounds(juz);
    if (!bounds) return [];

    const { startSura, startAya, endSura, endAya } = bounds;

    if (endSura != null && endAya != null) {
      // [start, end) — end exclusive
      return await db.getAllAsync<{ sura: number; aya: number }>(
        `
        SELECT a.sura, a.aya
        FROM aya_ar a
        WHERE
          (a.sura > ? OR (a.sura = ? AND a.aya >= ?)) AND
          (a.sura < ? OR (a.sura = ? AND a.aya < ?))
        ORDER BY a.sura, a.aya;
        `,
        [startSura, startSura, startAya, endSura, endSura, endAya]
      );
    }

    // No end bound → from start to the end of Quran
    return await db.getAllAsync<{ sura: number; aya: number }>(
      `
      SELECT a.sura, a.aya
      FROM aya_ar a
      WHERE (a.sura > ? OR (a.sura = ? AND a.aya >= ?))
      ORDER BY a.sura, a.aya;
      `,
      [startSura, startSura, startAya]
    );
  } catch (err) {
    console.error("getJuzAyahRefs error", { juz, err });
    return [];
  }
}

/** Return full verses (with transliteration) for a juz in the chosen language. */
export async function getJuzVerses(
  lang: Language,
  juz: number
): Promise<(QuranVerseType & { transliteration: string | null })[]> {
  try {
    const db = getDatabase();
    const bounds = await getJuzBounds(juz);
    if (!bounds) return [];

    const { table } = verseSelectFor(lang);
    const { startSura, startAya, endSura, endAya } = bounds;

    // main table alias
    const alias = table === "aya_ar" ? "a" : table === "aya_de" ? "d" : "e";

    // build a qualified select list (avoid ambiguous sura/aya with the JOIN)
    const selectCols =
      table === "aya_ar"
        ? `${alias}.sura AS sura, ${alias}.aya AS aya, ${alias}.quran_arabic_text AS text`
        : table === "aya_de"
        ? `${alias}.sura AS sura, ${alias}.aya AS aya, ${alias}.quran_german_text AS text`
        : `${alias}.sura AS sura, ${alias}.aya AS aya, ${alias}.quran_english_text AS text`;

    const fromJoin = `
      FROM ${table} ${alias}
      LEFT JOIN aya_en_transliteration t
        ON t.sura = ${alias}.sura AND t.aya = ${alias}.aya
    `;

    if (endSura != null && endAya != null) {
      return await db.getAllAsync<
        QuranVerseType & { transliteration: string | null }
      >(
        `
        SELECT ${selectCols},
               t.quran_transliteration_text AS transliteration
        ${fromJoin}
        WHERE
          (${alias}.sura > ? OR (${alias}.sura = ? AND ${alias}.aya >= ?)) AND
          (${alias}.sura < ? OR (${alias}.sura = ? AND ${alias}.aya < ?))
        ORDER BY ${alias}.sura, ${alias}.aya;
        `,
        [startSura, startSura, startAya, endSura, endSura, endAya]
      );
    }

    // Juz 30 (no end bound)
    return await db.getAllAsync<
      QuranVerseType & { transliteration: string | null }
    >(
      `
      SELECT ${selectCols},
             t.quran_transliteration_text AS transliteration
      ${fromJoin}
      WHERE (${alias}.sura > ? OR (${alias}.sura = ? AND ${alias}.aya >= ?))
      ORDER BY ${alias}.sura, ${alias}.aya;
      `,
      [startSura, startSura, startAya]
    );
  } catch (err) {
    console.error("getJuzVerses error", { lang, juz, err });
    return [];
  }
}
/** Internal: page-row lookup used by getPageForAyah/getPageVerses. */
async function getPageRowAtOrBefore(
  sura: number,
  aya: number
): Promise<{ id: number; sura: number; aya: number } | null> {
  try {
    const db = getDatabase();
    return await db.getFirstAsync(
      `
      SELECT id, sura, aya
      FROM page
      WHERE (sura < ? OR (sura = ? AND aya <= ?))
      ORDER BY sura DESC, aya DESC
      LIMIT 1;
      `,
      [sura, sura, aya]
    );
  } catch (err) {
    console.error("getPageRowAtOrBefore error", { sura, aya, err });
    return null;
  }
}
export async function getPageStart(
  page: number
): Promise<{ page: number; sura: number; aya: number } | null> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<{
      id: number;
      sura: number;
      aya: number;
    }>(`SELECT id, sura, aya FROM page WHERE id = ? LIMIT 1;`, [page]);
    return row ? { page: row.id, sura: row.sura, aya: row.aya } : null;
  } catch (err) {
    console.error("getPageStart error", { page, err });
    return null;
  }
}
export async function getPageBounds(page: number): Promise<{
  startSura: number;
  startAya: number;
  endSura: number | null;
  endAya: number | null;
} | null> {
  try {
    const db = getDatabase();

    const start = await db.getFirstAsync<{ sura: number; aya: number }>(
      `SELECT sura, aya FROM page WHERE id = ? LIMIT 1;`,
      [page]
    );
    if (!start) return null;

    const next = await db.getFirstAsync<{ sura: number; aya: number }>(
      `SELECT sura, aya FROM page WHERE id = ? LIMIT 1;`,
      [page + 1]
    );

    if (next) {
      return {
        startSura: start.sura,
        startAya: start.aya,
        endSura: next.sura,
        endAya: next.aya,
      };
    }

    // last page → open-ended (to the end of the Qur'an)
    return {
      startSura: start.sura,
      startAya: start.aya,
      endSura: null,
      endAya: null,
    };
  } catch (err) {
    console.error("getPageBounds error", { page, err });
    return null;
  }
}
export async function getPageVerses(
  lang: Language,
  page: number
): Promise<(QuranVerseType & { transliteration: string | null })[]> {
  try {
    const db = getDatabase();
    const bounds = await getPageBounds(page);
    if (!bounds) return [];

    const { table } = verseSelectFor(lang);
    const alias = table === "aya_ar" ? "a" : table === "aya_de" ? "d" : "e";
    const selectCols =
      table === "aya_ar"
        ? `${alias}.sura AS sura, ${alias}.aya AS aya, ${alias}.quran_arabic_text AS text`
        : table === "aya_de"
        ? `${alias}.sura AS sura, ${alias}.aya AS aya, ${alias}.quran_german_text AS text`
        : `${alias}.sura AS sura, ${alias}.aya AS aya, ${alias}.quran_english_text AS text`;

    const fromJoin = `
      FROM ${table} ${alias}
      LEFT JOIN aya_en_transliteration t
        ON t.sura = ${alias}.sura AND t.aya = ${alias}.aya
    `;

    const { startSura, startAya, endSura, endAya } = bounds;

    if (endSura != null && endAya != null) {
      // [start, end) — end exclusive
      return await db.getAllAsync<
        QuranVerseType & { transliteration: string | null }
      >(
        `
        SELECT ${selectCols}, t.quran_transliteration_text AS transliteration
        ${fromJoin}
        WHERE
          (${alias}.sura > ? OR (${alias}.sura = ? AND ${alias}.aya >= ?)) AND
          (${alias}.sura < ? OR (${alias}.sura = ? AND ${alias}.aya < ?))
        ORDER BY ${alias}.sura, ${alias}.aya;
        `,
        [startSura, startSura, startAya, endSura, endSura, endAya]
      );
    }

    // last page → from start to the end of the Qur'an
    return await db.getAllAsync<
      QuranVerseType & { transliteration: string | null }
    >(
      `
      SELECT ${selectCols}, t.quran_transliteration_text AS transliteration
      ${fromJoin}
      WHERE (${alias}.sura > ? OR (${alias}.sura = ? AND ${alias}.aya >= ?))
      ORDER BY ${alias}.sura, ${alias}.aya;
      `,
      [startSura, startSura, startAya]
    );
  } catch (err) {
    console.error("getPageVerses error", { lang, page, err });
    return [];
  }
}
/** Exact page for an ayah, using the page table (better than via juz). */
export async function getPageOfAyah(
  sura: number,
  aya: number
): Promise<number | null> {
  try {
    const row = await getPageRowAtOrBefore(sura, aya);
    return row?.id ?? null;
  } catch (err) {
    console.error("getPageOfAyah error", { sura, aya, err });
    return null;
  }
}

/** Page buttons like: "Page 1 — Al-Fātiḥa 1" */
export async function getPageButtonLabels(
  lang: Language
): Promise<{ page: number; label: string; sura: number; aya: number }[]> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<{
      id: number;
      sura: number;
      aya: number;
    }>(`SELECT id, sura, aya FROM page ORDER BY id;`);

    const out: {
      page: number;
      label: string;
      sura: number;
      aya: number;
    }[] = [];
    for (const r of rows) {
      const surahName =
        (await getSurahDisplayName(r.sura, lang)) ?? `Sura ${r.sura}`;
      out.push({
        page: r.id,
        label: `Page ${r.id} — ${surahName} ${r.aya}`,
        sura: r.sura,
        aya: r.aya,
      });
    }
    return out;
  } catch (err) {
    console.error("getPageButtonLabels error", { lang, err });
    return [];
  }
}

function quranTableFor(lang: LanguageCode) {
  if (lang === "ar") {
    return { table: "aya_ar", col: "quran_arabic_text" as const };
  }
  if (lang === "de") {
    return { table: "aya_de", col: "quran_german_text" as const };
  }
  return { table: "aya_en", col: "quran_english_text" as const };
}

/**
 * Resolve a Qur'an internal link.
 *
 * identifier: "sura:aya" (e.g. "1:1", "2:255")
 * lang:
 *  - "ar": use aya_ar + s.label
 *  - "de": use aya_de + s.label_en/label_de
 *  - "en": use aya_en + s.label_en
 */
export const getQuranInternalURL = async (
  identifier: string,
  lang: LanguageCode
): Promise<QuranInternalResultType | null> => {
  try {
    const [suraStr, ayaStr] = identifier.split(":");
    const sura = Number(suraStr);
    const aya = Number(ayaStr);

    if (!Number.isFinite(sura) || !Number.isFinite(aya)) {
      console.warn("getQuranInternalURL: invalid identifier", identifier);
      return null;
    }

    const db = getDatabase();
    const { table, col } = quranTableFor(lang);

    const row = await db.getFirstAsync<QuranInternalResultType>(
      `
      SELECT
        v.sura,
        v.aya,
        v.${col} AS text,
        s.label    AS sura_label_ar,
        s.label_en AS sura_label_en,
        s.label_de AS sura_label_de
      FROM ${table} v
      JOIN sura s
        ON s.id = v.sura
      WHERE v.sura = ? AND v.aya = ?
      LIMIT 1;
      `,
      [sura, aya]
    );

    return row ?? null;
  } catch (error) {
    console.error("getQuranInternalURL: Error fetching verse:", {
      identifier,
      lang,
      error,
    });
    return null;
  }
};

// ==================== FAVORITE SURA ====================

/** Add a sura to favorites. Returns true if added, false if already exists. */
export async function addFavoriteSura(sura: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT OR IGNORE INTO favorite_sura (sura) VALUES (?);`,
      [sura]
    );
    return (result.changes ?? 0) > 0;
  } catch (err) {
    console.error("addFavoriteSura error", { sura, err });
    return false;
  }
}

/** Remove a sura from favorites. Returns true if removed. */
export async function removeFavoriteSura(sura: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      `DELETE FROM favorite_sura WHERE sura = ?;`,
      [sura]
    );
    return (result.changes ?? 0) > 0;
  } catch (err) {
    console.error("removeFavoriteSura error", { sura, err });
    return false;
  }
}

/** Check if a sura is in favorites. */
export async function isFavoriteSura(sura: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM favorite_sura WHERE sura = ?;`,
      [sura]
    );
    return (row?.count ?? 0) > 0;
  } catch (err) {
    console.error("isFavoriteSura error", { sura, err });
    return false;
  }
}

/** Get all favorite suras, ordered by most recently added. */
export async function getAllFavoriteSuras(): Promise<FavoriteSuraType[]> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<FavoriteSuraType>(
      `SELECT id, sura, created_at FROM favorite_sura ORDER BY created_at DESC;`
    );
  } catch (err) {
    console.error("getAllFavoriteSuras error", err);
    return [];
  }
}

// ==================== FAVORITE JUZ ====================

/** Add a juz to favorites. Returns true if added, false if already exists. */
export async function addFavoriteJuz(juz: number): Promise<boolean> {
  if (juz < 1 || juz > 30) {
    console.warn("addFavoriteJuz: invalid juz", juz);
    return false;
  }
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT OR IGNORE INTO favorite_juz (juz) VALUES (?);`,
      [juz]
    );
    return (result.changes ?? 0) > 0;
  } catch (err) {
    console.error("addFavoriteJuz error", { juz, err });
    return false;
  }
}

/** Remove a juz from favorites. Returns true if removed. */
export async function removeFavoriteJuz(juz: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      `DELETE FROM favorite_juz WHERE juz = ?;`,
      [juz]
    );
    return (result.changes ?? 0) > 0;
  } catch (err) {
    console.error("removeFavoriteJuz error", { juz, err });
    return false;
  }
}

/** Check if a juz is in favorites. */
export async function isFavoriteJuz(juz: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM favorite_juz WHERE juz = ?;`,
      [juz]
    );
    return (row?.count ?? 0) > 0;
  } catch (err) {
    console.error("isFavoriteJuz error", { juz, err });
    return false;
  }
}

/** Get all favorite juzs, ordered by most recently added. */
export async function getAllFavoriteJuzs(): Promise<FavoriteJuzType[]> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<FavoriteJuzType>(
      `SELECT id, juz, created_at FROM favorite_juz ORDER BY created_at DESC;`
    );
  } catch (err) {
    console.error("getAllFavoriteJuzs error", err);
    return [];
  }
}

// ==================== FAVORITE PAGE ====================

/** Add a page to favorites. Returns true if added, false if already exists. */
export async function addFavoritePage(page: number): Promise<boolean> {
  if (page < 1 || page > 604) {
    console.warn("addFavoritePage: invalid page", page);
    return false;
  }
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      `INSERT OR IGNORE INTO favorite_page (page) VALUES (?);`,
      [page]
    );
    return (result.changes ?? 0) > 0;
  } catch (err) {
    console.error("addFavoritePage error", { page, err });
    return false;
  }
}

/** Remove a page from favorites. Returns true if removed. */
export async function removeFavoritePage(page: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      `DELETE FROM favorite_page WHERE page = ?;`,
      [page]
    );
    return (result.changes ?? 0) > 0;
  } catch (err) {
    console.error("removeFavoritePage error", { page, err });
    return false;
  }
}

/** Check if a page is in favorites. */
export async function isFavoritePage(page: number): Promise<boolean> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM favorite_page WHERE page = ?;`,
      [page]
    );
    return (row?.count ?? 0) > 0;
  } catch (err) {
    console.error("isFavoritePage error", { page, err });
    return false;
  }
}

/** Get all favorite pages, ordered by most recently added. */
export async function getAllFavoritePages(): Promise<FavoritePageType[]> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<FavoritePageType>(
      `SELECT id, page, created_at FROM favorite_page ORDER BY created_at DESC;`
    );
  } catch (err) {
    console.error("getAllFavoritePages error", err);
    return [];
  }
}

// ==================== TOGGLE HELPERS ====================

/** Toggle favorite status for a sura. Returns new status (true = favorited). */
export async function toggleFavoriteSura(sura: number): Promise<boolean> {
  const isFav = await isFavoriteSura(sura);
  if (isFav) {
    await removeFavoriteSura(sura);
    removeFavoriteToast();

    return false;
  } else {
    await addFavoriteSura(sura);
    addFavoriteToast();

    return true;
  }
}

/** Toggle favorite status for a juz. Returns new status (true = favorited). */
export async function toggleFavoriteJuz(juz: number): Promise<boolean> {
  const isFav = await isFavoriteJuz(juz);
  if (isFav) {
    await removeFavoriteJuz(juz);
    removeFavoriteToast();

    return false;
  } else {
    await addFavoriteJuz(juz);
    addFavoriteToast();

    return true;
  }
}

/** Toggle favorite status for a page. Returns new status (true = favorited). */
export async function toggleFavoritePage(page: number): Promise<boolean> {
  const isFav = await isFavoritePage(page);
  if (isFav) {
    await removeFavoritePage(page);
    removeFavoriteToast();

    return false;
  } else {
    await addFavoritePage(page);
    addFavoriteToast();

    return true;
  }
}

// ==================== GET FAVORITE DETAILS ====================

/** Get all favorite verses with full details (language-dependent text, language-independent storage). */
export async function getFavoriteQuranVerses(
  lang: Language
): Promise<
  (QuranVerseType & { transliteration: string | null; created_at: string })[]
> {
  try {
    const db = getDatabase();
    const { table } = verseSelectFor(lang); // aya_ar / aya_de / aya_en
    const alias = table === "aya_ar" ? "a" : table === "aya_de" ? "d" : "e";

    const selectCols =
      table === "aya_ar"
        ? `${alias}.sura AS sura, ${alias}.aya AS aya, ${alias}.quran_arabic_text AS text`
        : table === "aya_de"
        ? `${alias}.sura AS sura, ${alias}.aya AS aya, ${alias}.quran_german_text AS text`
        : `${alias}.sura AS sura, ${alias}.aya AS aya, ${alias}.quran_english_text AS text`;

    return await db.getAllAsync<
      QuranVerseType & { transliteration: string | null; created_at: string }
    >(
      `
      SELECT
        ${selectCols},
        t.quran_transliteration_text AS transliteration,
        f.created_at
      FROM favorite_quran f
      JOIN ${table} ${alias}
        ON ${alias}.sura = f.sura
       AND ${alias}.aya = f.aya
      LEFT JOIN aya_en_transliteration t
        ON t.sura = ${alias}.sura
       AND t.aya = ${alias}.aya
      ORDER BY f.created_at DESC;
      `
    );
  } catch (err) {
    console.error("getFavoriteQuranVerses error", { lang, err });
    return [];
  }
}

/** Get all favorite suras with metadata.
 *  Requires favorite_sura(sura, created_at, ...) table.
 */
export async function getFavoriteSurasWithInfo(): Promise<
  (SuraRowType & { created_at: string })[]
> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<SuraRowType & { created_at: string }>(
      `
      SELECT s.*, f.created_at
      FROM favorite_sura f
      JOIN sura s ON s.id = f.sura
      ORDER BY f.created_at DESC;
      `
    );
  } catch (err) {
    console.error("getFavoriteSurasWithInfo error", err);
    return [];
  }
}

/** Get all favorite juz with start info.
 *  Requires favorite_juz(juz, created_at, ...) table.
 */
export async function getFavoriteJuzsWithInfo(): Promise<
  (JuzStartType & { created_at: string })[]
> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<JuzStartType & { created_at: string }>(
      `
      SELECT
        j.id      AS juz,
        j.sura    AS sura,
        j.aya     AS aya,
        j.page    AS page,
        f.created_at
      FROM favorite_juz f
      JOIN juz j ON j.id = f.juz
      ORDER BY f.created_at DESC;
      `
    );
  } catch (err) {
    console.error("getFavoriteJuzsWithInfo error", err);
    return [];
  }
}

/** Get all favorite pages with start info.
 *  Requires favorite_page(page, created_at, ...) table.
 */
export async function getFavoritePagesWithInfo(): Promise<
  { page: number; sura: number; aya: number; created_at: string }[]
> {
  try {
    const db = getDatabase();
    return await db.getAllAsync<{
      page: number;
      sura: number;
      aya: number;
      created_at: string;
    }>(
      `
      SELECT
        p.id       AS page,
        p.sura     AS sura,
        p.aya      AS aya,
        f.created_at
      FROM favorite_page f
      JOIN page p ON p.id = f.page
      ORDER BY f.created_at DESC;
      `
    );
  } catch (err) {
    console.error("getFavoritePagesWithInfo error", err);
    return [];
  }
}
