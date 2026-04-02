import React from "react";
import { View, Text, TextInput } from "react-native";

interface RangeInputProps {
  label: string;
  unit?: string;
  minValue: string;
  maxValue: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

export function RangeInput({
  label,
  unit,
  minValue,
  maxValue,
  minPlaceholder = "Od",
  maxPlaceholder = "Do",
  onMinChange,
  onMaxChange,
}: RangeInputProps) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-gray-900">{label}</Text>
        {unit && (
          <Text className="text-sm text-gray-400">{unit}</Text>
        )}
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="text-xs text-gray-500 mb-1">Od</Text>
          <TextInput
            value={minValue}
            onChangeText={onMinChange}
            placeholder={minPlaceholder}
            keyboardType="numeric"
            className="border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 bg-white"
            accessibilityLabel={`${label} minimum`}
            placeholderTextColor="#9CA3AF"
          />
        </View>
        <View className="flex-1">
          <Text className="text-xs text-gray-500 mb-1">Do</Text>
          <TextInput
            value={maxValue}
            onChangeText={onMaxChange}
            placeholder={maxPlaceholder}
            keyboardType="numeric"
            className="border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 bg-white"
            accessibilityLabel={`${label} maksimum`}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
    </View>
  );
}
