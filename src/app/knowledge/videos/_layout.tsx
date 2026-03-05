import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
          <Stack screenOptions={{headerBackButtonMenuEnabled: false,}}>

      <Stack.Screen name="indexVideos" options={{ headerShown: true }} />
    </Stack>
  );
};

export default _layout;
