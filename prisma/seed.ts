import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.publicationAttempt.deleteMany();
  await prisma.scheduledPublication.deleteMany();
  await prisma.contentCalendarEntry.deleteMany();
  await prisma.campaignDeliverable.deleteMany();
  await prisma.contractRecord.deleteMany();
  await prisma.invoiceRecord.deleteMany();
  await prisma.sponsorshipLead.deleteMany();
  await prisma.analyticsMetric.deleteMany();
  await prisma.analyticsSnapshot.deleteMany();
  await prisma.automationRunEvent.deleteMany();
  await prisma.automationRun.deleteMany();
  await prisma.contentVersion.deleteMany();
  await prisma.contentAsset.deleteMany();
  await prisma.platformConnection.deleteMany();
  await prisma.brandKit.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Default User
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const user = await prisma.user.create({
    data: {
      email: "creator@creatorflow.io",
      name: "Alex Rivera",
      passwordHash,
      role: "CREATOR",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  // User Preference
  await prisma.userPreference.create({
    data: {
      userId: user.id,
      emailNotifications: true,
      inAppNotifications: true,
      autoSaveDrafts: true,
      aiProviderPreference: "demo",
      defaultTimezone: "America/New_York",
    },
  });

  // 2. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Alex's Creator Studio",
      slug: "alex-creator-studio",
      ownerId: user.id,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId: workspace.id,
      userId: user.id,
      role: "OWNER",
    },
  });

  // 3. Creator Profile
  await prisma.creatorProfile.create({
    data: {
      workspaceId: workspace.id,
      niche: "AI Automation & Tech Productivity",
      targetAudience: "Indie creators, developers, AI enthusiasts, remote founders",
      targetRegion: "North America & Europe",
      languages: "English",
      platforms: "YOUTUBE,INSTAGRAM,LINKEDIN,TIKTOK,TWITTER",
      postingFrequency: "DAILY",
      topicsToAvoid: "Crypto scams, unverified AI hype, get-rich-quick themes",
      bio: "Helping modern creators build high-leverage workflows with practical AI automation.",
      monthlyViewsGoal: 250000,
      standardRateCard: JSON.stringify({
        dedicatedVideo: 2800,
        integratedVideo: 1400,
        shortFormClip: 750,
        newsletterMention: 500,
        crossPlatformPackage: 4500,
      }),
    },
  });

  // 4. Brand Kit
  await prisma.brandKit.create({
    data: {
      workspaceId: workspace.id,
      brandName: "CreatorFlow Studio",
      tagline: "High-leverage automated content workflows",
      primaryColor: "#71A832",
      secondaryColor: "#1F2937",
      accentColor: "#FFFFF0",
      fontFamily: "Inter, sans-serif",
      headingFont: "Inter, sans-serif",
      toneOfVoice: "Actionable, direct, credible, empowering, zero-fluff",
      visualGuidelines: "High contrast typography, minimal background noise, clean green callouts",
      templatesJson: JSON.stringify([
        { id: "tmpl-1", name: "YouTube Clean 16:9", ratio: "16:9", style: "minimal-dark" },
        { id: "tmpl-2", name: "TikTok / Reel 9:16", ratio: "9:16", style: "bold-subtitle" },
        { id: "tmpl-3", name: "LinkedIn Carousel 1:1", ratio: "1:1", style: "executive-card" },
      ]),
    },
  });

  // 5. Platform Connections
  await prisma.platformConnection.createMany({
    data: [
      {
        workspaceId: workspace.id,
        platform: "YOUTUBE",
        accountName: "CreatorFlow AI",
        accountId: "UC_creatorflow_demo",
        status: "CONNECTED",
        lastSyncedAt: new Date(),
        permissions: JSON.stringify(["youtube.upload", "youtube.readonly", "yt-analytics.readonly"]),
      },
      {
        workspaceId: workspace.id,
        platform: "LINKEDIN",
        accountName: "Alex Rivera (CreatorFlow)",
        accountId: "urn:li:person:demo123",
        status: "CONNECTED",
        lastSyncedAt: new Date(),
        permissions: JSON.stringify(["w_member_social", "r_liteprofile"]),
      },
      {
        workspaceId: workspace.id,
        platform: "INSTAGRAM",
        accountName: "@creatorflow.ai",
        accountId: "ig_demo_creatorflow",
        status: "CONNECTED",
        lastSyncedAt: new Date(),
        permissions: JSON.stringify(["instagram_basic", "instagram_content_publish"]),
      },
      {
        workspaceId: workspace.id,
        platform: "TIKTOK",
        accountName: "@creatorflow",
        status: "MOCK_DEMO",
        lastSyncedAt: null,
        permissions: JSON.stringify(["video.upload.demo"]),
      },
      {
        workspaceId: workspace.id,
        platform: "TWITTER",
        accountName: "@creatorflow_ai",
        accountId: "tw_demo_1234",
        status: "CONNECTED",
        lastSyncedAt: new Date(),
        permissions: JSON.stringify(["tweet.read", "tweet.write"]),
      },
    ],
  });

  // 6. Content Assets & Automation Runs for Module Workflows

  // Asset 1: Automated Content Plan (Module 1)
  const planAsset = await prisma.contentAsset.create({
    data: {
      workspaceId: workspace.id,
      title: "Q4 30-Day AI Productivity Blueprint",
      contentType: "PLAN",
      status: "APPROVED",
      currentVersion: 1,
      metadata: JSON.stringify({
        niche: "AI Automation",
        targetAudience: "Content Creators",
        durationDays: 30,
        contentCount: 12,
      }),
    },
  });

  const planVersion = await prisma.contentVersion.create({
    data: {
      assetId: planAsset.id,
      versionNumber: 1,
      title: "Q4 30-Day AI Productivity Blueprint (v1)",
      contentJson: JSON.stringify({
        summary: "30-day cross-platform blueprint focused on practical creator workflows without burnout.",
        relevanceScore: 94,
        methodology: "Calculated from search volume velocity (+42% YoY), creator community question volume (Reddit r/ContentCreation + r/Automate), and low competitive saturation for multi-agent workflows.",
        topics: [
          {
            id: "top-1",
            title: "5 AI Agents That Replaced My 20-Hour Editing Week",
            format: "YouTube Long-form + 3 Shorts",
            hook: "I stopped editing videos manually 3 months ago. Here is the exact pipeline.",
            relevanceScore: 96,
            source: "YouTube Trending / Community Forum discussions",
            sourceUrl: "https://youtube.com/results?search_query=ai+video+automation",
            retrievalTimestamp: new Date().toISOString(),
            status: "APPROVED",
          },
          {
            id: "top-2",
            title: "The Creator Rate Card Formula: How to Charge $2,500+ per Sponsor",
            format: "LinkedIn Carousel + Newsletter",
            hook: "Most creators undercharge sponsors by 60%. Use this 3-metric formula.",
            relevanceScore: 91,
            source: "Creator Economy Survey 2026",
            sourceUrl: "https://creatoreconomy.research/rates",
            retrievalTimestamp: new Date().toISOString(),
            status: "SAVED",
          },
          {
            id: "top-3",
            title: "Automate Your YouTube Thumbnail A/B Testing in 10 Minutes",
            format: "YouTube Shorts / Reel",
            hook: "How top channels test 4 thumbnails without touching Photoshop.",
            relevanceScore: 89,
            source: "Twitter Creator Discussions",
            sourceUrl: "https://x.com/search?q=thumbnail+ab+test",
            retrievalTimestamp: new Date().toISOString(),
            status: "PLANNED",
          },
        ],
      }),
      summary: "High-scoring content opportunities curated from verified creator community demand.",
      createdById: user.id,
    },
  });

  const planRun = await prisma.automationRun.create({
    data: {
      workspaceId: workspace.id,
      module: "PLANNING",
      runNumber: 1,
      status: "APPROVED",
      currentStep: "Completed and Approved",
      inputSummary: "Niche: AI Automation, Goal: Reach & Sponsorships, 30-Day Plan",
      inputsJson: JSON.stringify({
        niche: "AI Automation",
        targetAudience: "Content Creators, Freelancers",
        targetRegion: "Global",
        languages: "English",
        postingFrequency: "3_TIMES_WEEK",
        platforms: ["YOUTUBE", "LINKEDIN", "INSTAGRAM"],
      }),
      outputsJson: JSON.stringify({
        totalTopicsFound: 14,
        recommendedTopics: 3,
        highestRelevanceScore: 96,
      }),
      assetId: planAsset.id,
      isDemoResult: false,
      completedAt: new Date(),
    },
  });

  await prisma.approval.create({
    data: {
      runId: planRun.id,
      assetId: planAsset.id,
      versionId: planVersion.id,
      decision: "APPROVED",
      approvedById: user.id,
      approvedAt: new Date(),
      notes: "Topics align well with upcoming sponsorship campaigns.",
    },
  });

  // Asset 2: Video Repurposing Run (Module 2) - In Awaiting Approval State
  const videoAsset = await prisma.contentAsset.create({
    data: {
      workspaceId: workspace.id,
      title: "Mastering AI Repurposing — 3 Vertical Clips",
      contentType: "VIDEO_CLIP",
      status: "IN_REVIEW",
      currentVersion: 1,
      mediaUrl: "/uploads/demo-sample-video.mp4",
      metadata: JSON.stringify({
        sourceDuration: "12m 45s",
        targetRatio: "9:16",
        clipCount: 3,
        subtitlesEnabled: true,
      }),
    },
  });

  const videoVersion = await prisma.contentVersion.create({
    data: {
      assetId: videoAsset.id,
      versionNumber: 1,
      title: "Mastering AI Repurposing (Cut Clips v1)",
      contentJson: JSON.stringify({
        sourceTitle: "Complete AI Content Production Masterclass (12:45)",
        clips: [
          {
            id: "clip-1",
            title: "Why Manual Video Editing is Dead for Solo Creators",
            startTime: "01:15",
            endTime: "02:05",
            duration: "50s",
            ratio: "9:16",
            hookScore: 92,
            subtitles: "Generated English subtitles with bold keyword highlighting",
            downloadUrl: "/uploads/demo-clip-1.mp4",
            summary: "Discusses timeline reduction from 8 hours to 25 minutes using speech detection.",
          },
          {
            id: "clip-2",
            title: "The 3 Tools I Use Every Single Morning",
            startTime: "05:40",
            endTime: "06:22",
            duration: "42s",
            ratio: "9:16",
            hookScore: 88,
            subtitles: "Generated English subtitles with brand green accent",
            downloadUrl: "/uploads/demo-clip-2.mp4",
            summary: "Fast breakdown of research, prompt generation, and thumbnail rendering.",
          },
        ],
        editPlan: [
          "1. Detect silences > 1.8s and trim",
          "2. Reframe landscape 16:9 to vertical 9:16 centered on speaker",
          "3. Burn dynamic subtitles using brand font Inter and primary color #71A832",
          "4. Normalize audio peak to -14 LUFS",
        ],
      }),
      summary: "Generated 2 high-energy vertical shorts with dynamic subtitles.",
      qualityWarnings: JSON.stringify([
        "Clip 1 audio has slight room echo between 01:25-01:30. Normalized gain applied.",
      ]),
      createdById: user.id,
    },
  });

  const videoRun = await prisma.automationRun.create({
    data: {
      workspaceId: workspace.id,
      module: "VIDEO",
      runNumber: 2,
      status: "AWAITING_APPROVAL",
      currentStep: "Pending Human Review",
      inputSummary: "Source: Masterclass (12:45), Target: 9:16 TikTok/Reels, Dynamic Subs",
      inputsJson: JSON.stringify({
        videoTitle: "Complete AI Content Production Masterclass",
        platforms: ["TIKTOK", "INSTAGRAM", "YOUTUBE"],
        aspectRatio: "9:16",
        clipCount: 2,
        subtitleLanguage: "English",
        editingInstructions: "Remove silences over 2s, add high-contrast subtitles, export vertical",
      }),
      outputsJson: JSON.stringify({
        clipsExtracted: 2,
        renderStatus: "COMPLETED",
        subtitlesRendered: true,
      }),
      assetId: videoAsset.id,
      isDemoResult: false,
    },
  });

  await prisma.approval.create({
    data: {
      runId: videoRun.id,
      assetId: videoAsset.id,
      versionId: videoVersion.id,
      decision: "PENDING",
    },
  });

  // Asset 3: Script & Caption Generation (Module 7) with a Version 2 after Feedback!
  const scriptAsset = await prisma.contentAsset.create({
    data: {
      workspaceId: workspace.id,
      title: "5 AI Agents That Replaced My Editing Week — Full Package",
      contentType: "SCRIPT",
      status: "IN_REVIEW",
      currentVersion: 2,
      metadata: JSON.stringify({
        platform: "CROSS_PLATFORM",
        formats: ["YOUTUBE_SCRIPT", "LINKEDIN_POST", "IG_CAPTION"],
      }),
    },
  });

  const scriptV1 = await prisma.contentVersion.create({
    data: {
      assetId: scriptAsset.id,
      versionNumber: 1,
      title: "5 AI Agents Video Script (Draft 1)",
      contentJson: JSON.stringify({
        videoScript: {
          hook: "Stop editing your videos by hand right now.",
          intro: "In this video, I will show you 5 tools that do it automatically.",
          body: "1. Tool A for audio. 2. Tool B for cuts. 3. Tool C for captions.",
          cta: "Subscribe for more AI tips.",
        },
        linkedinPost: "AI is changing video editing. Here are 5 tools you need to know. What are you using?",
        instagramCaption: "No more 10 hour edits! 🎬 Drop a comment below! #AI #VideoEditing",
      }),
      summary: "First generation of script and captions.",
      createdById: user.id,
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
  });

  const feedback = await prisma.feedback.create({
    data: {
      versionId: scriptV1.id,
      reason: "WRONG_TONE",
      explanation: "The hook is too generic and sounds like clickbait without real creator empathy.",
      specificImprovements: "Make the hook emphasize the 20 hours saved and include specific metrics. Flesh out the LinkedIn post with step-by-step breakdown format.",
      referenceMaterial: "Reference my previous video on workflow leverage.",
      createdAt: new Date(Date.now() - 3600000 * 3),
    },
  });

  const scriptV2 = await prisma.contentVersion.create({
    data: {
      assetId: scriptAsset.id,
      versionNumber: 2,
      title: "5 AI Agents Video Script (Improved v2)",
      contentJson: JSON.stringify({
        videoScript: {
          hook: "Last month, I spent 22 hours staring at a Premiere Pro timeline cutting out awkward pauses. This month? Exactly 47 minutes. Here is the multi-agent system that changed that.",
          intro: "Instead of one clunky tool, modern creators are using a chain of focused AI micro-agents. Here are the 5 specific tools and how they link together.",
          body: [
            "1. Whisper-based transcript segmenter to flag key moments",
            "2. Silence removal algorithm with custom 1.8s breath threshold",
            "3. Auto-framing agent that tracks the speaker into 9:16",
            "4. Dynamic keyword subtitle generator styled to brand colors",
            "5. Quality inspector agent checking audio clipping and export bitrate",
          ],
          cta: "Check the description for the open workflow template, and let me know your biggest editing bottleneck in the comments.",
        },
        linkedinPost: "Most creators burn out not from brainstorming ideas, but from the mechanical drag of editing.\n\n3 months ago, my average video required 8+ hours of editing.\nToday: 35 minutes.\n\nHere is the 5-layer pipeline:\n→ Layer 1: Audio leveling & silence stripping\n→ Layer 2: Highlight detection\n→ Layer 3: Vertical reframing\n→ Layer 4: Brand subtitle styling (#71A832)\n→ Layer 5: Automated publishing checks\n\nWhich stage of editing currently steals the most time in your week?",
        instagramCaption: "From 8-hour editing marathons to under 40 minutes ⏱️⚡\n\nSolo creators don't need a huge team anymore—just smart automation layers.\n\nSave this for your next recording day 📌\n\n#CreatorEconomy #AIAutomation #VideoProduction #WorkflowHacks #TechCreators",
      }),
      summary: "Regenerated version addressing tone and adding actionable metric breakdown.",
      changeReason: "REGENERATION_AFTER_FEEDBACK",
      feedbackId: feedback.id,
      qualityWarnings: JSON.stringify([
        "Fact-check: Ensure 47-minute processing time disclaimer notes that it depends on hardware / upload speed.",
      ]),
      createdById: user.id,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  const scriptRun = await prisma.automationRun.create({
    data: {
      workspaceId: workspace.id,
      module: "SCRIPT",
      runNumber: 3,
      status: "AWAITING_APPROVAL",
      currentStep: "Reviewing Improved Version 2",
      inputSummary: "Topic: 5 AI Agents That Replaced My Editing Week, Cross-platform Package",
      inputsJson: JSON.stringify({
        topic: "5 AI Agents That Replaced My 20-Hour Editing Week",
        targetAudience: "Solo Creators, Indie Hackers",
        platform: "CROSS_PLATFORM",
        toneOfVoice: "Authoritative, empathetic, actionable",
        language: "English",
        objective: "Educate and drive newsletter signups",
      }),
      outputsJson: JSON.stringify({
        versionsCreated: 2,
        currentVersion: 2,
        formatsCount: 3,
      }),
      assetId: scriptAsset.id,
      isDemoResult: false,
    },
  });

  await prisma.approval.create({
    data: {
      runId: scriptRun.id,
      assetId: scriptAsset.id,
      versionId: scriptV2.id,
      decision: "PENDING",
      notes: "Awaiting final signoff on improved v2.",
    },
  });

  // Asset 4: Thumbnail Creation (Module 6)
  const thumbAsset = await prisma.contentAsset.create({
    data: {
      workspaceId: workspace.id,
      title: "High-CTR Thumbnail: AI Agents 20-Hour Editing",
      contentType: "GRAPHIC",
      status: "APPROVED",
      currentVersion: 1,
      thumbnailUrl: "/uploads/demo-thumbnail-1.svg",
      metadata: JSON.stringify({
        aspectRatio: "16:9",
        format: "SVG_CANVAS",
        style: "high-contrast-tech",
      }),
    },
  });

  const thumbVersion = await prisma.contentVersion.create({
    data: {
      assetId: thumbAsset.id,
      versionNumber: 1,
      title: "AI Agents Thumbnail (v1)",
      contentJson: JSON.stringify({
        dimensions: { width: 1280, height: 720, ratio: "16:9" },
        headlineText: "20 HOURS → 45 MINS",
        subheading: "MY AI EDITING PIPELINE",
        brandColor: "#71A832",
        backgroundColor: "#111827",
        layout: "split-contrast",
        stickers: ["NEW 2026 WORKFLOW", "100% AUTOMATED"],
      }),
      summary: "Clean high-CTR thumbnail concept adhering to Brand Kit colors (#71A832).",
      createdById: user.id,
    },
  });

  const thumbRun = await prisma.automationRun.create({
    data: {
      workspaceId: workspace.id,
      module: "THUMBNAIL",
      runNumber: 4,
      status: "APPROVED",
      currentStep: "Approved for Export",
      inputSummary: "Concept: 20 Hours to 45 Mins, 16:9, Dark theme with Brand Green",
      inputsJson: JSON.stringify({
        brief: "Create a striking thumbnail contrasting manual editing vs AI automation",
        ratio: "16:9",
        brandKitApplied: true,
      }),
      outputsJson: JSON.stringify({
        assetsGenerated: 1,
        format: "SVG/PNG",
      }),
      assetId: thumbAsset.id,
      isDemoResult: false,
      completedAt: new Date(),
    },
  });

  await prisma.approval.create({
    data: {
      runId: thumbRun.id,
      assetId: thumbAsset.id,
      versionId: thumbVersion.id,
      decision: "APPROVED",
      approvedById: user.id,
      approvedAt: new Date(),
      notes: "Great contrast, approved for YouTube publication.",
    },
  });

  // 7. Scheduled Publications for Calendar (Module 3)
  const scheduledPost1 = await prisma.scheduledPublication.create({
    data: {
      workspaceId: workspace.id,
      assetId: scriptAsset.id,
      platform: "LINKEDIN",
      accountName: "Alex Rivera (CreatorFlow)",
      caption: "Most creators burn out not from brainstorming ideas, but from the mechanical drag of editing...",
      scheduledFor: new Date(Date.now() + 86400000 * 2), // 2 days from now
      timeZone: "America/New_York",
      status: "SCHEDULED",
      idempotencyKey: `sched-li-${Date.now()}-1`,
    },
  });

  const scheduledPost2 = await prisma.scheduledPublication.create({
    data: {
      workspaceId: workspace.id,
      assetId: thumbAsset.id,
      platform: "YOUTUBE",
      accountName: "CreatorFlow AI",
      caption: "5 AI Agents That Replaced My 20-Hour Editing Week — Full Workflow",
      scheduledFor: new Date(Date.now() + 86400000 * 4), // 4 days from now
      timeZone: "America/New_York",
      status: "SCHEDULED",
      idempotencyKey: `sched-yt-${Date.now()}-2`,
    },
  });

  // Calendar entries
  await prisma.contentCalendarEntry.createMany({
    data: [
      {
        workspaceId: workspace.id,
        assetId: scriptAsset.id,
        title: "LinkedIn: 5-Layer AI Editing Pipeline",
        platform: "LINKEDIN",
        contentType: "POST",
        scheduledDate: scheduledPost1.scheduledFor,
        status: "READY",
        colorCode: "#0A66C2",
      },
      {
        workspaceId: workspace.id,
        assetId: thumbAsset.id,
        title: "YouTube: 5 AI Agents That Replaced My 20-Hour Editing Week",
        platform: "YOUTUBE",
        contentType: "VIDEO",
        scheduledDate: scheduledPost2.scheduledFor,
        status: "PLANNED",
        colorCode: "#FF0000",
      },
      {
        workspaceId: workspace.id,
        title: "Instagram Reel: Silence Stripping Demo",
        platform: "INSTAGRAM",
        contentType: "REEL",
        scheduledDate: new Date(Date.now() + 86400000 * 5),
        status: "PLANNED",
        colorCode: "#E1306C",
      },
    ],
  });

  // 8. Sponsorship & Brand Deals (Module 5)
  const lead1 = await prisma.sponsorshipLead.create({
    data: {
      workspaceId: workspace.id,
      brandName: "CloudScale AI",
      contactName: "Sarah Jenkins",
      contactEmail: "sarah.j@cloudscale.io",
      proposedBudget: 3200,
      currency: "USD",
      creatorRateQuote: 3500,
      stage: "NEGOTIATING",
      inquirySource: "EMAIL_IMPORT",
      rawInquiryText: "Hi Alex, We love your breakdown of modern AI workflows. We'd like to sponsor your next YouTube video with a 60-second integrated shoutout and a dedicated LinkedIn post. Our target budget is $3,200. Can we run this in late November?",
      deliverablesJson: JSON.stringify([
        { id: "del-1", type: "INTEGRATED_SPONSOR_SEGMENT", platform: "YOUTUBE", length: "60 seconds", deadline: new Date(Date.now() + 86400000 * 14).toISOString() },
        { id: "del-2", type: "SPONSORED_POST", platform: "LINKEDIN", length: "1 Post", deadline: new Date(Date.now() + 86400000 * 16).toISOString() },
      ]),
      campaignPeriod: "Q4 2026",
      usageRights: "90-day organic digital usage rights across brand social handles",
      responseDraft: "Hi Sarah,\n\nThanks for reaching out! Your product aligns naturally with my audience's focus on cloud architecture and AI workflow reliability.\n\nMy standard rate for a 60s integrated YouTube segment + dedicated LinkedIn post is $3,500. Given the close alignment and 90-day usage rights requested, I can lock in the package at $3,400 for our late November slot.\n\nLet me know if that works for your team and I'll send over our campaign agreement and deliverable outline.\n\nBest,\nAlex",
      notes: "Brand is well funded, previous sponsor of similar channels.",
    },
  });

  await prisma.campaignDeliverable.createMany({
    data: [
      {
        leadId: lead1.id,
        title: "YouTube 60s Integration Segment",
        platform: "YOUTUBE",
        dueDate: new Date(Date.now() + 86400000 * 14),
        status: "IN_PROGRESS",
      },
      {
        leadId: lead1.id,
        title: "LinkedIn Companion Deep-Dive Post",
        platform: "LINKEDIN",
        dueDate: new Date(Date.now() + 86400000 * 16),
        status: "PENDING",
      },
    ],
  });

  const lead2 = await prisma.sponsorshipLead.create({
    data: {
      workspaceId: workspace.id,
      brandName: "DevTools Pro",
      contactName: "Marcus Vance",
      contactEmail: "marcus@devtoolspro.com",
      proposedBudget: 1500,
      currency: "USD",
      creatorRateQuote: 1400,
      stage: "SIGNED",
      inquirySource: "MANUAL",
      rawInquiryText: "Looking for an integrated mention on your upcoming developer productivity YouTube video.",
      deliverablesJson: JSON.stringify([
        { id: "del-3", type: "INTEGRATED_SPONSOR_SEGMENT", platform: "YOUTUBE", length: "45 seconds", deadline: new Date(Date.now() + 86400000 * 7).toISOString() },
      ]),
      campaignPeriod: "October 2026",
      usageRights: "Organic video placement only",
      responseDraft: "Confirmed and contract executed.",
      notes: "Deposit paid. Script segment submitted for review.",
    },
  });

  await prisma.invoiceRecord.create({
    data: {
      leadId: lead2.id,
      invoiceNumber: "INV-2026-089",
      amount: 1500,
      currency: "USD",
      status: "ISSUED",
      dueDate: new Date(Date.now() + 86400000 * 30),
    },
  });

  // 9. Performance Analytics Snapshots (Module 4)
  const ytSnapshot = await prisma.analyticsSnapshot.create({
    data: {
      workspaceId: workspace.id,
      platform: "YOUTUBE",
      accountId: "UC_creatorflow_demo",
      periodStart: new Date(Date.now() - 86400000 * 30),
      periodEnd: new Date(),
      metricsJson: JSON.stringify({
        totalViews: 148200,
        watchTimeHours: 8940,
        subscribersGained: 3410,
        averageViewDuration: "4m 12s",
        clickThroughRate: "8.4%",
        engagementRate: "6.2%",
      }),
      insightsJson: JSON.stringify({
        topPerformingTopic: "AI Agents & Workflow Automations (+48% higher retention vs channel average)",
        bestPublishingWindow: "Tuesday & Thursday between 1:00 PM - 3:30 PM EST",
        retentionCliffNote: "Viewer drop-off spikes at 00:45 when intros exceed 15 seconds. Keep hook under 12s.",
        recommendations: [
          "Produce 2 follow-ups on Multi-Agent Creator Pipelines based on high re-watch rate on chapters 3 & 4.",
          "Test thumbnail style 'Split Contrast' which delivered 10.1% CTR vs 6.8% channel baseline.",
        ],
      }),
      isDemo: false,
    },
  });

  await prisma.analyticsMetric.createMany({
    data: [
      { snapshotId: ytSnapshot.id, metricName: "views", metricValue: 148200, unit: "views", periodLabel: "Last 30 Days" },
      { snapshotId: ytSnapshot.id, metricName: "watch_time", metricValue: 8940, unit: "hours", periodLabel: "Last 30 Days" },
      { snapshotId: ytSnapshot.id, metricName: "engagement", metricValue: 6.2, unit: "percent", periodLabel: "Last 30 Days" },
      { snapshotId: ytSnapshot.id, metricName: "click_through_rate", metricValue: 8.4, unit: "percent", periodLabel: "Last 30 Days" },
    ],
  });

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: user.id,
        type: "APPROVAL_NEEDED",
        title: "Video Repurposing Awaiting Approval",
        message: "2 vertical video clips generated from 'Masterclass' require your review.",
        link: "/automations/video",
        read: false,
      },
      {
        workspaceId: workspace.id,
        userId: user.id,
        type: "APPROVAL_NEEDED",
        title: "Script v2 Ready for Review",
        message: "Regenerated script '5 AI Agents' incorporating your tone feedback is ready.",
        link: "/automations/scripts",
        read: false,
      },
      {
        workspaceId: workspace.id,
        userId: user.id,
        type: "DEADLINE_ALERT",
        title: "Sponsor Deliverable Approaching",
        message: "DevTools Pro integrated segment is due in 7 days.",
        link: "/automations/sponsorships",
        read: false,
      },
      {
        workspaceId: workspace.id,
        userId: user.id,
        type: "POST_PUBLISHED",
        title: "Weekly Planning Completed",
        message: "Automated Content Planning generated 3 approved topics for Q4.",
        link: "/automations/planning",
        read: true,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
