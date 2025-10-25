import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const testEmail = request.nextUrl.searchParams.get("email");
    
    if (!testEmail) {
      return NextResponse.json(
        { error: "Please provide email parameter: /api/test-email?email=your@email.com" },
        { status: 400 }
      );
    }

    console.log("Testing email send to:", testEmail);

    const result = await sendEmail({
      to: testEmail,
      subject: "Test Email from GrowSphere",
      text: "This is a test email. If you receive this, your email configuration is working!",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Email Test Successful!</h2>
          <p>This is a test email from GrowSphere.</p>
          <p>If you're seeing this, your email configuration is working correctly.</p>
        </div>
      `,
    });

    console.log("Email test result:", result);

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${testEmail}`,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email. Check server logs for details." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email test error:", error);
    return NextResponse.json(
      { error: "Email test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
