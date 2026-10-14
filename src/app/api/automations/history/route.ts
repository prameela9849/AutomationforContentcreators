import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const moduleFilter = searchParams.get("module");
    const statusFilter = searchParams.get("status");
    const query = searchParams.get("q");

    const where: any = {
      workspaceId: auth.workspace.id,
    };

    if (moduleFilter && moduleFilter !== "ALL") {
      where.module = moduleFilter;
    }

    if (statusFilter && statusFilter !== "ALL") {
      where.status = statusFilter;
    }

    if (query) {
      where.OR = [
        { inputSummary: { contains: query } },
        { currentStep: { contains: query } },
      ];
    }

    const runs = await prisma.automationRun.findMany({
      where,
      include: {
        asset: {
          include: {
            versions: {
              select: { id: true, versionNumber: true, title: true, createdAt: true },
            },
          },
        },
        approvals: {
          include: {
            approvedBy: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return successResponse({ runs });
  } catch (error: any) {
    console.error("History fetch error:", error);
    return errorResponse(error.message || "Failed to fetch automation history", 500);
  }
}
