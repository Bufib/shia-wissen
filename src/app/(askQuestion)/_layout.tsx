import "react-native-reanimated";
import { useColorScheme } from "../../../hooks/useColorScheme";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { Stack } from "expo-router";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: colorScheme === "dark" ? "#d0d0c0" : "#000",
        headerBackButtonMenuEnabled: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          headerTitle: "",
          headerLeft: () => <HeaderLeftBackButton />,
        }}
      />
      <Stack.Screen
        name="ask"
        options={{ headerShown: true, headerTitle: "" }}
      />
      <Stack.Screen
        name="questionDetailScreen"
        options={{
          headerShown: true,
          headerTitle: "",
        }}
      />
    </Stack>
  );
}
