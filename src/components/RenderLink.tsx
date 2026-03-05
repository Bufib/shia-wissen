// import { ThemedText } from "@/components/ThemedText";
// import { Colors } from "@/constants/Colors";
// import { useLanguage } from "@/contexts/LanguageContext";
// import handleOpenExternalUrl from "@/utils/handleOpenExternalUrl";
// import Feather from "@expo/vector-icons/Feather";
// import React from "react";
// import { Pressable, StyleSheet, useColorScheme } from "react-native";
// import handleOpenInternalUrl from "../utils/handleOpenInternalUrl";

// type RenderLinkPropsType = {
//   url: string;
//   index: number;
//   isExternal: boolean;
// };

// const RenderLink = ({
//   url,
//   index,
//   isExternal,
// }: RenderLinkPropsType) => {
//   const colorScheme = useColorScheme();
//   const { rtl } = useLanguage();
//   const { lang } = useLanguage();
//   return (
//     <Pressable
//       key={index}
//       style={({ pressed }) => [
//         styles.linkButton,
//         pressed && styles.linkButtonPressed,
//       ]}
//       onPress={() =>
//         isExternal
//           ? handleOpenExternalUrl(url)
//           : handleOpenInternalUrl(url, lang, "questionLink")
//       }
//     >
//       <Feather
//         name={isExternal ? "external-link" : "link"}
//         size={14}
//         color={colorScheme === "dark" ? "#fff" : "#000"}
//         style={{ paddingRight: 5 }}
//       />
//       <ThemedText
//         style={[styles.linkText, { textAlign: rtl ? "right" : "left" }]}
//         numberOfLines={1}
//         ellipsizeMode="tail"
//       >
//         {url}
//       </ThemedText>
//     </Pressable>
//   );
// };

// const styles = StyleSheet.create({
//   linkButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     borderRadius: 6,
//   },
//   linkButtonPressed: {
//     opacity: 0.5,
//   },
//   linkText: {
//     fontSize: 14,
//     color: Colors.universal.link,
//     flexShrink: 1,
//   },
// });

// export default RenderLink;

//! Last that worked
import React, { useEffect, useState, useCallback } from "react";
import { Pressable, StyleSheet, useColorScheme } from "react-native";
import Feather from "@expo/vector-icons/Feather";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";

import handleOpenExternalUrl from "../../utils/handleOpenExternalUrl";
import handleOpenInternalUrl from "../../utils/handleOpenInternalUrl";
import { getQuestionInternalURL } from "../../db/queries/questions";
import { getPrayerInternalURL } from "../../db/queries/prayers";
import {
  InternalLinkType,
  LanguageCode,
  QuranInternalResultType,
} from "@/constants/Types";
import { getQuranInternalURL } from "../../db/queries/quran";

type RenderLinkProps = {
  url: string;
  index: number;
  isExternal: boolean;
  isDone?: boolean;
};

type ParsedInternal =
  | { type: "questionLink"; identifier: number }
  | { type: "prayerLink"; identifier: number }
  | { type: "quranLink"; identifier: string } // "sura:aya"
  | null;

/** Canonical only:
 *  - questionLink:<number>
 *  - prayerLink:<number>
 *  - quranLink:<sura>:<aya>
 */
const parseInternalUrl = (raw: string): ParsedInternal => {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const [maybeType, ...rest] = trimmed.split(":");
  const remainder = rest.join(":").trim();
  if (!remainder) return null;

  if (maybeType === "questionLink") {
    const id = Number(remainder);
    if (Number.isNaN(id)) return null;
    return { type: "questionLink", identifier: id };
  }

  if (maybeType === "prayerLink") {
    const id = Number(remainder);
    if (Number.isNaN(id)) return null;
    return { type: "prayerLink", identifier: id };
  }

  if (maybeType === "quranLink") {
    // remainder should be "sura:aya"
    return { type: "quranLink", identifier: remainder };
  }

  return null;
};

const getExternalLabel = (url: string): string => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    return host || url;
  } catch {
    return url;
  }
};

