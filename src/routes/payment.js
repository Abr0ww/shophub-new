import express from 'express';
import Stripe from 'stripe';
import { authenticate, requireRole } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

const router = express.Router();

// Lazy-load Stripe to ensure env vars are loaded
let stripe = null;
function getStripe() {
  if (!stripe) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.includes('placeholder')) {
      throw new Error('STRIPE_SECRET_KEY not configured in .env file');
    }
    console.log('Stripe key loaded:', `${stripeKey.substring(0, 20)}...`);
    stripe = new Stripe(stripeKey);
  }
  return stripe;
}

const POINT_VALUE = Number(process.env.POINT_VALUE || 0.5);

function calculateLineTotal(product, quantity) {
  const priceAfterDiscount = product.price * (1 - (product.offerPercent || 0) / 100);
  return {
    priceAfterDiscount,
    lineTotal: priceAfterDiscount * quantity
  };
}

// Create payment intent
router.post('/create-intent', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const { items, pointsToRedeem } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [String(p._id), p]));

    let total = 0;
    for (const i of items) {
      const p = productMap.get(String(i.productId));
      if (!p) return res.status(400).json({ message: 'Invalid product' });
      const { lineTotal } = calculateLineTotal(p, i.quantity);
      total += lineTotal;
    }
    total = Math.round(total * 100) / 100;

    const requestedPoints = Math.max(0, Math.floor(Number(pointsToRedeem) || 0));
    // Stripe requires minimum $0.50 AUD payment
    const STRIPE_MIN_AMOUNT = 0.50;
    const maxRedeemablePoints = Math.min(
      user.points,
      Math.floor(Math.max(total - STRIPE_MIN_AMOUNT, 0) / POINT_VALUE)
    );
    const pointsApplied = Math.min(requestedPoints, maxRedeemablePoints);
    const discount = Math.min(total, Math.round(pointsApplied * POINT_VALUE * 100) / 100);
    const payable = Math.max(total - discount, 0);

    // Ensure minimum Stripe amount
    if (payable < STRIPE_MIN_AMOUNT) {
      return res.status(400).json({ 
        message: `Payment amount must be at least $${STRIPE_MIN_AMOUNT.toFixed(2)} AUD. Please reduce points redemption.` 
      });
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(payable * 100),
      currency: 'aud',
      payment_method_types: ['card'],
      metadata: {
        userId: String(req.user.userId),
        orderItems: JSON.stringify(items),
        pointsRedeemed: String(pointsApplied),
        pointValue: String(POINT_VALUE),
        discount: discount.toFixed(2),
        subtotal: total.toFixed(2)
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: payable,
      pointsApplied,
      discount,
      pointsRemaining: user.points - pointsApplied
    });
  } catch (err) {
    console.error('Payment intent error:', err);
    const errorMessage = err.message || 'Payment intent creation failed';
    res.status(500).json({ message: errorMessage, error: err.type || 'unknown' });
  }
});

// Confirm payment and create order
router.post('/confirm', authenticate, requireRole('customer'), async (req, res) => {
  try {
    const { paymentIntentId, items } = req.body;
    if (!paymentIntentId) return res.status(400).json({ message: 'Payment intent ID required' });

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not succeeded' });
    }

    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map(p => [String(p._id), p]));

    const orderItems = [];
    let subtotal = 0;
    for (const i of items) {
      const p = productMap.get(String(i.productId));
      if (!p) return res.status(400).json({ message: 'Invalid product' });
      const { priceAfterDiscount, lineTotal } = calculateLineTotal(p, i.quantity);
      subtotal += lineTotal;
      orderItems.push({ productId: p._id, name: p.name, price: priceAfterDiscount, quantity: i.quantity });
    }

    const pointsRedeemed = Math.max(0, Math.floor(Number(paymentIntent.metadata?.pointsRedeemed) || 0));
    const pointValue = Number(paymentIntent.metadata?.pointValue) || POINT_VALUE;
    const STRIPE_MIN_AMOUNT = 0.50;
    const maxPointsFromSubtotal = Math.floor(Math.max(subtotal - STRIPE_MIN_AMOUNT, 0) / pointValue);
    const effectivePointsRedeemed = Math.min(pointsRedeemed, maxPointsFromSubtotal);
    const discount = Math.min(subtotal, Math.round(effectivePointsRedeemed * pointValue * 100) / 100);
    const payable = Math.max(subtotal - discount, 0);

    const order = await Order.create({
      userId: req.user.userId,
      items: orderItems,
      total: Math.round(payable * 100) / 100,
      discount: Math.round(discount * 100) / 100
    });

    // Earn 1 point per $1 spent (you can adjust this ratio)
    const pointsEarned = Math.floor(order.total);
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $inc: { points: pointsEarned - effectivePointsRedeemed } },
      { new: true, projection: { passwordHash: 0 } }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      order,
      orderId: order._id,
      pointsEarned,
      pointsSpent: effectivePointsRedeemed,
      newPoints: updatedUser.points,
      paymentIntentId
    });
  } catch (err) {
    console.error('Payment confirmation error:', err);
    res.status(500).json({ message: 'Order creation failed' });
  }
});

export default router;

