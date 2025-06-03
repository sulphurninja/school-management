import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import connectToDatabase from '@/lib/db';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Authenticate student
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

      // Get attendance records for the student
      const attendanceRecords = await Attendance.find({ studentId })
        .populate('subjectId', 'name')
        .populate('teacherId', 'name surname')
        .sort({ date: -1 })
        .limit(50);

      const formattedRecords = attendanceRecords.map(record => ({
        date: record.date,
        status: record.status,
        subject: record.subjectId?.name,
        teacherName: record.teacherId ?
          `${record.teacherId.name} ${record.teacherId.surname}` : undefined,
        remarks: record.remarks,
        period: record.period
      }));

      return NextResponse.json(formattedRecords);

    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
