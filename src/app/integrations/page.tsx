"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Layers,
  Sparkles,
  Video,
  Database,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Power,
  RotateCw,
} from "lucide-react";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [aiStatus, setAiStatus] = useState<any>(null);
  const [ffmpegInstalled, setFfmpegInstalled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/integrations");
      const data = await res.json();
      if (data.success) {
        setIntegrations(data.integrations || []);
        setAiStatus(data.aiStatus);
        setFfmpegInstalled(data.ffmpegInstalled);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleToggle = async (platformKey: string, currentStatus: string) => {
    const action = currentStatus === "CONNECTED" ? "DISCONNECT" : "CONNECT";
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformKey, action }),
      });
      if (res.ok) fetchIntegrations();
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
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Provider Abstraction & Connections
                </span>
                <Badge variant="brand" size="sm">Truthful Operational Disclosure</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Integrations & External Services
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Inspect real configuration status, active credentials, OAuth scopes, and service dependencies. CreatorFlow never falsely claims completed operations without active credentials.
              </p>
            </div>
          </div>
        </div>

        {/* AI & Infrastructure Core Services */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* AI LLM Provider Card */}
          <Card className="p-5 border-[#E8E6DF] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#71A832]" /> AI Intelligence
              </span>
              <Badge variant={aiStatus?.isConfigured ? "success" : "demo"} size="sm">
                {aiStatus?.isConfigured ? "LIVE LLM" : "DEMO ENGINE"}
              </Badge>
            </div>
            <h4 className="text-base font-bold text-gray-900">{aiStatus?.modelName}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {aiStatus?.isConfigured
                ? "Active LLM API key detected in environment. Using live multi-agent generation."
                : "No live LLM key detected in .env. Running on built-in deterministic creator engine with complete schema validation."}
            </p>
            <div className="text-[11px] text-gray-400 font-mono">
              Keys: OpenAI ({aiStatus?.hasOpenAI ? "✓" : "✗"}), Anthropic ({aiStatus?.hasAnthropic ? "✓" : "✗"}), Gemini ({aiStatus?.hasGemini ? "✓" : "✗"})
            </div>
          </Card>

          {/* FFmpeg Video Processor */}
          <Card className="p-5 border-[#E8E6DF] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Video className="w-4 h-4 text-[#71A832]" /> Video Engine
              </span>
              <Badge variant={ffmpegInstalled ? "success" : "warning"} size="sm">
                {ffmpegInstalled ? "INSTALLED" : "SIMULATION"}
              </Badge>
            </div>
            <h4 className="text-base font-bold text-gray-900">
              {ffmpegInstalled ? "Local Hardware FFmpeg" : "FFmpeg Simulation Mode"}
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {ffmpegInstalled
                ? "FFmpeg binary discovered in system PATH. Hardware video rendering and subtitle burn-in enabled."
                : "FFmpeg not detected in PATH. Edit plans and candidate clip timestamps are generated with clear status warnings."}
            </p>
          </Card>

          {/* Persistent Storage */}
          <Card className="p-5 border-[#E8E6DF] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#71A832]" /> Persistent Storage
              </span>
              <Badge variant="success" size="sm">ACTIVE</Badge>
            </div>
            <h4 className="text-base font-bold text-gray-900">Local Disk Storage</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Persisting video clips, scalable SVG thumbnails, and assets to /public/uploads. Compatible with AWS S3 via environment variables.
            </p>
          </Card>
        </div>

        {/* Social Platforms List */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Connected Social & Publishing Platforms</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Authorized OAuth platform accounts for automated scheduling and analytics syncing.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {integrations
                .filter((i) => i.type === "SOCIAL_PLATFORM")
                .map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-[#E8E6DF] rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{item.name}</span>
                        <Badge
                          variant={item.status === "CONNECTED" ? "success" : "neutral"}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Account: <strong className="text-gray-800">{item.accountName}</strong>
                        {item.lastSyncedAt && ` • Last synced: ${new Date(item.lastSyncedAt).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={item.status === "CONNECTED" ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => handleToggle(item.platformKey, item.status)}
                        leftIcon={<Power className="w-3.5 h-3.5" />}
                      >
                        {item.status === "CONNECTED" ? "Disconnect" : "Connect Account"}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
