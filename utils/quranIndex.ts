import type { QuranVerseType, SuraRowType } from "@/constants/Types";
import {
  getJuzVerses,
  getPageVerses,
  getJuzBounds,
  getSurahInfoByNumber,
  getJuzOfAyah,
  getPageOfAyah,
} from "../db/queries/quran";
import { InteractionManager } from "react-native";

type UnitPos = { unit: number; idx: number; total: number };

const key = (s: number, a: number) => `${s}:${a}`;

/* ------------------------------------------------------------------ */
/* verse→unit maps + raw caches                                        */
/* ------------------------------------------------------------------ */
const juzIndex = new Map<string, UnitPos>();
const pageIndex = new Map<string, UnitPos>();

const juzCache = new Map<number, QuranVerseType[]>();
const pageCache = new Map<number, QuranVerseType[]>();

/* ------------------------------------------------------------------ */
/* per-unit reverse index (for surah completion propagation)           */
/* ------------------------------------------------------------------ */
type UnitIndex = {
  total: number;
  // for each sura that appears in this unit, what's the last verse index (0-based) inside the unit?
  lastIdxBySura: Map<number, number>;
};

const jUnit = new Map<number, UnitIndex>(); // juz → UnitIndex
const pUnit = new Map<number, UnitIndex>(); // page → UnitIndex

function buildUnitIndex(arr: QuranVerseType[]): UnitIndex {
  const lastIdxBySura = new Map<number, number>();
  arr.forEach((v, i) => {
    // last write wins → last index of this sura within the unit
    lastIdxBySura.set(v.sura, i);
  });
  return { total: arr.length, lastIdxBySura };
}

/* ------------------------------------------------------------------ */
/* Seeding                                                             */
/* ------------------------------------------------------------------ */

/** Seed all verse entries for a Juz. Pass verses to avoid re-query. */
export async function seedJuzIndex(juz: number, verses?: QuranVerseType[]) {
  let arr = verses;
  if (!arr) {
    if (!juzCache.has(juz)) {
      const res = await getJuzVerses("ar", juz);
      juzCache.set(juz, res ?? []);
    }
    arr = juzCache.get(juz)!;
  } else {
    juzCache.set(juz, arr);
  }

  // verse → unit position (for O(1) verse lookups)
  const total = arr.length;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    const k = key(v.sura, v.aya);
    if (!juzIndex.has(k)) {
      juzIndex.set(k, { unit: juz, idx: i, total });
    }
  }

  // unit-level reverse index (for surah completion propagation)
  if (!jUnit.has(juz)) {
    jUnit.set(juz, buildUnitIndex(arr));
  }
}

/** Seed all verse entries for a Page. Pass verses to avoid re-query. */
export async function seedPageIndex(page: number, verses?: QuranVerseType[]) {
  let arr = verses;
  if (!arr) {
    if (!pageCache.has(page)) {
      const res = await getPageVerses("ar", page);
      pageCache.set(page, res ?? []);
    }
    arr = pageCache.get(page)!;
  } else {
    pageCache.set(page, arr);
  }

  const total = arr.length;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    const k = key(v.sura, v.aya);
    if (!pageIndex.has(k)) {
      pageIndex.set(k, { unit: page, idx: i, total });
    }
  }

  if (!pUnit.has(page)) {
    pUnit.set(page, buildUnitIndex(arr));
  }
}

/* ------------------------------------------------------------------ */
/* Shared cached getters (use these in screens)                        */
/* ------------------------------------------------------------------ */
export async function getCachedJuz(juz: number): Promise<QuranVerseType[]> {
  if (!juzCache.has(juz)) {
    const res = await getJuzVerses("ar", juz);
    juzCache.set(juz, res ?? []);
  }
  const arr = juzCache.get(juz)!;
  // ensure indexes exist
  await seedJuzIndex(juz, arr);
  return arr;
}

export async function getCachedPage(page: number): Promise<QuranVerseType[]> {
  if (!pageCache.has(page)) {
    const res = await getPageVerses("ar", page);
    pageCache.set(page, res ?? []);
  }
  const arr = pageCache.get(page)!;
  // ensure indexes exist
  await seedPageIndex(page, arr);
  return arr;
}

