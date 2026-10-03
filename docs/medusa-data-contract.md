# DPetals — Storefront Data Structures and the Medusa Data Contract

This document lists **every data structure the local storefront uses today**, with real sample records, and defines how Medusa stores and returns **the same structure**. The goal: when the backend goes live, the storefront components receive exactly the objects they receive now, so the UI does not change.

Companion to [medusa-backend-spec.md](medusa-backend-spec.md), which covers setup, decisions, custom modules and the endpoint catalogue. Where the two differ on **names of metadata keys or response shapes, this document wins** (see section 2.1).

- **Source of truth for shapes:** `src/types/*.ts` and the exported constants in `src/lib/data/*.ts`. Sample records below are copied from those files (long text shortened with `…`).
- **Dataset size today:** 28 products (29 variants), 28 card summaries, 17 collections, 5 content pages, 4 articles, 1 coupon.

---

## 1. Principles

1. **The storefront type is the API contract.** Backend responses are typed exactly like `ProductSummary`, `ProductDetail`, `CollectionPage`, `CartLine`, `Order` and so on. No new field names, no renamed fields, no snake_case in responses.
2. **Medusa native entities are the storage.** Products, variants, prices, inventory, categories, carts, customers and orders live in Medusa's own tables. Anything Medusa has no column for goes in `metadata` using the **same camelCase key names as the storefront type** (for example `metadata.netQty`, not `net_qty`).
3. **A serializer layer does the translation.** The backend exposes custom store routes under `/store/dp/*` that read Medusa entities and return the storefront shapes. Native Medusa routes are used for writes (cart lines, customer, addresses). The storefront's `src/lib/medusa/` only fetches and passes data through; it needs no mapping code.
4. **Share the types.** Copy `src/types/*.ts` into the backend as a package (for example `@dpetals/contracts`) and have each serializer return those types. A contract test (section 9) fails the build when a response drifts.
5. **Additive changes only.** The few places where the storefront needs one more field than it has today are listed in section 8 and are all optional additions.

---

## 2. Conventions

### 2.1 Naming and precedence

Earlier draft key names in `medusa-backend-spec.md` section 5.2 (`net_qty`, `seo_title`, `offer_text`, `card_label`, …) are **replaced** by the camelCase names in section 4 of this document.

### 2.2 Primitive conventions

| Topic | Local storefront | Medusa side |
|---|---|---|
| Money | Number in **major units** (`250`, `499`, `1499.5`) | Medusa v2 stores major units too. No conversion |
| Currency | `"INR"` upper case (`currency` fields) | Medusa uses `"inr"`. Serializer upper-cases |
| Handles | URL slugs, e.g. `neem-tea-tree-face-wash`. Stable key everywhere | `product.handle`, `category.handle`. Keep identical |
| Variant id | Shopify numeric string, e.g. `"44198485557388"` | `variant_01…`. Store the old one in `variant.metadata.legacyId` |
| Dates | ISO 8601 strings (`placedAt`) | `created_at` |
| Empty values | `null` for "not present" (`subtitle`, `rating`, `compareAtPrice`, `crossSell`, …) | Serializer returns `null`, never `undefined` or `""` |
| HTML | Trusted markup strings (`html`, `answerHtml`, `summaryHtml`, `footnoteHtml`) | Sanitise on save, return as-is |

### 2.3 Image paths: two kinds

The data uses **two different forms** and the components depend on which one a field has. `cdn(path)` in `src/lib/cdn.ts` prefixes `https://dpetals.com/cdn/shop/` blindly, so it must not receive an absolute URL.

| Kind | Looks like | Fields | Rule |
|---|---|---|---|
| **Relative** (passed through `cdn()`) | `files/face_wash_with_props.png`, `collections/Hair_Pack.png`, `articles/out-0.png` | `ProductSummary.image.src`, `CollectionRecord.image.src`, every `CdnImage` / `SizedImage` in the home data (`src`, `poster`), `Article.image.src`, `valueCards[].src` | Backend returns the **path relative to the media base URL**. `CDN_BASE` then becomes `NEXT_PUBLIC_MEDIA_BASE_URL` |
| **Absolute** (used directly) | `https://dpetals.com/cdn/shop/files/face_wash_with_props.png` | `ProductDetail.media[].src`, `media[].video`, `trust[].icon`, ingredients `items[].image`, steps `items[].image`, `CartLine.image`, `QuickViewItem.image`, `OrderLine.image`; reel `video` | Backend returns absolute URLs |

Medusa stores one absolute URL per file (`product.images[].url`, `product.thumbnail`). The serializer strips the media base URL to produce the relative form where the table says relative. Optional later cleanup: make `cdn()` pass absolute URLs through unchanged, then every field can be absolute.

---

## 3. Data structure catalogue

Each entry: **type** → **sample** → **Medusa storage** → **response route**.

### 3.1 Shared primitives (`src/types/home.ts`)

```ts
interface CdnImage   { src: string; alt: string }                    // src is relative (2.3)
interface SizedImage extends CdnImage { width: number; height: number }
interface LinkItem   { label: string; href: string }
type BannerTone = "sage" | "meadow" | "sand" | "mist" | "peach";
```

### 3.2 `ProductSummary`: product cards, rails, search, collection grids

Type (`src/types/home.ts`):

```ts
interface ProductSummary {
  handle: string;
  title: string;
  image: CdnImage;          // relative src
  subtitle: string;         // "Face Wash · 120 ml"
  price: number;            // selling price
  mrp: number;              // maximum retail price
  currency: string;         // "INR"
  isNew: boolean;
  rating: { average: number; count: number } | null;
}
```

Samples (`catalog` in `src/lib/data/collections.ts`, 28 records):

```json
{
  "handle": "neem-tea-tree-face-wash",
  "title": "Neem & Tea Tree Face Wash",
  "image": { "src": "files/face_wash_with_props.png", "alt": "Neem & Tea Tree Face Wash" },
  "subtitle": "Face Wash · 120 ml",
  "price": 250, "mrp": 499, "currency": "INR", "isNew": true, "rating": null
}
```
```json
{
  "handle": "cucumber-aloe-vera-gel",
  "title": "Cucumber Aloe Vera Gel",
  "image": { "src": "files/Artboard_2_copy_2.jpg", "alt": "Cucumber Aloe Vera Gel" },
  "subtitle": "· 200 g / 500 g",
  "price": 250, "mrp": 399, "currency": "INR", "isNew": false,
  "rating": { "average": 4.89, "count": 9 }
}
```

Note the second subtitle starts with `"· "`: when a product has no category label the label part is empty. Store the string **literally**; do not derive it.

| Field | Medusa source |
|---|---|
| `handle`, `title` | `product.handle`, `product.title` |
| `image.src` | `product.thumbnail` with the media base URL removed |
| `image.alt` | `product.metadata.cardImageAlt`, default `product.title` (some combos have a longer alt) |
| `subtitle` | `product.metadata.cardSubtitle` (literal string) |
| `price` | First variant's `calculated_price.calculated_amount` |
| `mrp` | First variant's `metadata.mrp`, default = `price` |
| `currency` | `calculated_price.currency_code` upper-cased |
| `isNew` | `product.metadata.isNew` |
| `rating` | `product.metadata.rating` (written by the review module) |

Routes returning it: `GET /store/dp/products?handles=a,b` (related products), the product arrays inside `CollectionPage` and `HomeContent`, and `SearchResults`.

### 3.3 `CollectionRecord`, `CollectionPage`, `CollectionIndexEntry`

Types (`src/lib/data/collections.ts`, `src/lib/collections.ts`):

