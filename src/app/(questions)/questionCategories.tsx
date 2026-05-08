import { View, StyleSheet } from "react-native";
import React from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import RenderQuestionCategoryItems from "@/components/RenderQuestionCategoryItems";

export default function QuestionCategories() {
  const { category, categoryName } = useLocalSearchParams<{
    category: string;
    categoryName: string;
  }>();
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: categoryName,
        }}
      />
      <RenderQuestionCategoryItems category={category} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
