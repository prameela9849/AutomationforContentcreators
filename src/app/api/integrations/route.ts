import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { getAIProviderStatus } from "@/services/aiProvider";
import { checkFFmpegInstalled } from "@/services/videoService";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const connections = await prisma.platformConnection.findMany({
      where: { workspaceId: auth.workspace.id },
    });

    const aiStatus = getAIProviderStatus();
    const ffmpegInstalled = await checkFFmpegInstalled();

    const integrations = [
      {
        id: "ai_provider",
        name: "AI LLM Provider",
        type: "AI_MODEL",
        status: aiStatus.isConfigured ? "CONNECTED" : "DEMO_MODE",
        activeModel: aiStatus.modelName,
        details: aiStatus.isConfigured
          ? `Configured via environment variables (${aiStatus.activeProvider.toUpperCase()}).`
          : "Operating in built-in deterministic demo mode. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY to switch to live LLM.",
        requiredScopes: ["chat.completions"],
        isConfigured: aiStatus.isConfigured,
      },
      {
        id: "ffmpeg_video",
        name: "FFmpeg Media Processor",
        type: "VIDEO_PROCESSING",
        status: ffmpegInstalled ? "CONNECTED" : "NOT_CONFIGURED",
        activeModel: ffmpegInstalled ? "Local System FFmpeg (Hardware accelerated)" : "None",
        details: ffmpegInstalled
          ? "FFmpeg binary discovered in host PATH. Full rendering enabled."
          : "FFmpeg not detected in PATH. CreatorFlow operates in Edit-Plan simulation mode with clear disclosures.",
        requiredScopes: ["exec:ffmpeg"],
        isConfigured: ffmpegInstalled,
      },
      {
        id: "storage_provider",
        name: "Media Object Storage",
        type: "STORAGE",
        status: "CONNECTED",
        activeModel: "Local Persistent Disk Storage (/public/uploads)",
        details: "Storing media clips, SVGs, and thumbnails in local persistent storage.",
        requiredScopes: ["read", "write"],
        isConfigured: true,
      },
      ...connections.map((c) => ({
        id: c.id,
        platformKey: c.platform,
        name: c.platform === "YOUTUBE" ? "YouTube Channel" : c.platform === "LINKEDIN" ? "LinkedIn Profile" : c.platform === "INSTAGRAM" ? "Instagram Business" : c.platform === "TIKTOK" ? "TikTok Creator" : "Twitter / X",
        type: "SOCIAL_PLATFORM",
        status: c.status,
        accountName: c.accountName,
        lastSyncedAt: c.lastSyncedAt,
        permissions: c.permissions ? JSON.parse(c.permissions) : [],
        isConfigured: c.status === "CONNECTED",
      })),
    ];

    return successResponse({ integrations, aiStatus, ffmpegInstalled });
  } catch (error: any) {
    console.error("Integrations fetch error:", error);
    return errorResponse(error.message || "Failed to fetch integrations", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { platform, action, accountName } = body; // action: "CONNECT" | "DISCONNECT"

    if (!platform || !action) {
      return errorResponse("Platform and action are required");
    }

    const existing = await prisma.platformConnection.findFirst({
      where: {
        workspaceId: auth.workspace.id,
        platform,
      },
    });

    if (action === "DISCONNECT") {
      if (existing) {
        await prisma.platformConnection.update({
          where: { id: existing.id },
          data: {
            status: "DISCONNECTED",
          },
        });
      }
      return successResponse({ message: `${platform} disconnected successfully` });
    }

    if (action === "CONNECT") {
      if (existing) {
        await prisma.platformConnection.update({
          where: { id: existing.id },
          data: {
            status: "CONNECTED",
            accountName: accountName || existing.accountName,
            lastSyncedAt: new Date(),
          },
        });
      } else {
        await prisma.platformConnection.create({
          data: {
            workspaceId: auth.workspace.id,
            platform,
            accountName: accountName || `${auth.user.name} (${platform})`,
            status: "CONNECTED",
            lastSyncedAt: new Date(),
          },
        });
      }
      return successResponse({ message: `${platform} connected successfully` });
    }

    return errorResponse("Invalid action specified");
  } catch (error: any) {
    console.error("Integrations action error:", error);
    return errorResponse(error.message || "Failed to modify integration", 500);
  }
}
