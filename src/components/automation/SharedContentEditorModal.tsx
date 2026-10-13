import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Copy, Download, Save, Check, History, AlertTriangle } from "lucide-react";

export interface SharedContentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
  initialTitle: string;
  initialContent: any;
  currentVersionNumber: number;
  onSaved?: (updatedVersion: any) => void;
  onApprove?: () => void;
  onRequestImprovements?: () => void;
}

export const SharedContentEditorModal: React.FC<SharedContentEditorModalProps> = ({
  isOpen,
  onClose,
  assetId,
  initialTitle,
  initialContent,
  currentVersionNumber,
  onSaved,
  onApprove,
  onRequestImprovements,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [contentText, setContentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    setTitle(initialTitle);
    if (typeof initialContent === "string") {
      setContentText(initialContent);
    } else if (initialContent?.linkedInPost || initialContent?.videoScript) {
      setContentText(
        initialContent.videoScript?.hook
          ? `[HOOK]\n${initialContent.videoScript.hook}\n\n[INTRO]\n${initialContent.videoScript.intro}\n\n[BODY]\n${Array.isArray(initialContent.videoScript.body) ? initialContent.videoScript.body.join("\n") : initialContent.videoScript.body}\n\n[CTA]\n${initialContent.videoScript.cta}`
          : JSON.stringify(initialContent, null, 2)
      );
    } else {
      setContentText(JSON.stringify(initialContent, null, 2));
    }
    setIsDirty(false);
    setSaveStatus("idle");
  }, [initialTitle, initialContent, isOpen]);

  // Fetch full version history when opened
  useEffect(() => {
    if (isOpen && assetId) {
      fetch(`/api/assets/${assetId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.asset?.versions) {
            setVersions(data.asset.versions);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, assetId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContentText(e.target.value);
    setIsDirty(true);
    setSaveStatus("idle");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
    setSaveStatus("idle");
  };

  const handleSave = async (asNewVersion = false) => {
    setIsSaving(true);
    setSaveStatus("saving");

    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          contentJson: contentText,
          summary: "Manual edits in shared editor",
          saveAsNewVersion: asNewVersion,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save edits");
      }

      setSaveStatus("saved");
      setIsDirty(false);
      if (onSaved) onSaved(data.version);
    } catch (err) {
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(contentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: "txt" | "json") => {
    const blob = new Blob([contentText], {
      type: format === "json" ? "application/json" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Shared Content Editor"
      description={`Refine deliverable draft • Currently on Version ${currentVersionNumber}`}
      maxWidth="4xl"
    >
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Deliverable Title
          </label>
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="w-full text-base font-semibold px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none"
          />
        </div>

        {/* Toolbar & Version Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
              <History className="w-3.5 h-3.5" /> Versions:
            </span>
            <div className="flex items-center gap-1">
              {versions.length > 0 ? (
                versions.map((v) => (
                  <Badge
                    key={v.id}
                    variant={v.versionNumber === currentVersionNumber ? "brand" : "neutral"}
                    size="sm"
                  >
                    v{v.versionNumber} {v.changeReason === "REGENERATION_AFTER_FEEDBACK" && "✨"}
                  </Badge>
                ))
              ) : (
                <Badge variant="brand" size="sm">v{currentVersionNumber}</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveStatus === "saving" && (
              <span className="text-xs text-amber-700 animate-pulse font-medium">Saving changes...</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="text-xs text-rose-700 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Save failed
              </span>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? "Copied" : "Copy Text"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleExport("txt")}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Button>
          </div>
        </div>

        {/* Main Editor Textarea */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Deliverable Body & Content
          </label>
          <textarea
            rows={14}
            value={contentText}
            onChange={handleTextChange}
            className="w-full text-sm font-mono p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#71A832] focus:border-transparent outline-none leading-relaxed"
            placeholder="Edit deliverable body text here..."
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => handleSave(false)}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              Save as New Version (v{currentVersionNumber + 1})
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {onRequestImprovements && (
              <Button
                type="button"
                variant="reject"
                size="sm"
                onClick={() => {
                  onClose();
                  onRequestImprovements();
                }}
              >
                Dislike / Request Improvements
              </Button>
            )}
            {onApprove && (
              <Button
                type="button"
                variant="approve"
                size="sm"
                onClick={() => {
                  onClose();
                  onApprove();
                }}
              >
                Approve Deliverable
              </Button>
            )}
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