```ts
interface CollectionRecord {
  handle: string;
  title: string;
  seoTitle: string;                    // full <title>
  intro: string | null;
  image?: { src: string; alt: string };   // relative src; absent for "all"
  productHandles: string[];            // ordered
}
interface CollectionPage {
  collection: CollectionRecord;
  products: ProductSummary[];          // one page, 24 per page
  page: number; pageCount: number; totalProducts: number;
}
interface CollectionIndexEntry {
  handle: string; title: string;
  image: NonNullable<CollectionRecord["image"]>;
  productCount: number;
}
```

Sample (`collections.bestsellers`; 16 handles in the real record, 3 shown):

```json
{
  "handle": "bestsellers",
  "title": "Best Sellers",
  "image": { "src": "files/face_wash_with_props.png", "alt": "Best Sellers" },
  "seoTitle": "Best Sellers | DPetals",
  "intro": "Discover DPetals Bestsellers – customer-favorite herbal & organic skincare and haircare essentials! From nourishing jojoba oil to hydrating …",
  "productHandles": ["neem-tea-tree-face-wash", "hair-nourishing-gel-mask-conditioner", "ayurvedic-hair-mask"]
}
```

The 17 collections and their product counts: `skincare` 9, `haircare` 6, `body-wash` 3, `essential-oils-for-aromatherapy` 9, `combo` 5, `bestsellers` 16, `features-at-dpetals` 4, `skin-care` 4, `all` 28 (no image), `acne-oil-control` 3, `glow-pigmentation` 4, `hair-skin` 25, `hair-fall-dandruff` 6, `hydration-dryness` 7, `relax-aromatherapy` 9, `self-care` 5, `smooth-strong` 4, `you-may-also-like` 8. Nine have `intro: null`.

Medusa storage: one **Product Category** per collection (many-to-many, because a product sits in several).

| Field | Medusa source |
|---|---|
| `handle` | `product_category.handle` |
| `title` | `product_category.name` |
| `intro` | `product_category.description` (empty means `null`) |
| `seoTitle` | `product_category.metadata.seoTitle` |
| `image` | `product_category.metadata.image` = `{ "src": "...", "alt": "..." }` (relative src) |
| `productHandles` (order matters) | Membership in the category plus `category_product_position` rows (`position` ascending). See backend spec 6.2 |

Routes: `GET /store/dp/collections/:handle/products?page=` returns `CollectionPage`; `GET /store/dp/collections` returns `CollectionIndexEntry[]` (categories with an image, sorted by title). `all` is "every published product, alphabetical".

### 3.4 `ProductDetail`: the product page

Type (`src/types/product.ts`):

```ts
interface ProductDetail {
  handle: string;
  seoTitle: string;
  seoDescription: string | null;
  badges: { tone: "new" | "off" | "tag" | "save"; label: string }[];
  title: string;
  subtitle: string | null;
  rating: { average: number; count: number } | null;
  netQty: string | null;
  taxNote: string | null;
  offer: string | null;
  options: { name: string; values: string[] }[];
  variants: ProductVariant[];
  currency: string;
  media: (
    | { type: "image"; src: string }
    | { type: "video"; src: string; video: string }      // src = poster
  )[];
  trust: { icon: string; label: string }[];
  accordions: ProductAccordion[];
  sections: ProductSection[];
  crossSell: { handle: string; title: string } | null;
  related: { title: string; subtitle: string | null; handles: string[] } | null;
  showBlog: boolean;
}
interface ProductVariant {
  id: string; title: string;
  options: string[];                // same order as ProductDetail.options
  price: number; compareAtPrice: number | null;
  available: boolean;
  imageFile: string | null;         // file name of the variant image, matched against media
}
type ProductAccordion =
  | { kind: "html"; title: string; open: boolean; html: string }
  | { kind: "rows"; title: string; open: boolean;
      rows: { label: string; value: string; href: string | null }[] };
type ProductSection =
  | { type: "ingredients"; title; subtitle: string | null;
      items: { image: string; alt: string; title: string; text: string }[]; summaryHtml: string | null }
  | { type: "benefits"; title; subtitle: string | null;
      items: { icon: BenefitIconName; text: string }[] }
  | { type: "steps"; title; subtitle: string | null;
      items: { image: string | null; number: string | null; text: string }[]; footnoteHtml: string | null }
  | { type: "purity"; title; subtitle: string | null; items: string[] }
  | { type: "comparison"; title; subtitle: string | null;
      columns: { feature: string; ours: string; theirs: string };
      rows: { feature: string; ours: string; theirs: string }[] }
  | { type: "faq"; title; subtitle: string | null;
      items: { question: string; answerHtml: string; open: boolean }[] };
type BenefitIconName = "bubbles" | "waves" | "leaf" | "drop" | "wind" | "check-circle"
  | "sparkles" | "heart" | "moon" | "shield-check" | "scalp" | "target";
```

Sample, single-variant product (`neem-tea-tree-face-wash`; long arrays shortened):

```jsonc
{
  "handle": "neem-tea-tree-face-wash",
  "seoTitle": "Neem & Tea Tree Face Wash for Acne-Prone Skin | DPetals",
  "seoDescription": "Gentle SLS-free face wash with neem, tea tree, 1% salicylic acid and 1% hyaluronic acid. …",
  "badges": [{ "tone": "new", "label": "NEW" }, { "tone": "tag", "label": "Face Wash" }],
  "title": "Neem & Tea Tree Face Wash",
  "subtitle": "For clearer, calmer, acne-prone skin — without the tightness.",
  "rating": null,
  "netQty": "120 ml",
  "taxNote": "MRP inclusive of all taxes",
  "offer": "🏷️ Extra 10% off your first order with code FIRSTTIMEOFFER",
  "options": [],
  "variants": [
    { "id": "44198485557388", "title": "Default Title", "options": ["Default Title"],
      "price": 250, "compareAtPrice": 499, "available": true, "imageFile": null }
  ],
  "currency": "INR",
  "media": [
    { "type": "image", "src": "https://dpetals.com/cdn/shop/files/face_wash_with_props.png" },
    { "type": "image", "src": "https://dpetals.com/cdn/shop/files/2_47b596ae-6db7-4550-8766-cdeb42f20e53.jpg" },
    { "type": "video",
      "src": "https://dpetals.com/cdn/shop/files/preview_images/d1f33bdfb584429f926e1c3aa0c00104.thumbnail.0000000000.jpg",
      "video": "https://dpetals.com/cdn/shop/videos/c/vp/d1f33bdfb584429f926e1c3aa0c00104/….mp4" }
    // … 5 more images (8 media items in total)
  ],
  "trust": [
    { "icon": "https://dpetals.com/cdn/shop/files/pure-water.svg", "label": "Pure & Natural" },
    { "icon": "https://dpetals.com/cdn/shop/files/high-quality.svg", "label": "Premium Quality" }
    // … 4 more
  ],
  "accordions": [
    { "kind": "html", "title": "Description", "open": true,
      "html": "<p><strong>Clear skin starts here.</strong> A gentle daily cleanser built for oily and acne-prone Indian skin. …" },
    { "kind": "rows", "title": "Additional information", "open": false,
      "rows": [
        { "label": "Manufacturer & Packer", "value": "HNCO Organics Pvt Ltd, 1-Umashiv Industrial Estate, … Ahmedabad, Gujarat 382425", "href": null },
        { "label": "Marketed & distributed by", "value": "Rich Elements Private Limited, A-204, Dev Parisar, … Ahmedabad-382421, Gujarat", "href": null },
        { "label": "Country of origin", "value": "India", "href": null },
        { "label": "Customer care", "value": "customercare@richelements.in", "href": "mailto:customercare@richelements.in" }
      ] }
  ],
  "sections": [
    { "type": "ingredients", "title": "What's inside — ingredient spotlight",
      "subtitle": "Fresh, potent botanicals and effective-strength actives.",
      "items": [{ "image": "https://dpetals.com/cdn/shop/t/20/assets/fw-ing-neem.jpg", "alt": "Neem", "title": "Neem",
                  "text": "Antibacterial botanical that helps calm acne and purify skin" } /* … */],
      "summaryHtml": "<b>Key actives:</b> Neem, Tea Tree, 1% Salicylic Acid, 1% Hyaluronic Acid · <b>Net Qty:</b> 120 ml" },
    { "type": "benefits", "title": "What it does for you", "subtitle": null,
      "items": [{ "icon": "bubbles", "text": "Controls excess oil and shine" } /* … */] },
    { "type": "steps", "title": "How to use", "subtitle": null,
      "items": [{ "image": "https://dpetals.com/cdn/shop/t/20/assets/fw-step1.jpg", "number": null,
                  "text": "Wet your face with lukewarm water" } /* … */],
      "footnoteHtml": "<b>Who it's for:</b> Oily, acne-prone, combination and sensitive skin." },
    { "type": "purity", "title": "Every DPetals promise", "subtitle": "The purity checklist behind every batch.",
      "items": ["No SLS / SLES", "No parabens" /* … */] },
    { "type": "comparison", "title": "DPetals vs ordinary products", "subtitle": null,
      "columns": { "feature": "", "ours": "DPetals", "theirs": "Ordinary products" },
      "rows": [{ "feature": "Ingredients", "ours": "Real botanicals + effective-strength actives",
                 "theirs": "Synthetic fragrance & filler bases" } /* … */] },
    { "type": "faq", "title": "FAQs", "subtitle": null,
      "items": [{ "question": "Is it safe for daily use?",
                  "answerHtml": "Yes — the SLS-free formula is mild enough for morning and night use.", "open": true } /* … */] }
  ],
  "crossSell": null,
  "related": { "title": "Complete the routine", "subtitle": "Pairs beautifully with:",
               "handles": ["aloe-vera-gel-combo-set-of-3-cucumber-rose-mint-saffron-kumkumadi",
                           "ayurvedic-hair-mask",
                           "body-butter-combo-set-of-2-moroccan-mirage-citrus-sunrise"] },
  "showBlog": true
}
```

