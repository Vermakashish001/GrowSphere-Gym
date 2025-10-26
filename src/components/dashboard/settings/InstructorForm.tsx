"use client";

import { useState } from "react";
import { addInstructor } from "@/lib/actions";
import { User, Mail } from "lucide-react";
import Toast from "@/components/Toast";
import ImageUpload from "@/components/ImageUpload";

interface InstructorFormProps {
  defaultOpen?: boolean;
  onCancel?: () => void;
}

export default function InstructorForm({ defaultOpen = false, onCancel }: InstructorFormProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFileId, setImageFileId] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      
      // Add image data if available
      if (imageUrl) {
        formData.append("image", imageUrl);
      }
      if (imageFileId) {
        formData.append("imageFileId", imageFileId);
      }
      
      await addInstructor(formData);
      setMessage({ type: "success", text: "Instructor added successfully!" });
      
      // Clear form fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setImageUrl("");
      setImageFileId("");
      
      // Close form after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setMessage(null);
        if (onCancel) onCancel();
      }, 2000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add instructor" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20"
      >
        + Add Instructor
      </button>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Add New Instructor</h3>
        <button
          onClick={() => {
            setIsOpen(false);
            setMessage(null);
            setFirstName("");
            setLastName("");
            setEmail("");
            setImageUrl("");
            setImageFileId("");
            if (onCancel) onCancel();
          }}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ✕
        </button>
      </div>

      {message && (
        <Toast
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            First Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="Enter first name"
              className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Last Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              name="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Enter last name"
              className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="instructor@example.com"
              className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Profile Image Upload (Optional) */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Profile Image (Optional)
          </label>
          <ImageUpload
            onUploadSuccess={(url, fileId) => {
              setImageUrl(url);
              setImageFileId(fileId);
            }}
            currentImage={imageUrl || undefined}
            folder="/instructors"
            maxSize={5}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setMessage(null);
              setFirstName("");
              setLastName("");
              setEmail("");
              setImageUrl("");
              setImageFileId("");
              if (onCancel) onCancel();
            }}
            className="flex-1 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isSubmitting ? "Adding..." : "Add Instructor"}
          </button>
        </div>
      </form>
    </div>
  );
}
