import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { processVideoRepurposing, VideoProcessingInput } from "@/services/videoService";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const {
      originalVideoTitle,
      targetPlatforms,
      desiredClipCount,
      preferredClipDurationSec,
      aspectRatio,
      subtitleLanguage,
      editingInstructions,
      videoFileUrl,
    } = body;

    if (!originalVideoTitle || !editingInstructions) {
      return errorResponse("Original video title and editing instructions are required.");
    }

    const inputData: VideoProcessingInput = {
      videoFileUrl: videoFileUrl || "/uploads/demo-sample-video.mp4",
      originalVideoTitle,
      targetPlatforms: targetPlatforms && targetPlatforms.length > 0 ? targetPlatforms : ["TIKTOK", "INSTAGRAM"],
      desiredClipCount: desiredClipCount ? parseInt(desiredClipCount) : 2,
      preferredClipDurationSec: preferredClipDurationSec ? parseInt(preferredClipDurationSec) : 45,
      aspectRatio: aspectRatio || "9:16",
      subtitleLanguage: subtitleLanguage || "English",
      editingInstructions,
    };

    // Step 2: Create persistent AutomationRun record (RUNNING)
    const run = await prisma.automationRun.create({
      data: {
        workspaceId: auth.workspace.id,
        module: "VIDEO",
        status: "RUNNING",
        currentStep: "Translating natural language instructions into validated edit plan",
        inputSummary: `${inputData.originalVideoTitle} (${inputData.aspectRatio}, ${inputData.desiredClipCount} clips)`,
        inputsJson: JSON.stringify(inputData),
      },
    });

    // Step 3: Execute service
    const videoResult = await processVideoRepurposing(inputData);

    // Step 4: Persist ContentAsset and ContentVersion (v1)
    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: auth.workspace.id,
        title: `${inputData.originalVideoTitle} — Derived Clips`,
        contentType: "VIDEO_CLIP",
        status: "IN_REVIEW",
        currentVersion: 1,
        mediaUrl: inputData.videoFileUrl,
        metadata: JSON.stringify({
          aspectRatio: inputData.aspectRatio,
          clipCount: videoResult.candidateClips.length,
          ffmpegAvailable: videoResult.ffmpegAvailable,
        }),
      },
    });

    const version = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 1,
        title: asset.title,
        contentJson: JSON.stringify(videoResult),
        summary: `Extracted ${videoResult.candidateClips.length} candidate clips with validated ${videoResult.editPlan.length}-step edit plan.`,
        qualityWarnings: videoResult.warnings ? JSON.stringify(videoResult.warnings) : null,
        changeReason: "INITIAL",
        createdById: auth.user.id,
      },
    });

    // Step 5: Approval gate
    await prisma.approval.create({
      data: {
        runId: run.id,
        assetId: asset.id,
        versionId: version.id,
        decision: "PENDING",
      },
    });

    const updatedRun = await prisma.automationRun.update({
      where: { id: run.id },
      data: {
        status: "AWAITING_APPROVAL",
        currentStep: "Awaiting Human Review of Planned Edits",
        assetId: asset.id,
        outputsJson: JSON.stringify({
          clipsCount: videoResult.candidateClips.length,
          ffmpegAvailable: videoResult.ffmpegAvailable,
        }),
        isDemoResult: videoResult.isDemoResult,
      },
    });

    await prisma.notification.create({
      data: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        type: "APPROVAL_NEEDED",
        title: "Video Edit Plan Ready for Review",
        message: `${videoResult.candidateClips.length} clips generated for "${inputData.originalVideoTitle}".`,
        link: "/automations/video",
      },
    });

    return successResponse({
      runId: updatedRun.id,
      assetId: asset.id,
      versionId: version.id,
      versionNumber: 1,
      totalVersions: 1,
      title: asset.title,
      module: "VIDEO",
      status: updatedRun.status,
      approvalDecision: "PENDING",
      summary: `Prepared ${videoResult.candidateClips.length} vertical clips based on your editing instructions.`,
      content: videoResult,
      qualityWarnings: videoResult.warnings,
      settingsUsed: inputData,
      isDemoResult: videoResult.isDemoResult,
    });
  } catch (error: any) {
    console.error("Video repurposing error:", error);
    return errorResponse(error.message || "Failed to process video repurposing", 500);
  }
}
