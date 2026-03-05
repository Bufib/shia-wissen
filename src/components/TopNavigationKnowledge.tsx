// //! Last that worked
// import * as React from "react";
// import { useEffect } from "react";
// import {
//   useWindowDimensions,
//   useColorScheme,
//   View,
//   Animated,
//   Easing,
// } from "react-native";
// import { TabView, SceneMap, TabBar } from "react-native-tab-view";
// import indexPrayer from "@/app/(tabs)/knowledge/prayers/indexPrayer";
// import indexQuestion from "@/app/(tabs)/knowledge/questions/indexQuestion";
// import indexQuran from "@/app/(tabs)/knowledge/quran/indexQuran";
// import indexCalandar from "@/app/(tabs)/knowledge/calendar/indexCalendar";
// import indexHistory from "@/app/(tabs)/knowledge/history/indexHistory";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Colors } from "@/constants/Colors";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useTranslation } from "react-i18next";
// import { Image } from "expo-image";
// import { useRef } from "react";
// import i18n from "@/utils/i18n";
// import { LanguageCode } from "@/constants/Types";
// const renderScene = SceneMap({
//   questionsScreen: indexQuestion,
//   prayerScreen: indexPrayer,
//   calendarScreen: indexCalandar,
//   quranScreen: indexQuran,
//   historyScreen: indexHistory,
// });

