import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * ImageKit Authentication Endpoint
 * This endpoint provides authentication parameters for client-side uploads
 */
export async function GET(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
      console.error("ImageKit credentials not configured");
      return NextResponse.json(
        { error: "ImageKit is not configured" },
        { status: 500 }
      );
    }

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    
    // Generate token and expire timestamp
    const token = crypto.randomBytes(16).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    // Generate signature
    const signature = crypto
      .createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    const authenticationParameters = {
      token,
      expire,
      signature,
    };

    console.log("ImageKit auth params generated:", { token, expire, signatureLength: signature.length });

    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Failed to generate authentication parameters" },
      { status: 500 }
    );
  }
}
