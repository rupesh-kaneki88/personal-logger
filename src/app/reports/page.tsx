'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { gsap } from 'gsap';

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const reportRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (session?.user?.id) {
      fetchReports();
    }
  }, [session]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/reports');
      if (!response.ok) {
        throw new Error('Failed to fetch reports.');
      }
      const data = await response.json();
      setReports(data.reports);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleReport = (reportId: string) => {
    if (openReportId === reportId) {
      setOpenReportId(null);
    } else {
      setOpenReportId(reportId);
    }
  };

  useEffect(() => {
    reports.forEach(report => {
      const reportElement = reportRefs.current[report._id];
      if (reportElement) {
        if (openReportId === report._id) {
          gsap.to(reportElement, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out' });
        } else {
          gsap.to(reportElement, { height: 0, opacity: 0, duration: 0.5, ease: 'power3.in' });
        }
      }
    });
  }, [openReportId, reports]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold">Please sign in to view your reports</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Generated Reports</h1>
      {loading ? (
        <p>Loading reports...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : reports.length === 0 ? (
        <p>No reports generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div key={report._id} className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div className="p-4 cursor-pointer" onClick={() => toggleReport(report._id)}>
                <h2 className="text-xl font-semibold mb-2">{report.title}</h2>
                <p className="text-sm text-gray-400">
                  Report from {new Date(report.startDate).toLocaleDateString()} to {new Date(report.endDate).toLocaleDateString()}
                </p>
              </div>
              <div
                ref={el => (reportRefs.current[report._id] = el)}
                className="h-0 opacity-0 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-400">Generated on {new Date(report.generatedAt).toLocaleString()}</p>
                    <button
                      onClick={() => navigator.clipboard.writeText(report.reportContent)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap">{report.reportContent}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}