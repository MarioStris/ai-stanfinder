import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useStore } from "@lib/store";
import { matchesApi } from "@lib/api";
import { MatchCard } from "@components/MatchCard";
import { SkeletonLoader } from "@components/SkeletonLoader";
import type { MatchResult } from "@ai-stanfinder/shared-types";

function FilterSelector() {
  const [open, setOpen] = useState(false);
  const filters = useStore((s) => s.filters);
  const activeFilter = useStore((s) => s.activeFilter);
  const setActiveFilter = useStore((s) => s.setActiveFilter);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="flex-row items-center mt-1"
        accessibilityRole="button"
        accessibilityLabel="Odaberi filter"
        accessibilityHint="Otvori listu filtera"
      >
        <Text className="text-sm text-blue-600 font-medium mr-1">
          {activeFilter?.name ?? "Odaberi filter"}
        </Text>
        <Text className="text-blue-600 text-xs">▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />
        <View className="bg-white rounded-t-2xl px-4 pb-8 pt-4">
          <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Moji filteri
          </Text>
          {filters.length === 0 ? (
            <Text className="text-sm text-gray-400 text-center py-4">
              Nema filtera. Kreiraj filter na kartici Filter.
            </Text>
          ) : (
            <ScrollView>
              {filters.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => {
                    setActiveFilter(f);
                    setOpen(false);
                  }}
                  className={`py-3 px-4 rounded-lg mb-2 ${
                    activeFilter?.id === f.id
                      ? "bg-blue-50 border border-blue-200"
                      : "bg-gray-50"
                  }`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activeFilter?.id === f.id }}
                >
                  <Text className="text-sm font-medium text-gray-900">{f.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </>
  );
}

function EmptyState() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">🔍</Text>
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        Nema matcheva
      </Text>
      <Text className="text-base text-gray-500 text-center mb-6">
        Postavi filter da bi AI pronasao nekretnine za tebe.
      </Text>
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/filter")}
        className="bg-blue-600 px-6 py-3 rounded-xl"
        accessibilityRole="button"
        accessibilityLabel="Kreiraj filter"
      >
        <Text className="text-white font-semibold text-base">Kreiraj filter</Text>
      </TouchableOpacity>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">⚠️</Text>
      <Text className="text-base text-gray-500 text-center mb-4">{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        className="bg-blue-600 px-6 py-3 rounded-xl"
        accessibilityRole="button"
        accessibilityLabel="Pokusaj ponovo"
      >
        <Text className="text-white font-semibold">Pokusaj ponovo</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const matches = useStore((s) => s.matches);
  const isLoading = useStore((s) => s.isLoadingMatches);
  const error = useStore((s) => s.matchesError);
  const activeFilter = useStore((s) => s.activeFilter);
  const authToken = useStore((s) => s.authToken);
  const lastUpdated = useStore((s) => s.lastUpdated);
  const setMatches = useStore((s) => s.setMatches);
  const setLoadingMatches = useStore((s) => s.setLoadingMatches);
  const setMatchesError = useStore((s) => s.setMatchesError);
  const setLastUpdated = useStore((s) => s.setLastUpdated);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const loadMatches = useCallback(async () => {
    if (!activeFilter || !authToken) return;
    setLoadingMatches(true);
    setMatchesError(null);
    try {
      const result = await matchesApi.getByFilter(activeFilter.id, authToken);
      if (result && "data" in result && Array.isArray(result.data)) {
        setMatches(result.data as MatchResult[]);
      }
      setLastUpdated(new Date());
    } catch {
      setMatchesError("Greska pri ucitavanju matcheva. Provjeri internet vezu.");
    } finally {
      setLoadingMatches(false);
    }
  }, [activeFilter, authToken]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString("hr-HR", { hour: "2-digit", minute: "2-digit" })
    : null;

  if (isLoading && matches.length === 0) return <SkeletonLoader count={5} />;
  if (error) return <ErrorState message={error} onRetry={loadMatches} />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Vasi matchevi</Text>
          {formattedTime && (
            <Text className="text-xs text-gray-400">
              Azurirano {formattedTime}
            </Text>
          )}
        </View>
        <FilterSelector />
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchCard
            match={item}
            onPress={() => router.push(`/match/${item.id}`)}
            onFavoriteToggle={() => toggleFavorite(item.id)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        ListHeaderComponent={<View className="h-3" />}
        ListFooterComponent={<View className="h-6" />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadMatches}
            tintColor="#2563EB"
            colors={["#2563EB"]}
          />
        }
        contentContainerStyle={matches.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
}
