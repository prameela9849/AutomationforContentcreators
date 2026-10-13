import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FeedbackReason } from "@/types";
import { AlertCircle, Sparkles } from "lucide-react";

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  versionId: string;
  runId?: string;
  versionNumber: number;
  onRegenerated: (newVersionData: any) => void;
}

const REASONS: { key: FeedbackReason; label: string }[] = [
  { key: "WRONG_TONE", label: "Wrong tone or style" },
  { key: "POOR_QUALITY", label: "Poor quality output" },
  { key: "NOT_RELEVANT", label: "Not relevant to my audience" },
  { key: "INCORRECT_INFO", label: "Incorrect information" },
  { key: "MISSING_DETAILS", label: "Missing important details" },
  { key: "DOES_NOT_MATCH_BRAND", label: "Does not match my brand" },
  { key: "INCORRECT_FORMAT", label: "Incorrect format" },
  { key: "OTHER", label: "Other" },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  versionId,
  runId,
  versionNumber,
  onRegenerated,
}) => {
  const [selectedReason, setSelectedReason] = useState<FeedbackReason>("WRONG_TONE");
  const [explanation, setExplanation] = useState("");
  const [specificImprovements, setSpecificImprovements] = useState("");
  const [referenceMaterial, setReferenceMaterial] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim() || !specificImprovements.trim()) {
      setError("Please provide both an explanation and specific improvement instructions.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId,
          runId,
          reason: selectedReason,
          explanation: explanation.trim(),
          specificImprovements: specificImprovements.trim(),
          referenceMaterial: referenceMaterial.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process feedback regeneration");
      }

      onRegenerated(data);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Request Improvements for Version ${versionNumber}`}
      description="Tell the AI engine what needs to be improved. Previous versions are strictly preserved in history."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Why was this result unsatisfactory? <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {REASONS.map((r) => (
              <button
                type="button"
                key={r.key}
                onClick={() => setSelectedReason(r.key)}
                className={`flex items-center px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                  selectedReason === r.key
                    ? "border-[#71A832] bg-[#F4F8EC] text-[#45691C] font-semibold"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Detailed Issue Explanation <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain specifically what was missing or unsatisfactory in this draft..."
            className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            What Specifically Should Be Improved? <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            value={specificImprovements}
            onChange={(e) => setSpecificImprovements(e.target.value)}
            placeholder="e.g. 'Strengthen opening hook with concrete metrics, add 3 bullet points on the silence removal step, and use shorter punchy sentences.'"
            className="w-full text-sm p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            Optional Reference Material or Examples
          </label>
          <input
            type="text"
            value={referenceMaterial}
            onChange={(e) => setReferenceMaterial(e.target.value)}
            placeholder="Links or reference notes to guide the rewrite..."
            className="w-full text-sm p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate Improved Version
          </Button>
        </div>
      </form>
    </Modal>
  );
};
