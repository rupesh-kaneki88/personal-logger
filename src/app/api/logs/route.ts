import { NextResponse } from "next/server";
import { getServerSession, Session } from "next-auth"; // Import Session
import { authOptions } from "@/lib/auth";
import Log from "@/models/Log";
import dbConnect from "@/lib/dbConnect";

export async function GET(request: Request) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await dbConnect();

  try {
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const fetchAll = searchParams.get("all") === "true";

    let logs;
    if (fetchAll) {
      logs = await Log.find({ userId }).sort({ timestamp: -1 });
    } else {
      logs = await Log.find({ userId }).sort({ timestamp: -1 }).limit(10);
    }

    const totalLogs = await Log.countDocuments({ userId });
    const technicalLogs = await Log.countDocuments({ userId, category: "Technical" });
    const nonTechnicalLogs = await Log.countDocuments({ userId, category: "Non-Technical" });

    return new NextResponse(JSON.stringify({ logs, totalLogs, technicalLogs, nonTechnicalLogs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error fetching logs:", error);
    return new NextResponse(JSON.stringify({ message: error.message || "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request: Request) {
  const session: Session | null = await getServerSession(authOptions); // Explicitly type session

  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const { title, content, category, duration } = body;

    if (!title) {
      return new NextResponse(JSON.stringify({ message: "Title is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!content) {
      return new NextResponse(JSON.stringify({ message: "Content is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newLog = await Log.create({
      userId: session.user.id,
      title,
      content,
      category,
      duration,
      timestamp: new Date(),
    });

    return new NextResponse(JSON.stringify(newLog), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error saving log:", error);
    return new NextResponse(JSON.stringify({ message: error.message || "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request: Request) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("id");

    if (!logId) {
      return new NextResponse(JSON.stringify({ message: "Log ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const deletedLog = await Log.findOneAndDelete({ _id: logId, userId: session.user.id });

    if (!deletedLog) {
      return new NextResponse(JSON.stringify({ message: "Log not found or unauthorized" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new NextResponse(JSON.stringify({ message: "Log deleted successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error deleting log:", error);
    return new NextResponse(JSON.stringify({ message: error.message || "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

