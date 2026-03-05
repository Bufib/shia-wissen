// // !Last worked
// // src/components/InlineTodoText.tsx
// // import React from "react";
// // import { Text, StyleSheet } from "react-native";
// // import { ThemedText } from "./ThemedText";
// // import RenderLink from "./RenderLink";

// // interface InlineTodoTextProps {
// //   text: string;
// //   internalUrls?: string[];
// //   style?: any;
// // }

// // /**
// //  * Parses text containing {{link:N}} placeholders and renders them
// //  * as inline link components.
// //  *
// //  * Example: "Read {{link:0}} and {{link:1}}" with urls = ["prayer:1", "quran:1:1"]
// //  */
// // export const InlineTodoText: React.FC<InlineTodoTextProps> = ({
// //   text,
// //   internalUrls = [],
// //   style,
// // }) => {
// //   // Regex to match {{link:N}} where N is a number
// //   const linkPattern = /\{\{link:(\d+)\}\}/g;

// //   const parts: React.ReactNode[] = [];
// //   let lastIndex = 0;
// //   let match;

// //   // Find all link placeholders
// //   while ((match = linkPattern.exec(text)) !== null) {
// //     const matchStart = match.index;
// //     const matchEnd = linkPattern.lastIndex;
// //     const linkIndex = parseInt(match[1], 10);

// //     // Add text before the link
// //     if (matchStart > lastIndex) {
// //       parts.push(
// //         <Text key={`text-${lastIndex}`}>
// //           {text.substring(lastIndex, matchStart)}
// //         </Text>
// //       );
// //     }

// //     // Add the link component if it exists in the array
// //     if (linkIndex < internalUrls.length) {
// //       parts.push(
// //         <RenderLink
// //           key={`link-${linkIndex}-${internalUrls[linkIndex]}`}
// //           url={internalUrls[linkIndex]}
// //           index={linkIndex}
// //           isExternal={false}
// //         />
// //       );
// //     } else {
// //       // Fallback: show placeholder if link is missing
// //       parts.push(
// //         <Text key={`missing-${linkIndex}`} style={styles.missingLink}>
// //           [Link {linkIndex}]
// //         </Text>
// //       );
// //     }

// //     lastIndex = matchEnd;
// //   }

// //   // Add remaining text after last link
// //   if (lastIndex < text.length) {
// //     parts.push(
// //       <Text key={`text-${lastIndex}`}>{text.substring(lastIndex)}</Text>
// //     );
// //   }

// //   // If no links were found, just render the text
// //   if (parts.length === 0) {
// //     return <ThemedText style={style}>{text}</ThemedText>;
// //   }

// //   return <ThemedText style={style}>{parts}</ThemedText>;
// // };

// // const styles = StyleSheet.create({
// //   missingLink: {
// //     opacity: 0.5,
// //     fontStyle: "italic",
// //   },
// // });

// // export default InlineTodoText;

// //! Works
// // src/components/InlineTodoText.tsx
// import React from "react";
// import { View, StyleSheet, StyleProp, TextStyle } from "react-native";
// import { ThemedText } from "./ThemedText";
// import RenderLink from "./RenderLink";
// import { useLanguage } from "@/contexts/LanguageContext";

// interface InlineTodoTextProps {
//   text: string;
//   internalUrls?: string[];
//   style?: StyleProp<TextStyle>;
// }

// /**
//  * text: "Asdas {{link}} and {{link}}"
//  * internalUrls: ["quranLink:28:3", "prayerLink:12"]
//  * Each {{...}} is replaced in order by the next internalUrls entry.
//  */
// export const InlineTodoText: React.FC<InlineTodoTextProps> = ({
//   text,
//   internalUrls = [],
//   style,
// }) => {
//   const { rtl } = useLanguage();

//   // Flatten and remove layout props that break inline composition
//   const flat = StyleSheet.flatten(style) || {};
//   const {
//     flex,
//     flexGrow,
//     flexShrink,
//     flexBasis,
//     alignSelf,
//     // keep possible explicit textAlign if set
//     textAlign: baseTextAlign,
//     ...inlineTextStyle
//   } = flat;

//   const textAlign = rtl ? "right" : baseTextAlign;

//   const linkPattern = /\{\{([^}]+)\}\}/g;
//   const parts: React.ReactNode[] = [];

//   let lastIndex = 0;
//   let linkIndex = 0;
//   let match: RegExpExecArray | null;

//   while ((match = linkPattern.exec(text)) !== null) {
//     const matchStart = match.index;

//     // Plain text before {{...}}
//     if (matchStart > lastIndex) {
//       const chunk = text.substring(lastIndex, matchStart);
//       if (chunk.length) {
//         parts.push(
//           <ThemedText
//             key={`txt-${lastIndex}`}
//             style={[inlineTextStyle, { textAlign }]}
//           >
//             {chunk}
//           </ThemedText>
//         );
//       }
//     }

