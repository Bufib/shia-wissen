import { create } from "zustand";

type PodcastDownloadStore = {
  downloading: Record<string, boolean>;
  progress: Record<string, number>;

  setDownloading: (key: string, value: boolean) => void;
  setProgress: (key: string, value: number) => void;

  isDownloading: (key: string) => boolean;
  getProgress: (key: string) => number;

  reset: (key: string) => void;

  resetAll: () => void;
};

export const usePodcastDownloadStore = create<PodcastDownloadStore>(
  (set, get) => ({
    downloading: {},
    progress: {},

    setDownloading: (key, value) =>
      set((state) => ({
        downloading: { ...state.downloading, [key]: value },
      })),

    setProgress: (key, value) =>
      set((state) => ({
        progress: { ...state.progress, [key]: value },
      })),

    isDownloading: (key) => get().downloading[key] === true,
    getProgress: (key) => get().progress[key] ?? 0,

    reset: (key) =>
      set((state) => {
        const d = { ...state.downloading };
        const p = { ...state.progress };
        delete d[key];
        delete p[key];
        return { downloading: d, progress: p };
      }),
    resetAll: () => set({ downloading: {}, progress: {} }),
  })
);
