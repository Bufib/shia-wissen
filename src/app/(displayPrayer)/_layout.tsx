import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
    <Stack
      screenOptions={{
        headerBackButtonMenuEnabled: false,
      }}
    >
      <Stack.Screen
        name="prayer"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default _layout;
