// // //! Cloudfare and github. Mp3 in Github and stream and download via cloudfare mp3
// // import { PodcastType } from "@/constants/Types";
// // import { supabase } from "@/utils/supabase";
// // import {
// //   InfiniteData,
// //   QueryKey,
// //   useInfiniteQuery,
// //   useMutation,
// //   useQueryClient,
// // } from "@tanstack/react-query";
// // import * as FileSystem from "expo-file-system";
// // import { useCallback, useEffect, useRef } from "react";

// // // --- CONFIGURATION ---
// // const PAGE_SIZE = 3;
// // const CACHE_MAX_AGE_DAYS = 7;
// // const CACHE_MAX_FILES = 20;

// // // --- HELPER FUNCTIONS ---

// // // Prevent concurrent cleanups
// // let isCleaningCache = false;

// // /**
// //  * Returns a valid cache directory on both iOS/Android (Expo).
// //  * Falls back to documentDirectory if cacheDirectory is not available.
// //  */
// // function getCacheDirectory(): string {
// //   const cacheDir = FileSystem.cacheDirectory;
// //   if (!cacheDir) {
// //     console.error(
// //       "Cache directory is not available; using documentDirectory instead."
// //     );
// //     return (FileSystem.documentDirectory ?? "") + "audioCache/";
// //   }
// //   return cacheDir.endsWith("/") ? cacheDir : cacheDir + "/";
// // }

// // /**
// //  * Deletes old or over-limit files in the cache directory.
// //  * - Any file older than CACHE_MAX_AGE_DAYS is removed.
// //  * - If more than CACHE_MAX_FILES remain, the oldest beyond that limit are removed.
// //  */
// // export async function cleanupCache(): Promise<void> {
// //   if (isCleaningCache) {
// //     console.log("Cache cleanup already in progress; skipping.");
// //     return;
// //   }
// //   isCleaningCache = true;
// //   console.log("Starting cache cleanup...");

// //   try {
// //     const dirUri = getCacheDirectory();
// //     const dirInfo = await FileSystem.getInfoAsync(dirUri);
// //     if (!dirInfo.exists || !dirInfo.isDirectory) {
// //       console.log(
// //         "Cache directory does not exist or is not a directory; skipping cleanup."
// //       );
// //       isCleaningCache = false;
// //       return;
// //     }

// //     const allNames = await FileSystem.readDirectoryAsync(dirUri);
// //     const audioExtensions = [".mp3"]; // Only clean files ending in .mp3
// //     const audioFileNames = allNames.filter((name) =>
// //       audioExtensions.some((ext) => name.toLowerCase().endsWith(ext))
// //     );

// //     const infos: { uri: string; mtime: number }[] = [];
// //     await Promise.all(
// //       audioFileNames.map(async (name) => {
// //         const fileUri = dirUri + name;
// //         try {
// //           const info = await FileSystem.getInfoAsync(fileUri, { size: true });
// //           // `modificationTime` is in seconds; multiply by 1_000 for ms.
// //           if (info.exists && !info.isDirectory && info.modificationTime) {
// //             infos.push({ uri: fileUri, mtime: info.modificationTime * 1000 });
// //           }
// //         } catch {
// //           // If the file vanished between readDirectoryAsync and getInfoAsync, ignore.
// //         }
// //       })
// //     );

// //     const cutoff = Date.now() - CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

// //     // 1) Delete files older than cutoff
// //     const oldFiles = infos.filter((f) => f.mtime < cutoff);
// //     if (oldFiles.length > 0) {
// //       console.log(`Deleting ${oldFiles.length} old cache files...`);
// //       await Promise.all(
// //         oldFiles.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
// //       );
// //     }

// //     // 2) Enforce maximum file count
// //     const stillValid = infos.filter((f) => f.mtime >= cutoff);
// //     const excessCount = stillValid.length - CACHE_MAX_FILES;
// //     if (excessCount > 0) {
// //       // Sort by newest first, then remove the oldest beyond the top CACHE_MAX_FILES
// //       const sortedByNewest = stillValid.sort((a, b) => b.mtime - a.mtime);
// //       const toDelete = sortedByNewest.slice(CACHE_MAX_FILES);
// //       console.log(
// //         `Deleting ${toDelete.length} excess cache files (over limit)...`
// //       );
// //       await Promise.all(
// //         toDelete.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
// //       );
// //     }

// //     console.log("Cache cleanup finished.");
// //   } catch (err) {
// //     console.warn("Error during cache cleanup:", err);
// //   } finally {
// //     isCleaningCache = false;
// //   }
// // }

// // /**
// //  * Downloads an MP3 from your Cloudflare Pages CDN into the local cache folder.
// //  * - `filename` should be something like "episode-123.mp3" (no leading slash).
// //  * - Internally, it builds the URL: https://podcast-files.pages.dev/<filename>
// //  * - If the file already exists locally, returns the local path immediately.
// //  * - Otherwise, it runs a resumable download and writes to cache.
// //  */
// // async function downloadToCache(
// //   filename: string,
// //   onProgress?: (fraction: number) => void
// // ): Promise<string> {
// //   if (!filename)
// //     throw new Error("downloadToCache requires a non-empty filename.");

// //   const cacheDir = getCacheDirectory();

// //   // ✅ Ensure the cache folder exists (idempotent; errors are ignored)
// //   await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true }).catch(
// //     () => {}
// //   );

// //   // Local path in that folder
// //   const localUri = cacheDir + filename;

// //   // If it already exists, return it
// //   const info = await FileSystem.getInfoAsync(localUri).catch(() => null);
// //   if (info?.exists) return localUri;

