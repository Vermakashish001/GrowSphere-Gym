"use client";

import { useState } from "react";
import { Session } from "next-auth";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import { Menu } from "lucide-react";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function DashboardLayoutClient({
  children,
  session,
}: DashboardLayoutClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button - Hidden on mobile, shown on tablet */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-30 hidden md:flex lg:hidden p-2 bg-card border border-border rounded-lg shadow-lg hover:bg-accent transition-colors"
      >
        <Menu size={24} className="text-foreground" />
      </button>

      {/* Sidebar */}
      <Sidebar
        session={session}
        isMobileOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav />
    </div>
  );
}
