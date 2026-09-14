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
    benefit_amount VARCHAR(100) NULL,
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
-- Seed: scheme categories (fixed lookup set)
-- ============================================================
INSERT IGNORE INTO scheme_categories (category_name, icon_name, display_order) VALUES
 ('Education', 'graduation-cap', 1),
 ('Healthcare', 'heart-pulse', 2),
 ('Housing', 'home', 3),
 ('Financial Aid', 'rupee', 4),
 ('Agriculture', 'wheat', 5),
 ('Employment', 'briefcase', 6);

-- ============================================================
-- Seed: one ADMIN user for initial access (password: Admin@123, bcrypt hash below)
-- Regenerate this hash via PasswordUtil before real use — placeholder for dev only.
-- ============================================================
-- INSERT INTO users (email, password_hash, full_name, role) VALUES
--   ('admin@saarthi.local', '<bcrypt-hash>', 'Saarthi Admin', 'ADMIN');
