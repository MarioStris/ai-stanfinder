import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { useStore } from "@lib/store";
import { Button } from "@components/ui/Button";
import { Badge, MatchBadge } from "@components/ui/Badge";

function PriceSection({
  price,
  pricePerSqm,
  avgPricePerSqm,
}: {
  price: number;
  pricePerSqm?: number;
  avgPricePerSqm?: number;
}) {
  const diffPercent =
    pricePerSqm && avgPricePerSqm
      ? Math.round(((pricePerSqm - avgPricePerSqm) / avgPricePerSqm) * 100)
      : null;

  return (
    <View className="px-4 py-4 bg-white border-b border-gray-100">
      <View className="flex-row items-end justify-between">
        <Text className="text-3xl font-bold text-gray-900">
          €{price.toLocaleString()}
        </Text>
        {pricePerSqm ? (
          <Text className="text-base text-gray-500">
            €{pricePerSqm.toLocaleString()}/m²
          </Text>
        ) : null}
      </View>
      {diffPercent !== null ? (
        <Badge
          label={
            diffPercent < 0
              ? `${Math.abs(diffPercent)}% ispod prosjeka`
              : `${diffPercent}% iznad prosjeka`
          }
          variant={diffPercent < 0 ? "success" : "warning"}
          size="sm"
        />
      ) : null}
    </View>
  );
}

function AiCommentBox({ comment }: { comment: string }) {
  return (
    <View className="mx-4 my-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
      <View className="flex-row items-center mb-2">
        <Text className="text-base mr-2">🤖</Text>
        <Text className="text-sm font-semibold text-blue-800">AI kaze</Text>
      </View>
      <Text className="text-sm text-blue-700 leading-relaxed">{comment}</Text>
    </View>
  );
}

function InfoGrid({
  areaSqm,
  rooms,
  floor,
  yearBuilt,
  hasParking,
  hasBalcony,
}: {
  areaSqm: number;
  rooms?: number;
  floor?: number;
  yearBuilt?: number;
  hasParking: boolean;
  hasBalcony: boolean;
}) {
  const items = [
    { label: "Kvadratura", value: `${areaSqm}m²` },
    { label: "Sobe", value: rooms ? String(rooms) : "—" },
    { label: "Kat", value: floor ? String(floor) : "—" },
    { label: "Godiste", value: yearBuilt ? String(yearBuilt) : "—" },
    { label: "Parking", value: hasParking ? "Da" : "Ne" },
    { label: "Balkon", value: hasBalcony ? "Da" : "Ne" },
  ];

  return (
    <View className="mx-4 mb-4">
      <Text className="text-base font-semibold text-gray-900 mb-3">
        Detalji
      </Text>
      <View className="flex-row flex-wrap">
        {items.map((item) => (
          <View key={item.label} className="w-1/3 mb-4 pr-2">
            <Text className="text-xs text-gray-500 mb-0.5">{item.label}</Text>
            <Text className="text-sm font-semibold text-gray-900">
              {item.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function NotFoundState() {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-5xl mb-4">🔍</Text>
      <Text className="text-xl font-semibold text-gray-900 text-center">
        Nekretnina nije pronajdena
      </Text>
    </View>
  );
}

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const matches = useStore((s) => s.matches);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const match = matches.find((m) => m.id === id);
  const listing = match?.listing;

  useEffect(() => {
    if (match) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => toggleFavorite(match.id)}
            className="mr-2 p-2"
            accessibilityRole="button"
            accessibilityLabel={
              match.isFavorite ? "Ukloni iz favorita" : "Spremi u favorite"
            }
          >
            <Text className="text-xl">
              {match.isFavorite ? "❤️" : "🤍"}
            </Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [match?.isFavorite]);

  if (!match || !listing) return <NotFoundState />;

  function handleCallAgent() {
    if (listing?.agentPhone) {
      Linking.openURL(`tel:${listing.agentPhone}`);
    }
  }

  function handleEmailAgent() {
    if (listing?.agentEmail) {
      Linking.openURL(`mailto:${listing.agentEmail}`);
    }
  }

  function handleOpenMaps() {
    const query = listing?.address ?? `${listing?.city} ${listing?.neighborhood}`;
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(query ?? "")}`);
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="bg-gray-200 h-56 items-center justify-center">
          <Text className="text-6xl">🏠</Text>
          <Text className="text-sm text-gray-400 mt-2">Nema slike</Text>
        </View>

        <View className="flex-row items-center px-4 pt-4 pb-2">
          <MatchBadge percentage={match.matchPercentage} />
          <Text className="ml-2 text-sm text-gray-500">match score</Text>
        </View>

        <PriceSection
          price={listing.price}
          pricePerSqm={listing.pricePerSqm}
          avgPricePerSqm={listing.avgPricePerSqmInArea}
        />

        <AiCommentBox comment={match.aiComment} />

        <InfoGrid
          areaSqm={listing.areaSqm}
          rooms={listing.rooms}
          floor={listing.floor}
          yearBuilt={listing.yearBuilt}
          hasParking={listing.hasParking}
          hasBalcony={listing.hasBalcony}
        />

        <View className="mx-4 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-2">
            Lokacija
          </Text>
          <Text className="text-sm text-gray-700 mb-2">
            {listing.address ?? listing.city}
            {listing.neighborhood ? `, ${listing.neighborhood}` : ""}
          </Text>
          <TouchableOpacity
            onPress={handleOpenMaps}
            accessibilityRole="link"
            accessibilityLabel="Otvori u Google Maps"
          >
            <Text className="text-sm text-blue-600 font-medium">
              Otvori u Google Maps
            </Text>
          </TouchableOpacity>
        </View>

        {listing.description ? (
          <View className="mx-4 mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              Opis
            </Text>
            <Text className="text-sm text-gray-600 leading-relaxed">
              {listing.description}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 flex-row gap-3">
        <View className="flex-1">
          <Button
            label="Nazovi agenta"
            variant="primary"
            onPress={handleCallAgent}
            disabled={!listing.agentPhone}
          />
        </View>
        <View className="flex-1">
          <Button
            label="Posalji upit"
            variant="outline"
            onPress={handleEmailAgent}
            disabled={!listing.agentEmail}
          />
        </View>
      </View>
    </View>
  );
}
