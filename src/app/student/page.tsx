"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen, Calendar, ClipboardList, TrendingUp,
  User, Clock, Award, AlertCircle, FileText,
  CheckCircle2, XCircle, Calendar as CalendarIcon,
  Bell,
  ChevronRight,
  BookCheck,
  BarChart3
} from "lucide-react";
import Link from "next/link";

type StudentInfo = {
  id: string;
  name: string;
  surname: string;
  studentId: string;
  className: string;
  grade: number;
  attendanceRate: number;
  rollNo?: string;
  profileCompletion: number;
};

type Assignment = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: number;
  maxGrade: number;
};

type Grade = {
  subject: string;
  grade: string;
  percentage: number;
  maxMarks: number;
  obtainedMarks: number;
};

type Announcement = {
  id: string;
  title: string;
  description: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
};

type AttendanceRecord = {
  date: string;
  status: 'present' | 'absent' | 'late';
  subject?: string;
};

export default function StudentDashboard() {
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchStudentInfo(),
      fetchAssignments(),
      fetchGrades(),
      fetchAnnouncements(),
      fetchAttendanceRecords()
    ]).finally(() => setIsLoading(false));
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const response = await fetch('/api/student/info');
      if (response.ok) {
        const data = await response.json();
        setStudentInfo(data);
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/student/assignments');
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/student/grades');
      if (response.ok) {
        const data = await response.json();
        setGrades(data);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/student/announcements');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch('/api/student/attendance');
      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'graded':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        {/* Mobile-First Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="px-4 py-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">
                  Good morning, {studentInfo?.name?.split(' ')[0]}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {studentInfo?.className} • Student ID: {studentInfo?.studentId}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {announcements.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></span>
                  )}
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/student/profile">
                    <User className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 pb-20">
          {/* Key Metrics - Mobile Optimized */}
          <div className="py-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Attendance
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {studentInfo?.attendanceRate || 0}%
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <Progress value={studentInfo?.attendanceRate || 0} className="mt-3 h-1" />
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Grade Avg
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {grades.length > 0
                          ? Math.round(grades.reduce((acc, g) => acc + g.percentage, 0) / grades.length)
                          : 0}%
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {grades.length} subjects
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Pending
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {assignments.filter(a => a.status === 'pending').length}
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <ClipboardList className="h-5 w-5 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    assignments due
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Profile
                      </p>
                      <p className="text-2xl font-bold mt-1">
                        {studentInfo?.profileCompletion || 75}%
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <Progress value={studentInfo?.profileCompletion || 75} className="mt-2 h-1" />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Actions - Mobile Grid */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-24 flex-col space-y-2 border-0 shadow-sm" asChild>
                <Link href="/student/schedule">
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Schedule</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-2 border-0 shadow-sm" asChild>
                <Link href="/student/lessons">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium">Lessons</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-2 border-0 shadow-sm" asChild>
                <Link href="/student/grades">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium">Reports</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex-col space-y-2 border-0 shadow-sm" asChild>
                <Link href="/student/assignments">
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium">Tasks</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="space-y-6">
            {/* Urgent Items */}
            {(assignments.filter(a => a.status === 'pending' || a.status === 'overdue').length > 0 ||
              announcements.filter(a => a.priority === 'high').length > 0) && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <h2 className="text-lg font-semibold">Needs Attention</h2>
                  </div>
                  <div className="space-y-3">
                    {assignments
                      .filter(a => a.status === 'overdue')
                      .slice(0, 3)
                      .map((assignment) => (
                        <Card key={assignment.id} className="border-destructive/20 bg-destructive/5">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <XCircle className="h-4 w-4 text-destructive" />
                                  <span className="text-sm font-medium">Overdue Assignment</span>
                                </div>
                                <h3 className="font-semibold mb-1">{assignment.title}</h3>
                                <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                    {announcements
                      .filter(a => a.priority === 'high')
                      .slice(0, 2)
                      .map((announcement) => (
                        <Card key={announcement.id} className="border-orange-200 bg-orange-50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Bell className="h-4 w-4 text-orange-600" />
                                  <span className="text-sm font-medium text-orange-600">Important</span>
                                </div>
                                <h3 className="font-semibold mb-1">{announcement.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {announcement.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              )}

            {/* Recent Assignments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Assignments</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/student/assignments">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {assignments.slice(0, 4).map((assignment) => (
                  <Card key={assignment.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {getStatusIcon(assignment.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{assignment.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm text-muted-foreground">
                                {assignment.subject}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                •
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {new Date(assignment.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {assignment.status}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {assignments.length === 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No assignments yet</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Performance Overview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Performance Overview</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/student/grades">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-3">
                {grades.slice(0, 3).map((grade, index) => (
                  <Card key={index} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <BookCheck className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{grade.subject}</h3>
                            <p className="text-sm text-muted-foreground">
                              {grade.obtainedMarks}/{grade.maxMarks} marks
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{grade.percentage}%</div>
                          <Badge variant="secondary" className="text-xs">
                            {grade.grade}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={grade.percentage} className="h-2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Announcements */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Announcements</h2>
              </div>
              <div className="space-y-3">
                {announcements.slice(0, 3).map((announcement) => (
                  <Card key={announcement.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${announcement.priority === 'high' ? 'bg-red-100' :
                            announcement.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                          <Bell className={`h-4 w-4 ${announcement.priority === 'high' ? 'text-red-600' :
                              announcement.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                            }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{announcement.title}</h3>
                            <span className="text-xs text-muted-foreground">
                              {new Date(announcement.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {announcement.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {announcements.length === 0 && (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center">
                      <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">No recent announcements</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Space */}
        <div className="h-20 md:hidden"></div>
      </div>
    </DashboardLayout>
  );
}
