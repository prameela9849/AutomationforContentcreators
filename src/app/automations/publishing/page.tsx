"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversalApprovalCard } from "@/components/automation/UniversalApprovalCard";
import { UniversalReviewData } from "@/types";
import {
  Send,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
} from "lucide-react";

export default function PublishingPage() {
  const [platform, setPlatform] = useState<"YOUTUBE" | "LINKEDIN" | "INSTAGRAM" | "TIKTOK" | "TWITTER">("LINKEDIN");
  const [caption, setCaption] = useState(
    "Most creators burn out not from brainstorming ideas, but from the mechanical drag of editing.\n\n3 months ago, my average video took 8+ hours.\nToday: 35 minutes.\n\nHere is the 4-layer automation pipeline we use every morning:\n→ Layer 1: Research with verified search metrics\n→ Layer 2: Automatic silence stripping (< 1.8s threshold)\n→ Layer 3: Dynamic brand subtitle styling (#71A832)\n→ Layer 4: Mandatory human approval before publishing\n\nWhich stage of editing steals the most time in your week?"
  );
  const [scheduledFor, setScheduledFor] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [mediaUrl, setMediaUrl] = useState("/uploads/demo-sample-video.mp4");
  const [timeZone, setTimeZone] = useState("America/New_York");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<UniversalReviewData | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/integrations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.integrations) {
          setConnectedPlatforms(data.integrations.filter((i: any) => i.type === "SOCIAL_PLATFORM"));
        }
      })
      .catch(() => {});
  }, []);

  const currentPlatformConnection = connectedPlatforms.find((p) => p.platformKey === platform);
  const isConnected = currentPlatformConnection?.status === "CONNECTED";

  const getCharLimit = () => {
    switch (platform) {
      case "TWITTER": return 280;
      case "LINKEDIN": return 3000;
      case "INSTAGRAM": return 2200;
      case "YOUTUBE": return 5000;
      case "TIKTOK": return 2200;
    }
  };

  const charLimit = getCharLimit();
  const currentLen = caption.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) {
      setError("Please provide a caption or post description.");
      return;
    }

    if (currentLen > charLimit) {
      setError(`Post exceeds ${platform} character limit (${currentLen}/${charLimit}). Please shorten.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/automations/publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          caption,
          scheduledFor: new Date(scheduledFor).toISOString(),
          mediaUrl,
          timeZone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to schedule publication");
      }

      setReviewData(data);
    } catch (err: any) {
      setError(err.message || "Failed to schedule post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-[#E8E6DF] rounded-2xl shadow-card">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F4F8EC] text-[#45691C] flex items-center justify-center shrink-0">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Automation Module 3
                </span>
                <Badge variant="brand" size="sm">Idempotent Delivery Queue</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Automatic Publishing & Scheduling
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Validate platform constraints, maintain your visual content calendar, prevent duplicate submissions, and require human approval before any public delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Connection Status Notice */}
        <div className="flex items-center justify-between p-4 bg-white border border-[#E8E6DF] rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">Platform Connection Status ({platform}):</span>
            {isConnected ? (
              <Badge variant="success" size="sm">Connected ({currentPlatformConnection?.accountName})</Badge>
            ) : (
              <Badge variant="warning" size="sm">Manual Mode (API Not Connected)</Badge>
            )}
          </div>
          {!isConnected && (
            <span className="text-gray-500">
              Deliverable will be scheduled to your calendar with quick one-click manual copy.
            </span>
          )}
        </div>

        {/* Input Form Card */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Step 1: Compose & Validate Publication Draft</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Select platform, preview live character counts, and configure delivery time.
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Platform Selector Buttons */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Destination Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["LINKEDIN", "YOUTUBE", "INSTAGRAM", "TWITTER", "TIKTOK"] as const).map((plat) => (
                    <button
                      type="button"
                      key={plat}
                      onClick={() => setPlatform(plat)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors ${
                        platform === plat
                          ? "bg-[#71A832] text-white border-[#71A832] shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption / Description Body */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Post Caption / Description <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-xs font-mono font-bold ${currentLen > charLimit ? "text-rose-600" : "text-gray-500"}`}>
                    {currentLen} / {charLimit} chars
                  </span>
                </div>
                <textarea
                  rows={8}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Draft your post, caption, hashtags, and call to action..."
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none leading-relaxed"
                  required
                />
              </div>

              {/* Media URL & Scheduling Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Attached Media Asset URL
                  </label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="/uploads/demo-sample-video.mp4"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Publication Date & Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledFor}
                    onChange={(e) => setScheduledFor(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Account Time Zone
                  </label>
                  <select
                    value={timeZone}
                    onChange={(e) => setTimeZone(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                  >
                    <option value="America/New_York">Eastern Time (ET / America/New_York)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT / America/Los_Angeles)</option>
                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                    <option value="Europe/London">London (GMT / BST)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<Calendar className="w-5 h-5" />}
                >
                  Validate & Queue for Approval
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Universal Human Approval Gate */}
        {reviewData && (
          <div>
            <div className="text-xs font-bold text-[#71A832] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Universal Human Approval Gate
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
