
import React, { useMemo } from "react";
import { Linking, Platform, TextStyle, useColorScheme } from "react-native";
import {
  EnrichedMarkdownText,
  type MarkdownStyle,
} from "react-native-enriched-markdown";
import { useFontSizeStore } from "../../stores/fontSizeStore";
import { Colors } from "@/constants/Colors";
import {
  getScaledFontSize,
  getScaledLineHeight,
  type TextType,
} from "@/constants/typography";

type Props = {
  children: string;
  type?: TextType;
  style?: TextStyle;
};

function preserveBackticksAsText(text: string) {
  return text.replace(/`/g, "\\`");
}

export const RichText = ({ children, type = "latin", style }: Props) => {
  const colorScheme = useColorScheme() || "light";
  const baseFontSize = useFontSizeStore((s) => s.fontSize);

  const computedFontSize = getScaledFontSize(baseFontSize, type);
  const computedLineHeight =
    getScaledLineHeight(baseFontSize, type) + (Platform.OS === "android" ? 2 : 1);

  const safeMarkdown = useMemo(() => preserveBackticksAsText(children), [children]);

  const markdownStyle = useMemo<MarkdownStyle>(() => {
    const textColor =
      typeof style?.color === "string" ? style.color : Colors[colorScheme].text;

      
    return {
      paragraph: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 0,
        textAlign: style?.textAlign,
      },
      list: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 0,
        gapWidth: 8,
      },
      blockquote: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 0,
      },
      codeBlock: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 0,
      },
      h1: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 8,
        fontWeight: "700",
      },
      h2: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 8,
        fontWeight: "700",
      },
      h3: {
        color: textColor,
        fontSize: computedFontSize,
        lineHeight: computedLineHeight,
        marginTop: 0,
        marginBottom: 8,
        fontWeight: "700",
      },
      link: {
        color: Colors[colorScheme].tint,
        textDecorationLine: "underline",
      },
    };
  }, [colorScheme, computedFontSize, computedLineHeight, style?.color, style?.textAlign]);

  return (
    <EnrichedMarkdownText
      key={`${type}-${computedFontSize}-${computedLineHeight}-${children.length}`}
      markdown={safeMarkdown}
      flavor="commonmark"
      selectable
      markdownStyle={markdownStyle}
      containerStyle={{
        width: "100%",
        alignSelf: "stretch",
      }}
      onLinkPress={({ url }) => {
        if (url) Linking.openURL(url);
      }}
    />
  );
};