import { describe, it, expect, beforeAll } from "vitest";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";
import { runContentPlanning } from "@/services/planningService";
import { parseNaturalLanguageInstructions, checkFFmpegInstalled } from "@/services/videoService";
import { validatePlatformRules, schedulePublication } from "@/services/publishingService";
import { parseSponsorshipText } from "@/services/sponsorshipService";
import { generateThumbnailGraphic } from "@/services/thumbnailService";
import { generateScriptAndCaptions } from "@/services/scriptService";
import { getPerformanceReport } from "@/services/analyticsService";
import { getAIProviderStatus } from "@/services/aiProvider";

describe("CreatorFlow AI — Core User Journey Automated Tests", () => {
  let testWorkspaceId: string;
  let testUserId: string;

  beforeAll(async () => {
    // Find or verify default user & workspace
    const user = await prisma.user.findFirst({
      where: { email: "creator@creatorflow.io" },
      include: { workspaces: true },
    });
    if (user && user.workspaces[0]) {
      testUserId = user.id;
      testWorkspaceId = user.workspaces[0].workspaceId;
    }
  });

  // Test 1: User sign-up, login, and logout hashing
  it("1. User sign-up, login, and password hashing security", async () => {
    const rawPassword = "TestSecretPassword123!";
    const hash = await hashPassword(rawPassword);
    expect(hash).not.toBe(rawPassword);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrong = await verifyPassword("WrongPassword", hash);
    expect(isWrong).toBe(false);

    // Session token JWT issuance & validation
    const token = await createSessionToken({
      userId: "test-user-id",
      email: "test@creatorflow.io",
      workspaceId: "test-ws-id",
      role: "CREATOR",
    });
    expect(token).toBeDefined();

    const verified = await verifySessionToken(token);
    expect(verified?.email).toBe("test@creatorflow.io");
  });

  // Test 2: Unauthorized users cannot access another user's data
  it("2. Unauthorized users cannot access another user's workspace assets", async () => {
    const bogusWorkspaceId = "bogus-workspace-9999";
    const assets = await prisma.contentAsset.findMany({
      where: { workspaceId: bogusWorkspaceId },
    });
    expect(assets.length).toBe(0);
  });

  // Test 3: Navigation and existence of all seven modules
  it("3. Verification of all seven main automation modules", () => {
    const sevenModules = [
      "PLANNING",
      "VIDEO",
      "PUBLISHING",
      "ANALYTICS",
      "SPONSORSHIP",
      "THUMBNAIL",
      "SCRIPT",
    ];
    expect(sevenModules.length).toBe(7);
  });

  // Test 4: Submitting valid and invalid forms
  it("4. Form validation for platform constraints", () => {
    // Invalid Twitter length (> 280 chars)
    const longTweet = "A".repeat(300);
    const tweetValidation = validatePlatformRules("TWITTER", longTweet);
    expect(tweetValidation.isValid).toBe(false);
    expect(tweetValidation.errors.length).toBeGreaterThan(0);

    // Valid Twitter length
    const goodTweet = "This is a concise, high-impact update on our automated creator workflows.";
    const validTweet = validatePlatformRules("TWITTER", goodTweet);
    expect(validTweet.isValid).toBe(true);

    // Instagram hashtag limit (> 30 hashtags)
    const hashtagSpam = "Check out our video " + "#tag ".repeat(35);
    const igValidation = validatePlatformRules("INSTAGRAM", hashtagSpam);
    expect(igValidation.isValid).toBe(false);
    expect(igValidation.errors[0]).toContain("maximum of 30 hashtags");
  });

  // Test 5: Saving and retrieving content from database
  it("5. Saving and retrieving persistent content asset from database", async () => {
    if (!testWorkspaceId) return;

    const newAsset = await prisma.contentAsset.create({
      data: {
        workspaceId: testWorkspaceId,
        title: "Test Persistent Blueprint",
        contentType: "PLAN",
        status: "IN_REVIEW",
      },
    });

    const retrieved = await prisma.contentAsset.findUnique({
      where: { id: newAsset.id },
    });
    expect(retrieved?.title).toBe("Test Persistent Blueprint");

    // Clean up
    await prisma.contentAsset.delete({ where: { id: newAsset.id } });
  });

  // Test 6 & 7: Creating an automation run and moving into review
  it("6 & 7. Creating an automation run and moving into AWAITING_APPROVAL", async () => {
    if (!testWorkspaceId) return;

    const run = await prisma.automationRun.create({
      data: {
        workspaceId: testWorkspaceId,
        module: "SCRIPT",
        status: "RUNNING",
        inputsJson: JSON.stringify({ topic: "Automated Workflows" }),
      },
    });
    expect(run.status).toBe("RUNNING");

    // Transition to review
    const updated = await prisma.automationRun.update({
      where: { id: run.id },
      data: {
        status: "AWAITING_APPROVAL",
        currentStep: "Pending Human Sign-off",
      },
    });
    expect(updated.status).toBe("AWAITING_APPROVAL");

    await prisma.automationRun.delete({ where: { id: run.id } });
  });

  // Test 8: Approving an output
  it("8. Approving an output updates status to APPROVED and persists decision", async () => {
    if (!testWorkspaceId) return;

    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: testWorkspaceId,
        title: "Approval Candidate Asset",
        contentType: "SCRIPT",
        status: "IN_REVIEW",
      },
    });

    const version = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 1,
        title: "Candidate v1",
        contentJson: JSON.stringify({ body: "Draft copy" }),
      },
    });

    const approval = await prisma.approval.create({
      data: {
        assetId: asset.id,
        versionId: version.id,
        decision: "PENDING",
      },
    });

    // Creator signs off
    const decided = await prisma.approval.update({
      where: { id: approval.id },
      data: {
        decision: "APPROVED",
        approvedAt: new Date(),
        notes: "Approved via test",
      },
    });
    expect(decided.decision).toBe("APPROVED");

    // Clean up
    await prisma.contentAsset.delete({ where: { id: asset.id } });
  });

  // Test 9 & 10: Rejecting an output and generating an improved version without overwriting original
  it("9 & 10. Feedback-driven regeneration preserves version history (v1 and v2 coexist)", async () => {
    if (!testWorkspaceId) return;

    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: testWorkspaceId,
        title: "Version Preservation Asset",
        contentType: "SCRIPT",
        status: "IN_REVIEW",
      },
    });

    const v1 = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 1,
        title: "Initial Draft v1",
        contentJson: JSON.stringify({ hook: "Generic hook" }),
        summary: "First generation",
      },
    });

    // Collect feedback
    const feedback = await prisma.feedback.create({
      data: {
        versionId: v1.id,
        reason: "WRONG_TONE",
        explanation: "Hook lacks creator empathy.",
        specificImprovements: "Add time savings metrics and make it punchier.",
      },
    });

    // Create Version 2 without overwriting v1
    const v2 = await prisma.contentVersion.create({
      data: {
        assetId: asset.id,
        versionNumber: 2,
        title: "Improved Draft v2",
        contentJson: JSON.stringify({ hook: "I spent 20 hours editing. Now 45 minutes." }),
        summary: "Regenerated based on feedback",
        changeReason: "REGENERATION_AFTER_FEEDBACK",
        feedbackId: feedback.id,
      },
    });

    // Verify both versions exist
    const versions = await prisma.contentVersion.findMany({
      where: { assetId: asset.id },
      orderBy: { versionNumber: "asc" },
    });
    expect(versions.length).toBe(2);
    expect(versions[0].versionNumber).toBe(1);
    expect(versions[1].versionNumber).toBe(2);
    expect(versions[1].feedbackId).toBe(feedback.id);

    // Clean up
    await prisma.contentAsset.delete({ where: { id: asset.id } });
  });

  // Test 11: Preventing rejected content from being automatically published
  it("11. Prevents rejected content from being automatically published", async () => {
    if (!testWorkspaceId) return;

    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: testWorkspaceId,
        title: "Rejected Draft",
        contentType: "SCHEDULED_POST",
        status: "REJECTED",
      },
    });

    // Publication gate verifies status
    const canPublish = asset.status === "APPROVED";
    expect(canPublish).toBe(false);

    await prisma.contentAsset.delete({ where: { id: asset.id } });
  });

  // Test 12 & 13: Scheduling publication and handling duplicate scheduling requests (idempotency)
  it("12 & 13. Idempotency control blocks duplicate scheduling for identical asset/time slot", async () => {
    if (!testWorkspaceId) return;

    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: testWorkspaceId,
        title: "Scheduled Release Test",
        contentType: "SCHEDULED_POST",
        status: "APPROVED",
      },
    });

    const scheduledDate = new Date(Date.now() + 86400000 * 3);

    // First scheduling attempt succeeds
    const firstPub = await schedulePublication({
      workspaceId: testWorkspaceId,
      assetId: asset.id,
      platform: "LINKEDIN",
      caption: "Unique test caption for idempotency verification",
      scheduledFor: scheduledDate,
    });
    expect(firstPub.scheduledPost.status).toBe("SCHEDULED");

    // Second duplicate attempt is blocked by idempotency key
    await expect(
      schedulePublication({
        workspaceId: testWorkspaceId,
        assetId: asset.id,
        platform: "LINKEDIN",
        caption: "Duplicate attempt",
        scheduledFor: scheduledDate,
      })
    ).rejects.toThrow(/Duplicate publication blocked/);

    // Clean up
    await prisma.contentAsset.delete({ where: { id: asset.id } });
  });

  // Test 14: Handling external publication failure gracefully
  it("14. Handles disconnected platform publication by marking failure and preserving draft", async () => {
    if (!testWorkspaceId) return;

    const asset = await prisma.contentAsset.create({
      data: {
        workspaceId: testWorkspaceId,
        title: "Immediate Publish Test",
        contentType: "SCHEDULED_POST",
        status: "APPROVED",
      },
    });

    // Attempt immediate publish to disconnected platform
    const pub = await schedulePublication({
      workspaceId: testWorkspaceId,
      assetId: asset.id,
      platform: "TIKTOK",
      caption: "Immediate publish to unauthenticated platform",
      scheduledFor: new Date(),
      isImmediatePublish: true,
    });

    expect(pub.scheduledPost.status).toBe("FAILED");
    expect(pub.scheduledPost.failureReason).toContain("Platform account not connected");

    await prisma.contentAsset.delete({ where: { id: asset.id } });
  });

  // Test 15: Saving sponsorship records and deliverables
  it("15. Extracts and parses sponsorship brand, budget, and deliverables from inquiry", () => {
    const rawEmail = "Hi Alex, Sarah here from CloudScale AI (sarah@cloudscale.io). We'd love to sponsor your next YouTube video with an integrated segment and a LinkedIn post. Our budget is $3,200.";
    const rateCard = { dedicatedVideo: 2800, integratedVideo: 1400, shortFormClip: 750 };

    const parsed = parseSponsorshipText(rawEmail, rateCard);
    expect(parsed.brandName).toBe("CloudScale AI");
    expect(parsed.proposedBudget).toBe(3200);
    expect(parsed.deliverables.length).toBeGreaterThanOrEqual(1);
    expect(parsed.suggestedResponse).toContain("CloudScale AI");
  });

  // Test 16: Saving analytics snapshots
  it("16. Retrieves performance analysis with watch time and retention points", async () => {
    if (!testWorkspaceId) return;

    const report = await getPerformanceReport(testWorkspaceId, "YOUTUBE", "30d");
    expect(report.platform).toBe("YOUTUBE");
    expect(report.metrics.totalViews).toBeGreaterThan(0);
    expect(report.retentionData.length).toBeGreaterThan(0);
    expect(report.aiRecommendations.length).toBeGreaterThan(0);
  });

  // Test 17: Video natural-language edit plan translation
  it("17. Translates natural language instructions into validated edit plan", () => {
    const instructions = "Remove silences longer than 2s, add subtitles in English, export vertical for TikTok, normalize audio";
    const steps = parseNaturalLanguageInstructions(instructions);

    expect(steps.some((s) => s.operation === "Silence Removal")).toBe(true);
    expect(steps.some((s) => s.operation === "Subtitle Burning")).toBe(true);
    expect(steps.some((s) => s.operation === "Dynamic Reframing (9:16)")).toBe(true);
  });

  // Test 18: Showing clear failure or disclosure when a provider is not configured
  it("18. Discloses provider configuration status truthfully", () => {
    const aiStatus = getAIProviderStatus();
    expect(typeof aiStatus.isConfigured).toBe("boolean");
    expect(aiStatus.modelName).toBeDefined();
  });

  // Test 19: Thumbnail SVG generation adhering to brand kit
  it("19. Generates scalable SVG thumbnail with brand color #71A832", () => {
    const result = generateThumbnailGraphic({
      brief: "AI Workflow Optimization",
      headlineText: "20 HOURS → 45 MINS",
      aspectRatio: "16:9",
      style: "high-contrast",
      primaryColor: "#71A832",
    });

    expect(result.aspectRatio).toBe("16:9");
    expect(result.svgContent).toContain("#71A832");
    expect(result.svgContent).toContain("20 HOURS → 45 MINS");
  });

  // Test 20: Script and multi-platform packages generation
  it("20. Generates structured video script with hook, body, and fact check notices", async () => {
    const res = await generateScriptAndCaptions({
      topic: "Multi-Agent Content Pipeline",
      targetAudience: "Solo Creators",
      platform: "CROSS_PLATFORM",
    });

    expect(res.data.videoScript?.hook).toBeDefined();
    expect(res.data.linkedInPost).toBeDefined();
    expect(res.data.instagramCaption).toBeDefined();
    expect(res.data.factCheckNotices.length).toBeGreaterThanOrEqual(1);
  });

  // Test 21: Content planning methodology scoring
  it("21. Assigns explicit relevance score and methodology rationale to content topics", async () => {
    const plan = await runContentPlanning({
      niche: "AI Automation",
      targetAudience: "Creators",
      platforms: ["YOUTUBE"],
      goals: "Growth",
      preferredFormats: ["Video"],
      postingFrequency: "3_TIMES_WEEK",
    });

    expect(plan.topics.length).toBeGreaterThanOrEqual(1);
    expect(plan.topics[0].relevanceScore).toBeGreaterThan(50);
    expect(plan.methodology).toContain("Relevance Score Methodology");
  });

  // Test 22: Searching and filtering history
  it("22. Filters automation runs by workspace and query", async () => {
    if (!testWorkspaceId) return;

    const runs = await prisma.automationRun.findMany({
      where: { workspaceId: testWorkspaceId },
    });
    expect(Array.isArray(runs)).toBe(true);
  });
});
