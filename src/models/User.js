import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'master'], default: 'customer', index: true },
  points: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);


