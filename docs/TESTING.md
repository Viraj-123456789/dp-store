# Manual testing guide

Run this after finishing [SETUP.md](SETUP.md). Tick each box as you go and note the browser, viewport and any bug you find.

## 0. Before you start

**Test environment**
- Backend running (`/health` returns OK) and storefront running.
- The backend `.env` has `OTP_DEV_ECHO=true` (the OTP comes back in the API response, so no SMS provider is needed) and `ALLOW_MANUAL_PAYMENT=true` (checkout uses the auto-approving test provider).
- The database is seeded with products, collections, an INR region and shipping options. The Medusa Admin has blog and page content if you want to test those.
- Browsers: Chrome plus one other (Firefox/Safari). Use DevTools device mode for 390px, 768px and 1440px.
- Keep DevTools open: **Console** (should stay free of red errors) and **Network** (look for 4xx/5xx).

**Test data**

| Item | Value |
|---|---|
| Phone | any 10-digit test number, e.g. `9876543210` |
| Address | any valid Indian address, pincode `110001` |
| Coupon | any code, e.g. `test10` (any code is accepted) |

**Reset between runs:** clear cookies, localStorage and sessionStorage (DevTools → Application → Clear site data) to start with an empty cart and a signed-out session.

## 1. Connection smoke test (2 min)

- [ ] Home page loads with no console errors and no failed requests to the backend.
- [ ] Images load (they come from `NEXT_PUBLIC_MEDIA_BASE_URL`).
- [ ] No CORS errors in the console.
- [ ] Products appear on `/collections/<handle>` and `/products`.

If any of these fail, stop and go to the Troubleshooting table in SETUP.md.

## 2. Layout and navigation

| # | Step | Expected |
|---|---|---|
| 2.1 | Load `/` at 1440, 768 and 390px | Layout matches the reference screenshots in `docs/reference/`. No horizontal scroll. |
| 2.2 | Announcement bar | Shows and rotates or scrolls as on dpetals.com. |
| 2.3 | Header menus | Desktop menu opens on hover; mobile hamburger opens and closes. |
| 2.4 | Footer links | Each link resolves to a real page, not a 404. |
| 2.5 | Home sections: spotlight, reels, newsletter | Render and scroll. Reels play/pause. |
| 2.6 | Newsletter signup | A valid email shows success. An invalid email shows an error. The same email twice is handled gracefully. |
| 2.7 | Open a random bad URL, e.g. `/nope-123` | A 404 page, not a crash. |

## 3. Browsing and search

- [ ] `/collections` lists collections; open one; products and pagination/sorting work.
- [ ] `/products` lists products.
- [ ] Product card: image, title, price (₹), sale or compare-at price, and the quick view button.
- [ ] **Quick view:** opens a modal with the first variant and image. Close with the X, Esc and a click outside.
- [ ] `/search?q=<term>`: returns relevant results. A nonsense term shows an empty state. An empty query is handled.
- [ ] Header search (if present) shows suggestions and navigates correctly.

## 4. Product page

- [ ] Open `/products/<handle>`: gallery, title, price, description and variant selector render.
- [ ] Gallery: switching images works. Zoom or swipe works on mobile.
- [ ] Selecting a variant updates price, image and availability.
- [ ] Quantity stepper: can't go below 1.
- [ ] **Add to cart:** the cart drawer opens, the item is there and the header count updates.
- [ ] **Buy it now:** goes to `/checkout?buy=<variantId>&qty=<n>` and does **not** add the item to the normal cart.
- [ ] Out-of-stock or unavailable variants are disabled or labelled.
- [ ] Reviews section renders. Submitting a review works. Submitting repeatedly hits the cooldown/limit message.
- [ ] Invalid handle, `/products/does-not-exist`, shows 404.

## 5. Cart

**Drawer and `/cart` page**
- [ ] Add 2 different products. Quantities, line totals and subtotal are correct.
- [ ] "+" and "−" change quantity. "−" at 1 removes the item or asks for confirmation (compare with the reference).
- [ ] Remove button removes the line. An empty cart shows the empty state.
- [ ] Reload the page: the cart persists (cookie-backed).
- [ ] Open the site in a second tab: the cart matches, and a change in one tab shows in the other after a refresh.

**Limits** (`MAX_QUANTITY_PER_VARIANT`, default 50)
- [ ] Add up to 50 of one variant. Adding more shows "The maximum quantity of this item is already in your cart." and the drawer stays closed.
- [ ] Adding 5 when 48 are in the cart shows "Only 2 items were added to your cart due to availability."
- [ ] The "+" button at the limit does nothing.

**Reward tiers** (based on list subtotal)

| Subtotal | Expected |
|---|---|
| < ₹500 | Progress bar shows how much is left for free delivery |
| ≥ ₹500 | Free delivery |
| ≥ ₹1000 | 10% off row in the drawer |
| ≥ ₹1500 | 15% off |
| ≥ ₹2000 | 20% off |

