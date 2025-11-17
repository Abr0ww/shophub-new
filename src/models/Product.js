import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  offerPercent: { type: Number, default: 0 },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isAvailable: { type: Boolean, default: true },
  
  // E-commerce specific fields
  stock: { type: Number, default: 0, min: 0 }, // quantity in stock
  sku: { type: String, default: '' }, // stock keeping unit
  brand: { type: String, default: '' },
  weight: { type: String, default: '' }, // e.g., "500g", "1.2kg"
  dimensions: { type: String, default: '' }, // e.g., "30x20x15cm"
  
  // Product attributes
  tags: [{ type: String }], // e.g., ['new', 'bestseller', 'featured']
  specifications: [{
    key: { type: String },
    value: { type: String }
  }], // e.g., [{ key: 'Material', value: 'Cotton' }]
  
  // Product variants (sizes, colors, etc.)
  variants: [{
    name: { type: String }, // e.g., 'Size', 'Color'
    options: [{ type: String }] // e.g., ['S', 'M', 'L']
  }],
  
  // Reviews and ratings
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Product', ProductSchema);


