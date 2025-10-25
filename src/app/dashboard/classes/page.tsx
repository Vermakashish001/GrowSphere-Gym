import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClassesView from "@/components/dashboard/classes/ClassesView";

export default async function ClassesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

  // Fetch classes with instructor details
  const classes = await prisma.class.findMany({
    where: {
      gymId: session.user.gymId,
    },
    include: {
      instructor: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  // Fetch instructors for the dropdown
  const instructors = await prisma.instructor.findMany({
    where: {
      gymId: session.user.gymId,
    },
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <ClassesView classes={classes} instructors={instructors} />
    </div>
  );
}
