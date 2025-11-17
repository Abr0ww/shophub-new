# Food App (Node.js + MongoDB)

Role-based food ordering e-commerce with Customer, Admin, Master pages.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Create `.env` in project root:

```
MONGO_URI=mongodb://127.0.0.1:27017/food_app
PORT=3000
JWT_SECRET=change_this_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
POINT_VALUE=0.5
```

**Stripe Setup:**
1. Sign up at [stripe.com](https://stripe.com)
2. Get your test API keys from the Stripe Dashboard → Developers → API keys
3. Add `STRIPE_SECRET_KEY` (starts with `sk_test_`) and `STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`) to `.env`
4. Set `POINT_VALUE` to how much each point is worth in AUD (default `0.5` ⇒ 2 points = $1 AUD)
5. The app is configured for Australia (AUD currency) and supports Google Pay, Apple Pay, and PayPal via Stripe

3. Run server:

```bash
npm start
```

Open `http://localhost:3000`.

## Roles
- customer: browse products, see offers, place orders, earn points (1 point per $1 AUD spent), redeem points for discounts, profile with history
- admin: create products, manage categories, create deals; view daily and weekly sales
- master: view weekly revenue

## Tech
- Express, Mongoose, JWT auth (Bearer token in frontend localStorage)
- Stripe payment integration (Google Pay, Apple Pay, PayPal support)
- HTML/CSS/JS static frontend in `public/`

## API
- POST `/api/auth/signup` `{ name, email, password, role }`
- POST `/api/auth/signin` `{ email, password }`
- GET `/api/products?offers=true` list offers
- POST `/api/products` (admin/master)
- POST `/api/payment/create-intent` `{ items }` create Stripe payment intent (customer)
- POST `/api/payment/confirm` `{ paymentIntentId, items }` confirm payment and create order (customer)
- GET `/api/config/stripe-key` get Stripe publishable key and point value
- GET `/api/orders/my` (customer)
- GET `/api/analytics/daily-sales` (admin/master)
- GET `/api/analytics/weekly-sales` (admin/master)
- GET `/api/analytics/weekly-revenue` (master)

## Notes
- Set `JWT_SECRET` before production.
- Configure Stripe keys and `POINT_VALUE` for loyalty points.
- **Australia-based app**: All payments are in AUD (Australian Dollars). Country selector is hidden as all customers are Australian.
- **Stripe minimum payment**: Stripe requires a minimum payment of $0.50 AUD. Points redemption is automatically limited to ensure this minimum is met.
- CORS is open to all origins for simplicity; tighten if hosting separate frontend.

