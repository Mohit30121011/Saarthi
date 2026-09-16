# Saarthi — Project Structure

**Rule:** no controller touches the database directly. Every controller calls a **service**, every service calls one or more **DAOs**, and only DAOs run SQL. Verified: 0 raw JDBC/SQL references outside `dao/` across all 8 controllers.

## Folder tree

```
Saarthi/
├── backend/
│   ├── src/com/saarthi/
│   │   ├── controller/    8   servlets — HTTP, RBAC checks, call services, write JSON (never a raw model object, see Gson gotcha below)
│   │   ├── service/       8   business logic: eligibility matching, checklist dedup, notification triggers, admin audit trail
│   │   ├── dao/          10   JDBC only: queries, no business logic
│   │   ├── model/         9   domain entities (User, Scheme, EligibilityRule, Bookmark, etc.)
│   │   ├── filter/        1   AuthFilter — JWT verification + role gate for /api/admin/*
│   │   └── util/          4   DB pool, JSON (Gson) helpers, JWT, password hashing
│   │
│   └── WebContent/
│       ├── assets/              built frontend bundle (JS/CSS, copied in from frontend/dist on deploy)
│       ├── WEB-INF/
│       │   ├── web.xml
│       │   ├── classes/         compiled backend output + db.properties (gitignored, see .example)
│       │   └── lib/             manual JARs — no Maven/Gradle (gson, jjwt, jbcrypt, mysql-connector, jackson, jaxb-api)
│       └── index.html           entry point Tomcat serves at context root; API calls go to /saarthi/api/*
│
├── frontend/                    Vite + React 18 + Tailwind v4 (CSS-first @theme, no tailwind.config.js)
│   └── src/
│       ├── api/            9   one file per backend resource (auth, schemes, bookmarks, checklist, match, notifications, profile, admin, client.js = axios instance + interceptors)
│       ├── pages/          7   citizen-facing routes (Dashboard, SchemeExplorer, SchemeDetail, Checklist, Bookmarks, Notifications, Profile)
│       │   ├── auth/       3   Login, Signup, ForgotPassword
│       │   ├── onboarding/ 1   6-step OnboardingWizard
│       │   └── admin/      2   AdminDashboard, AdminSchemes
│       ├── components/     6   AppShell (nav), SchemeCard, CategoryChips, AuthLayout, ProtectedRoute, AdminRoute
│       │   └── admin/      2   AdminLayout (dark sidebar), SchemeDrawer (slide-over edit + rules/documents sub-editors)
│       ├── context/        1   AuthContext — token/user state, localStorage-backed
│       ├── data/           1   static lookup data (e.g. Indian districts)
│       └── assets/               images used by the app (hero art, logo, icons)
│
├── data/seed/                   dataset pipeline — schemes/eligibility_rules/required_documents CSVs (+ _batch2/3/4)
│   └── import_seed.py           generates seed.sql from the CSVs; re-run after editing any CSV
│
├── extras/                      reference material — not live code, not required reading to build/run
│   ├── app modules/             Stitch UI-generation prompts for the logged-in app (dashboard, explorer, admin, etc.)
│   ├── user onboarding/         Stitch UI-generation prompts + the shared design-system source for auth/onboarding
│   ├── stitch_screens/          rendered mockup exports (.html/.jpg/.png) from the Stitch prompts above
│   └── *.docx / *.pdf / *.html  stale/duplicate SRS + synopsis exports superseded by SRS.md and Saarthi_Synopsis.md
│
├── build/                       Eclipse build output (gitignored)
├── .metadata/ .settings/ .project .classpath   Eclipse workspace files (gitignored except .project/.classpath)
│
└── *.md (root)                  RESUME.md, PLAN.md, SRS.md, DATASET_PLAN.md, Saarthi_Synopsis.md, README.md, PROJECT_STRUCTURE.md (this file)
```

## Backend layer map (controller → service → dao)

| Controller | Service | DAO(s) it wraps |
|---|---|---|
| `AuthController` | `AuthService` | `UserDAO` |
| `ProfileController` | `ProfileService` | `ProfileDAO` |
| `SchemeController` | `SchemeService` | `SchemeDAO`, `EligibilityRuleDAO`, `DocumentDAO` |
| `MatchController` | `EligibilityService` | `SchemeDAO`, `EligibilityRuleDAO`, `SchemeMatchSnapshotDAO`, `ProfileDAO` |
| `ChecklistController` | `ChecklistService` | `ChecklistItemStateDAO`, `DocumentDAO`, `SchemeMatchSnapshotDAO` |
| `BookmarkController` | `BookmarkService` | `BookmarkDAO` |
| `NotificationController` | `NotificationService` | `NotificationDAO`, `SchemeMatchSnapshotDAO` |
| `AdminController` | `AdminService` | `SchemeDAO`, `EligibilityRuleDAO`, `DocumentDAO`, `AdminAuditDAO` |

`EligibilityService` is the core matching engine (SRS §5.1–5.3 — rule evaluation, confidence scoring, ranking). `AdminService` is the only service that writes to `AdminAuditDAO` on every mutation, producing the audit trail FR9.3 requires.

## Known gotchas baked into this structure (don't "fix" without re-reading why)

- **Gson can't serialize `java.time.LocalDate`/`LocalDateTime`** on modern JDKs — every controller response is a plain static DTO with String/primitive fields, never a raw model object. Gson also silently serializes anonymous/local classes as `"null"` — DTOs must be named static classes.
- **`AuthFilter`'s admin gate** checks `req.getPathInfo()`-derived path equals `/api/admin` exactly — `getServletPath().startsWith(...)` looks correct but breaks on wildcard servlet mappings (no trailing slash on the base path). This was a real authz bug once; don't revert the pattern.
- **JDK vs. `javapath`:** always build/run with `C:\Program Files\Java\jdk-18.0.2.1` explicitly, never the `javapath` shim — see `RESUME.md` for why.
- **No Maven/Gradle** — JARs in `WebContent/WEB-INF/lib/` are managed by hand.
- **`backend/WebContent/assets/`** currently has many stale hashed Vite build outputs from repeated manual deploys (`index-XXXXXXXX.js/css`). This directory should really only ever hold the *current* build — worth pruning next time someone touches deploy, not urgent.

## Frontend conventions

- One API file per backend resource in `src/api/`, each just wrapping the shared `client.js` axios instance (JWT attached via interceptor, 401 → redirect to `/login`).
- Route guards: `ProtectedRoute` (must be authenticated) and `AdminRoute` (must be authenticated + `role === 'ADMIN'`) wrap route groups in `App.jsx`, not individual pages.
- Citizen app uses the light/warm claymorphism design system (`extras/user onboarding/00-design-system.md` + `extras/app modules/00-design-system-extension.md`). Admin panel deliberately uses a **separate** dark-sidebar utilitarian style (`extras/app modules/09-admin-panel.md`) — never merge the two visual languages.
