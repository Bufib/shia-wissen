// import React, { useMemo } from "react";
// import { Text, View, Linking, StyleSheet } from "react-native";

// interface MarkdownProps {
//   content: string;
//   fontSize: number;
//   lineHeight: number;
//   textColor: string;
//   linkColor: string;
//   headingColor: string;
// }

// export function SimpleMarkdown({
//   content,
//   fontSize,
//   lineHeight,
//   textColor,
//   linkColor,
//   headingColor,
// }: MarkdownProps) {
//   const elements = useMemo(() => {
//     const lines = (content ?? "").split("\n");
//     const result: React.ReactNode[] = [];
//     let currentParagraph: React.ReactNode[] = [];
//     let key = 0;

//     const processInlineStyles = (text: string): React.ReactNode[] => {
//       const parts: React.ReactNode[] = [];
//       let remaining = text;
//       let inlineKey = 0;

//       while (remaining.length > 0) {
//         const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
//         const italicMatch = remaining.match(
//           /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/
//         );
//         const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

//         const matches = [
//           boldMatch
//             ? { type: "bold", match: boldMatch, index: boldMatch.index! }
//             : null,
//           italicMatch
//             ? { type: "italic", match: italicMatch, index: italicMatch.index! }
//             : null,
//           linkMatch
//             ? { type: "link", match: linkMatch, index: linkMatch.index! }
//             : null,
//         ]
//           .filter(Boolean)
//           .sort((a, b) => a!.index - b!.index);

//         if (matches.length === 0) {
//           parts.push(remaining);
//           break;
//         }

//         const firstMatch = matches[0]!;

//         // Add text before match
//         if (firstMatch.index > 0) {
//           parts.push(remaining.slice(0, firstMatch.index));
//         }

//         if (firstMatch.type === "bold") {
//           parts.push(
//             <Text key={`bold-${inlineKey++}`} style={{ fontWeight: "700" }}>
//               {firstMatch.match[1]}
//             </Text>
//           );
//           remaining = remaining.slice(
//             firstMatch.index + firstMatch.match[0].length
//           );
//         } else if (firstMatch.type === "italic") {
//           parts.push(
//             <Text key={`italic-${inlineKey++}`} style={{ fontStyle: "italic" }}>
//               {firstMatch.match[1]}
//             </Text>
//           );
//           remaining = remaining.slice(
//             firstMatch.index + firstMatch.match[0].length
//           );
//         } else if (firstMatch.type === "link") {
//           const url = firstMatch.match[2];
//           parts.push(
//             <Text
//               key={`link-${inlineKey++}`}
//               style={{
//                 color: linkColor,
//                 textDecorationLine: "underline",
//               }}
//               onPress={() => Linking.openURL(url)}
//             >
//               {firstMatch.match[1]}
//             </Text>
//           );
//           remaining = remaining.slice(
//             firstMatch.index + firstMatch.match[0].length
//           );
//         }
//       }

//       return parts;
//     };

//     const flushParagraph = () => {
//       if (currentParagraph.length === 0) return;

//       result.push(
//         <View
//           key={`p-wrap-${key}`}
//           style={{
//             width: "100%",
//             alignSelf: "stretch",
//           }}
//         >
//           <Text
//             key={`p-${key++}`}
//             style={{
//               color: textColor,
//               fontSize,
//               lineHeight,
//               marginBottom: 16,

//               // ✅ crucial for big font sizes
//               width: "100%",
//               flexShrink: 1,
//               flexWrap: "wrap",
//               alignSelf: "stretch",
//             }}
//           >
//             {currentParagraph}
//           </Text>
//         </View>
//       );

//       currentParagraph = [];
//     };

//     const parseTable = (
//       startIndex: number
//     ): { element: React.ReactNode; endIndex: number } | null => {
//       const tableLines: string[] = [];
//       let i = startIndex;

//       while (i < lines.length) {
//         const line = lines[i].trim();
//         if (line.startsWith("|") && line.endsWith("|")) {
//           tableLines.push(line);
//           i++;
//         } else if (tableLines.length > 0) {
//           break;
//         } else {
//           return null;
//         }
//       }

//       if (tableLines.length < 2) return null;

//       const parseRow = (line: string): string[] => {
//         return line
//           .slice(1, -1)
//           .split("|")
//           .map((cell) => cell.trim());
//       };

//       const headerCells = parseRow(tableLines[0]);
//       const isSeparator = tableLines[1].includes("---");
//       const dataStartIndex = isSeparator ? 2 : 1;
//       const dataRows = tableLines.slice(dataStartIndex).map(parseRow);

