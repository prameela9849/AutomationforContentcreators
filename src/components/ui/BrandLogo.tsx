import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  /** collapsed: show only the icon symbol */
  collapsed?: boolean;
  /** size in pixels for the icon variant */
  iconSize?: number;
  /** width × height for the full logo variant */
  logoWidth?: number;
  logoHeight?: number;
  className?: string;
}

/**
 * Reusable CreatorFlow AI brand logo component.
 * - Full mode: shows the complete logo (symbol + wordmark)
 * - Collapsed mode: shows only the square icon symbol (for collapsed sidebar / favicon)
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  collapsed = false,
  iconSize = 36,
  logoWidth = 160,
  logoHeight = 60,
  className = "",
}) => {
  if (collapsed) {
    return (
      <Image
        src="/creatorflow-icon.png"
        alt="CreatorFlow AI logo"
        width={iconSize}
        height={iconSize}
        className={`object-contain rounded-xl ${className}`}
        priority
      />
    );
  }

  return (
    <Image
      src="/creatorflow-logo-clean.png"
      alt="CreatorFlow AI logo"
      width={logoWidth}
      height={logoHeight}
      className={`object-contain ${className}`}
      priority
    />
  );
};
