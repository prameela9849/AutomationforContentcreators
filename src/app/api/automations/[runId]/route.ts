import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const run = await prisma.automationRun.findUnique({
      where: { id: params.runId },
      include: {
        events: { orderBy: { createdAt: "asc" } },
        asset: {
          include: {
            versions: {
              include: {
                feedbacks: true,
              },
              orderBy: { versionNumber: "desc" },
            },
          },
        },
        approvals: {
          include: {
            approvedBy: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!run || run.workspaceId !== auth.workspace.id) {
      return errorResponse("Run not found or unauthorized", 404);
    }

    return successResponse({ run });
  } catch (error: any) {
    console.error("Run detail fetch error:", error);
    return errorResponse(error.message || "Failed to fetch run details", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { action } = body; // "CANCEL" | "RETRY"

    const run = await prisma.automationRun.findUnique({
      where: { id: params.runId },
    });

    if (!run || run.workspaceId !== auth.workspace.id) {
      return errorResponse("Run not found or unauthorized", 404);
    }

    if (action === "CANCEL") {
      if (["COMPLETED", "APPROVED", "CANCELLED"].includes(run.status)) {
        return errorResponse(`Cannot cancel a run with status ${run.status}.`);
      }

      const updated = await prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: "CANCELLED",
          currentStep: "Cancelled by User",
        },
      });

      await prisma.automationRunEvent.create({
        data: {
          runId: run.id,
          stage: "CANCELLATION",
          status: "WARNING",
          message: "User requested immediate cancellation of this automation run.",
        },
      });

      return successResponse({ run: updated, message: "Run cancelled successfully" });
    }

    if (action === "RETRY") {
      const updated = await prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status: "RUNNING",
          currentStep: "Retrying automation workflow",
          errorMessage: null,
        },
      });

      await prisma.automationRunEvent.create({
        data: {
          runId: run.id,
          stage: "RETRY",
          status: "INFO",
          message: "User initiated safe retry for this automation run.",
        },
      });

      return successResponse({ run: updated, message: "Run retry initiated" });
    }

    return errorResponse("Invalid action specified (must be CANCEL or RETRY)");
  } catch (error: any) {
    console.error("Run action error:", error);
    return errorResponse(error.message || "Failed to process run action", 500);
  }
}
