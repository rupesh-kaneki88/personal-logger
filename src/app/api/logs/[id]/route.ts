import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Log from "@/models/Log";
import dbConnect from "@/lib/dbConnect";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await dbConnect();

  try {
    const logId = id;
    const body = await req.json();
    const { title, content, category, duration, timestamp } = body;

    if (!title || !content) {
      return new NextResponse(JSON.stringify({ message: "Title and Content are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedLog = await Log.findOneAndUpdate(
      { _id: logId, userId: session.user.id },
      { title, content, category, duration, timestamp },
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

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await dbConnect();
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await Log.deleteOne({ _id: id, userId: session.user.id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Log not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Log deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting log:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
