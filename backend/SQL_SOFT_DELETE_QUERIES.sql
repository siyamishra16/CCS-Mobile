-- ====================================================
-- SOFT DELETE IMPLEMENTATION - COMPLETE SQL QUERIES
-- ====================================================
-- Copy and paste these queries into your database to add soft delete functionality

-- ====================================================
-- STEP 1: Add Soft Delete Columns
-- ====================================================

ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

ALTER TABLE exams ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE exams ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

ALTER TABLE exam_modules ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE exam_modules ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE exam_questions ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE exam_attempts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- ====================================================
-- STEP 2: Create Indexes for Performance
-- ====================================================

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

-- ====================================================
-- STEP 3: Create Views for Recycle Bins (Optional but Recommended)
-- ====================================================

CREATE OR REPLACE VIEW deleted_categories AS
SELECT * FROM categories WHERE is_deleted = TRUE;

CREATE OR REPLACE VIEW deleted_subcategories AS
SELECT * FROM subcategories WHERE is_deleted = TRUE;

CREATE OR REPLACE VIEW deleted_exams AS
SELECT * FROM exams WHERE is_deleted = TRUE;

CREATE OR REPLACE VIEW deleted_exam_questions AS
SELECT * FROM exam_questions WHERE is_deleted = TRUE;

-- ====================================================
-- STEP 4: Example Queries for Operations
-- ====================================================

-- Soft Delete a Category
UPDATE categories SET is_deleted = TRUE, deleted_at = NOW() WHERE id = 'YOUR_ID_HERE';

-- Soft Delete an Exam
UPDATE exams SET is_deleted = TRUE, deleted_at = NOW() WHERE id = 'YOUR_ID_HERE';

-- Soft Delete a Question
UPDATE exam_questions SET is_deleted = TRUE, deleted_at = NOW() WHERE id = YOUR_ID_HERE;

-- List Only Active Items (excluding soft deleted)
SELECT * FROM categories WHERE is_deleted = FALSE ORDER BY created_at DESC;

-- List Items in Recycle Bin
SELECT * FROM categories WHERE is_deleted = TRUE ORDER BY deleted_at DESC;

-- Restore a Deleted Item
UPDATE categories SET is_deleted = FALSE, deleted_at = NULL WHERE id = 'YOUR_ID_HERE';

-- Permanently Delete an Item
DELETE FROM categories WHERE id = 'YOUR_ID_HERE';

-- Count Deleted Items
SELECT COUNT(*) FROM categories WHERE is_deleted = TRUE;

-- Find Items Deleted After a Specific Date
SELECT * FROM categories WHERE is_deleted = TRUE AND deleted_at >= '2025-01-01';

-- Finding Items Deleted By a User (if you track user_id)
-- SELECT * FROM categories WHERE is_deleted = TRUE AND deleted_by = 'USER_ID';

-- ====================================================
-- STEP 5: Find Items Ready for Permanent Deletion (30 days old)
-- ====================================================

-- Items deleted more than 30 days ago
SELECT COUNT(*) as ready_for_deletion FROM categories 
WHERE is_deleted = TRUE AND deleted_at <= NOW() - INTERVAL '30 days';

-- View these items before deletion
SELECT id, code, name, deleted_at FROM categories 
WHERE is_deleted = TRUE AND deleted_at <= NOW() - INTERVAL '30 days';

-- Permanently delete items older than 30 days
DELETE FROM categories 
WHERE is_deleted = TRUE AND deleted_at <= NOW() - INTERVAL '30 days';

-- ====================================================
-- STEP 6: Verification Queries
-- ====================================================

-- Check migration status across all tables
SELECT 
    'categories' as table_name,
    COUNT(CASE WHEN is_deleted = FALSE THEN 1 END) as active_count,
    COUNT(CASE WHEN is_deleted = TRUE THEN 1 END) as deleted_count,
    COUNT(*) as total_count
FROM categories
UNION ALL
SELECT 
    'subcategories',
    COUNT(CASE WHEN is_deleted = FALSE THEN 1 END),
    COUNT(CASE WHEN is_deleted = TRUE THEN 1 END),
    COUNT(*)
FROM subcategories
UNION ALL
SELECT 
    'exams',
    COUNT(CASE WHEN is_deleted = FALSE THEN 1 END),
    COUNT(CASE WHEN is_deleted = TRUE THEN 1 END),
    COUNT(*)
FROM exams
UNION ALL
SELECT 
    'exam_questions',
    COUNT(CASE WHEN is_deleted = FALSE THEN 1 END),
    COUNT(CASE WHEN is_deleted = TRUE THEN 1 END),
    COUNT(*)
FROM exam_questions;

-- Check specific item in trash
SELECT id, code, name, deleted_at FROM categories WHERE is_deleted = TRUE LIMIT 5;

-- ====================================================
-- STEP 7: Query Patterns for Application Code
-- ====================================================

-- Pattern 1: Always exclude soft deleted when listing
-- WHERE is_deleted = FALSE

-- Pattern 2: Soft delete operation
-- UPDATE table SET is_deleted = TRUE, deleted_at = NOW() WHERE id = $1

-- Pattern 3: Restore from trash
-- UPDATE table SET is_deleted = FALSE, deleted_at = NULL WHERE id = $1

-- Pattern 4: List from trash
-- SELECT * FROM table WHERE is_deleted = TRUE ORDER BY deleted_at DESC

-- Pattern 5: Hard delete (only for trash items)
-- DELETE FROM table WHERE id = $1

