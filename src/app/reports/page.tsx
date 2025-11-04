'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { gsap } from 'gsap';
import LoadingPage from '@/components/LoadingPage';
import GenerateReport from '@/components/GenerateReport';

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openReportId, setOpenReportId] = useState<string | null>(null);
  const [copiedReportId, setCopiedReportId] = useState<string | null>(null);
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
      setTimeout(() => {
        const element = reportRefs.current[reportId];
        element?.focus();
      }, 600); 
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

  if (status === 'loading' || loading) {
    return <LoadingPage />;
  }

  if (!session) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold">Please sign in to view your reports</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <GenerateReport />
      <h1 className="text-3xl font-bold mb-6">Report History</h1>
      {error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : reports.length === 0 ? (
        <p>No reports generated yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map((report) => (
            <div key={report._id} className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleReport(report._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleReport(report._id);
                  }
                }}
                aria-expanded={openReportId === report._id}
                aria-controls={`report-content-${report._id}`}
                aria-label={`Report from ${new Date(report.startDate).toLocaleDateString()} to ${new Date(report.endDate).toLocaleDateString()}, currently ${openReportId === report._id ? 'expanded' : 'collapsed'}`}
              >
                <h2 id={`report-title-${report._id}`} className="text-xl font-semibold mb-2">
                  {report.title}
                </h2>
                <p className="text-sm text-gray-400">
                  Report from {new Date(report.startDate).toLocaleDateString()} to {new Date(report.endDate).toLocaleDateString()}
                </p>
              </div>
              <div
                id={`report-content-${report._id}`}
                ref={(el) => { reportRefs.current[report._id] = el }}
                className="h-0 opacity-0 overflow-hidden"
                tabIndex={-1}
                role="region"
                aria-labelledby={`report-title-${report._id}`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-400">Generated on {new Date(report.generatedAt).toLocaleString()}</p>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(report.reportContent);
                          setCopiedReportId(report._id);

                          // reset after 2 seconds
                          setTimeout(() => setCopiedReportId(null), 6000);
                        } catch (err) {
                          console.error("Failed to copy:", err);
                        }
                      }}
                      className={`font-bold py-1 px-2 rounded text-sm text-white transition-colors duration-300 ${
                          copiedReportId === report._id
                            ? "bg-gray-500 hover:bg-gray-600"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      aria-label={
                        copiedReportId === report._id
                          ? `Copied report for ${report.title}`
                          : `Copy report for ${report.title}`
                      }
                    >
                      {copiedReportId === report._id ? "Copied!" : "Copy"}
                    </button>

                    <div className="sr-only" aria-live="polite">
                      {copiedReportId === report._id ? `Copied report for ${report.title}` : ""}
                    </div>


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