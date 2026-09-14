# Saarthi — UI Design System (Onboarding & Auth)

This is the single source of truth for every page prompt in this folder. Every other `.md` file in `user onboarding/` references this document instead of restating it in full — paste this alongside the page-specific prompt when generating in Stitch, or generate this as a "style guide" frame first if Stitch supports a persistent project style.

**Why this exists:** the goal across every page is to look deliberately **custom-designed for a specific Indian civic platform** — not a generic AI-generated SaaS mockup. Every rule below exists to avoid a specific "AI slop" tell (purple-blue gradients, all-Inter type, symmetric centered cards, glossy 3D-render mascots, stock icon sets). Read the Anti-Slop Checklist at the end before finalizing any page.

---

## 1. Brand Rationale
The palette is built around **India's tricolor identity** — a deep, trustworthy green as the primary brand color, paired with a warm saffron/gold accent — not an arbitrary trendy startup green. This is a civic, government-scheme-adjacent platform: it should read as credible, warm, and specific to India, not like a fintech or productivity SaaS product. Every illustration should depict ordinary Indian citizens (a student, a farmer, a shopkeeper, a young parent) in grounded, everyday scenes — never abstract corporate mascots.

## 2. Color Tokens
| Token | Hex | Usage |
|---|---|---|
| Primary (Tricolor Green) | `#1F6E43` | Primary buttons, active states, illustration field backgrounds, links |
| Primary Hover/Pressed | `#195A37` | Button hover/press state |
| Accent (Saffron/Gold) | `#F2A93B` | Secondary highlights, current-step indicator, small badges, illustration accent props |
| Ink (headline text) | `#10241A` | All headings — near-black with a warm green tint, never pure `#000000` |
| Body text | `#3C4A42` | Paragraph/body copy — muted green-grey, never flat grey `#666` |
| Muted/placeholder | `#8A9A90` | Placeholder text, helper text, disabled states |
| Background base | `#FBFBF6` | Page background — warm off-white, never stark `#FFFFFF` at full-bleed |
| Card surface | `#FFFFFF` | Cards, form panels, modals |
| Border | `#E7ECE3` | Input borders, dividers, unselected chip borders |
| Error | `#C0473B` | Validation errors — muted brick red, never neon `#FF0000` |
| Success | Primary green (reuse) | Confirmation states |
| Focus ring | Primary green @ 35% opacity | 3px outer glow on any focused interactive element |

## 3. Typography
- **Headings:** **Fraunces** — a warm, editorial serif, semi-bold to bold weight. This single choice is the biggest lever against looking generic; do not substitute a default grotesk for any headline, ever.
- **Body / UI text:** **General Sans** (fallback: Inter) — clean humanist sans, regular/medium weight only.
- Never introduce a third font family. Never fall back to a default system font stack.
- Headline sizes: 40px (auth page heroes) / 32–36px (onboarding step headlines) / 28px (utility pages like Forgot Password) — all Fraunces Bold.
- Body copy: 15–16px, General Sans Regular. Helper/caption text: 13px, General Sans Regular, Muted color.

## 4. Shape Language
- Large, soft, slightly irregular rounding: **28–32px** on large panels/cards, **16px** on inputs, **full-pill (999px)** on primary buttons and chip selectors.
- Illustration panels sit inside a thick (**10–14px**) dark-green (`#10241A`) rounded "device frame" bezel — echoing a physical tablet/object, never a flat borderless rectangle. This is a signature recurring motif across every page.
- Shadows are **soft and tinted with brand green**, never flat grey defaults. Example: `box-shadow: 0 12px 32px rgba(31,110,67,0.12)`.

## 5. Illustration Direction
- **Style:** claymorphism / soft matte 3D render — hand-modeled clay or soft matte plastic toy material. Soft rim lighting, gentle ambient occlusion, subtle surface grain. Explicitly **avoid** glossy/glassy PBR sheen — that reads as generic AI-render output.
- **Palette:** illustrations use ONLY the brand tokens above (green, saffron/gold, warm cream/skin tones, near-black outlines) — never introduce unrelated hues that appear only in the illustration and nowhere else in the UI.
- **Subjects:** ordinary Indian citizens in everyday dress and settings, specific to the page's purpose (a citizen logging in, a student choosing a category, a farmer reviewing benefits) — never generic tech-mascot figures.
- **Composition habit:** every hero illustration includes 2–3 small floating supporting props in the same clay style (a coin, a document, a badge, a clock) with soft offset drop shadows for depth — replicate this compositional trick on every page, varying the specific props to match that page's content.

## 6. Iconography
- Custom-styled line/filled icons matching the claymorphism accent props' weight and rounding — never a default Font Awesome/Material Symbols set dropped in unstyled.
- Icons default to Ink or Primary green; Accent gold reserved for small badges/highlights only, not general UI icons.

## 7. Component Notes (reused across pages)
- **Primary button:** full-width or auto-width pill, Primary green fill, white text, General Sans Medium 16px, 52px height. Hover: darken to Primary Hover + 2px upward translate + shadow grows. Loading state: label replaced by a thin ring spinner in white-on-green (or Primary-green-on-white for secondary buttons).
- **Input fields:** 16px radius, 1px Border color, label above (not floating-label), Ink-colored input text, Muted placeholder. Focus: border → Primary green + focus ring. Error: border → Error red + red helper text below + small custom error icon (filled circle with exclamation, matching icon weight elsewhere — never a default browser warning triangle).
- **Chips/selectable pills:** unselected — white fill, Border-color outline, Body-color text. Selected — Primary green fill, white text, small clay-style checkmark icon leading the label.
- **Progress indicator (onboarding only):** 6 thin rounded pill segments, 4px tall, 2px gaps. Completed = Primary green fill. Current = Accent gold fill. Upcoming = Border-color fill. Paired with a small "Step N of 6" Muted 13px label.

## 8. Anti-Slop Checklist — verify before finalizing ANY page
- [ ] No purple/blue gradient anywhere
- [ ] No dead-center symmetric card-on-plain-background with zero asymmetry
- [ ] No all-Inter (or any single generic grotesk) typography — Fraunces present on every headline
- [ ] No stock/generic icon set used unstyled
- [ ] No glossy/glassy AI-render sheen on any illustration
- [ ] No random hues in illustrations outside the defined palette
- [ ] At least one deliberate asymmetric or off-grid element per page (the illustration panel's device-frame bezel, an overlapping badge, an intentionally oversized headline word, a mirrored layout between related pages)
- [ ] Every data-collection field is paired with a one-line "why we ask" rationale in the subtext — never a bare label with no context

## 9. Pages Covered by This System
1. `01-login.md`
2. `02-signup.md`
3. `03-forgot-password.md`
4. `04-onboarding-step1-basic-info.md` — Date of Birth, Gender
5. `05-onboarding-step2-location.md` — State, District
6. `06-onboarding-step3-income-occupation.md` — Annual Family Income, Occupation
7. `07-onboarding-step4-category-education.md` — Social Category, Education Level
8. `08-onboarding-step5-additional-details.md` — Disability Status, BPL Status, Minority Status
9. `09-onboarding-step6-review-confirm.md` — Summary & Confirm

All field groupings above map directly to SRS FR2.1 (Module 2 — User Profile & Onboarding).
