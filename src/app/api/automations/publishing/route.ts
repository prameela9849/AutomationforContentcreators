import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { schedulePublication, validatePlatformRules } from "@/services/publishingService";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { platform, caption, scheduledFor, mediaUrl, accountName, timeZone, isImmediatePublish } = body;

    if (!platform || !caption) {
      return errorResponse("Platform and caption are required.");
    }

    const validation = validatePlatformRules(platform, caption, mediaUrl);
    if (!validation.isValid) {
      return errorResponse(`Platform rule violation: ${validation.errors.join("; ")}`, 400);
    }

    // Step 2: Create persistent AutomationRun
    const run = await prisma.automationRun.create({
      data: {
        workspaceId: auth.workspace.id,
        module: "PUBLISHING",
        status: "RUNNING",
        currentStep: "Validating platform constraints & idempotency",
        inputSummary: `${platform} publication (${caption.slice(0, 30)}...)`,
        inputsJson: JSON.stringify(body),
      },
    });

    // Step 3: Create asset
    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: auth.workspace.id,
        title: `${platform} Scheduled Post`,
        contentType: "SCHEDULED_POST",
        status: "IN_REVIEW",
        currentVersion: 1,
        mediaUrl,
        metadata: JSON.stringify({
          platform,
          scheduledFor,
          characterCount: validation.characterCount,
        }),
      },
    });

    const version = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 1,
        title: asset.title,
        contentJson: JSON.stringify({
          platform,
          accountName: accountName || "Default Channel",
          caption,
          mediaUrl,
          scheduledFor: scheduledFor || new Date().toISOString(),
          timeZone: timeZone || "UTC",
          validation,
        }),
        summary: `Validated post for ${platform} (${validation.characterCount}/${validation.maxCharacters} characters).`,
        qualityWarnings: validation.warnings.length > 0 ? JSON.stringify(validation.warnings) : null,
        changeReason: "INITIAL",
        createdById: auth.user.id,
      },
    });

    // Create approval
    await prisma.approval.create({
      data: {
        runId: run.id,
        assetId: asset.id,
        versionId: version.id,
        decision: "PENDING",
      },
    });

    // If already confirmed schedule, run scheduling service
    let scheduledRecord = null;
    if (scheduledFor) {
      const pubResult = await schedulePublication({
        workspaceId: auth.workspace.id,
        assetId: asset.id,
        platform,
        accountName,
        caption,
        mediaUrl,
        scheduledFor,
        timeZone,
        isImmediatePublish: Boolean(isImmediatePublish),
      });
      scheduledRecord = pubResult.scheduledPost;
    }

    const updatedRun = await prisma.automationRun.update({
      where: { id: run.id },
      data: {
        status: "AWAITING_APPROVAL",
        currentStep: "Pending User Approval to Commit Schedule",
        assetId: asset.id,
        outputsJson: JSON.stringify({
          platform,
          scheduledFor,
          characterCount: validation.characterCount,
        }),
      },
    });

    return successResponse({
      runId: updatedRun.id,
      assetId: asset.id,
      versionId: version.id,
      versionNumber: 1,
      totalVersions: 1,
      title: asset.title,
      module: "PUBLISHING",
      status: updatedRun.status,
      approvalDecision: "PENDING",
      summary: `Prepared and validated ${platform} post draft.`,
      content: {
        platform,
        accountName: accountName || "Default Channel",
        caption,
        mediaUrl,
        scheduledFor: scheduledFor || new Date().toISOString(),
        timeZone: timeZone || "UTC",
        validation,
        scheduledRecord,
      },
      qualityWarnings: validation.warnings,
      settingsUsed: body,
      isDemoResult: false,
    });
  } catch (error: any) {
    console.error("Publishing automation error:", error);
    return errorResponse(error.message || "Failed to schedule publication", 500);
  }
}
