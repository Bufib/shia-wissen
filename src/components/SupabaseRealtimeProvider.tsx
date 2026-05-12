// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
//   ReactNode,
//   useCallback,
// } from "react";
// import { supabase } from "../../utils/supabase";
// import { useQueryClient } from "@tanstack/react-query";
// import Toast from "react-native-toast-message";
// import { useAuthStore } from "../../stores/authStore";
// import {
//   NewsType,
//   QuestionsFromUserType,
//   SupabaseRealtimeContextType,
//   WithLangType,
// } from "@/constants/Types";
// import { useLanguage } from "../../contexts/LanguageContext";
// import { useTranslation } from "react-i18next";
// import { useDataVersionStore } from "../../stores/dataVersionStore";
// import { userQuestionsNewAnswerForQuestions } from "@/constants/messages";
// import { router } from "expo-router";
// import { clearAllPdfCaches } from "../../hooks/usePdfs";

// const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextType>({
//   userId: null,
//   hasNewNewsData: false,
//   clearNewNewsFlag: () => {},
// });

// export const SupabaseRealtimeProvider = ({
//   children,
// }: {
//   children: ReactNode;
// }) => {
//   const [hasNewNewsData, setHasNewNewsData] = useState(false);
//   const { lang } = useLanguage();
//   const queryClient = useQueryClient();
//   const isAdmin = useAuthStore((s) => s.isAdmin);
//   const session = useAuthStore((state) => state.session);
//   const { t } = useTranslation();
//   const userId = session?.user?.id ?? null;

//   // Stable references to version incrementers
//   const incrementNewsArticleVersion =
//     useDataVersionStore.getState().incrementNewsArticleVersion;
//   const incrementPodcastVersion =
//     useDataVersionStore.getState().incrementPodcastVersion;
//   const incrementVideoVersion =
//     useDataVersionStore.getState().incrementVideoVersion;
//   const incrementUserQuestionVersion =
//     useDataVersionStore.getState().incrementUserQuestionVersion;
//   const incrementPdfDataVersion =
//     useDataVersionStore.getState().incrementPdfDataVersion;
//   // ---------- Helpers ----------

//   useEffect(() => {
//     // When user switches UI language, hide any banner from previous language
//     setHasNewNewsData(false);
//   }, [lang]);

//   const langFromPayload = useCallback((payload: any): string | undefined => {
//     const next = (payload?.new as WithLangType) ?? undefined;
//     const prev = (payload?.old as WithLangType) ?? undefined;
//     return (next?.language_code ?? prev?.language_code) || undefined;
//   }, []);

//   const invalidateByLang = useCallback(
//     async (baseKey: string, lang?: string) => {
//       if (lang) {
//         await queryClient.invalidateQueries({
//           queryKey: [baseKey, lang],
//           refetchType: "all",
//         });
//       } else {
//         await queryClient.invalidateQueries({
//           queryKey: [baseKey],
//           refetchType: "all",
//         });
//       }
//     },
//     [queryClient],
//   );

//   // ---------- User Questions ----------
//   useEffect(() => {
//     if (!userId) return;

//     const user_question_channel = supabase
//       .channel("user_questions")
//       .on(
//         "postgres_changes",
//         {
//           event: "*",
//           schema: "public",
//           table: "user_questions",
//           filter: `user_id=eq.${userId}`,
//         },
//         async (payload) => {
//           console.log("User Questions Change:", payload);

//           if (payload.eventType === "INSERT") {
//             await queryClient.invalidateQueries({
//               queryKey: ["questionsFromUser", userId],
//               refetchType: "all",
//             });

//             Toast.show({
//               type: "success",
//               text1: t("askQuestionQuestionSendSuccess"),
//             });
//             incrementUserQuestionVersion();
//             return;
//           }

//           if (payload.eventType === "UPDATE") {
//             await queryClient.invalidateQueries({
//               queryKey: ["questionsFromUser", userId],
//               refetchType: "all",
//             });

//             const newStatus = (payload.new as QuestionsFromUserType)?.status;
//             if (newStatus && ["Beantwortet", "Abgelehnt"].includes(newStatus)) {
//               userQuestionsNewAnswerForQuestions();
//             }
//             incrementUserQuestionVersion();
//             return;
//           }

