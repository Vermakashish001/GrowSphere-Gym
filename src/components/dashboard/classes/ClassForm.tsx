"use client";

import { useState } from "react";
import { Instructor } from "@prisma/client";
import { addClass } from "@/lib/actions";
import { Calendar, Clock, Users, User, FileText, AlertCircle, Repeat } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ClassFormProps {
  instructors: Instructor[];
}

export default function ClassForm({ instructors }: ClassFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  
  // Date/Time state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(10, 0, 0, 0);
  
  const [startDateTime, setStartDateTime] = useState<Date>(tomorrow);
  const [endDateTime, setEndDateTime] = useState<Date>(tomorrowEnd);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      
      // Validate that endTime is after startTime
      if (endDateTime <= startDateTime) {
        setError("End time must be after start time");
        setIsSubmitting(false);
        return;
      }

      // Add date/time to formData
      formData.append("startTime", startDateTime.toISOString());
      formData.append("endTime", endDateTime.toISOString());

      // Add recurrence data to formData
      formData.append("isRecurring", isRecurring.toString());
      if (isRecurring) {
        formData.append("recurrenceDays", JSON.stringify(selectedDays));
      }

      await addClass(formData);
    } catch (err: any) {
      setError(err.message || "Failed to create class");
      setIsSubmitting(false);
    }
  };

  // Get tomorrow's date for recurrence end date
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  const defaultDateString = defaultDate.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Class Information */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">
            Class Information
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Class Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Class Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g., Morning Yoga, HIIT Training"
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief description of the class..."
              className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Instructor */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Instructor *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <select
                aria-label="Instructor"
                name="instructorId"
                required
                className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none cursor-pointer"
              >
                <option value="">Select an instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.firstName} {instructor.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-2">
              Capacity *
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="number"
                name="capacity"
                required
                min="1"
                max="100"
                defaultValue="20"
                placeholder="Maximum number of participants"
                className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Schedule & Timing */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Schedule & Timing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date & Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Date & Time *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
              <DatePicker
                selected={startDateTime}
                onChange={(date) => {
                  if (date) {
                    setStartDateTime(date);
                    // Automatically set end time to 1 hour later
                    const newEndTime = new Date(date);
                    newEndTime.setHours(date.getHours() + 1);
                    setEndDateTime(newEndTime);
                  }
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                required
                popperClassName="custom-datepicker-popper"
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Date & Time *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground z-10 pointer-events-none" />
              <DatePicker
                selected={endDateTime}
                onChange={(date) => date && setEndDateTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMM d, yyyy h:mm aa"
                minDate={startDateTime}
                className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                required
                popperClassName="custom-datepicker-popper"
              />
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-3">
          <AlertCircle className="inline h-3 w-3 mr-1" />
          Ensure the end time is after the start time
        </p>
      </div>

      {/* Recurrence Options */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Repeat className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Recurrence (Optional)
          </h2>
        </div>

        {/* Enable Recurrence */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary cursor-pointer"
            />
            <span className="text-sm font-medium text-foreground">
              Make this a recurring class
            </span>
          </label>
        </div>

        {isRecurring && (
          <div className="space-y-6">
            {/* Recurrence Pattern */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recurrence Pattern *
              </label>
              <select
                aria-label="Recurrence Pattern"
                name="recurrencePattern"
                required={isRecurring}
                defaultValue="weekly"
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="weekly">Weekly</option>
              </select>
            </div>

            {/* Days of Week */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Repeat On *
              </label>
              <div className="grid grid-cols-7 gap-2">
                {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      setSelectedDays((prev) =>
                        prev.includes(day)
                          ? prev.filter((d) => d !== day)
                          : [...prev, day]
                      );
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      selectedDays.includes(day)
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border border-border text-muted-foreground hover:border-primary"
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
              {isRecurring && selectedDays.length === 0 && (
                <p className="text-xs text-destructive mt-2">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Please select at least one day
                </p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Recurrence End Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="date"
                  name="recurrenceEndDate"
                  required={isRecurring}
                  min={defaultDateString}
                  className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Classes will be automatically created up to this date
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
        >
          {isSubmitting ? "Creating..." : "Create Class"}
        </button>
      </div>
    </form>
  );
}
