import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Report from "@/models/Report";;
import dbConnect from "@/lib/dbConnect";
import { Session } from "next-auth";

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

    const reports = await Report.find({ userId }).sort({ generatedAt: -1 });

    return new NextResponse(JSON.stringify({ reports }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return new NextResponse(JSON.stringify({ message: error.message || "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
