// stores/todoReminderStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type TodoReminder = {
  todoId: string;
  dayIndex: number;
  timeISO: string;
  repeatWeekly: boolean;
  notificationId: string;
};

type TodoReminderState = {
  reminders: Record<string, TodoReminder>;

  setReminder: (reminder: TodoReminder) => void;
  clearReminder: (todoId: string) => void;
  getReminder: (todoId: string) => TodoReminder | undefined;
  clearAll: () => void;
  pruneExpiredReminders: () => void;
};

const useTodoReminderStore = create<TodoReminderState>()(
  persist(
    (set, get) => ({
      reminders: {},

      setReminder: (reminder) =>
        set((state) => ({
          reminders: {
            ...state.reminders,
            [reminder.todoId]: reminder,
          },
        })),

      clearReminder: (todoId) =>
        set((state) => {
          const copy = { ...state.reminders };
          delete copy[todoId];
          return { reminders: copy };
        }),

      getReminder: (todoId) => get().reminders[todoId],

      clearAll: () => set({ reminders: {} }),

      pruneExpiredReminders: () => {
        const now = Date.now();
        const current = get().reminders;
        const next: Record<string, TodoReminder> = {};

        for (const [id, r] of Object.entries(current)) {
          const t = new Date(r.timeISO).getTime();
          if (r.repeatWeekly || t > now) {
            next[id] = r;
          }
        }

        set({ reminders: next });
      },
    }),
    {
      name: "todo-reminders",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useTodoReminderStore;
