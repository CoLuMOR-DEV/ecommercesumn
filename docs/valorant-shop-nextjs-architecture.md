# Valorant In-Game Shop Replica (Next.js + MySQL) Architecture

## Project Structure (Vercel-ready)

```txt
.
├─ app/
│  ├─ (shop)/page.jsx                 # Store page (featured + daily offers)
│  ├─ top-up/page.jsx                 # VP recharge page
│  ├─ admin/page.jsx                  # Protected admin login + transactions table
│  ├─ layout.jsx                      # global shell and metadata
│  └─ globals.css                     # Tailwind theme tokens and Valorant palette
├─ components/
│  ├─ ShopLayout.jsx
│  ├─ VPTopUpCard.jsx
│  ├─ CheckoutAnimation.jsx
│  └─ InspectModal.jsx                # gun inspect modal w/ high-res assets
├─ pages/
│  └─ api/
│     └─ checkout.js                  # calls ProcessFakeCheckout stored procedure
├─ lib/
│  ├─ db.js                           # MySQL pool
│  ├─ valorantApi.js                  # unofficial Valorant API fetch helpers
│  └─ auth.js                         # hardcoded admin session helpers
└─ database/
   └─ init.sql
```

## Core Frontend Flow

1. `ShopLayout` renders `featuredBundle` + `dailyItems` in a strict dark/geometric UI.
2. Clicking any item opens Inspect modal (not included here) with high-res API images.
3. Buy action triggers `/api/checkout`, then `CheckoutAnimation` shows a 2-second processing state followed by success.
4. VP wallet updates optimistically then revalidates from backend response.

## API Contracts

### POST `/api/checkout`

Request:

```json
{
  "userId": 2,
  "itemId": 5,
  "vpCost": 1775
}
```

Success response:

```json
{
  "success": true,
  "status": "SUCCESS",
  "message": "Purchase completed.",
  "remainingVp": 3575
}
```

Failure response:

```json
{
  "success": false,
  "status": "FAILED",
  "message": "Insufficient VP balance.",
  "remainingVp": 200
}
```

## Admin Protection (simple/hardcoded)

- Keep credentials in env vars:
  - `ADMIN_USERNAME=admin`
  - `ADMIN_PASSWORD=admin123`
- Validate credentials on `/api/admin/login`.
- Store a signed cookie (`httpOnly`) for `/admin` gatekeeping.
- `/admin` page fetches `/api/admin/transactions` and renders all transaction rows.

## Animation Guidance (Framer Motion)

- Use `AnimatePresence` for inspect modal enter/exit.
- Use spring settings close to Valorant feel:
  - `type: "spring"`, `stiffness: 240`, `damping: 18`.
- Keep background transitions under 350ms with subtle glow accents (`#ff4655`).
