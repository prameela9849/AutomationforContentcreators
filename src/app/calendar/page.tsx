"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar as CalendarIcon,
  Clock,
  Send,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function CalendarPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCalendar = async () => {
    try {
      const res = await fetch("/api/calendar");
      const data = await res.json();
      if (data.success) {
        setEntries(data.entries || []);
        setScheduledPosts(data.scheduledPosts || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-[#E8E6DF] rounded-2xl shadow-card">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F4F8EC] text-[#45691C] flex items-center justify-center shrink-0">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Content Orchestration
                </span>
                <Badge variant="brand" size="sm">Cross-Platform Distribution</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Visual Content Calendar
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Unified schedule across YouTube, LinkedIn, Instagram, and TikTok. Review approved assets queued for release, reschedule dates, or copy text for manual posting.
              </p>
            </div>
          </div>
        </div>

        {/* Scheduled Posts Timeline */}
        <Card className="border-[#E8E6DF]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming Scheduled Releases ({scheduledPosts.length})</CardTitle>
              <p className="text-xs text-gray-500 mt-0.5">Approved content waiting for air date</p>
            </div>
          </CardHeader>
          <CardContent>
            {scheduledPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No scheduled posts found. Use Module 3 to queue deliverables.
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 bg-white border border-[#E8E6DF] rounded-xl hover:border-[#71A832] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={post.platform === "YOUTUBE" ? "error" : post.platform === "LINKEDIN" ? "purple" : "brand"}
                          size="sm"
                        >
                          {post.platform}
                        </Badge>
                        <Badge variant="neutral" size="sm">
                          {post.status}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(post.scheduledFor).toLocaleString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })} ({post.timeZone})
                        </span>
                      </div>

                      <p className="text-xs text-gray-700 whitespace-pre-wrap line-clamp-3 bg-[#FAF9F5] p-2.5 rounded-lg border border-gray-200">
                        {post.caption}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleCopy(post.id, post.caption)}
                        leftIcon={copiedId === post.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      >
                        {copiedId === post.id ? "Copied" : "Copy Caption"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Plan Calendar Entries */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Planned Content Roadmap ({entries.length} Topics)</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">High-level editorial strategy calendar</p>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No planned calendar entries.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 bg-white border border-[#E8E6DF] rounded-xl hover:border-[#71A832] transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="brand" size="sm">{entry.platform}</Badge>
                      <span className="text-[11px] font-bold text-gray-500">
                        {new Date(entry.scheduledDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-gray-900">{entry.title}</h5>
                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                      <span>Format: {entry.contentType}</span>
                      <span className="text-[#71A832] font-semibold">{entry.status}</span>
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
