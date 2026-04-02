import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  TouchableOpacity,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? "border-red-500"
    : isFocused
    ? "border-blue-600"
    : "border-gray-200";

  return (
    <View className="w-full">
      {label ? (
        <Text className="text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </Text>
      ) : null}

      <View
        className={`
          flex-row items-center
          bg-white border rounded-lg px-3
          ${borderColor}
          ${props.editable === false ? "bg-gray-50" : ""}
        `}
      >
        {leftIcon ? (
          <View className="mr-2 opacity-60">{leftIcon}</View>
        ) : null}

        <TextInput
          className="flex-1 py-3 text-base text-gray-900"
          placeholderTextColor="#9CA3AF"
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          accessibilityLabel={label}
          accessibilityHint={hint}
          {...props}
        />

        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            className="ml-2 p-1"
            accessibilityRole="button"
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text className="text-sm text-red-500 mt-1" accessibilityRole="alert">
          {error}
        </Text>
      ) : hint ? (
        <Text className="text-sm text-gray-500 mt-1">{hint}</Text>
      ) : null}
    </View>
  );
}
