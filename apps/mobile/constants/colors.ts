export const Colors = {
  primary: "#2563EB",
  primaryLight: "#DBEAFE",
  primaryDark: "#1D4ED8",
  secondary: "#10B981",
  secondaryDark: "#059669",
  accent: "#F59E0B",
  error: "#EF4444",
  background: "#FFFFFF",
  backgroundSecondary: "#F9FAFB",
  text: "#111827",
  textSecondary: "#6B7280",
  textDisabled: "#D1D5DB",
  border: "#E5E7EB",
  borderFocus: "#2563EB",
  cardShadow: "rgba(0,0,0,0.08)",
  overlay: "rgba(0,0,0,0.5)",
  success: "#10B981",
  warning: "#F59E0B",
} as const;

export type ColorKey = keyof typeof Colors;
