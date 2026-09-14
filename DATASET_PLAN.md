# Dataset Plan — Sourcing, Structuring & Verifying Scheme Data Accurately

Goal: a MySQL-seeded set of real, correct government schemes with real,
machine-checkable eligibility rules — not fabricated data, not stale/wrong
eligibility criteria. This is offline, one-time (per refresh cycle) work; nothing
here runs at request time (see PLAN.md §2.3 for why).

---

## Why accuracy is hard here (the actual problem)

There is no official structured API for scheme eligibility. What exists:
- **data.gov.in / OGD Platform** — raw government datasets (agriculture, health,
  demographics, etc.), but nothing shaped like "scheme → eligibility rules."
- **myscheme.gov.in** — the authoritative source of truth for scheme text, but no
  documented public API; its internal API is unstable/undocumented and shouldn't
  be depended on.
- **Community-scraped datasets** (Kaggle "Indian Government Schemes" by
  jainamgada45, HuggingFace `gov_myscheme` by shrijayan/Jin154) — useful as a
  **starting list and rough eligibility text**, but scraped, unofficial, and of
  unknown freshness/accuracy. Cannot be trusted as ground truth on their own.

So "accurate" here means: **treat myscheme.gov.in and the actual scheme/ministry
webpage as the only ground truth**, and use the scraped datasets only to build the
initial candidate list and a first-draft description — never as the final
eligibility values without verification against the live source.

---

## Step-by-step pipeline

### Step 1 — Build the candidate scheme list (~50-70 candidates → target ~40-60 final)
- Pull the community-scraped dataset (HuggingFace `gov_myscheme` or the Kaggle set)
  purely as a **list of scheme names + ministry + category + state**, not their
  eligibility text yet.
- Filter to schemes that are: (a) currently active, (b) well-known/high-value
  enough to be worth demoing, (c) span multiple categories (education, health,
  agriculture, housing, employment, financial aid) and both **Central** and a few
  **State**-level schemes, so the dashboard's "grouped by category" and
  state-filtering features have real data to show.
- Target list, roughly: PM Kisan Samman Nidhi, Ayushman Bharat (PM-JAY), PM Awas
  Yojana (Urban + Gramin), National Scholarship Portal schemes (Pre-Matric,
  Post-Matric, Merit-cum-Means), PMEGP, Sukanya Samriddhi Yojana, Atal Pension
  Yojana, PM Ujjwala Yojana, Stand-Up India, PM Mudra Yojana, National Means-cum-
  Merit Scholarship, Beti Bachao Beti Padhao, PM Matru Vandana Yojana, PM Fasal
  Bima Yojana, e-Shram registration, PM SVANidhi, plus 2-3 state schemes (e.g. a UP
  or Maharashtra state scholarship/housing scheme) for variety. Exact final list
  gets locked once verification (Step 3) confirms which ones have clean, citable
  eligibility criteria.

### Step 2 — Draft extraction (semi-automated, NOT trusted yet)
- Python script pulls each candidate's free-text eligibility description from the
  scraped dataset and applies regex/keyword extraction for common attributes:
  age bounds, income ceiling, gender, social category (SC/ST/OBC/EWS/General),
  state, occupation, education level, disability, BPL/minority status.
- Output: a draft CSV — one row per `(scheme, attribute, operator, value,
  source_text_snippet)` — where `source_text_snippet` keeps the exact phrase the
  rule was extracted from, so it's auditable in Step 3.
- This step exists purely to save typing, not to be the source of truth.

### Step 3 — Verification against ground truth (the accuracy step — mandatory, per-scheme)
For every one of the ~40-60 schemes, before it's allowed into the seed data:
1. Open the scheme's actual page on **myscheme.gov.in** (or the issuing ministry's
   official site if the scheme isn't listed there) directly.
2. Compare every extracted rule row against the live eligibility text.
3. Correct, add, or delete rule rows as needed — the live page always wins over
   the scraped/extracted draft.
4. Record the **verification date** and **source URL** per scheme in a
   `verified_at` / `source_url` column — so staleness is visible and auditable
   later, not silently assumed correct forever.
5. Capture benefit summary, required documents list, and the real official
   application URL the same way — verified against the live page, not just copied
   from the scraped dataset.

