import { LoadingIndicator } from "@/components/LoadingIndicator";
import NewsArticlePreviewCard from "@/components/NewsArticlePreviewCard";
import { NewsItem } from "@/components/NewsItem";
import PodcastPreviewCard from "@/components/PodcastPreviewCard";
import RetryButton from "@/components/RetryButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import {
  ActiveSheet,
  NewsArticlesType,
  PodcastType,
  PdfType,
  NewsCardType,
  CalendarType,
} from "@/constants/Types";
import { useLanguage } from "../../../../contexts/LanguageContext";
import { useNews } from "../../../../hooks/useNews";
import { useNewsArticles } from "../../../../hooks/useNewsArticles";
import { usePodcasts } from "../../../../hooks/usePodcasts";
import { useAuthStore } from "../../../../stores/authStore";
import { useDataVersionStore } from "../../../../stores/dataVersionStore";
import { getAllCalendarDates } from "../../../../db/queries/calendar";
import handleOpenExternalUrl from "../../../../utils/handleOpenExternalUrl";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Animated,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { useScreenFadeIn } from "../../../../hooks/useScreenFadeIn";
import { returnSize } from "../../../../utils/sizes";
import PdfPreviewCard from "@/components/PdfPreviewCard";
import { usePdfs } from "../../../../hooks/usePdfs";

