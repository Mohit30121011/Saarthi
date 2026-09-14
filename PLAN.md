# Saarthi — Implementation Plan (v2, revised stack)

Stack change from v1: **Eclipse IDE, Java 18, Tomcat 8.5.99, no Maven, no
Hibernate.** Chatbot module still deferred.

---

## 0. Environment reality check (re-verified 2026-09-14)

| Tool | Status | Action needed |
|---|---|---|
| Eclipse IDE | **Found** — `C:\Program Files (x86)\eclipse` | None (assumed to be Eclipse IDE for Enterprise Java, else may need the "Web Tools Platform" feature installed for Dynamic Web Project support — see Open Points) |
| JDK 18 | Installed (`java -version` → 18.0.2.1) | None |
| Tomcat 8.5.99 | **Found** — downloaded & extracted at `C:\Users\mohit\Downloads\apache-tomcat-8.5.99-windows-x64\` (standalone, not yet registered as an Eclipse server runtime or Windows service) | Register as an Eclipse server runtime when Phase 1 starts |
| XAMPP | **Found** — installed at `C:\xampp`, bundles its own MySQL (technically MariaDB under the hood) and its own separate Tomcat | See Open Point 1 — which MySQL/Tomcat to actually use |
| MySQL Connector/J | **Found** — `mysql-connector-j-9.7.0.zip` already in Downloads | Extract the `.jar` into `WEB-INF/lib` |
| Maven | N/A — intentionally not using it | — |
| Node/npm | Installed | None (unaffected — frontend stack unchanged) |

**Important compatibility note on the stack choice:** Tomcat 8.5.x implements
Servlet 3.1 / JSP 2.3 and uses the **`javax.servlet.*`** package namespace (this is
pre-Jakarta-EE; the `jakarta.*` rename only happened from Tomcat 10 onward). Tomcat
8.5 also reached end-of-life (no more security patches) in March 2024. Running it
on JDK 18 generally works fine for plain servlets/JDBC (nothing about Servlet 3.1
depends on a specific JDK version), but it's outside Tomcat's officially tested
JDK range — noting as a known risk, not a blocker, since this is your explicit
choice and a common real-world classroom combination.

---

## 1. Tech stack — final decisions

| Layer | Choice | Why |
|---|---|---|
| IDE | **Eclipse IDE for Enterprise Java and Web Developers** | As specified |
| Backend runtime | **Servlets on Tomcat 8.5.99**, `javax.servlet.*` namespace | As specified |
| Build | **No Maven** — Eclipse "Dynamic Web Project", manual JAR management in `WEB-INF/lib` | As specified |
| Data access | **Plain JDBC** (`PreparedStatement`, try-with-resources), no Hibernate | As specified |
| DB | MySQL 8.x | As specified |
| DB connectivity | `DriverManager.getConnection()` per request via a small `DBUtil` class reading a `db.properties` file — no JNDI pool, no ORM | Simplest thing that works without Maven; upgrade path to a connection pool exists later if needed |
| JSON | **Gson** (single JAR, no transitive dependencies) | Manual JAR management makes zero/low-dependency libraries important; Gson beats Jackson here |
| Password hashing | **jBCrypt** (`org.mindrot:jbcrypt`, single JAR) | Small, no dependencies, does exactly one job |
| Auth mechanism | **JWT** — via `jjwt-0.9.1.jar` (needs `jackson-databind`, `jackson-core`, `jackson-annotations` alongside it) | As the synopsis specifies; accepted the extra ~4 JARs |
| Frontend | React 18 + Vite + Axios + React Router + Framer Motion | Unchanged from v1 — this stack change is backend-only |

### Why no Maven/Hibernate changes the shape of the backend
- Every third-party JAR is downloaded manually and dropped into
  `WebContent/WEB-INF/lib`. Fewer, smaller, dependency-free JARs are strongly
  preferred over "convenient" libraries that drag in 5 transitive JARs.
- DAOs write raw SQL directly (`PreparedStatement`) instead of HQL/JPQL. This is
  actually *more* aligned with the synopsis's "strict MVC2, DAO = all SQL" rule
  than Hibernate would have been — there's no ORM magic blurring where SQL lives.
- POJOs are populated manually from `ResultSet` rows in the DAO (no
  reflection-based ORM mapping) — matches the synopsis's Model layer spec exactly
  ("POJOs are created and populated [in the Model layer]").

---

## 2. Eclipse project structure

Two Eclipse projects, one Tomcat server, one MySQL DB:

```
Saarthi-Backend/              (Eclipse Dynamic Web Project, Tomcat 8.5)
├── src/                              (maps to WEB-INF/classes)
│   └── com/saarthi/
│       ├── controller/               # HttpServlet classes, @WebServlet annotated
│       │   ├── AuthController.java
│       │   ├── ProfileController.java
│       │   ├── MatchController.java
│       │   ├── SchemeController.java
│       │   ├── ChecklistController.java
│       │   ├── BookmarkController.java
│       │   ├── NotificationController.java
│       │   └── AdminController.java
│       ├── service/                  # business logic, no SQL
│       │   ├── AuthService.java
│       │   ├── ProfileService.java
│       │   ├── EligibilityService.java   (matching engine)
│       │   ├── SchemeService.java
│       │   ├── ChecklistService.java
│       │   ├── BookmarkService.java
│       │   ├── NotificationService.java
│       │   └── AdminService.java
│       ├── dao/                      # all SQL lives here, only here
│       │   ├── UserDAO.java
│       │   ├── ProfileDAO.java
│       │   ├── SchemeDAO.java
│       │   ├── EligibilityRuleDAO.java
│       │   ├── DocumentDAO.java
│       │   ├── BookmarkDAO.java
│       │   └── NotificationDAO.java
│       ├── model/                    # POJOs — User, Scheme, UserProfile, etc.
│       ├── filter/                   # AuthFilter (validates session/JWT), CORSFilter (dev only)
│       └── util/                     # DBUtil, PasswordUtil, JsonUtil (Gson wrapper), AuthUtil
├── WebContent/
│   ├── WEB-INF/
│   │   ├── lib/                      # manually-downloaded JARs (see Section 3)
│   │   ├── web.xml                   # filter mappings, error pages (servlets are annotation-based)
│   │   └── classes/db.properties     # db url/user/pass (gitignored, .example committed)
│   └── META-INF/
└── (deployed as ROOT.war or /api context to Tomcat 8.5 webapps/)

