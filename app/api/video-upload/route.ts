export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  public_id: string;
  bytes: number;
  duration?: number;
  [key: string]: any;
}

export async function POST(request: NextRequest) {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();

    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const originalSize = formData.get("originalSize") as string;

    if (!file || !title || !description || !originalSize) {
      return NextResponse.json(
        { error: "Missing required form data" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "video-uploads",
          transformation: [
            { quality: "auto", fetch_format: "mp4" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
      uploadStream.end(buffer);
    });

    const savedVideo = await prisma.video.create({
      data: {
        title,
        description,
        publicId: uploadResult.public_id,
        originalSize,
        compressedSize: String(uploadResult.bytes),
        duration: uploadResult.duration || 0,
        // authorId: userId,
      },
    });

    return NextResponse.json(savedVideo);
  } catch (error) {
    console.error("Video upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
