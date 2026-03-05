// app/home/podcast.tsx
import React from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import PodcastPlayer from "@/components/PodcastPlayer";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";

export default function PodcastScreen() {
  // pull in the raw JSON string
  const { podcast: podcastString } = useLocalSearchParams<{
    podcast: string;
  }>();
  const { t } = useTranslation();
  let podcast;
  try {
    podcast = JSON.parse(podcastString);
  } catch {
    return (
      <ThemedView style={styles.center}>
        <ThemedText style={styles.errorText}>{t("error")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PodcastPlayer podcast={podcast} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    marginBottom: 12,
  },
});
