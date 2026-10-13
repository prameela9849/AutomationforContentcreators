import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED or all

    const whereClause: any = {
      asset: {
        workspaceId: auth.workspace.id,
      },
    };

    if (status && status !== "ALL") {
      whereClause.decision = status;
    }

    const approvals = await prisma.approval.findMany({
      where: whereClause,
      include: {
        run: true,
        asset: {
          include: {
            versions: {
              orderBy: { versionNumber: "desc" },
            },
          },
        },
        version: true,
        approvedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ approvals });
  } catch (error: any) {
    console.error("Approvals fetch error:", error);
    return errorResponse(error.message || "Failed to fetch approvals", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { approvalId, decision, notes } = body;

    if (!approvalId || !["APPROVED", "REJECTED"].includes(decision)) {
      return errorResponse("Valid approvalId and decision (APPROVED or REJECTED) are required.");
    }

    const approval = await prisma.approval.findUnique({
      where: { id: approvalId },
      include: {
        asset: true,
        version: true,
        run: true,
      },
    });

    if (!approval || approval.asset.workspaceId !== auth.workspace.id) {
      return errorResponse("Approval record not found or unauthorized.", 404);
    }

    // Step 5: Save approval decision
    const updatedApproval = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        decision,
        approvedById: auth.user.id,
        approvedAt: new Date(),
        notes: notes || null,
      },
    });

    // Update ContentAsset status
    await prisma.contentAsset.update({
      where: { id: approval.assetId },
      data: {
        status: decision === "APPROVED" ? "APPROVED" : "REJECTED",
      },
    });

    // Update AutomationRun status
    if (approval.runId) {
      await prisma.automationRun.update({
        where: { id: approval.runId },
        data: {
          status: decision === "APPROVED" ? "APPROVED" : "REJECTED",
          currentStep: decision === "APPROVED" ? "Approved by Creator" : "Rejected by Creator",
          completedAt: new Date(),
        },
      });

      await prisma.automationRunEvent.create({
        data: {
          runId: approval.runId,
          stage: "APPROVAL_DECISION",
          status: decision === "APPROVED" ? "SUCCESS" : "WARNING",
          message: `Creator decided: ${decision}. Notes: ${notes || "None"}`,
        },
      });
    }

    // Log notification
    await prisma.notification.create({
      data: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        type: decision === "APPROVED" ? "SYSTEM" : "FEEDBACK_RECEIVED",
        title: `Asset ${decision === "APPROVED" ? "Approved" : "Rejected"}`,
        message: `"${approval.asset.title}" marked as ${decision}.`,
        link: "/approvals",
      },
    });

    return successResponse({
      approval: updatedApproval,
      decision,
    });
  } catch (error: any) {
    console.error("Approval submit error:", error);
    return errorResponse(error.message || "Failed to submit approval", 500);
  }
}
