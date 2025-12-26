# user-auth-mysql-app (Industry Practice Backend)

This repository is a NestJS + TypeORM (MySQL) backend built for **practice** and **industry-style table interaction**.

It includes:
- **Auth** (register/login/JWT profile/verify)
- **Users**
- **Blog domain**: posts, comments, categories, tags
- **Ecommerce domain**: products, tags, inventory/stock, cart, checkout/orders, addresses, reviews

The project ships with a ready-to-run **Postman collection**: `postman_collection.json`.

## Requirements

- Node.js 18+
- MySQL 8+

## Setup

```bash
npm install
```

### Environment variables

Create a `.env` (it is gitignored) with:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=user_auth_mysql_app

JWT_SECRET=super_secret_jwt_key
```

### Run

```bash
npm run start:dev
```

Server: `http://localhost:3000`

> Note: `synchronize: true` is enabled for practice, so tables are auto-created/updated.

## Roles & Admin Access

Some endpoints are **admin-only** (categories/tags/products/inventory admin operations).

Users have a `role` column (`user` by default). To create an admin user for practice:

1) Register a user
2) In MySQL, update the role:

```sql
UPDATE users SET role='admin' WHERE email='admin@example.com';
```

Then login via Postman “Login Admin” to set `adminToken`.

## Postman Collection (Practice Run Order)

Import `postman_collection.json` into Postman.

Recommended execution order:

1) **Auth**
   - Register
   - Login (sets `token`, `userId`)
   - (Optional) Login Admin (sets `adminToken`, `adminUserId`)
   - Verify JWT

2) **Tags** (admin)
   - Create Tag (sets `tagId`)

3) **Categories** (admin)
   - Create Category (sets `categoryId`)

4) **Products** (admin)
   - Create Product (sets `productId`)

5) **Inventory** (admin)
   - Set Stock for `productId`

6) **Addresses** (user)
   - Create Address (sets `addressId`)

7) **Cart** (user)
   - Add Item to Cart

8) **Orders** (user)
   - Checkout (sets `orderId`)
   - List My Orders

9) **Posts / Comments** (user)
   - Create Post (sets `postId`)
   - Create Comment (sets `commentId`)

10) **Reviews** (user)
   - Create Review (sets `reviewId`)

## API Reference (High Level)

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/profile` (JWT)
- `GET /auth/verify` (JWT)

### Users

- `POST /users`
- `GET /users` (JWT)
- `GET /users/:id` (JWT)

### Tags

- `GET /tags`
- `GET /tags/:id`
- `POST /tags` (JWT + admin)
- `PATCH /tags/:id` (JWT + admin)
- `DELETE /tags/:id` (JWT + admin)

### Categories

- `GET /categories`
- `GET /categories/:id`
- `POST /categories` (JWT + admin)
- `PATCH /categories/:id` (JWT + admin)
- `DELETE /categories/:id` (JWT + admin)

### Products

- `GET /products`
- `GET /products/:id`
- `POST /products` (JWT + admin)
- `PATCH /products/:id` (JWT + admin)
- `DELETE /products/:id` (JWT + admin)

### Inventory

- `GET /inventory/products/:productId`
- `PUT /inventory/products/:productId/stock` (JWT + admin)
- `PATCH /inventory/products/:productId/stock` (JWT + admin)

### Addresses

- `GET /addresses` (JWT)
- `GET /addresses/:id` (JWT)
- `POST /addresses` (JWT)
- `PATCH /addresses/:id` (JWT)
- `DELETE /addresses/:id` (JWT)

### Cart

- `GET /cart` (JWT)
- `POST /cart/items` (JWT)
- `PATCH /cart/items/:itemId` (JWT)
- `DELETE /cart/items/:itemId` (JWT)
- `POST /cart/clear` (JWT)

### Orders

- `GET /orders` (JWT)
- `GET /orders/:id` (JWT)
- `POST /orders/checkout` (JWT)
- `GET /orders/admin/all` (JWT + admin)

### Reviews

- `GET /products/:productId/reviews`
- `POST /products/:productId/reviews` (JWT)
- `DELETE /products/:productId/reviews/:id` (JWT + admin)

## Notes

- This project intentionally prioritizes **practice complexity**: multi-table joins, transactions, and role-based access.
- For real production, disable TypeORM `synchronize` and use migrations.
