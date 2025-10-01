import { NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import Log from "@/models/Log";
import dbConnect from "@/lib/dbConnect";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await dbConnect();

  try {
    const logId = params.id;
    const body = await request.json();
    const { title, content, category, duration } = body;

    if (!title || !content) {
      return new NextResponse(JSON.stringify({ message: "Title and Content are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedLog = await Log.findOneAndUpdate(
      { _id: logId, userId: session.user.id },
      { title, content, category, duration },
      { new: true, runValidators: true }
    );

    if (!updatedLog) {
      return new NextResponse(JSON.stringify({ message: "Log not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(JSON.stringify(updatedLog), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error updating log:", error);
    return new NextResponse(JSON.stringify({ message: error.message || "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
