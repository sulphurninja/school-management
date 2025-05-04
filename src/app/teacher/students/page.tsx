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
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Search, MoreVertical, Eye,
  FileText, Mail, Phone, UserCircle
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Student = {
  id: string;
  name: string;
  surname: string;
  rollNo: string;
  grade: number;
  section: string;
  email?: string;
  phone?: string;
  parentName?: string;
  attendancePercentage: number;
  performance: "Excellent" | "Good" | "Average" | "Needs Improvement";
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

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("all");
  const [classes, setClasses] = useState<{ id: string, label: string }[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchClasses();
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${student.name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by class
    if (selectedClass !== "all") {
      const [grade, section] = selectedClass.split('-');
      filtered = filtered.filter(student =>
        student.grade === parseInt(grade) && student.section === section
      );
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/teacher/classes');

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();

      // Create a unique list of class + section combinations
      const uniqueClasses = [...new Set(data.map((cls: any) =>
        `${cls.grade}-${cls.section}`
      ))].map(classKey => {
        const [grade, section] = classKey.split('-');
        return {
          id: classKey,
          label: `Class ${romanize(parseInt(grade))}-${section}`
        };
      });

      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/teacher/students');

      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data = await response.json();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get performance badge color
  const getPerformanceBadgeVariant = (performance: string) => {
    switch (performance) {
      case 'Excellent': return 'default';
      case 'Good': return 'success';
      case 'Average': return 'secondary';
      case 'Needs Improvement': return 'destructive';
      default: return 'outline';
    }
  };

  // Helper to get attendance color
  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Students</h1>
      </div>

      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4">
        <div className="w-full sm:w-64">
          <Select
            value={selectedClass}
            onValueChange={setSelectedClass}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">Loading students...</TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    {searchTerm || selectedClass !== 'all' ? (
                      <p>No students match your filters</p>
                    ) : (
                      <div>
                        <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p>No students found in your classes</p>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarImage src="" alt={`${student.name} ${student.surname}`} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {student.name[0]}{student.surname[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name} {student.surname}</div>
                          {student.parentName && (
                            <div className="text-xs text-muted-foreground">Parent: {student.parentName}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.rollNo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {romanize(student.grade)}-{student.section}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={getAttendanceColor(student.attendancePercentage)}>
                        {student.attendancePercentage}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPerformanceBadgeVariant(student.performance)}>
                        {student.performance}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {student.email && (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs">{student.email}</span>
                          </div>
                        )}
                        {student.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-xs">{student.phone}</span>
                          </div>
                        )}
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
                            <Link href={`/teacher/students/${student.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/students/${student.id}/performance`}>
                              <FileText className="h-4 w-4 mr-2" />
                              Performance
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/teacher/students/${student.id}/attendance`}>
                              <UserCircle className="h-4 w-4 mr-2" />
                              Attendance
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
