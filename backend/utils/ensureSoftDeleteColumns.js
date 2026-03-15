const pool = require("../db");

const SOFT_DELETE_TABLES = [
    "categories",
    "subcategories",
    "exams",
    "exam_modules",
    "exam_questions",
    "exam_attempts",
];

async function tableExists(tableName) {
    const result = await pool.query("SELECT to_regclass($1) AS reg", [`public.${tableName}`]);
    return Boolean(result.rows[0]?.reg);
}

async function ensureColumnsForTable(tableName) {
    if (!(await tableExists(tableName))) return;
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL`);
}

async function ensureSoftDeleteColumns() {
    for (const tableName of SOFT_DELETE_TABLES) {
        await ensureColumnsForTable(tableName);
    }
}

module.exports = ensureSoftDeleteColumns;
