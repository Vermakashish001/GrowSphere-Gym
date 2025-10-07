"use client";

import ThemeToggle from "../ThemeToggle";
import { signOut } from "next-auth/react";

export default function UserProfile({ session }: { session: any }) {
  // In a real app, you'd use state to manage the dropdown's visibility
  return (
    <div className="relative flex items-center gap-4">
      <ThemeToggle />
      <button className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold bg-primary text-primary-foreground">
        {session?.user.firstName?.[0]}
        {session?.user.lastName?.[0]}
      </button>

      {/* This is a simplified dropdown for demonstration */}
      <div className="absolute top-12 right-0 w-48 bg-card border border-border rounded-lg shadow-lg p-2 hidden">
        <button 
          onClick={() => signOut()}
          className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}