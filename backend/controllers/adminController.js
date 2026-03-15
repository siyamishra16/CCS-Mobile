const pool = require("../db");

exports.getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, user_type, status, created_at FROM users ORDER BY created_at DESC"
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error("GET USERS ERROR ->", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cj.id, cj.title, cj.status, cj.created_at, c.name AS company_name
       FROM company_jobs cj
       LEFT JOIN companies c ON c.id = cj.company_id
       ORDER BY cj.created_at DESC`
    );

    res.json({ jobs: result.rows });
  } catch (err) {
    console.error("GET JOBS ERROR ->", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReferralSummary = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS total FROM users WHERE referral_code IS NOT NULL AND referral_code <> ''"
    );
    res.json({ total: result.rows[0]?.total || 0 });
  } catch (err) {
    console.error("GET REFERRAL SUMMARY ERROR ->", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getReferrals = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.user_type, u.referral_code, u.created_at,
              c.name AS college_name,
              univ.name AS university_name
       FROM users u
       LEFT JOIN colleges c ON c.referral_code = u.referral_code
       LEFT JOIN universities univ ON univ.referral_code = u.referral_code
       WHERE u.referral_code IS NOT NULL AND u.referral_code <> ''
       ORDER BY u.created_at DESC`
    );

    const referrals = result.rows.map((row) => {
      let referrer_type = null;
      let referrer_name = null;
      if (row.college_name) {
        referrer_type = "college";
        referrer_name = row.college_name;
      } else if (row.university_name) {
        referrer_type = "university";
        referrer_name = row.university_name;
      }

      return {
        id: row.id,
        name: row.name,
        email: row.email,
        user_type: row.user_type,
        referral_code: row.referral_code,
        created_at: row.created_at,
        referrer_type,
        referrer_name,
      };
    });

    res.json({ referrals });
  } catch (err) {
    console.error("GET REFERRALS ERROR ->", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSignupSummary = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS total FROM users WHERE created_at::date = CURRENT_DATE"
    );
    res.json({ total: result.rows[0]?.total || 0 });
  } catch (err) {
    console.error("GET SIGNUP SUMMARY ERROR ->", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSignups = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, user_type, status, created_at
       FROM users
       WHERE created_at::date = CURRENT_DATE
       ORDER BY created_at DESC`
    );
    res.json({ signups: result.rows });
  } catch (err) {
    console.error("GET SIGNUPS ERROR ->", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getJobsSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER (WHERE status = 'published')::int AS active
       FROM company_jobs`
    );

    res.json({
      total: result.rows[0]?.total || 0,
      active: result.rows[0]?.active || 0,
    });
  } catch (err) {
    console.error("GET JOBS SUMMARY ERROR ->", err.message);
    res.status(500).json({ message: "Server error" });
  }
};