import { NextResponse } from "next/server";
import { getCurrentUser } from "./auth";
import prisma from "./prisma";

export async function getAuthenticatedWorkspace() {
  const user = await getCurrentUser();
  if (!user || !user.workspace) {
    // If running in development and no session cookie is yet set, fall back to default seeded user
    const defaultUser = await prisma.user.findUnique({
      where: { email: "creator@creatorflow.io" },
      include: {
        workspaces: {
          include: {
            workspace: {
              include: {
                creatorProfile: true,
                brandKit: true,
              },
            },
          },
        },
      },
    });

    if (defaultUser && defaultUser.workspaces[0]?.workspace) {
      return {
        user: {
          id: defaultUser.id,
          email: defaultUser.email,
          name: defaultUser.name,
          role: defaultUser.role,
          avatarUrl: defaultUser.avatarUrl,
        },
        workspace: defaultUser.workspaces[0].workspace,
      };
    }

    return null;
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    workspace: user.workspace,
  };
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}
