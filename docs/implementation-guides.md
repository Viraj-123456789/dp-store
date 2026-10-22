# Implementation guides for the open launch items

Step-by-step for four items from [pending.md](pending.md): the email vendor, Razorpay, the business
inputs, and moving the product images off the old site. Paths starting `apps/backend` are in the
backend repo (`C:\Users\ADMIN\Desktop\dp\my-storeback`); `src/...` paths are in this storefront repo.

Everything below was checked against the current code. Where I did not run a step (it needs an account
or a live service) it says so.

---

## 1. Email vendor (order receipts)

### What exists today
- An `order.placed` subscriber (`apps/backend/src/subscribers/order-placed.ts`) already builds the receipt
  and asks Medusa's notification module to send it on the `email` channel with template `order-placed`.
  The payload is `data: { subject, text, html, orderNumber }` (`lib/dp/email/order-placed.ts`).
- In `apps/backend/medusa-config.ts` the only notification provider is the local one, which just logs. It
  is registered for the channels `feed`, `sms` and `email`.
- A failed receipt is caught and logged; it never blocks an order.

So the work is one thing: add a provider that really sends on the `email` channel. The example uses
Resend (simple HTTPS API). SendGrid or Postmark follow the same shape; only the HTTP call changes.

### Steps
1. **Choose the vendor and verify the sender domain.** In the vendor's dashboard add your domain and create
   the DNS records it shows (SPF, DKIM, and ideally DMARC). Send from an address on that domain, for
   example `orders@yourdomain.com`. Without this, receipts land in spam or are rejected.
2. **Create an API key** (sending access only) and keep it out of git.
3. **Add environment variables** to `apps/backend/.env.template` and your real environment:
   ```
   RESEND_API_KEY=
   EMAIL_FROM="DPetals <orders@yourdomain.com>"
   ```
4. **Create the provider module** `apps/backend/src/modules/resend-notification/` (style: no semicolons,
   double quotes, kebab-case files). `index.ts`:
   ```ts
   import { ModuleProvider, Modules } from "@medusajs/framework/utils"
   import ResendNotificationProviderService from "./service"

   export default ModuleProvider(Modules.NOTIFICATION, { services: [ResendNotificationProviderService] })
   ```
   `service.ts`:
   ```ts
   import type { Logger, ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from "@medusajs/framework/types"
   import { AbstractNotificationProviderService, MedusaError } from "@medusajs/framework/utils"

   type Options = { apiKey: string; from: string }
   type Content = { subject?: string; text?: string; html?: string }

   export default class ResendNotificationProviderService extends AbstractNotificationProviderService {
     static identifier = "resend"

     constructor(private readonly deps: { logger: Logger }, private readonly options: Options) {
       super()
     }

     static validateOptions(options: Record<string, unknown>) {
       if (!options.apiKey || !options.from) {
         throw new MedusaError(MedusaError.Types.INVALID_DATA, "Resend needs RESEND_API_KEY and EMAIL_FROM.")
       }
     }

     async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
       const content = notification.data as Content
       const response = await fetch("https://api.resend.com/emails", {
         method: "POST",
         headers: { Authorization: `Bearer ${this.options.apiKey}`, "Content-Type": "application/json" },
         body: JSON.stringify({
           from: this.options.from,
           to: [notification.to],
           subject: content.subject,
           text: content.text,
           html: content.html,
         }),
         signal: AbortSignal.timeout(8000),
       })
       if (!response.ok) {
         // The subscriber catches this and logs it; the order is unaffected.
         throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Resend refused the email (${response.status}).`)
       }
       const body = (await response.json()) as { id?: string }
       return { id: body.id }
     }
   }
   ```
   Check the exact abstract class members against `@medusajs/framework/utils` for your Medusa version when you
   add it; the signatures above match the 2.x pattern but I have not compiled this file.
5. **Register it** in `medusa-config.ts`, in the notification module's `providers`, and take `email` off the
   local provider so each channel has exactly one provider:
   ```ts
   providers: [
     { resolve: "@medusajs/medusa/notification-local", id: "local",
       options: { name: "Local notifications", channels: ["feed", "sms"] } },
     { resolve: "./src/modules/resend-notification", id: "resend",
       options: { channels: ["email"], apiKey: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM } },
   ]
   ```
   Keep `sms` on the local provider until the SMS vendor is added (same pattern, channel `sms`, template
   `login-otp`, data `{ code, ttl_minutes }`).
6. **Make production refuse to boot without it.** Add `RESEND_API_KEY` and `EMAIL_FROM` to the checks in
   `apps/backend/src/lib/production-guard.ts` (and a line in its unit test).
7. **Test.** Place a test order with a real address you own (manual payment in development). Confirm the
   email arrives, renders, and that the sender passes SPF/DKIM (the vendor dashboard shows this). Then break
   the key on purpose and confirm the order still completes and a warning is logged.

### Later
Order shipped / refunded emails and abandoned-cart mails are not built; they would be new subscribers using
the same `email` channel.

---

## 2. Razorpay (live payments)

The provider is already written and unit tested but has **never talked to Razorpay**. This guide is the
go-live procedure. The design (Payment Links, signatures, webhook events) is documented in
`apps/backend/docs/payments.md`.

### Steps
1. **Account.** Create the Razorpay business account and finish KYC. Start in **Test Mode** (toggle in the
   dashboard) and do everything below there first.
2. **API keys.** Dashboard > Account & Settings > API Keys > Generate. Copy the key id and secret once.
3. **Webhook.** Dashboard > Account & Settings > Webhooks > Add. URL:
   `https://<your-backend-domain>/hooks/payment/razorpay_razorpay`. Type your own long random **secret**.
   Tick: `payment_link.paid`, `payment_link.cancelled`, `payment_link.expired`, `payment.captured`,
   `payment.authorized`, `order.paid`. The backend must be reachable from the internet over HTTPS (for
   local testing use a tunnel such as ngrok or cloudflared).
