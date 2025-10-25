import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PUT update a membership plan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { gymId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name, price, duration, durationUnit, description } = await request.json();

    // Verify the plan belongs to the user's gym
    const existingPlan = await prisma.membershipPlan.findFirst({
      where: {
        id: params.id,
        gymId: user.gymId,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { error: "Membership plan not found" },
        { status: 404 }
      );
    }

    const updatedPlan = await prisma.membershipPlan.update({
      where: { id: params.id },
      data: {
        name,
        price,
        duration: duration || null,
        durationUnit: durationUnit || null,
        description: description || null,
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update membership plan" },
      { status: 500 }
    );
  }
}

// DELETE a membership plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { gymId: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if plan exists and belongs to user's gym
    const plan = await prisma.membershipPlan.findFirst({
      where: {
        id: params.id,
        gymId: user.gymId,
      },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Membership plan not found" },
        { status: 404 }
      );
    }

    // Check if plan has active members
    if (plan._count.members > 0) {
      return NextResponse.json(
        { error: `Cannot delete plan with ${plan._count.members} active member(s)` },
        { status: 400 }
      );
    }

    await prisma.membershipPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Plan deleted successfully" });
  } catch (error) {
    console.error("Error deleting plan:", error);
    return NextResponse.json(
      { error: "Failed to delete membership plan" },
      { status: 500 }
    );
  }
}
