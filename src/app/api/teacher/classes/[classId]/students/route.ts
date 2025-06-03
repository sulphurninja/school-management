import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import connectToDatabase from '@/lib/db';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';

export async function GET(
  request: Request,
  { params }: { params: { classId: string } }
) {
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
      const classId = parseInt(params.classId);

      // Verify teacher has access to this class
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
      }

      // For now, we'll allow any teacher to view any class
      // In production, you'd verify teacher assignment to this class

      // Get students in the specified class
      const students = await Student.find({ classId })
        .select('_id name surname username email img')
        .sort({ name: 1, surname: 1 });

      const formattedStudents = students.map(student => ({
        id: student._id,
        name: student.name,
        surname: student.surname,
        rollNo: student.username,
        email: student.email,
        profileImage: student.img
      }));

      return NextResponse.json(formattedStudents);

    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching class students:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
