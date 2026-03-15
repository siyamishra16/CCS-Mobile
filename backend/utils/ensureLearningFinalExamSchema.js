const pool = require("../db");

async function tableExists(tableName) {
  const result = await pool.query("SELECT to_regclass($1) AS reg", [`public.${tableName}`]);
  return Boolean(result.rows[0]?.reg);
}

async function ensureConstraint(tableName, constraintName, definitionSql) {
  const existing = await pool.query(
    `
    SELECT 1
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public'
      AND t.relname = $1
      AND c.conname = $2
    LIMIT 1
    `,
    [tableName, constraintName]
  );

  if (!existing.rows.length) {
    await pool.query(
      `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} ${definitionSql}`
    );
  }
}

async function ensureLearningFinalExamSchema() {
  const hasLearningQuizzes = await tableExists("learning_quizzes");
  if (hasLearningQuizzes) {
    await pool.query(`
      ALTER TABLE learning_quizzes
      ALTER COLUMN section_id DROP NOT NULL
    `);

    await pool.query(`
      ALTER TABLE learning_quizzes
      ADD COLUMN IF NOT EXISTS quiz_type VARCHAR(20)
    `);
    await pool.query(`
      UPDATE learning_quizzes
      SET quiz_type = 'section'
      WHERE quiz_type IS NULL OR quiz_type = ''
    `);
    await pool.query(`
      ALTER TABLE learning_quizzes
      ALTER COLUMN quiz_type SET DEFAULT 'section'
    `);
    await pool.query(`
      ALTER TABLE learning_quizzes
      ALTER COLUMN quiz_type SET NOT NULL
    `);
    await ensureConstraint(
      "learning_quizzes",
      "learning_quizzes_quiz_type_check",
      "CHECK (quiz_type IN ('section', 'final'))"
    );

    await pool.query(`
      ALTER TABLE learning_quizzes
      ADD COLUMN IF NOT EXISTS passing_percentage INT
    `);
    await pool.query(`
      UPDATE learning_quizzes
      SET passing_percentage = 60
      WHERE passing_percentage IS NULL
    `);
    await pool.query(`
      ALTER TABLE learning_quizzes
      ALTER COLUMN passing_percentage SET DEFAULT 60
    `);
    await pool.query(`
      ALTER TABLE learning_quizzes
      ALTER COLUMN passing_percentage SET NOT NULL
    `);
    await ensureConstraint(
      "learning_quizzes",
      "learning_quizzes_passing_percentage_check",
      "CHECK (passing_percentage >= 0 AND passing_percentage <= 100)"
    );

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_learning_quizzes_quiz_type
      ON learning_quizzes(quiz_type)
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_learning_final_exam_per_course
      ON learning_quizzes(course_id)
      WHERE quiz_type = 'final'
    `);
  }

  const hasLearningQuestions = await tableExists("learning_questions");
  if (hasLearningQuestions) {
    await pool.query(`
      ALTER TABLE learning_questions
      ALTER COLUMN section_id DROP NOT NULL
    `);
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS learning_final_exam_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
      quiz_id UUID NOT NULL REFERENCES learning_quizzes(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      score_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
      correct_answers INT NOT NULL DEFAULT 0,
      total_questions INT NOT NULL DEFAULT 0,
      passed BOOLEAN NOT NULL DEFAULT FALSE,
      answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_final_exam_attempts_student
    ON learning_final_exam_attempts(student_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_final_exam_attempts_course
    ON learning_final_exam_attempts(course_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_final_exam_attempts_quiz
    ON learning_final_exam_attempts(quiz_id)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS learning_section_quiz_attempts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
      section_id UUID NOT NULL REFERENCES learning_sections(id) ON DELETE CASCADE,
      quiz_id UUID NOT NULL REFERENCES learning_quizzes(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      score_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
      correct_answers INT NOT NULL DEFAULT 0,
      total_questions INT NOT NULL DEFAULT 0,
      passed BOOLEAN NOT NULL DEFAULT FALSE,
      answers_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_section_quiz_attempts_student
    ON learning_section_quiz_attempts(student_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_section_quiz_attempts_course
    ON learning_section_quiz_attempts(course_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_section_quiz_attempts_section
    ON learning_section_quiz_attempts(section_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_section_quiz_attempts_quiz
    ON learning_section_quiz_attempts(quiz_id)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS learning_lesson_progress (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
      section_id UUID NOT NULL REFERENCES learning_sections(id) ON DELETE CASCADE,
      lesson_id UUID NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE (student_id, lesson_id)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_lesson_progress_student
    ON learning_lesson_progress(student_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_lesson_progress_course
    ON learning_lesson_progress(course_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_lesson_progress_section
    ON learning_lesson_progress(section_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_lesson_progress_lesson
    ON learning_lesson_progress(lesson_id)
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS learning_course_enrollments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      course_id UUID NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
      student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'completed')),
      enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      completed_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE (course_id, student_id)
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_course_enrollments_student
    ON learning_course_enrollments(student_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_learning_course_enrollments_course
    ON learning_course_enrollments(course_id)
  `);

  const hasCertificates = await tableExists("certificates");
  const hasLearningCourses = await tableExists("learning_courses");
  if (hasCertificates) {
    await pool.query(`
      ALTER TABLE certificates
      ADD COLUMN IF NOT EXISTS learning_course_id UUID
    `);

    if (hasLearningCourses) {
      const fkExists = await pool.query(
        `
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'certificates'
          AND c.conname = 'certificates_learning_course_id_fkey'
        LIMIT 1
        `
      );
      if (!fkExists.rows.length) {
        await pool.query(`
          ALTER TABLE certificates
          ADD CONSTRAINT certificates_learning_course_id_fkey
          FOREIGN KEY (learning_course_id)
          REFERENCES learning_courses(id)
          ON DELETE SET NULL
        `);
      }
    }

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_certificates_learning_course_id
      ON certificates(learning_course_id)
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_student_learning_course
      ON certificates(student_id, learning_course_id)
      WHERE student_id IS NOT NULL AND learning_course_id IS NOT NULL
    `);
  }
}

module.exports = ensureLearningFinalExamSchema;
