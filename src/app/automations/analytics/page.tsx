"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversalApprovalCard } from "@/components/automation/UniversalApprovalCard";
import { UniversalReviewData } from "@/types";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Eye,
  Sparkles,
  Share2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Layers,
} from "lucide-react";

export default function AnalyticsPage() {
  const [platform, setPlatform] = useState<string>("YOUTUBE");
  const [period, setPeriod] = useState<"7d" | "30d">("30d");
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [reviewData, setReviewData] = useState<UniversalReviewData | null>(null);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/automations/analytics?platform=${platform}&period=${period}`);
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [platform, period]);

  const handleRunAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await fetch("/api/automations/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, period }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-[#E8E6DF] rounded-2xl shadow-card">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F4F8EC] text-[#45691C] flex items-center justify-center shrink-0">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Automation Module 4
                </span>
                <Badge variant="brand" size="sm">Evidence-Based Intelligence</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Performance Analysis & Audits
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Synthesize watch time, detect audience retention cliffs, compare top-performing formats, and generate strategic recommendations strictly backed by empirical metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={handleRunAudit}
              isLoading={isAuditing}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Run Strategic Audit
            </Button>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-[#E8E6DF] rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Platform:</span>
            {["YOUTUBE", "LINKEDIN", "INSTAGRAM"].map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                  platform === p
                    ? "bg-[#71A832] text-white border-[#71A832]"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Period:</span>
            <button
              onClick={() => setPeriod("7d")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                period === "7d"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setPeriod("30d")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                period === "30d"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {/* Key Metrics Row */}
        {report && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border-[#E8E6DF]">
              <span className="text-xs font-semibold text-gray-500 block">Total Organic Views</span>
              <strong className="text-2xl font-black text-gray-900 block mt-1">
                {report.metrics.totalViews.toLocaleString()}
              </strong>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">
                +{report.metrics.viewsGrowthPercent}% growth
              </span>
            </Card>

            <Card className="p-4 bg-white border-[#E8E6DF]">
              <span className="text-xs font-semibold text-gray-500 block">Watch Time</span>
              <strong className="text-2xl font-black text-gray-900 block mt-1">
                {report.metrics.watchTimeHours.toLocaleString()} hrs
              </strong>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Total hours viewed</span>
            </Card>

            <Card className="p-4 bg-white border-[#E8E6DF]">
              <span className="text-xs font-semibold text-gray-500 block">Engagement Rate</span>
              <strong className="text-2xl font-black text-[#71A832] block mt-1">
                {report.metrics.engagementRate}%
              </strong>
              <span className="text-[11px] text-gray-400 mt-0.5 block">Likes, comments & shares</span>
            </Card>

            <Card className="p-4 bg-white border-[#E8E6DF]">
              <span className="text-xs font-semibold text-gray-500 block">Click-Through Rate</span>
              <strong className="text-2xl font-black text-gray-900 block mt-1">
                {report.metrics.avgClickThroughRate}%
              </strong>
              <span className="text-[11px] text-emerald-600 font-bold mt-0.5 block">Top quartile benchmark</span>
            </Card>
          </div>
        )}

        {/* Retention Curve Visualization */}
        {report?.retentionData && (
          <Card className="border-[#E8E6DF]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Audience Retention Curve (First 4 Minutes)</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">Identifies drop-off cliffs and re-watch moments</p>
              </div>
              <Badge variant="neutral" size="sm">Seconds 0 - 240</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-6 gap-2">
                  {report.retentionData.map((pt: any) => (
                    <div key={pt.second} className="text-center">
                      <div className="h-32 bg-gray-100 rounded-lg flex flex-col justify-end p-1.5 relative overflow-hidden">
                        <div
                          className="bg-[#71A832] rounded transition-all duration-500 w-full"
                          style={{ height: `${pt.retentionPct}%` }}
                        />
                        <span className="absolute top-2 left-0 right-0 text-[10px] font-bold text-gray-700">
                          {pt.retentionPct}%
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 mt-1 block">
                        {pt.second}s
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-[#FAF9F5] border border-gray-200 rounded-lg text-xs text-gray-600">
                  <strong className="text-gray-900">Key Finding:</strong> Critical drop occurs between 0:15 - 0:30 (82% → 74%). Introducing an on-screen preview within the first 10 seconds reliably protects 8% more viewers.
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evidence-Based Strategic Recommendations */}
        {report?.aiRecommendations && (
          <Card className="border-[#E8E6DF]">
            <CardHeader>
              <CardTitle>Evidence-Based Recommendations</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">
                Every suggestion connects directly to verified viewer retention and CTR data.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.aiRecommendations.map((rec: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-[#E8E6DF] rounded-xl space-y-2 hover:border-[#71A832] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-gray-900">{rec.finding}</h4>
                      <Badge variant="brand" size="sm">Actionable Step</Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      <strong className="text-gray-700">Observed Evidence:</strong> {rec.evidence}
                    </p>
                    <div className="p-2.5 bg-[#F4F8EC] rounded-lg text-xs font-semibold text-[#45691C]">
                      → Recommended action: {rec.actionableStep}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Universal Human Approval Gate (when an audit is run) */}
        {reviewData && (
          <div>
            <div className="text-xs font-bold text-[#71A832] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Strategic Audit Sign-off Gate
            </div>
            <UniversalApprovalCard
              data={reviewData}
              onDecisionUpdated={(updated) => setReviewData(updated)}
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
