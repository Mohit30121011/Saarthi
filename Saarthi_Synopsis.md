# PROJECT SYNOPSIS

# **SAARTHI**

### *India's First Personalized Government Scheme Discovery Platform*

> Every scheme you qualify for — found, explained, and ready to apply — all in one place, tailored to **you**.

---

**SUBMITTED BY**

| Name          | Roll No. |
| ------------- | -------- |
| Khushi Singh  | 261713   |
| Mohit Gupta   | 261715   |

**Year:** 2026

---

## Table of Contents

1. [Problem Statement](#1--problem-statement)
2. [Objective](#2--objective)
3. [Proposed Solution](#3--proposed-solution)
4. [System Architecture — Strict MVC2](#4--system-architecture--strict-mvc2)
5. [Technology Stack](#5--technology-stack)
6. [Modules](#6--modules)
7. [UI / UX Design Philosophy](#7--ui--ux-design-philosophy)
8. [Database Design Overview](#8--database-design-overview)
9. [API Design](#9--api-design)
10. [AI Chatbot — Supporting Feature](#10--ai-chatbot--supporting-feature)
11. [Uniqueness & Differentiators](#11--uniqueness--differentiators)
12. [Future Scope](#12--future-scope)

---

## 1.  Problem Statement

India runs **thousands** of Central and State Government welfare schemes covering education, employment, healthcare, agriculture, housing, and financial assistance. Despite this vast ecosystem, a large majority of eligible citizens **never benefit** from these schemes simply because they are unaware that such schemes exist or apply to their situation.

### Core Issues Faced by Citizens

| # | Problem | Impact |
|---|---------|--------|
| 1 | **Scattered information** — scheme details are spread across dozens of disconnected government portals, PDFs, and notices, with no single point of reference. | Citizens give up before even starting their search. |
| 2 | **Confusing government websites** — official portals are often text-heavy, poorly structured, and not designed for an average citizen to navigate easily. | High bounce rates; only digitally-literate users can access welfare. |
| 3 | **Complex eligibility conditions** — eligibility criteria are written in legal or bureaucratic language that is difficult for a layperson to interpret correctly. | Eligible citizens self-exclude, assuming they don't qualify. |
| 4 | **Lack of clarity on documentation** — citizens frequently do not know which documents are required until after starting the application, causing delays and rejections. | Wasted time, repeated office visits, and abandoned applications. |
| 5 | **No clear application path** — even when a citizen identifies a relevant scheme, they often do not know where or how to apply. | Missed deadlines and unclaimed benefits. |
| 6 | **No personalization** — existing portals show all schemes to all users with no filtering by individual circumstances, making discovery a needle-in-a-haystack exercise. | Information overload; users cannot identify what is relevant to *them*. |

### The Result

Welfare benefits meant for the public frequently go **unclaimed**, while citizens who need them most — students, farmers, low-income families, and small business owners — remain excluded due to an **information gap** rather than actual ineligibility.

> **The problem is not a lack of schemes. The problem is a lack of a bridge between the citizen and the scheme.**

---

## 2.  Objective

The primary objective of **Saarthi** is to become the **single destination** where any Indian citizen can discover, understand, and apply to every government scheme they are eligible for — **personalized to their own profile**.

### Specific Objectives

| # | Objective |
|---|-----------|
| 1 | To **aggregate** all Central and State Government schemes into a single, searchable, and browsable platform. |
| 2 | To allow users to **create a personal profile** (age, state, income, occupation, category, gender, education, etc.) and have the platform **automatically surface** matching schemes. |
| 3 | To present schemes with **clear, plain-language explanations** of eligibility, benefits, required documents, and application steps. |
| 4 | To provide **direct, verified links** to official application portals for each matched scheme. |
| 5 | To generate a **consolidated document checklist** across all matched schemes so users know exactly what to prepare. |
| 6 | To offer an **AI-powered chatbot as a supporting feature** for users who prefer conversational discovery or have specific questions about a scheme. |
| 7 | To make scheme discovery accessible to citizens **regardless of their digital literacy level** through a clean, modern, and intuitive interface. |
| 8 | To build a **scalable, maintainable system** on strict MVC2 architecture that can be extended to cover new schemes, states, and features over time. |

---

## 3.  Proposed Solution

**Saarthi** is a **personalized government scheme discovery platform** — not a chatbot, and not another government directory. It is a modern, account-based web application where citizens can:

### 3.1  Core Experience — Personalized Scheme Dashboard

The **primary user journey** is profile-driven, not conversation-driven:

1. **Sign Up / Log In** — the user creates a secure account on the platform.
2. **Build Your Profile** — a clean, guided onboarding flow (similar to how Swiggy asks for your location or Uber asks for your pickup point) collects key attributes:
   - Age / Date of Birth
   - Gender
   - State & District
   - Annual Family Income
   - Occupation (Student, Farmer, Self-Employed, Salaried, etc.)
   - Category (General, OBC, SC, ST, EWS)
   - Education Level
   - Disability Status (if applicable)
   - Any other relevant fields
3. **Your Schemes — Personalized Dashboard** — the moment the profile is saved, the platform runs an **eligibility matching engine** and presents a **personalized dashboard** showing:
   - **Total schemes you qualify for** (with a prominent count)
   - **Schemes grouped by category** (Education, Healthcare, Housing, Financial Aid, Agriculture, Employment, etc.)
   - **Each scheme card** showing: scheme name, issuing authority, key benefit summary, and a match confidence indicator
4. **Scheme Detail Page** — clicking any scheme card opens a detailed view with:
   - Plain-language eligibility explanation (*"You qualify because you are under 25, a student, and from Maharashtra"*)
   - Full list of benefits
   - Required documents (with checklist toggle)
   - Step-by-step application process
   - Direct link to official portal
   - Related/similar schemes
5. **Consolidated Document Checklist** — a single page that merges all document requirements across every matched scheme, de-duplicated and organized, so the user can prepare everything at once.
6. **Profile Updates = Real-Time Re-matching** — when a user updates their profile (e.g., changes state, updates income), the dashboard instantly recalculates and surfaces new/removed scheme matches.

### 3.2  Supporting Feature — AI Chatbot Assistant

In addition to the dashboard-first experience, the platform includes an **AI-powered chatbot** as a **secondary, supporting feature**:

- Accessible via a floating chat icon on any page (similar to customer support chat widgets on modern apps).
- Users can ask **natural-language questions** like:
  - *"Am I eligible for PM Kisan?"*
  - *"What scholarships can I get as an OBC student in UP?"*
  - *"What documents do I need for Ayushman Bharat?"*
- The chatbot uses the user's saved profile data (if logged in) to give **contextual, personalized answers**.
- For users who are **not logged in**, the chatbot can ask follow-up questions to gather profile data on the fly and suggest schemes conversationally.
- The chatbot is powered by **OpenAI / Gemini API** with **prompt engineering** tuned specifically for government scheme eligibility logic.

> **The chatbot enhances the experience — it does not define it. The platform's value exists entirely without the chatbot.**

### 3.3  Additional Features

| Feature | Description |
|---------|-------------|
| **Scheme Explorer / Browse** | Full searchable, filterable catalog of all schemes — browse by state, category, ministry, target group, etc. |
| **Bookmarked Schemes** | Users can save schemes they're interested in to revisit later. |
| **Application Tracker** (Future) | Track the status of applications the user has submitted. |
| **Notifications** | Alert users when new schemes are added that match their profile, or when deadlines approach. |
| **Multi-language Support** (Future) | Hindi and regional language interfaces for wider accessibility. |

---

## 4.  System Architecture — Strict MVC2

The entire application is built on **strict MVC2 (Model 2) architecture**, ensuring a clean separation of concerns with **no violations**.

### 4.1  MVC2 Rules Enforced

| Layer | Responsibility | Strict Rules |
|-------|---------------|--------------|
| **Controller (Servlet)** | Receives HTTP requests, delegates to Model, selects View. | **No SQL queries.** **No POJO initialization or business logic.** **No direct database access.** Only request parsing, calling Service/Model methods, and forwarding to View. |
| **Model (Business Logic + DAO)** | All business logic, data access, eligibility computation. | Service classes contain business logic. DAO classes handle all SQL operations via plain JDBC (`PreparedStatement`). POJOs/Beans are created and populated here, manually mapped from `ResultSet` rows. Complete separation between Service (logic) and DAO (data). |
| **View (React / JSP)** | Renders the user interface. | **No SQL queries.** **No Java scriptlets** (`<% ... %>`) **in JSP** — only JSTL (`<c:forEach>`, `<c:if>`, etc.) and EL (`${...}`). **No business logic.** React components fetch data via REST APIs served by Servlets. JSP pages (where used) display data via JSTL + EL only. |

### 4.2  Architecture Diagram

```
+---------------------------------------------------------------------+
|                         CLIENT (Browser)                             |
|                                                                      |
|   +--------------------------------------------------------------+  |
|   |                    VIEW LAYER (React.js)                      |  |
|   |                                                               |  |
|   |  * React Components (Dashboard, SchemeCard, SchemeDetail,     |  |
|   |    Profile, ChatWidget, Explorer, Checklist)                  |  |
|   |  * React Router for SPA navigation                           |  |
|   |  * Axios for HTTP requests to REST APIs                      |  |
|   |  * NO business logic -- only rendering & user interaction     |  |
|   |  * Modern UI: glassmorphism, micro-animations, dark mode     |  |
|   +-----------------------------+--------------------------------+  |
+---------------------------------|------------------------------------+
                                  |  HTTP (JSON)
                                  v
+---------------------------------------------------------------------+
|                     APACHE TOMCAT SERVER                             |
|                                                                      |
|   +--------------------------------------------------------------+  |
|   |               CONTROLLER LAYER (Servlets)                     |  |
|   |                                                               |  |
|   |  * SchemeController.java     -> /api/schemes/*                |  |
|   |  * UserController.java       -> /api/users/*                  |  |
|   |  * ProfileController.java    -> /api/profile/*                |  |
|   |  * MatchController.java      -> /api/match/*                  |  |
|   |  * ChatController.java       -> /api/chat/*                   |  |
|   |  * ChecklistController.java  -> /api/checklist/*              |  |
|   |  * AuthController.java       -> /api/auth/*                   |  |
|   |                                                               |  |
|   |  [X] NO SQL    [X] NO POJO init    [X] NO business logic     |  |
|   |  [OK] Parse request -> Call Service -> Return JSON response   |  |
|   +-----------------------------+--------------------------------+  |
|                                 |                                    |
|                                 v                                    |
|   +--------------------------------------------------------------+  |
|   |                  MODEL LAYER                                  |  |
|   |                                                               |  |
|   |  +--------------------------------------------------------+  |  |
|   |  |           SERVICE (Business Logic)                      |  |  |
|   |  |                                                         |  |  |
|   |  |  * SchemeService.java       -- scheme CRUD, search,     |  |  |
|   |  |                                filtering logic          |  |  |
|   |  |  * EligibilityService.java  -- matching engine: compares|  |  |
|   |  |                                user profile vs scheme   |  |  |
|   |  |                                eligibility rules        |  |  |
|   |  |  * UserService.java         -- user registration,       |  |  |
|   |  |                                authentication, profile  |  |  |
|   |  |  * ChatService.java         -- AI API integration,      |  |  |
|   |  |                                prompt construction,     |  |  |
|   |  |                                response parsing         |  |  |
|   |  |  * ChecklistService.java    -- document aggregation     |  |  |
|   |  |                                and de-duplication       |  |  |
|   |  |  * NotificationService.java -- new scheme alerts        |  |  |
|   |  |                                                         |  |  |
|   |  |  [OK] All business rules live here                      |  |  |
|   |  |  [OK] Creates & populates POJOs/Beans                   |  |  |
|   |  |  [OK] Calls DAO for data access                         |  |  |
|   |  +-------------------------+------------------------------+  |  |
|   |                            |                                  |  |
|   |                            v                                  |  |
|   |  +--------------------------------------------------------+  |  |
|   |  |           DAO (Data Access Objects)                     |  |  |
|   |  |                                                         |  |  |
|   |  |  * SchemeDAO.java       -- CRUD for schemes table       |  |  |
|   |  |  * UserDAO.java         -- CRUD for users table         |  |  |
|   |  |  * ProfileDAO.java      -- CRUD for user_profiles table |  |  |
|   |  |  * EligibilityRuleDAO.java -- query eligibility_rules   |  |  |
|   |  |  * DocumentDAO.java     -- query required_documents     |  |  |
|   |  |  * BookmarkDAO.java     -- CRUD for bookmarks           |  |  |
|   |  |  * ChatHistoryDAO.java  -- save/load chat sessions      |  |  |
|   |  |                                                         |  |  |
|   |  |  [OK] ALL SQL operations live here (plain JDBC)          |  |  |
|   |  |  [OK] PreparedStatement + manual ResultSet -> POJO       |  |  |
|   |  |  [OK] Returns POJOs/Beans/Lists to Service layer        |  |  |
|   |  +-------------------------+------------------------------+  |  |
|   |                            |                                  |  |
|   |  +--------------------------------------------------------+  |  |
|   |  |           POJOs / Beans                                 |  |  |
|   |  |                                                         |  |  |
|   |  |  * User.java            * Scheme.java                   |  |  |
|   |  |  * UserProfile.java     * EligibilityRule.java          |  |  |
|   |  |  * Document.java        * Bookmark.java                 |  |  |
|   |  |  * ChatMessage.java     * SchemeMatch.java              |  |  |
|   |  |  * Notification.java    * ChecklistItem.java            |  |  |
|   |  +--------------------------------------------------------+  |  |
|   +--------------------------------------------------------------+  |
+---------------------------------|------------------------------------+
                                  |
                                  v
+---------------------------------------------------------------------+
|                         MySQL DATABASE                               |
|                                                                      |
|   Tables: users, user_profiles, schemes, eligibility_rules,         |
|           required_documents, bookmarks, chat_history,               |
|           notifications, scheme_categories, application_links        |
+---------------------------------------------------------------------+
```

### 4.3  Request Flow — Strict MVC2 Walkthrough

**Example: User opens their personalized scheme dashboard**

```
Step 1 -- VIEW (React)
  |-- User logs in and navigates to /dashboard
  |-- React component <Dashboard /> mounts
  |-- useEffect() calls: axios.get("/api/match/my-schemes", { headers: { Authorization: token } })

Step 2 -- CONTROLLER (MatchController Servlet)
  |-- doGet() receives the request
  |-- Extracts user ID from JWT token in Authorization header
  |-- Calls: List<SchemeMatch> matches = matchService.getPersonalizedMatches(userId)
  |-- Converts result to JSON
  |-- Writes JSON to response: response.getWriter().write(json)
  |-- [X] No SQL here. [X] No POJO construction. [X] No business logic.

Step 3 -- MODEL -- SERVICE (EligibilityService)
  |-- getPersonalizedMatches(userId):
  |-- Calls: UserProfile profile = profileDAO.getProfileByUserId(userId)
  |-- Calls: List<Scheme> allSchemes = schemeDAO.getAllActiveSchemes()
  |-- For each scheme:
       |-- Calls: List<EligibilityRule> rules = eligibilityRuleDAO.getRulesForScheme(schemeId)
       |-- Runs matching logic: compareProfileToRules(profile, rules)
       |-- If match -> creates SchemeMatch POJO with scheme details + match explanation
  |-- Returns: List<SchemeMatch> sorted by relevance
  |-- [OK] All business logic lives here.

Step 4 -- MODEL -- DAO (ProfileDAO, SchemeDAO, EligibilityRuleDAO)
  |-- Each DAO method executes SQL via plain JDBC
  |-- Example: schemeDAO.getAllActiveSchemes()
       |-- Connection conn = DBUtil.getConnection()
       |-- PreparedStatement ps = conn.prepareStatement("SELECT * FROM schemes WHERE is_active = true")
       |-- ResultSet rs = ps.executeQuery()
       |-- while (rs.next()) { manually build Scheme POJO from rs, add to list }
  |-- [OK] All SQL lives here. Returns POJOs.

Step 5 -- VIEW (React)
  |-- axios response received with JSON array of SchemeMatch objects
  |-- React renders <SchemeCard /> for each match
  |-- [X] No business logic in the component -- only map, render, display.
```

### 4.4  JSP Usage — Strict MVC2 (Where Applicable)

For any pages rendered server-side via JSP (e.g., error pages, admin panels, or SEO-critical landing pages), the following rules are **strictly enforced**:

```jsp
<!-- ALLOWED -- JSTL + Expression Language only -->
<c:forEach var="scheme" items="${schemes}">
    <div class="scheme-card">
        <h3>${scheme.name}</h3>
        <p>${scheme.benefitSummary}</p>
        <span class="badge">${scheme.category}</span>
    </div>
</c:forEach>

<c:if test="${not empty errorMessage}">
    <div class="alert alert-danger">${errorMessage}</div>
</c:if>
```

**FORBIDDEN — No scriptlets anywhere:**

```
<%
    Connection conn = DriverManager.getConnection(...);    // NEVER
    ResultSet rs = stmt.executeQuery("SELECT * FROM...");  // NEVER
    UserProfile p = new UserProfile();                     // NEVER
    out.println(rs.getString("name"));                     // NEVER
%>
```

**JSP receives data only via:**
- `request.setAttribute("schemes", schemeList)` — set by the Servlet (Controller)
- Accessed in JSP via EL: `${schemes}`, `${user.name}`, `${matchCount}`

---

## 5.  Technology Stack

### 5.1  Frontend — View Layer

| Technology | Purpose | MVC2 Role |
|-----------|---------|-----------|
| **React.js** | Core UI library — component-based, dynamic SPA for the main user experience (Dashboard, Explorer, Profile, Chat Widget) | **View** |
| **React Router** | Client-side routing for SPA navigation (`/dashboard`, `/schemes/:id`, `/profile`, `/explore`) | **View** |
| **Axios** | HTTP client for calling backend REST APIs served by Servlets | **View -> Controller** |
| **HTML5** | Semantic structuring of web content | **View** |
| **CSS3 + Custom Design System** | Modern styling — glassmorphism, gradients, micro-animations, dark/light mode (NO Bootstrap — custom design system for Uber/Swiggy-level UI) | **View** |
| **JavaScript (ES6+)** | Client-side interactivity and state management | **View** |
| **Framer Motion / GSAP** | Smooth, performant animations and page transitions | **View** |
| **JSP + JSTL + EL** | Server-side rendered pages where needed (admin panel, error pages, SEO landing pages) — **NO scriptlets** | **View** |

### 5.2  Backend — Controller + Model Layers

| Technology | Purpose | MVC2 Role |
|-----------|---------|-----------|
| **Java EE (`javax.servlet` namespace, Servlet 3.1 / JSP 2.3)** | Enterprise-grade backend application framework | **Controller + Model** |
| **Servlets (HttpServlet, `@WebServlet` annotated)** | Handle all HTTP requests, delegate to Service layer, return JSON or forward to JSP | **Controller** |
| **Service Classes** | Contain all business logic — eligibility matching, profile processing | **Model (Business Logic)** |
| **DAO Classes** | Data Access Objects — all SQL operations via plain JDBC, CRUD, queries | **Model (Data Access)** |
| **POJO / JavaBeans** | Data transfer objects — `User`, `Scheme`, `UserProfile`, `SchemeMatch`, etc. — manually populated from `ResultSet` rows in the DAO | **Model (Beans)** |
| **JDBC (`PreparedStatement`, no ORM)** | Direct database connectivity for all queries — no Hibernate; DAOs write and own their SQL directly | **Model (DAO)** |
| **Gson** | JSON serialization/deserialization between POJOs and REST responses | **Controller** |
| **REST API (JSON)** | Communication layer between React frontend and Servlet backend | **Controller** |
| **JWT (`jjwt` library)** | Stateless authentication for API security | **Controller** |
| **jBCrypt** | Password hashing | **Model (Service)** |

### 5.3  Database

| Technology | Purpose |
|-----------|---------|
| **MySQL 8.x** | Primary relational database — stores users, profiles, schemes, eligibility rules, documents, bookmarks, chat history |

### 5.4  Artificial Intelligence (Supporting Feature)

| Technology | Purpose |
|-----------|---------|
| **OpenAI API / Google Gemini API** | Natural language understanding and response generation for the chatbot feature |
| **Natural Language Processing** | Extracting structured user attributes from free-text input in chat |
| **Prompt Engineering** | Custom-designed prompts tuned specifically for government scheme eligibility logic |

### 5.5  Government Data Sources

| Source | Purpose |
|--------|---------|
| **Government Open APIs (data.gov.in)** | Fetching live, authoritative scheme data |
| **Open Government Data Platform (OGD)** | Central repository of scheme and eligibility datasets |
| **State Government Portals** | State-specific scheme details, eligibility rules, and application links |
| **MyScheme (myscheme.gov.in)** | Reference for scheme eligibility parameters and categories |

### 5.6  Development & Deployment Tools

| Tool | Purpose |
|------|---------|
| **Eclipse IDE for Enterprise Java and Web Developers** | Java development environment (Dynamic Web Project, integrated Tomcat server tooling via WTP) |
| **Apache Tomcat 8.5.99** | Servlet container / application deployment server |
| **No Maven** | Dependencies (MySQL Connector/J, Gson, jBCrypt, jjwt) managed manually as JARs in `WEB-INF/lib` |
| **MySQL / MariaDB (via XAMPP) + MySQL Workbench** | Database server (XAMPP) and database design/management/query debugging (Workbench) |
| **Node.js + npm** | React development toolchain |
| **Vite** | Fast React development server and build tool |
| **Git** | Version control |
| **GitHub** | Source code hosting, collaboration, CI/CD |
| **Postman** | API testing and debugging |
| **Figma** | UI/UX design and prototyping |

---

## 6.  Modules

The system is organized into the following **core modules**, each responsible for a distinct part of the platform:

### Module 1 — Authentication & User Management

| Aspect | Detail |
|--------|--------|
| **Purpose** | Secure user registration, login, session management, and profile storage. |
| **Controller** | `AuthController.java` (Servlet) — handles `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` |
| **Service** | `AuthService.java` — password hashing (BCrypt), JWT token generation/validation, session logic |
| **DAO** | `UserDAO.java` — `INSERT`, `SELECT`, `UPDATE` on `users` table |
| **View** | React: `<LoginPage />`, `<RegisterPage />`, `<ForgotPassword />` |
| **MVC2 Compliance** | Servlet only parses credentials and calls `AuthService`. SQL is only in `UserDAO`. React only renders forms and sends Axios requests. |

### Module 2 — User Profile & Onboarding

| Aspect | Detail |
|--------|--------|
| **Purpose** | Guided profile creation flow collecting all attributes needed for scheme matching. |
| **Controller** | `ProfileController.java` — handles `/api/profile/create`, `/api/profile/update`, `/api/profile/get` |
| **Service** | `ProfileService.java` — profile validation, attribute normalization, triggers re-matching on update |
| **DAO** | `ProfileDAO.java` — CRUD on `user_profiles` table |
| **View** | React: `<OnboardingFlow />` (multi-step form with smooth transitions), `<ProfilePage />` |
| **Key Fields** | Age, Gender, State, District, Income, Occupation, Category (Gen/OBC/SC/ST/EWS), Education, Disability Status |

### Module 3 — Personalized Scheme Dashboard (Core Module)

| Aspect | Detail |
|--------|--------|
| **Purpose** | **The heart of the platform.** Displays all schemes the user qualifies for, personalized to their profile, grouped by category, with match explanations. |
| **Controller** | `MatchController.java` — handles `/api/match/my-schemes`, `/api/match/refresh` |
| **Service** | `EligibilityService.java` — the **matching engine**: fetches user profile, fetches all active schemes + rules, runs comparison logic, scores and ranks matches, generates plain-language explanations |
| **DAO** | `SchemeDAO.java`, `EligibilityRuleDAO.java`, `ProfileDAO.java` — queries schemes, rules, and profile data |
| **View** | React: `<Dashboard />`, `<SchemeCard />`, `<CategoryFilter />`, `<MatchCounter />` |
| **MVC2 Compliance** | All matching logic in `EligibilityService`. All SQL in DAOs. Servlet only calls service and returns JSON. React only renders cards. |

### Module 4 — Scheme Explorer & Search

| Aspect | Detail |
|--------|--------|
| **Purpose** | Full browsable catalog of all government schemes with search, filter, and sort — independent of user profile. |
| **Controller** | `SchemeController.java` — handles `/api/schemes/all`, `/api/schemes/search`, `/api/schemes/:id`, `/api/schemes/filter` |
| **Service** | `SchemeService.java` — search logic, filtering by state/category/ministry/target-group, pagination |
| **DAO** | `SchemeDAO.java` — parameterized queries with dynamic WHERE clauses |
| **View** | React: `<ExplorerPage />`, `<SearchBar />`, `<FilterSidebar />`, `<SchemeList />`, `<SchemeDetailPage />` |

### Module 5 — Scheme Detail & Information

| Aspect | Detail |
|--------|--------|
| **Purpose** | Rich detail page for each scheme — eligibility explanation, benefits, documents, application steps, and official links. |
| **Controller** | `SchemeController.java` — handles `/api/schemes/:id/details` |
| **Service** | `SchemeService.java` — aggregates scheme data, eligibility rules, document requirements, and application links into a single response |
| **DAO** | `SchemeDAO.java`, `DocumentDAO.java`, `EligibilityRuleDAO.java` |
| **View** | React: `<SchemeDetailPage />` — tabbed layout with Overview, Eligibility, Documents, How to Apply |

### Module 6 — Document Checklist Generator

| Aspect | Detail |
|--------|--------|
| **Purpose** | Aggregates required documents across all matched schemes into a single, de-duplicated, actionable checklist. |
| **Controller** | `ChecklistController.java` — handles `/api/checklist/generate` |
| **Service** | `ChecklistService.java` — fetches matched schemes, collects all required documents, de-duplicates, categorizes (ID Proof, Income Proof, Address Proof, etc.) |
| **DAO** | `DocumentDAO.java` — queries `required_documents` table |
| **View** | React: `<ChecklistPage />` — interactive checklist with toggle checkmarks, grouped by document type |

### Module 7 — Bookmarks & Saved Schemes

| Aspect | Detail |
|--------|--------|
| **Purpose** | Users can bookmark schemes to revisit later. |
| **Controller** | `BookmarkController.java` — handles `/api/bookmarks/add`, `/api/bookmarks/remove`, `/api/bookmarks/list` |
| **Service** | `BookmarkService.java` — add/remove/list bookmarks for a user |
| **DAO** | `BookmarkDAO.java` — CRUD on `bookmarks` table |
| **View** | React: `<BookmarksPage />`, bookmark icon on `<SchemeCard />` |

### Module 8 — AI Chatbot Assistant (Supporting Feature)

| Aspect | Detail |
|--------|--------|
| **Purpose** | **Secondary feature.** A floating chat widget for conversational scheme discovery and Q&A. |
| **Controller** | `ChatController.java` — handles `/api/chat/send`, `/api/chat/history` |
| **Service** | `ChatService.java` — constructs AI prompts using user profile + message, calls OpenAI/Gemini API, parses response, extracts scheme references |
| **DAO** | `ChatHistoryDAO.java` — saves/loads chat sessions for logged-in users |
| **View** | React: `<ChatWidget />` — floating bottom-right bubble, expandable chat window with message history |
| **Positioning** | Accessible from any page via a floating icon. Does NOT dominate the UI. Think of it like Swiggy's customer support chat — helpful when needed, invisible when not. |

### Module 9 — Admin / Data Management

| Aspect | Detail |
|--------|--------|
| **Purpose** | Backend admin panel for managing scheme data — add, update, deactivate schemes, update eligibility rules, manage documents. |
| **Controller** | `AdminController.java` — handles `/api/admin/schemes/*`, `/api/admin/rules/*` |
| **Service** | `AdminService.java` — CRUD operations with validation |
| **DAO** | `SchemeDAO.java`, `EligibilityRuleDAO.java`, `DocumentDAO.java` — write operations |
| **View** | JSP (JSTL + EL) or React — admin-only interface. If JSP: **strictly no scriptlets**. |

### Module 10 — Notifications

| Aspect | Detail |
|--------|--------|
| **Purpose** | Alert users about new matching schemes, upcoming deadlines, or profile completion reminders. |
| **Controller** | `NotificationController.java` — handles `/api/notifications/list`, `/api/notifications/read` |
| **Service** | `NotificationService.java` — generates notifications when new schemes are added that match existing profiles |
| **DAO** | `NotificationDAO.java` — CRUD on `notifications` table |
| **View** | React: notification bell icon with dropdown list |

---

## 7.  UI / UX Design Philosophy

### Design Inspiration

The platform takes direct inspiration from **modern consumer apps** that Indian citizens already use and love:

| Inspiration | What We Borrow |
|-------------|---------------|
| **Uber** | Clean dashboard layout, prominent CTAs, card-based UI, smooth transitions |
| **Swiggy** | Category-based browsing, search-first experience, bottom navigation on mobile, floating support chat |
| **CRED** | Premium dark theme, bold typography, glassmorphism, generous whitespace, micro-animations |
| **Zerodha** | Data-dense but clean dashboard, clear information hierarchy, trust through simplicity |
| **PhonePe** | Onboarding flow, guided profile setup, category icons, personalized home screen |

### Design System Specifications

| Element | Specification |
|---------|--------------|
| **Color Palette** | Primary: Deep Indigo (`#1A1A40`) + Accent: Saffron-Gold (`#FF9933`) — representing India's identity. Secondary: Cool Teal (`#00C9A7`), Soft White (`#F5F5F7`), Charcoal (`#2D2D2D`) |
| **Typography** | `Inter` or `Outfit` (Google Fonts) — clean, modern, highly legible. Headings: Bold 600-800. Body: Regular 400. |
| **Layout** | Card-based grid layout. Dashboard uses CSS Grid with responsive breakpoints. Mobile-first design. |
| **Glassmorphism** | Frosted glass effect on cards and modals — `backdrop-filter: blur(16px); background: rgba(255,255,255,0.08);` |
| **Micro-animations** | GSAP / Framer Motion — smooth page transitions, card hover effects (subtle lift + shadow), loading skeletons, staggered list animations |
| **Dark Mode** | Default theme is a premium dark mode with option to switch to light. |
| **Iconography** | Custom SVG icons or Lucide/Phosphor icon set — consistent, modern, outlined style |
| **Spacing** | 8px base unit grid system — all margins/paddings are multiples of 8 |
| **Border Radius** | Cards: 16px. Buttons: 12px. Inputs: 8px. — Rounded, modern feel. |
| **Shadows** | Layered soft shadows — `box-shadow: 0 4px 24px rgba(0,0,0,0.12);` |

### Key UI Screens

1. **Landing Page** — Hero section with tagline, animated illustration, CTA to sign up / explore schemes
2. **Onboarding Flow** — Multi-step profile form with progress indicator, smooth step transitions
3. **Dashboard** — Personalized scheme matches, category filters, match count, prominent scheme cards
4. **Scheme Explorer** — Search bar + filter sidebar + scheme grid, similar to an e-commerce browse page
5. **Scheme Detail** — Tabbed layout (Overview | Eligibility | Documents | Apply), with clear CTAs
6. **Document Checklist** — Interactive checklist view with category grouping
7. **Profile Page** — Edit profile attributes, see how changes affect matches
8. **Chat Widget** — Floating bottom-right icon, expands to chat window overlay, does NOT navigate away from current page

---

## 8.  Database Design Overview

### Core Tables

```sql
-- Users & Authentication
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Profile (for personalized matching)
CREATE TABLE user_profiles (
    profile_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL REFERENCES users(user_id),
    date_of_birth DATE,
    gender ENUM('MALE', 'FEMALE', 'OTHER'),
    state VARCHAR(50),
    district VARCHAR(100),
    annual_income DECIMAL(12,2),
    occupation VARCHAR(50),
    category ENUM('GENERAL', 'OBC', 'SC', 'ST', 'EWS'),
    education_level VARCHAR(50),
    disability_status BOOLEAN DEFAULT FALSE,
    is_bpl BOOLEAN DEFAULT FALSE,
    is_minority BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Government Schemes
CREATE TABLE schemes (
    scheme_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    ministry VARCHAR(200),
    category VARCHAR(100),
    state VARCHAR(50),
    benefit_summary TEXT,
    benefit_amount VARCHAR(100),
    application_url VARCHAR(500),
    official_portal VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Eligibility Rules (per scheme)
CREATE TABLE eligibility_rules (
    rule_id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_id INT NOT NULL REFERENCES schemes(scheme_id),
    attribute_name VARCHAR(50),
    operator VARCHAR(10),
    value VARCHAR(255),
    rule_description VARCHAR(255)
);

-- Required Documents (per scheme)
CREATE TABLE required_documents (
    doc_id INT PRIMARY KEY AUTO_INCREMENT,
    scheme_id INT NOT NULL REFERENCES schemes(scheme_id),
    document_name VARCHAR(200),
    document_category VARCHAR(50),
    is_mandatory BOOLEAN DEFAULT TRUE
);

-- User Bookmarks
CREATE TABLE bookmarks (
    bookmark_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL REFERENCES users(user_id),
    scheme_id INT NOT NULL REFERENCES schemes(scheme_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, scheme_id)
);

-- Chat History
CREATE TABLE chat_history (
    message_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT REFERENCES users(user_id),
    session_id VARCHAR(100),
    sender ENUM('USER', 'BOT'),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL REFERENCES users(user_id),
    title VARCHAR(200),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scheme Categories (Lookup)
CREATE TABLE scheme_categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    icon_name VARCHAR(50),
    display_order INT
);
```

---

## 9.  API Design

All communication between the React frontend (View) and the Servlet backend (Controller) happens over **RESTful JSON APIs**.

### API Endpoints

#### Authentication
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| POST | `/api/auth/register` | Register a new user | `AuthController` |
| POST | `/api/auth/login` | Login, returns JWT token | `AuthController` |
| POST | `/api/auth/logout` | Invalidate session | `AuthController` |

#### User Profile
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| POST | `/api/profile/create` | Create user profile (onboarding) | `ProfileController` |
| GET | `/api/profile/get` | Get current user's profile | `ProfileController` |
| PUT | `/api/profile/update` | Update profile attributes | `ProfileController` |

#### Personalized Matching (Core)
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| GET | `/api/match/my-schemes` | Get all matching schemes for logged-in user | `MatchController` |
| GET | `/api/match/refresh` | Force re-calculate matches after profile update | `MatchController` |
| GET | `/api/match/count` | Get count of matching schemes | `MatchController` |

#### Schemes (Explorer)
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| GET | `/api/schemes/all` | List all schemes (paginated) | `SchemeController` |
| GET | `/api/schemes/search?q=` | Search schemes by keyword | `SchemeController` |
| GET | `/api/schemes/:id` | Get scheme detail by ID | `SchemeController` |
| GET | `/api/schemes/filter` | Filter by state, category, ministry | `SchemeController` |
| GET | `/api/schemes/categories` | List all scheme categories | `SchemeController` |

#### Document Checklist
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| GET | `/api/checklist/generate` | Generate consolidated checklist for matched schemes | `ChecklistController` |

#### Bookmarks
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| POST | `/api/bookmarks/add` | Bookmark a scheme | `BookmarkController` |
| DELETE | `/api/bookmarks/remove/:id` | Remove bookmark | `BookmarkController` |
| GET | `/api/bookmarks/list` | List all bookmarks | `BookmarkController` |

#### AI Chatbot
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| POST | `/api/chat/send` | Send message to AI chatbot | `ChatController` |
| GET | `/api/chat/history` | Load chat history for session | `ChatController` |

#### Notifications
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| GET | `/api/notifications/list` | Get all notifications | `NotificationController` |
| PUT | `/api/notifications/read/:id` | Mark notification as read | `NotificationController` |

#### Admin
| Method | Endpoint | Description | Controller |
|--------|----------|-------------|------------|
| POST | `/api/admin/schemes/add` | Add new scheme | `AdminController` |
| PUT | `/api/admin/schemes/update/:id` | Update scheme | `AdminController` |
| DELETE | `/api/admin/schemes/delete/:id` | Deactivate scheme | `AdminController` |
| POST | `/api/admin/rules/add` | Add eligibility rule | `AdminController` |

---

## 10.  AI Chatbot — Supporting Feature

### Positioning

The AI chatbot is a **secondary, assistive feature** — not the core product. It is analogous to:

- The **customer support chat bubble** on Swiggy/Zomato
- **Google Assistant** on a Pixel phone — useful, but the phone works perfectly without it
- **Copilot** in VS Code — enhances the workflow, but the editor is the product

### How It Works

1. User clicks the **floating chat icon** (bottom-right corner of any page).
2. Chat window slides up as an **overlay** — user stays on their current page.
3. User types a natural-language message, e.g., *"What scholarships can I get?"*
4. The `ChatController` servlet receives the message.
5. `ChatService` constructs a prompt that includes:
   - The user's saved profile data (if logged in)
   - The user's message
   - System instructions for scheme-specific responses
6. The prompt is sent to **OpenAI / Gemini API**.
7. The AI response is parsed, and any referenced scheme IDs are linked to actual scheme detail pages.
8. The response is displayed in the chat window with clickable scheme links.

### When Users Would Use the Chatbot

| Scenario | Example |
|----------|---------|
| Quick question about a specific scheme | *"What is the income limit for PM Kisan?"* |
| Natural-language discovery | *"I'm a 19-year-old girl from Bihar, what can I get?"* |
| Document clarification | *"Do I need a domicile certificate for this scheme?"* |
| Comparing schemes | *"What's the difference between PMAY and PMAY-G?"* |
| Help navigating the platform | *"How do I update my profile?"* |

### What the Chatbot Does NOT Do

- It does **not** replace the dashboard or explorer.
- It does **not** appear as a full-screen page or primary navigation item.
- It does **not** require conversation to discover schemes — the dashboard does that automatically.
- It is **not** the first thing users see — the personalized dashboard is.

---

## 11.  Uniqueness & Differentiators

| # | Differentiator | Description |
|---|----------------|-------------|
| 1 | **Platform-first, not chatbot-first** | Unlike other "AI scheme finders" that are essentially chat interfaces, Saarthi is a **full platform** with personalized dashboards, search, filters, and bookmarks. The chatbot is just one feature. |
| 2 | **Account-based personalization** | Users create a profile once and get **perpetually updated** scheme recommendations. No need to re-enter details every time. |
| 3 | **All schemes in one place** | Central + State schemes aggregated into a single, browsable, searchable catalog — something no existing government portal offers. |
| 4 | **Modern, consumer-grade UI** | Designed like Uber/Swiggy/CRED — not like a government website. Dark theme, glassmorphism, micro-animations, mobile-first. Citizens actually *want* to use it. |
| 5 | **Plain-language eligibility explanations** | The platform doesn't just list schemes — it tells users *"You qualify because..."* in simple language. |
| 6 | **Consolidated document checklist** | De-duplicated, categorized document list across all matched schemes — prepare everything at once. |
| 7 | **End-to-end guidance** | From discovery to eligibility to documents to application link, all in one flow. |
| 8 | **Strict MVC2 architecture** | Enterprise-grade, maintainable codebase with clean separation of concerns — ready for production scaling. |
| 9 | **Built on authoritative data** | All scheme data sourced from Government Open APIs and OGD Platform — ensuring accuracy and credibility. |
| 10 | **Inclusive by design** | Clean UI + chatbot fallback makes the platform usable even by citizens with limited digital literacy. |
| 11 | **Scalable architecture** | Modular Java EE + MySQL backend allows new schemes, states, and features to be added without redesigning the system. |

---

## 12.  Future Scope

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Multi-language Support** | Hindi and regional language UI for wider accessibility (using i18n). |
| 2 | **Application Status Tracker** | Integrate with government APIs to let users track their application status from within the platform. |
| 3 | **Document Upload & Vault** | Secure document storage so users can maintain a digital copy of common documents (Aadhaar, PAN, Income Certificate) and auto-attach them to applications. |
| 4 | **Mobile App (Android/iOS)** | Native mobile application using React Native for wider reach. |
| 5 | **Voice Input** | Speech-to-text for the chatbot, enabling usage by citizens who cannot type. |
| 6 | **Scheme Deadline Alerts** | Push notifications when application deadlines are approaching for bookmarked/matched schemes. |
| 7 | **Community & Reviews** | Allow users to share their experience applying for schemes — building a knowledge base. |
| 8 | **Integration with DigiLocker** | Pull verified documents directly from DigiLocker for seamless application. |
| 9 | **Analytics Dashboard (Admin)** | Insights on most-searched schemes, user demographics, match rates — to help policy makers. |
| 10 | **Offline Mode (PWA)** | Progressive Web App support for basic scheme browsing without internet. |

---

> **Saarthi** is not just a scheme directory or a chatbot — it is an **intelligent, personalized, citizen-first platform** that puts every eligible government scheme at the citizen's fingertips, presented with the clarity and elegance of modern consumer applications, and built on a rock-solid MVC2 architecture that is ready for production.

---

*Document Version: 2.0 — September 2026*
*Architecture: Strict MVC2 (Model 2)*
*Primary Focus: Personalized Scheme Discovery Platform*
*AI Chatbot: Supporting Feature*
