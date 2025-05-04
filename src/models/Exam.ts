import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  _id: Number,
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  lessonId: { type: Number, ref: 'Lesson', required: true }
});

export default mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
