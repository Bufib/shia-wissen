// import React, { useState } from "react";
// import { View, Text, StyleSheet, useColorScheme } from "react-native";
// import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useTranslation } from "react-i18next";
// import { LinearGradient } from "expo-linear-gradient";
// import { ThemedText } from "@/components/ThemedText";
// import HeaderLeftBackButton from "./HeaderLeftBackButton";
// import FontSizePickerModal from "./FontSizePickerModal";
// import { Colors } from "@/constants/Colors";
// import { StickyHeaderQuranPropsType, SuraRowType } from "@/constants/Types";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useDataVersionStore } from "@/stores/dataVersionStore";

// export const StickyHeaderQuran: React.FC<StickyHeaderQuranPropsType> = ({
//   suraNumber,
//   suraInfo,
//   displayName,
//   juzHeader,
// }) => {
//   const { t } = useTranslation();
//   const colorScheme = useColorScheme() || "light";
//   const [modalVisible, setModalVisible] = useState(false);
//   const isMakki = !!suraInfo?.makki;
//   const showJuzOrPage = !!juzHeader;
//   const { rtl, lang } = useLanguage();
//   const isInFavorites = false;
//   const insets = useSafeAreaInsets();
//   const getSuraName = (s: SuraRowType) => {
//     if (lang === "ar") return s.label ?? s.label_en ?? "";
//     if (lang === "de") return s.label_en ?? s.label ?? "";
//     return s.label_en ?? s.label ?? "";
//   };
//   return (
//     <LinearGradient
//       colors={["#3bc963", "#2ea853", "#228a3f"]}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//       style={styles.gradientContainer}
//     >
//       <SafeAreaView edges={["top"]} style={styles.safeArea}>
//          {isInFavorites ? (
//                     <Ionicons
//                       name="star"
//                       size={28}
//                       color={Colors.universal.favorite}
//                     />
//                   ) : (
//                     <Ionicons
//                       name="star-outline"
//                       size={28}
//                       color={Colors[colorScheme].defaultIcon}
//                     />
//                   )}
//         <View style={styles.headerWrapper}>
//           <View style={styles.headerContent}>
//             <View
//               style={{ flexDirection: "row", flex: 1, alignItems: "center" }}
//             >
//               <HeaderLeftBackButton
//                 style={{
//                   color: "#FFFFFF",
//                 }}
//               />
//               <View style={styles.headerTextContainer}>
//                 {showJuzOrPage ? (
//                   <>
//                     <Text style={styles.suraName}>{juzHeader?.title}</Text>
//                     {!!juzHeader?.subtitle && (
//                       <Text style={styles.subMeta}>{juzHeader.subtitle}</Text>
//                     )}
//                   </>
//                 ) : (
//                   <>
//                     <Text style={[styles.suraName, rtl && styles.suraNameAr]}>
//                       {displayName ||
//                         suraInfo?.label_en ||
//                         suraInfo?.label ||
//                         ""}{" "}
//                       ({suraNumber})
//                     </Text>
//                     <Text style={styles.subMeta}>
//                       {t("ayatCount")}: {suraInfo?.nbAyat ?? "—"} ·{" "}
//                       {isMakki ? t("makki") : t("madani")}
//                     </Text>
//                   </>
//                 )}
//               </View>
//             </View>
//             <Ionicons
//               name="text"
//               size={28}
//               color="#FFFFFF"
//               onPress={() => setModalVisible(true)}
//               style={{ marginRight: 15 }}
//             />
//           </View>
//           <FontSizePickerModal
//             visible={modalVisible}
//             onClose={() => setModalVisible(false)}
//           />
//         </View>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   gradientContainer: {
//     width: "100%",
//   },
//   safeArea: {
//     flex: 1,
//   },
//   headerWrapper: {
//     flex: 1,
//     paddingLeft: 10,
//     paddingBottom: 12,
//   },
//   headerContent: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },
//   headerTextContainer: {
//     marginLeft: 10,
//   },
//   suraName: {
//     fontSize: 20,
//     fontWeight: "700",
//     lineHeight: 24,
//     color: "#FFFFFF",
//   },
//   suraNameAr: {
//     fontSize: 20,
//     textAlign: "right",
//     lineHeight: 24,
//     color: "#FFFFFF",
//   },
//   subMeta: {
//     fontWeight: "600",
//     fontSize: 14,
//     lineHeight: 18,
//     color: "#F0FDFA",
//     marginTop: 2,
//   },
// });

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import HeaderLeftBackButton from "./HeaderLeftBackButton";
import FontSizePickerModal from "./FontSizePickerModal";
import { Colors } from "@/constants/Colors";
import { StickyHeaderQuranPropsType } from "@/constants/Types";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  isFavoriteSura,
  toggleFavoriteSura,
  isFavoriteJuz,
  toggleFavoriteJuz,
  isFavoritePage,
  toggleFavoritePage,
} from "../../db/queries/quran";
import { useDataVersionStore } from "../../stores/dataVersionStore";

