# Stitch Prompt — Signup Page

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Create Account (`/signup`)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System (identical to `01-login.md` — apply without deviation)

**Color tokens:** Primary `#1F6E43` · Primary hover `#195A37` · Accent `#F2A93B` · Ink `#10241A` · Body `#3C4A42` · Muted `#8A9A90` · Background `#FBFBF6` · Card `#FFFFFF` · Border `#E7ECE3` · Error `#C0473B` · Focus ring Primary @ 35% opacity.

**Typography:** Headings in **Fraunces** (serif, warm, bold). Body/UI in **General Sans** (fallback Inter). Never substitute.

**Shape:** 28px radius large panels, 16px inputs, full-pill buttons. Illustration sits inside a thick (10–14px) dark-green rounded "device frame," not a flat rectangle.

**Illustration direction:** claymorphism / soft matte 3D, brand-limited palette only (green/saffron/cream/skin-tone), ordinary Indian citizens (not generic tech mascots), 2–3 floating clay-style props per scene with soft offset shadows.

**Anti-slop checklist:** no purple/blue gradients · no dead-center symmetric templated layout · no all-Inter type · no glossy AI-render sheen · no stock icon set · at least one deliberate asymmetric/off-grid element.

*(Full rationale for every token above lives in `01-login.md` §0 — this file assumes it, kept here only as a compact restatement so this page can be generated independently.)*

---

## 1. Page Purpose & Tone
This is a new citizen's **first real impression** of the product (after the landing page). Tone: optimistic, benefit-forward, low-friction — "this is going to find you money/benefits you didn't know about," not a bureaucratic form. Unlike Login, this page can afford a touch more warmth/personality in copy since it's doing persuasion, not just utility.

## 2. Layout — Desktop
Split-screen, but **mirrored from Login** (illustration panel on the LEFT, form on the RIGHT) — this small reversal is a deliberate continuity/anti-slop detail: a user moving between Login and Signup should feel the layout "flip," not see an identical template with swapped headline text.
- **Left panel (50%, Primary green `#1F6E43` field, radial gradient darker at edges):** device-frame illustration of a citizen (different pose/scene from Login — e.g. a student or small-business owner looking at a phone with a checklist/benefit card appearing above it) with floating props: a small floating rupee-coin stack, a floating checkmark-badge, a floating document icon.
- **Right panel (50%, white):** the signup form, vertically centered, 64px+ horizontal padding.

## 3. Right Panel — Content & Components (top to bottom)
1. **Logo lockup** top of panel (same custom mark as Login, never a generic sparkle/AI icon).
2. **Headline:** "Find every scheme you qualify for" — Fraunces Bold, 36px, Ink. (Deliberately benefit-stated, not "Create your account" — save the literal instruction for the subtext.)
3. **Subtext:** "Create your account — it takes less than a minute." General Sans Regular, 16px, Body color.
4. **Full name field:** label "Full name", rounded input, placeholder "As per your ID".
5. **Email field:** label "Email address", placeholder "you@example.com".
6. **Password field:** label "Password", trailing show/hide toggle (custom icon per Design System), helper text below in Muted color: "At least 8 characters." A lightweight strength indicator: a thin 4-segment bar beneath the field that fills left-to-right in Muted → Accent gold → Primary green as password strength increases — styled as a soft rounded bar, not a harsh red/yellow/green traffic-light default.
7. **Primary CTA button:** full-width pill, Primary green, white text "Create account", 52px height, same hover/press behavior as Login's button.
8. **Terms line:** small (13px) Muted-color text below the button: "By creating an account, you agree to our **Terms of Service** and **Privacy Policy**." — bolded parts are links in Primary green with underline-on-hover.
9. **Footer line:** "Already have an account? **Log in**" — bold part links to Login, Primary green underline-on-hover.

## 4. States to Specify
- **Field focus / error states:** identical pattern to Login (`01-login.md` §4) — green focus ring, red error border + helper text + custom error icon.
- **Email-already-registered error** (ties to SRS FR1.1): error appears directly under the Email field (not a generic top-of-form banner), text: "An account with this email already exists. **Log in instead?**" — the bold part is a Primary-green link.
- **Password strength states:** weak (1 segment, Error-red-tinted), fair (2 segments, Accent gold), strong (4 segments, Primary green) — label text beneath the bar updates accordingly in 12px Muted text.
- **Loading state:** same inline spinner pattern as Login.
- **Success/transition state:** on successful submit, briefly show a full-panel checkmark animation moment (a clay-style checkmark badge scaling in) before routing to onboarding — describe this as a transition frame, not a separate page.

## 5. Mobile Layout (390×844)
- Illustration collapses to a top banner (≤28% viewport height), rounded bottom corners as a "sheet," same illustration simplified/cropped.
- Form stack below, full width, 20px horizontal padding, same field order.
- Password strength bar and terms line remain full width beneath their respective elements, unchanged in behavior.

## 6. Accessibility Notes
- Password field must have an accessible label announcing show/hide state changes.
- Password strength indicator must not rely on color alone — pair with the text label ("Weak"/"Fair"/"Strong").
- Terms/Privacy links must be reachable via keyboard tab order before the submit button.
