const pool = require("../db");

async function tableExists(tableName) {
  const result = await pool.query("SELECT to_regclass($1) AS reg", [`public.${tableName}`]);
  return Boolean(result.rows[0]?.reg);
}

async function ensureLearningLessonPosition() {
  const exists = await tableExists("learning_lessons");
  if (!exists) return;

  await pool.query(`
    ALTER TABLE learning_lessons
    ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 1
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_lessons_section_position
    ON learning_lessons(section_id, position, created_at)
  `);

  await pool.query(`
    WITH ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY section_id
          ORDER BY position ASC, created_at ASC, id ASC
        ) AS next_position
      FROM learning_lessons
    )
    UPDATE learning_lessons l
    SET position = ranked.next_position
    FROM ranked
    WHERE l.id = ranked.id
      AND l.position IS DISTINCT FROM ranked.next_position
  `);
}

module.exports = ensureLearningLessonPosition;
