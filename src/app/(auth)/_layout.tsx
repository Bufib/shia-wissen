import { Stack } from "expo-router";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonMenuEnabled: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          headerShown: true,
          headerTitle: "Login",
          headerLeft: () => {
            return <HeaderLeftBackButton />;
          },
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          headerShown: true,
          headerTitle: "Registrieren",
          headerLeft: () => {
            return <HeaderLeftBackButton />;
          },
        }}
      />
      <Stack.Screen
        name="forgotPassword"
        options={{
          headerShown: true,
          headerTitle: "Passwort vergessen",
          headerLeft: () => {
            return <HeaderLeftBackButton />;
          },
        }}
      />
      <Stack.Screen
        name="resetPassword"
        options={{
          headerShown: true,
          headerTitle: "Passwort ändern",
          headerLeft: () => {
            return <HeaderLeftBackButton />;
          },
        }}
      />
    </Stack>
  );
}
