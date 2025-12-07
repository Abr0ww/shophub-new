# 🔧 MongoDB Atlas Setup for Render.com

## Your MongoDB Credentials

- **Username:** EliteHeights
- **Password:** EliteHeights
- **Cluster:** cluster0.btlp6ts.mongodb.net
- **Database Name:** food_app (or shophub - your choice)

## ✅ Complete Connection String

**For Render.com Environment Variable:**

```
mongodb+srv://EliteHeights:EliteHeights@cluster0.btlp6ts.mongodb.net/food_app?retryWrites=true&w=majority&appName=Cluster0
```

**Note:** The password `EliteHeights` has no special characters, so no URL encoding is needed!

## 📋 Step-by-Step Setup

### 1. Whitelist IP Addresses in MongoDB Atlas

**CRITICAL:** Do this first, or Render won't be able to connect!

1. Go to https://cloud.mongodb.com
2. Sign in and select your project
3. Click **"Network Access"** (left sidebar, under Security)
4. Click **"Add IP Address"**
5. Select **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
6. Click **"Confirm"**
7. Wait 1-2 minutes for status to show "Active"

### 2. Create Database User (if not already done)

1. In MongoDB Atlas, go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Set:
   - **Authentication Method:** Password
   - **Username:** EliteHeights
   - **Password:** EliteHeights
   - **Database User Privileges:** Read and write to any database (or specific database)
4. Click **"Add User"**

### 3. Set Environment Variable in Render.com

1. Go to your Render Dashboard
2. Click on your service (shophub)
3. Go to **"Environment"** tab
4. Find or add `MONGO_URI`
5. Set the value to:
   ```
   mongodb+srv://EliteHeights:EliteHeights@cluster0.btlp6ts.mongodb.net/food_app?retryWrites=true&w=majority&appName=Cluster0
   ```
6. Click **"Save Changes"**
7. Render will automatically restart your service

### 4. Verify Connection

1. After restart, go to **"Logs"** tab in Render
2. You should see:
   ```
   ✅ Connected to MongoDB
   🚀 Server running on port XXXX
   ```
3. If you see connection errors, check:
   - IP whitelist is set to `0.0.0.0/0`
   - Connection string is correct (especially password encoding)
   - Database user exists and has correct permissions

## 🔍 Testing Connection String Locally

Before deploying, test the connection string locally:

1. Update your local `.env` file:
   ```
   MONGO_URI=mongodb+srv://EliteHeights:EliteHeights@cluster0.btlp6ts.mongodb.net/food_app?retryWrites=true&w=majority&appName=Cluster0
   ```

2. Run your server:
   ```bash
   npm start
   ```

3. You should see: `✅ Connected to MongoDB`

If it works locally, it will work on Render (after IP whitelisting).

## 🚨 Common Issues

### Issue: "Authentication failed"
- **Solution:** Check username and password are correct
- Verify password is URL-encoded in connection string
- Check database user exists in MongoDB Atlas

### Issue: "Could not connect - IP not whitelisted"
- **Solution:** Add `0.0.0.0/0` to Network Access in MongoDB Atlas
- Wait 1-2 minutes for changes to apply

### Issue: "Database not found"
- **Solution:** MongoDB will create the database automatically on first connection
- Or create it manually in MongoDB Atlas

## 📝 Quick Reference

**Connection String Format:**
```
mongodb+srv://USERNAME:URL_ENCODED_PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority&appName=Cluster0
```

**Your Values:**
- Username: `EliteHeights`
- Password: `EliteHeights` (no special characters, no encoding needed)
- Cluster: `cluster0.btlp6ts.mongodb.net`
- Database: `food_app` (or `shophub`)

**Render.com Environment Variable:**
- Key: `MONGO_URI`
- Value: `mongodb+srv://EliteHeights:EliteHeights@cluster0.btlp6ts.mongodb.net/food_app?retryWrites=true&w=majority&appName=Cluster0`

---

**After completing these steps, your Render deployment should connect successfully!** 🎉

