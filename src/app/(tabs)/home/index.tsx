import { Colors } from "@/constants/Colors";
import { useScreenFadeIn } from "../../../../hooks/useScreenFadeIn";
import React from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QuestionLinks from "@/components/QuestionLinks";
import LatestQuestions from "@/components/LatestQuestions";

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const { fadeAnim, onLayout } = useScreenFadeIn(800);
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme].background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Animated.View
        onLayout={onLayout}
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            backgroundColor: Colors[colorScheme].background,
          },
        ]}
      >
        <QuestionLinks />

        <View style={styles.latestQuestionsContainer}>
          <LatestQuestions />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },

  content: {
    flex: 1,
  },

  latestQuestionsContainer: {
    flex: 1,
  },
});
