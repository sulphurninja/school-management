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
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle, Search, MoreVertical,
  Pencil, Eye, Trash2, Calendar, Clock,
  FileCheck, FileWarning
} from "lucide-react";
import Link from "next/link";

type Assignment = {
  id: string;
  title: string;
  description: string;
  subject: string;
  class: string;
  lessonId: string;
  startDate: string;
  dueDate: string;
  totalSubmissions: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
};

type Lesson = {
  id: string;
  name: string;
  subject: string;
  class: string;
};

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // New assignment form state
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    lessonId: '',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchAssignments();
    fetchLessons();
  }, []);

  useEffect(() => {
    let filtered = assignments;

    // Filter by status
    if (activeTab === 'active') {
      filtered = filtered.filter(assignment => new Date(assignment.dueDate) >= new Date());
    } else if (activeTab === 'past') {
      filtered = filtered.filter(assignment => new Date(assignment.dueDate) < new Date());
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.class.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssignments(filtered);
  }, [assignments, activeTab, searchTerm]);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/teacher/assignments');

      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }

      const data = await response.json();
      setAssignments(data);
      setFilteredAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch('/api/teacher/lessons');

      if (!response.ok) {
        throw new Error('Failed to fetch lessons');
      }

      const data = await response.json();
      setLessons(data);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleAddAssignment = async () => {
    try {
      const response = await fetch('/api/teacher/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      });

      if (!response.ok) {
        throw new Error('Failed to create assignment');
      }

      toast({
        title: "Success",
        description: "Assignment created successfully",
        variant: "default",
      });

      setIsAddDialogOpen(false);
      setNewAssignment({
        title: '',
        description: '',
        lessonId: '',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      fetchAssignments();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      const response = await fetch(`/api/teacher/assignments/${selectedAssignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedAssignment.title,
          description: selectedAssignment.description,
          lessonId: selectedAssignment.lessonId,
          startDate: selectedAssignment.startDate,
          dueDate: selectedAssignment.dueDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update assignment');
      }

      toast({
        title: "Success",
        description: "Assignment updated successfully",
        variant: "default",
      });

      setIsEditDialogOpen(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This will remove all student submissions as well.')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/assignments/${assignmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete assignment');
      }

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
        variant: "default",
      });

      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  // Format dates
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Check if assignment is active or past due
  const isAssignmentActive = (dueDate: string) => {
    return new Date(dueDate) >= new Date();
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Assignments</h1>

        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">Loading assignments...</TableCell>
                </TableRow>
              ) : filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    {searchTerm ? (
                      <p>No assignments match your search</p>
                    ) : (
                      <div>
                        <FileCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p>You haven't created any assignments yet</p>
                        <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                          Create Your First Assignment
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">
                      <div className="truncate max-w-[200px]">
                        {assignment.title}
                      </div>
                    </TableCell>
                    <TableCell>{assignment.subject}</TableCell>
                    <TableCell>{assignment.class}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        {formatDate(assignment.dueDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="text-green-600">{assignment.gradedSubmissions}</span>
                        <span>/</span>
                        <span className="text-yellow-600">{assignment.pendingSubmissions}</span>
                        <span>/</span>
                        <span>{assignment.totalSubmissions}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isAssignmentActive(assignment.dueDate) ? (
                        <Badge variant="default" className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="outline">Closed</Badge>
                      )}
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
                            <Link href={`/teacher/assignments/${assignment.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Submissions
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteAssignment(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
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

      {/* Add Assignment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Add a new assignment for your students.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Assignment Title</Label>
              <Input
                id="title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                placeholder="e.g., Mathematics Homework 1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                placeholder="Describe the assignment details and requirements"
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lesson">Associated Lesson</Label>
              <Select
                value={newAssignment.lessonId}
                onValueChange={(value) => setNewAssignment({...newAssignment, lessonId: value})}
              >
                <SelectTrigger id="lesson">
                  <SelectValue placeholder="Select a lesson" />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {lesson.name} - {lesson.subject} ({lesson.class})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newAssignment.startDate}
                  onChange={(e) => setNewAssignment({...newAssignment, startDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAssignment}>Create Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Assignment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update assignment details.
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Assignment Title</Label>
                <Input
                  id="edit-title"
                  value={selectedAssignment.title}
                  onChange={(e) => setSelectedAssignment({
                    ...selectedAssignment,
                    title: e.target.value
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedAssignment.description}
                  onChange={(e) => setSelectedAssignment({
                    ...selectedAssignment,
                    description: e.target.value
                  })}
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lesson">Associated Lesson</Label>
                <Select
                  value={selectedAssignment.lessonId}
                  onValueChange={(value) => setSelectedAssignment({
                    ...selectedAssignment,
                    lessonId: value
                  })}
                >
                  <SelectTrigger id="edit-lesson">
                    <SelectValue placeholder="Select a lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.name} - {lesson.subject} ({lesson.class})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={selectedAssignment.startDate.split('T')[0]}
                    onChange={(e) => setSelectedAssignment({
                      ...selectedAssignment,
                      startDate: e.target.value
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={selectedAssignment.dueDate.split('T')[0]}
                    onChange={(e) => setSelectedAssignment({
                      ...selectedAssignment,
                      dueDate: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAssignment}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
