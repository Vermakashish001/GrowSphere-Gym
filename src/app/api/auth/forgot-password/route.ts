import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        message: "If an account exists with this email, you will receive password reset instructions.",
      });
    }

    // Check if user has a password (might be OAuth only)
    if (!user.password) {
      console.log(`Password reset requested for OAuth-only account: ${email}`);
      return NextResponse.json({
        message: "If an account exists with this email, you will receive password reset instructions.",
      });
    }

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Token expires in 1 hour
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    // Delete any existing reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: email,
      },
    });

    // Store the hashed token in the database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires,
      },
    });

    // Generate the reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetUrl);
    
    if (!emailSent) {
      console.error("Failed to send password reset email");
      // Still return success to prevent email enumeration
    } else {
      console.log(`Password reset email sent to: ${email}`);
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive password reset instructions.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
