"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversalApprovalCard } from "@/components/automation/UniversalApprovalCard";
import { UniversalReviewData } from "@/types";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Sliders,
  Send,
} from "lucide-react";

export default function ScriptGenerationPage() {
  const [topic, setTopic] = useState("5 AI Agents That Replaced My 20-Hour Editing Week");
  const [targetAudience, setTargetAudience] = useState("Solo creators, indie developers, video editors");
  const [platform, setPlatform] = useState<"CROSS_PLATFORM" | "YOUTUBE" | "LINKEDIN" | "INSTAGRAM">("CROSS_PLATFORM");
  const [toneOfVoice, setToneOfVoice] = useState("Authoritative, empathetic, actionable, zero-fluff");
  const [mainObjective, setMainObjective] = useState("Educate audience on automated workflows and drive newsletter signups");
  const [callToAction, setCallToAction] = useState("Subscribe and grab the free open workflow blueprint in comments");
  const [keywords, setKeywords] = useState("AI agents, video editing, silence removal, creator automation");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<UniversalReviewData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !targetAudience.trim()) {
      setError("Please provide a topic and target audience.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/automations/scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetAudience,
          platform,
          toneOfVoice,
          mainObjective,
          callToAction,
          keywords,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate script package");
      }

      setReviewData(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate scripts");
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Automation Module 7
                </span>
                <Badge variant="brand" size="sm">Multi-Platform Copy Engine</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Script, Caption & Post Generation
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Transform a single concept into structured video scripts with timed chapters, high-converting opening hooks, formatted LinkedIn deep-dives, and Instagram captions.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form Card */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Step 1: Content Topic & Brand Voice Constraints</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Specify your premise, target platform, and conversion objective.
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
                    Topic or Core Concept <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. 5 AI Agents That Replaced My 20-Hour Editing Week"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Audience <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g. Solo creators, indie developers, remote founders"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Distribution Scope
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none bg-white"
                  >
                    <option value="CROSS_PLATFORM">Cross-Platform (Video + LinkedIn + IG)</option>
                    <option value="YOUTUBE">YouTube Video Script Only</option>
                    <option value="LINKEDIN">LinkedIn Post Only</option>
                    <option value="INSTAGRAM">Instagram Caption & Hashtags Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tone of Voice Profile
                  </label>
                  <input
                    type="text"
                    value={toneOfVoice}
                    onChange={(e) => setToneOfVoice(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Key Focus Keywords
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="Comma separated keywords"
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Primary Conversion Objective
                  </label>
                  <input
                    type="text"
                    value={mainObjective}
                    onChange={(e) => setMainObjective(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Call to Action (CTA)
                  </label>
                  <input
                    type="text"
                    value={callToAction}
                    onChange={(e) => setCallToAction(e.target.value)}
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
                  Generate Multi-Platform Package
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Universal Human Approval Gate */}
        {reviewData && (
          <div>
            <div className="text-xs font-bold text-[#71A832] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Script Package Sign-off Gate
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
