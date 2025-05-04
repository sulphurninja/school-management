"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  BellRing,
  X,
  CheckCircle,
  GraduationCap,
  School,
  UserSquare,
  ClipboardList,
  BookMarked,
  PieChart,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "../ThemeToggle";
import { motion } from "framer-motion";

// Extracting navigation schema to improve structure
interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  section?: string;
}

interface SidebarSection {
  title: string;
  links: SidebarLink[];
}

// Updated admin links with logical sections
const adminSections: SidebarSection[] = [
  {
    title: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      { href: "/admin/approvals", label: "Approvals", icon: <CheckCircle className="h-5 w-5" /> }
    ]
  },
  {
    title: "Academic",
    links: [
      { href: "/admin/grades", label: "Classes", icon: <School className="h-5 w-5" /> },
      { href: "/admin/classes", label: "Sections", icon: <BookMarked className="h-5 w-5" /> },
      { href: "/admin/subjects", label: "Subjects", icon: <BookOpen className="h-5 w-5" /> },
      { href: "/admin/schedule", label: "Timetable", icon: <Calendar className="h-5 w-5" /> }
    ]
  },
  {
    title: "People",
    links: [
      { href: "/admin/students", label: "Students", icon: <GraduationCap className="h-5 w-5" /> },
      { href: "/admin/teachers", label: "Teachers", icon: <UserSquare className="h-5 w-5" /> },
      { href: "/admin/parents", label: "Parents", icon: <Users className="h-5 w-5" /> }
    ]
  },
  {
    title: "Administration",
    links: [
      { href: "/admin/reports", label: "Reports", icon: <FileText className="h-5 w-5" /> },
      { href: "/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> }
    ]
  }
];