Sample, multi-variant product (`cucumber-aloe-vera-gel`, the only one with options; other fields omitted):

```json
{
  "badges": [],
  "rating": { "average": 4.89, "count": 9 },
  "netQty": "200 g / 500 g",
  "options": [{ "name": "Size", "values": ["200gms", "500gms"] }],
  "variants": [
    { "id": "43252905345164", "title": "200gms", "options": ["200gms"], "price": 250, "compareAtPrice": 399,
      "available": true, "imageFile": "AloeCucumGelStoreListing_1.jpg" },
    { "id": "43828328693900", "title": "500gms", "options": ["500gms"], "price": 350, "compareAtPrice": 399,
      "available": true, "imageFile": "Aloe-Cucum-Gel-Store-Listing_500gm_1a.jpg" }
  ]
}
```

Rules the UI relies on (`components/product/product-context.tsx`, `lib/cart/lines.ts`):
- `options` is `[]` for single-variant products, but `variants[0]` still exists with title and options `"Default Title"`.
- `variants[].options[i]` lines up with `options[i].values`.
- `imageFile` is matched with `media[].src.endsWith("/" + imageFile)` to jump the gallery to the variant image.
- `variants[0]` is the default selection and the variant used for cards, quick view and "suggestions".
- The first image in `media` is the cart/order thumbnail.

#### Medusa storage for `ProductDetail`

| `ProductDetail` field | Medusa location | Key / notes |
|---|---|---|
| `handle` | `product.handle` | |
| `title` | `product.title` | |
| `subtitle` | `product.subtitle` | |
| Description accordion `html` | `product.description` | Title `"Description"` and `open: true` are fixed by the serializer |
| `seoTitle` | `product.metadata.seoTitle` | |
| `seoDescription` | `product.metadata.seoDescription` | `null` if absent |
| `badges` | `product.metadata.badges` | Array, same shape |
| `rating` | `product.metadata.rating` | `{ average, count }`. Written by the review module |
| `netQty` | `product.metadata.netQty` | |
| `taxNote` | `product.metadata.taxNote` | |
| `offer` | `product.metadata.offer` | |
| `trust` | `product.metadata.trust` | Array, same shape (absolute icon URLs) |
| "Additional information" accordion | `product.metadata.additionalInfo` | `{ "title": "Additional information", "open": false, "rows": [...] }` |
| `sections` | `product.metadata.sections` | The six typed blocks, same shape |
| `crossSell` | `product.metadata.crossSellHandle` | Serializer looks up the target's title and returns `{ handle, title }` |
| `related` | `product.metadata.related` | `{ title, subtitle, handles }` |
| `showBlog` | `product.metadata.showBlog` | Boolean |
| `media` images | `product.images` (ordered, absolute URLs), first one also `product.thumbnail` | |
| `media` videos | `product.metadata.videos` | `[{ "position": 2, "src": "<poster url>", "video": "<mp4 url>" }]`. Serializer inserts each at `position` in the final `media` array |
| `options` | `product.options` | A product with a single default option returns `options: []` (see below) |
| `variants[].id` | `variant.id` | Old id in `variant.metadata.legacyId` |
| `variants[].title` | `variant.title` | |
| `variants[].options` | `variant.options[].value` | In the same order as `options` |
| `variants[].price` | `variant.calculated_price.calculated_amount` | |
| `variants[].compareAtPrice` | `variant.metadata.mrp` | Number or absent, serialised to `null` |
| `variants[].available` | `variant.inventory_quantity > 0` (or `manage_inventory = false`) | |
| `variants[].imageFile` | `variant.metadata.imageFile` | |
| `currency` | `calculated_price.currency_code` | Upper-cased |

**Single-variant products.** Medusa requires every variant to have option values. Create one option `Title` with the value `Default Title`. The serializer then returns `options: []` and keeps `variants[0].title = "Default Title"`, `options = ["Default Title"]`, exactly as the local data does.

Route: `GET /store/dp/products/:handle` returns `ProductDetail`.

### 3.5 Cart: `CartLine`, `CartSummary`, `RewardTier`

Types (`src/types/cart.ts`, `src/lib/cart/lines.ts`):

```ts
interface CartLine {
  variantId: string;
  handle: string;
  title: string;
  variantTitle: string | null;       // null for single-variant products
  image: string;                     // absolute URL
  imageAlt: string;
  unitPrice: number;
  compareAtPrice: number | null;
  unitMeasure?: { amount: number; unit: string } | null;   // "ml" | "g", only for products with no options
  quantity: number;
}
type CartLineInput = Omit<CartLine, "quantity">;
interface CartSummary {
  currency: string; itemCount: number;
  listSubtotal: number;      // sum of selling prices, before any tier discount
  mrpSubtotal: number;       // sum of MRPs
  tierDiscountPercent: number; tierDiscount: number;
  subtotal: number;          // listSubtotal - tierDiscount
  savedVsMrp: number;        // mrpSubtotal - subtotal
}
interface RewardTier { threshold: number; discountPercent: number; label: string }
```

Sample line (Neem face wash, quantity 2):

```json
{
  "variantId": "44198485557388",
  "handle": "neem-tea-tree-face-wash",
  "title": "Neem & Tea Tree Face Wash",
  "variantTitle": null,
  "image": "https://dpetals.com/cdn/shop/files/face_wash_with_props.png",
  "imageAlt": "Neem & Tea Tree Face Wash",
  "unitPrice": 250,
  "compareAtPrice": 499,
  "unitMeasure": { "amount": 120, "unit": "ml" },
  "quantity": 2
}
```

Sample summary for that cart (1 line, quantity 2):

