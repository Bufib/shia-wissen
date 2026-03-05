import { triggerRefreshFavoritesType } from "@/constants/Types";
import { create } from "zustand";

export const useRefreshFavorites = create<triggerRefreshFavoritesType>(
  (set) => ({
    favoritesRefreshed: 0,
    triggerRefreshFavorites: () =>
      set((state) => ({
        favoritesRefreshed: state.favoritesRefreshed + 1, // Toggle the refresh trigger
      })),
  })
);
