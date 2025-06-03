"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock, Calendar, BookOpen, AlertCircle,
  CheckCircle2, FileText, MapPin, Timer
} from "lucide-react";
import Link from "next/link";

type Exam = {
  id: string;
  title: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  room: string;
  teacher: string;
  type: 'midterm' | 'final' | 'quiz' | 'practical';
  status: 'upcoming' | 'ongoing' | 'completed' | 'missed';
  instructions?: string;
  syllabus?: string[];
  result?: {
    score: number;
    maxScore: number;
    grade: string;
    rank?: number;
    feedback?: string;
  };
};

export default function StudentExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/student/exams');
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'ongoing':
        return <Timer className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'missed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'final':
        return 'bg-red-100 text-red-800';
      case 'midterm':
        return 'bg-orange-100 text-orange-800';
      case 'quiz':
        return 'bg-blue-100 text-blue-800';
      case 'practical':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingExams = exams.filter(exam => exam.status === 'upcoming');
  const completedExams = exams.filter(exam => exam.status === 'completed');
  const ongoingExams = exams.filter(exam => exam.status === 'ongoing');

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Examinations</h1>
        <p className="text-muted-foreground">View upcoming exams, results, and exam schedules</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Upcoming</p>
                <p className="text-2xl font-bold text-blue-600">{upcomingExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Ongoing</p>
                <p className="text-2xl font-bold text-green-600">{ongoingExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-gray-600">{completedExams.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Average Score</p>
                <p className="text-2xl font-bold">
                  {completedExams.length > 0
                    ? Math.round(completedExams.reduce((sum, exam) =>
                        sum + (exam.result ? (exam.result.score / exam.result.maxScore) * 100 : 0), 0
                      ) / completedExams.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          <div className="space-y-4">
            {upcomingExams.length > 0 ? (
              upcomingExams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(exam.status)}
                        <div>
                          <CardTitle className="text-lg">{exam.title}</CardTitle>
                          <p className="text-muted-foreground">{exam.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(exam.type)}>
                          {exam.type}
                        </Badge>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-medium">
                            {new Date(exam.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Time</p>
                          <p className="font-medium">
                            {exam.startTime} - {exam.endTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Room</p>
                          <p className="font-medium">{exam.room}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Duration</p>
                          <p className="font-medium">{exam.duration} mins</p>
                        </div>
                      </div>
                    </div>

                    {exam.instructions && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
                        <p className="text-sm text-blue-800">{exam.instructions}</p>
                      </div>
                    )}

                    {exam.syllabus && exam.syllabus.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Syllabus Coverage</h4>
                        <div className="flex flex-wrap gap-2">
                          {exam.syllabus.map((topic, index) => (
                            <Badge key={index} variant="outline">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-10">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No upcoming exams</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-4">
            {completedExams.length > 0 ? (
              completedExams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <p className="text-muted-foreground">{exam.subject}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(exam.type)}>
                          {exam.type}
                        </Badge>
                        {exam.result && (
                          <Badge
                            variant={
                              (exam.result.score / exam.result.maxScore) * 100 >= 80 ? "default" :
                              (exam.result.score / exam.result.maxScore) * 100 >= 60 ? "secondary" :
                              "outline"
                            }
                          >
                            {exam.result.grade}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {exam.result && (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Score</p>
                          <p className="text-2xl font-bold">
                            {exam.result.score}/{exam.result.maxScore}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Percentage</p>
                          <p className="text-2xl font-bold">
                            {Math.round((exam.result.score / exam.result.maxScore) * 100)}%
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Grade</p>
                          <p className="text-2xl font-bold">{exam.result.grade}</p>
                        </div>

                        {exam.result.rank && (
                          <div>
                            <p className="text-sm text-muted-foreground">Rank</p>
                            <p className="text-2xl font-bold">{exam.result.rank}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {exam.result?.feedback && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Teacher's Feedback</h4>
                        <p className="text-sm text-gray-700">{exam.result.feedback}</p>
                      </div>
                    )}

                    <div className="mt-4 flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Exam Date: {new Date(exam.date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-10">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No exam results available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Complete Exam Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exams
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(exam.status)}
                        <div>
                          <h4 className="font-medium">{exam.title}</h4>
                          <p className="text-sm text-muted-foreground">{exam.subject}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getTypeColor(exam.type)} variant="outline">
                            {exam.type}
                          </Badge>
                          <Badge className={getStatusColor(exam.status)}>
                            {exam.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(exam.date).toLocaleDateString()} • {exam.startTime}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
