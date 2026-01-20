# Frontend Rules: Boundaries + Reuse (Storefront + Dashboard in one app)

This repo is **one Next.js app** that contains two distinct product surfaces:

- **Storefront**: public shopping experience (e.g. `/`, `/products`, `/cart`, `/checkout`, `/profile`)
- **Dashboard**: staff/admin experience (everything under `/dashboard/**`)

Even though it’s a single app, treat these as **separate feature domains**.

---

## 1) Hard boundary: Dashboard UI/features must not depend on Storefront UI/features

- **Do not import storefront-only components/providers into dashboard routes.**
- **Do not mount storefront UX in dashboard** (cart, storefront effects, storefront-only context/providers, etc).
- **Dashboard routes live under** `app/dashboard/**` and should only use:
  - dashboard features/components, and
  - shared, domain-agnostic UI (see “Shared UI” below).

**Enforced by design:** `components/AppProviders.tsx` keeps dashboard and storefront provider trees separate. Keep it that way.

### Allowed dependency directions

- **Storefront → shared UI** ✅
- **Dashboard → shared UI** ✅
- **Dashboard ↔ storefront** ❌ (no cross-imports)

---

## 2) Reuse > duplicate: shared UI belongs in shared folders

If the UI/behavior is generic and could appear in multiple places, **do not copy/paste** it into a new feature.

- **Shared UI primitives**: put in `components/ui/**` (buttons, inputs, badges, small helpers)
- **Shared (cross-domain) components**: create `components/shared/**` (or similar) when a component is used by both dashboard + storefront but is not a primitive.
- **Domain-specific components**:
  - dashboard-only: `app/dashboard/**` (or `components/dashboard/**` if needed)
  - storefront-only: `app/**` pages + `components/**` that are clearly storefront-scoped

Rule of thumb:

- If it’s used in **2+ places**, extract it.
- If it’s used by **both** dashboard and storefront, it **must** be in a shared location and must not pull in domain-specific dependencies.

---

## 3) UX rule: async actions must show a pending/loading state

Whenever an action triggers an async request (server action, API call, mutation), the UI must:

- **Show a pending state** (spinner + clear label like “Signing in…”, “Saving…”, etc.)
- **Disable submit/primary actions** while pending (prevents double-submits)

### Server Actions (`<form action={...}>`)

Use `useFormStatus()` via the shared component:

- `components/ui/PendingSubmitButton.tsx`

Example:

```tsx
<form action={someServerAction}>
  {/* fields... */}
  <PendingSubmitButton pendingText="Saving…">Save</PendingSubmitButton>
</form>
```

