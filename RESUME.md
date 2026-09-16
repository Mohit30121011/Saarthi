# Saarthi — Resume Prompt for a New Session

Paste this whole file as your first message in the new session to pick up exactly where this one left off.

---

## AI Chatbot (Module 8) — built, Gemini key verified live, Groq key still needed
Full backend implementation of SRS Section 3.8/5.6: `ChatController` (`/api/chat/message`, `/api/chat/history`) → `ChatService` (grounding/verification per Section 5.6 — retrieves candidate schemes via existing DAOs, computes eligibility deterministically via a new `EligibilityService.evaluate()`/`evaluateCandidates()` public API instead of duplicating that logic, calls the LLM with a hard-scoped, extensively-detailed system prompt, then strips any scheme the model mentions that wasn't actually in that turn's supplied context) → `com.saarthi.integration.GeminiClient`/`GroqClient` (Gemini primary, **Groq** fallback — groq.com's LPU-hosted open models via their OpenAI-compatible `chat/completions` endpoint, NOT xAI's Grok; an earlier pass of this session built a `GrokClient` against api.x.ai before the user corrected it — fully renamed, no leftover references). Both providers via plain `java.net.http.HttpClient` — no new JARs needed. New DAOs `ChatSessionDAO`/`ChatHistoryDAO` against the `chat_sessions`/`chat_history` tables that were already in `schema.sql` (marked "schema-ready; feature deferred" — now built). Frontend: `frontend/src/components/ChatWidget.jsx` replaces the static fake "Ask Saarthi" widget that was previously hardcoded into `Dashboard.jsx` — now mounted globally in `AppShell.jsx`, does real message exchange, and renders matched scheme details as inline mini-cards directly in the chat bubble (linking to Scheme Detail) per FR8.8.

