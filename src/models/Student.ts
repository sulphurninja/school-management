import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  _id: String,
  username: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  address: { type: String, required: true },
  img: String,
  bloodType: String,
  sex: { type: String, enum: ['MALE', 'FEMALE'], required: true },
  birthday: { type: Date, required: true },
  parentId: { type: String, ref: 'Parent', required: true },
  classId: { type: Number, ref: 'Class', required: true },
  gradeId: { type: Number, ref: 'Grade', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);
