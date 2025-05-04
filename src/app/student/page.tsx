"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar, BookOpen, FileText, VideoIcon, Clock,
  BookmarkCheck, UserCheck, AlertTriangle
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
};

type ScheduleItem = {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
};

type Assignment = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
};

type VideoLesson = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  thumbnailUrl: string;
  duration: number;
};

export default function StudentDashboard() {
  const { toast } = useToast();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<ScheduleItem[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [videoLessons, setVideoLessons] = useState<VideoLesson[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    upcomingExams: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch student info
        const infoResponse = await fetch('/api/student/info');
        if (!infoResponse.ok) {
          throw new Error('Failed to fetch student info');
        }
        const infoData = await infoResponse.json();
        setStudentInfo(infoData);

        // Fetch student schedule
        const scheduleResponse = await fetch('/api/student/lessons?type=schedule');
        if (!scheduleResponse.ok) {
          throw new Error('Failed to fetch schedule');
        }
        const scheduleData = await scheduleResponse.json();

        // Get today's day of week
        const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const today = daysOfWeek[new Date().getDay()];

        // Filter today's classes
        const todayClasses = scheduleData.filter((item: ScheduleItem) =>
          item.day === today
        ).sort((a: ScheduleItem, b: ScheduleItem) =>
          a.startTime.localeCompare(b.startTime)
        );

        setTodaySchedule(todayClasses);

        // Fetch assignments
        const assignmentsResponse = await fetch('/api/student/assignments');
        if (!assignmentsResponse.ok) {
          throw new Error('Failed to fetch assignments');
        }
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);

        // Fetch video lessons
        const videoResponse = await fetch('/api/student/lessons?type=video');
        if (!videoResponse.ok) {
          throw new Error('Failed to fetch video lessons');
        }
        const videoData = await videoResponse.json();
        setVideoLessons(videoData);

        // Calculate stats
        const pendingAssignments = assignmentsData.filter((a: Assignment) => a.status === 'pending').length;
        const completedAssignments = assignmentsData.filter((a: Assignment) =>
          a.status === 'submitted' || a.status === 'graded'
        ).length;

        setStats({
          totalClasses: todayClasses.length,
          pendingAssignments,
          completedAssignments,
          upcomingExams: 0 // Future feature
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg">
                  {studentInfo ? `${studentInfo.name.charAt(0)}${studentInfo.surname.charAt(0)}` : 'ST'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">
                  {studentInfo ? `${studentInfo.name} ${studentInfo.surname}` : 'Loading...'}
                </h2>
                <p className="text-muted-foreground">
                  {studentInfo ? studentInfo.className : 'Loading...'}
                </p>
                <div className="mt-2">
                  <Badge variant="outline" className="mr-2">
                    Student ID: {studentInfo ? studentInfo.studentId : 'Loading...'}
                  </Badge>
                  <Badge variant="outline">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Attendance: {studentInfo ? `${studentInfo.attendanceRate}%` : '0%'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-2xl font-bold">
                {stats.totalClasses}
              </CardTitle>
              <p className="text-xs text-muted-foreground">Classes Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-2xl font-bold">
                {stats.pendingAssignments}
              </CardTitle>
              <p className="text-xs text-muted-foreground">Pending Assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <BookmarkCheck className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-2xl font-bold">
                {stats.completedAssignments}
              </CardTitle>
              <p className="text-xs text-muted-foreground">Completed Tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-primary mb-2" />
              <CardTitle className="text-2xl font-bold">
                {stats.upcomingExams}
              </CardTitle>
              <p className="text-xs text-muted-foreground">Upcoming Exams</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="today">Today's Schedule</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="lessons">Video Lessons</TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Today's Classes
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaySchedule.length === 0 ? (
                  <div className="text-center py-10">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No classes scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {todaySchedule.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 rounded-lg border">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{item.subject}</p>
                            <p className="text-sm text-muted-foreground">{item.teacher}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{item.startTime} - {item.endTime}</p>
                          <p className="text-sm text-muted-foreground">{item.room}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Upcoming Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-10">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">You don't have any assignments yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.filter(a => a.status === 'pending').slice(0, 3).map((assignment) => (
                      <div key={assignment.id} className="flex justify-between items-center p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </Badge>
                          <Button size="sm" asChild className="w-full">
                            <Link href={`/student/assignments/${assignment.id}/submit`}>
                              Submit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    {assignments.filter(a => a.status === 'pending').length > 3 && (
                      <div className="text-center">
                        <Button variant="link" asChild>
                          <Link href="/student/assignments">
                            View all assignments
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lessons">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <VideoIcon className="h-5 w-5 mr-2" />
                  Video Lessons
                </CardTitle>
              </CardHeader>
              <CardContent>
                {videoLessons.length === 0 ? (
                  <div className="text-center py-10">
                    <VideoIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No video lessons available</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {videoLessons.slice(0, 3).map((lesson) => (
                      <Card key={lesson.id} className="overflow-hidden">
                        <div className="aspect-video bg-gray-100 relative">
                          {lesson.thumbnailUrl ? (
                            <img
                              src={lesson.thumbnailUrl}
                              alt={lesson.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <VideoIcon className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-1">{lesson.title}</h3>
                          <p className="text-sm text-muted-foreground">{lesson.subject} | {lesson.teacher}</p>
                          <Button size="sm" className="w-full mt-2" asChild>
                            <Link href={`/student/lessons/${lesson.id}`}>Watch Lesson</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                {videoLessons.length > 3 && (
                  <div className="text-center mt-4">
                    <Button variant="link" asChild>
                      <Link href="/student/lessons">
                        View all video lessons
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
