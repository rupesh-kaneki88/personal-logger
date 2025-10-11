"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react"; // Use useSession for client-side session
import { Session } from "next-auth"; // Import Session type
import Link from "next/link";
import DashboardCalendar from "@/components/DashboardCalendar";
import DashboardTaskList from "@/components/DashboardTaskList";
import { ITask } from "@/models/Task";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import LoadingPage from "@/components/LoadingPage";

// We will fetch logs and stats on the client side now,
// as this component is marked "use client".
// The initial getServerSession check is still valid for server-side rendering.

export default function DashboardPage() {
  const { data: session, status } = useSession(); // Client-side session

  const [logs, setLogs] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [technicalLogs, setTechnicalLogs] = useState(0);
  const [nonTechnicalLogs, setNonTechnicalLogs] = useState(0);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<ITask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState("");

  const dashboardRef = useRef(null);

  useGSAP(() => {
    gsap.from(dashboardRef.current, { opacity: 0, y: 50, duration: 0.8, ease: "power3.out" });
  }, { scope: dashboardRef });

  useEffect(() => {
    if (session?.user?.id) {
      fetchLogsAndStats();
      fetchTasks();
    }
  }, [session]);

  const fetchLogsAndStats = async () => {
    setLoadingLogs(true);
    setLogsError(null);
    try {
      const response = await fetch(`/api/logs?userId=${session?.user?.id}`); // Assuming a GET /api/logs endpoint
      if (!response.ok) {
        throw new Error("Failed to fetch logs.");
      }
      const data = await response.json();
      setLogs(data.logs);
      setTotalLogs(data.totalLogs);
      setTechnicalLogs(data.technicalLogs);
      setNonTechnicalLogs(data.nonTechnicalLogs);
    } catch (err: any) {
      setLogsError(err.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchTasks = async () => {
    if (!session?.user?.id) return;
    setLoadingTasks(true);
    setTasksError(null);
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data: ITask[] = await response.json();
      setTasks(data);
    } catch (err: any) {
      setTasksError(err.message);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportError(null);
    setReport(null);

    if (!startDate || !endDate) {
      setReportError("Please select both start and end dates.");
      setReportLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startDate, endDate, title: reportTitle }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate report.");
      }

      const data = await response.json();
      setReport(data.report);
    } catch (err: any) {
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  if (status === "loading" || loadingLogs || loadingTasks) {
    return <LoadingPage />;
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold">Please sign in to view your dashboard</h1>
      </div>
    );
  }

  return (
    <div ref={dashboardRef} className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard, {session.user?.name}!</h1>

      {logsError ? (
        <p className="text-red-500">Error: {logsError}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Total Logs</h2>
            <p className="text-3xl font-bold">{totalLogs}</p>
          </div>
          <div className="bg-gray-800 shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Technical Logs</h2>
            <p className="text-3xl font-bold">{technicalLogs}</p>
          </div>
          <div className="bg-gray-800 shadow-md rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Non-Technical Logs</h2>
            <p className="text-3xl font-bold">{nonTechnicalLogs}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <DashboardCalendar tasks={tasks} onDayClick={setSelectedDate} selectedDate={selectedDate} />
        </div>
        <div>
          <DashboardTaskList tasks={tasks} selectedDate={selectedDate} />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recent Logs</h2>
        <Link href="/logs" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          View All
        </Link>
      </div>
      {logs.length === 0 ? (
        <p>No logs yet. Start logging your work!</p>
      ) : (
        <div className="relative h-48 mb-8"> {/* Adjust height as needed */}
          {logs.slice(0, 3).map((log, index) => (
            <div
              key={log._id.toString()}
              className={`absolute w-full bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700 transition-all duration-300 ease-in-out`}
              style={{
                top: `${index * 20}px`, // Adjust stacking distance
                zIndex: 3 - index, // Ensure most recent is on top
                transform: `scale(${1 - index * 0.05})`, // Slight scale effect
                opacity: 1 - index * 0.2, // Slight opacity effect
              }}
            >
              <h3 className="text-lg font-semibold text-white">{log.title}</h3>
              <p className="text-gray-200 line-clamp-2">{log.content}</p>
              <p className="text-sm text-gray-400 mt-2">
                Category: {log.category || "N/A"} | Duration: {log.duration || "N/A"} mins |{" "}
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-2xl font-bold mb-4">Generate Report</h2>
      <div className="bg-gray-800 shadow-md rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className="block text-gray-300 text-sm font-bold mb-2">
              Start Date:
            </label>
            <input
              type="date"
              id="startDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-gray-300 text-sm font-bold mb-2">
              End Date:
            </label>
            <input
              type="date"
              id="endDate"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="reportTitle" className="block text-gray-300 text-sm font-bold mb-2">
              Report Title:
            </label>
            <input
              type="text"
              id="reportTitle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 text-white"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
            />
          </div>
          <button
            onClick={handleGenerateReport}
            className="md:self-end bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={reportLoading}
          >
            {reportLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>
        {reportError && <p className="text-red-500 mb-4">{reportError}</p>}
        {report && (
          <div className="mt-4 p-4 bg-gray-700 rounded-md whitespace-pre-wrap">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">Generated Report:</h3>
              <button
                onClick={() => navigator.clipboard.writeText(report)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
              >
                Copy
              </button>
            </div>
            <p>{report}</p>
          </div>
        )}
      </div>
    </div>
  );
}