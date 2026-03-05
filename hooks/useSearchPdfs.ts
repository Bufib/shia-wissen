// src/hooks/useSearchPdfs.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";
import { PdfType } from "@/constants/Types";
import { useLanguage } from "../contexts/LanguageContext";

export function useSearchPdfs(searchTerm: string) {
  const { lang } = useLanguage();
  const term = searchTerm.trim();

  return useQuery<PdfType[], Error>({
    queryKey: ["search", "pdfs", lang, term],
    enabled: !!term && Boolean(lang),

    queryFn: async () => {
      if (!term) return [];
      const { data, error } = await supabase
        .from("pdfs")
        .select("*")
        .eq("language_code", lang)
        .or(`pdf_title.ilike.%${term}%,pdf_filename.ilike.%${term}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },

    // Search-friendly cache settings
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    placeholderData: (prev) => prev,
  });
}
