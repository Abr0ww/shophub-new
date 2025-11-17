import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

function createToken(user) {
  const payload = { userId: user._id, role: user.role, name: user.name };
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  return token;
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role: role || 'customer' });
    const token = createToken(user);
    return res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hardcoded Master Account
    if (email === 'master@shophub.com' && password === 'Master@2024') {
      const masterUser = {
        _id: 'master-account-id',
        name: 'Master Admin',
        email: 'master@shophub.com',
        role: 'master',
        points: 0
      };
      const token = createToken(masterUser);
      return res.json({ 
        token, 
        user: { 
          id: masterUser._id, 
          name: masterUser.name, 
          email: masterUser.email, 
          role: masterUser.role, 
          points: masterUser.points 
        } 
      });
    }
    
    // Hardcoded Admin Account
    if (email === 'admin@shophub.com' && password === 'Admin@2024') {
      const adminUser = {
        _id: 'admin-account-id',
        name: 'Store Admin',
        email: 'admin@shophub.com',
        role: 'admin',
        points: 0
      };
      const token = createToken(adminUser);
      return res.json({ 
        token, 
        user: { 
          id: adminUser._id, 
          name: adminUser.name, 
          email: adminUser.email, 
          role: adminUser.role, 
          points: adminUser.points 
        } 
      });
    }
    
    // Regular user authentication (customers)
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = createToken(user);
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points } });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;


