import mongoose from 'mongoose';

const ExamSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  title: { type: String, required: true },
  subjectId: { type: Number, ref: 'Subject', required: true },
  teacherId: { type: String, ref: 'Teacher', required: true },
  classId: { type: Number, ref: 'Class' },
  gradeId: { type: Number, ref: 'Grade' },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, default: 60 }, // minutes
  room: { type: String, default: '' },
  type: {
    type: String,
    enum: ['midterm', 'final', 'quiz', 'practical'],
    default: 'midterm'
  },
  maxScore: { type: Number, default: 100 },
  instructions: { type: String, default: '' },
  syllabus: [{ type: String }], // Array of topics
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

const Exam = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
export default Exam;