// //   // Remote URL (encode in case of spaces etc.)
// //   const downloadUrl = `https://podcast-files.pages.dev/${encodeURIComponent(
// //     filename
// //   )}`;

// //   // Resumable download…
// //   let lastError: any = null;
// //   for (let attempt = 0; attempt < 2; attempt++) {
// //     try {
// //       const task = FileSystem.createDownloadResumable(
// //         downloadUrl,
// //         localUri,
// //         {},
// //         ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
// //           if (onProgress && totalBytesExpectedToWrite > 0) {
// //             onProgress(totalBytesWritten / totalBytesExpectedToWrite);
// //           }
// //         }
// //       );
// //       const result = await task.downloadAsync();
// //       if (!result?.uri) throw new Error("Download failed, no result URI.");
// //       cleanupCache().catch(console.warn);
// //       return result.uri;
// //     } catch (err) {
// //       lastError = err;
// //       if (attempt === 0) continue;
// //       break;
// //     }
// //   }
// //   throw new Error(
// //     `Failed to download "${filename}": ${lastError?.message || lastError}`
// //   );
// // }

// // export function usePodcasts(language: string) {
// //   const qc = useQueryClient();

// //   //!  belt-and-suspenders: ensure cache dir exists on first hook mount
// //   useEffect(() => {
// //     FileSystem.makeDirectoryAsync(getCacheDirectory(), {
// //       intermediates: true,
// //     }).catch(() => {});
// //   }, []);

// //   // --- 1) Infinite paginated list from `podcasts` table ---
// //   const queryKey: QueryKey = ["podcasts", language];

// //   const infiniteQuery = useInfiniteQuery<
// //     PodcastType[], // data page type
// //     Error,
// //     InfiniteData<PodcastType[]>,
// //     QueryKey,
// //     number
// //   >({
// //     queryKey,
// //     queryFn: async ({ pageParam = 0 }) => {
// //       // Fetch a page of size PAGE_SIZE, ordered by created_at DESC
// //       // Count returns overall count
// //       const { data, error, count } = await supabase
// //         .from("podcasts")
// //         .select("*", { count: "exact" })
// //         .eq("language_code", language)
// //         .order("created_at", { ascending: false })
// //         .range(pageParam, pageParam + PAGE_SIZE - 1);

// //       if (error) {
// //         console.error("Error fetching podcasts:", error);
// //         throw error;
// //       }
// //       return data || [];
// //     },
// //     getNextPageParam: (lastPage, allPages) => {
// //       const fetchedSoFar = allPages.reduce((acc, page) => acc + page.length, 0);
// //       // If we got exactly PAGE_SIZE, there might be more.
// //       return lastPage.length === PAGE_SIZE ? fetchedSoFar : undefined;
// //     },
// //     initialPageParam: 0,
// //     staleTime: 5 * 60 * 1000, // 5 minutes
// //   });

// //   // --- 3) Real-time subscription to INSERT, UPDATE, DELETE on `podcasts` ---
// //   useEffect(() => {
// //     // Create a Realtime channel for the "podcasts" table
// //     const channel = supabase
// //       .channel("public:podcasts") // Arbitrary channel name
// //       .on(
// //         "postgres_changes",
// //         { event: "INSERT", schema: "public", table: "podcasts" },
// //         (payload) => {
// //           const newEpisode = payload.new as PodcastType;
// //           qc.setQueryData<InfiniteData<PodcastType[]> | undefined>(
// //             ["podcasts"],
// //             (old) => {
// //               if (!old) return old;
// //               // Prepend the new episode to page 0
// //               const firstPage = old.pages[0] || [];
// //               const updatedFirstPage = [newEpisode, ...firstPage];
// //               return {
// //                 ...old,
// //                 pages: [updatedFirstPage, ...old.pages.slice(1)],
// //               };
// //             }
// //           );
// //         }
// //       )
// //       .on(
// //         "postgres_changes",
// //         { event: "UPDATE", schema: "public", table: "podcasts" },
// //         (payload) => {
// //           const updatedEpisode = payload.new as PodcastType;
// //           qc.setQueryData<InfiniteData<PodcastType[]> | undefined>(
// //             ["podcasts"],
// //             (old) => {
// //               if (!old) return old;
// //               // For each page, replace the episode with the matching `id`
// //               const updatedPages = old.pages.map((page) =>
// //                 page.map((ep) =>
// //                   ep.id === updatedEpisode.id ? updatedEpisode : ep
// //                 )
// //               );
// //               return {
// //                 ...old,
// //                 pages: updatedPages,
// //               };
// //             }
// //           );
// //         }
// //       )
// //       .on(
// //         "postgres_changes",
// //         { event: "DELETE", schema: "public", table: "podcasts" },
// //         (payload) => {
// //           const deletedEpisode = payload.old as PodcastType;
// //           qc.setQueryData<InfiniteData<PodcastType[]> | undefined>(
// //             ["podcasts"],
// //             (old) => {
// //               if (!old) return old;
// //               // Filter out any episode whose id matches the deleted one
// //               const filteredPages = old.pages.map((page) =>
// //                 page.filter((ep) => ep.id !== deletedEpisode.id)
// //               );
// //               return {
// //                 ...old,
// //                 pages: filteredPages,
// //               };
// //             }
// //           );
// //         }
// //       )
// //       .subscribe(); // Start listening

// //     return () => {
// //       // Unsubscribe when the component unmounts
// //       channel.unsubscribe();
// //     };
// //   }, [qc]);

