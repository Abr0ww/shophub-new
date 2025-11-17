import express from 'express';
import Order from '../models/Order.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Daily sales (last 7 days) - admin
router.get('/daily-sales', authenticate, requireRole('admin', 'master'), async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 7);
  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      totalSales: { $sum: '$total' },
      orders: { $sum: 1 }
    } },
    { $sort: { _id: 1 } }
  ]);
  res.json(data);
});

// Weekly sales (last 8 weeks) - admin
router.get('/weekly-sales', authenticate, requireRole('admin', 'master'), async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 7 * 8);
  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: {
      _id: { $isoWeek: '$createdAt' },
      year: { $first: { $isoWeekYear: '$createdAt' } },
      totalSales: { $sum: '$total' },
      orders: { $sum: 1 }
    } },
    { $sort: { year: 1, _id: 1 } }
  ]);
  res.json(data);
});

// Weekly revenue (last 8 weeks) - master
router.get('/weekly-revenue', authenticate, requireRole('master'), async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 7 * 8);
  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: {
      _id: { $isoWeek: '$createdAt' },
      year: { $first: { $isoWeekYear: '$createdAt' } },
      revenue: { $sum: '$total' }
    } },
    { $sort: { year: 1, _id: 1 } }
  ]);
  res.json(data);
});

export default router;


