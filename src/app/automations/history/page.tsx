"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  Ban,
  Clock,
  Layers,
} from "lucide-react";

export default function HistoryPage() {
  const [runs, setRuns] = useState<any[]>([]);
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRun, setSelectedRun] = useState<any | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const url = `/api/automations/history?module=${moduleFilter}&status=${statusFilter}&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.runs) {
        setRuns(data.runs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [moduleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleAction = async (runId: string, action: "CANCEL" | "RETRY") => {
    try {
      const res = await fetch(`/api/automations/${runId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchHistory();
        if (selectedRun?.id === runId) {
          setSelectedRun((prev: any) => ({ ...prev, status: action === "CANCEL" ? "CANCELLED" : "RUNNING" }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-[#E8E6DF] rounded-2xl shadow-card">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F4F8EC] text-[#45691C] flex items-center justify-center shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Audit Logging & Orchestration
                </span>
                <Badge variant="brand" size="sm">Traceable Lifecycle</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Automation History & Run Monitoring
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Inspect every execution lifecycle event, input parameters, generated outputs, cancellation requests, and safe retry recovery actions.
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-[#E8E6DF] rounded-xl">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search run summary or steps..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FAF9F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#71A832]"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">Filter</Button>
          </form>

          <div className="flex items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="text-xs p-1.5 border border-gray-200 rounded-lg bg-white"
            >
              <option value="ALL">All 7 Modules</option>
              <option value="PLANNING">1. Planning</option>
              <option value="VIDEO">2. Video</option>
              <option value="PUBLISHING">3. Publishing</option>
              <option value="ANALYTICS">4. Analytics</option>
              <option value="SPONSORSHIP">5. Sponsorship</option>
              <option value="THUMBNAIL">6. Thumbnail</option>
              <option value="SCRIPT">7. Script</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-1.5 border border-gray-200 rounded-lg bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="RUNNING">Running</option>
              <option value="AWAITING_APPROVAL">Awaiting Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Selected Run Drawer / Inspection View */}
        {selectedRun && (
          <Card className="border-2 border-[#71A832]/40 bg-white">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Run Detail Inspection (#{selectedRun.runNumber})</CardTitle>
                <p className="text-xs text-gray-500">ID: {selectedRun.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {["RUNNING", "QUEUED"].includes(selectedRun.status) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleAction(selectedRun.id, "CANCEL")}
                    leftIcon={<Ban className="w-3.5 h-3.5" />}
                  >
                    Cancel Run
                  </Button>
                )}
                {["FAILED", "CANCELLED"].includes(selectedRun.status) && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAction(selectedRun.id, "RETRY")}
                    leftIcon={<RotateCw className="w-3.5 h-3.5" />}
                  >
                    Safe Retry
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedRun(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-[#FAF9F5] rounded border border-gray-200">
                  <span className="text-gray-500 block">Module:</span>
                  <strong className="text-gray-900">{selectedRun.module}</strong>
                </div>
                <div className="p-2.5 bg-[#FAF9F5] rounded border border-gray-200">
                  <span className="text-gray-500 block">Status:</span>
                  <Badge variant="brand" size="sm">{selectedRun.status}</Badge>
                </div>
                <div className="p-2.5 bg-[#FAF9F5] rounded border border-gray-200">
                  <span className="text-gray-500 block">Current Step:</span>
                  <span className="font-medium text-gray-800">{selectedRun.currentStep}</span>
                </div>
                <div className="p-2.5 bg-[#FAF9F5] rounded border border-gray-200">
                  <span className="text-gray-500 block">Timestamp:</span>
                  <span>{new Date(selectedRun.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide block mb-1">Inputs JSON:</span>
                <pre className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono overflow-x-auto max-h-40">
                  {selectedRun.inputsJson}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Runs History Table Card */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Automation Runs Audit Log ({runs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading history...</div>
            ) : runs.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">No runs found matching query.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF9F5] text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Run #</th>
                      <th className="py-2.5 px-3">Module</th>
                      <th className="py-2.5 px-3">Input Summary</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Started</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {runs.map((r) => (
                      <tr key={r.id} className="hover:bg-[#F4F8EC]/50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-gray-800">#{r.runNumber}</td>
                        <td className="py-3 px-3"><Badge variant="neutral" size="sm">{r.module}</Badge></td>
                        <td className="py-3 px-3 font-medium text-gray-800 max-w-sm truncate">{r.inputSummary || "N/A"}</td>
                        <td className="py-3 px-3">
                          <Badge
                            variant={
                              r.status === "APPROVED" || r.status === "COMPLETED"
                                ? "success"
                                : r.status === "AWAITING_APPROVAL"
                                ? "brand"
                                : r.status === "FAILED"
                                ? "error"
                                : "neutral"
                            }
                            size="sm"
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => setSelectedRun(r)}
                            className="text-[#71A832] font-semibold hover:underline"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
