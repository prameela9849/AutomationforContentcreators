import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "creatorflow_default_secret_key_change_in_production";
const secretKey = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "creatorflow_token";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface JWTPayload {
  userId: string;
  email: string;
  workspaceId: string;
  role: string;
}

export async function createSessionToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = await verifySessionToken(token);
    if (!decoded?.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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

    if (!user) return null;

    const defaultWorkspace = user.workspaces[0]?.workspace;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      workspace: defaultWorkspace,
    };
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}
