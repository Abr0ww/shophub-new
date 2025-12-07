# 🔐 Render.com Environment Variables - Quick Reference

Copy and paste these values directly into Render.com Environment Variables.

## ✅ Required Environment Variables

### MONGO_URI
```
mongodb+srv://EliteHeights:EliteHeights@cluster0.btlp6ts.mongodb.net/food_app?retryWrites=true&w=majority&appName=Cluster0
```

**Note:** 
- Username: `EliteHeights`
- Password: `EliteHeights` (no special characters, no encoding needed)
- Database: `food_app`
- Cluster: `cluster0.btlp6ts.mongodb.net`

### JWT_SECRET
```
39d3bd59-33fb-488b-be88-b88241c6255d
```

### NODE_ENV
```
production
```

---

## 📋 How to Add in Render.com

1. Go to Render Dashboard → Your Service
2. Click **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add each variable:
   - **Key:** `MONGO_URI`
   - **Value:** (paste the connection string above)
   - Click **"Save"**
   
   Repeat for:
   - **Key:** `JWT_SECRET` → **Value:** `39d3bd59-33fb-488b-be88-b88241c6255d`
   - **Key:** `NODE_ENV` → **Value:** `production`

5. Click **"Save Changes"** at the bottom
6. Render will automatically restart your service

---

## 💳 Optional: Stripe Payment Variables

If you're using Stripe for payments, add these:

### STRIPE_SECRET_KEY
```
sk_live_YOUR_STRIPE_SECRET_KEY
```
or for testing:
```
sk_test_YOUR_STRIPE_SECRET_KEY
```

### STRIPE_PUBLISHABLE_KEY
```
pk_live_YOUR_STRIPE_PUBLISHABLE_KEY
```
or for testing:
```
pk_test_YOUR_STRIPE_PUBLISHABLE_KEY
```

### POINT_VALUE
```
0.5
```
(How much each loyalty point is worth in AUD)

---

## ⚠️ Important Notes

- ❌ **DO NOT** set `PORT` - Render provides this automatically
- ✅ Make sure MongoDB Atlas IP whitelist allows `0.0.0.0/0`
- ✅ Password in MONGO_URI: `EliteHeights` (no special characters, no encoding needed)
- ✅ All variable names are case-sensitive

---

## 🧪 Testing Locally

To test these values locally, create a `.env` file:

```env
MONGO_URI=mongodb+srv://EliteHeights:EliteHeights@cluster0.btlp6ts.mongodb.net/food_app?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=39d3bd59-33fb-488b-be88-b88241c6255d
NODE_ENV=production
PORT=3000
```

Then run:
```bash
npm start
```

You should see: `✅ Connected to MongoDB`

---

**After setting these in Render.com, your deployment should work!** 🚀

