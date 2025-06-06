import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Timetable from '@/models/timetable';
import { startOfWeek, endOfWeek, parseISO } from 'date-fns';

export async function GET(req: NextRequest) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const week = searchParams.get("week");

    if (!week) {
      return NextResponse.json({ error: "Missing week query parameter" }, { status: 400 });
    }

    const startDate = startOfWeek(parseISO(week), { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(parseISO(week), { weekStartsOn: 1 });     // Sunday

    // Get all timetable entries for that week
    const entries = await Timetable.find({
      // We assume the `day` field contains strings like "Monday", "Tuesday", etc.
      // So no actual date filtering needed if schedule is repeated every week
    });

    // Group by day
    const weeklySchedule: { [key: string]: any[] } = {};
    for (const entry of entries) {
      if (!weeklySchedule[entry.day]) {
        weeklySchedule[entry.day] = [];
      }
      weeklySchedule[entry.day].push(entry);
    }

    return NextResponse.json(weeklySchedule);
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();

    const {
      classId,
      section,
      day,
      startTime,
      endTime,
      subject,
      room,
    } = body;

    const newEntry = await Timetable.create({
      classId,
      section,
      day,
      startTime,
      endTime,
      subject,
      room,
    });

    return NextResponse.json({ message: 'Timetable added', entry: newEntry }, { status: 201 });
  } catch (error) {
    console.error('Timetable creation error:', error);
    return NextResponse.json({ error: 'Failed to add timetable' }, { status: 500 });
  }
}
