# Pulse RX — Design Rules & Theme Principles

This document captures design rules and theme principles derived from the app architecture (`app.xml`), components (`components.xml`), and utilities (`utils.xml`). Use it when creating new UI pages or components so the experience stays consistent.

---
asim
## 1. Architecture Overview

- **One Next.js app, two surfaces**: **Storefront** (public: `/`, `/products`, `/cart`, `/checkout`, `/profile`) and **Dashboard** (staff: `/dashboard/**`). They are separate feature domains; dashboard must not import storefront-only components or providers.
- **Shared UI**: Primitives live in `components/ui/` (Button, Card, Input, Badge, Modal, Pagination, PendingSubmitButton, ConfirmingSubmitButton). Use these instead of duplicating styles.
- **Utilities**: `utils/cn.ts` for class merging; `utils/errors.ts` for API error handling. Use `cn(...)` for conditional/merged class names.

---

## 2. Theme & Color Palette

### 2.1 Source of truth

Theme is defined in **`app/globals.css`** via Tailwind `@theme` and `:root`:

- **Brand**
  - **Primary (green)**: `#01AC28` — CTAs, links, success, prices, focus rings.
  - **Dark (teal)**: `#044644` — hover for primary, gradients.
  - **Light (green)**: `#5C9D40` — gradients with primary.
- **UI**
  - **White**: `#FFFFFF`.
  - **Gray light (backgrounds)**: `#EFEFEF`.
  - **Gray medium (muted text)**: `#9CA3AF` (and often `#6B7280` in storefront).
  - **Gray dark (body/headings)**: `#374151`.
  - **Black**: `#000000`.

### 2.2 Usage rules

- **Prefer theme tokens** when Tailwind exposes them (e.g. `brand-primary`, `ui-gray-light`, `ui-black` in `globals.css`). For storefront, hardcoded hex is common: `#01AC28`, `#044644`, `#374151`, `#6B7280`, `#EFEFEF`, `#111827` (dark hover).
- **Primary actions / CTAs**: Use `#01AC28` (or `brand-primary`), hover `#044644` (or `brand-dark`).
- **Secondary/dark buttons**: Use `#374151`, hover `#111827`.
- **Body text / headings**: `#374151` (or `ui-gray-dark`).
- **Muted / secondary text**: `#6B7280` or `#9CA3AF` (or `text-gray-400`).
- **Backgrounds (cards, sections, inputs)**: `#EFEFEF` or `gray-50`, `gray-100`.
- **Borders**: `border-gray-100`, `border-gray-200`; subtle use of `border-[#01AC28]` for active/selected.
- **Focus**: Always `focus:ring-2 focus:ring-[#01AC28]` (and optionally `focus:ring-offset-2`).

---

## 3. Typography

- **Font**: Nunito Sans via CSS variable `--font-nunito-sans`; body uses `font-family: var(--font-nunito-sans), sans-serif`.
- **Weights**: `font-bold` / `font-semibold` for headings and emphasis; `font-extrabold` / `font-black` for hero and key numbers; `font-medium` for labels.
- **Scale (storefront)**:
  - Section labels: `text-[10px] font-bold uppercase tracking-widest` (e.g. “FAQs”, “Items”).
  - Small labels: `text-xs` / `text-[10px]` with `uppercase tracking-wider` or `tracking-[0.2em]`.
  - Body: `text-sm` / `text-base`.
  - Headings: `text-2xl` → `text-5xl` with `font-bold`, responsive (e.g. `text-3xl md:text-4xl lg:text-5xl`).
- **Letter-spacing**: Uppercase buttons and badges use `tracking-[0.2em]` or `tracking-widest`; links/CTAs often `tracking-widest`.

---

## 4. Spacing & Layout

- **Page background**: Storefront pages use `min-h-screen bg-white`; dashboard root uses `min-h-screen bg-gray-50 text-[#111827]`.
- **Containers**: Storefront uses `container mx-auto max-w-7xl` with `px-4 md:px-6 lg:px-12`.
- **Sections**: Vertical padding `py-8 md:py-16` or `py-12 md:py-16`; consistent horizontal padding as above.
- **Breadcrumb strip**: `bg-[#EFEFEF] py-4 md:py-6` with same container/padding.
- **Dashboard**: Content area `px-4 py-6 sm:px-6 lg:px-8`; max width `max-w-[1800px]` for the main flex layout.

---

## 5. Border Radius

- **Cards / panels**: `rounded-2xl` (or `rounded-xl md:rounded-2xl`).
- **Buttons / inputs**: `rounded-xl` (smaller elements sometimes `rounded-lg`).
- **Badges / pills**: `rounded-full`.
- **Images / product thumbnails**: `rounded-xl`, `rounded-2xl`, or `rounded-lg` for small ones.
- **Empty states**: Large dashed areas use `rounded-3xl`.

---

## 6. Shadows

- **Cards**: `shadow-sm` often with `shadow-gray-100`.
- **Buttons (primary/dark)**: `shadow-lg`, hover `shadow-xl`; sometimes `shadow-sm shadow-gray-200`.
- **Modals / sidebars**: `shadow-2xl`.
- **Dropdowns / popovers**: Light shadow consistent with cards.

---

## 7. Components & Patterns

### 7.1 Buttons

