"use client";

import Link from "next/link";
import UserProfile from './UserProfile';

interface DashboardHeaderProps {
  session: any; // Pass the whole session object for the profile
}

export default function DashboardHeader({ session }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between h-[89px]">
      {/* Left Side: Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your gym performance and schedules
        </p>
      </div>

      {/* Right Side: Search, Actions, and Profile */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative">
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
            className="w-64 rounded-lg bg-input pl-10 pr-4 py-2.5 text-sm"
          />
        </div>

        {/* Action Buttons */}
        <Link
          href="/dashboard/classes/new"
          className="px-4 py-2.5 rounded-lg font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          New Class
        </Link>

        <Link
          href="/dashboard/members/new"
          className="px-4 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Add Member
        </Link>
        
                <UserProfile session={session} />
      </div>
    </header>
  );
}