//     // Link for this placeholder
//     if (linkIndex < internalUrls.length) {
//       const url = internalUrls[linkIndex];
//       parts.push(
//         <RenderLink
//           key={`link-${linkIndex}-${url}`}
//           url={url}
//           index={linkIndex}
//           isExternal={false}
//         />
//       );
//     } else {
//       // Fallback (debug)
//       parts.push(
//         <ThemedText
//           key={`missing-${linkIndex}`}
//           style={[inlineTextStyle, { color: "red", textAlign }]}
//         >
//           [Link]
//         </ThemedText>
//       );
//     }

//     linkIndex++;
//     lastIndex = linkPattern.lastIndex;
//   }

//   // Tail after last placeholder
//   if (lastIndex < text.length) {
//     const tail = text.substring(lastIndex);
//     if (tail.length) {
//       parts.push(
//         <ThemedText
//           key="txt-tail"
//           style={[inlineTextStyle, { textAlign }]}
//         >
//           {tail}
//         </ThemedText>
//       );
//     }
//   }

//   // No placeholders: simple text
//   if (parts.length === 0) {
//     return (
//       <ThemedText style={[inlineTextStyle, { textAlign }]}>{text}</ThemedText>
//     );
//   }

//   return (
//     <View
//       style={[
//         styles.inlineContainer,
//         rtl && { flexDirection: "row-reverse" },
//       ]}
//     >
//       {parts}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   inlineContainer: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     alignItems: "center",
//     flex: 1, // this replaces flex:1 from todoText for the whole unit
//   },
// });

// export default InlineTodoText;

// src/components/InlineTodoText.tsx
import React from "react";
import { View, StyleSheet, StyleProp, TextStyle } from "react-native";
import { ThemedText } from "./ThemedText";
import RenderLink from "./RenderLink";
import { useLanguage } from "../../contexts/LanguageContext";

interface InlineTodoTextProps {
  text: string;
  internalUrls?: string[];
  style?: StyleProp<TextStyle>;
  isDone?: boolean

}

/**
 * Usage example:
 *   text: "Asdas {{link}} and {{link}}"
 *   internalUrls: ["quranLink:28:3", "prayerLink:12"]
 * Each {{...}} is replaced IN ORDER by the corresponding internalUrls entry.
 */
export const InlineTodoText: React.FC<InlineTodoTextProps> = ({
  text,
  internalUrls = [],
  style,
  isDone = false
}) => {
  const { rtl } = useLanguage();

  // Flatten incoming style and strip layout props that break inline composition
  const flat = StyleSheet.flatten(style) || {};
  const {
    flex,
    flexGrow,
    flexShrink,
    flexBasis,
    alignSelf,
    textAlign: baseTextAlign,
    ...inlineTextStyle
  } = flat;

  const textAlign = rtl ? "right" : baseTextAlign;

  const linkPattern = /\{\{([^}]+)\}\}/g;
  const parts: React.ReactNode[] = [];

  let lastIndex = 0;
  let linkIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(text)) !== null) {
    const matchStart = match.index;

    // Plain text before the placeholder
    if (matchStart > lastIndex) {
      const chunk = text.substring(lastIndex, matchStart);
      if (chunk.length) {
        parts.push(
          <ThemedText
            key={`txt-${lastIndex}`}
            style={[inlineTextStyle, { textAlign }]}
          >
            {chunk}
          </ThemedText>
        );
      }
    }

    // Render link for this placeholder
    if (linkIndex < internalUrls.length) {
      const url = internalUrls[linkIndex];
      parts.push(
        <RenderLink
          key={`link-${linkIndex}-${url}`}
          url={url}
          index={linkIndex}
          isExternal={false}
          isDone={isDone}
        />
      );
    } else {
      // Fallback marker if we have more {{}} than urls
      parts.push(
        <ThemedText
          key={`missing-${linkIndex}`}
          style={[inlineTextStyle, { color: "red", textAlign }]}
        >
          [Link]
        </ThemedText>
      );
    }

    linkIndex++;
    lastIndex = linkPattern.lastIndex;
  }

  // Trailing text after the last placeholder
  if (lastIndex < text.length) {
    const tail = text.substring(lastIndex);
    if (tail.length) {
      parts.push(
        <ThemedText key="txt-tail" style={[inlineTextStyle, { textAlign }]}>
          {tail}
        </ThemedText>
      );
    }
  }

  // No placeholders → just render plain text
  if (parts.length === 0) {
    return (
      <ThemedText style={[inlineTextStyle, { textAlign }]}>{text}</ThemedText>
    );
  }

  return (
    <View
      style={[styles.inlineContainer, rtl && { flexDirection: "row-reverse" }]}
    >
      {parts}
    </View>
  );
};

const styles = StyleSheet.create({
  inlineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    flex: 1, // the whole inline block fills remaining row space
  },
});

export default InlineTodoText;
