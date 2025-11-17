import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['feedback', 'complaint', 'suggestion', 'bug'], default: 'feedback' },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Feedback', feedbackSchema);