```json
{ "currency": "INR", "itemCount": 2, "listSubtotal": 500, "mrpSubtotal": 998,
  "tierDiscountPercent": 0, "tierDiscount": 0, "subtotal": 500, "savedVsMrp": 498 }
```

Reward tiers (`src/lib/cart/pricing.ts`, constants):

```json
[
  { "threshold": 500,  "discountPercent": 0,  "label": "FREE delivery" },
  { "threshold": 1000, "discountPercent": 10, "label": "10% OFF" },
  { "threshold": 1500, "discountPercent": 15, "label": "15% OFF" },
  { "threshold": 2000, "discountPercent": 20, "label": "20% OFF" }
]
```

Other cart values: `FREE_SHIPPING_THRESHOLD = 500`, `MAX_QUANTITY_PER_VARIANT = 50`, coupon code is a trimmed upper-case string (`"FIRSTTIMEOFFER"`).

| Storefront | Medusa source (native cart) |
|---|---|
| `variantId` | `item.variant_id` |
| `handle`, `title` | `item.product_handle`, `item.product_title` |
| `variantTitle` | `item.variant_title`, or `null` when the product's only option is the default one |
| `image` | `item.thumbnail` (absolute) |
| `imageAlt` | `title` or `title - variantTitle` |
| `unitPrice` | `item.unit_price` |
| `compareAtPrice` | `item.variant.metadata.mrp` |
| `unitMeasure` | Parsed from `product.metadata.netQty` with `/^(\d+(?:\.\d+)?)\s*(ml|g)$/i`, only when the product has no options |
| `quantity` | `item.quantity` |
| Summary values | Computed by the serializer as in `summarizeCart()`: the discount comes from the applied `REWARD-*` promotion, the rest from line prices |
| Local `dp-cart`, `dp-coupon` | Cart id cookie (`dp_cart_id`) and `cart.promotions[].code` |

Route: `GET /store/dp/carts/:id` returns the one additive wrapper `{ id, lines: CartLine[], summary: CartSummary, couponCode: string }` (not a type that exists locally today). Writes use the native cart routes.

### 3.6 Checkout: `CheckoutValues`, `AddressValues`, `PlaceOrderResult`

Types (`src/lib/checkout/validation.ts`, `place-order.ts`):

```ts
interface AddressValues {
  firstName: string; lastName: string; address1: string; address2: string;
  city: string; state: string; pin: string; phone: string;
}
interface CheckoutValues {
  contact: string;                 // email or phone (see decision D3 in the backend spec)
  emailOffers: boolean;
  country: "India";
  shipping: AddressValues;
  saveInfo: boolean;
  textOffers: boolean;
  payment: "razorpay" | "phonepe";
  billingSame: boolean;
  billing: AddressValues;
}
type PlaceOrderResult =
  | { status: "redirect"; url: string }
  | { status: "placed"; order: Order }
  | { status: "unavailable"; message: string };
```

Sample request body:

```json
{
  "contact": "asha@example.com",
  "emailOffers": true,
  "country": "India",
  "shipping": { "firstName": "Asha", "lastName": "Patel", "address1": "12 Rose Lane, Satellite", "address2": "",
                "city": "Ahmedabad", "state": "Gujarat", "pin": "380015", "phone": "9876543210" },
  "saveInfo": false,
  "textOffers": false,
  "payment": "razorpay",
  "billingSame": true,
  "billing": { "firstName": "", "lastName": "", "address1": "", "address2": "", "city": "", "state": "Gujarat", "pin": "", "phone": "" }
}
```

Validation (must also run on the backend): `lastName`, `address1`, `city` required; `pin` exactly 6 digits; shipping `phone` at least 10 digits; billing phone not required; `contact` is an email or at least 10 digits. State is one of the 36 names in `lib/data/india.ts` (default `"Gujarat"`).

Medusa mapping:

| Storefront | Medusa |
|---|---|
| `contact` | `cart.email` |
| `shipping.firstName / lastName / address1 / address2 / city / state / pin / phone` | `shipping_address.first_name / last_name / address_1 / address_2 / city / province / postal_code / phone`, plus `country_code: "in"` |
| `billing` | `billing_address`, same fields. When `billingSame` is true, copy shipping |
| `emailOffers`, `textOffers`, `saveInfo` | `cart.metadata`, then `order.metadata` |
| `payment` | Payment provider id (`razorpay` → the Razorpay provider, `phonepe` → the PhonePe provider) |

Route: `POST /store/dp/carts/:id/checkout` with `CheckoutValues`, returns `PlaceOrderResult`. Internally it runs: update cart, pick the shipping option, initiate the payment session, then either return the provider redirect URL or complete the cart. This matches the existing `placeOrder(values, lines)` signature, so `src/lib/checkout/place-order.ts` only changes its body.

### 3.7 Account and orders (`src/types/account.ts`)

```ts
interface AccountSession { email: string; firstName: string; lastName: string; phone: string }
interface SavedAddress {
  id: string; firstName: string; lastName: string; address1: string; address2: string;
  city: string; state: string; pin: string; phone: string; isDefault: boolean;
}
type OrderAddress = Omit<SavedAddress, "id" | "isDefault">;
interface OrderLine { title: string; variantTitle: string | null; quantity: number; image: string; unitPrice: number }
interface Order {
  id: string; number: string; placedAt: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  currency: string; lines: OrderLine[]; email: string;
  subtotal: number;        // items at selling price, before discounts
  discount: number; shippingTotal: number;
  total: number;           // subtotal - discount + shippingTotal
  shippingAddress: OrderAddress; billingAddress: OrderAddress;
  shippingMethod: string; paymentMethod: string;
}
```

Sample order (`src/lib/orders/preview.ts`):

```json
{
  "id": "preview", "number": "DP1042", "placedAt": "2026-10-03T09:30:00.000Z", "status": "processing", "currency": "INR",
  "lines": [
    { "title": "Neem & Tea Tree Face Wash", "variantTitle": null, "quantity": 2,
      "image": "https://dpetals.com/cdn/shop/files/face_wash_with_props.png", "unitPrice": 250 },
    { "title": "Rose Mint Aloe Vera Gel", "variantTitle": null, "quantity": 1,
      "image": "https://dpetals.com/cdn/shop/files/rosemint_aloevera_with_probs.png", "unitPrice": 250 }
  ],
  "email": "asha@example.com",
  "subtotal": 750, "discount": 0, "shippingTotal": 0, "total": 750,
  "shippingAddress": { "firstName": "Asha", "lastName": "Patel", "address1": "12 Rose Lane, Satellite", "address2": "",
                       "city": "Ahmedabad", "state": "Gujarat", "pin": "380015", "phone": "9876543210" },
  "billingAddress":  { "firstName": "Asha", "lastName": "Patel", "address1": "12 Rose Lane, Satellite", "address2": "",
                       "city": "Ahmedabad", "state": "Gujarat", "pin": "380015", "phone": "9876543210" },
  "shippingMethod": "Standard shipping",
  "paymentMethod": "Razorpay Secure (UPI, Card, Int'l Card, Apple Pay)"
}
```

(Preview-order image URLs shown absolute; locally the helper builds them from the relative catalogue path.)

