import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  StyleProp,
} from "react-native";
import { useTranslation } from "react-i18next";

interface RetryButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  label?: string; // Optional override for "retry"
}

const RetryButton = ({
  onPress,
  style,
  textStyle,
  label,
}: RetryButtonProps) => {
  const { t } = useTranslation();

  return (
    <TouchableOpacity style={[styles.retryButton, style]} onPress={onPress}>
      <Text style={textStyle}>{label ?? t("retry")}</Text>
    </TouchableOpacity>
  );
};

export default RetryButton;

const styles = StyleSheet.create({
  retryButton: {
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
});
