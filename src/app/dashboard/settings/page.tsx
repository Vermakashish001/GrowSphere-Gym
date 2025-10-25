import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SettingsView from "@/components/dashboard/settings/SettingsView";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

  // Fetch gym details
  const gym = await prisma.gym.findUnique({
    where: {
      id: session.user.gymId,
    },
    include: {
      users: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
        },
      },
    },
  });

  // Fetch instructors
  const instructors = await prisma.instructor.findMany({
    where: {
      gymId: session.user.gymId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!gym) {
    redirect("/auth/signin");
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <SettingsView 
        gym={gym} 
        instructors={instructors}
        currentUser={{
          id: session.user.id,
          email: session.user.email || '',
          firstName: session.user.firstName,
          lastName: session.user.lastName,
        }} 
      />
    </div>
  );
}
