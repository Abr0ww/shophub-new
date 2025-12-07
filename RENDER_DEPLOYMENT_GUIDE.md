# 🚀 Render.com Deployment Guide - ShopHub

Complete step-by-step guide to deploy your ShopHub application on Render.com.

## 📋 Prerequisites

- ✅ GitHub repository: https://github.com/Abr0ww/shophub-new.git
- ✅ MongoDB Atlas account with cluster set up
- ✅ MongoDB credentials ready (EliteHeights / Elite@2025!!)
- ✅ Stripe account (optional, for payments)

---

## 🎯 Step 1: Prepare MongoDB Atlas

### 1.1 Whitelist IP Addresses

**CRITICAL:** Do this first, or Render won't be able to connect!

1. Go to https://cloud.mongodb.com
2. Sign in and select your project
3. Click **"Network Access"** (left sidebar, under Security)
4. Click **"Add IP Address"**
5. Select **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
6. Click **"Confirm"**
7. Wait 1-2 minutes for status to show **"Active"**

### 1.2 Verify Database User

1. Go to **"Database Access"** (left sidebar)
2. Verify user `EliteHeights` exists
3. If not, create it with password `Elite@2025!!`
4. Grant **"Read and write to any database"** permissions

### 1.3 Get Connection String

1. Go to **"Database"** → Click **"Connect"**
2. Select **"Connect your application"**
3. Copy the connection string template
4. Replace `<password>` with your URL-encoded password

**Your Connection String:**
```
mongodb+srv://EliteHeights:Elite%402025%21%21@cluster0.btlp6ts.mongodb.net/food_app?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🚀 Step 2: Deploy on Render.com

### 2.1 Create New Web Service

1. Go to https://dashboard.render.com
2. Sign in (or create account)
3. Click **"New +"** → Select **"Web Service"**
4. Choose **"Connect GitHub"** (or GitLab/Bitbucket)
5. Authorize Render to access your GitHub account
6. Select repository: **`Abr0ww/shophub-new`**
7. Click **"Connect"**

### 2.2 Configure Service Settings

Fill in the following:

**Basic Settings:**
- **Name:** `shophub` (or your preferred name)
- **Region:** Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch:** `main`
- **Root Directory:** (leave empty, or `./` if needed)
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

**Advanced Settings (optional):**
- **Node Version:** `18` or `20` (auto-detected from package.json)
- **Auto-Deploy:** `Yes` (deploys on every push to main branch)

Click **"Create Web Service"**

### 2.3 Set Environment Variables

**IMPORTANT:** Do this before the first deployment completes!

1. In your Render service dashboard, go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add each variable one by one:

#### Required Variables:

**MONGO_URI**
```
Key: MONGO_URI
Value: mongodb+srv://EliteHeights:EliteHeights@cluster0.btlp6ts.mongodb.net/food_app?retryWrites=true&w=majority&appName=Cluster0
```

**JWT_SECRET**
```
Key: JWT_SECRET
Value: 39d3bd59-33fb-488b-be88-b88241c6255d
```
✅ Your JWT Secret is already generated and ready to use.

**NODE_ENV**
```
Key: NODE_ENV
Value: production
```

#### Optional Variables (for payments):

**STRIPE_SECRET_KEY**
```
Key: STRIPE_SECRET_KEY
Value: sk_live_... (or sk_test_... for testing)
```

**STRIPE_PUBLISHABLE_KEY**
```
Key: STRIPE_PUBLISHABLE_KEY
Value: pk_live_... (or pk_test_... for testing)
```

**POINT_VALUE**
```
Key: POINT_VALUE
Value: 0.5
```

### 2.4 Important Notes

❌ **DO NOT SET:**
- `PORT` - Render provides this automatically

✅ **After adding all variables:**
- Click **"Save Changes"**
- Render will automatically restart your service

---

## ⏳ Step 3: Wait for Deployment

1. Go to **"Logs"** tab in Render dashboard
2. Watch the build process:
   - `==> Cloning from GitHub...`
   - `==> Building...`
   - `==> npm install`
   - `==> Starting service...`

3. **Success indicators:**
   ```
   ✅ Connected to MongoDB
   🚀 Server running on port XXXX
   ```

4. **If you see errors:**
   - Check the troubleshooting section below
   - Verify environment variables are set correctly
   - Check MongoDB Atlas IP whitelist

---

## ✅ Step 4: Verify Deployment

### 4.1 Check Service Status

- Service should show **"Live"** (green status)
- Not "Failed" or "Starting"

### 4.2 Test Your Application

1. Click on your service URL (e.g., `https://shophub.onrender.com`)
2. You should see the login page
3. Try signing up a new user
4. Test basic functionality

### 4.3 Check Logs

- Go to **"Logs"** tab
- Should see no errors
- Should see successful MongoDB connection

---

## 🔧 Step 5: Configure Custom Domain (Optional)

