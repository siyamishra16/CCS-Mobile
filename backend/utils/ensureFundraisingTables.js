const pool = require("../db");

async function ensureFundraisingTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS fundraising_events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            subtitle VARCHAR(255),
            banner_image_url TEXT,
            status VARCHAR(50) CHECK (status IN ('Upcoming', 'Closed')),
            about_event TEXT,
            eligibility_criteria TEXT,
            guidelines_for_students TEXT,
            selection_process TEXT,
            event_mode VARCHAR(50) DEFAULT 'Offline',
            venue_name VARCHAR(255),
            venue_address TEXT,
            city VARCHAR(100),
            state VARCHAR(100),
            start_date DATE,
            end_date DATE,
            last_apply_date DATE,
            organizing_body_name VARCHAR(255),
            coordinator_name VARCHAR(255),
            coordinator_phone VARCHAR(20),
            coordinator_email VARCHAR(255),
            max_funding_per_student NUMERIC(12,2),
            min_funding_per_student NUMERIC(12,2),
            total_fund_pool NUMERIC(15,2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS fundraising_applications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id UUID NOT NULL REFERENCES fundraising_events(id) ON DELETE CASCADE,
            student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            applicant_full_name VARCHAR(255),
            applicant_email VARCHAR(255),
            applicant_phone VARCHAR(20),
            institution_name VARCHAR(255),
            idea_title VARCHAR(255) NOT NULL,
            application_type VARCHAR(20) CHECK (application_type IN ('Individual', 'Group')),
            group_member_count INTEGER,
            group_member_names TEXT,
            problem_statement TEXT,
            proposed_solution_description TEXT,
            estimated_budget_required NUMERIC(12,2),
            aadhar_front_url TEXT,
            aadhar_back_url TEXT,
            id_card_url TEXT,
            supporting_documents_url TEXT,
            photo_url TEXT,
            application_status VARCHAR(50) DEFAULT 'Pending' CHECK (application_status IN ('Pending', 'Approved', 'Rejected')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(event_id, student_id)
        )
    `);

    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS applicant_full_name VARCHAR(255)");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS applicant_email VARCHAR(255)");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS applicant_phone VARCHAR(20)");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS institution_name VARCHAR(255)");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS idea_description TEXT");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS requested_funding NUMERIC(12,2)");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS application_type VARCHAR(20)");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS group_member_count INTEGER");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS group_member_names TEXT");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS problem_statement TEXT");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS proposed_solution_description TEXT");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS estimated_budget_required NUMERIC(12,2)");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS aadhar_front_url TEXT");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS aadhar_back_url TEXT");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS id_card_url TEXT");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS supporting_documents_url TEXT");
    await pool.query("ALTER TABLE fundraising_applications ADD COLUMN IF NOT EXISTS photo_url TEXT");
    await pool.query("ALTER TABLE fundraising_applications ALTER COLUMN idea_description SET DEFAULT ''");
    await pool.query("ALTER TABLE fundraising_applications ALTER COLUMN requested_funding DROP NOT NULL");
    await pool.query("UPDATE fundraising_applications SET idea_description = COALESCE(idea_description, '') WHERE idea_description IS NULL");
    await pool.query("UPDATE fundraising_applications SET estimated_budget_required = COALESCE(estimated_budget_required, requested_funding) WHERE estimated_budget_required IS NULL");
    await pool.query("UPDATE fundraising_applications SET requested_funding = COALESCE(requested_funding, estimated_budget_required) WHERE requested_funding IS NULL");
    await pool.query("ALTER TABLE fundraising_applications ALTER COLUMN idea_description SET NOT NULL");

    await pool.query("CREATE INDEX IF NOT EXISTS idx_fundraising_events_admin_id ON fundraising_events(admin_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_fundraising_events_status ON fundraising_events(status)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_fundraising_applications_event_id ON fundraising_applications(event_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_fundraising_applications_student_id ON fundraising_applications(student_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_fundraising_applications_status ON fundraising_applications(application_status)");
}

module.exports = ensureFundraisingTables;
