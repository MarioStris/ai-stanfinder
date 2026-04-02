import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { MatchBadge } from "@components/ui/Badge";
import type { MatchResult } from "@stanfinder/shared-types";

interface MatchCardProps {
  match: MatchResult;
  onPress: () => void;
  onFavoriteToggle?: () => void;
}

export function MatchCard({ match, onPress, onFavoriteToggle }: MatchCardProps) {
  const listing = match.listing;
  const imageUri = listing.images?.[0];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-xl shadow-sm mb-3 mx-4 overflow-hidden"
      accessibilityRole="button"
      accessibilityLabel={`${listing.city}, ${listing.areaSqm}m², ${listing.price} EUR, ${match.matchPercentage}% match`}
    >
      <View className="flex-row">
        <View className="w-28 h-28 bg-gray-200 overflow-hidden">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="cover"
              accessibilityLabel="Slika nekretnine"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Text className="text-4xl">🏠</Text>
            </View>
          )}
        </View>

        <View className="flex-1 p-3">
          <View className="flex-row items-center justify-between mb-1.5">
            <MatchBadge percentage={match.matchPercentage} />
            <TouchableOpacity
              onPress={onFavoriteToggle}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel={match.isFavorite ? "Ukloni iz favorita" : "Spremi u favorite"}
            >
              <Text className="text-xl">{match.isFavorite ? "❤️" : "🤍"}</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-base font-bold text-gray-900 mb-0.5">
            €{listing.price.toLocaleString()}
          </Text>

          <Text className="text-xs text-gray-500 mb-0.5">
            {listing.city}
            {listing.neighborhood ? `, ${listing.neighborhood}` : ""} · {listing.areaSqm}m²
          </Text>

          <Text
            className="text-xs text-blue-700 italic leading-4"
            numberOfLines={2}
          >
            {match.aiComment}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
