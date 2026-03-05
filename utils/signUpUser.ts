// // authService.ts
// import { supabase } from "@/utils/supabase";
// export const signUpUser = async (
//   username: string,
//   email: string,
//   password: string
// ): Promise<string | null> => {
//   const { error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       data: { username },
//     },
//   });

//   if (error) {
//     console.error("Sign-up error:", error.message);
//     return error.message;
//   }

//   console.log("Sign-up successful");
//   return null; // Indicates success
// };
