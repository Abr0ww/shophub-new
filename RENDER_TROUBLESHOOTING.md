# 🚨 Render.com Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. ❌ Server Failure / Deployment Failed

**Symptoms:**
- Service shows "Failed" status in Render dashboard
- Logs show "MongoDB connection error"
- Service crashes immediately after starting

**Solutions:**

#### Check Environment Variables
1. Go to your Render service dashboard
2. Click **"Environment"** tab
3. Verify these variables are set:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   JWT_SECRET=your-secret-key-here
   STRIPE_SECRET_KEY=sk_live_... (or sk_test_...)
   STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_...)
   POINT_VALUE=0.5
   NODE_ENV=production
   ```
4. **IMPORTANT:** Do NOT set `PORT` - Render provides this automatically

#### MongoDB Connection Issues
- **Check MongoDB Atlas Network Access:**
  1. Go to MongoDB Atlas → Network Access
  2. Click "Add IP Address"
  3. Select "Allow Access from Anywhere" (0.0.0.0/0)
  4. Click "Confirm"
  
- **Verify Connection String:**
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`
  - Replace `username`, `password`, `cluster`, and `dbname` with your actual values
  - No `< >` brackets in the actual value
  - Password should be URL-encoded if it contains special characters

- **Test Connection:**
  - Copy your MONGO_URI
  - Test it locally first before deploying

### 2. ⚠️ Service Keeps Restarting

**Symptoms:**
- Service status shows "Starting" then "Failed" repeatedly
- Logs show connection timeouts

**Solutions:**
- Check MongoDB connection string is correct
- Verify MongoDB Atlas allows connections from Render's IPs
- Check if database user has correct permissions
- Review logs for specific error messages

### 3. 🔍 How to Check Logs

1. Go to Render dashboard
2. Click on your service
3. Click **"Logs"** tab
4. Look for:
   - `✅ Connected to MongoDB` - Good!
   - `❌ MongoDB connection error` - Bad, check MONGO_URI
   - `🚀 Server running on port XXXX` - Good!
   - `Missing required environment variables` - Add missing vars

### 4. 📋 Environment Variables Checklist

**Required for Production:**
- [ ] `MONGO_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Random secure string (32+ characters)
- [ ] `NODE_ENV=production`

**Optional but Recommended:**
- [ ] `STRIPE_SECRET_KEY` - For payment processing
- [ ] `STRIPE_PUBLISHABLE_KEY` - For payment processing
- [ ] `POINT_VALUE=0.5` - Loyalty points value

**DO NOT SET:**
- ❌ `PORT` - Render provides this automatically

### 5. 🔧 Step-by-Step Fix Process

1. **Check Render Logs:**
   ```
   Render Dashboard → Your Service → Logs
   ```

2. **Identify the Error:**
   - MongoDB connection error? → Check MONGO_URI
   - Missing environment variable? → Add it
   - Port already in use? → Remove PORT from env vars

3. **Update Environment Variables:**
   - Render Dashboard → Your Service → Environment
   - Add/Update variables
   - Click "Save Changes"
   - Service will auto-restart

4. **Verify MongoDB Atlas:**
   - Network Access allows 0.0.0.0/0
   - Database user exists and has permissions
   - Connection string is correct

5. **Redeploy if Needed:**
   - Render Dashboard → Your Service → Manual Deploy
   - Or push to your connected Git branch

### 6. 🐛 Common Error Messages

**"MongoDB connection error: Authentication failed"**
- Solution: Check username/password in MONGO_URI
- Verify database user exists in MongoDB Atlas

**"MongoDB connection error: timeout"**
- Solution: Check Network Access in MongoDB Atlas
- Ensure 0.0.0.0/0 is whitelisted

**"Missing required environment variables"**
- Solution: Add missing variables in Render Environment tab

**"EADDRINUSE: address already in use"**
- Solution: Remove PORT from environment variables (Render sets it automatically)

**"Cannot find module"**
- Solution: Ensure package.json is correct and dependencies are installed
- Check build logs for npm install errors

### 7. ✅ Verification Steps

After fixing issues, verify:

1. **Service Status:**
   - Should show "Live" (green)
   - Not "Failed" or "Starting"

2. **Logs Should Show:**
   ```
   ✅ Connected to MongoDB
   🚀 Server running on port XXXX
   ```

3. **Test Your Website:**
   - Visit your Render URL
   - Should load the login page
   - Try signing up a new user
   - Check browser console for errors

### 8. 📞 Getting More Help

**Render Support:**
- Render Dashboard → Support
- Check Render Docs: https://render.com/docs

**MongoDB Atlas:**
- MongoDB Atlas Support: https://www.mongodb.com/support
- Check connection string format: https://docs.atlas.mongodb.com/connection-string/

**Application Logs:**
- Always check Render logs first
- Look for error messages starting with ❌ or error keywords

### 9. 🔄 Quick Reset Process

If nothing works, try this:

1. **Delete and Recreate Service:**
   - Render Dashboard → Your Service → Settings → Delete
   - Create new service from same repo
   - Set all environment variables again

2. **Or Manual Deploy:**
   - Render Dashboard → Your Service → Manual Deploy
   - Select latest commit
   - Deploy

### 10. 🎯 Pre-Deployment Checklist

Before deploying to Render:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network Access allows 0.0.0.0/0
- [ ] Connection string tested locally
- [ ] All environment variables ready
- [ ] Stripe keys obtained (if using payments)
- [ ] JWT_SECRET generated (random 32+ char string)
- [ ] Code pushed to GitHub/GitLab
- [ ] render.yaml configured (optional)

---

## 🚀 Quick Fix Commands

**If you have SSH access (Render doesn't provide this by default):**
- Not applicable - Render is managed hosting

**What you CAN do:**
- Update environment variables via dashboard
- View logs in real-time
- Trigger manual deployments
- Rollback to previous deployments

---

## 📝 Notes

- Render automatically provides the PORT environment variable
- Never set PORT manually in Render
- MongoDB Atlas free tier works fine with Render
- Service restarts automatically when you update environment variables
- Build logs show npm install progress
- Runtime logs show application output

---

**Last Updated:** After fixing server.js MongoDB connection handling