- Use **`components/ui/Button`** with variants: `primary` (dark gray `#374151`), `secondary` (white + border), `ghost`, `danger`.
- Sizes: `sm`, `md`, `lg`. Base style: `rounded-xl font-bold uppercase tracking-[0.2em]`, focus ring `#01AC28`.
- **Storefront-only CTAs** (when not using shared Button): `bg-[#01AC28] hover:bg-[#044644] text-white ... rounded-xl font-bold ... tracking-[0.2em] uppercase` and optionally `shadow-lg hover:shadow-xl`.

### 7.2 Inputs

- Use **`components/ui/Input`**: `rounded-xl border border-gray-200`, `focus:ring-2 focus:ring-[#01AC28]`. Storefront sometimes uses `bg-[#EFEFEF] border-none` with same focus ring.

### 7.3 Cards

- Use **`components/ui/Card`** (and CardHeader, CardTitle, CardContent): `rounded-2xl border border-gray-200 bg-white shadow-sm shadow-gray-100`.
- CardHeader: `p-5 border-b border-gray-100`; CardTitle: `text-sm font-extrabold text-[#374151]`.

### 7.4 Badges

- Use **`components/ui/Badge`**: variants `success`, `warning`, `danger`, `neutral`. Style: `rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em]`.

### 7.5 Links

- **Inline links**: `text-[#6B7280] hover:text-[#01AC28] transition-colors` (or `text-ui-black hover:text-brand-primary` where tokens exist).
- **Primary CTA links**: `text-[#01AC28] hover:text-[#044644]` with optional `font-bold` and `uppercase tracking-widest`.

### 7.6 Forms (async actions)

- Use **`PendingSubmitButton`** (or **`ConfirmingSubmitButton`** when confirmation is needed) so async actions show a pending state and disable double-submit.

---

## 8. State & Feedback

- **Success**: Green (`green-600`, `text-green-600`, `bg-green-50`, `border-green-100`).
- **Warning**: Yellow (`yellow-600`, `text-yellow-600`, `bg-yellow-50`).
- **Error / danger**: Red (`red-500`, `red-600`, `red-700`, `bg-red-50`, `border-red-100`, `text-red-700`).
- **Info / pending**: Orange for “required” states (`orange-600`); yellow for “pending”.
- **Selected / active**: Border or background with `#01AC28` (e.g. `border-2 border-[#01AC28] bg-[#F0FDF4]`).

---

## 9. Responsive Behavior

- **Breakpoints**: Use Tailwind defaults (`sm`, `md`, `lg`). Typical pattern: mobile-first, then `md:` and `lg:` for spacing, font sizes, and visibility.
- **Grids**: Product grids use `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` with `gap-4 md:gap-6`.
- **Visibility**: Filter sidebar often `hidden lg:flex` (desktop) with a mobile filter trigger; breadcrumbs and nav adapt with `md:` text/icon sizes.

---

## 10. Motion & Transitions

- **Transitions**: `transition-colors`, `transition-all`, `transition-transform` with `duration-300` or `duration-500` for overlays.
- **Hover**: Buttons and cards use `hover:shadow-lg`, `hover:border-[#01AC28]/20`; images `group-hover:scale-110` with `transition-transform duration-500`.
- **Focus**: Always visible focus ring (`focus:ring-2 focus:ring-[#01AC28]`).

---

## 11. Accessibility & UX

- **Focus**: All interactive elements use the green focus ring; do not remove it without an equivalent visible focus style.
- **Async actions**: Show pending state and disable submit during requests (use PendingSubmitButton / ConfirmingSubmitButton).
- **Empty states**: Use a clear icon (e.g. in a `rounded-full` circle), heading, short description, and one primary CTA.

---

## 12. Dashboard-Specific Notes

- **No storefront UX** in dashboard: no cart, magic cursor, or storefront-only providers.
- **Palette**: Same grays and primary green for consistency; background `bg-gray-50`; content on white with `border-gray-200`.
- **Sidebar**: Uses `#044644` for icon background; nav items use `rounded-xl` and hover states; active state can use `bg-[#01AC28]` or equivalent.
- **Tables**: `hover:bg-gray-50/60` on rows; headers with `text-xs font-bold text-gray-400 uppercase tracking-widest` or similar.
- **Alerts**: Success/info `border-green-100 bg-green-50 text-green-700`; error `border-red-100 bg-red-50 text-red-700`; `rounded-2xl` for alert containers.

---

## 13. Checklist for New Pages/Components

- [ ] Use theme colors: primary `#01AC28`, dark `#044644`, grays `#374151`, `#6B7280`, `#EFEFEF` (or CSS variables where available).
- [ ] Use shared components from `components/ui/` where applicable (Button, Input, Card, Badge, Modal, etc.).
- [ ] Use `cn()` from `@/utils/cn` for conditional class names.
- [ ] Focus ring: `focus:ring-2 focus:ring-[#01AC28]` on focusable elements.
- [ ] Spacing: container `container mx-auto max-w-7xl`, section padding `py-8 md:py-16`, horizontal `px-4 md:px-6 lg:px-12` (storefront).
- [ ] Border radius: cards/panels `rounded-2xl`, buttons/inputs `rounded-xl`, pills `rounded-full`.
- [ ] Typography: Nunito Sans; headings bold/extrabold; small labels uppercase with tracking.
- [ ] Async actions: PendingSubmitButton or ConfirmingSubmitButton in forms.
- [ ] Respect storefront vs dashboard boundary: no storefront-only imports in dashboard.

Using this document when adding or changing UI will keep new pages and components aligned with the existing design system and architecture.
