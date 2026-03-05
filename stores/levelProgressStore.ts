// // import { create } from 'zustand';
// // import { createJSONStorage, persist } from 'zustand/middleware';
// // import AsyncStorage from '@react-native-async-storage/async-storage';

// // // Types
// // interface CompletedLevels {
// //   [sectionTitle: string]: {
// //     [levelIndex: number]: boolean;
// //   };
// // }

// // interface SectionProgress {
// //   completed: number;
// //   total: number;
// //   percentage: number;
// // }

// // type LevelStatus = 'locked' | 'active' | 'completed';

// // interface LevelProgressState {
// //   completedLevels: CompletedLevels;

// //   // Actions
// //   markLevelComplete: (sectionTitle: string, levelIndex: number) => void;
// //   markLevelIncomplete: (sectionTitle: string, levelIndex: number) => void;
// //   resetSection: (sectionTitle: string) => void;
// //   resetAllProgress: () => void;

// //   // Selectors
// //   isLevelComplete: (sectionTitle: string, levelIndex: number) => boolean;
// //   getLevelStatus: (sectionTitle: string, levelIndex: number) => LevelStatus;
// //   getActiveLevel: (sectionTitle: string) => number;
// //   getSectionProgress: (sectionTitle: string, totalLevels: number) => SectionProgress;
// //   getTotalProgress: (sections: { title: string; totalLevels: number }[]) => SectionProgress;
// //   getCompletedLevelsInSection: (sectionTitle: string) => number[];
// // }

// // export const useLevelProgressStore = create<LevelProgressState>()(
// //   persist(
// //     (set, get) => ({
// //       completedLevels: {},

// //       // Mark a specific level as complete
// //       markLevelComplete: (sectionTitle: string, levelIndex: number) => {
// //         set((state) => ({
// //           completedLevels: {
// //             ...state.completedLevels,
// //             [sectionTitle]: {
// //               ...state.completedLevels[sectionTitle],
// //               [levelIndex]: true,
// //             },
// //           },
// //         }));
// //       },

// //       // Mark a specific level as incomplete
// //       markLevelIncomplete: (sectionTitle: string, levelIndex: number) => {
// //         set((state) => ({
// //           completedLevels: {
// //             ...state.completedLevels,
// //             [sectionTitle]: {
// //               ...state.completedLevels[sectionTitle],
// //               [levelIndex]: false,
// //             },
// //           },
// //         }));
// //       },

// //       // Reset all progress for a specific section
// //       resetSection: (sectionTitle: string) => {
// //         set((state) => ({
// //           completedLevels: {
// //             ...state.completedLevels,
// //             [sectionTitle]: {},
// //           },
// //         }));
// //       },

// //       // Reset all progress across all sections
// //       resetAllProgress: () => {
// //         set({ completedLevels: {} });
// //       },

// //       // Check if a specific level is complete
// //       isLevelComplete: (sectionTitle: string, levelIndex: number) => {
// //         const state = get();
// //         return state.completedLevels[sectionTitle]?.[levelIndex] ?? false;
// //       },

// //       // Get the status of a specific level (locked, active, or completed)
// //       getLevelStatus: (sectionTitle: string, levelIndex: number): LevelStatus => {
// //         const state = get();
// //         const sectionData = state.completedLevels[sectionTitle] || {};

// //         // If this level is completed, return completed
// //         if (sectionData[levelIndex] === true) {
// //           return 'completed';
// //         }

// //         // If this is the first level (index 0), it's always active
// //         if (levelIndex === 0) {
// //           return 'active';
// //         }

// //         // Check if previous level is completed
// //         const previousLevelCompleted = sectionData[levelIndex - 1] === true;

// //         if (previousLevelCompleted) {
// //           return 'active';
// //         } else {
// //           return 'locked';
// //         }
// //       },

// //       // Get the currently active (next available) level for a section
// //       getActiveLevel: (sectionTitle: string): number => {
// //         const state = get();
// //         const sectionData = state.completedLevels[sectionTitle] || {};

