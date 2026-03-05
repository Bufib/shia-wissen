//! Without juz and pages
// stores/useReadingProgressQuran.ts
// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import type { LanguageCode } from "@/constants/Types";

// type SuraProgress = {
//   lastVerseNumber: number; // 1-based
//   lastIndex: number; // 0-based (FlashList index)
//   totalVerses: number; // ayat count
//   language: LanguageCode;
//   timestamp: number;
// };

// type State = {
//   progressBySura: Record<number, SuraProgress | undefined>;

//   setTotalVerses: (suraNumber: number, total: number) => void;
//   updateSuraBookmark: (
//     suraNumber: number,
//     verseNumber: number,
//     index: number,
//     language: LanguageCode
//   ) => void;
//   clearSura: (suraNumber: number) => void;
//   clearAll: () => void;
// };

// export const useReadingProgressQuran = create<State>()(
//   persist(
//     (set, get) => ({
//       progressBySura: {},

//       setTotalVerses: (suraNumber, total) => {
//         const prev = get().progressBySura[suraNumber];
//         set({
//           progressBySura: {
//             ...get().progressBySura,
//             [suraNumber]: {
//               lastVerseNumber: prev?.lastVerseNumber ?? 0,
//               lastIndex: prev?.lastIndex ?? -1,
//               totalVerses: total,
//               language: (prev?.language ?? "de") as LanguageCode,
//               timestamp: prev?.timestamp ?? Date.now(),
//             },
//           },
//         });
//       },

//       updateSuraBookmark: (suraNumber, verseNumber, index, language) => {
//         const prev = get().progressBySura[suraNumber];
//         set({
//           progressBySura: {
//             ...get().progressBySura,
//             [suraNumber]: {
//               lastVerseNumber: verseNumber,
//               lastIndex: index,
//               totalVerses: prev?.totalVerses ?? 0,
//               language,
//               timestamp: Date.now(),
//             },
//           },
//         });
//       },

//       clearSura: (suraNumber) => {
//         const map = { ...get().progressBySura };
//         delete map[suraNumber];
//         set({ progressBySura: map });
//       },

//       clearAll: () => set({ progressBySura: {} }),
//     }),
//     {
//       name: "reading-progress-quran",
//       storage: createJSONStorage(() => AsyncStorage),
//       version: 1,
//       // Note: no 'partialize' here to avoid TS mismatch across zustand versions.
//     }
//   )
// );

// // --- selectors ---

// /** 0–100 % rounded */
// export function useSuraPercent(suraNumber: number) {
//   return useReadingProgressQuran((s) => {
//     const p = s.progressBySura[suraNumber];
//     if (!p || !p.totalVerses) return 0;
//     return Math.max(
//       0,
//       Math.min(100, Math.round((p.lastVerseNumber / p.totalVerses) * 100))
//     );
//   });
// }

// /** Full progress for a sūrah (or undefined) */
// export function useSuraProgress(suraNumber: number) {
//   return useReadingProgressQuran((s) => s.progressBySura[suraNumber]);
// }

// stores/useReadingProgressQuran.ts

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LanguageCode } from "@/constants/Types";

type UnitProgress = {
  lastVerseNumber: number; // 1-based within the unit (sura/juz/page)
  lastIndex: number; // 0-based list index (for quick jump)
  totalVerses: number; // verse count in the unit
  language: LanguageCode;
  timestamp: number;
};

type State = {
  // existing
  progressBySura: Record<number, UnitProgress | undefined>;
  // new
  progressByJuz: Record<number, UnitProgress | undefined>;
  progressByPage: Record<number, UnitProgress | undefined>;

  isChangingBookmark: boolean;
  setIsChangingBookmark: (value: boolean) => void;

  // SURAH API (existing names kept for compatibility)
  setTotalVerses: (suraNumber: number, total: number) => void;
  updateSuraBookmark: (
    suraNumber: number,
    verseNumber: number,
    index: number,
    language: LanguageCode
  ) => void;

  // JUZ API
  setTotalVersesForJuz: (juz: number, total: number) => void;
  updateJuzBookmark: (
    juz: number,
    verseNumber: number,
    index: number,
    language: LanguageCode
  ) => void;

  // PAGE API
  setTotalVersesForPage: (page: number, total: number) => void;
  updatePageBookmark: (
    page: number,
    verseNumber: number,
    index: number,
    language: LanguageCode
  ) => void;

  // clears
  clearSura: (suraNumber: number) => void;
  clearJuz: (juz: number) => void;
  clearPage: (page: number) => void;
  clearAll: () => void;
};

