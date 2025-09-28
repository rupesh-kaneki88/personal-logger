"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function LogEntryForm() {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Technical");
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formRef = useRef(null);

  useGSAP(() => {
    // GSAP animations can be defined here
  }, { scope: formRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!session?.user?.id) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: session.user.id,
          content,
          category,
          duration,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save log.");
      }

      setSuccess("Log saved successfully!");
      setContent("");
      setCategory("Technical");
      setDuration(undefined);

      // Animate the form on success
      gsap.to(formRef.current, {
        scale: 1.02,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: "power1.inOut",
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-white">
    <div ref={formRef} className="w-full max-w-4xl p-8 space-y-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700 sm:w-full md:w-5/6 lg:w-3/4 xl:w-5/6">
    <h1 className="text-3xl font-bold text-center text-white">New Log Entry</h1>
      {error && <p className="text-red-400 text-center">{error}</p>}
      {success && <p className="text-green-400 text-center">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label htmlFor="content" className="sr-only">
          Work Description:
        </label>
        <textarea
          id="content"
          className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700"
          rows={5}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          placeholder="Enter your work description here..."
        ></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="category" className="sr-only">
          Category:
        </label>
        <select
          id="category"
          className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Technical">Technical</option>
          <option value="Non-Technical">Non-Technical</option>
          <option value="None">None</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="duration" className="sr-only">
          Duration (minutes, optional):
        </label>
        <input
          type="number"
          id="duration"
          className="appearance-none relative block w-full px-3 py-2 border border-gray-600 placeholder-gray-400 text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-700"
          value={duration || ""}
          onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
          min="0"
          placeholder="Enter duration in minutes"
        />
      </div>

      <button
        type="submit"
        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Log"}
      </button>
      </form>
      </div>
    </div>
  );
}
