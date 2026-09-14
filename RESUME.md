# Saarthi — Resume Prompt for a New Session

Paste this whole file as your first message in the new session to pick up exactly where this one left off.

---

## What this project is
**Saarthi** (renamed from "AI Sarkari Saathi") — a personalized government scheme discovery platform for Indian citizens. Full docs already written and finalized:
- `SRS.md` — the authoritative Software Requirements Specification (functional/non-functional requirements, 5 core algorithms including the eligibility matching engine, full DB schema, ER/use-case/activity diagrams in Mermaid). Also exported as `Saarthi_SRS.pdf` and `Saarthi_SRS.docx`.
- `PLAN.md` — implementation plan: stack, environment, phased build order.
- `DATASET_PLAN.md` — how the 80+ real scheme dataset (Central + Maharashtra) gets sourced, extracted, and verified against live government pages before seeding.
- `Saarthi_Synopsis.md` — the original academic project synopsis, kept in sync with the above.

All four documents are internally consistent (renamed to Saarthi, stack aligned) — do not re-derive requirements, just read `SRS.md` and `PLAN.md` for context.

## Stack (locked in, do not re-ask)
- **Backend:** Java, Servlets on **Tomcat 8.5.99** (`javax.servlet` namespace — NOT Jakarta), plain JDBC (no Hibernate), no Maven (JARs manually placed in `WEB-INF/lib`). Package root: `com.saarthi.*`.
- **DB:** MySQL/MariaDB via **XAMPP** (`C:\xampp`) — database name `saarthi_db`, default port 3306, user `root`, no password (dev only).
- **IDE:** Eclipse IDE for Enterprise Java and Web Developers, at `C:\Program Files (x86)\eclipse` (WTP confirmed installed).
- **Tomcat location:** extracted (not yet registered as an Eclipse server runtime) at `C:\Users\mohit\Downloads\apache-tomcat-8.5.99-windows-x64\apache-tomcat-8.5.99`.
- **Auth:** JWT via `jjwt-0.9.1` (old pre-0.11 API: `Jwts.builder()` / `Jwts.parser()` — NOT `Jwts.parserBuilder()`), password hashing via jBCrypt.
- **JSON:** Gson.
- **Frontend:** React + Vite (not started yet) — will be built by translating the Stitch-exported HTML/CSS in `stitch_screens/` into real components, not from scratch.

