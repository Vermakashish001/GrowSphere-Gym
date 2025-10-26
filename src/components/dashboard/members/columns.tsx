"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Member, MembershipPlan } from "@prisma/client";
import Link from "next/link";

// Serialized version of MembershipPlan with Decimal as string
export type SerializedMembershipPlan = Omit<MembershipPlan, 'price'> & {
  price: string;
};

// Combine Prisma types for easier use
export type MemberWithPlan = Member & {
  plan: SerializedMembershipPlan | null;
};

// Helper function to generate avatar background colors
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

// Helper function to get initials
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Helper function to format date
const formatDate = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today • ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays === 1) {
    return `Yesterday • ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    return `${dayName} • ${date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }
};

export const columns: ColumnDef<MemberWithPlan>[] = [
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const firstName = row.original.firstName;
      const lastName = row.original.lastName;
      const name = `${firstName} ${lastName}`;
      const memberId = `#GS-${row.original.id.slice(0, 4).toUpperCase()}`;
      const initials = getInitials(firstName, lastName);
      const avatarColor = getAvatarColor(name);

      return (
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 min-w-10 rounded-full ${avatarColor} flex items-center justify-center shrink-0 text-white font-semibold text-sm`}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-foreground truncate">{name}</div>
            <div className="text-xs text-muted-foreground">{memberId}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-foreground">{row.original.email}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status.toLowerCase();
      
      const statusStyles: Record<string, string> = {
        active: "bg-green-500/20 text-green-500 border-green-500/30",
        paused: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        overdue: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
      };

      const statusClass = statusStyles[status] || statusStyles.active;

      return (
        <span
          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${statusClass}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Last Check-in",
    cell: ({ row }) => {
      const date = new Date(row.original.updatedAt);
      return (
        <div className="text-sm text-foreground">{formatDate(date)}</div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <Link
          href={`/dashboard/members/${row.original.id}`}
          className="px-4 py-1.5 text-sm font-medium text-foreground hover:bg-secondary/50 rounded-md transition-colors inline-block"
        >
          View
        </Link>
      );
    },
  },
];