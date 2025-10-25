import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MembershipPlan } from "@prisma/client";
import MemberForm from "@/components/dashboard/members/MemberForm";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

export default async function NewMemberPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

  // Fetch membership plans
  const plansWithDecimal = await prisma.membershipPlan.findMany({
    where: { gymId: session.user.gymId },
  });

  // Convert Decimal to string
  const plans = plansWithDecimal.map((plan: MembershipPlan) => ({
    ...plan,
    price: plan.price.toString(),
  }));

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8  lg:ml-0">
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Members
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Add New Member</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Complete the form below to onboard a new gym member
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <MemberForm plans={plans} />
    </div>
  );
}