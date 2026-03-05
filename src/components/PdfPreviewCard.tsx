// src/components/PdfPreviewCard.tsx
import type { PdfType } from "@/constants/Types";
import { useLanguage } from "../../contexts/LanguageContext";
import { useGradient } from "../../hooks/useGradient";
import { formatDate } from "../../utils/formatDate";
import { Entypo } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import React, { FC } from "react";
import { StyleSheet, Text, View } from "react-native";

export type PdfProps = {
  pdf: PdfType;
};

const PdfPreviewCard: FC<PdfProps> = ({ pdf }) => {
  const { gradientColors } = useGradient();
  const { rtl, lang } = useLanguage();
  const formattedDate = formatDate(pdf.created_at);

  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.cardWrapper}
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Document icon / badge */}

        <View style={styles.vinylRecord}>
            {pdf.isBook ? (
              <Entypo
                name="open-book"
                size={20}
                color="rgba(255, 255, 255, 0.8)"
              />
            ) : (
              <Feather
                name="file-text"
                size={20}
                color="rgba(255, 255, 255, 0.8)"
              />
            )}
        </View>

        {/* Overlay */}
        <View style={styles.overlay} />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                { textAlign: lang === "ar" ? "right" : "left" },
              ]}
              numberOfLines={3}
              ellipsizeMode="tail"
            >
              {pdf.pdf_title.trim()}
            </Text>
          </View>

          <View style={styles.footer}>
            <Text
              style={[styles.createdAt, { textAlign: rtl ? "left" : "right" }]}
            >
              {formattedDate}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default PdfPreviewCard;

const styles = StyleSheet.create({
  container: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    overflow: "visible",
  },
  cardWrapper: {
    height: 280,
    width: 220,
    borderRadius: 32,
    position: "relative",
    overflow: "hidden",
  },

  // reuse "vinyl" styles as a generic badge
  vinylRecord: {
    top: 10,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
    zIndex: 1,
  },
  vinylCenter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    zIndex: 2,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
    zIndex: 3,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 28,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  footer: {
    flexDirection: "column",
    gap: 5,
  },
  openSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  openButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    padding: 12,
  },
  openText: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
    letterSpacing: 1.2,
    marginLeft: 12,
  },
  createdAt: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.8)",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
