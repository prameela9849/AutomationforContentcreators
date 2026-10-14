import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const notifications = await prisma.notification.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        workspaceId: auth.workspace.id,
        read: false,
      },
    });

    return successResponse({ notifications, unreadCount });
  } catch (error: any) {
    console.error("Notifications fetch error:", error);
    return errorResponse(error.message || "Failed to fetch notifications", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { workspaceId: auth.workspace.id, read: false },
        data: { read: true },
      });
      return successResponse({ message: "All notifications marked as read" });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
      return successResponse({ message: "Notification marked as read" });
    }

    return errorResponse("Missing notificationId or markAllRead flag");
  } catch (error: any) {
    console.error("Notifications update error:", error);
    return errorResponse(error.message || "Failed to update notification", 500);
  }
}
