# Night Market — Valorant-Inspired Shop

A storefront inspired by Valorant’s in-game shop with:

- Featured bundle section + daily rotation with live timers
- Exact configured bundle sets:
  - Holo Meridian
  - Blackthorn
  - Jellybeam
  - SilkLeaf
  - Kuronami 2.0
- Expanded skin pool across rifles, pistols, SMGs, LMGs, snipers, and melees
- Separate Top Up and Checkout panels
- Inspect flow with upgrade/video preview and bundle item list
- Purchase-complete screen
- Persistent local order history + readable admin order dropdown details
- Vercel-compatible static deployment

## Wallet defaults

- Starting VP: `0`
- Shop refresh: `500 VP`
- Bundle refresh: `500 VP`

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

`database/init.sql` contains schema + seeded shop data + bundled content + stored logic (`fn_bundle_price`, `sp_rotate_shop_items`) for backend migration.
