export interface ThumbnailInput {
  brief: string;
  headlineText?: string;
  subheadingText?: string;
  aspectRatio: "16:9" | "9:16" | "1:1";
  style: "high-contrast" | "minimal-dark" | "bold-editorial" | "quote-card";
  brandName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  stickers?: string[];
}

export interface ThumbnailResult {
  title: string;
  aspectRatio: string;
  dimensions: { width: number; height: number };
  svgContent: string;
  promptDescription: string;
  conceptNotes: string;
  suggestedABVariations: string[];
}

export function generateThumbnailGraphic(input: ThumbnailInput): ThumbnailResult {
  const ratio = input.aspectRatio || "16:9";
  const primaryColor = input.primaryColor || "#71A832";
  const secondaryColor = input.secondaryColor || "#111827";
  const brandName = input.brandName || "CREATORFLOW";

  let width = 1280;
  let height = 720;
  if (ratio === "9:16") {
    width = 1080;
    height = 1920;
  } else if (ratio === "1:1") {
    width = 1080;
    height = 1080;
  }

  // Derive headlines from brief if not explicitly given
  const headline = (input.headlineText || input.brief.slice(0, 30).toUpperCase() || "THE AI REVOLUTION").toUpperCase();
  const subhead = (input.subheadingText || "STEP-BY-STEP WORKFLOW GUIDE").toUpperCase();
  const badgeText = (input.stickers?.[0] || "PROVEN BLUEPRINT").toUpperCase();

  let svgContent = "";

  if (ratio === "16:9") {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${secondaryColor}"/>
      <stop offset="100%" stop-color="#0B0F17"/>
    </linearGradient>
    <linearGradient id="greenAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#5B8A26"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="25" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="1280" height="720" fill="url(#bgGrad)"/>
  <circle cx="1080" cy="180" r="280" fill="${primaryColor}" opacity="0.18" filter="url(#glow)"/>
  <rect x="70" y="70" width="1140" height="580" rx="28" fill="none" stroke="${primaryColor}" stroke-width="2.5" opacity="0.35"/>
  <!-- Top Badge -->
  <rect x="110" y="110" width="280" height="52" rx="12" fill="url(#greenAccent)"/>
  <text x="250" y="144" fill="#FFFFF0" font-family="Inter, sans-serif" font-weight="800" font-size="20" text-anchor="middle" letter-spacing="2">${badgeText}</text>
  <!-- Main Title -->
  <text x="110" y="310" fill="#FFFFF0" font-family="Inter, sans-serif" font-weight="900" font-size="78" letter-spacing="-1">${headline}</text>
  <!-- Subtitle -->
  <text x="110" y="390" fill="#9CA3AF" font-family="Inter, sans-serif" font-weight="700" font-size="34" letter-spacing="1">${subhead}</text>
  <!-- Accent Line -->
  <rect x="110" y="440" width="460" height="8" rx="4" fill="${primaryColor}"/>
  <!-- Brand Watermark -->
  <text x="110" y="560" fill="#6B7280" font-family="Inter, sans-serif" font-weight="700" font-size="22" letter-spacing="3">${brandName}</text>
</svg>`;
  } else if (ratio === "9:16") {
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${secondaryColor}"/>
      <stop offset="100%" stop-color="#05080E"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bgGrad)"/>
  <circle cx="540" cy="960" r="400" fill="${primaryColor}" opacity="0.14" filter="blur(60px)"/>
  <!-- Top Brand -->
  <text x="540" y="240" fill="#9CA3AF" font-family="Inter, sans-serif" font-weight="800" font-size="32" text-anchor="middle" letter-spacing="4">${brandName}</text>
  <!-- Pill Badge -->
  <rect x="290" y="600" width="500" height="76" rx="38" fill="${primaryColor}"/>
  <text x="540" y="650" fill="#FFFFF0" font-family="Inter, sans-serif" font-weight="900" font-size="32" text-anchor="middle" letter-spacing="2">${badgeText}</text>
  <!-- Huge Vertical Hook -->
  <text x="540" y="880" fill="#FFFFF0" font-family="Inter, sans-serif" font-weight="900" font-size="88" text-anchor="middle" letter-spacing="-1">${headline}</text>
  <!-- Subheading -->
  <text x="540" y="1040" fill="#D1D5DB" font-family="Inter, sans-serif" font-weight="700" font-size="44" text-anchor="middle">${subhead}</text>
  <!-- Callout Bottom Bar -->
  <rect x="180" y="1500" width="720" height="120" rx="24" fill="#1F2937" stroke="${primaryColor}" stroke-width="3"/>
  <text x="540" y="1575" fill="#FFFFF0" font-family="Inter, sans-serif" font-weight="800" font-size="36" text-anchor="middle">WATCH UNTIL END ⚡</text>
</svg>`;
  } else {
    // 1:1 Square
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${secondaryColor}"/>
      <stop offset="100%" stop-color="#0D1117"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bgGrad)"/>
  <rect x="60" y="60" width="960" height="960" rx="32" fill="none" stroke="${primaryColor}" stroke-width="3" opacity="0.4"/>
  <rect x="100" y="120" width="280" height="54" rx="12" fill="${primaryColor}"/>
  <text x="240" y="156" fill="#FFFFF0" font-family="Inter, sans-serif" font-weight="800" font-size="20" text-anchor="middle" letter-spacing="2">${badgeText}</text>
  <text x="100" y="380" fill="#FFFFF0" font-family="Inter, sans-serif" font-weight="900" font-size="72" letter-spacing="-1">${headline}</text>
  <text x="100" y="480" fill="#9CA3AF" font-family="Inter, sans-serif" font-weight="700" font-size="34">${subhead}</text>
  <rect x="100" y="540" width="400" height="6" fill="${primaryColor}"/>
  <text x="100" y="860" fill="#6B7280" font-family="Inter, sans-serif" font-weight="700" font-size="24" letter-spacing="3">${brandName}</text>
</svg>`;
  }

  return {
    title: `Graphic: ${headline.slice(0, 35)} (${ratio})`,
    aspectRatio: ratio,
    dimensions: { width, height },
    svgContent,
    promptDescription: `High-contrast YouTube thumbnail graphic featuring bold typography: '${headline}', subhead: '${subhead}', illuminated with brand green accent (#71A832) on dark textured charcoal background.`,
    conceptNotes: "Designed for high CTR on mobile browse feeds with strict 3-element visual hierarchy (Pill Badge -> Dominant Headline -> Sub-hook).",
    suggestedABVariations: [
      "Variation A: Current split-contrast typography",
      "Variation B: Add creator facial reaction on right side with eye gaze directed toward headline",
      "Variation C: Invert colors to light Ivory #FFFFF0 card with forest green accents",
    ],
  };
}
