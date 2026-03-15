
// const { Readable } = require("stream"); // ← REPLACED streamifier with this built-in
// const pool = require("../db");
// const cloudinary = require("../config/cloudinary");

// const ADMIN_TYPES = new Set([1, 2]);

// const isAdminUser = (userType) => ADMIN_TYPES.has(Number(userType));

// const ensureAdmin = (req, res) => {
//   if (!isAdminUser(req.userType)) {
//     res.status(403).json({ message: "Only admin/subadmin can manage learning module." });
//     return false;
//   }
//   return true;
// };

// const mapError = (err) => {
//   if (err?.code === "23505") return "Duplicate entry";
//   if (err?.code === "23503") return "Related record not found";
//   if (err?.code === "22P02") return "Invalid identifier format";
//   return "Server error";
// };

// // ── FIXED: no streamifier, uses built-in Readable.from(buffer) ──────────────
// const uploadLearningMediaToCloudinary = ({ buffer, mediaType, mimetype, originalName }) =>
//   new Promise((resolve, reject) => {
//     const normalizedType = String(mediaType || "file").toLowerCase();

//     // Cloudinary resource_type:
//     //   video/audio → "video"  (Cloudinary handles audio under the video resource type)
//     //   image       → "image"
//     //   everything else (pdf, docx, zip…) → "raw"
//     const resourceType =
//       normalizedType === "image"
//         ? "image"
//         : normalizedType === "video" || normalizedType === "audio"
//           ? "video"
//           : "raw";

//     const uploadOptions = {
//       folder: `ccs/learning/${normalizedType}`,
//       resource_type: resourceType,
//       use_filename: true,
//       unique_filename: true,
//       overwrite: false,
//     };

//     // Only force content_type for raw uploads (PDFs, ZIPs, etc.)
//     if (mimetype && resourceType === "raw") {
//       uploadOptions.content_type = mimetype;
//     }

//     // Strip extension for the public_id
//     if (originalName) {
//       uploadOptions.public_id = originalName.replace(/\.[^.]+$/, "");
//     }

//     const stream = cloudinary.uploader.upload_stream(
//       uploadOptions,
//       (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload_stream error:", error);
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       }
//     );

//     // Built-in Node.js — zero extra dependencies
//     Readable.from(buffer).pipe(stream);
//   });

// const deleteLearningImageFromCloudinary = async (publicId) => {
//   if (!publicId) return;
//   await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
// };

// const normalizeSections = (sections) => {
//   if (!Array.isArray(sections)) return [];
//   return sections
//     .map((item, index) => ({
//       title: String(item?.title || "").trim(),
//       position: Number(item?.position) > 0 ? Number(item.position) : index + 1,
//     }))
//     .filter((item) => item.title);
// };

// const ensureSectionBelongsToCourse = async (sectionId, courseId) => {
//   const section = await pool.query(
//     "SELECT id FROM learning_sections WHERE id = $1 AND course_id = $2 LIMIT 1",
//     [sectionId, courseId]
//   );
//   return section.rows.length > 0;
// };

// const ensureQuizBelongsToContext = async (quizId, sectionId, courseId) => {
//   const quiz = await pool.query(
//     "SELECT id FROM learning_quizzes WHERE id = $1 AND section_id = $2 AND course_id = $3 LIMIT 1",
//     [quizId, sectionId, courseId]
//   );
//   return quiz.rows.length > 0;
// };

// const normalizeLessonPositionsForSection = async (client, sectionId) => {
//   await client.query(
//     `
//     WITH ranked AS (
//       SELECT
//         id,
//         ROW_NUMBER() OVER (
//           PARTITION BY section_id
//           ORDER BY position ASC, created_at ASC, id ASC
//         ) AS next_position
//       FROM learning_lessons
//       WHERE section_id = $1
//     )
//     UPDATE learning_lessons l
//     SET position = ranked.next_position
//     FROM ranked
//     WHERE l.id = ranked.id
//       AND l.position IS DISTINCT FROM ranked.next_position
//     `,
//     [sectionId]
//   );
// };

// exports.uploadLearningMedia = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     if (!req.file) return res.status(400).json({ message: "Media file is required." });

//     const mediaType = String(req.body.media_type || "file").toLowerCase();
//     const allowed = new Set(["file", "video", "audio", "image"]);
//     if (!allowed.has(mediaType)) {
//       return res.status(400).json({ message: "Invalid media_type. Use file/video/audio/image." });
//     }

//     console.log(`Uploading to Cloudinary — type: ${mediaType}, size: ${req.file.size} bytes`);

//     const uploaded = await uploadLearningMediaToCloudinary({
//       buffer: req.file.buffer,
//       mediaType,
//       mimetype: req.file.mimetype,
//       originalName: req.file.originalname,
//     });

//     console.log(`Cloudinary upload success — public_id: ${uploaded.public_id}`);

//     return res.status(201).json({
//       message: "Media uploaded successfully.",
//       data: {
//         secure_url: uploaded.secure_url,
//         public_id: uploaded.public_id,
//         resource_type: uploaded.resource_type,
//         format: uploaded.format,
//         bytes: uploaded.bytes,
//       },
//     });
//   } catch (err) {
//     console.error("UPLOAD LEARNING MEDIA ERROR:", err.message, err);
//     return res.status(500).json({ message: "Server error", detail: err.message });
//   }
// };

// exports.createCourse = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     if (!ensureAdmin(req, res)) return;

//     const title = String(req.body.title || "").trim();
//     const description = req.body.description ? String(req.body.description).trim() : null;
//     const instructorName = req.body.instructor_name ? String(req.body.instructor_name).trim() : null;
//     const featuredImageUrl = req.body.featured_image_url ? String(req.body.featured_image_url).trim() : null;
//     const featuredImagePublicId = req.body.featured_image_public_id
//       ? String(req.body.featured_image_public_id).trim()
//       : null;
//     const sections = normalizeSections(req.body.sections);

//     if (!title) return res.status(400).json({ message: "Course title is required." });
//     if (!sections.length) {
//       return res.status(400).json({ message: "At least one section is required while creating a course." });
//     }

//     await client.query("BEGIN");
//     const courseResult = await client.query(
//       `
//       INSERT INTO learning_courses (title, description, instructor_name, featured_image_url, featured_image_public_id, created_by)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//       `,
//       [title, description, instructorName, featuredImageUrl, featuredImagePublicId, req.userId]
//     );
//     const course = courseResult.rows[0];

//     const insertedSections = [];
//     for (const section of sections) {
//       const sectionResult = await client.query(
//         `
//         INSERT INTO learning_sections (course_id, title, position)
//         VALUES ($1, $2, $3)
//         RETURNING *
//         `,
//         [course.id, section.title, section.position]
//       );
//       insertedSections.push(sectionResult.rows[0]);
//     }

