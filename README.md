# Valorant-Style E-Commerce Shop (XAMPP + PHP + MySQL)

This project is a starter blueprint for building a **Valorant Shop-inspired e-commerce website** with:

- XAMPP (Apache + PHP + MySQL)
- Design system inspired by Valorant store layout
- Database with:
  - Basic SQL tables/queries
  - Stored Procedure
  - Stored Function
- Admin Panel
- Fake checkout flow (no real payment)
- Shop rotation and bundles
- Ability to change shop items and upload pictures

---

## 1) Recommended Stack

- **Backend:** PHP 8+ (XAMPP)
- **Database:** MySQL 8+
- **Frontend:** HTML/CSS/JS (or Bootstrap/Tailwind)
- **Assets:** Local image uploads in `/public/uploads`

---

## 2) Core Features

### Customer Side
- View rotating shop (daily/weekly style)
- View featured bundles and individual items
- Add items to cart
- Fake checkout (marks order as `PAID_FAKE`)
- View order history

### Admin Panel
- Create/edit/delete products
- Upload/change product images
- Create bundles (set discount)
- Control shop rotation dates
- Enable/disable items from current shop

---

## 3) Database

Use the SQL in `database/init.sql` to create all base tables and seed data.

### Includes
- Basic tables (users, products, bundles, rotations, orders)
- **Stored Procedure:** `sp_rotate_shop_items` to auto-enable current rotation
- **Stored Function:** `fn_bundle_price` to calculate discounted bundle total

---

## 4) Suggested Project Structure

```
/public
  index.php
  shop.php
  checkout.php
  /uploads
/admin
  index.php
  products.php
  bundles.php
  rotation.php
/config
  db.php
/database
  init.sql
/src
  ProductRepository.php
  BundleService.php
  RotationService.php
```

---

## 5) XAMPP Setup Steps

1. Install XAMPP and start **Apache** and **MySQL**.
2. Put this project in `htdocs` (or create a virtual host).
3. Create DB:
   - DB name: `valorant_shop`
4. Import `database/init.sql` using phpMyAdmin.
5. Update `/config/db.php` credentials.
6. Open browser:
   - `http://localhost/ecommercesumn/public`
   - Admin: `http://localhost/ecommercesumn/admin`

---

## 6) Fake Checkout Rules

- No real payment gateway.
- At checkout:
  - Create `orders` record
  - Create `order_items` records
  - Set status to `PAID_FAKE`
  - Save timestamp and total amount

---

## 7) Next Build Tasks

1. Build login for admin and customers.
2. Implement product + bundle CRUD pages.
3. Build shop page using active rotation.
4. Add cart + fake checkout.
5. Add order management in admin.
6. Polish Valorant-style UI (cards, gradients, neon accents).
