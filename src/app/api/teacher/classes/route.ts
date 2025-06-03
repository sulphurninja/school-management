import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import connectToDatabase from '@/lib/db';
import Teacher from '@/models/Teacher';
import Class from '@/models/Class';
import Student from '@/models/Student';

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

      if (decoded.role !== 'teacher') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      const teacherId = decoded.id;

      // Get teacher info and assigned classes
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
      }

      // Get classes where teacher is assigned (either as class teacher or subject teacher)
      let classes = [];

      // If teacher is a class teacher
      if (teacher.classId) {
        const classInfo = await Class.findById(teacher.classId);
        if (classInfo) {
          const studentCount = await Student.countDocuments({ classId: teacher.classId });
          classes.push({
            id: classInfo._id,
            name: classInfo.name,
            grade: classInfo.gradeId,
            studentCount,
            room: classInfo.room
          });
        }
      }

      // Get classes where teacher teaches subjects (this would require a Subject-Teacher mapping)
      // For now, we'll return the class teacher's class
      // In a real system, you'd query subjects table and find all classes this teacher teaches

      return NextResponse.json(classes);

    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
