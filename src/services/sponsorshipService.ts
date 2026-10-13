import prisma from "@/lib/prisma";

export interface SponsorshipInquiryInput {
  workspaceId: string;
  rawInquiryText: string;
  source?: "MANUAL" | "EMAIL_IMPORT";
}

export interface ExtractedSponsorshipDetails {
  brandName: string;
  contactName?: string;
  contactEmail?: string;
  proposedBudget: number;
  currency: string;
  deliverables: Array<{
    id: string;
    type: string;
    platform: string;
    length?: string;
    deadline?: string;
  }>;
  campaignPeriod: string;
  usageRights: string;
  creatorStandardRate: number;
  budgetComparison: {
    status: "ABOVE_RATE" | "AT_RATE" | "BELOW_RATE";
    difference: number;
    differencePercentage: number;
    guidance: string;
  };
  suggestedResponse: string;
}

export function parseSponsorshipText(rawText: string, rateCard: Record<string, number>): ExtractedSponsorshipDetails {
  const text = rawText || "";

  // Extract brand name
  let brandName = "Prospective Sponsor";
  const brandMatch = text.match(/(?:from|at|team at|representing)\s+([A-Z][A-Za-z0-9&.\-_]+(?:\s+[A-Z][A-Za-z0-9&.\-_]+)?)/i) ||
    text.match(/^([A-Z][A-Za-z0-9\s]+?)\s+(?:Inquiry|Sponsorship|Collaboration)/i);
  if (brandMatch && brandMatch[1]) {
    brandName = brandMatch[1].trim();
  }

  // Extract email
  let contactEmail = "";
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emailMatch && emailMatch[1]) {
    contactEmail = emailMatch[1];
  }

  // Extract contact name
  let contactName = "Brand Representative";
  const nameMatch = text.match(/(?:Hi|Hey|Dear)\s+([A-Za-z]+)/i) || text.match(/(?:Best|Regards|Thanks),\s*\n*([A-Za-z]+(?:\s+[A-Za-z]+)?)/i);
  if (nameMatch && nameMatch[1] && !["Alex", "Creator"].includes(nameMatch[1])) {
    contactName = nameMatch[1];
  }

  // Extract budget
  let proposedBudget = 0;
  const budgetMatch = text.match(/\$\s?([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);
  if (budgetMatch && budgetMatch[1]) {
    proposedBudget = parseFloat(budgetMatch[1].replace(/,/g, ""));
  }

  // Extract deliverables
  const deliverables: ExtractedSponsorshipDetails["deliverables"] = [];
  const lower = text.toLowerCase();

  let standardTotal = 0;
  if (lower.includes("youtube") || lower.includes("video") || lower.includes("integration") || lower.includes("shoutout")) {
    const isDedicated = lower.includes("dedicated");
    const rate = isDedicated ? (rateCard.dedicatedVideo || 2800) : (rateCard.integratedVideo || 1400);
    standardTotal += rate;
    deliverables.push({
      id: `del-${Date.now()}-1`,
      type: isDedicated ? "Dedicated YouTube Video" : "60-second Integrated Segment",
      platform: "YOUTUBE",
      length: isDedicated ? "Full Video (8-12 min)" : "60 Seconds",
      deadline: "Within 21 days",
    });
  }

  if (lower.includes("linkedin") || lower.includes("post")) {
    const rate = rateCard.shortFormClip || 750;
    standardTotal += rate;
    deliverables.push({
      id: `del-${Date.now()}-2`,
      type: "Sponsored LinkedIn Deep-Dive Post",
      platform: "LINKEDIN",
      length: "1 Carousel / Post",
      deadline: "Within 24 days",
    });
  }

  if (deliverables.length === 0) {
    standardTotal = rateCard.integratedVideo || 1400;
    deliverables.push({
      id: `del-${Date.now()}-1`,
      type: "Sponsored Content Package",
      platform: "YOUTUBE",
      length: "Custom",
      deadline: "TBD",
    });
  }

  // Budget comparison
  const diff = proposedBudget - standardTotal;
  const diffPct = standardTotal > 0 ? Math.round((diff / standardTotal) * 100) : 0;

  let compStatus: "ABOVE_RATE" | "AT_RATE" | "BELOW_RATE" = "AT_RATE";
  let guidance = "Proposed budget meets your standard rate card.";

  if (proposedBudget === 0) {
    compStatus = "BELOW_RATE";
    guidance = `No budget specified in inquiry. Quote your standard card rate of $${standardTotal.toLocaleString()}.`;
  } else if (diff < 0) {
    compStatus = "BELOW_RATE";
    guidance = `Offer is $${Math.abs(diff).toLocaleString()} (${Math.abs(diffPct)}%) below your standard card rate of $${standardTotal.toLocaleString()}. Recommend counter-offering or reducing deliverables.`;
  } else if (diff > 0) {
    compStatus = "ABOVE_RATE";
    guidance = `Offer is $${diff.toLocaleString()} (${diffPct}%) above standard rate. Great opportunity!`;
  }

  // Response draft
  const suggestedResponse = `Hi ${contactName || "there"},

Thank you for reaching out! We are familiar with ${brandName} and appreciate the alignment with our audience's focus on tech automation and creator leverage.

Regarding your requested deliverables (${deliverables.map(d => d.type).join(" + ")}):
Our standard rate card for this scope is $${standardTotal.toLocaleString()} USD.

${proposedBudget > 0 && proposedBudget < standardTotal
  ? `Given our shared alignment, we can meet in the middle at $${Math.round((proposedBudget + standardTotal) / 2).toLocaleString()} if we finalize the production schedule this week.`
  : `We can confirm a slot for this campaign. Let us know your preferred air-date window and we'll prepare the creative brief and campaign agreement.`}

Looking forward to collaborating!

Best regards,
Alex Rivera
CreatorFlow Studio`;

  return {
    brandName,
    contactName,
    contactEmail: contactEmail || "sponsor@example.com",
    proposedBudget,
    currency: "USD",
    deliverables,
    campaignPeriod: "Upcoming Month",
    usageRights: "Organic social distribution (90 days). Paid amplification requires +30% licensing fee.",
    creatorStandardRate: standardTotal,
    budgetComparison: {
      status: compStatus,
      difference: diff,
      differencePercentage: diffPct,
      guidance,
    },
    suggestedResponse,
  };
}

export async function processSponsorshipInquiry(input: SponsorshipInquiryInput) {
  const profile = await prisma.creatorProfile.findUnique({
    where: { workspaceId: input.workspaceId },
  });

  let rateCard = {
    dedicatedVideo: 2800,
    integratedVideo: 1400,
    shortFormClip: 750,
  };

  if (profile?.standardRateCard) {
    try {
      rateCard = { ...rateCard, ...JSON.parse(profile.standardRateCard) };
    } catch (e) {
      // ignore
    }
  }

  const parsed = parseSponsorshipText(input.rawInquiryText, rateCard);

  const lead = await prisma.sponsorshipLead.create({
    data: {
      workspaceId: input.workspaceId,
      brandName: parsed.brandName,
      contactName: parsed.contactName,
      contactEmail: parsed.contactEmail,
      proposedBudget: parsed.proposedBudget,
      currency: parsed.currency,
      creatorRateQuote: parsed.creatorStandardRate,
      deliverablesJson: JSON.stringify(parsed.deliverables),
      campaignPeriod: parsed.campaignPeriod,
      usageRights: parsed.usageRights,
      stage: "INQUIRY",
      inquirySource: input.source || "MANUAL",
      rawInquiryText: input.rawInquiryText,
      responseDraft: parsed.suggestedResponse,
      notes: `Extracted automatically. Budget comparison: ${parsed.budgetComparison.status} ($${parsed.budgetComparison.difference})`,
    },
  });

  // Create child deliverables
  for (const del of parsed.deliverables) {
    await prisma.campaignDeliverable.create({
      data: {
        leadId: lead.id,
        title: del.type,
        platform: del.platform,
        dueDate: new Date(Date.now() + 86400000 * 14),
        status: "PENDING",
      },
    });
  }

  return {
    lead,
    parsed,
  };
}
