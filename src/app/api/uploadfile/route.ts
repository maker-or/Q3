// app/api/upload/route.ts
import { db } from "~/server/db";
import { repo } from "~/server/db/schema";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import r2 from "~/app/lib/r2";

// Define the expected structure of the request body
interface UploadRequest {
  name: string;
  url: string;
  type: string;
  size: number;
  userId: object;
  year: string;
  branch: string;
  tags: string;
}

const fileUpload = async (file: File, name: string) => {
  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);
  const fileName = `${Date.now()}_${name}`;

  const CLOUDFLARE_R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  const DOMAIN = process.env.CLOUDFLARE_R2_SUBDOMAIN;

  if (!CLOUDFLARE_R2_BUCKET_NAME && !DOMAIN) {
    throw new Error(
      "CLOUDFLARE_R2_BUCKET_NAME or DOMAIN environment variable is not set.",
    );
  }
  const uploadParams = {
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME as string,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  };

  await r2.upload(uploadParams).promise();

  return `${DOMAIN}/sphere/${fileName}`;
};

export async function POST(req: Request) {
  try {
    // Safely parse the request body
    const { userId: authUserId } = (await auth()) as { userId: string | null };

    console.log("authUserId", authUserId);

    if (!authUserId) throw new Error("Unauthorized");
    // const body = await req.json() as UploadRequest;
    const reqData = await req.formData();
    let extractedData: any = {};
    for (const [key, value] of reqData.entries()) {
      extractedData[key] = value;
    }
    const { file, ...body } = extractedData;
    console.log(body, file);

    const fileUrl = await fileUpload(file, file?.name || "default_title");
    // Type guard function to validate the request body
    function isValidUploadRequest(data: unknown): data is UploadRequest {
      const upload = data as UploadRequest;
      return (
        typeof upload?.name === "string" &&
        typeof upload?.url === "string" &&
        typeof upload?.type === "string" &&
        typeof upload?.size === "number" &&
        typeof upload?.userId === "object" &&
        typeof upload?.year === "string" &&
        typeof upload?.branch === "string" &&
        typeof upload?.tags === "string"
      );
    }

    // Validate the request body

    // MRK BREAK -> U NEED TO VALIDATE HERE //
    // if (!isValidUploadRequest(body)) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: "Invalid request body format",
    //     },
    //     { status: 400 },
    //   );
    // }

    // Now TypeScript knows the body is properly typed
    // const { name, url, type, size, userId, folderId } = body;

    // MRK BREAK
    // const { userId, name, url, type, size } = body;
    //  const ud = JSON.stringify(userId);
    //  console.log("ud", ud);

    // console.log("type", type);
    // console.log("size", size);

    const newRepo = await db.insert(repo).values({
      filename: file.name,
      fileurl: fileUrl,
      userId: authUserId,
      tags: body.tags,
      year: body.year,
      branch: body.branch,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, repo: newRepo });
    // return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating database:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update database",
      },
      { status: 500 },
    );
  }
}
