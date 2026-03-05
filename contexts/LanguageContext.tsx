// import { LanguageContextType, LanguageCode } from "@/constants/Types";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, {
//   createContext,
//   ReactNode,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   useCallback,
// } from "react";
// import { useTranslation } from "react-i18next";

// const DEFAULT_LANG: LanguageCode = "de";

// const LanguageContext = createContext<LanguageContextType>({
//   lang: DEFAULT_LANG,
//   setAppLanguage: async () => {},
//   ready: false,
//   rtl: false,
//   hasStoredLanguage: false,
// });

// export function LanguageProvider({ children }: { children: ReactNode }) {
//   const { i18n, ready: i18nReady } = useTranslation();

//   const [lang, setLang] = useState<LanguageCode>(DEFAULT_LANG);
//   const [checkedStorage, setCheckedStorage] = useState(false);
//   const [hasStoredLanguage, setHasStoredLanguage] = useState(false);

//   // Load stored language once on mount
//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       try {
//         const stored = (await AsyncStorage.getItem(
//           "language"
//         )) as LanguageCode | null;

//         const next = stored ?? DEFAULT_LANG;

//         // This will trigger the languageChanged listener below
//         await i18n.changeLanguage(next);

//         if (!mounted) return;

//         setHasStoredLanguage(!!stored);
//       } catch (e) {
//         // Optional: log in dev
//         if (__DEV__) {
//           console.warn("Failed to load language from storage:", e);
//         }
//       } finally {
//         if (mounted) setCheckedStorage(true);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [i18n]);

//   // Keep local `lang` in sync with i18next
//   useEffect(() => {
//     const onChange = (lng: string) => {
//       setLang(lng as LanguageCode);
//     };

//     i18n.on("languageChanged", onChange);
//     return () => {
//       i18n.off("languageChanged", onChange);
//     };
//   }, [i18n]);

//   // Public setter for app language
//   const setAppLanguage = useCallback(
//     async (lng: LanguageCode) => {
//       try {
//         // This triggers the languageChanged event,
//         // which updates `lang` via the effect above.
//         await i18n.changeLanguage(lng);
//         await AsyncStorage.setItem("language", lng);
//         setHasStoredLanguage(true);
//       } catch (e) {
//         console.warn("Failed to change language:", e);
//       }
//     },
//     [i18n]
//   );

//   const ready = i18nReady && checkedStorage;
//   const rtl = lang === "ar";

//   const value = useMemo(
//     () => ({
//       lang,
//       setAppLanguage,
//       ready,
//       rtl,
//       hasStoredLanguage,
//     }),
//     [lang, setAppLanguage, ready, rtl, hasStoredLanguage]
//   );

//   return (
//     <LanguageContext.Provider value={value}>
//       {children}
//     </LanguageContext.Provider>
//   );
// }

// export function useLanguage() {
//   return useContext(LanguageContext);
// }

import { LanguageContextType, LanguageCode } from "@/constants/Types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useTranslation } from "react-i18next";

const DEFAULT_LANG: LanguageCode = "de";

const LanguageContext = createContext<LanguageContextType>({
  lang: DEFAULT_LANG,
  setAppLanguage: async () => {},
  ready: false,
  rtl: false,
  hasStoredLanguage: true,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n, ready: i18nReady } = useTranslation();
  const [lang, setLang] = useState<LanguageCode>(DEFAULT_LANG);
  const [checkedStorage, setCheckedStorage] = useState(false);

  // Load stored language once on mount
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const stored = (await AsyncStorage.getItem(
          "language"
        )) as LanguageCode | null;

        const next = stored ?? DEFAULT_LANG;

        // Save default language if nothing was stored
        if (!stored) {
          await AsyncStorage.setItem("language", DEFAULT_LANG);
        }

        // This will trigger the languageChanged listener below
        await i18n.changeLanguage(next);

        if (!mounted) return;
      } catch (e) {
        if (__DEV__) {
          console.warn("Failed to load language from storage:", e);
        }
      } finally {
        if (mounted) setCheckedStorage(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [i18n]);

  // Keep local `lang` in sync with i18next
  useEffect(() => {
    const onChange = (lng: string) => {
      setLang(lng as LanguageCode);
    };
    i18n.on("languageChanged", onChange);
    return () => {
      i18n.off("languageChanged", onChange);
    };
  }, [i18n]);

  // Public setter for app language
  const setAppLanguage = useCallback(
    async (lng: LanguageCode) => {
      try {
        await i18n.changeLanguage(lng);
        await AsyncStorage.setItem("language", lng);
      } catch (e) {
        console.warn("Failed to change language:", e);
      }
    },
    [i18n]
  );

  const ready = i18nReady && checkedStorage;
  const rtl = lang === "ar";

  const value = useMemo(
    () => ({
      lang,
      setAppLanguage,
      ready,
      rtl,
      hasStoredLanguage: true, // Always true since we auto-save default
    }),
    [lang, setAppLanguage, ready, rtl]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