//       const element = (
//         <View key={`table-${key++}`} style={styles.table}>
//           <View style={[styles.tableRow, styles.tableHeaderRow]}>
//             {headerCells.map((cell, cellIndex) => (
//               <View
//                 key={`header-${cellIndex}`}
//                 style={[
//                   styles.tableCell,
//                   styles.tableHeaderCell,
//                   cellIndex === 0 && styles.tableCellFirst,
//                   cellIndex === headerCells.length - 1 && styles.tableCellLast,
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.tableCellText,
//                     styles.tableHeaderText,
//                     {
//                       color: headingColor,
//                       fontSize: fontSize * 0.9,

//                       // ✅
//                       flexShrink: 1,
//                       flexWrap: "wrap",
//                     },
//                   ]}
//                 >
//                   {processInlineStyles(cell)}
//                 </Text>
//               </View>
//             ))}
//           </View>

//           {dataRows.map((row, rowIndex) => (
//             <View
//               key={`row-${rowIndex}`}
//               style={[
//                 styles.tableRow,
//                 rowIndex === dataRows.length - 1 && styles.tableRowLast,
//               ]}
//             >
//               {row.map((cell, cellIndex) => (
//                 <View
//                   key={`cell-${rowIndex}-${cellIndex}`}
//                   style={[
//                     styles.tableCell,
//                     cellIndex === 0 && styles.tableCellFirst,
//                     cellIndex === row.length - 1 && styles.tableCellLast,
//                   ]}
//                 >
//                   <Text
//                     style={[
//                       styles.tableCellText,
//                       {
//                         color: textColor,
//                         fontSize: fontSize * 0.9,

//                         // ✅
//                         flexShrink: 1,
//                         flexWrap: "wrap",
//                       },
//                     ]}
//                   >
//                     {processInlineStyles(cell)}
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           ))}
//         </View>
//       );

//       return { element, endIndex: i - 1 };
//     };

//     let i = 0;
//     while (i < lines.length) {
//       const line = lines[i];
//       const trimmed = line.trim();

//       // Empty line => new paragraph
//       if (trimmed === "") {
//         flushParagraph();
//         i++;
//         continue;
//       }

//       // Table
//       if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
//         flushParagraph();
//         const tableResult = parseTable(i);
//         if (tableResult) {
//           result.push(tableResult.element);
//           i = tableResult.endIndex + 1;
//           continue;
//         }
//       }

//       // Headings
//       const h1Match = trimmed.match(/^# (.+)$/);
//       const h2Match = trimmed.match(/^## (.+)$/);
//       const h3Match = trimmed.match(/^### (.+)$/);

//       if (h1Match) {
//         flushParagraph();
//         result.push(
//           <Text
//             key={`h1-${key++}`}
//             style={{
//               color: headingColor,
//               fontSize: fontSize * 1.8,
//               fontWeight: "800",
//               lineHeight: fontSize * 1.8 * 1.3,
//               marginBottom: 20,
//               marginTop: 32,

//               // ✅
//               width: "100%",
//               flexShrink: 1,
//               flexWrap: "wrap",
//               alignSelf: "stretch",
//             }}
//           >
//             {processInlineStyles(h1Match[1])}
//           </Text>
//         );
//         i++;
//         continue;
//       }

//       if (h2Match) {
//         flushParagraph();
//         result.push(
//           <Text
//             key={`h2-${key++}`}
//             style={{
//               color: headingColor,
//               fontSize: fontSize * 1.5,
//               fontWeight: "700",
//               lineHeight: fontSize * 1.5 * 1.3,
//               marginBottom: 16,
//               marginTop: 28,

//               // ✅
//               width: "100%",
//               flexShrink: 1,
//               flexWrap: "wrap",
//               alignSelf: "stretch",
//             }}
//           >
//             {processInlineStyles(h2Match[1])}
//           </Text>
//         );
//         i++;
//         continue;
//       }

//       if (h3Match) {
//         flushParagraph();
//         result.push(
//           <Text
//             key={`h3-${key++}`}
//             style={{
//               color: headingColor,
//               fontSize: fontSize * 1.3,
//               fontWeight: "700",
//               lineHeight: fontSize * 1.3 * 1.3,
//               marginBottom: 12,
//               marginTop: 24,

//               // ✅
//               width: "100%",
//               flexShrink: 1,
//               flexWrap: "wrap",
//               alignSelf: "stretch",
//             }}
//           >
//             {processInlineStyles(h3Match[1])}
//           </Text>
//         );
//         i++;
//         continue;
//       }

//       // Bullet points
//       const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
//       if (bulletMatch) {
//         flushParagraph();

//         const bulletItems: string[] = [];
//         while (i < lines.length) {
//           const bulletLine = lines[i].trim();
//           const itemMatch = bulletLine.match(/^[-*•]\s+(.+)$/);
//           if (itemMatch) {
//             bulletItems.push(itemMatch[1]);
//             i++;
//           } else if (bulletLine === "") {
//             if (i + 1 < lines.length) {
//               const nextLine = lines[i + 1].trim();
//               if (nextLine.match(/^[-*•]\s+(.+)$/)) {
//                 i++;
//                 continue;
//               }
//             }
//             break;
//           } else {
//             break;
//           }
//         }