//     await client.query("COMMIT");
//     return res.status(201).json({
//       message: "Course created successfully.",
//       data: {
//         course,
//         sections: insertedSections.sort((a, b) => a.position - b.position),
//       },
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("CREATE COURSE ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   } finally {
//     client.release();
//   }
// };

// exports.getCourses = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;

//     const coursesResult = await pool.query(
//       `
//       SELECT
//         c.*,
//         (
//           SELECT COUNT(*)::INT
//           FROM learning_sections s
//           WHERE s.course_id = c.id
//         ) AS section_count,
//         (
//           SELECT COUNT(*)::INT
//           FROM learning_lessons l
//           WHERE l.course_id = c.id
//         ) AS lesson_count,
//         (
//           SELECT COUNT(*)::INT
//           FROM learning_quizzes q
//           WHERE q.course_id = c.id
//         ) AS quiz_count
//       FROM learning_courses c
//       ORDER BY c.created_at DESC
//       `
//     );

//     const sectionsResult = await pool.query(
//       `
//       SELECT *
//       FROM learning_sections
//       ORDER BY course_id, position ASC, created_at ASC
//       `
//     );

//     const sectionsByCourse = sectionsResult.rows.reduce((acc, section) => {
//       if (!acc[section.course_id]) acc[section.course_id] = [];
//       acc[section.course_id].push(section);
//       return acc;
//     }, {});

//     const data = coursesResult.rows.map((course) => ({
//       ...course,
//       sections: sectionsByCourse[course.id] || [],
//     }));

//     return res.json({ data });
//   } catch (err) {
//     console.error("GET COURSES ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.getCourseById = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { courseId } = req.params;

//     const courseResult = await pool.query(
//       "SELECT * FROM learning_courses WHERE id = $1 LIMIT 1",
//       [courseId]
//     );
//     if (!courseResult.rows.length) {
//       return res.status(404).json({ message: "Course not found." });
//     }

//     const sections = await pool.query(
//       "SELECT * FROM learning_sections WHERE course_id = $1 ORDER BY position ASC, created_at ASC",
//       [courseId]
//     );
//     const lessons = await pool.query(
//       "SELECT * FROM learning_lessons WHERE course_id = $1 ORDER BY section_id ASC, position ASC, created_at ASC",
//       [courseId]
//     );
//     const quizzes = await pool.query(
//       "SELECT * FROM learning_quizzes WHERE course_id = $1 ORDER BY created_at DESC",
//       [courseId]
//     );

//     return res.json({
//       data: {
//         course: courseResult.rows[0],
//         sections: sections.rows,
//         lessons: lessons.rows,
//         quizzes: quizzes.rows,
//       },
//     });
//   } catch (err) {
//     console.error("GET COURSE BY ID ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.updateCourseImage = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { courseId } = req.params;

//     const featuredImageUrl = req.body.featured_image_url
//       ? String(req.body.featured_image_url).trim()
//       : null;
//     const featuredImagePublicId = req.body.featured_image_public_id
//       ? String(req.body.featured_image_public_id).trim()
//       : null;
//     const removeImage = req.body.remove_image === true || req.body.remove_image === "true";

//     if (!removeImage && (!featuredImageUrl || !featuredImagePublicId)) {
//       return res.status(400).json({
//         message: "Provide featured_image_url and featured_image_public_id, or set remove_image=true.",
//       });
//     }

//     await client.query("BEGIN");
//     const existingResult = await client.query(
//       `
//       SELECT id, featured_image_url, featured_image_public_id
//       FROM learning_courses
//       WHERE id = $1
//       LIMIT 1
//       FOR UPDATE
//       `,
//       [courseId]
//     );
//     if (!existingResult.rows.length) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Course not found." });
//     }

//     const existingCourse = existingResult.rows[0];
//     const nextImageUrl = removeImage ? null : featuredImageUrl;
//     const nextImagePublicId = removeImage ? null : featuredImagePublicId;

//     const updatedResult = await client.query(
//       `
//       UPDATE learning_courses
//       SET featured_image_url = $1, featured_image_public_id = $2, updated_at = NOW()
//       WHERE id = $3
//       RETURNING *
//       `,
//       [nextImageUrl, nextImagePublicId, courseId]
//     );
//     await client.query("COMMIT");

//     const oldPublicId = existingCourse.featured_image_public_id;
//     const shouldDeleteOld =
//       oldPublicId && (removeImage || (nextImagePublicId && oldPublicId !== nextImagePublicId));
//     if (shouldDeleteOld) {
//       try {
//         await deleteLearningImageFromCloudinary(oldPublicId);
//       } catch (cloudErr) {
//         console.error("DELETE COURSE IMAGE FROM CLOUDINARY ERROR:", cloudErr.message);
//       }
//     }

//     return res.json({
//       message: removeImage ? "Course image deleted successfully." : "Course image updated successfully.",
//       data: updatedResult.rows[0],
//     });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("UPDATE COURSE IMAGE ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   } finally {
//     client.release();
//   }
// };

// exports.createSection = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { courseId } = req.params;
//     const title = String(req.body.title || "").trim();
//     const requestedPosition = Number(req.body.position);

//     if (!title) return res.status(400).json({ message: "Section title is required." });

//     const courseExists = await pool.query(
//       "SELECT id FROM learning_courses WHERE id = $1 LIMIT 1",
//       [courseId]
//     );
//     if (!courseExists.rows.length) return res.status(404).json({ message: "Course not found." });

//     const countResult = await pool.query(
//       "SELECT COUNT(*)::INT AS count FROM learning_sections WHERE course_id = $1",
//       [courseId]
//     );
//     const nextPosition =
//       requestedPosition > 0 ? requestedPosition : Number(countResult.rows[0]?.count || 0) + 1;

//     const section = await pool.query(
//       `
//       INSERT INTO learning_sections (course_id, title, position)
//       VALUES ($1, $2, $3)
//       RETURNING *
//       `,
//       [courseId, title, nextPosition]
//     );

//     return res.status(201).json({ data: section.rows[0] });
//   } catch (err) {
//     console.error("CREATE SECTION ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.getSectionsByCourse = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { courseId } = req.params;

//     const sections = await pool.query(
//       "SELECT * FROM learning_sections WHERE course_id = $1 ORDER BY position ASC, created_at ASC",
//       [courseId]
//     );
//     return res.json({ data: sections.rows });
//   } catch (err) {
//     console.error("GET SECTIONS BY COURSE ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.updateSection = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { sectionId } = req.params;
//     const title = String(req.body.title || "").trim();

//     if (!title) return res.status(400).json({ message: "Section title is required." });

//     const updated = await pool.query(
//       `
//       UPDATE learning_sections
//       SET title = $1, updated_at = NOW()
//       WHERE id = $2
//       RETURNING *
//       `,
//       [title, sectionId]
//     );

//     if (!updated.rows.length) return res.status(404).json({ message: "Section not found." });
//     return res.json({ data: updated.rows[0] });
//   } catch (err) {
//     console.error("UPDATE SECTION ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.createLesson = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     if (!ensureAdmin(req, res)) return;

//     const courseId = req.body.course_id;
//     const sectionId = req.body.section_id;
//     const title = String(req.body.title || "").trim();
//     const mediaType = String(req.body.media_type || "none");
//     const mediaUrl = req.body.media_url ? String(req.body.media_url).trim() : null;
//     const mediaPublicId = req.body.media_public_id ? String(req.body.media_public_id).trim() : null;
//     const mediaOriginalName = req.body.media_original_name
//       ? String(req.body.media_original_name).trim()
//       : null;
//     const content = req.body.content ? String(req.body.content).trim() : null;
//     const durationMinutes = Number(req.body.duration_minutes) || 0;

//     if (!courseId || !sectionId || !title) {
//       return res.status(400).json({ message: "course_id, section_id, and title are required." });
//     }
//     if (!["none", "video", "audio", "file"].includes(mediaType)) {
//       return res.status(400).json({ message: "Invalid media_type." });
//     }

//     const validSection = await ensureSectionBelongsToCourse(sectionId, courseId);
//     if (!validSection) {
//       return res.status(400).json({ message: "Section does not belong to the selected course." });
//     }

//     await client.query("BEGIN");

//     const positionResult = await client.query(
//       `
//       SELECT COALESCE(MAX(position), 0)::INT AS max_position
//       FROM learning_lessons
//       WHERE section_id = $1
//       `,
//       [sectionId]
//     );
//     const nextPosition = Number(positionResult.rows[0]?.max_position || 0) + 1;

//     const lesson = await client.query(
//       `
//       INSERT INTO learning_lessons (
//         course_id, section_id, title, media_type, media_url, media_public_id, media_original_name, content, duration_minutes, position, created_by
//       )
//       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
//       RETURNING *
//       `,
//       [
//         courseId,
//         sectionId,
//         title,
//         mediaType,
//         mediaUrl,
//         mediaPublicId,
//         mediaOriginalName,
//         content,
//         Math.max(0, durationMinutes),
//         nextPosition,
//         req.userId,
//       ]
//     );

//     await client.query("COMMIT");
//     return res.status(201).json({ data: lesson.rows[0] });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("CREATE LESSON ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   } finally {
//     client.release();
//   }
// };

// exports.getLessons = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { course_id: courseId, section_id: sectionId } = req.query;
//     const where = [];
//     const params = [];

//     if (courseId) {
//       params.push(courseId);
//       where.push(`course_id = $${params.length}`);
//     }
//     if (sectionId) {
//       params.push(sectionId);
//       where.push(`section_id = $${params.length}`);
//     }

//     const result = await pool.query(
//       `
//       SELECT *
//       FROM learning_lessons
//       ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
//       ORDER BY section_id ASC, position ASC, created_at ASC
//       `,
//       params
//     );

//     return res.json({ data: result.rows });
//   } catch (err) {
//     console.error("GET LESSONS ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.deleteLesson = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { lessonId } = req.params;

//     await client.query("BEGIN");

//     const result = await client.query(
//       "DELETE FROM learning_lessons WHERE id = $1 RETURNING id, section_id",
//       [lessonId]
//     );
//     if (!result.rows.length) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Lesson not found." });
//     }

//     await normalizeLessonPositionsForSection(client, result.rows[0].section_id);
//     await client.query("COMMIT");
//     return res.json({ message: "Lesson deleted successfully." });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("DELETE LESSON ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   } finally {
//     client.release();
//   }
// };

// exports.updateLesson = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { lessonId } = req.params;

//     const existingResult = await pool.query("SELECT * FROM learning_lessons WHERE id = $1 LIMIT 1", [lessonId]);
//     if (!existingResult.rows.length) return res.status(404).json({ message: "Lesson not found." });
//     const existing = existingResult.rows[0];

//     const title =
//       req.body.title !== undefined ? String(req.body.title || "").trim() : String(existing.title || "").trim();
//     const mediaType = req.body.media_type !== undefined ? String(req.body.media_type || "none").trim() : existing.media_type;
//     const mediaUrl =
//       req.body.media_url !== undefined ? (req.body.media_url ? String(req.body.media_url).trim() : null) : existing.media_url;
//     const mediaPublicId =
//       req.body.media_public_id !== undefined
//         ? req.body.media_public_id ? String(req.body.media_public_id).trim() : null
//         : existing.media_public_id;
//     const mediaOriginalName =
//       req.body.media_original_name !== undefined
//         ? req.body.media_original_name ? String(req.body.media_original_name).trim() : null
//         : existing.media_original_name;
//     const content =
//       req.body.content !== undefined ? (req.body.content ? String(req.body.content).trim() : null) : existing.content;
//     const durationMinutes =
//       req.body.duration_minutes !== undefined
//         ? Math.max(0, Number(req.body.duration_minutes) || 0)
//         : Number(existing.duration_minutes) || 0;

//     if (!title) return res.status(400).json({ message: "Lesson title is required." });
//     if (!["none", "video", "audio", "file"].includes(mediaType)) {
//       return res.status(400).json({ message: "Invalid media_type." });
//     }

//     const updated = await pool.query(
//       `
//       UPDATE learning_lessons
//       SET title = $1,
//           media_type = $2,
//           media_url = $3,
//           media_public_id = $4,
//           media_original_name = $5,
//           content = $6,
//           duration_minutes = $7,
//           updated_at = NOW()
//       WHERE id = $8
//       RETURNING *
//       `,
//       [title, mediaType, mediaUrl, mediaPublicId, mediaOriginalName, content, durationMinutes, lessonId]
//     );

//     return res.json({ data: updated.rows[0] });
//   } catch (err) {
//     console.error("UPDATE LESSON ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.reorderLesson = async (req, res) => {
//   const client = await pool.connect();
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { lessonId } = req.params;
//     const direction = String(req.body.direction || "").trim().toLowerCase();
//     const requestedPosition = Number(req.body.position);

//     const hasValidDirection = ["up", "down"].includes(direction);
//     const hasValidPosition = Number.isInteger(requestedPosition) && requestedPosition > 0;
//     if (!hasValidDirection && !hasValidPosition) {
//       return res.status(400).json({ message: "Provide direction ('up'/'down') or a valid positive integer position." });
//     }

//     await client.query("BEGIN");

//     const currentResult = await client.query(
//       `SELECT id, section_id, position FROM learning_lessons WHERE id = $1 LIMIT 1 FOR UPDATE`,
//       [lessonId]
//     );
//     if (!currentResult.rows.length) {
//       await client.query("ROLLBACK");
//       return res.status(404).json({ message: "Lesson not found." });
//     }

//     const current = currentResult.rows[0];
//     await normalizeLessonPositionsForSection(client, current.section_id);

//     const refreshedCurrentResult = await client.query(
//       `SELECT id, section_id, position FROM learning_lessons WHERE id = $1 LIMIT 1 FOR UPDATE`,
//       [lessonId]
//     );
//     const refreshedCurrent = refreshedCurrentResult.rows[0];

//     const sectionCountResult = await client.query(
//       `SELECT COUNT(*)::INT AS count FROM learning_lessons WHERE section_id = $1`,
//       [refreshedCurrent.section_id]
//     );
//     const sectionCount = Number(sectionCountResult.rows[0]?.count || 0);

//     let targetPosition = refreshedCurrent.position;
//     if (hasValidPosition) {
//       targetPosition = Math.min(Math.max(1, requestedPosition), Math.max(1, sectionCount));
//     } else if (direction === "up") {
//       targetPosition = Math.max(1, refreshedCurrent.position - 1);
//     } else {
//       targetPosition = Math.min(sectionCount, refreshedCurrent.position + 1);
//     }

//     if (targetPosition === refreshedCurrent.position) {
//       await client.query("COMMIT");
//       return res.json({ message: "Lesson already at boundary.", moved: false });
//     }

//     await client.query("UPDATE learning_lessons SET position = 0 WHERE id = $1", [refreshedCurrent.id]);

//     if (targetPosition < refreshedCurrent.position) {
//       await client.query(
//         `UPDATE learning_lessons SET position = position + 1000000 WHERE section_id = $1 AND position >= $2 AND position < $3`,
//         [refreshedCurrent.section_id, targetPosition, refreshedCurrent.position]
//       );
//       await client.query(
//         `UPDATE learning_lessons SET position = position - 999999 WHERE section_id = $1 AND position >= $2 AND position < $3`,
//         [refreshedCurrent.section_id, targetPosition + 1000000, refreshedCurrent.position + 1000000]
//       );
//     } else {
//       await client.query(
//         `UPDATE learning_lessons SET position = position - 1000000 WHERE section_id = $1 AND position <= $2 AND position > $3`,
//         [refreshedCurrent.section_id, targetPosition, refreshedCurrent.position]
//       );
//       await client.query(
//         `UPDATE learning_lessons SET position = position + 999999 WHERE section_id = $1 AND position <= $2 AND position > $3`,
//         [refreshedCurrent.section_id, targetPosition - 1000000, refreshedCurrent.position - 1000000]
//       );
//     }

//     await client.query("UPDATE learning_lessons SET position = $1 WHERE id = $2", [targetPosition, refreshedCurrent.id]);

//     await client.query("COMMIT");
//     return res.json({ message: "Lesson order updated.", moved: true, position: targetPosition });
//   } catch (err) {
//     await client.query("ROLLBACK");
//     console.error("REORDER LESSON ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   } finally {
//     client.release();
//   }
// };

// exports.createQuiz = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;

//     const courseId = req.body.course_id;
//     const sectionId = req.body.section_id;
//     const title = String(req.body.title || "").trim();
//     const durationMinutes = Number(req.body.duration_minutes) || 0;
//     const instructions = req.body.instructions ? String(req.body.instructions).trim() : null;

//     if (!courseId || !sectionId || !title) {
//       return res.status(400).json({ message: "course_id, section_id, and title are required." });
//     }

//     const validSection = await ensureSectionBelongsToCourse(sectionId, courseId);
//     if (!validSection) {
//       return res.status(400).json({ message: "Section does not belong to the selected course." });
//     }

//     const quiz = await pool.query(
//       `INSERT INTO learning_quizzes (course_id, section_id, title, duration_minutes, instructions, created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
//       [courseId, sectionId, title, Math.max(0, durationMinutes), instructions, req.userId]
//     );

//     return res.status(201).json({ data: quiz.rows[0] });
//   } catch (err) {
//     console.error("CREATE QUIZ ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.getQuizzes = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { course_id: courseId, section_id: sectionId } = req.query;
//     const where = [];
//     const params = [];

//     if (courseId) { params.push(courseId); where.push(`q.course_id = $${params.length}`); }
//     if (sectionId) { params.push(sectionId); where.push(`q.section_id = $${params.length}`); }

//     const result = await pool.query(
//       `SELECT q.*, (SELECT COUNT(*)::INT FROM learning_questions lq WHERE lq.quiz_id = q.id) AS question_count FROM learning_quizzes q ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY q.created_at DESC`,
//       params
//     );

//     return res.json({ data: result.rows });
//   } catch (err) {
//     console.error("GET QUIZZES ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.deleteQuiz = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { quizId } = req.params;

//     const result = await pool.query("DELETE FROM learning_quizzes WHERE id = $1 RETURNING id", [quizId]);
//     if (!result.rows.length) return res.status(404).json({ message: "Quiz not found." });
//     return res.json({ message: "Quiz deleted successfully." });
//   } catch (err) {
//     console.error("DELETE QUIZ ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.updateQuiz = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { quizId } = req.params;

//     const existingResult = await pool.query("SELECT * FROM learning_quizzes WHERE id = $1 LIMIT 1", [quizId]);
//     if (!existingResult.rows.length) return res.status(404).json({ message: "Quiz not found." });
//     const existing = existingResult.rows[0];

//     const title = req.body.title !== undefined ? String(req.body.title || "").trim() : String(existing.title || "").trim();
//     const durationMinutes = req.body.duration_minutes !== undefined ? Math.max(0, Number(req.body.duration_minutes) || 0) : Number(existing.duration_minutes) || 0;
//     const instructions = req.body.instructions !== undefined ? (req.body.instructions ? String(req.body.instructions).trim() : null) : existing.instructions;

//     if (!title) return res.status(400).json({ message: "Quiz title is required." });

//     const updated = await pool.query(
//       `UPDATE learning_quizzes SET title = $1, duration_minutes = $2, instructions = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
//       [title, durationMinutes, instructions, quizId]
//     );

//     return res.json({ data: updated.rows[0] });
//   } catch (err) {
//     console.error("UPDATE QUIZ ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.createQuestion = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;

//     const courseId = req.body.course_id;
//     const sectionId = req.body.section_id;
//     const quizId = req.body.quiz_id;
//     const questionText = String(req.body.question_text || "").trim();
//     const questionType = String(req.body.question_type || "").trim();
//     const options = Array.isArray(req.body.options) ? req.body.options : [];
//     const correctAnswer = req.body.correct_answer ? String(req.body.correct_answer).trim() : null;
//     const marks = Number(req.body.marks) || 1;
//     const difficulty = String(req.body.difficulty || "").trim();

//     const allowedTypes = new Set(["single_choice", "multiple_choice", "true_false", "short_answer", "match_following", "ordering_sequence", "fill_blanks"]);
//     const allowedDifficulties = new Set(["Very Easy", "Easy", "Medium", "High", "Very High"]);

//     if (!courseId || !sectionId || !quizId || !questionText || !questionType || !difficulty) {
//       return res.status(400).json({ message: "course_id, section_id, quiz_id, question_text, question_type, and difficulty are required." });
//     }
//     if (!allowedTypes.has(questionType)) return res.status(400).json({ message: "Invalid question_type." });
//     if (!allowedDifficulties.has(difficulty)) return res.status(400).json({ message: "Invalid difficulty." });

//     const validSection = await ensureSectionBelongsToCourse(sectionId, courseId);
//     if (!validSection) return res.status(400).json({ message: "Section does not belong to the selected course." });
//     const validQuiz = await ensureQuizBelongsToContext(quizId, sectionId, courseId);
//     if (!validQuiz) return res.status(400).json({ message: "Quiz does not belong to the selected section/course." });

//     const sanitizedOptions = options.map((opt) => String(opt || "").trim()).filter(Boolean);
//     const result = await pool.query(
//       `INSERT INTO learning_questions (course_id, section_id, quiz_id, question_text, question_type, options, correct_answer, marks, difficulty, created_by) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10) RETURNING *`,
//       [courseId, sectionId, quizId, questionText, questionType, JSON.stringify(sanitizedOptions), correctAnswer, Math.max(1, marks), difficulty, req.userId]
//     );

//     return res.status(201).json({ data: result.rows[0] });
//   } catch (err) {
//     console.error("CREATE QUESTION ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.getQuestions = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;

//     const { course_id: courseId, section_id: sectionId, quiz_id: quizId } = req.query;
//     const where = [];
//     const params = [];

//     if (courseId) { params.push(courseId); where.push(`course_id = $${params.length}`); }
//     if (sectionId) { params.push(sectionId); where.push(`section_id = $${params.length}`); }
//     if (quizId) { params.push(quizId); where.push(`quiz_id = $${params.length}`); }

//     const result = await pool.query(
//       `SELECT * FROM learning_questions ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC`,
//       params
//     );
//     return res.json({ data: result.rows });
//   } catch (err) {
//     console.error("GET QUESTIONS ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.deleteQuestion = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { questionId } = req.params;

//     const result = await pool.query("DELETE FROM learning_questions WHERE id = $1 RETURNING id", [questionId]);
//     if (!result.rows.length) return res.status(404).json({ message: "Question not found." });
//     return res.json({ message: "Question deleted successfully." });
//   } catch (err) {
//     console.error("DELETE QUESTION ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.updateQuestion = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { questionId } = req.params;

//     const existingResult = await pool.query("SELECT * FROM learning_questions WHERE id = $1 LIMIT 1", [questionId]);
//     if (!existingResult.rows.length) return res.status(404).json({ message: "Question not found." });
//     const existing = existingResult.rows[0];

//     const questionText = req.body.question_text !== undefined ? String(req.body.question_text || "").trim() : String(existing.question_text || "").trim();
//     const questionType = req.body.question_type !== undefined ? String(req.body.question_type || "").trim() : String(existing.question_type || "").trim();
//     const options = req.body.options !== undefined ? (Array.isArray(req.body.options) ? req.body.options : []) : (Array.isArray(existing.options) ? existing.options : []);
//     const correctAnswer = req.body.correct_answer !== undefined ? (req.body.correct_answer ? String(req.body.correct_answer).trim() : null) : existing.correct_answer;
//     const marks = req.body.marks !== undefined ? Math.max(1, Number(req.body.marks) || 1) : Math.max(1, Number(existing.marks) || 1);
//     const difficulty = req.body.difficulty !== undefined ? String(req.body.difficulty || "").trim() : String(existing.difficulty || "").trim();

//     const allowedTypes = new Set(["single_choice", "multiple_choice", "true_false", "short_answer", "match_following", "ordering_sequence", "fill_blanks"]);
//     const allowedDifficulties = new Set(["Very Easy", "Easy", "Medium", "High", "Very High"]);

//     if (!questionText || !questionType || !difficulty) return res.status(400).json({ message: "question_text, question_type, and difficulty are required." });
//     if (!allowedTypes.has(questionType)) return res.status(400).json({ message: "Invalid question_type." });
//     if (!allowedDifficulties.has(difficulty)) return res.status(400).json({ message: "Invalid difficulty." });

//     const sanitizedOptions = options.map((opt) => String(opt || "").trim()).filter(Boolean);
//     const updated = await pool.query(
//       `UPDATE learning_questions SET question_text = $1, question_type = $2, options = $3::jsonb, correct_answer = $4, marks = $5, difficulty = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
//       [questionText, questionType, JSON.stringify(sanitizedOptions), correctAnswer, marks, difficulty, questionId]
//     );

//     return res.json({ data: updated.rows[0] });
//   } catch (err) {
//     console.error("UPDATE QUESTION ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

// exports.deleteSection = async (req, res) => {
//   try {
//     if (!ensureAdmin(req, res)) return;
//     const { sectionId } = req.params;

//     const result = await pool.query(
//       "DELETE FROM learning_sections WHERE id = $1 RETURNING id, title",
//       [sectionId]
//     );

//     if (!result.rows.length) {
//       return res.status(404).json({ message: "Section not found." });
//     }

//     return res.json({ message: "Section deleted successfully." });
//   } catch (err) {
//     console.error("DELETE SECTION ERROR:", err.message);
//     return res.status(500).json({ message: mapError(err) });
//   }
// };

const { Readable } = require("stream");
const pool = require("../db");
const cloudinary = require("../config/cloudinary");
const { generateCertificatePdf } = require("./certificateController");

const ADMIN_TYPES = new Set([1, 2]);
const STUDENT_TYPES = new Set([3]);

const isAdminUser = (userType) => ADMIN_TYPES.has(Number(userType));
const isStudentUser = (userType) => STUDENT_TYPES.has(Number(userType));

const ensureAdmin = (req, res) => {
  if (!isAdminUser(req.userType)) {
    res.status(403).json({ message: "Only admin/subadmin can manage learning module." });
    return false;
  }
  return true;
};

const ensureStudent = (req, res) => {
  if (!isStudentUser(req.userType)) {
    res.status(403).json({ message: "Only students can access this learning endpoint." });
    return false;
  }
  return true;
};

const mapError = (err) => {
  if (err?.code === "23505") return "Duplicate entry";
  if (err?.code === "23503") return "Related record not found";
  if (err?.code === "22P02") return "Invalid identifier format";
  return "Server error";
};

const isFinalQuizType = (quizType, sectionId) =>
  String(quizType || "").toLowerCase() === "final" || sectionId == null;

const normalizeAnswerToken = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const parseAnswerAsList = (value) => {
  if (Array.isArray(value)) return value.map(normalizeAnswerToken).filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(normalizeAnswerToken).filter(Boolean);
    } catch {
      // fallback to comma-separated format
    }
    return trimmed.split(",").map(normalizeAnswerToken).filter(Boolean);
  }
  if (value == null) return [];
  return [normalizeAnswerToken(value)];
};

