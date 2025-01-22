// app/api/upload/route.ts
import { db } from "~/server/db";
import { repo } from "~/server/db/schema";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

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


export async function POST(req: Request) {
  
  try {
    // Safely parse the request body
    const { userId:authUserId } = (await auth()) as { userId: string | null };



    console.log("authUserId", authUserId);

    if (!authUserId) throw new Error("Unauthorized");
    const body = await req.json() as UploadRequest;
    console.log("body", body);
    console.log("type", typeof body.userId);
    console.log("userId", body.userId);
    
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
    if (!isValidUploadRequest(body)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body format"
        },
        { status: 400 }
      );
    }

    // Now TypeScript knows the body is properly typed
    // const { name, url, type, size, userId, folderId } = body;
    const { userId, name, url, type, size } = body;
     const ud = JSON.stringify(userId);
     console.log("ud", ud);
    
     
    //  const io = ud.userId;
    //console.log("userId--++__", userId);
    console.log("type", type);
    console.log("size", size);

    const newRepo = await db.insert(repo).values({
      filename: name,
      fileurl: url,
      userId: authUserId,
      tags: body.tags,
      year: body.year,
      branch: body.branch,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    

    return NextResponse.json({ success: true, repo: newRepo });
  } catch (error) {
    console.error("Error updating database:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update database"
      },
      { status: 500 }
    );
  }
}