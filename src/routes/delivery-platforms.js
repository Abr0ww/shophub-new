import express from 'express';
import DeliveryPlatforms from '../models/DeliveryPlatforms.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get delivery platform URLs (public)
router.get('/', async (req, res) => {
  try {
    const settings = await DeliveryPlatforms.getSettings();
    res.json({
      ubereats: settings.ubereatsUrl,
      menulog: settings.menulogUrl,
      doordash: settings.doordashUrl,
      isEnabled: settings.isEnabled
    });
  } catch (err) {
    console.error('Get delivery platforms error:', err);
    res.status(500).json({ message: 'Failed to load delivery platforms' });
  }
});

// Update delivery platform URLs (admin only)
router.put('/', authenticate, requireRole(['admin', 'master']), async (req, res) => {
  try {
    const { ubereatsUrl, menulogUrl, doordashUrl, isEnabled } = req.body;
    
    const settings = await DeliveryPlatforms.getSettings();
    
    if (ubereatsUrl !== undefined) settings.ubereatsUrl = ubereatsUrl;
    if (menulogUrl !== undefined) settings.menulogUrl = menulogUrl;
    if (doordashUrl !== undefined) settings.doordashUrl = doordashUrl;
    if (isEnabled !== undefined) settings.isEnabled = isEnabled;
    
    await settings.save();
    
    res.json({
      message: 'Delivery platform settings updated',
      settings: {
        ubereats: settings.ubereatsUrl,
        menulog: settings.menulogUrl,
        doordash: settings.doordashUrl,
        isEnabled: settings.isEnabled
      }
    });
  } catch (err) {
    console.error('Update delivery platforms error:', err);
    res.status(500).json({ message: 'Failed to update delivery platforms' });
  }
});

export default router;

