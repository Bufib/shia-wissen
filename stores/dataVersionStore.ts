// // src/stores/dataVersionStore.ts
// import { create } from "zustand";

// export type Dataset = "questions" | "quran" | "calendar" | "prayers" | "paypal";

// interface DataVersionStore {
//   // per-dataset ticks
//   questionsVersion: number;
//   quranDataVersion: number;
//   calendarVersion: number;
//   prayersVersion: number;
//   paypalVersion: number;
//   podcastVersion: number;
//   newsArticleVersion: number;
//   videoVersion: number;
//   userQuestionVersion: number;
//   pdfDataVersion: number;

//   // per-dataset updaters
//   incrementQuestionsVersion: () => void;
//   incrementQuranDataVersion: () => void;
//   incrementCalendarVersion: () => void;
//   incrementPrayersVersion: () => void;
//   incrementPaypalVersion: () => void;
//   incrementPodcastVersion: () => void;
//   incrementNewsArticleVersion: () => void;
//   incrementVideoVersion: () => void;
//   incrementUserQuestionVersion: () => void;
//   incrementPdfDataVersion: () => void;

//   // per-dataset resets (optional)
//   resetQuestionsVersion: () => void;
//   resetQuranDataVersion: () => void;
//   resetCalendarVersion: () => void;
//   resetPrayersVersion: () => void;
//   resetPaypalVersion: () => void;
//   resetPodcastVersion: () => void;
//   resetNewsArticleVersion: () => void;
//   resetVideoVersion: () => void;
//   resetUserQuestionVersion: () => void;
//   resetPdfDataVersion: () => void;

//   // all reset (optional)
//   resetAllVersions: () => void;
// }

// export const useDataVersionStore = create<DataVersionStore>((set) => ({
//   questionsVersion: 0,
//   quranDataVersion: 0,
//   calendarVersion: 0,
//   prayersVersion: 0,
//   paypalVersion: 0,
//   podcastVersion: 0,
//   newsArticleVersion: 0,
//   videoVersion: 0,
//   userQuestionVersion: 0,
//   pdfDataVersion: 0,

//   incrementQuestionsVersion: () =>
//     set((s) => ({ questionsVersion: s.questionsVersion + 1 })),
//   incrementQuranDataVersion: () =>
//     set((s) => ({ quranDataVersion: s.quranDataVersion + 1 })),
//   incrementCalendarVersion: () =>
//     set((s) => ({ calendarVersion: s.calendarVersion + 1 })),
//   incrementPrayersVersion: () =>
//     set((s) => ({ prayersVersion: s.prayersVersion + 1 })),
//   incrementPaypalVersion: () =>
//     set((s) => ({ paypalVersion: s.paypalVersion + 1 })),
//   incrementPodcastVersion: () =>
//     set((s) => ({ podcastVersion: s.podcastVersion + 1 })),
//   incrementNewsArticleVersion: () =>
//     set((s) => ({ newsArticleVersion: s.newsArticleVersion + 1 })),
//   incrementVideoVersion: () =>
//     set((s) => ({ videoVersion: s.videoVersion + 1 })),
//   incrementUserQuestionVersion: () =>
//     set((s) => ({ userQuestionVersion: s.userQuestionVersion + 1 })),
//   incrementPdfDataVersion: () =>
//     set((s) => ({ pdfDataVersion: s.pdfDataVersion + 1 })),

//   resetQuestionsVersion: () => set({ questionsVersion: 0 }),
//   resetQuranDataVersion: () => set({ quranDataVersion: 0 }),
//   resetCalendarVersion: () => set({ calendarVersion: 0 }),
//   resetPrayersVersion: () => set({ prayersVersion: 0 }),
//   resetPaypalVersion: () => set({ paypalVersion: 0 }),
//   resetPodcastVersion: () => set({ podcastVersion: 0 }),
//   resetNewsArticleVersion: () => set({ newsArticleVersion: 0 }),
//   resetVideoVersion: () => set({ videoVersion: 0 }),
//   resetUserQuestionVersion: () => set({ userQuestionVersion: 0 }),
//   resetPdfDataVersion: () => set({ pdfDataVersion: 0 }),

//   resetAllVersions: () =>
//     set({
//       questionsVersion: 0,
//       quranDataVersion: 0,
//       calendarVersion: 0,
//       prayersVersion: 0,
//       paypalVersion: 0,
//       podcastVersion: 0,
//       newsArticleVersion: 0,
//       videoVersion: 0,
//       userQuestionVersion: 0,
//       pdfDataVersion: 0,
//     }),
// }));

// src/stores/dataVersionStore.ts
import { create } from "zustand";

export type Dataset = "questions" | "quran" | "calendar" | "prayers" | "paypal";

