// // src/components/PodcastPreviewCard.tsx
// import { StyleSheet, Text } from "react-native";
// import React from "react";
// import { LinearGradient } from "expo-linear-gradient";
// import { useGradient } from "../hooks/useGradient";
// import { PodcastType } from "@/constants/Types";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { PodcastProps } from "@/constants/Types";
// import { formatDate } from "@/utils/formatDate";

// export const PodcastPreviewCard: React.FC<PodcastProps> = ({ podcast }) => {
//   const { gradientColors } = useGradient();
//   const { language, isArabic } = useLanguage();
//   const formatedDate = formatDate(podcast.created_at);

//   return (
//     <LinearGradient
//       style={styles.container}
//       colors={gradientColors}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//     >
//       <Text
//         style={[
//           styles.title,
//           { textAlign: language === "ar" ? "right" : "left" },
//         ]}
//         numberOfLines={2}
//         ellipsizeMode="tail"
//       >
//         {podcast.title}
//       </Text>
//       <Text
//         style={[styles.createdAt, { textAlign: isArabic() ? "left" : "right" }]}
//         numberOfLines={2}
//         ellipsizeMode="tail"
//       >
//         {formatedDate}
//       </Text>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     justifyContent: "space-between",
//     gap: 20,
//     height: 250,
//     width: 200,
//     padding: 15,
//     borderWidth: 1,
//     borderRadius: 15,
//   },
//   title: {
//     fontSize: 20,
//   },
//   createdAt: {},
// });

import type { PodcastProps } from "@/constants/Types";
import { useLanguage } from "../../contexts/LanguageContext";
import { useGradient } from "../../hooks/useGradient";
import { formatDate } from "../../utils/formatDate";
import Feather from "@expo/vector-icons/Feather";
import { LinearGradient } from "expo-linear-gradient";
import React, { FC } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";

const PodcastPreviewCard: FC<PodcastProps> = ({ podcast }) => {
  const { gradientColors } = useGradient();
  const { rtl, lang } = useLanguage();
  const formattedDate = formatDate(podcast.created_at);
  const { t } = useTranslation();
  // const soundBars = useMemo(
  //   () =>
  //     Array.from({ length: 8 }).map(() => ({
  //       height: Math.random() * 20 + 10,
  //       opacity: 0.1 + Math.random() * 0.1,
  //     })),
  //   []
  // );

  return (
    <View style={styles.container}>
      <LinearGradient
        style={styles.cardWrapper}
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Vinyl record inspired circle */}
        <View style={styles.vinylRecord}>
            <Feather name="mic" size={20} color="rgba(255, 255, 255, 0.8)" />
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
              {podcast.title}
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.playSection}>
              <View style={styles.playButton}>
                <Feather name="play" size={14} color="#FFFFFF" />
              </View>
              <Text style={styles.playText}>{t("listen")}</Text>
            </View>
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

export default PodcastPreviewCard;

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

  soundBar: {
    width: 4,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
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
  playSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 20,
    padding: 12,
  },
  playText: {
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