This is the step that actually makes the data "accurate" — the scraped dataset and
regex extraction only exist to make this step faster than starting from a blank
page per scheme.

### Step 4 — Structure into final seed files
Once verified, each scheme becomes rows across three CSVs (matching the DB schema
in PLAN.md / synopsis §8):
- `data/seed/schemes.csv` — name, ministry, category, state, benefit_summary,
  benefit_amount, application_url, official_portal, is_active, source_url,
  verified_at
- `data/seed/eligibility_rules.csv` — scheme_id (by name, resolved to FK at
  import), attribute_name, operator, value, rule_description
- `data/seed/required_documents.csv` — scheme_id, document_name,
  document_category, is_mandatory

### Step 5 — Generate SQL & import
A small script (Python or a plain Java `main()` using the same JDBC driver already
in the project — avoids adding a new toolchain) reads the three CSVs and emits
`data/seed/seed.sql` (`INSERT` statements), which gets run once against the MySQL
schema. The CSVs are the source of truth in the repo (human-readable, diffable,
correctable); `seed.sql` is a generated, disposable artifact re-run whenever the
CSVs change.

### Step 6 — Spot-check pass
After seeding, run the actual `EligibilityService` matching logic against 4-5
synthetic test profiles (e.g. "22yo unemployed graduate, Bihar, OBC, low income" /
"58yo farmer, Punjab, General, owns land") and manually verify the schemes it
returns are ones that profile should plausibly match, per the rules just entered.
Catches rule-entry mistakes (wrong operator, wrong field) that a per-scheme review
alone might miss, since it exercises rules in combination.

---

## Rule-encoding conventions (so Step 3/4 are consistent across ~50 schemes)

| Eligibility phrase pattern | Encoding |
|---|---|
| "between 18 and 40 years" | two rows: `age >= 18`, `age <= 40` |
| "below 60 years" | one row: `age < 60` |
| "annual family income below ₹1.5 lakh" | one row: `annual_income <= 150000` |
| "SC/ST/OBC/EWS candidates" | one row: `category IN SC,ST,OBC,EWS` |
| "women only" | one row: `gender = FEMALE` |
| "residents of [State]" | one row: `state = <State>` (omit entirely if
  scheme is Central/all-India — absence of a state rule means no restriction) |
| "students currently enrolled in [level]" | one row:
  `education_level = <level>` |
| Ambiguous/non-quantifiable text (e.g. "priority given to...", "subject to
  government discretion") | **not encoded as a hard rule** — captured only in the
  scheme's plain-language description shown on the detail page, since it can't be
  evaluated as pass/fail |

---

## Refresh cycle (keeping data from going stale after initial seeding)

- Not attempted as a live/automatic sync (per PLAN.md §2.3's reasoning — no stable
  API to sync from).
- Instead: the Admin module (Phase 3) is the update mechanism — periodically
  (manually, e.g. once a month or before a demo) re-check `verified_at` dates
  against the live myscheme.gov.in pages for the seeded schemes and correct
  via the admin UI. This is called out explicitly so "accurate" doesn't quietly
  mean "accurate on the day it was seeded, wrong forever after."

---

## Decisions locked in (2026-09-14)

1. **Verification workflow**: I fetch and verify each scheme against its live
   myscheme.gov.in (or ministry) page myself, then hand you the finished CSV to
   review before it's seeded into MySQL.
2. **Target count**: 80+ schemes. This is a meaningfully larger verification
   effort than the original ~40-60 estimate — Step 3 (live-page verification) now
   runs across 80+ individual pages one at a time. Given that, this will be done
   in batches (e.g. ~15-20 schemes per batch) with the reviewable CSV growing
   incrementally, rather than one single 80-scheme dump at the end — so you can
   start spot-checking accuracy early rather than waiting for the whole set.

3. **State scope**: Maharashtra first. State-level schemes in the 80+ dataset
   focus on Maharashtra (e.g. state scholarships, Mahatma Jyotiba Phule Jan
   Arogya Yojana, Maharashtra state housing/farmer schemes, etc.), alongside the
   Central schemes that apply nationwide including Maharashtra. Other states can
   be added in a later refresh once Maharashtra + Central coverage is solid.

No remaining open points — ready to start sourcing.
