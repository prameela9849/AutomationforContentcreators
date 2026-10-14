import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { getPerformanceReport } from "@/services/analyticsService";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform") || "YOUTUBE";
    const period = (searchParams.get("period") as "7d" | "30d") || "30d";

    const report = await getPerformanceReport(auth.workspace.id, platform, period);
    return successResponse({ report });
  } catch (error: any) {
    console.error("Analytics fetch error:", error);
    return errorResponse(error.message || "Failed to fetch analytics", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const platform = body.platform || "YOUTUBE";
    const period = body.period || "30d";

    // Step 2: Create AutomationRun (RUNNING)
    const run = await prisma.automationRun.create({
      data: {
        workspaceId: auth.workspace.id,
        module: "ANALYTICS",
        status: "RUNNING",
        currentStep: "Aggregating watch-time, retention cliff, and CTR data",
        inputSummary: `${platform} Performance Analysis (${period})`,
        inputsJson: JSON.stringify(body),
      },
    });

    const report = await getPerformanceReport(auth.workspace.id, platform, period);

    // Persist as report asset
    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: auth.workspace.id,
        title: `${platform} ${period.toUpperCase()} Performance Audit`,
        contentType: "REPORT",
        status: "IN_REVIEW",
        currentVersion: 1,
        metadata: JSON.stringify({
          platform,
          period,
          totalViews: report.metrics.totalViews,
        }),
      },
    });

    const version = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 1,
        title: asset.title,
        contentJson: JSON.stringify(report),
        summary: `Performance Audit for ${platform}: ${report.metrics.totalViews.toLocaleString()} views, ${report.metrics.engagementRate}% engagement rate, ${report.aiRecommendations.length} evidence-backed recommendations.`,
        createdById: auth.user.id,
      },
    });

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
        currentStep: "Ready for Strategic Review",
        assetId: asset.id,
        outputsJson: JSON.stringify({
          views: report.metrics.totalViews,
          recommendationsCount: report.aiRecommendations.length,
        }),
        isDemoResult: report.isDemo,
      },
    });

    return successResponse({
      runId: updatedRun.id,
      assetId: asset.id,
      versionId: version.id,
      versionNumber: 1,
      totalVersions: 1,
      title: asset.title,
      module: "ANALYTICS",
      status: updatedRun.status,
      approvalDecision: "PENDING",
      summary: `Analyzed performance data across ${platform}.`,
      content: report,
      settingsUsed: body,
      isDemoResult: report.isDemo,
    });
  } catch (error: any) {
    console.error("Analytics audit error:", error);
    return errorResponse(error.message || "Failed to generate analytics audit", 500);
  }
}