1. In Render dashboard, go to **"Settings"** tab
2. Scroll to **"Custom Domains"**
3. Click **"Add Custom Domain"**
4. Enter your domain (e.g., `shophub.com`)
5. Follow DNS configuration instructions
6. Render will automatically provision SSL certificate

---

## 🐛 Troubleshooting

### Issue: "MongoDB connection error"

**Solutions:**
- ✅ Check MongoDB Atlas Network Access allows `0.0.0.0/0`
- ✅ Verify `MONGO_URI` is correct in Render environment variables
- ✅ Check password is `EliteHeights` (no special characters, no encoding needed)
- ✅ Verify database user exists and has correct permissions

### Issue: "Missing required environment variables"

**Solutions:**
- ✅ Add `MONGO_URI` and `JWT_SECRET` in Render Environment tab
- ✅ Make sure variable names are exact (case-sensitive)
- ✅ Click "Save Changes" after adding variables

### Issue: Service keeps restarting

**Solutions:**
- ✅ Check logs for specific error messages
- ✅ Verify MongoDB connection is working
- ✅ Check if all required environment variables are set
- ✅ Review server.js error handling (should exit on MongoDB failure)

### Issue: "Cannot find module"

**Solutions:**
- ✅ Check `package.json` has all dependencies
- ✅ Verify build logs show successful `npm install`
- ✅ Check Node version matches (should be 18+)

### Issue: 502 Bad Gateway

**Solutions:**
- ✅ Check service status (should be "Live")
- ✅ Review logs for application errors
- ✅ Verify server is listening on the port Render provides
- ✅ Check MongoDB connection is successful

---

## 📝 Environment Variables Checklist

Before deployment, ensure these are set in Render:

- [ ] `MONGO_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Set to: `39d3bd59-33fb-488b-be88-b88241c6255d`
- [ ] `NODE_ENV=production`
- [ ] `STRIPE_SECRET_KEY` (optional, for payments)
- [ ] `STRIPE_PUBLISHABLE_KEY` (optional, for payments)
- [ ] `POINT_VALUE=0.5` (optional, for loyalty points)

---

## 🔄 Updating Your Deployment

### Automatic Deployments

- Render automatically deploys when you push to `main` branch
- You can disable this in Settings → Auto-Deploy

### Manual Deployments

1. Go to **"Manual Deploy"** tab
2. Select branch/commit
3. Click **"Deploy latest commit"**

### Rollback

1. Go to **"Events"** tab
2. Find previous successful deployment
3. Click **"Redeploy"**

---

## 📊 Monitoring

### View Logs

- **Real-time logs:** Dashboard → Your Service → Logs
- **Historical logs:** Available for past deployments

### Metrics

- **CPU/Memory usage:** Dashboard → Your Service → Metrics
- **Request metrics:** Available in paid plans

---

## 🔐 Security Best Practices

1. ✅ Never commit `.env` file (already in .gitignore)
2. ✅ Use strong `JWT_SECRET` (your secret: `39d3bd59-33fb-488b-be88-b88241c6255d`)
3. ✅ Use MongoDB Atlas with strong password
4. ✅ Enable MongoDB Atlas IP whitelist (even with 0.0.0.0/0)
5. ✅ Use HTTPS (Render provides automatically)
6. ✅ Keep dependencies updated
7. ✅ Use production Stripe keys (not test keys) in production

---

## 💰 Render.com Pricing

- **Free Tier:**
  - Services spin down after 15 minutes of inactivity
  - Good for testing and development
  - Limited to 750 hours/month

- **Starter Plan ($7/month):**
  - Always-on service
  - Better for production
  - No spin-down

---

## 📞 Getting Help

**Render Support:**
- Dashboard → Support
- Documentation: https://render.com/docs

**MongoDB Atlas:**
- Support: https://www.mongodb.com/support
- Documentation: https://docs.atlas.mongodb.com

**Application Issues:**
- Check `RENDER_TROUBLESHOOTING.md` for detailed troubleshooting
- Review logs in Render dashboard
- Check MongoDB Atlas connection status

---

## ✅ Deployment Checklist

Before going live:

- [ ] MongoDB Atlas IP whitelist configured (0.0.0.0/0)
- [ ] All environment variables set in Render
- [ ] Service shows "Live" status
- [ ] Logs show successful MongoDB connection
- [ ] Tested signup/login functionality
- [ ] Tested product browsing
- [ ] Tested order placement (if using Stripe)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic on Render)

---

## 🎉 You're Done!

Your ShopHub application should now be live on Render.com!

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring/alerts
3. Configure custom domain (optional)
4. Set up database backups
5. Update admin/master passwords from defaults

---

**Repository:** https://github.com/Abr0ww/shophub-new.git  
**Render Dashboard:** https://dashboard.render.com

Good luck with your deployment! 🚀