| Storefront | Medusa source |
|---|---|
| `AccountSession.email / firstName / lastName / phone` | `customer.email / first_name / last_name / phone` |
| `SavedAddress.id` | `customer_address.id` |
| `SavedAddress.firstName … pin, phone` | `first_name, last_name, address_1, address_2, city, province, postal_code, phone` |
| `SavedAddress.isDefault` | `is_default_shipping` |
| `Order.id` | `order.id` |
| `Order.number` | `"DP" + order.display_id` |
| `Order.placedAt` | `order.created_at` (ISO) |
| `Order.status` | `canceled` → `cancelled`; fulfillment `delivered` → `delivered`; `shipped`/`partially_shipped` → `shipped`; else `processing` |
| `Order.currency` | `order.currency_code` upper-cased |
| `Order.lines[]` | `order.items[]`: `product_title`, `variant_title` (null when default), `quantity`, `thumbnail`, `unit_price` |
| `Order.email` | `order.email` |
| `Order.subtotal / discount / shippingTotal / total` | Items at selling price before discount, `discount_total`, `shipping_total`, `total` |
| `Order.shippingAddress / billingAddress` | `order.shipping_address / billing_address` (mapped like customer addresses) |
| `Order.shippingMethod` | `order.shipping_methods[0].name` |
| `Order.paymentMethod` | Provider display label stored on the payment provider config (for example the Razorpay label above) |

Routes: `GET /store/dp/me` → `AccountSession`; `GET/POST/PATCH/DELETE /store/dp/me/addresses[/:id]` → `SavedAddress` (body `Omit<SavedAddress, "id">`); `PATCH /store/dp/me` body `Partial<Pick<AccountSession, "firstName" | "lastName" | "phone">>`; `GET /store/dp/me/orders` → `Order[]` newest first; `GET /store/dp/orders/:id` → `Order`.

### 3.8 Quick View and search

```ts
interface QuickViewItem {
  handle: string; title: string;
  description: string;        // plain text, first 160 chars of the description with tags removed, + "…"
  image: string;              // absolute URL, first image
  price: number; compareAtPrice: number | null; currency: string;
  available: boolean;
  line: CartLineInput;        // first variant
}
interface Suggestion { handle: string; title: string; image: CdnImage; price: number; mrp: number; currency: string }
interface SuggestionResponse { total: number; products: Suggestion[] }      // max 7 products
interface SearchResults { products: ProductSummary[]; articles: Article[] }
```

Sample `QuickViewItem` (Neem):

```json
{
  "handle": "neem-tea-tree-face-wash",
  "title": "Neem & Tea Tree Face Wash",
  "description": "Clear skin starts here. A gentle daily cleanser built for oily and acne-prone Indian skin. Neem and tea tree fight breakout-causing bacteria, 1% salicylic acid unclogs pores, and 1% h…",
  "image": "https://dpetals.com/cdn/shop/files/face_wash_with_props.png",
  "price": 250, "compareAtPrice": 499, "currency": "INR", "available": true,
  "line": { "variantId": "44198485557388", "handle": "neem-tea-tree-face-wash", "title": "Neem & Tea Tree Face Wash",
            "variantTitle": null, "image": "https://dpetals.com/cdn/shop/files/face_wash_with_props.png",
            "imageAlt": "Neem & Tea Tree Face Wash", "unitPrice": 250, "compareAtPrice": 499,
            "unitMeasure": { "amount": 120, "unit": "ml" } }
}
```

Search ranking today (`lib/search/index.ts`): each query token adds 10 if it is in the title, else 4 if in the "meta" (card subtitle, product subtitle, netQty, badge labels), else 1 if in the body (description plus ingredient/benefit/step/FAQ text); ties keep catalogue order. Articles: 10 for title, else 2 for excerpt. Whatever search engine the backend uses should keep this ordering as far as possible.

Routes: `GET /store/dp/quick-view/:handle` → `QuickViewItem`; `GET /store/dp/search?q=&limit=` → `SearchResults` (the Next `/api/search` route slices to 7 and reshapes to `SuggestionResponse`).

### 3.9 Home page content (`src/lib/data/home.ts`)

One response, `HomeContent`, holding every export below. Backend storage: a `content_block` row per key (`key`, `data` = the JSON exactly as shown, `position`, `is_published`).

| Export / key | Count | Type |
|---|---|---|
| `heroSlides` | 3 | `HeroSlide[]` |
| `valueCards` | 5 | `SizedImage[]` |
| `concerns` | 5 | `{ title; description; href; image: CdnImage }[]` |
| `bestsellers` | 8 | `ProductSummary[]` |
| `haircarePicks` | 6 | `ProductSummary[]` |
| `skincarePicks` | 6 | `ProductSummary[]` |
| `comboProducts` | 5 | `ProductSummary[]` |
| `ingredients` | 6 | `CdnImage[]` |
| `categories` | 5 | `{ title; href; image: CdnImage }[]` |
| `comboKits` | 6 | `{ title; href; image: CdnImage }[]` |
| `spotlight` | 1 object | see below |
| `promoBanners` | 5 | `PromoBanner[]` (ids: `hair`, `glow`, `aroma`, `shower`, `hair-gel`) |
| `whyDpetals` | 1 object | see below |
| `reels` | 8 | `Reel[]` |
| `reviews` | 3 | `Review[]` |
| `blogPosts` | 3 | `Article[]` |

The four product rails (`bestsellers`, `haircarePicks`, `skincarePicks`, `comboProducts`) are **not stored** as content: the serializer fills them from collections (`bestsellers`, `haircare`, `skincare`, `combo`) or from a pinned list of handles in the block, so prices and ratings stay live.

Shapes and samples:

```ts
interface HeroSlide {
  kicker: string; title: string; subtitle: string; cta: LinkItem;
  imageMain: SizedImage; imageAccent: SizedImage; chip: { label: string; value: string };
}
```
```json
{
  "kicker": "New launch",
  "title": "Clear skin starts with neem and tea tree.",
  "subtitle": "A face wash with 1% salicylic acid and 1% hyaluronic acid. Clears acne and excess oil without drying. SLS free and Paraben free",
  "cta": { "label": "Shop Face Wash", "href": "/products/neem-tea-tree-face-wash" },
  "chip": { "label": "50% off MRP", "value": "Neem & Tea Tree Face Wash" },
  "imageMain":   { "src": "files/AVI03894.jpg", "alt": "Clear skin starts with neem and tea tree.", "width": 900, "height": 1125 },
  "imageAccent": { "src": "files/AVI04105.jpg", "alt": "", "width": 600, "height": 750 }
}
```

`valueCards[]`:
```json
{ "src": "files/dp-val-natural.jpg", "alt": "Botanical Extracts", "width": 600, "height": 800 }
```

`concerns[]`:
```json
{ "title": "Acne & Oil Control", "description": "Neem, tea tree, salicylic acid, multani mitti",
  "href": "/collections/skincare", "image": { "src": "files/dp-concern-acne-oil.jpg", "alt": "Acne & Oil Control" } }
```

`ingredients[]` (`CdnImage`), `categories[]`, `comboKits[]`:
```json
{ "src": "files/dp-ing-butter-whip.jpg", "alt": "Whipped butters" }
```
```json
{ "title": "Skincare", "href": "/collections/skincare", "image": { "src": "files/dp-cat-skincare-model.jpg", "alt": "Skincare" } }
```
```json
{ "title": "Body Butters", "href": "/products/body-butter-combo-set-of-2-moroccan-mirage-citrus-sunrise",
  "image": { "src": "files/Body_butter_banner_3719f681-698a-49d8-ab84-2ddddd58f883.png", "alt": "Body Butters" } }
```

`spotlight`:
```json
{
  "badge": "NEW LAUNCH",
  "title": "Essential Oils Combo Set for Aromatherapy and Diffuser",
  "image": { "src": "files/01EssentialOilGiftsetMockup_a500cadb-1262-409c-9c6f-4a48a6bb1313.jpg", "alt": "…", "width": 900, "height": 900 },
  "points": ["Covers sleep, focus, hair, skin and home", "Six 100% pure steam-distilled oils",
             "Beautiful gift-ready box", "Big savings vs buying individually"],
  "price": 599, "mrp": 1499, "currency": "INR",
  "handle": "essential-oils-combo-set-6-x-15ml-rosemary-tea-tree-lavender-peppermint-lemongrass-sandalwood-or-eucalyptus-for-aromatherapy-and-diffuser"
}
```
Store only `badge`, `title`, `image`, `points` and `handle`; the serializer fills `price`, `mrp`, `currency` from the product.

