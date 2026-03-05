import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity, useColorScheme } from "react-native";

const HeaderLeftBackButton = ({
  color,
  size,
  style,
}: {
  color?: string | null;
  size?: number | null;
  style?: any;
}) => {
  const colorScheme = useColorScheme() || "light";
  return (
    <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={style}>
      <Ionicons
        name="chevron-back-outline"
        size={size ? size : 35}
        color={color ? color : colorScheme === "dark" ? "#fff" : "#000"}
      />
    </TouchableOpacity>
  );
};

export default HeaderLeftBackButton;
