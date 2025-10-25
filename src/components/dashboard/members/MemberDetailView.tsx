"use client";

import { useState } from "react";
import { Member, MembershipPlan, Payment } from "@prisma/client";
import { 
  Search, 
  Calendar, 
  TrendingUp,
  Activity,
  Clock,
  Trash2,
  DollarSign,
  Plus
} from "lucide-react";
import Link from "next/link";
import { updateMember, deleteMember, addPayment } from "@/lib/actions";

// Serialized types with Decimal as string
type SerializedMembershipPlan = Omit<MembershipPlan, 'price'> & {
  price: string;
};

type SerializedPayment = Omit<Payment, 'amount'> & {
  amount: string;
};

type MemberWithPlan = Member & {
  plan: SerializedMembershipPlan;
  payments: SerializedPayment[];
};

interface ActivityTimelineItem {
  date: string;
  event: string;
  channel: string;
  notes: string;
  status: string;
}

interface UpcomingClass {
  id: string;
  name: string;
  date: string;
  location: string;
  instructor: string;
}

interface EngagementStats {
  attendanceRate: number;
  streak: string;
  avgCheckIns: string;
  lastActive: string;
}

interface MemberDetailViewProps {
  member: MemberWithPlan;
  plans: SerializedMembershipPlan[];
  engagementStats: EngagementStats;
  activityTimeline: ActivityTimelineItem[];
  upcomingClasses: UpcomingClass[];
}

// Helper functions
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

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function MemberDetailView({ 
  member, 
  plans, 
  engagementStats, 
  activityTimeline, 
  upcomingClasses 
}: MemberDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "engagement" | "billing">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone || "",
    status: member.status,
    planId: member.planId,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formDataObj = new FormData(formElement);
    
    try {
      await updateMember(member.id, formDataObj);
      setIsEditing(false);
      alert("Member updated successfully!");
    } catch (error) {
      alert("Failed to update member. Please try again.");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${member.firstName} ${member.lastName}? This action cannot be undone.`)) {
      try {
        await deleteMember(member.id);
      } catch (error) {
        alert("Failed to delete member. Please try again.");
        console.error(error);
      }
    }
  };

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formDataObj = new FormData(e.currentTarget);
    formDataObj.append("memberId", member.id);

    try {
      await addPayment(formDataObj);
      setIsPaymentModalOpen(false);
      alert("Payment recorded successfully!");
      window.location.reload(); // Refresh to show new payment
    } catch (error) {
      alert("Failed to record payment. Please try again.");
      console.error(error);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "engagement", label: "Engagement" },
    { id: "billing", label: "Billing" },
  ] as const;

  const memberId = `#GS-${member.id.slice(0, 4).toUpperCase()}`;
  const initials = getInitials(member.firstName, member.lastName);
  const avatarColor = getAvatarColor(member.firstName);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/members"
            className="text-sm text-primary hover:underline mb-2 inline-block"
          >
            ← Back to Members
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Member Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, edit, and analyze a member's profile and engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
              >
                Edit Member
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="member-edit-form"
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <Link
          href="/dashboard/members"
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Profile
        </Link>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Profile</h3>
            
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold text-xl`}
              >
                {initials}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {member.firstName} {member.lastName}
                </h2>
                <p className="text-sm text-muted-foreground">{memberId}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground capitalize">
                    {member.status}
                  </span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs font-semibold rounded-full">
                    Good Standing
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Plan</p>
                <p className="text-sm font-medium text-foreground">
                  {member.plan?.name || "No Plan"}
                </p>
                <p className="text-xs text-muted-foreground">Renews Oct 12</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Check-ins (30d)</p>
                <p className="text-2xl font-bold text-foreground">14</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Class</p>
                  <p className="text-sm font-medium text-foreground">HIIT • Mon 6:00 PM</p>
                </div>
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Activity Timeline</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Date</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Event</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Channel</th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-3 px-4">Amount/Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {activityTimeline.length > 0 ? (
                    activityTimeline.map((activity, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-sm text-foreground">{activity.date}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{activity.event}</td>
                        <td className="py-3 px-4 text-sm text-foreground">{activity.channel}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              activity.status === "success"
                                ? "bg-success/20 text-success"
                                : activity.status === "warning"
                                ? "bg-warning/20 text-warning"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {activity.notes}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        No activity yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Classes */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Upcoming Classes</h3>
            <div className="space-y-3">
              {upcomingClasses.length > 0 ? (
                upcomingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{cls.name}</p>
                        <p className="text-xs text-muted-foreground">{cls.date}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">{cls.instructor}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming classes scheduled
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form & Stats */}
        <div className="space-y-6">
          {/* Edit Member Form */}
          {isEditing && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Edit Member</h3>
            
            <form id="member-edit-form" className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="text-xs text-muted-foreground mb-1 block">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="text-xs text-muted-foreground mb-1 block">Last Name</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="email" className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-xs text-muted-foreground mb-1 block">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="planId" className="text-xs text-muted-foreground mb-1 block">Membership Plan</label>
                  <select
                    id="planId"
                    name="planId"
                    value={formData.planId}
                    onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="text-xs text-muted-foreground mb-1 block">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="text-xs text-muted-foreground mb-1 block">Notes</label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Prefers morning classes. Recovering from knee injury."
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  Update Member
                </button>
              </div>
            </form>
          </div>
          )}

          {/* Engagement Summary */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground mb-4">Engagement Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment Consistency</span>
                </div>
                <span className="text-lg font-bold text-foreground">{engagementStats.attendanceRate}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment Streak</span>
                </div>
                <span className="text-lg font-bold text-foreground">{engagementStats.streak}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Est. Check-ins/wk</span>
                </div>
                <span className="text-lg font-bold text-foreground">{engagementStats.avgCheckIns}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Last Activity</span>
                </div>
                <span className="text-sm font-medium text-foreground">{engagementStats.lastActive}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {activeTab === "billing" && (
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Payment History</h3>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Record Payment
                </button>
              </div>
              
              <div className="space-y-3">
                {member.payments.length > 0 ? (
                  member.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            ${parseFloat(payment.amount).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(payment.createdAt)} • {payment.channel}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.status === 'paid' 
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No payments recorded yet
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Record Payment</h2>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Status *
                </label>
                <select
                 aria-label="Payment Status"
                  name="status"
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Payment Channel */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Payment Channel *
                </label>
                <select
                  aria-label="Payment Channel"
                  name="channel"
                  required
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Optional notes about this payment..."
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
