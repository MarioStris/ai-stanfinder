import { View, Text, FlatList } from "react-native";
import { useStore } from "@lib/store";
import { Card } from "@components/ui/Card";
import { Badge, MatchBadge } from "@components/ui/Badge";
import { useRouter } from "expo-router";
import type { MatchResult } from "@stanfinder/shared-types";

function FavoriteCard({
  match,
  onPress,
}: {
  match: MatchResult;
  onPress: () => void;
}) {
  const listing = match.listing;

  return (
    <Card onPress={onPress} padding="none" className="mb-3 mx-4">
      <View className="flex-row p-4">
        <View className="w-20 h-20 bg-gray-200 rounded-lg mr-3 overflow-hidden">
          <Text className="text-3xl text-center mt-4">🏠</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <MatchBadge percentage={match.matchPercentage} />
            <Badge
              label={
                match.status === "CONTACTED"
                  ? "Kontaktiran"
                  : match.status === "REJECTED"
                  ? "Odbijen"
                  : "Spreman"
              }
              variant={
                match.status === "CONTACTED"
                  ? "primary"
                  : match.status === "REJECTED"
                  ? "error"
                  : "neutral"
              }
              size="sm"
            />
          </View>
          <Text className="text-base font-bold text-gray-900">
            €{listing.price.toLocaleString()}
          </Text>
          <Text className="text-sm text-gray-500">
            {listing.city}{listing.neighborhood ? `, ${listing.neighborhood}` : ""} · {listing.areaSqm}m²
          </Text>
        </View>
      </View>
    </Card>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">❤️</Text>
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        Nema favorita
      </Text>
      <Text className="text-base text-gray-500 text-center">
        Spremi nekretnine koje ti se svidaju da ih nades brze.
      </Text>
    </View>
  );
}

export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useStore((s) => s.matches.filter((m) => m.isFavorite));

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Favoriti</Text>
        {favorites.length > 0 ? (
          <Text className="text-sm text-gray-500 mt-0.5">
            {favorites.length} {favorites.length === 1 ? "nekretnina" : "nekretnina"}
          </Text>
        ) : null}
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FavoriteCard
            match={item}
            onPress={() => router.push(`/match/${item.id}`)}
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
