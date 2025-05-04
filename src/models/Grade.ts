import mongoose from 'mongoose';

const GradeSchema = new mongoose.Schema({
  _id: Number,
  level: { type: Number, unique: true, required: true }
});

export default mongoose.models.Grade || mongoose.model('Grade', GradeSchema);
