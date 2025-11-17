# 🚀 ShopHub Deployment Guide for Hostinger

## ✅ Pre-Deployment Checklist

### 1. MongoDB Atlas Setup (CURRENT STEP)

- [x] Create MongoDB Atlas account
- [x] Create free M0 cluster (cluster0.b0fymfr.mongodb.net)
- [x] Create database user: `sourboii2002_db_user`
- [ ] **Copy your database password** (you'll need this!)
- [ ] Whitelist all IPs (0.0.0.0/0) in Network Access
- [ ] Test connection string

**Your Connection String:**
```
mongodb+srv://sourboii2002_db_user:<db_password>@cluster0.b0fymfr.mongodb.net/shophub?retryWrites=true&w=majority&appName=Cluster0
```

**Important:** Replace `<db_password>` with your actual password!

---

### 2. Stripe Setup

- [ ] Go to https://dashboard.stripe.com
- [ ] Get your **LIVE** API keys (not test keys!)
  - Publishable key: `pk_live_...`
  - Secret key: `sk_live_...`
- [ ] Save these keys securely

---

### 3. Prepare Files for Upload

**Files to Upload to Hostinger:**
```
✅ server.js
✅ package.json
✅ package-lock.json
✅ /src/ (entire folder)
✅ /public/ (entire folder)
✅ .htaccess
✅ ecosystem.config.js (optional)
```

**Files NOT to Upload:**
```
❌ node_modules/ (will install on server)
❌ .env (use Hostinger environment variables)
❌ .git/ (not needed)
❌ clear-db.js, seed-products.js (temp files)
```

---

## 📋 Step-by-Step Deployment

### Step 1: Complete MongoDB Atlas Setup

1. In MongoDB Atlas, click **"Done"** on the connection screen
2. Go to **"Network Access"** (left sidebar)
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
5. Click **"Confirm"**

### Step 2: Test MongoDB Connection Locally

Before deploying, test your connection string:

1. Open `env.production.template`
2. Replace `<db_password>` with your actual password
3. Copy the `MONGO_URI` value
4. Temporarily update your local `.env` file with this URI
5. Run: `npm start`
6. If it connects successfully, you're ready to deploy!

### Step 3: Prepare .htaccess File

Create `.htaccess` in your project root:

```apache
# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Node.js application proxy
DirectoryIndex disabled
RewriteEngine On
RewriteRule ^$ http://127.0.0.1:3001/ [P,L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L]
```

### Step 4: Login to Hostinger

1. Go to https://www.hostinger.com
2. Login to your account
3. Go to **"Hosting"** → Click **"Manage"**

### Step 5: Set Up Node.js Application

1. In hPanel, find **"Advanced"** section
2. Click **"Node.js"**
3. Click **"Create Application"**
4. Fill in:
   - **Node.js version**: 18.x or higher
   - **Application mode**: Production
   - **Application root**: `/public_html/shophub` (or your choice)
   - **Application URL**: Your domain
   - **Application startup file**: `server.js`
   - **Port**: 3001
5. Click **"Create"**

### Step 6: Upload Files via FTP

**Option A: File Manager (for small projects)**
1. hPanel → **"File Manager"**
2. Navigate to `/public_html/shophub`
3. Upload all files

**Option B: FTP (Recommended)**
1. hPanel → **"FTP Accounts"**
2. Create/use FTP account
3. Download FileZilla
4. Connect and upload all files

### Step 7: Configure Environment Variables

1. hPanel → **"Node.js"** → Click your app
2. Scroll to **"Environment Variables"**
3. Add these variables ONE BY ONE:

```
Variable Name: MONGO_URI
Value: mongodb+srv://sourboii2002_db_user:YOUR_PASSWORD@cluster0.b0fymfr.mongodb.net/shophub?retryWrites=true&w=majority&appName=Cluster0

Variable Name: JWT_SECRET
Value: [Generate a random 32+ character string]

Variable Name: STRIPE_SECRET_KEY
Value: sk_live_your_actual_key

Variable Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_your_actual_key

Variable Name: PORT
Value: 3001

Variable Name: NODE_ENV
Value: production
```

### Step 8: Install Dependencies via SSH

1. hPanel → **"Advanced"** → **"SSH Access"**
2. Enable SSH and note credentials
3. Open terminal and connect:
   ```bash
   ssh username@your-domain.com -p 65002
   ```
4. Navigate to app:
   ```bash
   cd public_html/shophub
   ```
5. Install dependencies:
   ```bash
   npm install --production
   ```

### Step 9: Create Uploads Directory

Still in SSH:
```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### Step 10: Start Application

1. Go back to hPanel → **"Node.js"**
2. Click your application
3. Click **"Start Application"**
4. Wait for status: **"Running"** ✅

### Step 11: Enable SSL Certificate

1. hPanel → **"Security"** → **"SSL"**
2. Find your domain
3. Click **"Install SSL"** (free)
4. Wait 5-10 minutes

### Step 12: Update Stripe Key in Frontend

Edit `public/js/customer.js` line ~8:
```javascript
const stripe = Stripe('pk_live_YOUR_ACTUAL_LIVE_KEY');
```

Upload the updated file.

### Step 13: Test Your Application

Visit: `https://yourdomain.com`

Test these features:
- [ ] Homepage loads
- [ ] Signup new user
- [ ] Login as customer
- [ ] Browse products
- [ ] Add to cart
- [ ] Checkout (use Stripe test card: 4242 4242 4242 4242)
- [ ] Login as admin: admin@shophub.com / Admin@2024
- [ ] Login as master: master@shophub.com / Master@2024
- [ ] Upload product image
- [ ] Create new product
- [ ] Edit product
- [ ] View sales analytics

---

## 🔧 Troubleshooting

### Issue: Application won't start

**Solution:**
```bash
# SSH into server
cd public_html/shophub
npm install
node server.js
# Check error messages
```

### Issue: Cannot connect to database

**Solution:**
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify password in MONGO_URI is correct (no < > brackets)
- Check database user has read/write permissions

### Issue: Images won't upload

**Solution:**
```bash
# SSH into server
cd public_html/shophub
mkdir -p public/uploads
chmod 755 public/uploads
chown -R username:username public/uploads
```

### Issue: Stripe payments fail

**Solution:**
- Verify you're using LIVE keys (pk_live_... and sk_live_...)
- Check Stripe dashboard for error logs
- Ensure domain is added to Stripe allowed domains

### Issue: 502 Bad Gateway

**Solution:**
- Check if Node.js app is running (hPanel → Node.js)
- Verify PORT matches in .htaccess and environment variables
- Check application logs for errors

---

## 📱 Post-Deployment Tasks

- [ ] Test all features thoroughly
- [ ] Set up custom domain (if not done)
- [ ] Configure email notifications (optional)
- [ ] Set up monitoring/alerts
- [ ] Create database backups schedule
- [ ] Update admin/master passwords
- [ ] Add Google Analytics (optional)
- [ ] Set up CDN for images (optional)

---

## 🔐 Security Checklist

- [ ] SSL certificate active (https://)
- [ ] Strong JWT_SECRET (32+ random characters)
- [ ] Change default admin/master passwords
- [ ] Environment variables not in code
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Rate limiting enabled (already in code)
- [ ] CORS configured properly (already in code)

---

## 📞 Support Resources

- **Hostinger Support**: 24/7 live chat in hPanel
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Stripe Docs**: https://stripe.com/docs
- **Node.js on Hostinger**: https://support.hostinger.com/en/articles/5617201

---

## 🎯 Quick Reference

**Admin Login:**
- Email: admin@shophub.com
- Password: Admin@2024

**Master Login:**
- Email: master@shophub.com
- Password: Master@2024

**MongoDB Cluster:**
- Host: cluster0.b0fymfr.mongodb.net
- User: sourboii2002_db_user
- Database: shophub

**Application:**
- Port: 3001
- Startup: server.js
- Node: 18.x+

---

Good luck with your deployment! 🚀

