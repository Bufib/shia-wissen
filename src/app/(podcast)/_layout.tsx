import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { Stack } from "expo-router";
import React from "react";
const _layout = () => {
  return (
         <Stack screenOptions={{headerBackButtonMenuEnabled: false,}}>

      <Stack.Screen
        name="indexPodcast"
        options={{
          headerShown: false,
          headerLeft: () => <HeaderLeftBackButton />,
        }}
      />
    </Stack>
  );
};

export default _layout;

