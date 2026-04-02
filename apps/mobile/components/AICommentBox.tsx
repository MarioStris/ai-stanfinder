import React from "react";
import { View, Text } from "react-native";

interface AICommentBoxProps {
  comment: string;
  label?: string;
}

export function AICommentBox({ comment, label = "AI kaze" }: AICommentBoxProps) {
  return (
    <View
      className="mx-4 my-4 bg-blue-50 border border-blue-100 rounded-xl p-4"
      accessibilityRole="text"
      accessibilityLabel={`AI komentar: ${comment}`}
    >
      <View className="flex-row items-center mb-2">
        <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center mr-2">
          <Text className="text-white text-xs font-bold">AI</Text>
        </View>
        <Text className="text-sm font-semibold text-blue-800">{label}</Text>
      </View>
      <Text className="text-sm text-blue-700 leading-relaxed">{comment}</Text>
    </View>
  );
}
