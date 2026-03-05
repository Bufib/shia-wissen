// import { useMemo } from "react";
// import { TextStyle } from "react-native";
// import { useFontSizeStore, TextScriptType } from "@/stores/fontSizeStore";

// interface DynamicFontStyleOptions {
//   scriptType?: TextScriptType;
//   fontSizeMultiplier?: number;
// }

// export const useDynamicFontStyle = (
//   options: DynamicFontStyleOptions = {}
// ): TextStyle => {
//   const { scriptType = "latin", fontSizeMultiplier = 1 } = options;
//   const {
//     fontSize,
//     arabicLineHeight,
//     transliterationLineHeight,
//     latinLineHeight,
//   } = useFontSizeStore();

//   return useMemo(() => {
//     let lineHeight: number;

//     switch (scriptType) {
//       case "arabic":
//         lineHeight = arabicLineHeight;
//         break;
//       case "transliteration":
//         lineHeight = transliterationLineHeight;
//         break;
//       case "latin":
//       default:
//         lineHeight = latinLineHeight;
//         break;
//     }

//     return {
//       fontSize: fontSize * fontSizeMultiplier,
//       lineHeight: lineHeight * fontSizeMultiplier,
//     };
//   }, [
//     fontSize,
//     arabicLineHeight,
//     transliterationLineHeight,
//     latinLineHeight,
//     scriptType,
//     fontSizeMultiplier,
//   ]);
// };