// //   // --- 4) Download-to-cache mutation (no streaming) ---
// //   const downloadMutation = useMutation<
// //     string, // on success, returns localUri
// //     Error,
// //     { filename: string; onProgress?: (frac: number) => void }
// //   >({
// //     mutationFn: ({ filename, onProgress }) => {
// //       if (!filename) throw new Error("download requires a filename");
// //       return downloadToCache(filename, onProgress);
// //     },
// //     onMutate: ({ filename }) => {
// //       qc.setQueryData(["download", filename], {
// //         status: "loading",
// //         progress: 0,
// //       });
// //     },
// //     onError: (error, variables) => {
// //       console.error(`Error downloading ${variables.filename}:`, error);
// //       qc.setQueryData(["download", variables.filename], {
// //         status: "error",
// //         error: error.message,
// //       });
// //     },
// //     onSuccess: (localUri, variables) => {
// //       qc.setQueryData(["download", variables.filename], {
// //         status: "done",
// //         uri: localUri,
// //       });
// //     },
// //   });

// //   // --- 5) Check if a file is already cached locally ---
// //   const getCachedUri = useCallback(
// //     async (filename: string): Promise<string | null> => {
// //       if (!filename) return null;
// //       // We store under <cacheDir>/<filename>
// //       const localUri = getCacheDirectory() + filename;
// //       const info = await FileSystem.getInfoAsync(localUri);
// //       return info.exists ? localUri : null;
// //     },
// //     []
// //   );

// //   // --- RETURN EVERYTHING THE CONSUMER NEEDS (no streaming) ---
// //   return {
// //     ...infiniteQuery, // pages of podcasts
// //     download: downloadMutation, // mutation to download into cache
// //     getCachedUri, // helper to check a local cache file
// //   };
// // }

// // // For streaming
// // export const remoteUrlFor = (filename: string) =>
// //   `https://podcast-files.pages.dev/${encodeURIComponent(filename)}`;

// //! Supabase for stream and cloud last worked before language addition
// // import { PodcastType } from "@/constants/Types";
// // import { supabase } from "@/utils/supabase";
// // import {
// //   InfiniteData,
// //   QueryKey,
// //   useInfiniteQuery,
// //   useMutation,
// //   useQueryClient,
// // } from "@tanstack/react-query";
// // import * as FileSystem from "expo-file-system";
// // import { useCallback, useEffect } from "react";

// // // --- CONFIGURATION ---
// // const PAGE_SIZE = 3;
// // const CACHE_MAX_AGE_DAYS = 7;
// // const CACHE_MAX_FILES = 20;

// // // --- STORAGE CONFIG ---
// // const STORAGE_BUCKET = "sounds/podcasts";

// // // If you later switch to a PRIVATE bucket, set this to true and use signedUrlFor() below.
// // const USE_SIGNED_URLS = false;

// // // --- URL HELPERS ---
// // function publicUrlFor(filename: string): string {
// //   // Pass raw path; SDK returns a properly encoded public URL.
// //   const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
// //   return data.publicUrl;
// // }

// // async function signedUrlFor(filename: string, expiresInSeconds = 60 * 60 * 4) {
// //   const { data, error } = await supabase.storage
// //     .from(STORAGE_BUCKET)
// //     .createSignedUrl(filename, expiresInSeconds);
// //   if (error || !data?.signedUrl)
// //     throw error ?? new Error("Could not create signed URL");
// //   return data.signedUrl;
// // }

// // async function urlFor(filename: string): Promise<string> {
// //   return USE_SIGNED_URLS ? signedUrlFor(filename) : publicUrlFor(filename);
// // }

// // // --- HELPER FUNCTIONS ---

// // // Prevent concurrent cleanups
// // let isCleaningCache = false;

// // /**
// //  * Returns a valid cache directory on both iOS/Android (Expo).
// //  * Falls back to documentDirectory if cacheDirectory is not available.
// //  */
// // function getCacheDirectory(): string {
// //   const cacheDir = FileSystem.cacheDirectory;
// //   if (!cacheDir) {
// //     console.error(
// //       "Cache directory is not available; using documentDirectory instead."
// //     );
// //     return (FileSystem.documentDirectory ?? "") + "audioCache/";
// //   }
// //   return cacheDir.endsWith("/") ? cacheDir : cacheDir + "/";
// // }

// // /**
// //  * Deletes old or over-limit files in the cache directory.
// //  * - Any file older than CACHE_MAX_AGE_DAYS is removed.
// //  * - If more than CACHE_MAX_FILES remain, the oldest beyond that limit are removed.
// //  */
// // export async function cleanupCache(): Promise<void> {
// //   if (isCleaningCache) {
// //     console.log("Cache cleanup already in progress; skipping.");
// //     return;
// //   }
// //   isCleaningCache = true;
// //   console.log("Starting cache cleanup...");

// //   try {
// //     const dirUri = getCacheDirectory();
// //     const dirInfo = await FileSystem.getInfoAsync(dirUri);
// //     if (!dirInfo.exists || !dirInfo.isDirectory) {
// //       console.log(
// //         "Cache directory does not exist or is not a directory; skipping cleanup."
// //       );
// //       isCleaningCache = false;
// //       return;
// //     }

// //     const allNames = await FileSystem.readDirectoryAsync(dirUri);
// //     const audioExtensions = [".mp3", ".m4a"];
// //     const audioFileNames = allNames.filter((name) =>
// //       audioExtensions.some((ext) => name.toLowerCase().endsWith(ext))
// //     );

