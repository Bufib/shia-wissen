import React from "react";
import { Stack } from "expo-router";
const _layout = () => {
  return (
    <Stack screenOptions={{ headerBackButtonMenuEnabled: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="favoritePdfs" options={{ headerShown: false }} />
      <Stack.Screen name="favoriteQuestions" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
