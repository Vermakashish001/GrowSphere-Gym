"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Camera, Mail, Calendar, Building2, Lock, Loader2, CheckCircle2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

interface ProfileUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string | null;
  imageFileId?: string | null;
  createdAt: Date;
  gym: {
    id: string;
    name: string;
  };
}

interface ProfileViewProps {
  user: ProfileUser;
}

export default function ProfileView({ user }: ProfileViewProps) {
  const { update } = useSession();
  const [activeTab, setActiveTab] = useState<"info" | "security">("info");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showEmailChangeForm, setShowEmailChangeForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Profile Info State
  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Profile Image State
  const [profileImage, setProfileImage] = useState(user.image);

  const handleImageUpload = async (imageUrl: string, fileId: string) => {
    try {
      const response = await fetch("/api/user/update-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl, fileId }),
      });

      if (response.ok) {
        setProfileImage(imageUrl);
        setMessage({ type: "success", text: "Profile image updated successfully!" });
        
        // Update the session to reflect new image immediately
        await update();
        
        // Refresh the page to show image everywhere
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        throw new Error("Failed to update image");
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile image" });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
        }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        await update(); // Refresh session
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleEmailChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(newEmail);
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/user/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ 
          type: "success", 
          text: `Verification email sent to ${newEmail}. Please check your inbox.` 
        });
        setShowEmailChangeForm(false);
        setNewEmail("");
      } else {
        throw new Error(data.error || "Failed to request email change");
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Failed to request email change" 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must be at least 8 characters" });
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        throw new Error(data.error || "Failed to change password");
      }
    } catch (error) {
      setMessage({ 
        type: "error", 
        text: error instanceof Error ? error.message : "Failed to change password" 
      });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl border ${
              message.type === "success"
                ? "bg-success/10 border-success/20 text-success"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Profile Header with Image */}
          <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-background shadow-xl">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-muted-foreground mt-1">{user.email}</p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{user.gym.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "info"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <User className="w-4 h-4" />
                Personal Info
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "security"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Lock className="w-4 h-4" />
                Security
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "info" ? (
              <div className="space-y-8">
                {/* Profile Picture Upload */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Profile Picture</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload a professional photo to personalize your profile
                  </p>
                  <ImageUpload
                    onUploadSuccess={handleImageUpload}
                    currentImage={profileImage || undefined}
                    folder="/profiles"
                    maxSize={5}
                    className="max-w-md"
                  />
                </div>

                {/* Personal Information Form */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Personal Information</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your personal details
                  </p>

                  <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, firstName: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, lastName: e.target.value })
                          }
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Email Management - Separate Section */}
                  <div className="mt-8 pt-8 border-t border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Email Address</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage your account email address
                    </p>
                    
                    <div className="max-w-2xl">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Current Email
                      </label>
                      <div className="flex gap-3 mb-4">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full pl-11 pr-4 py-3 bg-muted border border-border rounded-lg text-foreground cursor-not-allowed"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowEmailChangeForm(true)}
                          className="px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors whitespace-nowrap"
                        >
                          Change Email
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Email changes require verification for security
                      </p>

                      {/* Email Change Form */}
                      {showEmailChangeForm && (
                        <div className="mt-4 p-4 border border-border rounded-lg bg-accent/50">
                          <h4 className="font-medium text-foreground mb-3">Change Email Address</h4>
                          <form onSubmit={handleEmailChangeRequest} className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-foreground mb-2">
                                New Email Address
                              </label>
                              <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter new email address"
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                                required
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                A verification link will be sent to this address
                              </p>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowEmailChangeForm(false);
                                  setNewEmail("");
                                }}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                              >
                                {loading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                  </>
                                ) : (
                                  "Send Verification"
                                )}
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Change Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your password to keep your account secure
                  </p>

                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        required
                        minLength={8}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Changing...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
