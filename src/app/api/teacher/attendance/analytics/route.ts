import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import connectToDatabase from '@/lib/db';
import Attendance from '@/models/Attendance';
import Student from '@/models/Student';
import Subject from '@/models/Subject';

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

      const url = new URL(request.url);
      const classId = parseInt(url.searchParams.get('classId') || '0');
      const period = url.searchParams.get('period') || 'month';

      if (!classId) {
        return NextResponse.json({ message: 'Class ID is required' }, { status: 400 });
      }

      // Calculate date range based on period
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'semester':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
          break;
        default: // month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get all students in the class
      const students = await Student.find({ classId });
      const studentIds = students.map(s => s._id);

      // Get attendance records for the period
      const attendanceRecords = await Attendance.find({
        classId,
        studentId: { $in: studentIds },
        date: { $gte: startDate, $lte: now }
      });

      // Calculate overall stats
      const totalStudents = students.length;
      const today = new Date().toISOString().split('T')[0];
      const todayRecords = attendanceRecords.filter(r =>
        r.date.toISOString().split('T')[0] === today
      );

      const presentToday = todayRecords.filter(r => r.status === 'present').length;
      const absentToday = totalStudents - presentToday;

      const totalRecords = attendanceRecords.length;
      const presentRecords = attendanceRecords.filter(r => r.status === 'present').length;
      const averageAttendance = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

      // Calculate weekly trends
      const weeklyTrends = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];

        const dayRecords = attendanceRecords.filter(r =>
          r.date.toISOString().split('T')[0] === dateStr
        );

        weeklyTrends.push({
          date: dateStr,
          present: dayRecords.filter(r => r.status === 'present').length,
          absent: dayRecords.filter(r => r.status === 'absent').length,
          late: dayRecords.filter(r => r.status === 'late').length,
          total: dayRecords.length
        });
      }

      // Calculate student analytics
      const studentAnalytics = students.map(student => {
        const studentRecords = attendanceRecords.filter(r =>
          r.studentId.toString() === student._id.toString()
        );
        const presentDays = studentRecords.filter(r => r.status === 'present').length;
        const totalDays = studentRecords.length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        let status: 'good' | 'warning' | 'critical' = 'good';
        if (attendanceRate < 60) status = 'critical';
        else if (attendanceRate < 75) status = 'warning';

        return {
          studentId: student._id,
          studentName: `${student.name} ${student.surname}`,
          attendanceRate,
          totalDays,
          presentDays,
          status
        };
      });

      // Get subjects for this class (simplified)
      const subjects = await Subject.find({});
      const subjectWise = subjects.map(subject => ({
        subjectName: subject.name,
        attendanceRate: Math.floor(Math.random() * 40) + 60, // Mock data
        totalClasses: Math.floor(Math.random() * 20) + 10
      }));

      const analytics = {
        overallStats: {
          totalStudents,
          averageAttendance,
          presentToday,
          absentToday
        },
        weeklyTrends,
        studentAnalytics: studentAnalytics.sort((a, b) => a.attendanceRate - b.attendanceRate),
        subjectWise
      };

      return NextResponse.json(analytics);

    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching attendance analytics:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
