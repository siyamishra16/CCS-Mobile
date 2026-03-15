const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const puppeteer = require('puppeteer');
const QRCode = require('qrcode');
const cloudinary = require('../config/cloudinary');
const pool = require('../db');

const templatesDir = path.join(__dirname, '..', 'templates');
let browserPromise = null;

// tiny transparent PNG (1x1) base64 as fallback for missing background
const TRANSPARENT_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMBAQEA/2kAAAAASUVORK5CYII=';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatIssuedDate(dateValue) {
  try {
    return new Date(dateValue).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return '';
  }
}

function getNameFontSizeMm(name) {
  const length = String(name || '').trim().length;
  if (length <= 16) return 17;
  if (length <= 24) return 15;
  if (length <= 34) return 13;
  return 11.5;
}

function getExamTitleFontSizeMm(examTitle) {
  const length = String(examTitle || '').trim().length;
  if (length <= 30) return 4.8;
  if (length <= 45) return 4.2;
  if (length <= 65) return 3.7;
  return 3.2;
}

const launchOptions = {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
  headless: true
};

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch(launchOptions).catch((err) => {
      browserPromise = null;
      throw err;
    });
  }
  return browserPromise;
}

async function closeBrowserIfOpen() {
  if (!browserPromise) return;
  try {
    const browser = await browserPromise;
    await browser.close();
  } catch (err) {
    // ignore shutdown errors
  } finally {
    browserPromise = null;
  }
}

process.once('SIGINT', closeBrowserIfOpen);
process.once('SIGTERM', closeBrowserIfOpen);

async function uploadPdfBufferToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const folder = 'ccs/certificates';
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'raw', public_id: filename.replace(/\.[^.]+$/, '') },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

async function generateUniqueCertificateNumber() {
  // Keep predictable prefix for readability and random suffix for uniqueness.
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  for (let i = 0; i < 5; i++) {
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    const candidate = `CERT-${datePart}-${randomPart}`;
    const exists = await pool.query(
      'SELECT 1 FROM certificates WHERE certificate_number = $1 LIMIT 1',
      [candidate]
    );
    if (!exists.rows.length) return candidate;
  }

  throw new Error('Failed to generate unique certificate number');
}

