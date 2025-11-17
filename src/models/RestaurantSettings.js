import mongoose from 'mongoose';

const OpeningHoursSchema = new mongoose.Schema({
  day: { type: String, required: true }, // 'monday', 'tuesday', etc.
  isOpen: { type: Boolean, default: true },
  openTime: { type: String, default: '09:00' }, // 24-hour format
  closeTime: { type: String, default: '22:00' },
  lastOrderTime: { type: String, default: '21:30' } // Last order before closing
}, { _id: false });

const RestaurantSettingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Foodie Restaurant' },
  tagline: { type: String, default: 'Delicious food, delivered fresh' },
  description: { type: String, default: 'We serve the best food in town' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  googleMapsLink: { type: String, default: '' },
  
  // Opening hours for each day
  openingHours: [OpeningHoursSchema],
  
  // Social media
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  
  // Operational settings
  averagePreparationTime: { type: Number, default: 20 }, // minutes
  deliveryEnabled: { type: Boolean, default: false },
  pickupEnabled: { type: Boolean, default: true },
  deliveryRadius: { type: Number, default: 5 }, // km
  deliveryFee: { type: Number, default: 5 }, // $
  minimumOrderValue: { type: Number, default: 10 }, // $
  
  // Legal
  abn: { type: String, default: '' },
  termsUrl: { type: String, default: '' },
  privacyUrl: { type: String, default: '' },
  
  updatedAt: { type: Date, default: Date.now }
});

RestaurantSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if restaurant is currently open
RestaurantSettingsSchema.methods.isCurrentlyOpen = function() {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  
  const todayHours = this.openingHours.find(h => h.day === currentDay);
  if (!todayHours || !todayHours.isOpen) return false;
  
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
};

// Method to check if accepting orders
RestaurantSettingsSchema.methods.isAcceptingOrders = function() {
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  
  const todayHours = this.openingHours.find(h => h.day === currentDay);
  if (!todayHours || !todayHours.isOpen) return false;
  
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return currentTime >= todayHours.openTime && currentTime <= todayHours.lastOrderTime;
};

const RestaurantSettings = mongoose.model('RestaurantSettings', RestaurantSettingsSchema);
export default RestaurantSettings;

