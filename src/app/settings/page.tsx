"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Settings as SettingsIcon,
  Palette,
  User,
  DollarSign,
  Save,
  Check,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const [brandName, setBrandName] = useState("CreatorFlow Studio");
  const [tagline, setTagline] = useState("High-leverage automated content workflows");
  const [primaryColor, setPrimaryColor] = useState("#71A832");
  const [secondaryColor, setSecondaryColor] = useState("#1F2937");
  const [toneOfVoice, setToneOfVoice] = useState("Actionable, direct, credible, empowering, zero-fluff");

  const [niche, setNiche] = useState("AI Automation & Tech Productivity");
  const [targetAudience, setTargetAudience] = useState("Indie creators, developers, AI enthusiasts, remote founders");
  const [dedicatedVideoRate, setDedicatedVideoRate] = useState(2800);
  const [integratedVideoRate, setIntegratedVideoRate] = useState(1400);
  const [shortFormRate, setShortFormRate] = useState(750);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.brandKit) {
            setBrandName(data.brandKit.brandName || "CreatorFlow Studio");
            setTagline(data.brandKit.tagline || "");
            setPrimaryColor(data.brandKit.primaryColor || "#71A832");
            setSecondaryColor(data.brandKit.secondaryColor || "#1F2937");
            setToneOfVoice(data.brandKit.toneOfVoice || "");
          }
          if (data.profile) {
            setNiche(data.profile.niche || "");
            setTargetAudience(data.profile.targetAudience || "");
            if (data.profile.standardRateCard) {
              try {
                const rc = JSON.parse(data.profile.standardRateCard);
                setDedicatedVideoRate(rc.dedicatedVideo || 2800);
                setIntegratedVideoRate(rc.integratedVideo || 1400);
                setShortFormRate(rc.shortFormClip || 750);
              } catch (e) {}
            }
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandKit: {
            brandName,
            tagline,
            primaryColor,
            secondaryColor,
            toneOfVoice,
          },
          profile: {
            niche,
            targetAudience,
            standardRateCard: {
              dedicatedVideo: dedicatedVideoRate,
              integratedVideo: integratedVideoRate,
              shortFormClip: shortFormRate,
            },
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-[#E8E6DF] rounded-2xl shadow-card">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F4F8EC] text-[#45691C] flex items-center justify-center shrink-0">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Brand & Identity Engine
                </span>
                <Badge variant="brand" size="sm">Workspace Tokens</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Workspace Settings & Brand Kit
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Configure your Brand Kit color palette, typography hierarchy, standard rate card benchmarks, and tone-of-voice profiles used by all 7 automation modules.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {saveSuccess && (
          <div className="p-3.5 bg-[#F4F8EC] border border-[#CEE2AE] text-[#45691C] text-sm font-semibold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Settings and Brand Kit saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Brand Kit Card */}
          <Card className="border-[#E8E6DF]">
            <CardHeader className="flex flex-row items-center gap-2">
              <Palette className="w-5 h-5 text-[#71A832]" />
              <div>
                <CardTitle>Brand Kit & Visual Design Tokens</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applied to exported graphics, subtitles, and thumbnails
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Primary Brand Color (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 text-sm font-mono p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Secondary Color (Hex)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 text-sm font-mono p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Tone of Voice Profile
                </label>
                <textarea
                  rows={2}
                  value={toneOfVoice}
                  onChange={(e) => setToneOfVoice(e.target.value)}
                  className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Creator Profile & Rate Card */}
          <Card className="border-[#E8E6DF]">
            <CardHeader className="flex flex-row items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#71A832]" />
              <div>
                <CardTitle>Creator Profile & Sponsor Rate Card</CardTitle>
                <p className="text-xs text-gray-500 mt-0.5">
                  Benchmarks used by Module 5 to evaluate sponsor offers and generate counter-proposals
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Niche / Category
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Target Audience
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Dedicated Video ($ USD)
                  </label>
                  <input
                    type="number"
                    value={dedicatedVideoRate}
                    onChange={(e) => setDedicatedVideoRate(Number(e.target.value))}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Integrated 60s Segment ($ USD)
                  </label>
                  <input
                    type="number"
                    value={integratedVideoRate}
                    onChange={(e) => setIntegratedVideoRate(Number(e.target.value))}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Sponsored Short / Post ($ USD)
                  </label>
                  <input
                    type="number"
                    value={shortFormRate}
                    onChange={(e) => setShortFormRate(Number(e.target.value))}
                    className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSaving}
              leftIcon={<Save className="w-5 h-5" />}
            >
              Save Brand Kit & Profile Settings
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
