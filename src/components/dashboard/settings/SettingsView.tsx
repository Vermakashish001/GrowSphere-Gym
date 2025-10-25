"use client";

import { useState } from "react";
import { Gym, User, Instructor } from "@prisma/client";
import Image from "next/image";
import { Mail, CreditCard, MessageSquare } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import InstructorForm from "./InstructorForm";

type GymWithUsers = Gym & {
  users: Pick<User, "id" | "firstName" | "lastName" | "email" | "image">[];
};

interface SettingsViewProps {
  gym: GymWithUsers;
  instructors: Instructor[];
  currentUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

type TabType = "general" | "branding" | "billing" | "users" | "instructors" | "notifications" | "integrations";

export default function SettingsView({ gym, instructors, currentUser }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const { theme, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    workspaceName: gym.name,
    timezone: "America/Los_Angeles",
    address: "123 Market St, San Francisco, CA",
    currency: "USD ($)",
    units: "Imperial (lb, mi)",
    weekStartsOn: "Monday",
    cancellationWindow: "12 hours before class",
    noShowFee: "$10.00",
    lateCancelFee: "$5.00",
    termsLink: "https://growsphere.app/terms",
    compactLayout: false,
    emailFromName: "GrowSphere Team",
  });

  const [userFilter, setUserFilter] = useState<"all" | "admins">("all");

  const tabs: { id: TabType; label: string }[] = [
    { id: "general", label: "General" },
    { id: "branding", label: "Branding" },
    { id: "billing", label: "Billing" },
    { id: "users", label: "Users & Roles" },
    { id: "instructors", label: "Instructors" },
    { id: "notifications", label: "Notifications" },
    { id: "integrations", label: "Integrations" },
  ];

  const integrations = [
    {
      name: "Email",
      provider: "SendGrid",
      icon: Mail,
      status: "connected",
    },
    {
      name: "Payments",
      provider: "Stripe",
      icon: CreditCard,
      status: "connected",
    },
    {
      name: "SMS",
      provider: "Twilio",
      icon: MessageSquare,
      status: "not_connected",
    },
  ];

  const userRoles = gym.users.map((user, index) => ({
    ...user,
    role: index === 0 ? "Owner" : index === 1 ? "Admin" : "Coach",
  }));

