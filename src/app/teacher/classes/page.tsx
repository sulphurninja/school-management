"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Search, MoreVertical, Users, FileText,
  ArrowRight, Eye, ListChecks, Calendar
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Class = {
  id: string;
  grade: number;
  section: string;
  name: string;
  subject: string;
  students: number;
  isClassTeacher: boolean;
  room: string;
  schedule: string[];
};

// Helper for Roman numerals for class display
const romanize = (num: number): string => {
  const romanNumerals: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"]
  ];

  if (num <= 0 || num > 12) {
    return num.toString();
  }

  let result = '';
  for (const [value, symbol] of romanNumerals) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
};

export default function TeacherClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    let filtered = classes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        romanize(cls.grade).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === "classteacher") {
      filtered = filtered.filter(cls => cls.isClassTeacher);
    } else if (activeTab === "subjects") {
      filtered = filtered.filter(cls => !cls.isClassTeacher);
    }

    setFilteredClasses(filtered);
  }, [classes, searchTerm, activeTab]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/teacher/classes');

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      setClasses(data);
      setFilteredClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My Classes</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Classes & Subjects</CardTitle>
            <div className="mt-4 sm:mt-0 relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Classes</TabsTrigger>
              <TabsTrigger value="classteacher">Class Teacher</TabsTrigger>
              <TabsTrigger value="subjects">Subject Teacher</TabsTrigger>
            </TabsList>
          </Tabs>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Loading classes...</TableCell>
                </TableRow>
              ) : filteredClasses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    {searchTerm ? (
                      <p>No classes match your search</p>
                    ) : (
                      <div>
                        <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p>No classes assigned yet</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center text-primary mr-3">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            Class {romanize(cls.grade)}-{cls.section}
                            {cls.isClassTeacher && (
                              <Badge className="ml-2" variant="outline">Class Teacher</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{cls.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{cls.subject}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                        {cls.students}
                      </div>
                    </TableCell>
                    <TableCell>{cls.room || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {cls.schedule.map((day, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/classes/${cls.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/classes/${cls.id}/students`}>
                              <Users className="h-4 w-4 mr-2" />
                              View Students
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/classes/${cls.id}/attendance`}>
                              <ListChecks className="h-4 w-4 mr-2" />
                              Take Attendance
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/classes/${cls.id}/assignments`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Assignments
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/classes/${cls.id}/schedule`}>
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
