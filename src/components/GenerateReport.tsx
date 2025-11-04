"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const GenerateReport = () => {
    const { data: session } = useSession();
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [reportTitle, setReportTitle] = useState("");
    const [report, setReport] = useState("");
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState("");
    const [lastReportDate, setLastReportDate] = useState<Date | null>(null);
    const [canGenerateReport, setCanGenerateReport] = useState(true);
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        console.log("fetching last report date");
        const fetchLastReportDate = async () => {
            if (session) {
                try {
                    const res = await fetch("/api/reports?limit=1");
                    if (res.ok) {
                        const data = await res.json();
                        console.log("Respose: ", data);
                        if (data) {
                            console.log("date: ",data.reports[0].generatedAt);
                            setLastReportDate(new Date(data.reports[0].generatedAt));
                        }
                    }
                } catch (error) {
                    console.error("Error fetching last report date:", error);
                }
            }
        };
        fetchLastReportDate();
    }, [session]);

    useEffect(() => {
        if (lastReportDate) {
            const now = new Date();
            const diffTime = now.getTime() - lastReportDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);
            if (diffDays < 10) {
                setCanGenerateReport(false);
                setDaysLeft(10 - diffDays);
            } else {
                setCanGenerateReport(true);
            }
        }
    }, [lastReportDate]);

    const handleGenerateReport = async () => {
        if (!startDate || !endDate || !reportTitle) {
            setReportError("Please fill in all fields.");
            return;
        }
        setReportLoading(true);
        setReportError("");
        setReport("");
        try {
            const res = await fetch("/api/generate-report", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ startDate, endDate, title: reportTitle }),
            });
            if (res.ok) {
                const data = await res.json();
                setReport(data.report);
                setLastReportDate(new Date()); // Assume new report is generated now
            } else {
                const errorData = await res.json();
                setReportError(errorData.message || "Failed to generate report.");
            }
        } catch (error) {
            console.error("Error generating report:", error);
            setReportError("An unexpected error occurred.");
        } finally {
            setReportLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6">Generate Report</h2>
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
                            required
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
                            required
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
    )
}

export default GenerateReport;
