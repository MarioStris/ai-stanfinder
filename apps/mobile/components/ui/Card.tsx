import React from "react";
import { View, TouchableOpacity, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
  elevated?: boolean;
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

export function Card({
  children,
  onPress,
  padding = "md",
  elevated = true,
  style,
  ...props
}: CardProps) {
  const baseStyles = `
    bg-white rounded-xl overflow-hidden
    ${elevated ? "shadow-sm" : "border border-gray-100"}
    ${paddingStyles[padding]}
  `;

  if (onPress) {
    return (
      <TouchableOpacity
        className={baseStyles}
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        style={style as TouchableOpacity["props"]["style"]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={baseStyles} style={style} {...props}>
      {children}
    </View>
  );
}