const isAnswerCorrect = (question, submittedAnswer) => {
  if (!question) return false;
  const type = String(question.question_type || "").toLowerCase();
  const correct = question.correct_answer;

  if (type === "multiple_choice") {
    const expected = parseAnswerAsList(correct).sort();
    const actual = parseAnswerAsList(submittedAnswer).sort();
    if (!expected.length || expected.length !== actual.length) return false;
    return expected.every((item, index) => item === actual[index]);
  }

  return normalizeAnswerToken(submittedAnswer) === normalizeAnswerToken(correct);
};

const toAnswerMap = (answers) => {
  const map = new Map();
  if (Array.isArray(answers)) {
    answers.forEach((item) => {
      if (!item || typeof item !== "object") return;
      const questionId = item.question_id || item.questionId || item.id;
      const answer = item.answer ?? item.selected_answer ?? item.selectedAnswer ?? null;
      if (!questionId) return;
      map.set(String(questionId), answer);
    });
    return map;
  }

  if (answers && typeof answers === "object") {
    Object.entries(answers).forEach(([questionId, answer]) => {
      if (!questionId) return;
      map.set(String(questionId), answer);
    });
  }
  return map;
};

// ── Upload media to Cloudinary ────────────────────────────────────────────────
const uploadLearningMediaToCloudinary = ({ buffer, mediaType, mimetype, originalName }) =>
  new Promise((resolve, reject) => {
    const normalizedType = String(mediaType || "file").toLowerCase();

    // Cloudinary resource_type:
    //   video/audio → "video"  (Cloudinary handles audio under the video resource type)
    //   image       → "image"
    //   file (pdf, docx, zip…) → "auto"  ← CHANGED from "raw" to "auto"
    //     Using "auto" allows Cloudinary to detect the format properly and
    //     support fl_attachment / inline delivery flags correctly.
    const resourceType =
      normalizedType === "image"
        ? "image"
        : normalizedType === "video" || normalizedType === "audio"
          ? "video"
          : "auto"; // ← was "raw", now "auto" so PDFs open inline in browser

    const uploadOptions = {
      folder: `ccs/learning/${normalizedType}`,
      resource_type: resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    };

    // For file uploads (PDFs, docs, etc.):
    //   - Set flags to "attachment:false" so Cloudinary serves them inline
    //     (i.e. browser opens the PDF instead of force-downloading it)
    //   - Also set content_type from the original mimetype so the browser
    //     knows how to render it
    if (normalizedType === "file") {
      uploadOptions.flags = "attachment:false";
      if (mimetype) {
        uploadOptions.content_type = mimetype;
      }
    }

    // Strip extension for the public_id
    if (originalName) {
      uploadOptions.public_id = originalName.replace(/\.[^.]+$/, "");
    }

    const stream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload_stream error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    Readable.from(buffer).pipe(stream);
  });

