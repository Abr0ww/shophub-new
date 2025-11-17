import mongoose from 'mongoose';

const OfferSchema = new mongoose.Schema({
  imageUrl: { type: String, default: '' },
  headline: { type: String, default: '' },
  subtext: { type: String, default: '' }
}, { timestamps: true });

// Singleton pattern: we will store only one document
export default mongoose.model('Offer', OfferSchema);


