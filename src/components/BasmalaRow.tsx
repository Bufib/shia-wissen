import { StyleSheet, View } from "react-native";
import React from "react";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";

const BasmalaRow = ({
  fontSize,
  rtl,
  lang,
  t,
}: {
  fontSize: number;
  rtl: boolean;
  lang: string;
  t: (key: string) => string;
}) => {
  return (
    <View style={styles.basmalaWrap}>
      <ThemedText type="arabic" style={[styles.basmalaArabic]}>
        بِسْمِ ٱللّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </ThemedText>
      {lang !== "ar" && (
        <ThemedText
          type="defaultWithFontsize"
          style={[styles.basmalaTranslation, {}]}
        >
          {t("basmala")}
        </ThemedText>
      )}
    </View>
  );
};

export default BasmalaRow;

const styles = StyleSheet.create({
  basmalaWrap: {
    marginTop: 10,
    marginHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  basmalaArabic: {
    textAlign: "center",
    fontWeight: "600",
  },
  basmalaTranslation: {
    marginTop: 4,
    textAlign: "center",
    color: Colors.universal.grayedOut,
    fontWeight: "500",
  },
});
