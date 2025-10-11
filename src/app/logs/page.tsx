"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import EditLogModal from "@/components/EditLogModal"; // Import the new modal component
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal"; // Import the new delete modal
import { toast } from "sonner";

export default function LogsPage() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllLogs();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to view your logs.");
    }
  }, [session, status]);

  const fetchAllLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/logs?userId=${session?.user?.id}&all=true`); // Assuming 'all=true' fetches all logs
      if (!response.ok) {
        throw new Error("Failed to fetch logs.");
      }
      const data = await response.json();
      setLogs(data.logs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<{ id: string; title: string } | null>(null);

  const handleDelete = (e: React.MouseEvent, logId: string, logTitle: string) => {
    e.stopPropagation();
    setLogToDelete({ id: logId, title: logTitle });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!logToDelete) return;

    const loadingToast = toast.loading("Deleting log...");
    try {
      const response = await fetch(`/api/logs?id=${logToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete log.");
      }

      toast.success("Log deleted successfully!", { id: loadingToast });
      fetchAllLogs(); // Refresh logs after successful deletion
      setIsDeleteModalOpen(false);
      setLogToDelete(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to delete log.", { id: loadingToast });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setLogToDelete(null);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<any | null>(null);

  const handleEdit = (e: React.MouseEvent, log: any) => {
    e.stopPropagation();
    setCurrentLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentLog(null);
  };

  const handleSaveEditedLog = async (updatedLog: any) => {
    try {
      const response = await fetch(`/api/logs/${updatedLog._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLog),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update log.");
      }

      // Update the logs in the local state
      setLogs(logs.map((log) => (log._id === updatedLog._id ? updatedLog : log)));
      fetchAllLogs(); // Refresh logs after successful update
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw to be caught by the modal's handleSubmit
    }
  };

  const logContentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleExpand = (logId: string) => {
    const isExpanding = expandedLogId !== logId;
    setExpandedLogId(isExpanding ? logId : null);

    const contentRef = logContentRefs.current[logId];
    if (contentRef) {
      if (isExpanding) {
        gsap.fromTo(
          contentRef,
          { height: 0, opacity: 0, overflow: "hidden" },
          { height: "auto", opacity: 1, duration: 0.7, ease: "elastic.out(1, 0.75)", overflow: "hidden" }
        );
      } else {
        gsap.to(contentRef, {
          height: 0,
          opacity: 0,
          duration: 0.7, // Increased duration for a more noticeable elastic effect
          ease: "elastic.out(1, 0.75)", // Changed to elastic.out for closing
          overflow: "hidden",
          onComplete: () => (contentRef.style.display = "none"), // Hide after collapse
        });
      }
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold text-red-500">{error}</h1>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold">Please sign in to view your logs</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">All Your Logs</h1>

      {loading ? (
        <p>Loading all logs...</p>
      ) : logs.length === 0 ? (
        <p>No logs yet. Start logging your work!</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log._id.toString()}
              className="bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700 cursor-pointer"
              onClick={() => toggleExpand(log._id.toString())}
              role="button"
              aria-expanded={expandedLogId === log._id.toString()}
              aria-controls={`log-content-${log._id.toString()}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  toggleExpand(log._id.toString());
                }
              }}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">{log.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => handleEdit(e, log)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, log._id.toString(), log.title)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {/* Always render the div, but control its visibility and height with GSAP */}
              <div
                id={`log-content-${log._id.toString()}`}
                ref={(el) => (logContentRefs.current[log._id.toString()] = el)}
                className="mt-4 border-t border-gray-700 pt-4"
                style={{ display: expandedLogId === log._id.toString() ? "block" : "none", height: expandedLogId === log._id.toString() ? "auto" : 0 }}
              >
                <p className="text-gray-200">{log.content}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Category: {log.category || "N/A"} | Duration: {log.duration || "N/A"} mins |{" "}
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && currentLog && (
        <EditLogModal log={currentLog} onClose={handleCloseModal} onSave={handleSaveEditedLog} />
      )}

      {isDeleteModalOpen && logToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          message={`Are you sure you want to delete the log entry: "${logToDelete.title}"?`}
        />
      )}
    </div>
  );
}
