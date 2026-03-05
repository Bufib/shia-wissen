// stores/useKnowledgeTabStore.ts
import { create } from "zustand";

interface KnowledgeTabStore {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const useKnowledgeTabStore = create<KnowledgeTabStore>((set) => ({
  activeTab: 0,
  setActiveTab: (index) => set({ activeTab: index }),
}));