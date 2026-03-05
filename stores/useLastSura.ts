import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LastSuraState = {
  lastSura: number | null;
  setLastSura: (n: number) => void;
};

export const useLastSuraStore = create<LastSuraState>()(
  persist(
    (set) => ({
      lastSura: null,
      setLastSura: (n) => set({ lastSura: n }),
    }),
    {
      name: "last-sura",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
