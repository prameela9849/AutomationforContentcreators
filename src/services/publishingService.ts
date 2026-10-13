import prisma from "@/lib/prisma";

export interface PublishingInput {
  workspaceId: string;
  assetId: string;
  platform: "YOUTUBE" | "LINKEDIN" | "INSTAGRAM" | "TIKTOK" | "TWITTER";
  accountName?: string;
  caption: string;
  mediaUrl?: string;
  scheduledFor: Date | string;
  timeZone?: string;
  isImmediatePublish?: boolean;
}

export interface PlatformValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  characterCount: number;
  maxCharacters: number;
}

export function validatePlatformRules(
  platform: string,
  caption: string,
  mediaUrl?: string
): PlatformValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const charLen = caption ? caption.length : 0;
  let maxChars = 2000;

  switch (platform) {
    case "TWITTER":
      maxChars = 280;
      if (charLen > 280) {
        errors.push(`Twitter/X posts are capped at 280 characters (current: ${charLen}).`);
      }
      break;
    case "LINKEDIN":
      maxChars = 3000;
      if (charLen > 3000) {
        errors.push(`LinkedIn posts cannot exceed 3,000 characters (current: ${charLen}).`);
      }
      if (charLen < 50) {
        warnings.push("Short posts on LinkedIn typically experience lower algorithmic distribution.");
      }
      break;
    case "INSTAGRAM":
      maxChars = 2200;
      if (charLen > 2200) {
        errors.push(`Instagram captions cannot exceed 2,200 characters (current: ${charLen}).`);
      }
      const hashtags = (caption.match(/#[a-zA-Z0-9_]+/g) || []).length;
      if (hashtags > 30) {
        errors.push(`Instagram allows a maximum of 30 hashtags (found: ${hashtags}).`);
      }
      break;
    case "YOUTUBE":
      maxChars = 5000;
      if (charLen > 5000) {
        errors.push(`YouTube descriptions cannot exceed 5,000 characters (current: ${charLen}).`);
      }
      break;
    case "TIKTOK":
      maxChars = 2200;
      if (charLen > 2200) {
        errors.push(`TikTok captions cannot exceed 2,200 characters.`);
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    characterCount: charLen,
    maxCharacters: maxChars,
  };
}

export async function schedulePublication(input: PublishingInput) {
  const validation = validatePlatformRules(input.platform, input.caption, input.mediaUrl);
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join("; ")}`);
  }

  const scheduledDate = new Date(input.scheduledFor);
  const dateBucket = scheduledDate.toISOString().slice(0, 16); // Minute resolution
  const idempotencyKey = `pub-${input.workspaceId}-${input.assetId}-${input.platform}-${dateBucket}`;

  // Check for duplicate scheduling
  const existing = await prisma.scheduledPublication.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    throw new Error(`Duplicate publication blocked: this asset is already scheduled for ${input.platform} at ${dateBucket}.`);
  }

  // Check platform connection
  const connection = await prisma.platformConnection.findFirst({
    where: {
      workspaceId: input.workspaceId,
      platform: input.platform,
    },
  });

  const isConnected = connection && connection.status === "CONNECTED";

  // Create scheduled record
  const scheduledPost = await prisma.scheduledPublication.create({
    data: {
      workspaceId: input.workspaceId,
      assetId: input.assetId,
      platform: input.platform,
      accountName: input.accountName || connection?.accountName || "Default Account",
      caption: input.caption,
      mediaUrl: input.mediaUrl,
      scheduledFor: scheduledDate,
      timeZone: input.timeZone || "UTC",
      status: input.isImmediatePublish ? (isConnected ? "PUBLISHED" : "FAILED") : "SCHEDULED",
      externalPostId: input.isImmediatePublish && isConnected ? `ext-${Date.now()}` : null,
      failureReason: input.isImmediatePublish && !isConnected ? "Platform account not connected with active OAuth token." : null,
      idempotencyKey,
    },
  });

  // Create content calendar entry
  await prisma.contentCalendarEntry.create({
    data: {
      workspaceId: input.workspaceId,
      assetId: input.assetId,
      title: `${input.platform}: ${input.caption.slice(0, 40)}...`,
      platform: input.platform,
      contentType: "SCHEDULED_POST",
      scheduledDate,
      status: input.isImmediatePublish ? "PUBLISHED" : "PLANNED",
      colorCode: input.platform === "YOUTUBE" ? "#FF0000" : input.platform === "LINKEDIN" ? "#0A66C2" : "#71A832",
    },
  });

  return {
    scheduledPost,
    validation,
    isConnected,
  };
}