/* ------------------------------------------------------------------ */
/* Fast verse→unit lookups                                             */
/* ------------------------------------------------------------------ */

export async function getJuzPosForVerse(sura: number, aya: number) {
  const k = key(sura, aya);
  const hit = juzIndex.get(k);
  if (hit) return hit;

  const j = await getJuzOfAyah(sura, aya);
  if (!j) return null;

  await seedJuzIndex(j);
  return juzIndex.get(k) ?? null;
}

export async function getPagePosForVerse(sura: number, aya: number) {
  const k = key(sura, aya);
  const hit = pageIndex.get(k);
  if (hit) return hit;

  const p = await getPageOfAyah(sura, aya);
  if (!p) return null;

  await seedPageIndex(p);
  return pageIndex.get(k) ?? null;
}

/* ------------------------------------------------------------------ */
/* Surah→unit coverage (used when marking a whole surah as done)       */
/* ------------------------------------------------------------------ */

export async function getJuzCoverageForSura(
  sura: number
): Promise<{ unit: number; idx: number; total: number }[]> {
  const out: { unit: number; idx: number; total: number }[] = [];

  for (let j = 1; j <= 30; j++) {
    const b = await getJuzBounds(j);
    if (!b) continue;

    const inRange =
      (sura > b.startSura && (b.endSura == null || sura < b.endSura)) ||
      sura === b.startSura ||
      (b.endSura != null && sura === b.endSura);

    if (!inRange) continue;

    if (!jUnit.has(j)) {
      await seedJuzIndex(j);
    }
    const idx = jUnit.get(j)!;
    const last = idx.lastIdxBySura.get(sura);
    if (last != null) {
      out.push({ unit: j, idx: last, total: idx.total });
    }
  }
  return out;
}

export async function getPageCoverageForSura(
  sura: number
): Promise<{ unit: number; idx: number; total: number }[]> {
  const out: { unit: number; idx: number; total: number }[] = [];

  const info: SuraRowType | null = await getSurahInfoByNumber(sura);
  if (!info || !info.startPage || !info.endPage) return out;

  const start = Math.max(1, info.startPage);
  const end = Math.max(start, info.endPage); // inclusive range

  for (let p = start; p <= end; p++) {
    if (!pUnit.has(p)) {
      await seedPageIndex(p);
    }
    const idx = pUnit.get(p)!;
    const last = idx.lastIdxBySura.get(sura);
    if (last != null) {
      out.push({ unit: p, idx: last, total: idx.total });
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Optional: pre-seed relevant pages for a surah (fast first bookmark) */
/* ------------------------------------------------------------------ */

export async function preseedPagesForSurahBySura(
  suraId: number,
  firstBatchSize = 3
) {
  const info = await getSurahInfoByNumber(suraId);
  if (!info) return;
  await preseedPagesForSurah(info, firstBatchSize);
}

export async function preseedPagesForSurah(
  info: SuraRowType,
  firstBatchSize = 3
) {
  if (!info?.startPage || !info?.endPage) return;

  const start = Math.max(1, info.startPage);
  const end = Math.max(start, info.endPage);
  const total = end - start + 1;
  const batch = Math.min(firstBatchSize, total);

  // Seed a small batch immediately
  await Promise.all(
    Array.from({ length: batch }, (_, i) => seedPageIndex(start + i))
  );

  // Defer the rest to avoid blocking UI
  if (batch < total) {
    InteractionManager.runAfterInteractions(() => {
      (async () => {
        for (let p = start + batch; p <= end; p++) {
          try {
            await seedPageIndex(p);
          } catch {}
        }
      })();
    });
  }
}

/* ------------------------------------------------------------------ */
/* Clear everything (e.g., on logout)                                  */
/* ------------------------------------------------------------------ */
export function clearQuranIndex() {
  juzIndex.clear();
  pageIndex.clear();
  juzCache.clear();
  pageCache.clear();
  jUnit.clear();
  pUnit.clear();
}
