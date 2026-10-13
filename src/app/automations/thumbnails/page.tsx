"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversalApprovalCard } from "@/components/automation/UniversalApprovalCard";
import { UniversalReviewData } from "@/types";
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Palette,
  Eye,
} from "lucide-react";

export default function ThumbnailCreationPage() {
  const [brief, setBrief] = useState("5 AI Agents That Replaced My 20-Hour Editing Week");
  const [headlineText, setHeadlineText] = useState("20 HOURS → 45 MINS");
  const [subheadingText, setSubheadingText] = useState("MY AI EDITING PIPELINE");
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");
  const [style, setStyle] = useState<"high-contrast" | "minimal-dark" | "bold-editorial" | "quote-card">("high-contrast");
  const [stickers, setStickers] = useState("100% AUTOMATED, NEW 2026 WORKFLOW");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<UniversalReviewData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim()) {
      setError("Please provide a content brief or title.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/automations/thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brief,
          headlineText,
          subheadingText,
          aspectRatio,
          style,
          stickers: stickers ? stickers.split(",").map((s) => s.trim()) : [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate thumbnail");
      }

      setReviewData(data);
    } catch (err: any) {
      setError(err.message || "Failed to create thumbnail graphic");
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
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Automation Module 6
                </span>
                <Badge variant="brand" size="sm">Brand Kit Integrated Vector Engine</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Thumbnail & Graphic Creation
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Generate high-CTR YouTube thumbnails, vertical quote cards, and social headers. Adheres strictly to your saved Brand Kit colors (#71A832) and font hierarchy.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form Card */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Step 1: Visual Asset Brief & Layout Styling</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Specify headline hooks, aspect ratios, and visual accents.
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
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Content Topic or Video Brief <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="e.g. 5 AI Agents That Replaced My 20-Hour Editing Week"
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Main Bold Headline Hook (Max 4-5 words)
                  </label>
                  <input
                    type="text"
                    value={headlineText}
                    onChange={(e) => setHeadlineText(e.target.value)}
                    placeholder="e.g. 20 HOURS → 45 MINS"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subheading / Supporting Label
                  </label>
                  <input
                    type="text"
                    value={subheadingText}
                    onChange={(e) => setSubheadingText(e.target.value)}
                    placeholder="e.g. MY AI EDITING PIPELINE"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Aspect Ratio & Format
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                  >
                    <option value="16:9">16:9 YouTube Thumbnail (1280x720)</option>
                    <option value="9:16">9:16 Vertical Story / Shorts (1080x1920)</option>
                    <option value="1:1">1:1 Square Post (1080x1080)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Visual Design Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as any)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                  >
                    <option value="high-contrast">High-Contrast Tech (Split Charcoal & Green)</option>
                    <option value="minimal-dark">Minimal Dark (Clean Typography)</option>
                    <option value="bold-editorial">Bold Editorial</option>
                    <option value="quote-card">Quote Card Layout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Callout Badges / Stickers
                  </label>
                  <input
                    type="text"
                    value={stickers}
                    onChange={(e) => setStickers(e.target.value)}
                    placeholder="Comma separated badges"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<Sparkles className="w-5 h-5" />}
                >
                  Generate Scalable Graphic Concept
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Universal Human Approval Gate */}
        {reviewData && (
          <div>
            <div className="text-xs font-bold text-[#71A832] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Graphic Asset Sign-off Gate
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
