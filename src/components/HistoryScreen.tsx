import React from "react";
import {
  StyleSheet,
  FlatList,
  View,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Text,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { router } from "expo-router";
import { HistoryDataType, } from "@/constants/Types";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import { AHLULBAYT_DATA } from "../../data/historyData";

const HistoryScreen: React.FC = () => {
  const { t } = useTranslation();
  const { lang } = useLanguage();

  const screenWidth = Dimensions.get("window").width;
  const cardWidth = (screenWidth - 48) / 2.2;

  // Handle card press - navigate to person's page
  const handleCardPress = (item: HistoryDataType) => {
    router.push({
      pathname: item.route,
      params: { language: lang, personId: item.id },
    });
  };


  // Render each person card
  const renderPersonCard = ({
    item,
    index,
  }: {
    item: HistoryDataType;
    index: number;
  }) => {
    return (
      <TouchableOpacity
        style={[
          styles.cardContainer,
          {
            width: cardWidth,
            backgroundColor: Colors.light.background,
            opacity: 0.9,
            borderWidth: 2,
            borderColor: Colors.universal.primary,
          },
        ]}
        onPress={() => handleCardPress(item)}
        activeOpacity={0.6}
      >
        <View style={styles.cardContent}>
          {/* Name */}
          <Text style={styles.personName}>{t(item.nameKey)}</Text>

          {/* Number indicator (position in lineage) */}
          <View style={styles.numberBadge}>
            <Text style={styles.numberText}>{index + 1}</Text>
          </View>

          {/* Decorative element */}
          <View style={styles.decorativeLine} />
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={["rgba(45, 90, 61, 1)", "rgba(74, 124, 78, 1)"]}
        style={styles.headerGradient}
      >
        <Text style={styles.headerTitle}>{t("sectionsTitle.ahlulbayt")}</Text>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/ahlulBayt.png")} // You can add an appropriate background
        style={styles.backgroundImage}
        imageStyle={{ opacity: 1 }}
      >
        <FlatList
          data={AHLULBAYT_DATA}
          renderItem={renderPersonCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      </ImageBackground>
    </View>
  );
};

export default HistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerContainer: {
    marginBottom: 24,
    marginTop: 10,
  },
  headerGradient: {
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
  },
  row: {
    justifyContent: "space-between",
  },
  cardContainer: {
    padding: 10,
    height: 200,
    marginBottom: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  personName: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
  },
  numberBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
  },
  numberText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  decorativeLine: {
    position: "absolute",
    bottom: 0,
    left: "20%",
    right: "20%",
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 1,
  },
});
