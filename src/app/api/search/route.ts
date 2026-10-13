import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q || q.trim().length < 2) {
      return successResponse({ results: [] });
    }

    const query = q.trim();

    const [assets, leads, scheduled, runs] = await Promise.all([
      prisma.contentAsset.findMany({
        where: {
          workspaceId: auth.workspace.id,
          title: { contains: query },
        },
        take: 5,
      }),
      prisma.sponsorshipLead.findMany({
        where: {
          workspaceId: auth.workspace.id,
          OR: [
            { brandName: { contains: query } },
            { contactName: { contains: query } },
          ],
        },
        take: 5,
      }),
      prisma.scheduledPublication.findMany({
        where: {
          workspaceId: auth.workspace.id,
          caption: { contains: query },
        },
        take: 5,
      }),
      prisma.automationRun.findMany({
        where: {
          workspaceId: auth.workspace.id,
          inputSummary: { contains: query },
        },
        take: 5,
      }),
    ]);

    const results = [
      ...assets.map((a) => ({
        id: a.id,
        type: "ASSET",
        title: a.title,
        subtitle: `Type: ${a.contentType} • Status: ${a.status}`,
        link: a.contentType === "PLAN" ? "/automations/planning" : a.contentType === "VIDEO_CLIP" ? "/automations/video" : a.contentType === "GRAPHIC" ? "/automations/thumbnails" : "/automations/scripts",
      })),
      ...leads.map((l) => ({
        id: l.id,
        type: "SPONSORSHIP",
        title: `Brand Deal: ${l.brandName}`,
        subtitle: `Budget: $${l.proposedBudget.toLocaleString()} • Stage: ${l.stage}`,
        link: "/automations/sponsorships",
      })),
      ...scheduled.map((s) => ({
        id: s.id,
        type: "SCHEDULED_POST",
        title: `${s.platform} Post: ${s.caption.slice(0, 35)}...`,
        subtitle: `Scheduled for ${new Date(s.scheduledFor).toLocaleDateString()}`,
        link: "/calendar",
      })),
      ...runs.map((r) => ({
        id: r.id,
        type: "RUN",
        title: `Automation #${r.runNumber}: ${r.module}`,
        subtitle: `Status: ${r.status} • ${r.inputSummary || ""}`,
        link: "/automations/history",
      })),
    ];

    return successResponse({ results });
  } catch (error: any) {
    console.error("Search error:", error);
    return errorResponse(error.message || "Failed to search", 500);
  }
}
