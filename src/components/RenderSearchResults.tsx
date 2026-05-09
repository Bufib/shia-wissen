// src/components/RenderSearchResults.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Animated,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import type { QuestionType } from "@/constants/Types";

import { searchQuestions, type PagedResult } from "../../db/search";
import { ThemedText } from "./ThemedText";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { LoadingIndicator } from "./LoadingIndicator";
import HeaderLeftBackButton from "./HeaderLeftBackButton";
import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";

type Props = {
  onPressQuestion?: (v: { id: number }) => void;
  pageSize?: number;
};

export default function RenderSearchResults({
  onPressQuestion,
  pageSize = 30,
}: Props) {
  const { lang } = useLanguage();
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const { fadeAnim, onLayout } = useScreenFadeIn(800);

  const [query, setQuery] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState("");
  const [rows, setRows] = useState<QuestionType[]>([]);
  const [total, setTotal] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reqIdRef = useRef(0);

  // Debounce
  useEffect(() => {
    const h = setTimeout(() => setDebouncedTerm(query.trim()), 350);
    return () => clearTimeout(h);
  }, [query]);

  const canSearch = debouncedTerm.length > 0;

  /* ----------------------------- Search runner ----------------------------- */
  const runSearch = useCallback(
    async (opts?: { offset?: number; append?: boolean }) => {
      if (!canSearch) {
        setRows([]);
        setTotal(0);
        setNextOffset(null);
        setError(null);
        return;
      }

      const myId = ++reqIdRef.current;
      const offset = opts?.offset ?? 0;
      const append = opts?.append ?? false;

      try {
        if (append) setIsLoadingMore(true);
        else setIsLoading(true);

        const result = await searchQuestions(lang, debouncedTerm, {
          limit: pageSize,
          offset,
        });

        if (myId !== reqIdRef.current) return;

        setError(null);
        setTotal(result.total);
        setNextOffset(result.nextOffset);
        setRows((prev) => (append ? [...prev, ...result.rows] : result.rows));
      } catch (e: any) {
        if (myId !== reqIdRef.current) return;
        console.warn("Search failed:", e);
        setError(t("search_failed"));
        if (!append) {
          setRows([]);
          setTotal(0);
          setNextOffset(null);
        }
      } finally {
        if (myId !== reqIdRef.current) return;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [lang, pageSize, debouncedTerm, canSearch, t],
  );

  /* ----------------------------- Auto-search ----------------------------- */
  useEffect(() => {
    reqIdRef.current++;

    if (!canSearch) {
      setRows([]);
      setNextOffset(null);
      setTotal(0);
      setError(null);
      return;
    }

    runSearch();
  }, [debouncedTerm, lang, pageSize, canSearch, runSearch]);

  const loadMore = useCallback(() => {
    if (!canSearch || isLoading || isLoadingMore || nextOffset == null) return;
    runSearch({ offset: nextOffset, append: true });
  }, [canSearch, isLoading, isLoadingMore, nextOffset, runSearch]);

  const onClear = useCallback(() => {
    setQuery("");
    setRows([]);
    setTotal(0);
    setNextOffset(null);
    setError(null);
  }, []);

  /* ------------------------------ Rendering ------------------------------ */
  const renderItem = useCallback(
    ({ item }: { item: QuestionType }) => (
      <Pressable
        onPress={() =>
          onPressQuestion
            ? onPressQuestion({ id: item.id })
            : router.push({
                pathname: "/(displayQuestion)",
                params: {
                  category: item.question_category_name,
                  subcategory: item.question_subcategory_name,
                  questionId: item.id.toString(),
                  questionTitle: item.title,
                },
              })
        }
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: Colors[colorScheme].contrast,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <ThemedText style={styles.rowTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.rowSubtitle} numberOfLines={3}>
          {item.question}
        </ThemedText>
      </Pressable>
    ),
    [colorScheme, onPressQuestion],
  );

  const keyExtractor = useCallback(
    (item: QuestionType, index: number) =>
      item?.id != null ? `question-${item.id}` : `question-fb-${index}`,
    [],
  );

  const ListHeader = (
    <View>
      {/* SEARCH FIELD */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: Colors[colorScheme].contrast },
        ]}
      >
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("placeholder_questions")}
          placeholderTextColor={Colors[colorScheme].text}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          style={[styles.input, { color: Colors[colorScheme].text }]}
        />
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
            <ThemedText style={{ fontSize: 18 }}>×</ThemedText>
          </TouchableOpacity>
        )}
        {isLoading && <LoadingIndicator style={{ marginLeft: 8 }} />}
      </View>

      {/* META LINE */}
      {canSearch && !isLoading && !error ? (
        <ThemedText style={styles.meta}>
          {t("results_count", { count: total })}
        </ThemedText>
      ) : null}
    </View>
  );

  const ListEmpty = (
    <View style={styles.emptyWrap}>
      {isLoading ? null : error ? (
        <ThemedText style={styles.emptyText}>{error}</ThemedText>
      ) : (
        query.length > 0 && (
          <ThemedText style={styles.emptyText}>
            {t("noSearchResults")}
          </ThemedText>
        )
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}
      edges={["top", "left", "right", "bottom"]}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            backgroundColor: Colors[colorScheme].background,
          },
        ]}
        onLayout={onLayout}
      >
        <FlatList
          data={rows}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={{ paddingBottom: 40, gap: 15 }}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const RADIUS = 14;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    height: 44,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  meta: {
    marginTop: 8,
    marginBottom: 6,
    fontSize: 12,
  },
  row: {
    padding: 12,
    borderRadius: RADIUS,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  rowSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
