"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversalApprovalCard } from "@/components/automation/UniversalApprovalCard";
import { UniversalReviewData } from "@/types";
import {
  Video,
  Upload,
  Sparkles,
  Sliders,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Film,
} from "lucide-react";

export default function VideoRepurposingPage() {
  const [originalVideoTitle, setOriginalVideoTitle] = useState("Mastering AI Content Workflows (Complete Masterclass)");
  const [videoFileUrl, setVideoFileUrl] = useState("/uploads/demo-sample-video.mp4");
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(["TIKTOK", "INSTAGRAM", "YOUTUBE"]);
  const [desiredClipCount, setDesiredClipCount] = useState(2);
  const [preferredClipDurationSec, setPreferredClipDurationSec] = useState(45);
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [subtitleLanguage, setSubtitleLanguage] = useState("English");
  const [editingInstructions, setEditingInstructions] = useState(
    "Remove silences longer than 1.8 seconds, reframe speaker to centered vertical 9:16, burn dynamic subtitles in brand color #71A832, and normalize audio to -14 LUFS."
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<UniversalReviewData | null>(null);

  const togglePlatform = (p: string) => {
    setTargetPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleQuickInstruction = (prompt: string) => {
    setEditingInstructions((prev) => (prev ? `${prev} Also ${prompt}.` : prompt));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalVideoTitle.trim() || !editingInstructions.trim()) {
      setError("Please provide a video title and editing instructions.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/automations/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalVideoTitle,
          videoFileUrl,
          targetPlatforms,
          desiredClipCount,
          preferredClipDurationSec,
          aspectRatio,
          subtitleLanguage,
          editingInstructions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process video");
      }

      setReviewData(data);
    } catch (err: any) {
      setError(err.message || "Failed to submit video repurposing task");
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
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Automation Module 2
                </span>
                <Badge variant="brand" size="sm">Natural-Language FFmpeg Engine</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Video Editing & Repurposing
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Transform long-form recordings into high-retention short clips. Translates conversational instructions into validated FFmpeg edit plans, strips silences, and burns animated subtitles.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form Card */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Step 1: Upload Source Media & Edit Parameters</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Select or link a video recording and specify clip requirements.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Original Video Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={originalVideoTitle}
                    onChange={(e) => setOriginalVideoTitle(e.target.value)}
                    placeholder="e.g. Episode 12: How We Automated Our Production"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Source Media File URL / Path
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={videoFileUrl}
                      onChange={(e) => setVideoFileUrl(e.target.value)}
                      placeholder="/uploads/my-recording.mp4"
                      className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => alert("Upload dialog: you can place local MP4 files in /public/uploads directory")}
                      leftIcon={<Upload className="w-4 h-4" />}
                    >
                      Browse
                    </Button>
                  </div>
                </div>
              </div>

              {/* Target Platforms & Aspect Ratio */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                  >
                    <option value="9:16">9:16 Vertical (TikTok, Reels, Shorts)</option>
                    <option value="16:9">16:9 Landscape (YouTube, Blog)</option>
                    <option value="1:1">1:1 Square (LinkedIn, Feed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Desired Clip Count
                  </label>
                  <select
                    value={desiredClipCount}
                    onChange={(e) => setDesiredClipCount(Number(e.target.value))}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                  >
                    <option value={1}>1 Best Highlight Moment</option>
                    <option value={2}>2 Focused Short Clips</option>
                    <option value={3}>3 Standalone Vertical Clips</option>
                    <option value={4}>4 Short Form Nuggets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Clip Duration
                  </label>
                  <select
                    value={preferredClipDurationSec}
                    onChange={(e) => setPreferredClipDurationSec(Number(e.target.value))}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                  >
                    <option value={30}>30 Seconds (Fast Paced)</option>
                    <option value={45}>45 Seconds (Balanced Breakdown)</option>
                    <option value={60}>60 Seconds (Full Case Study)</option>
                  </select>
                </div>
              </div>

              {/* Natural-Language Editing Instructions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Natural-Language Editing Instructions <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-gray-400">
                    Parsed directly into validated FFmpeg timeline commands
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingInstructions}
                  onChange={(e) => setEditingInstructions(e.target.value)}
                  placeholder="e.g. Remove silences over 2s, add high-contrast subtitles, export vertical for TikTok"
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none font-mono"
                  required
                />

                {/* Quick Instruction Chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-gray-500 py-0.5">Quick instructions:</span>
                  {[
                    "Remove silences longer than 2s",
                    "Add English subtitles",
                    "Reframe speaker toward center",
                    "Trim first 10 seconds",
                    "Export for YouTube Shorts",
                  ].map((chip) => (
                    <button
                      type="button"
                      key={chip}
                      onClick={() => handleQuickInstruction(chip)}
                      className="text-[11px] px-2 py-0.5 bg-gray-100 hover:bg-[#F4F8EC] hover:text-[#45691C] rounded text-gray-700 border border-gray-200 transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<Scissors className="w-5 h-5" />}
                >
                  Generate Edit Plan & Candidate Clips
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
