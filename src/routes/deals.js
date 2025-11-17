import express from 'express';
import Deal from '../models/Deal.js';
import UserDeal from '../models/UserDeal.js';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all active deals
router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find({ 
      isActive: true,
      $or: [
        { expiryDate: { $exists: false } },
        { expiryDate: { $gte: new Date() } }
      ]
    }).sort({ pointsCost: 1 });
    res.json(deals);
  } catch (err) {
    console.error('Get deals error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's redeemed deals
router.get('/my-deals', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const userDeals = await UserDeal.find({ 
      userId: req.user.userId,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } }
      ]
    }).populate('dealId');
    res.json(userDeals);
  } catch (err) {
    console.error('Get user deals error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Redeem a deal with points
router.post('/redeem/:dealId', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.dealId);
    if (!deal || !deal.isActive) {
      return res.status(404).json({ message: 'Deal not found or inactive' });
    }

    // Check if deal has expired
    if (deal.expiryDate && deal.expiryDate < new Date()) {
      return res.status(400).json({ message: 'Deal has expired' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough points
    if (user.points < deal.pointsCost) {
      return res.status(400).json({ 
        message: `Insufficient points. Need ${deal.pointsCost}, have ${user.points}` 
      });
    }

    // Check if user has already redeemed this deal (and max uses)
    const existingUserDeal = await UserDeal.findOne({
      userId: req.user.userId,
      dealId: deal._id
    });

    if (existingUserDeal && existingUserDeal.usedCount >= deal.maxUses) {
      return res.status(400).json({ 
        message: `You've already redeemed this deal the maximum number of times (${deal.maxUses})` 
      });
    }

    // Deduct points from user
    user.points -= deal.pointsCost;
    await user.save();

    // Create or update user deal
    let userDeal;
    if (existingUserDeal) {
      existingUserDeal.usedCount += 1;
      existingUserDeal.redeemedAt = Date.now();
      existingUserDeal.isActive = true;
      await existingUserDeal.save();
      userDeal = existingUserDeal;
    } else {
      // Set expiry for redeemed deal (e.g., 30 days from redemption)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      userDeal = await UserDeal.create({
        userId: req.user.userId,
        dealId: deal._id,
        expiresAt
      });
    }

    await userDeal.populate('dealId');

    res.json({ 
      message: 'Deal redeemed successfully!',
      userDeal,
      pointsRemaining: user.points
    });
  } catch (err) {
    console.error('Redeem deal error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create a new deal
router.post('/', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const { title, description, pointsCost, discountType, discountValue, imageUrl, minOrderValue, maxUses, expiryDate } = req.body;
    
    if (!title || !description || !pointsCost || !discountValue) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const deal = await Deal.create({
      title,
      description,
      pointsCost: Number(pointsCost),
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      imageUrl: imageUrl || '',
      minOrderValue: Number(minOrderValue) || 0,
      maxUses: Number(maxUses) || 1,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined
    });

    res.status(201).json(deal);
  } catch (err) {
    console.error('Create deal error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update a deal
router.put('/:dealId', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.dealId,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json(deal);
  } catch (err) {
    console.error('Update deal error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete a deal
router.delete('/:dealId', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.dealId,
      { isActive: false },
      { new: true }
    );
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json({ message: 'Deal deactivated' });
  } catch (err) {
    console.error('Delete deal error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

