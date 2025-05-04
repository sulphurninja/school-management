import mongoose from 'mongoose';

const ClassSchema = new mongoose.Schema({
  _id: Number,
  name: { type: String, unique: true, required: true },
  capacity: { type: Number, required: true },
  supervisorId: { type: String, ref: 'Teacher' },
  gradeId: { type: Number, ref: 'Grade', required: true }
});

export default mongoose.models.Class || mongoose.model('Class', ClassSchema);
