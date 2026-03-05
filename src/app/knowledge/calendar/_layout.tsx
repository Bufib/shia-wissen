import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerBackButtonMenuEnabled: false,
      }}
    >
      <Stack.Screen name="indexCalandar" options={{ headerShown: true }} />
    </Stack>
  );
};

export default _layout;
