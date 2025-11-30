/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#1F2937",
    background: "#F7F9FC",
    tint: "#2563EB",
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: "#2563EB",
    surface: "#FFFFFF",
    border: "#E5E7EB",
    error: "#EF4444",
    success: "#10B981",
    warning: "#F59E0B",
  },
  dark: {
    text: "#F3F4F6",
    background: "#0F172A",
    tint: "#3B82F6",
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#3B82F6",
    surface: "#1E293B",
    border: "#374151",
    error: "#F87171",
    success: "#34D399",
    warning: "#FBBF24",
  },
};

export const Fonts = {
  regular: "System",
  medium: "System",
  bold: "System",
};

export const Gradients = {
  primary: ["#8B5CF6", "#EC4899"], // purple to pink
  secondary: ["#6366F1", "#8B5CF6"], // indigo to purple
  success: ["#10B981", "#34D399"], // green
  Card: {
    default: ["#A78BFA", "#C084FC"], // light purple
    selected: ["#8B5CF6", "#EC4899"], // purple to pink
    voted: ["#6366F1", "#8B5CF6"], // indigo to purple
    mystery: ["#F59E0B", "#F97316"], // amber to orange
  },
  orb: {
    purple: ["#8B5CF6", "#A78BFA"],
    pink: ["#EC4899", "#F472B6"],
    indigo: ["#6366F1", "#818CF8"],
    blue: ["#3B82F6", "#60A5FA"],
  },
};

// Platform-specific Fonts configuration (original)
// Replaced with simple Fonts export above for consistency
// Uncomment if platform-specific fonts are needed
/*
export const PlatformFonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
*/
