"use client";

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { LogOut, User, Settings } from "lucide-react";

export default function UserProfile({ session }: { session: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Debug: Log session to check if image is present
  console.log("UserProfile session:", {
    hasImage: !!session?.user?.image,
    image: session?.user?.image,
    user: session?.user,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors overflow-hidden ring-2 ring-border"
      >
        {session?.user.image ? (
          <img
            src={session.user.image}
            alt={`${session.user.firstName} ${session.user.lastName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <>
            {session?.user.firstName?.[0]}
            {session?.user.lastName?.[0]}
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-56 bg-card border border-border rounded-lg shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User Info */}
          <div className="px-3 py-2 border-b border-border mb-2">
            <p className="text-sm font-semibold text-foreground">
              {session?.user.firstName} {session?.user.lastName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {session?.user.email}
            </p>
          </div>

          {/* Menu Items */}
          <button
            onClick={() => {
              setIsOpen(false);
              window.location.href = "/dashboard/profile";
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors text-foreground"
          >
            <User className="h-4 w-4" />
            Profile
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              // Navigate to settings if needed
              window.location.href = "/dashboard/settings";
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors text-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <div className="border-t border-border my-2" />

          {/* Logout Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-red-500/10 transition-colors text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}