//           if (payload.eventType === "DELETE") {
//             await queryClient.invalidateQueries({
//               queryKey: ["questionsFromUser", userId],
//               refetchType: "all",
//             });
//             incrementUserQuestionVersion();
//             router.push("/(tabs)/home");
//             return;
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(user_question_channel).catch(console.error);
//     };
//   }, [userId, incrementUserQuestionVersion, queryClient, t]);

//   // ---------- News (Custom INSERT logic with banner) ----------
//   useEffect(() => {
//     const newsChannel = supabase
//       .channel("all_news_changes")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "news" },
//         async (payload) => {
//           const { eventType, new: newRec, old: oldRec } = payload;
//           const recordLang: string | undefined =
//             (eventType === "DELETE"
//               ? (oldRec as Partial<NewsType>)?.language_code
//               : (newRec as NewsType)?.language_code) ?? undefined;

//           // Show banner only if it concerns the current language (or language unknown)
//           const bannerRelevant = !recordLang || recordLang === lang;

//           if (eventType === "INSERT") {
//             if (!isAdmin && bannerRelevant) {
//               setHasNewNewsData(true); // Show banner for current language
//               return; // Don't invalidate; user will accept banner
//             }
//             // Admins OR non-current languages: invalidate that language
//             await invalidateByLang("news", recordLang);
//             return;
//           }

//           if (eventType === "UPDATE") {
//             await invalidateByLang("news", recordLang);
//             return;
//           }

//           if (eventType === "DELETE") {
//             await invalidateByLang("news", recordLang);
//             return;
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       void supabase.removeChannel(newsChannel);
//     };
//   }, [queryClient, isAdmin, lang, invalidateByLang]);

//   // ---------- News Articles ----------
//   useEffect(() => {
//     const ch = supabase
//       .channel("all_news_articles_changes")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "news_articles" },
//         async (payload) => {
//           const lang = langFromPayload(payload);

//           if (payload.eventType === "INSERT") {
//             await invalidateByLang("newsArticles", lang);
//             incrementNewsArticleVersion();
//             return;
//           }

//           if (payload.eventType === "UPDATE") {
//             await invalidateByLang("newsArticles", lang);
//             incrementNewsArticleVersion();
//             router.push("/home");

//             return;
//           }

//           if (payload.eventType === "DELETE") {
//             await invalidateByLang("newsArticles", lang);
//             incrementNewsArticleVersion();
//             router.push("/home");

//             return;
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(ch).catch(console.error);
//     };
//   }, [incrementNewsArticleVersion, invalidateByLang, langFromPayload]);

//   // ---------- PDFs ----------
//   useEffect(() => {
//     const ch = supabase
//       .channel("all_pdfs_changes")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "pdfs" },
//         async (payload) => {
//           const lang = langFromPayload(payload);

//           if (payload.eventType === "INSERT") {
//             await invalidateByLang("pdfs", lang);
//             incrementPdfDataVersion();
//             return;
//           }

//           if (payload.eventType === "UPDATE") {
//             // Clear all cached PDFs across all languages
//             await clearAllPdfCaches();
//             await invalidateByLang("pdfs", lang);
//             incrementPdfDataVersion();
//             router.push("/home");
//             return;
//           }

//           if (payload.eventType === "DELETE") {
//             // Clear all cached PDFs across all languages
//             await clearAllPdfCaches();
//             await invalidateByLang("pdfs", lang);
//             incrementPdfDataVersion();
//             router.push("/home");
//             return;
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(ch).catch(console.error);
//     };
//   }, [incrementPdfDataVersion, invalidateByLang, langFromPayload]);

//   // ---------- Podcasts ----------
//   useEffect(() => {
//     const ch = supabase
//       .channel("all_podcasts_changes")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "podcasts" },
//         async (payload) => {
//           const lang = langFromPayload(payload);

//           if (payload.eventType === "INSERT") {
//             await invalidateByLang("podcasts", lang);
//             incrementPodcastVersion();
//             return;
//           }

