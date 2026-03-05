import { StyleSheet, useColorScheme, View, ScrollView } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "./ThemedText";
import { useTranslation } from "react-i18next";
import { ThemedView } from "./ThemedView";
import { LinearGradient } from "expo-linear-gradient";
import HeaderLeftBackButton from "./HeaderLeftBackButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusBar } from "expo-status-bar";
import handleOpenExternalUrl from "@/utils/handleOpenExternalUrl";

const RenderCard = () => {
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { rtl } = useLanguage();

  const InfoSection = ({
    title,
    children,
    color,
  }: {
    title: string;
    children: any;
    color: any;
  }) => (
    <View
      style={[
        styles.section,
        { backgroundColor: Colors[colorScheme].contrast },
      ]}
    >
      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor: color + "15",
            borderColor: Colors[colorScheme].border,
            flexDirection: rtl ? "row-reverse" : "row",
          },
        ]}
      >
        <ThemedText
          style={[
            styles.sectionTitle,
            { color, textAlign: rtl ? "right" : "left" },
          ]}
        >
          {title}
        </ThemedText>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const BulletPoint = ({ children }: { children: any }) => (
    <View
      style={[
        styles.bulletContainer,
        { flexDirection: rtl ? "row-reverse" : "row" },
      ]}
    >
      <View
        style={[
          styles.bullet,
          { backgroundColor: Colors[colorScheme].text },
          rtl
            ? { marginLeft: 12, marginRight: 0 }
            : { marginRight: 12, marginLeft: 0 },
        ]}
      />
      <ThemedText
        style={[styles.bulletText, { textAlign: rtl ? "right" : "left" }]}
      >
        {children}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container]}>
      <StatusBar style="light" />
      <ScrollView
        style={[
          styles.scrollView,
          { backgroundColor: Colors[colorScheme].background },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        alwaysBounceVertical={false}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={["#2C5F2D", "#1a3a1b", "#0d1f0e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroHeader}
        >
          <View style={[styles.heroContent, { paddingTop: insets.top }]}>
            <HeaderLeftBackButton
              style={{
                alignSelf: "flex-start",
                marginLeft: 10,
              }}
            />

            <View style={styles.ornamentTop}>
              <View style={styles.ornamentDiamond} />
              <View
                style={[styles.ornamentDiamond, styles.ornamentDiamondMiddle]}
              />
              <View style={styles.ornamentDiamond} />
            </View>
            <ThemedText type="title" style={styles.heroTitle}>
              {t("ahlulbayt.muhammad")}
            </ThemedText>

            <View style={styles.ornamentBottom}>
              <View style={styles.ornamentLine} />
              <View style={styles.ornamentCircle} />
              <View style={styles.ornamentLine} />
            </View>
          </View>
        </LinearGradient>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Life Dates */}
          <InfoSection title={t("sections.life")} color="#27AE60">
            <BulletPoint>{t("content.born")}</BulletPoint>
            <BulletPoint>{t("content.died")}</BulletPoint>
            <BulletPoint>{t("content.age")}</BulletPoint>
          </InfoSection>

          {/* Status & Lineage */}
          <InfoSection title={t("sections.status")} color="#9B59B6">
            <BulletPoint>{t("content.seal")}</BulletPoint>
            <BulletPoint>{t("content.lineage")}</BulletPoint>
            <BulletPoint>{t("content.alamin")}</BulletPoint>
          </InfoSection>

          {/* Family */}
          <InfoSection title={t("sections.family")} color="#E67E22">
            <BulletPoint>{t("content.khadija")}</BulletPoint>
            <BulletPoint>{t("content.ali")}</BulletPoint>
          </InfoSection>

          {/* Mission & Revelation */}
          <InfoSection title={t("sections.revelation")} color="#27AE60">
            <BulletPoint>{t("content.hira")}</BulletPoint>
            <BulletPoint>{t("content.mission")}</BulletPoint>
          </InfoSection>

          {/* Migration & Victory */}
          <InfoSection title={t("sections.migration")} color="#3498DB">
            <BulletPoint>{t("content.persecution")}</BulletPoint>
            <BulletPoint>{t("content.return")}</BulletPoint>
            <BulletPoint>{t("content.kaaba")}</BulletPoint>
          </InfoSection>

          {/* Miracles */}
          <InfoSection title={t("sections.miracles")} color="#F39C12">
            <BulletPoint>{t("content.quran")}</BulletPoint>
          </InfoSection>

          {/* Honorary Titles */}
          <View style={styles.titlesSection}>
            <LinearGradient
              colors={
                colorScheme === "dark"
                  ? ["#2874A6", "#1B4F72", "#154360"]
                  : ["#3498DB", "#2E86C1", "#2874A6"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.titlesGradient}
            >
              <ThemedText style={styles.titlesHeader}>
                {t("sections.titles")}
              </ThemedText>
              <View style={styles.titlesContent}>
                <View style={styles.titleBadge}>
                  <ThemedText style={styles.titleBadgeText}>
                    {t("titles.mustafa")}
                  </ThemedText>
                </View>
                <View style={styles.titleBadge}>
                  <ThemedText style={styles.titleBadgeText}>
                    {t("titles.mercy")}
                  </ThemedText>
                </View>
                <View style={styles.titleBadge}>
                  <ThemedText style={styles.titleBadgeText}>
                    {t("titles.perfect")} {"\n"} ({t("titles.perfectDesc")})
                  </ThemedText>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
        <View style={styles.sourceContainer}>
          <ThemedText style={styles.source}> {t("source")}</ThemedText>
          <ThemedText
            style={[styles.source, { color: Colors.universal.link, marginLeft: 5 }]}
            onPress={() =>
              handleOpenExternalUrl(
                "http://www.eslam.de/begriffe/m/muhammad.htm"
              )
            }
          >
            http://www.eslam.de/begriffe/m/muhammad.htm
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
};

export default RenderCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
    gap: 30,
  },
  heroHeader: {
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  heroContent: {
    alignItems: "center",
  },
  ornamentTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ornamentDiamond: {
    width: 8,
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    transform: [{ rotate: "45deg" }],
  },
  ornamentDiamondMiddle: {
    width: 12,
    height: 12,
    marginHorizontal: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 1,
    paddingHorizontal: 5,
  },
  heroSubtitle: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
  },
  heroSubtitleText: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  ornamentBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  ornamentLine: {
    width: 40,
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  ornamentCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginHorizontal: 12,
  },
  contentCard: {
    marginTop: -16,
    paddingHorizontal: 16,
  },
  section: {
    backgroundColor: "transparent",
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
  },
  sectionHeader: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 0.3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(128, 128, 128, 0.05)",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  bulletContainer: {
    marginBottom: 12,
    paddingRight: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    letterSpacing: 0.2,
  },
  titlesSection: {
    marginTop: 8,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  titlesGradient: {
    padding: 24,
  },
  titlesHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: 1.5,
  },
  titlesContent: {
    alignItems: "center",
  },
  titleBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  titleBadgeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  titleSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 4,
  },
  sourceContainer: {
    flex: 1,
    marginHorizontal: 10,
  },

  source: {},
});
