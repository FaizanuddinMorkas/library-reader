import { useWindowDimensions } from "react-native";

export type Breakpoint = "phone" | "tablet" | "desktop";

export interface ResponsiveInfo {
  width: number;
  height: number;
  isLandscape: boolean;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
  /** Max width for centered content on larger screens. */
  contentMaxWidth: number;
  /** Suggested number of columns for grid layouts. */
  columns: number;
  /** Horizontal padding for screens. */
  screenPadding: number;
}

const PHONE_MAX = 480;
const TABLET_MAX = 900;

export function useResponsive(): ResponsiveInfo {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  let breakpoint: Breakpoint;
  if (width < PHONE_MAX) breakpoint = "phone";
  else if (width < TABLET_MAX) breakpoint = "tablet";
  else breakpoint = "desktop";

  const isPhone = breakpoint === "phone";
  const isTablet = breakpoint === "tablet";
  const isDesktop = breakpoint === "desktop";

  // Cap content width so tablet/desktop doesn't stretch the UI.
  const contentMaxWidth = isPhone ? width : isTablet ? 560 : 640;

  // For stat tiles: phones in portrait get 2 columns, wider screens get 4.
  const columns = isPhone && !isLandscape ? 2 : 4;

  // Tighter padding on small phones, comfortable on larger.
  const screenPadding = width < 360 ? 12 : 16;

  return {
    width,
    height,
    isLandscape,
    isPhone,
    isTablet,
    isDesktop,
    breakpoint,
    contentMaxWidth,
    columns,
    screenPadding,
  };
}