const deleteLearningImageFromCloudinary = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

const normalizeSections = (sections) => {
  if (!Array.isArray(sections)) return [];
  return sections
    .map((item, index) => ({
      title: String(item?.title || "").trim(),
      position: Number(item?.position) > 0 ? Number(item.position) : index + 1,
    }))
    .filter((item) => item.title);
};

const ensureSectionBelongsToCourse = async (sectionId, courseId) => {
  const section = await pool.query(
    "SELECT id FROM learning_sections WHERE id = $1 AND course_id = $2 LIMIT 1",
    [sectionId, courseId]
  );
  return section.rows.length > 0;
};

const ensureQuizBelongsToContext = async (quizId, sectionId, courseId) => {
  const quiz = await pool.query(
    "SELECT id, section_id, course_id, quiz_type, passing_percentage FROM learning_quizzes WHERE id = $1 AND course_id = $2 LIMIT 1",
    [quizId, courseId]
  );
  if (!quiz.rows.length) return null;
  const quizRow = quiz.rows[0];
  if (sectionId && String(quizRow.section_id || "") !== String(sectionId)) return null;
  return quizRow;
};

const getFinalQuizByCourse = async (courseId) => {
  const finalQuiz = await pool.query(
    `
    SELECT *
    FROM learning_quizzes
    WHERE course_id = $1
      AND (quiz_type = 'final' OR section_id IS NULL)
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [courseId]
  );
  return finalQuiz.rows[0] || null;
};

const normalizeLessonPositionsForSection = async (client, sectionId) => {
  await client.query(
    `
    WITH ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY section_id
          ORDER BY position ASC, created_at ASC, id ASC
        ) AS next_position
      FROM learning_lessons
      WHERE section_id = $1
    )
    UPDATE learning_lessons l
    SET position = ranked.next_position
    FROM ranked
    WHERE l.id = ranked.id
      AND l.position IS DISTINCT FROM ranked.next_position
    `,
    [sectionId]
  );
};

exports.uploadLearningMedia = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    if (!req.file) return res.status(400).json({ message: "Media file is required." });

    const mediaType = String(req.body.media_type || "file").toLowerCase();
    const allowed = new Set(["file", "video", "audio", "image"]);
    if (!allowed.has(mediaType)) {
      return res.status(400).json({ message: "Invalid media_type. Use file/video/audio/image." });
    }

    console.log(`Uploading to Cloudinary — type: ${mediaType}, size: ${req.file.size} bytes`);

    const uploaded = await uploadLearningMediaToCloudinary({
      buffer: req.file.buffer,
      mediaType,
      mimetype: req.file.mimetype,
      originalName: req.file.originalname,
    });

    console.log(`Cloudinary upload success — public_id: ${uploaded.public_id}`);

    return res.status(201).json({
      message: "Media uploaded successfully.",
      data: {
        secure_url: uploaded.secure_url,
        public_id: uploaded.public_id,
        resource_type: uploaded.resource_type,
        format: uploaded.format,
        bytes: uploaded.bytes,
      },
    });
  } catch (err) {
    console.error("UPLOAD LEARNING MEDIA ERROR:", err.message, err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
};

exports.createCourse = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!ensureAdmin(req, res)) return;

    const title = String(req.body.title || "").trim();
    const description = req.body.description ? String(req.body.description).trim() : null;
    const instructorName = req.body.instructor_name ? String(req.body.instructor_name).trim() : null;
    const featuredImageUrl = req.body.featured_image_url ? String(req.body.featured_image_url).trim() : null;
    const featuredImagePublicId = req.body.featured_image_public_id
      ? String(req.body.featured_image_public_id).trim()
      : null;
    const sections = normalizeSections(req.body.sections);

    if (!title) return res.status(400).json({ message: "Course title is required." });
    if (!sections.length) {
      return res.status(400).json({ message: "At least one section is required while creating a course." });
    }

    await client.query("BEGIN");
    const courseResult = await client.query(
      `
      INSERT INTO learning_courses (title, description, instructor_name, featured_image_url, featured_image_public_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [title, description, instructorName, featuredImageUrl, featuredImagePublicId, req.userId]
    );
    const course = courseResult.rows[0];

    const insertedSections = [];
    for (const section of sections) {
      const sectionResult = await client.query(
        `
        INSERT INTO learning_sections (course_id, title, position)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [course.id, section.title, section.position]
      );
      insertedSections.push(sectionResult.rows[0]);
    }

    await client.query("COMMIT");
    return res.status(201).json({
      message: "Course created successfully.",
      data: {
        course,
        sections: insertedSections.sort((a, b) => a.position - b.position),
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("CREATE COURSE ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  } finally {
    client.release();
  }
};

exports.getCourses = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const coursesResult = await pool.query(
      `
      SELECT
        c.*,
        (
          SELECT COUNT(*)::INT
          FROM learning_sections s
          WHERE s.course_id = c.id
        ) AS section_count,
        (
          SELECT COUNT(*)::INT
          FROM learning_lessons l
          WHERE l.course_id = c.id
        ) AS lesson_count,
        (
          SELECT COUNT(*)::INT
          FROM learning_quizzes q
          WHERE q.course_id = c.id
        ) AS quiz_count
      FROM learning_courses c
      ORDER BY c.created_at DESC
      `
    );

    const sectionsResult = await pool.query(
      `
      SELECT *
      FROM learning_sections
      ORDER BY course_id, position ASC, created_at ASC
      `
    );

    const sectionsByCourse = sectionsResult.rows.reduce((acc, section) => {
      if (!acc[section.course_id]) acc[section.course_id] = [];
      acc[section.course_id].push(section);
      return acc;
    }, {});

    const data = coursesResult.rows.map((course) => ({
      ...course,
      sections: sectionsByCourse[course.id] || [],
    }));

    return res.json({ data });
  } catch (err) {
    console.error("GET COURSES ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.getStudentCourses = async (req, res) => {
  try {
    if (!ensureStudent(req, res)) return;

    const [coursesResult, sectionsResult, enrollmentsResult, attemptsResult, certificatesResult] = await Promise.all([
      pool.query(
        `
        SELECT
          c.*,
          (
            SELECT COUNT(*)::INT
            FROM learning_sections s
            WHERE s.course_id = c.id
          ) AS section_count,
          EXISTS (
            SELECT 1
            FROM learning_quizzes q
            WHERE q.course_id = c.id
              AND (q.quiz_type = 'final' OR q.section_id IS NULL)
          ) AS has_final_exam
        FROM learning_courses c
        ORDER BY c.created_at DESC
        `
      ),
      pool.query(
        `
        SELECT *
        FROM learning_sections
        ORDER BY course_id, position ASC, created_at ASC
        `
      ),
      pool.query(
        `
        SELECT course_id, student_id, enrolled_at, status, completed_at
        FROM learning_course_enrollments
        WHERE student_id = $1
        `,
        [req.userId]
      ),
      pool.query(
        `
        SELECT
          course_id,
          BOOL_OR(passed) AS has_passed,
          MAX(score_percentage) AS best_score,
          MAX(attempted_at) AS last_attempted_at
        FROM learning_final_exam_attempts
        WHERE student_id = $1
        GROUP BY course_id
        `,
        [req.userId]
      ),
      pool.query(
        `
        SELECT learning_course_id
        FROM certificates
        WHERE student_id = $1
          AND learning_course_id IS NOT NULL
        `,
        [req.userId]
      ),
    ]);

    const sectionsByCourse = sectionsResult.rows.reduce((acc, section) => {
      if (!acc[section.course_id]) acc[section.course_id] = [];
      acc[section.course_id].push(section);
      return acc;
    }, {});

    const enrollmentByCourse = enrollmentsResult.rows.reduce((acc, enrollment) => {
      acc[enrollment.course_id] = enrollment;
      return acc;
    }, {});

    const attemptsByCourse = attemptsResult.rows.reduce((acc, attempt) => {
      acc[attempt.course_id] = attempt;
      return acc;
    }, {});

    const certificateCourseIds = new Set(
      certificatesResult.rows
        .map((row) => row.learning_course_id)
        .filter(Boolean)
    );

    const data = coursesResult.rows.map((course) => {
      const enrollment = enrollmentByCourse[course.id] || null;
      const attempt = attemptsByCourse[course.id] || null;
      const hasPassedFinal = attempt ? Boolean(attempt.has_passed) : false;
      const certificateIssued = certificateCourseIds.has(course.id);

      return {
        ...course,
        sections: sectionsByCourse[course.id] || [],
        progress: {
          is_enrolled: Boolean(enrollment),
          enrollment_status: enrollment?.status || "not_enrolled",
          enrolled_at: enrollment?.enrolled_at || null,
          completed_at: enrollment?.completed_at || null,
          has_passed_final_exam: hasPassedFinal,
          best_score: attempt?.best_score ?? null,
          last_attempted_at: attempt?.last_attempted_at || null,
          certificate_issued: certificateIssued,
        },
      };
    });

    return res.json({ data });
  } catch (err) {
    console.error("GET STUDENT COURSES ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.getStudentCourseContent = async (req, res) => {
  try {
    if (!ensureStudent(req, res)) return;

    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: "courseId is required." });

    const [courseResult, enrollmentResult] = await Promise.all([
      pool.query("SELECT * FROM learning_courses WHERE id = $1 LIMIT 1", [courseId]),
      pool.query(
        `
        SELECT *
        FROM learning_course_enrollments
        WHERE course_id = $1
          AND student_id = $2
        LIMIT 1
        `,
        [courseId, req.userId]
      ),
    ]);

    if (!courseResult.rows.length) return res.status(404).json({ message: "Course not found." });
    if (!enrollmentResult.rows.length) {
      return res.status(403).json({ message: "Please enroll in this course to access learning content." });
    }

    const [sectionsResult, lessonsResult, lessonProgressResult, sectionQuizzesResult, sectionAttemptsResult, finalAttemptsResult, certificatesResult] = await Promise.all([
      pool.query(
        `
        SELECT *
        FROM learning_sections
        WHERE course_id = $1
        ORDER BY position ASC, created_at ASC
        `,
        [courseId]
      ),
      pool.query(
        `
        SELECT id, course_id, section_id, title, position, media_type, media_url, media_original_name, content, duration_minutes, created_at
        FROM learning_lessons
        WHERE course_id = $1
        ORDER BY section_id ASC, position ASC, created_at ASC
        `,
        [courseId]
      ),
      pool.query(
        `
        SELECT lesson_id, reviewed_at
        FROM learning_lesson_progress
        WHERE course_id = $1
          AND student_id = $2
        `,
        [courseId, req.userId]
      ),
      pool.query(
        `
        SELECT id, course_id, section_id, quiz_type, title, duration_minutes, passing_percentage, instructions, created_at
        FROM learning_quizzes
        WHERE course_id = $1
          AND quiz_type = 'section'
          AND section_id IS NOT NULL
        ORDER BY created_at ASC
        `,
        [courseId]
      ),
      pool.query(
        `
        SELECT
          quiz_id,
          BOOL_OR(passed) AS has_passed,
          MAX(score_percentage) AS best_score,
          COUNT(*)::INT AS attempt_count,
          MAX(attempted_at) AS last_attempted_at
        FROM learning_section_quiz_attempts
        WHERE course_id = $1
          AND student_id = $2
        GROUP BY quiz_id
        `,
        [courseId, req.userId]
      ),
      pool.query(
        `
        SELECT
          BOOL_OR(passed) AS has_passed,
          MAX(score_percentage) AS best_score,
          COUNT(*)::INT AS attempt_count,
          MAX(attempted_at) AS last_attempted_at
        FROM learning_final_exam_attempts
        WHERE course_id = $1
          AND student_id = $2
        `,
        [courseId, req.userId]
      ),
      pool.query(
        `
        SELECT id, certificate_number, file_url, issued_at
        FROM certificates c
        WHERE c.student_id = $1
          AND c.learning_course_id = $2
          AND EXISTS (
            SELECT 1
            FROM learning_final_exam_attempts a
            WHERE a.student_id = c.student_id
              AND a.course_id = c.learning_course_id
              AND a.passed = TRUE
          )
        ORDER BY issued_at DESC
        LIMIT 1
        `,
        [req.userId, courseId]
      ),
    ]);

    const sectionQuizIds = sectionQuizzesResult.rows.map((q) => q.id);
    const questionsResult = sectionQuizIds.length
      ? await pool.query(
        `
        SELECT id, quiz_id, question_text, question_type, options, marks, difficulty
        FROM learning_questions
        WHERE quiz_id = ANY($1::uuid[])
        ORDER BY created_at ASC
        `,
        [sectionQuizIds]
      )
      : { rows: [] };

    const lessonProgressByLessonId = lessonProgressResult.rows.reduce((acc, row) => {
      acc[row.lesson_id] = row;
      return acc;
    }, {});

    const lessonsBySection = lessonsResult.rows.reduce((acc, lesson) => {
      if (!acc[lesson.section_id]) acc[lesson.section_id] = [];
      const lessonProgress = lessonProgressByLessonId[lesson.id] || null;
      acc[lesson.section_id].push({
        ...lesson,
        progress: {
          is_reviewed: Boolean(lessonProgress),
          reviewed_at: lessonProgress?.reviewed_at || null,
        },
      });
      return acc;
    }, {});

    const questionsByQuiz = questionsResult.rows.reduce((acc, question) => {
      if (!acc[question.quiz_id]) acc[question.quiz_id] = [];
      acc[question.quiz_id].push(question);
      return acc;
    }, {});

    const sectionQuizProgressById = sectionAttemptsResult.rows.reduce((acc, row) => {
      acc[row.quiz_id] = row;
      return acc;
    }, {});

    const sectionQuizzesBySection = sectionQuizzesResult.rows.reduce((acc, quiz) => {
      if (!acc[quiz.section_id]) acc[quiz.section_id] = [];
      const quizProgress = sectionQuizProgressById[quiz.id] || null;
      acc[quiz.section_id].push({
        ...quiz,
        questions: questionsByQuiz[quiz.id] || [],
        progress: {
          has_passed: Boolean(quizProgress?.has_passed),
          best_score: quizProgress?.best_score ?? null,
          attempt_count: Number(quizProgress?.attempt_count || 0),
          last_attempted_at: quizProgress?.last_attempted_at || null,
        },
      });
      return acc;
    }, {});

    const finalStats = finalAttemptsResult.rows[0] || {};
    const certificate = certificatesResult.rows[0] || null;
    const reviewedLessonsCount = lessonProgressResult.rows.length;
    const totalLessonsCount = lessonsResult.rows.length;

    return res.json({
      data: {
        course: courseResult.rows[0],
        enrollment: enrollmentResult.rows[0],
        sections: sectionsResult.rows.map((section) => ({
          ...section,
          lessons: lessonsBySection[section.id] || [],
          quizzes: sectionQuizzesBySection[section.id] || [],
        })),
        final_exam_progress: {
          has_passed: Boolean(finalStats?.has_passed),
          best_score: finalStats?.best_score ?? null,
          attempt_count: Number(finalStats?.attempt_count || 0),
          last_attempted_at: finalStats?.last_attempted_at || null,
        },
        progress_summary: {
          total_lessons: totalLessonsCount,
          reviewed_lessons: reviewedLessonsCount,
        },
        certificate,
      },
    });
  } catch (err) {
    console.error("GET STUDENT COURSE CONTENT ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.updateLessonReviewStatus = async (req, res) => {
  try {
    if (!ensureStudent(req, res)) return;

    const { lessonId } = req.params;
    if (!lessonId) return res.status(400).json({ message: "lessonId is required." });

    const reviewed = req.body?.reviewed !== false;

    const lessonResult = await pool.query(
      `
      SELECT id, course_id, section_id
      FROM learning_lessons
      WHERE id = $1
      LIMIT 1
      `,
      [lessonId]
    );
    if (!lessonResult.rows.length) {
      return res.status(404).json({ message: "Lesson not found." });
    }
    const lesson = lessonResult.rows[0];

    const enrollmentResult = await pool.query(
      `
      SELECT id
      FROM learning_course_enrollments
      WHERE course_id = $1
        AND student_id = $2
      LIMIT 1
      `,
      [lesson.course_id, req.userId]
    );
    if (!enrollmentResult.rows.length) {
      return res.status(403).json({ message: "Please enroll in the course before updating lesson progress." });
    }

    if (reviewed) {
      const upsert = await pool.query(
        `
        INSERT INTO learning_lesson_progress (course_id, section_id, lesson_id, student_id, reviewed_at)
        VALUES ($1,$2,$3,$4,NOW())
        ON CONFLICT (student_id, lesson_id)
        DO UPDATE SET
          course_id = EXCLUDED.course_id,
          section_id = EXCLUDED.section_id,
          reviewed_at = NOW()
        RETURNING *
        `,
        [lesson.course_id, lesson.section_id, lesson.id, req.userId]
      );
      return res.json({
        message: "Lesson marked as reviewed.",
        data: {
          lesson_id: lesson.id,
          is_reviewed: true,
          reviewed_at: upsert.rows[0]?.reviewed_at || null,
        },
      });
    }

    await pool.query(
      `
      DELETE FROM learning_lesson_progress
      WHERE student_id = $1
        AND lesson_id = $2
      `,
      [req.userId, lesson.id]
    );

    return res.json({
      message: "Lesson marked as not reviewed.",
      data: {
        lesson_id: lesson.id,
        is_reviewed: false,
        reviewed_at: null,
      },
    });
  } catch (err) {
    console.error("UPDATE LESSON REVIEW STATUS ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.submitSectionQuizAttempt = async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;
  try {
    if (!ensureStudent(req, res)) return;

    const { quizId } = req.params;
    if (!quizId) return res.status(400).json({ message: "quizId is required." });

    const quizResult = await pool.query(
      `
      SELECT id, course_id, section_id, quiz_type, title, duration_minutes, passing_percentage
      FROM learning_quizzes
      WHERE id = $1
      LIMIT 1
      `,
      [quizId]
    );
    if (!quizResult.rows.length) return res.status(404).json({ message: "Quiz not found." });

    const quiz = quizResult.rows[0];
    if (String(quiz.quiz_type) !== "section" || !quiz.section_id) {
      return res.status(400).json({ message: "Only section quiz attempts are allowed on this endpoint." });
    }

    const enrollmentResult = await pool.query(
      `
      SELECT id
      FROM learning_course_enrollments
      WHERE course_id = $1
        AND student_id = $2
      LIMIT 1
      `,
      [quiz.course_id, req.userId]
    );
    if (!enrollmentResult.rows.length) {
      return res.status(403).json({ message: "Please enroll in the course before attempting section quizzes." });
    }

    const questionsResult = await pool.query(
      `
      SELECT id, question_text, question_type, options, correct_answer, marks
      FROM learning_questions
      WHERE quiz_id = $1
      ORDER BY created_at ASC
      `,
      [quizId]
    );
    const questions = questionsResult.rows;
    if (!questions.length) {
      return res.status(400).json({ message: "Quiz has no questions yet." });
    }

    const answersMap = toAnswerMap(req.body?.answers);
    let correctAnswers = 0;
    questions.forEach((question) => {
      const submittedAnswer = answersMap.get(String(question.id));
      if (isAnswerCorrect(question, submittedAnswer)) correctAnswers += 1;
    });

    const totalQuestions = questions.length;
    const scorePercentage = Number(((correctAnswers / totalQuestions) * 100).toFixed(2));
    const passingPercentage = Math.min(100, Math.max(0, Number(quiz.passing_percentage) || 60));
    const passed = scorePercentage >= passingPercentage;
    const serializedAnswers = Object.fromEntries(answersMap.entries());

    await client.query("BEGIN");
    transactionStarted = true;
    const attemptResult = await client.query(
      `
      INSERT INTO learning_section_quiz_attempts
        (course_id, section_id, quiz_id, student_id, score_percentage, correct_answers, total_questions, passed, answers_json)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
      RETURNING *
      `,
      [
        quiz.course_id,
        quiz.section_id,
        quiz.id,
        req.userId,
        scorePercentage,
        correctAnswers,
        totalQuestions,
        passed,
        JSON.stringify(serializedAnswers),
      ]
    );
    await client.query("COMMIT");
    transactionStarted = false;

    return res.json({
      data: {
        attempt: attemptResult.rows[0],
        quiz: {
          id: quiz.id,
          course_id: quiz.course_id,
          section_id: quiz.section_id,
          title: quiz.title,
          passing_percentage: passingPercentage,
          duration_minutes: quiz.duration_minutes,
        },
        score_percentage: scorePercentage,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        passed,
      },
    });
  } catch (err) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
    console.error("SUBMIT SECTION QUIZ ATTEMPT ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  } finally {
    client.release();
  }
};

exports.enrollInCourse = async (req, res) => {
  try {
    if (!ensureStudent(req, res)) return;

    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: "courseId is required." });

    const courseExists = await pool.query("SELECT id FROM learning_courses WHERE id = $1 LIMIT 1", [courseId]);
    if (!courseExists.rows.length) return res.status(404).json({ message: "Course not found." });

    const inserted = await pool.query(
      `
      INSERT INTO learning_course_enrollments (course_id, student_id, status)
      VALUES ($1, $2, 'active')
      ON CONFLICT (course_id, student_id) DO NOTHING
      RETURNING *
      `,
      [courseId, req.userId]
    );

    if (inserted.rows.length) {
      return res.status(201).json({
        message: "Enrolled successfully.",
        data: inserted.rows[0],
      });
    }

    const existing = await pool.query(
      `
      SELECT *
      FROM learning_course_enrollments
      WHERE course_id = $1
        AND student_id = $2
      LIMIT 1
      `,
      [courseId, req.userId]
    );

    return res.json({
      message: "Already enrolled in this course.",
      data: existing.rows[0] || null,
    });
  } catch (err) {
    console.error("ENROLL IN COURSE ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { courseId } = req.params;

    const courseResult = await pool.query(
      "SELECT * FROM learning_courses WHERE id = $1 LIMIT 1",
      [courseId]
    );
    if (!courseResult.rows.length) {
      return res.status(404).json({ message: "Course not found." });
    }

    const sections = await pool.query(
      "SELECT * FROM learning_sections WHERE course_id = $1 ORDER BY position ASC, created_at ASC",
      [courseId]
    );
    const lessons = await pool.query(
      "SELECT * FROM learning_lessons WHERE course_id = $1 ORDER BY section_id ASC, position ASC, created_at ASC",
      [courseId]
    );
    const quizzes = await pool.query(
      "SELECT * FROM learning_quizzes WHERE course_id = $1 ORDER BY created_at DESC",
      [courseId]
    );

    return res.json({
      data: {
        course: courseResult.rows[0],
        sections: sections.rows,
        lessons: lessons.rows,
        quizzes: quizzes.rows,
      },
    });
  } catch (err) {
    console.error("GET COURSE BY ID ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.updateCourseImage = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!ensureAdmin(req, res)) return;
    const { courseId } = req.params;

    const featuredImageUrl = req.body.featured_image_url
      ? String(req.body.featured_image_url).trim()
      : null;
    const featuredImagePublicId = req.body.featured_image_public_id
      ? String(req.body.featured_image_public_id).trim()
      : null;
    const removeImage = req.body.remove_image === true || req.body.remove_image === "true";

    if (!removeImage && (!featuredImageUrl || !featuredImagePublicId)) {
      return res.status(400).json({
        message: "Provide featured_image_url and featured_image_public_id, or set remove_image=true.",
      });
    }

    await client.query("BEGIN");
    const existingResult = await client.query(
      `
      SELECT id, featured_image_url, featured_image_public_id
      FROM learning_courses
      WHERE id = $1
      LIMIT 1
      FOR UPDATE
      `,
      [courseId]
    );
    if (!existingResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Course not found." });
    }

    const existingCourse = existingResult.rows[0];
    const nextImageUrl = removeImage ? null : featuredImageUrl;
    const nextImagePublicId = removeImage ? null : featuredImagePublicId;

    const updatedResult = await client.query(
      `
      UPDATE learning_courses
      SET featured_image_url = $1, featured_image_public_id = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [nextImageUrl, nextImagePublicId, courseId]
    );
    await client.query("COMMIT");

    const oldPublicId = existingCourse.featured_image_public_id;
    const shouldDeleteOld =
      oldPublicId && (removeImage || (nextImagePublicId && oldPublicId !== nextImagePublicId));
    if (shouldDeleteOld) {
      try {
        await deleteLearningImageFromCloudinary(oldPublicId);
      } catch (cloudErr) {
        console.error("DELETE COURSE IMAGE FROM CLOUDINARY ERROR:", cloudErr.message);
      }
    }

    return res.json({
      message: removeImage ? "Course image deleted successfully." : "Course image updated successfully.",
      data: updatedResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("UPDATE COURSE IMAGE ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  } finally {
    client.release();
  }
};

exports.createSection = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { courseId } = req.params;
    const title = String(req.body.title || "").trim();
    const requestedPosition = Number(req.body.position);

    if (!title) return res.status(400).json({ message: "Section title is required." });

    const courseExists = await pool.query(
      "SELECT id FROM learning_courses WHERE id = $1 LIMIT 1",
      [courseId]
    );
    if (!courseExists.rows.length) return res.status(404).json({ message: "Course not found." });

    const countResult = await pool.query(
      "SELECT COUNT(*)::INT AS count FROM learning_sections WHERE course_id = $1",
      [courseId]
    );
    const nextPosition =
      requestedPosition > 0 ? requestedPosition : Number(countResult.rows[0]?.count || 0) + 1;

    const section = await pool.query(
      `
      INSERT INTO learning_sections (course_id, title, position)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [courseId, title, nextPosition]
    );

    return res.status(201).json({ data: section.rows[0] });
  } catch (err) {
    console.error("CREATE SECTION ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.getSectionsByCourse = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { courseId } = req.params;

    const sections = await pool.query(
      "SELECT * FROM learning_sections WHERE course_id = $1 ORDER BY position ASC, created_at ASC",
      [courseId]
    );
    return res.json({ data: sections.rows });
  } catch (err) {
    console.error("GET SECTIONS BY COURSE ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.updateSection = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { sectionId } = req.params;
    const title = String(req.body.title || "").trim();

    if (!title) return res.status(400).json({ message: "Section title is required." });

    const updated = await pool.query(
      `
      UPDATE learning_sections
      SET title = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [title, sectionId]
    );

    if (!updated.rows.length) return res.status(404).json({ message: "Section not found." });
    return res.json({ data: updated.rows[0] });
  } catch (err) {
    console.error("UPDATE SECTION ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.createLesson = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!ensureAdmin(req, res)) return;

    const courseId = req.body.course_id;
    const sectionId = req.body.section_id;
    const title = String(req.body.title || "").trim();
    const mediaType = String(req.body.media_type || "none");
    const mediaUrl = req.body.media_url ? String(req.body.media_url).trim() : null;
    const mediaPublicId = req.body.media_public_id ? String(req.body.media_public_id).trim() : null;
    const mediaOriginalName = req.body.media_original_name
      ? String(req.body.media_original_name).trim()
      : null;
    const content = req.body.content ? String(req.body.content).trim() : null;
    const durationMinutes = Number(req.body.duration_minutes) || 0;

    if (!courseId || !sectionId || !title) {
      return res.status(400).json({ message: "course_id, section_id, and title are required." });
    }
    if (!["none", "video", "audio", "file"].includes(mediaType)) {
      return res.status(400).json({ message: "Invalid media_type." });
    }

    const validSection = await ensureSectionBelongsToCourse(sectionId, courseId);
    if (!validSection) {
      return res.status(400).json({ message: "Section does not belong to the selected course." });
    }

    await client.query("BEGIN");

    const positionResult = await client.query(
      `
      SELECT COALESCE(MAX(position), 0)::INT AS max_position
      FROM learning_lessons
      WHERE section_id = $1
      `,
      [sectionId]
    );
    const nextPosition = Number(positionResult.rows[0]?.max_position || 0) + 1;

    const lesson = await client.query(
      `
      INSERT INTO learning_lessons (
        course_id, section_id, title, media_type, media_url, media_public_id, media_original_name, content, duration_minutes, position, created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        courseId,
        sectionId,
        title,
        mediaType,
        mediaUrl,
        mediaPublicId,
        mediaOriginalName,
        content,
        Math.max(0, durationMinutes),
        nextPosition,
        req.userId,
      ]
    );

    await client.query("COMMIT");
    return res.status(201).json({ data: lesson.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("CREATE LESSON ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  } finally {
    client.release();
  }
};

exports.getLessons = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { course_id: courseId, section_id: sectionId } = req.query;
    const where = [];
    const params = [];

    if (courseId) {
      params.push(courseId);
      where.push(`course_id = $${params.length}`);
    }
    if (sectionId) {
      params.push(sectionId);
      where.push(`section_id = $${params.length}`);
    }

    const result = await pool.query(
      `
      SELECT *
      FROM learning_lessons
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY section_id ASC, position ASC, created_at ASC
      `,
      params
    );

    return res.json({ data: result.rows });
  } catch (err) {
    console.error("GET LESSONS ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.deleteLesson = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!ensureAdmin(req, res)) return;
    const { lessonId } = req.params;

    await client.query("BEGIN");

    const result = await client.query(
      "DELETE FROM learning_lessons WHERE id = $1 RETURNING id, section_id",
      [lessonId]
    );
    if (!result.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Lesson not found." });
    }

    await normalizeLessonPositionsForSection(client, result.rows[0].section_id);
    await client.query("COMMIT");
    return res.json({ message: "Lesson deleted successfully." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DELETE LESSON ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  } finally {
    client.release();
  }
};

exports.updateLesson = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { lessonId } = req.params;

    const existingResult = await pool.query("SELECT * FROM learning_lessons WHERE id = $1 LIMIT 1", [lessonId]);
    if (!existingResult.rows.length) return res.status(404).json({ message: "Lesson not found." });
    const existing = existingResult.rows[0];

    const title =
      req.body.title !== undefined ? String(req.body.title || "").trim() : String(existing.title || "").trim();
    const mediaType = req.body.media_type !== undefined ? String(req.body.media_type || "none").trim() : existing.media_type;
    const mediaUrl =
      req.body.media_url !== undefined ? (req.body.media_url ? String(req.body.media_url).trim() : null) : existing.media_url;
    const mediaPublicId =
      req.body.media_public_id !== undefined
        ? req.body.media_public_id ? String(req.body.media_public_id).trim() : null
        : existing.media_public_id;
    const mediaOriginalName =
      req.body.media_original_name !== undefined
        ? req.body.media_original_name ? String(req.body.media_original_name).trim() : null
        : existing.media_original_name;
    const content =
      req.body.content !== undefined ? (req.body.content ? String(req.body.content).trim() : null) : existing.content;
    const durationMinutes =
      req.body.duration_minutes !== undefined
        ? Math.max(0, Number(req.body.duration_minutes) || 0)
        : Number(existing.duration_minutes) || 0;

    if (!title) return res.status(400).json({ message: "Lesson title is required." });
    if (!["none", "video", "audio", "file"].includes(mediaType)) {
      return res.status(400).json({ message: "Invalid media_type." });
    }

    const updated = await pool.query(
      `
      UPDATE learning_lessons
      SET title = $1,
          media_type = $2,
          media_url = $3,
          media_public_id = $4,
          media_original_name = $5,
          content = $6,
          duration_minutes = $7,
          updated_at = NOW()
      WHERE id = $8
      RETURNING *
      `,
      [title, mediaType, mediaUrl, mediaPublicId, mediaOriginalName, content, durationMinutes, lessonId]
    );

    return res.json({ data: updated.rows[0] });
  } catch (err) {
    console.error("UPDATE LESSON ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.reorderLesson = async (req, res) => {
  const client = await pool.connect();
  try {
    if (!ensureAdmin(req, res)) return;
    const { lessonId } = req.params;
    const direction = String(req.body.direction || "").trim().toLowerCase();
    const requestedPosition = Number(req.body.position);

    const hasValidDirection = ["up", "down"].includes(direction);
    const hasValidPosition = Number.isInteger(requestedPosition) && requestedPosition > 0;
    if (!hasValidDirection && !hasValidPosition) {
      return res.status(400).json({ message: "Provide direction ('up'/'down') or a valid positive integer position." });
    }

    await client.query("BEGIN");

    const currentResult = await client.query(
      `SELECT id, section_id, position FROM learning_lessons WHERE id = $1 LIMIT 1 FOR UPDATE`,
      [lessonId]
    );
    if (!currentResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Lesson not found." });
    }

    const current = currentResult.rows[0];
    await normalizeLessonPositionsForSection(client, current.section_id);

    const refreshedCurrentResult = await client.query(
      `SELECT id, section_id, position FROM learning_lessons WHERE id = $1 LIMIT 1 FOR UPDATE`,
      [lessonId]
    );
    const refreshedCurrent = refreshedCurrentResult.rows[0];

    const sectionCountResult = await client.query(
      `SELECT COUNT(*)::INT AS count FROM learning_lessons WHERE section_id = $1`,
      [refreshedCurrent.section_id]
    );
    const sectionCount = Number(sectionCountResult.rows[0]?.count || 0);

    let targetPosition = refreshedCurrent.position;
    if (hasValidPosition) {
      targetPosition = Math.min(Math.max(1, requestedPosition), Math.max(1, sectionCount));
    } else if (direction === "up") {
      targetPosition = Math.max(1, refreshedCurrent.position - 1);
    } else {
      targetPosition = Math.min(sectionCount, refreshedCurrent.position + 1);
    }

    if (targetPosition === refreshedCurrent.position) {
      await client.query("COMMIT");
      return res.json({ message: "Lesson already at boundary.", moved: false });
    }

    await client.query("UPDATE learning_lessons SET position = 0 WHERE id = $1", [refreshedCurrent.id]);

    if (targetPosition < refreshedCurrent.position) {
      await client.query(
        `UPDATE learning_lessons SET position = position + 1000000 WHERE section_id = $1 AND position >= $2 AND position < $3`,
        [refreshedCurrent.section_id, targetPosition, refreshedCurrent.position]
      );
      await client.query(
        `UPDATE learning_lessons SET position = position - 999999 WHERE section_id = $1 AND position >= $2 AND position < $3`,
        [refreshedCurrent.section_id, targetPosition + 1000000, refreshedCurrent.position + 1000000]
      );
    } else {
      await client.query(
        `UPDATE learning_lessons SET position = position - 1000000 WHERE section_id = $1 AND position <= $2 AND position > $3`,
        [refreshedCurrent.section_id, targetPosition, refreshedCurrent.position]
      );
      await client.query(
        `UPDATE learning_lessons SET position = position + 999999 WHERE section_id = $1 AND position <= $2 AND position > $3`,
        [refreshedCurrent.section_id, targetPosition - 1000000, refreshedCurrent.position - 1000000]
      );
    }

    await client.query("UPDATE learning_lessons SET position = $1 WHERE id = $2", [targetPosition, refreshedCurrent.id]);

    await client.query("COMMIT");
    return res.json({ message: "Lesson order updated.", moved: true, position: targetPosition });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("REORDER LESSON ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  } finally {
    client.release();
  }
};

exports.createQuiz = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const courseId = req.body.course_id;
    const requestedSectionId = req.body.section_id;
    const quizType = String(req.body.quiz_type || "section").trim().toLowerCase();
    const isFinalExam = quizType === "final";
    const sectionId = isFinalExam ? null : requestedSectionId;
    const title = String(req.body.title || "").trim();
    const durationMinutes = Number(req.body.duration_minutes) || 0;
    const passingPercentage = Number(req.body.passing_percentage);
    const normalizedPassingPercentage = Number.isFinite(passingPercentage)
      ? Math.min(100, Math.max(0, passingPercentage))
      : 60;
    const instructions = req.body.instructions ? String(req.body.instructions).trim() : null;

    if (!["section", "final"].includes(quizType)) {
      return res.status(400).json({ message: "quiz_type must be 'section' or 'final'." });
    }

    if (!courseId || !title) {
      return res.status(400).json({ message: "course_id and title are required." });
    }
    if (!isFinalExam && !sectionId) {
      return res.status(400).json({ message: "section_id is required for section quizzes." });
    }

    if (!isFinalExam) {
      const validSection = await ensureSectionBelongsToCourse(sectionId, courseId);
      if (!validSection) {
        return res.status(400).json({ message: "Section does not belong to the selected course." });
      }
    } else {
      const existingFinalQuiz = await getFinalQuizByCourse(courseId);
      if (existingFinalQuiz) {
        return res.status(409).json({ message: "Final exam already exists for this course." });
      }
    }

    const quiz = await pool.query(
      `INSERT INTO learning_quizzes (course_id, section_id, quiz_type, title, duration_minutes, passing_percentage, instructions, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        courseId,
        sectionId,
        isFinalExam ? "final" : "section",
        title,
        Math.max(0, durationMinutes),
        normalizedPassingPercentage,
        instructions,
        req.userId,
      ]
    );

    return res.status(201).json({ data: quiz.rows[0] });
  } catch (err) {
    console.error("CREATE QUIZ ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.getQuizzes = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { course_id: courseId, section_id: sectionId, quiz_type: quizType } = req.query;
    const where = [];
    const params = [];

    if (courseId) { params.push(courseId); where.push(`q.course_id = $${params.length}`); }
    if (sectionId) { params.push(sectionId); where.push(`q.section_id = $${params.length}`); }
    if (quizType) { params.push(String(quizType).toLowerCase()); where.push(`q.quiz_type = $${params.length}`); }

    const result = await pool.query(
      `SELECT q.*, (SELECT COUNT(*)::INT FROM learning_questions lq WHERE lq.quiz_id = q.id) AS question_count FROM learning_quizzes q ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY q.created_at DESC`,
      params
    );

    return res.json({ data: result.rows });
  } catch (err) {
    console.error("GET QUIZZES ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { quizId } = req.params;

    const result = await pool.query("DELETE FROM learning_quizzes WHERE id = $1 RETURNING id", [quizId]);
    if (!result.rows.length) return res.status(404).json({ message: "Quiz not found." });
    return res.json({ message: "Quiz deleted successfully." });
  } catch (err) {
    console.error("DELETE QUIZ ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.updateQuiz = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { quizId } = req.params;

    const existingResult = await pool.query("SELECT * FROM learning_quizzes WHERE id = $1 LIMIT 1", [quizId]);
    if (!existingResult.rows.length) return res.status(404).json({ message: "Quiz not found." });
    const existing = existingResult.rows[0];

    const title = req.body.title !== undefined ? String(req.body.title || "").trim() : String(existing.title || "").trim();
    const durationMinutes = req.body.duration_minutes !== undefined ? Math.max(0, Number(req.body.duration_minutes) || 0) : Number(existing.duration_minutes) || 0;
    const passingPercentage =
      req.body.passing_percentage !== undefined
        ? Math.min(100, Math.max(0, Number(req.body.passing_percentage) || 0))
        : Math.min(100, Math.max(0, Number(existing.passing_percentage) || 60));
    const instructions = req.body.instructions !== undefined ? (req.body.instructions ? String(req.body.instructions).trim() : null) : existing.instructions;

    if (!title) return res.status(400).json({ message: "Quiz title is required." });

    const updated = await pool.query(
      `UPDATE learning_quizzes SET title = $1, duration_minutes = $2, passing_percentage = $3, instructions = $4, updated_at = NOW() WHERE id = $5 RETURNING *`,
      [title, durationMinutes, passingPercentage, instructions, quizId]
    );

    return res.json({ data: updated.rows[0] });
  } catch (err) {
    console.error("UPDATE QUIZ ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const courseId = req.body.course_id;
    const sectionIdFromPayload = req.body.section_id || null;
    const quizId = req.body.quiz_id;
    const questionText = String(req.body.question_text || "").trim();
    const questionType = String(req.body.question_type || "").trim();
    const options = Array.isArray(req.body.options) ? req.body.options : [];
    const correctAnswer = req.body.correct_answer ? String(req.body.correct_answer).trim() : null;
    const marks = Number(req.body.marks) || 1;
    const difficulty = String(req.body.difficulty || "").trim();

    const allowedTypes = new Set(["single_choice", "multiple_choice", "true_false", "short_answer", "match_following", "ordering_sequence", "fill_blanks"]);
    const allowedDifficulties = new Set(["Very Easy", "Easy", "Medium", "High", "Very High"]);

    if (!courseId || !quizId || !questionText || !questionType || !difficulty) {
      return res.status(400).json({ message: "course_id, quiz_id, question_text, question_type, and difficulty are required." });
    }
    if (!allowedTypes.has(questionType)) return res.status(400).json({ message: "Invalid question_type." });
    if (!allowedDifficulties.has(difficulty)) return res.status(400).json({ message: "Invalid difficulty." });

    const quizContext = await ensureQuizBelongsToContext(quizId, sectionIdFromPayload, courseId);
    if (!quizContext) return res.status(400).json({ message: "Quiz does not belong to the selected section/course." });

    const isFinalExam = isFinalQuizType(quizContext.quiz_type, quizContext.section_id);
    const sectionId = isFinalExam ? null : quizContext.section_id;

    const sanitizedOptions = options.map((opt) => String(opt || "").trim()).filter(Boolean);
    const result = await pool.query(
      `INSERT INTO learning_questions (course_id, section_id, quiz_id, question_text, question_type, options, correct_answer, marks, difficulty, created_by) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10) RETURNING *`,
      [courseId, sectionId, quizId, questionText, questionType, JSON.stringify(sanitizedOptions), correctAnswer, Math.max(1, marks), difficulty, req.userId]
    );

    return res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error("CREATE QUESTION ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;

    const { course_id: courseId, section_id: sectionId, quiz_id: quizId } = req.query;
    const where = [];
    const params = [];

    if (courseId) { params.push(courseId); where.push(`course_id = $${params.length}`); }
    if (sectionId) { params.push(sectionId); where.push(`section_id = $${params.length}`); }
    if (quizId) { params.push(quizId); where.push(`quiz_id = $${params.length}`); }

    const result = await pool.query(
      `SELECT * FROM learning_questions ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY created_at DESC`,
      params
    );
    return res.json({ data: result.rows });
  } catch (err) {
    console.error("GET QUESTIONS ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.getCourseFinalExam = async (req, res) => {
  try {
    if (!ensureStudent(req, res)) return;

    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: "courseId is required." });

    const enrollmentResult = await pool.query(
      `
      SELECT id
      FROM learning_course_enrollments
      WHERE course_id = $1
        AND student_id = $2
      LIMIT 1
      `,
      [courseId, req.userId]
    );
    if (!enrollmentResult.rows.length) {
      return res.status(403).json({ message: "Please enroll in the course before accessing the final exam." });
    }

    const finalQuiz = await getFinalQuizByCourse(courseId);
    if (!finalQuiz) {
      return res.status(404).json({ message: "Final exam not found for this course." });
    }

    const questionsResult = await pool.query(
      `
      SELECT id, course_id, section_id, quiz_id, question_text, question_type, options, marks, difficulty, created_at
      FROM learning_questions
      WHERE quiz_id = $1
      ORDER BY created_at ASC
      `,
      [finalQuiz.id]
    );

    return res.json({
      data: {
        quiz: {
          id: finalQuiz.id,
          course_id: finalQuiz.course_id,
          title: finalQuiz.title,
          duration_minutes: finalQuiz.duration_minutes,
          passing_percentage: finalQuiz.passing_percentage,
          instructions: finalQuiz.instructions,
          quiz_type: finalQuiz.quiz_type,
        },
        questions: questionsResult.rows,
      },
    });
  } catch (err) {
    console.error("GET COURSE FINAL EXAM ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.submitFinalExamAttempt = async (req, res) => {
  const client = await pool.connect();
  let transactionStarted = false;
  try {
    if (!ensureStudent(req, res)) return;

    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: "courseId is required." });

    const enrollmentResult = await pool.query(
      `
      SELECT id, status
      FROM learning_course_enrollments
      WHERE course_id = $1
        AND student_id = $2
      LIMIT 1
      `,
      [courseId, req.userId]
    );
    if (!enrollmentResult.rows.length) {
      return res.status(403).json({ message: "Please enroll in the course before attempting the final exam." });
    }

    const finalQuiz = await getFinalQuizByCourse(courseId);
    if (!finalQuiz) {
      return res.status(404).json({ message: "Final exam not found for this course." });
    }

    const questionsResult = await pool.query(
      `
      SELECT id, question_text, question_type, options, correct_answer, marks
      FROM learning_questions
      WHERE quiz_id = $1
      ORDER BY created_at ASC
      `,
      [finalQuiz.id]
    );
    const questions = questionsResult.rows;
    if (!questions.length) {
      return res.status(400).json({ message: "Final exam has no questions yet." });
    }

    const answersMap = toAnswerMap(req.body?.answers);
    let correctAnswers = 0;

    questions.forEach((question) => {
      const submittedAnswer = answersMap.get(String(question.id));
      if (isAnswerCorrect(question, submittedAnswer)) correctAnswers += 1;
    });

    const totalQuestions = questions.length;
    const scorePercentage = Number(((correctAnswers / totalQuestions) * 100).toFixed(2));
    const passingPercentage = Math.min(100, Math.max(0, Number(finalQuiz.passing_percentage) || 60));
    const passed = scorePercentage >= passingPercentage;

    const serializedAnswers = Object.fromEntries(answersMap.entries());

    await client.query("BEGIN");
    transactionStarted = true;
    const attemptResult = await client.query(
      `
      INSERT INTO learning_final_exam_attempts
        (course_id, quiz_id, student_id, score_percentage, correct_answers, total_questions, passed, answers_json)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
      RETURNING *
      `,
      [
        courseId,
        finalQuiz.id,
        req.userId,
        scorePercentage,
        correctAnswers,
        totalQuestions,
        passed,
        JSON.stringify(serializedAnswers),
      ]
    );

    if (passed) {
      await client.query(
        `
        UPDATE learning_course_enrollments
        SET status = 'completed',
            completed_at = COALESCE(completed_at, NOW())
        WHERE course_id = $1
          AND student_id = $2
        `,
        [courseId, req.userId]
      );
    }

    await client.query("COMMIT");
    transactionStarted = false;

    let certificate = null;
    let certificateWarning = null;

    if (passed) {
      try {
        const [studentResult, courseResult] = await Promise.all([
          pool.query("SELECT name FROM users WHERE id = $1 LIMIT 1", [req.userId]),
          pool.query("SELECT title FROM learning_courses WHERE id = $1 LIMIT 1", [courseId]),
        ]);

        const studentName = studentResult.rows[0]?.name || "Student";
        const courseTitle = courseResult.rows[0]?.title || "Learning Course";

        let certResponsePayload = null;
        const mockReq = {
          body: {
            student_name: studentName,
            exam_title: `${courseTitle} Final Exam`,
            issuer_name: "CCS Institute",
            student_id: req.userId,
            learning_course_id: courseId,
          },
        };
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              if (code >= 400) throw new Error(data?.error || data?.message || "Certificate generation failed");
              certResponsePayload = data;
            },
          }),
          json: (data) => {
            certResponsePayload = data;
          },
        };

        await generateCertificatePdf(mockReq, mockRes);
        certificate = certResponsePayload?.certificate || null;
      } catch (certErr) {
        console.error("FINAL EXAM CERTIFICATE GENERATION ERROR:", certErr.message);
        certificateWarning = "Final exam passed, but certificate generation failed. Please retry.";
      }
    }

    return res.json({
      data: {
        attempt: attemptResult.rows[0],
        quiz: {
          id: finalQuiz.id,
          course_id: finalQuiz.course_id,
          title: finalQuiz.title,
          passing_percentage: passingPercentage,
          duration_minutes: finalQuiz.duration_minutes,
        },
        score_percentage: scorePercentage,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        passed,
        certificate,
        certificate_warning: certificateWarning,
      },
    });
  } catch (err) {
    if (transactionStarted) {
      await client.query("ROLLBACK");
    }
    console.error("SUBMIT FINAL EXAM ATTEMPT ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  } finally {
    client.release();
  }
};

exports.getMyFinalExamAttempts = async (req, res) => {
  try {
    if (!ensureStudent(req, res)) return;

    const { courseId } = req.params;
    if (!courseId) return res.status(400).json({ message: "courseId is required." });

    const attempts = await pool.query(
      `
      SELECT *
      FROM learning_final_exam_attempts
      WHERE course_id = $1
        AND student_id = $2
      ORDER BY attempted_at DESC
      `,
      [courseId, req.userId]
    );

    return res.json({ data: attempts.rows });
  } catch (err) {
    console.error("GET MY FINAL EXAM ATTEMPTS ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { questionId } = req.params;

    const result = await pool.query("DELETE FROM learning_questions WHERE id = $1 RETURNING id", [questionId]);
    if (!result.rows.length) return res.status(404).json({ message: "Question not found." });
    return res.json({ message: "Question deleted successfully." });
  } catch (err) {
    console.error("DELETE QUESTION ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { questionId } = req.params;

    const existingResult = await pool.query("SELECT * FROM learning_questions WHERE id = $1 LIMIT 1", [questionId]);
    if (!existingResult.rows.length) return res.status(404).json({ message: "Question not found." });
    const existing = existingResult.rows[0];

    const questionText = req.body.question_text !== undefined ? String(req.body.question_text || "").trim() : String(existing.question_text || "").trim();
    const questionType = req.body.question_type !== undefined ? String(req.body.question_type || "").trim() : String(existing.question_type || "").trim();
    const options = req.body.options !== undefined ? (Array.isArray(req.body.options) ? req.body.options : []) : (Array.isArray(existing.options) ? existing.options : []);
    const correctAnswer = req.body.correct_answer !== undefined ? (req.body.correct_answer ? String(req.body.correct_answer).trim() : null) : existing.correct_answer;
    const marks = req.body.marks !== undefined ? Math.max(1, Number(req.body.marks) || 1) : Math.max(1, Number(existing.marks) || 1);
    const difficulty = req.body.difficulty !== undefined ? String(req.body.difficulty || "").trim() : String(existing.difficulty || "").trim();

    const allowedTypes = new Set(["single_choice", "multiple_choice", "true_false", "short_answer", "match_following", "ordering_sequence", "fill_blanks"]);
    const allowedDifficulties = new Set(["Very Easy", "Easy", "Medium", "High", "Very High"]);

    if (!questionText || !questionType || !difficulty) return res.status(400).json({ message: "question_text, question_type, and difficulty are required." });
    if (!allowedTypes.has(questionType)) return res.status(400).json({ message: "Invalid question_type." });
    if (!allowedDifficulties.has(difficulty)) return res.status(400).json({ message: "Invalid difficulty." });

    const sanitizedOptions = options.map((opt) => String(opt || "").trim()).filter(Boolean);
    const updated = await pool.query(
      `UPDATE learning_questions SET question_text = $1, question_type = $2, options = $3::jsonb, correct_answer = $4, marks = $5, difficulty = $6, updated_at = NOW() WHERE id = $7 RETURNING *`,
      [questionText, questionType, JSON.stringify(sanitizedOptions), correctAnswer, marks, difficulty, questionId]
    );

    return res.json({ data: updated.rows[0] });
  } catch (err) {
    console.error("UPDATE QUESTION ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    if (!ensureAdmin(req, res)) return;
    const { sectionId } = req.params;

    const result = await pool.query(
      "DELETE FROM learning_sections WHERE id = $1 RETURNING id, title",
      [sectionId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Section not found." });
    }

    return res.json({ message: "Section deleted successfully." });
  } catch (err) {
    console.error("DELETE SECTION ERROR:", err.message);
    return res.status(500).json({ message: mapError(err) });
  }
};
