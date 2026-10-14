import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const profile = await prisma.creatorProfile.findUnique({
      where: { workspaceId: auth.workspace.id },
    });

    const brandKit = await prisma.brandKit.findUnique({
      where: { workspaceId: auth.workspace.id },
    });

    const preference = await prisma.userPreference.findUnique({
      where: { userId: auth.user.id },
    });

    return successResponse({ profile, brandKit, preference });
  } catch (error: any) {
    console.error("Settings fetch error:", error);
    return errorResponse(error.message || "Failed to fetch settings", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { profile, brandKit, preference } = body;

    if (profile) {
      await prisma.creatorProfile.upsert({
        where: { workspaceId: auth.workspace.id },
        update: {
          niche: profile.niche,
          targetAudience: profile.targetAudience,
          targetRegion: profile.targetRegion,
          languages: profile.languages,
          postingFrequency: profile.postingFrequency,
          topicsToAvoid: profile.topicsToAvoid,
          bio: profile.bio,
          monthlyViewsGoal: profile.monthlyViewsGoal ? parseInt(profile.monthlyViewsGoal) : undefined,
          standardRateCard: typeof profile.standardRateCard === "object" ? JSON.stringify(profile.standardRateCard) : profile.standardRateCard,
        },
        create: {
          workspaceId: auth.workspace.id,
          niche: profile.niche || "Content Creation",
          targetAudience: profile.targetAudience || "General",
          standardRateCard: typeof profile.standardRateCard === "object" ? JSON.stringify(profile.standardRateCard) : profile.standardRateCard,
        },
      });
    }

    if (brandKit) {
      await prisma.brandKit.upsert({
        where: { workspaceId: auth.workspace.id },
        update: {
          brandName: brandKit.brandName,
          tagline: brandKit.tagline,
          primaryColor: brandKit.primaryColor || "#71A832",
          secondaryColor: brandKit.secondaryColor || "#1F2937",
          accentColor: brandKit.accentColor || "#FFFFF0",
          fontFamily: brandKit.fontFamily,
          toneOfVoice: brandKit.toneOfVoice,
          visualGuidelines: brandKit.visualGuidelines,
        },
        create: {
          workspaceId: auth.workspace.id,
          brandName: brandKit.brandName || "My Brand",
          primaryColor: brandKit.primaryColor || "#71A832",
          secondaryColor: brandKit.secondaryColor || "#1F2937",
        },
      });
    }

    if (preference) {
      await prisma.userPreference.upsert({
        where: { userId: auth.user.id },
        update: {
          emailNotifications: preference.emailNotifications,
          inAppNotifications: preference.inAppNotifications,
          autoSaveDrafts: preference.autoSaveDrafts,
          defaultTimezone: preference.defaultTimezone,
        },
        create: {
          userId: auth.user.id,
          emailNotifications: preference.emailNotifications ?? true,
          inAppNotifications: preference.inAppNotifications ?? true,
        },
      });
    }

    return successResponse({ message: "Settings saved successfully" });
  } catch (error: any) {
    console.error("Settings save error:", error);
    return errorResponse(error.message || "Failed to save settings", 500);
  }
}