// export default function TopNavigationKnowledge() {
//   const layout = useWindowDimensions();
//   const [index, setIndex] = React.useState(0);
//   const colorScheme = useColorScheme() || "light";
//   const { lang } = useLanguage();
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const routes = React.useMemo(
//     () => [
//       {
//         key: "questionsScreen",
//         title: "",
//         icon: require("@/assets/images/qAndAHeaderLogo.png"),
//       },
//       {
//         key: "prayerScreen",
//         title: "",
//         icon: require("@/assets/images/prayersHeaderLogo.png"),
//       },
//       {
//         key: "calendarScreen",
//         title: "",
//         icon: require("@/assets/images/calendarHeaderLogo.png"),
//       },
//       {
//         key: "quranScreen",
//         title: "",
//         icon: require("@/assets/images/quranHeaderLogo.png"),
//       },
//       {
//         key: "historyScreen",
//         title: "",
//         icon: require("@/assets/images/historyHeaderLogo.png"),
//       },
//     ],
//     []
//   );

//   // animate opacity on mount
//   useEffect(() => {
//     const animation = Animated.timing(fadeAnim, {
//       toValue: 1,
//       duration: 600,
//       easing: Easing.out(Easing.cubic),
//       useNativeDriver: true,
//     });

//     animation.start();

//     return () => {
//       animation.stop(); // prevent updates after unmount
//     };
//   }, [fadeAnim]);

//   return (
//       <Animated.View
//         style={[
//           { flex: 1 },
//           {
//             opacity: fadeAnim,
//             backgroundColor: Colors[colorScheme].background,
//           },
//         ]}
//       >
//         <SafeAreaView
//           style={[{ backgroundColor: Colors[colorScheme].contrast }]}
//           edges={["top"]}
//         />
//         <TabView
//           navigationState={{ index, routes }}
//           renderScene={renderScene}
//           onIndexChange={setIndex}
//           initialLayout={{ width: layout.width }}
//           options={{
//             questionsScreen: {
//               icon: ({ route, focused, color }) => (
//                 <Image
//                   source={route.icon}
//                   contentFit="contain"
//                   style={{
//                     width: 35,
//                     height: 35,
//                     opacity: focused ? 1 : 0.6,
//                   }}
//                 />
//               ),
//             },
//             prayerScreen: {
//               icon: ({ route, focused, color }) => (
//                 <Image
//                   source={route.icon}
//                   contentFit="contain"
//                   style={{
//                     width: 35,
//                     height: 35,
//                     opacity: focused ? 1 : 0.6,
//                   }}
//                 />
//               ),
//             },
//             calendarScreen: {
//               icon: ({ route, focused, color }) => (
//                 <Image
//                   source={route.icon}
//                   contentFit="contain"
//                   style={{
//                     width: 35,
//                     height: 35,
//                     opacity: focused ? 1 : 0.6,
//                   }}
//                 />
//               ),
//             },
//             quranScreen: {
//               icon: ({ route, focused, color }) => (
//                 <Image
//                   source={route.icon}
//                   contentFit="contain"
//                   style={{
//                     width: 35,
//                     height: 35,
//                     opacity: focused ? 1 : 0.6,
//                   }}
//                 />
//               ),
//             },
//             historyScreen: {
//               icon: ({ route, focused, color }) => (
//                 <Image
//                   source={route.icon}
//                   contentFit="contain"
//                   style={{
//                     width: 35,
//                     height: 35,
//                     opacity: focused ? 1 : 0.6,
//                   }}
//                 />
//               ),
//             },
//           }}
//           renderTabBar={(props) => (
//             <TabBar
//               {...props}
//               style={{ backgroundColor: Colors[colorScheme].contrast }} // Style for the tab bar background
//               indicatorStyle={{
//                 backgroundColor: Colors[colorScheme].indicatorColor,
//               }} // Style for the indicator
//               activeColor={Colors[colorScheme].activeLabelColor}
//               inactiveColor={Colors[colorScheme].inactiveLabelColor}
//             />
//           )}
//         />
//       </Animated.View>
//   );
// }

import * as React from "react";
import { useWindowDimensions, useColorScheme, Animated } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import indexPrayer from "@/app/(tabs)/knowledge/prayers/indexPrayer";
import indexQuestion from "@/app/(tabs)/knowledge/questions/indexQuestion";
import indexQuran from "@/app/(tabs)/knowledge/quran/indexQuran";
import indexCalandar from "@/app/(tabs)/knowledge/calendar/indexCalendar";
import indexHistory from "@/app/(tabs)/knowledge/history/indexHistory";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import { useScreenFadeIn } from "../../hooks/useScreenFadeIn";
import indexVideos from "@/app/(tabs)/knowledge/videos/indexVideos";
import { useKnowledgeTabStore } from "../../stores/useKnowledgeTabStore";

const renderScene = SceneMap({
  questionsScreen: indexQuestion,
  prayerScreen: indexPrayer,
  calendarScreen: indexCalandar,
  videoScreen: indexVideos,
  quranScreen: indexQuran,
  historyScreen: indexHistory,
});

export default function TopNavigationKnowledge() {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const setActiveTab = useKnowledgeTabStore((s) => s.setActiveTab);
  const colorScheme = useColorScheme() || "light";
  const { fadeAnim, onLayout } = useScreenFadeIn(800);

  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
    setActiveTab(newIndex);
  };
  const routes = React.useMemo(
    () => [
      {
        key: "questionsScreen",
        title: "",
        icon: require("@/assets/images/qAndAHeaderLogo.png"),
      },
      {
        key: "prayerScreen",
        title: "",
        icon: require("@/assets/images/prayersHeaderLogo.png"),
      },
      {
        key: "calendarScreen",
        title: "",
        icon: require("@/assets/images/calendarHeaderLogo.png"),
      },
      {
        key: "videoScreen",
        title: "",
        icon: require("@/assets/images/videos.png"),
      },
      {
        key: "quranScreen",
        title: "",
        icon: require("@/assets/images/quranHeaderLogo.png"),
      },
      {
        key: "historyScreen",
        title: "",
        icon: require("@/assets/images/historyHeaderLogo.png"),
      },
    ],
    [],
  );

  return (
    <Animated.View
      onLayout={onLayout}
      style={{
        flex: 1,
        opacity: fadeAnim,
        backgroundColor: Colors[colorScheme].background,
      }}
    >
      <SafeAreaView
        style={{ backgroundColor: Colors[colorScheme].contrast }}
        edges={["top"]}
      />

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={handleIndexChange}
        initialLayout={{ width: layout.width }}
        lazy
        options={{
          questionsScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          prayerScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          calendarScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          videoScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          quranScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
          historyScreen: {
            icon: ({ route, focused }) => (
              <Image
                source={route.icon}
                contentFit="contain"
                style={{
                  width: 35,
                  height: 35,
                  opacity: focused ? 1 : 0.6,
                }}
              />
            ),
          },
        }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            style={{ backgroundColor: Colors[colorScheme].contrast }}
            indicatorStyle={{
              backgroundColor: Colors[colorScheme].indicatorColor,
            }}
            activeColor={Colors[colorScheme].activeLabelColor}
            inactiveColor={Colors[colorScheme].inactiveLabelColor}
          />
        )}
      />
    </Animated.View>
  );
}
