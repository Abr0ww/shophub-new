import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all active categories (public)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category with products
router.get('/:categoryId', async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const products = await Product.find({ 
      categoryId: req.params.categoryId,
      isAvailable: true 
    });
    
    res.json({ category, products });
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create category
router.post('/', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const { name, description, imageUrl, icon, displayOrder } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const category = await Category.create({
      name,
      description: description || '',
      imageUrl: imageUrl || '',
      icon: icon || '🍽️',
      displayOrder: displayOrder || 0
    });
    
    res.status(201).json(category);
  } catch (err) {
    console.error('Create category error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Category name already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update category
router.put('/:categoryId', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete (deactivate) category
router.delete('/:categoryId', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.categoryId,
      { isActive: false },
      { new: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ message: 'Category deactivated', category });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

