// src/components/QuranProgressBadges.tsx
import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { ThemedText } from "./ThemedText";
import {
  useReadingProgressQuran,
  useJuzPercent,
  usePagePercent,
} from "../../stores/useReadingProgressQuran";
import { getJuzVerses, getPageVerses } from "../../db/queries/quran";
import { seedJuzIndex, seedPageIndex } from "../../utils/quranIndex";

const CircleProgressBadge: React.FC<{ percent: number; size?: number }> = ({
  percent,
  size = 60,
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const ringColor =
    clamped >= 100 ? "#2ECC71" : clamped > 0 ? "#4A90E2" : "#C9CDD3";

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        width: size,
        height: size,
        borderWidth: 4,
        borderColor: ringColor,
        borderRadius: 999,
      }}
    >
      <ThemedText style={{ fontWeight: "700" }}>{clamped}%</ThemedText>
    </View>
  );
};

export const SuraProgressBadge: React.FC<{
  suraId: number;
  total?: number;
}> = ({ suraId, total }) => {
  const progress = useReadingProgressQuran((s) => s.progressBySura[suraId]);
  const totalVerses =
    progress?.totalVerses && progress.totalVerses > 0
      ? progress.totalVerses
      : total ?? 0;

  const percent =
    totalVerses > 0 && (progress?.lastVerseNumber ?? 0) > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(((progress?.lastVerseNumber ?? 0) / totalVerses) * 100)
          )
        )
      : 0;

  return <CircleProgressBadge percent={percent} />;
};

export const JuzProgressBadge: React.FC<{ juz: number }> = ({ juz }) => {
  const percent = useJuzPercent(juz);
  const seeded = useRef(false);
  const setTotalVersesForJuz = useReadingProgressQuran(
    (s) => s.setTotalVersesForJuz
  );

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    (async () => {
      try {
        const v = (await getJuzVerses("ar", juz)) ?? [];
        await seedJuzIndex(juz, v);
        setTotalVersesForJuz(juz, v.length);
      } catch {
        // ignore
      }
    })();
  }, [juz, setTotalVersesForJuz]);

  return <CircleProgressBadge percent={percent} />;
};

export const PageProgressBadge: React.FC<{ page: number }> = ({ page }) => {
  const percent = usePagePercent(page);
  const seeded = useRef(false);
  const setTotalVersesForPage = useReadingProgressQuran(
    (s) => s.setTotalVersesForPage
  );

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    (async () => {
      try {
        const v = (await getPageVerses("ar", page)) ?? [];
        await seedPageIndex(page, v);
        setTotalVersesForPage(page, v.length);
      } catch {
        // ignore
      }
    })();
  }, [page, setTotalVersesForPage]);

  return <CircleProgressBadge percent={percent} />;
};
