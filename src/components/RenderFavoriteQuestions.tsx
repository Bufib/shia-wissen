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
import { router } from "expo-router";
import { getFavoriteQuestions } from "../../db/queries/questions";
import { QuestionType } from "@/constants/Types";
import { useTranslation } from "react-i18next";
import { LoadingIndicator } from "./LoadingIndicator";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { Ionicons } from "@expo/vector-icons";

function RenderFavoriteQuestions() {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";
  const { lang } = useLanguage();
  const questionsFavoritesVersion = useDataVersionStore((s) => s.questionsFavoritesVersion);

  // useEffect(() => {
  //   let isMounted = true;
  //   const loadQuestions = async () => {
  //     try {
  //       setIsLoading(true);
  //       const favs = await getFavoriteQuestions();
  //       if (isMounted) {
  //         if (favs) {
  //           setQuestions(favs);
  //           setError(null);
  //         } else {
  //           setQuestions([]);
  //           setError(t("errorLoadingData"));
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error loading favorite questions:", err);
  //       if (isMounted) {
  //         setQuestions([]);
  //         setError(t("errorLoadingData"));
  //       }
  //     } finally {
  //       if (isMounted) {
  //         setIsLoading(false);
  //       }
  //     }
  //   };

  //   loadQuestions();
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [favoritesRefreshed, lang, questionsFavoritesVersion]);

  useEffect(() => {
    let cancelled = false;

    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const favs = await getFavoriteQuestions();

        if (cancelled) return;

        if (favs) {
          setQuestions(favs);
          setError(null);
        } else {
          setQuestions([]);
          setError(t("errorLoadingData"));
        }
      } catch (err) {
        console.error("Error loading favorite questions:", err);
        if (!cancelled) {
          setQuestions([]);
          setError(t("errorLoadingData"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [lang, questionsFavoritesVersion, t]);

  // const listExtraData = React.useMemo(
  //   () => `${favoritesRefreshed}|${questionsFavoritesVersion}`,
  //   [favoritesRefreshed, questionsFavoritesVersion]
  // );

  const renderItem = useCallback(
    ({ item }: { item: QuestionType }) => (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(displayQuestion)",
            params: {
              category: item.question_category_name ?? "",
              subcategory: item.question_subcategory_name ?? "",
              questionId: String(item.id),
              questionTitle: item.title ?? "",
            },
          })
        }
      >
        <ThemedView
          style={[
            styles.item,
            { backgroundColor: Colors[colorScheme].contrast },
          ]}
        >
          <View style={styles.questionContainer}>
            <ThemedText style={styles.titleText}>{item.title}</ThemedText>
            <ThemedText style={styles.questionText} numberOfLines={2}>
              {item.question}
            </ThemedText>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Colors[colorScheme].defaultIcon}
          />
        </ThemedView>
      </Pressable>
    ),
    [colorScheme]
  );

  if (error && !isLoading && questions.length === 0) {
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

  if (questions.length === 0 && !isLoading && !error) {
    return (
      <ThemedView style={styles.centeredContainer}>
        <ThemedText style={styles.emptyText}>{t("noFavorites")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container]}>
      <FlatList
        data={questions}
        // extraData={listExtraData}
        keyExtractor={(item) => item.id.toString()}
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
    gap: 20,
    paddingBottom: 24,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  questionContainer: {
    flex: 1,
    marginRight: 10,
    gap: 4,
  },
  titleText: {
    fontSize: 18,
    textAlign: "left",
    fontWeight: "500",
  },
  questionText: {
    fontSize: 14,
    textAlign: "left",
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
  },
});

export default RenderFavoriteQuestions;
