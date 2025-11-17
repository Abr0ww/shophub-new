import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import Feedback from '../models/Feedback.js';
import User from '../models/User.js';

const router = express.Router();

// Customer: Submit feedback
router.post('/', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const { type, subject, message } = req.body;
    
    console.log('Feedback submission:', { type, subject, message, userId: req.user?.userId });
    
    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }
    
    const feedback = await Feedback.create({
      userId: req.user.userId,
      type: type || 'feedback',
      subject,
      message
    });
    
    console.log('Feedback created successfully:', feedback._id);
    
    res.status(201).json({ 
      message: 'Feedback submitted successfully',
      feedback 
    });
  } catch (err) {
    console.error('Submit feedback error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Failed to submit feedback: ' + err.message });
  }
});

// Customer: Get my feedback
router.get('/my', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.userId })
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (err) {
    console.error('Get my feedback error:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// Admin: Get all feedback
router.get('/all', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'master')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { status } = req.query;
    const query = status ? { status } : {};
    
    const feedback = await Feedback.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (err) {
    console.error('Get all feedback error:', err);
    res.status(500).json({ message: 'Failed to fetch feedback' });
  }
});

// Admin: Update feedback status
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'master')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { status, adminNotes } = req.body;
    
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    ).populate('userId', 'name email');
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    res.json(feedback);
  } catch (err) {
    console.error('Update feedback error:', err);
    res.status(500).json({ message: 'Failed to update feedback' });
  }
});

// Admin: Delete feedback
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'master')) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    console.error('Delete feedback error:', err);
    res.status(500).json({ message: 'Failed to delete feedback' });
  }
});

export default router;

