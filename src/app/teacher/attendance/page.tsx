"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar, Clock, Users, CheckCircle2,
  XCircle, Save, Search, Filter, AlertCircle,
  User, BookOpen, MapPin
} from "lucide-react";

type Student = {
  id: string;
  name: string;
  surname: string;
  rollNo: string;
  profileImage?: string;
  email?: string;
};

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

type AttendanceRecord = {
  studentId: string;
  status: AttendanceStatus;
  remarks?: string;
};

type ClassInfo = {
  id: number;
  name: string;
  grade: number;
  studentCount: number;
  room?: string;
};

type Subject = {
  id: number;
  name: string;
};

export default function TeacherAttendance() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingRecord, setHasExistingRecord] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStudents();
      checkExistingAttendance();
    }
  }, [selectedClass, selectedDate, selectedSubject, selectedPeriod]);

  const fetchTeacherData = async () => {
    try {
      const [classesResponse, subjectsResponse] = await Promise.all([
        fetch('/api/teacher/classes'),
        fetch('/api/teacher/subjects')
      ]);

      if (classesResponse.ok && subjectsResponse.ok) {
        const classesData = await classesResponse.json();
        const subjectsData = await subjectsResponse.json();
        setClasses(classesData);
        setSubjects(subjectsData);
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher data",
        variant: "destructive",
      });
    }
  };

  const fetchClassStudents = async () => {
    if (!selectedClass) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/teacher/classes/${selectedClass}/students`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);

        // Initialize attendance with all students as present by default
        const initialAttendance: Record<string, AttendanceRecord> = {};
        data.forEach((student: Student) => {
          initialAttendance[student.id] = {
            studentId: student.id,
            status: 'present',
            remarks: ''
          };
        });
        setAttendance(initialAttendance);
      }
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

  const checkExistingAttendance = async () => {
    if (!selectedClass || !selectedDate) return;

    try {
      const params = new URLSearchParams({
        classId: selectedClass,
        date: selectedDate,
        subjectId: selectedSubject || '',
        period: selectedPeriod || ''
      });

      const response = await fetch(`/api/teacher/attendance/existing?${params}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setHasExistingRecord(true);
          const existingAttendance: Record<string, AttendanceRecord> = {};
          data.forEach((record: any) => {
            existingAttendance[record.studentId] = {
              studentId: record.studentId,
              status: record.status,
              remarks: record.remarks || ''
            };
          });
          setAttendance(existingAttendance);
        } else {
          setHasExistingRecord(false);
        }
      }
    } catch (error) {
      console.error('Error checking existing attendance:', error);
    }
  };

  const updateAttendanceStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const updateRemarks = (studentId: string, remarks: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks
      }
    }));
  };

  const markAllAs = (status: AttendanceStatus) => {
    const updatedAttendance = { ...attendance };
    Object.keys(updatedAttendance).forEach(studentId => {
      updatedAttendance[studentId].status = status;
    });
    setAttendance(updatedAttendance);
  };

  const saveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      toast({
        title: "Error",
        description: "Please select class and date",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const attendanceData = {
        classId: parseInt(selectedClass),
        date: selectedDate,
        subjectId: selectedSubject ? parseInt(selectedSubject) : null,
        period: selectedPeriod ? parseInt(selectedPeriod) : null,
        attendance: Object.values(attendance)
      };

      const response = await fetch('/api/teacher/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: hasExistingRecord ?
            "Attendance updated successfully" :
            "Attendance saved successfully",
        });
        setHasExistingRecord(true);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadgeColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'excused':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const attendanceStats = {
    present: Object.values(attendance).filter(a => a.status === 'present').length,
    absent: Object.values(attendance).filter(a => a.status === 'absent').length,
    late: Object.values(attendance).filter(a => a.status === 'late').length,
    excused: Object.values(attendance).filter(a => a.status === 'excused').length,
  };

  const attendanceRate = students.length > 0
    ? Math.round((attendanceStats.present / students.length) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mark Attendance</h1>
        <p className="text-muted-foreground">Record student attendance for your classes</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Attendance Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Class *</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classInfo) => (
                    <SelectItem key={classInfo.id} value={classInfo.id.toString()}>
                      {classInfo.name} ({classInfo.studentCount} students)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="All subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id.toString()}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any period</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((period) => (
                    <SelectItem key={period} value={period.toString()}>
                      Period {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Actions</label>
              <div className="flex space-x-1">
                <Button
                  onClick={() => markAllAs('present')}
                  variant="outline"
                  size="sm"
                  disabled={!selectedClass}
                  className="flex-1"
                >
                  All Present
                </Button>
                <Button
                  onClick={() => markAllAs('absent')}
                  variant="outline"
                  size="sm"
                  disabled={!selectedClass}
                  className="flex-1"
                >
                  All Absent
                </Button>
              </div>
            </div>
          </div>

          {hasExistingRecord && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                <p className="text-sm text-blue-800">
                  Attendance for this class and date already exists. You can update it below.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      {selectedClass && students.length > 0 && (
        <div className="grid gap-4 md:grid-cols-5 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Present</p>
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="text-center">
                  <p className="text-sm font-medium">Attendance Rate</p>
                  <p className="text-2xl font-bold">{attendanceRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Attendance List */}
      {selectedClass && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Student Attendance ({filteredStudents.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  onClick={saveAttendance}
                  disabled={isSaving || !selectedClass}
                  className="ml-4"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={student.profileImage} />
                              <AvatarFallback>
                                {student.name.charAt(0)}{student.surname.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.name} {student.surname}</p>
                              {student.email && (
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.rollNo}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(attendance[student.id]?.status || 'present')}
                            <Badge className={getStatusBadgeColor(attendance[student.id]?.status || 'present')}>
                              {attendance[student.id]?.status || 'present'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                              <Button
                                key={status}
                                variant={attendance[student.id]?.status === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateAttendanceStatus(student.id, status)}
                                className="h-8 w-8 p-0"
                                title={status.charAt(0).toUpperCase() + status.slice(1)}
                              >
                                {getStatusIcon(status)}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Add remarks..."
                            value={attendance[student.id]?.remarks || ''}
                            onChange={(e) => updateRemarks(student.id, e.target.value)}
                            className="w-48"
                            size="sm"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No students found matching your search' : 'No students in this class'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedClass && (
        <Card>
          <CardContent className="text-center py-20">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a class to start marking attendance</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