// //     const infos: { uri: string; mtime: number }[] = [];
// //     await Promise.all(
// //       audioFileNames.map(async (name) => {
// //         const fileUri = dirUri + name;
// //         try {
// //           const info = await FileSystem.getInfoAsync(fileUri, { size: true });
// //           if (info.exists && !info.isDirectory && info.modificationTime) {
// //             infos.push({ uri: fileUri, mtime: info.modificationTime * 1000 });
// //           }
// //         } catch {
// //           // ignore
// //         }
// //       })
// //     );

// //     const cutoff = Date.now() - CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

// //     // 1) Delete files older than cutoff
// //     const oldFiles = infos.filter((f) => f.mtime < cutoff);
// //     if (oldFiles.length > 0) {
// //       console.log(`Deleting ${oldFiles.length} old cache files...`);
// //       await Promise.all(
// //         oldFiles.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
// //       );
// //     }

// //     // 2) Enforce maximum file count
// //     const stillValid = infos.filter((f) => f.mtime >= cutoff);
// //     const excessCount = stillValid.length - CACHE_MAX_FILES;
// //     if (excessCount > 0) {
// //       const sortedByNewest = stillValid.sort((a, b) => b.mtime - a.mtime);
// //       const toDelete = sortedByNewest.slice(CACHE_MAX_FILES);
// //       console.log(
// //         `Deleting ${toDelete.length} excess cache files (over limit)...`
// //       );
// //       await Promise.all(
// //         toDelete.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
// //       );
// //     }

// //     console.log("Cache cleanup finished.");
// //   } catch (err) {
// //     console.warn("Error during cache cleanup:", err);
// //   } finally {
// //     isCleaningCache = false;
// //   }
// // }

// // /**
// //  * Downloads an MP3 from Supabase Storage (bucket: podcasts) into the local cache folder.
// //  * - `filename` should be like "episode-123.mp3" or "folder/episode-123.mp3"
// //  * - Uses public or signed URL depending on USE_SIGNED_URLS.
// //  */
// // async function downloadToCache(
// //   filename: string,
// //   onProgress?: (fraction: number) => void
// // ): Promise<string> {
// //   if (!filename)
// //     throw new Error("downloadToCache requires a non-empty filename.");

// //   const cacheDir = getCacheDirectory();

// //   // Ensure the cache folder exists (idempotent)
// //   await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true }).catch(
// //     () => {}
// //   );

// //   // Local path in that folder
// //   const localUri = cacheDir + filename.replace(/[\\/]/g, "_"); // avoid subfolder names in cache filename

// //   // If it already exists, return it
// //   const info = await FileSystem.getInfoAsync(localUri).catch(() => null);
// //   if (info?.exists) return localUri;

// //   // Remote URL from Supabase Storage
// //   const downloadUrl = await urlFor(filename);

// //   // Resumable download…
// //   let lastError: any = null;
// //   for (let attempt = 0; attempt < 2; attempt++) {
// //     try {
// //       const task = FileSystem.createDownloadResumable(
// //         downloadUrl,
// //         localUri,
// //         {},
// //         ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
// //           if (onProgress && totalBytesExpectedToWrite > 0) {
// //             onProgress(totalBytesWritten / totalBytesExpectedToWrite);
// //           }
// //         }
// //       );
// //       const result = await task.downloadAsync();
// //       const status = (result as any)?.status ?? 200;
// //       if (!result?.uri || status < 200 || status >= 300) {
// //         // Clean up partial/404 files
// //         await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
// //           () => {}
// //         );
// //         throw new Error(`Download failed (HTTP ${status})`);
// //       }
// //       cleanupCache().catch(console.warn);
// //       return result.uri;
// //     } catch (err) {
// //       lastError = err;
// //       if (attempt === 0) continue;
// //       break;
// //     }
// //   }
// //   throw new Error(
// //     `Failed to download "${filename}": ${lastError?.message || lastError}`
// //   );
// // }

// // export function usePodcasts(language: string) {
// //   const qc = useQueryClient();

// //   // ensure cache dir exists on first hook mount
// //   useEffect(() => {
// //     FileSystem.makeDirectoryAsync(getCacheDirectory(), {
// //       intermediates: true,
// //     }).catch(() => {});
// //   }, []);

// //   // --- 1) Infinite paginated list from `podcasts` table ---
// //   const queryKey: QueryKey = ["podcasts", language];

// //   const infiniteQuery = useInfiniteQuery<
// //     PodcastType[], // data page type
// //     Error,
// //     InfiniteData<PodcastType[]>,
// //     QueryKey,
// //     number
// //   >({
// //     queryKey,
// //     queryFn: async ({ pageParam = 0 }) => {
// //       const { data, error } = await supabase
// //         .from("podcasts")
// //         .select("*")
// //         .eq("language_code", language)
// //         .order("created_at", { ascending: false })
// //         .range(pageParam, pageParam + PAGE_SIZE - 1);

// //       if (error) {
// //         console.error("Error fetching podcasts:", error);
// //         throw error;
// //       }
// //       return data || [];
// //     },
// //     getNextPageParam: (lastPage, allPages) => {
// //       const fetchedSoFar = allPages.reduce((acc, page) => acc + page.length, 0);
// //       return lastPage.length === PAGE_SIZE ? fetchedSoFar : undefined;
// //     },
// //     initialPageParam: 0,
// //     staleTime: 5 * 60 * 1000,
// //   });

