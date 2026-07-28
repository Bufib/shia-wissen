//! Last that worked
export const migrationSQL = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;         -- harmless even if you have no FKs
  PRAGMA busy_timeout = 5000;

  -- LANGUAGES (keep if you use it in UI; no FKs)
  CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY,
    language_code TEXT NOT NULL UNIQUE
  );

  -- QUESTIONS
  CREATE TABLE IF NOT EXISTS question_categories (
    id INTEGER PRIMARY KEY,
    category_name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    language_code TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_question_categories_lang ON question_categories(language_code);

  CREATE TABLE IF NOT EXISTS question_subcategories (
    id INTEGER PRIMARY KEY,
    subcategory_name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    language_code TEXT NOT NULL DEFAULT 'de'
  );
  CREATE INDEX IF NOT EXISTS idx_question_subcategories_lang ON question_subcategories(language_code);

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY,
    question TEXT NOT NULL,
    title TEXT NOT NULL,
    question_category_name TEXT NOT NULL,
    question_subcategory_name TEXT NOT NULL,
    answer TEXT,
    answer_khamenei TEXT,
    answer_sistani TEXT,
    created_at TEXT NOT NULL,
    related_question TEXT CHECK(related_question IS NULL OR json_valid(related_question)),
    language_code TEXT NOT NULL DEFAULT 'de'
  );
  
    CREATE INDEX IF NOT EXISTS idx_questions_cat_sub_lang_created ON questions(question_category_name, question_subcategory_name, language_code, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_questions_title_lang_nocase ON questions(title COLLATE NOCASE, language_code);
    CREATE TABLE IF NOT EXISTS favorite_questions (
    question_id INTEGER NOT NULL,
    created_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS uq_fav_questions_qid ON favorite_questions(question_id);
  CREATE INDEX IF NOT EXISTS idx_fav_questions_created_join
  ON favorite_questions(created_at DESC, question_id);
  CREATE INDEX IF NOT EXISTS idx_questions_lang_created
  ON questions(language_code, created_at DESC);


`;
