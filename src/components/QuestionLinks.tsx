// import React from "react";
// import {
//   View,
//   StyleSheet,
//   useWindowDimensions,
//   TouchableOpacity,
//   Animated,
//   useColorScheme,
//   ScrollView,
// } from "react-native";
// import { router } from "expo-router";
// import { Image } from "expo-image";
// import { ThemedText } from "@/components/ThemedText";
// import { questionCategories } from "../../utils/categories";
// import { Colors } from "@/constants/Colors";
// import { returnSize } from "../../utils/sizes";
// import { useTranslation } from "react-i18next";
// import { useLanguage } from "../../contexts/LanguageContext";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";

// export default function QuestionLinks() {
//   const { width, height } = useWindowDimensions();
//   const { t } = useTranslation();
//   const { lang } = useLanguage();

//   const { elementSize, fontSize, iconSize } = returnSize(width, height);

//   const colorScheme = useColorScheme() || "light";
//   const { fadeAnim, onLayout } = useScreenFadeIn(800);

//   return (
//     <Animated.View
//       onLayout={onLayout}
//       style={[
//         styles.container,
//         { opacity: fadeAnim, backgroundColor: Colors[colorScheme].background },
//       ]}
//     >
//       <View style={styles.categoriesContainer}>
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.categoriesScrollContent}
//         >
//           {questionCategories.map((category, index) => (
//             <TouchableOpacity
//               key={index}
//               activeOpacity={0.8}
//               onPress={() => {
//                 router.push({
//                   pathname: "/knowledge/questions/questionCategories",
//                   params: {
//                     category: category.value,
//                     categoryName: category.name,
//                   },
//                 });
//               }}
//               style={[
//                 styles.element,
//                 {
//                   backgroundColor: Colors[colorScheme].contrast,
//                   width: elementSize,
//                   height: elementSize,
//                 },
//               ]}
//             >
//               <View
//                 style={[
//                   styles.categoryButtonContainer,
//                   { gap: iconSize / 10 - 1 },
//                 ]}
//               >
//                 <View
//                   style={[
//                     styles.iconContainer,
//                     { width: iconSize, height: iconSize },
//                   ]}
//                 >
//                   <Image
//                     style={[styles.elementIcon, { width: iconSize }]}
//                     source={category.image}
//                     contentFit="contain"
//                   />
//                 </View>

//                 <ThemedText style={[styles.elementText, { fontSize }]}>
//                   {t(category.name)}
//                 </ThemedText>
//               </View>
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </View>

//       {lang === "de" && (
//         <TouchableOpacity
//           style={styles.askQuestionButton}
//           onPress={() => router.push("/(askQuestion)")}
//         >
//           <MaterialCommunityIcons
//             name="chat-question-outline"
//             size={50}
//             color="#fff"
//           />
//         </TouchableOpacity>
//       )}
//     </Animated.View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: "column",
//     paddingTop: 3,
//     gap: 30,
//   },

//   categoriesContainer: {
//     marginTop: 8,
//   },

//   categoriesScrollContent: {
//     flexDirection: "row",
//     gap: 15,
//     paddingHorizontal: 10,
//     paddingVertical: 10,
//   },

//   element: {
//     flexDirection: "column",
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 13,

//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,

//     elevation: 5,
//   },

//   categoryButtonContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   iconContainer: {
//     borderRadius: 90,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: Colors.universal.questionLinks,
//   },

//   elementIcon: {
//     height: "auto",
//     aspectRatio: 1.5,
//     alignSelf: "center",
//   },

//   elementText: {
//     fontWeight: "bold",
//     textAlign: "center",
//   },

//   askQuestionButton: {
//     position: "absolute",
//     bottom: "15%",
//     right: "5%",
//     justifyContent: "center",
//     alignItems: "center",
//     width: 70,
//     height: 70,
//     backgroundColor: Colors.universal.primary,
//     borderRadius: 10,
//   },
// });

import React from "react";
import {
  View,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Animated,
  useColorScheme,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { questionCategories } from "../../utils/categories";
import { Colors } from "@/constants/Colors";
import { returnSize } from "../../utils/sizes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import { Entypo, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";

export default function QuestionLinks() {
  const { width, height } = useWindowDimensions();
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const { elementSize, fontSize, iconSize } = returnSize(width, height);

  const colorScheme = useColorScheme() || "light";
  const { fadeAnim, onLayout } = useScreenFadeIn(800);

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: Colors[colorScheme].background,
          gap: 7,
        },
      ]}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: 10,
        }}
      >
        <ThemedText type="titleBiggerLessBold">
          {t("categories")} (6)
        </ThemedText>

        <Feather
          name="search"
          size={30}
          color={Colors[colorScheme].defaultIcon}
          style={{ marginRight: 10 }}
          onPress={() => router.push("/home/indexSearch")}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollContent}
      >
        {questionCategories.map((category, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.8}
            onPress={() => {
              router.push({
                pathname: "/(questions)/questionCategories",
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

              <ThemedText
                numberOfLines={2}
                style={[styles.elementText, { fontSize }]}
              >
                {t(category.name)}
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 8,
    paddingBottom: 10,
  },

  categoriesScrollContent: {
    flexDirection: "row",
    gap: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  element: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 13,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,

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

  elementIcon: {
    height: "auto",
    aspectRatio: 1.5,
    alignSelf: "center",
  },

  elementText: {
    fontWeight: "bold",
    textAlign: "center",
  },

  askQuestionButton: {
    position: "absolute",
    bottom: 15,
    right: 20,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    backgroundColor: Colors.universal.primary,
    borderRadius: 10,
  },
});
