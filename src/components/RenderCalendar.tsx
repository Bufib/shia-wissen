// components/RenderCalendar.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  memo,
} from "react";
import {
  StyleSheet,
  useColorScheme,
  View,
  SectionList,
  TouchableOpacity,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import CalendarLegend from "./CalendarLegend";
import CalendarEventCard from "./CalendarEventCard";
import { useLanguage } from "../../contexts/LanguageContext";
import { CalendarSectionType, CalendarType } from "@/constants/Types";
import { useTranslation } from "react-i18next";
import {
  getAllCalendarDates,
  getCalendarLegendColorById,
} from "../../db/queries/calendar";
import { Colors } from "@/constants/Colors";
import { LoadingIndicator } from "./LoadingIndicator";
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { Entypo } from "@expo/vector-icons";

// Memoized section header component
const SectionHeader = memo(function SectionHeader({
  title,
  isCollapsed,
  onToggle,
  colorScheme,
}: {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  colorScheme: any;
}) {
  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.sectionHeaderRow}>
        <Entypo
          name={isCollapsed ? "chevron-right" : "chevron-down"}
          size={26}
          color={Colors[colorScheme].text}
          style={styles.chevronIcon}
        />
        <View
          style={[
            styles.sectionDivider,
            { backgroundColor: Colors[colorScheme].devider },
          ]}
        />
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        <View
          style={[
            styles.sectionDivider,
            { backgroundColor: Colors[colorScheme].devider },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
});

// Memoized list header
const ListHeader = memo(function ListHeader() {
  return (
    <View style={styles.legendWrap}>
      <CalendarLegend />
    </View>
  );
});

// Memoized empty component
const EmptyComponent = memo(function EmptyComponent({
  t,
}: {
  t: (key: string) => string;
}) {
  return (
    <View style={styles.emptyWrap}>
      <ThemedText style={styles.emptyText}>{t("noData")}</ThemedText>
    </View>
  );
});

const RenderCalendar: React.FC = () => {
  const colorScheme = useColorScheme() || "light";
  const { lang } = useLanguage();
  const { t } = useTranslation();

  // ✅ Refs for auto-scroll
  const sectionListRef =
    useRef<SectionList<CalendarType, CalendarSectionType>>(null);
  const hasScrolledRef = useRef(false);
  const scrollAttemptsRef = useRef(0);

  const [events, setEvents] = useState<CalendarType[]>([]);
  const [legendColorMap, setLegendColorMap] = useState<Record<number, string>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<CalendarSectionType[]>([]);
  const [nextUpcomingDiff, setNextUpcomingDiff] = useState<number | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

  const calendarVersion = useDataVersionStore((s) => s.calendarVersion);

  // Fetch calendar data
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [ev, colorMap] = await Promise.all([
          getAllCalendarDates(lang),
          getCalendarLegendColorById(lang),
        ]);
        if (!cancelled) {
          setEvents(ev ?? []);
          setLegendColorMap(colorMap);
        }
      } catch (e) {
        if (!cancelled) {
          setEvents([]);
          setLegendColorMap({});
        }
        console.warn("Calendar load failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [calendarVersion, lang]);

  // ✅ Original date logic preserved exactly
  const startOfDay = useCallback((d: Date) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
  }, []);

  const parseItemDate = useCallback((s: string) => {
    const [year, month, day] = s.split("-").map(Number);
    return new Date(year, month - 1, day);
  }, []);

  // ✅ Fresh todayStart on each relevant render
  const todayStart = useMemo(() => startOfDay(new Date()), [startOfDay]);

  const dayDiffFromToday = useCallback(
    (dateStr: string) =>
      Math.round(
        (parseItemDate(dateStr).getTime() - todayStart.getTime()) / 86400000,
      ),
    [parseItemDate, todayStart],
  );

  // Calculate the next upcoming event
  useEffect(() => {
    let minPos: number | null = null;
    for (const e of events) {
      const d = dayDiffFromToday(e.gregorian_date);
      if (d > 0 && (minPos === null || d < minPos)) minPos = d;
    }
    setNextUpcomingDiff(minPos);
  }, [events, dayDiffFromToday]);

  // Group events by month/year and auto-collapse non-current months
  useEffect(() => {
    const now = new Date();
    const currentMonthIndex = now.getFullYear() * 12 + now.getMonth();

    const map = new Map<string, { data: CalendarType[]; monthIndex: number }>();

    for (const item of events) {
      const d = new Date(item.gregorian_date);
      const monthIndex = d.getFullYear() * 12 + d.getMonth();
      const key = d.toLocaleDateString(lang, {
        month: "long",
        year: "numeric",
      });

      const existing = map.get(key);
      if (existing) {
        existing.data.push(item);
      } else {
        map.set(key, { data: [item], monthIndex });
      }
    }

    const initialCollapsed = new Set<string>();

    const grouped: CalendarSectionType[] = Array.from(map.entries()).map(
      ([title, { data, monthIndex }]) => {
        if (monthIndex !== currentMonthIndex) {
          initialCollapsed.add(title);
        }
        return {
          title,
          data: data.sort((a, b) =>
            a.gregorian_date < b.gregorian_date ? -1 : 1,
          ),
        };
      },
    );

    setSections(grouped);

    setCollapsedSections((prev) => {
      if (prev.size === 0) {
        return initialCollapsed;
      }
      const merged = new Set(prev);
      initialCollapsed.forEach((title) => merged.add(title));
      return merged;
    });
  }, [events, lang]);

  // ✅ Find target event (today or next upcoming)
  const findTargetEvent = useCallback((): {
    sectionIndex: number;
    itemIndex: number;
    sectionTitle: string;
  } | null => {
    if (!sections.length) return null;

    // First pass: find today's event
    for (let si = 0; si < sections.length; si++) {
      const section = sections[si];
      for (let ii = 0; ii < section.data.length; ii++) {
        const item = section.data[ii];
        const diff = dayDiffFromToday(item.gregorian_date);
        if (diff === 0) {
          return {
            sectionIndex: si,
            itemIndex: ii,
            sectionTitle: section.title,
          };
        }
      }
    }

    // Second pass: find next upcoming event (first future event)
    for (let si = 0; si < sections.length; si++) {
      const section = sections[si];
      for (let ii = 0; ii < section.data.length; ii++) {
        const item = section.data[ii];
        const diff = dayDiffFromToday(item.gregorian_date);
        if (diff > 0) {
          return {
            sectionIndex: si,
            itemIndex: ii,
            sectionTitle: section.title,
          };
        }
      }
    }

    // Fallback: last event in last section (all past)
    const lastSI = sections.length - 1;
    const lastSection = sections[lastSI];
    if (lastSection && lastSection.data.length > 0) {
      return {
        sectionIndex: lastSI,
        itemIndex: lastSection.data.length - 1,
        sectionTitle: lastSection.title,
      };
    }

    return null;
  }, [sections, dayDiffFromToday]);

  // ✅ Scroll to target
  const scrollToTarget = useCallback(
    (target: ReturnType<typeof findTargetEvent>) => {
      if (!target || !sectionListRef.current) return;

      // Expand target section if collapsed
      setCollapsedSections((prev) => {
        if (prev.has(target.sectionTitle)) {
          const newSet = new Set(prev);
          newSet.delete(target.sectionTitle);
          return newSet;
        }
        return prev;
      });

      // Delay to allow section expansion to render
      setTimeout(() => {
        try {
          sectionListRef.current?.scrollToLocation({
            sectionIndex: target.sectionIndex,
            itemIndex: target.itemIndex,
            viewPosition: 0.15,
            animated: true,
          });
        } catch (error) {
          console.warn("Scroll attempt failed:", error);
        }
      }, 250);
    },
    [],
  );

  // ✅ Auto-scroll on initial load
  useEffect(() => {
    if (loading || !sections.length || hasScrolledRef.current) return;

    const target = findTargetEvent();
    if (!target) return;

    // Delay to ensure list is fully rendered
    const timer = setTimeout(() => {
      scrollToTarget(target);
      hasScrolledRef.current = true;
    }, 400);

    return () => clearTimeout(timer);
  }, [loading, sections, findTargetEvent, scrollToTarget]);

  // ✅ Reset scroll flag when data changes
  useEffect(() => {
    hasScrolledRef.current = false;
    scrollAttemptsRef.current = 0;
  }, [calendarVersion, lang]);

  // ✅ Handle scroll failures (for variable height items)
  const handleScrollToIndexFailed = useCallback(
    (info: {
      index: number;
      highestMeasuredFrameIndex: number;
      averageItemLength: number;
    }) => {
      scrollAttemptsRef.current += 1;

      // Limit retry attempts
      if (scrollAttemptsRef.current > 5) {
        console.warn("Max scroll attempts reached");
        return;
      }

      const target = findTargetEvent();
      if (!target) return;

      const waitTime = 100 * scrollAttemptsRef.current;

      setTimeout(() => {
        // First scroll to highest measured position
        try {
          sectionListRef.current?.scrollToLocation({
            sectionIndex: target.sectionIndex,
            itemIndex: Math.min(
              target.itemIndex,
              info.highestMeasuredFrameIndex,
            ),
            viewPosition: 0,
            animated: false,
          });
        } catch {}

        // Then retry actual target
        setTimeout(() => {
          try {
            sectionListRef.current?.scrollToLocation({
              sectionIndex: target.sectionIndex,
              itemIndex: target.itemIndex,
              viewPosition: 0.15,
              animated: true,
            });
          } catch {}
        }, 150);
      }, waitTime);
    },
    [findTargetEvent],
  );

  // Toggle section collapse
  const toggleSection = useCallback((sectionTitle: string) => {
    setCollapsedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionTitle)) {
        newSet.delete(sectionTitle);
      } else {
        newSet.add(sectionTitle);
      }
      return newSet;
    });
  }, []);

  // ✅ Memoized section header renderer
  const renderSectionHeader = useCallback(
    ({ section }: { section: CalendarSectionType }) => {
      const isCollapsed = collapsedSections.has(section.title);

      return (
        <SectionHeader
          title={section.title}
          isCollapsed={isCollapsed}
          onToggle={() => toggleSection(section.title)}
          colorScheme={colorScheme}
        />
      );
    },
    [collapsedSections, colorScheme, toggleSection],
  );

  // ✅ Memoized item renderer
  const renderItem = useCallback(
    ({
      item,
      section,
    }: {
      item: CalendarType;
      section: CalendarSectionType;
    }) => {
      // Don't render if section is collapsed
      if (collapsedSections.has(section.title)) {
        return null;
      }

      const badgeColor = legendColorMap[item.legend_type] ?? "#999";
      const diff = dayDiffFromToday(item.gregorian_date);
      const isNext = nextUpcomingDiff !== null && diff === nextUpcomingDiff;

      return (
        <CalendarEventCard
          item={item}
          badgeColor={badgeColor}
          diff={diff}
          isNext={isNext}
          lang={lang}
          t={t}
        />
      );
    },
    [
      collapsedSections,
      legendColorMap,
      dayDiffFromToday,
      nextUpcomingDiff,
      lang,
      t,
    ],
  );

  // ✅ Stable key extractor
  const keyExtractor = useCallback((item: CalendarType) => String(item.id), []);

  // ✅ Memoized empty component
  const listEmptyComponent = useMemo(() => <EmptyComponent t={t} />, [t]);

  // ✅ Memoized header component
  const listHeaderComponent = useMemo(() => <ListHeader />, []);

  // Loading state
  if (loading) {
    return (
      <ThemedView style={styles.loadingWrap}>
        <LoadingIndicator size="large" />
        <ThemedText style={styles.loadingText}>{t("loading")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SectionList<CalendarType, CalendarSectionType>
      ref={sectionListRef}
      sections={sections}
      keyExtractor={keyExtractor}
      stickySectionHeadersEnabled={false}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={listHeaderComponent}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={listEmptyComponent}
      onScrollToIndexFailed={handleScrollToIndexFailed}
      // ✅ Performance optimizations
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
    />
  );
};

export default RenderCalendar;

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  legendWrap: {
    paddingTop: 20,
    paddingBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 12,
  },
  chevronIcon: {
    marginRight: 8,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    opacity: 0.7,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.6,
    fontSize: 14,
  },
  emptyWrap: {
    paddingTop: 80,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    fontStyle: "italic",
    opacity: 0.5,
  },
});
