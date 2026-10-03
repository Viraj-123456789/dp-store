@AGENTS.md
# Project: <Name> Storefront

## Stack
Next.js (App Router), TypeScript (strict), Tailwind CSS, Medusa JS SDK, TanStack Query.

## Source of truth
- UI/UX: https://dpetals.com/ — replicate layout, spacing, components,
  navigation, interactions, responsive behavior as closely as possible.
- API/data: Medusa v2 backend. Follow the structure in docs/reference/api-samples/.

## Hard rules
1. NEVER hard-code colors. Use only semantic Tailwind tokens backed by CSS
   variables in src/styles/globals.css (bg-primary, text-foreground, etc.).
2. Same for radius, fonts, shadows — tokens only.
3. All Medusa calls go through src/lib/medusa/. No fetch calls in components.
4. TypeScript strict, no `any`. Use @medusajs/types.
5. Mobile-first and fully responsive; match reference breakpoints.
6. Reusable components in components/ui before page-specific ones.


## Reference screenshots
Capture full-page screenshots of https://dpetals.com/ into docs/reference/ for
each page type, at each viewport. Claude Code can read images, so read these
files directly when building or comparing a page.

- Page types: home, listing, product, cart, checkout, account
- Viewports: desktop (1440px), tablet (768px), mobile (390px)
- Naming: `<page>-<viewport>-full.png` (e.g. `listing-tablet-full.png`)
- Capture the full scrollable page, not just the viewport.
- Checkout and account may require a cart/login; capture whatever is
  reachable and note any state that could not be captured.

## Workflow
Build one page/section at a time, compare against docs/reference/ screenshots,
run `npm run lint` and `npm run build` before finishing a task.