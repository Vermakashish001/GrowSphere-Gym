"use client";

import Link from "next/link";
import UserProfile from './UserProfile';
import { LayoutDashboard } from "lucide-react";

interface DashboardHeaderProps {
  session: any; // Pass the whole session object for the profile
}

export default function DashboardHeader({ session }: DashboardHeaderProps) {
  // Debug: Check session data
  console.log("DashboardHeader session:", {
    hasUser: !!session?.user,
    hasImage: !!session?.user?.image,
    image: session?.user?.image,
    firstName: session?.user?.firstName,
    lastName: session?.user?.lastName,
  });

  return (
    <header className="flex items-center justify-between h-auto lg:h-[89px] py-4 lg:py-0">
      {/* Left Side: Icon + Title & Subtitle */}
      <div className="flex items-center gap-3 md:ml-16 lg:ml-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Overview of your gym performance and schedules
          </p>
        </div>
      </div>

      {/* Right Side: Search, Actions, and Profile */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Search Bar - Hidden on mobile */}
        <div className="relative hidden md:block">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search members, classes..."
            className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        {/* Action Buttons */}
        <Link
          href="/dashboard/classes/new"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-secondary/50 hover:bg-secondary rounded-lg font-medium transition-colors"
        >
          New Class
        </Link>

        <Link
          href="/dashboard/members/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
        >
          <span className="hidden sm:inline">Add Member</span>
          <span className="sm:hidden">+</span>
        </Link>
        
        <UserProfile session={session} />
      </div>
    </header>
  );
}