//         result.push(
//           <View key={`bullets-${key++}`} style={styles.bulletList}>
//             {bulletItems.map((item, idx) => (
//               <View key={`bullet-${idx}`} style={styles.bulletItem}>
//                 <Text
//                   style={[
//                     styles.bulletPoint,
//                     { color: textColor, fontSize, lineHeight },
//                   ]}
//                 >
//                   •
//                 </Text>
//                 <Text
//                   style={[
//                     styles.bulletText,
//                     {
//                       color: textColor,
//                       fontSize,
//                       lineHeight,

//                       // ✅
//                       flexShrink: 1,
//                       flexWrap: "wrap",
//                     },
//                   ]}
//                 >
//                   {processInlineStyles(item)}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         );
//         continue;
//       }

//       // Numbered list
//       const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
//       if (numberedMatch) {
//         flushParagraph();

//         const numberedItems: { num: string; text: string }[] = [];
//         while (i < lines.length) {
//           const numLine = lines[i].trim();
//           const itemMatch = numLine.match(/^(\d+)\.\s+(.+)$/);
//           if (itemMatch) {
//             numberedItems.push({ num: itemMatch[1], text: itemMatch[2] });
//             i++;
//           } else if (numLine === "") {
//             if (i + 1 < lines.length) {
//               const nextLine = lines[i + 1].trim();
//               if (nextLine.match(/^(\d+)\.\s+(.+)$/)) {
//                 i++;
//                 continue;
//               }
//             }
//             break;
//           } else {
//             break;
//           }
//         }

//         result.push(
//           <View key={`numbered-${key++}`} style={styles.bulletList}>
//             {numberedItems.map((item, idx) => (
//               <View key={`num-${idx}`} style={styles.bulletItem}>
//                 <Text
//                   style={[
//                     styles.numberedPoint,
//                     { color: textColor, fontSize, lineHeight },
//                   ]}
//                 >
//                   {item.num}.
//                 </Text>
//                 <Text
//                   style={[
//                     styles.bulletText,
//                     {
//                       color: textColor,
//                       fontSize,
//                       lineHeight,

//                       // ✅
//                       flexShrink: 1,
//                       flexWrap: "wrap",
//                     },
//                   ]}
//                 >
//                   {processInlineStyles(item.text)}
//                 </Text>
//               </View>
//             ))}
//           </View>
//         );
//         continue;
//       }

//       // Regular text (paragraph)
//       if (currentParagraph.length > 0) {
//         currentParagraph.push(" ");
//       }
//       currentParagraph.push(...processInlineStyles(trimmed));
//       i++;
//     }

//     flushParagraph();
//     return result;
//   }, [content, fontSize, lineHeight, textColor, linkColor, headingColor]);

//   return (
//     <View style={{ width: "100%", alignSelf: "stretch" }}>
//       {elements}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   bulletList: {
//     marginBottom: 16,
//     marginTop: 8,
//     width: "100%",
//     alignSelf: "stretch",
//   },
//   bulletItem: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     marginBottom: 8,
//     width: "100%",
//     alignSelf: "stretch",
//   },
//   bulletPoint: {
//     width: 20,
//     textAlign: "center",
//   },
//   numberedPoint: {
//     width: 28,
//     textAlign: "right",
//     paddingRight: 8,
//   },
//   bulletText: {
//     flex: 1,
//     minWidth: 0, // ✅ super important inside row
//   },

//   table: {
//     marginVertical: 16,
//     borderRadius: 8,
//     overflow: "hidden",
//     borderWidth: 1,
//     borderColor: "rgba(128, 128, 128, 0.3)",
//     width: "100%",
//     alignSelf: "stretch",
//   },
//   tableRow: {
//     flexDirection: "row",
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(128, 128, 128, 0.2)",
//     width: "100%",
//   },
//   tableRowLast: {
//     borderBottomWidth: 0,
//   },
//   tableHeaderRow: {
//     backgroundColor: "rgba(128, 128, 128, 0.1)",
//   },
//   tableCell: {
//     flex: 1,
//     padding: 12,
//     borderRightWidth: 1,
//     borderRightColor: "rgba(128, 128, 128, 0.2)",

//     // ✅ critical in flexDirection:"row"
//     minWidth: 0,
//   },
//   tableCellFirst: {},
//   tableCellLast: {
//     borderRightWidth: 0,
//   },
//   tableHeaderCell: {},
//   tableCellText: {},
//   tableHeaderText: {
//     fontWeight: "600",
//   },
// });
