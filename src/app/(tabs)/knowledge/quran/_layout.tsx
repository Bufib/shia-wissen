import React from "react";
import { Stack } from "expo-router";
const Layout = () => {
  return (
         <Stack screenOptions={{headerBackButtonMenuEnabled: false,}}>

      <Stack.Screen name="indexQuran" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
