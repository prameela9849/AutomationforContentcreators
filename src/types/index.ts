export type AutomationModuleType =
  | "PLANNING"
  | "VIDEO"
  | "PUBLISHING"
  | "ANALYTICS"
  | "SPONSORSHIP"
  | "THUMBNAIL"
  | "SCRIPT";

export type AutomationRunStatus =
  | "QUEUED"
  | "RUNNING"
  | "AWAITING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type ApprovalDecision = "PENDING" | "APPROVED" | "REJECTED";

export type ContentAssetType =
  | "PLAN"
  | "VIDEO_CLIP"
  | "SCHEDULED_POST"
  | "REPORT"
  | "SPONSOR_DEAL"
  | "GRAPHIC"
  | "SCRIPT";

export type FeedbackReason =
  | "INCORRECT_INFO"
  | "POOR_QUALITY"
  | "WRONG_TONE"
  | "NOT_RELEVANT"
  | "INCORRECT_FORMAT"
  | "MISSING_DETAILS"
  | "DOES_NOT_MATCH_BRAND"
  | "OTHER";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
  workspace?: {
    id: string;
    name: string;
    slug: string;
    creatorProfile?: any;
    brandKit?: any;
  };
}

export interface UniversalReviewData {
  runId: string;
  assetId: string;
  versionId: string;
  versionNumber: number;
  totalVersions: number;
  title: string;
  module: AutomationModuleType;
  status: AutomationRunStatus;
  approvalDecision: ApprovalDecision;
  summary: string;
  content: any;
  qualityWarnings?: string[];
  settingsUsed: Record<string, any>;
  previewUrl?: string;
  isDemoResult?: boolean;
}
