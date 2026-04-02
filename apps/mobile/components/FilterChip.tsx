import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export function FilterChip({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: FilterChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${
        selected
          ? "bg-blue-600 border-blue-600"
          : "bg-white border-gray-300"
      }`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text
        className={`text-sm font-medium ${
          selected ? "text-white" : "text-gray-700"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
