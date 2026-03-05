// import React, { useEffect, useMemo, useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   ScrollView,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import * as SQLite from "expo-sqlite";
// import * as FileSystem from "expo-file-system";
// import * as Sharing from "expo-sharing";

// type Row = Record<string, any>;

// export default function DBInspector() {
//   const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
//   const [tables, setTables] = useState<string[]>([]);
//   const [selectedTable, setSelectedTable] = useState<string | null>(null);
//   const [columns, setColumns] = useState<string[]>([]);
//   const [rows, setRows] = useState<Row[]>([]);
//   const [offset, setOffset] = useState(0);
//   const pageSize = 50;

//   useEffect(() => {
//     (async () => {
//       const d = await SQLite.openDatabaseAsync("bufib.db"); // <- ggf. deinen Namen einsetzen
//       setDb(d);
//     })();
//   }, []);

//   useEffect(() => {
//     if (!db) return;
//     (async () => {
//       // Tabellen auflisten
//       const result = await db.getAllAsync<{ name: string }>(
//         "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
//       );
//       setTables(result.map((r) => r.name));
//     })().catch((e) => Alert.alert("DB Fehler", String(e)));
//   }, [db]);

//   const loadTable = async (name: string, start = 0) => {
//     if (!db) return;
//     setSelectedTable(name);
//     setOffset(start);

//     // Spalten
//     const info = await db.getAllAsync<any>(
//       `PRAGMA table_info(${JSON.stringify(name)});`
//     );
//     const cols = info.map((c: any) => c.name as string);
//     setColumns(cols);

//     // Zeilen
//     const data = await db.getAllAsync<Row>(
//       `SELECT * FROM "${name}" LIMIT ${pageSize} OFFSET ${start};`
//     );
//     setRows(data);
//   };

//   const exportDb = async () => {
//     try {
//       // Pfad der DB-Datei ermitteln (iOS/Android kopiert Expo-SQLite die Datei intern).
//       // Wir kopieren die Datei in Documents und teilen sie.
//       // Achtung: Bei first run existiert Datei evtl. erst nach irgendeinem write.
//       const src = `${FileSystem.documentDirectory}SQLite/app.db`; // Dateiname wie oben!
//       const exists = await FileSystem.getInfoAsync(src);
//       if (!exists.exists) {
//         Alert.alert(
//           "Export",
//           "Die DB-Datei wurde noch nicht angelegt (keine Schreibzugriffe?)."
//         );
//         return;
//       }
//       const dest = `${FileSystem.documentDirectory}app-export.db`;
//       await FileSystem.copyAsync({ from: src, to: dest });
//       if (await Sharing.isAvailableAsync()) {
//         await Sharing.shareAsync(dest);
//       } else {
//         Alert.alert("Exportiert", `Gespeichert unter:\n${dest}`);
//       }
//     } catch (e) {
//       Alert.alert("Export-Fehler", String(e));
//     }
//   };

//   const nextPage = () => {
//     if (!selectedTable) return;
//     loadTable(selectedTable, offset + pageSize);
//   };
//   const prevPage = () => {
//     if (!selectedTable) return;
//     loadTable(selectedTable, Math.max(0, offset - pageSize));
//   };



//   return (
//     <View style={{ flex: 1, padding: 12 }}>
//       <View style={styles.header}>
//         <Text style={styles.title}>SQLite Inspector</Text>
//         <TouchableOpacity onPress={exportDb} style={styles.btn}>
//           <Text style={styles.btnText}>Export DB</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Tabellenliste */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={{ marginBottom: 8 }}
//       >
//         {tables.map((t) => (
//           <TouchableOpacity
//             key={t}
//             onPress={() => loadTable(t, 0)}
//             style={[styles.chip, selectedTable === t && styles.chipActive]}
//           >
//             <Text
//               style={[
//                 styles.chipText,
//                 selectedTable === t && styles.chipTextActive,
//               ]}
//             >
//               {t}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </ScrollView>

//       {/* Tabelleninhalt */}
//       {selectedTable ? (
//         <View style={{ flex: 1 }}>
//           <Text style={styles.tableTitle}>{selectedTable}</Text>
//           {/* Kopfzeile */}
//           <ScrollView
//             horizontal
//             style={{ borderBottomWidth: StyleSheet.hairlineWidth }}
//           >
//             <View style={styles.row}>
//               {columns.map((c) => (
//                 <Text
//                   key={c}
//                   style={[styles.cell, styles.headerCell]}
//                   numberOfLines={1}
//                 >
//                   {c}
//                 </Text>
//               ))}
//             </View>
//           </ScrollView>

//           {/* Zeilen */}
//           <ScrollView horizontal>
//             <FlatList
//               data={rows}
//               keyExtractor={(_, i) => String(i)}
//               renderItem={({ item }) => (
//                 <View style={styles.row}>
//                   {columns.map((c) => (
//                     <Text key={c} style={styles.cell}>
//                       {formatValue(item[c])}
//                     </Text>
//                   ))}
//                 </View>
//               )}
//               ListEmptyComponent={
//                 <Text style={{ padding: 16, opacity: 0.6 }}>Keine Daten.</Text>
//               }
//             />
//           </ScrollView>

//           {/* Pagination */}
//           <View style={styles.pager}>
//             <TouchableOpacity onPress={prevPage} style={styles.btnSmall}>
//               <Text style={styles.btnText}>◀ Zurück</Text>
//             </TouchableOpacity>
//             <Text style={{ paddingHorizontal: 8 }}>Offset: {offset}</Text>
//             <TouchableOpacity onPress={nextPage} style={styles.btnSmall}>
//               <Text style={styles.btnText}>Weiter ▶</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       ) : (
//         <Text style={{ opacity: 0.6 }}>Wähle oben eine Tabelle aus.</Text>
//       )}
//     </View>
//   );
// }

// function formatValue(v: any) {
//   if (v === null || v === undefined) return "NULL";
//   if (typeof v === "object") return JSON.stringify(v);
//   return String(v);
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   title: { fontSize: 18, fontWeight: "600" },
//   btn: {
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 8,
//     backgroundColor: "#222",
//   },
//   btnSmall: {
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 8,
//     backgroundColor: "#222",
//   },
//   btnText: { color: "#fff" },
//   chip: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 999,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     marginRight: 8,
//   },
//   chipActive: { backgroundColor: "#222", borderColor: "#222" },
//   chipText: { color: "#222" },
//   chipTextActive: { color: "#fff" },
//   tableTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
//   row: {
//     flexDirection: "row",
//     borderBottomWidth: StyleSheet.hairlineWidth,
//     borderColor: "#ddd",
//   },
//   headerCell: { fontWeight: "600" },
//   cell: { minWidth: 140, padding: 8 },
//   pager: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 8,
//     gap: 8,
//   },
// });
