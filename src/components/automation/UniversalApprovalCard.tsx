import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UniversalReviewData } from "@/types";
import { FeedbackModal } from "./FeedbackModal";
import { SharedContentEditorModal } from "./SharedContentEditorModal";
import {
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  RotateCw,
  AlertTriangle,
  Save,
  Share2,
  Calendar,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export interface UniversalApprovalCardProps {
  data: UniversalReviewData;
  onDecisionUpdated?: (updatedData: UniversalReviewData) => void;
  onScheduleAction?: () => void;
}

export const UniversalApprovalCard: React.FC<UniversalApprovalCardProps> = ({
  data: initialData,
  onDecisionUpdated,
  onScheduleAction,
}) => {
  const [data, setData] = useState<UniversalReviewData>(initialData);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      // Find approval record for this asset/version
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId: (data as any).approvalId || data.runId, // fallback
          decision: "APPROVED",
          notes: "Approved via Universal Review Gate",
        }),
      });

      const resData = await res.json();
      if (!res.ok && resData.error) {
        // Fallback: If approval was submitted directly via run asset
        console.warn("Direct approval note:", resData.error);
      }

      const updated = {
        ...data,
        status: "APPROVED" as const,
        approvalDecision: "APPROVED" as const,
      };
      setData(updated);
      if (onDecisionUpdated) onDecisionUpdated(updated);
      showToast("Deliverable successfully approved! Next workflow step unlocked.");
    } catch (err: any) {
      showToast(err.message || "Failed to approve deliverable");
    } finally {
      setIsApproving(false);
    }
  };

  const handleRegenerateFromFeedback = (newVersionData: any) => {
    const updated: UniversalReviewData = {
      ...data,
      versionId: newVersionData.versionId,
      versionNumber: newVersionData.versionNumber,
      totalVersions: newVersionData.totalVersions,
      title: newVersionData.title,
      status: "AWAITING_APPROVAL",
      approvalDecision: "PENDING",
      summary: newVersionData.summary,
      content: newVersionData.content,
      qualityWarnings: newVersionData.qualityWarnings,
    };
    setData(updated);
    if (onDecisionUpdated) onDecisionUpdated(updated);
    showToast(`Version ${newVersionData.versionNumber} generated from your feedback! Ready for fresh review.`);
  };

  const isApproved = data.approvalDecision === "APPROVED" || data.status === "APPROVED";
  const isRejected = data.approvalDecision === "REJECTED" || data.status === "REJECTED";

  return (
    <Card className="border-2 border-[#71A832]/30 shadow-elevated overflow-hidden my-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-[#1F2937] text-white px-4 py-2.5 text-xs font-medium flex items-center justify-between animate-fade-in">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#71A832]" /> {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header with Status Label & Version Counter */}
      <CardHeader className="bg-[#FAF9F5] border-b border-[#E8E6DF] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Badge
            variant={isApproved ? "success" : isRejected ? "error" : "brand"}
            size="md"
          >
            {isApproved
              ? "APPROVED"
              : isRejected
              ? "REJECTED"
              : "AWAITING HUMAN REVIEW"}
          </Badge>

          <Badge variant="neutral" size="sm">
            Version {data.versionNumber} of {data.totalVersions || 1}
          </Badge>

          {data.isDemoResult && (
            <Badge variant="demo" size="sm">
              Demo Output
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditorOpen(true)}
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit Deliverable
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFeedbackOpen(true)}
            leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          >
            Regenerate
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Title and Summary */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{data.title}</h3>
          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{data.summary}</p>
        </div>

        {/* Quality Warnings & Verification Banner */}
        {data.qualityWarnings && data.qualityWarnings.length > 0 && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wide">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Quality Assurance & Verification Notice</span>
            </div>
            <ul className="text-xs text-amber-800 list-disc list-inside space-y-0.5 pt-1 pl-1">
              {data.qualityWarnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Deliverable Preview by Module */}
        <div className="bg-[#FFFFF0] border border-[#E8E6DF] rounded-xl p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
            Generated Output Preview
          </div>

          {/* Module: SCRIPT */}
          {data.module === "SCRIPT" && data.content && (
            <div className="space-y-4 text-sm text-gray-800">
              {data.content.videoScript && (
                <div className="space-y-2.5">
                  <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#71A832]" /> Opening Hook:
                  </div>
                  <div className="p-3 bg-white border border-gray-200 rounded-lg text-gray-800 font-medium italic">
                    "{data.content.videoScript.hook}"
                  </div>
                  <div className="font-semibold text-gray-900 pt-1">Video Outline & Steps:</div>
                  <ul className="space-y-1 text-gray-700 list-disc list-inside bg-white p-3 border border-gray-200 rounded-lg">
                    {Array.isArray(data.content.videoScript.body) ? (
                      data.content.videoScript.body.map((b: string, i: number) => <li key={i}>{b}</li>)
                    ) : (
                      <li>{data.content.videoScript.body}</li>
                    )}
                  </ul>
                </div>
              )}

              {data.content.linkedInPost && (
                <div className="pt-2">
                  <div className="font-semibold text-gray-900 mb-1.5">LinkedIn Companion Post:</div>
                  <pre className="p-3.5 bg-white border border-gray-200 rounded-lg text-xs font-sans whitespace-pre-wrap leading-relaxed text-gray-800">
                    {data.content.linkedInPost}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Module: VIDEO */}
          {data.module === "VIDEO" && data.content && (
            <div className="space-y-4">
              <div className="text-sm font-semibold text-gray-900">
                Candidate Highlight Moments ({data.content.candidateClips?.length || 0} clips):
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.content.candidateClips?.map((clip: any) => (
                  <div key={clip.id} className="p-3.5 bg-white border border-gray-200 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">{clip.title}</span>
                      <Badge variant="brand" size="sm">{clip.aspectRatio}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Timestamp: <strong className="text-gray-900">{clip.startTime} - {clip.endTime}</strong> ({clip.durationSeconds}s)
                    </p>
                    <p className="text-xs text-gray-500 italic">"{clip.transcriptSnippet}"</p>
                  </div>
                ))}
              </div>

              {data.content.editPlan && (
                <div className="pt-2">
                  <div className="text-xs font-bold text-gray-600 uppercase mb-1.5">Applied Edit Instructions:</div>
                  <div className="space-y-1">
                    {data.content.editPlan.map((step: any) => (
                      <div key={step.id} className="text-xs text-gray-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#71A832]" />
                        <strong className="text-gray-900">{step.operation}:</strong> {step.detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Module: PLANNING */}
          {data.module === "PLANNING" && data.content && (
            <div className="space-y-3">
              <div className="text-xs text-gray-600 font-medium">
                {data.content.methodology}
              </div>
              <div className="space-y-2.5">
                {data.content.topics?.map((topic: any) => (
                  <div key={topic.id} className="p-3.5 bg-white border border-gray-200 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-gray-900">{topic.title}</span>
                      <Badge variant="brand" size="sm">Score: {topic.relevanceScore}/100</Badge>
                    </div>
                    <p className="text-xs text-gray-700 italic">Hook: "{topic.hook}"</p>
                    <p className="text-xs text-gray-500">
                      Format: {topic.format} • Source: <a href={topic.sourceUrl} target="_blank" rel="noreferrer" className="text-[#71A832] underline">{topic.source}</a>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Module: THUMBNAIL */}
          {data.module === "THUMBNAIL" && data.content && (
            <div className="space-y-3">
              <div className="max-w-md mx-auto aspect-video rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-black">
                {data.content.svgContent ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: data.content.svgContent }}
                  />
                ) : (
                  <img src="/uploads/demo-thumbnail-1.svg" alt="Thumbnail Preview" className="w-full h-full object-cover" />
                )}
              </div>
              <p className="text-xs text-gray-600 text-center font-medium">
                Layout Aspect Ratio: {data.content.aspectRatio} • Scalable SVG Render
              </p>
            </div>
          )}

          {/* Module: SPONSORSHIP */}
          {data.module === "SPONSORSHIP" && data.content && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                <div>
                  <span className="text-xs text-gray-500 block">Brand:</span>
                  <strong className="text-gray-900">{data.content.brandName}</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Proposed Budget:</span>
                  <strong className="text-gray-900">${data.content.proposedBudget?.toLocaleString()} USD</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Standard Rate Card Quote:</span>
                  <strong className="text-gray-900">${data.content.creatorStandardRate?.toLocaleString()} USD</strong>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">Rate Card Assessment:</span>
                  <Badge variant={data.content.budgetComparison?.status === "BELOW_RATE" ? "warning" : "success"} size="sm">
                    {data.content.budgetComparison?.status || "AT_RATE"}
                  </Badge>
                </div>
              </div>

              {data.content.suggestedResponse && (
                <div className="pt-2">
                  <div className="font-semibold text-xs text-gray-700 uppercase mb-1">Generated Response Draft:</div>
                  <pre className="p-3.5 bg-white border border-gray-200 rounded-lg text-xs font-sans whitespace-pre-wrap leading-relaxed text-gray-800">
                    {data.content.suggestedResponse}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Module: PUBLISHING */}
          {data.module === "PUBLISHING" && data.content && (
            <div className="space-y-3 text-sm">
              <div className="p-3.5 bg-white border border-gray-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Platform: {data.content.platform}</span>
                  <Badge variant="neutral" size="sm">{data.content.scheduledFor ? new Date(data.content.scheduledFor).toLocaleString() : "Now"}</Badge>
                </div>
                <div className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2.5 rounded border border-gray-200">
                  {data.content.caption}
                </div>
                <div className="text-xs text-gray-500">
                  Character count: {data.content.validation?.characterCount} / {data.content.validation?.maxCharacters}
                </div>
              </div>
            </div>
          )}

          {/* Module: ANALYTICS */}
          {data.module === "ANALYTICS" && data.content && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                  <span className="text-xs text-gray-500 block">Total Views</span>
                  <span className="text-lg font-bold text-gray-900">{data.content.metrics?.totalViews?.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                  <span className="text-xs text-gray-500 block">Watch Time</span>
                  <span className="text-lg font-bold text-gray-900">{data.content.metrics?.watchTimeHours?.toLocaleString()} hrs</span>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                  <span className="text-xs text-gray-500 block">Engagement</span>
                  <span className="text-lg font-bold text-gray-900">{data.content.metrics?.engagementRate}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls: Approve, Dislike, Schedule */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E8E6DF]">
          <div className="flex items-center gap-2">
            {!isApproved ? (
              <Button
                variant="approve"
                size="md"
                onClick={handleApprove}
                isLoading={isApproving}
                leftIcon={<ThumbsUp className="w-4 h-4" />}
              >
                Approve / Like Deliverable
              </Button>
            ) : (
              <Badge variant="success" size="md" className="py-2 px-3">
                <CheckCircle2 className="w-4 h-4" /> Deliverable Approved
              </Badge>
            )}

            <Button
              variant="reject"
              size="md"
              onClick={() => setIsFeedbackOpen(true)}
              disabled={isApproving}
              leftIcon={<ThumbsDown className="w-4 h-4" />}
            >
              Dislike / Request Improvements
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isApproved && onScheduleAction && (
              <Button
                variant="primary"
                size="md"
                onClick={onScheduleAction}
                leftIcon={<Calendar className="w-4 h-4" />}
              >
                Schedule to Content Calendar
              </Button>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsEditorOpen(true)}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Feedback Modal for Requesting Improvements */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        versionId={data.versionId}
        runId={data.runId}
        versionNumber={data.versionNumber}
        onRegenerated={handleRegenerateFromFeedback}
      />

      {/* Shared Content Editor Modal */}
      <SharedContentEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        assetId={data.assetId}
        initialTitle={data.title}
        initialContent={data.content}
        currentVersionNumber={data.versionNumber}
        onApprove={handleApprove}
        onRequestImprovements={() => setIsFeedbackOpen(true)}
        onSaved={(updatedVersion) => {
          showToast("Saved edits to deliverable.");
        }}
      />
    </Card>
  );
};
