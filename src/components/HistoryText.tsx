import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import React from "react";
import { ThemedText } from "@/components/ThemedText";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import Markdown, { MarkdownIt } from "react-native-markdown-display";
import HeaderLeftBackButton from "@/components/HeaderLeftBackButton";
import { useLevelProgressStore } from "../../stores/levelProgressStore";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";
import { router } from "expo-router";

const HistoryText = ({
  titleDE,
  titleEN,
  titleAR,
  textContentDE,
  textContentEN,
  textContentAR,
  prophetID,
}: {
  textContentDE: string;
  textContentEN: string;
  textContentAR: string;
  titleDE: string;
  titleEN: string;
  titleAR: string;
  prophetID: string;
}) => {
  const colorScheme = useColorScheme() || "light";
  const levelProgress = useLevelProgressStore();
  const { lang, rtl } = useLanguage();
  const { t } = useTranslation();
  return (
    <SafeAreaView
      edges={["top"]}
      style={[
        styles.container,
        {
          backgroundColor: Colors[colorScheme].background,
        },
      ]}
    >
      <View
        style={[
          { flexDirection: "row", gap: 10, marginLeft: 20, marginTop: 15 },
          rtl && { marginRight: 20 },
        ]}
      >
        <HeaderLeftBackButton />
        <ThemedText
          type="title"
          style={[{ marginBottom: 10, flex: 1 }, rtl && { textAlign: "right" }]}
        >
          {lang === "de" ? titleDE : lang === "en" ? titleEN : titleAR}
        </ThemedText>
      </View>
      <ScrollView
        contentContainerStyle={styles.ScrollContent}
        style={[
          styles.scrollStyle,
          { backgroundColor: Colors[colorScheme].background },

          {},
        ]}
      >
        <Markdown
          markdownit={MarkdownIt({
            typographer: true,
            breaks: true,
            html: true,
          }).disable(["code"])}
          style={{
            body: {
              fontSize: 16,
              lineHeight: 30,
              color: Colors[colorScheme].text,
              textAlign: rtl ? "right" : "left",
            },
            heading2: {
              marginBottom: 10,
              color: Colors[colorScheme].text,
              textAlign: rtl ? "right" : "left",
            },
            // unordered bullets
            bullet_list_icon: {
              fontSize: 40,
              lineHeight: 38,
              textAlign: rtl ? "right" : "left",
            },
            bullet_list_content: {
              fontSize: 20,
              lineHeight: 30,
              textAlign: rtl ? "right" : "left",
            },
            ordered_list_icon: {
              fontSize: 22,
              lineHeight: 28,
              textAlign: rtl ? "right" : "left",
            },
            ordered_list_content: {
              fontSize: 18,
              lineHeight: 24,
              textAlign: rtl ? "right" : "left",
            },

            list_item: {
              marginVertical: 4,

              textAlign: rtl ? "right" : "left",
            },
            bullet_list: {
              paddingLeft: 8,

              textAlign: rtl ? "right" : "left",
            },
          }}
        >
          {lang === "de"
            ? textContentDE
            : lang === "en"
            ? textContentEN
            : textContentAR}
        </Markdown>
        <TouchableOpacity
          style={[
            styles.doneButton,
            { backgroundColor: Colors.universal.primary },
          ]}
          onPress={() => {
            levelProgress.markLevelComplete(lang, "prophets", prophetID);
            router.push("..");
          }}
        >
          <Text style={styles.doneButtonText}>{t("done")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HistoryText;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollStyle: {
    flex: 1,
  },
  ScrollContent: {
    gap: 15,
    padding: 15,
  },
  doneButton: {
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 30,
    width: 150,
    height: 60,
    borderRadius: 25,
  },
  doneButtonText: {
    fontSize: 30,
    alignSelf: "center",
    color: "#fff",
  },
});
