# SAARTHI — Presentation Script (5 Minutes)

*Speak naturally, don't read word-for-word. Pause briefly between sections.*

---

## 1. Introduction (30 seconds)

Good morning/afternoon everyone. Today we are presenting our project called **SAARTHI**.

SAARTHI is India's first **personalized government scheme discovery platform**. In simple words — it's a website where any Indian citizen can find out, in seconds, exactly which government schemes they are eligible for, based on their own profile — like their age, income, state, and occupation.

---

## 2. Problem Statement (45 seconds)

India runs **thousands** of government schemes — for education, farmers, healthcare, housing, and financial help. But here's the problem: **most citizens never get these benefits**, not because they're not eligible, but because they don't even know these schemes exist.

Why does this happen?

- Scheme information is scattered across dozens of different government websites.
- These websites are confusing and written in complicated, bureaucratic language.
- People don't know which documents they need until it's too late.
- And most importantly — there is **no personalization**. Every citizen sees the same long list of schemes, and has to figure out on their own which ones apply to them.

So the real problem is not a shortage of schemes — it's the **missing bridge** between the citizen and the scheme.

---

## 3. Our Solution (45 seconds)

SAARTHI solves this by flipping the experience.

Instead of the citizen searching through hundreds of schemes, the citizen simply **creates a profile once** — age, income, state, category, occupation — and SAARTHI's **matching engine** automatically shows them a personalized dashboard: "Here are the 12 schemes you qualify for," grouped by category, with a plain-language explanation like *"You qualify because you are under 25, a student, from Maharashtra."*

On top of that, we also give:
- A **document checklist** that combines all documents needed across every matched scheme, so users prepare everything once.
- An **AI chatbot** as a helper feature, for people who prefer to just ask a question like "Am I eligible for PM Kisan?"

So SAARTHI is a full platform first, and a chatbot second — not the other way around.

---

## 4. Our Modules (60 seconds)

We've divided the system into 10 core modules. Let me go through them quickly:

1. **Authentication & User Management** — secure sign up and login.
2. **Profile & Onboarding** — a simple guided form to collect user details.
3. **Personalized Dashboard** — the heart of the project — shows matched schemes using our eligibility engine.
4. **Scheme Explorer** — a search-and-filter catalog of all schemes, for users who want to browse everything.
5. **Scheme Detail Page** — shows eligibility, benefits, documents, and how to apply for each scheme.
6. **Document Checklist Generator** — combines and de-duplicates documents across all matched schemes.
7. **Bookmarks** — save schemes to revisit later.
8. **AI Chatbot Assistant** — conversational support feature.
9. **Admin Panel** — for managing and updating scheme data.
10. **Notifications** — alerts when new matching schemes appear.

Each module is independent, so we can improve or scale one part of the system without breaking the rest.

---

## 5. Tech Stack (30 seconds)

On the frontend, we used **React.js** with **React Router** and **Axios**, styled with a custom modern design — inspired by apps like Uber, Swiggy, and CRED — instead of a boring government-website look.

On the backend, we used **Java Servlets** with a Service and DAO layer, connected to a **MySQL database** using plain **JDBC**. For security we used **JWT** for login sessions and **BCrypt** for password hashing.

For the chatbot, we integrate the **OpenAI / Gemini API** with custom prompt engineering for scheme-related questions.

---

## 6. Architecture — and Why (40 seconds)

We built SAARTHI on **strict MVC2 architecture** — that means Model, View, and Controller are completely separated, with no mixing.

- The **Controller** (our Servlets) only receives requests and passes them along — no business logic, no SQL.
- The **Model** layer holds all our business logic (like the eligibility-matching logic) and all database operations, cleanly separated into Service and DAO classes.
- The **View** (React) only displays data — it never contains logic.

We chose this architecture because it keeps the code **clean, organized, and easy to maintain**. If tomorrow we want to add 50 new schemes or a new state, we don't have to touch the whole codebase — we just extend the relevant layer. This is exactly how real, production-level enterprise systems are built.

---

## 7. Competitors — and Why We're Better (45 seconds)

There are a few existing players in this space:

- **myScheme.gov.in** — the official government portal, but it only shows a static list after a long questionnaire. No personalization that updates automatically, and outdated information often stays uncorrected.
- **Haqdarshak** — a private company that helps citizens apply, but they **charge a fee** per application — which defeats the purpose for poor citizens trying to get free government benefits.
- **UMANG** — a government app, but it's just a service directory. It assumes you already know what scheme you want.

**SAARTHI is different and better** because:

1. It's **free**, with no middlemen or fees.
2. It gives **real personalization** — one-time profile, always up-to-date matches — instead of a one-time static form.
3. It explains eligibility in **plain language**, not legal jargon.
4. It combines **document requirements** across all schemes into one checklist — something no competitor offers.
5. And it's built like a **modern consumer app**, not a typical dull government website — so people will actually want to use it.

---

## 8. Closing (15 seconds)

To summarize — SAARTHI is not just another scheme directory or chatbot. It's a personalized, citizen-first platform that brings every government scheme a person qualifies for right to their fingertips, built on a solid, scalable architecture.

Thank you. We're happy to take any questions.

---

*Total estimated speaking time: ~5 minutes at a natural pace.*