// //   // --- 3) Download-to-cache mutation (no streaming) ---
// //   const downloadMutation = useMutation<
// //     string, // on success, returns localUri
// //     Error,
// //     { filename: string; onProgress?: (frac: number) => void }
// //   >({
// //     mutationFn: ({ filename, onProgress }) => {
// //       if (!filename) throw new Error("download requires a filename");
// //       return downloadToCache(filename, onProgress);
// //     },
// //     onMutate: ({ filename }) => {
// //       qc.setQueryData(["download", filename], {
// //         status: "loading",
// //         progress: 0,
// //       });
// //     },
// //     onError: (error, variables) => {
// //       console.error(`Error downloading ${variables.filename}:`, error);
// //       qc.setQueryData(["download", variables.filename], {
// //         status: "error",
// //         error: error.message,
// //       });
// //     },
// //     onSuccess: (localUri, variables) => {
// //       qc.setQueryData(["download", variables.filename], {
// //         status: "done",
// //         uri: localUri,
// //       });
// //     },
// //   });

// //   // --- 4) Check if a file is already cached locally ---
// //   const getCachedUri = useCallback(
// //     async (filename: string): Promise<string | null> => {
// //       if (!filename) return null;
// //       const localUri = getCacheDirectory() + filename.replace(/[\\/]/g, "_");
// //       const info = await FileSystem.getInfoAsync(localUri);
// //       return info.exists ? localUri : null;
// //     },
// //     []
// //   );

// //   return {
// //     ...infiniteQuery,
// //     download: downloadMutation,
// //     getCachedUri,
// //   };
// // }

// // // For streaming (PUBLIC bucket). Keep sync API like before.
// // export const remoteUrlFor = (filename: string) => publicUrlFor(filename);

// // // If you switch to a PRIVATE bucket, make it async in your caller:
// // // export const remoteUrlFor = async (filename: string) => signedUrlFor(filename);
// //! usePodcasts.ts — language-scoped cache version --  last that worked

// import { PodcastType } from "@/constants/Types";
// import { supabase } from "@/utils/supabase";
// import {
//   InfiniteData,
//   QueryKey,
//   useInfiniteQuery,
//   useMutation,
//   useQueryClient,
// } from "@tanstack/react-query";
// import * as FileSystem from "expo-file-system/legacy";
// import { useCallback, useEffect } from "react";

// // --- CONFIGURATION ---
// const PAGE_SIZE = 3;
// const CACHE_MAX_AGE_DAYS = 7;
// const CACHE_MAX_FILES = 20;

// // --- STORAGE CONFIG ---
// const STORAGE_BUCKET = "sounds/podcasts";
// // If you later switch to a PRIVATE bucket, set this to true and use signedUrlFor() below.
// const USE_SIGNED_URLS = false;

// // --- URL HELPERS ---
// function publicUrlFor(filename: string): string {
//   // Pass raw path; SDK returns a properly encoded public URL.
//   const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
//   return data.publicUrl;
// }

// // Track current download for cancellation
// let currentDownloadTask: FileSystem.DownloadResumable | null = null;
// let currentDownloadPath: string | null = null;

// export const cancelCurrentDownload = async () => {
//   if (currentDownloadTask) {
//     await currentDownloadTask.cancelAsync();
//     currentDownloadTask = null;
//   }
//   if (currentDownloadPath) {
//     await FileSystem.deleteAsync(currentDownloadPath, {
//       idempotent: true,
//     }).catch(() => {});
//     currentDownloadPath = null;
//   }
// };

// async function signedUrlFor(filename: string, expiresInSeconds = 60 * 60 * 4) {
//   const { data, error } = await supabase.storage
//     .from(STORAGE_BUCKET)
//     .createSignedUrl(filename, expiresInSeconds);
//   if (error || !data?.signedUrl)
//     throw error ?? new Error("Could not create signed URL");
//   return data.signedUrl;
// }

// async function urlFor(filename: string): Promise<string> {
//   return USE_SIGNED_URLS ? signedUrlFor(filename) : publicUrlFor(filename);
// }

// // For streaming (PUBLIC bucket). Keep sync API like before.
// export const remoteUrlFor = (filename: string) => publicUrlFor(filename);
// // If you switch to a PRIVATE bucket, make it async in your caller:
// // export const remoteUrlFor = async (filename: string) => signedUrlFor(filename);

// // --- CACHE (PER-LANGUAGE) ---

// // Sanitize any subpaths to a flat filename
// const sanitize = (s: string) => s.replace(/[\\/]/g, "_");
// const LANG_DEFAULT = "default";

// // Prevent concurrent cleanups per language
// const cleaningLanguages = new Set<string>();

// /** Root cache dir (Expo); falls back to document directory. */
// function getRootCacheDir(): string {
//   const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? "";
//   return base.endsWith("/") ? base : base + "/";
// }

// /** Per-language cache directory: .../audioCache/<lang>/ */
// function getCacheDirectory(language?: string): string {
//   const lang = (language || LANG_DEFAULT).toLowerCase();
//   return `${getRootCacheDir()}audioCache/${lang}/`;
// }

// /** Ensure the per-language directory exists (idempotent) */
// async function ensureLangDir(language?: string) {
//   await FileSystem.makeDirectoryAsync(getCacheDirectory(language), {
//     intermediates: true,
//   }).catch(() => {});
// }

// /**
//  * Deletes old or over-limit files in the language-specific cache directory.
//  * - Any file older than CACHE_MAX_AGE_DAYS is removed.
//  * - If more than CACHE_MAX_FILES remain, the oldest beyond that limit are removed.
//  */
// export async function cleanupCache(language?: string): Promise<void> {
//   const lang = (language || LANG_DEFAULT).toLowerCase();
//   if (cleaningLanguages.has(lang)) {
//     // Already running for this language
//     return;
//   }
//   cleaningLanguages.add(lang);

