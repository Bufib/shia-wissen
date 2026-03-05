// import { useDataVersionStore } from "@/stores/dataVersionStore";
// import { supabase } from "@/utils/supabase";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// /**
//  * Pull latest PayPal link, persist locally, and bump version if it changed.
//  * @returns true if the stored link changed (i.e., consumers should refresh)
//  */
// const syncPayPal = async (): Promise<boolean> => {
//   try {
//     const { data, error } = await supabase
//       .from("paypal")
//       .select("link")
//       .limit(1)
//       .maybeSingle();

//     if (error) {
//       console.error("Error fetching PayPal link from Supabase:", error.message);
//       return false;
//     }

//     const newLink = data?.link ?? null;
//     const oldLink = await AsyncStorage.getItem("paypal"); // returns string | null

//     const changed = (oldLink ?? null) !== newLink;

//     if (!changed) return false;

//     if (newLink) {
//       await AsyncStorage.setItem("paypal", newLink);
//     } else {
//       await AsyncStorage.removeItem("paypal"); // handle cleared link
//     }

//     // Increment the paypal version after a successful *change*
//     const { incrementPaypalVersion } = useDataVersionStore.getState();
//     incrementPaypalVersion();
//     console.log("PayPal link updated locally.");
//     return true;
//   } catch (err) {
//     console.error("Unexpected error fetching PayPal link:", err);
//     return false;
//   }
// };

// export default syncPayPal;

// db/sync/paypal.ts
import { useDataVersionStore } from "../../stores/dataVersionStore";
import { supabase } from "../../utils/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Pull latest PayPal link, persist locally.
 * @returns true if the stored link changed (i.e., consumers should refresh)
 */
const syncPayPal = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("paypal")
      .select("link")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching PayPal link from Supabase:", error.message);
      return false;
    }

    const newLink = data?.link ?? null;
    const oldLink = await AsyncStorage.getItem("paypal"); // string | null

    const changed = (oldLink ?? null) !== newLink;
    if (!changed) return false;

    if (newLink) {
      await AsyncStorage.setItem("paypal", newLink);
    } else {
      await AsyncStorage.removeItem("paypal");
    }

    // Optional: keep if you use it elsewhere; otherwise remove.
    const { incrementPaypalVersion } = useDataVersionStore.getState?.() ?? {};
    incrementPaypalVersion?.();

    console.log("PayPal link updated locally.");
    return true;
  } catch (err) {
    console.error("Unexpected error fetching PayPal link:", err);
    return false;
  }
};

export default syncPayPal;
