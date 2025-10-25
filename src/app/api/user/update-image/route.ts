import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { deleteImageKitFile } from "@/lib/imagekit";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrl, fileId } = await request.json();

    if (!imageUrl || !fileId) {
      return NextResponse.json(
        { error: "Image URL and file ID are required" },
        { status: 400 }
      );
    }

    // Get current user to check for existing image
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { imageFileId: true },
    });

    // Delete old image from ImageKit if it exists
    if (currentUser?.imageFileId) {
      await deleteImageKitFile(currentUser.imageFileId);
    }

    // Update user with new image
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        image: imageUrl,
        imageFileId: fileId,
      },
    });

    return NextResponse.json({
      message: "Profile image updated successfully",
      image: updatedUser.image,
    });
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}
