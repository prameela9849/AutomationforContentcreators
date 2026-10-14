import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { generateScriptAndCaptions } from "@/services/scriptService";
import { runContentPlanning } from "@/services/planningService";
import { processVideoRepurposing } from "@/services/videoService";
import { generateThumbnailGraphic } from "@/services/thumbnailService";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { versionId, runId, reason, explanation, specificImprovements, referenceMaterial } = body;

    if (!versionId || !reason || !explanation || !specificImprovements) {
      return errorResponse("Version ID, feedback reason, explanation, and specific improvements are required.");
    }

    const version = await prisma.contentVersion.findUnique({
      where: { id: versionId },
      include: {
        asset: true,
      },
    });

    if (!version || version.asset.workspaceId !== auth.workspace.id) {
      return errorResponse("Content version not found or unauthorized.", 404);
    }

    // 1. Save Feedback record referencing exact version
    const feedback = await prisma.feedback.create({
      data: {
        versionId: version.id,
        runId: runId || null,
        reason,
        explanation,
        specificImprovements,
        referenceMaterial: referenceMaterial || null,
      },
    });

    // 2. Fetch AutomationRun or recreate context
    let run = runId ? await prisma.automationRun.findUnique({ where: { id: runId } }) : null;
    let inputs: any = {};
    if (run?.inputsJson) {
      try {
        inputs = JSON.parse(run.inputsJson);
      } catch (e) {
        inputs = {};
      }
    }

    const previousContent = JSON.parse(version.contentJson);
    let improvedContent: any = null;
    let improvedSummary = `Improved version based on feedback: ${specificImprovements}`;
    let qualityWarnings: string[] | undefined = undefined;

    // 3. Generate improved version based on module
    const moduleType = run?.module || (version.asset.contentType === "SCRIPT" ? "SCRIPT" : "PLANNING");

    if (moduleType === "SCRIPT") {
      const regenerated = await generateScriptAndCaptions(
        {
          topic: inputs.topic || version.asset.title,
          targetAudience: inputs.targetAudience || "General Creators",
          platform: inputs.platform || "CROSS_PLATFORM",
          toneOfVoice: inputs.toneOfVoice,
          mainObjective: inputs.mainObjective,
          callToAction: inputs.callToAction,
        },
        {
          previousOutput: previousContent,
          reason,
          explanation,
          specificImprovements,
        }
      );
      improvedContent = regenerated.data;
      improvedSummary = regenerated.summary;
      qualityWarnings = regenerated.qualityWarnings;
    } else if (moduleType === "PLANNING") {
      const regenerated = await runContentPlanning({
        niche: inputs.niche || "AI Automation",
        targetAudience: inputs.targetAudience || "Content Creators",
        platforms: inputs.platforms || ["YOUTUBE"],
        goals: inputs.goals || "Growth",
        preferredFormats: inputs.preferredFormats || ["Video"],
        postingFrequency: inputs.postingFrequency || "3_TIMES_WEEK",
        topicsToAvoid: `${inputs.topicsToAvoid || ""}; Feedback: avoid ${explanation}`,
      });
      improvedContent = regenerated;
      improvedSummary = `Refined content plan incorporating feedback: ${specificImprovements}`;
    } else if (moduleType === "VIDEO") {
      const regenerated = await processVideoRepurposing({
        originalVideoTitle: inputs.originalVideoTitle || version.asset.title,
        targetPlatforms: inputs.targetPlatforms || ["TIKTOK"],
        desiredClipCount: inputs.desiredClipCount || 2,
        preferredClipDurationSec: inputs.preferredClipDurationSec || 45,
        aspectRatio: inputs.aspectRatio || "9:16",
        subtitleLanguage: inputs.subtitleLanguage || "English",
        editingInstructions: `${inputs.editingInstructions || ""}. Refinement: ${specificImprovements}`,
      });
      improvedContent = regenerated;
      improvedSummary = `Adjusted edit plan and candidate cuts based on feedback: ${specificImprovements}`;
      qualityWarnings = regenerated.warnings;
    } else if (moduleType === "THUMBNAIL") {
      const regenerated = generateThumbnailGraphic({
        brief: inputs.brief || version.asset.title,
        headlineText: specificImprovements.length < 35 ? specificImprovements.toUpperCase() : undefined,
        aspectRatio: inputs.aspectRatio || "16:9",
        style: reason === "DOES_NOT_MATCH_BRAND" ? "minimal-dark" : "high-contrast",
      });
      improvedContent = regenerated;
      improvedSummary = `Redesigned graphic addressing feedback: ${explanation}`;
    } else {
      improvedContent = {
        ...previousContent,
        revisionNotes: `Incorporated feedback: ${specificImprovements}`,
      };
    }

    // 4. Compute next version number without overwriting original
    const nextVersionNumber = version.versionNumber + 1;

    const newVersion = await prisma.contentVersion.create({
      data: {
        assetId: version.assetId,
        versionNumber: nextVersionNumber,
        title: `${version.asset.title} (Improved v${nextVersionNumber})`,
        contentJson: JSON.stringify(improvedContent),
        summary: improvedSummary,
        qualityWarnings: qualityWarnings ? JSON.stringify(qualityWarnings) : null,
        changeReason: "REGENERATION_AFTER_FEEDBACK",
        feedbackId: feedback.id,
        createdById: auth.user.id,
      },
    });

    // Update asset currentVersion
    await prisma.contentAsset.update({
      where: { id: version.assetId },
      data: {
        currentVersion: nextVersionNumber,
        status: "IN_REVIEW",
      },
    });

    // 5. Create fresh Approval for the new version
    const newApproval = await prisma.approval.create({
      data: {
        runId: run?.id || null,
        assetId: version.assetId,
        versionId: newVersion.id,
        decision: "PENDING",
      },
    });

    // Update AutomationRun
    if (run) {
      await prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: "AWAITING_APPROVAL",
          currentStep: `Reviewing Improved Version ${nextVersionNumber}`,
        },
      });

      await prisma.automationRunEvent.create({
        data: {
          runId: run.id,
          stage: "REGENERATION",
          status: "INFO",
          message: `Regenerated Version ${nextVersionNumber} following feedback reason: ${reason}.`,
        },
      });
    }

    // Create Notification
    await prisma.notification.create({
      data: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        type: "APPROVAL_NEEDED",
        title: `Improved Version Ready: v${nextVersionNumber}`,
        message: `Generated revised version for "${version.asset.title}" following your feedback.`,
        link: `/automations/${moduleType.toLowerCase()}`,
      },
    });

    return successResponse({
      runId: run?.id,
      assetId: version.assetId,
      versionId: newVersion.id,
      versionNumber: nextVersionNumber,
      totalVersions: nextVersionNumber,
      title: newVersion.title,
      module: moduleType,
      status: "AWAITING_APPROVAL",
      approvalDecision: "PENDING",
      approvalId: newApproval.id,
      summary: improvedSummary,
      content: improvedContent,
      qualityWarnings,
      settingsUsed: inputs,
      isDemoResult: false,
    });
  } catch (error: any) {
    console.error("Feedback regeneration error:", error);
    return errorResponse(error.message || "Failed to process feedback regeneration", 500);
  }
}
