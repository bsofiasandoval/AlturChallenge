"use client";

import { useState, useEffect, useRef } from "react";
import { FileUpload } from "@/components/file-upload";
import { CallsList } from "@/components/calls-list";
import { CallRecord } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const POLL_INTERVAL = 3000; // 3 seconds
const POLL_TIMEOUT = 120000; // 2 minutes

export default function Home() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const pollingIntervalsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const stopPolling = (callId: string) => {
    const intervalId = pollingIntervalsRef.current.get(callId);
    if (intervalId) {
      clearInterval(intervalId);
      pollingIntervalsRef.current.delete(callId);
    }
  };

  const pollCallInsights = async (callId: string) => {
    try {
      const response = await fetch(`${API_URL}/call/${callId}`);
      if (!response.ok) return;

      const data = await response.json();

      if (data.success && data.insights) {
        setCalls((prev) =>
          prev.map((call) =>
            call.call_id === callId ? { ...call, insights: data.insights } : call
          )
        );
        stopPolling(callId);
      }
    } catch (error) {
      console.error("Error polling call insights:", error);
    }
  };

  const handleUploadSuccess = (data: CallRecord) => {
    setCalls((prev) => [data, ...prev]);

    if (!data.insights) {
      const intervalId = setInterval(() => pollCallInsights(data.call_id), POLL_INTERVAL);
      pollingIntervalsRef.current.set(data.call_id, intervalId);

      setTimeout(() => stopPolling(data.call_id), POLL_TIMEOUT);
    }
  };

  const fetchAllCalls = async (tag?: string, sort?: "asc" | "desc") => {
    try {
      // Build query params
      const params = new URLSearchParams();
      if (tag) params.append("tag", tag);
      if (sort) params.append("sort", sort);

      const url = `${API_URL}/calls${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) return;

      const data = await response.json();
      if (data.success && data.calls) {
        setCalls(data.calls);

        // Start polling for calls without insights
        data.calls.forEach((call: CallRecord) => {
          if (!call.insights) {
            const intervalId = setInterval(() => pollCallInsights(call.call_id), POLL_INTERVAL);
            pollingIntervalsRef.current.set(call.call_id, intervalId);
            setTimeout(() => stopPolling(call.call_id), POLL_TIMEOUT);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching calls:", error);
    }
  };

  useEffect(() => {
    fetchAllCalls(selectedTag || undefined, sortOrder);
  }, [selectedTag, sortOrder]);

  useEffect(() => {
    return () => {
      pollingIntervalsRef.current.forEach((intervalId) => clearInterval(intervalId));
      pollingIntervalsRef.current.clear();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Call Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Upload call recordings for AI-powered analysis
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="max-w-3xl mx-auto">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <label htmlFor="tag-filter" className="text-sm font-medium">
              Filter by tag:
            </label>
            <select
              id="tag-filter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 rounded-md border bg-background text-sm"
            >
              <option value="">All tags</option>
              <option value="needs_follow_up">Needs Follow-up</option>
              <option value="wrong_number">Wrong Number</option>
              <option value="not_interested">Not Interested</option>
              <option value="requesting_info">Requesting Info</option>
              <option value="complaint">Complaint</option>
              <option value="support_issue">Support Issue</option>
              <option value="scheduling">Scheduling</option>
              <option value="pricing_inquiry">Pricing Inquiry</option>
              <option value="ready_to_purchase">Ready to Purchase</option>
              <option value="callback_requested">Callback Requested</option>
              <option value="decision_maker_absent">Decision Maker Absent</option>
              <option value="positive_feedback">Positive Feedback</option>
              <option value="escalation_needed">Escalation Needed</option>
              <option value="voicemail">Voicemail</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-order" className="text-sm font-medium">
              Sort by upload time:
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="px-3 py-2 rounded-md border bg-background text-sm"
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>

          {selectedTag && (
            <button
              onClick={() => setSelectedTag("")}
              className="text-sm text-muted-foreground hover:text-foreground underline"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="w-full">
          <CallsList calls={calls} />
        </div>
      </main>
    </div>
  );
}
