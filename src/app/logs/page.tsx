"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import EditLogModal from "@/components/EditLogModal";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { toast } from "sonner";
import LoadingPage from "@/components/LoadingPage";
import LogItem from "@/components/LogItem";

export default function LogsPage() {
  const { data: session, status } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllLogs = useCallback(async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/logs?userId=${session.user.id}&all=true`);
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
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchAllLogs();
    } else if (status === "unauthenticated") {
      setLoading(false);
      setError("Please sign in to view your logs.");
    }
  }, [session, status, fetchAllLogs]);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleteTriggerElement, setDeleteTriggerElement] = useState<HTMLElement | null>(null);

  const handleDelete = useCallback((e: React.MouseEvent<HTMLButtonElement>, logId: string, logTitle: string) => {
    e.stopPropagation();
    setLogToDelete({ id: logId, title: logTitle });
    setDeleteTriggerElement(e.currentTarget);
    setIsDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
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
      fetchAllLogs();
      setIsDeleteModalOpen(false);
      setLogToDelete(null);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to delete log.", { id: loadingToast });
    }
  }, [logToDelete, fetchAllLogs]);

  const handleCancelDelete = useCallback(() => {
    setIsDeleteModalOpen(false);
    setLogToDelete(null);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<any | null>(null);
  const [editTriggerElement, setEditTriggerElement] = useState<HTMLElement | null>(null);

  const handleEdit = useCallback((e: React.MouseEvent<HTMLButtonElement>, log: any) => {
    e.stopPropagation();
    setCurrentLog(log);
    setEditTriggerElement(e.currentTarget);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentLog(null);
  }, []);

  const handleSaveEditedLog = useCallback(async (updatedLog: any) => {
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
      
      fetchAllLogs();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [fetchAllLogs]);

  if (status === "loading" || loading) {
    return <LoadingPage />;
  }

  if (error) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold text-red-500">{error}</h1>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center p-24 text-white">
        <h1 className="text-4xl font-bold">Please sign in to view your logs</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">All Your Logs</h1>

      {logs.length === 0 ? (
        <p>No logs yet. Start logging your work!</p>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <LogItem 
              key={log._id.toString()}
              log={log}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && currentLog && (
        <EditLogModal
          log={currentLog}
          onClose={handleCloseModal}
          onSave={handleSaveEditedLog}
          triggerElement={editTriggerElement}
        />
      )}

      {isDeleteModalOpen && logToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          message={`Are you sure you want to delete the log entry: "${logToDelete.title}"?`}
          triggerElement={deleteTriggerElement}
        />
      )}
    </div>
  );
}
