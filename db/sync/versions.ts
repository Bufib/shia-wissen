import { DatasetVersionsType } from "@/constants/Types";
import { supabase } from "@/utils/supabase";

/**
 * Get the latest per-dataset versions from the `versions` table.
 * Replaces the old single "database_version" model.
 */
export async function fetchVersionFromSupabase(): Promise<DatasetVersionsType | null> {
  try {
    const { data, error } = await supabase
      .from("versions")
      .select(
        "question_data_version, quran_data_version, calendar_data_version, prayer_data_version, app_version"
      )
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("fetchVersionFromSupabase error:", error);
      return null;
    }

    // Normalize and ensure all fields exist
    const row = (data ?? {}) as Partial<DatasetVersionsType>;
    return {
      question_data_version: row.question_data_version ?? null,
      quran_data_version: row.quran_data_version ?? null,
      calendar_data_version: row.calendar_data_version ?? null,
      prayer_data_version: row.prayer_data_version ?? null,
      app_version: row.app_version ?? null,
    };
  } catch (err) {
    console.error("Error fetching dataset versions:", err);
    return null;
  }
}

/**
 * Kept for the separate app update prompt logic.
 */
export async function fetchAppVersionFromSupabase(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("versions")
      .select("app_version")
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("fetchAppVersionFromSupabase error:", error);
      return null;
    }
    return data?.app_version ?? null;
  } catch (err) {
    console.error("Error fetching app version:", err);
    return null;
  }
}

export default {
  fetchVersionFromSupabase,
  fetchAppVersionFromSupabase,
};
