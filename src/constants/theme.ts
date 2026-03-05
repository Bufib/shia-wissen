/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";
const tintColorLight = "#2ea853";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    // Navigation
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    backgroundElement: '#F0F0F3',

    // TabView
    indicatorColor: "#000",
    inactiveLabelColor: "#000",
    activeLabelColor: "#555",

    // General
    text: "#11181C",
    inversTextColor: "#ECEDEE",
    background: "#f2f2f2",
    contrast: "#fff",
    border: "#000",
    shadow: "#000",
    loadingIndicator: "#000",
    error: "#d32f2f",
    defaultIcon: "#000",
    devider: "rgba(0,0,0,1)",
    // Switch
    trackColor: "#767577",
    thumbColor: "#f4f3f4",

    // Prayer viewer colors
    prayerHeaderBackground: "#1F6E8C",
    prayerArabicText: "#0D4D6C",
    prayerTransliterationText: "#525252",
    prayerButtonBackground: "rgba(31, 110, 140, 0.15)",
    prayerButtonBackgroundActive: "#f2f2f2",
    prayerButtonText: "#1F6E8C",
    prayerButtonTextActive: "#FFFFFF",
    prayerIntroductionBackground: "#84CEEB",
    prayerLoadingIndicator: "#1F6E8C",
    prayerBookmark: "#B3D7EC",

    //search
    itemTypeColor: "#666",
  },

  dark: {
    // Navigation
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    backgroundElement: '#212225',

    // TabView
    indicatorColor: "#fff",
    inactiveLabelColor: "#fff",
    activeLabelColor: "#aaa",

    // General
    text: "#ECEDEE",
    inversTextColor: "#11181C",
    background: "#242c40",
    contrast: "#34495e",
    border: "#fff",
    shadow: "#fff",
    loadingIndicator: "#fff",
    error: "#f44336",
    defaultIcon: "#fff",
    devider: "rgba(255,255,255,1)",

    // Switch
    trackColor: "#057958",
    thumbColor: "#f4f3f4",

    // Prayer viewer colors
    prayerHeaderBackground: "#0F5A78",
    prayerArabicText: "#64B5F6",
    prayerTransliterationText: "#B0BEC5",
    prayerTranslationText: "#E2F0F9",
    prayerButtonBackground: "rgba(31, 110, 140, 0.3)",
    prayerButtonBackgroundActive: "#f2f2f2",
    prayerButtonText: "#84CEEB",
    prayerButtonTextActive: "#E2F0F9",
    prayerIntroductionBackground: "#1D3E53",
    prayerLoadingIndicator: "#84CEEB",
    prayerBookmark: "#4B7E94",
    grayedOut: "#B0BEC5",

    //search
    itemTypeColor: "#ccc",
  },
  universal: {
    primary: "#2ea853",
    secondary: "#1D3E53",
    third: "#08832d",
    grayedOut: "#888",
    link: "#0a84ff",
    questionLinks: "#2ea853",
    prayerLinks: "#84CEEB",
    externalLinkIcon: "#057958",
    favorite: "#F59E0B",
    chatBubbleQuestion: "#b7d6ef",
    chatBubbleAnswer: "#b3e1c1",
    error: "#f44336",
  },
};

export const CALENDARPALLETTE = ["#9ACD32", "#A9DFBF", "#E74C3C", "#F7DC6F"];

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
