import mongoose from 'mongoose';

const DealSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  pointsCost: { type: Number, required: true }, // Points needed to redeem
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed', 'freeItem'], 
    default: 'percentage' 
  },
  discountValue: { type: Number, required: true }, // % off or $ off
  imageUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date },
  minOrderValue: { type: Number, default: 0 }, // Minimum order to use deal
  maxUses: { type: Number, default: 1 }, // How many times a user can use it
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

DealSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Deal = mongoose.model('Deal', DealSchema);
export default Deal;

