# DPetals — Medusa API Map and Field Crosswalk

A map of the Medusa Store API, its response data structures with field types, and a field-by-field crosswalk to the data structures the local storefront uses today. Each crosswalk row carries the local field, its type, a real sample value from the local data, the Medusa path that supplies it, the Medusa type, and the transform.

Companion documents:
- [medusa-backend-spec.md](medusa-backend-spec.md): setup, decisions, custom modules.
- [medusa-data-contract.md](medusa-data-contract.md): the storefront data structures, with samples, and how Medusa stores them.

## How this was verified

| Source | What it covers |
|---|---|
| `node_modules/@medusajs/types` **2.21.2** (`dist/http/*`) | Every response field name and type in sections 3 and 4. Copied from the installed type definitions |
| `node_modules/@medusajs/js-sdk` 2.21.2 (`dist/store`, `dist/auth`) | Every Store and Auth endpoint path and SDK method in section 1 |
| `src/types/*`, `src/lib/data/*` | The local types and the sample values |
| Medusa docs | Behaviour notes (price rules, promotion rules, guest order retrieval). Marked **Docs** |
| Not verifiable offline | Marked **VERIFY**. All ids and timestamps in the Medusa samples are illustrative |

Conventions: `string | null` means the key is always present and may be null; `x?` means the key may be absent. Money is in major units (₹250 is `250`). The GST rate in the sample carts and orders is an **assumption for illustration only** (18%), pending decision D8 in the backend spec.

---

## 1. API map

Base URL is `NEXT_PUBLIC_MEDUSA_BACKEND_URL`. Every Store route needs the header `x-publishable-api-key`, which the SDK adds from `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`.

### 1.1 Native Store API (from the installed SDK)

| Area | SDK call | Method and path | Request | Response | Used by the storefront? |
|---|---|---|---|---|---|
| Regions | `store.region.list` | `GET /store/regions` | `StoreRegionListParams` | `{ regions: StoreRegion[] } & Paginated` | Yes (once, to get the India region id) |
| | `store.region.retrieve` | `GET /store/regions/:id` | | `{ region }` | Optional |
| Collections | `store.collection.list` / `retrieve` | `GET /store/collections[/:id]` | | `{ collections } & Paginated` / `{ collection }` | **No.** Medusa collections hold one product each; we use categories (decision D4) |
| Categories | `store.category.list` / `retrieve` | `GET /store/product-categories[/:id]` | `handle`, `parent_category_id`, `include_descendants_tree`, `fields` | `{ product_categories } & Paginated` / `{ product_category }` | Yes: collection index and `generateStaticParams` |
| Products | `store.product.list` | `GET /store/products` | `q, handle, id, category_id, collection_id, tag_id, type_id, limit, offset, order, fields, region_id, country_code, province, cart_id, locale` | `{ products: StoreProduct[] } & Paginated` | Yes: product page, quick view, related, search |
| | `store.product.retrieve` | `GET /store/products/:id` | `fields`, pricing context | `{ product }` | Rarely (needs an id, not a handle) |
| Product options | `store.productOption.list` / `retrieve` | `GET /store/product-options[/:id]` | | `{ product_options } & Paginated` / `{ product_option }` | No |
| Cart | `store.cart.create` | `POST /store/carts` | `StoreCreateCart` | `{ cart }` | Yes |
| | `store.cart.retrieve` | `GET /store/carts/:id` | `fields` | `{ cart }` | Yes |
| | `store.cart.update` | `POST /store/carts/:id` | `StoreUpdateCart` | `{ cart }` | Yes (email, addresses, metadata) |
| | `store.cart.createLineItem` | `POST /store/carts/:id/line-items` | `StoreAddCartLineItem` | `{ cart }` | Yes |
| | `store.cart.updateLineItem` | `POST /store/carts/:id/line-items/:lineId` | `StoreUpdateCartLineItem` | `{ cart }` | Yes |
| | `store.cart.deleteLineItem` | `DELETE /store/carts/:id/line-items/:lineId` | | `{ id, object: "line-item", deleted, parent: StoreCart }` | Yes |
| | `store.cart.addShippingMethod` | `POST /store/carts/:id/shipping-methods` | `{ option_id, data? }` | `{ cart }` | Yes |
| | `store.cart.addPromotions` | `POST /store/carts/:id/promotions` | `{ promo_codes: string[] }` | `{ cart }` | Yes (coupon box, checkout discount field) |
| | `store.cart.removePromotions` | `DELETE /store/carts/:id/promotions` | `{ promo_codes: string[] }` | `{ cart }` | Yes |
| | `store.cart.transferCart` | `POST /store/carts/:id/customer` | | `{ cart }` | Yes (guest cart to customer on sign-in) |
| | `store.cart.complete` | `POST /store/carts/:id/complete` | `{ idempotency_key? }` | `StoreCompleteCartResponse` | Yes |
| Shipping | `store.fulfillment.listCartOptions` | `GET /store/shipping-options?cart_id=` | `cart_id`, `is_return?` | `{ shipping_options: StoreCartShippingOptionWithServiceZone[] }` | Yes |
| | `store.fulfillment.calculate` | `POST /store/shipping-options/:id/calculate` | | `{ shipping_option }` | No (flat rate) |
| Payment | `store.payment.listPaymentProviders` | `GET /store/payment-providers?region_id=` | | `{ payment_providers } & Paginated` | Optional |
| | `store.payment.initiatePaymentSession` | `POST /store/payment-collections` then `POST /store/payment-collections/:id/payment-sessions` | `{ cart_id }`, `{ provider_id, data? }` | `{ payment_collection: StorePaymentCollection }` | Yes |
| Orders | `store.order.list` | `GET /store/orders` (customer) | `limit, offset, order, fields, status` | `{ orders: StoreOrder[] } & Paginated` | Yes: account orders |
| | `store.order.retrieve` | `GET /store/orders/:id` | `fields` | `{ order }` | Yes: confirmation page (usable by guests, **Docs**) |
| | `store.order.requestTransfer` / `cancelTransfer` / `acceptTransfer` / `declineTransfer` | `POST /store/orders/:id/transfer/*` | | | No |
| Customers | `store.customer.create` | `POST /store/customers` | `StoreCreateCustomer` | `{ customer }` | Yes (after auth register) |
| | `store.customer.retrieve` | `GET /store/customers/me` | `fields` | `{ customer }` | Yes |
| | `store.customer.update` | `POST /store/customers/me` | `StoreUpdateCustomer` | `{ customer }` | Yes: profile |
| | `store.customer.listAddress` | `GET /store/customers/me/addresses` | | `{ addresses } & Paginated` | Yes |
| | `store.customer.retrieveAddress` | `GET /store/customers/me/addresses/:id` | | `{ address }` | Optional |
| | `store.customer.createAddress` | `POST /store/customers/me/addresses` | `StoreCreateCustomerAddress` | `{ customer }` | Yes |
| | `store.customer.updateAddress` | `POST /store/customers/me/addresses/:id` | `StoreUpdateCustomerAddress` | `{ customer }` | Yes |
| | `store.customer.deleteAddress` | `DELETE /store/customers/me/addresses/:id` | | `{ id, object: "address", deleted, parent: StoreCustomer }` | Yes |
| Locales | `store.locale.list` | `GET /store/locales` | | `{ locales }` | No (single language) |

### 1.2 Auth API (SDK `sdk.auth`)

Actor is `"customer"`; the provider is `"emailpass"` (built in) or our custom `"email-otp"` (decision D1).

| SDK call | Path | Purpose | Used by |
|---|---|---|---|
| `auth.register(actor, provider, payload)` | `POST /auth/:actor/:provider/register` | Create an auth identity | Sign-in form, first visit |
| `auth.login(actor, provider, payload)` | `POST /auth/:actor/:provider` | Authenticate. The SDK returns the JWT as a `string`, or `{ location }` for an OAuth redirect. The backend response can also carry an MFA challenge or a verification requirement (the SDK handles these) | Sign-in form |
| `auth.callback(actor, provider, query)` | `GET /auth/:actor/:provider/callback` | OAuth and OTP verification step | OTP verify step (**VERIFY** exact flow for the custom provider) |
| `auth.refresh()` | `POST /auth/token/refresh` | Refresh the JWT | Account area |
| `auth.logout()` | `DELETE /auth/session` | End the session | Account menu |
| `auth.resetPassword(actor, provider, body)` | `POST /auth/:actor/:provider/reset-password` | Only for `emailpass` | Not used if D1 = OTP |
| `auth.updateProvider(...)` | `POST /auth/:actor/:provider/update` | Set a new password | Not used if D1 = OTP |

All paths above were read from the installed SDK source (`dist/auth/index.js`). The SDK also exposes MFA factor routes (`/auth/mfa/*`) and email verification routes (`/auth/verification/*`), which the storefront does not use.

### 1.3 Webhooks and server-side only

