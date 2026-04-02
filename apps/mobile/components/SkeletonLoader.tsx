import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";

interface SkeletonBoxProps {
  width?: string | number;
  height?: number;
  rounded?: "sm" | "md" | "lg" | "full";
  className?: string;
}

function SkeletonBox({ height = 16, rounded = "md", className = "" }: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  const roundedMap = {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  };

  return (
    <Animated.View
      style={{
        height,
        borderRadius: roundedMap[rounded],
        opacity,
      }}
      className={`bg-gray-200 ${className}`}
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <View className="bg-white rounded-xl shadow-sm mb-3 mx-4 overflow-hidden">
      <View className="flex-row">
        <SkeletonBox height={112} className="w-28" rounded="sm" />
        <View className="flex-1 p-3 gap-2">
          <View className="flex-row justify-between">
            <SkeletonBox height={20} className="w-16" rounded="full" />
            <SkeletonBox height={20} className="w-6" rounded="full" />
          </View>
          <SkeletonBox height={18} className="w-32" rounded="sm" />
          <SkeletonBox height={14} className="w-40" rounded="sm" />
          <SkeletonBox height={12} className="w-full" rounded="sm" />
        </View>
      </View>
    </View>
  );
}

export function SkeletonLoader({ count = 5 }: { count?: number }) {
  return (
    <View className="pt-4">
      {Array.from({ length: count }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </View>
  );
}
