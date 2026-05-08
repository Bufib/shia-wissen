// import PdfPreviewCard from "@/components/PdfPreviewCard";
// import RetryButton from "@/components/RetryButton";
// import { ThemedText } from "@/components/ThemedText";
// import { Colors } from "@/constants/Colors";
// import { PdfType } from "@/constants/Types";
// import { LoadingIndicator } from "@/components/LoadingIndicator";
// import { router } from "expo-router";
// import React from "react";
// import { useTranslation } from "react-i18next";
// import {
//   FlatList,
//   Pressable,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   useColorScheme,
//   View,
// } from "react-native";

// type PdfSectionProps = {
//   pdfs: PdfType[];
//   isLoading: boolean;
//   isError: boolean;
//   errorMessage?: string;
//   fetchNextPage: () => void;
//   hasNextPage?: boolean;
//   isFetchingNextPage: boolean;
// };

// export default function PdfSection({
//   pdfs,
//   isLoading,
//   isError,
//   errorMessage,
//   fetchNextPage,
//   hasNextPage,
//   isFetchingNextPage,
// }: PdfSectionProps) {
//   const colorScheme = useColorScheme() ?? "light";
//   const { t } = useTranslation();

//   if (pdfs.length === 0 && !isLoading && !isError) {
//     return null;
//   }

//   return (
//     <View style={styles.section}>
//       <View style={styles.sectionHeaderRow}>
//         <ThemedText style={styles.sectionLabel}>
//           {t("pdfsTitle").toUpperCase()}
//         </ThemedText>

//         <Pressable
//           onPressIn={() => router.push("/(tabs)/home/allPdfs")}
//           hitSlop={styles.showAllHitSlop}
//           style={({ pressed }) => pressed && { opacity: 0.6 }}
//         >
//           <Text style={[styles.showAllText, { color: Colors.universal.link }]}>
//             {t("showAll")}
//           </Text>
//         </Pressable>
//       </View>

//       {isLoading && (
//         <LoadingIndicator style={styles.sectionLoader} size="large" />
//       )}

//       {isError && (
//         <View style={styles.errorContainer}>
//           <Text
//             style={[styles.errorText, { color: Colors[colorScheme].error }]}
//           >
//             {errorMessage ?? t("errorLoadingData")}
//           </Text>

//           <RetryButton onPress={fetchNextPage} />
//         </View>
//       )}

//       {!isLoading && !isError && (
//         <FlatList
//           data={pdfs}
//           numColumns={2}
//           keyExtractor={(item) => item.id.toString()}
//           showsHorizontalScrollIndicator={false}
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.pdfListContent}
//           columnWrapperStyle={styles.pdfRow}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               style={styles.pdfItem}
//               activeOpacity={0.8}
//               onPress={() =>
//                 router.push({
//                   pathname: "/(pdfs)",
//                   params: { filename: item.pdf_filename },
//                 })
//               }
//             >
//               <PdfPreviewCard pdf={item} />
//             </TouchableOpacity>
//           )}
//           onEndReached={() => {
//             if (hasNextPage && !isFetchingNextPage) {
//               fetchNextPage();
//             }
//           }}
//           onEndReachedThreshold={0.5}
//           ListFooterComponent={() =>
//             isFetchingNextPage ? (
//               <LoadingIndicator style={styles.footerLoader} size="small" />
//             ) : null
//           }
//         />
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   section: {
//     gap: 10,
//   },
//   sectionHeaderRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingRight: 12,
//   },
//   sectionLabel: {
//     fontSize: 16,
//     fontWeight: "700",
//     letterSpacing: 1.2,
//     paddingHorizontal: 20,
//   },
//   showAllText: {
//     fontSize: 14,
//     fontWeight: "600",
//   },
//   showAllHitSlop: {
//     top: 8,
//     bottom: 8,
//     left: 8,
//     right: 8,
//   },
//   sectionLoader: {
//     marginVertical: 24,
//   },
//   pdfListContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//     gap: 12,
//   },
//   pdfRow: {
//     gap: 12,
//   },
//   pdfItem: {
//     flex: 1,
//   },
//   footerLoader: {
//     marginTop: 16,
//   },
//   errorContainer: {
//     alignItems: "center",
//     gap: 10,
//     paddingVertical: 16,
//   },
//   errorText: {
//     fontSize: 16,
//   },
// });