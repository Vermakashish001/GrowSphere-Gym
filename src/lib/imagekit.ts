import ImageKit from "imagekit";

/**
 * Server-side ImageKit instance
 * Used for backend operations like deleting files
 */
export function getImageKitInstance() {
  if (!process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("ImageKit credentials not configured");
  }

  return new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
  });
}

/**
 * Delete a file from ImageKit
 * @param fileId ImageKit file ID
 * @returns Promise<boolean>
 */
export async function deleteImageKitFile(fileId: string): Promise<boolean> {
  try {
    const imagekit = getImageKitInstance();
    await imagekit.deleteFile(fileId);
    console.log(`Successfully deleted file: ${fileId}`);
    return true;
  } catch (error) {
    console.error("Error deleting ImageKit file:", error);
    return false;
  }
}

/**
 * Get file details from ImageKit
 * @param fileId ImageKit file ID
 * @returns Promise with file details
 */
export async function getImageKitFileDetails(fileId: string) {
  try {
    const imagekit = getImageKitInstance();
    const fileDetails = await imagekit.getFileDetails(fileId);
    return fileDetails;
  } catch (error) {
    console.error("Error getting ImageKit file details:", error);
    return null;
  }
}

/**
 * Generate optimized image URL
 * @param path Image path in ImageKit
 * @param transformations Transformation options
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  path: string,
  transformations?: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "jpg" | "png";
  }
): string {
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "";
  
  if (!transformations) {
    return `${urlEndpoint}${path}`;
  }

  const params: string[] = [];
  
  if (transformations.width) params.push(`w-${transformations.width}`);
  if (transformations.height) params.push(`h-${transformations.height}`);
  if (transformations.quality) params.push(`q-${transformations.quality}`);
  if (transformations.format) params.push(`f-${transformations.format}`);

  const transformString = params.length > 0 ? `tr:${params.join(",")}` : "";
  
  return `${urlEndpoint}/${transformString}${path}`;
}

/**
 * Upload file to ImageKit from server
 * @param file File buffer or base64
 * @param fileName File name
 * @param folder Folder path in ImageKit
 * @returns Upload response
 */
export async function uploadToImageKit(
  file: Buffer | string,
  fileName: string,
  folder: string = "/"
) {
  try {
    const imagekit = getImageKitInstance();
    
    const uploadResponse = await imagekit.upload({
      file: file,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
    });

    return {
      success: true,
      data: uploadResponse,
    };
  } catch (error) {
    console.error("Error uploading to ImageKit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * ImageKit configuration for client-side
 */
export const imagekitConfig = {
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
  authenticationEndpoint: "/api/imagekit/auth",
};
