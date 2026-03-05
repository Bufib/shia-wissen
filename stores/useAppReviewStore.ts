// useAppReviewStore.ts
import { create } from "zustand";

export interface AppReviewState {
  // The timestamp (in milliseconds) when the app was installed or when the review prompt was first shown.
  installDate: number | null;
  // Boolean flag to indicate whether the user has already rated the app.
  hasRated: boolean;
  // The next timestamp (in milliseconds) after which the user can be prompted again.
  remindLaterDate: number | null;
  // Function to set the install date.
  setInstallDate: (date: number) => void;
  // Function to mark that the user has rated the app.
  setHasRated: (rated: boolean) => void;
  // Function to set the "remind me later" date.
  setRemindLaterDate: (date: number) => void;
  // Checks if the app is eligible to prompt the user for a review.
  isEligibleForReview: () => boolean;
}

export const useAppReviewStore = create<AppReviewState>((set, get) => ({
  installDate: null,
  hasRated: false,
  remindLaterDate: null,
  setInstallDate: (date: number) => set({ installDate: date }),
  setHasRated: (rated: boolean) => set({ hasRated: rated }),
  setRemindLaterDate: (date: number) => set({ remindLaterDate: date }),
  isEligibleForReview: () => {
    const { installDate, hasRated, remindLaterDate } = get();
    // If the user has already rated the app, do not show the prompt.
    if (hasRated) return false;

    const now = Date.now();
    const daysSinceInstall = installDate
      ? (now - installDate) / (1000 * 60 * 60 * 24)
      : 0;
    const thresholdDays = 3; // Only show after 3 days
    // If "remind me later" is set and the current time is before that date, do not show.
    if (remindLaterDate && now < remindLaterDate) return false;

    return daysSinceInstall >= thresholdDays;
  },
}));

export default useAppReviewStore;
