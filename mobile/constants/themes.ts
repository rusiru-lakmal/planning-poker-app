export interface Theme {
  id: string;
  name: string;
  colors: {
    background: string[]; // Gradient colors for main background
    orb1: string;
    orb2: string;
    cardBg: string[]; // Gradient for cards
    card1: string; // RoomCard gradient start
    card2: string; // RoomCard gradient end
    borderStart: string; // RoomCard border start
    borderEnd: string; // RoomCard border end
    selectedCard: string[]; // Gradient for selected items
    button: string[]; // Gradient for primary buttons
    titleGradient: string[]; // Gradient for text
    accent: string; // Text accent color
    accentBg: string; // Background accent
    votedBg: string[];
    resultBg: string[];
    resultBorder: string;
    shadow: string;
  };
}

// Tailwind color mapping for React Native
const TW = {
  slate950: "#020617",
  purple950: "#3B0764",
  purple500: "#A855F7",
  purple400: "#C084FC",
  blue500: "#3B82F6",
  pink500: "#EC4899",
  pink400: "#F472B6",
  emerald500: "#10B981",
  emerald400: "#34D399",
  teal500: "#14B8A6",
  cyan950: "#083344",
  blue950: "#172554",
  cyan500: "#06B6D4",
  cyan400: "#22D3EE",
  blue600: "#2563EB",
  blue400: "#60A5FA",
  orange950: "#431407",
  red950: "#450A0A",
  orange500: "#F97316",
  orange400: "#FB923C",
  red500: "#EF4444",
  red400: "#F87171",
  amber500: "#F59E0B",
  emerald950: "#022C22",
  green950: "#052E16",
  green500: "#22C55E",
  green600: "#16A34A",
  green400: "#4ADE80",
  black: "#000000",
  fuchsia500: "#D946EF",
  fuchsia400: "#E879F9",
  gray900: "#111827",
  gray600: "#4B5563",
  gray800: "#1F2937",
  gray200: "#E5E7EB",
  gray400: "#9CA3AF",
  gray500: "#6B7280",
  white: "#FFFFFF",
};

