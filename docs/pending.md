# What is pending in the project

Status as of 2026-10-26. Storefront: `my-storefront`. Backend: `C:\Users\ADMIN\Desktop\dp\my-storeback`
(details in its `docs/phase3-notes.md` and `docs/phase4-launch.md`). How to do the vendor, Razorpay, business
input and image items: [implementation-guides.md](implementation-guides.md).

Phases 0 to 4 are built and verified. What remains is launch itself, and every item below needs a decision or an
account from you. Nothing left on the code side blocks launch except the notification providers (items 2 and 3).

## 1. Needs a decision or an account (blocks launch)

| # | Item | Why it blocks launch |
|---|---|---|
| 1 | **Hosting platform** | Nothing can go to staging or production until chosen. Both Docker images build and run; a compose example exists. |
| 2 | **SMS vendor** (MSG91, Twilio, ...) with an India DLT-registered template | Login codes only go to the server log today, so no real customer can sign in. Needs a notification provider on the `sms` channel (same pattern as the email guide). |
| 3 | **Email vendor** (Resend, SendGrid, ...) and a verified sender domain | Order receipts only go to the log. Needs a provider on the `email` channel. |
| 4 | **Live payment accounts**: Razorpay and PhonePe credentials | The two providers have never talked to a real gateway. Each needs a real small payment, including the "paid, then closed the tab" case. |
| 5 | **Legal text**: privacy, refund, shipping, terms | `/policies/*` returns 404 until the text is added in Admin > Storefront content > Pages. Footer links already point there. |
| 6 | **Business inputs** | Shipping fee under ₹500 (placeholder 60), GST rate (18%), coupon stacking (currently compounds on the reward tier), real stock (placeholder 50). |
| 7 | **Product images** | They still load from `dpetals.com/cdn/shop`. Move them to your own storage or CDN before the old site goes away, then rewrite the stored URLs and change `MEDIA_BASE_URL`. |

## 2. Launch tasks that follow from those decisions

- **Staging deploy and the cutover checklist** (backend `docs/phase4-launch.md`): deploy server and worker,
  migrate, seed once, add real content and legal pages, run the contract suites on a throwaway copy, walk the
  acceptance list in `docs/medusa-backend-spec.md` section 11, then switch DNS (rollback is pointing DNS back).
- **Repeat the load test on the real host.** Laptop result: one server process is CPU bound at about 4 to 8
  requests per second, cart changes take about 0.4 s idle, one order about 1.5 s. Run at least two server
  processes. Detail and what it means in `phase4-launch.md`.
- **Monitoring and alerts**: `/ready`, 5xx rate, any `STUCK cart` log line, Redis memory. Optional OpenTelemetry
  in `instrumentation.ts` once an exporter is chosen.
- **Admin access**: real admin users, remove the development admin, restrict `/app` by network or SSO.
- **Backups**: schedule `ops/backup-postgres.sh` (or managed point-in-time recovery), copy dumps off the machine,
  repeat the restore drill quarterly. The drill passed once.
- **Hide the payment option you do not use** at checkout (`paymentOptions` in
  `src/components/checkout/checkout-page.tsx`) if only one gateway goes live.

## 3. Product gaps (not launch blockers, decide whether you want them)

- **No review form on the storefront.** The backend accepts reviews and Admin moderates them, but customers
  cannot submit one yet.
- **Search is in-memory in the backend.** Fine for about 30 products; move to Meilisearch if the catalogue grows
  past a few thousand.
- **Notifications beyond the order receipt** (shipped, refunded, abandoned cart) are not built.
- **Cart changes are slowish** (about 0.4 s each on an idle laptop). If staging feels sluggish, profile the add
  to cart path next.
- **No visual comparison done for the Phase 3 and 4 pages** against `docs/reference/` screenshots (the
  browser tool was unavailable for the last checks; pages were verified by status codes, headers and HTML
  structure).

## 4. Housekeeping

- **Nothing is committed.** Both repos have many uncommitted changes; the backend repo has no commits at all.
  Commit when you are ready (I have not been asked to).
- **Development-only settings in the backend `.env`**: `OTP_DEV_ECHO`, `ALLOW_MANUAL_PAYMENT`,
  `RATE_LIMIT_DISABLED`, a weak `JWT_SECRET`. The production guard refuses to start with any of them.
- **Medusa peer mismatch**: the project pins `@medusajs/ui` 4.2.6 while Medusa 2.22 peers 4.2.7. Harmless
  (Admin only; the backend image installs with `--legacy-peer-deps`) but worth aligning on the next update.
- **Storefront lockfile** was regenerated so the Docker build installs cleanly (`npm ci` in the image uses npm 11).
- **Next.js warning** about a stray `package-lock.json` in `C:\Users\ADMIN`: set `outputFileTracingRoot` in
  `next.config.ts` or remove that file.
- **Contract tests change data**: they reserve stock permanently and create orders. Development databases only.