//           if (payload.eventType === "UPDATE") {
//             await invalidateByLang("podcasts", lang);
//             incrementPodcastVersion();
//             router.push("/home");

//             return;
//           }

//           if (payload.eventType === "DELETE") {
//             await invalidateByLang("podcasts", lang);
//             incrementPodcastVersion();
//             router.push("/home");

//             return;
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(ch).catch(console.error);
//     };
//   }, [incrementPodcastVersion, invalidateByLang, langFromPayload]);

//   // ---------- Videos ----------
//   useEffect(() => {
//     const ch = supabase
//       .channel("all_videos_changes")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "videos" },
//         async (payload) => {
//           const lang = langFromPayload(payload);

//           if (payload.eventType === "INSERT") {
//             await invalidateByLang("videos", lang);
//             incrementVideoVersion();
//             return;
//           }

//           if (payload.eventType === "UPDATE") {
//             await invalidateByLang("videos", lang);
//             incrementVideoVersion();
//             router.push("/home");

//             return;
//           }

//           if (payload.eventType === "DELETE") {
//             await invalidateByLang("videos", lang);
//             incrementVideoVersion();
//             router.push("/home");

//             return;
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(ch).catch(console.error);
//     };
//   }, [incrementVideoVersion, invalidateByLang, langFromPayload]);

//   // ---------- Video Categories ----------
//   useEffect(() => {
//     const ch = supabase
//       .channel("all_video_categories_changes")
//       .on(
//         "postgres_changes",
//         { event: "*", schema: "public", table: "video_categories" },
//         async (payload) => {
//           const lang = langFromPayload(payload);

//           if (payload.eventType === "INSERT") {
//             await invalidateByLang("video_categories", lang);
//             incrementVideoVersion();
//             return;
//           }

//           if (payload.eventType === "UPDATE") {
//             await invalidateByLang("video_categories", lang);
//             incrementVideoVersion();
//             router.push("/home");

//             return;
//           }

//           if (payload.eventType === "DELETE") {
//             await invalidateByLang("video_categories", lang);
//             incrementVideoVersion();
//             router.push("/home");

//             return;
//           }
//         },
//       )
//       .subscribe();

//     return () => {
//       supabase.removeChannel(ch).catch(console.error);
//     };
//   }, [incrementVideoVersion, invalidateByLang, langFromPayload]);

//   const clearNewNewsFlag = useCallback(() => {
//     setHasNewNewsData(false);
//   }, []);

//   return (
//     <SupabaseRealtimeContext.Provider
//       value={{ userId, hasNewNewsData, clearNewNewsFlag }}
//     >
//       {children}
//     </SupabaseRealtimeContext.Provider>
//   );
// };

// export const useSupabaseRealtime = () => useContext(SupabaseRealtimeContext);

