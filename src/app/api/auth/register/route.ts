import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    // Create user, workspace, brandkit, creatorprofile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          role: "CREATOR",
        },
      });

      const newWorkspace = await tx.workspace.create({
        data: {
          name: `${name}'s Studio`,
          slug: `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now().toString().slice(-4)}`,
          ownerId: newUser.id,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: newWorkspace.id,
          userId: newUser.id,
          role: "OWNER",
        },
      });

      await tx.creatorProfile.create({
        data: {
          workspaceId: newWorkspace.id,
          niche: "Content Creation",
          targetAudience: "General Audience",
        },
      });

      await tx.brandKit.create({
        data: {
          workspaceId: newWorkspace.id,
          brandName: `${name}'s Brand`,
          primaryColor: "#71A832",
          secondaryColor: "#1F2937",
        },
      });

      return { user: newUser, workspace: newWorkspace };
    });

    const token = await createSessionToken({
      userId: result.user.id,
      email: result.user.email,
      workspaceId: result.workspace.id,
      role: result.user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        workspaceId: result.workspace.id,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to register" }, { status: 500 });
  }
}
