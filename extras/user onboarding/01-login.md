# Stitch Prompt — Login Page

**Product:** Saarthi — personalized government scheme discovery platform
**Page:** Login (`/login`)
**Frame:** Desktop (1440×1024) primary, then Mobile (390×844) variant

---

## 0. Design System (apply identically across every page in this project — do not restyle per-page)

This is a deliberately **custom, un-generic** design language — not a default Tailwind/shadcn starter look. Every instruction below exists to avoid that "AI slop" default: purple-blue gradient hero, all-Inter type, `rounded-2xl shadow-lg` everywhere, symmetric centered card with no personality.

**Brand rationale (state this intent in the generation, it should visibly inform the output):** the palette is built around India's tricolor identity — a deep trustworthy green (the platform's primary) paired with a warm saffron/gold accent — not an arbitrary trendy SaaS green. This is a civic platform, so it should read as credible and warm, not like a fintech startup.

**Color tokens**
- Primary (brand green): `#1F6E43` — "Tricolor Green"
- Primary hover/pressed: `#195A37`
- Accent (saffron/gold, used sparingly — CTAs' secondary highlight, active step indicator, small badges, illustration clothing accents): `#F2A93B`
- Ink (headline text): `#10241A` — near-black with a warm green tint, never pure `#000`
- Body text: `#3C4A42` — muted green-grey, not flat grey
- Muted/placeholder text: `#8A9A90`
- Background base: `#FBFBF6` — warm off-white (paper-like, not stark white)
- Card surface: `#FFFFFF`
- Border: `#E7ECE3`
- Error: `#C0473B` (muted brick red, not neon red)
- Success: reuse Primary green
- Focus ring: `#1F6E43` at 35% opacity, 3px outer glow

**Shadows:** soft, tinted with the brand green, never flat grey. Example: `box-shadow: 0 12px 32px rgba(31,110,67,0.12)`. No harsh default `shadow-lg` grey drop shadows anywhere.

**Typography**
- Headings: **Fraunces** (serif, warm/editorial, semi-bold to bold) — this is the single biggest thing that makes this NOT look like a generic AI SaaS mockup. Do not substitute a generic grotesk for headings.
- Body/UI text: **General Sans** (fallback: Inter) — clean, humanist sans, regular/medium weight only.
- Never mix more than these two families. Never use a default system font stack.

**Shape language**
- Large, soft, slightly irregular rounding — 28px on large panels/cards, 16px on inputs, full-pill (999px) on primary buttons.
- Outer illustration panel uses a rounded "device frame" container (like a tablet bezel) — thick (10-14px) dark-green (`#10241A`) frame with a subtle inner shadow, echoing a physical object rather than a flat rectangle. This detail alone reads as custom/designed rather than templated.

**Illustration direction (applies to every page with a hero character)**
- Style: **claymorphism / soft matte 3D render** — like hand-modeled clay or soft matte plastic toys, NOT glossy PBR/glassy AI-render material. Soft rim lighting, gentle ambient occlusion, subtle grain/noise texture on surfaces (avoid perfectly clean AI-plastic sheen).
- Color-limited palette: illustrations use ONLY brand tokens above (green, saffron/gold, warm cream/skin tones, near-black outlines) — never introduce random unrelated hues (no random blues/purples/pinks appearing only in the illustration).
- Characters should read as ordinary Indian citizens in everyday dress — NOT generic Silicon-Valley-tech-bro 3D mascots. Reference: a person at a desk, a farmer, a student with a bag, a small shopkeeper — grounded, specific, warm — not abstract corporate avatars.
- Compose each illustration with 2–3 small floating supporting props relevant to the page's purpose (e.g. a small floating ID-card icon, a rupee coin, a document) rendered in the same clay style, gently offset with soft drop shadows for depth — this is what the reference's "floating icons around the character" trick does; replicate that compositional habit, not the exact icons.

**Anti-slop checklist (verify before finalizing every page)**
- [ ] No purple/blue gradient anywhere
- [ ] No generic centered-card-on-plain-background layout with zero asymmetry
- [ ] No default Inter-for-everything typography
- [ ] No stock/generic icon set (use custom-styled icons matching the claymorphism accent props, not Font Awesome/Material defaults)
- [ ] No glossy/glassy AI-render sheen on the illustration
- [ ] Layout has at least one deliberate asymmetric or off-grid element (the illustration panel, an overlapping badge, an intentionally oversized headline word)

---

## 1. Page Purpose & Tone
The Login page is the return-visit entry point for a citizen who already has an account. Tone: warm, quick, reassuring — "welcome back," not a corporate gate. This is not the first impression of the brand (Signup/first visit is), so keep it lean and fast — no marketing copy, just a clean, trustworthy return path.

## 2. Layout — Desktop
Split-screen, 45/55:
- **Left panel (45%, white `#FFFFFF` background):** the login form, vertically centered, generously padded (min 64px horizontal margin).
- **Right panel (55%, background `#1F6E43` deep green field with a subtle darker radial gradient toward the edges — not flat):** the "device-frame" illustration panel described in the Design System, containing a claymorphism illustration of a citizen logging in on a laptop/phone, with 2–3 floating props (a small floating lock/shield icon, a floating scheme-benefit card fragment, a rupee coin) in the same style.

## 3. Left Panel — Content & Components (top to bottom)
1. **Logo lockup** top-left of the panel: a small custom wordmark "🟢 Saarthi" — do not use a generic circular AI/sparkle icon; design a simple geometric mark (e.g. a stylized ashoka-chakra-inspired dot or a minimal document/checkmark glyph) at 32px, paired with the wordmark in General Sans Medium.
2. **Headline:** "Welcome back" in Fraunces Bold, 40px, Ink color.
3. **Subtext:** "Log in to see the schemes you qualify for." — General Sans Regular, 16px, Body color.
4. **Email field:** label "Email address", rounded input (16px radius), border `#E7ECE3`, 1px, placeholder "you@example.com", left-aligned label above the field (not floating-label style — keep it simple and legible).
5. **Password field:** label "Password", same input style, trailing eye-icon toggle to show/hide (custom-styled icon, not a default Material eye icon — simple two-stroke line icon matching the brand's icon language), small "Forgot password?" link right-aligned above or below the field in Accent gold `#F2A93B` underline-on-hover.
6. **Primary CTA button:** full-width pill button, Primary green background, white text "Log in", General Sans Medium 16px, 52px height. On hover: darken to `#195A37` with a slight upward 2px translate + shadow grow (tinted green shadow).
7. **Divider:** "or continue with" with a thin `#E7ECE3` line on both sides.
8. **Secondary auth options (optional, small row):** Google icon button, outlined pill, 48px square, subtle border, no fill — only if the product later supports OAuth; otherwise omit this section entirely rather than showing dead buttons.
9. **Footer line:** "New here? **Create an account**" — the bold part links to Signup, styled in Primary green with an underline on hover.

## 4. States to Specify
- **Empty/default** state as above.
- **Field focus:** border becomes Primary green, focus ring per Design System.
- **Field error** (e.g. invalid email format, wrong password): border becomes Error red, small red helper text below the field in General Sans 13px ("Enter a valid email address." / "Incorrect email or password."), a small error icon (custom, not a generic red triangle — a simple filled circle with an exclamation, matching icon weight elsewhere).
- **Account locked state** (ties to SRS FR1.8 — 5 failed attempts / 15 min lockout): a warm-toned (not harsh) inline banner above the form, background `#FDF3E7` (tint of the saffron accent), border-left 3px solid `#F2A93B`, text: "Too many attempts. Try again in 12 minutes." — icon: a small clock glyph in the same clay-accent style.
- **Loading state:** button shows a small inline spinner (thin ring, Primary green, on white) replacing the label text, button disabled/slightly dimmed.

## 5. Mobile Layout (390×844)
- Illustration panel collapses to a shorter banner (max 30% of viewport height) at the top, same claymorphism illustration cropped/simplified, rounded bottom corners (28px) so it reads as a "sheet" sliding over the illustration.
- Form panel below, full width, same field order and styling, horizontal padding 20px.
- Logo lockup moves to sit centered above the headline on mobile instead of top-left-of-panel.

## 6. Accessibility Notes
- Minimum 4.5:1 text contrast for all body copy against its background.
- All interactive elements have a visible focus state (not just color — an outline/glow, since color alone isn't sufficient).
- Error messages are associated with their field (not just color-coded).
