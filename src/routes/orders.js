import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Create order (customer)
router.post('/', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'No items' });

    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [String(p._id), p]));

    const orderItems = [];
    let total = 0;
    for (const i of items) {
      const p = productMap.get(String(i.productId));
      if (!p) return res.status(400).json({ message: 'Invalid product' });
      const priceAfterDiscount = p.price * (1 - (p.offerPercent || 0) / 100);
      const lineTotal = priceAfterDiscount * i.quantity;
      total += lineTotal;
      orderItems.push({ productId: p._id, name: p.name, price: priceAfterDiscount, quantity: i.quantity });
    }

    const order = await Order.create({ userId: req.user.userId, items: orderItems, total: Math.round(total * 100) / 100, discount: 0 });

    // Points: 1 point per $10 spent
    const pointsEarned = Math.floor(order.total / 10);
    await User.findByIdAndUpdate(req.user.userId, { $inc: { points: pointsEarned } });

    res.status(201).json({ order, pointsEarned });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Order history (customer)
router.get('/my', authenticate, requireRole('customer'), async (req, res) => {
  const orders = await Order.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json(orders);
});

// Update delivery platform for an order (customer)
router.patch('/:orderId/delivery-platform', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPlatform } = req.body;
    
    // Validate delivery platform
    const validPlatforms = ['none', 'pickup', 'standard', 'express', 'overnight'];
    if (!validPlatforms.includes(deliveryPlatform)) {
      return res.status(400).json({ message: 'Invalid shipping method' });
    }
    
    // Find order and verify ownership
    const order = await Order.findOne({ _id: orderId, userId: req.user.userId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Update delivery platform
    order.deliveryPlatform = deliveryPlatform;
    await order.save();
    
    res.json({ 
      message: 'Delivery platform updated', 
      order,
      deliveryPlatform: order.deliveryPlatform 
    });
  } catch (err) {
    console.error('Error updating delivery platform:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


