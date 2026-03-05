import { useEffect, useRef, useCallback, useState, useMemo } from "react";
import { Alert, Platform } from "react-native";
import Constants from "expo-constants";
import debounce from "lodash.debounce";
import {
  checkInternetConnection,
  setupConnectivityListener,
} from "@/utils/checkNetwork";
import handleOpenExternalUrl from "@/utils/handleOpenExternalUrl";
import { getQuestionCount } from "@/db/queries/questions";
import { whenDatabaseReady, safeInitializeDatabase } from "@/db";
import { runDatabaseSync } from "@/db/runDatabaseSync";
import { fetchAppVersionFromSupabase } from "@/db/sync/versions";
import { supabase } from "@/utils/supabase";
import {
  databaseUpdateCalendar,
  databaseUpdatePrayer,
  databaseUpdatePaypal,
  databaseUpdateQuestions,
  databaseUpdateQuran,
} from "@/constants/messages";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

/** Robust version comparison helper (null/undefined/number-safe). */
function changed(newVal: any, oldVal: any): boolean {
  const normalize = (val: any): string =>
    val === null || val === undefined ? "" : String(val);
  console.log(normalize(newVal) !== normalize(oldVal));
  return normalize(newVal) !== normalize(oldVal);
}

/** Main hook */
export function useDatabaseSync(): boolean {
  const [isReady, setIsReady] = useState(false);
  const [isInitialSyncComplete, setIsInitialSyncComplete] = useState(false);
  const { t } = useTranslation();
  // Mount + concurrency guards
  const isMountedRef = useRef(true);
  const isSyncingRef = useRef(false);
  const listenersSetupRef = useRef(false);
  // latest initializeDatabase for safeInitializeDatabase
  const initRef = useRef<() => Promise<void>>(async () => {});

  // Connectivity unsubscribe
  const connectivityUnsubRef = useRef<null | (() => void)>(null);

  // Supabase channels
  const verChannelRef = useRef<any>(null);

  // Guarded navigation to home

  const goHomeIfNeeded = useCallback(() => {
    if (!isMountedRef.current) return;
    // if (pathname !== "/home") {
    router.replace("/(tabs)/home");
    // }
  }, []);

  // Single-flight initialize wrapper
  const initializeSafely = useCallback(async () => {
    if (!isMountedRef.current) return;
    if (isSyncingRef.current) return; // coalesce
    await safeInitializeDatabase(initRef.current);
  }, []);

  // Debounce only the connectivity-triggered init (optional)
  const debouncedInit = useMemo(
    () =>
      debounce(() => {
        if (isMountedRef.current && !isSyncingRef.current) {
          void initializeSafely();
        }
      }, 3000),
    [initializeSafely]
  );

  // Connectivity cleanup
  const cleanupConnectivityListener = useCallback(() => {
    if (connectivityUnsubRef.current) {
      connectivityUnsubRef.current();
      connectivityUnsubRef.current = null;
    }
  }, []);

  // Can proceed offline?
  const canProceedOffline = async (): Promise<boolean> => {
    try {
      const questionCount = await getQuestionCount();
      return questionCount > 0;
    } catch {
      return false;
    }
  };

  const initializeDatabase = useCallback(async () => {
    if (!isMountedRef.current) return;

    isSyncingRef.current = true;
    try {
      // Wait for SQLite handle
      await whenDatabaseReady();

      const isOnline = await checkInternetConnection();

      // -------- OFFLINE PATH: proceed only if cached questions exist
      if (!isOnline) {
        const canProceed = await canProceedOffline();
        if (canProceed) {
          if (isMountedRef.current) {
            setIsReady(true); // show cached
          }
          return;
        }
        // Wait for connectivity and retry init (debounced)
        cleanupConnectivityListener();
        connectivityUnsubRef.current = setupConnectivityListener(() => {
          debouncedInit();
        });
        return;
      }

      // -------- ONLINE PATH: strictly gate on fully successful sync
      cleanupConnectivityListener();

      const getStoreURL = () =>
        Platform.OS === "ios"
          ? "https://apps.apple.com/de/app/islam-fragen/id6737857116"
          : "https://play.google.com/store/apps/details?id=com.bufib.islamFragen";

      let retries = 3;
      let lastError: any = null;

      while (retries > 0 && isMountedRef.current) {
        try {
          const syncResult = await runDatabaseSync();

          const hasErrors =
            !!syncResult &&
            syncResult.errors &&
            Object.keys(syncResult.errors).length > 0;

          if (hasErrors) {
            lastError = new Error(
              "Initial sync unsuccessful: " +
                Object.keys(syncResult.errors).join(", ")
            );
            throw lastError;
          }

          // Force-update prompt (no cooldown)
          const currentAppVersion = Constants.expoConfig?.version;
          const remoteAppVersion = await fetchAppVersionFromSupabase();
          if (
            currentAppVersion &&
            remoteAppVersion &&
            currentAppVersion !== remoteAppVersion
          ) {
            Alert.alert(t("updateAvailable"), t("newAppVersionAvailable"), [
              {
                text: t("update"),
                onPress: () => handleOpenExternalUrl(getStoreURL()),
              },
            ]);
          }

          if (isMountedRef.current) {
            setIsReady(true);
            setIsInitialSyncComplete(true); // attach realtime after success
          }
          return; // success → exit
        } catch (e) {
          lastError = e;
          retries--;
          if (retries > 0 && isMountedRef.current) {
            await new Promise((r) => setTimeout(r, (3 - retries) * 2000));
          }
        }
      }

      if (!isMountedRef.current) return;

      // Still online but sync never succeeded → block UI; let user retry.
      Alert.alert(
        t("error"),
        (lastError && (lastError.message || String(lastError))) ||
          t("syncFailedTryAgain"),
        [
          {
            text: t("retry"),
            onPress: () => void initializeSafely(),
          },
        ]
      );
      return;
    } catch (err: any) {
      console.error("Critical error during initialization:", err);
      if (!isMountedRef.current) return;

      // If offline cache exists, allow; otherwise block
      const canProceed = await canProceedOffline();
      if (canProceed) {
        if (isMountedRef.current) {
          setIsReady(true);
        }
      } else {
        Alert.alert(t("error"), err?.message ?? String(err), [
          {
            text: t("retry"),
            onPress: () => void initializeSafely(),
          },
        ]);
      }
    } finally {
      isSyncingRef.current = false;
    }
  }, [debouncedInit, initializeSafely, cleanupConnectivityListener, t]);

  // Keep latest initializeDatabase in ref for safeInitializeDatabase
  useEffect(() => {
    initRef.current = initializeDatabase;
  }, [initializeDatabase]);

  // Kick off initial pass
  useEffect(() => {
    void initializeSafely();
  }, [initializeSafely]);

  // Realtime: versions only (NO separate PayPal table channel)
  useEffect(() => {
    if (!isInitialSyncComplete || listenersSetupRef.current) return;
    listenersSetupRef.current = true;

    const handleVersionChange = async (payload: any) => {
      if (isSyncingRef.current || !isMountedRef.current) return;

      const { new: n, old: o } = payload;

      const questionsChanged = changed(
        n?.question_data_version,
        o?.question_data_version
      );
      const quranChanged = changed(
        n?.quran_data_version,
        o?.quran_data_version
      );
      const calendarChanged = changed(
        n?.calendar_data_version,
        o?.calendar_data_version
      );
      const prayerChanged = changed(
        n?.prayer_data_version,
        o?.prayer_data_version
      );
      const paypalChanged = changed(
        n?.paypal_data_version,
        o?.paypal_data_version
      ); // <- NEW
      const appVersionChanged = changed(n?.app_version, o?.app_version);

      console.log(
        payload.eventType,
        Object.keys(payload.old || {}), // likely only ["id"]
        Object.keys(payload.new || {}) // full set
      );

      if (
        questionsChanged ||
        quranChanged ||
        calendarChanged ||
        prayerChanged ||
        paypalChanged
      ) {
        console.log(
          questionsChanged,
          quranChanged,
          calendarChanged,
          prayerChanged,
          paypalChanged
        );
        await initializeSafely();
        goHomeIfNeeded();
        questionsChanged && databaseUpdateQuestions();
        quranChanged && databaseUpdateQuran();
        calendarChanged && databaseUpdateCalendar();
        prayerChanged && databaseUpdatePrayer();
        paypalChanged && databaseUpdatePaypal(); // <- NEW
      }

      if (appVersionChanged) {
        await initializeSafely();
      }
    };

    verChannelRef.current = supabase
      .channel("versions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "versions" },
        handleVersionChange
      )
      .subscribe();

    return () => {
      listenersSetupRef.current = false;
      if (verChannelRef.current) {
        void supabase.removeChannel(verChannelRef.current);
        verChannelRef.current = null;
      }
    };
  }, [isInitialSyncComplete, initializeSafely, goHomeIfNeeded]);

  // Mount / unmount cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      debouncedInit.cancel();
      cleanupConnectivityListener();

      if (verChannelRef.current) {
        void supabase.removeChannel(verChannelRef.current);
        verChannelRef.current = null;
      }

      listenersSetupRef.current = false;
      isSyncingRef.current = false;
    };
  }, [debouncedInit, cleanupConnectivityListener]);

  return isReady;
}