async function generateCertificatePdf(req, res) {
  try {
    const {
      student_name = 'Student Name',
      exam_title = 'Sample Exam',
      issuer_name = 'Your Institute',
      left_signatory_name = 'Program Director',
      left_signatory_title = 'Certification Authority',
      right_signatory_name = 'Head of Assessment',
      right_signatory_title = 'CCS Institute',
      force_regenerate = false,
      student_id = null,
      exam_id = null,
      learning_course_id = null
    } = req.body || {};

    const shouldRegenerate = force_regenerate === true || force_regenerate === 'true';
    let existingCertificate = null;

    // Idempotent behavior for exam-based certificates.
    if (student_id && exam_id) {
      const existing = await pool.query(
        `SELECT id, student_id, exam_id, learning_course_id, certificate_number, file_url, cloudinary_public_id, data_json, issued_at, status, created_at
         FROM certificates
         WHERE student_id = $1 AND exam_id = $2
         LIMIT 1`,
        [student_id, exam_id]
      );
      if (existing.rows.length) {
        if (!shouldRegenerate) {
          return res.json({ certificate: existing.rows[0], file_url: existing.rows[0].file_url, already_exists: true });
        }
        existingCertificate = existing.rows[0];
      }
    }

    // Idempotent behavior for learning-course certificates.
    if (!existingCertificate && student_id && learning_course_id) {
      const existing = await pool.query(
        `SELECT id, student_id, exam_id, learning_course_id, certificate_number, file_url, cloudinary_public_id, data_json, issued_at, status, created_at
         FROM certificates
         WHERE student_id = $1 AND learning_course_id = $2
         LIMIT 1`,
        [student_id, learning_course_id]
      );
      if (existing.rows.length) {
        if (!shouldRegenerate) {
          return res.json({ certificate: existing.rows[0], file_url: existing.rows[0].file_url, already_exists: true });
        }
        existingCertificate = existing.rows[0];
      }
    }

    const certificate_number = existingCertificate?.certificate_number || await generateUniqueCertificateNumber();
    const issued_at = new Date();
    const issued_on = formatIssuedDate(issued_at);
    const nameFontSizeMm = getNameFontSizeMm(student_name);
    const examTitleFontSizeMm = getExamTitleFontSizeMm(exam_title);

    const verifyBase =
      process.env.FRONTEND_URL ||
      `${process.env.BACKEND_PROTOCOL || 'http'}://${process.env.BACKEND_HOST || `localhost:${process.env.PORT || 5000}`}`;
    const verifyUrl = `${verifyBase.replace(/\/$/, '')}/api/certificates/verify/${encodeURIComponent(certificate_number)}`;
    const verifyQrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 0, width: 220 });

    // Load background as data URL (use transparent fallback if not present)
    const bgPath = path.join(templatesDir, 'certificate_bg.png');

    let bg_data_url = TRANSPARENT_PNG;

    if (await fs.pathExists(bgPath)) {
      const bgBuffer = await fs.readFile(bgPath);
      bg_data_url = `data:image/png;base64,${bgBuffer.toString('base64')}`;
    }

    // Render directly from PNG background and overlay certificate details.
    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <style>
          @page { size: A4; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { margin: 0; font-family: Georgia, "Times New Roman", serif; }
          .page {
            width: 210mm;
            height: 297mm;
            position: relative;
            background-image: url('${bg_data_url}');
            background-repeat: no-repeat;
            background-position: center center;
            background-size: 210mm 297mm;
          }
          .title-main {
            position: absolute;
            left: 50%;
            top: 24%;
            transform: translateX(-50%);
            width: 82%;
            text-align: center;
            color: #1f3a63;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 8.7mm;
            letter-spacing: 0.8mm;
            font-weight: 800;
            text-transform: uppercase;
          }
          .subtitle {
            position: absolute;
            left: 50%;
            top: 34%;
            transform: translateX(-50%);
            width: 72%;
            text-align: center;
            color: #36527b;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 4.2mm;
          }
          .student-name {
            position: absolute;
            left: 50%;
            top: 40%;
            transform: translateX(-50%);
            width: 80%;
            text-align: center;
            color: #123f73;
            font-size: ${nameFontSizeMm}mm;
            font-weight: 700;
            line-height: 1.05;
            word-break: break-word;
          }
          .divider {
            position: absolute;
            left: 50%;
            top: 51%;
            transform: translateX(-50%);
            width: 42%;
            border-bottom: 0.5mm solid #9aa8bc;
          }
          .achievement-text {
            position: absolute;
            left: 50%;
            top: 54.5%;
            transform: translateX(-50%);
            width: 84%;
            text-align: center;
            color: #36527b;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 4.2mm;
            line-height: 1.2;
          }
          .completion-line {
            position: absolute;
            left: 50%;
            top: 58.5%;
            transform: translateX(-50%);
            width: 80%;
            text-align: center;
            color: #1f3a63;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 3.7mm;
            font-weight: 500;
            letter-spacing: 0;
            text-transform: none;
          }
          .meta {
            position: absolute;
            right: 17mm;
            top: 20mm;
            text-align: right;
            color: #24385f;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 3.1mm;
            line-height: 1.45;
          }
          .meta .value {
            font-weight: 700;
          }
          .exam-title {
            position: absolute;
            left: 50%;
            top: 58.5%;
            transform: translateX(-50%);
            width: 70%;
            text-align: center;
            color: #24385f;
            font-family: Arial, Helvetica, sans-serif;
            font-size: ${examTitleFontSizeMm}mm;
            font-weight: 700;
            line-height: 1.2;
            word-break: break-word;
          }
          .issuer {
            position: absolute;
            left: 50%;
            top: 68.5%;
            transform: translateX(-50%);
            width: 70%;
            text-align: center;
            color: #24385f;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 3.2mm;
          }
          .signature-line {
            position: absolute;
            width: 18%;
            border-bottom: 0.45mm solid #8f9db0;
            top: 82%;
          }
          .signature-line.left { left: 16%; }
          .signature-line.right { right: 16%; }
          .signatory {
            position: absolute;
            width: 33%;
            text-align: center;
            color: #24385f;
            font-family: Arial, Helvetica, sans-serif;
          }
          .signatory.left { left: 10%; top: 83%; }
          .signatory.right { right: 10%; top: 83%; }
          .signatory .name {
            font-size: 3.4mm;
            font-weight: 700;
            margin-bottom: 1mm;
          }
          .signatory .title {
            font-size: 2.8mm;
          }
          .verify-box {
            position: absolute;
            left: 14mm;
            top: 18mm;
            width: 26mm;
            text-align: center;
            color: #24385f;
            font-family: Arial, Helvetica, sans-serif;
          }
          .verify-box img {
            width: 22mm;
            height: 22mm;
            object-fit: contain;
            border: 0.3mm solid #d9e2f1;
            border-radius: 1.5mm;
            background: #fff;
          }
          .verify-box .label {
            margin-top: 1mm;
            font-size: 2.2mm;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="verify-box">
            <img src="${verifyQrDataUrl}" alt="Verification QR"/>
            <div class="label">Scan to verify</div>
          </div>
          <div class="meta">
            <div>Certificate ID: <span class="value">${escapeHtml(certificate_number)}</span></div>
            <div>Awarded on: <span class="value">${escapeHtml(issued_on)}</span></div>
          </div>
          <div class="title-main">Certificate Of Achievement</div>
          <div class="subtitle">This is to certify that</div>
          <div class="student-name">${escapeHtml(student_name)}</div>
          <div class="divider"></div>
          <div class="achievement-text">has successfully completed the course in</div>
          <div class="exam-title">${escapeHtml(exam_title)}</div>
          <div class="issuer">Issued by ${escapeHtml(issuer_name)}</div>
          <div class="signature-line left"></div>
          <div class="signature-line right"></div>
          <div class="signatory left">
            <div class="name">${escapeHtml(left_signatory_name)}</div>
            <div class="title">${escapeHtml(left_signatory_title)}</div>
          </div>
          <div class="signatory right">
            <div class="name">${escapeHtml(right_signatory_name)}</div>
            <div class="title">${escapeHtml(right_signatory_title)}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Render to PDF with Puppeteer (reusing browser for faster generation).
    let browser;
    let page;
    try {
      browser = await getBrowser();
      page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await page.close();

      // Upload PDF to Cloudinary (raw)
      const fileName = `certificate_${certificate_number}`;
      const uploadResult = await uploadPdfBufferToCloudinary(pdfBuffer, `${fileName}.pdf`);
      const fileUrl = uploadResult?.secure_url || null;
      const publicId = uploadResult?.public_id || null;

      const dataJson = {
        student_name,
        exam_title,
        issuer_name,
        certificate_number,
        issued_on,
        verify_url: verifyUrl,
        left_signatory_name,
        left_signatory_title,
        right_signatory_name,
        right_signatory_title
      };

      let dbRes;
      if (existingCertificate) {
        dbRes = await pool.query(
          `UPDATE certificates
           SET file_url = $1,
               cloudinary_public_id = $2,
               data_json = $3,
               issued_at = $4,
               status = $5,
               learning_course_id = $6
           WHERE id = $7
           RETURNING *`,
          [fileUrl, publicId, dataJson, issued_at, 'issued', learning_course_id, existingCertificate.id]
        );
      } else {
        const insertQuery = `INSERT INTO certificates (student_id, exam_id, learning_course_id, certificate_number, file_url, cloudinary_public_id, data_json, issued_at, status)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
        const values = [student_id, exam_id, learning_course_id, certificate_number, fileUrl, publicId, dataJson, issued_at, 'issued'];
        dbRes = await pool.query(insertQuery, values);
      }

      // Respond with saved record and file URL
      return res.json({ certificate: dbRes.rows[0], file_url: fileUrl, regenerated: Boolean(existingCertificate) });
    } catch (launchErr) {
      console.error('Puppeteer launch failed', launchErr);
      return res.status(500).json({ error: 'Puppeteer failed to launch. Ensure Chromium is available.' });
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (err) {
          // ignore page close issues
        }
      }
    }

  } catch (err) {
    console.error('Certificate generation error', err);
    res.status(500).json({ error: 'Certificate generation failed', details: err.message });
  }
}

async function getCertificatesByStudent(req, res) {
  try {
    const studentId = req.params.studentId;
    if (!studentId) return res.status(400).json({ error: 'Invalid student id' });

    const requesterId = req.user?.id || req.userId;
    const requesterType = Number(req.user?.user_type ?? req.userType);
    const isAdmin = requesterType === 1 || requesterType === 2;

    if (!requesterId) return res.status(401).json({ error: 'Unauthorized' });
    if (!isAdmin && String(requesterId) !== String(studentId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const q = `
      SELECT id, student_id, exam_id, learning_course_id, certificate_number, file_url, cloudinary_public_id, data_json, issued_at, status, created_at
      FROM certificates c
      WHERE c.student_id = $1
        AND (
          c.learning_course_id IS NULL
          OR EXISTS (
            SELECT 1
            FROM learning_final_exam_attempts a
            WHERE a.student_id = c.student_id
              AND a.course_id = c.learning_course_id
              AND a.passed = TRUE
          )
        )
      ORDER BY issued_at DESC
    `;
    const result = await pool.query(q, [studentId]);
    return res.json({ certificates: result.rows });
  } catch (err) {
    console.error('getCertificatesByStudent error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function verifyCertificate(req, res) {
  try {
    const certNumber = req.params.certificate_number;
    if (!certNumber) return res.status(400).json({ error: 'Missing certificate number' });

    const q = 'SELECT id, student_id, exam_id, learning_course_id, certificate_number, file_url, cloudinary_public_id, data_json, issued_at, status FROM certificates WHERE certificate_number = $1 LIMIT 1';
    const result = await pool.query(q, [certNumber]);
    if (result.rowCount === 0) return res.status(404).json({ verified: false });
    const cert = result.rows[0];
    return res.json({ verified: true, certificate: cert });
  } catch (err) {
    console.error('verifyCertificate error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getMyCertificates(req, res) {
  try {
    const studentId = req.user?.id || req.userId;
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    const q = `
      SELECT id, student_id, exam_id, learning_course_id, certificate_number, file_url, cloudinary_public_id, data_json, issued_at, status, created_at
      FROM certificates c
      WHERE c.student_id = $1
        AND (
          c.learning_course_id IS NULL
          OR EXISTS (
            SELECT 1
            FROM learning_final_exam_attempts a
            WHERE a.student_id = c.student_id
              AND a.course_id = c.learning_course_id
              AND a.passed = TRUE
          )
        )
      ORDER BY issued_at DESC
    `;
    const result = await pool.query(q, [studentId]);
    return res.json({ certificates: result.rows });
  } catch (err) {
    console.error('getMyCertificates error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function getCertificateRecordByNumber(certificateNumber) {
  const q = `
    SELECT id, student_id, exam_id, learning_course_id, certificate_number, file_url, cloudinary_public_id, data_json, issued_at, status
    FROM certificates
    WHERE certificate_number = $1
    LIMIT 1
  `;
  const result = await pool.query(q, [certificateNumber]);
  return result.rows[0] || null;
}

function fetchBinaryBuffer(fileUrl) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(fileUrl);
      const transport = parsed.protocol === 'https:' ? https : http;
      transport
        .get(fileUrl, (upstreamRes) => {
          if (upstreamRes.statusCode < 200 || upstreamRes.statusCode >= 300) {
            reject(new Error(`Upstream responded with status ${upstreamRes.statusCode}`));
            return;
          }

          const chunks = [];
          upstreamRes.on('data', (chunk) => chunks.push(chunk));
          upstreamRes.on('end', () => resolve(Buffer.concat(chunks)));
        })
        .on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

async function streamCertificate(req, res, disposition = 'inline') {
  try {
    const certNumber = req.params.certificate_number;
    if (!certNumber) return res.status(400).json({ error: 'Missing certificate number' });

    const cert = await getCertificateRecordByNumber(certNumber);
    if (!cert || !cert.file_url) return res.status(404).json({ error: 'Certificate file not found' });

    const buffer = await fetchBinaryBuffer(cert.file_url);
    const safeFileName = `certificate_${cert.certificate_number}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${safeFileName}"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(buffer);
  } catch (err) {
    console.error('streamCertificate error', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

async function viewCertificateFile(req, res) {
  return streamCertificate(req, res, 'inline');
}

async function downloadCertificateFile(req, res) {
  return streamCertificate(req, res, 'attachment');
}

async function generateCertificatesForPastExams(req, res) {
  try {
    // Get all passed exams that don't have certificates yet
    const q = `
      SELECT ea.id, ea.exam_id, ea.user_id, u.name as student_name, e.title as exam_title
      FROM exam_attempts ea
      JOIN users u ON u.id = ea.user_id
      JOIN exams e ON e.id = ea.exam_id
      WHERE ea.result_status = 'PASSED'
      AND NOT EXISTS (
        SELECT 1 FROM certificates 
        WHERE student_id = ea.user_id 
        AND exam_id = ea.exam_id
      )
      ORDER BY ea.attempted_at DESC
    `;
    
    const result = await pool.query(q);
    const passedExams = result.rows;

    if (passedExams.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No passed exams found that need certificates',
        generated: 0
      });
    }

    let generatedCount = 0;
    const errors = [];

    for (const exam of passedExams) {
      try {
        // Create a mock request object for certificate generation
        const mockReq = {
          body: {
            student_name: exam.student_name,
            exam_title: exam.exam_title,
            issuer_name: 'CCS Institute',
            student_id: exam.user_id,
            exam_id: exam.exam_id
          },
          protocol: process.env.BACKEND_PROTOCOL || 'http',
          get: (header) => {
            if (header === 'host') return process.env.BACKEND_HOST || `localhost:${process.env.PORT || 5000}`;
            return '';
          }
        };

        // Create a mock response that captures the result
        let certGenerated = false;
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              if (code >= 200 && code < 300) certGenerated = true;
            }
          }),
          json: (data) => {
            certGenerated = true;
          }
        };

        // Generate certificate
        await generateCertificatePdf(mockReq, mockRes);
        if (certGenerated) generatedCount++;
      } catch (err) {
        errors.push({
          exam_id: exam.exam_id,
          user_id: exam.user_id,
          error: err.message
        });
        console.error(`Failed to generate cert for exam ${exam.exam_id}, user ${exam.user_id}:`, err.message);
      }
    }

    return res.json({
      success: true,
      message: `Generated ${generatedCount} certificates for past exams`,
      generated: generatedCount,
      total: passedExams.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('generateCertificatesForPastExams error:', err);
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
}

module.exports = {
  generateCertificatePdf,
  getCertificatesByStudent,
  getMyCertificates,
  verifyCertificate,
  generateCertificatesForPastExams,
  viewCertificateFile,
  downloadCertificateFile
};
