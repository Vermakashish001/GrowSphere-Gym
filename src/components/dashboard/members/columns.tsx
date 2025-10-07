"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Member, MembershipPlan } from "@prisma/client";
import { MoreHorizontal } from "lucide-react";

// Combine Prisma types for easier use
export type MemberWithPlan = Member & {
  plan: MembershipPlan | null;
};

export const columns: ColumnDef<MemberWithPlan>[] = [
  {
    accessorKey: "firstName",
    header: "Name",
    cell: ({ row }) => {
      const name = `${row.original.firstName} ${row.original.lastName}`;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusClass =
        status === "active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground";
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: "plan.name",
    header: "Membership Plan",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <button className="p-1 hover:bg-secondary rounded-md">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      );
    },
  },
];