`promoBanners[]`:
```ts
interface PromoBanner { id: string; tone: BannerTone; kicker: string; titleMain: string; titleAccent: string;
                        text: string; cta: LinkItem; image: SizedImage }
```
```json
{ "id": "glow", "tone": "meadow", "kicker": "Skincare and Haircare Routine", "titleMain": "Aloevera Gels",
  "titleAccent": "Fresh Herbal Rituals for Radiant Skin",
  "text": "Saffron and kumkumadi botanicals brighten and even skin tone. …",
  "cta": { "label": "Shop Skincare", "href": "/collections/skincare" },
  "image": { "src": "files/combo_aloevera_gel.jpg", "alt": "Aloevera Gels", "width": 1024, "height": 1024 } }
```
Tones by id: `hair` sage, `glow` meadow, `aroma` sand, `shower` mist, `hair-gel` peach.

`whyDpetals`:
```json
{
  "title": "Why DPetals",
  "text": "Potent botanicals meet modern, thoughtfully formulated care. …",
  "cta": { "label": "Explore all products", "href": "/collections/all" },
  "points": [{ "icon": "🌿", "title": "Rooted in nature", "text": "Neem, kumkumadi, amla and rosemary. Botanicals with centuries of use." } /* … 4 points */]
}
```

`reels[]`:
```ts
interface Reel { video: string; poster: string; productHandle: string; productTitle: string; price: number; mrp: number; currency: string }
```
```json
{ "video": "https://cdn.shopify.com/videos/c/vp/7d590c53cae94b7ea48f21b630fed062/….SD-480p-1.0Mbps-89569165.mp4",
  "poster": "files/1_fcc2f581-1bf2-4269-892e-cbb518ac9cdc.jpg",
  "productHandle": "moroccan-mirage-body-butter", "productTitle": "Moroccan Mirage Body Butter",
  "price": 299, "mrp": 699, "currency": "INR" }
```
Store `video`, `poster`, `productHandle`; the serializer fills `productTitle`, `price`, `mrp`, `currency`. `video` is absolute, `poster` is relative.

`reviews[]` (the home testimonial strip):
```ts
interface Review { rating: number; text: string; author: string; product: string }
```
```json
{ "rating": 5, "text": "The kumkumadi gel is now a non-negotiable in my routine. …",
  "author": "Priya S.", "product": "Saffron Kumkumadi Gel, Ahmedabad" }
```
Note `product` is a free-text "product, city" line, not a handle. Backend: `review` rows with `featured = true`; serializer builds `product` as `"<product title>, <city>"`.

`blogPosts[]` are `Article` (section 3.10).

### 3.10 Content: pages, articles, coupons, site settings

```ts
interface ContentPage { handle: string; title: string; seoTitle: string; description?: string; html: string }
interface Article { handle: string; title: string; excerpt: string; category: string | null; image: SizedImage }
interface Coupon { code: string; title: string; description: string }
```

Samples:
```json
{ "handle": "contact", "title": "Contact", "seoTitle": "Contact | DPetals",
  "html": "<p><br>ADDRESS:<br><br>RICH ELEMENTS PRIVATE LIMITED<br>A-204, Dev Parisar, … <br>PHONE NUMBER: <strong>7984416905</strong> …</p>" }
```
```json
{ "handle": "unlock-the-secrets-of-frankincense-discover-its-remarkable-benefits-for-wellness",
  "title": "Unlock the Secrets of Frankincense: Discover Its Remarkable Health Benefits",
  "excerpt": "Frankincense, the ancient resin derived from the Boswellia tree, has long been revered for its captivating ...",
  "category": "Aroma Oil",
  "image": { "src": "articles/out-0_4b6f0b75-56b4-4e23-beb5-486b56c44190.png", "alt": "…", "width": 720, "height": 411 } }
```
```json
{ "code": "FIRSTTIMEOFFER", "title": "10% off your first order", "description": "New to DPetals? Extra 10% off your first order." }
```

Pages today: `about-us`, `contact`, `our-products` (empty html), `collection-bundle` (empty html), `data-sale-opt-out`. Articles: 3 on the home rail plus `benefits-of-essential-oils` (search only). The first-time offer also appears in `siteInfo.announcement`.

Site settings (`src/lib/data/navigation.ts`), one object `SiteContent`:

```ts
interface SiteContent {
  siteInfo: {
    name: string; legalName: string; tagline: string; about: string; email: string; address: string[];
    instagram: string; facebook: string; amazon: string; flipkart: string;
    announcement: { before: string; code: string; after: string };
  };
  shopByCategory: LinkItem[];     // 5
  shopByConcern: LinkItem[];      // 5
  primaryLinks: LinkItem[];       // 5
  footerShopLinks: LinkItem[];    // 6
  footerPolicyLinks: LinkItem[];  // 5
  popularSearches: LinkItem[];    // 18
  coupons: Coupon[];              // 1
}
```
```json
{
  "siteInfo": {
    "name": "DPetals", "legalName": "Rich Elements Pvt. Ltd., Ahmedabad, India",
    "tagline": "Natural, thoughtfully formulated care. Made in Ahmedabad, India.",
    "email": "customercare@richelements.in",
    "address": ["Rich Elements Private Limited", "A-204, Dev Parisar, B/H Gorbandh Hotel Khodiyar,", "Khodiyar, Daskroi, Ahmedabad-382421, Gujarat"],
    "instagram": "https://www.instagram.com/dpetals_essentials/",
    "announcement": { "before": "Extra 10% off your first order with code", "code": "FIRSTTIMEOFFER", "after": ". Free shipping on orders above ₹500." }
  },
  "shopByCategory": [{ "label": "Skincare", "href": "/collections/skincare" } /* … */],
  "popularSearches": [{ "label": "neem face wash for acne", "href": "/products/neem-tea-tree-face-wash" } /* … */]
}
```
Storage: `site_settings` rows keyed by property name, each `data` = that JSON. `footerShopLinks` is derived locally (`shopByCategory.slice(0, 4)` plus two links); store it as plain data.

Static, **not** in the backend: `INDIAN_STATES` (36 names, `lib/data/india.ts`) and `DEFAULT_STATE = "Gujarat"`.

### 3.11 Browser-only state (stays in the browser)

| Key | Where | Content | After Medusa |
|---|---|---|---|
| `dp-cart` (localStorage) | `lib/cart/storage.ts` | `CartLine[]` | Replaced by the Medusa cart. Keep only the cart id cookie |
| `dp-coupon` | same | coupon string | Replaced by the cart's promotion |
| `dp-account` | `lib/account/storage.ts` | `AccountSession \| null` | Replaced by auth session + `GET /store/dp/me` |
| `dp-addresses` | same | `SavedAddress[]` | Replaced by customer addresses |
| `dp-orders` | same | `Order[]` | Replaced by customer orders |
| `dpMsPct`, `dpMsTier` (sessionStorage) | rewards bar | last tier seen, for the unlock celebration | Stays client-side |

---

## 4. Medusa seed payloads (copy-ready)

These are request bodies for the Admin API (or `createProductsWorkflow` input in a seed script) that produce the storefront data above.

### 4.1 Single-variant product (`neem-tea-tree-face-wash`)

