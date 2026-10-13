import { NextRequest } from "next/server";
import { getAuthenticatedWorkspace, errorResponse, successResponse } from "@/lib/apiHelper";
import prisma from "@/lib/prisma";
import { generateScriptAndCaptions, ScriptGenerationInput } from "@/services/scriptService";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthenticatedWorkspace();
    if (!auth) return errorResponse("Unauthorized", 401);

    const body = await req.json();
    const { topic, targetAudience, platform, toneOfVoice, mainObjective, callToAction, keywords } = body;

    if (!topic || !targetAudience) {
      return errorResponse("Topic and Target Audience are required.");
    }

    const inputData: ScriptGenerationInput = {
      topic,
      targetAudience,
      platform: platform || "CROSS_PLATFORM",
      toneOfVoice: toneOfVoice || "Authoritative, empathetic, actionable",
      mainObjective: mainObjective || "Educate audience and drive newsletter conversion",
      callToAction: callToAction || "Subscribe and grab the free workflow template in comments",
      keywords: keywords ? (Array.isArray(keywords) ? keywords : keywords.split(",").map((k: string) => k.trim())) : [],
    };

    // Step 2: Create persistent AutomationRun
    const run = await prisma.automationRun.create({
      data: {
        workspaceId: auth.workspace.id,
        module: "SCRIPT",
        status: "RUNNING",
        currentStep: "Drafting multi-platform hooks, script body, and captions",
        inputSummary: `${inputData.topic} (${inputData.platform})`,
        inputsJson: JSON.stringify(inputData),
      },
    });

    // Step 3: Run service
    const scriptResult = await generateScriptAndCaptions(inputData);

    // Step 4: Persist asset and version
    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: auth.workspace.id,
        title: `Script Package: ${inputData.topic}`,
        contentType: "SCRIPT",
        status: "IN_REVIEW",
        currentVersion: 1,
        metadata: JSON.stringify({
          topic: inputData.topic,
          platform: inputData.platform,
        }),
      },
    });

    const version = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 1,
        title: asset.title,
        contentJson: JSON.stringify(scriptResult.data),
        summary: scriptResult.summary,
        qualityWarnings: scriptResult.qualityWarnings ? JSON.stringify(scriptResult.qualityWarnings) : null,
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
        currentStep: "Pending Creator Review of Script & Social Captions",
        assetId: asset.id,
        outputsJson: JSON.stringify({
          titleVariations: scriptResult.data.titleVariations.length,
          hasVideoScript: Boolean(scriptResult.data.videoScript),
        }),
        isDemoResult: scriptResult.isDemoResult,
      },
    });

    await prisma.notification.create({
      data: {
        workspaceId: auth.workspace.id,
        userId: auth.user.id,
        type: "APPROVAL_NEEDED",
        title: "Script Package Ready for Review",
        message: `Package for "${inputData.topic}" has video script and platform captions.`,
        link: "/automations/scripts",
      },
    });

    return successResponse({
      runId: updatedRun.id,
      assetId: asset.id,
      versionId: version.id,
      versionNumber: 1,
      totalVersions: 1,
      title: asset.title,
      module: "SCRIPT",
      status: updatedRun.status,
      approvalDecision: "PENDING",
      summary: scriptResult.summary,
      content: scriptResult.data,
      qualityWarnings: scriptResult.qualityWarnings,
      settingsUsed: inputData,
      isDemoResult: scriptResult.isDemoResult,
    });
  } catch (error: any) {
    console.error("Script automation error:", error);
    return errorResponse(error.message || "Failed to generate script package", 500);
  }
}
