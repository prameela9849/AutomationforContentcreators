import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { runContentPlanning, ContentPlanningInput } from "@/services/planningService";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { niche, targetAudience, platforms, goals, preferredFormats, postingFrequency, dateRangeDays } = body;

    if (!niche || !targetAudience) {
      return errorResponse("Niche and Target Audience are required fields.");
    }

    const inputData: ContentPlanningInput = {
      niche,
      targetAudience,
      targetRegion: body.targetRegion || "Global",
      languages: body.languages || "English",
      platforms: platforms && platforms.length > 0 ? platforms : ["YOUTUBE", "LINKEDIN"],
      goals: goals || "Grow audience reach and attract sponsorships",
      preferredFormats: preferredFormats && preferredFormats.length > 0 ? preferredFormats : ["Long-form Video", "Shorts"],
      postingFrequency: postingFrequency || "3_TIMES_WEEK",
      topicsToAvoid: body.topicsToAvoid,
      competitors: body.competitors,
      dateRangeDays: dateRangeDays ? parseInt(dateRangeDays) : 7,
    };

    // Step 2: Create persistent AutomationRun record (RUNNING)
    const run = await prisma.automationRun.create({
      data: {
        workspaceId: auth.workspace.id,
        module: "PLANNING",
        status: "RUNNING",
        currentStep: "Researching trending opportunities & demand gaps",
        inputSummary: `${inputData.niche} (${inputData.dateRangeDays}-day plan)`,
        inputsJson: JSON.stringify(inputData),
      },
    });

    await prisma.automationRunEvent.create({
      data: {
        runId: run.id,
        stage: "INITIALIZATION",
        status: "INFO",
        message: `Started Automated Content Planning run for ${inputData.niche}`,
      },
    });

    // Step 3: Execute service
    const planResult = await runContentPlanning(inputData);

    // Step 4: Persist ContentAsset and ContentVersion (v1)
    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: auth.workspace.id,
        title: `${inputData.niche} Content Plan (${inputData.dateRangeDays} Days)`,
        contentType: "PLAN",
        status: "IN_REVIEW",
        currentVersion: 1,
        metadata: JSON.stringify({
          niche: inputData.niche,
          platforms: inputData.platforms,
          methodology: planResult.methodology,
        }),
      },
    });

    const version = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 1,
        title: asset.title,
        contentJson: JSON.stringify(planResult),
        summary: planResult.summary,
        qualityWarnings: planResult.warnings ? JSON.stringify(planResult.warnings) : null,
        changeReason: "INITIAL",
        createdById: auth.user.id,
      },
    });

    // Step 5: Create Approval record
    const approval = await prisma.approval.create({
      data: {
        runId: run.id,
        assetId: asset.id,
        versionId: version.id,
        decision: "PENDING",
      },
    });

    // Update run to AWAITING_APPROVAL
    const updatedRun = await prisma.automationRun.update({
      where: { id: run.id },
      data: {
        status: "AWAITING_APPROVAL",
        currentStep: "Awaiting Human Review",
        assetId: asset.id,
        outputsJson: JSON.stringify({
          topicsCount: planResult.topics.length,
          methodology: planResult.methodology,
        }),
        isDemoResult: planResult.isDemoResult,
      },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        type: "APPROVAL_NEEDED",
        title: "Content Plan Ready for Review",
        message: `Plan for "${inputData.niche}" has ${planResult.topics.length} curated opportunities.`,
        link: "/automations/planning",
      },
    });

    return successResponse({
      runId: updatedRun.id,
      assetId: asset.id,
      versionId: version.id,
      versionNumber: 1,
      totalVersions: 1,
      title: asset.title,
      module: "PLANNING",
      status: updatedRun.status,
      approvalDecision: "PENDING",
      summary: planResult.summary,
      content: planResult,
      qualityWarnings: planResult.warnings,
      settingsUsed: inputData,
      isDemoResult: planResult.isDemoResult,
    });
  } catch (error: any) {
    console.error("Planning automation error:", error);
    return errorResponse(error.message || "Failed to run content planning", 500);
  }
}
