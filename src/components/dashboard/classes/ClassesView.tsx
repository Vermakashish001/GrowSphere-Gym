"use client";

import { useState } from "react";
import { Class, Instructor } from "@prisma/client";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Search,
  Plus,
  Grid3x3,
  List,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { updateClass, deleteClass } from "@/lib/actions";

type ClassWithInstructor = Class & {
  instructor: Instructor;
};

interface ClassesViewProps {
  classes: ClassWithInstructor[];
  instructors: Instructor[];
}

type ViewMode = "calendar" | "list";
type TimeFilter = "all" | "today" | "week" | "upcoming";

export default function ClassesView({ classes, instructors }: ClassesViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [editingClass, setEditingClass] = useState<ClassWithInstructor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handle delete class
  const handleDelete = async (classId: string, className: string) => {
    if (confirm(`Are you sure you want to delete "${className}"? This action cannot be undone.`)) {
      try {
        await deleteClass(classId);
        alert("Class deleted successfully!");
        window.location.reload(); // Refresh to show updated list
      } catch (error) {
        alert("Failed to delete class. Please try again.");
        console.error(error);
      }
    }
  };

  // Handle edit class
  const handleEdit = (cls: ClassWithInstructor) => {
    setEditingClass(cls);
    setIsEditModalOpen(true);
  };

  // Handle update class
  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingClass) return;

    const formData = new FormData(e.currentTarget);
    try {
      await updateClass(editingClass.id, formData);
      setIsEditModalOpen(false);
      setEditingClass(null);
      alert("Class updated successfully!");
    } catch (error) {
      alert("Failed to update class. Please try again.");
      console.error(error);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDuration = (startTime: Date, endTime: Date) => {
    const diff = new Date(endTime).getTime() - new Date(startTime).getTime();
    return Math.round(diff / (1000 * 60));
  };

  // Filter classes based on search query and time filter
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${cls.instructor.firstName} ${cls.instructor.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const now = new Date();
    const classDate = new Date(cls.startTime);

    let matchesTimeFilter = true;
    if (timeFilter === "today") {
      matchesTimeFilter = classDate.toDateString() === now.toDateString();
    } else if (timeFilter === "week") {
      const weekFromNow = new Date(now);
      weekFromNow.setDate(now.getDate() + 7);
      matchesTimeFilter = classDate >= now && classDate <= weekFromNow;
    } else if (timeFilter === "upcoming") {
      matchesTimeFilter = classDate >= now;
    }

    return matchesSearch && matchesTimeFilter;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (newFilter: TimeFilter) => {
    setTimeFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Group classes by date for calendar view
  const groupClassesByDate = () => {
    const grouped: { [key: string]: ClassWithInstructor[] } = {};
    
    filteredClasses.forEach((cls) => {
      const dateKey = new Date(cls.startTime).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(cls);
    });

    return grouped;
  };

  const groupedClasses = groupClassesByDate();
  const dates = Object.keys(groupedClasses).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  // Get week days for calendar view
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const weekDays = getWeekDays();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-yellow-500",
      "bg-red-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="md:ml-14 lg:ml-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Classes</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your class schedule and instructors
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-64"
            />
          </div>
          <Link
            href="/dashboard/classes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            New Class
          </Link>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => handleFilterChange("all")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              timeFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange("today")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              timeFilter === "today"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleFilterChange("week")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              timeFilter === "week"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => handleFilterChange("upcoming")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              timeFilter === "upcoming"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            Upcoming
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "calendar"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
          {/* Week Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() - 7);
                  setSelectedDate(newDate);
                }}
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-3 sm:px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary text-xs sm:text-sm font-medium transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  newDate.setDate(newDate.getDate() + 7);
                  setSelectedDate(newDate);
                }}
                className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="inline-grid grid-cols-7 gap-2 sm:gap-2 md:gap-4 min-w-max sm:min-w-0 sm:w-full">
              {weekDays.map((day, index) => {
                const dateKey = day.toDateString();
                const dayClasses = groupedClasses[dateKey] || [];
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={index}
                    className={`w-[90px] sm:w-auto min-h-[140px] sm:min-h-[160px] md:min-h-[200px] p-2 sm:p-3 md:p-4 rounded-lg border ${
                      isToday
                        ? "border-primary bg-primary/5"
                        : "border-border bg-background"
                    }`}
                  >
                    <div className="mb-2">
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        {day.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p
                        className={`text-base sm:text-base md:text-lg font-bold ${
                          isToday ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {day.getDate()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      {dayClasses.map((cls) => {
                        const avatarColor = getAvatarColor(cls.instructor.firstName);
                        return (
                          <div
                            key={cls.id}
                            className="p-2 rounded-lg bg-card border border-border hover:border-primary transition-colors cursor-pointer"
                          >
                            <p className="text-[11px] sm:text-xs font-semibold text-foreground mb-1 line-clamp-2">
                              {cls.name}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              <span className="whitespace-nowrap">{formatTime(cls.startTime)}</span>
                            </p>
                            <div className="hidden sm:flex items-center gap-1 mt-1">
                              <div
                                className={`w-4 h-4 rounded-full ${avatarColor} flex items-center justify-center text-white text-[8px] font-bold`}
                              >
                                {getInitials(
                                  cls.instructor.firstName,
                                  cls.instructor.lastName
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {cls.instructor.firstName[0]}.{" "}
                                {cls.instructor.lastName}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-card border border-border rounded-2xl shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background/50 border-b border-border">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-6 uppercase tracking-wider">
                    Class Name
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-6 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-6 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-6 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground py-3 px-6 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground py-3 px-6 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedClasses.length > 0 ? (
                  paginatedClasses.map((cls) => {
                    const avatarColor = getAvatarColor(cls.instructor.firstName);
                    const initials = getInitials(
                      cls.instructor.firstName,
                      cls.instructor.lastName
                    );

                    return (
                      <tr
                        key={cls.id}
                        className="border-b border-border hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {cls.name}
                            </p>
                            {cls.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {cls.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold`}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {cls.instructor.firstName}{" "}
                                {cls.instructor.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <p className="text-sm text-foreground">
                              {formatDate(cls.startTime)}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(cls.startTime)}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-foreground">
                            {getDuration(cls.startTime, cls.endTime)} min
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm text-foreground">
                              {cls.capacity}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(cls)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="Edit class"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cls.id, cls.name)}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              title="Delete class"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No classes found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredClasses.length)} of {filteredClasses.length} classes
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-lg text-sm">
                <span className="text-foreground font-medium">{currentPage}</span>
                <span className="text-muted-foreground">of</span>
                <span className="text-foreground font-medium">{totalPages || 1}</span>
              </div>
              <button
                className="px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Class Modal */}
      {isEditModalOpen && editingClass && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Edit Class</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Class Name *
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingClass.name}
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingClass.description || ""}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    defaultValue={new Date(editingClass.startTime).toISOString().slice(0, 16)}
                    required
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    defaultValue={new Date(editingClass.endTime).toISOString().slice(0, 16)}
                    required
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Capacity */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    defaultValue={editingClass.capacity}
                    min="1"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Instructor */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Instructor *
                  </label>
                  <select
                    aria-label="Instructor"
                    name="instructorId"
                    defaultValue={editingClass.instructorId}
                    required
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.firstName} {instructor.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  Update Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
