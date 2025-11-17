import mongoose from 'mongoose';

const deliveryPlatformSchema = new mongoose.Schema({
  ubereatsUrl: {
    type: String,
    default: 'https://www.ubereats.com/au'
  },
  menulogUrl: {
    type: String,
    default: 'https://www.menulog.com.au/'
  },
  doordashUrl: {
    type: String,
    default: 'https://www.doordash.com/en-AU'
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Ensure only one document exists
deliveryPlatformSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const DeliveryPlatforms = mongoose.model('DeliveryPlatforms', deliveryPlatformSchema);

export default DeliveryPlatforms;

