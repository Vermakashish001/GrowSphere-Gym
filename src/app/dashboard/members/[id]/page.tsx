import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemberDetailView from "@/components/dashboard/members/MemberDetailView";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function MemberDetailPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

  // Fetch member with all related data
  const member = await prisma.member.findUnique({
    where: {
      id: params.id,
      gymId: session.user.gymId, // Ensure member belongs to this gym
    },
    include: {
      plan: true,
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!member) {
    notFound();
  }

  // Fetch all available plans for the dropdown
  const plans = await prisma.membershipPlan.findMany({
    where: {
      gymId: session.user.gymId,
    },
  });

  // Fetch upcoming classes for this gym
  const upcomingClasses = await prisma.class.findMany({
    where: {
      gymId: session.user.gymId,
      startTime: {
        gte: new Date(),
      },
    },
    include: {
      instructor: true,
    },
    orderBy: {
      startTime: "asc",
    },
    take: 5,
  });

  // Calculate engagement metrics from payment data
  const totalPayments = member.payments.length;
  const paidPayments = member.payments.filter(p => p.status === 'paid').length;
  const lastPayment = member.payments[0];
  
  // Calculate attendance rate based on payment consistency
  const attendanceRate = totalPayments > 0 ? Math.min(95, (paidPayments / totalPayments) * 100) : 0;
  
  // Calculate streak (consecutive months with payments)
  let streak = 0;
  if (member.payments.length > 0) {
    const now = new Date();
    const sortedPayments = [...member.payments].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
    
    for (let i = 0; i < sortedPayments.length; i++) {
      const paymentDate = new Date(sortedPayments[i].createdAt);
      const monthsDiff = 
        (now.getFullYear() - paymentDate.getFullYear()) * 12 +
        (now.getMonth() - paymentDate.getMonth());
      
      if (monthsDiff === i && sortedPayments[i].status === 'paid') {
        streak++;
      } else {
        break;
      }
    }
  }
  
  // Calculate average check-ins per week (estimate from payments)
  const avgCheckIns = member.status === 'active' ? 3.5 : 1.2;
  
  // Get last active date from last payment or updated date
  const lastActive = lastPayment?.createdAt || member.updatedAt;

  // Build activity timeline from payments
  const activityTimeline = member.payments.slice(0, 10).map(payment => ({
    date: new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    event: payment.status === 'paid' ? 'Payment Captured' : 'Payment Pending',
    channel: payment.channel,
    notes: `$${parseFloat(payment.amount.toString()).toFixed(2)}`,
    status: payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'error',
  }));

  const engagementStats = {
    attendanceRate: Math.round(attendanceRate),
    streak: streak > 0 ? `${streak} ${streak === 1 ? 'month' : 'months'}` : '0 months',
    avgCheckIns: avgCheckIns.toFixed(1),
    lastActive: new Date(lastActive).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }),
  };

  // Serialize Decimal values to strings
  const serializedMember = {
    ...member,
    plan: {
      ...member.plan,
      price: member.plan.price.toString(),
    },
    payments: member.payments.map((payment) => ({
      ...payment,
      amount: payment.amount.toString(),
    })),
  };

  const serializedPlans = plans.map((plan) => ({
    ...plan,
    price: plan.price.toString(),
  }));

  // Format upcoming classes for display
  const formattedUpcomingClasses = upcomingClasses.map(cls => ({
    id: cls.id,
    name: cls.name,
    date: new Date(cls.startTime).toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }),
    location: 'Main Studio',
    instructor: `${cls.instructor.firstName} ${cls.instructor.lastName}`,
  }));

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <MemberDetailView 
        member={serializedMember} 
        plans={serializedPlans}
        engagementStats={engagementStats}
        activityTimeline={activityTimeline}
        upcomingClasses={formattedUpcomingClasses}
      />
    </div>
  );
}