Saarthi-Frontend/             (plain folder, opened in VS Code or Eclipse, not a Dynamic Web Project)
├── src/
├── package.json
└── vite.config.js                    # dev proxy: /api/* -> http://localhost:8080
```

### Required JARs (manual download into `WEB-INF/lib`)
| JAR | Purpose |
|---|---|
| `mysql-connector-j-9.7.0.jar` | JDBC driver (already downloaded) |
| `gson-2.x.x.jar` | JSON serialization |
| `jbcrypt-0.4.jar` | Password hashing |
| `jjwt-0.9.1.jar` | JWT issuing/parsing |
| `jackson-databind-2.x.jar`, `jackson-core-2.x.jar`, `jackson-annotations-2.x.jar` | Required by `jjwt-0.9.1` for JSON (de)serialization |

7 JARs total, each downloaded individually — no transitive dependency resolution
since there's no Maven, so each one is grabbed by hand from Maven Central's direct
download links.

---

## 3. Request flow (concrete example, matches synopsis's strict MVC2 rules)

```
React <Dashboard/> --axios.get("/api/match/my-schemes")--> 
MatchController (@WebServlet("/api/match/my-schemes"))
  doGet(): reads JWT/session, gets userId, calls
    matchService.getPersonalizedMatches(userId)
  writes JSON response via JsonUtil (Gson) — no SQL, no POJO construction here
    ↓
EligibilityService.getPersonalizedMatches(userId)
  profileDAO.getProfileByUserId(userId)
  schemeDAO.getAllActiveSchemes()
  for each scheme: eligibilityRuleDAO.getRulesForScheme(id), evaluate AND-logic
  returns List<SchemeMatch> POJOs — all business logic here, no SQL
    ↓
SchemeDAO / ProfileDAO / EligibilityRuleDAO
  PreparedStatement + DBUtil.getConnection() + manual ResultSet -> POJO mapping
  all SQL lives here, only here
```

---

## 4. Module build order (unchanged priority from v1, adapted to this stack)

### Phase 1 — Foundation + Core Loop
1. Eclipse project setup, Tomcat 8.5 server runtime configured, MySQL schema created,
   "hello world" servlet round-trip verified end-to-end (React → Tomcat → MySQL → back)
2. Module 1 — Auth (register/login, password hashing, token/session issuance)
3. Module 2 — Profile & Onboarding
4. Data pipeline executed (see DATASET_PLAN.md), DB seeded with real schemes
5. Module 3 — Eligibility Matching Dashboard (core value prop)
6. Module 5 — Scheme Detail page

→ End of Phase 1: sign up → build profile → see real, correctly-matched schemes
with real eligibility explanations. This is the demoable MVP.

### Phase 2 — Roundout
7. Module 4 — Scheme Explorer/Search
8. Module 6 — Document Checklist Generator
9. Module 7 — Bookmarks

### Phase 3 — Admin & polish
10. Module 9 — Admin/Data Management (becomes the real "keep data fresh" mechanism)
11. Module 10 — Notifications
12. UI polish pass (dark mode, glassmorphism, micro-animations) — after function works

### Deferred
- Module 8 — AI Chatbot (explicitly skipped)
- Everything already in the synopsis's "Future Scope" section

---

## 5. Decisions locked in (2026-09-14)

1. **Servers**: standalone Tomcat 8.5.99 (from Downloads, registered as an
   Eclipse server runtime) + XAMPP's MySQL/MariaDB (phpMyAdmin used for visual
   DB inspection).
2. **Auth**: JWT, via `jjwt-0.9.1` + its Jackson dependencies (Section 2 above).
3. **Eclipse**: confirmed to already have WTP (Web Tools Platform) installed —
   `org.eclipse.wst.server.*` and `org.eclipse.jst.server.tomcat.ui` plugins are
   present, so Dynamic Web Project + Tomcat server integration works out of the
   box, no additional Eclipse features needed.
4. **Dataset size**: 80+ schemes (see DATASET_PLAN.md — this raises the
   verification workload accordingly).
5. Phase 1 scope (Auth + Profile + Matching Dashboard + Scheme Detail) stands as
   the first build target.

No remaining open points — ready to start Phase 1 execution.
