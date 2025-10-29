"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import DashboardCalendar from "@/components/DashboardCalendar";
import DashboardTaskList, { UpcomingItem } from "@/components/DashboardTaskList";
import { ITask } from "@/models/Task";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import LoadingPage from "@/components/LoadingPage";

// Define the shape of Google Calendar events
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { dateTime?: string; date?: string };
  description?: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();

  const [logs, setLogs] = useState<any[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [technicalLogs, setTechnicalLogs] = useState(0);
  const [nonTechnicalLogs, setNonTechnicalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showGoogleEvents, setShowGoogleEvents] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState("");

  const lastReportDate = session?.user?.lastReportGeneratedAt;
  const daysSinceLastReport = lastReportDate ? (new Date().getTime() - new Date(lastReportDate).getTime()) / (1000 * 3600 * 24) : null;
  const daysLeft = daysSinceLastReport !== null ? 10 - daysSinceLastReport : 0;
  const canGenerateReport = daysLeft <= 0;

  const dashboardRef = useRef(null);

  useGSAP(() => {
    if (!loading) {
      gsap.from(dashboardRef.current, { opacity: 0, y: 50, duration: 0.8, ease: "power3.out" });
    }
  }, { dependencies: [loading], scope: dashboardRef });

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllData();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [logsRes, tasksRes, eventsRes] = await Promise.all([
        fetch(`/api/logs?userId=${session?.user?.id}`),
        fetch('/api/tasks'),
        fetch('/api/google-calendar/events').catch(() => null)
      ]);

      if (!logsRes.ok) throw new Error("Failed to fetch logs.");
      const logsData = await logsRes.json();
      setLogs(logsData.logs.slice(0, 3));
      setTotalLogs(logsData.totalLogs);
      setTechnicalLogs(logsData.technicalLogs);
      setNonTechnicalLogs(logsData.nonTechnicalLogs);

      let mappedTasks: UpcomingItem[] = [];
      if (tasksRes.ok) {
        const tasksData: ITask[] = await tasksRes.json();
        mappedTasks = tasksData
          .filter(task => task.dueDate)
          .map(task => ({
            id: task._id.toString(),
            title: task.title,
            date: new Date(task.dueDate!),
            description: task.description,
            priority: task.priority,
            isCompleted: task.isCompleted,
            source: 'internal',
          }));
      }

      let mappedEvents: UpcomingItem[] = [];
      if (eventsRes && eventsRes.ok) {
        const eventsData: GoogleCalendarEvent[] = await eventsRes.json();
        mappedEvents = eventsData
          .filter(event => event.start?.date || event.start?.dateTime)
          .map(event => ({
            id: event.id,
            title: event.summary,
            date: new Date(event.start.dateTime || event.start.date!),
            description: event.description,
            source: 'google',
          }));
      }

      const allItems = [...mappedTasks, ...mappedEvents];
      allItems.sort((a, b) => a.date.getTime() - b.date.getTime());
      setUpcomingItems(allItems);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  if (status === "loading" || loading) {
    return <LoadingPage />;
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold">Please sign in to view your dashboard</h1>
      </div>
    );
  }
  
  if (error) {
    return <div className="text-red-500 text-center p-8">Error loading dashboard: {error}</div>;
  }

  return (
    <div ref={dashboardRef} className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard, {session.user?.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800 shadow-md rounded-lg p-4" role="region" aria-labelledby="total-logs-heading">
          <h2 id="total-logs-heading" className="text-xl font-semibold mb-2">Total Logs</h2>
          <p className="text-3xl font-bold">{totalLogs}</p>
        </div>
        <div className="bg-gray-800 shadow-md rounded-lg p-4" role="region" aria-labelledby="technical-logs-heading">
          <h2 id="technical-logs-heading" className="text-xl font-semibold mb-2">Technical Logs</h2>
          <p className="text-3xl font-bold">{technicalLogs}</p>
        </div>
        <div className="bg-gray-800 shadow-md rounded-lg p-4" role="region" aria-labelledby="non-technical-logs-heading">
          <h2 id="non-technical-logs-heading" className="text-xl font-semibold mb-2">Non-Technical Logs</h2>
          <p className="text-3xl font-bold">{nonTechnicalLogs}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div>
          <DashboardCalendar
            tasks={upcomingItems}
            onDayClick={setSelectedDate}
            selectedDate={selectedDate}
            showGoogleEvents={showGoogleEvents}
            setShowGoogleEvents={setShowGoogleEvents}
          />
        </div>
        <div>
          <DashboardTaskList items={upcomingItems} selectedDate={selectedDate} showGoogleEvents={showGoogleEvents} />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 id="recent-logs-heading" className="text-2xl font-bold">Recent Logs</h2>
        <Link href="/logs" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          View All
        </Link>
      </div>
      {logs.length === 0 ? (
        <p>No logs yet. Start logging your work!</p>
      ) : (
        <div className="relative h-48 mb-8" role="region" aria-labelledby="recent-logs-heading">
          {logs.map((log, index) => (
            <div
              key={log._id.toString()}
              className="absolute w-full bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700 transition-all duration-300 ease-in-out"
              style={{
                top: `${index * 20}px`,
                zIndex: 3 - index,
                transform: `scale(${1 - index * 0.05})`,
                opacity: 1 - index * 0.2,
              }}
              tabIndex={0}
              aria-label={`Log: ${log.title}, Category: ${log.category || "N/A"}, Logged on: ${new Date(log.timestamp).toLocaleDateString()}`}
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
      <p className="text-sm text-gray-400 mb-4">Note: You can generate a new report once every 10 days to conserve API resources.</p>
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
            className="md:self-end bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={!canGenerateReport || reportLoading}
          >
            {reportLoading ? "Generating..." : "Generate Report"}
          </button>
        </div>
        {!canGenerateReport && (
          <p className="text-yellow-500 mb-4">
            You can generate a new report in {Math.ceil(daysLeft)} days.
          </p>
        )}
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
