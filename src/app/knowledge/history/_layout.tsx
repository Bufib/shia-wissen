import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack
     screenOptions={{
        headerBackButtonMenuEnabled: false,
      }}>
      <Stack.Screen name="indexHistory" options={{ headerShown: false }} />
      <Stack.Screen name="prophets" options={{ headerShown: false }} />
      <Stack.Screen name="ahlulbayt" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
