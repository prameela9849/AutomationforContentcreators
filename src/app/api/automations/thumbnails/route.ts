import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { generateThumbnailGraphic, ThumbnailInput } from "@/services/thumbnailService";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { brief, headlineText, subheadingText, aspectRatio, style, stickers } = body;

    if (!brief) {
      return errorResponse("Content brief or video title is required.");
    }

    const brandKit = await prisma.brandKit.findUnique({
      where: { workspaceId: auth.workspace.id },
    });

    const inputData: ThumbnailInput = {
      brief,
      headlineText,
      subheadingText,
      aspectRatio: aspectRatio || "16:9",
      style: style || "high-contrast",
      brandName: brandKit?.brandName || "CREATORFLOW",
      primaryColor: brandKit?.primaryColor || "#71A832",
      secondaryColor: brandKit?.secondaryColor || "#111827",
      stickers: stickers && stickers.length > 0 ? stickers : ["100% AUTOMATED", "PROVEN WORKFLOW"],
    };

    // Step 2: Create persistent AutomationRun
    const run = await prisma.automationRun.create({
      data: {
        workspaceId: auth.workspace.id,
        module: "THUMBNAIL",
        status: "RUNNING",
        currentStep: "Synthesizing visual concept & applying Brand Kit tokens",
        inputSummary: `${inputData.brief.slice(0, 30)} (${inputData.aspectRatio})`,
        inputsJson: JSON.stringify(inputData),
      },
    });

    // Step 3: Run service
    const graphicResult = generateThumbnailGraphic(inputData);

    // Step 4: Persist asset and version
    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: auth.workspace.id,
        title: graphicResult.title,
        contentType: "GRAPHIC",
        status: "IN_REVIEW",
        currentVersion: 1,
        thumbnailUrl: "/uploads/demo-thumbnail-1.svg",
        metadata: JSON.stringify({
          aspectRatio: graphicResult.aspectRatio,
          dimensions: graphicResult.dimensions,
        }),
      },
    });

    const version = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 1,
        title: asset.title,
        contentJson: JSON.stringify(graphicResult),
        summary: `Generated ${graphicResult.aspectRatio} high-CTR graphic following Brand Kit color rules (${inputData.primaryColor}).`,
        changeReason: "INITIAL",
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
        currentStep: "Pending User Approval for Export",
        assetId: asset.id,
        outputsJson: JSON.stringify({
          aspectRatio: graphicResult.aspectRatio,
          format: "SVG/CANVAS",
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
      module: "THUMBNAIL",
      status: updatedRun.status,
      approvalDecision: "PENDING",
      summary: `Rendered ${graphicResult.aspectRatio} layout concept ready for export.`,
      content: graphicResult,
      settingsUsed: inputData,
      isDemoResult: false,
    });
  } catch (error: any) {
    console.error("Thumbnail automation error:", error);
    return errorResponse(error.message || "Failed to generate thumbnail graphic", 500);
  }
}