```jsonc
{
  "title": "Neem & Tea Tree Face Wash",
  "handle": "neem-tea-tree-face-wash",
  "subtitle": "For clearer, calmer, acne-prone skin — without the tightness.",
  "description": "<p><strong>Clear skin starts here.</strong> A gentle daily cleanser …</p>",
  "status": "published",
  "thumbnail": "https://<media-host>/files/face_wash_with_props.png",
  "images": [
    { "url": "https://<media-host>/files/face_wash_with_props.png" },
    { "url": "https://<media-host>/files/2_47b596ae-6db7-4550-8766-cdeb42f20e53.jpg" }
    // … rest of the images, in gallery order (videos are NOT here)
  ],
  "options": [{ "title": "Title", "values": ["Default Title"] }],
  "variants": [
    {
      "title": "Default Title",
      "sku": "DP-NEEM-FW-120",
      "options": { "Title": "Default Title" },
      "manage_inventory": true,
      "prices": [{ "currency_code": "inr", "amount": 250 }],
      "metadata": { "mrp": 499, "legacyId": "44198485557388", "imageFile": null }
    }
  ],
  "category_ids": ["<skincare>", "<bestsellers>", "<hair-skin>"],     // every collection listing this handle
  "sales_channels": [{ "id": "<DPetals Web>" }],
  "metadata": {
    "seoTitle": "Neem & Tea Tree Face Wash for Acne-Prone Skin | DPetals",
    "seoDescription": "Gentle SLS-free face wash with neem, tea tree, … ",
    "badges": [{ "tone": "new", "label": "NEW" }, { "tone": "tag", "label": "Face Wash" }],
    "rating": null,
    "isNew": true,
    "cardSubtitle": "Face Wash · 120 ml",
    "cardImageAlt": "Neem & Tea Tree Face Wash",
    "netQty": "120 ml",
    "taxNote": "MRP inclusive of all taxes",
    "offer": "🏷️ Extra 10% off your first order with code FIRSTTIMEOFFER",
    "trust": [{ "icon": "https://<media-host>/files/pure-water.svg", "label": "Pure & Natural" } /* … */],
    "videos": [{ "position": 2,
                 "src": "https://<media-host>/files/preview_images/d1f33bdfb584429f926e1c3aa0c00104.thumbnail.0000000000.jpg",
                 "video": "https://<media-host>/videos/c/vp/d1f33bdfb584429f926e1c3aa0c00104/….mp4" }],
    "additionalInfo": { "title": "Additional information", "open": false,
                        "rows": [{ "label": "Country of origin", "value": "India", "href": null } /* … */] },
    "sections": [ /* the six section objects exactly as in 3.4 */ ],
    "crossSellHandle": null,
    "related": { "title": "Complete the routine", "subtitle": "Pairs beautifully with:",
                 "handles": ["aloe-vera-gel-combo-set-of-3-cucumber-rose-mint-saffron-kumkumadi", "ayurvedic-hair-mask",
                             "body-butter-combo-set-of-2-moroccan-mirage-citrus-sunrise"] },
    "showBlog": true
  }
}
```

### 4.2 Multi-variant product (`cucumber-aloe-vera-gel`), differences only

```jsonc
{
  "options": [{ "title": "Size", "values": ["200gms", "500gms"] }],
  "variants": [
    { "title": "200gms", "sku": "DP-CUC-AVG-200", "options": { "Size": "200gms" }, "manage_inventory": true,
      "prices": [{ "currency_code": "inr", "amount": 250 }],
      "metadata": { "mrp": 399, "legacyId": "43252905345164", "imageFile": "AloeCucumGelStoreListing_1.jpg" } },
    { "title": "500gms", "sku": "DP-CUC-AVG-500", "options": { "Size": "500gms" }, "manage_inventory": true,
      "prices": [{ "currency_code": "inr", "amount": 350 }],
      "metadata": { "mrp": 399, "legacyId": "43828328693900", "imageFile": "Aloe-Cucum-Gel-Store-Listing_500gm_1a.jpg" } }
  ],
  "metadata": { "isNew": false, "rating": { "average": 4.89, "count": 9 }, "cardSubtitle": "· 200 g / 500 g", "netQty": "200 g / 500 g", "badges": [] }
}
```

### 4.3 Category (collection)

```json
{
  "name": "Best Sellers",
  "handle": "bestsellers",
  "description": "Discover DPetals Bestsellers – customer-favorite herbal & organic skincare and haircare essentials! …",
  "is_active": true,
  "is_internal": false,
  "metadata": {
    "seoTitle": "Best Sellers | DPetals",
    "image": { "src": "files/face_wash_with_props.png", "alt": "Best Sellers" }
  }
}
```
Then insert one `category_product_position` row per product handle in `productHandles` order (`position` 1, 2, 3 …).

### 4.4 Promotions

```jsonc
// First-order coupon (manual)
{ "code": "FIRSTTIMEOFFER", "type": "standard", "status": "active",
  "application_method": { "type": "percentage", "target_type": "order", "allocation": "across", "value": 10, "currency_code": "inr" },
  "metadata": { "title": "10% off your first order", "description": "New to DPetals? Extra 10% off your first order.", "public": true } }

// Reward tiers (automatic). Three promotions with non-overlapping cart-total ranges
{ "code": "REWARD-10", "is_automatic": true, "type": "standard", "status": "active",
  "application_method": { "type": "percentage", "target_type": "order", "allocation": "across", "value": 10, "currency_code": "inr" },
  "rules": [ { "attribute": "item_subtotal", "operator": "gte", "values": ["1000"] },
             { "attribute": "item_subtotal", "operator": "lt",  "values": ["1500"] } ] }
// REWARD-15: gte 1500 and lt 2000, value 15.   REWARD-20: gte 2000, value 20.
```
The rule attribute (`item_subtotal` above) must be confirmed against tax-inclusive pricing (backend spec 4.3).

### 4.5 Content rows

```jsonc
// content_block
{ "key": "home.hero", "type": "heroSlides", "position": 1, "is_published": true, "data": [ /* the 3 HeroSlide objects, unchanged */ ] }
{ "key": "home.promoBanners", "type": "promoBanners", "position": 9, "is_published": true, "data": [ /* 5 PromoBanner objects */ ] }

// page
{ "handle": "contact", "title": "Contact", "seo_title": "Contact | DPetals", "description": null,
  "html": "<p>…</p>", "is_published": true }

// article
{ "handle": "revive-your-hair-with-this-nourishing-diy-hair-pack", "title": "Revive Your Hair with This Nourishing DIY Hair Pack",
  "excerpt": "Healthy, vibrant hair is …", "category": null,
  "image_url": "articles/out-0_9452b292-1b5f-4788-b816-abcde09df0fb.png", "image_width": 720, "image_height": 411, "is_published": true }

// site_settings
{ "key": "shopByCategory", "data": [{ "label": "Skincare", "href": "/collections/skincare" } /* … */] }
```

---

## 5. Response contract summary

Every custom route returns a storefront type exactly as defined above.

| Route | Returns | Used by |
|---|---|---|
| `GET /store/dp/products/:handle` | `ProductDetail` | Product page, `generateMetadata`, `generateStaticParams` |
| `GET /store/dp/products?handles=a,b` | `ProductSummary[]` (requested order) | Related products |
| `GET /store/dp/collections` | `CollectionIndexEntry[]` | `/collections`, `/products` |
| `GET /store/dp/collections/:handle/products?page=` | `CollectionPage` | Collection page, cart suggestions (`bestsellers`) |
| `GET /store/dp/quick-view/:handle` | `QuickViewItem` | Quick view modal (via the Next route) |
| `GET /store/dp/search?q=&limit=` | `SearchResults` | Search overlay and results page (via the Next route) |
| `GET /store/dp/content/home` | `HomeContent` (all of 3.9) | Home page |
| `GET /store/dp/content/site` | `SiteContent` (3.10) | Header, footer, announcement bar, search overlay, cart coupon panel |
| `GET /store/dp/pages/:handle`, `GET /store/dp/pages` | `ContentPage`, `string[]` | `/pages/[handle]`, policies |
| `GET /store/dp/articles`, `GET /store/dp/articles/:handle` | `Article[]`, `Article & { bodyHtml, publishedAt }` | Journal |
| `GET /store/dp/carts/:id` | `{ id, lines: CartLine[], summary: CartSummary, couponCode }` | Cart provider |
| `POST /store/dp/carts/:id/checkout` | `PlaceOrderResult` | `placeOrder()` |
| `GET/PATCH /store/dp/me` | `AccountSession` | Account |
| `GET/POST/PATCH/DELETE /store/dp/me/addresses[/:id]` | `SavedAddress` / `SavedAddress[]` | Addresses |
| `GET /store/dp/me/orders`, `GET /store/dp/orders/:id` | `Order[]`, `Order` | Orders, confirmation |

