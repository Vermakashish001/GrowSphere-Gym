import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BillingView from "@/components/dashboard/billing/BillingView";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

  // Fetch payments (invoices) for this gym
  const payments = await prisma.payment.findMany({
    where: {
      gymId: session.user.gymId,
    },
    include: {
      member: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
  });

  // Fetch gym details
  const gym = await prisma.gym.findUnique({
    where: {
      id: session.user.gymId,
    },
  });

  // Fetch member count
  const memberCount = await prisma.member.count({
    where: {
      gymId: session.user.gymId,
      status: "active",
    },
  });

  // Serialize Decimal values to strings
  const serializedPayments = payments.map((payment) => ({
    ...payment,
    amount: payment.amount.toString(),
  }));

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <BillingView
        payments={serializedPayments}
        gym={gym!}
        memberCount={memberCount}
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
