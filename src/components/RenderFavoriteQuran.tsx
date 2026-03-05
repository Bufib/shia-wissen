import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  useColorScheme,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  getFavoriteQuranVerses,
  getFavoriteSurasWithInfo,
  getFavoriteJuzsWithInfo,
  getFavoritePagesWithInfo,
  getSurahDisplayName,
} from "../../db/queries/quran";
import { FavoriteQuranItemType } from "@/constants/Types";
import { useTranslation } from "react-i18next";
import { LoadingIndicator } from "./LoadingIndicator";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { useDataVersionStore } from "../../stores/dataVersionStore";

function RenderFavoriteQuran() {
  const [favorites, setFavorites] = useState<FavoriteQuranItemType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const { lang, rtl } = useLanguage();
  const quranFavoritesVersion = useDataVersionStore(
    (s) => s.quranFavoritesVersion
  );

  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      try {
        setIsLoading(true);

        // Fetch all types of favorites in parallel
        const [verses, suras, juzs, pages] = await Promise.all([
          getFavoriteQuranVerses(lang),
          getFavoriteSurasWithInfo(),
          getFavoriteJuzsWithInfo(),
          getFavoritePagesWithInfo(),
        ]);

        if (cancelled) return;

        // Transform to unified format
        const allFavorites: FavoriteQuranItemType[] = [];

        // Add verses
        for (const v of verses) {
          const surahName = await getSurahDisplayName(v.sura, lang);
          allFavorites.push({
            type: "verse",
            id: `verse-${v.sura}-${v.aya}`,
            title: `${surahName || `Sura ${v.sura}`} ${v.aya}`,
            subtitle:
              v.text.substring(0, 80) + (v.text.length > 80 ? "..." : ""),
            sura: v.sura,
            aya: v.aya,
            created_at: (v as any).created_at || new Date().toISOString(),
          });
        }

        // Add suras
        for (const s of suras) {
          const displayName = lang === "ar" ? s.label : s.label_en;
          allFavorites.push({
            type: "sura",
            id: `sura-${s.id}`,
            title: `${displayName} (${s.id})`,
            subtitle: `${s.nbAyat} ${t("ayatCount")} • ${
              s.makki ? t("makki") : t("madani")
            }`,
            sura: s.id,
            created_at: s.created_at,
          });
        }

        // Add juzs
        for (const j of juzs) {
          const surahName = await getSurahDisplayName(j.sura, lang);
          allFavorites.push({
            type: "juz",
            id: `juz-${j.juz}`,
            title: `${t("juz")} ${j.juz}`,
            subtitle: `${t("startsAt")} ${surahName} ${j.aya}`,
            juz: j.juz,
            sura: j.sura,
            aya: j.aya,
            created_at: j.created_at,
          });
        }

        // Add pages
        for (const p of pages) {
          const surahName = await getSurahDisplayName(p.sura, lang);
          allFavorites.push({
            type: "page",
            id: `page-${p.page}`,
            title: `${t("page")} ${p.page}`,
            subtitle: `${t("startsAt")} ${surahName} ${p.aya}`,
            page: p.page,
            sura: p.sura,
            aya: p.aya,
            created_at: p.created_at,
          });
        }

        // Sort by created_at (most recent first)
        allFavorites.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        if (!cancelled) {
          setFavorites(allFavorites);
          setError(null);
        }
      } catch (err) {
        console.error("Error loading favorite Quran:", err);
        if (!cancelled) {
          setFavorites([]);
          setError(t("errorLoadingData"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [lang, quranFavoritesVersion, t]);

  const handlePress = useCallback((item: FavoriteQuranItemType) => {
    switch (item.type) {
      case "verse":
        router.push({
          pathname: "/(displaySura)",
          params: {
            suraId: String(item.sura),
            verseId: String(item.aya),
          },
        });
        break;
      case "sura":
        router.push({
          pathname: "/(displaySura)",
          params: { suraId: String(item.sura) },
        });
        break;
      case "juz":
        router.push({
          pathname: "/(displaySura)",

          params: {
            suraId: String(item.sura),
            juzId: String(item.juz),
          },
        });
        break;
      case "page":
        router.push({
          pathname: "/(displaySura)",
          params: {
            suraId: String(item.sura),
            pageId: String(item.page),
          },
        });
        break;
    }
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FavoriteQuranItemType }) => (
      <Pressable onPress={() => handlePress(item)}>
        <ThemedView
          style={[
            styles.item,
            { backgroundColor: Colors[colorScheme].contrast },
            rtl
              ? {
                  flexDirection: "row-reverse",
                  justifyContent: "space-between",
                }
              : {
                  flexDirection: "row",
                  justifyContent: "space-between",
                },
          ]}
        >
          <View style={styles.contentContainer}>
            <ThemedText style={styles.titleText}>{item.title}</ThemedText>
            {item.subtitle && (
              <ThemedText style={styles.subtitleText} numberOfLines={2}>
                {item.subtitle}
              </ThemedText>
            )}
          </View>
          {rtl ? (
            <Ionicons
              name="chevron-back"
              size={24}
              color={Colors[colorScheme].defaultIcon}
            />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Colors[colorScheme].defaultIcon}
            />
          )}
        </ThemedView>
      </Pressable>
    ),
    [colorScheme, handlePress, rtl]
  );

  if (error && !isLoading && favorites.length === 0) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <LoadingIndicator size="large" />
      </ThemedView>
    );
  }

  if (favorites.length === 0 && !isLoading && !error) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={styles.emptyText}>{t("noFavorites")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: Colors[colorScheme].background }}
        contentContainerStyle={styles.flatListContent}
        renderItem={renderItem}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    textAlign: "center",
  },
  flatListContent: {
    paddingTop: 15,
    gap: 12,
    paddingBottom: 24,
  },
  item: {
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    marginRight: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 201, 99, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    gap: 4,
  },
  titleText: {
    fontSize: 17,
    textAlign: "left",
    fontWeight: "600",
  },
  subtitleText: {
    fontSize: 14,
    textAlign: "left",
    opacity: 0.7,
  },
  emptyText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
  },
});

export default RenderFavoriteQuran;
