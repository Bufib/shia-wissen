import React, { useEffect, useCallback } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import useNotificationStore from "../../stores/notificationStore";
import { safeInitializeDatabase } from "../../db";
import { runDatabaseSync } from "../../db/runDatabaseSync";

const REFETCH_THRESHOLD = 0.5 * 60 * 1000; // 30 sec
const LAST_FETCH_KEY = "lastFetchTime";

interface ReMountManagerProps {
  children: React.ReactNode;
  onInitialize?: () => void;
}

const ReMountManager = ({ children, onInitialize }: ReMountManagerProps) => {
  const checkPermissions = useNotificationStore(
    (state) => state.checkPermissions
  );

  const updateLastFetchTime = useCallback(async () => {
    await AsyncStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
  }, []);

  const shouldReinitialize = useCallback(async () => {
    const raw = await AsyncStorage.getItem(LAST_FETCH_KEY);
    const last = Number(raw); // stricter than parseInt
    const lastSafe = Number.isFinite(last) ? last : 0;
    const timeSince = Math.max(0, Date.now() - lastSafe); // clamp to >= 0
    return timeSince > REFETCH_THRESHOLD;
  }, []);

  // Use your guarded core sync instead of the old initializeDatabase()
  const runSyncIfNeeded = useCallback(async () => {
    try {
      await safeInitializeDatabase(() => runDatabaseSync());
      await updateLastFetchTime();
      onInitialize?.();
    } catch (error) {
      console.error("Error reinitializing database:", error);
    }
  }, [updateLastFetchTime, onInitialize]);

  const handleAppStateChange = useCallback(
    async (nextAppState: AppState["currentState"]) => {
      try {
        const netState = await NetInfo.fetch();
        if (nextAppState === "active") {
          await checkPermissions();
          if (netState.isConnected) {
            const needsReinitialization = await shouldReinitialize();
            if (needsReinitialization) {
              await runSyncIfNeeded();
            }
          }
        } else if (
          nextAppState === "background" ||
          nextAppState === "inactive"
        ) {
          await updateLastFetchTime();
        }
      } catch (error) {
        console.error("Error handling app state change:", error);
      }
    },
    [checkPermissions, shouldReinitialize, runSyncIfNeeded, updateLastFetchTime]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );
    return () => subscription.remove();
  }, [handleAppStateChange]);

  return <>{children}</>;
};

export default ReMountManager;
