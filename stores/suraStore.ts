// utils/storage.ts

import { InteractionManager } from "react-native";
import { SuraRowType } from "@/constants/Types";
import { seedPageIndex, getJuzCoverageForSura } from "../utils/quranIndex";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Key generator for arabic verse lookup across juz/page
export const vkey = (s: number, a: number) => `${s}:${a}`;

// Storage key generators
export const getBookmarksKey = (suraNumber: number) =>
  `bookmarks_sura_${suraNumber}`;
export const getBookmarkDetailKey = (
  sura: number,
  verse: number,
  lang: string
) => `bookmark_s${sura}_v${verse}_${lang}`;

// Pre-seed only the relevant pages for the current sūrah
export async function preseedPagesForSurah(
  info: SuraRowType,
  firstBatchSize = 3
) {
  if (!info?.startPage || !info?.endPage) return;

  const start = Math.max(1, info.startPage);
  const end = Math.max(start, info.endPage);

  const total = end - start + 1;
  const batch = Math.min(firstBatchSize, total);

  // Seed a small batch immediately to make first bookmark instant
  await Promise.all(
    Array.from({ length: batch }, (_, i) => seedPageIndex(start + i))
  );

  // Defer the rest so we don't block UI interactions/scroll
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

// Load bookmarked verses for a surah
export async function loadBookmarkedVerses(
  suraNumber: number
): Promise<Set<number>> {
  try {
    const bookmarksKey = getBookmarksKey(suraNumber);
    const storedBookmarks = await AsyncStorage.getItem(bookmarksKey);
    if (storedBookmarks) {
      const arr = JSON.parse(storedBookmarks) as number[];
      return new Set(arr);
    }
  } catch (error) {
    console.error("Error loading bookmarks:", error);
  }
  return new Set();
}

// Pre-seed juz coverage for a surah (deferred)
export function preseedJuzCoverageForSurah(suraNumber: number) {
  InteractionManager.runAfterInteractions(() => {
    getJuzCoverageForSura(suraNumber).catch(() => {});
  });
}