## UI design — already done
- `user onboarding/` — 10 markdown files: shared design system (`00-design-system-extension.md`... wait, it's `00-design-system.md`) + Login, Signup, Forgot Password, and 6 onboarding steps. Light theme: Primary green `#1F6E43`, Accent saffron/gold `#F2A93B`, Fraunces (headings) + General Sans (body), claymorphism illustrations of ordinary Indian citizens. Full anti-slop checklist embedded.
- `app modules/` — 10 markdown files: design system extension (nav bar, scheme cards, tabs, filters, etc.) + Dashboard, Explorer, Scheme Detail, Checklist, Bookmarks, Notifications, Profile, Chatbot widget, and a deliberately utilitarian (non-illustrated, dense-table) Admin panel.
- `stitch_screens/` — **all 33 screens already generated** in Google Stitch from those prompts, exported as HTML + PNG/JPG per screen (desktop + mobile variants), with a `README.md` index and `screens_manifest.json`. Spot-checked and confirmed high quality/on-spec (including a page-overlay CSS bug that was found and fixed mid-project — see git-less history in this conversation if needed, but the exported screens already reflect the fix).

## Database — done
`backend/db/schema.sql` contains the **complete** schema: all 15 tables from SRS §6 (users, user_profiles, password_reset_tokens, audit_log, scheme_categories, schemes, eligibility_rules, required_documents, admin_scheme_audit, scheme_match_snapshot, checklist_item_state, bookmarks, notifications, chat_sessions, chat_history) **plus** the SRS §11 database automation layer: 4 triggers (`trg_users_before_update`, `trg_user_profiles_before_update`, `trg_schemes_audit_on_update`, `trg_bookmarks_prevent_orphan`), 3 stored procedures (`sp_set_audit_actor`, `sp_prune_expired_reset_tokens`, `sp_get_dashboard_summary_counts`), 2 functions (`fn_calculate_age`, `fn_days_until_deadline`) — explicitly scoped to integrity/audit only, no eligibility business logic in the DB.

**This has already been run against the live `saarthi_db` database** — all tables, triggers, procedures, and functions exist and were verified via `SHOW TRIGGERS` / `SHOW PROCEDURE STATUS` / `SHOW FUNCTION STATUS`. To restart MySQL in a new session: `Start-Process -FilePath "C:\xampp\mysql_start.bat" -WorkingDirectory "C:\xampp"` (PowerShell), then verify with `mysqld` process check.

## Backend — in progress, here's exactly what exists
Folder: `backend/` (mirrors an Eclipse Dynamic Web Project layout — not yet imported into Eclipse itself).

```
backend/
├── db/schema.sql                           ✅ done, applied to DB
├── src/com/saarthi/
│   ├── util/
│   │   ├── DBUtil.java                     ✅ done — DriverManager-per-request, reads db.properties
│   │   ├── PasswordUtil.java               ✅ done — jBCrypt wrapper
│   │   ├── JsonUtil.java                   ✅ done — Gson wrapper, writeJson/writeError helpers
│   │   └── JwtUtil.java                    ✅ done — issueToken/parseToken, jjwt 0.9.1 API
│   ├── model/
│   │   ├── User.java                       ✅ done
│   │   └── UserProfile.java                ✅ done (includes getAge() derived from date_of_birth)
│   ├── dao/
│   │   ├── UserDAO.java                    ✅ done — insert, findByEmail, findById, recordFailedLogin, recordSuccessfulLogin, updatePassword
│   │   └── ProfileDAO.java                 ✅ done — findByUserId, upsert (ON DUPLICATE KEY), touchMatchSnapshot
│   ├── service/
│   │   └── AuthService.java                ✅ done — register(), login() with FR1.8 lockout logic
│   ├── controller/
│   │   └── AuthController.java             ✅ done — @WebServlet /api/auth/register, /api/auth/login
│   └── filter/
│       └── AuthFilter.java                 ✅ done — @WebFilter /api/*, JWT validation + ADMIN route gating
├── WebContent/WEB-INF/
│   ├── web.xml                             ✅ done (minimal — servlets/filters are annotation-based)
│   ├── classes/db.properties                ✅ done — jdbc:mysql://localhost:3306/saarthi_db, user root, no password
│   └── lib/                                 ✅ all 7 JARs downloaded and present:
│       mysql-connector-j-9.7.0.jar, gson-2.11.0.jar, jbcrypt-0.4.jar, jjwt-0.9.1.jar,
│       jackson-databind-2.17.2.jar, jackson-core-2.17.2.jar, jackson-annotations-2.17.2.jar
```

**NOT YET DONE (pick up here):**
1. **Compile-check the backend.** None of the above has been compiled yet. Compile via javac using the servlet-api.jar from Tomcat (`.../apache-tomcat-8.5.99/lib/servlet-api.jar`) plus everything in `WebContent/WEB-INF/lib/*.jar` on the classpath, output to `WebContent/WEB-INF/classes`. Fix any real compile errors (IDE diagnostics seen so far were just "no classpath configured in the editor" noise, not necessarily real errors — verify for real with javac).
2. **Register Tomcat 8.5.99 as an Eclipse server runtime**, import `backend/` as a Dynamic Web Project (or continue command-line: copy/symlink `backend/WebContent` into Tomcat's `webapps/ROOT` or a new context, start Tomcat, hit `/api/auth/register` with curl to prove the round trip end-to-end).
3. **ProfileController + ProfileService** (Module 2 — Profile & Onboarding, FR2.1-FR2.5) — not started.
4. **EligibilityService** (Section 5.1-5.3 — the actual matching engine: rule evaluation, confidence scoring, ranking) — not started. This is the core module (SRS Module 3) and the next most important thing after Auth+Profile work end-to-end.
5. **SchemeDAO, EligibilityRuleDAO, RequiredDocumentDAO** — not started.
6. **The actual scheme dataset** (80+ real, verified schemes per `DATASET_PLAN.md`) — not sourced yet. This blocks testing the matching engine with real data. Per `DATASET_PLAN.md`, I (Claude) do the live-page verification myself in batches of ~15-20, hand you the CSV to review before seeding.
7. **Frontend** — no Vite project created yet. Plan: scaffold React+Vite, then port the Stitch-exported HTML/CSS from `stitch_screens/` into real components page by page, wiring Axios calls to the backend endpoints as they're built.
8. **MatchController, SchemeController, and the rest of Modules 4-10** — not started (Explorer, Scheme Detail, Checklist, Bookmarks, Notifications, Admin — all speced in SRS and in `app modules/`, none implemented yet).

## Immediate next action when you resume
Say something like: *"continue the backend build — compile what's there, get Tomcat serving it, verify register/login round-trip end to end, then build the Profile module and the eligibility matching engine."* That picks up exactly at step 1 above.

## Things NOT to re-ask the user about (already decided)
- Stack: Eclipse/Tomcat 8.5.99/no Maven/no Hibernate/XAMPP MySQL — confirmed, don't re-litigate.
- Auth: JWT (not sessions) — confirmed.
- Chatbot (Module 8): fully specified in SRS but implementation deliberately sequenced *after* the core modules — don't build it early.
- Admin panel styling: deliberately utilitarian/dark-sidebar/dense-table, NOT the citizen app's light claymorphism style — this was intentional, don't "fix" it to match.
- Dataset size: 80+ schemes, Central + Maharashtra only for now.
- Brand name is **Saarthi**, not "AI Sarkari Saathi" — if you see the old name anywhere, it's stale and should be fixed, not treated as correct.
