"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logUrl from "@/assets/logo/logo.png"; // Make sure this path is correct
import { Session } from "next-auth";
import type { LucideIcon } from "lucide-react"; // Import the icon type

// 1. Import the icons you need
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  BarChart2,
  Settings,
  HelpCircle,
  X,
  UserCircle,
} from "lucide-react";

interface SidebarProps {
  session: Session | null;
  isMobileOpen?: boolean;
  onClose?: () => void;
}

// 3. Define the navigation array with the correct type
const navigation: { name: string; href: string; icon: LucideIcon; active: boolean }[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: false },
  { name: "Members", href: "/dashboard/members", icon: Users, active: false },
  { name: "Classes", href: "/dashboard/classes", icon: Calendar, active: false },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard, active: false },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2, active: false },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, active: false },
];

const Sidebar: React.FC<SidebarProps> = ({ session, isMobileOpen, onClose }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 flex-shrink-0 bg-sidebar border-r border-border 
        flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      {/* Top Section: Logo and Navigation */}
      <div>
        <div className="p-6 h-[89px] border-b border-border flex items-center justify-between">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-sidebar-primary/60 rounded-lg transition-colors"
          >
            <X size={20} className="text-sidebar-foreground" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src={logUrl}
              alt="Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <span className="text-xl font-bold text-foreground">GrowSphere</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.split('/')[2] === item.href.split('/')[2];

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-primary/60"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Plan and Support */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="px-3 py-1.5 rounded-md bg-sidebar-primary text-center">
          <p className="text-sm font-semibold text-sidebar-primary-foreground">
            Plan: Pro
          </p>
        </div>
        <Link
          href="/dashboard/profile"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all font-medium ${
            pathname === "/dashboard/profile"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-primary/60"
          }`}
        >
          <UserCircle size={20} />
          <span>Profile</span>
        </Link>
        <Link
          href="/support"
          className="flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sidebar-foreground hover:bg-sidebar-primary/60 font-medium"
        >
          <HelpCircle size={20} />
          <span>Support</span>
        </Link>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;