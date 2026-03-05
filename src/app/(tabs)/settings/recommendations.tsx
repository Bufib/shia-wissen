import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTranslation } from "react-i18next";
import handleOpenExternalUrl from "../../../../utils/handleOpenExternalUrl";

const Recommendations = () => {
  const { t } = useTranslation();
  const recommendationData = [
    {
      name: "Sayid Maher El Ali",
      link: "https://www.instagram.com/maher.elali/reels/?hl=am-et",
      image: "",
    },

    {
      name: "Shop Al Qamar",
      link: "https://alqamar-shop.de/?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAQ0xDSwPvgEhleHRuA2FlbQIxMQBzcnRjBmFwcF9pZA8xMjQwMjQ1NzQyODc0MTQAAafjXaXCGVqtyNo3uIdHqhJ7tVlMplPf-izlk8uWzIQ7zLY6MrU0UN2_03PeCA_aem_BRUhvRNfXYkxSUzj73jOAg",
      image: "",
    },
    {
      name: "Al Qamar Instagram",
      link: "https://www.instagram.com/al_qamar.54?igsh=MWY2dzdpaHd6aXNrdw==",
      image: "",
    },
  ];
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.headerTitle}>
        {t("ourRecommendations")}
      </ThemedText>
      <ThemedView style={styles.body}>
        <ThemedView style={styles.recommendationContainer}>
          {recommendationData.map((recommend, index) => (
            <ThemedText
              style={styles.recommendationText}
              key={index}
              onPress={() => handleOpenExternalUrl(recommend.link)}
            >
              {recommend.name}
            </ThemedText>
          ))}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

export default Recommendations;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    gap: 10,
  },

  headerTitle: {},

  body: {
    flex: 1,
    flexDirection: "column",
  },

  recommendationContainer: {
    gap: 10,
  },

  recommendationText: {},
});
