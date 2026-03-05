import { useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import { useSupabaseRealtime } from "@/components/SupabaseRealtimeProvider";
import { NewsType } from "@/constants/Types";

const PAGE_SIZE = 10;

export function useNews(language: string) {
  const queryClient = useQueryClient();
  const { hasNewNewsData, clearNewNewsFlag } = useSupabaseRealtime();

  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Toggle the "new data" banner - but DON'T refetch automatically
  useEffect(() => {
    if (hasNewNewsData) {
      // Just show the button, don't fetch data
      setShowUpdateButton(true);
    }
  }, [hasNewNewsData]);

  const infiniteQuery = useInfiniteQuery<NewsType[], Error>({
    queryKey: ["news", language],
    enabled: Boolean(language),
    initialPageParam: 0,
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,

    queryFn: async ({ pageParam = 0 }: { pageParam: any }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("language_code", language)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data ?? [];
    },

    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    infiniteQuery;

  /** Pull-to-refresh handler */
  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Reset to first page when pull-to-refresh
      await queryClient.resetQueries({
        queryKey: ["news", language],
        exact: true,
      });
      await refetch();
      clearNewNewsFlag();
      setShowUpdateButton(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  /** When user taps "New items available" - this is the key function */
  const handleRefresh = async () => {
    if (!showUpdateButton) return;

    try {
      // Clear the entire cache to force a complete refresh
      await queryClient.resetQueries({
        queryKey: ["news", language],
        exact: true,
      });

      // Now refetch from the beginning
      await refetch();

      // Clear the flags after successful fetch
      clearNewNewsFlag();
      setShowUpdateButton(false);
    } catch (error) {
      console.error("Error refreshing news:", error);
    }
  };

  /** Infinite-scroll "load more" handler */
  const handleLoadMore = async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage();
    }
  };

  /** Flatten & de-duplicate pages */
  const allNews: NewsType[] =
    data?.pages
      .flatMap((page) => page)
      .reduce<NewsType[]>((acc, item) => {
        if (!acc.some((n) => n.id === item.id)) acc.push(item);
        return acc;
      }, []) ?? [];

  return {
    // react-query output
    ...infiniteQuery,

    // our extras
    allNews,
    showUpdateButton,
    isRefreshing,
    handlePullToRefresh,
    handleRefresh,
    handleLoadMore,
  };
}
