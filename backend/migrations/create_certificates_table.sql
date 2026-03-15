-- Migration: create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  student_id UUID REFERENCES users(id) ON DELETE SET NULL,
  exam_id INTEGER,
  learning_course_id UUID REFERENCES learning_courses(id) ON DELETE SET NULL,
  certificate_number VARCHAR(128) UNIQUE NOT NULL,
  file_url TEXT,
  cloudinary_public_id TEXT,
  data_json JSONB,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(32) DEFAULT 'issued',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_certificates_student_id ON certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_exam_id ON certificates(exam_id);
CREATE INDEX IF NOT EXISTS idx_certificates_learning_course_id ON certificates(learning_course_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_student_exam
ON certificates(student_id, exam_id)
WHERE student_id IS NOT NULL AND exam_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_certificates_student_learning_course
ON certificates(student_id, learning_course_id)
WHERE student_id IS NOT NULL AND learning_course_id IS NOT NULL;