//   try {
//     const dirUri = getCacheDirectory(lang);
//     const dirInfo = await FileSystem.getInfoAsync(dirUri);
//     if (!dirInfo.exists || !dirInfo.isDirectory) {
//       return;
//     }

//     const allNames = await FileSystem.readDirectoryAsync(dirUri);
//     const audioExtensions = [".mp3", ".m4a"];
//     const audioFileNames = allNames.filter((name) =>
//       audioExtensions.some((ext) => name.toLowerCase().endsWith(ext))
//     );

//     const infos: { uri: string; mtime: number }[] = [];
//     await Promise.all(
//       audioFileNames.map(async (name) => {
//         const fileUri = dirUri + name;
//         try {
//           const info = await FileSystem.getInfoAsync(fileUri);
//           if (info.exists && !info.isDirectory && info.modificationTime) {
//             infos.push({ uri: fileUri, mtime: info.modificationTime * 1000 });
//           }
//         } catch {
//           // ignore file errors to keep cleanup robust
//         }
//       })
//     );

//     const cutoff = Date.now() - CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

//     // 1) Delete files older than cutoff
//     const oldFiles = infos.filter((f) => f.mtime < cutoff);
//     if (oldFiles.length > 0) {
//       await Promise.all(
//         oldFiles.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
//       );
//     }

//     // 2) Enforce maximum file count per language
//     const stillValid = infos.filter((f) => f.mtime >= cutoff);
//     const excessCount = stillValid.length - CACHE_MAX_FILES;
//     if (excessCount > 0) {
//       const sortedByNewest = stillValid.sort((a, b) => b.mtime - a.mtime);
//       const toDelete = sortedByNewest.slice(CACHE_MAX_FILES);
//       await Promise.all(
//         toDelete.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
//       );
//     }
//   } catch (err) {
//     console.warn(`[cache cleanup error]`, err);
//   } finally {
//     cleaningLanguages.delete(lang);
//   }
// }

// /**
//  * Downloads an MP3/M4A from Supabase Storage into the **language-scoped** cache folder.
//  * - `filename` like "episode-123.mp3" or "folder/episode-123.mp3"
//  * - Uses public or signed URL depending on USE_SIGNED_URLS.
//  */
// async function downloadToCache(
//   filename: string,
//   language?: string,
//   onProgress?: (fraction: number) => void
// ): Promise<string> {
//   if (!filename)
//     throw new Error("downloadToCache requires a non-empty filename.");

//   await ensureLangDir(language);
//   const cacheDir = getCacheDirectory(language);

//   // Local path in that folder
//   const localUri = cacheDir + sanitize(filename);

//   // If it already exists, return it
//   const info = await FileSystem.getInfoAsync(localUri).catch(() => null);
//   if (info?.exists) return localUri;

//   // Remote URL from Supabase Storage
//   const downloadUrl = await urlFor(filename);

//   // Resumable download with basic retry
//   let lastError: any = null;
//   for (let attempt = 0; attempt < 2; attempt++) {
//     try {
//       const task = FileSystem.createDownloadResumable(
//         downloadUrl,
//         localUri,
//         {},
//         ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
//           if (onProgress && totalBytesExpectedToWrite > 0) {
//             onProgress(totalBytesWritten / totalBytesExpectedToWrite);
//           }
//         }
//       );

//       // Track for cancellation
//       currentDownloadTask = task;
//       currentDownloadPath = localUri;
//       const result = await task.downloadAsync();

//       // Clear tracking after completion
//       currentDownloadTask = null;
//       currentDownloadPath = null;

//       const status = (result as any)?.status ?? 200;
//       if (!result?.uri || status < 200 || status >= 300) {
//         // Clean up partial/404 files
//         await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
//           () => {}
//         );
//         throw new Error(`Download failed (HTTP ${status})`);
//       }
//       cleanupCache(language).catch(console.warn);
//       return result.uri;
//     } catch (err) {
//       lastError = err;
//       if (attempt === 0) continue;
//       break;
//     }
//   }
//   throw new Error(
//     `Failed to download "${filename}": ${lastError?.message || lastError}`
//   );
// }

// // --- HOOK ---

// export function usePodcasts(language: string) {
//   const qc = useQueryClient();

//   // Ensure the per-language cache dir exists on first hook mount per language
//   useEffect(() => {
//     ensureLangDir(language).catch(() => {});
//   }, [language]);

//   // --- 1) Infinite paginated list from `podcasts` table ---
//   const queryKey: QueryKey = ["podcasts", language];

//   const infiniteQuery = useInfiniteQuery<
//     PodcastType[], // data page type
//     Error,
//     InfiniteData<PodcastType[]>,
//     QueryKey,
//     number
//   >({
//     queryKey,
//     queryFn: async ({ pageParam = 0 }) => {
//       const { data, error } = await supabase
//         .from("podcasts")
//         .select("*")
//         .eq("language_code", language)
//         .order("created_at", { ascending: false })
//         .range(pageParam, pageParam + PAGE_SIZE - 1);

//       if (error) {
//         console.error("Error fetching podcasts:", error);
//         throw error;
//       }
//       return data ?? [];
//     },
//     getNextPageParam: (lastPage, allPages) => {
//       const fetchedSoFar = allPages.reduce((acc, page) => acc + page.length, 0);
//       return lastPage.length === PAGE_SIZE ? fetchedSoFar : undefined;
//     },
//     initialPageParam: 0,
//     enabled: Boolean(language),
//     retry: 3,
//     staleTime: 12 * 60 * 60 * 1000, // 12 hours
//     gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
//     refetchOnMount: "always",
//     refetchOnWindowFocus: false,
//     refetchOnReconnect: true,
//   });

