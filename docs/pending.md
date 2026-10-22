# What is pending in the project

Status as of 2026-10-22. Storefront: `my-storefront`. Backend: `C:\Users\ADMIN\Desktop\dp\my-storeback`
(details in its `docs/phase3-notes.md` and `docs/phase4-launch.md`).

Phases 0 to 3 are done and verified. Phase 4 (hardening and launch) is partly done: the code and
tooling are in, but the launch itself is blocked on decisions and accounts listed below.

## 1. Blocked on a decision or an account (needs you)

| # | Item | Why it blocks launch |
|---|---|---|
| 1 | **Hosting platform** | Nothing can go to staging or production until chosen. A Dockerfile for each app and a compose example exist. |
| 2 | **SMS vendor** (MSG91, Twilio, ...) with an India DLT-registered template | Login codes only go to the server log today, so no real customer can sign in. Needs a notification provider on the `sms` channel. |
| 3 | **Email vendor** (Resend, SendGrid, ...) and a verified sender domain | Order receipts only go to the log. Needs a provider on the `email` channel. |
| 4 | **Live payment accounts**: Razorpay and PhonePe credentials | The two payment providers have never talked to a real gateway. Each needs a real small payment, including the "paid, then closed the tab" case. |
| 5 | **Legal text**: privacy, refund, shipping, terms | `/policies/*` returns 404 until the text is added in Admin > Storefront content > Pages. Footer links already point there. |
| 6 | **Business inputs** | Shipping fee under ₹500 (placeholder 60), GST rate (18%), coupon stacking (currently compounds on the reward tier), real stock levels (placeholder 50). |
| 7 | **Product images** | They still load from `dpetals.com/cdn/shop`. Move them to your own storage or CDN before the old site goes away, then change `MEDIA_BASE_URL`. |

## 2. Phase 4 work still open

Code or setup I can do once the decisions above are made, or that was not finished:

- **Docker image check.** The backend image build was running when this file was written. The last
  failure (peer dependency conflict) is fixed with `--legacy-peer-deps`; the finished build and a
  container start have not been verified. The storefront image has not been built at all.
- **Load test on a realistic target.** First run on the dev server, 20 concurrent shoppers: no errors,
  but cart writes took about 5 seconds at the median (cart add p50 5.7 s, cart create 2.1 s) while a
  Docker build was also running. That is not a valid measurement. It needs a rerun against the compiled
  server with nothing else running, then against staging. Cart-write speed is the thing to watch.
- **Rate-limit live check.** The limits are unit tested only. They are switched off in the dev `.env`
  (`RATE_LIMIT_DISABLED=true`) so the contract tests can run, so a 429 has not been seen end to end.
  Turn them on temporarily, hit one route past its budget, and confirm the storefront shows the message.
- **Storefront rebuild and browser check** after the Phase 4 storefront changes (security headers,
  error pages, `robots.txt`, `sitemap.xml`, visitor-address forwarding). `tsc` and lint pass; the build
  and a browser pass have not been repeated. Also add `STOREFRONT_API_SECRET` to the storefront's
  `.env.local` (same value as the backend) or per-visitor limits will count the storefront server.
- **Monitoring.** Alerts on `/ready`, 5xx rate, any `STUCK cart` log line and Redis memory; optional
  OpenTelemetry in `instrumentation.ts` once an exporter is chosen.
- **Admin access.** Real admin users, remove the development admin, restrict `/app` by network or SSO.
- **Backups.** Schedule `ops/backup-postgres.sh` (or use managed point-in-time recovery), copy dumps
  off the machine, repeat the restore drill every quarter. The drill passed once on a scratch database.
- **Staging cutover.** Deploy, migrate, seed once, add real content, run the contract suites on a
  throwaway copy, walk the acceptance list in `docs/medusa-backend-spec.md` section 11, then DNS
  switch with rollback by pointing DNS back. Full checklist in the backend's `docs/phase4-launch.md`.

## 3. Product gaps (not launch blockers, decide whether you want them)

- **No review form on the storefront.** The backend accepts reviews (`POST /store/dp/products/:handle/reviews`)
  and Admin moderates them, but customers cannot submit one yet.
- **Search is in-memory in the backend.** Fine for about 30 products. Move to Meilisearch if the
  catalogue grows past a few thousand.
- **Email-less accounts.** Customers sign in by phone; their email is optional and collected at
  checkout for receipts.
- **No visual comparison done for Phase 3 or 4 pages** against `docs/reference/` screenshots (the
  full-page screenshot timed out; only a structural check of the home page was run).

## 4. Housekeeping

- **Nothing is committed.** Both repos have many uncommitted changes; the backend repo has no commits
  at all. Commit when you are ready (I have not been asked to).
- **Development-only settings in the backend `.env`**: `OTP_DEV_ECHO`, `ALLOW_MANUAL_PAYMENT`,
  `RATE_LIMIT_DISABLED`, a weak `JWT_SECRET`. The production guard refuses to start with any of them.
- **Medusa peer mismatch**: the project pins `@medusajs/ui` 4.2.6 while Medusa 2.22 peers 4.2.7. Harmless
  (Admin only) but worth aligning on the next dependency update.
- **Storefront Next.js warning** about a stray `package-lock.json` in `C:\Users\ADMIN`: set
  `outputFileTracingRoot` in `next.config.ts` or remove that file.
- **Contract tests change data**: they reserve stock permanently and create orders. Development
  databases only.
