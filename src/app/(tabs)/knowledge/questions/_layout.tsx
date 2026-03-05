import { useColorScheme, Pressable } from "react-native";
import React from "react";
import { Stack, router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

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
                    : router.replace("/(tabs)/knowledge")
                }
                hitSlop={10}
                style={({ pressed }) => ({})}
              >
                <Ionicons
                  name="chevron-back-outline"
                  size={30}
                  color={
                    colorScheme === "dark"
                      ? "#fff"
                      : "#000"
                  }
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
      <Stack.Screen
        name="questionVideos"
        options={{ headerShown: true, headerBackVisible: false }}
      />
    </Stack>
  );
};

export default Layout;