export const THEMES: Record<string, Theme> = {
  cosmic: {
    id: "cosmic",
    name: "Cosmic",
    colors: {
      background: [TW.slate950, TW.purple950, TW.slate950],
      orb1: "rgba(168, 85, 247, 0.2)", // purple-500/20
      orb2: "rgba(59, 130, 246, 0.2)", // blue-500/20
      cardBg: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
      card1: "rgba(139, 92, 246, 0.1)",
      card2: "rgba(236, 72, 153, 0.1)",
      borderStart: "rgba(139, 92, 246, 0.3)",
      borderEnd: "rgba(236, 72, 153, 0.3)",
      selectedCard: [TW.purple500, TW.pink500],
      button: [TW.purple500, TW.pink500],
      titleGradient: [TW.purple400, TW.pink400],
      accent: TW.purple400,
      accentBg: "rgba(168, 85, 247, 0.2)",
      votedBg: [TW.emerald500, TW.teal500],
      resultBg: ["rgba(168, 85, 247, 0.2)", "rgba(236, 72, 153, 0.2)"],
      resultBorder: "rgba(168, 85, 247, 0.3)",
      shadow: TW.purple500,
    },
  },
  ocean: {
    id: "ocean",
    name: "Ocean",
    colors: {
      background: [TW.slate950, TW.cyan950, TW.blue950],
      orb1: "rgba(6, 182, 212, 0.2)", // cyan-500/20
      orb2: "rgba(59, 130, 246, 0.2)", // blue-500/20
      cardBg: ["rgba(6, 182, 212, 0.1)", "rgba(59, 130, 246, 0.05)"],
      card1: "rgba(6, 182, 212, 0.1)",
      card2: "rgba(59, 130, 246, 0.1)",
      borderStart: "rgba(6, 182, 212, 0.3)",
      borderEnd: "rgba(59, 130, 246, 0.3)",
      selectedCard: [TW.cyan500, TW.blue600],
      button: [TW.cyan500, TW.blue600],
      titleGradient: [TW.cyan400, TW.blue400],
      accent: TW.cyan400,
      accentBg: "rgba(6, 182, 212, 0.2)",
      votedBg: [TW.teal500, TW.cyan500],
      resultBg: ["rgba(6, 182, 212, 0.2)", "rgba(59, 130, 246, 0.2)"],
      resultBorder: "rgba(6, 182, 212, 0.3)",
      shadow: TW.cyan500,
    },
  },
  sunset: {
    id: "sunset",
    name: "Sunset",
    colors: {
      background: [TW.slate950, TW.orange950, TW.red950],
      orb1: "rgba(249, 115, 22, 0.2)", // orange-500/20
      orb2: "rgba(239, 68, 68, 0.2)", // red-500/20
      cardBg: ["rgba(249, 115, 22, 0.1)", "rgba(239, 68, 68, 0.05)"],
      card1: "rgba(249, 115, 22, 0.1)",
      card2: "rgba(239, 68, 68, 0.1)",
      borderStart: "rgba(249, 115, 22, 0.3)",
      borderEnd: "rgba(239, 68, 68, 0.3)",
      selectedCard: [TW.orange500, TW.red500],
      button: [TW.orange500, TW.red500],
      titleGradient: [TW.orange400, TW.red400],
      accent: TW.orange400,
      accentBg: "rgba(249, 115, 22, 0.2)",
      votedBg: [TW.amber500, TW.orange500],
      resultBg: ["rgba(249, 115, 22, 0.2)", "rgba(239, 68, 68, 0.2)"],
      resultBorder: "rgba(249, 115, 22, 0.3)",
      shadow: TW.orange500,
    },
  },
  forest: {
    id: "forest",
    name: "Forest",
    colors: {
      background: [TW.slate950, TW.emerald950, TW.green950],
      orb1: "rgba(16, 185, 129, 0.2)", // emerald-500/20
      orb2: "rgba(34, 197, 94, 0.2)", // green-500/20
      cardBg: ["rgba(16, 185, 129, 0.1)", "rgba(34, 197, 94, 0.05)"],
      card1: "rgba(16, 185, 129, 0.1)",
      card2: "rgba(34, 197, 94, 0.1)",
      borderStart: "rgba(16, 185, 129, 0.3)",
      borderEnd: "rgba(34, 197, 94, 0.3)",
      selectedCard: [TW.emerald500, TW.green600],
      button: [TW.emerald500, TW.green600],
      titleGradient: [TW.emerald400, TW.green400],
      accent: TW.emerald400,
      accentBg: "rgba(16, 185, 129, 0.2)",
      votedBg: [TW.teal500, TW.emerald500],
      resultBg: ["rgba(16, 185, 129, 0.2)", "rgba(34, 197, 94, 0.2)"],
      resultBorder: "rgba(16, 185, 129, 0.3)",
      shadow: TW.emerald500,
    },
  },
  neon: {
    id: "neon",
    name: "Neon",
    colors: {
      background: [TW.black, TW.purple950, TW.black],
      orb1: "rgba(217, 70, 239, 0.2)", // fuchsia-500/20
      orb2: "rgba(6, 182, 212, 0.2)", // cyan-500/20
      cardBg: ["rgba(217, 70, 239, 0.1)", "rgba(6, 182, 212, 0.1)"],
      card1: "rgba(217, 70, 239, 0.1)",
      card2: "rgba(6, 182, 212, 0.1)",
      borderStart: "rgba(217, 70, 239, 0.3)",
      borderEnd: "rgba(6, 182, 212, 0.3)",
      selectedCard: [TW.fuchsia500, TW.cyan500],
      button: [TW.fuchsia500, TW.cyan500],
      titleGradient: [TW.fuchsia400, TW.cyan400],
      accent: TW.fuchsia400,
      accentBg: "rgba(217, 70, 239, 0.2)",
      votedBg: [TW.pink500, TW.fuchsia500],
      resultBg: ["rgba(217, 70, 239, 0.2)", "rgba(6, 182, 212, 0.2)"],
      resultBorder: "rgba(217, 70, 239, 0.3)",
      shadow: TW.fuchsia500,
    },
  },
  monochrome: {
    id: "monochrome",
    name: "Monochrome",
    colors: {
      background: [TW.black, TW.gray900, TW.black],
      orb1: "rgba(255, 255, 255, 0.05)",
      orb2: "rgba(255, 255, 255, 0.05)",
      cardBg: ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"],
      card1: "rgba(255, 255, 255, 0.1)",
      card2: "rgba(255, 255, 255, 0.05)",
      borderStart: "rgba(107, 114, 128, 0.3)",
      borderEnd: "rgba(75, 85, 99, 0.3)",
      selectedCard: [TW.gray600, TW.gray800],
      button: [TW.gray600, TW.gray800],
      titleGradient: [TW.gray200, TW.gray400],
      accent: TW.gray400,
      accentBg: "rgba(107, 114, 128, 0.2)",
      votedBg: [TW.gray500, TW.gray600],
      resultBg: ["rgba(107, 114, 128, 0.2)", "rgba(75, 85, 99, 0.2)"],
      resultBorder: "rgba(107, 114, 128, 0.3)",
      shadow: TW.gray500,
    },
  },
};
