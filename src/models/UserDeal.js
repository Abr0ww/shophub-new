import mongoose from 'mongoose';

// Track which deals users have redeemed
const UserDealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
  redeemedAt: { type: Date, default: Date.now },
  usedCount: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }, // Can be deactivated after use
  expiresAt: { type: Date } // When this redeemed deal expires
});

UserDealSchema.index({ userId: 1, dealId: 1 });

const UserDeal = mongoose.model('UserDeal', UserDealSchema);
export default UserDeal;

