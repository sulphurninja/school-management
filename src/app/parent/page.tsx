"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, BookOpen, Calendar, AlertTriangle, Bell,
  Mail, Phone, MessageSquare, BarChart, FileText
} from "lucide-react";
import Link from "next/link";

export default function ParentDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  // Mock parent data
  const parentData = {
    name: "Michael Smith",
    children: [
      {
        id: 1,
        name: "Emma Smith",
        avatar: "",
        grade: "10th Grade",
        attendanceRate: 95,
        upcomingExams: 2,
        pendingAssignments: 3
      },
      {
        id: 2,
        name: "Jack Smith",
        avatar: "",
        grade: "7th Grade",
        attendanceRate: 92,
        upcomingExams: 1,
        pendingAssignments: 4
      }
    ]
  };

  // Mock announcements
  const announcements = [
    {
      id: 1,
      title: "Parent-Teacher Meeting",
      date: "2023-06-25",
      description: "Annual parent-teacher conference to discuss student progress."
    },
    {
      id: 2,
      title: "School Holiday",
      date: "2023-07-04",
      description: "School will be closed for Independence Day celebration."
    }
  ];

  // Mock attendance records
  const attendanceRecords = [
    { date: "2023-06-01", status: "present" },
    { date: "2023-06-02", status: "present" },
    { date: "2023-06-03", status: "absent" },
    { date: "2023-06-04", status: "present" },
    { date: "2023-06-05", status: "present" }
  ];

  // Mock grades
  const grades = [
    { subject: "Mathematics", grade: "A", percentage: 92 },
    { subject: "English", grade: "B+", percentage: 87 },
    { subject: "Science", grade: "A-", percentage: 89 },
    { subject: "History", grade: "B", percentage: 84 },
    { subject: "Art", grade: "A", percentage: 95 }
  ];

  useEffect(() => {
    // In a real app, you would fetch parent and children data from your API
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

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
      <h1 className="text-2xl font-bold mb-6">Parent Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg">MS</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{parentData.name}</h2>
                <p className="text-muted-foreground">Parent Account</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {parentData.children.length} Children
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact School</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/parent/messages">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="tel:+1234567890">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="mailto:school@example.com">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/parent/meetings">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Children</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {parentData.children.map((child) => (
          <Card key={child.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={child.avatar} />
                    <AvatarFallback>
                      {child.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{child.name}</CardTitle>
                    <CardDescription>{child.grade}</CardDescription>
                  </div>
                </div>
                <Button size="sm" asChild>
                  <Link href={`/parent/children/${child.id}`}>
                    View Details
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2">
                  <div className="text-2xl font-bold">{child.attendanceRate}%</div>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
                <div className="p-2">
                  <div className="text-2xl font-bold">{child.upcomingExams}</div>
                  <p className="text-xs text-muted-foreground">Upcoming Exams</p>
                </div>
                <div className="p-2">
                  <div className="text-2xl font-bold">{child.pendingAssignments}</div>
                  <p className="text-xs text-muted-foreground">Pending Tasks</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Tabs defaultValue="announcements">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="performance">Academic Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  School Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <Badge variant="outline">
                          {new Date(announcement.date).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {announcement.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Attendance Records
                </CardTitle>
                <CardDescription>
                  Recent attendance for Emma Smith
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attendanceRecords.map((record, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border-b">
                      <div>{new Date(record.date).toLocaleDateString()}</div>
                      <Badge
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/parent/attendance">
                    View Full Attendance History
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart className="h-5 w-5 mr-2" />
                  Academic Performance
                </CardTitle>
                <CardDescription>
                  Current grades for Emma Smith
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {grades.map((grade, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{grade.subject}</span>
                        <span className="font-bold">{grade.grade} ({grade.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{ width: `${grade.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex mt-6 space-x-4">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/parent/grades">
                      <FileText className="h-4 w-4 mr-2" />
                      All Grades
                    </Link>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href="/parent/reports">
                      <BarChart className="h-4 w-4 mr-2" />
                      Progress Reports
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
