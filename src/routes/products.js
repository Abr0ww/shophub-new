import express from 'express';
import Product from '../models/Product.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// List products (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { offers, category, available } = req.query;
    
    const filter = {};
    if (offers === 'true') filter.offerPercent = { $gt: 0 };
    if (category) filter.categoryId = category;
    if (available !== undefined) filter.isAvailable = available === 'true';
    
    const products = await Product.find(filter)
      .populate('categoryId', 'name icon')
      .sort({ createdAt: -1 });
    
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate('categoryId');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin create product
router.post('/', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const { name, imageUrl, price, description, offerPercent, categoryId, preparationTime, tags, allergens } = req.body;
    
    if (!name || !imageUrl || price == null) {
      return res.status(400).json({ message: 'Missing required fields: name, imageUrl, price' });
    }
    
    const product = await Product.create({ 
      name, 
      imageUrl, 
      price, 
      description: description || '', 
      offerPercent: offerPercent || 0,
      categoryId: categoryId || null,
      preparationTime: preparationTime || 15,
      tags: tags || [],
      allergens: allergens || []
    });
    
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin update product
router.put('/:productId', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin toggle product availability
router.patch('/:productId/availability', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.isAvailable = !product.isAvailable;
    await product.save();
    
    res.json(product);
  } catch (err) {
    console.error('Toggle availability error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin delete product
router.delete('/:productId', authenticate, requireRole('admin', 'master'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully', product });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


