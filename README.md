# Night Market — Valorant-Style E-Commerce Demo

A Valorant-inspired e-commerce storefront with:
- **Aesthetic shop UI** (dark neon/red theme)
- **Admin panel** to add/edit catalog content
- **Bundle support** and **shop rotation** behavior
- **Fake checkout flow** (`PAID_FAKE` orders)
- Compatible for **Vercel deployment** or local static hosting

> This is intentionally a front-end demo app using browser storage (`localStorage`) so it runs instantly.

---

## Pages

- `/` → Shop page (`index.html`)
- `/admin` → Admin panel (`admin.html`)

---

## Features implemented

### Shop
- Displays a rotating list of products based on rotation settings.
- Displays one featured rotating bundle.
- Add products/bundle to cart.
- Fake checkout creates an order record in local storage.

### Admin Panel
- Add product (name, price, rarity, image URL)
- Create bundle (name, discount, image URL, product IDs)
- Configure rotation length + product count
- Delete products and bundles
- View fake checkout order history

---

## Local development

Because this is static HTML/CSS/JS, any local server works.

### Option A (Python)
```bash
python -m http.server 4173
```
Then open:
- `http://localhost:4173/`
- `http://localhost:4173/admin.html`

### Option B (VS Code Live Server)
Serve root folder and open `index.html`.

---

## Vercel deployment

This repo includes `vercel.json` rewrites:
- `/` → `index.html`
- `/admin` → `admin.html`

Deploy as a static project:
1. Import repo into Vercel.
2. Keep default static settings.
3. Deploy.

---

## Database plan (for next backend step)

The file `database/init.sql` contains a MySQL/XAMPP schema + seed data + stored function/procedure:
- `fn_bundle_price(p_bundle_id)`
- `sp_rotate_shop_items()`

Use this when you upgrade this demo to a PHP/MySQL backend.
