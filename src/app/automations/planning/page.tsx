"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversalApprovalCard } from "@/components/automation/UniversalApprovalCard";
import { UniversalReviewData } from "@/types";
import {
  Compass,
  Sparkles,
  Calendar,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  ListPlus,
} from "lucide-react";

export default function ContentPlanningPage() {
  const [niche, setNiche] = useState("AI Automation & Tech Productivity");
  const [targetAudience, setTargetAudience] = useState("Content creators, solo entrepreneurs, tech founders");
  const [targetRegion, setTargetRegion] = useState("Global");
  const [languages, setLanguages] = useState("English");
  const [platforms, setPlatforms] = useState<string[]>(["YOUTUBE", "LINKEDIN"]);
  const [goals, setGoals] = useState("Grow organic audience reach, establish authority, and attract high-ticket sponsors");
  const [preferredFormats, setPreferredFormats] = useState<string[]>(["Long-form Video", "Vertical Shorts"]);
  const [postingFrequency, setPostingFrequency] = useState("3_TIMES_WEEK");
  const [topicsToAvoid, setTopicsToAvoid] = useState("Crypto hype, get-rich-quick scams, clickbait without tutorials");
  const [competitors, setCompetitors] = useState("Matt Wolfe, Liam Ottley");
  const [dateRangeDays, setDateRangeDays] = useState(7);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<UniversalReviewData | null>(null);

  const togglePlatform = (p: string) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim() || !targetAudience.trim()) {
      setError("Please provide your niche and target audience.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/automations/planning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          targetAudience,
          targetRegion,
          languages,
          platforms,
          goals,
          preferredFormats,
          postingFrequency,
          topicsToAvoid,
          competitors,
          dateRangeDays,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate content plan");
      }

      setReviewData(data);
    } catch (err: any) {
      setError(err.message || "Failed to start content planning");
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
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Automation Module 1
                </span>
                <Badge variant="brand" size="sm">7 & 30-Day Blueprints</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Automated Content Planning
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Discover high-velocity content opportunities, extract genuine audience pain points, calculate relevance scores, and generate intelligent publishing calendars.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form Card */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Step 1: Creator Strategy & Requirements</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Specify your niche, audience constraints, and distribution goals.
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
                    Niche or Industry <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="e.g. AI Automation & Creator Productivity"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Audience Profile <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Solo creators, indie hackers, tech entrepreneurs"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              {/* Target Platforms */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Target Content Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {["YOUTUBE", "LINKEDIN", "INSTAGRAM", "TIKTOK", "TWITTER"].map((plat) => {
                    const isSelected = platforms.includes(plat);
                    return (
                      <button
                        type="button"
                        key={plat}
                        onClick={() => togglePlatform(plat)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                          isSelected
                            ? "bg-[#71A832] text-white border-[#71A832] shadow-sm"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        {plat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Plan Duration
                  </label>
                  <select
                    value={dateRangeDays}
                    onChange={(e) => setDateRangeDays(Number(e.target.value))}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                  >
                    <option value={7}>7-Day Sprint Plan (3 High-Impact Topics)</option>
                    <option value={30}>30-Day Monthly Calendar (12 Topics)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Posting Frequency
                  </label>
                  <select
                    value={postingFrequency}
                    onChange={(e) => setPostingFrequency(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                  >
                    <option value="DAILY">Daily (7 posts / week)</option>
                    <option value="3_TIMES_WEEK">3 Times a Week</option>
                    <option value="WEEKLY">Weekly Deep-Dive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Region & Language
                  </label>
                  <input
                    type="text"
                    value={`${targetRegion} (${languages})`}
                    onChange={(e) => setTargetRegion(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Core Content Goals & Brand Objective
                </label>
                <textarea
                  rows={2}
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g. Establish technical credibility, grow newsletter subscriber base, attract sponsor inquiries"
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Topics to Avoid (Brand Safety)
                  </label>
                  <input
                    type="text"
                    value={topicsToAvoid}
                    onChange={(e) => setTopicsToAvoid(e.target.value)}
                    placeholder="e.g. Unverified rumors, controversial drama, crypto promotions"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Competitor Benchmark Channels (Optional)
                  </label>
                  <input
                    type="text"
                    value={competitors}
                    onChange={(e) => setCompetitors(e.target.value)}
                    placeholder="e.g. Channels or blogs in your category to find content gaps"
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
                  Generate Intelligent Content Plan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Universal Human Approval Card (Step 4 & 5) */}
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
