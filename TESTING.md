# Testing Guide - Foodie App

## Stripe Test Cards

When testing payments in **Test Mode**, use these Stripe test card numbers:

### ✅ Successful Payment
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

### ❌ Card Declined
```
Card Number: 4000 0000 0000 0002
Expiry: Any future date
CVC: Any 3 digits
```

### 🔒 Requires Authentication (3D Secure)
```
Card Number: 4000 0025 0000 3155
Expiry: Any future date
CVC: Any 3 digits
```

### 💳 Insufficient Funds
```
Card Number: 4000 0000 0000 9995
Expiry: Any future date
CVC: Any 3 digits
```

## Testing Payment Flow

1. **Login as Customer**
   - Email: `customer@test.com`
   - Password: `password123`

2. **Add Items to Cart**
   - Browse the menu
   - Click "Add" on products
   - View cart in "Order" tab

3. **Apply Points (Optional)**
   - Use the points slider
   - Click "Use Max" for maximum discount

4. **Proceed to Payment**
   - Click "Proceed to Payment"
   - Test card info will be displayed

5. **Enter Test Card**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34`
   - CVC: `123`

6. **Complete Payment**
   - Click "Pay Now"
   - Order should be confirmed
   - Points should be earned

## Currency

All payments are in **AUD (Australian Dollars)**.

## Minimum Payment

Stripe requires a minimum payment of **$0.50 AUD**. Points redemption is automatically limited to ensure this minimum.

## Common Issues

### "Payment Failed"
- ✅ Make sure you're using the test card: `4242 4242 4242 4242`
- ✅ Check that expiry date is in the future
- ✅ Ensure cart total is at least $0.50 AUD after points discount
- ✅ Verify Stripe keys are set in `.env`

### "Invalid Token"
- ✅ Your session may have expired
- ✅ Logout and login again

### Country Selector Showing
- ✅ This is normal in Stripe test mode
- ✅ Country is pre-set to Australia
- ✅ You can leave it as is

## Admin Testing

1. **Login as Admin**
   - Email: `admin@test.com`
   - Password: `password123`

2. **Create Products**
   - Add name, price, description
   - Select category
   - Upload image URL
   - Set offer percentage

3. **Manage Deals**
   - Create points-based deals
   - Set expiry dates
   - Toggle active/inactive

4. **View Analytics**
   - Daily sales
   - Weekly sales
   - Revenue reports

## Support

For more test cards, visit: https://stripe.com/docs/testing

