import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ClassForm from "@/components/dashboard/classes/ClassForm";
import Link from "next/link";
import { ArrowLeft, CalendarPlus } from "lucide-react";

export default async function NewClassPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.gymId) {
    redirect("/auth/signin");
  }

  // Fetch instructors for the dropdown
  const instructors = await prisma.instructor.findMany({
    where: {
      gymId: session.user.gymId,
    },
  });

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link
          href="/dashboard/classes"
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Classes
        </Link>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CalendarPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Add New Class</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Schedule a new class with instructor and timing details
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <ClassForm instructors={instructors} />
    </div>
  );
}
