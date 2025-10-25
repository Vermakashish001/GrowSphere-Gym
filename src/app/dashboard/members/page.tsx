import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MembersTable } from "@/components/dashboard/members/MembersTable";
import { columns } from '@/components/dashboard/members/columns';
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default async function MembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

  // Fetch all members for the current gym, including their membership plan
  const members = await prisma.member.findMany({
    where: {
      gymId: session.user.gymId,
    },
    include: {
      plan: true,
    },
  });

  // Serialize Decimal values to strings for client components
  const serializedMembers = members.map((member) => ({
    ...member,
    plan: {
      ...member.plan,
      price: member.plan.price.toString(),
    },
  }));

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="md:ml-14 lg:ml-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Members</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Manage your community, view status and attendance
          </p>
        </div>
        <Link
          href="/dashboard/members/new"
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs sm:text-sm font-medium transition-colors shadow-lg shadow-primary/20"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Member</span>
        </Link>
      </div>

      {/* Members Table */}
      <MembersTable columns={columns} data={serializedMembers} />
    </div>
  );
}