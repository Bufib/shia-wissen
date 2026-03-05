import { NewsArticlesType } from "@/constants/Types";
import { supabase } from "../utils/supabase";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const PAGE_SIZE = 5;

export function useNewsArticles(language: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["newsArticles", language], [language]);

  const infiniteQuery = useInfiniteQuery<NewsArticlesType[], Error>({
    queryKey,
    enabled: Boolean(language),
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }: { pageParam: any }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("language_code", language)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return data ?? [];
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
  });

  // Function to fetch a single news article by ID
  const fetchNewsArticleById = useCallback(
    async (id: number): Promise<NewsArticlesType | null> => {
      const cachedData =
        queryClient.getQueryData<InfiniteData<NewsArticlesType[]>>(queryKey);
      if (cachedData) {
        for (const page of cachedData.pages) {
          const foundArticle = page.find((article) => article.id === id);
          if (foundArticle) {
            return foundArticle;
          }
        }
      }

      // If not in cache, fetch from Supabase
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching single news article:", error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return data as NewsArticlesType;
    },
    [queryClient, queryKey]
  );

  return { ...infiniteQuery, fetchNewsArticleById };
}
