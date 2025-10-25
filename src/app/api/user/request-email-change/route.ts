import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmailChangeVerification } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { newEmail } = await request.json();

    // Validate input
    if (!newEmail) {
      return NextResponse.json(
        { error: "New email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email is the same as current
    if (newEmail === session.user.email) {
      return NextResponse.json(
        { error: "New email must be different from current email" },
        { status: 400 }
      );
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() +  60 * 60 * 1000); // 1 hour

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, firstName: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Store verification request in database
    await prisma.emailChangeVerification.create({
      data: {
        userId: user.id,
        newEmail,
        token,
        expires,
      },
    });

    // Send verification email to NEW email address
    console.log("Attempting to send verification email to:", newEmail);
    
    try {
      const emailSent = await sendEmailChangeVerification(
        newEmail,
        user.firstName,
        user.email,
        token
      );

      console.log("Email send result:", emailSent);

      if (!emailSent) {
        console.error("Email sending failed - returned false");
        return NextResponse.json(
          { error: "Failed to send verification email. Please check email configuration." },
          { status: 500 }
        );
      }

      console.log("Verification email sent successfully to:", newEmail);
      return NextResponse.json({
        message: "Verification email sent to new address",
        newEmail,
      });
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error requesting email change:", error);
    return NextResponse.json(
      { error: "Failed to request email change" },
      { status: 500 }
    );
  }
}
