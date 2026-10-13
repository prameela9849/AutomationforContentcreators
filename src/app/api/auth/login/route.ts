import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const workspace = user.workspaces[0]?.workspace;
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      workspaceId: workspace?.id || "",
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: workspace?.id,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to log in" }, { status: 500 });
  }
}