import React, {
  createContext,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { supabase } from "../../utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../stores/authStore";
import {
  QuestionsFromUserType,
  SupabaseRealtimeContextType,
  WithLangType,
} from "@/constants/Types";
import { useTranslation } from "react-i18next";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { userQuestionsNewAnswerForQuestions } from "@/constants/messages";
import { router } from "expo-router";
import { clearAllPdfCaches } from "../../hooks/usePdfs";

const SupabaseRealtimeContext = createContext<SupabaseRealtimeContextType>({
  userId: null,
});

export const SupabaseRealtimeProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const { t } = useTranslation();
  const userId = session?.user?.id ?? null;

  // Stable references to version incrementers
  const incrementVideoVersion =
    useDataVersionStore.getState().incrementVideoVersion;

  const incrementUserQuestionVersion =
    useDataVersionStore.getState().incrementUserQuestionVersion;

  const incrementPdfDataVersion =
    useDataVersionStore.getState().incrementPdfDataVersion;

  // ---------- Helpers ----------

  const langFromPayload = useCallback((payload: any): string | undefined => {
    const next = (payload?.new as WithLangType) ?? undefined;
    const prev = (payload?.old as WithLangType) ?? undefined;

    return (next?.language_code ?? prev?.language_code) || undefined;
  }, []);

  const invalidateByLang = useCallback(
    async (baseKey: string, lang?: string) => {
      if (lang) {
        await queryClient.invalidateQueries({
          queryKey: [baseKey, lang],
          refetchType: "all",
        });
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: [baseKey],
        refetchType: "all",
      });
    },
    [queryClient],
  );

  // ---------- User Questions ----------
  useEffect(() => {
    if (!userId) return;

    const userQuestionChannel = supabase
      .channel("user_questions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_questions",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          console.log("User Questions Change:", payload);

          if (payload.eventType === "INSERT") {
            await queryClient.invalidateQueries({
              queryKey: ["questionsFromUser", userId],
              refetchType: "all",
            });

            Toast.show({
              type: "success",
              text1: t("askQuestionQuestionSendSuccess"),
            });

            incrementUserQuestionVersion();
            return;
          }

          if (payload.eventType === "UPDATE") {
            await queryClient.invalidateQueries({
              queryKey: ["questionsFromUser", userId],
              refetchType: "all",
            });

            const newStatus = (payload.new as QuestionsFromUserType)?.status;

            if (newStatus && ["Beantwortet", "Abgelehnt"].includes(newStatus)) {
              userQuestionsNewAnswerForQuestions();
            }

            incrementUserQuestionVersion();
            return;
          }

          if (payload.eventType === "DELETE") {
            await queryClient.invalidateQueries({
              queryKey: ["questionsFromUser", userId],
              refetchType: "all",
            });

            incrementUserQuestionVersion();
            router.push("/(tabs)/home");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userQuestionChannel).catch(console.error);
    };
  }, [userId, incrementUserQuestionVersion, queryClient, t]);

  // ---------- PDFs ----------
  useEffect(() => {
    const ch = supabase
      .channel("all_pdfs_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "pdfs",
        },
        async (payload) => {
          const lang = langFromPayload(payload);

          if (payload.eventType === "INSERT") {
            await invalidateByLang("pdfs", lang);
            incrementPdfDataVersion();
            return;
          }

          if (payload.eventType === "UPDATE") {
            await clearAllPdfCaches();
            await invalidateByLang("pdfs", lang);
            incrementPdfDataVersion();
            router.push("/home");
            return;
          }

          if (payload.eventType === "DELETE") {
            await clearAllPdfCaches();
            await invalidateByLang("pdfs", lang);
            incrementPdfDataVersion();
            router.push("/home");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch).catch(console.error);
    };
  }, [incrementPdfDataVersion, invalidateByLang, langFromPayload]);

  // ---------- Videos ----------
  useEffect(() => {
    const ch = supabase
      .channel("all_videos_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "videos",
        },
        async (payload) => {
          const lang = langFromPayload(payload);

          if (payload.eventType === "INSERT") {
            await invalidateByLang("videos", lang);
            incrementVideoVersion();
            return;
          }

          if (payload.eventType === "UPDATE") {
            await invalidateByLang("videos", lang);
            incrementVideoVersion();
            router.push("/home");
            return;
          }

          if (payload.eventType === "DELETE") {
            await invalidateByLang("videos", lang);
            incrementVideoVersion();
            router.push("/home");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch).catch(console.error);
    };
  }, [incrementVideoVersion, invalidateByLang, langFromPayload]);

  // ---------- Video Categories ----------
  useEffect(() => {
    const ch = supabase
      .channel("all_video_categories_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_categories",
        },
        async (payload) => {
          const lang = langFromPayload(payload);

          if (payload.eventType === "INSERT") {
            await invalidateByLang("video_categories", lang);
            incrementVideoVersion();
            return;
          }

          if (payload.eventType === "UPDATE") {
            await invalidateByLang("video_categories", lang);
            incrementVideoVersion();
            router.push("/home");
            return;
          }

          if (payload.eventType === "DELETE") {
            await invalidateByLang("video_categories", lang);
            incrementVideoVersion();
            router.push("/home");
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch).catch(console.error);
    };
  }, [incrementVideoVersion, invalidateByLang, langFromPayload]);

  return (
    <SupabaseRealtimeContext.Provider value={{ userId }}>
      {children}
    </SupabaseRealtimeContext.Provider>
  );
};

export const useSupabaseRealtime = () => useContext(SupabaseRealtimeContext);
