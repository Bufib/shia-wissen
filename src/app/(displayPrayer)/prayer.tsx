import { StyleSheet, View } from "react-native";
import React from "react";
import RenderPrayer from "@/components/RenderPrayer";
import { useLocalSearchParams } from "expo-router";

const Prayer = () => {
  const params = useLocalSearchParams();
  const prayerID = Array.isArray(params.prayer)
    ? params.prayer[0]
    : params.prayer;

  return (
    <View style={styles.container}>
      <RenderPrayer prayerID={parseInt(prayerID)} />
    </View>
  );
};

export default Prayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
