import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // Or your correct path
import MemberForm from "@/components/dashboard/members/MemberForm";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function NewMemberPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

  // 1. Fetch the raw data from the database
  const plansWithDecimal = await prisma.membershipPlan.findMany({
    where: { gymId: session.user.gymId },
  });

  // 2. Convert the Decimal to a string for each plan
  const plans = plansWithDecimal.map(plan => ({
    ...plan,
    price: plan.price.toString(), // Convert Decimal to string
  }));

  return (
    <div className="p-8">
      <DashboardHeader session={session} />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Add New Member</h1>
        <p className="text-muted-foreground mb-8">
          Fill out the form below to add a new member to your gym.
        </p>
        <MemberForm plans={plans} /> {/* Pass the original data */}
      </div>
    </div>
  );
}