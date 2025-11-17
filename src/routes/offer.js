import express from 'express';
import Offer from '../models/Offer.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get current offer (singleton)
router.get('/', async (_req, res) => {
  const offer = await Offer.findOne();
  res.json(offer || { imageUrl: '', headline: '', subtext: '' });
});

// Upsert offer (admin/master)
router.put('/', authenticate, requireRole('admin', 'master'), async (req, res) => {
  const { imageUrl, headline, subtext } = req.body;
  const existing = await Offer.findOne();
  if (existing) {
    existing.imageUrl = imageUrl ?? existing.imageUrl;
    existing.headline = headline ?? existing.headline;
    existing.subtext = subtext ?? existing.subtext;
    await existing.save();
    return res.json(existing);
  }
  const created = await Offer.create({ imageUrl: imageUrl || '', headline: headline || '', subtext: subtext || '' });
  return res.status(201).json(created);
});

export default router;


