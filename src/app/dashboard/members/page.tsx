import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MembersTable } from "@/components/dashboard/members/MembersTable";
import { columns } from '@/components/dashboard/members/columns';
import Link from "next/link";
import { Users, UserPlus } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";

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
      <PageHeader
        icon={Users}
        title="Members"
        description="Manage your community, view status and attendance"
        action={
          <Link
            href="/dashboard/members/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
          >
            <UserPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Member</span>
          </Link>
        }
      />

      {/* Members Table */}
      <MembersTable columns={columns} data={serializedMembers} />
    </div>
  );
}