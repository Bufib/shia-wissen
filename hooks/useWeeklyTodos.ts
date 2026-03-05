// import { useState, useEffect, useCallback } from "react";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { defaultWeeklyTodos } from "./defaultWeeklyTodos";
// import i18n from "@/utils/i18n";
// import {
//   TodoItemType,
//   WeeklyTodosType,
//   WeeklyCalendarSectionType,
//   UseWeeklyTodosResult,
// } from "@/constants/Types";
// import { useLanguage } from "@/contexts/LanguageContext";

// export function useWeeklyTodos(): UseWeeklyTodosResult {
//   const { lang } = useLanguage();
  
//   const STORAGE_KEY = `prayer_app_weekly_todos_${lang}`;

//   const [todosByDay, setTodosByDay] = useState<WeeklyTodosType>(
//     () => defaultWeeklyTodos[lang] ?? defaultWeeklyTodos.de
//   );
//   const [loading, setLoading] = useState(true);

//   // Load saved todos on mount (and when primary language changes)
//   useEffect(() => {
//     let active = true;
//     (async () => {
//       setLoading(true);
//       try {
//         const raw = await AsyncStorage.getItem(STORAGE_KEY);
//         if (active && raw) {
//           setTodosByDay(JSON.parse(raw));
//         }
//       } catch (e) {
//         console.error("Failed to load todos:", e);
//       } finally {
//         if (active) setLoading(false);
//       }
//     })();
//     return () => {
//       active = false;
//     };
//   }, [lang]);

//   // Persist todos whenever they change
//   useEffect(() => {
//     if (!loading) {
//       AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todosByDay)).catch((e) =>
//         console.error("Failed to save todos:", e)
//       );
//     }
//   }, [todosByDay, loading]);

//   const toggleTodo = useCallback((day: number, id: number) => {
//     setTodosByDay((prev) => ({
//       ...prev,
//       [day]:
//         prev[day]?.map((todo) =>
//           todo.id === id ? { ...todo, completed: !todo.completed } : todo
//         ) ?? [],
//     }));
//   }, []);

//   const addTodo = useCallback((day: number, text: string) => {
//     const trimmed = text.trim();
//     if (!trimmed) return;
//     const newTodo: TodoItemType = {
//       id: Date.now(),
//       text: trimmed,
//       completed: false,
//     };
//     setTodosByDay((prev) => ({
//       ...prev,
//       [day]: [...(prev[day] || []), newTodo],
//     }));
//   }, []);

//   const deleteTodo = useCallback((day: number, id: number) => {
//     setTodosByDay((prev) => ({
//       ...prev,
//       [day]: (prev[day] || []).filter((todo) => todo.id !== id),
//     }));
//   }, []);

//   const undoAllForDay = useCallback((day: number) => {
//     setTodosByDay((prev) => ({
//       ...prev,
//       [day]: (prev[day] || []).map((todo) => ({ ...todo, completed: false })),
//     }));
//   }, []);

//   return {
//     todosByDay,
//     loading,
//     toggleTodo,
//     addTodo,
//     deleteTodo,
//     undoAllForDay,
//   };
// }


import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultWeeklyTodos } from "./defaultWeeklyTodos";
import {
  TodoItemType,
  WeeklyTodosType,
  UseWeeklyTodosResult,
} from "@/constants/Types";
import { useLanguage } from "../contexts/LanguageContext";

export function useWeeklyTodos(): UseWeeklyTodosResult {
  const { lang } = useLanguage();
  // Change here for lang
  const STORAGE_KEY = `prayer_app_weekly_todos_`;

  const [todosByDay, setTodosByDay] = useState<WeeklyTodosType>(
    () => defaultWeeklyTodos[lang] ?? defaultWeeklyTodos.de
  );
  const [loading, setLoading] = useState(true);

  // Load saved todos on mount / language change
  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (active && raw) {
          const parsed = JSON.parse(raw);

          // Backwards-safe: ensure items still match TodoItemType
          setTodosByDay(parsed);
        }
      } catch (e) {
        console.error("Failed to load todos:", e);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [STORAGE_KEY]);

  // Persist todos whenever they change
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todosByDay)).catch(
        (e) => console.error("Failed to save todos:", e)
      );
    }
  }, [todosByDay, loading, STORAGE_KEY]);

  const toggleTodo = useCallback((day: number, id: number) => {
    setTodosByDay((prev) => ({
      ...prev,
      [day]:
        prev[day]?.map((todo) =>
          todo.id === id
            ? { ...todo, completed: !todo.completed }
            : todo
        ) ?? [],
    }));
  }, []);

  // ⬇️ UPDATED: supports internalUrls
  const addTodo = useCallback(
    (day: number, text: string, internalUrls: string[] = []) => {
      const trimmed = text.trim();
      const cleanLinks = internalUrls.filter(
        (u) => typeof u === "string" && u.trim().length > 0
      );

      if (!trimmed && cleanLinks.length === 0) return;

      const newTodo: TodoItemType = {
        id: Date.now(),
        text: trimmed,
        completed: false,
        ...(cleanLinks.length ? { internal_urls: cleanLinks } : {}),
      };

      setTodosByDay((prev) => ({
        ...prev,
        [day]: [...(prev[day] || []), newTodo],
      }));
    },
    []
  );

  const deleteTodo = useCallback((day: number, id: number) => {
    setTodosByDay((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((todo) => todo.id !== id),
    }));
  }, []);

  const undoAllForDay = useCallback((day: number) => {
    setTodosByDay((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((todo) => ({
        ...todo,
        completed: false,
      })),
    }));
  }, []);

  return {
    todosByDay,
    loading,
    toggleTodo,
    addTodo,
    deleteTodo,
    undoAllForDay,
  };
}
