import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 active:bg-blue-700",
  secondary: "bg-emerald-500 active:bg-emerald-600",
  outline: "border border-blue-600 bg-transparent active:bg-blue-50",
  ghost: "bg-transparent active:bg-gray-100",
  danger: "bg-red-500 active:bg-red-600",
};

const textStyles: Record<ButtonVariant, string> = {
  primary: "text-white font-semibold",
  secondary: "text-white font-semibold",
  outline: "text-blue-600 font-semibold",
  ghost: "text-gray-700 font-medium",
  danger: "text-white font-semibold",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-2 rounded-lg",
  md: "px-4 py-3 rounded-lg",
  lg: "px-6 py-4 rounded-xl",
};

const textSizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function Button({
  label,
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`
        flex-row items-center justify-center
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50" : ""}
      `}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? "#2563EB" : "#fff"}
          className="mr-2"
        />
      ) : null}
      <Text className={`${textStyles[variant]} ${textSizeStyles[size]}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
