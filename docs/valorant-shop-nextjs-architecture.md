# Valorant In-Game Shop Replica (Hybrid Upgrade + Top-Up Flow)

## 1) Vercel-Deployable Next.js Architecture

```txt
.
├─ app/
│  ├─ page.jsx                          # Main shop: featured + daily offers
│  ├─ top-up/page.jsx                   # Context-aware VP packages
│  ├─ admin/page.jsx                    # Hardcoded login + transaction table
│  ├─ inspect/[skinId]/page.jsx         # Optional deep-link inspect route
│  ├─ layout.jsx
│  └─ globals.css
├─ components/
│  ├─ MainShopGridLayout.jsx
│  ├─ GunInspectLevelModal.jsx
│  ├─ ContextAwareTopUpGrid.jsx
│  └─ CheckoutAnimation.jsx
├─ lib/
│  ├─ db.js
│  ├─ shopState.js                      # reducer/context for Inspect -> Top-Up state
│  └─ valorantApi.js                    # unofficial Valorant API wrappers
├─ pages/api/
│  ├─ purchase.js                       # CALL ProcessUpgradePurchase
│  ├─ topup.js                          # fake top-up write + tx log
│  └─ admin/transactions.js             # hardcoded-protected read for logs
└─ database/
   └─ init.sql
```

## 2) Hybrid State-Driven Flow (Core Requirement)

1. Main shop renders Holo Meridian featured banner + 4 daily cards.
2. Clicking a skin opens `GunInspectLevelModal`.
3. User picks Level 4 (locked by default if unlocked level is 1).
4. Modal computes required VP and sends route state to `/top-up`:

```ts
{
  skinId: 'holo-meridian-operator',
  skinName: 'Holo Meridian Operator',
  targetLevel: 4,
  requiredVp: 1200
}
```

5. Top-up page computes deficit (`requiredVp - currentVp`) and highlights the smallest package covering it.
6. Fake payment runs animated checkout (`CheckoutAnimation`), then `POST /api/purchase` upgrades level.

## 3) Admin Route Protection (Simple)

- Hardcoded demo credentials in env:
  - `ADMIN_USERNAME=admin`
  - `ADMIN_PASSWORD=admin123`
- On successful login set httpOnly cookie token.
- `/admin` page validates cookie and fetches `transactions` rows.

## 4) Production MySQL Strategy for Vercel

### Option A: PlanetScale
- Use connection string with TLS and a pooled URL.
- Prefer `mysql2` with low serverless connection count.
- Run schema migrations through branch workflow.

### Option B: Aiven MySQL
- Create dedicated DB + restricted IP/user.
- Enforce SSL CA cert.
- Use pooled proxy endpoint to avoid cold-start connection storms.

### Shared Recommendations
- Keep stored routines in migration scripts under version control.
- Add read/write split only if traffic warrants.
- Use Vercel env vars:
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