| Item | Path / mechanism | Purpose |
|---|---|---|
| Payment webhook | `POST /hooks/payment/:provider_id` | Razorpay and PhonePe call it. Completes the cart when the customer closes the tab after paying |
| Subscribers | `product.updated`, `product-category.updated`, `inventory-level.updated`, `order.placed`, `review.approved` | Revalidate storefront pages, send emails, update ratings |
| Admin API (`/admin/*`) | Product import, content editing, promotions | Back office only. Not called by the storefront |

### 1.4 Custom Store API (ours, `/store/dp/*`)

These return the storefront's own types, so the UI needs no mapping. The data they return is specified in [medusa-data-contract.md](medusa-data-contract.md) section 5. The table adds request details and which native calls each wraps.

| Route | Query / body | Response type | Wraps |
|---|---|---|---|
| `GET /store/dp/products/:handle` | `region_id` | `ProductDetail` | `GET /store/products?handle=` |
| `GET /store/dp/products` | `handles=a,b`, `region_id` | `ProductSummary[]` | `GET /store/products?handle[]=` |
| `GET /store/dp/collections` | | `CollectionIndexEntry[]` | `GET /store/product-categories` |
| `GET /store/dp/collections/:handle/products` | `page=1`, `limit=24`, `region_id` | `CollectionPage` | categories + `category_product_position` |
| `GET /store/dp/quick-view/:handle` | `region_id` | `QuickViewItem` | products |
| `GET /store/dp/search` | `q`, `limit`, `region_id` | `SearchResults` | `GET /store/products?q=` / search index |
| `GET /store/dp/content/home` | `region_id` | `HomeContent` | content module + collections |
| `GET /store/dp/content/site` | | `SiteContent` | content module |
| `GET /store/dp/pages`, `GET /store/dp/pages/:handle` | | `string[]`, `ContentPage` | content module |
| `GET /store/dp/articles`, `GET /store/dp/articles/:handle` | `limit`, `offset`, `category` | `Article[]`, `Article & { bodyHtml; publishedAt }` | content module |
| `GET /store/dp/reviews` | `featured=true` | `Review[]` | review module |
| `POST /store/dp/newsletter` | `{ email: string }` | `{ ok: true }` | newsletter module |
| `GET /store/dp/carts/:id` | | `{ id; lines: CartLine[]; summary: CartSummary; couponCode: string }` | `GET /store/carts/:id` |
| `POST /store/dp/carts/:id/checkout` | `CheckoutValues` | `PlaceOrderResult` | cart update, shipping, payment session, complete |
| `GET`, `PATCH /store/dp/me` | `Partial<Pick<AccountSession,"firstName"\|"lastName"\|"phone">>` | `AccountSession` | customers/me |
| `GET`, `POST /store/dp/me/addresses`, `PATCH`, `DELETE …/:id` | `Omit<SavedAddress,"id">` | `SavedAddress[]` / `SavedAddress` | customers/me/addresses |
| `GET /store/dp/me/orders` | | `Order[]` | `GET /store/orders` |
| `GET /store/dp/orders/:id` | | `Order` | `GET /store/orders/:id` |

---

## 2. Shared conventions

### 2.1 Envelopes

```ts
type PaginatedResponse<T> = { limit: number; offset: number; count: number; estimate_count?: number } & T;
type DeleteResponse<T extends string> = { id: string; object: T; deleted: boolean };
type DeleteResponseWithParent<T extends string, P> = DeleteResponse<T> & { parent?: P };
```

List parameters (`FindParams`): `fields?: string`, `limit?: number`, `offset?: number`, `order?: string` (for example `"-created_at"`), `with_deleted?: boolean`.

### 2.2 Field selection (`fields`)

Medusa returns a default set of fields. Control it with a comma-separated `fields` string:

| Prefix | Meaning | Example |
|---|---|---|
| none | Select exactly this field | `fields=id,title,handle` |
| `*` | Expand the whole relation | `*variants`, `*variants.calculated_price` |
| `+` | Add a field to the defaults | `+metadata`, `+variants.inventory_quantity` |
| `-` | Remove a default field | `-description` |

### 2.3 Pricing context (products)

`calculated_price` is only returned when the request carries a pricing context: `region_id` (we always send it), or `country_code` plus currency, optionally `province` and `cart_id`.

### 2.4 Errors

Medusa errors are JSON `{ type: string; message: string }` with HTTP 400, 401, 404, 409, 422 or 500. Types in use include `not_found`, `invalid_data`, `not_allowed`, `unauthorized`, `conflict`, `unexpected_state`, `payment_authorization_error`, `payment_requires_more_error`. The storefront should turn them into its existing copy in `src/lib/medusa/errors.ts`:

| Situation | Medusa | Storefront message |
|---|---|---|
| Quantity over stock or the cap of 50 | 400/409 `not_allowed` with an inventory message | "The maximum quantity of this item is already in your cart." (or "Only N items were added to your cart due to availability.") |
| Invalid coupon | 400/404 | New copy needed, for example "This code isn't valid" (backend spec 7.9) |
| Cart already completed | 400 `not_allowed` | Clear the cart cookie, start a new cart |
| Payment failed | `StoreCompleteCartResponse` with `type: "cart"` and `error` | Show the message in the checkout notice box |
| Unknown product, collection, order | 404 `not_found` | `notFound()` / "We couldn't find that order" |

---

## 3. Medusa data structures

Types are copied from `@medusajs/types` 2.21.2 and trimmed to the fields the storefront reads, with all other fields listed in the notes. Each structure has a sample built from our real data. Ids and timestamps are illustrative.

### 3.1 `StoreProduct`

```ts
interface StoreProduct {
  id: string;
  title: string;
  handle: string;
  subtitle: string | null;
  description: string | null;
  is_giftcard: boolean;
  status: "draft" | "proposed" | "published" | "rejected";
  thumbnail: string | null;
  width: number | null; weight: number | null; length: number | null; height: number | null;
  origin_country: string | null; hs_code: string | null; mid_code: string | null; material: string | null;
  collection_id: string | null;  collection?: StoreCollection | null;
  type_id: string | null;        type?: StoreProductType | null;
  categories?: StoreProductCategory[] | null;
  tags?: StoreProductTag[] | null;
  options: StoreProductOption[] | null;
  variants: StoreProductVariant[] | null;
  images: StoreProductImage[] | null;
  discountable: boolean;
  external_id: string | null;
  created_at: string | null; updated_at: string | null; deleted_at: string | null;
  metadata?: Record<string, unknown> | null;
}
interface StoreProductVariant {
  id: string;
  title: string | null;
  sku: string | null; barcode: string | null; ean: string | null; upc: string | null;
  thumbnail: string | null;
  images?: StoreProductImage[] | null;
  allow_backorder: boolean | null;
  manage_inventory: boolean | null;
  inventory_quantity?: number | null;
  variant_rank?: number | null;
  options: StoreProductOptionValue[] | null;
  product?: StoreProduct | null;  product_id?: string;
  calculated_price?: StoreCalculatedPrice;
  hs_code, origin_country, mid_code, material, weight, length, height, width: …| null;
  created_at: string; updated_at: string; deleted_at: string | null;
  metadata?: Record<string, unknown> | null;
}
interface StoreProductOption { id: string; title: string; is_exclusive: boolean; values?: StoreProductOptionValue[];
                               product?: StoreProduct | null; metadata?: Record<string, unknown> | null; created_at?: string; updated_at?: string; deleted_at?: string | null }
interface StoreProductOptionValue { id: string; value: string; rank?: number; option_id?: string | null; option?: StoreProductOption | null;
                                    metadata?: Record<string, unknown> | null; created_at?: string; updated_at?: string; deleted_at?: string | null }
interface StoreProductImage { id: string; url: string; rank: number; metadata?: Record<string, unknown> | null; created_at?: string; updated_at?: string; deleted_at?: string | null }
interface StoreCalculatedPrice {
  id: string;
  is_calculated_price_price_list?: boolean;
  is_calculated_price_tax_inclusive?: boolean;
  calculated_amount: number | null;
  calculated_amount_with_tax?: number | null;
  calculated_amount_without_tax?: number | null;
  is_original_price_price_list?: boolean;
  is_original_price_tax_inclusive?: boolean;
  original_amount: number | null;
  original_amount_with_tax: number | null;
  original_amount_without_tax: number | null;
  currency_code: string | null;
  calculated_price?: { id: string | null; price_list_id: string | null; price_list_type: string | null; min_quantity: number | null; max_quantity: number | null };
  original_price?:   { id: string | null; price_list_id: string | null; price_list_type: string | null; min_quantity: number | null; max_quantity: number | null };
}
```

Response wrappers: `GET /store/products` returns `{ products: StoreProduct[]; limit: number; offset: number; count: number }`.

Sample (Neem face wash, single variant, as returned by `GET /store/products?handle=neem-tea-tree-face-wash&region_id=…&fields=…`, abridged):

