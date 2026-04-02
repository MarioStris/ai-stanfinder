import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useStore } from "@lib/store";
import { Card } from "@components/ui/Card";
import { Badge, MatchBadge } from "@components/ui/Badge";
import { useRouter } from "expo-router";
import type { MatchResult } from "@stanfinder/shared-types";

function MatchCard({ match, onPress }: { match: MatchResult; onPress: () => void }) {
  const listing = match.listing;

  return (
    <Card onPress={onPress} padding="none" className="mb-3 mx-4">
      <View className="flex-row p-4">
        <View className="w-24 h-24 bg-gray-200 rounded-lg mr-3 overflow-hidden">
          <Text className="text-3xl text-center mt-6">🏠</Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <MatchBadge percentage={match.matchPercentage} />
            <Text className="text-lg font-bold text-gray-900">
              €{listing.price.toLocaleString()}
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mb-0.5">
            {listing.city}{listing.neighborhood ? `, ${listing.neighborhood}` : ""}
          </Text>
          <Text className="text-sm text-gray-500 mb-2">
            {listing.areaSqm}m² · {listing.rooms ?? "?"} sobe
          </Text>
          <Text className="text-xs text-blue-700 italic" numberOfLines={2}>
            {match.aiComment}
          </Text>
        </View>
      </View>
    </Card>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">🔍</Text>
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        Nema matcheva
      </Text>
      <Text className="text-base text-gray-500 text-center">
        Postavi filter da bi AI pronasao nekretnine za tebe.
      </Text>
    </View>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">⚠️</Text>
      <Text className="text-base text-gray-500 text-center">{message}</Text>
    </View>
  );
}

function LoadingSkeleton() {
  return (
    <View className="px-4 pt-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} className="bg-gray-100 rounded-xl h-24 mb-3 animate-pulse" />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const matches = useStore((s) => s.matches);
  const isLoading = useStore((s) => s.isLoadingMatches);
  const error = useStore((s) => s.matchesError);
  const activeFilter = useStore((s) => s.activeFilter);

  if (isLoading && matches.length === 0) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Vasi matchevi</Text>
        {activeFilter ? (
          <Text className="text-sm text-gray-500 mt-0.5">{activeFilter.name}</Text>
        ) : null}
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => router.push(`/match/${item.id}`)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        ListHeaderComponent={<View className="h-3" />}
        ListFooterComponent={<View className="h-6" />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => {}}
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={matches.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
}
