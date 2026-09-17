-- Saarthi — Database Schema
-- Target: MySQL 8.x / MariaDB (XAMPP), per SRS Section 6
-- Run with: mysql -u root saarthi_db < schema.sql

CREATE DATABASE IF NOT EXISTS saarthi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE saarthi_db;

-- ============================================================
-- 6.1 User and Access Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'LOCKED') NOT NULL DEFAULT 'ACTIVE',
    failed_login_count INT NOT NULL DEFAULT 0,
    locked_until TIMESTAMP NULL DEFAULT NULL,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    date_of_birth DATE NULL,
    gender ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    state VARCHAR(50) NULL,
    district VARCHAR(100) NULL,
    annual_income DECIMAL(12,2) NULL,
    occupation VARCHAR(50) NULL,
    category ENUM('GENERAL', 'OBC', 'SC', 'ST', 'EWS') NULL,
    education_level VARCHAR(50) NULL,
    disability_status BOOLEAN NULL,
    is_bpl BOOLEAN NULL,
    is_minority BOOLEAN NULL,
    last_match_snapshot_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_value VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 6.2 Scheme and Eligibility Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS scheme_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(50) NULL,
    display_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS schemes (
    scheme_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    ministry VARCHAR(200) NULL,
    category_id INT NULL,
    state VARCHAR(50) NULL,          -- NULL = Central/nationwide
    benefit_summary TEXT NULL,
    benefit_amount VARCHAR(255) NULL,
    application_url VARCHAR(500) NULL,
    official_portal VARCHAR(500) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deadline DATE NULL,
    source_url VARCHAR(500) NULL,
    verified_at DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_scheme_category FOREIGN KEY (category_id) REFERENCES scheme_categories(category_id) ON DELETE SET NULL,
    INDEX idx_schemes_active (is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS eligibility_rules (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_id INT NOT NULL,
    attribute_name VARCHAR(50) NOT NULL,   -- age, annual_income, gender, category, state, occupation, education_level, disability_status, is_bpl, is_minority
    operator VARCHAR(10) NOT NULL,         -- =, !=, >=, <=, >, <, IN
    value VARCHAR(255) NOT NULL,
    rule_description VARCHAR(255) NULL,
    source_text_snippet VARCHAR(500) NULL,
    CONSTRAINT fk_rule_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    INDEX idx_rules_scheme (scheme_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS required_documents (
    doc_id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_id INT NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    document_category VARCHAR(50) NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_doc_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_scheme_audit (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_id INT NOT NULL,
    changed_field VARCHAR(100) NOT NULL,
    old_value TEXT NULL,
    new_value TEXT NULL,
    changed_by INT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    CONSTRAINT fk_audit_admin FOREIGN KEY (changed_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- 6.3 Matching, Checklist, and Engagement Tables
-- ============================================================

CREATE TABLE IF NOT EXISTS scheme_match_snapshot (
    snapshot_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    scheme_id INT NOT NULL,
    confidence ENUM('STRONG', 'PARTIAL') NOT NULL,
    computed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_snapshot_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_snapshot_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    UNIQUE KEY uq_snapshot (user_id, scheme_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS checklist_item_state (
    state_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    document_name VARCHAR(200) NOT NULL,
    is_checked BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_checklist_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uq_checklist_item (user_id, document_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookmarks (
    bookmark_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    scheme_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookmark_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_bookmark_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    UNIQUE KEY uq_bookmark (user_id, scheme_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    scheme_id INT NULL,
    type ENUM('NEW_MATCH', 'DEADLINE_APPROACHING') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_notif_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS scheme_reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(255) NOT NULL,
    review_text TEXT NOT NULL,
    process_smoothness INT NOT NULL DEFAULT 5 CHECK (process_smoothness >= 1 AND process_smoothness <= 5),
    approval_time_weeks INT NOT NULL DEFAULT 2,
    benefit_received BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_scheme FOREIGN KEY (scheme_id) REFERENCES schemes(scheme_id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_reviews_scheme (scheme_id),
    INDEX idx_reviews_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS review_likes (
    like_id INT PRIMARY KEY AUTO_INCREMENT,
    review_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_like_review FOREIGN KEY (review_id) REFERENCES scheme_reviews(review_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY uq_review_user_like (review_id, user_id)
) ENGINE=InnoDB;

-- ============================================================
-- 6.4 Chatbot Tables (Module 8 — schema-ready; feature deferred)
-- ============================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    message_count_today INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_chatsession_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS chat_history (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    sender ENUM('USER', 'BOT') NOT NULL,
    message TEXT NOT NULL,
    context_scheme_ids VARCHAR(500) NULL,
    flagged_unverified_mentions VARCHAR(500) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chathistory_session FOREIGN KEY (session_id) REFERENCES chat_sessions(session_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Database-Level Automation: Functions, Triggers & Stored Procedures
-- Per SRS Section 11 — SCOPE BOUNDARY: these handle only data integrity,
-- derived values, and audit-trail automation. NO eligibility-matching
-- business logic lives here — that stays in Java (EligibilityService).
-- ============================================================

DELIMITER $$

-- ---- Functions --------------------------------------------------------

-- fn_calculate_age: read-time convenience only (e.g. admin reports).
-- The matching engine computes age in Java from date_of_birth directly,
-- never via this function, so there is a single source of truth for
-- age-based rule evaluation.
DROP FUNCTION IF EXISTS fn_calculate_age$$
CREATE FUNCTION fn_calculate_age(p_dob DATE)
RETURNS INT
NO SQL
BEGIN
    IF p_dob IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN TIMESTAMPDIFF(YEAR, p_dob, CURDATE());
END$$

-- fn_days_until_deadline: query-time convenience for deadline-proximity
-- checks (FR10.2). The <=15-day threshold decision itself is made in Java.
DROP FUNCTION IF EXISTS fn_days_until_deadline$$
CREATE FUNCTION fn_days_until_deadline(p_deadline DATE)
RETURNS INT
NO SQL
BEGIN
    IF p_deadline IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN DATEDIFF(p_deadline, CURDATE());
END$$

-- ---- Triggers -----------------------------------------------------------

-- trg_users_before_update: keeps updated_at current. Redundant with the
-- column's own "ON UPDATE CURRENT_TIMESTAMP" clause, kept for parity with
-- the SRS spec and as a safe no-op if that clause is ever removed.
DROP TRIGGER IF EXISTS trg_users_before_update$$
CREATE TRIGGER trg_users_before_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

-- trg_user_profiles_before_update: this timestamp change is what
-- ProfileService checks to decide whether a re-match run (FR2.4) is due.
DROP TRIGGER IF EXISTS trg_user_profiles_before_update$$
CREATE TRIGGER trg_user_profiles_before_update
BEFORE UPDATE ON user_profiles
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END$$

-- trg_schemes_audit_on_update: for each tracked field that actually
-- changed, insert one admin_scheme_audit row. changed_by comes from the
-- @audit_actor_id session variable set by sp_set_audit_actor at the start
-- of an Admin request's transaction (the DB layer has no knowledge of the
-- authenticated user otherwise).
DROP TRIGGER IF EXISTS trg_schemes_audit_on_update$$
CREATE TRIGGER trg_schemes_audit_on_update
AFTER UPDATE ON schemes
FOR EACH ROW
BEGIN
    IF NOT (OLD.name <=> NEW.name) THEN
        INSERT INTO admin_scheme_audit (scheme_id, changed_field, old_value, new_value, changed_by)
        VALUES (NEW.scheme_id, 'name', OLD.name, NEW.name, @audit_actor_id);
    END IF;
    IF NOT (OLD.benefit_summary <=> NEW.benefit_summary) THEN
        INSERT INTO admin_scheme_audit (scheme_id, changed_field, old_value, new_value, changed_by)
        VALUES (NEW.scheme_id, 'benefit_summary', OLD.benefit_summary, NEW.benefit_summary, @audit_actor_id);
    END IF;
    IF NOT (OLD.is_active <=> NEW.is_active) THEN
        INSERT INTO admin_scheme_audit (scheme_id, changed_field, old_value, new_value, changed_by)
        VALUES (NEW.scheme_id, 'is_active', OLD.is_active, NEW.is_active, @audit_actor_id);
    END IF;
    IF NOT (OLD.deadline <=> NEW.deadline) THEN
        INSERT INTO admin_scheme_audit (scheme_id, changed_field, old_value, new_value, changed_by)
        VALUES (NEW.scheme_id, 'deadline', OLD.deadline, NEW.deadline, @audit_actor_id);
    END IF;
    IF NOT (OLD.verified_at <=> NEW.verified_at) THEN
        INSERT INTO admin_scheme_audit (scheme_id, changed_field, old_value, new_value, changed_by)
        VALUES (NEW.scheme_id, 'verified_at', OLD.verified_at, NEW.verified_at, @audit_actor_id);
    END IF;
END$$

-- trg_bookmarks_prevent_orphan: defensive second line of defense behind
-- the Service-layer check (FR7.1 preconditions) — a bookmark may not be
-- created against an inactive scheme.
DROP TRIGGER IF EXISTS trg_bookmarks_prevent_orphan$$
CREATE TRIGGER trg_bookmarks_prevent_orphan
BEFORE INSERT ON bookmarks
FOR EACH ROW
BEGIN
    DECLARE v_active BOOLEAN;
    SELECT is_active INTO v_active FROM schemes WHERE scheme_id = NEW.scheme_id;
    IF v_active IS NULL OR v_active = FALSE THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot bookmark an inactive or non-existent scheme';
    END IF;
END$$

-- ---- Stored Procedures ---------------------------------------------------

-- sp_set_audit_actor: called from AdminService immediately after opening
-- the connection for an Admin request, so trg_schemes_audit_on_update can
-- populate admin_scheme_audit.changed_by.
DROP PROCEDURE IF EXISTS sp_set_audit_actor$$
CREATE PROCEDURE sp_set_audit_actor(IN p_actor_user_id INT)
BEGIN
    SET @audit_actor_id = p_actor_user_id;
END$$

-- sp_prune_expired_reset_tokens: invoked periodically (e.g. a scheduled
-- Admin maintenance action) — not a DB-native event scheduler, so "when
-- this runs" stays visible in application code.
DROP PROCEDURE IF EXISTS sp_prune_expired_reset_tokens$$
CREATE PROCEDURE sp_prune_expired_reset_tokens()
BEGIN
    DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP;
END$$

-- sp_get_dashboard_summary_counts: one round trip for the Dashboard's
-- summary header instead of four separate DAO calls. Pure aggregation of
-- data already computed/stored by the Java matching engine — not a
-- re-implementation of any matching logic.
DROP PROCEDURE IF EXISTS sp_get_dashboard_summary_counts$$
CREATE PROCEDURE sp_get_dashboard_summary_counts(IN p_user_id INT)
BEGIN
    SELECT
        (SELECT COUNT(*) FROM scheme_match_snapshot WHERE user_id = p_user_id AND confidence = 'STRONG') AS strong_match_count,
        (SELECT COUNT(*) FROM scheme_match_snapshot WHERE user_id = p_user_id AND confidence = 'PARTIAL') AS partial_match_count,
        (SELECT COUNT(*) FROM bookmarks WHERE user_id = p_user_id) AS bookmark_count,
        (SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND is_read = FALSE) AS unread_notification_count;
END$$

DELIMITER ;

-- ============================================================

-- ============================================================
-- Core Scheme, Eligibility, and Document Master Data
-- ============================================================

LOCK TABLES `scheme_categories` WRITE;
/*!40000 ALTER TABLE `scheme_categories` DISABLE KEYS */;
INSERT IGNORE INTO `scheme_categories` (`category_id`, `category_name`, `icon_name`, `display_order`) VALUES (1,'Education','graduation-cap',1),(2,'Healthcare','heart-pulse',2),(3,'Housing','home',3),(4,'Financial Aid','rupee',4),(5,'Agriculture','wheat',5),(6,'Employment','briefcase',6);
/*!40000 ALTER TABLE `scheme_categories` ENABLE KEYS */;
UNLOCK TABLES;
LOCK TABLES `schemes` WRITE;
/*!40000 ALTER TABLE `schemes` DISABLE KEYS */;
INSERT IGNORE INTO `schemes` (`scheme_id`, `name`, `description`, `ministry`, `category_id`, `state`, `benefit_summary`, `benefit_amount`, `application_url`, `official_portal`, `is_active`, `deadline`, `source_url`, `verified_at`, `created_at`, `updated_at`) VALUES (1,'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)','Income support to landholding farmer families','Ministry of Agriculture and Farmers Welfare',5,NULL,'Income support to landholding farmer families','₹6,000 per year in three equal installments of ₹2,000','https://pmkisan.gov.in/','https://pmkisan.gov.in/',1,'2026-09-29','https://pmkisan.gov.in/','2026-09-14','2026-09-14 17:40:02','2026-09-16 21:26:09'),(2,'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)','Cashless health insurance cover for poor and vulnerable families for secondary and tertiary care','Ministry of Health and Family Welfare / National Health Authority',2,NULL,'Cashless health insurance cover for poor and vulnerable families for secondary and tertiary care','Up to ₹5,00,000 per family per year (cashless)','https://mera.pmjay.gov.in/','https://nha.gov.in/PM-JAY',1,NULL,'https://www.nha.gov.in/PM-JAY','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(3,'Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)','Central assistance for pucca house construction/purchase for urban poor and middle-income households','Ministry of Housing and Urban Affairs',3,NULL,'Central assistance for pucca house construction/purchase for urban poor and middle-income households','Interest subsidy / central assistance; EWS houses up to 30 sq.mt. carpet area','https://pmay-urban.gov.in/','https://pmay-urban.gov.in/',1,NULL,'https://pmay-urban.gov.in/','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(4,'Post-Matric Scholarship for SC Students','Financial assistance (maintenance allowance + fee reimbursement) for SC students studying Class 11 and above','Ministry of Social Justice and Empowerment',1,NULL,'Financial assistance (maintenance allowance + fee reimbursement) for SC students studying Class 11 and above','Maintenance allowance and course fee reimbursement (amount varies by course/state)','https://scholarships.gov.in/','https://scholarships.gov.in/',1,NULL,'https://scholarships.gov.in/public/schemeGuidelines/DEPDFAQ.pdf','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(5,'Pre-Matric Scholarship for Minorities','Financial assistance for minority community students studying in Classes 1 to 10','Ministry of Minority Affairs',1,NULL,'Financial assistance for minority community students studying in Classes 1 to 10','Scholarship amount varies (day scholar/hosteller rates)','https://scholarships.gov.in/','https://scholarships.gov.in/',1,NULL,'https://www.buddy4study.com/article/pre-matric-scholarship-for-minorities','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(6,'Prime Minister\'s Employment Generation Programme (PMEGP)','Credit-linked subsidy for setting up new micro-enterprises to generate self-employment','Ministry of Micro, Small and Medium Enterprises',6,NULL,'Credit-linked subsidy for setting up new micro-enterprises to generate self-employment','Subsidy of 15%-35% of project cost (up to ₹50 lakh manufacturing / ₹20 lakh service)','https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp','https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',1,'2026-09-28','https://www.cashfree.com/blog/pmegp-scheme-subsidy-rates-eligibility-how-to-apply/','2026-09-14','2026-09-14 17:40:02','2026-09-16 21:26:09'),(7,'Sukanya Samriddhi Yojana','Small savings scheme for the welfare of a girl child, opened by parent/guardian','Ministry of Finance / Department of Posts',4,NULL,'Small savings scheme for the welfare of a girl child, opened by parent/guardian','8.2% interest (Q2 FY2026-27); deposits ₹250 to ₹1.5 lakh/year; matures 21 years from opening','https://www.nsiindia.gov.in/','https://www.nsiindia.gov.in/',1,NULL,'https://cleartax.in/s/sukanya-samriddhi-yojana','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(8,'Atal Pension Yojana','Guaranteed minimum pension scheme for unorganised sector workers','Ministry of Finance / PFRDA',4,NULL,'Guaranteed minimum pension scheme for unorganised sector workers','Guaranteed monthly pension of ₹1,000 to ₹5,000 after age 60','https://npscra.nsdl.co.in/scheme-details.php','https://npscra.nsdl.co.in/scheme-details.php',1,NULL,'https://cleartax.in/s/atal-pension-yojna','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(9,'Pradhan Mantri Ujjwala Yojana (PMUY 2.0)','Free LPG gas connection with first refill and stove to women from poor households','Ministry of Petroleum and Natural Gas',4,NULL,'Free LPG gas connection with first refill and stove to women from poor households','Free LPG connection + free first refill + free stove + subsidy on next 12 refills','https://www.pmuy.gov.in/','https://www.pmuy.gov.in/',1,NULL,'https://mylpg.org/ujwala-yojna/pm-ujjwala-yojana-2026/','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(10,'Stand-Up India','Bank loans for greenfield enterprises set up by SC/ST and women entrepreneurs','Department of Financial Services, Ministry of Finance',6,NULL,'Bank loans for greenfield enterprises set up by SC/ST and women entrepreneurs','Loan amount between ₹10 lakh and ₹1 crore','https://www.standupmitra.in/','https://www.standupmitra.in/',1,NULL,'https://www.standupmitra.in/Home/SUISchemes','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(11,'Pradhan Mantri MUDRA Yojana (PMMY)','Collateral-free micro-credit for non-farm income-generating enterprises','Ministry of Finance',6,NULL,'Collateral-free micro-credit for non-farm income-generating enterprises','Loans up to ₹20 lakh across Shishu/Kishor/Tarun/Tarun Plus categories','https://www.mudra.org.in/','https://www.mudra.org.in/',1,NULL,'https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=2069170&reg=3&lang=2','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(12,'Pradhan Mantri Matru Vandana Yojana (PMMVY)','Cash maternity benefit for pregnant women and lactating mothers for their first living child','Ministry of Women and Child Development',2,NULL,'Cash maternity benefit for pregnant women and lactating mothers for their first living child','₹5,000 in two installments (₹3,000 after ANC registration, ₹2,000 after childbirth and immunization)','https://pmmvy.wcd.gov.in/','https://pmmvy.wcd.gov.in/',1,NULL,'https://www.spniwcd.wcd.gov.in/pradhan-mantri-matru-vandana-yojna/faqs','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(13,'Pradhan Mantri Fasal Bima Yojana (PMFBY)','Crop insurance scheme covering losses from natural calamities, pests and diseases','Ministry of Agriculture and Farmers Welfare',5,NULL,'Crop insurance scheme covering losses from natural calamities, pests and diseases','Farmer premium capped at 2% (Kharif), 1.5% (Rabi), 5% (commercial/horticultural crops); balance subsidized','https://pmfby.gov.in/','https://pmfby.gov.in/',1,NULL,'https://pmfby.gov.in/','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(14,'e-Shram Registration','National database and Universal Account Number (UAN) card for unorganised sector workers, with accident insurance','Ministry of Labour and Employment',6,NULL,'National database and Universal Account Number (UAN) card for unorganised sector workers, with accident insurance','₹2 lakh accidental insurance cover under PMSBY linked to e-Shram card','https://eshram.gov.in/','https://eshram.gov.in/',1,NULL,'https://eshram.gov.in/faqs','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(15,'PM Street Vendor\'s AtmaNirbhar Nidhi (PM SVANidhi)','Collateral-free working capital loans for urban street vendors','Ministry of Housing and Urban Affairs',6,NULL,'Collateral-free working capital loans for urban street vendors','Loans of ₹10,000 (1st), ₹20,000 (2nd), ₹50,000 (3rd tranche) with 7% interest subsidy','https://pmsvanidhi.mohua.gov.in/','https://pmsvanidhi.mohua.gov.in/',1,NULL,'https://pmsvanidhi.mohua.gov.in/Home/Schemes','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(16,'National Means-cum-Merit Scholarship (NMMS)','Scholarship to meritorious students of economically weaker sections to prevent dropout at Class 9','Department of School Education and Literacy, Ministry of Education',1,NULL,'Scholarship to meritorious students of economically weaker sections to prevent dropout at Class 9','₹12,000 per year (₹1,000/month) from Class 9 to Class 12','https://scholarships.gov.in/','https://dsel.education.gov.in/scheme/nmmss',1,NULL,'https://dsel.education.gov.in/scheme/nmmss','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(17,'Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY)','Cashless health insurance cover for economically weaker families in Maharashtra','Public Health Department, Government of Maharashtra',2,'Maharashtra','Cashless health insurance cover for economically weaker families in Maharashtra','₹1.5 lakh per family per year (up to ₹2.5 lakh for renal transplant); ₹5 lakh for Category A-C government scheme beneficiaries','https://www.jeevandayee.gov.in/','https://www.jeevandayee.gov.in/',1,NULL,'https://www.adityabirlacapital.com/abc-of-money/mahatma-jyotiba-phule-jan-arogya-yojana','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(18,'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulk Shishyavrutti Yojana (EBC Scholarship)','Tuition fee reimbursement for economically backward general category students in professional/technical courses','Higher and Technical Education Department, Government of Maharashtra',1,'Maharashtra','Tuition fee reimbursement for economically backward general category students in professional/technical courses','Full tuition fee reimbursement for eligible diploma/degree/postgraduate professional courses','https://mahadbt.maharashtra.gov.in/','https://mahadbt.maharashtra.gov.in/',1,'2026-09-25','https://mahadbt.maharashtra.gov.in/SchemeData/SchemeData?str=E9DDFA703C38E51A2D3C3A162F4DE21D','2026-09-14','2026-09-14 17:40:02','2026-09-16 21:26:09'),(19,'Ramai Awas Yojana','Housing assistance for Scheduled Caste and Neo-Buddhist families to construct permanent homes','Social Justice and Special Assistance Department, Government of Maharashtra',3,'Maharashtra','Housing assistance for Scheduled Caste and Neo-Buddhist families to construct permanent homes','₹1.32 lakh (rural), ₹1.42 lakh (hilly/Naxal-affected), ₹2.50 lakh (urban) + ₹12,000 for toilet','https://sjsa.maharashtra.gov.in/','https://sjsa.maharashtra.gov.in/en/scheme/ramai-awas-yojana-rural-urban/',1,NULL,'https://sjsa.maharashtra.gov.in/en/scheme/ramai-awas-yojana-rural-urban/','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(20,'Central Sector Scheme of Scholarship for College and University Students','₹12,000/year for the first 3 years of UG courses and ₹20,000/year for the 4th/5th professional years and PG, for meritorious students from the top 20 percentile of Class 12 boards','Department of Higher Education, Ministry of Education',1,NULL,'₹12,000/year for the first 3 years of UG courses and ₹20,000/year for the 4th/5th professional years and PG, for meritorious students from the top 20 percentile of Class 12 boards','₹12,000-₹20,000 per annum','https://scholarships.gov.in','https://www.education.gov.in/en/central-sector-scheme-scholarship-college-and-university-students',1,NULL,'https://www.education.gov.in/en/central-sector-scheme-scholarship-college-and-university-students','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(21,'PM YASASVI Scholarship','Scholarship of up to ₹1,25,000 per annum for OBC/EBC/DNT students studying in Class 9 or Class 11 at government, government-aided, or private schools','Ministry of Social Justice and Empowerment',1,NULL,'Scholarship of up to ₹1,25,000 per annum for OBC/EBC/DNT students studying in Class 9 or Class 11 at government, government-aided, or private schools','Up to ₹1,25,000 per annum','https://www.myscheme.gov.in/schemes/pm-yasasvitcseobcebcdnts','https://www.myscheme.gov.in/schemes/pm-yasasvitcseobcebcdnts',1,NULL,'https://www.myscheme.gov.in/schemes/pm-yasasvitcseobcebcdnts','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(22,'AICTE Pragati Scholarship for Girls','₹50,000 per annum for girl students admitted to the first year of diploma/degree technical courses at AICTE-approved institutions (up to two girls per family)','All India Council for Technical Education (AICTE), Ministry of Education',1,NULL,'₹50,000 per annum for girl students admitted to the first year of diploma/degree technical courses at AICTE-approved institutions (up to two girls per family)','₹50,000 per annum (max 3 years degree / 2 years diploma lateral entry)','https://scholarships.gov.in','https://www.aicte-india.org/schemes/students-development-schemes/Pragati/General-Instructions',1,'2026-10-01','https://www.aicte-india.org/schemes/students-development-schemes/Pragati/General-Instructions','2026-09-14','2026-09-14 17:40:02','2026-09-16 21:26:09'),(23,'AICTE Saksham Scholarship for Specially Abled Students','₹50,000 per annum for specially-abled students (minimum 40% disability) pursuing diploma/degree technical education at AICTE-approved institutions','All India Council for Technical Education (AICTE), Ministry of Education',1,NULL,'₹50,000 per annum for specially-abled students (minimum 40% disability) pursuing diploma/degree technical education at AICTE-approved institutions','₹50,000 per annum','https://scholarships.gov.in','https://www.aicte-india.org/schemes/students-development-schemes/Saksham/General-Instructions',1,NULL,'https://www.aicte-india.org/schemes/students-development-schemes/Saksham/General-Instructions','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(24,'Top Class Education Scheme for SC Students','Full tuition fee reimbursement (ceiling ₹2 lakh/year in private institutions) plus academic allowance of ₹86,000 in the first year and ₹41,000 in subsequent years, for SC students admitted to notified premier institutions (IITs, IIMs, NITs, AIIMS, etc.)','Department of Social Justice and Empowerment, Ministry of Social Justice & Empowerment',1,NULL,'Full tuition fee reimbursement (ceiling ₹2 lakh/year in private institutions) plus academic allowance of ₹86,000 in the first year and ₹41,000 in subsequent years, for SC students admitted to notified premier institutions (IITs, IIMs, NITs, AIIMS, etc.)','Up to ₹2 lakh/year tuition + ₹86,000/₹41,000 academic allowance','https://scholarships.gov.in','https://socialjustice.gov.in/schemes/27',1,NULL,'https://socialjustice.gov.in/schemes/27','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(25,'National Fellowship for OBC Students','Junior Research Fellowship for unemployed OBC candidates pursuing full-time M.Phil./Ph.D. programmes, approximately 1000 fellowships per year','Department of Social Justice and Empowerment',1,NULL,'Junior Research Fellowship for unemployed OBC candidates pursuing full-time M.Phil./Ph.D. programmes, approximately 1000 fellowships per year','Fellowship per UGC NET-JRF norms','https://scholarships.gov.in','https://www.myscheme.gov.in/schemes/nfos',1,NULL,'https://socialjustice.gov.in/schemes/7','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(26,'Post-Matric Scholarship for Minorities','Scholarship for minority community (Muslim, Sikh, Christian, Buddhist, Parsi) students studying Class 11 onwards, covering admission/tuition fees and maintenance allowance','Ministry of Minority Affairs',1,NULL,'Scholarship for minority community (Muslim, Sikh, Christian, Buddhist, Parsi) students studying Class 11 onwards, covering admission/tuition fees and maintenance allowance','Course fee reimbursement + maintenance allowance','https://scholarships.gov.in','https://www.minorityaffairs.gov.in/show_content.php?lang=1&level=2&ls_id=163&lid=165',1,NULL,'https://www.minorityaffairs.gov.in/show_content.php?lang=1&level=2&ls_id=163&lid=165','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(27,'PM Vishwakarma Yojana','₹15,000 toolkit grant, skill training with ₹500/day stipend, and collateral-free loans up to ₹3 lakh at 5% concessional interest for traditional artisans and craftspeople across 18 trades','Ministry of Micro Small and Medium Enterprises',6,NULL,'₹15,000 toolkit grant, skill training with ₹500/day stipend, and collateral-free loans up to ₹3 lakh at 5% concessional interest for traditional artisans and craftspeople across 18 trades','₹15,000 toolkit grant + up to ₹3 lakh collateral-free loan','https://pmvishwakarma.gov.in','https://pmvishwakarma.gov.in',1,NULL,'https://pmvishwakarma.gov.in','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(28,'Deendayal Antyodaya Yojana - National Urban Livelihoods Mission (DAY-NULM)','Interest-subsidised loans up to ₹2 lakh (individual) or ₹10 lakh (group/SHG) for urban poor to set up micro-enterprises, plus skill training, placement support, and shelter for the urban homeless','Ministry of Housing and Urban Affairs',6,NULL,'Interest-subsidised loans up to ₹2 lakh (individual) or ₹10 lakh (group/SHG) for urban poor to set up micro-enterprises, plus skill training, placement support, and shelter for the urban homeless','Loan up to ₹2 lakh (individual) / ₹10 lakh (group) with interest subvention','https://mohua.gov.in','https://mohua.gov.in',1,NULL,'https://mohua.gov.in','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(29,'PM Kaushal Vikas Yojana (PMKVY 4.0)','Free industry-oriented short-term skill training, certification, and placement assistance for youth, with a monetary reward on successful certification','Ministry of Skill Development and Entrepreneurship',6,NULL,'Free industry-oriented short-term skill training, certification, and placement assistance for youth, with a monetary reward on successful certification','Free training + certification reward','https://www.pmkvyofficial.org','https://www.pmkvyofficial.org',1,NULL,'https://www.pmkvyofficial.org','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(30,'National Career Service (NCS) registration','Free online job portal offering job matching, career counselling at Model Career Centres, skill-training referrals, and job fair access to job seekers nationwide','Ministry of Labour and Employment',6,NULL,'Free online job portal offering job matching, career counselling at Model Career Centres, skill-training referrals, and job fair access to job seekers nationwide','Free service (no direct monetary benefit)','https://www.ncs.gov.in','https://www.ncs.gov.in',1,NULL,'https://www.ncs.gov.in/pages/about-us.aspx','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(31,'Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)','Legal guarantee of 100 days of wage employment per financial year to every rural household whose adult members volunteer for unskilled manual work','Ministry of Rural Development',6,NULL,'Legal guarantee of 100 days of wage employment per financial year to every rural household whose adult members volunteer for unskilled manual work','State-notified minimum wage for up to 100 days/year per household','https://nrega.nic.in','https://nrega.nic.in',1,NULL,'https://nrega.nic.in','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(32,'Startup India Seed Fund Scheme','Seed funding of up to ₹20 lakh as a grant for proof-of-concept/prototype development and up to ₹50 lakh via convertible debentures or debt instruments for market entry, for DPIIT-recognised early-stage startups','Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry',6,NULL,'Seed funding of up to ₹20 lakh as a grant for proof-of-concept/prototype development and up to ₹50 lakh via convertible debentures or debt instruments for market entry, for DPIIT-recognised early-stage startups','Up to ₹20 lakh grant + up to ₹50 lakh debt/convertible debentures','https://seedfund.startupindia.gov.in','https://seedfund.startupindia.gov.in/about',1,NULL,'https://seedfund.startupindia.gov.in/about','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(33,'Pradhan Mantri Suraksha Bima Yojana (PMSBY)','Accidental death and disability insurance cover for bank/post office account holders aged 18-70, renewable annually at a low premium','Department of Financial Services, Ministry of Finance',4,NULL,'Accidental death and disability insurance cover for bank/post office account holders aged 18-70, renewable annually at a low premium','Rs 2 lakh for accidental death or permanent total disability; Rs 1 lakh for permanent partial disability; annual premium Rs 20','https://www.jansuraksha.gov.in','https://www.jansuraksha.gov.in',1,NULL,'https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1922622&reg=48&lang=2','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(34,'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)','Renewable one-year term life insurance cover for bank/post office account holders aged 18-50, covering death from any cause','Department of Financial Services, Ministry of Finance',4,NULL,'Renewable one-year term life insurance cover for bank/post office account holders aged 18-50, covering death from any cause','Rs 2 lakh life cover on death of the insured due to any cause; annual premium Rs 330','https://www.jansuraksha.gov.in','https://www.jansuraksha.gov.in',1,NULL,'https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1922622&reg=48&lang=2','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(35,'Janani Suraksha Yojana (JSY)','Cash assistance to pregnant women for institutional delivery to reduce maternal and infant mortality; amount varies by state performance category (LPS/HPS) and rural/urban residence','Ministry of Health and Family Welfare (National Health Mission)',2,NULL,'Cash assistance to pregnant women for institutional delivery to reduce maternal and infant mortality; amount varies by state performance category (LPS/HPS) and rural/urban residence','Rs 1400 (LPS rural), Rs 1000 (LPS urban), Rs 700 (HPS rural), Rs 600 (HPS urban), plus ASHA facilitation incentive','https://nhm.gov.in','https://nhm.gov.in/index1.php?lang=1&level=3&lid=309&sublinkid=841',1,NULL,'https://nhm.gov.in/WriteReadData/l892s/97827133331523438951.pdf','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(36,'Pradhan Mantri Kisan Maandhan Yojana (PM-KMY)','Voluntary and contributory pension scheme for small and marginal farmers, providing an assured minimum pension after age 60','Ministry of Agriculture and Farmers Welfare',4,NULL,'Voluntary and contributory pension scheme for small and marginal farmers, providing an assured minimum pension after age 60','Rs 3000/month pension after age 60; 50% family pension to spouse on death of farmer; monthly contribution Rs 55-200 matched by Government','https://maandhan.in/scheme/pmkmy','https://maandhan.in',1,NULL,'https://pmkisan.gov.in/Documents/PM-KMY%20-%20Salient%20Features.pdf','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(37,'PM Krishi Sinchayee Yojana - Per Drop More Crop (PMKSY-PDMC)','Financial assistance for installation of micro-irrigation (drip and sprinkler) systems to improve water use efficiency at farm level','Ministry of Agriculture and Farmers Welfare (in coordination with Ministry of Jal Shakti)',5,NULL,'Financial assistance for installation of micro-irrigation (drip and sprinkler) systems to improve water use efficiency at farm level','55% subsidy for small and marginal farmers, 45% subsidy for other farmers on micro-irrigation installation cost','https://pmksy.gov.in','https://pmksy.gov.in',1,NULL,'https://www.pib.gov.in/PressReleaseIframePage.aspx?PRID=1985487&reg=48&lang=2','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(38,'Soil Health Card Scheme','Free soil testing with crop-wise nutrient and fertilizer recommendations issued to land-holding farmers periodically to improve productivity','Ministry of Agriculture and Farmers Welfare',5,NULL,'Free soil testing with crop-wise nutrient and fertilizer recommendations issued to land-holding farmers periodically to improve productivity','Free of cost soil testing and advisory card, reissued approximately every 2-3 years','https://soilhealth.dac.gov.in','https://soilhealth.dac.gov.in',1,NULL,'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2104403&reg=48&lang=2','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(39,'Kisan Credit Card (KCC) Scheme','Single-window short-term credit facility for crop cultivation and allied agricultural needs (dairy, poultry, fisheries, animal husbandry) at subsidised interest rate via a RuPay-enabled card','Ministry of Agriculture and Farmers Welfare / Department of Financial Services',5,NULL,'Single-window short-term credit facility for crop cultivation and allied agricultural needs (dairy, poultry, fisheries, animal husbandry) at subsidised interest rate via a RuPay-enabled card','Loan limit up to Rs 5 lakh eligible for interest subvention (effective 4% on timely repayment); collateral-free lending up to Rs 2 lakh','https://www.myscheme.gov.in/schemes/kcc','https://www.myscheme.gov.in/schemes/kcc',1,NULL,'https://www.pib.gov.in/PressReleasePage.aspx?PRID=1808328&reg=3&lang=2','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(40,'Paramparagat Krishi Vikas Yojana (PKVY)','Cluster-based support for farmers to adopt organic farming, covering inputs, certification, processing and marketing end-to-end','Ministry of Agriculture and Farmers Welfare',5,NULL,'Cluster-based support for farmers to adopt organic farming, covering inputs, certification, processing and marketing end-to-end','Rs 31500/hectare over 3 years per organic cluster, of which Rs 15000/hectare is direct DBT to farmers for inputs','https://pgsindia-ncof.gov.in','https://pgsindia-ncof.gov.in',1,NULL,'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2099756','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(41,'National Livestock Mission','Capital subsidy support for entrepreneurship development in rural poultry, sheep/goat breeding, piggery breeding, and feed/fodder production for individuals, FPOs, SHGs, JLGs and Section 8 companies','Ministry of Fisheries, Animal Husbandry and Dairying (Department of Animal Husbandry and Dairying)',5,NULL,'Capital subsidy support for entrepreneurship development in rural poultry, sheep/goat breeding, piggery breeding, and feed/fodder production for individuals, FPOs, SHGs, JLGs and Section 8 companies','50% capital subsidy: up to Rs 25 lakh (rural poultry), Rs 50 lakh (sheep/goat breeding farm), Rs 30 lakh (piggery breeding farm)','https://nlm.udyamimitra.in','https://dahd.gov.in/schemes/programmes/national_livestock_mission',1,NULL,'https://dahd.gov.in/sites/default/files/2023-11/NLMGuidelinesFinalApprovedByEC.pdf','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(42,'Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)','Quality generic medicines and surgical items sold at affordable prices to the public through dedicated Jan Aushadhi Kendras across the country','Department of Pharmaceuticals, Ministry of Chemicals and Fertilizers',2,NULL,'Quality generic medicines and surgical items sold at affordable prices to the public through dedicated Jan Aushadhi Kendras across the country','Medicines priced 50-90% below branded market price; over 19500 Jan Aushadhi Kendras operational nationwide','https://janaushadhi.gov.in','https://janaushadhi.gov.in',1,NULL,'https://janaushadhi.gov.in/pmjy.aspx','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(43,'Nikshay Poshan Yojana','Monthly nutritional support cash transfer to all notified tuberculosis patients for the duration of their treatment under the National TB Elimination Programme','Ministry of Health and Family Welfare (Central TB Division)',2,NULL,'Monthly nutritional support cash transfer to all notified tuberculosis patients for the duration of their treatment under the National TB Elimination Programme','Rs 1000 per month per notified TB patient, disbursed via DBT to Aadhaar-linked bank account','https://nikshay.in','https://tbcindia.mohfw.gov.in',1,NULL,'https://tbcindia.mohfw.gov.in/wp-content/uploads/2023/05/6851513623Nutrition-support-DBT-Scheme-details.pdf','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(44,'Rashtriya Arogya Nidhi (RAN)','Financial assistance to patients from Below Poverty Line families suffering from major life-threatening diseases (heart, kidney, liver, cancer, etc.) for treatment at government super-specialty hospitals','Ministry of Health and Family Welfare',2,NULL,'Financial assistance to patients from Below Poverty Line families suffering from major life-threatening diseases (heart, kidney, liver, cancer, etc.) for treatment at government super-specialty hospitals','Financial assistance up to Rs 15 lakh (up to Rs 20 lakh for rare diseases)','https://mohfw.gov.in','https://mohfw.gov.in',1,NULL,'https://mohfw.gov.in/sites/default/files/7845192051425018860%20(1).pdf','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(45,'Pradhan Mantri Jan Dhan Yojana','Zero-balance basic savings bank deposit account with RuPay debit card, accident insurance cover, and overdraft facility for financial inclusion','Department of Financial Services, Ministry of Finance',4,NULL,'Zero-balance basic savings bank deposit account with RuPay debit card, accident insurance cover, and overdraft facility for financial inclusion','Accident insurance cover of Rs. 2 lakh (Rs. 1 lakh for accounts opened before 28.8.2018); overdraft facility up to Rs. 10,000','https://pmjdy.gov.in/','https://pmjdy.gov.in/',1,NULL,'https://pmjdy.gov.in/scheme','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(46,'National Pension System','Voluntary defined-contribution pension account offering market-linked returns and tax benefits for retirement savings','Department of Financial Services, Ministry of Finance (PFRDA)',4,NULL,'Voluntary defined-contribution pension account offering market-linked returns and tax benefits for retirement savings','Market-linked returns; tax deduction up to Rs. 2 lakh under Section 80CCD','https://enps.nsdl.com/','https://financialservices.gov.in/national-pension-system',1,NULL,'https://financialservices.gov.in/national-pension-system','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(47,'Pradhan Mantri Garib Kalyan Anna Yojana','Free additional foodgrains to NFSA ration card holders under Antyodaya Anna Yojana (AAY) and Priority Household (PHH) categories','Department of Food and Public Distribution, Ministry of Consumer Affairs, Food and Public Distribution',4,NULL,'Free additional foodgrains to NFSA ration card holders under Antyodaya Anna Yojana (AAY) and Priority Household (PHH) categories','5 kg foodgrain per person per month, free of cost','https://dfpd.gov.in/pradhan-mantri-garib-kalyan-anna-yojana/en','https://dfpd.gov.in/pradhan-mantri-garib-kalyan-anna-yojana/en',1,NULL,'https://dfpd.gov.in/pradhan-mantri-garib-kalyan-anna-yojana/en','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(48,'One Nation One Ration Card','Portability of NFSA ration card foodgrain entitlement, allowing beneficiaries to draw rations from any Fair Price Shop in India via Aadhaar/biometric authentication','Department of Food and Public Distribution, Ministry of Consumer Affairs, Food and Public Distribution',4,NULL,'Portability of NFSA ration card foodgrain entitlement, allowing beneficiaries to draw rations from any Fair Price Shop in India via Aadhaar/biometric authentication','As per existing ration card entitlement (AAY/PHH quota)','https://mahafood.gov.in/en/scheme/one-nation-one-ration-card/','https://mahafood.gov.in/en/scheme/one-nation-one-ration-card/',1,NULL,'https://mahafood.gov.in/en/scheme/one-nation-one-ration-card/','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(49,'Sanjay Gandhi Niradhar Anudan Yojana','Monthly financial assistance (pension) to destitute persons, orphans, disabled individuals, and other vulnerable categories without means of support','Social Justice & Special Assistance Department, Government of Maharashtra',4,'Maharashtra','Monthly financial assistance (pension) to destitute persons, orphans, disabled individuals, and other vulnerable categories without means of support','Rs. 1,500 per month','https://sas.mahait.org/','https://sjsa.maharashtra.gov.in/en/scheme/sanjay-gandhi-niradhar-anudan-yojana/',1,NULL,'https://sjsa.maharashtra.gov.in/en/scheme/sanjay-gandhi-niradhar-anudan-yojana/','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(50,'Manodhairya Yojana','Financial assistance and rehabilitation support (shelter, medical, legal aid, counselling) to victims of rape, child sexual abuse, and acid attacks','Women and Child Development Department, Government of Maharashtra',4,'Maharashtra','Financial assistance and rehabilitation support (shelter, medical, legal aid, counselling) to victims of rape, child sexual abuse, and acid attacks','Rs. 1 lakh to Rs. 10 lakh depending on severity of the case (as per revised 2024 Government Resolution)','https://womenchild.maharashtra.gov.in/','https://womenchild.maharashtra.gov.in/',1,NULL,'https://legalservices.maharashtra.gov.in/scheme/revised-manodhairya-yojana-gr-dated-01st-january-2024/','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(51,'Lek Ladki Yojana','Direct financial assistance to a girl child born in yellow/orange ration card families, disbursed in phases from birth until she turns 18','Women and Child Development Department, Government of Maharashtra',4,'Maharashtra','Direct financial assistance to a girl child born in yellow/orange ration card families, disbursed in phases from birth until she turns 18','Total Rs. 1,01,000 disbursed in phases from birth to age 18','https://womenchild.maharashtra.gov.in/','https://womenchild.maharashtra.gov.in/',1,NULL,'https://www.zpbeed.gov.in/en/scheme/lek-ladki-yojana/','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02'),(52,'Namo Shetkari Mahasanman Nidhi Yojana','Additional annual income support to PM-KISAN registered cultivable-landholding farmer families in Maharashtra','Department of Agriculture, Government of Maharashtra',5,'Maharashtra','Additional annual income support to PM-KISAN registered cultivable-landholding farmer families in Maharashtra','Rs. 6,000 per year (Rs. 2,000 x 3 instalments), in addition to PM-KISAN\'s Rs. 6,000/year','https://nsmny.mahait.org/','https://nsmny.mahait.org/',1,NULL,'https://nsmny.mahait.org/','2026-09-14','2026-09-14 17:40:02','2026-09-14 17:40:02');
/*!40000 ALTER TABLE `schemes` ENABLE KEYS */;
UNLOCK TABLES;
LOCK TABLES `eligibility_rules` WRITE;
/*!40000 ALTER TABLE `eligibility_rules` DISABLE KEYS */;
INSERT IGNORE INTO `eligibility_rules` (`rule_id`, `scheme_id`, `attribute_name`, `operator`, `value`, `rule_description`, `source_text_snippet`) VALUES (1,1,'occupation','=','Farmer','Applicant must be a landholding farmer engaged in agriculture','farmers enrolling in the scheme should have their own farmland and must be engaged in agriculture'),(2,2,'is_bpl','=','TRUE','Household must be identified as deprived/vulnerable per SECC 2011 census (broadly BPL-equivalent), not based on income tax returns','Eligibility is based on the Socio-Economic Caste Census (SECC) 2011 data... families living in kutcha houses with only one room... are eligible'),(3,3,'annual_income','<=','900000','Household annual income must not exceed ₹9 lakh (covers EWS up to ₹3 lakh, LIG up to ₹6 lakh, MIG up to ₹9 lakh) under PMAY-U 2.0','EWS: Up to ₹3 lakh; LIG: Up to ₹6 lakh; MIG: Up to ₹9 lakh'),(4,4,'category','=','SC','Applicant must belong to the Scheduled Caste community','Post Matric Scholarship covers... students from SC... categories'),(5,4,'annual_income','<=','250000','Family income must not exceed ₹2.5 lakh per year','The family income limit is INR 2.5 lakh per year in all four schemes for most Post-Matric scholarships'),(6,4,'education_level','=','Post-Matric','Student must be studying in Class 11 or above (post-matriculation)','Students who have passed Class 10 and are studying in Class 11 or Class 12 can apply for Post-Matric scholarships'),(7,5,'is_minority','=','TRUE','Applicant must belong to a notified minority community (Muslim, Sikh, Christian, Buddhist, Parsi, Jain)','Applicants must belong to a minority community as notified by the Government of India'),(8,5,'annual_income','<=','100000','Family income must not exceed ₹1 lakh per year','The annual family income of the candidate\'s parents/guardian should not exceed INR 1 lakh'),(9,5,'education_level','=','Class 1-10','Student must be studying in Class 1 to Class 10','Candidates must be studying in class 1 to 10 in a government or private school'),(10,6,'age','>=','18','Applicant must be at least 18 years old; no maximum age limit','Applicants should be minimum 18 years of age and there is no maximum age limit'),(11,7,'gender','=','FEMALE','Account can only be opened in the name of a girl child','for the welfare of a girl child'),(12,7,'age','<=','10','Account must be opened for the girl child between birth and 10 years of age','account can be opened any time from the birth of the girl child until she attains 10 years of age'),(13,8,'age','>=','18','Subscriber must be at least 18 years old to join','Any Indian citizen between 18 and 40 years of age with a savings account can join'),(14,8,'age','<=','40','Subscriber must not be older than 40 years to join','Any Indian citizen between 18 and 40 years of age with a savings account can join'),(15,9,'gender','=','FEMALE','LPG connection is provided in the name of an adult woman of the household','adult woman belonging to a poor household... is eligible'),(16,9,'age','>=','18','Applicant woman must have attained 18 years of age','the applicant must be an adult woman who has attained 18 years of age'),(17,9,'is_bpl','=','TRUE','Household must belong to BPL/SECC-listed poor household categories','adult women aged 18+ from BPL households... belong to SECC 2011 list or eligible categories'),(18,10,'age','>=','18','Applicant must be above 18 years of age','Applicants must be SC/ST and/or woman entrepreneur, above 18 years of age'),(19,10,'category','IN','SC,ST','Scheme targets SC/ST entrepreneurs (women entrepreneurs of any category are separately eligible; see scheme description)','Applicants must be SC/ST and/or woman entrepreneurs'),(20,11,'age','>=','18','Borrower must be at least 18 years old','Eligible borrowers include Indian citizens aged 18-65 engaged in non-farm income-generating activities'),(21,11,'age','<=','65','Borrower must not be older than 65 years','Eligible borrowers include Indian citizens aged 18-65 engaged in non-farm income-generating activities'),(22,12,'gender','=','FEMALE','Benefit is for pregnant women and lactating mothers','All pregnant women and lactating mothers... can get the scheme benefit'),(23,12,'age','>=','19','Pregnant woman must be at least 19 years of age','The pregnant woman must be at least 19 years of age or older'),(24,13,'occupation','=','Farmer','Applicant must be a farmer/cultivator or sharecropper growing notified crops','Eligible farmers include landowners, tenants, and sharecroppers growing notified crops'),(25,14,'age','>=','16','Worker must be at least 16 years old','Age must be between 16 and 59 years'),(26,14,'age','<=','59','Worker must not be older than 59 years','Age must be between 16 and 59 years'),(27,14,'occupation','=','Unorganised Sector Worker','Applicant must be an unorganised sector worker not covered by EPFO/ESIC/NPS (govt.)','any worker who is unorganised... home-based worker, self-employed worker, or wage worker in the unorganised sector'),(28,15,'occupation','=','Street Vendor','Applicant must be an urban street vendor','Urban street vendors will be eligible to avail a Working Capital (WC) loan'),(29,16,'annual_income','<=','350000','Parental income from all sources must not exceed ₹3.5 lakh per year','Students whose parental income from all sources is not more than Rs. 3,50,000/- per annum are eligible'),(30,16,'education_level','=','Class 9','Student must be entering/studying in Class 9 in a Government, Government-aided or local body school','The test is conducted at stage of class-VIII... Students should be studying as regular student in Class 9'),(31,17,'state','=','Maharashtra','Scheme is applicable to residents of Maharashtra','Maharashtra government health insurance scheme'),(32,17,'annual_income','<=','100000','Individual applicant\'s annual family income must be less than ₹1 lakh','Individual applicants must have an annual income of less than Rs.1 lakh'),(33,18,'state','=','Maharashtra','Applicant must be a domicile of Maharashtra State','be domicile of Maharashtra State'),(34,18,'annual_income','<=','800000','Family annual income must not exceed ₹8 lakh','the students family annual income limit is up to Rs. 8.00 lakh'),(35,18,'category','IN','General,EWS','Only General (OPEN) and EWS category students are eligible; OBC/SC/ST/NT are covered under other scholarship schemes','only the general category (OPEN or EWS) applicant is allowed, whereas other categories such as OBC, ST, SC, & NT are not eligible'),(36,19,'state','=','Maharashtra','Beneficiary must have resided in Maharashtra for at least 15 years','the beneficiary must have resided in Maharashtra for at least 15 years'),(37,19,'category','=','SC','Beneficiary must belong to Scheduled Caste / Neo-Buddhist community','the beneficiary must belong to the Scheduled Castes / Neo-Buddhist category'),(38,19,'annual_income','<=','300000','Family annual income must not exceed ₹3 lakh (urban ceiling; rural ceiling is lower at ₹1.2 lakh - see description)','annual income limit... up to ₹1.20 lakh for rural areas and up to ₹3.00 lakh for urban areas'),(39,16,'education_level','=','Class 8','Must be currently studying in Class 8 at a government/government-aided/local body school','Students currently studying in Class 8 in government, government-aided, or local body schools are eligible'),(40,16,'annual_income','<=','350000','Parental annual income from all sources must not exceed ₹3.5 lakh','Parental annual income from all sources must not exceed ₹3,50,000'),(41,20,'annual_income','<=','450000','Annual family income must not exceed ₹4.5 lakh','annual family income ≤ ₹4.5 lakh'),(42,20,'education_level','=','12th Pass','Must be in the top 20 percentile of Class 12 Board examination results','fresh applicants must be in the top 20 percentile of Class 12 Board (CBSE/State/ICSE)'),(43,21,'category','IN','OBC','Must belong to OBC/EBC/DNT community with a valid category certificate (only OBC maps directly to the platform\'s category field; EBC/DNT are documented in the scheme description only)','Students must be Indian citizens and belong to OBC, EBC, or DNT communities with a valid category certificate'),(44,21,'annual_income','<=','250000','Annual family income must not exceed ₹2.5 lakh','Annual family income must not exceed ₹2.5 lakh'),(45,21,'education_level','IN','Class 9,Class 11','Applicant must be studying in Class 9 or Class 11 in a recognized school','Applicants should be studying in Class 9 or Class 11 in a recognized government, government-aided, or private school'),(46,22,'gender','=','FEMALE','Scholarship is for girl students only','Girl students admitted to the first year of a diploma/degree course'),(47,22,'annual_income','<=','800000','Annual family income must not exceed ₹8 lakh','The annual family income of the applicant must not exceed ₹8,00,000 during the preceding financial year'),(48,23,'disability_status','=','true','Applicant must be a specially-abled student with a government-certified minimum disability of 40%','The applicant must be a specially-abled student with a minimum disability of 40%'),(49,23,'annual_income','<=','800000','Annual family income must not exceed ₹8 lakh','The annual family income from all sources should not exceed ₹8 lakh during the current financial year'),(50,24,'category','=','SC','Applicant must belong to the Scheduled Caste category','the applicant must belong to the Scheduled Caste (SC) category'),(51,24,'annual_income','<=','800000','Total annual family income from all sources must not exceed ₹8 lakh','The total annual family income from all sources must be less than or equal to Rs. 8.00 lakh'),(52,25,'category','=','OBC','Applicant must belong to the OBC category','Applicants must be unemployed and belong to the OBC category'),(53,25,'annual_income','<=','600000','Annual family income must not exceed ₹6 lakh','Annual family income must not exceed INR 6 Lakh from all sources'),(54,25,'education_level','=','Postgraduate','Applicant must have passed the postgraduate examination and be registered for a full-time M.Phil./Ph.D. programme','Applicants must have passed the postgraduate examination'),(55,26,'is_minority','=','true','Applicant must belong to a notified minority community (Muslim, Sikh, Christian, Buddhist, Parsi)','Muslims, Sikhs, Christians, Buddhists and Zoroastrians (Parsis) have been notified as minority communities'),(56,26,'annual_income','<=','200000','Annual income of parent/guardian from all sources must not exceed ₹2 lakh','The annual income of the parent\'s/guardian\'s from all sources must not exceed Rs. 2 lakh'),(57,27,'age','>=','18','Applicant must be at least 18 years old at the time of registration','Applicants must be 18 years of age or older'),(58,27,'occupation','=','Self-Employed','Applicant must be self-employed in the unorganised sector, working with hands and tools in one of the 18 traditional trades','Workers or artisans must be engaged in self-employment in the unorganised sector'),(59,28,'is_bpl','=','true','Applicant must be an urban poor individual identified as BPL or by the Urban Local Body','Eligible beneficiaries include Urban Poor (BPL/Identified by ULB)'),(60,28,'age','>=','18','Applicant must be at least 18 years old to establish a micro-enterprise under the scheme','Individuals must be at least 18 years old to be eligible to establish micro-enterprises'),(61,29,'age','>=','15','Minimum age for short-term skill training under PMKVY is 15 years','The age limit is 15-45 years for Short Term Training (STT)'),(62,29,'age','<=','45','Maximum age for short-term skill training under PMKVY is 45 years','The age limit is 15-45 years for Short Term Training (STT)'),(63,30,'age','>=','14','Minimum age to register on the NCS portal is 14 years with no upper age limit','The minimum age is 14 years and above with no upper age limit'),(64,31,'age','>=','18','Applicant must be at least 18 years old and a member of a rural household willing to do unskilled manual work','an applicant must be an Indian citizen, must reside in a rural area, must be at least 18 years old'),(65,32,'occupation','=','Self-Employed','Applicant must be a founder/promoter of a DPIIT-recognised startup incorporated not more than 2 years before application','Indian promoters must hold at least 51% shareholding in the startup at the time of application'),(66,33,'age','>=','18','Applicant must be at least 18 years old','Persons in the age group of 18-70 years having an individual bank or a post office account are entitled to enroll under the scheme'),(67,33,'age','<=','70','Applicant must be at most 70 years old','Persons in the age group of 18-70 years having an individual bank or a post office account are entitled to enroll under the scheme'),(68,34,'age','>=','18','Applicant must be at least 18 years old','Entry age ranges from 18 to 50 years, offering coverage till the age of 55 years'),(69,34,'age','<=','50','Applicant must be at most 50 years old at entry','Entry age ranges from 18 to 50 years, offering coverage till the age of 55 years'),(70,35,'gender','=','FEMALE','Scheme is for pregnant women only','Janani Suraksha Yojana...pregnant women delivering in Government health centres'),(71,36,'age','>=','18','Applicant must be at least 18 years old','falling in the age group of 18 to 40 years'),(72,36,'age','<=','40','Applicant must be at most 40 years old at enrollment','falling in the age group of 18 to 40 years'),(73,36,'occupation','=','FARMER','Scheme is restricted to small and marginal farmers with cultivable landholding up to 2 hectares','All Small and Marginal Farmers having cultivable landholding up to 2 hectares...are eligible to get benefit under the Scheme'),(74,37,'occupation','=','FARMER','Scheme is available to farmers installing micro-irrigation systems','Financial Assistance...for Small & Marginal farmers and...other farmers is provided by the Government for installation of Micro Irrigation'),(75,38,'occupation','=','FARMER','Scheme is available to land-holding farmers','Eligibility extends to most land-holding farmers across India, including small, marginal, medium, and large farmers'),(76,39,'occupation','=','FARMER','Scheme is available to farmers including owner cultivators, tenant farmers, oral lessees and share croppers','farmers eligible under the KCC scheme include small farmers, marginal farmers, share croppers, oral lessee and tenant farmers'),(77,40,'occupation','=','FARMER','Scheme is available to farmers adopting cluster-based organic farming','Eligibility for PKVY extends to all farmers and institutions...to adopt organic farming collectively'),(78,44,'is_bpl','=','TRUE','Applicant\'s family must be registered as Below Poverty Line','The patient must belong to a family officially registered as Below the Poverty Line (BPL)'),(79,44,'annual_income','<=','125000','Total annual family income must not exceed Rs 1.25 lakh','The total annual family income should not exceed Rs 1,25,000'),(80,46,'age','>=','18','Applicant must be at least 18 years old','Any Citizen aged between 18-70 is eligible'),(81,46,'age','<=','70','Applicant must be at most 70 years old','Any Citizen aged between 18-70 is eligible'),(82,47,'is_bpl','=','TRUE','Beneficiary must hold an Antyodaya Anna Yojana (AAY) or Priority Household (PHH) ration card under NFSA','Families belonging to the Below Poverty Line – Antyodaya Anna Yojana (AAY) and Priority Households (PHH) categories are eligible for the scheme'),(83,48,'is_bpl','=','TRUE','Beneficiary must be an NFSA ration card holder (AAY/PHH)','All NFSA Beneficiaries (Migrant Labors, tribals, etc.)'),(84,19,'category','IN','SC','Beneficiary must belong to the Scheduled Caste or Neo-Buddhist community','The beneficiary should belong to the Scheduled Caste and Neo-Buddhist category'),(85,19,'state','=','Maharashtra','Beneficiary must have resided in Maharashtra for at least 15 years','must have resided in Maharashtra for at least 15 years'),(86,19,'annual_income','<=','120000','Annual family income must not exceed Rs 1.20 lakh (rural criterion; urban ceiling is Rs 3 lakh)','Annual family income: ₹1.20 lakh (rural) or ₹3.00 lakh (urban)'),(87,49,'age','>=','18','Beneficiary must be at least 18 years old','destitute men and women aged 18 to 65 years'),(88,49,'age','<=','65','Beneficiary must be at most 65 years old','destitute men and women aged 18 to 65 years'),(89,49,'state','=','Maharashtra','Beneficiary must be a resident of Maharashtra','Applicant can apply at the District Collector\'s Office / Tehsildar\'s Office ... Maharashtra'),(90,49,'annual_income','<=','21000','Family annual income must not exceed Rs 21,000 (or be on the BPL list)','the beneficiary\'s name must be on the Below Poverty Line (BPL) list or the family\'s annual income must be up to ₹21,000'),(91,50,'state','=','Maharashtra','Scheme applies to victims within the state of Maharashtra','launched by the WCD department of Maharashtra Government'),(92,51,'gender','=','FEMALE','Scheme benefits a girl child (daughter) only','one or two daughters born on or after April 1, 2023'),(93,51,'state','=','Maharashtra','Beneficiary\'s family must be permanent residents of Maharashtra','The beneficiary\'s family must be permanent residents of Maharashtra'),(94,51,'annual_income','<=','100000','Annual family income must not exceed Rs 1 lakh','Annual family income must not exceed ₹1,00,000'),(95,52,'state','=','Maharashtra','Applicant must be a resident farmer of Maharashtra','Applicants must be a resident of Maharashtra'),(96,52,'occupation','=','Farmer','Applicant must be a cultivable-landholding farmer registered under PM-KISAN','Cultivable land holding farmers families ... eligible for both PM KISAN & NSMNY scheme');
/*!40000 ALTER TABLE `eligibility_rules` ENABLE KEYS */;
UNLOCK TABLES;
LOCK TABLES `required_documents` WRITE;
/*!40000 ALTER TABLE `required_documents` DISABLE KEYS */;
INSERT IGNORE INTO `required_documents` (`doc_id`, `scheme_id`, `document_name`, `document_category`, `is_mandatory`) VALUES (1,1,'Aadhaar Card','ID Proof',1),(2,1,'Land Ownership Records (Khatauni/7-12 extract)','Other',1),(3,1,'Bank Account Passbook (Aadhaar-linked)','Bank Details',1),(4,2,'Aadhaar Card','ID Proof',1),(5,2,'Ration Card','Other',1),(6,2,'SECC/PM-JAY Eligibility Family ID','Other',1),(7,3,'Aadhaar Card','ID Proof',1),(8,3,'Income Certificate','Income Proof',1),(9,3,'Address Proof','Address Proof',1),(10,3,'Bank Account Passbook','Bank Details',1),(11,3,'Passport-size Photograph','Photograph',1),(12,4,'Aadhaar Card','ID Proof',1),(13,4,'Caste Certificate','Other',1),(14,4,'Income Certificate','Income Proof',1),(15,4,'Bonafide/Enrolment Certificate from Institution','Educational Certificate',1),(16,4,'Previous Year Marksheet','Educational Certificate',1),(17,4,'Bank Passbook (Aadhaar-seeded)','Bank Details',1),(18,5,'Aadhaar Card','ID Proof',1),(19,5,'Minority Community Certificate','Other',1),(20,5,'Income Certificate','Income Proof',1),(21,5,'School Bonafide Certificate','Educational Certificate',1),(22,5,'Bank Passbook (Aadhaar-seeded)','Bank Details',1),(23,6,'Aadhaar Card','ID Proof',1),(24,6,'Detailed Project Report','Other',1),(25,6,'Educational Qualification Certificate','Educational Certificate',0),(26,6,'Caste/Category Certificate','Other',0),(27,6,'Bank Account Passbook','Bank Details',1),(28,6,'Passport-size Photograph','Photograph',1),(29,7,'Birth Certificate of Girl Child','ID Proof',1),(30,7,'Guardian\'s Aadhaar Card','ID Proof',1),(31,7,'Address Proof of Guardian','Address Proof',1),(32,7,'Passport-size Photograph','Photograph',1),(33,8,'Aadhaar Card','ID Proof',1),(34,8,'Bank/Post Office Savings Account Passbook','Bank Details',1),(35,8,'Mobile Number (linked to bank account)','Other',1),(36,9,'Aadhaar Card','ID Proof',1),(37,9,'BPL Certificate / Ration Card','Income Proof',1),(38,9,'Bank Account Passbook','Bank Details',1),(39,9,'Passport-size Photograph','Photograph',1),(40,10,'Aadhaar Card','ID Proof',1),(41,10,'Caste Certificate (for SC/ST applicants)','Other',0),(42,10,'Business/Project Report','Other',1),(43,10,'Address Proof','Address Proof',1),(44,10,'Bank Statement','Bank Details',1),(45,11,'Aadhaar Card','ID Proof',1),(46,11,'Business Proof/Project Report','Other',1),(47,11,'Bank Statement','Bank Details',1),(48,11,'Passport-size Photograph','Photograph',1),(49,12,'Aadhaar Card','ID Proof',1),(50,12,'Mother and Child Protection (MCP) Card','Other',1),(51,12,'Bank Account Passbook','Bank Details',1),(52,13,'Aadhaar Card','ID Proof',1),(53,13,'Land Ownership/Tenancy Records','Other',1),(54,13,'Bank Account Passbook','Bank Details',1),(55,13,'Sowing Certificate','Other',1),(56,14,'Aadhaar Card (with linked mobile number)','ID Proof',1),(57,14,'Bank Account Details','Bank Details',1),(58,15,'Aadhaar Card','ID Proof',1),(59,15,'Certificate of Vending / Letter of Recommendation','Other',1),(60,15,'Bank Account Passbook','Bank Details',1),(61,15,'Passport-size Photograph','Photograph',1),(62,16,'Aadhaar Card','ID Proof',1),(63,16,'Income Certificate','Income Proof',1),(64,16,'Class 8 Marksheet','Educational Certificate',1),(65,16,'School Bonafide Certificate','Educational Certificate',1),(66,16,'Bank Passbook (Aadhaar-seeded)','Bank Details',1),(67,17,'Ration Card (Yellow/Orange/AAY/Annapurna)','Other',1),(68,17,'Aadhaar Card','ID Proof',1),(69,17,'Income Certificate (for Orange card holders)','Income Proof',0),(70,18,'Aadhaar Card','ID Proof',1),(71,18,'Domicile Certificate','Address Proof',1),(72,18,'Income Certificate','Income Proof',1),(73,18,'CAP Admission Allotment Letter','Other',1),(74,18,'Bank Passbook (Aadhaar-seeded)','Bank Details',1),(75,19,'Caste Certificate (SC/Neo-Buddhist)','Other',1),(76,19,'Income Certificate','Income Proof',1),(77,19,'Residence Proof (15 years domicile)','Address Proof',1),(78,19,'Land/Plot Ownership Document','Other',1),(79,19,'Bank Account Passbook','Bank Details',1),(80,16,'Aadhaar Card','ID Proof',1),(81,16,'Income Certificate','Income Proof',1),(82,16,'Class 7 Mark Sheet','Educational Certificate',1),(83,16,'Bank Passbook','Bank Details',1),(84,16,'Caste Certificate','ID Proof',0),(85,16,'Passport Size Photograph','Photograph',1),(86,20,'Aadhaar Card','ID Proof',1),(87,20,'Class 12 Mark Sheet','Educational Certificate',1),(88,20,'Income Certificate','Income Proof',1),(89,20,'College Admission/Bonafide Certificate','Educational Certificate',1),(90,20,'Bank Passbook','Bank Details',1),(91,21,'Aadhaar Card','ID Proof',1),(92,21,'OBC/EBC/DNT Category Certificate','ID Proof',1),(93,21,'Income Certificate','Income Proof',1),(94,21,'Previous Class Mark Sheet','Educational Certificate',1),(95,21,'School Bonafide/Enrollment Certificate','Educational Certificate',1),(96,21,'Bank Passbook','Bank Details',1),(97,22,'Aadhaar Card','ID Proof',1),(98,22,'Income Certificate','Income Proof',1),(99,22,'Admission Letter','Educational Certificate',1),(100,22,'Class 12 Mark Sheet','Educational Certificate',1),(101,22,'Bank Passbook','Bank Details',1),(102,23,'Aadhaar Card','ID Proof',1),(103,23,'Disability Certificate (Government Medical Board)','Other',1),(104,23,'Income Certificate','Income Proof',1),(105,23,'Admission Letter','Educational Certificate',1),(106,23,'Bank Passbook','Bank Details',1),(107,24,'Aadhaar Card','ID Proof',1),(108,24,'Caste Certificate','ID Proof',1),(109,24,'Income Certificate','Income Proof',1),(110,24,'Class 12 Mark Sheet','Educational Certificate',1),(111,24,'Admission Letter from Notified Institution','Educational Certificate',1),(112,24,'Bank Passbook','Bank Details',1),(113,25,'Aadhaar Card','ID Proof',1),(114,25,'OBC Caste Certificate','ID Proof',1),(115,25,'Income Certificate','Income Proof',1),(116,25,'Postgraduate Degree Certificate','Educational Certificate',1),(117,25,'UGC NET-JRF/CSIR-JRF Certificate','Educational Certificate',1),(118,25,'University Registration Certificate','Educational Certificate',1),(119,26,'Aadhaar Card','ID Proof',1),(120,26,'Minority Community Certificate/Self-Declaration','ID Proof',1),(121,26,'Income Certificate','Income Proof',1),(122,26,'Previous Year Mark Sheet','Educational Certificate',1),(123,26,'Bank Passbook','Bank Details',1),(124,27,'Aadhaar Card','ID Proof',1),(125,27,'Trade/Occupation Proof','Other',1),(126,27,'Bank Passbook','Bank Details',1),(127,27,'Passport Size Photograph','Photograph',1),(128,28,'Aadhaar Card','ID Proof',1),(129,28,'BPL/Urban Poor Identification Proof','Other',1),(130,28,'Address Proof','Address Proof',1),(131,28,'Bank Passbook','Bank Details',1),(132,29,'Aadhaar Card','ID Proof',1),(133,29,'Bank Passbook (Aadhaar-linked)','Bank Details',1),(134,29,'Passport Size Photograph','Photograph',1),(135,30,'Aadhaar Card','ID Proof',0),(136,30,'Educational Certificates','Educational Certificate',0),(137,30,'Resume/Bio-data','Other',0),(138,31,'Aadhaar Card','ID Proof',1),(139,31,'Residence/Address Proof','Address Proof',1),(140,31,'Passport Size Photograph','Photograph',1),(141,31,'Bank/Post Office Passbook','Bank Details',1),(142,32,'DPIIT Recognition Certificate','Other',1),(143,32,'Certificate of Incorporation','Other',1),(144,32,'Pitch Deck/Business Plan','Other',1),(145,32,'PAN Card','ID Proof',1),(146,32,'Bank Account Details','Bank Details',1),(147,33,'Aadhaar Card','ID Proof',1),(148,33,'Bank Account Details','Bank Details',1),(149,33,'Nomination Form','Other',1),(150,34,'Aadhaar Card','ID Proof',1),(151,34,'Bank Account Details','Bank Details',1),(152,34,'Nomination Form','Other',1),(153,35,'Aadhaar Card','ID Proof',1),(154,35,'Mother and Child Protection (MCP) Card','Other',1),(155,35,'BPL/SC/ST Certificate','Income Proof',0),(156,35,'Bank Account Details','Bank Details',1),(157,36,'Aadhaar Card','ID Proof',1),(158,36,'Land Records/Khatauni','Other',1),(159,36,'Age Proof','ID Proof',1),(160,36,'Bank Account Details','Bank Details',1),(161,37,'Land Ownership/Tenancy Document','Other',1),(162,37,'Aadhaar Card','ID Proof',1),(163,37,'Bank Account Details','Bank Details',1),(164,38,'Aadhaar Card','ID Proof',1),(165,38,'Land Records','Other',1),(166,39,'Aadhaar Card','ID Proof',1),(167,39,'Land Ownership/Tenancy Proof','Other',1),(168,39,'Bank Account Details','Bank Details',1),(169,39,'Photograph','Photograph',1),(170,40,'Aadhaar Card','ID Proof',1),(171,40,'Land Records','Other',1),(172,40,'Farmer Cluster/Group Membership Proof','Other',1),(173,40,'Bank Account Details','Bank Details',1),(174,41,'Detailed Project Report','Other',1),(175,41,'Aadhaar Card','ID Proof',1),(176,41,'Bank Account Details','Bank Details',1),(177,41,'GST Registration Certificate','Other',0),(178,42,'Aadhaar Card','ID Proof',1),(179,42,'Retail Drug License','Other',1),(180,42,'Pharmacist Degree Certificate','Educational Certificate',1),(181,42,'GST Registration Certificate','Other',1),(182,43,'Aadhaar Card','ID Proof',1),(183,43,'Nikshay Portal TB Notification Record','Other',1),(184,43,'Bank Account Details','Bank Details',1),(185,44,'BPL Certificate','Income Proof',1),(186,44,'Income Certificate','Income Proof',1),(187,44,'Aadhaar Card','ID Proof',1),(188,44,'Medical Diagnosis Report from Government Hospital','Other',1),(189,45,'Aadhaar Card','ID Proof',1),(190,45,'Officially Valid Document (Voter ID/Passport/Driving License)','ID Proof',0),(191,45,'Passport Size Photograph','Photograph',1),(192,46,'PAN Card','ID Proof',1),(193,46,'Address Proof','Address Proof',1),(194,46,'Bank Account Details','Bank Details',1),(195,46,'Passport Size Photograph','Photograph',1),(196,47,'Ration Card','ID Proof',1),(197,47,'Aadhaar Card','ID Proof',0),(198,48,'Ration Card','ID Proof',1),(199,48,'Aadhaar Card','ID Proof',1),(200,19,'7/12 Extract or Property Ownership Document','Address Proof',1),(201,19,'Caste Certificate','Other',1),(202,19,'Income Certificate','Income Proof',1),(203,19,'Aadhaar Card','ID Proof',1),(204,19,'Ration Card','ID Proof',0),(205,49,'Age Proof','ID Proof',1),(206,49,'Income Certificate','Income Proof',1),(207,49,'BPL Certificate','Other',0),(208,49,'Aadhaar Card','ID Proof',1),(209,49,'Bank Passbook','Bank Details',1),(210,50,'FIR Copy','Other',1),(211,50,'Medical Examination Report','Other',1),(212,50,'Aadhaar Card','ID Proof',1),(213,50,'Bank Account Details','Bank Details',1),(214,51,'Birth Certificate','Other',1),(215,51,'Income Certificate','Income Proof',1),(216,51,'Aadhaar Card (Beneficiary and Parents)','ID Proof',1),(217,51,'Bank Passbook','Bank Details',1),(218,51,'Ration Card','ID Proof',1),(219,52,'Aadhaar Card','ID Proof',1),(220,52,'7/12 Land Ownership Extract','Other',1),(221,52,'Bank Account Linked with Aadhaar','Bank Details',1),(222,52,'PM-KISAN Registration Details','Other',1);
/*!40000 ALTER TABLE `required_documents` ENABLE KEYS */;
UNLOCK TABLES;



-- ============================================================
-- Default Administrative and Demo Citizen Users
-- ============================================================
-- Credentials:
-- 1. Admin Portal: admin@saarthi.gov.in / Admin@123
-- 2. Citizen Portal: citizen@saarthi.gov.in / Citizen@123
INSERT IGNORE INTO `users` (`user_id`, `email`, `password_hash`, `full_name`, `role`, `status`) VALUES 
(1, 'admin@saarthi.gov.in', '$2a$10$KZExTK7mfhXJ7kSsVeNiwuXO4BUDAQ3luPXutR1B3I0zxGKXbGyWK', 'Saarthi System Administrator', 'ADMIN', 'ACTIVE'),
(2, 'citizen@saarthi.gov.in', '$2a$10$glH7kgWhMfLtCwK8qrhsjOKfTOAYM35wKthqc.Bk//CevkwTFjtym', 'Ramesh Kumar', 'USER', 'ACTIVE')
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`), `password_hash`=VALUES(`password_hash`), `role`=VALUES(`role`);

INSERT IGNORE INTO `user_profiles` (`profile_id`, `user_id`, `date_of_birth`, `gender`, `state`, `district`, `annual_income`, `occupation`, `category`, `education_level`, `disability_status`, `is_bpl`, `is_minority`) VALUES
(1, 2, '1992-05-15', 'MALE', 'Maharashtra', 'Pune', 85000.00, 'Farmer', 'OBC', '12th Pass', 0, 1, 0)
ON DUPLICATE KEY UPDATE `state`=VALUES(`state`), `annual_income`=VALUES(`annual_income`);
