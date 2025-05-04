import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import connectToDatabase from '@/lib/db';
import Class from '@/models/Class';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import Grade from '@/models/Grade';
import mongoose from 'mongoose';

// Get all classes with counts
export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Authenticate admin
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

      if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      // Get all classes with populated references
      const classes = await Class.find()
        .populate('supervisorId', 'name surname')
        .populate('gradeId', 'level')
        .sort({ 'gradeId.level': 1, name: 1 });

      // Get student counts for each class
      const classData = await Promise.all(classes.map(async (classItem) => {
        const studentCount = await Student.countDocuments({ classId: classItem._id });

        return {
          _id: classItem._id,
          name: classItem.name,
          capacity: classItem.capacity,
          supervisor: classItem.supervisorId ? {
            _id: classItem.supervisorId._id,
            name: classItem.supervisorId.name,
            surname: classItem.supervisorId.surname
          } : undefined,
          grade: {
            _id: classItem.gradeId._id,
            level: classItem.gradeId.level
          },
          studentCount
        };
      }));

      return NextResponse.json(classData);

    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new class
export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // Authenticate admin
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

      if (decoded.role !== 'admin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }

      const data = await request.json();

      // Validate required fields
      if (!data.name || !data.capacity || !data.gradeId) {
        return NextResponse.json(
          { message: 'Name, capacity, and grade are required' },
          { status: 400 }
        );
      }

      // Check if the class name already exists
      const existingClass = await Class.findOne({ name: data.name });
      if (existingClass) {
        return NextResponse.json(
          { message: 'A class with this name already exists' },
          { status: 400 }
        );
      }

      // Check if grade exists
      const grade = await Grade.findById(data.gradeId);
      if (!grade) {
        return NextResponse.json(
          { message: 'Grade not found' },
          { status: 404 }
        );
      }

      // Check if supervisor exists if provided
      if (data.supervisorId) {
        const supervisor = await Teacher.findById(data.supervisorId);
        if (!supervisor) {
          return NextResponse.json(
            { message: 'Supervisor teacher not found' },
            { status: 404 }
          );
        }
      }

      // Generate a new class ID
      const lastClass = await Class.findOne().sort({ _id: -1 });
      const classId = lastClass ? lastClass._id + 1 : 1;

      // Create the new class
      const newClass = new Class({
        _id: classId,
        name: data.name,
        capacity: data.capacity,
        supervisorId: data.supervisorId || null,
        gradeId: data.gradeId
      });

      await newClass.save();

      return NextResponse.json(
        { message: 'Class created successfully', classId },
        { status: 201 }
      );

    } catch (error) {
      console.error('JWT verification error:', error);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
