import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const asset = await prisma.contentAsset.findUnique({
      where: { id: params.assetId },
      include: {
        versions: {
          include: {
            feedbacks: true,
            createdBy: { select: { id: true, name: true, email: true } },
          },
          orderBy: { versionNumber: "desc" },
        },
        approvals: true,
        scheduledPosts: true,
      },
    });

    if (!asset || asset.workspaceId !== auth.workspace.id) {
      return errorResponse("Asset not found or unauthorized", 404);
    }

    return successResponse({ asset });
  } catch (error: any) {
    console.error("Asset fetch error:", error);
    return errorResponse(error.message || "Failed to fetch asset", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { title, contentJson, summary, saveAsNewVersion } = body;

    const asset = await prisma.contentAsset.findUnique({
      where: { id: params.assetId },
      include: {
        versions: { orderBy: { versionNumber: "desc" } },
      },
    });

    if (!asset || asset.workspaceId !== auth.workspace.id) {
      return errorResponse("Asset not found or unauthorized", 404);
    }

    let version;
    if (saveAsNewVersion) {
      const nextVersionNumber = (asset.versions[0]?.versionNumber || 0) + 1;
      version = await prisma.contentVersion.create({
        data: {
          assetId: asset.id,
          versionNumber: nextVersionNumber,
          title: title || asset.title,
          contentJson: typeof contentJson === "string" ? contentJson : JSON.stringify(contentJson),
          summary: summary || "Manual editor update",
          changeReason: "USER_EDIT",
          createdById: auth.user.id,
        },
      });

      await prisma.contentAsset.update({
        where: { id: asset.id },
        data: {
          title: title || asset.title,
          currentVersion: nextVersionNumber,
          status: "DRAFT",
        },
      });
    } else {
      // Update latest version directly
      const latestVersion = asset.versions[0];
      if (latestVersion) {
        version = await prisma.contentVersion.update({
          where: { id: latestVersion.id },
          data: {
            title: title || latestVersion.title,
            contentJson: typeof contentJson === "string" ? contentJson : JSON.stringify(contentJson),
            summary: summary || latestVersion.summary,
          },
        });
      }

      await prisma.contentAsset.update({
        where: { id: asset.id },
        data: {
          title: title || asset.title,
          status: "DRAFT",
        },
      });
    }

    return successResponse({
      message: "Asset updated successfully",
      version,
    });
  } catch (error: any) {
    console.error("Asset update error:", error);
    return errorResponse(error.message || "Failed to save asset edits", 500);
  }
}
