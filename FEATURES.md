# SAARTHI — National Citizen Welfare & Entitlement Registry
## Comprehensive System Features & Capabilities Specification

> **Government of India & Government of Maharashtra Digital Initiative**  
> *SAARTHI* is an intelligent, grounded citizen welfare discovery and entitlement management portal designed to eliminate administrative friction, match citizens with eligible welfare schemes, simulate life-event eligibility impacts, and provide end-to-end guidance in 16 Indian languages.

---

## 📋 Table of Contents
1. [Citizen Dashboard & Entitlement Overview](#1-citizen-dashboard--entitlement-overview)
2. [Scheme Explorer & Discovery Engine](#2-scheme-explorer--discovery-engine)
3. ["What-If" Eligibility Scenario Simulator](#3-what-if-eligibility-scenario-simulator)
4. [Document Readiness Checklist & Digital Vault](#4-document-readiness-checklist--digital-vault)
5. [Saved Schemes & Bookmarks Manager](#5-saved-schemes--bookmarks-manager)
6. [Real-Time Civic Notification Center](#6-real-time-civic-notification-center)
7. [16-Language Multilingual Translation System](#7-16-language-multilingual-translation-system)
8. [Grounded Civic AI Assistant (ChatWidget)](#8-grounded-civic-ai-assistant-chatwidget)
9. [Citizen Profile, Dossier & Verification](#9-citizen-profile-dossier--verification)
10. [Authentication, CAPTCHA & Security](#10-authentication-captcha--security)
11. [Administrative Console & Governance Engine](#11-administrative-console--governance-engine)
12. [Technical Architecture & Deployment](#12-technical-architecture--deployment)

---

## 1. 🏛️ Citizen Dashboard & Entitlement Overview

* **Real-Time Entitlement Scoreboard**: Displays key metrics at a glance:
  * Total eligible annual benefit value (₹).
  * Number of qualified welfare schemes.
  * Pending document readiness tasks.
  * Active application pipeline count.
* **Top Personalized Scheme Recommendations**: Algorithmic engine that automatically maps schemes to the citizen's verified demographic data (income ceiling, caste/category, state/district, age, gender, occupation).
* **Citizen Identity Lockup**: Live verification badge (*85% Verified • Maharashtra*), quick profile avatar, and instant access to Aadhaar e-KYC status.
* **Quick-Access Action Cards**: Direct shortcuts to the *What-If Simulator*, *Document Readiness Checklist*, and *Scheme Explorer*.

---

## 2. 🔍 Scheme Explorer & Discovery Engine

* **Multi-Faceted Dynamic Filtering**:
  * **Category**: Agriculture & Farming, Education & Scholarships, Housing & Urban Development, Healthcare & Wellness, Women & Child Development, Social Welfare & Empowerment, Employment & Skill Training, Pension & Senior Citizens.
  * **Jurisdiction / State**: Central Government (National) vs. State Schemes (Maharashtra, Uttar Pradesh, etc.).
  * **Demographics**: Income thresholds, Social Categories (SC, ST, OBC, General, Minority), Gender, Age brackets, Differently-Abled (PwD) reservations.
* **Live Keyword Search**: Instant search matching scheme names, sponsoring ministries, target sectors, and keywords.
* **Paginated Scheme Catalog**: Clean grid layout displaying 6 schemes per page with responsive pagination controls.
* **Deep-Dive Scheme Dossier**:
  * Comprehensive eligibility rules and disqualification criteria.
  * Detailed schedule of required supporting documents.
  * Financial disbursement model (Direct Benefit Transfer - DBT, subsidy, low-interest credit).
  * Direct links to official department portals and application forms.

---

## 3. 🔮 "What-If" Eligibility Scenario Simulator

* **Interactive Scenario Modeling**: Citizens can manipulate hypothetical life events to project future welfare impacts:
  * Adjust annual income via an interactive range slider (₹0 to ₹10,00,000+).
  * Switch employment status (e.g. Unemployed, Farmer, Self-Employed, Salaried).
  * Modify education level, marital status, or dependent count.
* **Instant Eligibility Recalculation**: Live re-evaluation displaying newly unlocked schemes vs. disqualified schemes with zero page reloads.
* **Financial Delta Visualization**: Visual indicators showing the gain or reduction in projected government subsidies based on the scenario.

---

## 4. 📁 Document Readiness Checklist & Digital Vault

* **Core Government Document Tracking**:
  * Aadhaar Card (e-KYC Linked)
  * Permanent Account Number (PAN Card)
  * Tehsildar / Authorized Income Certificate
  * State Domicile / Residence Certificate
  * Caste / Category Validity Certificate (Caste Scrutiny)
  * Ration Card (BPL / Antyodaya / APL)
  * Bank Passbook with Aadhaar-Seeded NPCI Mapping
  * Land Ownership Records (7/12 Extract, 8A Extract)
* **Readiness Meter**: Real-time progress bar computing overall documentation completeness percentage.
* **Missing Document Impact Alerts**: Highlights specific schemes that cannot be applied for until a missing document is acquired.
* **Issuing Authority Guidance**: Actionable steps and official portals (e.g. Aaple Sarkar, UIDAI) where missing certificates can be obtained.

---

## 5. 🔖 Saved Schemes & Bookmarks Manager

* **One-Click Bookmarking**: Ability to star and save schemes across the Dashboard and Explorer for future review.
* **Deadline Tracking & Milestones**: Highlights schemes with approaching application deadlines to avoid missing enrollment windows.
* **Status Badges**: Easily distinguish between *Saved for Later*, *Application Prepared*, and *Applied*.

---

## 6. 🔔 Real-Time Civic Notification Center

* **Proactive Scheme Alerts**: Push-style alerts triggered whenever a new scheme matching the citizen’s profile is published by any ministry.
* **Actionable Deadlines**: Urgent notifications when enrolled or bookmarked schemes approach closing dates.
* **Smart Expiry Management**: Time-sensitive announcements automatically expire after designated periods (e.g. 2 days) to prevent notification fatigue.
* **Status Controls**: Mark individual or all notifications as read, delete notifications, and view real-time unread counts in the navigation bar.

---

## 7. 🌐 16-Language Multilingual Translation System

* **Sub-Navbar Placement**: Positioned on a dedicated utility bar directly below the navigation bar for easy access across all screen sizes.
* **16 Indian Languages Supported**:
  1. English
  2. हिन्दी (Hindi)
  3. मराठी (Marathi)
  4. ગુજરાતી (Gujarati)
  5. বাংলা (Bengali)
  6. தமிழ் (Tamil)
  7. తెలుగు (Telugu)
  8. ಕನ್ನಡ (Kannada)
  9. മലയാളം (Malayalam)
  10. ਪੰਜਾਬੀ (Punjabi)
  11. اردو (Urdu)
  12. ଓଡ଼ିଆ (Odia)
  13. অসমীয়া (Assamese)
  14. संस्कृतम् (Sanskrit)
  15. नेपाली (Nepali)
  16. سنڌي (Sindhi)
* **Session Persistence**: Language selection persists across browser navigation without losing user state.

---

## 8. 🤖 Grounded Civic AI Assistant (ChatWidget)

* **Grounded Knowledge Base**: AI assistant strictly grounded in the database of government schemes, eligibility parameters, and official guidelines.
* **Citizen Profile Context**: Leverages active user attributes to answer personalized questions (e.g. *"Can I apply for the Ladki Bahin Yojana with my current income?"*).
* **Document & Procedure Assistance**: Provides clear explanations on where to apply, forms to fill, and required verifications.
* **Bilingual & Multilingual Chat**: Seamless interaction in English, Hindi, and regional languages.

---

## 9. 👤 Citizen Profile, Dossier & Verification

* **Demographics Profile**: Name, gender, date of birth, marital status, minority status, disability percentage.
* **Financial & Residential Records**: Annual family income, urban vs. rural classification, state, district, taluka/block, pincode.
* **Socio-Economic Data**: Caste category, landholding acreage, occupation/employment sector, education qualifications.
* **Aadhaar e-KYC Verification**: Civic badge and verification confidence score (e.g. *85% Verified*).

---

## 10. 🔐 Authentication, CAPTCHA & Security

* **Role-Based Access Control (RBAC)**: Distinguishes between standard *Citizen* users and *Portal Administrators*.
* **Dynamic Visual CAPTCHA**: Secure server-generated visual CAPTCHA on login and registration pages to thwart automated bots and crawlers.
* **Credential Protection**: Secure password hashing, salted storage, and session token protection.
* **Self-Service Recovery**: Password reset workflow via verified security identifiers.

---

## 11. ⚙️ Administrative Console & Governance Engine

* **Scheme Registry Operations**: Full CRUD (Create, Read, Update, Deactivate) management for welfare schemes.
* **Eligibility Rule Configuration**: Define income caps, age brackets, gender restrictions, caste requirements, and landholding limits per scheme.
* **Citizenry Analytics**: Overview of registered citizens, verification percentages, scheme application engagement, and regional distribution.

---

## 12. 🛠️ Technical Architecture & Deployment

* **Frontend**:
  * React (Vite-based modern modular architecture).
  * Vanilla CSS & Tailwind utility styling adhering to official Government of India / National Informatics Centre (NIC) UI guidelines.
  * Fully responsive design optimized for desktop, tablets, and low-bandwidth mobile devices.
* **Backend**:
  * Enterprise Java (Servlets, JDBC, MVC architecture).
  * Apache Tomcat Application Server (Ports 8080/8081).
  * RESTful JSON API endpoints for profile, schemes, bookmarks, notifications, chat, and simulator.
* **Database**:
  * Relational MySQL database schema (`saarthi_db`) with indexed queries for fast eligibility evaluation.
* **Synchronization & CI/CD**:
  * Automated PowerShell compilation and deployment scripts (`compile_and_sync.ps1`).
  * Direct synchronization across `WebContent`, Tomcat `webapps/saarthi`, and development builds.
