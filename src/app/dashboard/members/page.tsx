import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
// Update the import path below if your db client is located elsewhere
import { prisma } from "@/lib/prisma";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { MembersTable } from "@/components/dashboard/members/MembersTable";
import { columns } from '@/components/dashboard/members/columns';

export default async function MembersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

//   Fetch all members for the current gym, including their membership plan
  const members = await prisma.member.findMany({
    where: {
      gymId: session.user.gymId,
    },
    include: {
      plan: true, // Include the related MembershipPlan data
    },
  });

  return (
    <div className="flex-1 p-8">
      <DashboardHeader session={session} />
      <div className="mt-8">
        <MembersTable columns={columns} data={members} />
      </div>
    </div>
  );
}