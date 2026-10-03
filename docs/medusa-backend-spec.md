# DPetals — Medusa Backend Specification & Integration Guide

Everything needed to build the Medusa v2 backend that replaces the static data in this storefront, and to wire the storefront to it.

- **Audience:** the backend developer(s) building the Medusa project, and whoever swaps the storefront over to it.
- **Derived from:** the storefront code as of 2026-10-03 (`src/lib/data/*`, `src/lib/cart/*`, `src/lib/checkout/*`, `src/lib/account/*`, `src/types/*`, every page under `src/app`, and the components that use them) and the reference captures in `docs/reference/`.
- **Medusa version:** the storefront has `@medusajs/js-sdk` and `@medusajs/types` **2.21.2** installed. Build the backend on the same minor version (or newer 2.x) so the SDK and API match. Where this document says **VERIFY**, the behaviour could not be confirmed from the docs alone; write a small test for it before depending on it.
- **Data shapes:** [medusa-data-contract.md](medusa-data-contract.md) defines every data structure with real samples and how Medusa stores and returns the same shapes. Where it differs from this file (metadata key names are camelCase there, responses come from `/store/dp/*` routes in the storefront's own types), **that document wins**.
- **Note:** `CLAUDE.md` says to follow `docs/reference/api-samples/`. That folder does not exist. The storefront's own TypeScript types (section 12) are the contract this document uses instead. If you want API samples recorded, create them from the backend once it runs.

---

## 1. Where the storefront stands today

The storefront is fully built against **local, static data**. Nothing calls a Medusa backend yet. Only the client stub exists:

```ts
// src/lib/medusa/client.ts
export const sdk = new Medusa({
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL!,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY!,
});
```

The seams that are already async and "will be backed by Medusa" are `getProductDetail`, `getRelatedProducts`, `getCollectionPage`, `getCollectionIndex`, `getQuickViewItem`, `searchCatalog` and `placeOrder`. Everything else is a static import or a localStorage store.

| Domain | Today (local) | Backed by Medusa |
|---|---|---|
| Catalogue: 28 products, 29 variants, 17 collections | `lib/data/collections.ts`, `lib/data/product-details.ts` | Native Product, Variant, Price, Inventory, Category + metadata + 1 small custom route |
| Cart (lines, qty limit, reward tiers, coupon) | `localStorage` (`dp-cart`, `dp-coupon`) | Native Cart + Promotions + shipping price rules |
| Checkout and payment | Form only. `placeOrder()` returns "unavailable" | Native Cart completion + Razorpay and PhonePe payment providers |
| Customer account, addresses | `localStorage` (`dp-account`, `dp-addresses`) | Native Customer + Auth |
| Orders | `localStorage` (`dp-orders`) + dev-only preview order | Native Orders |
| Search | In-memory index over products and journal articles | `q` on products (phase 1), Meilisearch or Algolia (phase 2) |
| Home page, content pages, nav, site info, coupons list | `lib/data/home.ts`, `pages.ts`, `navigation.ts`, `coupons.ts` | **Custom** content module (not native Medusa) |
| Journal (blog) | `lib/data/blog.ts` (4 articles, search and home rail only) | **Custom** article module |
| Ratings and reviews | `rating` fields in static data (10 of 28 products) | **Custom** review module |
| Newsletter | Form with no handler | **Custom** subscribe route + notification provider |

Medusa does not natively cover: content/CMS, blog, reviews, newsletter, and "first-order-only" coupon rules. Those are the custom parts (section 6).

---

## 2. Decisions to make before building

These change the backend design. A recommendation is given for each so you can proceed without waiting, but each needs a human to confirm.

| # | Decision | Recommendation | Why it matters |
|---|---|---|---|
| D1 | **Customer login method.** Storefront sign-in is *email only, no password* ("Sign in or create an account", `components/account/sign-in-form.tsx`). Medusa's built-in `emailpass` provider needs a password. | **Custom `email-otp` auth provider** (6-digit code by email) so the UI stays as is. Fallback: `emailpass` and add password, register and forgot-password screens. | Decides the whole auth flow and whether new screens are required. |
| D2 | **MRP (strikethrough) vs selling price.** Storefront shows `price` and `mrp` and an "N% off" label on every product. | Base price = **selling price**. Store MRP on `variant.metadata.mrp`. | Alternative is a permanent sale Price List (`original_amount` = MRP). More native but awkward to administer for a permanent discount. |
| D3 | **Phone-only contact at checkout.** The Contact field accepts "email or mobile phone number" (`validateContact`). A Medusa cart/order needs an `email`. | Require an email at checkout (change the field and validation), keep phone on the shipping address. | If phone-only must stay, the backend has to synthesise an email. Not recommended. |
| D4 | **Collections model.** Shopify-style collections overlap (a product is in many). Medusa Collections allow one per product. | Map every storefront collection to a **Product Category** (many-to-many) plus a custom position table for ordering (section 6.2). | Ordering matters: Bestsellers order drives the cart's "Pairs well with your ritual" suggestions. |
| D5 | **CMS for home/pages/journal.** | Custom `storefront-content` module + Admin widgets (section 6.1). Alternative: Strapi / Sanity / Payload and keep the storefront calling it directly. | Affects who edits banners, hero slides, policy pages and articles, and how. |
| D6 | **Payment providers.** Razorpay and PhonePe are offered at checkout. | Community plugins exist (`medusa-plugin-razorpay-v2`, `medusa-payment-phonepe`); **VERIFY** both are maintained and compatible with your Medusa version. Otherwise write a thin custom provider (section 6.5). | These are the production money path. Audit before use. |
| D7 | **Shipping charge under ₹500.** Free above ₹500; below it the UI says "Calculated at payment". The actual flat fee is not in the code. | Business to confirm. Spec assumes a flat fee, `SHIPPING_FEE_INR` (TBD). | Needed for the shipping option price. |
| D8 | **GST handling.** Prices are shown "MRP inclusive of all taxes". | Region/tax region = India with **tax-inclusive pricing**, GST rates per product type. Confirm rates with accounts. | Tax-inclusive pricing changes which cart total attribute the reward-tier rules must use (section 4.3). |
| D9 | **Coupon stacking.** Cart copy says "Offers combine where eligible". | Allow reward-tier discount + one manual code. Confirm. | Defines promotion configuration. |
| D10 | **Hosting.** | Medusa on Railway / Render / AWS (Postgres + Redis), or Medusa Cloud. | Needs Postgres, Redis, file storage, SMTP/email. Section 3. |

---

## 3. Backend project setup

### 3.1 Create the project

```bash
npx create-medusa-app@latest dpetals-backend      # Medusa v2, Postgres, no starter storefront
cd dpetals-backend
npx medusa user -e admin@dpetals.com -p <password>
```

Keep the backend in its own repository. This storefront only needs its URL and a publishable key.

### 3.2 Infrastructure

| Service | Used for |
|---|---|
| PostgreSQL | Primary database |
| Redis | Event bus, workflow engine, caching, locking (required in production) |
| S3-compatible bucket (S3, Cloudflare R2, MinIO) | Product and content images and videos (File module) |
| Email provider (Resend / SendGrid) | Order confirmations, email OTP login, newsletter welcome |
| Razorpay and PhonePe accounts | Payments |
| Meilisearch or Algolia (phase 2) | Search |

### 3.3 Modules and plugins to configure in `medusa-config.ts`

| Module | Provider | Notes |
|---|---|---|
| File | `@medusajs/file-s3` | Point at the bucket; set a public CDN base URL |
| Event bus | `@medusajs/event-bus-redis` | |
| Workflow engine | `@medusajs/workflow-engine-redis` | |
| Cache / locking | Redis | |
| Notification | `@medusajs/notification-sendgrid` or a Resend provider | `email` channel |
| Auth | `emailpass` (default) **and/or** custom `email-otp` (D1) | Both under `modules.auth.providers` |
| Payment | Razorpay + PhonePe (D6) | Enabled on the India region |
| Fulfillment | `manual` to start | Replace with Shiprocket/Delhivery later |
| Custom modules | `storefront-content`, `product-review`, `merchandising`, `newsletter` | Section 6 |

### 3.4 Environment variables

**Backend**

```
DATABASE_URL=
REDIS_URL=
STORE_CORS=https://<storefront-domain>,http://localhost:3000
ADMIN_CORS=https://<admin-domain>
AUTH_CORS=https://<storefront-domain>,http://localhost:3000,https://<admin-domain>
JWT_SECRET=
COOKIE_SECRET=
MEDUSA_BACKEND_URL=
STOREFRONT_URL=
S3_FILE_URL= S3_BUCKET= S3_REGION= S3_ACCESS_KEY_ID= S3_SECRET_ACCESS_KEY= S3_ENDPOINT=
RAZORPAY_KEY_ID= RAZORPAY_KEY_SECRET= RAZORPAY_WEBHOOK_SECRET=
PHONEPE_MERCHANT_ID= PHONEPE_SALT= PHONEPE_SALT_INDEX= PHONEPE_MODE=
EMAIL_API_KEY= EMAIL_FROM=customercare@richelements.in
MEILISEARCH_HOST= MEILISEARCH_API_KEY=         # phase 2
REVALIDATE_SECRET=                                # shared with the storefront
SHIPPING_FEE_INR=                                 # D7
```

(The exact PhonePe variable names depend on the plugin chosen.)

**Storefront** (`.env.local`; the first two already exist)

```
NEXT_PUBLIC_MEDUSA_BACKEND_URL=
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=
NEXT_PUBLIC_MEDIA_BASE_URL=        # replaces CDN_BASE in src/lib/cdn.ts
MEDUSA_REGION_ID=                  # India region id (or resolve at runtime by country)
REVALIDATE_SECRET=
```

---

## 4. Store configuration (do once, in Admin or a seed script)

### 4.1 Core settings

| Item | Value |
|---|---|
| Store name / default currency | DPetals / **INR** |
| Region | **India**, currency INR, country `in`, tax-inclusive pricing enabled |
| Sales channel | "DPetals Web" (default) |
| Publishable API key | One key, linked to the "DPetals Web" sales channel. Goes in `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` |
| Stock location | Ahmedabad warehouse (Rich Elements Pvt. Ltd., A-204 Dev Parisar, Khodiyar, Ahmedabad 382421). Linked to the sales channel |
| Shipping profile | Default |
| Fulfillment set | Delivery, service zone covering **all of India** |
| Tax region | India, GST rates per product type (D8) |
| Payment providers | Razorpay + PhonePe enabled on the India region |

Amounts in Medusa v2 are stored in **major units** (₹250 is stored as `250`, not 25000), which matches the storefront's `price: 250`.

### 4.2 Shipping options

| Name | Type | Price rules |
|---|---|---|
| Standard shipping | flat | `SHIPPING_FEE_INR` by default; **₹0 when `item_total >= 500`** (price rule on the shipping option price, `item_total` `gte` 500) |

Price rules only apply to `flat` options. `item_total` is the cart's item total after discounts and including tax, excluding shipping ([price rules](https://docs.medusajs.com/resources/commerce-modules/pricing/price-rules)). That matches how the storefront decides "Free": `summary.subtotal >= FREE_SHIPPING_THRESHOLD` (`components/checkout/checkout-page.tsx`).

### 4.3 Reward tiers (cart bar: 500 / 1000 / 1500 / 2000)

Defined in `src/lib/cart/pricing.ts`:

| Threshold (₹) | Reward |
|---|---|
| 500 | Free delivery (handled by the shipping option above) |
| 1000 | 10% off |
| 1500 | 15% off |
| 2000 | 20% off |

Implement the three percentage tiers as **automatic promotions**, percentage off the order total, each with **non-overlapping** cart rules so they never stack to 45%:

| Promotion | Rules |
|---|---|
| `REWARD-10` | cart total attribute `>= 1000` AND `< 1500` |
| `REWARD-15` | `>= 1500` AND `< 2000` |
| `REWARD-20` | `>= 2000` |

Medusa supports numeric rules (`gte`, `lt`, ...) on cart totals such as `item_subtotal`, `subtotal`, `item_total`, `total` ([promotion concepts](https://docs.medusajs.com/resources/commerce-modules/promotion/concepts)).

**VERIFY (important):** the storefront measures tiers on the **list subtotal, tax-inclusive, before the tier discount** (measured on the live store). With tax-inclusive pricing, `item_subtotal` may exclude tax and `item_total` is after discounts. Test with a ₹1000 cart and pick the attribute that gives exactly 1000. If none does, either use a custom rule or compute the tier in a cart workflow hook. Also confirm that two rules on the same attribute (a range) work, and that automatic promotions apply on cart updates in 2.21. See [medusa-api-map.md](medusa-api-map.md) section 7, item 1, for a worked example of why `item_subtotal` and `item_total` can both give the wrong threshold with tax-inclusive prices. The SDK does have `cart.addPromotions` (`POST /store/carts/:id/promotions`), so the promotion-route check in 7.5 is resolved.

### 4.4 Coupon `FIRSTTIMEOFFER`

10% off, first order only. Create it as a normal (manual) promotion. Medusa has no "first order" rule, so enforce it in custom code (section 6.6). Also listed on the storefront in the cart's "Coupons & offers" panel (section 7.9).

### 4.5 Inventory

- Enable `manage_inventory` on all variants and create an inventory item per variant at the Ahmedabad location.
- The storefront caps a variant at **50** per cart (`MAX_QUANTITY_PER_VARIANT`, measured from the live store). Set stock accordingly or add a backend cap (section 6.7). `allow_backorder = false`.

---

## 5. Catalogue data model

### 5.1 Facts about the current catalogue

- 28 products, 29 variants (only `Cucumber Aloe Vera Gel` has options: Size = 200gms / 500gms; the other 27 have a single default variant).
- 17 collections (`skincare`, `haircare`, `body-wash`, `essential-oils-for-aromatherapy`, `combo`, `bestsellers`, `features-at-dpetals`, `skin-care`, `all`, `acne-oil-control`, `glow-pigmentation`, `hair-skin`, `hair-fall-dandruff`, `hydration-dryness`, `relax-aromatherapy`, `self-care`, `smooth-strong`, `you-may-also-like`). Sixteen have a card image; `all` is the catch-all.
- Product galleries total 168 images and 12 videos across the 28 products.
- Every product has the same 6 content sections (ingredients, benefits, steps, purity, comparison, FAQ) and 2 accordions (Description, Additional information).
- Handles are the URL slugs and must be preserved exactly: `/products/<handle>`, `/collections/<handle>`.

### 5.2 Product: storefront field → Medusa field

| Storefront field (`ProductDetail`) | Medusa location | Notes |
|---|---|---|
| `handle` | `product.handle` | Must match existing slugs |
| `title` | `product.title` | |
| `subtitle` | `product.subtitle` | Tagline under the title |
| Description accordion (HTML) | `product.description` | HTML string. Also feeds Quick View teaser and search |
| `media[]` images | `product.images[]` (ordered) + `product.thumbnail` | First image = thumbnail/card image |
| `media[]` videos | `product.metadata.videos` | `[{ "poster": url, "url": url, "position": n }]`, inserted into the gallery at `position` |
| `options[]` | `product.options` | Only when more than one variant |
| `variants[].id` | `variant.id` | Replaces Shopify numeric ids (see section 9.4) |
| `variants[].title` | `variant.title` | |
| `variants[].options[]` | `variant.options` | |
| `variants[].price` | `variant.calculated_price.calculated_amount` | INR, major units |
| `variants[].compareAtPrice` | `variant.metadata.mrp` (D2) | Number |
| `variants[].available` | derived from `variant.inventory_quantity > 0` | |
| `variants[].imageFile` | `variant.metadata.image_url` | Matches the gallery image to jump to when the option changes |
| `currency` | `calculated_price.currency_code` | `"inr"`; storefront formats as INR |
| `seoTitle`, `seoDescription` | `metadata.seo_title`, `metadata.seo_description` | Used by `generateMetadata` |
| `badges[]` | `metadata.badges` | `[{ "tone": "new\|off\|tag\|save", "label": "NEW" }]`. See 5.3 |
| `rating` | `metadata.rating_average`, `metadata.rating_count` | Maintained by the review module (6.3) |
| `netQty` | `metadata.net_qty` | `"120 ml"`. Also drives the per-unit price caption |
| `taxNote` | `metadata.tax_note` | `"MRP inclusive of all taxes"` |
| `offer` | `metadata.offer_text` | e.g. the FIRSTTIMEOFFER line |
| `trust[]` | `metadata.trust` | `[{ "icon": url, "label": "Pure & Natural" }]` |
| `accordions[]` "Additional information" | `metadata.additional_info` | `[{ "label", "value", "href" }]` (manufacturer, marketed by, etc.) |
| `sections[]` | `metadata.sections` | The six typed blocks (structure in section 12.2) |
| `crossSell` | `metadata.cross_sell_handle` | Title is looked up from that product |
| `related` | `metadata.related` | `{ "title", "subtitle", "handles": [] }` |
| `showBlog` | `metadata.show_blog` | Boolean |
| Card `subtitle` ("Face Wash · 120 ml") | derived | `metadata.card_label` + `" · "` + `metadata.net_qty` |
| Card `isNew` | `metadata.is_new` | Boolean (drives the NEW badge) |

Medusa `metadata` accepts arbitrary JSON, so these need no custom code. Keep their shapes in one shared Zod schema in the backend and validate in the seed/import script, because the Admin metadata editor is raw JSON. If the content grows, move it to a custom module linked to Product.

### 5.3 Badge tones

`ProductBadge.tone` is one of `new`, `off`, `tag`, `save`. In the data today: `new` (NEW), `tag` (category label such as "Face Wash", "Hair Mask"), and `off` (campaign labels such as "ALOE VERA", "COMBO", "NAVRATRI", "HOLI CAMPIGN"). Campaign badges are marketing-editable, so keep them in metadata and not in code.

### 5.4 Categories (the storefront's "collections")

| Storefront (`CollectionRecord`) | Medusa Product Category |
|---|---|
| `handle` | `handle` |
| `title` | `name` |
| `intro` | `description` |
| `seoTitle` | `metadata.seo_title` |
| `image { src, alt }` | `metadata.image_url`, `metadata.image_alt` |
| `productHandles[]` (ordered) | category membership + position (6.2) |

All categories are top-level and public (`is_active`, `is_internal = false`). The `all` collection needs no category: it is "every published product".

### 5.5 Images and files

`src/lib/cdn.ts` points at `https://dpetals.com/cdn/shop/` and `next.config.ts` allows that host. Migration steps:

1. Download every image/video referenced in `src/lib/data/*.ts` (paths like `files/…`, `collections/…`, `articles/…`) and in `product-details.ts`.
2. Upload to the Medusa file bucket (keep the file names).
3. Set `NEXT_PUBLIC_MEDIA_BASE_URL` and add the bucket host to `images.remotePatterns` in `next.config.ts`.

---

## 6. Custom backend work

Everything here is something Medusa does not give out of the box.

### 6.1 `storefront-content` module (D5)

Models:

| Model | Fields | Feeds |
|---|---|---|
| `content_block` | `key` (e.g. `home.hero`), `type`, `data` (json), `position`, `is_published` | All of the home page (section 7.8) |
| `page` | `handle`, `title`, `seo_title`, `description`, `html`, `is_published` | `/pages/<handle>`, `/policies/<handle>` |
| `site_settings` | `key`, `data` (json) | Announcement bar, footer, nav, social links, popular searches, coupon list |
| `article` | `handle`, `title`, `excerpt`, `category`, `image_url`, `image_width`, `image_height`, `body_html`, `published_at`, `is_published` | Journal (7.10) |

Provide Admin widgets/pages to edit them. Initially seed from the current `src/lib/data/*.ts` files with a script (section 10).

### 6.2 `merchandising` module (ordering and listing)

Medusa's category-to-product link has no position. Add a `category_product_position` model: `category_id`, `product_id`, `position`. Expose:

- `GET /store/dp/collections/:handle/products?page=&limit=` returning products in position order, 24 per page, plus `count`, `page`, `pageCount` (section 7.2).
- Same data used for `bestsellers` suggestions in the cart.

### 6.3 `product-review` module

Follow the official "product reviews" tutorial. Model `review`: `product_id`, `rating` (1 to 5), `title`, `body`, `author_name`, `city`, `status` (pending/approved/rejected), `featured`. A subscriber on `review.approved` recomputes `product.metadata.rating_average/rating_count`. The storefront shows only the aggregate today (cards and product page). Submitting reviews has no UI yet (out of scope for phase 1). The home page "reviews" strip uses `featured` reviews (7.8).

### 6.4 `newsletter` route

`POST /store/dp/newsletter` stores the email and sends the welcome email. Note the form (`components/home/newsletter.tsx`) has **no submit handler** yet; the storefront must wire it (section 9.3).

### 6.5 Payment providers (D6)

- Redirect flow for both providers ("You'll be redirected to Razorpay Secure … to complete your purchase").
- Provider ids the storefront already uses: `razorpay` and `phonepe` (`CheckoutValues.payment`). Map them to the Medusa provider ids (for example `pp_razorpay_razorpay`) in one place, `src/lib/medusa/payment.ts`.
- Webhooks: `/hooks/payment/<provider>` must complete the cart and create the order even if the customer closes the tab after paying. Medusa's payment webhook workflow handles this when the provider implements `getWebhookActionAndData`.
- Both providers need INR, test mode, and a documented reconciliation process.

### 6.6 First-order coupon rule

A validate hook on the cart's add-promotions workflow, and on cart completion, that rejects `FIRSTTIMEOFFER` when an order already exists for the cart's email or phone. **VERIFY** the available workflow hooks in your Medusa version.

### 6.7 Per-variant quantity cap (optional)

A `validate` hook on add-to-cart and update-line-item that rejects quantities above `min(inventory, 50)`. The storefront also enforces this itself for friendly messages (7.5), but the backend should be authoritative.

### 6.8 Revalidation subscriber

Subscribers on `product.updated`, `product-category.updated`, `inventory-level.updated` and on content changes call the storefront `POST /api/revalidate` with `REVALIDATE_SECRET` so statically generated pages refresh. The storefront needs that route (section 9.5).

### 6.9 Custom email auth provider (only if D1 = OTP)

An `AbstractAuthModuleProvider` named `email-otp`: `authenticate` sends a 6-digit code (stored hashed, 10-minute expiry, rate-limited) and a second call verifies it and returns the auth identity. Creates the customer on first success.

---

## 7. API catalogue (what each call returns and where it is used)

Conventions:

- All calls go through `src/lib/medusa/` (hard rule 3). Components never call `fetch` or the SDK directly.
- Server components and route handlers use the SDK directly. Client components use TanStack Query hooks that wrap `src/lib/medusa` functions.
- Every product/price request needs `region_id` so `calculated_price` is returned.
- Store routes need the `x-publishable-api-key` header (the SDK adds it).
- Custom routes are called with `sdk.client.fetch("/store/dp/...")`.

Legend: **Native** = built into Medusa. **Custom** = built by us (section 6).

### 7.1 Product detail: `/products/[handle]`

| | |
|---|---|
| Native | `sdk.store.product.list({ handle, region_id, fields })` (returns one product in a list). The SDK `retrieve` takes an id, so look up by handle through `list`. |
| Fields | `id, handle, title, subtitle, description, thumbnail, metadata, *images, *options, *options.values, *variants, *variants.options, +variants.metadata, *variants.calculated_price, +variants.inventory_quantity, *categories` |
| Returns | One product with options, variants (price, MRP in metadata, stock), images, categories, and the content metadata from 5.2 |
| Mapped to | `ProductDetail` (section 12.2) by `mapProductDetail()` in `src/lib/medusa/mappers.ts` |
| Used in | `src/app/(main)/products/[handle]/page.tsx` (page, `generateMetadata`, `generateStaticParams`), `src/lib/products.ts` (`getProductDetail`), `components/product/*` (gallery, info, sections, sticky add bar) |
| Rendering | `generateStaticParams` needs all handles at build: `sdk.store.product.list({ limit, fields: "handle" })`, paged |
| Related products | `getRelatedProducts(handles)` (`components/product/related-products.tsx`): `sdk.store.product.list({ handle: [...], region_id })` mapped to `ProductSummary[]` |

### 7.2 Collection page: `/collections/[handle]` (and `/collections/all`)

| | |
|---|---|
| Custom | `GET /store/dp/collections/:handle/products?page=1&limit=24&region_id=` |
| Returns | `{ collection: { handle, title, intro, seoTitle, image }, products: ProductSummary[], page, pageCount, count }` in the merchandising order. `all` returns every published product, alphabetical |
| Why custom | Native `GET /store/products?category_id=` has no per-collection ordering and no card-shaped summary |
| Mapped to | `CollectionPage` (`src/lib/collections.ts`, `COLLECTION_PAGE_SIZE = 24`) |
| Used in | `src/app/(main)/collections/[handle]/page.tsx` (page, metadata, static params), `components/collection/pagination.tsx`, `components/ui/product-card.tsx` |
| Not found | Unknown handle or out-of-range page returns 404, which becomes `notFound()` |
| Static params | `GET /store/product-categories?fields=handle` (native) |

### 7.3 Collections index: `/collections` and `/products`

| | |
|---|---|
| Native | `sdk.store.category.list({ fields: "handle,name,metadata" })`, plus product counts from the custom route |
| Returns | Every category that has an image, with `handle`, `name`, image from metadata, `productCount`, sorted by title |
| Mapped to | `CollectionIndexEntry` |
| Used in | `src/app/(main)/collections/page.tsx` (also re-exported at `/products`), `components/ui/collection-card.tsx` |

### 7.4 Quick View modal

| | |
|---|---|
| Current | Next route handler `GET /api/quick-view/[handle]` (`src/app/api/quick-view/[handle]/route.ts`) calling `getQuickViewItem` |
| New | Keep the route handler. It calls `sdk.store.product.list({ handle, region_id, fields })` server-side (same call as 7.1 with fewer fields) and maps to `QuickViewItem` |
| Returns | `{ handle, title, description (plain text, first 160 chars + "…"), image, price, compareAtPrice, currency, available, line: CartLineInput }` using the **first variant** and **first image** |
| Used in | `components/quick-view/*` (provider, button), product cards |

### 7.5 Cart

Replace the localStorage cart (`lib/cart/storage.ts`, `reconcile.ts`, `catalog.ts`) with a Medusa cart. Store only the **cart id** in a cookie (`dp_cart_id`).

| Action | Native call | Notes |
|---|---|---|
| Create | `sdk.store.cart.create({ region_id })` | On first add. Save the id |
| Load | `sdk.store.cart.retrieve(id, { fields })` | See fields below |
| Add | `sdk.store.cart.createLineItem(id, { variant_id, quantity })` | Merges an existing line |
| Change qty | `sdk.store.cart.updateLineItem(id, lineId, { quantity })` | Quantity 0 is a delete in the UI (`setQuantity`) |
| Remove | `sdk.store.cart.deleteLineItem(id, lineId)` | |
| Apply code | `sdk.store.cart.update(id, { promo_codes: [code] })` (**VERIFY** against the promotions route in 2.21) | Section 7.9 |
| Remove code | `sdk.store.cart.update(id, { promo_codes: [] })` | |
| Clear after order | Drop the cookie | `clearCart()` |

**Cart fields to request:** `id, email, currency_code, +items.*, +items.variant.metadata, +items.variant.inventory_quantity, +items.product.handle, +items.product.title, +items.product.metadata, *promotions, *shipping_methods, item_subtotal, item_total, original_item_total, discount_total, shipping_total, tax_total, total`.

**Mapping to the storefront's `CartLine` and `CartSummary`:**

| Storefront | Medusa |
|---|---|
| `variantId` | `item.variant_id` |
| `handle` | `item.product_handle` |
| `title` / `variantTitle` | `item.product_title` / `item.variant_title` (null when the product has no options) |
| `image` / `imageAlt` | `item.thumbnail` / built from titles |
| `unitPrice` | `item.unit_price` |
| `compareAtPrice` | `item.variant.metadata.mrp` |
| `unitMeasure` | parsed from `item.product.metadata.net_qty`, only when the product has no options (`lib/cart/lines.ts`) |
| `quantity` | `item.quantity` |
| `itemCount` | sum of quantities |
| `listSubtotal` | tax-inclusive items total before the tier discount (see 4.3 VERIFY) |
| `mrpSubtotal` | sum of `mrp * quantity` (computed client-side) |
| `tierDiscountPercent` / `tierDiscount` | from the applied `REWARD-*` promotion (`cart.promotions` / `discount_total`) |
| `subtotal` | `item_total` |
| `savedVsMrp` | `mrpSubtotal - subtotal` |

**Behaviour that must be kept** (measured on dpetals.com):

- Per-variant limit 50. At the limit, adding leaves the drawer closed and shows "The maximum quantity of this item is already in your cart." A trimmed add shows "Only N items were added to your cart due to availability." The drawer "+" at the limit is silent. Implement with `min(variant.inventory_quantity, 50)`, because Medusa returns a generic inventory error otherwise.
- Reward bar milestones come from `REWARD_TIERS`; the unlock celebration is session-only state, so it stays client-side. Consider serving tier thresholds from `site_settings` so marketing can change them, but the *discount itself* must come from the promotions in 4.3.
- The drawer (not `/cart`) shows the "N% OFF on orders above ₹T" row.

**Used in:** `components/cart/*` (provider, drawer, page, line item, totals, rewards bar, suggestions, coupon box, add-to-cart button, toast), `components/product/product-info.tsx` and `sticky-add-bar.tsx` (add to cart), `components/quick-view/*`, `components/ui/product-card.tsx`, `app/layout.tsx` (`CartProvider`).

**Cart suggestions ("Pairs well with your ritual")** are the first nine Bestsellers (`lib/cart/suggestions.ts`). Source: custom route 7.2 with `handle=bestsellers&limit=9`, fetched server-side in `app/(main)/layout.tsx`. The drawer shows the first few not already in the cart.

**Buy it now** (`/checkout?buy=<variantId>&qty=<n>`, `components/checkout/use-checkout-cart.ts`) must not touch the main cart. Create a separate throwaway cart with that single item and use it for checkout. Do not store its id in `dp_cart_id`.

### 7.6 Checkout: `/checkout`

Medusa's checkout sequence:

| Step | Call | Sends | Returns / used for |
|---|---|---|---|
| 1 | `sdk.store.cart.update(id, { email, shipping_address, billing_address, metadata })` | Contact email (D3), shipping address, billing address (same as shipping when `billingSame`), marketing consent flags in `metadata` | Updated cart |
| 2 | `sdk.store.fulfillment.listCartOptions({ cart_id })` | | Shipping options with `calculated_price`. Drives "Free" / "Calculated at payment" / "Enter shipping address" (`checkout-page.tsx`) |
| 3 | `sdk.store.cart.addShippingMethod(id, { option_id })` | The "Standard shipping" option | Cart with shipping total |
| 4 | `sdk.store.payment.initiatePaymentSession(cart, { provider_id })` | `razorpay` or `phonepe` provider id | Payment session. Its `data` contains the redirect URL or order token |
| 5 | Redirect to provider (`placeOrder` returns `{ status: "redirect", url }`) | | |
| 6 | Return URL or webhook completes the cart: `sdk.store.cart.complete(id)` | | `{ type: "order", order }` or `{ type: "cart", error }` |
| 7 | Redirect to `/order/<order.id>/confirmed` | | Confirmation page (7.7) |

Address mapping (`AddressValues` to Medusa address): `firstName` to `first_name`, `lastName` to `last_name`, `address1` to `address_1`, `address2` to `address_2`, `city` to `city`, `state` to `province`, `pin` to `postal_code`, `phone` to `phone`, `country` to `country_code: "in"`.

`placeOrder()` in `src/lib/checkout/place-order.ts` already has the three result shapes (`redirect`, `placed`, `unavailable`). Replace its body, keep the signature.

Validation stays client-side as today (`lib/checkout/validation.ts`) and the backend must also validate (6-digit PIN, required fields).

Other checkout facts:

- An empty cart redirects to `/` (existing behaviour).
- Discount field on checkout (`components/checkout/order-summary.tsx`) uses the same promotion call as 7.9.
- States dropdown is static (`lib/data/india.ts`, 36 states and UTs, default Gujarat). No API is needed.
- "Save this information for next time" should create a customer address when signed in. "Email me / Text me with news and offers" go to `cart.metadata` and then `order.metadata`.

### 7.7 Order confirmation: `/order/[id]/confirmed`

| | |
|---|---|
| Native | `sdk.store.order.retrieve(id, { fields })`. Medusa documents this as usable by guests as well as logged-in customers ([order confirmation guide](https://docs.medusajs.com/resources/storefront-development/checkout/order-confirmation)) |
| Fields | `id, display_id, created_at, status, fulfillment_status, payment_status, currency_code, email, *items, *shipping_address, *billing_address, *shipping_methods, *payment_collections.payments, subtotal, discount_total, shipping_total, total` |
| Mapped to | `Order` (section 12.3) |
| Used in | `app/(checkout)/order/[id]/confirmed/page.tsx`, `components/order/order-confirmation.tsx`. Remove the dev-only `lib/orders/preview.ts` branch once real orders exist (or keep it behind `NODE_ENV`) |
| Security | Order ids are opaque but not secret. **VERIFY** the response exposes only what the confirmation page needs. If you want stronger protection, add a signed `?t=` token validated by a custom route |

### 7.8 Home page: `/`

All of this is `src/lib/data/home.ts` today. Backend source: custom content module (6.1) plus the catalogue.

| Section (component) | Data | Source |
|---|---|---|
| Hero carousel (`hero-carousel.tsx`) | 3 slides: kicker, title, subtitle, CTA, two images, chip | `content_block home.hero` |
| Value cards (`value-cards.tsx`) | 5 images with alt text | `content_block home.values` |
| Concern cards (`concern-cards.tsx`) | 5 cards: title, description, href, image | `content_block home.concerns` |
| Bestsellers rail | Product summaries | Custom route 7.2, `bestsellers` |
| Haircare picks / Skincare picks / Combos rails | Product summaries | Route 7.2 (`haircare`, `skincare`, `combo`) or pinned handle lists in a content block |
| Promo banners (5: hair, glow, aroma, shower, hair-gel) | tone, kicker, title, text, CTA, image | `content_block home.banners` |
| Ingredients rail, combo-kits rail, category grid | Images with caption and href | `content_block home.*` |
| Spotlight (`spotlight.tsx`) | One featured product: badge, title, image, points, price, MRP, handle | `content_block home.spotlight` referencing a product handle (price should come from the product, not be duplicated) |
| Why section | Title, text, CTA, 4 points | `content_block home.why` |
| Reels | video URL, poster, product handle, title, price | `content_block home.reels` + product price lookup |
| Reviews | rating, text, author, product line | `GET /store/dp/reviews?featured=true` |
| Journal section | 3 latest articles | `GET /store/dp/articles?limit=3` |
| Newsletter | form only | `POST /store/dp/newsletter` |

Preferred shape: one custom route `GET /store/dp/content/home?region_id=` returning all blocks with product rails already resolved to `ProductSummary[]`, so the home page makes **one** request. Types are in `src/types/home.ts`.

Used in: `src/app/(main)/page.tsx`.

### 7.9 Coupons and promotions

| | |
|---|---|
| Panel list | "Coupons & offers" shows `lib/data/coupons.ts` (code, title, description). Source: `site_settings.coupons`, or a custom route `GET /store/dp/offers` listing public promotions |
| Apply | Native cart update with `promo_codes` (7.5) |
| Validation | **Behaviour change:** today any code is accepted silently ("Coupon X will be applied at checkout"). With Medusa an invalid code is rejected immediately. The UI needs an error state, for example "This code isn't valid". Copy to be agreed with the business |
| Rules | Input trimmed and upper-cased, empty input does nothing (existing behaviour) |
| Used in | `components/cart/coupon-box.tsx`, `components/checkout/order-summary.tsx`, `components/cart/cart-provider.tsx` (`applyCoupon`, `clearCoupon`) |

### 7.10 Journal (blog)

`/blogs/blogs` ("See all posts") and `/blogs/blogs/<handle>` (`ArticleCard`) are linked but **not built** in the storefront. They currently hit the 404 catch-all.

| Call | Returns |
|---|---|
| Custom `GET /store/dp/articles?limit=&offset=&category=` | `{ articles: Article[], count }` where `Article = { handle, title, excerpt, category, image { src, alt, width, height } }` |
| Custom `GET /store/dp/articles/:handle` | One article incl. `body_html`, `published_at` |

Used in: home journal rail (`components/home/blog-section.tsx`), product pages when `showBlog` is true, search results (`components/ui/article-card.tsx`), and the two new article routes to be built.

### 7.11 Content pages and policies

`/pages/<handle>` is built (`app/(main)/pages/[handle]/page.tsx`, from `lib/data/pages.ts`): `about-us`, `contact`, `our-products`, `collection-bundle` ("Mix and Match", empty), `data-sale-opt-out`.

Policy links are used across the site but **not built**: `/policies/privacy-policy`, `/refund-policy`, `/shipping-policy`, `/terms-of-service` (linked from `components/checkout/footer-links.tsx`, `app/(auth)/layout.tsx`, `components/account/dashboard-view.tsx`, `components/account/sign-in-form.tsx`, and the footer).

| Call | Returns |
|---|---|
| Custom `GET /store/dp/pages/:handle` | `{ handle, title, seoTitle, description?, html }` (`ContentPage`). 404 when unpublished |
| Custom `GET /store/dp/pages` | All handles, for `generateStaticParams` |

The `html` is trusted, admin-authored markup (the storefront renders it with `dangerouslySetInnerHTML`). Sanitise on save in the backend.

### 7.12 Site settings: navigation, footer, announcement

From `lib/data/navigation.ts`: `shopByCategory`, `shopByConcern`, `primaryLinks`, `footerShopLinks`, `footerPolicyLinks`, `popularSearches`, `siteInfo` (name, legal name, tagline, about, email, address lines, social links, announcement text with the coupon code).

| Call | Returns |
|---|---|
| Custom `GET /store/dp/content/site` | The whole settings object, fetched once in `app/(main)/layout.tsx` and cached |

Used in: `components/layout/header.tsx`, `footer.tsx`, `announcement-bar.tsx`, `components/search/search-overlay.tsx` (popular searches). The navigation could alternatively be derived from category data, but marketing wants labels that differ from category names (for example "Body Care" links to `body-wash`).

### 7.13 Search

Two surfaces, both currently call `searchCatalog()` over products **and** articles:

| Surface | Today | New |
|---|---|---|
| Live suggestions (header overlay) | `GET /api/search?q=` Next route, max 7 products, returns `{ total, products: [{ handle, title, image, price, mrp, currency }] }` | Keep the Next route (stable contract for `lib/search/client.ts`); inside it call the backend |
| Results page `/search?q=` | `{ products: ProductSummary[], articles: Article[] }` ranked: title match (10) > meta (4) > body (1) | Same shape from the backend |

Phase 1: native `sdk.store.product.list({ q, region_id, limit })`. Medusa's `q` is a basic text match, so ranking will differ from today. Phase 2 (recommended): Meilisearch or Algolia index of products (title, subtitle, description, ingredients/FAQ text, badges) and articles, exposed via custom `GET /store/dp/search?q=&limit=` returning `{ total, products, articles }`.

Used in: `app/api/search/route.ts`, `app/(main)/search/page.tsx` (results and `generateMetadata`, which counts results), `components/search/*`.

### 7.14 Customer account: `/account/*`

| Feature | Native call | Notes |
|---|---|---|
| Sign in / create account | `sdk.auth.login("customer", "emailpass" \| "email-otp", { … })`, then `sdk.store.customer.create({ email })` when the identity has no customer | D1. `register` and `login` share one screen (`SignInForm`) |
| Session | `sdk.store.customer.retrieve()` | Replaces `sessionStore`. Guard in `components/account/account-shell.tsx` (redirects to `/account/login` when signed out) |
| Sign out | `sdk.auth.logout()` | `account-shell.tsx` |
| Profile update | `sdk.store.customer.update({ first_name, last_name, phone })` | `dashboard-view.tsx` (Profile card) |
| List addresses | `sdk.store.customer.listAddress()` | `addresses-view.tsx`, dashboard "Default address" |
| Add / edit address | `createAddress`, `updateAddress` | Fields as in 7.6. `isDefault` maps to `is_default_shipping` (and billing) |
| Delete address | `deleteAddress(id)` | If the default is removed, the first remaining becomes default (storefront rule; enforce server-side too) |
| Set default | `updateAddress(id, { is_default_shipping: true })` | |
| List orders | `sdk.store.order.list({ fields, order: "-created_at" })` | `orders-view.tsx`, dashboard "Recent orders" (newest first) |
| Attach guest cart | `sdk.store.cart.transferCart(id)` | When signing in with items in the cart |

`SavedAddress` ↔ Medusa customer address: `id`, `firstName` (first_name), `lastName` (last_name), `address1` (address_1), `address2` (address_2), `city`, `state` (province), `pin` (postal_code), `phone`, `isDefault` (is_default_shipping).

Auth transport: with the SDK in JWT mode the token lives in localStorage, which server components cannot read. For server-rendered account pages use cookie/session auth (`auth: { type: "session" }`, `credentials: "include"`) and set `AUTH_CORS`/`STORE_CORS` and cookie `SameSite`/domain correctly, or keep all account pages client-rendered (they already are).

Used in: `app/(auth)/*`, `app/(main)/account/*`, `components/account/*`, `lib/account/storage.ts` (to be deleted).

### 7.15 Regions

| | |
|---|---|
| Native | `sdk.store.region.list()` at build or startup, pick the India region (`countries` includes `in`), cache the id (`MEDUSA_REGION_ID`) |
| Used for | `region_id` on every product and cart request |

### 7.16 Storefront-side routes to add

| Route | Purpose |
|---|---|
| `POST /api/revalidate` | Called by backend subscribers (6.8) with a shared secret; calls `revalidateTag` / `revalidatePath` |
| `GET /api/search`, `GET /api/quick-view/[handle]` | Exist; internals change |
| Payment return page, for example `/checkout/return` | Receives the provider redirect, calls `cart.complete`, then redirects to the confirmation page |

---

## 8. Page-by-page matrix

| Page / feature | Route | Backend calls |
|---|---|---|
| Home | `/` | 7.8 (content + rails + reviews + articles), 7.12 |
| Collection | `/collections/[handle]` | 7.2 |
| Collections index | `/collections`, `/products` | 7.3 |
| Product | `/products/[handle]` | 7.1, cart 7.5 |
| Quick View | modal | 7.4, 7.5 |
| Search | overlay + `/search` | 7.13 |
| Cart drawer + `/cart` | | 7.5, 7.9, 7.2 (suggestions) |
| Checkout | `/checkout` | 7.5 (cart), 7.6, 7.9 |
| Order confirmed | `/order/[id]/confirmed` | 7.7 |
| Sign in / register | `/account/login`, `/account/register` | 7.14 |
| Account dashboard | `/account` | 7.14 |
| Orders | `/account/orders` | 7.14 |
| Addresses | `/account/addresses` | 7.14 |
| Content pages | `/pages/[handle]` | 7.11 |
| Policies | `/policies/*` (to build) | 7.11 |
| Journal | `/blogs/blogs[/handle]` (to build) | 7.10 |
| Header, footer, announcement | every page | 7.12 |
| Newsletter | home | 6.4 |
| 404 | `[...slug]` | none |

---

## 9. Storefront integration plan

### 9.1 New files in `src/lib/medusa/`

| File | Contents |
|---|---|
| `client.ts` | Exists. Add `auth` config (D1) |
| `region.ts` | `getRegionId()` cached |
| `products.ts` | `getProductByHandle`, `listProductHandles`, `searchProducts` |
| `collections.ts` | `getCollectionPage`, `getCollectionIndex`, `listCollectionHandles` |
| `cart.ts` | create, retrieve, add, update, remove, promotions, cookie helpers |
| `checkout.ts` | address update, shipping options and method, payment session, complete |
| `customer.ts` | auth, profile, addresses, orders |
| `content.ts` | home, pages, site settings, articles, reviews, newsletter |
| `mappers.ts` | Medusa response to the existing view types (section 12). The UI keeps its current types |
| `payment.ts` | Provider id map (`razorpay`, `phonepe`) |
| `errors.ts` | Medusa error to user-facing message map |

### 9.2 Existing modules to rewire (keep signatures where possible)

| Module | Change |
|---|---|
| `lib/products.ts`, `lib/collections.ts`, `lib/quick-view/index.ts`, `lib/search/index.ts` | Bodies call `lib/medusa/*`. They are already async |
| `lib/cart/catalog.ts` and `reconcile.ts` | Delete; the server cart is authoritative. Remove `getVariantCatalog()` from `app/layout.tsx` and the `catalog` prop of `CartProvider` |
| `lib/cart/storage.ts` | Keep `createStore` only if still used elsewhere; remove cart and coupon stores |
| `components/cart/cart-provider.tsx` | Rewrite on TanStack Query (`useQuery` for the cart, `useMutation` for line changes with optimistic updates). Keep the `useCart()` interface so the UI is untouched |
| `lib/account/storage.ts`, `components/account/hooks.ts` | Replace with Medusa-backed queries (`useCustomer`, `useAddresses`, `useOrders`) |
| `lib/checkout/place-order.ts` | Implement 7.6 |
| `components/checkout/use-checkout-cart.ts` | Buy-now uses a throwaway cart (7.5) |
| `lib/data/*.ts` | Become seed sources only, then are deleted |
| `lib/orders/preview.ts` | Remove with the preview branch in the confirmation page |

### 9.3 Things the current UI lacks that Medusa needs

- A **`QueryClientProvider`**. TanStack Query is in the stack but not mounted in `app/layout.tsx`.
- Loading and error states on cart, checkout and account actions (everything is synchronous localStorage today).
- Coupon error message (7.9).
- Newsletter submit handler with success and error states.
- Journal article pages and policy pages (7.10, 7.11).
- Payment return page (7.16).
- Email field made mandatory at checkout (D3), and password screens if D1 is `emailpass`.

### 9.4 Id changes

Variant ids are Shopify numeric strings today (for example `44198485557388`), and the `?buy=` link uses them. They become Medusa ids (`variant_01…`). Any saved links with `?buy=` change.

### 9.5 Caching and revalidation

- Catalogue, content and settings: `fetch`/SDK calls tagged (for example `products`, `collections`, `content`) with `revalidate` of a few minutes, plus on-demand revalidation (6.8).
- Cart, customer, orders: never cached (per-user).
- `generateStaticParams` for products, collections and pages needs the backend reachable at build time.
- This repo's `AGENTS.md` warns that this Next.js version has breaking changes. Read `node_modules/next/dist/docs/` for the caching and revalidation APIs before writing this part.

### 9.6 Config

- `next.config.ts`: replace/add the `images.remotePatterns` entry for the media bucket host.
- `src/lib/cdn.ts`: point `CDN_BASE` at `NEXT_PUBLIC_MEDIA_BASE_URL`.
- Backend CORS must list the storefront origin(s) (section 3.4).

---

## 10. Data migration and seeding

Write one idempotent seed script in the backend repo (`src/scripts/seed-dpetals.ts`). Sources are in this repo:

| Seed | Source file | Target |
|---|---|---|
| Products, variants, options, prices, MRP, images, videos, metadata | `src/lib/data/product-details.ts` (28 products) and `src/lib/data/collections.ts` (`catalog`: card subtitle, `isNew`, rating) | Products (5.2) |
| Categories and positions | `src/lib/data/collections.ts` (`collections`, 17) | Categories + `category_product_position` |
| Inventory | 50 per variant, to be confirmed against real stock | Inventory items |
| Promotions | `lib/cart/pricing.ts` (tiers), `lib/data/coupons.ts` | Section 4.3, 4.4 |
| Home blocks | `src/lib/data/home.ts` | `content_block` |
| Pages | `src/lib/data/pages.ts` | `page` |
| Site settings | `src/lib/data/navigation.ts` (`siteInfo`, links, popular searches) | `site_settings` |
| Articles | `src/lib/data/blog.ts` (4 articles) | `article` |
| Reviews | `home.ts` `reviews` (3) | `review` (featured) |
| Images | all `files/…`, `collections/…`, `articles/…` paths | File bucket (5.5) |

Prices in the data are in INR major units. Product ids in Medusa will be new; **handles are the stable key** across the old and new site, so no URL redirects are needed as long as handles are kept.

---

## 11. Phasing and acceptance checks

### Phase 1: browse (read-only)
1. Backend running with region, key, stock location, catalogue and categories seeded.
2. Storefront shows products, collections, product pages from Medusa with **no visual change** compared with the `docs/reference/` screenshots.
3. Search via `q`.

### Phase 2: buy
4. Medusa cart replaces localStorage with the same UI behaviour.
5. Reward tiers and free shipping verified (checks below).
6. Checkout, payment providers, webhooks, order confirmation, order emails.

### Phase 3: account and content
7. Customer auth, addresses, orders.
8. Content module and Admin widgets, journal and policy pages, newsletter, reviews.
9. Search index (Meilisearch/Algolia).

### Acceptance checks
- [ ] Product by handle returns price 250 and MRP 499 for `neem-tea-tree-face-wash`; the card shows "49% off".
- [ ] A ₹499 cart: no free shipping. ₹500: shipping is ₹0. ₹1000: 10% off. ₹1500: 15%. ₹2000: 20%. Only one tier applies at a time.
- [ ] Adding a 51st unit of one variant shows the exact "maximum quantity" message and leaves the drawer closed.
- [ ] `FIRSTTIMEOFFER` works once per email, not twice.
- [ ] Guest checkout completes with Razorpay and with PhonePe in test mode, including the case where the browser is closed after payment (webhook creates the order).
- [ ] The confirmation page shows the right address, totals, shipping and payment method.
- [ ] Signed-in customer sees the order in `/account/orders`, newest first.
- [ ] Cart survives refresh; a guest cart transfers on sign-in.
- [ ] Publishing a product change in Admin shows on the storefront within the revalidation window.
- [ ] `npm run lint` and `npm run build` pass in the storefront.

---

## 12. Reference: storefront types the backend data must satisfy

The mappers in 9.1 convert Medusa responses into these. They live in `src/types/*`.

### 12.1 Product summary (cards, rails, search) (`src/types/home.ts`)

```ts
interface ProductSummary {
  handle: string;
  title: string;
  image: { src: string; alt: string };
  subtitle: string;          // "Face Wash · 120 ml"
  price: number;             // selling price, INR major units
  mrp: number;               // maximum retail price
  currency: string;          // "INR"
  isNew: boolean;
  rating: { average: number; count: number } | null;
}
```

### 12.2 Product detail (`src/types/product.ts`)

`ProductDetail` has: `handle, seoTitle, seoDescription, badges[], title, subtitle, rating, netQty, taxNote, offer, options[{name, values[]}], variants[{id, title, options[], price, compareAtPrice, available, imageFile}], currency, media[] (image or {video, poster}), trust[{icon, label}], accordions[] (html or rows), sections[], crossSell {handle, title}, related {title, subtitle, handles[]}, showBlog`.

`sections[]` is a union discriminated by `type`:

| `type` | Fields |
|---|---|
| `ingredients` | `title, subtitle, items[{ image, alt, title, text }], summaryHtml` |
| `benefits` | `title, subtitle, items[{ icon, text }]`. `icon` is one of `bubbles, waves, leaf, drop, wind, check-circle, sparkles, heart, moon, shield-check, scalp, target` |
| `steps` | `title, subtitle, items[{ image, number, text }], footnoteHtml` |
| `purity` | `title, subtitle, items[string]` |
| `comparison` | `title, subtitle, columns{feature, ours, theirs}, rows[{feature, ours, theirs}]` |
| `faq` | `title, subtitle, items[{ question, answerHtml, open }]` |

Accordions: `{ kind: "html", title, open, html }` or `{ kind: "rows", title, open, rows[{ label, value, href }] }`.

### 12.3 Cart and order (`src/types/cart.ts`, `src/types/account.ts`)

```ts
interface CartLine {
  variantId: string; handle: string; title: string; variantTitle: string | null;
  image: string; imageAlt: string; unitPrice: number; compareAtPrice: number | null;
  unitMeasure?: { amount: number; unit: string } | null; quantity: number;
}

interface Order {
  id: string;
  number: string;               // "DP" + display_id, for example "DP1042"
  placedAt: string;             // ISO, from created_at
  status: "processing" | "shipped" | "delivered" | "cancelled";
  currency: string;
  lines: { title; variantTitle; quantity; image; unitPrice }[];
  email: string;
  subtotal: number; discount: number; shippingTotal: number; total: number;
  shippingAddress: OrderAddress; billingAddress: OrderAddress;
  shippingMethod: string;       // "Standard shipping"
  paymentMethod: string;        // "Razorpay Secure (UPI, Card, Int'l Card, Apple Pay)"
}
```

Order status mapping (decide with the business, suggested):

| Storefront status | Medusa condition |
|---|---|
| `cancelled` | `order.status = canceled` |
| `delivered` | `fulfillment_status = delivered` |
| `shipped` | `fulfillment_status` is `shipped` or `partially_shipped` |
| `processing` | everything else |

`number` needs the "DP" prefix applied in the mapper, and the starting `display_id` set so numbers continue from the live store if that matters.

### 12.4 Quick View and search

```ts
interface QuickViewItem {
  handle: string; title: string; description: string; image: string;
  price: number; compareAtPrice: number | null; currency: string; available: boolean;
  line: CartLineInput;   // CartLine without quantity
}
interface SuggestionResponse {
  total: number;
  products: { handle; title; image: { src; alt }; price; mrp; currency }[];  // max 7
}
```

### 12.5 Content types

`ContentPage { handle, title, seoTitle, description?, html }`, `Article { handle, title, excerpt, category | null, image { src, alt, width, height } }`, `Coupon { code, title, description }`. Home block shapes are the exported constants in `src/lib/data/home.ts` (`heroSlides`, `valueCards`, `concerns`, `promoBanners`, `categories`, `comboKits`, `spotlight`, `whyDpetals`, `reels`, `reviews`, `ingredients`).

---

## 13. Open items and risks

- **Auth model (D1)** is the largest UI-affecting choice. Decide first.
- **Reward-tier rule attribute (4.3)** and **first-order coupon hook (6.6)** both need a short spike against Medusa 2.21. If either fails, fall back to a custom workflow.
- **Payment plugins (D6)** are community-maintained. Review code, pin versions, and test webhooks before launch. Confirm the live PhonePe and Razorpay merchant accounts.
- **Rating source.** Ratings exist on 10 of 28 products today but their origin (a Shopify review app) is not in this repo. Existing reviews would have to be exported from that app to seed the review module; otherwise ratings start empty.
- **Shipping fee, GST rates, stock levels, coupon stacking** need business input (D7, D8, D9, 4.5).
- **Out of scope for now** (not in the storefront today): wishlists, review submission, returns/refunds UI, order tracking, multi-currency, gift cards, loyalty. Medusa can add them later.
- **Mix and Match bundle builder** (`/pages/collection-bundle`) renders empty on the reference site (it relies on a third-party app). No backend work is specified for it.