4. **Environment variables** on the backend (all three are needed or the provider does not register):
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   RAZORPAY_WEBHOOK_SECRET=<the secret from step 3>
   ```
   Restart the backend. In production also set `STOREFRONT_URL` and `NEXT_PUBLIC_SITE_URL`: customers return
   to `<site>/checkout/return` after paying.
5. **Enable the provider on the region.** Admin > Settings > Regions > India > Payment providers: tick
   `pp_razorpay_razorpay`. Without this the checkout reports "Online payments aren't available".
6. **Test-mode checks** (use Razorpay's test cards and UPI ids from their docs):
   - Pay successfully: you return to the order confirmation, the order exists once.
   - Cancel on the Razorpay page and come back: the cart is intact, you can retry.
   - Pay, then **close the tab before returning**: the webhook should still create the order. Watch the
     backend log for the webhook, and confirm no duplicate order appears when you do return.
   - Webhook failure case: temporarily point the webhook at a wrong URL, pay, close the tab. Within about
     15 minutes the reconciliation job (`reconcile-payments`) should place the order; a log line
     `payment-reconcile: placed the order ...` confirms it. (Needs the worker or a shared process running.)
   - Refund one test payment from Admin and confirm it reaches Razorpay.
7. **Go live.** Switch the dashboard to Live Mode, generate **live** keys and a **live** webhook (same URL and
   events, new secret), replace the three variables, restart. Place one real low-value order and refund it.
8. **Production guard.** With at least one gateway configured the server's startup check passes; it also
   refuses to start with the development switches (`ALLOW_MANUAL_PAYMENT`, `OTP_DEV_ECHO`,
   `RATE_LIMIT_DISABLED`) on.

### Things to know
- The minimum amount is ₹1. Payment links expire after 30 minutes by default.
- Razorpay settlement, fees and GST invoices are handled in their dashboard, not here.
- Never put the key secret or webhook secret in the storefront.
- PhonePe follows the same steps with its own six variables (see `payments.md`). Do both only if you want
  both options at checkout; the storefront shows both today and an unconfigured one fails with a clear
  message, so hide the one you do not use before launch (`paymentOptions` in
  `src/components/checkout/checkout-page.tsx`).

---

## 3. Business inputs

Five numbers are placeholders. Where each one lives, and what to change:

| Input | Placeholder | Where to change it | Notes |
|---|---|---|---|
| **Shipping fee** under the threshold | ₹60 | Backend env `SHIPPING_FEE_INR`, restart | Read by the `dp-shipping` provider at startup (`medusa-config.ts`). |
| **Free-shipping threshold** | ₹500 | Backend env `FREE_SHIPPING_THRESHOLD` **and** the storefront constant `FREE_SHIPPING_THRESHOLD` in `src/lib/cart/pricing.ts` | Two places: the backend charges, the storefront shows the progress bar and "Free". Change both together and rebuild the storefront. Measured on the list price, before discounts. |
| **GST rate** | 18% | Admin > Settings > Tax Regions > India > default rate | The seed only creates the rate when it is missing, so editing the env and re-seeding does **not** change an existing one. Prices are tax-inclusive; changing the rate changes the tax portion, not the shelf price. Per-product rates (for example 12% on some items) are added as tax rules in the same screen. |
| **Coupon stacking** | A coupon compounds on top of the reward tier (tier first, then coupon) | Medusa's promotion engine applies both, configured by the promotions in Admin and `apps/backend/src/scripts/seed/promotions.ts`; the finding is in `apps/backend/docs/phase0-findings.md` | Decide the policy first (stack, or best-of-two). Changing it is a code change plus new contract test cases in `contract-tests/cart.mjs`, so tell me the rule and I will implement and test it. |
| **Stock levels** | 50 per variant | Admin > Inventory (per item and location) | The seed value (`STOCK_PER_VARIANT`) only applies when products are first created. Enter real counts in Admin, or import them from a CSV there. |

Also review, same way (they are decisions, not defaults):
- **Reward tiers** (10% from ₹1000, 15% from ₹1500, 20% from ₹2000): promotions `REWARD-10/15/20` in Admin
  and the matching `REWARD_TIERS` in `src/lib/cart/pricing.ts`. Keep both in step.
- **Max per variant** (50): backend env `MAX_QUANTITY_PER_VARIANT` and `src/lib/cart/limits.ts`.
- **First-order coupon** `FIRSTTIMEOFFER`: Admin > Promotions.

After any change: run the contract suites against a development copy, and place one order to check the
totals on the cart, checkout and confirmation screens agree.

---

## 4. Moving product images off dpetals.com

### How images are wired now (verified in the dev database)
- The 28 products store **absolute URLs** (`https://dpetals.com/cdn/shop/files/...`): 28 in `product.thumbnail`
  and 168 in the `image` table.
