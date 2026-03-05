import { View, StyleSheet } from "react-native";
import React from "react";
import { useLocalSearchParams, Stack } from "expo-router";
import RenderQuestionSubCategoryItems from "@/components/RenderQuestionSubCategoryItems";

type params = {
  subcategory: string;
};
export default function QuestionSubcategories() {
  const { subcategory } = useLocalSearchParams<params>();

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: subcategory,
        }}
      />
      <RenderQuestionSubCategoryItems />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