const buildQuranLabel = (
  identifier: string,
  q: Partial<QuranInternalResultType> | null | undefined,
  lang: LanguageCode
): string => {
  const [suraStr] = identifier.split(":");
  const sura = q?.sura ?? Number(suraStr);

  let suraName: string | undefined;

  if (lang === "ar") {
    suraName =
      q?.sura_label_ar ||
      q?.sura_label_en || // optional fallback if you like
      q?.sura_label_de ||
      undefined;
  } else {
    // de + en: prefer EN, then DE, then AR
    suraName =
      q?.sura_label_en || q?.sura_label_de || q?.sura_label_ar || undefined;
  }

  if (suraName && Number.isFinite(sura)) {
    return `${suraName} (${sura})`;
  }

  if (suraName) return suraName;
  if (Number.isFinite(sura)) return `Sura ${sura}`;

  return identifier;
};

const RenderLink = ({
  url,
  index,
  isExternal,
  isDone = false,
}: RenderLinkProps) => {
  const colorScheme = useColorScheme() || "light";
  const { rtl, lang } = useLanguage();

  const [label, setLabel] = useState<string>(
    isExternal ? getExternalLabel(url) : `Link ${index + 1}`
  );

  /* ---------------------------- on press ---------------------------- */

  const handlePress = useCallback(() => {
    if (isExternal) {
      handleOpenExternalUrl(url);
      return;
    }

    const parsed = parseInternalUrl(url);
    if (!parsed) return;

    const { type, identifier } = parsed;
    handleOpenInternalUrl(String(identifier), lang, type as InternalLinkType);
  }, [url, isExternal, lang]);

  /* ---------------------- external label hydrate ---------------------- */

  useEffect(() => {
    if (isExternal) {
      setLabel(getExternalLabel(url));
    }
  }, [url, isExternal]);

  /* ---------------------- internal label hydrate ---------------------- */

  useEffect(() => {
    if (isExternal) return;

    const parsed = parseInternalUrl(url);
    if (!parsed) {
      setLabel(url); // show raw if malformed for debugging
      return;
    }

    const { type, identifier } = parsed;
    let cancelled = false;

    const load = async () => {
      try {
        if (type === "questionLink") {
          const q = await getQuestionInternalURL(identifier, lang);
          if (!cancelled) {
            setLabel(q?.title || `Frage ${identifier}`);
          }
          return;
        }

        if (type === "prayerLink") {
          const p = await getPrayerInternalURL(identifier, lang);
          if (!cancelled) {
            setLabel(
              (lang === "ar" && p?.arabic_title) ||
                p?.name ||
                `Gebet ${identifier}`
            );
          }
          return;
        }

        if (type === "quranLink") {
          const q = await getQuranInternalURL(String(identifier), lang);
          if (!cancelled) {
            if (q) {
              setLabel(buildQuranLabel(String(identifier), q, lang));
            } else {
              setLabel(buildQuranLabel(String(identifier), {}, lang));
            }
          }
          return;
        }
      } catch (error) {
        console.error("RenderLink: failed to hydrate label", error);
        if (!cancelled) {
          setLabel(`Link ${index + 1}`);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [url, lang, isExternal, index]);

  /* ------------------------------ render ------------------------------ */

  return (
    <Pressable
      style={({ pressed }) => [
        styles.linkButton,
        pressed && styles.linkButtonPressed,
      ]}
      onPress={handlePress}
    >
      {/* <Feather
        name={isExternal ? "external-link" : "link"}
        size={14}
        color={colorScheme === "dark" ? "#fff" : "#000"}
        style={[
          { paddingRight: 5 },
          isDone && { textDecorationLine: "line-through", opacity: 0.6 },
        ]}
      /> */}
      <ThemedText
        style={[
          styles.linkText,
          { textAlign: rtl ? "right" : "left" },

          isDone && { opacity: 0.6 },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
      </ThemedText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
  },
  linkButtonPressed: {
    opacity: 0.5,
  },
  linkText: {
    fontSize: 14,
    color: Colors.universal.link,
    flexShrink: 1,
  },
});

export default RenderLink;
