// hooks/useBookmarks.ts

import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslation } from "react-i18next";
import { LanguageCode, QuranVerseType } from "@/constants/Types";
import { getSurahDisplayName } from "@/db/queries/quran";
import { getJuzPosForVerse, getPagePosForVerse } from "@/utils/quranIndex";
import { useReadingProgressQuran } from "@/stores/useReadingProgressQuran";
import { getBookmarkDetailKey, getBookmarksKey } from "@/stores/suraStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UseBookmarksParams {
  lang: LanguageCode;
  bookmarksBySura: Map<number, Set<number>>;
  setBookmarksBySura: (map: Map<number, Set<number>>) => void;
}

export function useBookmarks({
  lang,
  bookmarksBySura,
  setBookmarksBySura,
}: UseBookmarksParams) {
  const { t } = useTranslation();
  const updateBookmarkProgress = useReadingProgressQuran(
    (s) => s.updateSuraBookmark
  );
  const setTotalVersesForJuz = useReadingProgressQuran(
    (s) => s.setTotalVersesForJuz
  );
  const updateJuzBookmark = useReadingProgressQuran((s) => s.updateJuzBookmark);
  const setTotalVersesForPage = useReadingProgressQuran(
    (s) => s.setTotalVersesForPage
  );
  const updatePageBookmark = useReadingProgressQuran(
    (s) => s.updatePageBookmark
  );

  const propagateToAggregates = useCallback(
    async (
      sura: number,
      aya: number,
      _listIndex: number,
      language: LanguageCode
    ) => {
      try {
        const st = useReadingProgressQuran.getState();

        // JUZ
        const jpos = await getJuzPosForVerse(sura, aya);
        if (jpos) {
          const prev = st.progressByJuz[jpos.unit]?.lastVerseNumber ?? 0;
          const next = jpos.idx + 1;
          if (next > prev) {
            setTotalVersesForJuz(jpos.unit, jpos.total);
            updateJuzBookmark(jpos.unit, next, jpos.idx, language);
          }
        }

        // PAGE
        const ppos = await getPagePosForVerse(sura, aya);
        if (ppos) {
          const prev = st.progressByPage[ppos.unit]?.lastVerseNumber ?? 0;
          const next = ppos.idx + 1;
          if (next > prev) {
            setTotalVersesForPage(ppos.unit, ppos.total);
            updatePageBookmark(ppos.unit, next, ppos.idx, language);
          }
        }
      } catch (e) {
        console.warn("propagateToAggregates error", e);
      }
    },
    [
      setTotalVersesForJuz,
      updateJuzBookmark,
      setTotalVersesForPage,
      updatePageBookmark,
    ]
  );

  const handleBookmarkVerse = useCallback(
    async (verse: QuranVerseType, index: number) => {
      try {
        const s = verse.sura;
        const verseNumber = verse.aya;
        const bookmarksKey = getBookmarksKey(s);
        const detailKey = (n: number) => getBookmarkDetailKey(s, n, lang);

        const currentSet = new Set(bookmarksBySura.get(s) ?? new Set<number>());

        const writeBookmark = async (n: number) => {
          const nextSet = new Set<number>([n]);
          const nextMap = new Map(bookmarksBySura);
          nextMap.set(s, nextSet);
          setBookmarksBySura(nextMap);

          await AsyncStorage.setItem(bookmarksKey, JSON.stringify([n]));
          await AsyncStorage.setItem(
            detailKey(n),
            JSON.stringify({
              suraNumber: s,
              verseNumber: n,
              index,
              language: lang,
              suraName: (await getSurahDisplayName(s, lang)) ?? `Sura ${s}`,
              timestamp: Date.now(),
            })
          );

          // SURAH progress (exact set)
          updateBookmarkProgress(s, n, index, lang);

          // Aggregates bump-only (no regress)
          await propagateToAggregates(s, n, index, lang);
        };

        // Toggle OFF if tapping the same verse
        if (currentSet.has(verseNumber)) {
          currentSet.delete(verseNumber);

          const nextMap = new Map(bookmarksBySura);
          nextMap.set(s, currentSet);
          setBookmarksBySura(nextMap);

          const arr = Array.from(currentSet);
          if (arr.length) {
            await AsyncStorage.setItem(bookmarksKey, JSON.stringify(arr));
          } else {
            await AsyncStorage.removeItem(bookmarksKey);
          }
          await AsyncStorage.removeItem(detailKey(verseNumber));

          // Reset SURAH progress only. Do NOT reset Juz/Page here.
          updateBookmarkProgress(s, 0, -1, lang);

          return;
        }

        // Replace existing (single bookmark per sūrah)
        if (currentSet.size > 0) {
          const prev = Array.from(currentSet)[0];
          Alert.alert(
            t("confirmBookmarkChange"),
            t("bookmarkReplaceQuestion"),
            [
              { text: t("cancel"), style: "cancel" },
              {
                text: t("replace"),
                style: "destructive",
                onPress: async () => {
                  try {
                    await AsyncStorage.removeItem(detailKey(prev));
                    await writeBookmark(verseNumber);
                  } catch (e) {
                    console.error("Bookmark replace failed", e);
                  }
                },
              },
            ]
          );
          return;
        }

        // First bookmark for this sūrah
        await writeBookmark(verseNumber);
      } catch (error) {
        console.error("Error handling bookmark:", error);
      }
    },
    [
      bookmarksBySura,
      lang,
      setBookmarksBySura,
      updateBookmarkProgress,
      propagateToAggregates,
      t,
    ]
  );

  return { handleBookmarkVerse };
}
