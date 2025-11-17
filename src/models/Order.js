import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [OrderItemSchema], required: true },
  total: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  deliveryPlatform: { 
    type: String, 
    enum: ['none', 'pickup', 'standard', 'express', 'overnight'], 
    default: 'none' 
  },
  shippingAddress: { type: String, default: '' },
  deliveryNotes: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);