```jsonc
{
  "products": [{
    "id": "prod_01JAXNEEM0000000000000001",
    "title": "Neem & Tea Tree Face Wash",
    "handle": "neem-tea-tree-face-wash",
    "subtitle": "For clearer, calmer, acne-prone skin — without the tightness.",
    "description": "<p><strong>Clear skin starts here.</strong> A gentle daily cleanser …</p>",
    "status": "published",
    "thumbnail": "https://media.dpetals.example/files/face_wash_with_props.png",
    "is_giftcard": false, "discountable": true,
    "collection_id": null,
    "categories": [
      { "id": "pcat_01…", "name": "Skincare", "handle": "skincare", "description": "Glow naturally with DPetals …", "rank": 0, "is_active": true, "is_internal": false,
        "parent_category_id": null, "metadata": { "seoTitle": "Natural Skincare — Face Wash, Toner & Gels | DPetals",
                                                  "image": { "src": "collections/Rose-Water-Multani-Mitti-Store-Listing-Combo_1_1.png", "alt": "Skincare" } } }
    ],
    "options": [{ "id": "opt_01…", "title": "Title", "is_exclusive": false, "values": [{ "id": "optval_01…", "value": "Default Title", "rank": 0 }] }],
    "images": [
      { "id": "img_01…", "url": "https://media.dpetals.example/files/face_wash_with_props.png", "rank": 0 },
      { "id": "img_02…", "url": "https://media.dpetals.example/files/2_47b596ae-6db7-4550-8766-cdeb42f20e53.jpg", "rank": 1 }
    ],
    "variants": [{
      "id": "variant_01JAXNEEM0000000000000001",
      "title": "Default Title",
      "sku": "DP-NEEM-FW-120",
      "manage_inventory": true, "allow_backorder": false, "inventory_quantity": 50,
      "options": [{ "id": "optval_01…", "value": "Default Title", "option_id": "opt_01…" }],
      "calculated_price": {
        "id": "ps_01…", "currency_code": "inr",
        "calculated_amount": 250, "original_amount": 250,
        "is_calculated_price_tax_inclusive": true,
        "calculated_amount_with_tax": 250, "calculated_amount_without_tax": 211.86,
        "original_amount_with_tax": 250, "original_amount_without_tax": 211.86
      },
      "metadata": { "mrp": 499, "legacyId": "44198485557388", "imageFile": null }
    }],
    "metadata": {
      "seoTitle": "Neem & Tea Tree Face Wash for Acne-Prone Skin | DPetals",
      "badges": [{ "tone": "new", "label": "NEW" }, { "tone": "tag", "label": "Face Wash" }],
      "isNew": true, "cardSubtitle": "Face Wash · 120 ml", "netQty": "120 ml",
      "taxNote": "MRP inclusive of all taxes", "showBlog": true
      /* … see medusa-data-contract.md section 4.1 for the full metadata */
    }
  }],
  "count": 1, "offset": 0, "limit": 50
}
```