interface DataVersionStore {
  // per-dataset data ticks (for sync/data changes)
  questionsVersion: number;
  quranDataVersion: number;
  calendarVersion: number;
  prayersVersion: number;
  paypalVersion: number;
  podcastVersion: number;
  newsArticleVersion: number;
  videoVersion: number;
  userQuestionVersion: number;
  pdfDataVersion: number;

  // per-dataset favorites ticks (for favorite toggles)
  questionsFavoritesVersion: number;
  quranFavoritesVersion: number;
  calendarFavoritesVersion: number;
  prayersFavoritesVersion: number;
  paypalFavoritesVersion: number;
  podcastFavoritesVersion: number;
  newsArticleFavoritesVersion: number;
  videoFavoritesVersion: number;
  userQuestionFavoritesVersion: number;
  pdfFavoritesVersion: number;

  // per-dataset data updaters
  incrementQuestionsVersion: () => void;
  incrementQuranDataVersion: () => void;
  incrementCalendarVersion: () => void;
  incrementPrayersVersion: () => void;
  incrementPaypalVersion: () => void;
  incrementPodcastVersion: () => void;
  incrementNewsArticleVersion: () => void;
  incrementVideoVersion: () => void;
  incrementUserQuestionVersion: () => void;
  incrementPdfDataVersion: () => void;

  // per-dataset favorites updaters
  incrementQuestionsFavoritesVersion: () => void;
  incrementQuranFavoritesVersion: () => void;
  incrementCalendarFavoritesVersion: () => void;
  incrementPrayersFavoritesVersion: () => void;
  incrementPaypalFavoritesVersion: () => void;
  incrementPodcastFavoritesVersion: () => void;
  incrementNewsArticleFavoritesVersion: () => void;
  incrementVideoFavoritesVersion: () => void;
  incrementUserQuestionFavoritesVersion: () => void;
  incrementPdfFavoritesVersion: () => void;

  // per-dataset data resets
  resetQuestionsVersion: () => void;
  resetQuranDataVersion: () => void;
  resetCalendarVersion: () => void;
  resetPrayersVersion: () => void;
  resetPaypalVersion: () => void;
  resetPodcastVersion: () => void;
  resetNewsArticleVersion: () => void;
  resetVideoVersion: () => void;
  resetUserQuestionVersion: () => void;
  resetPdfDataVersion: () => void;

  // per-dataset favorites resets
  resetQuestionsFavoritesVersion: () => void;
  resetQuranFavoritesVersion: () => void;
  resetCalendarFavoritesVersion: () => void;
  resetPrayersFavoritesVersion: () => void;
  resetPaypalFavoritesVersion: () => void;
  resetPodcastFavoritesVersion: () => void;
  resetNewsArticleFavoritesVersion: () => void;
  resetVideoFavoritesVersion: () => void;
  resetUserQuestionFavoritesVersion: () => void;
  resetPdfFavoritesVersion: () => void;

  // all reset
  resetAllVersions: () => void;
}

