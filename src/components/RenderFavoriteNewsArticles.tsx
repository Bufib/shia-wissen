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
import { NewsArticlesType } from "@/constants/Types";
import { getFavoriteNewsArticle } from "../../utils/favorites";
import { useLanguage } from "../../contexts/LanguageContext";
import { useRefreshFavorites } from "../../stores/refreshFavoriteStore";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { Colors } from "@/constants/Colors";
import Entypo from "@expo/vector-icons/Entypo";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { formatDate } from "../../utils/formatDate";
import { useDataVersionStore } from "../../stores/dataVersionStore";

export default function RenderFavoriteNewsArticles() {
  const { lang, rtl } = useLanguage();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const newsArticleFavoritesVersion = useDataVersionStore((s) => s.newsArticleFavoritesVersion);

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const favKey = useMemo(() => favoriteIds.join(","), [favoriteIds]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const ids = await getFavoriteNewsArticle(lang);
        if (!cancelled) setFavoriteIds(ids);
      } catch (e) {
        if (!cancelled) {
          console.warn("Failed to load favorite news IDs:", e);
          setFavoriteIds([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, newsArticleFavoritesVersion]);

  // Fetch favorite news in one query
  const {
    data: favoriteNews = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["favorite-news", lang, favKey],
    enabled: favoriteIds.length > 0,
    queryFn: async (): Promise<NewsArticlesType[]> => {
      const ids = favoriteIds.map(Number);
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  // const listExtraData = React.useMemo(
  //   () => `${newsArticleFavoritesVersion}`,
  //   [newsArticleFavoritesVersion]
  // );

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

  if (favoriteIds.length === 0 || favoriteNews.length === 0) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.emptyText}>{t("noFavorites")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={favoriteNews}
        // extraData={listExtraData}
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
                pathname: "/(newsArticle)",
                params: { articleId: String(item.id) },
              })
            }
          >
            <View style={{ flex: 1, gap: 40 }}>
              <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
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
