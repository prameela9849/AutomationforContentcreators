import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const entries = await prisma.contentCalendarEntry.findMany({
      where: { workspaceId: auth.workspace.id },
      include: {
        asset: {
          include: {
            scheduledPosts: true,
          },
        },
      },
      orderBy: { scheduledDate: "asc" },
    });

    const scheduledPosts = await prisma.scheduledPublication.findMany({
      where: { workspaceId: auth.workspace.id },
      include: {
        asset: true,
      },
      orderBy: { scheduledFor: "asc" },
    });

    return successResponse({ entries, scheduledPosts });
  } catch (error: any) {
    console.error("Calendar fetch error:", error);
    return errorResponse(error.message || "Failed to fetch calendar", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { entryId, publicationId, newDate, newStatus } = body;

    if (entryId && newDate) {
      const updated = await prisma.contentCalendarEntry.update({
        where: { id: entryId },
        data: {
          scheduledDate: new Date(newDate),
          status: newStatus || undefined,
        },
      });
      return successResponse({ entry: updated });
    }

    if (publicationId && newDate) {
      const updated = await prisma.scheduledPublication.update({
        where: { id: publicationId },
        data: {
          scheduledFor: new Date(newDate),
          status: newStatus || undefined,
        },
      });
      return successResponse({ publication: updated });
    }

    return errorResponse("Missing entryId or publicationId, and newDate");
  } catch (error: any) {
    console.error("Calendar update error:", error);
    return errorResponse(error.message || "Failed to update calendar", 500);
  }
}
