"use client";

import { useState } from "react";
import { Class, Instructor, Payment, MembershipPlan, Member } from "@prisma/client";
import {
  Users,
  DollarSign,
  TrendingDown,
  Search,
  FileDown,
  FileText,
  TrendingUp,
} from "lucide-react";

type ClassWithInstructor = Class & {
  instructor: Instructor;
};

type PlanWithMembers = MembershipPlan & {
  members: Member[];
};

interface AnalyticsViewProps {
  memberCount: number;
  totalMembers: number;
  classes: ClassWithInstructor[];
  payments: Payment[];
  plans: PlanWithMembers[];
  currentUser: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

type TimeFilter = "30days" | "quarter" | "year";
type MemberGrowthFilter = "monthly" | "weekly";
type AttendanceFilter = "category" | "coach";
type RevenueFilter = "plans" | "addons";
type RetentionFilter = "weekly" | "monthly";

export default function AnalyticsView({
  memberCount,
  totalMembers,
  classes,
  payments,
  plans,
  currentUser,
}: AnalyticsViewProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("30days");
  const [memberGrowthFilter, setMemberGrowthFilter] =
    useState<MemberGrowthFilter>("monthly");
  const [attendanceFilter, setAttendanceFilter] =
    useState<AttendanceFilter>("category");
  const [revenueFilter, setRevenueFilter] = useState<RevenueFilter>("plans");
  const [retentionFilter, setRetentionFilter] =
    useState<RetentionFilter>("weekly");

  // Calculate MRR from payments
  const calculateMRR = () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const monthlyRevenue = payments
      .filter((p) => new Date(p.createdAt) >= lastMonth)
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
    
    return monthlyRevenue;
  };

  // Calculate churn rate
  const calculateChurn = () => {
    const inactiveMembers = totalMembers - memberCount;
    if (totalMembers === 0) return 0;
    return ((inactiveMembers / totalMembers) * 100).toFixed(1);
  };

  const mrr = calculateMRR();
  const churnRate = calculateChurn();

  // Mock data for top performing classes
  const topClasses = [
    { name: "HIIT", fill: 92, avgCap: 24, sessions: 18, rating: 4.8 },
    { name: "Strength", fill: 88, avgCap: 20, sessions: 22, rating: 4.6 },
    { name: "Yoga", fill: 81, avgCap: 18, sessions: 16, rating: 4.7 },
  ];

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="md:ml-14 lg:ml-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Key metrics across members, classes, and revenue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search reports..."
              className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg text-sm font-medium transition-colors">
            <FileDown className="h-4 w-4" />
            Export CSV
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors">
            <FileText className="h-4 w-4" />
            Create Report
          </button>
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
            {getInitials(currentUser.firstName, currentUser.lastName)}
          </div>
        </div>
      </div>

      {/* Overview Section with Time Filters */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeFilter("30days")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === "30days"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => setTimeFilter("quarter")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === "quarter"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Quarter
            </button>
            <button
              onClick={() => setTimeFilter("year")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === "year"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-background rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Active Members
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {memberCount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-background rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">MRR</p>
                <p className="text-3xl font-bold text-foreground">
                  ${mrr.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-background rounded-lg p-6 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Churn</p>
                <p className="text-3xl font-bold text-foreground">
                  {churnRate}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Member Growth */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Member Growth
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setMemberGrowthFilter("monthly")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    memberGrowthFilter === "monthly"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setMemberGrowthFilter("weekly")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    memberGrowthFilter === "weekly"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-background rounded-lg border border-border">
              <p className="text-muted-foreground">Bar chart placeholder</p>
            </div>
          </div>

          {/* Class Attendance */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Class Attendance
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setAttendanceFilter("category")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    attendanceFilter === "category"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  By Category
                </button>
                <button
                  onClick={() => setAttendanceFilter("coach")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    attendanceFilter === "coach"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  By Coach
                </button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-background rounded-lg border border-border">
              <p className="text-muted-foreground">
                Stacked bars placeholder
              </p>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Revenue Breakdown
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setRevenueFilter("plans")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    revenueFilter === "plans"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Plans
                </button>
                <button
                  onClick={() => setRevenueFilter("addons")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    revenueFilter === "addons"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Add-ons
                </button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-background rounded-lg border border-border">
              <p className="text-muted-foreground">Donut chart placeholder</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Performing Classes */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Top Performing Classes
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg text-xs font-medium bg-primary text-primary-foreground">
                  Last 30d
                </button>
                <button className="px-3 py-1 rounded-lg text-xs font-medium bg-secondary/50 text-muted-foreground hover:bg-secondary">
                  90d
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">
                      Class
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">
                      Fill%
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">
                      Avg Cap
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">
                      Sessions
                    </th>
                    <th className="text-left text-xs font-medium text-muted-foreground py-2 px-2">
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topClasses.map((cls, index) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 px-2 text-sm font-medium text-foreground">
                        {cls.name}
                      </td>
                      <td className="py-3 px-2 text-sm text-foreground">
                        {cls.fill}%
                      </td>
                      <td className="py-3 px-2 text-sm text-foreground">
                        {cls.avgCap}
                      </td>
                      <td className="py-3 px-2 text-sm text-foreground">
                        {cls.sessions}
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white text-sm font-bold">
                          {cls.rating}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New vs Returning */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                New vs Returning
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setRetentionFilter("weekly")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    retentionFilter === "weekly"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setRetentionFilter("monthly")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium ${
                    retentionFilter === "monthly"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center bg-background rounded-lg border border-border">
              <p className="text-muted-foreground">Area chart placeholder</p>
            </div>
          </div>

          {/* Cohort Retention */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                Cohort Retention
              </h3>
              <button className="px-3 py-1 rounded-lg text-xs font-medium bg-primary text-primary-foreground">
                90 days
              </button>
            </div>
            <div className="h-64 flex items-center justify-center bg-background rounded-lg border border-border">
              <p className="text-muted-foreground">Heatmap placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
