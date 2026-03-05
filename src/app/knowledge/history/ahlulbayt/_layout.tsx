import React from "react";
import { Stack } from "expo-router";

const _layout = () => {
  return (
         <Stack screenOptions={{headerBackButtonMenuEnabled: false,}}>

      <Stack.Screen name="muhammad" options={{ headerShown: false }} />
      <Stack.Screen name="fatima" options={{ headerShown: false }} />
      <Stack.Screen name="ali" options={{ headerShown: false }} />
      <Stack.Screen name="hasan" options={{ headerShown: false }} />
      <Stack.Screen name="husain" options={{ headerShown: false }} />
      <Stack.Screen name="zainUlAbidin" options={{ headerShown: false }} />
      <Stack.Screen name="baqir" options={{ headerShown: false }} />
      <Stack.Screen name="sadiq" options={{ headerShown: false }} />
      <Stack.Screen name="kathim" options={{ headerShown: false }} />
      <Stack.Screen name="ridha" options={{ headerShown: false }} />
      <Stack.Screen name="dschawad" options={{ headerShown: false }} />
      <Stack.Screen name="hadi" options={{ headerShown: false }} />
      <Stack.Screen name="askari" options={{ headerShown: false }} />
      <Stack.Screen name="mahdi" options={{ headerShown: false }} />
    </Stack>
  );
};

export default _layout;
