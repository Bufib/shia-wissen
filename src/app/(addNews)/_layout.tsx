import { Stack } from "expo-router";
import "react-native-reanimated";
import { MenuProvider } from "react-native-popup-menu";
export default function RootLayout() {
  return (
    <MenuProvider>
      <Stack screenOptions={{headerBackButtonMenuEnabled: false,}}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="addNews" options={{ headerShown: false }} />
        <Stack.Screen name="addPushMessages" options={{ headerShown: false }} />
      </Stack>
    </MenuProvider>
  );
}
