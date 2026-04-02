import React, { useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Animated,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "@lib/store";
import { MatchBadge } from "@components/ui/Badge";
import { Card } from "@components/ui/Card";
import type { MatchResult } from "@ai-stanfinder/shared-types";

interface SwipeableFavoriteCardProps {
  match: MatchResult;
  onPress: () => void;
  onRemove: () => void;
}

function SwipeableFavoriteCard({
  match,
  onPress,
  onRemove,
}: SwipeableFavoriteCardProps) {
  const listing = match.listing;
  const translateX = useRef(new Animated.Value(0)).current;

  function handleRemovePress() {
    Alert.alert(
      "Ukloni iz favorita",
      "Zelite li ukloniti ovu nekretninu iz favorita?",
      [
        { text: "Odustani", style: "cancel" },
        {
          text: "Ukloni",
          style: "destructive",
          onPress: () => {
            Animated.timing(translateX, {
              toValue: -400,
              duration: 250,
              useNativeDriver: true,
            }).start(() => onRemove());
          },
        },
      ]
    );
  }

  return (
    <Animated.View style={{ transform: [{ translateX }] }}>
      <Card onPress={onPress} padding="none" className="mb-3 mx-4">
        <View className="flex-row p-4">
          <View className="w-20 h-20 bg-gray-200 rounded-lg mr-3 overflow-hidden items-center justify-center">
            <Text className="text-3xl">🏠</Text>
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <MatchBadge percentage={match.matchPercentage} />
              <TouchableOpacity
                onPress={handleRemovePress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Ukloni iz favorita"
              >
                <Text className="text-xl">❤️</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-base font-bold text-gray-900">
              €{listing.price.toLocaleString()}
            </Text>
            <Text className="text-sm text-gray-500">
              {listing.city}
              {listing.neighborhood ? `, ${listing.neighborhood}` : ""} ·{" "}
              {listing.areaSqm}m²
            </Text>
            {listing.rooms && (
              <Text className="text-xs text-gray-400 mt-0.5">
                {listing.rooms} {listing.rooms === 1 ? "soba" : "sobe"}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </Animated.View>
  );
}

function EmptyState() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">❤️</Text>
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        Nema favorita
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6">
        Spremi nekretnine koje ti se svidaju da ih nades brze.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/")}
        className="border border-blue-600 px-6 py-3 rounded-xl"
        accessibilityRole="button"
        accessibilityLabel="Pregledaj matcheve"
      >
        <Text className="text-blue-600 font-semibold text-base">
          Pregledaj matcheve
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const matches = useStore((s) => s.matches);
  const removeFavorite = useStore((s) => s.removeFavorite);

  const favorites = matches.filter((m) => m.isFavorite);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Favoriti</Text>
        {favorites.length > 0 ? (
          <Text className="text-sm text-gray-500 mt-0.5">
            {favorites.length}{" "}
            {favorites.length === 1 ? "spremljena nekretnina" : "spremljene nekretnine"}
          </Text>
        ) : null}
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SwipeableFavoriteCard
            match={item}
            onPress={() => router.push(`/match/${item.id}`)}
            onRemove={() => removeFavorite(item.id)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        ListHeaderComponent={<View className="h-3" />}
        ListFooterComponent={<View className="h-6" />}
        contentContainerStyle={favorites.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
}
