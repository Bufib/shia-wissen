import React, { useMemo } from "react";
import RenderHTML from "react-native-render-html";
import { Colors } from "@/constants/Colors";
import type { MixedStyleDeclaration } from "react-native-render-html";

const TAGS_STYLES = Object.freeze({
  u: { textDecorationLine: "underline" as const },
  b: { fontWeight: "700" as const },
  i: { fontStyle: "italic" as const },
});

const DEFAULT_TEXT_PROPS = Object.freeze({ selectable: true });
const IGNORED_TAGS = ["script", "style"] as const;

type HtmlRendererProps = {
  html: string;
  contentWidth: number;
  fontSize?: number;
};

export default function HtmlRenderer({
  html,
  contentWidth,
}: HtmlRendererProps) {
  const fontSize = 16;

  const source = useMemo(() => ({ html: `<div>${html}</div>` }), [html]);

  const baseStyle = useMemo<MixedStyleDeclaration>(
    () => ({
      fontStyle: "italic",
      fontWeight: "400",
      textAlign: "left",
      color: Colors.universal.grayedOut,
      fontSize: fontSize,
      marginTop: 5,
      marginBottom: 5,
    }),
    [fontSize]
  );

  return (
    <RenderHTML
      contentWidth={contentWidth}
      source={source}
      baseStyle={baseStyle}
      defaultTextProps={DEFAULT_TEXT_PROPS}
      ignoredDomTags={IGNORED_TAGS as any}
      tagsStyles={TAGS_STYLES as any}
    />
  );
}
