import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  useColorScheme,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  getFavoritePrayersForFolder,
  getFavoritePrayerFolders,
  removeFolder,
} from "@/db/queries/prayers";
import { FavoritePrayerFolderType, PrayerType } from "@/constants/Types";
import { router, useFocusEffect } from "expo-router";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { LoadingIndicator } from "./LoadingIndicator";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { useDataVersionStore } from "@/stores/dataVersionStore";

const RenderFavoritePrayers: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() || "light";

  // Zustand trigger (useful if other screens must refresh too)
  // const { lang } = useLanguage();
  const [folders, setFolders] = useState<FavoritePrayerFolderType[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [prayers, setPrayers] = useState<PrayerType[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingPrayers, setIsLoadingPrayers] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const prayersFavoritesVersion = useDataVersionStore(
    (s) => s.prayersFavoritesVersion
  );
  const incrementPrayersFavoritesVersion = useDataVersionStore(
    (s) => s.incrementPrayersFavoritesVersion
  );
  // track mount/unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // const reloadFolders = useCallback(async () => {
  //   setIsLoadingFolders(true);
  //   try {
  //     const arr = await getFavoritePrayerFolders();
  //     setFolders(arr);

  //     // Keep current selection if it still exists; otherwise pick first or null
  //     setSelectedFolder((prev) =>
  //       prev && arr.some((f) => f.name === prev) ? prev : arr[0]?.name ?? null
  //     );
  //   } catch (err) {
  //     console.error("Failed to load favorite folders:", err);
  //     Alert.alert(t("error"), t("noData"));
  //   } finally {
  //     setIsLoadingFolders(false);
  //   }
  // }, [lang, favoritesRefreshed, prayersFavoritesVersion]);

  const reloadFolders = useCallback(async () => {
    setIsLoadingFolders(true);
    try {
      const arr = await getFavoritePrayerFolders();
      if (!mountedRef.current) return;

      setFolders(arr);
      setSelectedFolder((prev) =>
        prev && arr.some((f) => f.name === prev) ? prev : arr[0]?.name ?? null
      );
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("Failed to load favorite folders:", err);
      Alert.alert(t("error"), t("noData"));
    } finally {
      if (mountedRef.current) setIsLoadingFolders(false);
    }
  }, [t]);

  const reloadPrayers = useCallback(async (folder: string | null) => {
    // new logical request id
    const reqId = ++requestIdRef.current;

    // cancel any previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!folder) {
      if (mountedRef.current && reqId === requestIdRef.current) {
        setPrayers([]);
        setIsLoadingPrayers(false);
      }
      return;
    }

    try {
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current && reqId === requestIdRef.current) {
          setIsLoadingPrayers(true);
        }
      }, 300);

      const ps = await getFavoritePrayersForFolder(folder);

      // bail if unmounted or superseded by a newer call
      if (!mountedRef.current || reqId !== requestIdRef.current) return;

      setPrayers(ps);
    } catch (error) {
      console.log(error);
      if (!mountedRef.current || reqId !== requestIdRef.current) return;
      // show alert/toast if you want
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (mountedRef.current && reqId === requestIdRef.current) {
        setIsLoadingPrayers(false);
      }
    }
  }, []);

  const onDeleteFolder = useCallback(
    async (name: string) => {
      // Optimistic UI: remove folder immediately, clear selection/list if it was active
      setFolders((prev) => prev.filter((f) => f.name !== name));
      setSelectedFolder((prev) => (prev === name ? null : prev));
      setPrayers([]); // hide prayers immediately if we just removed the active folder

      try {
        await removeFolder(name); // atomic DB delete
        // Confirm state from DB
        await reloadFolders();
        // selectedFolder effect will reload prayers automatically
        incrementPrayersFavoritesVersion(); // notify other screens (optional)
      } catch (e) {
        console.error(e);
        Alert.alert(t("error"), t("errorDeletingFolder"));
        // Roll back to server truth
        await reloadFolders();
        await reloadPrayers(selectedFolder);
      }
    },
    [
      selectedFolder,
      reloadFolders,
      reloadPrayers,
      incrementPrayersFavoritesVersion,
      t,
    ]
  );

  // Initial & external trigger reload
  useEffect(() => {
    reloadFolders();
  }, [reloadFolders, prayersFavoritesVersion]);

  // Load prayers whenever selectedFolder changes
  useEffect(() => {
    reloadPrayers(selectedFolder);
  }, [selectedFolder, reloadPrayers, prayersFavoritesVersion]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Screen is losing focus - cleanup
        setIsEditing(false);
      };
    }, [])
  );

  const listExtraData = React.useMemo(
    () => `${prayersFavoritesVersion}|${prayersFavoritesVersion}`,
    [prayersFavoritesVersion]
  );

  const renderFolderPill = (folder: FavoritePrayerFolderType) => {
    const isActive = folder.name === selectedFolder;
    return (
      <TouchableOpacity
        key={folder.name}
        style={[
          styles.folderPill,
          { backgroundColor: Colors[colorScheme].contrast, gap: 10 },
          isActive && {
            opacity: 1,
            borderWidth: 2,
            borderColor: Colors[colorScheme].border,
          },
        ]}
        onPress={() => setSelectedFolder(folder.name)}
        activeOpacity={0.8}
      >
        <Entypo name="folder" size={24} color={folder.color} />
        <ThemedText
          style={[
            styles.folderPillText,
            isActive && styles.folderPillTextActive,
          ]}
        >
          {folder.name} ({folder.prayerCount})
        </ThemedText>
        {isEditing && (
          <AntDesign
            name="minus-circle"
            size={22}
            color={Colors[colorScheme].error}
            style={{ alignSelf: "flex-end" }}
            onPress={() => {
              Alert.alert(t("confirmDelete"), t("deleteFolder"), [
                { text: t("cancel"), style: "cancel" },
                {
                  text: t("delete"),
                  style: "destructive",
                  onPress: () => onDeleteFolder(folder.name),
                },
              ]);
            }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderPrayerCard = ({ item }: { item: PrayerType }) => (
    <TouchableOpacity
      style={[
        styles.prayerCard,
        { backgroundColor: Colors[colorScheme].contrast },
      ]}
      onPress={() => {
        router.push({
          pathname: "/(displayPrayer)/prayer",
          params: { prayer: item.id.toString() },
        });
      }}
      activeOpacity={0.85}
    >
      <ThemedText style={styles.prayerName}>{item.name}</ThemedText>
      {item.arabic_title ? (
        <ThemedText style={styles.prayerArabicTitle}>
          {item.arabic_title}
        </ThemedText>
      ) : null}
    </TouchableOpacity>
  );

  // --- UI -------------------------------------------------------------------

  return (
    <ThemedView style={styles.container}>
      {/* Folder pills */}
      <View style={styles.pillContainer}>
        {isLoadingFolders ? (
          <LoadingIndicator size="large" />
        ) : (
          <ThemedView>
            {folders.length > 0 && (
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  marginRight: 20,
                  marginBottom: 10,
                }}
                onPress={() => setIsEditing((prev) => !prev)}
              >
                <ThemedText
                  style={{ fontSize: 20, color: Colors.universal.link }}
                >
                  {isEditing ? t("done") : t("edit")}
                </ThemedText>
              </TouchableOpacity>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {folders.map(renderFolderPill)}
            </ScrollView>
          </ThemedView>
        )}
      </View>

      {/* Prayer list */}
      <View style={styles.prayerListContainer}>
        {isLoadingPrayers ? (
          <LoadingIndicator size="large" />
        ) : prayers.length === 0 ? (
          <ThemedView style={styles.centeredContainer}>
            <ThemedText style={styles.emptyText}>{t("noFavorites")}</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={prayers}
            extraData={listExtraData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPrayerCard}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>
    </ThemedView>
  );
};

export default RenderFavoritePrayers;

// --- Styles -----------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    gap: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    marginHorizontal: 16,
    marginVertical: 12,
  },
  pillContainer: {
    paddingLeft: 16,
  },
  folderPill: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    opacity: 0.8,
  },
  folderPillActive: {},
  folderPillText: {
    fontSize: 14,
    fontWeight: "600",
  },
  folderPillTextActive: {},
  prayerListContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  flatListContent: {
    paddingTop: 15,
    gap: 20,
    paddingBottom: 24,
  },
  prayerCard: {
    borderRadius: 8,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 5 },
    }),
  },
  prayerName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  prayerArabicTitle: {
    fontSize: 14,
    fontStyle: "italic",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    textAlign: "center",
  },
  emptyText: {
    textAlign: "center",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
  },
});
