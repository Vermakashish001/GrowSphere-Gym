import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// Component Imports
import StatCard from "@/components/dashboard/StatCard";
import MemberGrowthChart from "@/components/dashboard/MemberGrowthChart";
import WeeklyOverview from "@/components/dashboard/WeeklyOverview";
import UpcomingClasses from "@/components/dashboard/UpcomingClasses";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

// 1. Import the necessary icons from lucide-react
import { Users, Wallet, Calendar, Zap, Dumbbell, HeartPulse } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }


  // 1. Get gymId from session
  const gymId = session.user.gymId;

  // 2. Fetch dashboard stats concurrently
  const [activeMembers, monthlyRevenue, upcomingClassesCount] = await Promise.all([
    prisma.member.count({
      where: {
        gymId,
        status: "active",
      },
    }),
    prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        member: {
          gymId,
        },
        // Only payments for the current month
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        },
      },
    }),
    prisma.class.count({
      where: {
        gymId,
      },
    }),
  ]);

  // 3. Prepare data for StatCards
  const stats = {
    activeMembers: {
      count: activeMembers,
      // TODO: Calculate change and isPositive if needed
      change: undefined,
      isPositive: undefined,
    },
    monthlyRevenue: {
      amount: monthlyRevenue._sum.amount || 0,
      // TODO: Calculate change and isPositive if needed
      change: undefined,
      isPositive: undefined,
    },
    upcomingClasses: {
      count: upcomingClassesCount,
      // TODO: Add nextClass info if needed
      nextClass: undefined,
    },
  };

  // TODO: Fetch and prepare real data for memberGrowthData, weeklySchedule, and upcomingClasses
  const memberGrowthData: Array<{ month: string; count: number }> = [];
  const weeklySchedule: Array<{ name: string; day: string; time: string; icon: string }> = [];
  const upcomingClasses: Array<{
    name: string;
    instructor: string;
    day: string;
    time: string;
    avatar: string;
  }> = [];

  const currentWeek = {
    startDate: "Oct 6",
    endDate: "Oct 12",
    currentDay: 8, // Tuesday
  };

  return (
    <div className="flex-1 p-8">
      {/* Header */}
      <DashboardHeader session={session} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Left Column (takes 2/3 of the space) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 3. Pass the icon components as props */}
            <StatCard
              title="Active Members"
              value={stats.activeMembers.count.toLocaleString()}
              change={stats.activeMembers.change}
              isPositive={stats.activeMembers.isPositive}
              Icon={Users}
            />
            <StatCard
              title="Monthly Revenue"
              value={`₹${stats.monthlyRevenue.amount.toLocaleString()}`}
              change={stats.monthlyRevenue.change}
              isPositive={stats.monthlyRevenue.isPositive}
              Icon={Wallet}
            />
            <StatCard
              title="Upcoming Classes"
              value={stats.upcomingClasses.count.toString()}
              nextClass={stats.upcomingClasses.nextClass}
              Icon={Calendar}
            />
          </div>

          {/* Member Growth Chart */}
          <MemberGrowthChart data={memberGrowthData} />
        </div>

        {/* Right Column (takes 1/3 of the space) */}
        <div className="space-y-6">
          <WeeklyOverview
            calendar={currentWeek}
            classes={weeklySchedule}
          />
          <UpcomingClasses classes={upcomingClasses} />
        </div>
      </div>
    </div>
  );
}