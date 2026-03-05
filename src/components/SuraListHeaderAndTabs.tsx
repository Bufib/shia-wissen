// components/SuraListHeaderAndTabs.tsx

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { EvilIcons } from "@expo/vector-icons";

import { ThemedText } from "./ThemedText";
import { LoadingIndicator } from "./LoadingIndicator";
import { Colors } from "@/constants/Colors";
import type { SuraRowType } from "@/constants/Types";

const { width: screenWidth } = Dimensions.get("window");

export type QuranViewMode = "sura" | "juz" | "page";

type TFunc = (key: string) => string;


export const LastReadHeader: React.FC<{
  colorScheme: "light" | "dark";
  lastSuraRow: SuraRowType | null;
  lastSuraTitle: string;
  t: TFunc;
  onPressLastRead?: (sura: SuraRowType) => void;
}> = ({ colorScheme, lastSuraRow, lastSuraTitle, t, onPressLastRead }) => {
  const handlePress = () => {
    if (lastSuraRow && onPressLastRead) {
      onPressLastRead(lastSuraRow);
    }
  };

  return (
    <TouchableOpacity
      style={styles.headerCard}
      activeOpacity={lastSuraRow ? 0.85 : 1}
      onPress={handlePress}
    >
      <LinearGradient
        colors={
          colorScheme === "dark"
            ? ["#2a3142", "#34495e"]
            : ["#4A90E2", "#6BA3E5"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTextSection}>
            <Text style={styles.lastReadLabel}>
              {t("lastRead").toUpperCase()}
            </Text>
            <Text
              style={styles.lastReadSura}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {lastSuraTitle}
            </Text>
            {lastSuraRow && (
              <View style={styles.lastReadMeta}>
                <Text style={styles.lastReadMetaText}>
                  {t("ayatCount")}: {lastSuraRow.nbAyat}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.headerImageSection}>
            <Image
              source={require("@/assets/images/quranImage2.png")}
              style={styles.headerImage}
              contentFit="contain"
            />
            <View className="imageOverlay" style={styles.imageOverlay} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};


export const Tabs: React.FC<{
  t: TFunc;
  pageCount: number;
  colorScheme: "light" | "dark";
  slideAnim: Animated.Value;
  viewMode: QuranViewMode;
  setViewMode: (m: QuranViewMode) => void;
  onClearSura: () => void;
  onClearJuz: () => void;
  onClearPage: () => void;
  isChangingBookmark: boolean;
}> = ({
  t,
  pageCount,
  colorScheme,
  slideAnim,
  viewMode,
  setViewMode,
  onClearSura,
  onClearJuz,
  onClearPage,
  isChangingBookmark,
}) => {
  return (
    <View style={styles.tabContainer}>
      <View
        style={[
          styles.tabBackground,
          { backgroundColor: colorScheme === "dark" ? "#34495e" : "#F0F8FF" },
        ]}
      >
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              backgroundColor: colorScheme === "dark" ? "#4A90E2" : "#ffffff",
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2],
                    outputRange: [
                      4,
                      4 + (screenWidth - 32) / 3,
                      4 + (2 * (screenWidth - 32)) / 3,
                    ],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        />

        {/* Sura tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setViewMode("sura")}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              styles.tabText,
              viewMode === "sura" && styles.tabTextActive,
            ]}
          >
            {t("sura")} (114)
          </ThemedText>
          {viewMode === "sura" &&
            (isChangingBookmark ? (
              <LoadingIndicator
                size="small"
                style={[styles.tabButton, { right: 0 }]}
              />
            ) : (
              <EvilIcons
                name="redo"
                size={33}
                style={[styles.tabButton, { right: 0 }]}
                color={Colors[colorScheme].error}
                onPress={(e) => {
                  e.stopPropagation();
                  onClearSura();
                }}
              />
            ))}
        </TouchableOpacity>

        {/* Juz tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setViewMode("juz")}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[styles.tabText, viewMode === "juz" && styles.tabTextActive]}
          >
            {t("juz")} (30)
          </ThemedText>
          {viewMode === "juz" &&
            (isChangingBookmark ? (
              <LoadingIndicator
                size="small"
                style={[styles.tabButton, { right: 0 }]}
              />
            ) : (
              <EvilIcons
                name="redo"
                size={33}
                style={[styles.tabButton, { right: 0 }]}
                color={Colors[colorScheme].error}
                onPress={(e) => {
                  e.stopPropagation();
                  onClearJuz();
                }}
              />
            ))}
        </TouchableOpacity>

        {/* Page tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setViewMode("page")}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              styles.tabText,
              viewMode === "page" && styles.tabTextActive,
            ]}
          >
            {t("page")} ({pageCount})
          </ThemedText>
          {viewMode === "page" &&
            (isChangingBookmark ? (
              <LoadingIndicator
                size="small"
                style={[styles.tabButton, { right: 0 }]}
              />
            ) : (
              <EvilIcons
                name="redo"
                size={33}
                style={[styles.tabButton, { right: 0 }]}
                color={Colors[colorScheme].error}
                onPress={(e) => {
                  e.stopPropagation();
                  onClearPage();
                }}
              />
            ))}
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ------------------------------ Styles ---------------------------- */

const styles = StyleSheet.create({
  /* Header */

  headerCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 24,
    overflow: "hidden",
  },
  headerGradient: {
    borderRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    padding: 24,
    minHeight: 140,
  },
  headerTextSection: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 16,
  },
  lastReadLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  lastReadSura: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
    lineHeight: 30,
  },
  lastReadMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastReadMetaText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  headerImageSection: {
    width: 120,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  headerImage: {
    width: 100,
    height: 100,
    opacity: 0.9,
  },
  imageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 50,
  },

  /* Tabs */

  tabContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tabBackground: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 4,
    position: "relative",
    borderWidth: 0.5,
  },
  tabIndicator: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: (screenWidth - 32) / 3 - 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    position: "relative",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.6,
  },
  tabTextActive: {
    opacity: 1,
    fontWeight: "700",
  },
  tabButton: {
    position: "absolute",
    top: -10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
});

export default {
  LastReadHeader,
  Tabs,
};
