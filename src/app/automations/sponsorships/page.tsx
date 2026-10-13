"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversalApprovalCard } from "@/components/automation/UniversalApprovalCard";
import { UniversalReviewData } from "@/types";
import {
  DollarSign,
  Mail,
  FileCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function SponsorshipPage() {
  const [inquiryText, setInquiryText] = useState(
    "Hi Alex,\n\nWe love your recent video on multi-agent creator workflows. Our team at CloudScale AI is launching an automated backend engine next month and we'd love to partner with you for an integrated 60-second video sponsor segment on your YouTube channel, plus an in-depth companion post on your LinkedIn.\n\nWe have a proposed budget of $3,200 for this package. We'd need the video to air before November 20th, and we are requesting 90-day organic social usage rights.\n\nLet us know if you have availability!\n\nBest regards,\nSarah Jenkins\nHead of Partnerships at CloudScale AI (sarah.j@cloudscale.io)"
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewData, setReviewData] = useState<UniversalReviewData | null>(null);
  const [leads, setLeads] = useState<any[]>([]);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/automations/sponsorships");
      const data = await res.json();
      if (data.success && data.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryText.trim()) {
      setError("Please paste a sponsor inquiry email or brief.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/automations/sponsorships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInquiryText: inquiryText,
          source: "EMAIL_IMPORT",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process sponsorship inquiry");
      }

      setReviewData(data);
      fetchLeads();
    } catch (err: any) {
      setError(err.message || "Failed to parse sponsor inquiry");
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
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#71A832] uppercase tracking-wider">
                  Automation Module 5
                </span>
                <Badge variant="brand" size="sm">Rate Card Comparison & Negotiation</Badge>
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
                Sponsorship & Brand Deal Management
              </h1>
              <p className="text-sm text-gray-500 mt-1 max-w-2xl">
                Parse incoming brand emails, extract requested deliverables and budgets, compare against your saved creator rate card, and draft high-converting negotiation responses.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form Card */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Step 1: Paste Inbound Brand Email or Campaign Brief</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Natural language parser extracts deliverables, proposed budget, timeline, and usage rights.
            </p>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Raw Brand Inquiry Text / Email <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={8}
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="Paste email from prospective sponsor..."
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none font-mono text-gray-800 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-gray-500">
                  Creator standard rate card: Dedicated Video $2,800 • Integrated Segment $1,400 • LinkedIn Post $750
                </span>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  leftIcon={<Sparkles className="w-5 h-5" />}
                >
                  Extract Terms & Draft Negotiation Response
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Universal Human Approval Gate */}
        {reviewData && (
          <div>
            <div className="text-xs font-bold text-[#71A832] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Sponsor Deal Memo Sign-off Gate
            </div>
            <UniversalApprovalCard
              data={reviewData}
              onDecisionUpdated={(updated) => setReviewData(updated)}
            />
          </div>
        )}

        {/* Active Sponsorship Pipeline & Deliverables Tracker */}
        <Card className="border-[#E8E6DF]">
          <CardHeader>
            <CardTitle>Active Sponsorship Pipeline ({leads.length} Deals)</CardTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Track negotiation stages, contracts, invoices, and campaign deliverables.
            </p>
          </CardHeader>

          <CardContent>
            {leads.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No sponsorship deals recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 bg-white border border-[#E8E6DF] rounded-xl hover:border-[#71A832] transition-colors space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-bold text-gray-900">{lead.brandName}</span>
                        <Badge
                          variant={
                            lead.stage === "SIGNED" || lead.stage === "COMPLETED"
                              ? "success"
                              : lead.stage === "NEGOTIATING"
                              ? "brand"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {lead.stage}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-gray-900">
                          ${lead.proposedBudget?.toLocaleString()} {lead.currency}
                        </span>
                        <span className="text-xs text-gray-400">
                          Contact: {lead.contactName || "Team"} ({lead.contactEmail || "N/A"})
                        </span>
                      </div>
                    </div>

                    {lead.deliverables && lead.deliverables.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                          Campaign Deliverables ({lead.deliverables.length}):
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {lead.deliverables.map((del: any) => (
                            <div
                              key={del.id}
                              className="p-2.5 bg-[#FAF9F5] border border-gray-200 rounded-lg text-xs flex items-center justify-between"
                            >
                              <span className="font-semibold text-gray-800">{del.title}</span>
                              <Badge variant="neutral" size="sm">{del.status}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