**Scope decisions made this session (don't re-ask):** Gemini primary / Groq fallback (not user-selectable). Scope guardrail is the "broader civic-scheme" option — the bot may also answer general Indian civic-process questions (e.g. "how do I apply for a new Aadhaar card") using general knowledge even without a matching DB row, but must never invent facts about a *specific* scheme (name/amount/eligibility/deadline/documents) outside the verified candidate set supplied that turn. Chat is **behind auth only** in this release — `/api/chat/*` was deliberately left off `AuthFilter`'s public-path list, matching the existing guest-mode-is-a-scope-cut decision already documented below (FR8.3/FR8.6 guest support is architected for — `ChatService` methods don't hard-require a DB profile — but not wired to an unauthenticated path yet).

**Security note (resolved, but know the context):** the user pasted a real Gemini API key directly into `chatbot.properties.example` (the *tracked* template file, not the gitignored real one) while editing it in the IDE. Caught before any commit — moved the key into the real, gitignored `backend/WebContent/WEB-INF/classes/chatbot.properties`, restored `.example` to its placeholder, and confirmed via `git log`/`git status` the key never entered history. Nothing to rotate. If a real key ever does show up in a tracked file in a future session, treat it as compromised and rotate it — don't just remove it from the file.

**Real-key verification done this session:**
- The Gemini key in `chatbot.properties` **is valid and the `x-goog-api-key` header auth works** — confirmed with a live `curl` call to `gemini-2.5-flash` (HTTP 200, correct completion returned).
- The configured `gemini-3.7-flash` (and `gemini-3.8-flash`) currently return **HTTP 503 "high demand"** from Google — a transient capacity issue on Google's side, not a config problem; `gemini-2.5-flash` works fine right now as a more stable fallback model name if 503s persist. Worth trying `gemini-3.7-flash` again later, or switching `gemini.model` in `chatbot.properties` to `gemini-2.5-flash` if it keeps happening.
- No Groq key has been provided yet (`groq.api.key` is still the placeholder in `chatbot.properties`) — get one at console.groq.com and add it the same way. Default model is `llama-3.3-70b-versatile`; Groq deprecates models without much notice, so if that model 404s, check console.groq.com's current model list.
- End-to-end chat flow (real message → real LLM → real reply rendered with scheme cards in the widget) **has still not been run** — only the raw Gemini API connectivity was smoke-tested via curl, not the actual `ChatService` code path through a running Tomcat + browser session. That's the next real test.

**Before this is fully proven out:**
1. **Full end-to-end run not done yet.** Bring up MySQL + Tomcat + `npm run dev`, log in, open the chat widget, and have a real conversation. Watch for: (a) whether Gemini's `responseMimeType: application/json` actually returns the exact `{"reply", "referencedSchemeIds"}` shape the system prompt asks for, (b) whether the Groq fallback triggers correctly if Gemini 503s, (c) whether the daily rate limit (`chat.daily.message.limit`, default 40) feels right.
2. **Frontend build was verified clean** (`npm run build`, zero errors) but not run/clicked-through live yet this session.
3. **Historical chat replay is text-only.** `GET /api/chat/history` returns prior messages without reconstructing their scheme cards (only `context_scheme_ids` — raw IDs — was persisted for audit, not full card data) — the live in-session reply from `POST /api/chat/message` does include full scheme cards, this only affects re-opening the widget after a page reload mid-conversation. Acceptable simplification for now, not a bug.
4. Manual DB check worth doing once a real conversation happens: confirm `chat_sessions`/`chat_history` rows actually appear, and that `flagged_unverified_mentions` stays empty in normal use (a non-empty value means the model referenced a scheme outside its supplied context — expected occasionally, worth eyeballing early on to sanity-check the system prompt is working).

Earlier note about the C: drive being completely full mid-session: the user freed some space (down to ~1.3GB free at last check) — worth rechecking (`df -h /c/` from git-bash) if builds start failing with `ENOSPC` again.

## Repo layout note
Reference/spec docs that aren't live code or the primary planning docs — the Stitch design-prompt folders (`app modules/`, `user onboarding/`), `stitch_screens/`, and stale duplicate exports (old-name `.docx` files, `SRS_render.html`, `Saarthi_SRS.docx/.pdf`, `srs_harness.md`) — now live under `extras/` to keep the root clean. `RESUME.md`, `PLAN.md`, `SRS.md`, `DATASET_PLAN.md`, and `Saarthi_Synopsis.md` stay at root as the actively-referenced docs. See `PROJECT_STRUCTURE.md` for the full folder tree and layer conventions.

## What this project is
**Saarthi** — a personalized government scheme discovery platform for Indian citizens. Full docs already written and finalized: `SRS.md` (authoritative spec, 5 core algorithms, full DB schema), `PLAN.md` (stack, build order), `DATASET_PLAN.md` (dataset sourcing methodology), `Saarthi_Synopsis.md`. Don't re-derive requirements — read these first.

## Stack (locked in, do not re-ask)
- **Backend:** Java, Servlets on **Tomcat 8.5.99** (`javax.servlet`, not Jakarta), plain JDBC, no Maven (manual JARs in `WEB-INF/lib`). Package root: `com.saarthi.*`.
- **DB:** MySQL/MariaDB via **XAMPP** — db `saarthi_db`, port 3306, user `root`, no password.
- **JDK:** Use `C:\Program Files\Java\jdk-18.0.2.1` explicitly — NOT the `javapath` shim (`Common Files\Oracle\Java\javapath`), which isn't a real JDK and breaks things silently.
- **Tomcat location:** `C:\Users\mohit\Downloads\apache-tomcat-8.5.99-windows-x64\apache-tomcat-8.5.99`, deployed as context `/saarthi` (manually copied into `webapps/saarthi/`, not via Eclipse in this session's workflow).
- **Auth:** JWT via `jjwt-0.9.1` (old API — `Jwts.builder()`/`Jwts.parser()`). Needs `jaxb-api-2.3.1.jar` in `WEB-INF/lib` too — `javax.xml.bind.DatatypeConverter` was removed from the JDK in Java 9+, and jjwt 0.9.1 needs it.
- **JSON:** Gson. **Gson cannot serialize `java.time.LocalDate`/`LocalDateTime`** on modern JDKs (module access restrictions) — every controller response MUST be a plain DTO with String/primitive fields, never a raw model object. Also: **Gson silently serializes anonymous/local Java classes as `"null"`** for both directions — always use a named static DTO class, never `new Object(){...}`.
- **Frontend:** React 18 + Vite + Tailwind **v4** (CSS-first `@theme` config, no `tailwind.config.js`) + React Router + Axios. Dev proxy `/api` → `http://localhost:8080/saarthi`.

## How to bring the stack up in a new session
```powershell
# MySQL (if not already running)
Start-Process -FilePath "C:\xampp\mysql_start.bat" -WorkingDirectory "C:\xampp"

# Tomcat — MUST set JAVA_HOME to the real JDK, not javapath
$env:JAVA_HOME = "C:\Program Files\Java\jdk-18.0.2.1"
$env:CATALINA_HOME = "C:\Users\mohit\Downloads\apache-tomcat-8.5.99-windows-x64\apache-tomcat-8.5.99"
& "$env:CATALINA_HOME\bin\catalina.bat" start
# (running this from git-bash directly, not through PowerShell's Start-Process, has been the
# reliable path in this session — PowerShell's Start-Process sometimes silently hangs)

# Frontend
cd D:\Saarthi\Saarthi\frontend
npm run dev   # picks a free port starting at 5173; check the log for which one
```
To redeploy backend changes: recompile with `javac` (classpath = Tomcat's `servlet-api.jar` + everything in `backend/WebContent/WEB-INF/lib/*.jar`), copy `WebContent/WEB-INF/classes/com` into `webapps/saarthi/WEB-INF/classes/`, then `catalina.bat stop` + `catalina.bat start` (a plain reload isn't enough — classloader caches the old `db.properties`-triggered static-init failures etc).

**Gotcha:** `backend/WebContent/WEB-INF/classes/db.properties` lives in the compiled-output folder, not under `src/`. It's real (gitignored, `.example` committed) but a careless `rm -rf classes/*` during a rebuild will delete it — recreate from `db.properties.example` if `db.properties not found on classpath` errors reappear. Current `db.url` includes `?useUnicode=true&characterEncoding=UTF-8` — needed after we found the ₹ symbol getting mangled (see below).

## Backend — done (all modules except Chatbot)
Every module in `PLAN.md`'s build order is implemented and compiles clean: Auth, Profile, **EligibilityService** (the core matching engine — SRS §5.1–5.3, rule evaluation/confidence scoring/ranking), Scheme Explorer + Detail, Dashboard/Match, Checklist (dedup algorithm §5.4), Bookmarks, Notifications (trigger algorithm §5.5, piggybacks on dashboard load since there's no cron/scheduler in this stack), and Admin (scheme/rule/document CRUD with full audit trail, FR9.x — including `GET /api/admin/schemes` list and `GET /api/admin/schemes/{id}` detail, added this session for the upcoming Admin frontend page).

**Real bugs found and fixed this session (worth knowing about, not just historical):**
1. `AuthFilter`'s admin-route gate used `getServletPath().startsWith("/api/admin/")` — for a wildcard servlet mapping (`/api/admin/*`), `getServletPath()` returns `/api/admin` with **no trailing slash**, so `startsWith` never matched and any authenticated user (not just admins) could hit admin endpoints. Fixed to `path.equals("/api/admin")`. If you add more wildcard-mapped controllers, check this pattern.
2. `AdminController` returned raw model objects to Gson (see the `java.time` note above) — fixed with DTOs, same pattern every other controller uses.
3. XAMPP's `mysql.exe` on Windows defaults to `cp850` client charset, silently mangling non-ASCII text (₹) on import via the CLI. Always import with `--default-character-set=utf8mb4`. The JDBC URL now also explicitly sets UTF-8.
4. **CSV data-corruption bug** (see Dataset section below) — unquoted commas in research-agent-generated CSV fields silently misaligned columns on import.

Chatbot (Module 8) is explicitly deferred per `PLAN.md` — don't build it unless asked.

## Dataset — 52 real, verified schemes seeded
Sourced via 4 parallel research agents (per `DATASET_PLAN.md`'s "batches of 15-20" pacing), each actually fetching live government/ministry pages (myscheme.gov.in's detail pages are a JS SPA that WebFetch can't read — agents fell back to ministry sites, PIB releases, official portals per the plan's own fallback rule). Central schemes across all 6 categories + Maharashtra state schemes (MJPJAY, Ramai Awas Yojana, EBC Scholarship, Sanjay Gandhi Niradhar Anudan Yojana, Manodhairya Yojana, Lek Ladki Yojana, Namo Shetkari Mahasanman Nidhi Yojana).

**Known schema limitation, not silently patched:** eligibility rules are AND-only (SRS §5.1) — Stand-Up India's real eligibility is SC/ST *or* women, so only the SC/ST path got encoded as a hard rule; the women's path is description-only. Worth revisiting if that scheme matters for a demo.

**Data pipeline files** (`data/seed/`): `schemes*.csv` / `eligibility_rules*.csv` / `required_documents*.csv` (base + `_batch2`/`_batch3`/`_batch4` suffixes) are the source of truth; `import_seed.py` generates `seed.sql` from them (dedupes by exact scheme name — **note: this only catches exact-string dupes**, we hit two near-duplicate schemes with slightly different names that slipped through and had to be cleaned up manually in the DB). `seed.sql` is disposable/regeneratable — **always re-run `import_seed.py` after editing any CSV**, and **always import with `--default-character-set=utf8mb4`**.

**If you add more scheme batches:** run a column-count audit first (`csv.reader` row length vs. expected column count, per CSV type) before importing — this is exactly how we caught the corruption bug this session. Unquoted commas in free-text fields (descriptions, rule_description) are the recurring failure mode from research agents; don't trust CSV quoting from external sourcing without checking.

The user stopped two more research agents mid-run (targeting Pension/Welfare/Disability and more Maharashtra schemes, toward `DATASET_PLAN.md`'s 80+ target) — currently paused, not resumed. Ask before restarting dataset expansion; the user has toggled this on/off a few times in this session.

## Frontend — MVP loop + most pages done
Vite + React scaffolded at `D:\Sarthi\frontend`. Design tokens (colors, Fraunces/Inter fonts, shadows, shape language) carried over exactly from `extras/user onboarding/00-design-system.md` and `extras/app modules/00-design-system-extension.md` into a Tailwind v4 `@theme` block in `src/index.css`. **Gotcha:** in Tailwind v4, `@import url(...)` for external fonts must come **before** `@import "tailwindcss"` in the CSS file — the latter expands inline, so anything textually after it in the source ends up after real content in the flattened output, which violates CSS's "imports must be first" rule.

**Pages built and wired into `App.jsx`:** Login, Signup, Forgot Password (UI-only — no backend endpoint exists for this yet, intentionally deferred), 6-step Onboarding wizard, Dashboard, Scheme Explorer, Scheme Detail (Overview/Eligibility/Documents/How to Apply tabs), Checklist, Bookmarks, Notifications, Profile. Shared components: `AppShell` (nav bar + notification dropdown + profile menu), `SchemeCard`, `CategoryChips`, `AuthLayout`.

**Verified end-to-end in real headless-Chromium sessions** (Playwright, installed as a dev dependency — `frontend/e2e-drive.mjs` and `frontend/smoke-test.mjs` are reusable smoke-test scripts, not one-off scratch files): fresh signup → onboarding → dashboard with correctly-matched scheme cards, plus every other page — zero console errors, zero 5xx responses, screenshots checked against the design spec by actually looking at them, not just trusting "it rendered."

**NOT yet built:**
- **Admin frontend page** — backend is ready (`GET/POST/PUT/DELETE /api/admin/schemes[/{id}]`, `.../rules[/{id}]`, `.../documents[/{id}]`), just needs the React page. Per `extras/app modules/09-admin-panel.md`: dark-sidebar utilitarian style (deliberately NOT the citizen app's light claymorphism — don't "fix" this), dense data table, slide-over edit drawer. This was the very next thing in progress when this session ended.
- Chatbot widget (deferred per plan, same as backend).
- Guest-mode browsing (FR4.1 says Explorer/Scheme Detail should work for logged-out Guests too) — currently both are behind `ProtectedRoute` as a scope cut. If you build guest mode, the nav bar also needs a logged-out variant (Log in / Create account buttons instead of bell/avatar) per the design ext. doc.
- Forgot Password has no real backend endpoint — `password_reset_tokens` table exists in schema but no `AuthService`/`AuthController` method uses it yet.

## Things NOT to re-ask the user about (already decided)
- Stack choices (Eclipse/Tomcat/no Maven/no Hibernate/XAMPP MySQL, JWT not sessions) — confirmed, don't re-litigate.
- Chatbot: deferred, don't build early.
- Admin panel styling: deliberately utilitarian/dark-sidebar, not claymorphism.
- Dataset: 52 schemes seeded so far (Central + Maharashtra), target 80+ per `DATASET_PLAN.md` but expansion is currently paused per the user's own back-and-forth this session — ask before resuming.
- Brand name is **Saarthi** — if you see "AI Sarkari Saathi" anywhere, it's stale.
- Git: repo initialized, `.gitignore` covers `.metadata/` (Eclipse workspace), `node_modules/`, `db.properties`. Several commits made locally. **The `git push` to `https://github.com/Mohit30121011/Saarthi.git` was blocked by an auto-mode safety classifier (flagged as "data exfiltration")** — this has not been resolved; the user needs to either push it themselves or grant the Bash permission explicitly. Don't retry it silently.

## Immediate next action when you resume
**Admin frontend page core CRUD loop is built and verified end-to-end** (schemes list, edit drawer, eligibility rules sub-editor, required documents sub-editor, add-scheme flow — all tested live through a real browser session this session, not just code review). Some secondary spec items from `extras/app modules/09-admin-panel.md` are still missing (listed below). Read that spec doc before continuing.

**Built and verified working (Sep 15 2026 session):**
- `frontend/src/api/admin.js` — API client for all `/api/admin/*` endpoints, matches `backend/src/com/saarthi/controller/AdminController.java`'s DTO shapes 1:1.
- `frontend/src/components/AdminRoute.jsx` — route guard, redirects to `/dashboard` if `user?.role !== 'ADMIN'`.
- `frontend/src/components/admin/AdminLayout.jsx` — dark sidebar shell (`bg-saarthi-ink` `#10241A`, per spec §2). Nav items: Dashboard, Schemes. Spec also wants Eligibility Rules + Audit Log as separate nav items — not added (both are reachable today via the Schemes drawer instead).
- `frontend/src/pages/admin/AdminDashboard.jsx` — placeholder only (just a link to Schemes). Spec §2.1's 4 stat tiles + recent-activity audit table are NOT built.
- `frontend/src/pages/admin/AdminSchemes.jsx` — dense table (name/state/status-dot/last-verified) + free-text search, "+ Add Scheme" button. Status-dot logic (Active/Inactive/Needs Verification, >180 days since `verifiedAt` = stale) is my own interpretation of spec intent, not backed by an actual backend staleness rule — fine as-is unless the user says otherwise.
- `frontend/src/components/admin/SchemeDrawer.jsx` — 480px right-side slide-over, scrim + Escape-to-close, all `schemes` form fields, a visually distinct Verification section (source_url + verified_at + "Mark as verified today" quick action per FR9.4), plus inline Eligibility Rules and Required Documents sub-editors (each row: fill fields → per-row Save hits `addRule`/`updateRule`/`deleteRule` or the document equivalents immediately). New rows are **local drafts until Saved** — don't auto-POST on "+ Add rule"/"+ Add document" click, because the backend's `value`/`document_name` columns are `NOT NULL` and the controller's `getString()` helper turns empty strings into `null`, which throws a raw `SQLException` → bare 500 with no server-side log line (the catch blocks in `AdminController` swallow the exception without logging — worth fixing if this bites again, search for `catch (SQLException e)` in that file). Main scheme "Save" closes the drawer on edit (spec §3); on create it stays open so rules/documents can be added against the newly-created scheme's id.
- `App.jsx` routes: `/admin`, `/admin/schemes`, gated behind `AdminRoute`.

**Verified this session, live, against a real running stack** (MySQL via XAMPP, Tomcat 8.5.99 with the real JDK, `npm run dev`): registered a real user via `/api/auth/register`, promoted to ADMIN via SQL, logged in, and drove the actual UI with Playwright — scheme list loads all 52 seeded schemes, edit-drawer opens with correct data, editing a field and saving persists (confirmed by reopening), adding+saving a new eligibility rule and a new required document both persist, and the full Add Scheme flow (create → drawer stays open → add rule/document against the new id) works. Zero console errors, zero 5xx on the clean run. **Test data was cleaned up afterward** — no leftover "Playwright Test..." rows, scheme 22's real data (including a ₹ symbol) was restored via the backend API (not raw mysql CLI, which re-triggered the exact cp850-mangling gotcha already documented below — always go through the JDBC-backed API or file-based `--data-binary` for anything with ₹, never inline `mysql -e "...₹..."` on Windows).

**NOT built yet:**
1. **Category/State/Status filter dropdowns** in the Schemes toolbar (spec §2.2.2) — only free-text search exists.
2. **Audit Log page + Dashboard stat tiles** (spec §2.1) — not started; the backend audit trail (`admin_scheme_audit` via `AdminAuditDAO`) already exists and is being written to (FR9.3), it just isn't surfaced in the UI yet.
3. **Separate Eligibility Rules / Audit Log sidebar nav items** (spec §2) — currently folded into the Schemes drawer instead of standalone pages.
4. **Focus trap** in the drawer is not fully implemented (focuses the first input on open, restores nothing specific on close) — spec §4 wants a real trap + focus restoration to the triggering row.

After those, per `PLAN.md`'s remaining Phase 3 item: UI polish pass, plus whatever's left of the guest-mode/dataset-expansion scope cuts above if the user asks for them.
