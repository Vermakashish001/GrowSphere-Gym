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
} from "lucide-react";

interface SidebarProps {
  session: Session | null;
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

const Sidebar: React.FC<SidebarProps> = ({ session }) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-sidebar border-r border-border flex flex-col justify-between">
      {/* Top Section: Logo and Navigation */}
      <div>
        <div className="p-6 h-[89px] border-b border-border flex items-center">
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
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-medium ${
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
      <div className="p-4 border-t border-border space-y-2 text-center">
        <div className="px-3 py-1.5 rounded-md bg-sidebar-primary">
          <p className="text-sm font-semibold text-sidebar-primary-foreground">
            Plan: Pro
          </p>
        </div>
        <Link
          href="/support"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sidebar-foreground hover:bg-sidebar-primary/60 font-medium"
        >
          <HelpCircle size={20} />
          <span>Support</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;