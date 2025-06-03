"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Clock, Calendar, BookOpen, MapPin,
  Download, Filter, ChevronLeft, ChevronRight
} from "lucide-react";

type ScheduleEntry = {
  id: string;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  type: 'lecture' | 'practical' | 'tutorial' | 'break';
};

type DaySchedule = {
  day: string;
  date: string;
  periods: ScheduleEntry[];
};

type WeekSchedule = {
  weekStart: string;
  weekEnd: string;
  days: DaySchedule[];
};

export default function StudentSchedule() {
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<string>('current');
  const [selectedView, setSelectedView] = useState<string>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [selectedWeek]);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/student/schedule?week=${selectedWeek}`);
      if (response.ok) {
        const data = await response.json();
        setWeekSchedule(data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadSchedule = async () => {
    try {
      const response = await fetch('/api/student/schedule/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week: selectedWeek,
          format: 'pdf'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schedule-${selectedWeek}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading schedule:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'practical':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'tutorial':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'break':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCurrentPeriod = () => {
    if (!weekSchedule) return null;

    const now = new Date();
    const today = weekSchedule.days.find(day =>
      new Date(day.date).toDateString() === now.toDateString()
    );

    if (!today) return null;

    const currentTime = now.getHours() * 60 + now.getMinutes();

    return today.periods.find(period => {
      const [startHour, startMin] = period.startTime.split(':').map(Number);
      const [endHour, endMin] = period.endTime.split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      return currentTime >= startTime && currentTime <= endTime;
    });
  };

  const getNextPeriod = () => {
    if (!weekSchedule) return null;

    const now = new Date();
    const today = weekSchedule.days.find(day =>
      new Date(day.date).toDateString() === now.toDateString()
    );

    if (!today) return null;

    const currentTime = now.getHours() * 60 + now.getMinutes();

    return today.periods.find(period => {
      const [startHour, startMin] = period.startTime.split(':').map(Number);
      const startTime = startHour * 60 + startMin;

      return startTime > currentTime;
    });
  };

  const currentPeriod = getCurrentPeriod();
  const nextPeriod = getNextPeriod();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">View your class timetable and upcoming classes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={downloadSchedule} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Week</SelectItem>
              <SelectItem value="next">Next Week</SelectItem>
              <SelectItem value="previous">Previous Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={selectedView} onValueChange={setSelectedView}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Week View</SelectItem>
            <SelectItem value="day">Day View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current/Next Period Cards */}
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {currentPeriod && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">
                Current Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold text-green-900">{currentPeriod.subject}</h3>
                <div className="flex items-center space-x-4 text-sm text-green-700">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {currentPeriod.startTime} - {currentPeriod.endTime}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {currentPeriod.room}
                  </div>
                </div>
                <p className="text-sm text-green-600">Teacher: {currentPeriod.teacher}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {nextPeriod && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">
                Next Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold text-blue-900">{nextPeriod.subject}</h3>
                <div className="flex items-center space-x-4 text-sm text-blue-700">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {nextPeriod.startTime} - {nextPeriod.endTime}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {nextPeriod.room}
                  </div>
                </div>
                <p className="text-sm text-blue-600">Teacher: {nextPeriod.teacher}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Weekly Schedule */}
      {weekSchedule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Week of {new Date(weekSchedule.weekStart).toLocaleDateString()} - {new Date(weekSchedule.weekEnd).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {weekSchedule.days.map((day) => (
                <div key={day.day} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">{day.day}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(day.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {day.periods.map((period) => (
                      <div key={period.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getTypeColor(period.type)}>
                            {period.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {period.startTime} - {period.endTime}
                          </span>
                        </div>

                        <h4 className="font-medium mb-1">{period.subject}</h4>

                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Teacher: {period.teacher}</p>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {period.room}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {day.periods.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No classes scheduled for this day
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
