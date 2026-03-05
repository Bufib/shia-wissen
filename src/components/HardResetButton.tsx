import { hardResetAllData } from "../../db/hardReset";
import { useState, useCallback } from "react";
import { Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { ThemedText } from "./ThemedText";
import { Colors } from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import { LoadingIndicator } from "./LoadingIndicator";

export function HardResetButton() {
  const { t } = useTranslation();
  const [resetting, setResetting] = useState(false);

  const onPress = useCallback(() => {
    Alert.alert(
      t("hardResetDatabase"),
      t("hardResetDatabaseText"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("yes"),
          style: "destructive",
          onPress: async () => {
            setResetting(true);
            try {
              await hardResetAllData();
              router.replace("/(tabs)/home");
            } catch (error: any) {
              Alert.alert(t("error"), error?.message ?? String(error));
            } finally {
              setResetting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  }, [t]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={resetting}
      style={{
        borderWidth: 0.5,
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        borderColor: Colors.universal.error,
        opacity: resetting ? 0.6 : 1,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        width: 180,
        
      }}
    >
      <ThemedText style={{ color: Colors.universal.error, textAlign: "center" }}>
        {t("hardResetDatabase")}
      </ThemedText>
      {resetting && <LoadingIndicator />}
    </TouchableOpacity>
  );
}