// //         // Find the first incomplete level
// //         let activeLevel = 0;
// //         while (sectionData[activeLevel] === true) {
// //           activeLevel++;
// //         }

// //         return activeLevel;
// //       },

// //       // Get progress statistics for a specific section
// //       getSectionProgress: (sectionTitle: string, totalLevels: number): SectionProgress => {
// //         const state = get();
// //         const sectionData = state.completedLevels[sectionTitle] || {};
// //         const completed = Object.values(sectionData).filter(Boolean).length;

// //         return {
// //           completed,
// //           total: totalLevels,
// //           percentage: totalLevels > 0 ? Math.round((completed / totalLevels) * 100) : 0,
// //         };
// //       },

// //       // Get total progress across all sections
// //       getTotalProgress: (sections: { title: string; totalLevels: number }[]): SectionProgress => {
// //         const state = get();
// //         let totalCompleted = 0;
// //         let totalLevels = 0;

// //         sections.forEach(({ title, totalLevels: sectionTotal }) => {
// //           const sectionData = state.completedLevels[title] || {};
// //           const sectionCompleted = Object.values(sectionData).filter(Boolean).length;
// //           totalCompleted += sectionCompleted;
// //           totalLevels += sectionTotal;
// //         });

// //         return {
// //           completed: totalCompleted,
// //           total: totalLevels,
// //           percentage: totalLevels > 0 ? Math.round((totalCompleted / totalLevels) * 100) : 0,
// //         };
// //       },

// //       // Get array of completed level indices for a section
// //       getCompletedLevelsInSection: (sectionTitle: string): number[] => {
// //         const state = get();
// //         const sectionData = state.completedLevels[sectionTitle] || {};
// //         return Object.entries(sectionData)
// //           .filter(([_, isComplete]) => isComplete)
// //           .map(([index, _]) => parseInt(index));
// //       },
// //     }),
// //     {
// //       name: 'level-progress-storage',
// //       storage: createJSONStorage(() => AsyncStorage),
// //     }
// //   )
// // );

// // // Helper hook for easier access to level-specific operations
// // export const useLevelProgress = (sectionTitle: string, levelIndex: number) => {
// //   const store = useLevelProgressStore();

// //   return {
// //     isComplete: store.isLevelComplete(sectionTitle, levelIndex),
// //     status: store.getLevelStatus(sectionTitle, levelIndex),
// //     markComplete: () => store.markLevelComplete(sectionTitle, levelIndex),
// //     markIncomplete: () => store.markLevelIncomplete(sectionTitle, levelIndex),
// //   };
// // };

// import { create } from "zustand";
// import { createJSONStorage, persist } from "zustand/middleware";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// // Types
// interface CompletedLevels {
//   [sectionId: string]: {
//     [levelId: string]: boolean; // Changed from number to string
//   };
// }

// interface SectionProgress {
//   completed: number;
//   total: number;
//   percentage: number;
// }

// type LevelStatus = "locked" | "active" | "completed";

// interface LevelProgressState {
//   completedLevels: CompletedLevels;

//   // Actions
//   markLevelComplete: (sectionId: string, levelId: string) => void;
//   markLevelIncomplete: (sectionId: string, levelId: string) => void;
//   resetSection: (sectionId: string) => void;
//   resetAllProgress: () => void;

//   // Selectors
//   isLevelComplete: (sectionId: string, levelId: string) => boolean;
//   getLevelStatus: (
//     sectionId: string,
//     levelId: string,
//     levelOrder: string[]
//   ) => LevelStatus;
//   getActiveLevel: (sectionId: string, levelOrder: string[]) => string | null;
//   getSectionProgress: (
//     sectionId: string,
//     levelIds: string[]
//   ) => SectionProgress;
//   getTotalProgress: (
//     sections: { id: string; levelIds: string[] }[]
//   ) => SectionProgress;
//   getCompletedLevelsInSection: (sectionId: string) => string[];
// }

// export const useLevelProgressStore = create<LevelProgressState>()(
//   persist(
//     (set, get) => ({
//       completedLevels: {},

