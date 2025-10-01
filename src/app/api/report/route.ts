import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Report from "@/models/Report";
import Log from "@/models/Log";
import dbConnect from "@/lib/dbConnect";
import { Session } from "next-auth";

export async function POST(request: Request) {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await dbConnect();

  try {
    const body = await request.json();
    console.log("Request body:", body);
    const { startDate, endDate, title } = body; // Expecting date range and title for report

    const userId = session.user.id;

    // Fetch logs within the specified date range for the user
    const logs = await Log.find({
      userId,
      timestamp: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ timestamp: 1 });

    if (logs.length === 0) {
      return new NextResponse(JSON.stringify({ message: "No logs found for the specified period." }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Compile log data for LLM
    const compiledLogs = logs.map(log => ({
      timestamp: log.timestamp.toISOString(),
      content: log.content,
      category: log.category,
      duration: log.duration,
    }));

    // --- LLM API Call ---
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a helpful assistant that analyzes work logs and generates a report.
      The user has provided the following logs from ${startDate} to ${endDate}.
      Please analyze these logs and provide a report with the following sections:
      - Summary of work done
      - Key themes or projects
      - General tone/sentiment of the log entries
      - Suggestions for areas of focus for the next period

      Here are the logs:
      ${JSON.stringify(compiledLogs, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const llmGeneratedReport = response.text().replace(/[#*]/g, '');

    const newReport = new Report({
      userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reportContent: llmGeneratedReport,
      title,
    });

    await newReport.save();
    // --- End LLM API Call ---

    return new NextResponse(JSON.stringify({ report: llmGeneratedReport }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error generating report:", error);
    return new NextResponse(JSON.stringify({ message: error.message || "Something went wrong" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}