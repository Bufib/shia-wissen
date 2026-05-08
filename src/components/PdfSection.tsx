import RetryButton from "@/components/RetryButton";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { PdfType } from "@/constants/Types";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { router } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "./ThemedView";

type PdfSectionProps = {
  pdfs: PdfType[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
};

export default function PdfSection({
  pdfs,
  isLoading,
  isError,
  errorMessage,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: PdfSectionProps) {
  const colorScheme = useColorScheme() ?? "light";
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View style={styles.section}>
        <PdfSectionHeader />

        <LoadingIndicator style={styles.sectionLoader} size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.section}>
        <PdfSectionHeader />

        <View style={styles.errorContainer}>
          <Text
            style={[styles.errorText, { color: Colors[colorScheme].error }]}
          >
            {errorMessage ?? t("errorLoadingData")}
          </Text>

          <RetryButton onPress={fetchNextPage} />
        </View>
      </View>
    );
  }

  if (pdfs.length === 0) {
    return null;
  }

  return (
    <ThemedView
      style={[
        styles.section,
        {
          paddingTop: insets.top,

          paddingBottom: insets.bottom,
        },
      ]}
    >
      <FlatList
        data={pdfs}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pdfListContent}
        columnWrapperStyle={styles.pdfRow}
        style={{ backgroundColor: Colors[colorScheme].background }}
        ListHeaderComponent={<PdfSectionHeader />}
        ListFooterComponent={
          isFetchingNextPage ? (
            <LoadingIndicator style={styles.footerLoader} size="small" />
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pdfItem}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "/(pdfs)",
                params: { filename: item.pdf_filename },
              })
            }
          >
            <PdfCard pdf={item} />
          </TouchableOpacity>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
      />
    </ThemedView>
  );
}

function PdfSectionHeader() {
  const { t } = useTranslation();

  return (
    <View style={styles.sectionHeaderRow}>
      <ThemedText style={styles.sectionLabel}>
        {t("pdfsTitle").toUpperCase()}
      </ThemedText>

      <Pressable
        onPressIn={() => router.push("/(tabs)/home/allPdfs")}
        hitSlop={styles.showAllHitSlop}
        style={({ pressed }) => pressed && { opacity: 0.6 }}
      >
        <Text style={[styles.showAllText, { color: Colors.universal.link }]}>
          {t("showAll")}
        </Text>
      </Pressable>
    </View>
  );
}

function PdfCard({ pdf }: { pdf: PdfType }) {
  const colorScheme = useColorScheme() ?? "light";

  const pdfData = pdf as PdfType & {
    title?: string;
    name?: string;
    pdf_title?: string;
    description?: string | null;
  };

  const title =
    pdfData.title ?? pdfData.name ?? pdfData.pdf_title ?? pdf.pdf_filename;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: Colors[colorScheme].contrast,
          borderColor: Colors[colorScheme].border,
        },
      ]}
    >
      <View style={styles.pdfIconBox}>
        <Text style={styles.pdfIconText}>PDF</Text>
      </View>

      <ThemedText numberOfLines={2} style={styles.cardTitle}>
        {title}
      </ThemedText>

      {pdfData.description ? (
        <ThemedText numberOfLines={2} style={styles.cardDescription}>
          {pdfData.description}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 12,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
    paddingHorizontal: 20,
  },
  showAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  showAllHitSlop: {
    top: 8,
    bottom: 8,
    left: 8,
    right: 8,
  },
  sectionLoader: {
    marginVertical: 24,
  },
  pdfListContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  pdfRow: {
    gap: 12,
    marginBottom: 12,
  },
  pdfItem: {
    flex: 1,
  },
  card: {
    width: "100%",
    minHeight: 150,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  pdfIconBox: {
    width: 48,
    height: 58,
    borderRadius: 10,
    backgroundColor: Colors.universal.link,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  pdfIconText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  cardDescription: {
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.7,
    marginTop: 6,
  },
  footerLoader: {
    marginTop: 16,
    marginBottom: 16,
  },
  errorContainer: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 16,
  },
  errorText: {
    fontSize: 16,
  },
});