//       // Mark a specific level as complete
//       markLevelComplete: (sectionId: string, levelId: string) => {
//         set((state) => ({
//           completedLevels: {
//             ...state.completedLevels,
//             [sectionId]: {
//               ...state.completedLevels[sectionId],
//               [levelId]: true,
//             },
//           },
//         }));
//       },

//       // Mark a specific level as incomplete
//       markLevelIncomplete: (sectionId: string, levelId: string) => {
//         set((state) => ({
//           completedLevels: {
//             ...state.completedLevels,
//             [sectionId]: {
//               ...state.completedLevels[sectionId],
//               [levelId]: false,
//             },
//           },
//         }));
//       },

//       // Reset all progress for a specific section
//       resetSection: (sectionId: string) => {
//         set((state) => ({
//           completedLevels: {
//             ...state.completedLevels,
//             [sectionId]: {},
//           },
//         }));
//       },

//       // Reset all progress across all sections
//       resetAllProgress: () => {
//         set({ completedLevels: {} });
//       },

//       // Check if a specific level is complete
//       isLevelComplete: (sectionId: string, levelId: string) => {
//         const state = get();
//         return state.completedLevels[sectionId]?.[levelId] ?? false;
//       },

//       // Get the status of a specific level (locked, active, or completed)
//       getLevelStatus: (
//         sectionId: string,
//         levelId: string,
//         levelOrder: string[]
//       ): LevelStatus => {
//         const state = get();
//         const sectionData = state.completedLevels[sectionId] || {};

//         // If this level is completed, return completed
//         if (sectionData[levelId] === true) {
//           return "completed";
//         }

//         const currentIndex = levelOrder.indexOf(levelId);

//         // If this is the first level, it's always active
//         if (currentIndex === 0) {
//           return "active";
//         }

//         // Check if previous level is completed
//         const previousLevelId = levelOrder[currentIndex - 1];
//         const previousLevelCompleted = sectionData[previousLevelId] === true;

//         if (previousLevelCompleted) {
//           return "active";
//         } else {
//           return "locked";
//         }
//       },

//       // Get the currently active (next available) level for a section
//       getActiveLevel: (
//         sectionId: string,
//         levelOrder: string[]
//       ): string | null => {
//         const state = get();
//         const sectionData = state.completedLevels[sectionId] || {};

//         // Find the first incomplete level
//         for (const levelId of levelOrder) {
//           if (!sectionData[levelId]) {
//             return levelId;
//           }
//         }

//         // All levels completed
//         return null;
//       },

//       // Get progress statistics for a specific section
//       getSectionProgress: (
//         sectionId: string,
//         levelIds: string[]
//       ): SectionProgress => {
//         const state = get();
//         const sectionData = state.completedLevels[sectionId] || {};
//         const completed = levelIds.filter(
//           (id) => sectionData[id] === true
//         ).length;

//         return {
//           completed,
//           total: levelIds.length,
//           percentage:
//             levelIds.length > 0
//               ? Math.round((completed / levelIds.length) * 100)
//               : 0,
//         };
//       },

//       // Get total progress across all sections
//       getTotalProgress: (
//         sections: { id: string; levelIds: string[] }[]
//       ): SectionProgress => {
//         const state = get();
//         let totalCompleted = 0;
//         let totalLevels = 0;

//         sections.forEach(({ id, levelIds }) => {
//           const sectionData = state.completedLevels[id] || {};
//           const sectionCompleted = levelIds.filter(
//             (levelId) => sectionData[levelId] === true
//           ).length;
//           totalCompleted += sectionCompleted;
//           totalLevels += levelIds.length;
//         });

//         return {
//           completed: totalCompleted,
//           total: totalLevels,
//           percentage:
//             totalLevels > 0
//               ? Math.round((totalCompleted / totalLevels) * 100)
//               : 0,
//         };
//       },

