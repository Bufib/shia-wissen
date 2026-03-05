import { Stack } from "expo-router";
import { StyleSheet, View, ScrollView, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { ThemedText } from "@/components/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";

export default function About() {
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        style={[
          styles.scrollStyle,
          { backgroundColor: Colors[colorScheme].background },
        ]}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Stack.Screen
          options={{
            headerTitle: t("about"),
          }}
        />
        <View style={styles.aboutContainer}>
          <ThemedText style={styles.aboutText}>
            Islam-Fragen ist die erste deutschsprachige Anwendung, in der eine
            Vielzahl der häufig gestellten islamischen Fragen in den
            verschiedensten Wissensgebieten nach schiitischer Ansicht
            beantwortet werden.
            {"\n"}
            {"\n"}
            Die App ist ein Projekt des Bund für islamische Bildung (BufiB) und
            wird von einer Gruppe deutschsprachiger islamischer Theologen
            geleitet. Die Antworten basieren auf vertrauenswürdigen Quellen. Die
            Rechtsurteile stammen entweder aus den Regelwerken (risalah
            &apos;amaliyyah) der Rechtsgelehrten oder ihren Büros.
            {"\n"}
            {"\n"}
            Wir erhoffen uns, mit Gottes Erlaubnis, mit dieser App dem großen
            Bedarf nach der Beantwortung von Glaubens- und Rechtsfragen
            nachkommen zu können und in Zukunft Antworten auf die häufig
            gestellten Fragen bereitzustellen.
            {"\n"}
            {"\n"}
            Die Beantwortung der Rechtsfragen erfolgt in erster Linie gemäß der
            Rechtsprechung der beiden Großgelehrten Sayid Ali al-Khamenei (h.)
            und Sayid Ali as-Sistani (h.), da sie im deutschsprachigen Raum die
            meisten Befolger haben. Leider ist es uns zeitlich gesehen nicht
            möglich die Rechtsprechung bereits verstorbener Rechtsgelehrter zu
            berücksichtigen und bitten dafür um Verständnis.
            {"\n"}
            {"\n"}
            Möge Allah, der Erhabene, diese bescheidenen Anstrengungen annehmen.
          </ThemedText>
          <View style={styles.imageContainer}>
            <Image
              source={require("@/assets/images/bufibLogo.png")}
              style={styles.image}
              contentFit="contain"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollStyle: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  aboutContainer: {
    marginHorizontal: 15,
    marginBottom: 60,
    marginTop: 20,
  },
  aboutText: {
    fontSize: 20,
  },
  imageContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  image: {
    height: 200,
    width: 300,
  },
});