- [ ] Walk the cart across each threshold by changing quantities. Check that the bar fill, message, discount row and total all update.
- [ ] The celebration only plays when the tier goes **up** within a session, not on reload.
- [ ] Discount row appears in the drawer and the totals are consistent on `/cart` and in checkout.

**Coupon**
- [ ] Empty input does nothing. Whitespace is trimmed and the code is uppercased.
- [ ] Applying a code stores it; reload and check it persists.
- [ ] Cart suggestions show the first best-sellers **not** already in the cart.

## 6. Account and phone OTP login

- [ ] `/account/login`: invalid phone is rejected with a clear message.
- [ ] Valid phone → OTP is requested. With `OTP_DEV_ECHO` the code is in the `/api/auth/otp` response (Network tab).
- [ ] Wrong OTP shows an error. Several wrong attempts and rapid resends are rate-limited, not a crash.
- [ ] Correct OTP signs you in and redirects to `/account`.
- [ ] A new phone number goes through registration (`/account/register`) and creates an account.
- [ ] Protected pages (`/account`, `/account/orders`, `/account/addresses`) redirect to login when signed out.
- [ ] **Addresses:** add, edit, delete and set a default. Validation errors show for empty fields and a bad pincode.
- [ ] **Orders:** the list is empty for a new account. After section 7 your order appears with the right totals and status.
- [ ] Log out clears the session. The back button doesn't show account data.
- [ ] A guest cart merges into or is kept after login.

## 7. Checkout

Test both as a **guest** and as a **logged-in user**.

- [ ] From the cart, press Checkout. `/checkout` shows the correct items and totals (subtotal, discount, shipping, total).
- [ ] Validation: leave every field empty and submit; each required field shows an error. Test a bad email, phone, and pincode.
- [ ] Logged-in user: saved addresses are offered and prefilled.
- [ ] Shipping fee/free-delivery matches the tier rules from section 5.
- [ ] Place the order with the test payment provider. You land on `/order/<id>/confirmed` (check `/checkout/return` if you are redirected through a gateway).
- [ ] The confirmation page shows the right items, address and totals.
- [ ] Reload the confirmation page. A guest can still view it (token), and another browser **without** the token cannot.
- [ ] The cart is empty after the order.
- [ ] The order shows up in the Medusa Admin (Orders) with matching details.
- [ ] **Buy now flow:** `/checkout?buy=<variantId>&qty=2` checks out only that item; the regular cart is untouched.
- [ ] Double-click Place Order: only **one** order is created.
- [ ] Refresh mid-checkout: the state is preserved or restarted sensibly.

**Real payments (staging only, with sandbox keys):** test a success, a cancelled payment and a failed payment for Razorpay and PhonePe. The webhooks need a public backend URL.

## 8. Content pages

- [ ] `/blogs/blogs`: list, tag filter (`/blogs/blogs/tagged/<tag>`) and an article page render.
- [ ] `/pages/<handle>` and `/policies/<handle>` (privacy, shipping and so on) render.
- [ ] Catch-all `[...slug]` routes redirect or 404 as expected.
- [ ] Admin edit → storefront refresh: change a product title or a page in the Admin, then confirm the storefront updates (needs `REVALIDATE_SECRET` and `STOREFRONT_URL` set correctly). Allow up to the cache time if revalidation isn't wired.

## 9. Responsive and cross-browser

Repeat the key flows (browse → add to cart → checkout) at **390**, **768** and **1440** px.
- [ ] No overlapping text, clipped buttons or horizontal scroll.
- [ ] The drawer and modals fit the mobile screen and can be scrolled.
- [ ] Touch targets are usable on mobile.
- [ ] Test in a second browser, and on a real phone if you can (`http://<storefront-LAN-IP>:3000`, and add that origin to the backend `STORE_CORS`).

## 10. Error and edge cases

- [ ] Stop the backend while on the storefront. Pages show an error or fallback state rather than a blank screen. Add to cart shows an error toast.
- [ ] Restart the backend and check that the site recovers without a manual cache clear.
- [ ] Slow network (DevTools → Slow 3G): loading states/skeletons show, and buttons are disabled during requests.
- [ ] Block cookies: the site shows a sensible message instead of a crash loop.
- [ ] Try `<script>` and very long strings in text inputs (address, review, newsletter). Nothing breaks or executes.

## 11. Automated checks

Run before signing off:
```bash
npm run lint
npm run build
```
Both must pass with no errors. Also run the backend's tests if you changed it (`npm test` from the `my-storeback` root).

## Bug report template

```
Title:
Page / URL:
Viewport + browser:
Logged in / guest:
Steps to reproduce:
Expected:
Actual:
Console / Network errors:
Screenshot:
```

## Sign-off checklist

- [ ] Sections 1 to 10 are done on desktop and mobile.
- [ ] A full guest order and a full logged-in order both completed.
- [ ] Both orders appear in the Medusa Admin with the right totals.
- [ ] No red console errors on any main page.
- [ ] `npm run lint` and `npm run build` both pass.