//   // --- 2) Download-to-cache mutation (per language) ---
//   const download = useMutation<
//     string, // on success, returns localUri
//     Error,
//     { filename: string; onProgress?: (frac: number) => void }
//   >({
//     mutationFn: ({ filename, onProgress }) => {
//       if (!filename) throw new Error("download requires a filename");
//       return downloadToCache(filename, language, onProgress);
//     },
//     onMutate: ({ filename }) => {
//       qc.setQueryData(["download", language, filename], {
//         status: "loading",
//         progress: 0,
//       });
//     },
//     onError: (error, variables) => {
//       console.error(`Error downloading ${variables.filename}:`, error);
//       qc.setQueryData(["download", language, variables.filename], {
//         status: "error",
//         error: error.message,
//       });
//     },
//     onSuccess: (localUri, variables) => {
//       qc.setQueryData(["download", language, variables.filename], {
//         status: "done",
//         uri: localUri,
//       });
//     },
//   });

//   // --- 3) Check if a file is already cached locally (per language) ---
//   const getCachedUri = useCallback(
//     async (filename: string): Promise<string | null> => {
//       if (!filename) return null;
//       const localUri = getCacheDirectory(language) + sanitize(filename);
//       const info = await FileSystem.getInfoAsync(localUri);
//       return info.exists ? localUri : null;
//     },
//     [language]
//   );

//   return {
//     ...infiniteQuery,
//     download,
//     getCachedUri,
//   };
// }

import { PodcastType } from "@/constants/Types";
import { supabase } from "../utils/supabase";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useEffect } from "react";

// --- CONFIGURATION ---
const PAGE_SIZE = 3;
const CACHE_MAX_AGE_DAYS = 7;
const CACHE_MAX_FILES = 20;

// --- STORAGE CONFIG ---
const STORAGE_BUCKET = "sounds/podcasts";
const USE_SIGNED_URLS = false;

// --- URL HELPERS ---
function publicUrlFor(filename: string): string {
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

type DownloadVariables = {
  filename: string;
  onProgress?: (frac: number) => void;
};

// Track current download for cancellation
let currentDownloadTask: FileSystem.DownloadResumable | null = null;
let currentDownloadPath: string | null = null;
let downloadWasCancelled = false;

export const cancelCurrentDownload = async () => {
  downloadWasCancelled = true;
  if (currentDownloadTask) {
    await currentDownloadTask.cancelAsync();
    currentDownloadTask = null;
  }
  if (currentDownloadPath) {
    await FileSystem.deleteAsync(currentDownloadPath, {
      idempotent: true,
    }).catch(() => {});
    currentDownloadPath = null;
  }
};

// Delete a specific file from cache
export const deleteFromCache = async (
  filename: string,
  language?: string
): Promise<boolean> => {
  if (!filename) return false;

  const lang = (language || LANG_DEFAULT).toLowerCase();
  const cacheDir = getCacheDirectory(lang);
  const localUri = cacheDir + sanitize(filename);

  try {
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
      return true;
    }
    return false;
  } catch (err) {
    console.warn(`[deleteFromCache error]`, err);
    return false;
  }
};
async function signedUrlFor(filename: string, expiresInSeconds = 60 * 60 * 4) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(filename, expiresInSeconds);
  if (error || !data?.signedUrl)
    throw error ?? new Error("Could not create signed URL");
  return data.signedUrl;
}

async function urlFor(filename: string): Promise<string> {
  return USE_SIGNED_URLS ? signedUrlFor(filename) : publicUrlFor(filename);
}

// For streaming (PUBLIC bucket)
export const remoteUrlFor = (filename: string) => publicUrlFor(filename);

// --- CACHE (PER-LANGUAGE) ---

const sanitize = (s: string) => s.replace(/[\\/]/g, "_");
const LANG_DEFAULT = "default";

const cleaningLanguages = new Set<string>();

function getRootCacheDir(): string {
  const base = FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? "";
  return base.endsWith("/") ? base : base + "/";
}

function getCacheDirectory(language?: string): string {
  const lang = (language || LANG_DEFAULT).toLowerCase();
  return `${getRootCacheDir()}audioCache/${lang}/`;
}

async function ensureLangDir(language?: string) {
  await FileSystem.makeDirectoryAsync(getCacheDirectory(language), {
    intermediates: true,
  }).catch(() => {});
}