//       // Get array of completed level IDs for a section
//       getCompletedLevelsInSection: (sectionId: string): string[] => {
//         const state = get();
//         const sectionData = state.completedLevels[sectionId] || {};
//         return Object.entries(sectionData)
//           .filter(([_, isComplete]) => isComplete)
//           .map(([id, _]) => id);
//       },
//     }),
//     {
//       name: "level-progress-storage",
//       storage: createJSONStorage(() => AsyncStorage),
//     }
//   )
// );

// // Helper hook for easier access to level-specific operations
// export const useLevelProgress = (
//   sectionId: string,
//   levelId: string,
//   levelOrder: string[]
// ) => {
//   const store = useLevelProgressStore();

//   return {
//     isComplete: store.isLevelComplete(sectionId, levelId),
//     status: store.getLevelStatus(sectionId, levelId, levelOrder),
//     markComplete: () => store.markLevelComplete(sectionId, levelId),
//     markIncomplete: () => store.markLevelIncomplete(sectionId, levelId),
//   };
// };

// stores/levelProgressStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
interface CompletedLevels {
  [language: string]: {
    [sectionId: string]: {
      [levelId: string]: boolean;
    };
  };
}

interface SectionProgress {
  completed: number;
  total: number;
  percentage: number;
}

type LevelStatus = "locked" | "active" | "completed";

interface LevelProgressState {
  completedLevels: CompletedLevels;
  currentLanguage: string; // Store current language

  // Actions
  setCurrentLanguage: (language: string) => void;
  markLevelComplete: (
    language: string,
    sectionId: string,
    levelId: string
  ) => void;
  markLevelIncomplete: (
    language: string,
    sectionId: string,
    levelId: string
  ) => void;
  resetSection: (language: string, sectionId: string) => void;
  resetLanguageProgress: (language: string) => void;
  resetAllProgress: () => void;

  // Selectors
  isLevelComplete: (
    language: string,
    sectionId: string,
    levelId: string
  ) => boolean;
  getLevelStatus: (
    language: string,
    sectionId: string,
    levelId: string,
    levelOrder: string[]
  ) => LevelStatus;
  getActiveLevel: (
    language: string,
    sectionId: string,
    levelOrder: string[]
  ) => string | null;
  getSectionProgress: (
    language: string,
    sectionId: string,
    levelIds: string[]
  ) => SectionProgress;
  getTotalProgress: (
    language: string,
    sections: { id: string; levelIds: string[] }[]
  ) => SectionProgress;
  getCompletedLevelsInSection: (
    language: string,
    sectionId: string
  ) => string[];
}

