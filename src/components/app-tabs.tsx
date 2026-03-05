// import { NativeTabs } from 'expo-router/unstable-native-tabs';
// import React from 'react';
// import { useColorScheme } from 'react-native';

// import { Colors } from '@/constants/theme';

// export default function AppTabs() {
//   const scheme = useColorScheme();
//   const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

//   return (
//     <NativeTabs
//       backgroundColor={colors.background}
//       indicatorColor={colors.backgroundElement}
//       labelStyle={{ selected: { color: colors.text } }}>
//       <NativeTabs.Trigger name="index">
//         <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
//         <NativeTabs.Trigger.Icon
//           src={require('@/assets/images/tabIcons/home.png')}
//           renderingMode="template"
//         />
//       </NativeTabs.Trigger>

//       <NativeTabs.Trigger name="explore">
//         <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
//         <NativeTabs.Trigger.Icon
//           src={require('@/assets/images/tabIcons/explore.png')}
//           renderingMode="template"
//         />
//       </NativeTabs.Trigger>
//     </NativeTabs>
//   );
// }

import React from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "react-native";
import { useTranslation } from "react-i18next";

export default function TabLayout() {
  const colorScheme = useColorScheme() || "light";
  const { t } = useTranslation();

  return (
    <NativeTabs
      backgroundColor={Colors[colorScheme].background}
      indicatorColor={Colors[colorScheme].background}
      labelStyle={{
        selected: { color: Colors[colorScheme].tint },
        default: { color: Colors[colorScheme].text },
      }}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>{t("home")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          // iOS (SF Symbols)
          sf="house.fill"
          // Android (Material Symbols)
          md="home"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="knowledge">
        <NativeTabs.Trigger.Label>{t("knowledge")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="book"
          md="menu_book"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Label>{t("search")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="magnifyingglass"
          md="search"
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>{t("favorites")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="star" md="star" renderingMode="template" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>{t("settings")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="gear.circle"
          md="settings"
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
