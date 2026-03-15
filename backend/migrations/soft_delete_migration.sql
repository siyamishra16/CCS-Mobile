-- ====================================
-- SOFT DELETE MIGRATION
-- Add soft delete columns to exam management tables
-- ====================================

-- Add soft delete columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add soft delete columns to subcategories table
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add soft delete columns to exams table
ALTER TABLE exams ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add soft delete columns to exam_modules table (if exists)
ALTER TABLE exam_modules ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE exam_modules ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add soft delete columns to exam_questions table
ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add soft delete columns to exam_attempts table (if exists)
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Create indexes for soft delete queries
CREATE INDEX IF NOT EXISTS idx_categories_is_deleted ON categories(is_deleted);
CREATE INDEX IF NOT EXISTS idx_categories_deleted_at ON categories(deleted_at);

CREATE INDEX IF NOT EXISTS idx_subcategories_is_deleted ON subcategories(is_deleted);
CREATE INDEX IF NOT EXISTS idx_subcategories_deleted_at ON subcategories(deleted_at);

CREATE INDEX IF NOT EXISTS idx_exams_is_deleted ON exams(is_deleted);
CREATE INDEX IF NOT EXISTS idx_exams_deleted_at ON exams(deleted_at);

CREATE INDEX IF NOT EXISTS idx_exam_modules_is_deleted ON exam_modules(is_deleted);
CREATE INDEX IF NOT EXISTS idx_exam_modules_deleted_at ON exam_modules(deleted_at);

CREATE INDEX IF NOT EXISTS idx_exam_questions_is_deleted ON exam_questions(is_deleted);
CREATE INDEX IF NOT EXISTS idx_exam_questions_deleted_at ON exam_questions(deleted_at);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_is_deleted ON exam_attempts(is_deleted);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_deleted_at ON exam_attempts(deleted_at);

-- Create views for deleted items (optional but useful for recycle bin)
CREATE OR REPLACE VIEW deleted_categories AS
SELECT * FROM categories WHERE is_deleted = TRUE;

CREATE OR REPLACE VIEW deleted_subcategories AS
SELECT * FROM subcategories WHERE is_deleted = TRUE;

CREATE OR REPLACE VIEW deleted_exams AS
SELECT * FROM exams WHERE is_deleted = TRUE;

CREATE OR REPLACE VIEW deleted_exam_questions AS
SELECT * FROM exam_questions WHERE is_deleted = TRUE;

-- Verify migration
SELECT 'Categories' AS table_name, COUNT(*) as total_records FROM categories
UNION ALL
SELECT 'Subcategories', COUNT(*) FROM subcategories
UNION ALL
SELECT 'Exams', COUNT(*) FROM exams
UNION ALL
SELECT 'Exam Questions', COUNT(*) FROM exam_questions;
