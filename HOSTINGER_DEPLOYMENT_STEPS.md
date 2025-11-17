# 🚀 Quick Hostinger Deployment Steps

## Your MongoDB Atlas Details

**Cluster:** `cluster0.b0fymfr.mongodb.net`  
**Username:** `sourboii2002_db_user`  
**Password:** `[Your password from Atlas]`  
**Database:** `shophub`

**Connection String:**
```
mongodb+srv://sourboii2002_db_user:<YOUR_PASSWORD>@cluster0.b0fymfr.mongodb.net/shophub?retryWrites=true&w=majority&appName=Cluster0
```

---

## ✅ Current Status

- [x] MongoDB Atlas cluster created
- [x] Database user created
- [ ] **NEXT: Click "Done" in MongoDB Atlas**
- [ ] **NEXT: Whitelist all IPs (0.0.0.0/0)**
- [ ] Get Stripe LIVE keys
- [ ] Upload to Hostinger

---

## 📝 Quick Steps

### 1. Finish MongoDB Setup (5 minutes)

1. In MongoDB Atlas, click **"Done"** button
2. Go to **"Network Access"** (left sidebar)
3. Click **"Add IP Address"**
4. Select **"Allow Access from Anywhere"**
5. Enter: `0.0.0.0/0`
6. Click **"Confirm"**

### 2. Get Stripe Keys (2 minutes)

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (pk_live_...)
3. Copy your **Secret key** (sk_live_...)
4. Save them securely

### 3. Login to Hostinger (1 minute)

1. Go to https://www.hostinger.com
2. Login
3. Click **"Hosting"** → **"Manage"**

### 4. Create Node.js App (3 minutes)

1. In hPanel, find **"Advanced"** section
2. Click **"Node.js"**
3. Click **"Create Application"**
4. Fill in:
   - **Node.js version:** 18.x
   - **Application mode:** Production
   - **Application root:** `/public_html/shophub`
   - **Application URL:** Your domain
   - **Application startup file:** `server.js`
   - **Port:** 3001
5. Click **"Create"**

### 5. Upload Files via FTP (10 minutes)

**Files to upload:**
- ✅ `server.js`
- ✅ `package.json`
- ✅ `.htaccess`
- ✅ `ecosystem.config.js`
- ✅ `/src/` folder (all files)
- ✅ `/public/` folder (all files)

**Don't upload:**
- ❌ `node_modules/`
- ❌ `.env`
- ❌ `.git/`

**How to upload:**
1. hPanel → **"FTP Accounts"**
2. Create FTP account
3. Use FileZilla to connect
4. Upload to `/public_html/shophub/`

### 6. Set Environment Variables (5 minutes)

1. hPanel → **"Node.js"** → Click your app
2. Scroll to **"Environment Variables"**
3. Add these (click "Add Variable" for each):

```
MONGO_URI = mongodb+srv://sourboii2002_db_user:YOUR_PASSWORD@cluster0.b0fymfr.mongodb.net/shophub?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET = [Generate random 32+ character string]

STRIPE_SECRET_KEY = sk_live_your_key_here

STRIPE_PUBLISHABLE_KEY = pk_live_your_key_here

PORT = 3001

NODE_ENV = production
```

**Generate JWT_SECRET:**
- Go to https://www.uuidgenerator.net/
- Copy a UUID and use it

### 7. Install Dependencies via SSH (5 minutes)

1. hPanel → **"Advanced"** → **"SSH Access"**
2. Enable SSH
3. Note your SSH details
4. Open terminal:
   ```bash
   ssh username@your-domain.com -p 65002
   ```
5. Navigate and install:
   ```bash
   cd public_html/shophub
   npm install --production
   mkdir -p public/uploads
   chmod 755 public/uploads
   ```

### 8. Start Application (1 minute)

1. hPanel → **"Node.js"**
2. Click your application
3. Click **"Start Application"**
4. Wait for **"Running"** status ✅

### 9. Enable SSL (5 minutes)

1. hPanel → **"Security"** → **"SSL"**
2. Find your domain
3. Click **"Install SSL"**
4. Wait 5-10 minutes

### 10. Update Frontend Stripe Key (2 minutes)

1. Edit `public/js/customer.js`
2. Find line ~8:
   ```javascript
   const stripe = Stripe('pk_test_...');
   ```
3. Replace with your LIVE key:
   ```javascript
   const stripe = Stripe('pk_live_YOUR_ACTUAL_KEY');
   ```
4. Re-upload the file

### 11. Test Everything! (10 minutes)

Visit: `https://yourdomain.com`

- [ ] Homepage loads
- [ ] Signup works
- [ ] Login works
- [ ] Products display
- [ ] Add to cart
- [ ] Checkout (use test card: 4242 4242 4242 4242)
- [ ] Admin login: admin@shophub.com / Admin@2024
- [ ] Master login: master@shophub.com / Master@2024
- [ ] Upload image
- [ ] Create product
- [ ] View sales

---

## 🆘 Quick Troubleshooting

### App won't start?
```bash
ssh username@domain.com -p 65002
cd public_html/shophub
node server.js
# Check error messages
```

### Database connection fails?
- Check MongoDB Atlas Network Access allows 0.0.0.0/0
- Verify password in MONGO_URI (no brackets!)
- Check user has read/write permissions

### Images won't upload?
```bash
cd public_html/shophub
mkdir -p public/uploads
chmod 755 public/uploads
```

### 502 Bad Gateway?
- Check Node.js app is running (hPanel → Node.js)
- Verify PORT is 3001 in both .htaccess and env variables
- Check application logs

---

## 📞 Need Help?

- **Hostinger Support:** 24/7 live chat in hPanel
- **MongoDB:** https://www.mongodb.com/docs/atlas/
- **Stripe:** https://stripe.com/docs

---

## 🎯 Important Links

- **MongoDB Atlas:** https://cloud.mongodb.com
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Hostinger hPanel:** https://hpanel.hostinger.com
- **UUID Generator:** https://www.uuidgenerator.net/

---

## ✨ Your App Credentials

**Admin:**
- Email: admin@shophub.com
- Password: Admin@2024

**Master:**
- Email: master@shophub.com
- Password: Master@2024

**Remember to change these after deployment!**

---

**Total Time:** ~45 minutes

Good luck! 🚀