Cart line add/update/remove and applying a promo code use the native Medusa cart routes (backend spec 7.5); after each write the storefront refetches `GET /store/dp/carts/:id`.

---

## 6. Where each structure is used in the storefront

| Structure | Read by |
|---|---|
| `ProductSummary` | `components/ui/product-card.tsx`, `components/home/product-rail-section.tsx`, `components/search/search-overlay.tsx`, `app/(main)/search/page.tsx`, collection grid |
| `CollectionRecord` / `CollectionPage` | `app/(main)/collections/[handle]/page.tsx`, `components/collection/pagination.tsx` |
| `CollectionIndexEntry` | `app/(main)/collections/page.tsx`, `components/ui/collection-card.tsx` |
| `ProductDetail` | `app/(main)/products/[handle]/page.tsx`, `components/product/*` |
| `CartLine`, `CartSummary`, `RewardTier` | `components/cart/*`, `components/checkout/order-summary.tsx`, `use-checkout-cart.ts` |
| `CheckoutValues` | `components/checkout/checkout-page.tsx`, `lib/checkout/*` |
| `AccountSession`, `SavedAddress` | `components/account/*`, `sign-in-form.tsx` |
| `Order` | `components/order/order-confirmation.tsx`, `components/account/orders-view.tsx`, `dashboard-view.tsx` |
| `QuickViewItem` | `components/quick-view/*` |
| `HomeContent` pieces | `app/(main)/page.tsx` and `components/home/*` |
| `ContentPage` | `app/(main)/pages/[handle]/page.tsx` |
| `Article` | `components/home/blog-section.tsx`, `components/ui/article-card.tsx`, search |
| `SiteContent` | `components/layout/header.tsx`, `footer.tsx`, `announcement-bar.tsx`, `components/search/search-overlay.tsx`, `components/cart/coupon-box.tsx`, `components/checkout/footer-links.tsx` |

---

## 7. Fields the local data has that Medusa has no column for

These are why the metadata keys and custom modules exist. Nothing here is lost; it just is not a native Medusa column.

| Local field | Where it lives in Medusa |
|---|---|
| `compareAtPrice` / `mrp` | `variant.metadata.mrp` |
| `badges`, `isNew`, `rating`, `netQty`, `taxNote`, `offer`, `trust` | `product.metadata` |
| `sections` (6 typed blocks), `accordions` rows | `product.metadata.sections`, `product.metadata.additionalInfo` |
| `crossSell`, `related`, `showBlog` | `product.metadata` |
| Gallery videos | `product.metadata.videos` |
| Variant `imageFile` | `variant.metadata.imageFile` |
| Card subtitle and image alt | `product.metadata.cardSubtitle`, `cardImageAlt` |
| Product order inside a collection | `category_product_position` table |
| Collection `seoTitle` and image | `product_category.metadata` |
| Home blocks, pages, site settings, articles | `storefront-content` module |
| Testimonials | `review` rows with `featured = true` |

---

## 8. Additive changes the storefront needs (everything else is unchanged)

| Change | Why |
|---|---|
| `ProductSummary` gains an optional `line?: CartLineInput` (the default variant's cart line) | `ProductCard` calls `getDefaultCartLine(handle)` against the local catalogue today. With Medusa it must come from the card data. All other cards fields stay as they are |
| `GET /store/dp/carts/:id` wrapper `{ id, lines, summary, couponCode }` | Replaces reading `dp-cart`; the inner types are unchanged |
| Coupon error state | Local code accepts any coupon; Medusa validates. See backend spec 7.9 |
| `cdn()` tolerant of absolute URLs (optional) | Lets the backend return absolute URLs everywhere (2.3) |
| `QueryClientProvider` mounted | Not mounted today |

---

## 9. Contract test and import checks

1. **Type package.** Publish or copy `src/types/*.ts` (plus `CollectionRecord`, `CollectionPage`, `ContentPage`, `Article`, `Coupon`, `SiteContent`, `HomeContent`) to the backend as `@dpetals/contracts`.
2. **Round-trip test for the 28 products.** Seed from `src/lib/data/product-details.ts` and `collections.ts`, call each `/store/dp/*` route, and deep-compare the response with the original local object. Expected differences are limited to: variant ids (new Medusa ids), the `legacyId` metadata, and image URLs if the media host changed.
3. **Home test.** `GET /store/dp/content/home` deep-equals the exports of `src/lib/data/home.ts` (product rails and spotlight/reel prices computed from live products must equal the stored values).
4. **Cart test.** Add 2 × `neem-tea-tree-face-wash`: the returned `CartSummary` equals the sample in 3.5. Build carts at 499, 500, 1000, 1500 and 2000 and compare `tierDiscountPercent` with `summarizeCart()`.
5. **Order test.** Place a test order and compare the `Order` against 3.7 field by field.
6. **Schema validation.** Validate every JSON payload written to `metadata` and every `content_block.data` with Zod schemas generated from the same types, in the seed script and in an Admin `validate` hook.
7. **Counts.** After seeding: 28 products, 29 variants, 17 categories, 5 pages, 4 articles, 5 home banners, 8 reels, 36 states available in the checkout dropdown.

---

## 10. Dataset inventory

| File | Export | Records |
|---|---|---|
| `src/lib/data/collections.ts` | `catalog` | 28 `ProductSummary` |
| `src/lib/data/collections.ts` | `collections` | 17 `CollectionRecord` |
| `src/lib/data/product-details.ts` | `productDetails` | 28 `ProductDetail` (29 variants, 168 images, 12 videos) |
| `src/lib/data/home.ts` | `heroSlides` 3, `valueCards` 5, `concerns` 5, `bestsellers` 8, `haircarePicks` 6, `skincarePicks` 6, `comboProducts` 5, `ingredients` 6, `categories` 5, `comboKits` 6, `spotlight` 1, `promoBanners` 5, `whyDpetals` 1, `reels` 8, `reviews` 3, `blogPosts` 3 | see 3.9 |
| `src/lib/data/blog.ts` | `articles` | 4 (`blogPosts` + 1 search-only) |
| `src/lib/data/pages.ts` | `pages` | 5 |
| `src/lib/data/coupons.ts` | `coupons` | 1 |
| `src/lib/data/navigation.ts` | `shopByCategory` 5, `shopByConcern` 5, `primaryLinks` 5, `footerShopLinks` 6, `footerPolicyLinks` 5, `popularSearches` 18, `siteInfo` | see 3.10 |
| `src/lib/data/india.ts` | `INDIAN_STATES` | 36 (static, not in backend) |
| `src/lib/cart/pricing.ts` | `REWARD_TIERS`, `FREE_SHIPPING_THRESHOLD` | 4 tiers, 500 |
| `src/lib/cart/limits.ts` | `MAX_QUANTITY_PER_VARIANT` | 50 |
| `src/lib/orders/preview.ts` | `getPreviewOrder()` | 1 sample `Order` (development only) |
