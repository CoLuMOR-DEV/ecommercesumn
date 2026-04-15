# Night Market — Valorant-Inspired Shop

A polished storefront experience inspired by the in-game Valorant shop, featuring:

- Featured bundle hero section + daily offers with live countdown
- VP wallet, top-up, and checkout flows
- Product inspect view with upgrade/video preview support
- Admin login with controls for catalog, bundles, and rotation settings
- Admin controls to force refresh shop and featured bundle using VP cost
- Vercel-compatible static deployment

## Admin Access

- Username: `admin`
- Password: `admin123`

## Local run

```bash
python -m http.server 4173
```

Then open:
- `http://localhost:4173/`
- `http://localhost:4173/admin`

## Database

`database/init.sql` now includes:
- Seeded products, bundles, and skin upgrade videos
- App settings for rotation and refresh cost
- Rotation tables and mappings
- Stored function: `fn_bundle_price(p_bundle_id)`
- Stored procedure: `sp_rotate_shop_items()`

Import with phpMyAdmin or MySQL CLI to bootstrap a backend migration.