export async function cleanupCache(language?: string): Promise<void> {
  const lang = (language || LANG_DEFAULT).toLowerCase();
  if (cleaningLanguages.has(lang)) {
    return;
  }
  cleaningLanguages.add(lang);

  try {
    const dirUri = getCacheDirectory(lang);
    const dirInfo = await FileSystem.getInfoAsync(dirUri);
    if (!dirInfo.exists || !dirInfo.isDirectory) {
      return;
    }

    const allNames = await FileSystem.readDirectoryAsync(dirUri);
    const audioExtensions = [".mp3", ".m4a", ".aac"];
    const audioFileNames = allNames.filter((name) =>
      audioExtensions.some((ext) => name.toLowerCase().endsWith(ext))
    );

    const infos: { uri: string; mtime: number }[] = [];
    await Promise.all(
      audioFileNames.map(async (name) => {
        const fileUri = dirUri + name;
        try {
          const info = await FileSystem.getInfoAsync(fileUri);
          if (info.exists && !info.isDirectory && info.modificationTime) {
            infos.push({ uri: fileUri, mtime: info.modificationTime * 1000 });
          }
        } catch {
          // ignore
        }
      })
    );

    const cutoff = Date.now() - CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

    const oldFiles = infos.filter((f) => f.mtime < cutoff);
    if (oldFiles.length > 0) {
      await Promise.all(
        oldFiles.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
      );
    }

    const stillValid = infos.filter((f) => f.mtime >= cutoff);
    const excessCount = stillValid.length - CACHE_MAX_FILES;
    if (excessCount > 0) {
      const sortedByNewest = stillValid.sort((a, b) => b.mtime - a.mtime);
      const toDelete = sortedByNewest.slice(CACHE_MAX_FILES);
      await Promise.all(
        toDelete.map((f) => FileSystem.deleteAsync(f.uri, { idempotent: true }))
      );
    }
  } catch (err) {
    console.warn(`[cache cleanup error]`, err);
  } finally {
    cleaningLanguages.delete(lang);
  }
}

async function downloadToCache(
  filename: string,
  language?: string,
  onProgress?: (fraction: number) => void
): Promise<string> {
  if (!filename)
    throw new Error("downloadToCache requires a non-empty filename.");

  downloadWasCancelled = false;

  await ensureLangDir(language);
  const cacheDir = getCacheDirectory(language);
  const localUri = cacheDir + sanitize(filename);

  const info = await FileSystem.getInfoAsync(localUri).catch(() => null);
  if (info?.exists) return localUri;

  const downloadUrl = await urlFor(filename);

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    if (downloadWasCancelled) {
      downloadWasCancelled = false;
      const err = new Error("Download cancelled");
      err.name = "CancelledError";
      throw err;
    }

    try {
      const task = FileSystem.createDownloadResumable(
        downloadUrl,
        localUri,
        {},
        ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
          if (onProgress && totalBytesExpectedToWrite > 0) {
            onProgress(totalBytesWritten / totalBytesExpectedToWrite);
          }
        }
      );

      currentDownloadTask = task;
      currentDownloadPath = localUri;

      const result = await task.downloadAsync();

      currentDownloadTask = null;
      currentDownloadPath = null;

      if (downloadWasCancelled) {
        downloadWasCancelled = false;
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
          () => {}
        );
        const err = new Error("Download cancelled");
        err.name = "CancelledError";
        throw err;
      }

      const status = (result as { status?: number })?.status ?? 200;
      if (!result?.uri || status < 200 || status >= 300) {
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
          () => {}
        );
        throw new Error(`Download failed (HTTP ${status})`);
      }
      cleanupCache(language).catch(console.warn);
      return result.uri;
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === "CancelledError" || downloadWasCancelled)
      ) {
        downloadWasCancelled = false;
        currentDownloadTask = null;
        currentDownloadPath = null;
        await FileSystem.deleteAsync(localUri, { idempotent: true }).catch(
          () => {}
        );
        const cancelErr = new Error("Download cancelled");
        cancelErr.name = "CancelledError";
        throw cancelErr;
      }
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt === 0) continue;
      break;
    }
  }
  throw new Error(
    `Failed to download "${filename}": ${lastError?.message || lastError}`
  );
}

// --- HOOK ---

export function usePodcasts(language: string) {
  const qc = useQueryClient();

  useEffect(() => {
    ensureLangDir(language).catch(() => {});
  }, [language]);

  const infiniteQuery = useInfiniteQuery({
    queryKey: ["podcasts", language] as const,
    queryFn: async ({ pageParam }) => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .eq("language_code", language)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching podcasts:", error);
        throw error;
      }
      return (data ?? []) as PodcastType[];
    },
    getNextPageParam: (lastPage: PodcastType[], allPages: PodcastType[][]) => {
      const fetchedSoFar = allPages.reduce((acc, page) => acc + page.length, 0);
      return lastPage.length === PAGE_SIZE ? fetchedSoFar : undefined;
    },
    initialPageParam: 0,
    enabled: Boolean(language),
    retry: 3,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const download = useMutation<string, Error, DownloadVariables>({
    mutationFn: ({
      filename,
      onProgress,
    }: {
      filename: string;
      onProgress?: (frac: number) => void;
    }) => {
      if (!filename) throw new Error("download requires a filename");
      return downloadToCache(filename, language, onProgress);
    },
    onMutate: ({ filename }: { filename: string }) => {
      qc.setQueryData(["download", language, filename], {
        status: "loading",
        progress: 0,
      });
    },
    onError: (error: Error, variables: { filename: string }) => {
      if (error.name !== "CancelledError") {
        console.error(`Error downloading ${variables.filename}:`, error);
      }
      qc.setQueryData(["download", language, variables.filename], {
        status: error.name === "CancelledError" ? "cancelled" : "error",
        error: error.message,
      });
    },
    onSuccess: (localUri: string, variables: { filename: string }) => {
      qc.setQueryData(["download", language, variables.filename], {
        status: "done",
        uri: localUri,
      });
    },
  });

  const getCachedUri = useCallback(
    async (filename: string): Promise<string | null> => {
      if (!filename) return null;
      const localUri = getCacheDirectory(language) + sanitize(filename);
      const info = await FileSystem.getInfoAsync(localUri);
      return info.exists ? localUri : null;
    },
    [language]
  );

  return {
    ...infiniteQuery,
    download,
    getCachedUri,
  };
}
