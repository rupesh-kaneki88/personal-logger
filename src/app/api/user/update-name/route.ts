import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { name } = await req.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json({ message: "Invalid name" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { name },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Name updated successfully", user });
  } catch (error) {
    console.error("Error updating name:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
