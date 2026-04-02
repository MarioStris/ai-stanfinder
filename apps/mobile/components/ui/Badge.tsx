import React from "react";
import { View, Text } from "react-native";

type BadgeVariant = "primary" | "success" | "warning" | "error" | "neutral";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variantStyles: Record<BadgeVariant, { container: string; text: string }> = {
  primary: { container: "bg-blue-100", text: "text-blue-700" },
  success: { container: "bg-emerald-100", text: "text-emerald-700" },
  warning: { container: "bg-amber-100", text: "text-amber-700" },
  error: { container: "bg-red-100", text: "text-red-700" },
  neutral: { container: "bg-gray-100", text: "text-gray-600" },
};

const sizeStyles: Record<BadgeSize, { container: string; text: string }> = {
  sm: { container: "px-2 py-0.5 rounded", text: "text-xs" },
  md: { container: "px-2.5 py-1 rounded-md", text: "text-sm" },
  lg: { container: "px-3 py-1.5 rounded-lg", text: "text-base" },
};

export function Badge({
  label,
  variant = "primary",
  size = "md",
}: BadgeProps) {
  const { container: containerVariant, text: textVariant } = variantStyles[variant];
  const { container: containerSize, text: textSize } = sizeStyles[size];

  return (
    <View
      className={`${containerVariant} ${containerSize} self-start`}
      accessibilityRole="text"
    >
      <Text className={`${textVariant} ${textSize} font-semibold`}>
        {label}
      </Text>
    </View>
  );
}

export function MatchBadge({ percentage }: { percentage: number }) {
  const variant: BadgeVariant =
    percentage >= 90
      ? "success"
      : percentage >= 75
      ? "primary"
      : percentage >= 60
      ? "warning"
      : "neutral";

  return (
    <Badge
      label={`${percentage}%`}
      variant={variant}
      size="md"
    />
  );
}
