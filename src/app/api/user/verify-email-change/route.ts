import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    // Find verification request
    const verification = await prisma.emailChangeVerification.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json(
        { error: "Invalid verification token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > verification.expires) {
      // Delete expired token
      await prisma.emailChangeVerification.delete({
        where: { id: verification.id },
      });

      return NextResponse.json(
        { error: "Verification token has expired" },
        { status: 400 }
      );
    }

    // Check if new email is still available
    const existingUser = await prisma.user.findUnique({
      where: { email: verification.newEmail },
    });

    if (existingUser && existingUser.id !== verification.userId) {
      return NextResponse.json(
        { error: "Email is no longer available" },
        { status: 400 }
      );
    }

    // Update user email
    await prisma.user.update({
      where: { id: verification.userId },
      data: { email: verification.newEmail },
    });

    // Delete verification request
    await prisma.emailChangeVerification.delete({
      where: { id: verification.id },
    });

    return NextResponse.json({
      message: "Email changed successfully",
      newEmail: verification.newEmail,
    });
  } catch (error) {
    console.error("Error verifying email change:", error);
    return NextResponse.json(
      { error: "Failed to verify email change" },
      { status: 500 }
    );
  }
}
