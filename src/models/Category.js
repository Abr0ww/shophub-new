import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  icon: { type: String, default: '🍽️' }, // Emoji icon
  displayOrder: { type: Number, default: 0 }, // For sorting
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CategorySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Category = mongoose.model('Category', CategorySchema);
export default Category;

