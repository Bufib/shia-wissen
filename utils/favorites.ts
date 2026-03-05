
// // utils/favorites.ts
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { addFavoriteToast, removeFavoriteToast } from "@/constants/messages";

// /**
//  * Per-language favorites storage for news & podcasts.
//  * Keys look like:
//  *   favorite_newsarticles:<lang>
//  *   favorite_podcasts:<lang>
//  */

// const NEWS_PREFIX = "favorite_newsarticles";
// const PODCAST_PREFIX = "favorite_podcasts";

// const keyFor = (prefix: string, lang?: string | null) =>
//   `${prefix}:${(lang ?? "default").toLowerCase()}`;

// const normalizeIds = (arr: unknown[]): number[] =>
//   Array.from(new Set(arr.map((x) => Number(x)))).filter(Number.isFinite);

// async function readIds(
//   prefix: string,
//   lang?: string | null
// ): Promise<number[]> {
//   try {
//     const raw = await AsyncStorage.getItem(keyFor(prefix, lang));
//     if (!raw) return [];
//     return normalizeIds(JSON.parse(raw));
//   } catch (e) {
//     console.error("[favorites] readIds error", e);
//     return [];
//   }
// }

// async function writeIds(
//   prefix: string,
//   lang: string | null | undefined,
//   ids: number[]
// ): Promise<void> {
//   try {
//     await AsyncStorage.setItem(
//       keyFor(prefix, lang),
//       JSON.stringify(normalizeIds(ids))
//     );
//   } catch (e) {
//     console.error("[favorites] writeIds error", e);
//   }
// }

// async function toggleGeneric(
//   prefix: string,
//   id: number,
//   lang?: string | null
// ): Promise<boolean> {
//   const ids = await readIds(prefix, lang);
//   const nId = Number(id);
//   const exists = ids.includes(nId);
//   const next = exists ? ids.filter((x) => x !== nId) : [...ids, nId];
//   await writeIds(prefix, lang, next);
//   const existsToast = () => {
//     return exists ? removeFavoriteToast() : addFavoriteToast();
//   };
//   existsToast();
//   return !exists; // new favorited state
// }

// async function hasGeneric(
//   prefix: string,
//   id: number,
//   lang?: string | null
// ): Promise<boolean> {
//   const ids = await readIds(prefix, lang);
//   return ids.includes(Number(id));
// }

// /* ----------------- NEWS ----------------- */

// export async function getFavoriteNewsArticle(
//   lang?: string | null
// ): Promise<number[]> {
//   return readIds(NEWS_PREFIX, lang);
// }

// export async function isNewsArticleFavorited(
//   id: number,
//   lang?: string | null
// ): Promise<boolean> {
//   return hasGeneric(NEWS_PREFIX, id, lang);
// }

// export async function toggleNewsArticleFavorite(
//   id: number,
//   lang: string | null
// ): Promise<boolean> {
//   return toggleGeneric(NEWS_PREFIX, id, lang);
// }

// /* --------------- PODCASTS --------------- */

// export async function getFavoritePodcasts(
//   lang?: string | null
// ): Promise<number[]> {
//   return readIds(PODCAST_PREFIX, lang);
// }

// export async function isPodcastFavorited(
//   id: number,
//   lang?: string | null
// ): Promise<boolean> {
//   return hasGeneric(PODCAST_PREFIX, id, lang);
// }

// export async function togglePodcastFavorite(
//   id: number,
//   lang: string | null
// ): Promise<boolean> {
//   return toggleGeneric(PODCAST_PREFIX, id, lang);
// }


// utils/favorites.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addFavoriteToast, removeFavoriteToast } from "@/constants/messages";

/**
 * Per-language favorites storage for news, podcasts & pdfs.
 * Keys look like:
 *   favorite_newsarticles:<lang>
 *   favorite_podcasts:<lang>
 *   favorite_pdfs:<lang>
 */

const NEWS_PREFIX = "favorite_newsarticles";
const PODCAST_PREFIX = "favorite_podcasts";
const PDF_PREFIX = "favorite_pdfs";

const keyFor = (prefix: string, lang?: string | null) =>
  `${prefix}:${(lang ?? "default").toLowerCase()}`;

const normalizeIds = (arr: unknown[]): number[] =>
  Array.from(new Set(arr.map((x) => Number(x)))).filter(Number.isFinite);

async function readIds(
  prefix: string,
  lang?: string | null
): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(keyFor(prefix, lang));
    if (!raw) return [];
    return normalizeIds(JSON.parse(raw));
  } catch (e) {
    console.error("[favorites] readIds error", e);
    return [];
  }
}

async function writeIds(
  prefix: string,
  lang: string | null | undefined,
  ids: number[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      keyFor(prefix, lang),
      JSON.stringify(normalizeIds(ids))
    );
  } catch (e) {
    console.error("[favorites] writeIds error", e);
  }
}

async function toggleGeneric(
  prefix: string,
  id: number,
  lang?: string | null
): Promise<boolean> {
  const ids = await readIds(prefix, lang);
  const nId = Number(id);
  const exists = ids.includes(nId);
  const next = exists ? ids.filter((x) => x !== nId) : [...ids, nId];
  await writeIds(prefix, lang, next);
  const existsToast = () => {
    return exists ? removeFavoriteToast() : addFavoriteToast();
  };
  existsToast();
  return !exists; // new favorited state
}

async function hasGeneric(
  prefix: string,
  id: number,
  lang?: string | null
): Promise<boolean> {
  const ids = await readIds(prefix, lang);
  return ids.includes(Number(id));
}

/* ----------------- NEWS ----------------- */

export async function getFavoriteNewsArticle(
  lang?: string | null
): Promise<number[]> {
  return readIds(NEWS_PREFIX, lang);
}

export async function isNewsArticleFavorited(
  id: number,
  lang?: string | null
): Promise<boolean> {
  return hasGeneric(NEWS_PREFIX, id, lang);
}

export async function toggleNewsArticleFavorite(
  id: number,
  lang: string | null
): Promise<boolean> {
  return toggleGeneric(NEWS_PREFIX, id, lang);
}

/* --------------- PODCASTS --------------- */

export async function getFavoritePodcasts(
  lang?: string | null
): Promise<number[]> {
  return readIds(PODCAST_PREFIX, lang);
}

export async function isPodcastFavorited(
  id: number,
  lang?: string | null
): Promise<boolean> {
  return hasGeneric(PODCAST_PREFIX, id, lang);
}

export async function togglePodcastFavorite(
  id: number,
  lang: string | null
): Promise<boolean> {
  return toggleGeneric(PODCAST_PREFIX, id, lang);
}

/* ------------------ PDFS ----------------- */

export async function getFavoritePdf(
  lang?: string | null
): Promise<number[]> {
  return readIds(PDF_PREFIX, lang);
}

export async function isPdfFavorited(
  id: number,
  lang?: string | null
): Promise<boolean> {
  return hasGeneric(PDF_PREFIX, id, lang);
}

export async function togglePdfFavorite(
  id: number,
  lang: string | null
): Promise<boolean> {
  return toggleGeneric(PDF_PREFIX, id, lang);
}
