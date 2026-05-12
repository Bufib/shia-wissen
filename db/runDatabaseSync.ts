// db/runDatabaseSync.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { whenDatabaseReady } from "../db";
import { fetchVersionFromSupabase } from "../db/sync/versions";
import syncQuestions from "../db/sync/questions";
import syncPayPal from "../db/sync/paypal";

const S = (v: unknown) => (v == null ? "" : String(v));

async function safeRun<T>(
  op: () => Promise<T>,
  name: string,
): Promise<{ success: boolean; error?: any }> {
  try {
    await op();
    return { success: true };
  } catch (error) {
    console.error(`Failed to sync ${name}:`, error);
    return { success: false, error };
  }
}

export async function runDatabaseSync(): Promise<{
  didWork: boolean;
  errors: Record<string, any>;
  successes: string[];
}> {
  await whenDatabaseReady();

  const errors: Record<string, any> = {};
  const successes: string[] = [];
  let didWork = false;

  const remote = await fetchVersionFromSupabase();
  if (!remote) {
    return { didWork: false, errors, successes };
  }

  const questionsVer = S(remote.question_data_version);
  const paypalVer = S(remote.paypal_data_version);

  const syncIfChanged = async (
    storedKey: string,
    remoteVer: string,
    name: string,
    run: () => Promise<unknown>,
  ) => {
    if (!remoteVer) return;
    const localVer = S(await AsyncStorage.getItem(storedKey));
    if (remoteVer !== localVer) {
      const res = await safeRun(async () => {
        await run();
        await AsyncStorage.setItem(storedKey, remoteVer);
      }, name);
      if (res.success) {
        successes.push(name);
        didWork = true;
      } else {
        errors[name] = res.error;
      }
    }
  };

  // Sequential to avoid SQLite locks
  await syncIfChanged(
    "question_data_version",
    questionsVer,
    "questions",
    syncQuestions,
  );

  await syncIfChanged("paypal_data_version", paypalVer, "paypal", syncPayPal);

  return { didWork, errors, successes };
}
