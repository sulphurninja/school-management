"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  PlusCircle, Search, Users, BookOpen,
  Pencil, MoreVertical, Trash2
} from "lucide-react";

type Section = {
  _id: number;
  name: string;
  capacity: number;
  supervisor?: {
    _id: string;
    name: string;
    surname: string;
  };
  grade: {
    _id: number;
    level: number;
  };
  studentCount: number;
};

type Teacher = {
  _id: string;
  name: string;
  surname: string;
};

type Grade = {
  _id: number;
  level: number;
};

// Helper for Roman numerals (for class display)
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

export default function SectionsManagement() {
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // New section form state
  const [newSection, setNewSection] = useState({
    name: '',
    capacity: 30,
    supervisorId: '',
    gradeId: 0
  });

  useEffect(() => {
    fetchSections();
    fetchTeachers();
    fetchGrades();
  }, []);

  useEffect(() => {
    // Filter sections based on search term
    if (searchTerm) {
      const filtered = sections.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.grade.level.toString().includes(searchTerm) ||
        (c.supervisor && `${c.supervisor.name} ${c.supervisor.surname}`.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSections(filtered);
    } else {
      setFilteredSections(sections);
    }
  }, [sections, searchTerm]);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/classes');

      if (!response.ok) {
        throw new Error('Failed to fetch sections');
      }

      const data = await response.json();
      setSections(data);
      setFilteredSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({
        title: "Error",
        description: "Failed to load sections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/admin/teachers');

      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }

      const data = await response.json();
      // Fix: Check if data has a teachers property (which is the array)
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/admin/grades');

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      setGrades(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleAddSection = async () => {
    try {
      const response = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSection),
      });

      if (!response.ok) {
        throw new Error('Failed to add section');
      }

      toast({
        title: "Success",
        description: "Section added successfully",
        variant: "default",
      });

      setIsAddDialogOpen(false);
      setNewSection({
        name: '',
        capacity: 30,
        supervisorId: '',
        gradeId: 0
      });
      fetchSections();
    } catch (error) {
      console.error('Error adding section:', error);
      toast({
        title: "Error",
        description: "Failed to add section",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSection = async () => {
    if (!selectedSection) return;

    try {
      const response = await fetch(`/api/admin/classes/${selectedSection._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedSection.name,
          capacity: selectedSection.capacity,
          supervisorId: selectedSection.supervisor?._id || '',
          gradeId: selectedSection.grade._id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update section');
      }

      toast({
        title: "Success",
        description: "Section updated successfully",
        variant: "default",
      });

      setIsEditDialogOpen(false);
      fetchSections();
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section? This will affect all associated students and timetable.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/classes/${sectionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete section');
      }

      toast({
        title: "Success",
        description: "Section deleted successfully",
        variant: "default",
      });

      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  // Generate section name suggestions for a class (I-A, I-B, etc.)
  const generateSectionSuggestion = (gradeId: number) => {
    if (!gradeId) return '';

    const grade = grades.find(g => g._id === gradeId);
    if (!grade) return '';

    const existingSections = sections.filter(s => s.grade._id === gradeId);
    const sectionLetters = existingSections.map(s => {
      // Extract section letter from name like "IX-A" -> "A"
      const match = s.name.match(/[A-Z]$/);
      return match ? match[0] : '';
    });

    // Find the next available section letter
    let nextLetter = 'A';
    while (sectionLetters.includes(nextLetter)) {
      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1);
    }

    return `${romanize(grade.level)}-${nextLetter}`;
  };

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Section Management</h1>

        <div className="mt-4 sm:mt-0">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Sections</CardTitle>
              <CardDescription className="mt-2">
                Manage class sections, assign class teachers, and set capacities
              </CardDescription>
            </div>
            <div className="mt-4 sm:mt-0 relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sections..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Class Teacher</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Loading sections...</TableCell>
                </TableRow>
              ) : filteredSections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">No sections found</TableCell>
                </TableRow>
              ) : (
                filteredSections.map((section) => (
                  <TableRow key={section._id}>
                    <TableCell className="font-medium">{section.name}</TableCell>
                    <TableCell>Class {romanize(section.grade.level)}</TableCell>
                    <TableCell>
                      {section.supervisor ?
                        `${section.supervisor.name} ${section.supervisor.surname}` :
                        <span className="text-muted-foreground">None assigned</span>
                      }
                    </TableCell>
                    <TableCell>{section.capacity}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{section.studentCount}</span>
                        {section.studentCount >= section.capacity && (
                          <span className="ml-2 text-red-500">(Full)</span>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSection(section);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteSection(section._id)}
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

      {/* Add Section Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Section</DialogTitle>
            <DialogDescription>
              Create a new section for students.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="grade">Class</Label>
              <Select
                value={newSection.gradeId.toString()}
                onValueChange={(value) => {
                  const gradeId = parseInt(value);
                  setNewSection({
                    ...newSection,
                    gradeId: gradeId,
                    name: generateSectionSuggestion(gradeId)
                  });
                }}
              >
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade._id} value={grade._id.toString()}>
                      Class {romanize(grade.level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Section Name</Label>
              <Input
                id="name"
                value={newSection.name}
                onChange={(e) => setNewSection({...newSection, name: e.target.value})}
                placeholder="e.g., IX-A"
              />
              <div className="text-xs text-muted-foreground">
                Typically follows format like "IX-A", "IX-B", etc.
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={newSection.capacity}
                onChange={(e) => setNewSection({...newSection, capacity: parseInt(e.target.value)})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supervisor">Class Teacher</Label>
              <Select
                value={newSection.supervisorId}
                onValueChange={(value) => setNewSection({...newSection, supervisorId: value})}
              >
                <SelectTrigger id="supervisor">
                  <SelectValue placeholder="Select a class teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher._id} value={teacher._id}>
                      {teacher.name} {teacher.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSection}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Section Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update section information.
            </DialogDescription>
          </DialogHeader>
          {selectedSection && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Section Name</Label>
                <Input
                  id="edit-name"
                  value={selectedSection.name}
                  onChange={(e) => setSelectedSection({
                    ...selectedSection,
                    name: e.target.value
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  value={selectedSection.capacity}
                  onChange={(e) => setSelectedSection({
                    ...selectedSection,
                    capacity: parseInt(e.target.value)
                  })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-grade">Class</Label>
                <Select
                  value={selectedSection.grade._id.toString()}
                  onValueChange={(value) => setSelectedSection({
                    ...selectedSection,
                    grade: {
                      ...selectedSection.grade,
                      _id: parseInt(value)
                    }
                  })}
                >
                  <SelectTrigger id="edit-grade">
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade._id} value={grade._id.toString()}>
                        Class {romanize(grade.level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-supervisor">Class Teacher</Label>
                <Select
                  value={selectedSection.supervisor?._id || ""}
                  onValueChange={(value) => setSelectedSection({
                    ...selectedSection,
                    supervisor: value ?
                      { _id: value, name: "", surname: "" } :
                      undefined
                  })}
                >
                  <SelectTrigger id="edit-supervisor">
                    <SelectValue placeholder="Select a class teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher._id} value={teacher._id}>
                        {teacher.name} {teacher.surname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSection}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
