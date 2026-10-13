"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversalApprovalCard } from "@/components/automation/UniversalApprovalCard";
import { UniversalReviewData } from "@/types";
import {
  CheckSquare,
  ThumbsUp,
  ThumbsDown,
  Filter,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function ApprovalCenterPage() {
  const [filter, setFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [approvals, setApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeReviewData, setActiveReviewData] = useState<UniversalReviewData | null>(null);

  const fetchApprovals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/approvals?status=${filter}`);
      const data = await res.json();
      if (data.success && data.approvals) {
        setApprovals(data.approvals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  const openReviewModal = (approval: any) => {
    let contentParsed = null;
    try {
      contentParsed = JSON.parse(approval.version.contentJson);
    } catch (e) {
      contentParsed = approval.version.contentJson;
    }

    const review: UniversalReviewData = {
      runId: approval.runId || "",
      assetId: approval.assetId,
      versionId: approval.versionId,
      versionNumber: approval.version.versionNumber,
      totalVersions: approval.asset.versions?.length || 1,
      title: approval.version.title,
      module: approval.run?.module || (approval.asset.contentType === "SCRIPT" ? "SCRIPT" : "PLANNING"),
      status: approval.decision === "APPROVED" ? "APPROVED" : "AWAITING_APPROVAL",
      approvalDecision: approval.decision,
      summary: approval.version.summary || "Pending creator review",
      content: contentParsed,
      qualityWarnings: approval.version.qualityWarnings ? JSON.parse(approval.version.qualityWarnings) : [],
      settingsUsed: {},
      isDemoResult: false,
    };
    (review as any).approvalId = approval.id;
    setActiveReviewData(review);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-[#E8E6DF] rounded-2xl shadow-card">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F4F8EC] text-[#45691C] flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Human-in-the-Loop Hub
                </span>
                <Badge variant="brand" size="sm">Strict Authorization Gate</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Human Approval Center
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Every AI-generated draft, video cut, and publishing action enters this review queue before triggering external actions. Nothing publishes or sends without your explicit sign-off.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-2 bg-white border border-[#E8E6DF] rounded-xl w-fit">
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setActiveReviewData(null);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filter === status
                  ? "bg-[#71A832] text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status === "PENDING"
                ? "Pending Review"
                : status === "APPROVED"
                ? "Approved Assets"
                : status === "REJECTED"
                ? "Rejected / In Feedback"
                : "All Decisions"}
            </button>
          ))}
        </div>

        {/* Active Review Gate Modal/Card */}
        {activeReviewData && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                Active Deliverable Review Card
              </div>
              <button
                onClick={() => setActiveReviewData(null)}
                className="text-xs text-gray-500 hover:text-gray-900 underline"
              >
                Close Review Card
              </button>
            </div>
            <UniversalApprovalCard
              data={activeReviewData}
              onDecisionUpdated={(updated) => {
                setActiveReviewData(updated);
                fetchApprovals();
              }}
            />
          </div>
        )}

        {/* Approvals Table Card */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Queue Items ({approvals.length})</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Review deliverables, inspect version iterations, or request AI improvements.
            </p>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading approvals...</div>
            ) : approvals.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs">
                No items in this queue filter.
              </div>
            ) : (
              <div className="space-y-3">
                {approvals.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-white border border-[#E8E6DF] rounded-xl hover:border-[#71A832] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            app.decision === "APPROVED"
                              ? "success"
                              : app.decision === "REJECTED"
                              ? "error"
                              : "brand"
                          }
                          size="sm"
                        >
                          {app.decision}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          v{app.version?.versionNumber || 1}
                        </Badge>
                        <span className="text-[11px] text-gray-400 font-medium">
                          Created {new Date(app.createdAt).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 mt-1">
                        {app.version?.title || app.asset?.title}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-2xl line-clamp-2">
                        {app.version?.summary || "Ready for human creator sign-off."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openReviewModal(app)}
                      >
                        Inspect & Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
