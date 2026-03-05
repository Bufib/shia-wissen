import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../utils/supabase";
import { PdfType } from "@/constants/Types";
import { useLanguage } from "../../contexts/LanguageContext";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Colors } from "@/constants/Colors";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../utils/formatDate";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { getFavoritePdf } from "../../utils/favorites";

// must match the logic used in PdfViewerScreen
const getPdfNumericId = (filename: string): number => {
  const asNumber = Number(filename);
  if (Number.isFinite(asNumber)) return asNumber;

  let hash = 0;
  for (let i = 0; i < filename.length; i++) {
    hash = (hash * 31 + filename.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
};

export default function RenderFavoritePdfs() {
  const { lang, rtl } = useLanguage();
  
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const pdfFavoritesVersion = useDataVersionStore((s) => s.pdfFavoritesVersion);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const favKey = useMemo(() => favoriteIds.join(","), [favoriteIds]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const ids = await getFavoritePdf(lang);
        if (!cancelled) setFavoriteIds(ids);
      } catch (e) {
        if (!cancelled) {
          console.warn("Failed to load favorite PDF IDs:", e);
          setFavoriteIds([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, pdfFavoritesVersion]);

  const {
    data: favoritePdfs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["favorite-pdfs", lang, favKey],
    enabled: favoriteIds.length > 0,
    queryFn: async (): Promise<PdfType[]> => {
      // We store numeric IDs derived from filename, so we need
      // to fetch PDFs and filter client-side based on filename → numericId.
      const { data, error } = await supabase
        .from("pdfs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const rows = data ?? [];

      const favoriteIdSet = new Set(favoriteIds.map(Number));
      return rows.filter((pdf: PdfType) => {
        if (!pdf.pdf_filename) return false;
        const numericId = getPdfNumericId(pdf.pdf_filename);
        return favoriteIdSet.has(numericId);
      });
    },
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  if (isLoading && favoriteIds.length > 0) {
    return (
      <ThemedView style={styles.centered}>
        <LoadingIndicator size="large" />
      </ThemedView>
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>
          {t("errorLoadingData")}
        </ThemedText>
      </ThemedView>
    );
  }

  if (favoriteIds.length === 0 || favoritePdfs.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.emptyText}>{t("noFavorites")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={favoritePdfs}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.itemContainer,
              {
                backgroundColor: Colors[colorScheme].contrast,
                flexDirection: rtl ? "row-reverse" : "row",
              },
            ]}
            onPress={() =>
              router.push({
                // adjust path if your PDF route is different
                pathname: "/(pdfs)",
                params: { id: item.id, filename: item.pdf_filename },
              })
            }
          >
            <View style={{ flex: 1, gap: 40 }}>
              <ThemedText style={styles.itemTitle}>{item.pdf_title}</ThemedText>
              <ThemedText style={styles.itemDate}>
                {formatDate(item.created_at)}
              </ThemedText>
            </View>
            <Entypo
              name="chevron-thin-right"
              size={24}
              color={colorScheme === "dark" ? "#fff" : "#000"}
              style={{ marginTop: -15 }}
            />
          </TouchableOpacity>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  flatListContent: {
    paddingTop: 15,
    gap: 20,
    paddingBottom: 24,
    paddingHorizontal: 15,
  },
  itemContainer: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 5 },
    }),
  },
  itemTitle: { fontSize: 16, fontWeight: "500" },
  itemDate: {
    fontSize: 14,
    alignSelf: "flex-end",
    color: Colors.universal.grayedOut,
  },
  emptyText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
  },
  errorText: { fontSize: 16, color: "red", textAlign: "center" },
});
