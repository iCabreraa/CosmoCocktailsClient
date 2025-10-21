/**
 * Responsive Design Utilities
 *
 * Utility functions for responsive design operations and calculations
 */

import { breakpoints, BreakpointName } from "./breakpoints";

/**
 * Calculate responsive font size based on breakpoint
 */
export function getResponsiveFontSize(
  baseSize: number,
  breakpoint: BreakpointName
): number {
  const multipliers = {
    mobile: 1,
    tablet: 1.1,
    desktop: 1.2,
    largeDesktop: 1.3,
  };

  return Math.round(baseSize * multipliers[breakpoint]);
}

/**
 * Calculate responsive spacing based on breakpoint
 */
export function getResponsiveSpacing(
  baseSpacing: number,
  breakpoint: BreakpointName
): number {
  const multipliers = {
    mobile: 1,
    tablet: 1.25,
    desktop: 1.5,
    largeDesktop: 1.75,
  };

  return Math.round(baseSpacing * multipliers[breakpoint]);
}

/**
 * Get responsive grid columns count
 */
export function getResponsiveGridColumns(breakpoint: BreakpointName): number {
  const columns = {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    largeDesktop: 4,
  };

  return columns[breakpoint];
}

/**
 * Get responsive container max width
 */
export function getResponsiveMaxWidth(breakpoint: BreakpointName): string {
  const maxWidths = {
    mobile: "100%",
    tablet: "768px",
    desktop: "1024px",
    largeDesktop: "1280px",
  };

  return maxWidths[breakpoint];
}

/**
 * Get responsive padding values
 */
export function getResponsivePadding(breakpoint: BreakpointName): string {
  const paddings = {
    mobile: "1rem",
    tablet: "1.5rem",
    desktop: "2rem",
    largeDesktop: "2.5rem",
  };

  return paddings[breakpoint];
}

/**
 * Get responsive margin values
 */
export function getResponsiveMargin(breakpoint: BreakpointName): string {
  const margins = {
    mobile: "0.5rem",
    tablet: "1rem",
    desktop: "1.5rem",
    largeDesktop: "2rem",
  };

  return margins[breakpoint];
}

/**
 * Get responsive gap values for flexbox/grid
 */
export function getResponsiveGap(breakpoint: BreakpointName): string {
  const gaps = {
    mobile: "0.75rem",
    tablet: "1rem",
    desktop: "1.25rem",
    largeDesktop: "1.5rem",
  };

  return gaps[breakpoint];
}

/**
 * Get responsive border radius
 */
export function getResponsiveBorderRadius(breakpoint: BreakpointName): string {
  const radius = {
    mobile: "0.375rem",
    tablet: "0.5rem",
    desktop: "0.625rem",
    largeDesktop: "0.75rem",
  };

  return radius[breakpoint];
}

/**
 * Get responsive shadow values
 */
export function getResponsiveShadow(breakpoint: BreakpointName): string {
  const shadows = {
    mobile: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    tablet:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    desktop:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    largeDesktop:
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  };

  return shadows[breakpoint];
}

/**
 * Generate responsive CSS custom properties
 */
export function generateResponsiveCSSProperties(
  breakpoint: BreakpointName
): Record<string, string> {
  return {
    "--responsive-font-size": `${getResponsiveFontSize(16, breakpoint)}px`,
    "--responsive-spacing": getResponsiveSpacing(16, breakpoint) + "px",
    "--responsive-padding": getResponsivePadding(breakpoint),
    "--responsive-margin": getResponsiveMargin(breakpoint),
    "--responsive-gap": getResponsiveGap(breakpoint),
    "--responsive-border-radius": getResponsiveBorderRadius(breakpoint),
    "--responsive-shadow": getResponsiveShadow(breakpoint),
    "--responsive-max-width": getResponsiveMaxWidth(breakpoint),
    "--responsive-grid-columns":
      getResponsiveGridColumns(breakpoint).toString(),
  };
}

/**
 * Get responsive image sizes for different breakpoints
 */
export function getResponsiveImageSizes(breakpoint: BreakpointName): string {
  const sizes = {
    mobile: "(max-width: 767px) 100vw",
    tablet: "(max-width: 1023px) 50vw",
    desktop: "(max-width: 1439px) 33vw",
    largeDesktop: "25vw",
  };

  return sizes[breakpoint];
}

/**
 * Get responsive container classes for Tailwind CSS
 */
export function getResponsiveContainerClasses(): string {
  return "w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl";
}

/**
 * Get responsive grid classes for Tailwind CSS
 */
export function getResponsiveGridClasses(): string {
  return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8";
}

/**
 * Get responsive flex classes for Tailwind CSS
 */
export function getResponsiveFlexClasses(): string {
  return "flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8";
}

/**
 * Get responsive text classes for Tailwind CSS
 */
export function getResponsiveTextClasses(): string {
  return "text-sm md:text-base lg:text-lg xl:text-xl";
}

/**
 * Get responsive spacing classes for Tailwind CSS
 */
export function getResponsiveSpacingClasses(): string {
  return "p-4 md:p-6 lg:p-8 xl:p-10";
}

/**
 * Get responsive margin classes for Tailwind CSS
 */
export function getResponsiveMarginClasses(): string {
  return "m-2 md:m-4 lg:m-6 xl:m-8";
}

/**
 * Get responsive gap classes for Tailwind CSS
 */
export function getResponsiveGapClasses(): string {
  return "gap-3 md:gap-4 lg:gap-6 xl:gap-8";
}

/**
 * Get responsive border radius classes for Tailwind CSS
 */
export function getResponsiveBorderRadiusClasses(): string {
  return "rounded-md md:rounded-lg lg:rounded-xl xl:rounded-2xl";
}

/**
 * Get responsive shadow classes for Tailwind CSS
 */
export function getResponsiveShadowClasses(): string {
  return "shadow-sm md:shadow-md lg:shadow-lg xl:shadow-xl";
}

/**
 * Check if a breakpoint is mobile
 */
export function isMobileBreakpoint(breakpoint: BreakpointName): boolean {
  return breakpoint === "mobile";
}

/**
 * Check if a breakpoint is tablet or larger
 */
export function isTabletOrLarger(breakpoint: BreakpointName): boolean {
  return ["tablet", "desktop", "largeDesktop"].includes(breakpoint);
}

/**
 * Check if a breakpoint is desktop or larger
 */
export function isDesktopOrLarger(breakpoint: BreakpointName): boolean {
  return ["desktop", "largeDesktop"].includes(breakpoint);
}

/**
 * Get the next breakpoint in the sequence
 */
export function getNextBreakpoint(
  breakpoint: BreakpointName
): BreakpointName | null {
  const sequence: BreakpointName[] = [
    "mobile",
    "tablet",
    "desktop",
    "largeDesktop",
  ];
  const currentIndex = sequence.indexOf(breakpoint);

  if (currentIndex === -1 || currentIndex === sequence.length - 1) {
    return null;
  }

  return sequence[currentIndex + 1];
}

/**
 * Get the previous breakpoint in the sequence
 */
export function getPreviousBreakpoint(
  breakpoint: BreakpointName
): BreakpointName | null {
  const sequence: BreakpointName[] = [
    "mobile",
    "tablet",
    "desktop",
    "largeDesktop",
  ];
  const currentIndex = sequence.indexOf(breakpoint);

  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }

  return sequence[currentIndex - 1];
}