export const StickyHeaderQuran: React.FC<StickyHeaderQuranPropsType> = ({
  suraNumber,
  suraInfo,
  displayName,
  juzHeader,
  juzNumber,
  pageNumber,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { rtl } = useLanguage();

  const [modalVisible, setModalVisible] = useState(false);
  const [isInFavorites, setIsInFavorites] = useState(false);

  const isMakki = !!suraInfo?.makki;
  const showJuzOrPage = !!juzHeader;
  const isPageMode = pageNumber != null && pageNumber > 0;
  const isJuzMode = juzNumber != null && juzNumber > 0 && !isPageMode;

  const incrementQuranFavoritesVersion = useDataVersionStore(
    (s) => s.incrementQuranFavoritesVersion
  );
  // Load favorite state based on mode
  useEffect(() => {
    let isActive = true;

    const loadFavoriteState = async () => {
      try {
        let fav = false;

        if (isPageMode && pageNumber) {
          fav = await isFavoritePage(pageNumber);
        } else if (isJuzMode && juzNumber) {
          fav = await isFavoriteJuz(juzNumber);
        } else {
          // Regular sura mode
          fav = await isFavoriteSura(suraNumber);
        }

        if (isActive) setIsInFavorites(fav);
      } catch (err) {
        console.error("StickyHeaderQuran: load favorite state failed", {
          suraNumber,
          juzNumber,
          pageNumber,
          err,
        });
      }
    };

    loadFavoriteState();

    return () => {
      isActive = false;
    };
  }, [suraNumber, juzNumber, pageNumber, isJuzMode, isPageMode]);

  const handleToggleFavorite = useCallback(async () => {
    try {
      let next = false;

      if (isPageMode && pageNumber) {
        next = await toggleFavoritePage(pageNumber);
      } else if (isJuzMode && juzNumber) {
        next = await toggleFavoriteJuz(juzNumber);
      } else {
        next = await toggleFavoriteSura(suraNumber);
      }

      setIsInFavorites(next);
      incrementQuranFavoritesVersion();
    } catch (err) {
      console.error("StickyHeaderQuran: toggle favorite failed", {
        suraNumber,
        juzNumber,
        pageNumber,
        err,
      });
    }
  }, [
    suraNumber,
    juzNumber,
    pageNumber,
    isJuzMode,
    isPageMode,
    incrementQuranFavoritesVersion,
  ]);

  return (
    <LinearGradient
      colors={["#3bc963", "#2ea853", "#228a3f"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientContainer, { paddingTop: insets.top }]}
    >
      <View style={styles.headerWrapper}>
        <View style={styles.headerContent}>
          <View style={{ flexDirection: "row", flex: 1, alignItems: "center" }}>
            <HeaderLeftBackButton style={{ color: "#FFFFFF" }} />

            <View style={styles.headerTextContainer}>
              {showJuzOrPage ? (
                <>
                  <Text style={styles.suraName}>{juzHeader?.title}</Text>
                  {!!juzHeader?.subtitle && (
                    <Text style={styles.subMeta}>{juzHeader.subtitle}</Text>
                  )}
                </>
              ) : (
                <>
                  <Text style={[styles.suraName, rtl && styles.suraNameAr]}>
                    {displayName || suraInfo?.label_en || suraInfo?.label || ""}{" "}
                    ({suraNumber})
                  </Text>
                  <Text style={styles.subMeta}>
                    {t("ayatCount")}: {suraInfo?.nbAyat ?? "—"} ·{" "}
                    {isMakki ? t("makki") : t("madani")}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View style={styles.iconContainer}>
            <Ionicons
              name="text"
              size={28}
              color="#FFFFFF"
              onPress={() => setModalVisible(true)}
              style={{}}
            />
            <Ionicons
              name={isInFavorites ? "star" : "star-outline"}
              size={29}
              color={isInFavorites ? Colors.universal.favorite : "#FFFFFF"}
              onPress={handleToggleFavorite}
            />
          </View>
        </View>

        <FontSizePickerModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  headerWrapper: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 12,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerTextContainer: {
    marginLeft: 10,
  },
  suraName: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 24,
    color: "#FFFFFF",
  },
  suraNameAr: {
    fontSize: 20,
    textAlign: "right",
    lineHeight: 24,
    color: "#FFFFFF",
  },
  subMeta: {
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 18,
    color: "#F0FDFA",
    marginTop: 2,
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
    gap: 10,
  },
});

export default StickyHeaderQuran;
