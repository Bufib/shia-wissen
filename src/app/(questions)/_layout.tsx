import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, router } from "expo-router";
import React from "react";
import { Pressable, useColorScheme } from "react-native";

const Layout = () => {
  const colorScheme = useColorScheme() || "light";
  return (
    <Stack
      screenOptions={{
        headerBackButtonMenuEnabled: false,
      }}
    >
      <Stack.Screen name="indexQuestion" options={{ headerShown: false }} />
      <Stack.Screen
        name="questionCategories"
        options={{
          headerShown: true,
          headerLeft: () => {
            return (
              <Pressable
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace("/(tabs)/home")
                }
                hitSlop={10}
                style={({ pressed }) => ({})}
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color={colorScheme === "dark" ? "#fff" : "#000"}
                  style={{}}
                />
              </Pressable>
            );
          },
        }}
      />
      <Stack.Screen
        name="questionSubcategories"
        options={{ headerShown: true }}
      />
    </Stack>
  );
};

export default Layout;
