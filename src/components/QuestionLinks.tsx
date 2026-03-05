import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  useColorScheme,
} from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import LatestQuestions from "@/components/LatestQuestions";
import { ThemedText } from "@/components/ThemedText";
import { questionCategories } from "../../utils/categories";
import { Colors } from "@/constants/Colors";
import { returnSize } from "../../utils/sizes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";

export default function QuestionLinks() {
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const { lang } = useLanguage();
  // Dynamically calculate the size of each element based on screen width
  const { elementSize, fontSize, iconSize } = returnSize(width, height);

  // fade-in animation value

  const colorScheme = useColorScheme() || "light";
  const { fadeAnim, onLayout } = useScreenFadeIn(800);

  // animate opacity on mount

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.container,
        { opacity: fadeAnim, backgroundColor: Colors[colorScheme].background },
      ]}
    >
      <View style={styles.categoriesContainer}>
        <View style={styles.categories}>
          {questionCategories.map((category, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                router.push({
                  pathname: "/knowledge/questions/questionCategories",
                  params: {
                    category: category.value,
                    categoryName: category.name,
                  },
                });
              }}
              style={[
                styles.element,
                {
                  backgroundColor: Colors[colorScheme].contrast,
                  width: elementSize,
                  height: elementSize,
                },
              ]}
            >
              <View
                style={[
                  styles.categoryButtonContainer,
                  { gap: iconSize / 10 - 1 },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { width: iconSize, height: iconSize },
                  ]}
                >
                  <Image
                    style={[styles.elementIcon, { width: iconSize }]}
                    source={category.image}
                    contentFit="contain"
                  />
                </View>
                <View>
                  <ThemedText
                    style={[styles.elementText, { fontSize: fontSize }]}
                  >
                    {t(category.name)}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {/* <TouchableOpacity
            onPress={() => {
              router.push({
                pathname:
                  "/(tabs)/knowledge/questions/questionVideosCategories",
                params: { category: "Videos", categoryName: t("videos") },
              });
            }}
            style={[
              styles.element,
              {
                backgroundColor: Colors[colorScheme].contrast,
                width: "96%",
                height: elementSize / 2,
              },
            ]}
          >
            <View
              style={[
                styles.categoryButtonContainer,
                { gap: iconSize / 10 - 1 },
              ]}
            >
              <View style={styles.videoTextContainer}>
                <Entypo
                  name="folder-video"
                  size={28}
                  color={Colors.universal.questionLinks}
                />
                <ThemedText
                  style={[styles.elementText, { fontSize: fontSize * 1.7 }]}
                >
                  {t("videos")}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity> */}
        </View>
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.footerHeaderContainer}>
          <ThemedText
            type="titleBiggerLessBold"
            style={styles.footerHeaderContainerText}
          >
            {t("latestQuestions")}
          </ThemedText>
        </View>
        <LatestQuestions />
      </View>
      {/* Login */}
      {/* {lang === "de" && (
        <TouchableOpacity
          style={styles.askQuestionButton}
          onPress={() => router.push("/(askQuestion)")}
        >
          <MaterialCommunityIcons
            name="chat-question-outline"
            size={50}
            color="#fff"
          />
        </TouchableOpacity>
      )} */}
    </Animated.View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 10,
    paddingTop: 3,
    gap: 30,
  },

  categoriesContainer: {
    flexDirection: "column",
    marginTop: 8,
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },

  imageHeader: {
    height: "auto",
    aspectRatio: 2,
  },
  flatListContent: {
    gap: 7,
    paddingRight: 15,
    paddingLeft: 15,
    paddingVertical: 10,
  },
  flatListStyles: {},

  element: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,

    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

    // Android Shadow
    elevation: 5,
  },

  categoryButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.universal.questionLinks,
  },
  videoTextContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  elementIcon: {
    height: "auto",
    aspectRatio: 1.5,
    alignSelf: "center",
  },
  elementText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  footerContainer: {
    flex: 1,
  },
  footerHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerHeaderContainerText: {
    paddingHorizontal: 5,
    paddingBottom: 3,
  },
  askQuestionButton: {
    position: "absolute",
    bottom: "15%",
    right: "5%",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    backgroundColor: Colors.universal.primary,
    borderRadius: 10,
  },
});
