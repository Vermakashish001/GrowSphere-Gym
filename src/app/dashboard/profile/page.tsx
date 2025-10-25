import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileView from "@/components/dashboard/profile/ProfileView";

export const metadata = {
  title: "Profile | GrowSphere",
  description: "Manage your profile settings",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      gym: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // @ts-ignore - Prisma types may not be updated yet
  return <ProfileView user={user} />;
}