  const filteredUsers =
    userFilter === "all"
      ? userRoles
      : userRoles.filter((user) => user.role === "Owner" || user.role === "Admin");

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
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage workspace, billing, users, and preferences
          </p>
        </div>
        <button className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20">
          Save Changes
        </button>
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

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Workspace Settings */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label htmlFor="workspaceName" className="text-xs text-muted-foreground mb-1 block">
                  Workspace Name
                </label>
                <input
                  id="workspaceName"
                  type="text"
                  value={formData.workspaceName}
                  onChange={(e) =>
                    setFormData({ ...formData, workspaceName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="timezone" className="text-xs text-muted-foreground mb-1 block">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="America/Los_Angeles">America/Los_Angeles</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="weekStarts" className="text-xs text-muted-foreground mb-1 block">
                    Week Starts On
                  </label>
                  <select
                    id="weekStarts"
                    value={formData.weekStartsOn}
                    onChange={(e) =>
                      setFormData({ ...formData, weekStartsOn: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="address" className="text-xs text-muted-foreground mb-1 block">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currency" className="text-xs text-muted-foreground mb-1 block">
                    Default Currency
                  </label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="USD ($)">USD ($)</option>
                    <option value="EUR (€)">EUR (€)</option>
                    <option value="GBP (£)">GBP (£)</option>
                    <option value="INR (₹)">INR (₹)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="units" className="text-xs text-muted-foreground mb-1 block">
                    Units
                  </label>
                  <select
                    id="units"
                    value={formData.units}
                    onChange={(e) =>
                      setFormData({ ...formData, units: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Imperial (lb, mi)">Imperial (lb, mi)</option>
                    <option value="Metric (kg, km)">Metric (kg, km)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Policies</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="cancellationWindow" className="text-xs text-muted-foreground mb-1 block">
                  Cancellation Window
                </label>
                <input
                  id="cancellationWindow"
                  type="text"
                  value={formData.cancellationWindow}
                  onChange={(e) =>
                    setFormData({ ...formData, cancellationWindow: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="noShowFee" className="text-xs text-muted-foreground mb-1 block">
                    No-Show Fee
                  </label>
                  <input
                    id="noShowFee"
                    type="text"
                    value={formData.noShowFee}
                    onChange={(e) =>
                      setFormData({ ...formData, noShowFee: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label htmlFor="lateCancelFee" className="text-xs text-muted-foreground mb-1 block">
                    Late Cancel Fee
                  </label>
                  <input
                    id="lateCancelFee"
                    type="text"
                    value={formData.lateCancelFee}
                    onChange={(e) =>
                      setFormData({ ...formData, lateCancelFee: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="termsLink" className="text-xs text-muted-foreground mb-1 block">
                  Terms Link
                </label>
                <input
                  id="termsLink"
                  type="text"
                  value={formData.termsLink}
                  onChange={(e) =>
                    setFormData({ ...formData, termsLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Integrations</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium">
                  All
                </button>
                <button className="px-3 py-1 bg-secondary/50 text-muted-foreground rounded-lg text-xs font-medium">
                  Active
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">
                      Integration
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {integrations.map((integration, index) => {
                    const IconComponent = integration.icon;
                    return (
                    <tr key={index} className="border-b border-border last:border-0">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {integration.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ({integration.provider})
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            integration.status === "connected"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {integration.status === "connected"
                            ? "Connected"
                            : "Not Connected"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                          {integration.status === "connected" ? "Manage" : "Connect"}
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Theme & Preferences */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Theme & Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Dark Mode</span>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    theme === "dark" ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      theme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Compact Layout</span>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      compactLayout: !formData.compactLayout,
                    })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.compactLayout ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.compactLayout ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label htmlFor="emailFromName" className="text-xs text-muted-foreground mb-1 block">
                  Email From Name
                </label>
                <input
                  id="emailFromName"
                  type="text"
                  value={formData.emailFromName}
                  onChange={(e) =>
                    setFormData({ ...formData, emailFromName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Users & Roles */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Users & Roles</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setUserFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    userFilter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setUserFilter("admins")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    userFilter === "admins"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  Admins
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">
                      User
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">
                      Role
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-2">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => {
                    const initials = getInitials(user.firstName, user.lastName);
                    const avatarColor = getAvatarColor(user.firstName);

                    return (
                      <tr key={user.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-xs`}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm text-foreground">{user.role}</span>
                        </td>
                        <td className="py-3 px-2">
                          <button className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-card border border-red-500/50 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Danger Zone</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Export All Data</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A link will be emailed to the owner when ready.
                  </p>
                </div>
                <button className="px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors">
                  Start Export
                </button>
              </div>

              <button className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/50">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Instructors Tab */}
      {activeTab === "instructors" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Team Instructors
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Manage your gym instructors who can lead classes
                </p>

                {/* Instructor List */}
                <div className="space-y-3 mb-6">
                  {instructors.length > 0 ? (
                    instructors.map((instructor) => (
                      <div
                        key={instructor.id}
                        className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          {instructor.image ? (
                            <Image
                              src={instructor.image}
                              alt={`${instructor.firstName} ${instructor.lastName}`}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {instructor.firstName[0]}
                                {instructor.lastName[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {instructor.firstName} {instructor.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {instructor.email}
                            </p>
                          </div>
                        </div>
                        <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                          Edit
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-background rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        No instructors added yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Add Instructor Form */}
                <InstructorForm />
              </div>
            </div>
      )}

      {/* Placeholder tabs - Add content for other tabs */}
      {activeTab === "branding" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Branding Settings</h2>
          <p className="text-sm text-muted-foreground">Customize your gym's branding and appearance.</p>
        </div>
      )}

      {activeTab === "billing" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Billing Settings</h2>
          <p className="text-sm text-muted-foreground">Manage billing and subscription settings.</p>
        </div>
      )}

      {activeTab === "users" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Users & Roles</h2>
          <p className="text-sm text-muted-foreground">Manage user permissions and roles.</p>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Notification Settings</h2>
          <p className="text-sm text-muted-foreground">Configure email and push notification preferences.</p>
        </div>
      )}

      {activeTab === "integrations" && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">Integrations</h2>
          <p className="text-sm text-muted-foreground">Connect third-party services and apps.</p>
        </div>
      )}
    </div>
  );
}
