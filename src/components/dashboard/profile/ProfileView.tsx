"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Calendar, Building2, Lock, Loader2 } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import PageHeader from "@/components/dashboard/PageHeader";
import Toast from "@/components/Toast";

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

type TabType = "info" | "security";

export default function ProfileView({ user }: ProfileViewProps) {
  const { update } = useSession();
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showEmailChangeForm, setShowEmailChangeForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Profile Info State
  const [profileData, setProfileData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
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
        await update();
        setTimeout(() => window.location.reload(), 500);
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
        await update();
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
        setMessage({ type: "success", text: `Verification email sent to ${newEmail}. Please check your inbox.` });
        setShowEmailChangeForm(false);
        setNewEmail("");
      } else {
        throw new Error(data.error || "Failed to request email change");
      }
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to request email change" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

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
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Failed to change password" });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: "info", label: "Personal Info" },
    { id: "security", label: "Security" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        icon={User}
        title="Profile"
        description="Manage your account settings and preferences"
      />

      {/* Toast Notification */}
      {message && (
        <Toast
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Profile Info Card */}
      <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-border hover:border-primary/50 transition-colors shadow-lg">
            {profileImage ? (
              <img
                src={profileImage}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>{user.gym.name}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 sm:gap-2 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {activeTab === "info" && (
        <div className="space-y-6">
          {/* Profile Picture Upload */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Profile Picture</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Upload a professional photo
                </p>
              </div>
            </div>
            <ImageUpload
              onUploadSuccess={handleImageUpload}
              currentImage={profileImage || undefined}
              folder="/profiles"
              maxSize={5}
            />
          </div>

          {/* Personal Information Form */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Personal Information</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Update your details</p>
              </div>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
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
          </div>

          {/* Email Management */}
          <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground">Email Address</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your account email</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-10 sm:pl-11 pr-4 py-2.5 bg-muted border border-border rounded-lg text-sm sm:text-base text-foreground cursor-not-allowed"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowEmailChangeForm(true)}
                className="px-4 py-2.5 bg-secondary/50 hover:bg-secondary text-foreground rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                Change Email
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Email changes require verification for security
            </p>

            {/* Email Change Form */}
            {showEmailChangeForm && (
              <div className="mt-4 p-4 border border-border rounded-lg bg-secondary/20">
                <h4 className="text-sm sm:text-base font-medium text-foreground mb-3">Change Email Address</h4>
                <form onSubmit={handleEmailChangeRequest} className="space-y-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                      New Email Address
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                      className="w-full px-3 sm:px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      A verification link will be sent to this address
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailChangeForm(false);
                        setNewEmail("");
                      }}
                      className="px-4 py-2.5 bg-secondary/50 hover:bg-secondary text-foreground rounded-lg text-sm font-medium transition-colors order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-primary/20 order-1 sm:order-2"
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
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">Change Password</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Keep your account secure</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-border">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
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
      )}
    </div>
  );
}
