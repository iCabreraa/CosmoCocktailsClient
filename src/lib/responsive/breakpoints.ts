/**
 * Responsive Design Breakpoints
 * 
 * Defines the standard breakpoints used throughout the CosmoCocktails application
 * for consistent responsive behavior across all components.
 */

export const breakpoints = {
  // Mobile devices (phones)
  mobile: {
    min: 320,
    max: 767,
    name: 'mobile',
  },
  
  // Tablet devices
  tablet: {
    min: 768,
    max: 1023,
    name: 'tablet',
  },
  
  // Desktop devices
  desktop: {
    min: 1024,
    max: 1439,
    name: 'desktop',
  },
  
  // Large desktop devices
  largeDesktop: {
    min: 1440,
    max: Infinity,
    name: 'largeDesktop',
  },
} as const;

export type BreakpointName = keyof typeof breakpoints;

/**
 * Get the current breakpoint based on window width
 */
export function getCurrentBreakpoint(width: number): BreakpointName {
  if (width >= breakpoints.largeDesktop.min) return 'largeDesktop';
  if (width >= breakpoints.desktop.min) return 'desktop';
  if (width >= breakpoints.tablet.min) return 'tablet';
  return 'mobile';
}

/**
 * Check if a breakpoint matches the current width
 */
export function matchesBreakpoint(width: number, breakpoint: BreakpointName): boolean {
  const bp = breakpoints[breakpoint];
  return width >= bp.min && width <= bp.max;
}

/**
 * Get media query string for a breakpoint
 */
export function getMediaQuery(breakpoint: BreakpointName): string {
  const bp = breakpoints[breakpoint];
  if (bp.max === Infinity) {
    return `(min-width: ${bp.min}px)`;
  }
  return `(min-width: ${bp.min}px) and (max-width: ${bp.max}px)`;
}

/**
 * Get media query string for breakpoint and up
 */
export function getMediaQueryUp(breakpoint: BreakpointName): string {
  const bp = breakpoints[breakpoint];
  return `(min-width: ${bp.min}px)`;
}

/**
 * Get media query string for breakpoint and down
 */
export function getMediaQueryDown(breakpoint: BreakpointName): string {
  const bp = breakpoints[breakpoint];
  return `(max-width: ${bp.max}px)`;
}

/**
 * Tailwind CSS breakpoint values
 * These correspond to Tailwind's default breakpoints
 */
export const tailwindBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Utility function to get responsive class names
 */
export function getResponsiveClasses(classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  largeDesktop?: string;
}): string {
  const { mobile, tablet, desktop, largeDesktop } = classes;
  
  let result = '';
  
  if (mobile) result += mobile + ' ';
  if (tablet) result += `md:${tablet} `;
  if (desktop) result += `lg:${desktop} `;
  if (largeDesktop) result += `xl:${largeDesktop} `;
  
  return result.trim();
}