export const useLevelProgressStore = create<LevelProgressState>()(
  persist(
    (set, get) => ({
      completedLevels: {},
      currentLanguage: "de", // Default language

      // Set current language
      setCurrentLanguage: (language: string) => {
        set({ currentLanguage: language });
      },

      // Mark a specific level as complete
      markLevelComplete: (
        language: string,
        sectionId: string,
        levelId: string
      ) => {
        set((state) => ({
          completedLevels: {
            ...state.completedLevels,
            [language]: {
              ...state.completedLevels[language],
              [sectionId]: {
                ...state.completedLevels[language]?.[sectionId],
                [levelId]: true,
              },
            },
          },
        }));
      },

      // Mark a specific level as incomplete
      markLevelIncomplete: (
        language: string,
        sectionId: string,
        levelId: string
      ) => {
        set((state) => ({
          completedLevels: {
            ...state.completedLevels,
            [language]: {
              ...state.completedLevels[language],
              [sectionId]: {
                ...state.completedLevels[language]?.[sectionId],
                [levelId]: false,
              },
            },
          },
        }));
      },

      // Reset all progress for a specific section in a language
      resetSection: (language: string, sectionId: string) => {
        set((state) => ({
          completedLevels: {
            ...state.completedLevels,
            [language]: {
              ...state.completedLevels[language],
              [sectionId]: {},
            },
          },
        }));
      },

      // Reset all progress for a specific language
      resetLanguageProgress: (language: string) => {
        set((state) => {
          const newCompletedLevels = { ...state.completedLevels };
          delete newCompletedLevels[language];
          return { completedLevels: newCompletedLevels };
        });
      },

      // Reset all progress across all languages
      resetAllProgress: () => {
        set({ completedLevels: {} });
      },

      // Check if a specific level is complete
      isLevelComplete: (
        language: string,
        sectionId: string,
        levelId: string
      ) => {
        const state = get();
        return state.completedLevels[language]?.[sectionId]?.[levelId] ?? false;
      },

      // Get the status of a specific level (locked, active, or completed)
      getLevelStatus: (
        language: string,
        sectionId: string,
        levelId: string,
        levelOrder: string[]
      ): LevelStatus => {
        const state = get();
        const sectionData = state.completedLevels[language]?.[sectionId] || {};

        // If this level is completed, return completed
        if (sectionData[levelId] === true) {
          return "completed";
        }

        const currentIndex = levelOrder.indexOf(levelId);

        // IMPORTANT: First level is ALWAYS active for any language
        if (currentIndex === 0) {
          return "active";
        }

        // Check if previous level is completed
        const previousLevelId = levelOrder[currentIndex - 1];
        const previousLevelCompleted = sectionData[previousLevelId] === true;

        if (previousLevelCompleted) {
          return "active";
        } else {
          return "locked";
        }
      },

      // Get the currently active (next available) level for a section
      getActiveLevel: (
        language: string,
        sectionId: string,
        levelOrder: string[]
      ): string | null => {
        const state = get();
        const sectionData = state.completedLevels[language]?.[sectionId] || {};

        // Find the first incomplete level
        for (const levelId of levelOrder) {
          if (!sectionData[levelId]) {
            return levelId;
          }
        }

        // All levels completed
        return null;
      },

      // Get progress statistics for a specific section
      getSectionProgress: (
        language: string,
        sectionId: string,
        levelIds: string[]
      ): SectionProgress => {
        const state = get();
        const sectionData = state.completedLevels[language]?.[sectionId] || {};
        const completed = levelIds.filter(
          (id) => sectionData[id] === true
        ).length;

        return {
          completed,
          total: levelIds.length,
          percentage:
            levelIds.length > 0
              ? Math.round((completed / levelIds.length) * 100)
              : 0,
        };
      },

      // Get total progress across all sections for a language
      getTotalProgress: (
        language: string,
        sections: { id: string; levelIds: string[] }[]
      ): SectionProgress => {
        const state = get();
        const languageData = state.completedLevels[language] || {};
        let totalCompleted = 0;
        let totalLevels = 0;

        sections.forEach(({ id, levelIds }) => {
          const sectionData = languageData[id] || {};
          const sectionCompleted = levelIds.filter(
            (levelId) => sectionData[levelId] === true
          ).length;
          totalCompleted += sectionCompleted;
          totalLevels += levelIds.length;
        });

        return {
          completed: totalCompleted,
          total: totalLevels,
          percentage:
            totalLevels > 0
              ? Math.round((totalCompleted / totalLevels) * 100)
              : 0,
        };
      },

      // Get array of completed level IDs for a section
      getCompletedLevelsInSection: (
        language: string,
        sectionId: string
      ): string[] => {
        const state = get();
        const sectionData = state.completedLevels[language]?.[sectionId] || {};
        return Object.entries(sectionData)
          .filter(([_, isComplete]) => isComplete)
          .map(([id, _]) => id);
      },
    }),
    {
      name: "level-progress-storage-multilang",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper hook for easier access to level-specific operations
export const useLevelProgress = (
  language: string,
  sectionId: string,
  levelId: string,
  levelOrder: string[]
) => {
  const store = useLevelProgressStore();

  return {
    isComplete: store.isLevelComplete(language, sectionId, levelId),
    status: store.getLevelStatus(language, sectionId, levelId, levelOrder),
    markComplete: () => store.markLevelComplete(language, sectionId, levelId),
    markIncomplete: () =>
      store.markLevelIncomplete(language, sectionId, levelId),
  };
};
