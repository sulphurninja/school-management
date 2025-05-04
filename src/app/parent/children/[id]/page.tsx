"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, GraduationCap, BookOpen, Calendar,
  FileText, User, CheckCircle, XCircle, BarChart4,
  Clock, AlertTriangle
} from "lucide-react";
import Link from "next/link";

type Child = {
  id: string;
  name: string;
  surname: string;
  className: string;
  grade: number;
  attendance: number;
  subjects: {
    id: string;
    name: string;
    teacher: string;
    grade: string;
    percentage: number;
  }[];
  assignments: {
    id: string;
    title: string;
    subject: string;
    dueDate: string;
    status: 'pending' | 'submitted' | 'graded';
    grade?: number;
    maxGrade: number;
  }[];
  attendance_records: {
    date: string;
    status: 'present' | 'absent' | 'late';
  }[];
};

export default function ChildProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChildData();
  }, [params.id]);

  const fetchChildData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/parent/children/${params.id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch child data');
      }

      const data = await response.json();
      setChild(data);
    } catch (error) {
      console.error('Error fetching child data:', error);
      toast({
        title: "Error",
        description: "Failed to load student information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if assignment is overdue
  const isOverdue = (dueDate: string, status: string) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  // Get status badge properties for assignment
  const getStatusBadge = (assignment: Child['assignments'][0]) => {
    if (isOverdue(assignment.dueDate, assignment.status)) {
      return {
        variant: "destructive" as const,
        label: "Overdue",
        icon: <AlertTriangle className="h-3 w-3 mr-1" />
      };
    }

    switch (assignment.status) {
      case 'pending':
        return {
          variant: "outline" as const,
          label: "Pending",
          icon: <Clock className="h-3 w-3 mr-1" />
        };
      case 'submitted':
        return {
          variant: "default" as const,
          label: "Submitted",
          icon: <CheckCircle className="h-3 w-3 mr-1" />
        };
      case 'graded':
        return {
          variant: "success" as const,
          label: "Graded",
          icon: <CheckCircle className="h-3 w-3 mr-1" />
        };
      default:
        return {
          variant: "outline" as const,
          label: "Unknown",
          icon: null
        };
    }
  };

  // Get status badge for attendance
  const getAttendanceBadge = (status: string) => {
    switch (status) {
      case 'present':
        return {
          variant: "success" as const,
          label: "Present",
          icon: <CheckCircle className="h-3 w-3 mr-1" />
        };
      case 'absent':
        return {
          variant: "destructive" as const,
          label: "Absent",
          icon: <XCircle className="h-3 w-3 mr-1" />
        };
      case 'late':
        return {
          variant: "warning" as const,
          label: "Late",
          icon: <Clock className="h-3 w-3 mr-1" />
        };
      default:
        return {
          variant: "outline" as const,
          label: status,
          icon: null
        };
    }
  };

  // Calculate overall average
  const calculateOverallAverage = () => {
    if (!child || child.subjects.length === 0) return 0;

    const sum = child.subjects.reduce((acc, subject) => acc + subject.percentage, 0);
    return sum / child.subjects.length;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <p>Loading student information...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!child) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Student Not Found</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            The student you're looking for doesn't exist or you don't have permission to view their profile.
          </p>
          <Button asChild>
            <Link href="/parent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <Button variant="outline" size="sm" className="mr-4" asChild>
          <Link href="/parent">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Student Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="" />
                <AvatarFallback className="text-2xl">
                  {child.name[0]}{child.surname[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{child.name} {child.surname}</h2>
              <p className="text-muted-foreground">{child.className}</p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="flex items-center">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Grade {child.grade}
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Attendance: {child.attendance}%
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Overall Performance</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Score</span>
                    <span className="font-medium">{calculateOverallAverage().toFixed(1)}%</span>
                  </div>
                  <Progress value={calculateOverallAverage()} className="h-2" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Attendance Rate</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Present Days</span>
                    <span className="font-medium">{child.attendance}%</span>
                  </div>
                  <Progress value={child.attendance} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>
              View grades, assignments, and attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="grades">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="grades" className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Grades
                </TabsTrigger>
                <TabsTrigger value="assignments" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Assignments
                </TabsTrigger>
                <TabsTrigger value="attendance" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Attendance
                </TabsTrigger>
              </TabsList>

              <TabsContent value="grades" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {child.subjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6">
                          No grade information available
                        </TableCell>
                      </TableRow>
                    ) : (
                      child.subjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell>{subject.teacher}</TableCell>
                          <TableCell>{subject.grade}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm">{subject.percentage}%</span>
                              </div>
                              <Progress value={subject.percentage} className="h-2" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href={`/parent/children/${child.id}/grades`}>
                      <BarChart4 className="h-4 w-4 mr-2" />
                      View Detailed Report
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="assignments" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {child.assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          No assignments available
                        </TableCell>
                      </TableRow>
                    ) : (
                      child.assignments.map((assignment) => {
                        const statusBadge = getStatusBadge(assignment);
                        return (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.title}</TableCell>
                            <TableCell>{assignment.subject}</TableCell>
                            <TableCell>{formatDate(assignment.dueDate)}</TableCell>
                            <TableCell>
                              <Badge variant={statusBadge.variant} className="flex w-fit items-center">
                                {statusBadge.icon}
                                {statusBadge.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {assignment.status === 'graded' ? (
                                <span className="font-medium">
                                  {assignment.grade}/{assignment.maxGrade}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href={`/parent/children/${child.id}/assignments`}>
                      <FileText className="h-4 w-4 mr-2" />
                      View All Assignments
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="attendance" className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {child.attendance_records.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-6">
                          No attendance records available
                        </TableCell>
                      </TableRow>
                    ) : (
                      child.attendance_records.map((record, index) => {
                        const badge = getAttendanceBadge(record.status);
                        return (
                          <TableRow key={index}>
                            <TableCell>{formatDate(record.date)}</TableCell>
                            <TableCell>
                              <Badge  className="flex w-fit items-center">
                                {badge.icon}
                                {badge.label}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href={`/parent/children/${child.id}/attendance`}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Full Attendance
                    </Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
