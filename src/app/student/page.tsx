"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, Calendar, ClipboardList, TrendingUp,
  Award, AlertCircle, FileText, CheckCircle2, XCircle,
  Bell, ChevronRight, BookCheck, BarChart3, Clock,
  BookMarked, GraduationCap, ArrowUpRight, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

// Types
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
  profileImage?: string;
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

type UpcomingClass = {
  id: string;
  subject: string;
  teacher: string;
  time: string;
  room: string;
  day: string;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Get current day for greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  
  // Get today's weekday
  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    // Simulate data fetching
    const loadData = async () => {
      setIsLoading(true);
      
      // Simulate API calls with timeouts
      await Promise.all([
        new Promise(r => setTimeout(r, 1000)), // Mock loading time
        fetchStudentInfo(),
        fetchAssignments(),
        fetchGrades(),
        fetchAnnouncements(),
        fetchAttendanceRecords(),
        fetchUpcomingClasses()
      ]);
      
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Mock data fetching functions
  const fetchStudentInfo = async () => {
    // Simulate API call
    setStudentInfo({
      id: "s12345",
      name: user?.name || "Alex",
      surname: user?.surname || "Johnson",
      studentId: "STU22001",
      className: "Grade 10-A",
      grade: 10,
      attendanceRate: 92,
      rollNo: "101",
      profileCompletion: 85,
      profileImage: user?.profilePic || ""
    });
  };

  const fetchAssignments = async () => {
    // Simulate API call
    setAssignments([
      {
        id: "a1",
        title: "Mathematics Problem Set",
        subject: "Mathematics",
        dueDate: "2023-11-20",
        status: "pending",
        maxGrade: 100
      },
      {
        id: "a2",
        title: "History Essay on World War II",
        subject: "History",
        dueDate: "2023-11-18",
        status: "overdue",
        maxGrade: 50
      },
      {
        id: "a3",
        title: "Science Lab Report",
        subject: "Physics",
        dueDate: "2023-11-25",
        status: "submitted",
        maxGrade: 100
      },
      {
        id: "a4",
        title: "English Literature Analysis",
        subject: "English",
        dueDate: "2023-11-15",
        status: "graded",
        grade: 85,
        maxGrade: 100
      }
    ]);
  };

  const fetchGrades = async () => {
    // Simulate API call
    setGrades([
      {
        subject: "Mathematics",
        grade: "A",
        percentage: 92,
        maxMarks: 100,
        obtainedMarks: 92
      },
      {
        subject: "Science",
        grade: "A-",
        percentage: 88,
        maxMarks: 100,
        obtainedMarks: 88
      },
      {
        subject: "English",
        grade: "B+",
        percentage: 85,
        maxMarks: 100,
        obtainedMarks: 85
      },
      {
        subject: "History",
        grade: "B",
        percentage: 80,
        maxMarks: 100,
        obtainedMarks: 80
      }
    ]);
  };

  const fetchAnnouncements = async () => {
    // Simulate API call
    setAnnouncements([
      {
        id: "an1",
        title: "School Holiday Announcement",
        description: "Due to the upcoming national holiday, the school will be closed on Monday, November 20th.",
        date: "2023-11-15",
        priority: "high"
      },
      {
        id: "an2",
        title: "Sports Day Preparation",
        description: "All students are requested to practice for the upcoming sports day events during PE classes.",
        date: "2023-11-14",
        priority: "medium"
      },
      {
        id: "an3",
        title: "Library Book Return Notice",
        description: "Please return all borrowed library books before the end of the month to avoid late fees.",
        date: "2023-11-12",
        priority: "low"
      }
    ]);
  };

  const fetchAttendanceRecords = async () => {
    // Simulate API call
    setAttendanceRecords([
      { date: "2023-11-15", status: "present" },
      { date: "2023-11-14", status: "present" },
      { date: "2023-11-13", status: "late", subject: "Mathematics" },
      { date: "2023-11-10", status: "present" },
      { date: "2023-11-09", status: "present" },
      { date: "2023-11-08", status: "absent" }
    ]);
  };

  const fetchUpcomingClasses = async () => {
    // Simulate API call
    setUpcomingClasses([
      {
        id: "c1",
        subject: "Mathematics",
        teacher: "Mrs. Johnson",
        time: "09:00 - 10:30",
        room: "Room 101",
        day: "Today"
      },
      {
        id: "c2",
        subject: "Science",
        teacher: "Mr. Smith",
        time: "11:00 - 12:30",
        room: "Lab 3",
        day: "Today"
      },
      {
        id: "c3",
        subject: "English",
        teacher: "Ms. Williams",
        time: "14:00 - 15:30",
        room: "Room 205",
        day: "Today"
      },
      {
        id: "c4",
        subject: "History",
        teacher: "Dr. Brown",
        time: "09:00 - 10:30",
        room: "Room 302",
        day: "Tomorrow"
      }
    ]);
  };

  // Helper function for assignment status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case 'graded':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  // Priority indicator for announcements
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return <div className="w-2 h-2 rounded-full bg-red-500"></div>;
      case 'medium':
        return <div className="w-2 h-2 rounded-full bg-yellow-500"></div>;
      default:
        return <div className="w-2 h-2 rounded-full bg-blue-500"></div>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-24">
          {/* Skeleton header */}
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          {/* Skeleton tabs */}
          <Skeleton className="h-10 w-full mb-6" />
          
          {/* Skeleton cards */}
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
          
          {/* Skeleton content sections */}
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div 
        className="pb-24"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header with user profile */}
        {/* <motion.div 
          className="mb-6"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={studentInfo?.profileImage} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {studentInfo?.name?.[0]}{studentInfo?.surname?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold">
                {greeting}, {studentInfo?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {weekday} • {studentInfo?.className}
              </p>
            </div>
          </div>
        </motion.div> */}

        {/* Main tabs */}
        <motion.div variants={itemVariants}>
          <Tabs 
            defaultValue="overview" 
            className="mb-6"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-3 w-full mb-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent 
                value="overview" 
                className="mt-0 space-y-5"
              >
                {/* Stats Cards */}
                <motion.div 
                  className="grid grid-cols-2 gap-3"
                  variants={containerVariants}
                  initial="hidden"
                  animate={activeTab === "overview" ? "visible" : "hidden"}
                >
                  <motion.div variants={itemVariants}>
                    <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-primary" />
                          </div>
                          <span className="text-xl font-bold">{studentInfo?.attendanceRate}%</span>
                        </div>
                        <p className="text-sm font-medium">Attendance</p>
                        <Progress value={studentInfo?.attendanceRate || 0} className="h-1 mt-2" />
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="h-9 w-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-xl font-bold">
                            {grades.length > 0
                              ? Math.round(grades.reduce((acc, g) => acc + g.percentage, 0) / grades.length)
                              : 0}%
                          </span>
                        </div>
                        <p className="text-sm font-medium">Average Grade</p>
                        <p className="text-xs text-muted-foreground mt-1">{grades.length} subjects</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Today's classes */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold">Today's Classes</h2>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
                      <Link href="/student/schedule">
                        View All <ChevronRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {upcomingClasses
                      .filter(c => c.day === "Today")
                      .slice(0, 2)
                      .map((cls) => (
                        <Card key={cls.id} className="border-0 shadow-sm">
                          <CardContent className="p-3 flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{cls.subject}</h3>
                                <span className="text-xs text-muted-foreground">{cls.time}</span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <span>{cls.teacher}</span>
                                <span className="mx-1">•</span>
                                <span>{cls.room}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                    {upcomingClasses.filter(c => c.day === "Today").length === 0 && (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-6 text-center">
                          <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">No classes scheduled for today</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.div>

                {/* Assignments */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold">Assignments</h2>
                    <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" asChild>
                      <Link href="/student/assignments">
                        View All <ChevronRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {assignments
                      .filter(a => a.status === 'pending' || a.status === 'overdue')
                      .slice(0, 3)
                      .map((assignment) => (
                        <Card 
                          key={assignment.id} 
                          className={cn(
                            "border-0 shadow-sm",
                            assignment.status === 'overdue' && "border-l-2 border-l-red-500"
                          )}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center",
                                assignment.status === 'pending' ? "bg-yellow-100" : "bg-red-100"
                              )}>
                                {getStatusIcon(assignment.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium truncate">{assignment.title}</h3>
                                <div className="flex items-center text-xs text-muted-foreground mt-1">
                                  <span>{assignment.subject}</span>
                                  <span className="mx-1">•</span>
                                  <span>
                                    Due {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                              <Badge variant={assignment.status === 'overdue' ? "destructive" : "secondary"} className="ml-auto text-xs">
                                {assignment.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                    {assignments.filter(a => a.status === 'pending' || a.status === 'overdue').length === 0 && (
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-6 text-center">
                          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-muted-foreground">No pending assignments</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </motion.div>

                {/* Announcements */}
                <motion.div variants={itemVariants}>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-semibold">Announcements</h2>
                  </div>

                  <div className="space-y-2">
                    {announcements.slice(0, 2).map((announcement) => (
                      <Card key={announcement.id} className="border-0 shadow-sm">
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mt-0.5">
                              <Bell className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{announcement.title}</h3>
                                {getPriorityIndicator(announcement.priority)}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {announcement.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(announcement.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent 
                value="progress" 
                className="mt-0 space-y-5"
              >
                {/* Grades Overview */}
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate={activeTab === "progress" ? "visible" : "hidden"}
                >
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold">Academic Performance</h2>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" asChild>
                        <Link href="/student/grades">
                          Detailed Report <ArrowUpRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>

                  {grades.map((grade, index) => (
                    <motion.div key={index} variants={itemVariants}>
                      <Card className="border-0 shadow-sm mb-3">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <BookCheck className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-medium">{grade.subject}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {grade.obtainedMarks}/{grade.maxMarks} marks
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold">{grade.percentage}%</div>
                              <Badge 
                                variant={
                                  grade.percentage >= 90 ? "default" :
                                  grade.percentage >= 80 ? "secondary" :
                                  grade.percentage >= 70 ? "outline" :
                                  "destructive"
                                } 
                                className="text-xs"
                              >
                                {grade.grade}
                              </Badge>
                            </div>
                          </div>
                          <Progress 
                            value={grade.percentage} 
                            className="h-2" 
                            indicatorClassName={
                              grade.percentage >= 90 ? "bg-green-500" :
                              grade.percentage >= 80 ? "bg-blue-500" :
                              grade.percentage >= 70 ? "bg-yellow-500" :
                              "bg-red-500"
                            }
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  <motion.div variants={itemVariants}>
                    <Card className="border-0 shadow-sm bg-primary/5 mt-5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Award className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">Overall Average</h3>
                              <p className="text-xs text-muted-foreground">
                                Across all subjects
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">
                              {grades.length > 0
                                ? Math.round(grades.reduce((acc, g) => acc + g.percentage, 0) / grades.length)
                                : 0}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Attendance */}
                  <motion.div variants={itemVariants} className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold">Attendance</h2>
                    </div>

                    <Card className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <h3 className="font-medium">This Semester</h3>
                              <p className="text-xs text-muted-foreground">
                                {attendanceRecords.filter(r => r.status === 'present').length} days present
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xl font-bold">{studentInfo?.attendanceRate}%</div>
                          </div>
                        </div>
                        <Progress value={studentInfo?.attendanceRate || 0} className="h-2" />
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-3 text-center">
                          <div className="h-8 w-8 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="text-lg font-bold">
                            {attendanceRecords.filter(r => r.status === 'present').length}
                          </div>
                          <p className="text-xs text-muted-foreground">Present</p>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-3 text-center">
                          <div className="h-8 w-8 mx-auto rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-1">
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          </div>
                          <div className="text-lg font-bold">
                            {attendanceRecords.filter(r => r.status === 'late').length}
                          </div>
                          <p className="text-xs text-muted-foreground">Late</p>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-3 text-center">
                          <div className="h-8 w-8 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-1">
                            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="text-lg font-bold">
                          {attendanceRecords.filter(r => r.status === 'absent').length}
                          </div>
                          <p className="text-xs text-muted-foreground">Absent</p>
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>

                  {/* Completed Assignments */}
                  <motion.div variants={itemVariants} className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold">Recent Submissions</h2>
                    </div>

                    <div className="space-y-2">
                      {assignments
                        .filter(a => a.status === 'submitted' || a.status === 'graded')
                        .slice(0, 3)
                        .map((assignment) => (
                          <Card key={assignment.id} className="border-0 shadow-sm">
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "h-10 w-10 rounded-full flex items-center justify-center",
                                  assignment.status === 'submitted' ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30"
                                )}>
                                  {getStatusIcon(assignment.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium truncate">{assignment.title}</h3>
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <span>{assignment.subject}</span>
                                    {assignment.grade && (
                                      <>
                                        <span className="mx-1">•</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">
                                          {assignment.grade}/{assignment.maxGrade} points
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <Badge variant={assignment.status === 'graded' ? "default" : "secondary"} className="ml-auto text-xs">
                                  {assignment.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                      {assignments.filter(a => a.status === 'submitted' || a.status === 'graded').length === 0 && (
                        <Card className="border-0 shadow-sm">
                          <CardContent className="p-6 text-center">
                            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No recent submissions</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>

              <TabsContent 
                value="schedule" 
                className="mt-0 space-y-5"
              >
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate={activeTab === "schedule" ? "visible" : "hidden"}
                >
                  {/* Today's Schedule */}
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold">Today's Classes</h2>
                      <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" asChild>
                        <Link href="/student/schedule">
                          Full Timetable <Calendar className="h-3 w-3 ml-1" />
                        </Link>
                      </Button>
                    </div>

                    <div className="space-y-2.5">
                      {upcomingClasses
                        .filter(c => c.day === "Today")
                        .map((cls, index) => (
                          <Card 
                            key={cls.id} 
                            className={cn(
                              "border-0 shadow-sm relative overflow-hidden",
                              index === 0 && "border-l-2 border-l-green-500"
                            )}
                          >
                            <CardContent className="p-3">
                              {index === 0 && (
                                <Badge variant="outline" className="absolute top-2 right-2 text-[10px] border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20">
                                  Current
                                </Badge>
                              )}
                              <div className="flex items-center">
                                <div className="w-16 text-center mr-3">
                                  <span className="text-sm font-semibold block">
                                    {cls.time.split(' - ')[0]}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {cls.time.split(' - ')[1]}
                                  </span>
                                </div>
                                
                                <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3">
                                  {cls.subject.includes("Math") ? (
                                    <div className="bg-blue-100 dark:bg-blue-900/30 h-10 w-10 rounded-full flex items-center justify-center">
                                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                  ) : cls.subject.includes("Science") ? (
                                    <div className="bg-green-100 dark:bg-green-900/30 h-10 w-10 rounded-full flex items-center justify-center">
                                      <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                  ) : cls.subject.includes("English") ? (
                                    <div className="bg-purple-100 dark:bg-purple-900/30 h-10 w-10 rounded-full flex items-center justify-center">
                                      <BookMarked className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                  ) : (
                                    <div className="bg-orange-100 dark:bg-orange-900/30 h-10 w-10 rounded-full flex items-center justify-center">
                                      <BookCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className="font-medium">{cls.subject}</h3>
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <span>{cls.teacher}</span>
                                    <span className="mx-1">•</span>
                                    <span>{cls.room}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                      {upcomingClasses.filter(c => c.day === "Today").length === 0 && (
                        <Card className="border-0 shadow-sm">
                          <CardContent className="p-8 text-center">
                            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No classes scheduled for today</p>
                            <Button variant="outline" size="sm" className="mt-4">
                              View Full Schedule
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </motion.div>

                  {/* Tomorrow's Schedule */}
                  <motion.div variants={itemVariants} className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold">Tomorrow</h2>
                    </div>

                    <div className="space-y-2.5">
                      {upcomingClasses
                        .filter(c => c.day === "Tomorrow")
                        .map((cls) => (
                          <Card key={cls.id} className="border-0 shadow-sm">
                            <CardContent className="p-3">
                              <div className="flex items-center">
                                <div className="w-16 text-center mr-3">
                                  <span className="text-sm font-semibold block">
                                    {cls.time.split(' - ')[0]}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {cls.time.split(' - ')[1]}
                                  </span>
                                </div>
                                
                                <div className="h-10 w-10 rounded-full flex items-center justify-center mr-3">
                                  {cls.subject.includes("Math") ? (
                                    <div className="bg-blue-100 dark:bg-blue-900/30 h-10 w-10 rounded-full flex items-center justify-center">
                                      <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                  ) : cls.subject.includes("Science") ? (
                                    <div className="bg-green-100 dark:bg-green-900/30 h-10 w-10 rounded-full flex items-center justify-center">
                                      <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                  ) : cls.subject.includes("English") ? (
                                    <div className="bg-purple-100 dark:bg-purple-900/30 h-10 w-10 rounded-full flex items-center justify-center">
                                      <BookMarked className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                  ) : (
                                    <div className="bg-orange-100 dark:bg-orange-900/30 h-10 w-10 rounded-full flex items-center justify-center">
                                      <BookCheck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <h3 className="font-medium">{cls.subject}</h3>
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <span>{cls.teacher}</span>
                                    <span className="mx-1">•</span>
                                    <span>{cls.room}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                      {upcomingClasses.filter(c => c.day === "Tomorrow").length === 0 && (
                        <Card className="border-0 shadow-sm">
                          <CardContent className="p-6 text-center">
                            <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground">No classes scheduled for tomorrow</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </motion.div>

                  {/* This Week's Tasks */}
                  <motion.div variants={itemVariants} className="mt-8">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-semibold">This Week's Tasks</h2>
                    </div>

                    <div className="space-y-2">
                      {assignments
                        .filter(a => 
                          new Date(a.dueDate) >= new Date() && 
                          new Date(a.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        )
                        .slice(0, 3)
                        .map((assignment) => (
                          <Card 
                            key={assignment.id} 
                            className="border-0 shadow-sm"
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-primary/10 text-primary">
                                  <span className="text-xs font-medium">
                                    {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                                  </span>
                                  <span className="text-lg font-bold leading-tight">
                                    {new Date(assignment.dueDate).getDate()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium truncate">{assignment.title}</h3>
                                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                                    <span>{assignment.subject}</span>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                      {assignments.filter(a => 
                        new Date(a.dueDate) >= new Date() && 
                        new Date(a.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      ).length === 0 && (
                        <Card className="border-0 shadow-sm">
                          <CardContent className="p-6 text-center">
                            <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                            <p className="text-muted-foreground">No tasks due this week</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>

        {/* Quick Access Floating Menu */}
        {/* <motion.div
          className="fixed bottom-24 right-4 lg:right-8 z-40"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.5 
          }}
        >
          <Button 
            size="icon" 
            className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground"
            onClick={() => {
              // You can implement a quick action menu that expands here
              // For example, showing a popover with message, assignment, and other quick actions
            }}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </motion.div> */}
      </motion.div>
    </DashboardLayout>
  );
}