// Updated teacher links with sections
const teacherSections: SidebarSection[] = [
  {
    title: "Overview",
    links: [
      { href: "/teacher", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      { href: "/teacher/schedule", label: "My Timetable", icon: <Calendar className="h-5 w-5" /> }
    ]
  },
  {
    title: "Teaching",
    links: [
      { href: "/teacher/classes", label: "My Classes", icon: <BookMarked className="h-5 w-5" /> },
      { href: "/teacher/lessons", label: "Lessons", icon: <BookOpen className="h-5 w-5" /> },
      { href: "/teacher/students", label: "Students", icon: <GraduationCap className="h-5 w-5" /> },
      { href: "/teacher/assignments", label: "Assignments", icon: <ClipboardList className="h-5 w-5" /> }
    ]
  },
  {
    title: "Communication",
    links: [
      { href: "/teacher/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
      { href: "/teacher/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> }
    ]
  }
];

// Updated student links with sections
const studentSections: SidebarSection[] = [
  {
    title: "Overview",
    links: [
      { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      { href: "/student/schedule", label: "My Timetable", icon: <Calendar className="h-5 w-5" /> }
    ]
  },
  {
    title: "Academics",
    links: [
      { href: "/student/classes", label: "My Classes", icon: <BookMarked className="h-5 w-5" /> },
      { href: "/student/assignments", label: "Assignments", icon: <ClipboardList className="h-5 w-5" /> },
      { href: "/student/results", label: "Results", icon: <PieChart className="h-5 w-5" /> }
    ]
  },
  {
    title: "Other",
    links: [
      { href: "/student/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
      { href: "/student/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> }
    ]
  }
];

// Updated parent links with sections
const parentSections: SidebarSection[] = [
  {
    title: "Overview",
    links: [
      { href: "/parent", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      { href: "/parent/children", label: "My Children", icon: <Users className="h-5 w-5" /> }
    ]
  },
  {
    title: "Academic",
    links: [
      { href: "/parent/performance", label: "Performance", icon: <PieChart className="h-5 w-5" /> },
      { href: "/parent/attendance", label: "Attendance", icon: <Calendar className="h-5 w-5" /> },
      { href: "/parent/teachers", label: "Teachers", icon: <UserSquare className="h-5 w-5" /> }
    ]
  },
  {
    title: "Communication",
    links: [
      { href: "/parent/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" /> },
      { href: "/parent/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> }
    ]
  }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll listener for header style changes
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  let sections: SidebarSection[] = [];

  switch (user.role) {
    case 'admin':
      sections = adminSections;
      break;
    case 'teacher':
      sections = teacherSections;
      break;
    case 'student':
      sections = studentSections;
      break;
    case 'parent':
      sections = parentSections;
      break;
  }

  // Helper function to format display name
  const getDisplayName = () => {
    if (user.name && user.surname) {
      return `${user.name} ${user.surname}`;
    }
    return user.username;
  };

  // Function to get initials for avatar
  const getInitials = () => {
    if (user.name && user.surname) {
      return `${user.name[0]}${user.surname[0]}`.toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  };

  // Function to get role display name
  const getRoleDisplay = () => {
    switch(user.role) {
      case 'admin': return 'Administrator';
      case 'teacher': return 'Teacher';
      case 'student': return 'Student';
      case 'parent': return 'Parent';
      default: return user.role;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:h-screen border-r border-border/40",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar header with logo */}
        <div className="flex items-center h-16 px-6 border-b border-border/40">
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              EduPortal
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User profile section */}
        <div className="px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-primary/10">
              <AvatarImage src="" alt={getDisplayName()} />
              <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{getDisplayName()}</span>
              <span className="text-xs text-muted-foreground">{getRoleDisplay()}</span>
            </div>
          </div>
        </div>

        {/* Navigation sections */}
        <div className="flex flex-col h-[calc(100%-12rem)] overflow-y-auto py-4 px-4">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase px-2 mb-2">
                {section.title}
              </h3>
              <nav>
                <ul className="space-y-1">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>
                        <div className={cn(
                          "flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent/50 transition-colors text-sm group",
                          pathname === link.href ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                        )}>
                          <div className="flex items-center">
                            <div className={cn(
                              "mr-3",
                              pathname === link.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}>
                              {link.icon}
                            </div>
                            <span>{link.label}</span>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          ))}
        </div>

        {/* Sidebar footer with logout */}
        <div className="mt-auto p-4 border-t border-border/40">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-sm"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className={cn(
          "bg-background/80 backdrop-blur-sm sticky top-0 z-30 transition-all duration-200",
          isScrolled ? "shadow-sm border-b border-border/40" : ""
        )}>
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumb or page title could go here */}
            <div className="hidden md:block ml-4">
              <h1 className="text-lg font-medium">{
                // Get the current page title based on pathname
                pathname === "/" + user.role
                  ? "Dashboard"
                  : pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              }</h1>
            </div>

            <div className="flex items-center ml-auto space-x-1 md:space-x-3">
              {/* Theme toggle */}
              <ThemeToggle />

              {/* Notifications - no badge counter */}
              <Button variant="ghost" size="icon">
                <BellRing className="h-5 w-5" />
              </Button>

              {/* User menu */}
              <div className="flex items-center border-l border-border/40 pl-3 ml-1">
                <Button variant="ghost" className="flex items-center gap-2 text-sm font-normal md:pr-4">
                  <Avatar className="h-8 w-8 border border-primary/10">
                    <AvatarImage src="" alt={getDisplayName()} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-block">{user.username}</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area with enhanced styling */}
        <main className="flex-1 overflow-y-auto bg-background relative">
          {/* Content with responsive padding */}
          <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8 max-w-7xl mx-auto">
            {/* Welcome banner for dashboard pages - simplified */}
            {pathname === `/${user.role}` && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 bg-card rounded-lg overflow-hidden shadow-sm border border-border/40"
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user.name || user.username}</h2>
                  <p className="text-muted-foreground">
                    {user.role === 'admin' && "Manage your school operations and monitor academic progress."}
                    {user.role === 'teacher' && "Access your class schedule and manage student assignments."}
                    {user.role === 'student' && "View your assignments and check your class schedule."}
                    {user.role === 'parent' && "Stay updated with your child's academic progress."}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Button size="sm" className="gap-2">
                      {user.role === 'admin' && <>View Reports <FileText className="h-4 w-4" /></>}
                      {user.role === 'teacher' && <>Check Schedule <Calendar className="h-4 w-4" /></>}
                      {user.role === 'student' && <>View Assignments <ClipboardList className="h-4 w-4" /></>}
                      {user.role === 'parent' && <>Check Performance <PieChart className="h-4 w-4" /></>}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main content */}
            <div className="relative">
              {children}
            </div>
          </div>
        </main>

        {/* Footer with school info and links - simplified */}
        {/* <footer className="bg-card border-t border-border/40 py-4 px-6 text-xs text-muted-foreground">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <span className="font-medium text-sm text-foreground">EduPortal</span> © {new Date().getFullYear()} - School Management System
            </div>
            <div className="flex gap-4">
              <Link href="/help" className="hover:text-primary">Help</Link>
              <Link href="/privacy" className="hover:text-primary">Privacy</Link>
              <Link href="/terms" className="hover:text-primary">Terms</Link>
            </div>
          </div>
        </footer> */}
      </div>
    </div>
  );
}
