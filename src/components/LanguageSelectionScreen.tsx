// src/screens/LanguageSelection.tsx
import React, { useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { LanguageCode } from "@/constants/Types";
import { Colors } from "@/constants/Colors";

const LANGUAGES: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "ar", label: "العربية" },
];

export default function LanguageSelection() {
  const { lang, setAppLanguage, ready, rtl } = useLanguage();

  const onPick = useCallback(
    async (code: LanguageCode) => {
      await setAppLanguage(code);
    },
    [setAppLanguage]
  );

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, rtl && { textAlign: "right" }]}>
        Choose your language
      </Text>

      {LANGUAGES.map(({ code, label }) => {
        const selected = code === lang;
        return (
          <Pressable
            key={code}
            onPress={() => onPick(code)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.button, selected && styles.buttonSelected]}
          >
            <Text
              style={[styles.buttonText, selected && styles.buttonTextSelected]}
            >
              {label} {selected ? "✓" : ""}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
  },
  button: {
    marginVertical: 8,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonSelected: {
    borderColor: Colors.universal.link,
  },
  buttonText: {
    fontSize: 20,
    color: Colors.universal.link,
  },
  buttonTextSelected: {
    fontWeight: "700",
  },
});
