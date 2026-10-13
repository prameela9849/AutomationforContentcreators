import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { processSponsorshipInquiry } from "@/services/sponsorshipService";

export async function GET() {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const leads = await prisma.sponsorshipLead.findMany({
      where: { workspaceId: auth.workspace.id },
      include: {
        deliverables: true,
        contracts: true,
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse({ leads });
  } catch (error: any) {
    console.error("Sponsorships fetch error:", error);
    return errorResponse(error.message || "Failed to fetch sponsorships", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { rawInquiryText, source } = body;

    if (!rawInquiryText || rawInquiryText.trim().length < 10) {
      return errorResponse("Please provide the full inquiry email or sponsor brief text.");
    }

    // Step 2: Create persistent AutomationRun
    const run = await prisma.automationRun.create({
      data: {
        workspaceId: auth.workspace.id,
        module: "SPONSORSHIP",
        status: "RUNNING",
        currentStep: "Extracting brand deliverables, budget, and comparing with rate card",
        inputSummary: `Sponsor Inquiry (${rawInquiryText.slice(0, 35)}...)`,
        inputsJson: JSON.stringify(body),
      },
    });

    // Step 3: Run service
    const { lead, parsed } = await processSponsorshipInquiry({
      workspaceId: auth.workspace.id,
      rawInquiryText,
      source: source || "MANUAL",
    });

    // Step 4: Persist asset and version
    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: auth.workspace.id,
        title: `Sponsorship: ${parsed.brandName} Deal Memo`,
        contentType: "SPONSOR_DEAL",
        status: "IN_REVIEW",
        currentVersion: 1,
        metadata: JSON.stringify({
          brandName: parsed.brandName,
          budget: parsed.proposedBudget,
          leadId: lead.id,
        }),
      },
    });

    const version = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 1,
        title: asset.title,
        contentJson: JSON.stringify({
          leadId: lead.id,
          ...parsed,
        }),
        summary: `Parsed inquiry from ${parsed.brandName}: Budget $${parsed.proposedBudget.toLocaleString()} vs standard rate $${parsed.creatorStandardRate.toLocaleString()} (${parsed.budgetComparison.status}).`,
        qualityWarnings: parsed.budgetComparison.status === "BELOW_RATE"
          ? JSON.stringify([parsed.budgetComparison.guidance])
          : null,
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
        currentStep: "Pending Creator Sign-off on Negotiation Strategy",
        assetId: asset.id,
        outputsJson: JSON.stringify({
          brandName: parsed.brandName,
          budget: parsed.proposedBudget,
          status: parsed.budgetComparison.status,
        }),
      },
    });

    await prisma.notification.create({
      data: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        type: "APPROVAL_NEEDED",
        title: `Sponsor Deal Memo Ready: ${parsed.brandName}`,
        message: `Extracted inquiry details ($${parsed.proposedBudget.toLocaleString()}) and suggested response draft.`,
        link: "/automations/sponsorships",
      },
    });

    return successResponse({
      runId: updatedRun.id,
      assetId: asset.id,
      versionId: version.id,
      versionNumber: 1,
      totalVersions: 1,
      title: asset.title,
      module: "SPONSORSHIP",
      status: updatedRun.status,
      approvalDecision: "PENDING",
      summary: `Parsed campaign details for ${parsed.brandName} with rate card comparison.`,
      content: {
        leadId: lead.id,
        ...parsed,
      },
      qualityWarnings: parsed.budgetComparison.status === "BELOW_RATE" ? [parsed.budgetComparison.guidance] : [],
      settingsUsed: body,
      isDemoResult: false,
    });
  } catch (error: any) {
    console.error("Sponsorship automation error:", error);
    return errorResponse(error.message || "Failed to process sponsorship inquiry", 500);
  }
}
