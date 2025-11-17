# 🔐 ShopHub Admin Credentials

## Hardcoded Admin Accounts

These accounts are hardcoded in the backend and do not exist in the database.

---

### 👑 Master Account
**Email:** `master@shophub.com`  
**Password:** `Master@2024`  
**Role:** Master  
**Access:** Full system access, all admin features

**Login URL:** http://localhost:3001/

---

### 🛠️ Admin Account
**Email:** `admin@shophub.com`  
**Password:** `Admin@2024`  
**Role:** Admin  
**Access:** Store management, products, orders, analytics

**Login URL:** http://localhost:3001/

---

## Customer Accounts

Customers can sign up publicly at:
**Signup URL:** http://localhost:3001/signup.html

All public signups automatically create **customer** accounts only.

---

## Security Notes

⚠️ **IMPORTANT:**
- These credentials are hardcoded in `src/routes/auth.js`
- Change these passwords before deploying to production
- Consider using environment variables for production credentials
- Master and Admin accounts bypass database authentication

---

## How It Works

1. When someone logs in, the system first checks if the email/password matches the hardcoded admin accounts
2. If matched, it creates a JWT token with the appropriate role
3. If not matched, it checks the database for regular customer accounts
4. Customers cannot create admin accounts through signup

---

## Changing Credentials

To change admin credentials, edit the file:
```
src/routes/auth.js
```

Look for the hardcoded credentials section in the `/signin` route.

---

## Production Deployment

For production, consider:
1. Using environment variables:
   ```
   MASTER_EMAIL=your-email@domain.com
   MASTER_PASSWORD=your-secure-password
   ADMIN_EMAIL=admin@domain.com
   ADMIN_PASSWORD=admin-secure-password
   ```

2. Or create a secure admin creation script
3. Or implement invite-only admin registration