// Format date helper
const formatDate = (dateString: string, lang: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", options);
};

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const insets = useSafeAreaInsets();
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const { width, height } = useWindowDimensions();
  const { previewSizes, fontsizeHomeShowAll, fontsizeHomeHeaders } = returnSize(
    width,
    height,
  );

  // Hooks
  const {
    data: newsArticlesData,
    isLoading: newsArticlesIsLoading,
    isError: newsArticlesIsError,
    error: newsArticlesError,
    fetchNextPage: newsArticlesFetchNextPage,
    hasNextPage: newsArticlesHasNextPage,
    isFetchingNextPage: newsArticlesIsFetchingNextPage,
  } = useNewsArticles(lang);

  const {
    allNews,
    showUpdateButton,
    isRefreshing,
    handlePullToRefresh,
    handleRefresh,
    handleLoadMore,
    isLoading: newsIsLoading,
    isError: newsIsError,
    error: newsError,
    hasNextPage: newsHasNextPage,
    isFetchingNextPage: newsIsFetchingNextPage,
  } = useNews(lang);

  const {
    data: podcastPages,
    isLoading: podcastsLoading,
    isError: podcastsError,
    error: podcastsErrorObj,
    fetchNextPage: podcastsFetchNextPage,
    hasNextPage: podcastsHasNextPage,
    isFetchingNextPage: podcastsIsFetchingNextPage,
  } = usePodcasts(lang);

  const {
    data: pdfPages,
    isLoading: pdfsLoading,
    isError: pdfsError,
    error: pdfsErrorObj,
    fetchNextPage: pdfsFetchNextPage,
    hasNextPage: pdfsHasNextPage,
    isFetchingNextPage: pdfsIsFetchingNextPage,
  } = usePdfs(lang);

  const articles: NewsArticlesType[] = newsArticlesData?.pages.flat() ?? [];
  const podcasts: PodcastType[] = podcastPages?.pages.flat() ?? [];
  const pdfs: PdfType[] = pdfPages?.pages.flat() ?? [];

  // Calendar event (today or next upcoming)
  const calendarVersion = useDataVersionStore((s) => s.calendarVersion);
  const [calendarEvent, setCalendarEvent] = useState<CalendarType | null>(null);
  const [calendarEventDiff, setCalendarEventDiff] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const events = await getAllCalendarDates(lang);
        if (cancelled) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const getDiff = (dateStr: string) => {
          const [year, month, day] = dateStr.split("-").map(Number);
          const d = new Date(year, month - 1, day);
          return Math.round((d.getTime() - today.getTime()) / 86400000);
        };

        // Find today's event first, then next upcoming
        let found: CalendarType | null = null;
        let foundDiff = 0;
        let minPosDiff: number | null = null;

        for (const e of events) {
          const d = getDiff(e.gregorian_date);
          if (d > 0 && (minPosDiff === null || d < minPosDiff)) minPosDiff = d;
        }

        for (const e of events) {
          const d = getDiff(e.gregorian_date);
          if (d === 0) {
            found = e;
            foundDiff = 0;
            break;
          }
          if (minPosDiff !== null && d === minPosDiff && !found) {
            found = e;
            foundDiff = d;
          }
        }

        setCalendarEvent(found);
        setCalendarEventDiff(foundDiff);
      } catch {
        // silently fail — calendar is supplementary
      }
    })();
    return () => { cancelled = true; };
  }, [calendarVersion, lang]);
  // Bottom sheet
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const sheetBg = Colors[colorScheme].background;

  const openSheet = useCallback((type: ActiveSheet) => {
    if (!type) return;
    setActiveSheet(type);
    bottomSheetModalRef.current?.present();
  }, []);

  const closeSheet = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
    setActiveSheet(null);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    [],
  );

  const sheetTitle = useMemo(() => {
    if (activeSheet === "articles") return t("newsArticlesTitle");
    if (activeSheet === "podcasts") return t("podcastsTitle");
    if (activeSheet === "pdfs") return t("pdfsTitle");
    return "";
  }, [activeSheet, t]);

  const getPaddedData = (data: any[]) => {
    if (data.length % 2 === 1) {
      return [...data, { id: "placeholder", isPlaceholder: true }];
    }
    return data;
  };

  // Modern tile renderers
  const renderArticleTile = useCallback(
    ({ item }: { item: NewsArticlesType & { isPlaceholder?: boolean } }) => {
      if (item.isPlaceholder) {
        return <View style={{ width: previewSizes }} />;
      }

      return (
        <TouchableOpacity
          style={styles.tileWrapper}
          onPress={() => {
            if (item.is_external_link) {
              handleOpenExternalUrl(item.external_link_url || "");
            } else {
              router.push({
                pathname: "/(newsArticle)",
                params: { articleId: item.id },
              });
            }
            closeSheet();
          }}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.modernTile,
              {
                width: previewSizes,
                height: 200,
                backgroundColor: Colors[colorScheme].contrast,
                borderColor: Colors[colorScheme].border,
              },
            ]}
          >
            <View style={styles.tileContent}>
              <View style={styles.tileIconContainer}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? "rgba(74, 144, 226, 0.2)"
                          : "rgba(74, 144, 226, 0.12)",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      item.is_external_link
                        ? "link-outline"
                        : "newspaper-outline"
                    }
                    size={22}
                    color={Colors[colorScheme].tint}
                  />
                </View>
              </View>

              <View style={styles.tileTitleContainer}>
                <Text
                  numberOfLines={3}
                  style={[
                    styles.modernTileTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.title.trim()}
                </Text>
              </View>

              <View style={styles.tileFooter}>
                <View style={styles.dateContainer}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={Colors[colorScheme].icon}
                    style={styles.dateIcon}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      { color: Colors[colorScheme].icon },
                    ]}
                  >
                    {formatDate(item.created_at, lang)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [closeSheet, colorScheme, lang, previewSizes],
  );

  const renderPodcastTile = useCallback(
    ({ item }: { item: PodcastType & { isPlaceholder?: boolean } }) => {
      if (item.isPlaceholder) {
        return <View style={{ width: previewSizes }} />;
      }

      return (
        <TouchableOpacity
          style={styles.tileWrapper}
          onPress={() => {
            router.push({
              pathname: "/indexPodcast",
              params: { podcast: JSON.stringify(item) },
            });
            closeSheet();
          }}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.modernTile,
              {
                width: previewSizes,
                height: 200,
                backgroundColor: Colors[colorScheme].contrast,
                borderColor: Colors[colorScheme].border,
              },
            ]}
          >
            <View style={styles.tileContent}>
              <View style={styles.tileIconContainer}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: Colors[colorScheme].background,
                    },
                  ]}
                >
                  <Ionicons
                    name="mic-outline"
                    size={22}
                    color={colorScheme === "dark" ? "#2ea853" : "#08832d"}
                  />
                </View>
              </View>

              <View style={styles.tileTitleContainer}>
                <Text
                  numberOfLines={3}
                  style={[
                    styles.modernTileTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.title.trim()}
                </Text>
              </View>

              <View style={styles.tileFooter}>
                <View style={styles.podcastMetaContainer}>
                  <Ionicons
                    name="headset-outline"
                    size={12}
                    color={Colors[colorScheme].icon}
                    style={styles.dateIcon}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      { color: Colors[colorScheme].icon },
                    ]}
                  >
                    {t("podcast")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [closeSheet, colorScheme, t, previewSizes],
  );

  const renderPdfTile = useCallback(
    ({ item }: { item: PdfType & { isPlaceholder?: boolean } }) => {
      if (item.isPlaceholder) {
        return <View style={{ width: previewSizes }} />;
      }

      return (
        <TouchableOpacity
          style={styles.tileWrapper}
          onPress={() => {
            router.push({
              pathname: "/(pdfs)",
              params: {
                id: item.id,
                filename: item.pdf_filename,
              },
            });
            closeSheet();
          }}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.modernTile,
              {
                width: previewSizes,
                height: 200,
                backgroundColor: Colors[colorScheme].contrast,
                borderColor: Colors[colorScheme].border,
              },
            ]}
          >
            <View style={styles.tileContent}>
              <View style={styles.tileIconContainer}>
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: Colors[colorScheme].background,
                    },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={Colors[colorScheme].tint}
                  />
                </View>
              </View>

              <View style={styles.tileTitleContainer}>
                <Text
                  numberOfLines={3}
                  style={[
                    styles.modernTileTitle,
                    { color: Colors[colorScheme].text },
                  ]}
                >
                  {item.pdf_title.trim()}
                </Text>
              </View>

              <View style={styles.tileFooter}>
                <View style={styles.podcastMetaContainer}>
                  <Ionicons
                    name="document-outline"
                    size={12}
                    color={Colors[colorScheme].icon}
                    style={styles.dateIcon}
                  />
                  <Text
                    style={[
                      styles.dateText,
                      { color: Colors[colorScheme].icon },
                    ]}
                  >
                    {t("pdfsTitle")}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [closeSheet, colorScheme, previewSizes, t],
  );

  return (
    <BottomSheetModalProvider>
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme].background },
        ]}
        edges={["bottom"]}
      >
        <Animated.ScrollView
          onLayout={onLayout}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={[
            styles.scrollStyles,
            {
              backgroundColor: Colors[colorScheme].background,
              opacity: fadeAnim,
            },
          ]}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            Platform.OS !== "web" ? (
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handlePullToRefresh}
                tintColor={Colors[colorScheme].tint}
              />
            ) : undefined
          }
        >
          {/* News Articles */}
          {/* {articles.length > 0 && (
            <View style={styles.newsArticleContainer}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText
                  type="titleBiggerLessBold"
                  style={[
                    styles.titleShadow,
                    {
                      shadowColor: Colors[colorScheme].shadow,
                      lineHeight: 40,
                      marginHorizontal: 16,
                      fontSize: fontsizeHomeHeaders,
                    },
                  ]}
                >
                  {t("newsArticlesTitle")}
                </ThemedText>
                <TouchableOpacity onPress={() => openSheet("articles")}>
                  <ThemedText
                    style={{ marginRight: 15, fontSize: fontsizeHomeShowAll }}
                  >
                    {t("showAll")}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {newsArticlesIsLoading && (
                <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
              )}

              {newsArticlesIsError && (
                <View style={styles.errorContainer}>
                  <Text
                    style={[
                      styles.errorText,
                      { color: Colors[colorScheme].error },
                    ]}
                  >
                    {newsArticlesError?.message ?? t("errorLoadingData")}
                  </Text>
                  <RetryButton onPress={() => newsArticlesFetchNextPage()} />
                </View>
              )}

              {!newsArticlesIsLoading && !newsArticlesIsError && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flatListContentContainer}
                  data={articles}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        item.is_external_link
                          ? handleOpenExternalUrl(item.external_link_url || "")
                          : router.push({
                              pathname: "/(newsArticle)",
                              params: { articleId: item.id },
                            })
                      }
                    >
                      <NewsArticlePreviewCard
                        title={item.title}
                        is_external_link={item.is_external_link}
                        created_at={item.created_at}
                      />
                    </TouchableOpacity>
                  )}
                  onEndReached={() => {
                    if (
                      newsArticlesHasNextPage &&
                      !newsArticlesIsFetchingNextPage
                    ) {
                      newsArticlesFetchNextPage();
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={() =>
                    newsArticlesIsFetchingNextPage ? (
                      <LoadingIndicator size="small" />
                    ) : null
                  }
                />
              )}
            </View>
          )} */}

          {/* Aktuelles — hero card */}
          <View style={styles.newsContainer}>
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: Colors[colorScheme].background,
                },
              ]}
            >
              {/* Colored header: title + calendar */}
              <View
                style={[
                  styles.heroHeader,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#152C3E" : "#1A4731",
                    paddingTop: insets.top + 18,
                  },
                ]}
              >
                <View style={styles.heroTitleRow}>
                  <Text
                    style={[styles.heroTitle, { fontSize: fontsizeHomeHeaders }]}
                  >
                    {t("newsTitle")}
                  </Text>
                  {isAdmin && (
                    <Ionicons
                      name="add-circle-outline"
                      size={28}
                      color="rgba(255,255,255,0.75)"
                      onPress={() => router.push("/(addNews)")}
                    />
                  )}
                </View>

                {calendarEvent && (
                  <TouchableOpacity
                    style={styles.calendarBanner}
                    onPress={() =>
                      router.push(
                        "/(tabs)/knowledge/calendar/indexCalendar" as any,
                      )
                    }
                    activeOpacity={0.75}
                  >
                    {/* Left: text content */}
                    <View style={styles.calendarBannerContent}>
                      <View style={styles.calendarBannerTop}>
                        <Ionicons
                          name="moon-outline"
                          size={11}
                          color="rgba(255,255,255,0.55)"
                        />
                        <Text style={styles.calendarBannerLabel}>
                          {t("calendarTitle").toUpperCase()}
                        </Text>
                        <View style={styles.calendarBadge}>
                          <Text style={styles.calendarBadgeText}>
                            {calendarEventDiff === 0
                              ? t("legendToday")
                              : t("countdownDaysToGo", {
                                  count: calendarEventDiff,
                                })}
                          </Text>
                        </View>
                      </View>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.calendarBannerTitle}
                      >
                        {calendarEvent.title}
                      </Text>
                    </View>
                    {/* Right: chevron indicating tappable */}
                    <View style={styles.calendarChevron}>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="rgba(255,255,255,0.6)"
                      />
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              {/* Update button */}
              {showUpdateButton && (
                <TouchableOpacity
                  style={[
                    styles.updateButton,
                    {
                      backgroundColor:
                        colorScheme === "dark"
                          ? Colors.universal.secondary
                          : Colors.universal.primary,
                    },
                  ]}
                  onPress={handleRefresh}
                  activeOpacity={0.8}
                >
                  <View style={styles.updateButtonContent}>
                    <Ionicons
                      name="refresh-circle"
                      size={20}
                      color="#fff"
                      style={styles.updateButtonIcon}
                    />
                    <Text style={styles.updateButtonText}>
                      {t("newNewsAvailable") ||
                        "New items available - Tap to refresh"}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Loading */}
              {newsIsLoading && (
                <LoadingIndicator
                  style={{ marginVertical: 20 }}
                  size="large"
                />
              )}

              {/* Error */}
              {newsIsError && (
                <View style={styles.errorContainer}>
                  <Text
                    style={[
                      styles.errorText,
                      { color: Colors[colorScheme].error },
                    ]}
                  >
                    {newsError?.message ?? t("errorLoadingData")}
                  </Text>
                  <RetryButton onPress={handleRefresh} />
                </View>
              )}

              {/* Empty */}
              {!newsIsLoading && allNews.length === 0 && (
                <ThemedView style={styles.newsEmptyContainer}>
                  <ThemedText style={styles.newsEmptyText} type="subtitle">
                    {t("newsEmpty")}
                  </ThemedText>
                </ThemedView>
              )}

              {/* News scroll */}
              {!newsIsLoading && !newsIsError && allNews.length > 0 && (
                <ScrollView
                  contentContainerStyle={styles.newsContentContainer}
                  style={{ flex: 1 }}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  {allNews.map((item) => (
                    <NewsItem
                      key={item.id.toString()}
                      id={item.id}
                      language_code={item.language_code}
                      is_pinned={item.is_pinned}
                      title={item.title}
                      content={item.content}
                      created_at={item.created_at}
                      images_url={item.images_url}
                      internal_urls={item.internal_urls}
                      external_urls={item.external_urls}
                    />
                  ))}

                  {newsHasNextPage && (
                    <View style={styles.loadMoreContainer}>
                      {newsIsFetchingNextPage ? (
                        <LoadingIndicator size="small" />
                      ) : (
                        <TouchableOpacity
                          onPress={handleLoadMore}
                          style={styles.loadMoreButton}
                        >
                          <Text style={styles.loadMoreText}>
                            {t("loadMore") || "Load More"}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </ScrollView>
              )}
            </View>
          </View>
          {/* Podcasts */}
          {podcasts.length > 0 && (
            <View style={styles.podcastContainer}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText
                  type="titleBiggerLessBold"
                  style={[
                    styles.titleShadow,
                    {
                      shadowColor: Colors[colorScheme].shadow,
                      lineHeight: 40,
                      marginHorizontal: 16,
                      fontSize: fontsizeHomeHeaders,
                    },
                  ]}
                >
                  {t("podcastsTitle")}
                </ThemedText>
                <TouchableOpacity onPress={() => openSheet("podcasts")}>
                  <ThemedText
                    style={{
                      marginRight: 15,
                      fontSize: fontsizeHomeShowAll,
                      color: Colors.universal.link,
                      fontWeight: 600,
                    }}
                  >
                    {t("showAll")}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {podcastsLoading && (
                <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
              )}

              {podcastsError && (
                <View style={styles.errorContainer}>
                  <Text
                    style={[
                      styles.errorText,
                      { color: Colors[colorScheme].error },
                    ]}
                  >
                    {podcastsErrorObj?.message ?? t("errorLoadingData")}
                  </Text>
                  <RetryButton onPress={() => podcastsFetchNextPage()} />
                </View>
              )}

              {!podcastsLoading && !podcastsError && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flatListContentContainer}
                  data={podcasts}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/indexPodcast",
                          params: { podcast: JSON.stringify(item) },
                        })
                      }
                    >
                      <PodcastPreviewCard podcast={item} />
                    </TouchableOpacity>
                  )}
                  onEndReached={() => {
                    if (podcastsHasNextPage && !podcastsIsFetchingNextPage) {
                      podcastsFetchNextPage();
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={() =>
                    podcastsIsFetchingNextPage ? (
                      <LoadingIndicator size="small" />
                    ) : null
                  }
                />
              )}
            </View>
          )}

          {/* PDFs */}
          {pdfs.length > 0 && (
            <View style={styles.pdfContainer}>
              <View style={styles.sectionHeaderRow}>
                <ThemedText
                  type="titleBiggerLessBold"
                  style={[
                    styles.titleShadow,
                    {
                      shadowColor: Colors[colorScheme].shadow,
                      lineHeight: 40,
                      marginHorizontal: 16,
                      fontSize: fontsizeHomeHeaders,
                    },
                  ]}
                >
                  {t("pdfsTitle")}
                </ThemedText>
                <TouchableOpacity onPress={() => openSheet("pdfs")}>
                  <ThemedText
                    style={{
                      marginRight: 15,
                      fontSize: fontsizeHomeShowAll,
                      color: Colors.universal.link,
                      fontWeight: 600,
                    }}
                  >
                    {t("showAll")}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {pdfsLoading && (
                <LoadingIndicator style={{ marginVertical: 20 }} size="large" />
              )}

              {pdfsError && (
                <View style={styles.errorContainer}>
                  <Text
                    style={[
                      styles.errorText,
                      { color: Colors[colorScheme].error },
                    ]}
                  >
                    {pdfsErrorObj?.message ?? t("errorLoadingData")}
                  </Text>
                  <RetryButton onPress={() => pdfsFetchNextPage()} />
                </View>
              )}

              {!pdfsLoading && !pdfsError && (
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.flatListContentContainer}
                  data={pdfs}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/(pdfs)",
                          params: {
                            filename: item.pdf_filename,
                          },
                        })
                      }
                    >
                      <PdfPreviewCard pdf={item} />
                    </TouchableOpacity>
                  )}
                  onEndReached={() => {
                    if (pdfsHasNextPage && !pdfsIsFetchingNextPage) {
                      pdfsFetchNextPage();
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={() =>
                    pdfsIsFetchingNextPage ? (
                      <LoadingIndicator size="small" />
                    ) : null
                  }
                />
              )}
            </View>
          )}
        </Animated.ScrollView>

        {/* Bottom Sheet */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={["80%"]}
          enableDynamicSizing={false}
          backdropComponent={renderBackdrop}
          onDismiss={closeSheet}
          backgroundStyle={{ backgroundColor: sheetBg }}
          handleIndicatorStyle={{
            backgroundColor: Colors[colorScheme].defaultIcon,
          }}
        >
          <View style={styles.sheetHeader}>
            <ThemedText type="subtitle" style={[styles.sheetTitle]}>
              {sheetTitle} (
              {activeSheet === "articles"
                ? articles.length
                : activeSheet === "podcasts"
                  ? podcasts.length
                  : pdfs.length}
              )
            </ThemedText>

            <TouchableOpacity onPress={closeSheet}>
              <Ionicons
                name="close-circle-outline"
                size={22}
                color={Colors[colorScheme].defaultIcon}
              />
            </TouchableOpacity>
          </View>

          {activeSheet === "articles" && (
            <BottomSheetFlatList
              data={getPaddedData(articles)}
              keyExtractor={(item: NewsArticlesType) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={{
                paddingBottom: 24,
              }}
              renderItem={renderArticleTile}
              onEndReached={() => {
                if (
                  newsArticlesHasNextPage &&
                  !newsArticlesIsFetchingNextPage
                ) {
                  newsArticlesFetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                newsArticlesIsFetchingNextPage ? (
                  <View style={styles.sheetLoadingContainer}>
                    <LoadingIndicator size="small" />
                  </View>
                ) : null
              }
            />
          )}

          {activeSheet === "podcasts" && (
            <BottomSheetFlatList
              data={getPaddedData(podcasts)}
              keyExtractor={(item: PodcastType) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={{
                paddingBottom: 24,
              }}
              renderItem={renderPodcastTile}
              onEndReached={() => {
                if (podcastsHasNextPage && !podcastsIsFetchingNextPage) {
                  podcastsFetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                podcastsIsFetchingNextPage ? (
                  <View style={styles.sheetLoadingContainer}>
                    <LoadingIndicator size="small" />
                  </View>
                ) : null
              }
            />
          )}
          {activeSheet === "pdfs" && (
            <BottomSheetFlatList
              data={getPaddedData(pdfs)}
              keyExtractor={(item: PdfType) => item.id.toString()}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={{
                paddingBottom: 24,
              }}
              renderItem={renderPdfTile}
              onEndReached={() => {
                if (pdfsHasNextPage && !pdfsIsFetchingNextPage) {
                  pdfsFetchNextPage();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={() =>
                pdfsIsFetchingNextPage ? (
                  <View style={styles.sheetLoadingContainer}>
                    <LoadingIndicator size="small" />
                  </View>
                ) : null
              }
            />
          )}
        </BottomSheetModal>
      </SafeAreaView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollStyles: {},
  scrollContent: {
    gap: 40,
  },
  newsArticleContainer: {
    flex: 1,
    gap: 15,
  },
  podcastContainer: {
    flex: 1,
    gap: 15,
  },
  pdfContainer: {
    flex: 1,
    gap: 15,
  },
  heroCard: {
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  heroHeader: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 16,
  },
  heroTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTitle: {
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  calendarBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  calendarBannerContent: {
    flex: 1,
    gap: 5,
  },
  calendarChevron: {
    justifyContent: "center",
    alignItems: "center",
  },
  calendarBannerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  calendarBannerLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    flex: 1,
    color: "rgba(255,255,255,0.55)",
  },
  calendarBannerTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: "#fff",
  },
  calendarBadge: {
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  calendarBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    color: "#fff",
  },
  newsContainer: {
    flex: 1,
    gap: 15,
  
  },
  newsTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 15,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsEmptyContainer: {
    flex: 1,
    justifyContent: "center",
    marginTop: 20,
    backgroundColor: "transparent",
  },
  newsEmptyText: {
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    fontSize: 20,
  },
  flatListContentContainer: {
    gap: 15,
    marginHorizontal: 15,
  },
  newsContentContainer: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 14,
  },
  titleShadow: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 2,
  },
  updateButton: {
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 16,
  },
  updateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  updateButtonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadMoreContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  loadMoreButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: "500",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sheetTitle: {},
  sheetCloseText: {
    fontSize: 14,
    fontWeight: "500",
  },
  columnWrapper: {
    marginBottom: 12,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  tileWrapper: {},
  modernTile: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tileGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tileContent: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  tileIconContainer: {
    marginBottom: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  tileTitleContainer: {
    flex: 1,
    justifyContent: "center",
    marginVertical: 8,
  },
  modernTileTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  tileFooter: {
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    marginRight: 4,
  },
  dateText: {
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  podcastMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sheetLoadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
