import { supabase } from "../utils/supabase";

export const toggleIsPinnedStatus = async (id: number) => {
  try {
    // Fetch the current value of `is_pinned`
    const { data: currentData, error: fetchError } = await supabase
      .from("news")
      .select("is_pinned")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching current is_pinned status:", fetchError.message);
      return { success: false, error: fetchError };
    }

    const currentIsPinnedStatus = currentData.is_pinned;

    // Prepare the update object
    const updatePayload = {
      is_pinned: !currentIsPinnedStatus,
      pinned_at: !currentIsPinnedStatus ? new Date().toISOString() : null, // Set `pinned_at` when pinning, null when unpinning
    };

    // Update `is_pinned` and `pinned_at`
    const { data: updatedData, error: updateError } = await supabase
      .from("news")
      .update(updatePayload)
      .eq("id", id);

    if (updateError) {
      console.error("Error updating is_pinned status:", updateError.message);
      return { success: false, error: updateError };
    }

    console.log("is_pinned status and pinned_at updated:", updatedData);
    return { success: true, data: updatedData };
  } catch (exception) {
    console.error("Unexpected error toggling is_pinned status:", exception);
    return { success: false, error: exception };
  }
};
