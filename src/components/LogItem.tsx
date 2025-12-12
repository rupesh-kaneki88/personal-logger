"use client";

import React, { useState, useRef } from 'react';
import { gsap } from "gsap";

const LogItem = ({ log, onEdit, onDelete }: { log: any, onEdit: (e: React.MouseEvent<HTMLButtonElement>, log: any) => void, onDelete: (e: React.MouseEvent<HTMLButtonElement>, logId: string, logTitle: string) => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    const newIsExpanded = !isExpanded;
    setIsExpanded(newIsExpanded);
    if (contentRef.current) {
      if (newIsExpanded) {
        contentRef.current.style.display = 'block';
        gsap.fromTo(
          contentRef.current,
          { height: 0, opacity: 0, overflow: "hidden" },
          { height: "auto", opacity: 1, duration: 0.7, ease: "elastic.out(1, 0.75)", overflow: "hidden" }
        );
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          overflow: "hidden",
          onComplete: () => {
            if (contentRef.current) {
              contentRef.current.style.display = 'none';
            }
          }
        });
      }
    }
  };

  return (
    <div
      className="bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700 cursor-pointer"
      onClick={toggleExpand}
      role="button"
      aria-expanded={isExpanded}
      aria-controls={`log-content-${log._id.toString()}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          toggleExpand();
        }
      }}
    >
      <div
        className="flex justify-between items-center"
        aria-label={`Log: ${log.title}`}
      >
        <h3 className="text-xl font-semibold text-white">{log.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={(e) => onEdit(e, log)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Edit
          </button>
          <button
            onClick={(e) => onDelete(e, log._id.toString(), log.title)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Delete
          </button>
        </div>
      </div>
      <div
        id={`log-content-${log._id.toString()}`}
        ref={contentRef}
        className="mt-4 border-t border-gray-700 pt-4"
        style={{ display: 'none', height: 0, opacity: 0, overflow: 'hidden' }}
      >
        <p id={`log-description-${log._id}`} className="text-gray-200">{log.content}</p>
        <p className="text-sm text-gray-400 mt-2">
          <span>Category: {log.category || "N/A"}</span>
          <span className="sr-only">. </span>
          <span aria-hidden="true"> | </span>
          <span>Duration: {log.duration || "N/A"} mins</span>
          <span className="sr-only">. </span>
          <span aria-hidden="true"> | </span>
          <span>Logged at: {new Date(log.timestamp).toLocaleString()}</span>
        </p>
      </div>
    </div>
  );
};

export default React.memo(LogItem);
