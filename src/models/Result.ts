import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  _id: Number,
  score: { type: Number, required: true },
  examId: { type: Number, ref: 'Exam' },
  assignmentId: { type: Number, ref: 'Assignment' },
  studentId: { type: String, ref: 'Student', required: true }
});

export default mongoose.models.Result || mongoose.model('Result', ResultSchema);
