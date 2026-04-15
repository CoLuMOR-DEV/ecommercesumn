# Night Market — Valorant-Inspired Shop

A polished storefront inspired by Valorant’s in-game store, featuring:

- Featured bundle hero with item list + live bundle timer
- Daily offers with live rotation timer
- Bundle/Shop refresh controls available to all players (500 VP each)
- Top Up and Checkout as separate panels
- Inspect experience with upgrades + video previews
- Purchase-complete presentation screen
- Admin panel for products, bundles, and rotation settings
- Vercel-compatible static deployment

## Wallet defaults

- Starting VP balance: `0`
- Shop refresh cost: `500 VP`
- Bundle refresh cost: `500 VP`

## Admin Access

- Username: `admin`
- Password: `admin123`

## Local run

```bash
python -m http.server 4173
```

Open:
- `http://localhost:4173/`
- `http://localhost:4173/admin`

## Database

`database/init.sql` includes seeded skins, bundles, upgrades, rotation mappings, configurable VP refresh costs, and stored logic (`fn_bundle_price`, `sp_rotate_shop_items`) for backend migration.
