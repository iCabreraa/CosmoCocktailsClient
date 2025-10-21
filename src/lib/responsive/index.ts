/**
 * Responsive Design System
 *
 * Comprehensive responsive design utilities for CosmoCocktails
 * Provides breakpoints, hooks, and utilities for consistent responsive behavior
 */

// Import for local use in responsive object
import {
  breakpoints,
  getCurrentBreakpoint,
  matchesBreakpoint,
  getMediaQuery,
  getMediaQueryUp,
  getMediaQueryDown,
  tailwindBreakpoints,
  getResponsiveClasses,
} from "./breakpoints";

import {
  useWindowWidth,
  useBreakpoint,
  useMatchesBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  useIsMobileOrTablet,
  useIsTabletOrDesktop,
  useIsDesktopOrLarger,
  useResponsiveValue,
  useResponsiveValueWithFallback,
  useResponsiveClasses,
  useResponsiveGridColumns,
  useResponsiveSpacing,
  useResponsiveTextSize,
  useResponsiveContainerMaxWidth,
} from "./hooks";

import {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveGridColumns,
  getResponsiveMaxWidth,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveGap,
  getResponsiveBorderRadius,
  getResponsiveShadow,
  generateResponsiveCSSProperties,
  getResponsiveImageSizes,
  getResponsiveContainerClasses,
  getResponsiveGridClasses,
  getResponsiveFlexClasses,
  getResponsiveTextClasses,
  getResponsiveSpacingClasses,
  getResponsiveMarginClasses,
  getResponsiveGapClasses,
  getResponsiveBorderRadiusClasses,
  getResponsiveShadowClasses,
  isMobileBreakpoint,
  isTabletOrLarger,
  isDesktopOrLarger,
  getNextBreakpoint,
  getPreviousBreakpoint,
} from "./utils";

// Export breakpoints and types
export {
  breakpoints,
  type BreakpointName,
  getCurrentBreakpoint,
  matchesBreakpoint,
  getMediaQuery,
  getMediaQueryUp,
  getMediaQueryDown,
  tailwindBreakpoints,
  getResponsiveClasses,
} from "./breakpoints";

// Export hooks
export {
  useWindowWidth,
  useBreakpoint,
  useMatchesBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsLargeDesktop,
  useIsMobileOrTablet,
  useIsTabletOrDesktop,
  useIsDesktopOrLarger,
  useResponsiveValue,
  useResponsiveValueWithFallback,
  useResponsiveClasses,
  useResponsiveGridColumns,
  useResponsiveSpacing,
  useResponsiveTextSize,
  useResponsiveContainerMaxWidth,
} from "./hooks";

// Export utilities
export {
  getResponsiveFontSize,
  getResponsiveSpacing,
  getResponsiveGridColumns,
  getResponsiveMaxWidth,
  getResponsivePadding,
  getResponsiveMargin,
  getResponsiveGap,
  getResponsiveBorderRadius,
  getResponsiveShadow,
  generateResponsiveCSSProperties,
  getResponsiveImageSizes,
  getResponsiveContainerClasses,
  getResponsiveGridClasses,
  getResponsiveFlexClasses,
  getResponsiveTextClasses,
  getResponsiveSpacingClasses,
  getResponsiveMarginClasses,
  getResponsiveGapClasses,
  getResponsiveBorderRadiusClasses,
  getResponsiveShadowClasses,
  isMobileBreakpoint,
  isTabletOrLarger,
  isDesktopOrLarger,
  getNextBreakpoint,
  getPreviousBreakpoint,
} from "./utils";

// Re-export commonly used items for convenience
export const responsive = {
  breakpoints,
  hooks: {
    useWindowWidth,
    useBreakpoint,
    useIsMobile,
    useIsTablet,
    useIsDesktop,
    useIsLargeDesktop,
    useResponsiveValue,
    useResponsiveClasses,
  },
  utils: {
    getResponsiveFontSize,
    getResponsiveSpacing,
    getResponsiveGridColumns,
    getResponsiveMaxWidth,
    getResponsivePadding,
    getResponsiveMargin,
    getResponsiveGap,
    getResponsiveBorderRadius,
    getResponsiveShadow,
  },
  classes: {
    container: getResponsiveContainerClasses,
    grid: getResponsiveGridClasses,
    flex: getResponsiveFlexClasses,
    text: getResponsiveTextClasses,
    spacing: getResponsiveSpacingClasses,
    margin: getResponsiveMarginClasses,
    gap: getResponsiveGapClasses,
    borderRadius: getResponsiveBorderRadiusClasses,
    shadow: getResponsiveShadowClasses,
  },
} as const;
