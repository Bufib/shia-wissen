//! Imporved

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  LanguageCode,
  QuranVerseType,
  SuraRowType,
  UseSuraDataParams,
} from "@/constants/Types";
import {
  getSurahVerses,
  getSurahDisplayName,
  getSurahInfoByNumber,
  getJuzVerses,
  getJuzBounds,
  getPageVerses,
  getPageBounds,
} from "../db/queries/quran";
import { whenDatabaseReady } from "../db";
import { seedJuzIndex, seedPageIndex } from "../utils/quranIndex";
import {
  preseedJuzCoverageForSurah,
  loadBookmarkedVerses,
  preseedPagesForSurah,
} from "../stores/suraStore";
export function useSuraData({
  lang,
  suraNumber,
  isJuzMode,
  juzNumber,
  isPageMode,
  pageNumber,
  setTotalVerses,
  setTotalVersesForJuz,
  setTotalVersesForPage,
  quranDataVersion, // ✅ triggers refetch on data bump
}: UseSuraDataParams) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [verses, setVerses] = useState<QuranVerseType[]>([]);
  const [arabicVerses, setArabicVerses] = useState<QuranVerseType[]>([]);
  const [suraInfo, setSuraInfo] = useState<SuraRowType | null>(null);
  const [displayName, setDisplayName] = useState<string>("");
  const [juzHeader, setJuzHeader] = useState<{
    title: string;
    subtitle?: string;
  } | null>(null);

  const [bookmarksBySura, setBookmarksBySura] = useState<
    Map<number, Set<number>>
  >(new Map());

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        await whenDatabaseReady();

        /* --------------------------- JUZ MODE --------------------------- */
        if (isJuzMode && juzNumber) {
          const [versRaw, arabicRaw] = await Promise.all([
            getJuzVerses(lang as LanguageCode, juzNumber),
            getJuzVerses("ar", juzNumber),
          ]);
          const vers = (versRaw ?? []) as QuranVerseType[];
          const arVers = (arabicRaw ?? []) as QuranVerseType[];

          // totals + seed for fast coverage
          setTotalVersesForJuz(juzNumber, vers.length);
          try {
            await seedJuzIndex(juzNumber, vers);
          } catch {}

          // header
          const bounds = await getJuzBounds(juzNumber);
          if (bounds) {
            const startName =
              (await getSurahDisplayName(
                bounds.startSura,
                lang as LanguageCode,
              )) ?? `Sura ${bounds.startSura}`;
            setJuzHeader({
              title: `${t("juz") ?? "Juz"} ${juzNumber}`,
              subtitle: `${t("startsAt") ?? "Starts at"} ${startName} ${
                bounds.startAya
              }`,
            });
          } else {
            setJuzHeader({ title: `${t("juz") ?? "Juz"} ${juzNumber}` });
          }

          // bookmarks for all suras in this juz
          const distinctSuras = Array.from(new Set(vers.map((v) => v.sura)));
          const bookmarkPairs = await Promise.all(
            distinctSuras.map(
              async (s) => [s, await loadBookmarkedVerses(s)] as const,
            ),
          );
          const map = new Map<number, Set<number>>(bookmarkPairs);

          if (!cancelled) {
            setVerses(vers);
            setArabicVerses(arVers);
            setSuraInfo(null);
            setDisplayName("");
            setBookmarksBySura(map);
          }
          return;
        }

        /* --------------------------- PAGE MODE -------------------------- */
        if (isPageMode && pageNumber) {
          const [versRaw, arabicRaw] = await Promise.all([
            getPageVerses(lang as LanguageCode, pageNumber),
            getPageVerses("ar", pageNumber),
          ]);
          const vers = (versRaw ?? []) as QuranVerseType[];
          const arVers = (arabicRaw ?? []) as QuranVerseType[];

          setTotalVersesForPage(pageNumber, vers.length);
          try {
            await seedPageIndex(pageNumber, vers);
          } catch {}

          // header
          const bounds = await getPageBounds(pageNumber);
          if (bounds) {
            const startName =
              (await getSurahDisplayName(
                bounds.startSura,
                lang as LanguageCode,
              )) ?? `Sura ${bounds.startSura}`;
            setJuzHeader({
              title: `${t("page") ?? "Page"} ${pageNumber}`,
              subtitle: `${t("startsAt") ?? "Starts at"} ${startName} ${
                bounds.startAya
              }`,
            });
          } else {
            setJuzHeader({ title: `${t("page") ?? "Page"} ${pageNumber}` });
          }

          // bookmarks for suras on this page
          const distinctSuras = Array.from(new Set(vers.map((v) => v.sura)));
          const bookmarkPairs = await Promise.all(
            distinctSuras.map(
              async (s) => [s, await loadBookmarkedVerses(s)] as const,
            ),
          );
          const map = new Map<number, Set<number>>(bookmarkPairs);

          if (!cancelled) {
            setVerses(vers);
            setArabicVerses(arVers);
            setSuraInfo(null);
            setDisplayName("");
            setBookmarksBySura(map);
          }
          return;
        }

        /* --------------------------- SURAH MODE ------------------------- */
        {
          const [versRaw, arabicRaw, info, name] = await Promise.all([
            getSurahVerses(lang as LanguageCode, suraNumber),
            getSurahVerses("ar", suraNumber),
            getSurahInfoByNumber(suraNumber),
            getSurahDisplayName(suraNumber, lang as LanguageCode),
          ]);

          const vers = (versRaw ?? []) as QuranVerseType[];
          const arVers = (arabicRaw ?? []) as QuranVerseType[];

          const totalVerses = info?.nbAyat ?? vers.length;
          setTotalVerses(suraNumber, totalVerses);

          // best-effort warmups
          try {
            if (info) {
              await preseedPagesForSurah(info);
            }
          } catch {}
          try {
            preseedJuzCoverageForSurah(suraNumber);
          } catch {}

          const map = new Map<number, Set<number>>();
          map.set(suraNumber, await loadBookmarkedVerses(suraNumber));

          if (!cancelled) {
            setVerses(vers);
            setArabicVerses(arVers);
            setSuraInfo(info ?? null);
            setDisplayName(name ?? "");
            setJuzHeader(null);
            setBookmarksBySura(map);
          }
        }
      } catch (error) {
        console.error("Failed to load verses:", error);
        if (!cancelled) {
          setVerses([]);
          setArabicVerses([]);
          setSuraInfo(null);
          setDisplayName("");
          setJuzHeader(null);
          setBookmarksBySura(new Map());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    // inputs that change what we load
    lang,
    suraNumber,
    isJuzMode,
    juzNumber,
    isPageMode,
    pageNumber,
    // store updaters (stable in Zustand, but safe in deps)
    setTotalVerses,
    setTotalVersesForJuz,
    setTotalVersesForPage,
    // ✅ force refetch when the Quran dataset was updated
    quranDataVersion,
    t,
  ]);

  return {
    loading,
    verses,
    arabicVerses,
    suraInfo,
    displayName,
    juzHeader,
    bookmarksBySura,
    setBookmarksBySura,
  };
}
