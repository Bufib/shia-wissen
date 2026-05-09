import { Colors } from "@/constants/Colors";
import React from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QuestionLinks from "@/components/QuestionLinks";
import LatestQuestions from "@/components/LatestQuestions";
import { useScreenFadeIn } from "@/hooks/useScreenFadeIn";


export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          backgroundColor: Colors[colorScheme].background,
        },
        {
          backgroundColor: Colors[colorScheme].background,
          paddingTop: insets.top + 5,
          paddingBottom: insets.bottom,
          paddingHorizontal: 10
        },
      ]}
    >
      <QuestionLinks />
      <LatestQuestions />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 5,
  },
});
