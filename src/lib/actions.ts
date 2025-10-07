"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// This is the Server Action
export async function addMember(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    throw new Error("Not authorized");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const planId = formData.get("planId") as string;
  
  // Basic validation
  if (!firstName || !lastName || !email || !planId) {
    throw new Error("Missing required fields");
  }

  await prisma.member.create({
    data: {
      firstName,
      lastName,
      email,
      gymId: session.user.gymId,
      planId: planId,
    },
  });

  // Revalidate the members page to show the new member
  revalidatePath("/dashboard/members");
  // Redirect back to the members list
  redirect("/dashboard/members");
}