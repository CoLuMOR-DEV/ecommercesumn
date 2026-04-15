# Night Market — Valorant-Like Shop Demo

A Valorant-inspired e-commerce simulation with:
- Visual design closely matching Valorant Store layout
- Transparent PNG weapon renders (from Valorant API image assets)
- Daily offers + featured bundle UI
- Fake checkout with payment method selection
- Fake VP top-up wallet that adds/deducts VP
- Admin login and admin management panel
- Vercel-compatible static deployment

---

## Credentials

- **Admin username:** `admin`
- **Admin password:** `admin123`

---

## Pages

- `/` → Shop
- `/admin` → Admin login + panel

---

## Fake commerce behavior

- Skins and bundles are priced in **VP**.
- Users can top up VP using fake payment methods (Card/PayPal/GCash).
- Checkout supports method selection:
  - `VP Wallet` deducts from VP balance
  - `Credit Card (Simulated)` / `PayPal (Simulated)` complete fake payment without wallet deduction
- Transactions are saved in localStorage and visible in admin orders list.

---

## Local run

```bash
python -m http.server 4173
```

Open:
- `http://localhost:4173/`
- `http://localhost:4173/admin`

---

## Deploy on Vercel

`vercel.json` rewrites:
- `/` -> `index.html`
- `/admin` -> `admin.html`

Deploy as static site using default Vercel settings.

---

## Optional backend migration

`database/init.sql` contains a starter MySQL schema and stored logic:
- `fn_bundle_price(p_bundle_id)`
- `sp_rotate_shop_items()`

Use this when moving from localStorage to PHP + MySQL (XAMPP).
