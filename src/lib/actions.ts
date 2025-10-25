"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Add Member
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

// Update Member
export async function updateMember(memberId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    throw new Error("Not authorized");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const status = formData.get("status") as string;
  const planId = formData.get("planId") as string;
  
  // Basic validation
  if (!firstName || !lastName || !email || !planId || !status) {
    throw new Error("Missing required fields");
  }

  // Update the member
  await prisma.member.update({
    where: {
      id: memberId,
      gymId: session.user.gymId, // Ensure member belongs to this gym
    },
    data: {
      firstName,
      lastName,
      email,
      phone: phone || null,
      status,
      planId,
    },
  });

  // Revalidate the page
  revalidatePath(`/dashboard/members/${memberId}`);
  revalidatePath("/dashboard/members");
}

// Helper function to generate recurring class instances
async function generateRecurringClasses(
  classData: {
    name: string;
    description: string | null;
    startTime: Date;
    endTime: Date;
    capacity: number;
    gymId: string;
    instructorId: string;
  },
  recurrencePattern: string,
  recurrenceDays: string[],
  recurrenceEndDate: Date,
  parentClassId: string
) {
  const instances = [];
  const dayMap: { [key: string]: number } = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  let currentDate = new Date(classData.startTime);
  const endDate = new Date(recurrenceEndDate);
  
  // Get the duration of the class in milliseconds
  const duration = classData.endTime.getTime() - classData.startTime.getTime();

  while (currentDate <= endDate) {
    const dayOfWeek = Object.keys(dayMap).find(
      (key) => dayMap[key] === currentDate.getDay()
    );

    if (dayOfWeek && recurrenceDays.includes(dayOfWeek)) {
      instances.push({
        name: classData.name,
        description: classData.description,
        startTime: new Date(currentDate),
        endTime: new Date(currentDate.getTime() + duration),
        capacity: classData.capacity,
        gymId: classData.gymId,
        instructorId: classData.instructorId,
        isRecurring: false,
        parentClassId: parentClassId,
      });
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Create all instances in batch
  if (instances.length > 0) {
    await prisma.class.createMany({
      data: instances,
    });
  }

  return instances.length;
}

// Add Class
export async function addClass(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    throw new Error("Not authorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const capacity = formData.get("capacity") as string;
  const instructorId = formData.get("instructorId") as string;
  
  // Recurrence fields
  const isRecurring = formData.get("isRecurring") === "true";
  const recurrencePattern = formData.get("recurrencePattern") as string;
  const recurrenceDaysStr = formData.get("recurrenceDays") as string;
  const recurrenceEndDate = formData.get("recurrenceEndDate") as string;
  
  // Basic validation
  if (!name || !startTime || !endTime || !instructorId) {
    throw new Error("Missing required fields");
  }

  const classData = {
    name,
    description: description || null,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    capacity: parseInt(capacity) || 20,
    gymId: session.user.gymId,
    instructorId,
  };

  if (isRecurring && recurrencePattern && recurrenceDaysStr && recurrenceEndDate) {
    // Create parent recurring class
    const parentClass = await prisma.class.create({
      data: {
        ...classData,
        isRecurring: true,
        recurrencePattern,
        recurrenceDays: recurrenceDaysStr,
        recurrenceEndDate: new Date(recurrenceEndDate),
      },
    });

    // Generate recurring instances
    const recurrenceDays = JSON.parse(recurrenceDaysStr);
    await generateRecurringClasses(
      classData,
      recurrencePattern,
      recurrenceDays,
      new Date(recurrenceEndDate),
      parentClass.id
    );
  } else {
    // Create single class
    await prisma.class.create({
      data: classData,
    });
  }

  // Revalidate the classes page to show the new class
  revalidatePath("/dashboard/classes");
  // Redirect back to the classes list
  redirect("/dashboard/classes");
}

// Add Instructor
export async function addInstructor(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    throw new Error("Not authorized");
  }

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const image = formData.get("image") as string;
  
  // Basic validation
  if (!firstName || !lastName || !email) {
    throw new Error("Missing required fields");
  }

  await prisma.instructor.create({
    data: {
      firstName,
      lastName,
      email,
      image: image || null,
      gymId: session.user.gymId,
    },
  });

  // Revalidate the settings page to show the new instructor
  revalidatePath("/dashboard/settings");
  // Return success (can be used in the form)
  return { success: true };
}

// Delete Member
export async function deleteMember(memberId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    throw new Error("Not authorized");
  }

  // Delete the member (cascade will handle related data)
  await prisma.member.delete({
    where: {
      id: memberId,
      gymId: session.user.gymId, // Ensure member belongs to this gym
    },
  });

  // Revalidate the members page
  revalidatePath("/dashboard/members");
  redirect("/dashboard/members");
}

// Update Class
export async function updateClass(classId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    throw new Error("Not authorized");
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const capacity = formData.get("capacity") as string;
  const instructorId = formData.get("instructorId") as string;
  
  // Basic validation
  if (!name || !startTime || !endTime || !instructorId) {
    throw new Error("Missing required fields");
  }

  await prisma.class.update({
    where: {
      id: classId,
      gymId: session.user.gymId,
    },
    data: {
      name,
      description: description || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity: parseInt(capacity) || 20,
      instructorId,
    },
  });

  // Revalidate the classes page
  revalidatePath("/dashboard/classes");
  revalidatePath(`/dashboard/classes/${classId}`);
}

// Delete Class
export async function deleteClass(classId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    throw new Error("Not authorized");
  }

  try {
    await prisma.class.delete({
      where: {
        id: classId,
        gymId: session.user.gymId,
      },
    });

    // Revalidate the classes page
    revalidatePath("/dashboard/classes");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting class:", error);
    throw new Error("Failed to delete class");
  }
}

// Add Payment
export async function addPayment(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.gymId) {
    throw new Error("Not authorized");
  }

  const memberId = formData.get("memberId") as string;
  const amount = formData.get("amount") as string;
  const status = formData.get("status") as string;
  const channel = formData.get("channel") as string;
  const notes = formData.get("notes") as string;
  
  // Basic validation
  if (!memberId || !amount || !status || !channel) {
    throw new Error("Missing required fields");
  }

  await prisma.payment.create({
    data: {
      memberId,
      amount: parseFloat(amount),
      status,
      channel,
      notes: notes || null,
      gymId: session.user.gymId,
    },
  });

  // Revalidate the member detail page
  revalidatePath(`/dashboard/members/${memberId}`);
  revalidatePath("/dashboard/billing");
  return { success: true };
}