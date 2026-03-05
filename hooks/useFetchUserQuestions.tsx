//! last that worked
// import { useState } from "react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { supabase } from "@/utils/supabase";
// import { useSupabaseRealtime } from "@/components/SupabaseRealtimeProvider";

// export type AskQuestionFormData = {
//   title: string;
//   question: string;
//   marja: string;
// };

// export const useFetchUserQuestions = () => {
//   const queryClient = useQueryClient();
//   const { userId } = useSupabaseRealtime(); // Get userId from context
//   const [hasUpdate, setHasUpdate] = useState(false);

//   /**
//    * Fetch all questions using useQuery (no pagination)
//    */
//   const queryResult = useQuery({
//     queryKey: ["questionsFromUser", userId],
//     queryFn: async () => {
//       console.log("Current userId:", userId);
//       if (!userId) throw new Error("Not authenticated");

//       const { data, error } = await supabase
//         .from("user_questions")
//         .select("*")
//         .eq("user_id", userId)
//         .order("update_answered_at", { ascending: false, nullsFirst: false })
//         .order("created_at", { ascending: true });

//       if (error) {
//         throw new Error(error.message);
//       }

//       return data ?? [];
//     },
//     enabled: !!userId,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     gcTime: 1000 * 60 * 30, // 30 minutes
//     refetchOnWindowFocus: false,
//     retry: 3,
//     refetchOnMount: "always",
//     refetchOnReconnect: true,
//   });

//   const handleRefresh = async () => {
//     await queryClient.invalidateQueries({
//       queryKey: ["questionsFromUser", userId],
//     });
//     setHasUpdate(false);
//   };

//   return {
//     ...queryResult,
//     isInitializing: false, // No longer needed as auth state is managed by context
//     hasUpdate,
//     handleRefresh,
//   };
// };

// useFetchUserQuestion

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import { useAuthStore } from "../stores/authStore";

export type AskQuestionFormData = {
  title: string;
  question: string;
  marja: string;
};

export const useFetchUserQuestions = () => {
  const queryClient = useQueryClient();
  const session = useAuthStore((state) => state.session);
  const userId = session?.user?.id ?? null;

  /**
   * Fetch all questions using useQuery (no pagination)
   */
  const queryResult = useQuery({
    queryKey: ["questionsFromUser", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_questions")
        .select("*")
        .eq("user_id", userId)
        .order("update_answered_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!userId,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30, // 30 min
    refetchOnMount: true, // refetch if query invalid
    refetchOnWindowFocus: true, // refetcht if stale/invalidated
    refetchOnReconnect: true,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["questionsFromUser", userId],
    });
  };

  return {
    ...queryResult,
    isInitializing: false,
    handleRefresh,
  };
};
