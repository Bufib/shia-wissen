import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface FontSizeState {
  fontSize: number;
  lineHeight: number;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
}

export const useFontSizeStore = create<FontSizeState>()(
  persist(
    (set) => ({
      fontSize: 20, // Default font size
      lineHeight: 40, // Default line height

      setFontSize: (size: number) => {
        set({ fontSize: size });
      },

      setLineHeight: (height: number) => {
        set({ lineHeight: height });
      },
    }),
    {
      name: "font-settings",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        fontSize: state.fontSize,
        lineHeight: state.lineHeight,
      }),
    }
  )
);
