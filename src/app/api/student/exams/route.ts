import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import connectToDatabase from '@/lib/db';
import Student from '@/models/Student';
import Exam from '@/models/Exam';
// import ExamResult from '@/models/ExamResult';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded: any = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        return NextResponse.json({ message: 'Token expired' }, { status: 401 });
      }
      if (decoded.role !== 'student') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      const studentId = decoded.id;
      const student = await Student.findById(studentId)
        .populate('classId')
        .populate('gradeId');

      if (!student) {
        return NextResponse.json({ message: 'Student not found' }, { status: 404 });
      }

      // Get exams for student's class/grade
      const exams = await Exam.find({
        $or: [
          { classId: student.classId._id },
          { gradeId: student.gradeId._id }
        ]
      })
      .populate('subjectId', 'name')
      .populate('teacherId', 'name surname')
      .sort({ date: 1 });

      // Get exam results for the student
      const examResults = await ExamResult.find({ studentId });

      const examsWithStatus = exams.map(exam => {
        const result = examResults.find(r => r.examId.toString() === exam._id.toString());
        const now = new Date();
        const examDate = new Date(exam.date);
        const examStartTime = new Date(`${exam.date} ${exam.startTime}`);
        const examEndTime = new Date(`${exam.date} ${exam.endTime}`);

        let status = 'upcoming';
        if (result) {
          status = 'completed';
        } else if (now >= examStartTime && now <= examEndTime) {
          status = 'ongoing';
        } else if (now > examEndTime) {
          status = 'missed';
        }

        return {
          id: exam._id,
          title: exam.title,
          subject: exam.subjectId?.name || 'Unknown',
          date: exam.date,
          startTime: exam.startTime,
          endTime: exam.endTime,
          duration: exam.duration || 60,
          room: exam.room || 'TBA',
          teacher: exam.teacherId ?
            `${exam.teacherId.name} ${exam.teacherId.surname}` : 'TBA',
          type: exam.type || 'midterm',
          status,
          instructions: exam.instructions,
          syllabus: exam.syllabus || [],
          result: result ? {
            score: result.score,
            maxScore: result.maxScore || exam.maxScore || 100,
            grade: result.grade,
            rank: result.rank,
            feedback: result.feedback
          } : undefined
        };
      });

      return NextResponse.json(examsWithStatus);

    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
