import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnalyticsView from "@/components/dashboard/analytics/AnalyticsView";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

  // Fetch member count
  const memberCount = await prisma.member.count({
    where: {
      gymId: session.user.gymId,
      status: "active",
    },
  });

  // Fetch total members (including inactive for churn calculation)
  const totalMembers = await prisma.member.count({
    where: {
      gymId: session.user.gymId,
    },
  });

  // Fetch classes
  const classes = await prisma.class.findMany({
    where: {
      gymId: session.user.gymId,
    },
    include: {
      instructor: true,
    },
    orderBy: {
      startTime: "desc",
    },
    take: 50,
  });

  // Fetch payments for revenue calculation
  const payments = await prisma.payment.findMany({
    where: {
      gymId: session.user.gymId,
      status: "paid",
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  // Fetch membership plans
  const plans = await prisma.membershipPlan.findMany({
    where: {
      gymId: session.user.gymId,
    },
    include: {
      members: true,
    },
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <AnalyticsView
        memberCount={memberCount}
        totalMembers={totalMembers}
        classes={classes}
        payments={payments}
        plans={plans}
        currentUser={{
          id: session.user.id,
          email: session.user.email || "",
          firstName: session.user.firstName,
          lastName: session.user.lastName,
        }}
      />
    </div>
  );
}
