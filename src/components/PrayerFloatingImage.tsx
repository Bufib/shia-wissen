import { useKnowledgeTabStore } from "../../stores/useKnowledgeTabStore";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { useSegments } from "expo-router";
import { Linking } from "react-native";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export function PrayerFloatingImage() {
  const activeTab = useKnowledgeTabStore((s) => s.activeTab);
  const segments: any = useSegments();
  const insets = useSafeAreaInsets();

  const show = segments.includes("knowledge") && activeTab === 1;
  const tabBarHeight = 25 + insets.bottom;
  if (!show) return null;

  const openPrayerTimes = async () => {
    await WebBrowser.openBrowserAsync("https://prayertime.ir");
  };

  return (
    <TouchableOpacity
      style={[styles.floatingImageContainer, { bottom: tabBarHeight }]}
      onPress={() => openPrayerTimes()}
    >
      <Image
        source={require("@/assets/images/prayerTime.png")}
        style={[{ width: 100, height: 100 }]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingImageContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 99,
  },
});
