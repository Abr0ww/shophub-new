import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Deal from '../models/Deal.js';

const router = express.Router();

// Get customer purchases with aggregated data
router.get('/customer-purchases', authenticate, requireRole('master'), async (req, res) => {
  try {
    // Get all customers with their orders
    const customers = await User.find({ role: 'customer' }).select('name email points');
    
    const customerData = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ userId: customer._id })
          .populate('items.productId', 'name imageUrl')
          .sort({ createdAt: -1 })
          .lean();
        
        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
        
        return {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
          points: customer.points,
          totalSpent,
          orders: orders.map(order => ({
            _id: order._id,
            total: order.total,
            items: order.items,
            createdAt: order.createdAt,
            status: order.status
          }))
        };
      })
    );
    
    // Sort by total spent (descending)
    customerData.sort((a, b) => b.totalSpent - a.totalSpent);
    
    res.json(customerData);
  } catch (err) {
    console.error('Get customer purchases error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product by ID (for editing)
router.get('/products/:id', authenticate, requireRole('master'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/products/:id', authenticate, requireRole('master'), async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      stock,
      sku,
      brand,
      weight,
      dimensions,
      offerPercent,
      isAvailable
    } = req.body;
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        description,
        stock,
        sku,
        brand,
        weight,
        dimensions,
        offerPercent,
        isAvailable
      },
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

// Delete product
router.delete('/products/:id', authenticate, requireRole('master'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single deal by ID (for editing)
router.get('/deals/:id', authenticate, requireRole('master'), async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    res.json(deal);
  } catch (err) {
    console.error('Get deal error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update deal
router.put('/deals/:id', authenticate, requireRole('master'), async (req, res) => {
  try {
    const {
      title,
      description,
      pointsCost,
      discountType,
      discountValue,
      minOrderValue,
      maxUses,
      isActive
    } = req.body;
    
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        pointsCost,
        discountType,
        discountValue,
        minOrderValue,
        maxUses,
        isActive
      },
      { new: true, runValidators: true }
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

export default router;

