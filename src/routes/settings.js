import express from 'express';
import RestaurantSettings from '../models/RestaurantSettings.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get restaurant settings (public)
router.get('/', async (req, res) => {
  try {
    let settings = await RestaurantSettings.findOne();
    
    // Create default settings if none exist
    if (!settings) {
      const defaultOpeningHours = [
        { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '22:00', lastOrderTime: '21:30' },
        { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00', lastOrderTime: '21:30' },
        { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00', lastOrderTime: '21:30' },
        { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '22:00', lastOrderTime: '21:30' },
        { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '23:00', lastOrderTime: '22:30' },
        { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '23:00', lastOrderTime: '22:30' },
        { day: 'sunday', isOpen: true, openTime: '10:00', closeTime: '21:00', lastOrderTime: '20:30' }
      ];
      
      settings = await RestaurantSettings.create({
        openingHours: defaultOpeningHours
      });
    }
    
    // Add current status
    const response = settings.toObject();
    response.isCurrentlyOpen = settings.isCurrentlyOpen();
    response.isAcceptingOrders = settings.isAcceptingOrders();
    
    res.json(response);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update restaurant settings
router.put('/', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    let settings = await RestaurantSettings.findOne();
    
    if (!settings) {
      settings = await RestaurantSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    
    const response = settings.toObject();
    response.isCurrentlyOpen = settings.isCurrentlyOpen();
    response.isAcceptingOrders = settings.isAcceptingOrders();
    
    res.json(response);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update opening hours for a specific day
router.put('/hours/:day', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const { day } = req.params;
    const { isOpen, openTime, closeTime, lastOrderTime } = req.body;
    
    let settings = await RestaurantSettings.findOne();
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }
    
    const dayIndex = settings.openingHours.findIndex(h => h.day === day.toLowerCase());
    if (dayIndex === -1) {
      return res.status(404).json({ message: 'Day not found' });
    }
    
    settings.openingHours[dayIndex] = {
      day: day.toLowerCase(),
      isOpen: isOpen !== undefined ? isOpen : settings.openingHours[dayIndex].isOpen,
      openTime: openTime || settings.openingHours[dayIndex].openTime,
      closeTime: closeTime || settings.openingHours[dayIndex].closeTime,
      lastOrderTime: lastOrderTime || settings.openingHours[dayIndex].lastOrderTime
    };
    
    await settings.save();
    
    res.json(settings);
  } catch (err) {
    console.error('Update hours error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

