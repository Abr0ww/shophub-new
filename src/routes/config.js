import express from 'express';

const router = express.Router();

// Get public configuration (like Stripe publishable key)
router.get('/stripe-key', (_req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51QYourKeyHere',
    pointValue: Number(process.env.POINT_VALUE || 0.5)
  });
});

export default router;