export const useDataVersionStore = create<DataVersionStore>((set) => ({
  // Data versions
  questionsVersion: 0,
  quranDataVersion: 0,
  calendarVersion: 0,
  prayersVersion: 0,
  paypalVersion: 0,
  podcastVersion: 0,
  newsArticleVersion: 0,
  videoVersion: 0,
  userQuestionVersion: 0,
  pdfDataVersion: 0,

  // Favorites versions
  questionsFavoritesVersion: 0,
  quranFavoritesVersion: 0,
  calendarFavoritesVersion: 0,
  prayersFavoritesVersion: 0,
  paypalFavoritesVersion: 0,
  podcastFavoritesVersion: 0,
  newsArticleFavoritesVersion: 0,
  videoFavoritesVersion: 0,
  userQuestionFavoritesVersion: 0,
  pdfFavoritesVersion: 0,

  // Data incrementers
  incrementQuestionsVersion: () =>
    set((s) => ({ questionsVersion: s.questionsVersion + 1 })),
  incrementQuranDataVersion: () =>
    set((s) => ({ quranDataVersion: s.quranDataVersion + 1 })),
  incrementCalendarVersion: () =>
    set((s) => ({ calendarVersion: s.calendarVersion + 1 })),
  incrementPrayersVersion: () =>
    set((s) => ({ prayersVersion: s.prayersVersion + 1 })),
  incrementPaypalVersion: () =>
    set((s) => ({ paypalVersion: s.paypalVersion + 1 })),
  incrementPodcastVersion: () =>
    set((s) => ({ podcastVersion: s.podcastVersion + 1 })),
  incrementNewsArticleVersion: () =>
    set((s) => ({ newsArticleVersion: s.newsArticleVersion + 1 })),
  incrementVideoVersion: () =>
    set((s) => ({ videoVersion: s.videoVersion + 1 })),
  incrementUserQuestionVersion: () =>
    set((s) => ({ userQuestionVersion: s.userQuestionVersion + 1 })),
  incrementPdfDataVersion: () =>
    set((s) => ({ pdfDataVersion: s.pdfDataVersion + 1 })),

  // Favorites incrementers
  incrementQuestionsFavoritesVersion: () =>
    set((s) => ({
      questionsFavoritesVersion: s.questionsFavoritesVersion + 1,
    })),
  incrementQuranFavoritesVersion: () =>
    set((s) => ({ quranFavoritesVersion: s.quranFavoritesVersion + 1 })),
  incrementCalendarFavoritesVersion: () =>
    set((s) => ({ calendarFavoritesVersion: s.calendarFavoritesVersion + 1 })),
  incrementPrayersFavoritesVersion: () =>
    set((s) => ({ prayersFavoritesVersion: s.prayersFavoritesVersion + 1 })),
  incrementPaypalFavoritesVersion: () =>
    set((s) => ({ paypalFavoritesVersion: s.paypalFavoritesVersion + 1 })),
  incrementPodcastFavoritesVersion: () =>
    set((s) => ({ podcastFavoritesVersion: s.podcastFavoritesVersion + 1 })),
  incrementNewsArticleFavoritesVersion: () =>
    set((s) => ({
      newsArticleFavoritesVersion: s.newsArticleFavoritesVersion + 1,
    })),
  incrementVideoFavoritesVersion: () =>
    set((s) => ({ videoFavoritesVersion: s.videoFavoritesVersion + 1 })),
  incrementUserQuestionFavoritesVersion: () =>
    set((s) => ({
      userQuestionFavoritesVersion: s.userQuestionFavoritesVersion + 1,
    })),
  incrementPdfFavoritesVersion: () =>
    set((s) => ({ pdfFavoritesVersion: s.pdfFavoritesVersion + 1 })),

  // Data resets
  resetQuestionsVersion: () => set({ questionsVersion: 0 }),
  resetQuranDataVersion: () => set({ quranDataVersion: 0 }),
  resetCalendarVersion: () => set({ calendarVersion: 0 }),
  resetPrayersVersion: () => set({ prayersVersion: 0 }),
  resetPaypalVersion: () => set({ paypalVersion: 0 }),
  resetPodcastVersion: () => set({ podcastVersion: 0 }),
  resetNewsArticleVersion: () => set({ newsArticleVersion: 0 }),
  resetVideoVersion: () => set({ videoVersion: 0 }),
  resetUserQuestionVersion: () => set({ userQuestionVersion: 0 }),
  resetPdfDataVersion: () => set({ pdfDataVersion: 0 }),

  // Favorites resets
  resetQuestionsFavoritesVersion: () => set({ questionsFavoritesVersion: 0 }),
  resetQuranFavoritesVersion: () => set({ quranFavoritesVersion: 0 }),
  resetCalendarFavoritesVersion: () => set({ calendarFavoritesVersion: 0 }),
  resetPrayersFavoritesVersion: () => set({ prayersFavoritesVersion: 0 }),
  resetPaypalFavoritesVersion: () => set({ paypalFavoritesVersion: 0 }),
  resetPodcastFavoritesVersion: () => set({ podcastFavoritesVersion: 0 }),
  resetNewsArticleFavoritesVersion: () =>
    set({ newsArticleFavoritesVersion: 0 }),
  resetVideoFavoritesVersion: () => set({ videoFavoritesVersion: 0 }),
  resetUserQuestionFavoritesVersion: () =>
    set({ userQuestionFavoritesVersion: 0 }),
  resetPdfFavoritesVersion: () => set({ pdfFavoritesVersion: 0 }),

  // Reset all
  resetAllVersions: () =>
    set({
      questionsVersion: 0,
      quranDataVersion: 0,
      calendarVersion: 0,
      prayersVersion: 0,
      paypalVersion: 0,
      podcastVersion: 0,
      newsArticleVersion: 0,
      videoVersion: 0,
      userQuestionVersion: 0,
      pdfDataVersion: 0,
      questionsFavoritesVersion: 0,
      quranFavoritesVersion: 0,
      calendarFavoritesVersion: 0,
      prayersFavoritesVersion: 0,
      paypalFavoritesVersion: 0,
      podcastFavoritesVersion: 0,
      newsArticleFavoritesVersion: 0,
      videoFavoritesVersion: 0,
      userQuestionFavoritesVersion: 0,
      pdfFavoritesVersion: 0,
    }),
}));
