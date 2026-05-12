import { QuestionType } from "@/constants/Types";
import { getDatabase } from ".";


export type PagedResult<T> = {
  rows: T[];
  total: number;
  limit: number;
  offset: number;
  nextOffset: number | null;
  hasMore: boolean;
};

const DEFAULT_LIMIT = 30;
const HARD_MAX_LIMIT = 200;

function clampLimit(limit?: number) {
  const l = limit ?? DEFAULT_LIMIT;
  return Math.max(1, Math.min(HARD_MAX_LIMIT, l));
}

function escapeLike(s: string) {
  return s.replace(/[\\%_]/g, "\\$&");
}

function likePattern(term: string, mode: "contains" | "prefix" = "contains") {
  const t = escapeLike(term.trim());
  return mode === "prefix" ? `${t}%` : `%${t}%`;
}

function pageMeta<T>(
  rows: T[],
  total: number,
  limit: number,
  offset: number,
): PagedResult<T> {
  const nextOffset = offset + rows.length < total ? offset + rows.length : null;
  return {
    rows,
    total,
    limit,
    offset,
    nextOffset,
    hasMore: nextOffset != null,
  };
}

function emptyResult<T>(limit: number, offset: number): PagedResult<T> {
  return {
    rows: [],
    total: 0,
    limit,
    offset,
    nextOffset: null,
    hasMore: false,
  };
}

/* ------------------------------- QUESTIONS ----------------------------- */

export async function searchQuestions(
  language: string,
  term: string,
  opts?: { limit?: number; offset?: number },
): Promise<PagedResult<QuestionType>> {
  const limit = clampLimit(opts?.limit);
  const offset = opts?.offset ?? 0;
  if (!term.trim()) return emptyResult(limit, offset);

  const db = getDatabase();
  const pat = likePattern(term);
  const patPrefix = likePattern(term, "prefix");

  const totalRow = await db.getFirstAsync<{ total: number }>(
    `
    SELECT COUNT(*) AS total
    FROM questions
    WHERE language_code = ?
      AND (
        title                           LIKE ? ESCAPE '\\'
        OR question                     LIKE ? ESCAPE '\\'
        OR COALESCE(answer,'')          LIKE ? ESCAPE '\\'
        OR COALESCE(answer_khamenei,'') LIKE ? ESCAPE '\\'
        OR COALESCE(answer_sistani,'')  LIKE ? ESCAPE '\\'
      );
    `,
    [language, pat, pat, pat, pat, pat],
  );
  const total = totalRow?.total ?? 0;

  const rows = await db.getAllAsync<QuestionType>(
    `
    SELECT *
    FROM questions
    WHERE language_code = ?
      AND (
        title                           LIKE ? ESCAPE '\\'
        OR question                     LIKE ? ESCAPE '\\'
        OR COALESCE(answer,'')          LIKE ? ESCAPE '\\'
        OR COALESCE(answer_khamenei,'') LIKE ? ESCAPE '\\'
        OR COALESCE(answer_sistani,'')  LIKE ? ESCAPE '\\'
      )
    ORDER BY
      CASE WHEN title LIKE ? ESCAPE '\\' THEN 0
           WHEN title LIKE ? ESCAPE '\\' THEN 1
           ELSE 2 END,
      datetime(created_at) DESC
    LIMIT ? OFFSET ?;
    `,
    [language, pat, pat, pat, pat, pat, patPrefix, pat, limit, offset],
  );

  return pageMeta(rows, total, limit, offset);
}
