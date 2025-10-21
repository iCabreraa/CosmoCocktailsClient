import { useState, useEffect } from "react";
import {
  breakpoints,
  BreakpointName,
  getCurrentBreakpoint,
  matchesBreakpoint,
} from "./breakpoints";

/**
 * Hook to get the current window width
 */
export function useWindowWidth(): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Set initial width
    setWidth(window.innerWidth);

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

/**
 * Hook to get the current breakpoint
 */
export function useBreakpoint(): BreakpointName {
  const width = useWindowWidth();
  return getCurrentBreakpoint(width);
}

/**
 * Hook to check if current width matches a specific breakpoint
 */
export function useMatchesBreakpoint(breakpoint: BreakpointName): boolean {
  const width = useWindowWidth();
  return matchesBreakpoint(width, breakpoint);
}

/**
 * Hook to check if current width is mobile
 */
export function useIsMobile(): boolean {
  return useMatchesBreakpoint("mobile");
}

/**
 * Hook to check if current width is tablet
 */
export function useIsTablet(): boolean {
  return useMatchesBreakpoint("tablet");
}

/**
 * Hook to check if current width is desktop
 */
export function useIsDesktop(): boolean {
  return useMatchesBreakpoint("desktop");
}

/**
 * Hook to check if current width is large desktop
 */
export function useIsLargeDesktop(): boolean {
  return useMatchesBreakpoint("largeDesktop");
}

/**
 * Hook to check if current width is mobile or tablet
 */
export function useIsMobileOrTablet(): boolean {
  const width = useWindowWidth();
  return width < breakpoints.desktop.min;
}

/**
 * Hook to check if current width is tablet or desktop
 */
export function useIsTabletOrDesktop(): boolean {
  const width = useWindowWidth();
  return (
    width >= breakpoints.tablet.min && width < breakpoints.largeDesktop.min
  );
}

/**
 * Hook to check if current width is desktop or larger
 */
export function useIsDesktopOrLarger(): boolean {
  const width = useWindowWidth();
  return width >= breakpoints.desktop.min;
}

/**
 * Hook to get responsive values based on breakpoint
 */
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  largeDesktop?: T;
}): T | undefined {
  const breakpoint = useBreakpoint();
  return values[breakpoint];
}

/**
 * Hook to get responsive values with fallback
 */
export function useResponsiveValueWithFallback<T>(
  values: {
    mobile?: T;
    tablet?: T;
    desktop?: T;
    largeDesktop?: T;
  },
  fallback: T
): T {
  const responsiveValue = useResponsiveValue(values);
  return responsiveValue ?? fallback;
}

/**
 * Hook to get responsive classes
 */
export function useResponsiveClasses(classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  largeDesktop?: string;
}): string {
  const breakpoint = useBreakpoint();
  const currentClass = classes[breakpoint];

  // Build responsive class string
  let result = "";

  if (classes.mobile) result += classes.mobile + " ";
  if (classes.tablet) result += `md:${classes.tablet} `;
  if (classes.desktop) result += `lg:${classes.desktop} `;
  if (classes.largeDesktop) result += `xl:${classes.largeDesktop} `;

  return result.trim();
}

/**
 * Hook to get responsive grid columns
 */
export function useResponsiveGridColumns(): string {
  return useResponsiveClasses({
    mobile: "grid-cols-1",
    tablet: "grid-cols-2",
    desktop: "grid-cols-3",
    largeDesktop: "grid-cols-4",
  });
}

/**
 * Hook to get responsive spacing
 */
export function useResponsiveSpacing(): string {
  return useResponsiveClasses({
    mobile: "p-4",
    tablet: "p-6",
    desktop: "p-8",
    largeDesktop: "p-10",
  });
}

/**
 * Hook to get responsive text size
 */
export function useResponsiveTextSize(): string {
  return useResponsiveClasses({
    mobile: "text-sm",
    tablet: "text-base",
    desktop: "text-lg",
    largeDesktop: "text-xl",
  });
}

/**
 * Hook to get responsive container max width
 */
export function useResponsiveContainerMaxWidth(): string {
  return useResponsiveClasses({
    mobile: "max-w-full",
    tablet: "max-w-2xl",
    desktop: "max-w-4xl",
    largeDesktop: "max-w-6xl",
  });
}