(Without the `inventory_quantity` field in `fields`, the variant will not carry it. The publishable key's sales channel must be linked to the stock location for the quantity to be returned.)

### 3.2 `StoreProductCategory` and `StoreCollection`

```ts
interface StoreProductCategory {
  id: string; name: string; description: string; handle: string;
  is_active: boolean; is_internal: boolean;
  rank: number | null; external_id: string | null;
  parent_category_id: string | null;
  parent_category: StoreProductCategory | null;
  category_children: StoreProductCategory[];
  products?: StoreProduct[];
  metadata?: Record<string, unknown> | null;
  created_at: string; updated_at: string; deleted_at: string | null;
}
interface StoreCollection {
  id: string; title: string; handle: string;
  external_id?: string | null;
  products?: StoreProduct[];
  metadata: Record<string, unknown> | null;
  created_at: string; updated_at: string; deleted_at: string | null;
}
```

Sample (`bestsellers`):

```json
{
  "id": "pcat_01JAXBEST0000000000000001", "name": "Best Sellers", "handle": "bestsellers",
  "description": "Discover DPetals Bestsellers – customer-favorite herbal & organic skincare and haircare essentials! …",
  "is_active": true, "is_internal": false, "rank": 5, "external_id": null,
  "parent_category_id": null, "parent_category": null, "category_children": [],
  "metadata": { "seoTitle": "Best Sellers | DPetals", "image": { "src": "files/face_wash_with_props.png", "alt": "Best Sellers" } },
  "created_at": "2026-10-03T08:00:00.000Z", "updated_at": "2026-10-03T08:00:00.000Z", "deleted_at": null
}
```

### 3.3 `StoreCart` and related

```ts
interface StoreCart {
  id: string;
  region_id?: string;  region?: StoreRegion;
  customer_id?: string;
  sales_channel_id?: string;
  email?: string;
  currency_code: string;
  shipping_address?: StoreCartAddress;
  billing_address?: StoreCartAddress;
  items?: StoreCartLineItem[];
  shipping_methods?: StoreCartShippingMethod[];
  payment_collection?: StorePaymentCollection;
  promotions: StoreCartPromotion[];
  metadata?: Record<string, unknown> | null;
  created_at?: string | Date; updated_at?: string | Date; completed_at?: string | Date;
  // totals (all number)
  original_item_total; original_item_subtotal; original_item_tax_total;
  item_total; item_subtotal; item_tax_total;
  original_total; original_subtotal; original_tax_total;
  total; subtotal; tax_total; discount_total; discount_tax_total;
  gift_card_total; gift_card_tax_total;
  shipping_total; shipping_subtotal; shipping_tax_total;
  original_shipping_total; original_shipping_subtotal; original_shipping_tax_total;
}
interface StoreCartLineItem {
  id: string; title: string; subtitle?: string; thumbnail?: string; quantity: number;
  product_id?: string; product_title?: string; product_description?: string; product_subtitle?: string;
  product_type?: string; product_collection?: string; product_handle?: string;
  variant_id?: string; variant_sku?: string; variant_barcode?: string; variant_title?: string;
  variant_option_values?: Record<string, unknown>;
  requires_shipping: boolean; is_discountable: boolean; is_tax_inclusive: boolean;
  compare_at_unit_price?: number;
  unit_price: number;
  product?: StoreProduct; variant?: StoreProductVariant;
  tax_lines?: BaseLineItemTaxLine[]; adjustments?: BaseLineItemAdjustment[];
  cart_id: string; metadata?: Record<string, unknown> | null;
  created_at?: Date; updated_at?: Date; deleted_at?: Date;
  // per-line totals (all number, optional): original_total, original_subtotal, original_tax_total,
  // item_total, item_subtotal, item_tax_total, total, subtotal, tax_total, discount_total, discount_tax_total
}
interface StoreCartAddress {
  id: string; customer_id?: string;
  first_name?: string; last_name?: string; phone?: string; company?: string;
  address_1?: string; address_2?: string; city?: string;
  country_code?: string; province?: string; postal_code?: string;
  metadata?: Record<string, unknown> | null; created_at: Date | string; updated_at: Date | string;
}
interface StoreCartShippingMethod {
  id: string; cart_id: string; name: string; description?: string;
  amount: number; is_tax_inclusive: boolean; shipping_option_id?: string;
  data?: Record<string, unknown>; metadata?: Record<string, unknown> | null;
  tax_lines?: …[]; adjustments?: …[];
  original_total?; original_subtotal?; original_tax_total?; total?; subtotal?; tax_total?; discount_total?; discount_tax_total?: number;
  created_at: Date | string; updated_at: Date | string;
}
interface StoreCartPromotion {
  id: string; code?: string; is_automatic?: boolean;
  application_method?: { value: string; type: "fixed" | "percentage"; currency_code: string };
}
interface BaseAdjustmentLine { id: string; code?: string; amount: number; cart_id: string; description?: string; promotion_id?: string; provider_id?: string; created_at: Date | string; updated_at: Date | string }
```

`compare_at_unit_price` exists on cart (and order) line items in 2.21. Medusa fills it from the variant's original price when a sale price list applies. See the MRP note in 4.4.

Request payloads: `StoreCreateCart { region_id?, shipping_address?, billing_address?, email?, currency_code?, items?, sales_channel_id?, promo_codes?, metadata?, locale? }`, `StoreUpdateCart { region_id?, shipping_address?, billing_address?, email?, sales_channel_id?, metadata?, promo_codes?, locale? }`, `StoreAddCartLineItem { variant_id: string; quantity: number; metadata? }`, `StoreUpdateCartLineItem { quantity: number; metadata? }`, `StoreAddCartShippingMethods { option_id: string; data? }`, `StoreCartAddPromotion { promo_codes: string[] }`, `StoreAddAddress { first_name?, last_name?, phone?, company?, address_1?, address_2?, city?, country_code?, province?, postal_code?, metadata? }` (all `string | null`).

Complete-cart response:

```ts
type StoreCompleteCartResponse =
  | { type: "cart"; cart: StoreCart; error: { message: string; name: string; type: string } }
  | { type: "order"; order: StoreOrder };
```

Sample cart (2 × Neem face wash, India region, tax-inclusive, **18% GST assumed for illustration**, no promotions):

```jsonc
{
  "cart": {
    "id": "cart_01JAXCART000000000000001",
    "region_id": "reg_01JAXINDIA00000000000001", "currency_code": "inr",
    "email": "asha@example.com", "customer_id": null, "sales_channel_id": "sc_01…",
    "items": [{
      "id": "cali_01JAXLINE00000000000001", "cart_id": "cart_01JAXCART000000000000001",
      "title": "Neem & Tea Tree Face Wash", "subtitle": "For clearer, calmer, acne-prone skin — without the tightness.",
      "thumbnail": "https://media.dpetals.example/files/face_wash_with_props.png",
      "product_id": "prod_01JAXNEEM0000000000000001", "product_handle": "neem-tea-tree-face-wash",
      "product_title": "Neem & Tea Tree Face Wash",
      "variant_id": "variant_01JAXNEEM0000000000000001", "variant_title": "Default Title",
      "quantity": 2, "unit_price": 250, "is_tax_inclusive": true,
      "requires_shipping": true, "is_discountable": true,
      "variant": { "id": "variant_01JAXNEEM0000000000000001", "inventory_quantity": 50, "metadata": { "mrp": 499 } },
      "product": { "handle": "neem-tea-tree-face-wash", "title": "Neem & Tea Tree Face Wash", "metadata": { "netQty": "120 ml" } },
      "original_total": 500, "original_subtotal": 423.73, "original_tax_total": 76.27,
      "item_total": 500, "item_subtotal": 423.73, "item_tax_total": 76.27,
      "total": 500, "subtotal": 423.73, "tax_total": 76.27, "discount_total": 0, "discount_tax_total": 0
    }],
    "promotions": [],
    "shipping_address": { "id": "caaddr_01…", "first_name": "Asha", "last_name": "Patel", "address_1": "12 Rose Lane, Satellite", "address_2": "",
                          "city": "Ahmedabad", "province": "Gujarat", "postal_code": "380015", "country_code": "in", "phone": "9876543210" },
    "shipping_methods": [{ "id": "casm_01…", "name": "Standard shipping", "amount": 0, "is_tax_inclusive": true, "shipping_option_id": "so_01…", "total": 0 }],
    "original_item_total": 500, "original_item_subtotal": 423.73, "original_item_tax_total": 76.27,
    "item_total": 500, "item_subtotal": 423.73, "item_tax_total": 76.27,
    "discount_total": 0, "shipping_total": 0, "tax_total": 76.27, "subtotal": 423.73, "total": 500
  }
}
```

### 3.4 `StoreCartShippingOption` (`GET /store/shipping-options?cart_id=`)

```ts
interface StoreCartShippingOption {
  id: string; name: string;
  price_type: "flat" | "calculated";
  service_zone_id: string; shipping_profile_id: string; provider_id: string;
  data: Record<string, unknown> | null;
  type: { id: string; label: string; description: string; code: string };
  provider: { id: string; is_enabled: boolean };
  amount: number;                               // price for this cart (rules applied)
  prices: StorePrice[];
  calculated_price: StoreCalculatedPrice;       // same shape as 3.1
  insufficient_inventory: boolean;
}
// the list response adds service_zone { id, fulfillment_set_id, fulfillment_set { id, type, location { id, address } } }
```

Sample for a ₹500 cart:

```json
{ "shipping_options": [{
  "id": "so_01JAXSTD00000000000000001", "name": "Standard shipping", "price_type": "flat",
  "service_zone_id": "serzo_01…", "shipping_profile_id": "sp_01…", "provider_id": "manual_manual",
  "data": null, "type": { "id": "sotype_01…", "label": "Standard", "description": "Standard delivery", "code": "standard" },
  "provider": { "id": "manual_manual", "is_enabled": true },
  "amount": 0, "insufficient_inventory": false,
  "calculated_price": { "id": "cp_01…", "calculated_amount": 0, "original_amount": 0, "currency_code": "inr" }
}] }
```

### 3.5 Payment

```ts
interface StorePaymentCollection {
  id: string; currency_code: string; amount: number;
  authorized_amount?: number; captured_amount?: number; refunded_amount?: number;
  status: "not_paid" | "awaiting" | "authorized" | "partially_authorized" | "canceled" | "completed" | "failed";
  payment_providers: { id: string }[];
  payment_sessions?: StorePaymentSession[];
  payments?: BasePayment[];
  completed_at?: string | Date; created_at?: string | Date; updated_at?: string | Date; metadata?: Record<string, unknown>;
}
interface StorePaymentSession {
  id: string; amount: number; currency_code: string; provider_id: string;
  data: Record<string, unknown>;          // provider specific: redirect URL, order id, token
  context?: Record<string, unknown>;
  status: "authorized" | "captured" | "pending" | "requires_more" | "error" | "canceled" | "pending_authorization";
  authorized_at?: Date;
}
```

Sample after `initiatePaymentSession` with Razorpay (the `data` content depends on the plugin; **VERIFY**):

```json
{ "payment_collection": {
  "id": "paycol_01…", "currency_code": "inr", "amount": 500, "status": "not_paid",
  "payment_providers": [{ "id": "pp_razorpay_razorpay" }, { "id": "pp_phonepe_phonepe" }],
  "payment_sessions": [{ "id": "payses_01…", "provider_id": "pp_razorpay_razorpay", "amount": 500, "currency_code": "inr",
                         "status": "pending", "data": { "id": "order_Nxxxxxxxxxxxxx", "amount": 50000, "currency": "INR" } }]
} }
```

### 3.6 `StoreOrder`

```ts
interface StoreOrder {
  id: string; version: number;
  region_id: string | null; customer_id: string | null; sales_channel_id: string | null;
  email: string | null; currency_code: string;
  display_id?: number;            // sequential, for example 1042
  custom_display_id?: string;     // optional string number, for example "DP1042"
  status: string;                 // "pending" | "completed" | "draft" | "archived" | "canceled" | "requires_action"
  payment_status: "not_paid" | "awaiting" | "authorized" | "partially_authorized" | "captured" | "partially_captured"
                | "partially_refunded" | "refunded" | "canceled" | "requires_action";
  fulfillment_status: "not_fulfilled" | "partially_fulfilled" | "fulfilled" | "partially_shipped" | "shipped"
                | "partially_delivered" | "delivered" | "canceled";
  shipping_address?: StoreOrderAddress | null;  billing_address?: StoreOrderAddress | null;
  items: StoreOrderLineItem[] | null;
  shipping_methods: StoreOrderShippingMethod[] | null;
  payment_collections?: StorePaymentCollection[];
  fulfillments?: StoreOrderFulfillment[];
  transactions?: BaseOrderTransaction[];
  customer?: StoreCustomer;
  summary: { pending_difference; current_order_total; original_order_total; transaction_total; paid_total; refunded_total; accounting_total: number };
  metadata?: Record<string, unknown> | null;
  created_at: string | Date; updated_at: string | Date;
  // totals (number): original_item_total, original_item_subtotal, original_item_tax_total, item_total, item_subtotal, item_tax_total,
  // item_discount_total, original_total, original_subtotal, original_tax_total, total, subtotal, tax_total, discount_total,
  // discount_tax_total, gift_card_total, gift_card_tax_total, shipping_total, shipping_subtotal, shipping_tax_total,
  // shipping_discount_total, original_shipping_total, original_shipping_subtotal, original_shipping_tax_total, credit_line_total
}
interface StoreOrderLineItem {
  id: string; title: string; subtitle: string | null; thumbnail: string | null;
  variant_id: string | null; product_id: string | null;
  product_title: string | null; product_description: string | null; product_subtitle: string | null;
  product_type: string | null; product_collection: string | null; product_handle: string | null;
  variant_sku: string | null; variant_barcode: string | null; variant_title: string | null;
  variant_option_values: Record<string, unknown> | null;
  requires_shipping: boolean; is_discountable: boolean; is_tax_inclusive: boolean;
  compare_at_unit_price?: number; unit_price: number; quantity: number;
  detail: { id; item_id; quantity; fulfilled_quantity; delivered_quantity; shipped_quantity; return_requested_quantity; return_received_quantity; return_dismissed_quantity; written_off_quantity: number; … };
  tax_lines?; adjustments?;
  // totals (number): original_total … refundable_total, refundable_total_per_unit
  metadata: Record<string, unknown> | null; created_at: Date; updated_at: Date;
}
interface StoreOrderAddress { id: string; customer_id?: string; first_name?: string; last_name?: string; phone?: string; company?: string;
  address_1?: string; address_2?: string; city?: string; country_code?: string; province?: string; postal_code?: string;
  country?: { id: string; iso_2?: string; iso_3?: string; num_code?: string; name?: string; display_name?: string };
  metadata: Record<string, unknown> | null; created_at: Date | string; updated_at: Date | string }
interface StoreOrderShippingMethod { id: string; order_id: string; name: string; description?: string; amount: number; is_tax_inclusive: boolean;
  shipping_option_id: string | null; data: Record<string, unknown> | null; metadata: Record<string, unknown> | null;
  original_total; original_subtotal; original_tax_total; total; subtotal; tax_total; discount_total; discount_tax_total: number; … }
interface StoreOrderFulfillment { id: string; location_id: string; packed_at: Date | null; shipped_at: Date | null; delivered_at: Date | null; canceled_at: Date | null;
  requires_shipping: boolean; data: Record<string, unknown> | null; provider_id: string; shipping_option_id: string | null; metadata: Record<string, unknown> | null; … }
```

Order list: `GET /store/orders` returns `{ orders: StoreOrder[]; limit; offset; count }`. Order status filter: `status?: string | string[]`.

Sample (the preview order from `src/lib/orders/preview.ts`, abridged):

```jsonc
{
  "order": {
    "id": "order_01JAXORDER00000000000001", "version": 1,
    "display_id": 1042, "custom_display_id": "DP1042",
    "status": "pending", "payment_status": "captured", "fulfillment_status": "not_fulfilled",
    "email": "asha@example.com", "currency_code": "inr",
    "region_id": "reg_01JAXINDIA00000000000001", "customer_id": null,
    "items": [
      { "id": "ordli_01…", "title": "Neem & Tea Tree Face Wash", "product_title": "Neem & Tea Tree Face Wash", "product_handle": "neem-tea-tree-face-wash",
        "variant_title": "Default Title", "thumbnail": "https://media.dpetals.example/files/face_wash_with_props.png",
        "quantity": 2, "unit_price": 250, "is_tax_inclusive": true, "total": 500 },
      { "id": "ordli_02…", "title": "Rose Mint Aloe Vera Gel", "product_title": "Rose Mint Aloe Vera Gel", "product_handle": "rose-mint-aloe-vera-gel",
        "variant_title": "Default Title", "thumbnail": "https://media.dpetals.example/files/rosemint_aloevera_with_probs.png",
        "quantity": 1, "unit_price": 250, "is_tax_inclusive": true, "total": 250 }
    ],
    "shipping_address": { "first_name": "Asha", "last_name": "Patel", "address_1": "12 Rose Lane, Satellite", "address_2": "",
                          "city": "Ahmedabad", "province": "Gujarat", "postal_code": "380015", "country_code": "in", "phone": "9876543210" },
    "billing_address":  { "first_name": "Asha", "last_name": "Patel", "address_1": "12 Rose Lane, Satellite", "address_2": "",
                          "city": "Ahmedabad", "province": "Gujarat", "postal_code": "380015", "country_code": "in", "phone": "9876543210" },
    "shipping_methods": [{ "name": "Standard shipping", "amount": 0, "total": 0 }],
    "payment_collections": [{ "status": "completed", "payments": [{ "provider_id": "pp_razorpay_razorpay", "amount": 750 }] }],
    "item_total": 750, "item_subtotal": 635.59, "discount_total": 0, "shipping_total": 0, "tax_total": 114.41, "subtotal": 635.59, "total": 750,
    "created_at": "2026-10-03T09:30:00.000Z"
  }
}
```

### 3.7 `StoreCustomer` and addresses

```ts
interface StoreCustomer {
  id: string; email: string;
  first_name: string | null; last_name: string | null; company_name: string | null;
  phone?: string | null;
  default_billing_address_id: string | null; default_shipping_address_id: string | null;
  addresses: StoreCustomerAddress[];
  metadata?: Record<string, unknown>;
  deleted_at?: Date | string | null; created_at?: Date | string; updated_at?: Date | string;
}
interface StoreCustomerAddress {
  id: string; address_name: string | null;
  is_default_shipping: boolean; is_default_billing: boolean;
  customer_id: string; company: string | null;
  first_name: string | null; last_name: string | null;
  address_1: string | null; address_2: string | null; city: string | null;
  country_code: string | null; province: string | null; postal_code: string | null; phone: string | null;
  metadata: Record<string, unknown> | null; created_at: string; updated_at: string;
}
```

Payloads: `StoreCreateCustomer { email?, company_name?, first_name?, last_name?, phone? }`, `StoreUpdateCustomer` (same without `email`), `StoreCreateCustomerAddress` / `StoreUpdateCustomerAddress { address_name?, is_default_shipping?, is_default_billing?, company?, first_name?, last_name?, address_1?, address_2?, city?, country_code?, province?, postal_code?, phone?, metadata? }`.

Sample:

```json
{ "customer": {
  "id": "cus_01JAXCUST00000000000001", "email": "asha@example.com",
  "first_name": "Asha", "last_name": "Patel", "phone": "9876543210", "company_name": null,
  "default_shipping_address_id": "cuaddr_01…", "default_billing_address_id": null,
  "addresses": [{
    "id": "cuaddr_01JAXADDR00000000000001", "address_name": null,
    "is_default_shipping": true, "is_default_billing": false, "customer_id": "cus_01JAXCUST00000000000001", "company": null,
    "first_name": "Asha", "last_name": "Patel", "address_1": "12 Rose Lane, Satellite", "address_2": "",
    "city": "Ahmedabad", "province": "Gujarat", "postal_code": "380015", "country_code": "in", "phone": "9876543210",
    "metadata": null, "created_at": "2026-10-03T09:30:00.000Z", "updated_at": "2026-10-03T09:30:00.000Z"
  }]
} }
```

### 3.8 `StoreRegion`

```ts
interface StoreRegion {
  id: string; name: string; currency_code: string; automatic_taxes?: boolean;
  countries?: { id: string; iso_2?: string; iso_3?: string; num_code?: string; name?: string; display_name?: string }[];
  payment_providers?: { id: string }[];
  metadata?: Record<string, any> | null; created_at?: string; updated_at?: string;
}
```
```json
{ "regions": [{ "id": "reg_01JAXINDIA00000000000001", "name": "India", "currency_code": "inr", "automatic_taxes": true,
                "countries": [{ "iso_2": "in", "iso_3": "ind", "name": "INDIA", "display_name": "India" }] }],
  "count": 1, "offset": 0, "limit": 50 }
```

---

## 4. Crosswalk: local storefront structure to Medusa

Columns: **Local field** (name), **Type** (local TypeScript), **Local sample** (from the local data), **Medusa path**, **Medusa type**, **Transform**.

"Product" means the `StoreProduct` from 3.1, "variant0" is `product.variants[0]`.

### 4.1 `ProductSummary` (card, rails, search, grids)

| Local field | Type | Local sample | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `handle` | `string` | `"neem-tea-tree-face-wash"` | `product.handle` | `string` | none |
| `title` | `string` | `"Neem & Tea Tree Face Wash"` | `product.title` | `string` | none |
| `image.src` | `string` | `"files/face_wash_with_props.png"` | `product.thumbnail` | `string \| null` | Remove media base URL; fall back to `images[0].url` |
| `image.alt` | `string` | `"Neem & Tea Tree Face Wash"` | `product.metadata.cardImageAlt` | `unknown` | Default to `product.title` |
| `subtitle` | `string` | `"Face Wash · 120 ml"` | `product.metadata.cardSubtitle` | `unknown` | Cast to string; never derive |
| `price` | `number` | `250` | `variant0.calculated_price.calculated_amount` | `number \| null` | `?? 0` |
| `mrp` | `number` | `499` | `variant0.metadata.mrp` | `unknown` | `Number(...)`, default `price` |
| `currency` | `string` | `"INR"` | `variant0.calculated_price.currency_code` | `string \| null` | Upper-case |
| `isNew` | `boolean` | `true` | `product.metadata.isNew` | `unknown` | `=== true` |
| `rating` | `{ average: number; count: number } \| null` | `{ "average": 4.89, "count": 9 }` | `product.metadata.rating` | `unknown` | Pass through, else `null` |

### 4.2 `ProductDetail` (product page)

Top level:

| Local field | Type | Local sample | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `handle` | `string` | `"neem-tea-tree-face-wash"` | `product.handle` | `string` | none |
| `seoTitle` | `string` | `"Neem & Tea Tree Face Wash for Acne-Prone Skin \| DPetals"` | `product.metadata.seoTitle` | `unknown` | Default `"<title> \| DPetals"` |
| `seoDescription` | `string \| null` | `"Gentle SLS-free face wash …"` | `product.metadata.seoDescription` | `unknown` | `?? null` |
| `badges` | `{ tone: "new"\|"off"\|"tag"\|"save"; label: string }[]` | `[{ "tone": "new", "label": "NEW" }]` | `product.metadata.badges` | `unknown` | Pass through, default `[]` |
| `title` | `string` | `"Neem & Tea Tree Face Wash"` | `product.title` | `string` | none |
| `subtitle` | `string \| null` | `"For clearer, calmer, acne-prone skin — without the tightness."` | `product.subtitle` | `string \| null` | none |
| `rating` | `{ average: number; count: number } \| null` | `null` | `product.metadata.rating` | `unknown` | as in 4.1 |
| `netQty` | `string \| null` | `"120 ml"` | `product.metadata.netQty` | `unknown` | `?? null` |
| `taxNote` | `string \| null` | `"MRP inclusive of all taxes"` | `product.metadata.taxNote` | `unknown` | `?? null` |
| `offer` | `string \| null` | `"🏷️ Extra 10% off your first order with code FIRSTTIMEOFFER"` | `product.metadata.offer` | `unknown` | `?? null` |
| `options` | `{ name: string; values: string[] }[]` | `[]` (Cucumber gel: `[{ "name": "Size", "values": ["200gms","500gms"] }]`) | `product.options[]` → `title`, `values[].value` | `StoreProductOption[]` | Return `[]` when the only option is `Title` / `Default Title`; else `{ name: option.title, values: option.values.map(v => v.value) }` |
| `variants` | `ProductVariant[]` | see 4.3 | `product.variants` | `StoreProductVariant[]` | see 4.3 |
| `currency` | `string` | `"INR"` | `variant0.calculated_price.currency_code` | `string \| null` | Upper-case |
| `media` | `ProductMedia[]` | see below | `product.images`, `product.metadata.videos` | `StoreProductImage[]`, `unknown` | see below |
| `trust` | `{ icon: string; label: string }[]` | `[{ "icon": "https://dpetals.com/cdn/shop/files/pure-water.svg", "label": "Pure & Natural" }]` | `product.metadata.trust` | `unknown` | Pass through |
| `accordions` | `ProductAccordion[]` | Description (html) + Additional information (rows) | `product.description`, `product.metadata.additionalInfo` | `string \| null`, `unknown` | Build `[ { kind: "html", title: "Description", open: true, html: description }, { kind: "rows", ...additionalInfo } ]` |
| `sections` | `ProductSection[]` | six typed blocks | `product.metadata.sections` | `unknown` | Pass through (validated) |
| `crossSell` | `{ handle: string; title: string } \| null` | `null` or `{ "handle": "rose-water-multani-mitti-face-pack-combo", "title": "Rose Water & Multani Mitti Face Pack Combo" }` | `product.metadata.crossSellHandle` | `unknown` | Look up the target product's title |
| `related` | `{ title: string; subtitle: string \| null; handles: string[] } \| null` | `{ "title": "Complete the routine", "subtitle": "Pairs beautifully with:", "handles": ["ayurvedic-hair-mask", …] }` | `product.metadata.related` | `unknown` | Pass through |
| `showBlog` | `boolean` | `true` | `product.metadata.showBlog` | `unknown` | `=== true` |

Media:

| Local field | Type | Local sample | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `media[].type` | `"image" \| "video"` | `"image"` | n/a | | `"image"` for each `images[]`; `"video"` for each `metadata.videos[]` |
| `media[].src` (image) | `string` (absolute) | `"https://dpetals.com/cdn/shop/files/face_wash_with_props.png"` | `product.images[].url` | `string` | Order by `rank` |
| `media[].src` (video poster) | `string` (absolute) | `"https://dpetals.com/cdn/shop/files/preview_images/d1f3….thumbnail.0000000000.jpg"` | `product.metadata.videos[].src` | `unknown` | Insert at `videos[].position` |
| `media[].video` | `string` (absolute) | `"https://dpetals.com/cdn/shop/videos/c/vp/d1f3…/….mp4"` | `product.metadata.videos[].video` | `unknown` | none |

### 4.3 `ProductVariant`

| Local field | Type | Local sample | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `id` | `string` | `"44198485557388"` | `variant.id` | `string` | Becomes `variant_01…`. Old id kept in `variant.metadata.legacyId` |
| `title` | `string` | `"Default Title"` / `"200gms"` | `variant.title` | `string \| null` | `?? "Default Title"` |
| `options` | `string[]` | `["Default Title"]` / `["200gms"]` | `variant.options[].value` | `StoreProductOptionValue[]` | Map to values, same order as product `options` |
| `price` | `number` | `250` | `variant.calculated_price.calculated_amount` | `number \| null` | `?? 0` |
| `compareAtPrice` | `number \| null` | `499` (Cucumber 200gms: `399`) | `variant.metadata.mrp` | `unknown` | `Number(...)` or `null` |
| `available` | `boolean` | `true` | `variant.inventory_quantity`, `manage_inventory`, `allow_backorder` | `number \| null`, `boolean \| null`, `boolean \| null` | `manage_inventory === false \|\| allow_backorder === true \|\| (inventory_quantity ?? 0) > 0` |
| `imageFile` | `string \| null` | `"AloeCucumGelStoreListing_1.jpg"` | `variant.metadata.imageFile` | `unknown` | `?? null` |

### 4.4 Price, MRP and the cart "compare at" value

Two ways to hold the MRP. The data contract chose **A**; **B** is native.

| | A. `variant.metadata.mrp` (chosen) | B. Sale price list |
|---|---|---|
| Product price | `calculated_price.calculated_amount` = selling price (250) | Same |
| MRP | `variant.metadata.mrp` (499) | `calculated_price.original_amount` (499) |
| Cart line MRP | `item.variant.metadata.mrp` (request `+items.variant.metadata`) | `item.compare_at_unit_price` (499), native |
| Admin effort | One metadata key per variant | A permanent price list with 29 prices, plus a base price of ₹499 |
| Risk | Not available if `variant.metadata` is not requested | Promotion and price list rules interact with the permanent sale |

### 4.5 `CollectionRecord`, `CollectionPage`, `CollectionIndexEntry`

| Local field | Type | Local sample | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `handle` | `string` | `"bestsellers"` | `category.handle` | `string` | none |
| `title` | `string` | `"Best Sellers"` | `category.name` | `string` | none |
| `seoTitle` | `string` | `"Best Sellers \| DPetals"` | `category.metadata.seoTitle` | `unknown` | Default `"<name> \| DPetals"` |
| `intro` | `string \| null` | `"Discover DPetals Bestsellers – …"` | `category.description` | `string` | `"" → null` |
| `image` | `{ src: string; alt: string } \| undefined` | `{ "src": "files/face_wash_with_props.png", "alt": "Best Sellers" }` | `category.metadata.image` | `unknown` | Pass through; absent for `all` |
| `productHandles` | `string[]` | `["neem-tea-tree-face-wash", …]` (16) | `category_product_position` rows | custom | Ordered by `position` |
| `CollectionPage.products` | `ProductSummary[]` | 24 per page | products in the category | `StoreProduct[]` | Map each as 4.1 |
| `CollectionPage.page` | `number` | `1` | request `page` | | echo |
| `CollectionPage.pageCount` | `number` | `1` (16 products) | `ceil(count / 24)` | | `max(1, …)` |
| `CollectionPage.totalProducts` | `number` | `16` | `count` | `number` | none |
| `CollectionIndexEntry.productCount` | `number` | `16` | count of category products | | none |

### 4.6 `CartLine`

| Local field | Type | Local sample | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `variantId` | `string` | `"44198485557388"` | `item.variant_id` | `string \| undefined` | none |
| `handle` | `string` | `"neem-tea-tree-face-wash"` | `item.product_handle` | `string \| undefined` | none |
| `title` | `string` | `"Neem & Tea Tree Face Wash"` | `item.product_title` | `string \| undefined` | `?? item.title` |
| `variantTitle` | `string \| null` | `null` (Cucumber: `"500gms"`) | `item.variant_title` | `string \| undefined` | `null` when `"Default Title"` or the product has no real option |
| `image` | `string` | `"https://dpetals.com/cdn/shop/files/face_wash_with_props.png"` | `item.thumbnail` | `string \| undefined` | `?? ""` |
| `imageAlt` | `string` | `"Cucumber Aloe Vera Gel - 500gms"` | built | | `variantTitle ? title + " - " + variantTitle : title` |
| `unitPrice` | `number` | `250` | `item.unit_price` | `number` | none |
| `compareAtPrice` | `number \| null` | `499` | `item.variant.metadata.mrp` (A) or `item.compare_at_unit_price` (B) | `unknown` / `number \| undefined` | `Number(...)` or `null` |
| `unitMeasure` | `{ amount: number; unit: string } \| null \| undefined` | `{ "amount": 120, "unit": "ml" }` | `item.product.metadata.netQty` | `unknown` | Regex `/^(\d+(?:\.\d+)?)\s*(ml\|g)$/i`; only when the product has no options |
| `quantity` | `number` | `2` | `item.quantity` | `number` | none |

### 4.7 `CartSummary` and cart-level values

| Local field | Type | Local sample (2 × Neem) | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `currency` | `string` | `"INR"` | `cart.currency_code` | `string` | Upper-case |
| `itemCount` | `number` | `2` | `cart.items[].quantity` | `number` | Sum |
| `listSubtotal` | `number` | `500` | `cart.original_item_total` | `number` | Tax-inclusive selling-price total **before** promotions. Do **not** use `item_subtotal` (423.73, ex-tax). **VERIFY** |
| `mrpSubtotal` | `number` | `998` | `items[].variant.metadata.mrp × quantity` | | Sum, default to `unit_price` |
| `tierDiscountPercent` | `number` | `0` | `cart.promotions[]` where `code` starts `REWARD-` → `application_method.value` | `string` | `Number(value)`, else `0` |
| `tierDiscount` | `number` | `0` | `cart.discount_total` attributed to the `REWARD-*` promotion (`items[].adjustments[]` with that `code`) | `number` | Sum of adjustment amounts |
| `subtotal` | `number` | `500` | `cart.item_total` | `number` | After discounts, tax-inclusive |
| `savedVsMrp` | `number` | `498` | computed | | `mrpSubtotal − subtotal` |
| `couponCode` (cart wrapper) | `string` | `"FIRSTTIMEOFFER"` | `cart.promotions[]` where `is_automatic !== true` → `code` | `string \| undefined` | First manual code, else `""` |
| Shipping text | derived | `"Free"` | `GET /store/shipping-options` → `amount`, or `cart.shipping_total` | `number` | `0` → `"Free"`; positive → the price; no address yet → `"Enter shipping address"` |
| Free-shipping flag | `boolean` | `true` (500 ≥ 500) | shipping option `amount === 0` | | Matches `summary.subtotal >= 500` |

### 4.8 Checkout: `AddressValues` and `CheckoutValues`

| Local field | Type | Local sample | Medusa path (cart / order / customer address) | Medusa type | Transform |
|---|---|---|---|---|---|
| `shipping.firstName` | `string` | `"Asha"` | `first_name` | `string \| undefined` | `?? ""` |
| `shipping.lastName` | `string` | `"Patel"` | `last_name` | `string \| undefined` | `?? ""` |
| `shipping.address1` | `string` | `"12 Rose Lane, Satellite"` | `address_1` | `string \| undefined` | `?? ""` |
| `shipping.address2` | `string` | `""` | `address_2` | `string \| undefined` | `?? ""` |
| `shipping.city` | `string` | `"Ahmedabad"` | `city` | `string \| undefined` | `?? ""` |
| `shipping.state` | `string` | `"Gujarat"` | `province` | `string \| undefined` | `?? ""` (name, not ISO code) |
| `shipping.pin` | `string` | `"380015"` | `postal_code` | `string \| undefined` | `?? ""` |
| `shipping.phone` | `string` | `"9876543210"` | `phone` | `string \| undefined` | `?? ""` |
| `country` | `"India"` | `"India"` | `country_code` | `string \| undefined` | `"in"` ↔ `"India"` |
| `contact` | `string` | `"asha@example.com"` | `cart.email` | `string \| undefined` | none (see decision D3) |
| `billingSame` | `boolean` | `true` | `billing_address` equal to `shipping_address` | | Compare the address fields; send the same address when true |
| `billing.*` | `AddressValues` | empty when `billingSame` | `billing_address.*` | as above | as above |
| `payment` | `"razorpay" \| "phonepe"` | `"razorpay"` | `payment_session.provider_id` | `string` | Map: `razorpay` → `pp_razorpay_razorpay`, `phonepe` → `pp_phonepe_phonepe` |
| `emailOffers` | `boolean` | `true` | `cart.metadata.emailOffers` | `unknown` | pass |
| `textOffers` | `boolean` | `false` | `cart.metadata.textOffers` | `unknown` | pass |
| `saveInfo` | `boolean` | `false` | `cart.metadata.saveInfo` | `unknown` | When true and signed in, create a customer address |
| `PlaceOrderResult.status = "redirect"` | `{ status; url: string }` | n/a | `payment_session.data` | `Record<string, unknown>` | Provider-specific key holding the redirect URL (**VERIFY** per plugin) |
| `PlaceOrderResult.status = "placed"` | `{ status; order: Order }` | n/a | `StoreCompleteCartResponse` with `type: "order"` | | Map `order` as 4.10 |
| `PlaceOrderResult.status = "unavailable"` | `{ status; message: string }` | n/a | `StoreCompleteCartResponse` with `type: "cart"` → `error.message` | `string` | pass |

### 4.9 `AccountSession` and `SavedAddress`

| Local field | Type | Local sample | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `AccountSession.email` | `string` | `"asha@example.com"` | `customer.email` | `string` | none |
| `AccountSession.firstName` | `string` | `"Asha"` | `customer.first_name` | `string \| null` | `?? ""` |
| `AccountSession.lastName` | `string` | `"Patel"` | `customer.last_name` | `string \| null` | `?? ""` |
| `AccountSession.phone` | `string` | `"9876543210"` | `customer.phone` | `string \| null \| undefined` | `?? ""` |
| `SavedAddress.id` | `string` | `"addr_lm3k2"` | `address.id` | `string` | none |
| `SavedAddress.firstName` | `string` | `"Asha"` | `address.first_name` | `string \| null` | `?? ""` |
| `SavedAddress.lastName` | `string` | `"Patel"` | `address.last_name` | `string \| null` | `?? ""` |
| `SavedAddress.address1` | `string` | `"12 Rose Lane, Satellite"` | `address.address_1` | `string \| null` | `?? ""` |
| `SavedAddress.address2` | `string` | `""` | `address.address_2` | `string \| null` | `?? ""` |
| `SavedAddress.city` | `string` | `"Ahmedabad"` | `address.city` | `string \| null` | `?? ""` |
| `SavedAddress.state` | `string` | `"Gujarat"` | `address.province` | `string \| null` | `?? ""` |
| `SavedAddress.pin` | `string` | `"380015"` | `address.postal_code` | `string \| null` | `?? ""` |
| `SavedAddress.phone` | `string` | `"9876543210"` | `address.phone` | `string \| null` | `?? ""` |
| `SavedAddress.isDefault` | `boolean` | `true` | `address.is_default_shipping` | `boolean` | none |

### 4.10 `Order`, `OrderLine`, `OrderAddress`

| Local field | Type | Local sample | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `id` | `string` | `"preview"` | `order.id` | `string` | none |
| `number` | `string` | `"DP1042"` | `order.custom_display_id` | `string \| undefined` | `?? "DP" + order.display_id` |
| `placedAt` | `string` (ISO) | `"2026-10-03T09:30:00.000Z"` | `order.created_at` | `string \| Date` | `new Date(...).toISOString()` |
| `status` | `"processing" \| "shipped" \| "delivered" \| "cancelled"` | `"processing"` | `order.status`, `order.fulfillment_status` | `string`, enum | `status === "canceled"` → `cancelled`; `delivered` → `delivered`; `shipped` or `partially_shipped` → `shipped`; else `processing` |
| `currency` | `string` | `"INR"` | `order.currency_code` | `string` | Upper-case |
| `email` | `string` | `"asha@example.com"` | `order.email` | `string \| null` | `?? ""` |
| `subtotal` | `number` | `750` | `order.original_item_total` | `number` | Tax-inclusive items before discounts |
| `discount` | `number` | `0` | `order.discount_total` | `number` | none |
| `shippingTotal` | `number` | `0` | `order.shipping_total` | `number` | none |
| `total` | `number` | `750` | `order.total` | `number` | none (equals `subtotal − discount + shippingTotal`) |
| `shippingMethod` | `string` | `"Standard shipping"` | `order.shipping_methods[0].name` | `string` | `?? ""` |
| `paymentMethod` | `string` | `"Razorpay Secure (UPI, Card, Int'l Card, Apple Pay)"` | `order.payment_collections[0].payments[0].provider_id` | `string` | Look up the display label for the provider id |
| `shippingAddress` / `billingAddress` | `OrderAddress` | see 4.9 without `id`, `isDefault` | `order.shipping_address` / `billing_address` | `StoreOrderAddress \| null` | As 4.9 |
| `lines[].title` | `string` | `"Neem & Tea Tree Face Wash"` | `item.product_title` | `string \| null` | `?? item.title` |
| `lines[].variantTitle` | `string \| null` | `null` | `item.variant_title` | `string \| null` | `null` when `"Default Title"` |
| `lines[].quantity` | `number` | `2` | `item.quantity` | `number` | none |
| `lines[].image` | `string` | `"https://dpetals.com/cdn/shop/files/face_wash_with_props.png"` | `item.thumbnail` | `string \| null` | `?? ""` |
| `lines[].unitPrice` | `number` | `250` | `item.unit_price` | `number` | none |

### 4.11 `QuickViewItem` and `Suggestion`

| Local field | Type | Local sample | Medusa path | Medusa type | Transform |
|---|---|---|---|---|---|
| `handle` | `string` | `"neem-tea-tree-face-wash"` | `product.handle` | `string` | none |
| `title` | `string` | `"Neem & Tea Tree Face Wash"` | `product.title` | `string` | none |
| `description` | `string` | `"Clear skin starts here. A gentle daily cleanser … 1% h…"` | `product.description` | `string \| null` | Replace tags with spaces, decode `&amp; &lt; &gt; &quot; &#39; &nbsp;`, cut at 160 characters, append `"…"` |
| `image` | `string` | `"https://dpetals.com/cdn/shop/files/face_wash_with_props.png"` | `product.images[0].url` | `string` | none |
| `price` | `number` | `250` | `variant0.calculated_price.calculated_amount` | `number \| null` | as 4.1 |
| `compareAtPrice` | `number \| null` | `499` | `variant0.metadata.mrp` | `unknown` | as 4.3 |
| `currency` | `string` | `"INR"` | `calculated_price.currency_code` | `string \| null` | Upper-case |
| `available` | `boolean` | `true` | variant0 stock fields | | as 4.3 |
| `line` | `CartLineInput` | see 4.6 | variant0 + product | | as 4.6 without `quantity` |
| `Suggestion.{handle,title,image,price,mrp,currency}` | see 4.1 | | | | `ProductSummary` fields, max 7 |

### 4.12 `Region` and static values

| Local value | Type | Local sample | Medusa path | Transform |
|---|---|---|---|---|
| Currency used in all formatting | `string` | `"INR"` | `region.currency_code` | Upper-case |
| `INDIAN_STATES` | `readonly string[]` (36) | `"Gujarat"` | none (static) | Not fetched from Medusa; the region's `countries` only lists `in` |
| `REWARD_TIERS`, `FREE_SHIPPING_THRESHOLD` | constants | `500`, `1000`, … | promotions and shipping option price rule | Backend spec 4.2 and 4.3 |
| `MAX_QUANTITY_PER_VARIANT` | `number` | `50` | `min(variant.inventory_quantity, 50)` | Backend spec 6.7 |

---

## 5. Query recipes

The exact calls for each storefront page. `R` is the India region id.

| Page / feature | Call | `fields` / params |
|---|---|---|
| Product page | `GET /store/products` | `handle=<h>&region_id=R&fields=id,handle,title,subtitle,description,thumbnail,+metadata,*images,*options,*options.values,*variants,*variants.options,+variants.metadata,*variants.calculated_price,+variants.inventory_quantity,*categories` |
| Product static params | `GET /store/products` | `fields=handle&limit=100&offset=…` (loop until `offset + limit >= count`) |
| Related products | `GET /store/products` | `handle=a&handle=b&handle=c&region_id=R&fields=handle,title,subtitle,thumbnail,+metadata,*variants.calculated_price,+variants.metadata` |
| Quick view | `GET /store/products` | `handle=<h>&region_id=R&fields=handle,title,description,thumbnail,*images,+metadata,*variants.options,*variants.calculated_price,+variants.metadata,+variants.inventory_quantity` |
| Search | `GET /store/products` | `q=<query>&region_id=R&limit=50&fields=` as related products |
| Collections index | `GET /store/product-categories` | `fields=handle,name,description,+metadata&limit=100` |
| Collection page | custom | `GET /store/dp/collections/<h>/products?page=<n>&limit=24&region_id=R` |
| Cart load | `GET /store/carts/<id>` | `fields=id,email,currency_code,+items.*,+items.variant.metadata,+items.variant.inventory_quantity,+items.product.handle,+items.product.metadata,+items.adjustments,*promotions,*shipping_methods,*shipping_address,*billing_address,original_item_total,item_total,discount_total,shipping_total,tax_total,total` |
| Add to cart | `POST /store/carts/<id>/line-items` | body `{ "variant_id": "variant_01…", "quantity": 1 }` |
| Change quantity | `POST /store/carts/<id>/line-items/<lineId>` | body `{ "quantity": 3 }` |
| Remove line | `DELETE /store/carts/<id>/line-items/<lineId>` | none |
| Apply / remove code | `POST` / `DELETE /store/carts/<id>/promotions` | body `{ "promo_codes": ["FIRSTTIMEOFFER"] }` |
| Set contact and address | `POST /store/carts/<id>` | body `{ "email": "…", "shipping_address": { "first_name": "…", "last_name": "…", "address_1": "…", "address_2": "…", "city": "…", "province": "Gujarat", "postal_code": "380015", "country_code": "in", "phone": "…" }, "billing_address": { … }, "metadata": { "emailOffers": true, "textOffers": false, "saveInfo": false } }` |
| Shipping options | `GET /store/shipping-options` | `cart_id=<id>` |
| Choose shipping | `POST /store/carts/<id>/shipping-methods` | body `{ "option_id": "so_01…" }` |
| Start payment | `POST /store/payment-collections`, then `POST /store/payment-collections/<pcId>/payment-sessions` | bodies `{ "cart_id": "<id>" }`, `{ "provider_id": "pp_razorpay_razorpay" }` |
| Complete | `POST /store/carts/<id>/complete` | none |
| Confirmation | `GET /store/orders/<id>` | `fields=id,display_id,custom_display_id,created_at,status,fulfillment_status,payment_status,currency_code,email,*items,*shipping_address,*billing_address,*shipping_methods,*payment_collections.payments,original_item_total,discount_total,shipping_total,total` |
| Sign in | `POST /auth/customer/<provider>` then `GET /store/customers/me` | body `{ "email": "…" }` (+ `password` or `code` per provider) |
| Profile | `GET`/`POST /store/customers/me` | body `{ "first_name", "last_name", "phone" }` |
| Addresses | `GET /store/customers/me/addresses`; `POST` and `DELETE …/:id` | body as `StoreCreateCustomerAddress` |
| Orders | `GET /store/orders` | `order=-created_at&limit=20&fields=` as confirmation |

---

## 6. Worked example: one record, Medusa to storefront

The Cucumber gel product (the only multi-variant one). Left: the Medusa variant data. Right: the local type the UI receives.

| Medusa variant (`StoreProductVariant`) | → | Local `ProductVariant` |
|---|---|---|
| `id: "variant_01JAXCUC200000000000001"` | → | `id: "variant_01JAXCUC200000000000001"` (was `"43252905345164"`) |
| `title: "200gms"` | → | `title: "200gms"` |
| `options: [{ value: "200gms", option_id: "opt_size" }]` | → | `options: ["200gms"]` |
| `calculated_price.calculated_amount: 250` | → | `price: 250` |
| `metadata.mrp: 399` | → | `compareAtPrice: 399` |
| `inventory_quantity: 50`, `manage_inventory: true` | → | `available: true` |
| `metadata.imageFile: "AloeCucumGelStoreListing_1.jpg"` | → | `imageFile: "AloeCucumGelStoreListing_1.jpg"` |
| `calculated_price.calculated_amount: 350` (500gms) | → | `price: 350` |

Order of `ProductDetail.options[0].values` (`["200gms","500gms"]`) and `variants[i].options[0]` must match, since the UI selects by position.

---

## 7. Known mismatches and risks

| # | Issue | Effect | Action |
|---|---|---|---|
| 1 | **Tax-inclusive pricing vs the promotion rule attribute.** With 18% GST included, a ₹1000 cart has `item_subtotal` 847.46 and `item_total` 1000. A rule on `item_subtotal >= 1000` would only unlock at ₹1180. A rule on `item_total` could flip off after the discount applies (1000 → 900) | The 10/15/20% tiers may unlock at the wrong amounts or flicker | Test with real carts at 999/1000/1500/2000. If no cart attribute is stable, compute the tier in a cart workflow hook from `original_item_total` and apply `REWARD-*` explicitly. Documented attributes are `item_subtotal`, `subtotal`, `item_total`, `total` (**Docs**) |
| 2 | Medusa `variant_title` for default variants is `"Default Title"` | The UI would show it as a variant label | Return `null` when the product has only the `Title` option |
| 3 | Many local fields are `string`, Medusa gives `string \| null` | Components render `null` | Serializer applies `?? ""`, listed in the transform columns |
| 4 | `metadata` is `Record<string, unknown>` | No type safety from Medusa | Validate with Zod from the shared contract types before returning |
| 5 | `Order.paymentMethod` is a label, Medusa gives a provider id | Needs a lookup | Keep a map of provider id to display label in the backend config |
| 6 | Promotion `application_method.value` is a string | Percent needs a number | `Number(...)` |
| 7 | Cart responses return the discount per line adjustment; `discount_total` also includes any manual coupon | `tierDiscount` could include the coupon | Sum only adjustments whose `code` starts with `REWARD-` |
| 8 | Guest order retrieval is documented as supported (**Docs**), but the response contains the full order | Order id is the only protection | Consider a signed token (backend spec 7.7) |
| 9 | `inventory_quantity` only appears with the right sales channel and stock location link | `available` would always be false | Link the stock location to the sales channel; test in the Phase 1 acceptance run |
| 10 | The custom `email-otp` auth flow does not match `sdk.auth.login` exactly (two steps) | Sign-in form needs a code step | Decide D1 first; if OTP, add a code field to `SignInForm` or keep one-step via a custom route |

---

## 8. Medusa endpoints the storefront does not need

Product options list/retrieve, collections list/retrieve (we use categories), shipping option calculate, order transfers, locales, MFA and verification routes under `/auth`. Reserved for later: order transfer, returns, gift cards, locales, if the business asks.
