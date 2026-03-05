import React from "react";
import { StyleSheet, FlatList } from "react-native";
import NameCard from "@/components/NameCard";
import { ThemedView } from "@/components/ThemedView";
import { names } from "../../../../utils/namesObject";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
export default function Names() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: t("names"),
        }}
      />
      <ThemedView style={styles.container}>
        <FlatList
          data={names}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <NameCard name={item} />}
          numColumns={2}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
