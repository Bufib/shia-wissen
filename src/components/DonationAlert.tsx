import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Alert,
  View,
  useColorScheme,
  Modal,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import handleOpenExternalUrl from "../../utils/handleOpenExternalUrl";
import Toast from "react-native-toast-message";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
type DonationAlertProps = {
  isVisible: boolean;
  onClose: () => void;
};

const DonationAlert: React.FC<DonationAlertProps> = ({
  isVisible,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const [payPalLink, setPayPalLink] = useState<string | null>(null);

  // paypal
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const paypal = await AsyncStorage.getItem("paypal"); // string | null
        if (!cancelled) setPayPalLink(paypal ?? null);
      } catch (error: any) {
        if (!cancelled)
          Alert.alert("Fehler", error?.message ?? "Unbekannter Fehler");
      }
    })();
    return () => {
      cancelled = true; // avoid setState on unmounted component
    };
  }, []);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide" 
      onRequestClose={onClose} // Android back button
      statusBarTranslucent={true} // nicer overlay on Android
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {/* Backdrop (replaces onBackdropPress/backdropOpacity) */}
        <Pressable style={styles.backdrop} onPress={onClose} />
        <ThemedView
          style={[
            styles.container,
            colorScheme === "dark" ? styles.darkMode : styles.lightMode,
          ]}
        >
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons
              name="close-circle-outline"
              size={22}
              color={colorScheme === "dark" ? "#fff" : "#333"}
            />
          </Pressable>

          {/* Header */}
          <ThemedText style={styles.headerText}>
            Unterstütze uns {"\u2764\uFE0F"}
          </ThemedText>

          {/* Message */}
          <ThemedText style={styles.messageText}>
            Mit deiner Unterstützung können wir fortfahren und weiterhin für
            dich da sein. {"\n"}
            Vielen Dank!
          </ThemedText>

          {/* PayPal Donate Button */}
          <Pressable
            style={styles.donateButton}
            onPress={() => payPalLink && handleOpenExternalUrl(payPalLink)}
          >
            <ThemedText style={styles.donateButtonText}>
              Jetzt mit PayPal spenden
            </ThemedText>
          </Pressable>
        </ThemedView>
      </View>
      <Toast />
    </Modal>
  );
};

export default DonationAlert;

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    width: "85%",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  darkMode: {
    backgroundColor: "#2c3e50",
  },
  lightMode: {
    backgroundColor: "#fff",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  messageText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  donateButton: {
    backgroundColor: "#0070BA", // PayPal Blue
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  donateButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
});