export const useReadingProgressQuran = create<State>()(
  persist(
    (set, get) => ({
      progressBySura: {},
      progressByJuz: {},
      progressByPage: {},

      isChangingBookmark: false,
      setIsChangingBookmark: (value) => set({ isChangingBookmark: value }),
      // ---------- SURAH ----------
      setTotalVerses: (suraNumber, total) => {
        const prev = get().progressBySura[suraNumber];
        set({
          progressBySura: {
            ...get().progressBySura,
            [suraNumber]: {
              lastVerseNumber: prev?.lastVerseNumber ?? 0,
              lastIndex: prev?.lastIndex ?? -1,
              totalVerses: total,
              language: (prev?.language ?? "de") as LanguageCode,
              timestamp: prev?.timestamp ?? Date.now(),
            },
          },
        });
      },

      updateSuraBookmark: (suraNumber, verseNumber, index, language) => {
        const prev = get().progressBySura[suraNumber];
        set({
          progressBySura: {
            ...get().progressBySura,
            [suraNumber]: {
              lastVerseNumber: verseNumber,
              lastIndex: index,
              totalVerses: prev?.totalVerses ?? 0,
              language,
              timestamp: Date.now(),
            },
          },
        });
      },

      // ---------- JUZ ----------
      setTotalVersesForJuz: (juz, total) => {
        const prev = get().progressByJuz[juz];
        set({
          progressByJuz: {
            ...get().progressByJuz,
            [juz]: {
              lastVerseNumber: prev?.lastVerseNumber ?? 0,
              lastIndex: prev?.lastIndex ?? -1,
              totalVerses: total,
              language: (prev?.language ?? "de") as LanguageCode,
              timestamp: prev?.timestamp ?? Date.now(),
            },
          },
        });
      },

      updateJuzBookmark: (juz, verseNumber, index, language) => {
        const prev = get().progressByJuz[juz];
        set({
          progressByJuz: {
            ...get().progressByJuz,
            [juz]: {
              lastVerseNumber: verseNumber,
              lastIndex: index,
              totalVerses: prev?.totalVerses ?? 0,
              language,
              timestamp: Date.now(),
            },
          },
        });
      },

      // ---------- PAGE ----------
      setTotalVersesForPage: (page, total) => {
        const prev = get().progressByPage[page];
        set({
          progressByPage: {
            ...get().progressByPage,
            [page]: {
              lastVerseNumber: prev?.lastVerseNumber ?? 0,
              lastIndex: prev?.lastIndex ?? -1,
              totalVerses: total,
              language: (prev?.language ?? "de") as LanguageCode,
              timestamp: prev?.timestamp ?? Date.now(),
            },
          },
        });
      },

      updatePageBookmark: (page, verseNumber, index, language) => {
        const prev = get().progressByPage[page];
        set({
          progressByPage: {
            ...get().progressByPage,
            [page]: {
              lastVerseNumber: verseNumber,
              lastIndex: index,
              totalVerses: prev?.totalVerses ?? 0,
              language,
              timestamp: Date.now(),
            },
          },
        });
      },

      // ---------- CLEAR ----------
      clearSura: (suraNumber) => {
        const map = { ...get().progressBySura };
        delete map[suraNumber];
        set({ progressBySura: map });
      },

      clearJuz: (juz) => {
        const map = { ...get().progressByJuz };
        delete map[juz];
        set({ progressByJuz: map });
      },

      clearPage: (page) => {
        const map = { ...get().progressByPage };
        delete map[page];
        set({ progressByPage: map });
      },

      clearAll: () =>
        set({ progressBySura: {}, progressByJuz: {}, progressByPage: {} }),
    }),
    {
      name: "reading-progress-quran",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (state: any, version) => {
        if (version < 2) {
          return {
            ...state,
            progressByJuz: {},
            progressByPage: {},
          };
        }
        return state;
      },
    }
  )
);

// --- selectors --------------------------------------------------------------

/** 0–100 % rounded for a sura */
export function useSuraPercent(suraNumber: number) {
  return useReadingProgressQuran((s) => {
    const p = s.progressBySura[suraNumber];
    if (!p || !p.totalVerses) return 0;
    return Math.max(
      0,
      Math.min(100, Math.round((p.lastVerseNumber / p.totalVerses) * 100))
    );
  });
}

/** 0–100 % rounded for a juz */
export function useJuzPercent(juz: number) {
  return useReadingProgressQuran((s) => {
    const p = s.progressByJuz[juz];
    if (!p || !p.totalVerses) return 0;
    return Math.max(
      0,
      Math.min(100, Math.round((p.lastVerseNumber / p.totalVerses) * 100))
    );
  });
}

/** 0–100 % rounded for a page */
export function usePagePercent(page: number) {
  return useReadingProgressQuran((s) => {
    const p = s.progressByPage[page];
    if (!p || !p.totalVerses) return 0;
    return Math.max(
      0,
      Math.min(100, Math.round((p.lastVerseNumber / p.totalVerses) * 100))
    );
  });
}

/** full objects if needed */
export function useJuzProgress(juz: number) {
  return useReadingProgressQuran((s) => s.progressByJuz[juz]);
}
export function usePageProgress(page: number) {
  return useReadingProgressQuran((s) => s.progressByPage[page]);
}