- The API strips the base (`MEDIA_BASE_URL`) and returns a **relative path** (`files/xyz.png`). The storefront
  adds its own base back with `cdn()` (`src/lib/cdn.ts`, from `NEXT_PUBLIC_MEDIA_BASE_URL`).
- Home, journal and page content already use relative paths, and none contain `dpetals.com` (checked).
- Next's image optimizer only fetches from hosts listed in `images.remotePatterns` in `next.config.ts`.
- Cart lines and emails use the full URL built from `MEDIA_BASE_URL`.

### Steps
1. **Pick the new home** (S3 or R2 bucket behind a CDN, or the CDN your host provides) and a public URL, for
   example `https://media.yourdomain.com/`.
2. **Download the originals while the old site is still up.** The list of paths is the set of
   `files/...` paths in the database. Export it:
   ```sql
   select distinct replace(url, 'https://dpetals.com/cdn/shop/', '') as path from image
   union
   select distinct replace(thumbnail, 'https://dpetals.com/cdn/shop/', '') from product
   where thumbnail is not null;
   ```
   Also include the home, journal and reel files referenced by content (`select data from content_block`,
   `select image from content_article`) and the videos for the reels. Download each from
   `https://dpetals.com/cdn/shop/<path>` (a small script with a delay between requests is polite) and
   keep the same folder structure.
3. **Upload to the bucket under the same paths** (`files/xyz.png`), set long cache headers
   (`Cache-Control: public, max-age=31536000, immutable`) and serve over HTTPS. Open a few URLs in a browser.
4. **Allow the new host** in `next.config.ts`: add `new URL("https://media.yourdomain.com/**")` to
   `images.remotePatterns` (keep the old entries until the switch is done).
5. **Rewrite the stored URLs.** This is the step people miss: because the database holds the old absolute URLs,
   changing the env variable alone would leave them unrecognised (the API only strips a matching base).
   Back up first (`ops/backup-postgres.sh`), then:
   ```sql
   update product set thumbnail = replace(thumbnail, 'https://dpetals.com/cdn/shop/', 'https://media.yourdomain.com/')
     where thumbnail like 'https://dpetals.com/cdn/shop/%';
   update image set url = replace(url, 'https://dpetals.com/cdn/shop/', 'https://media.yourdomain.com/')
     where url like 'https://dpetals.com/cdn/shop/%';
   ```
   Check the counts match (28 and 168 in development) and that nothing else mentions the old host:
   `select count(*) from product_variant where metadata::text like '%dpetals.com%'`, and the same for
   `product.metadata`.
6. **Switch the settings** (same value, two apps):
   - Backend: `MEDIA_BASE_URL=https://media.yourdomain.com/`
   - Storefront build arg and env: `NEXT_PUBLIC_MEDIA_BASE_URL=https://media.yourdomain.com/`
   Restart the backend, rebuild the storefront. The catalogue cache refreshes by itself (or call the
   revalidate route).
7. **Verify.** Load the home page, a collection, a product, the cart drawer, search suggestions and the journal
   with the browser network tab open: no request should go to `dpetals.com`. Place a test order and look at
   the receipt email's image links.
8. **Future uploads.** New product images added in Admin need a file service. Add Medusa's S3 file provider
   (`@medusajs/file-s3`, works with R2) to `medusa-config.ts` with the same bucket, so uploads land in the
   bucket directly. Until then add images by uploading to the bucket yourself and pasting the URL in Admin.
9. **Only then** let the old site go. Keep the downloaded originals as a backup.

### If you want zero downtime
Do steps 1 to 4 first, run the SQL and env switch on staging, verify, and repeat on production on cutover day.
The old URLs keep working throughout, so a rollback is the same SQL with the two URLs swapped.
