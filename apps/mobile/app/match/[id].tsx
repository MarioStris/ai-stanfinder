import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useStore } from "@lib/store";
import { matchesApi } from "@lib/api";
import { Button } from "@components/ui/Button";
import { Badge, MatchBadge } from "@components/ui/Badge";
import { ImageGallery } from "@components/ImageGallery";
import { AICommentBox } from "@components/AICommentBox";
import type { ListingDetail } from "@lib/api";

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
        <View className="mt-1">
          <Badge
            label={
              diffPercent < 0
                ? `${Math.abs(diffPercent)}% ispod prosjeka`
                : `${diffPercent}% iznad prosjeka`
            }
            variant={diffPercent < 0 ? "success" : "warning"}
            size="sm"
          />
        </View>
      ) : null}
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
    { label: "Kat", value: floor !== undefined ? String(floor) : "—" },
    { label: "Godiste", value: yearBuilt ? String(yearBuilt) : "—" },
    { label: "Parking", value: hasParking ? "Da" : "Ne" },
    { label: "Balkon", value: hasBalcony ? "Da" : "Ne" },
  ];

  return (
    <View className="mx-4 mb-4">
      <Text className="text-base font-semibold text-gray-900 mb-3">Detalji</Text>
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

function ExpandableDescription({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 200;

  return (
    <View className="mx-4 mb-4">
      <Text className="text-base font-semibold text-gray-900 mb-2">Opis</Text>
      <Text className="text-sm text-gray-600 leading-relaxed">
        {!expanded && isLong ? `${text.slice(0, 200)}...` : text}
      </Text>
      {isLong && (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          className="mt-2"
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Prikazano manje" : "Prikazano vise"}
        >
          <Text className="text-sm text-blue-600 font-medium">
            {expanded ? "Prikazano manje" : "Prikazano vise"}
          </Text>
        </TouchableOpacity>
      )}
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

function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="text-sm text-gray-500 mt-3">Ucitavanje...</Text>
    </View>
  );
}

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const matches = useStore((s) => s.matches);
  const authToken = useStore((s) => s.authToken);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const storeMatch = matches.find((m) => m.id === id);
  const [detail, setDetail] = useState<ListingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(!storeMatch);

  useEffect(() => {
    if (!id || !authToken) return;
    if (storeMatch && !detail) {
      setDetail(storeMatch as unknown as ListingDetail);
    }
    async function fetchDetail() {
      setIsLoading(true);
      try {
        const result = await matchesApi.getDetail(id, authToken!);
        if (result && "data" in result && result.data) {
          setDetail(result.data as ListingDetail);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
  }, [id, authToken]);

  const match = detail ?? (storeMatch as unknown as ListingDetail | undefined);

  useEffect(() => {
    if (match) {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity
            onPress={() => toggleFavorite(match.id)}
            className="mr-2 p-2"
            accessibilityRole="button"
            accessibilityLabel={match.isFavorite ? "Ukloni iz favorita" : "Spremi u favorite"}
          >
            <Text className="text-xl">{match.isFavorite ? "❤️" : "🤍"}</Text>
          </TouchableOpacity>
        ),
      });
    }
  }, [match?.isFavorite]);

  if (isLoading && !match) return <LoadingState />;
  if (!match) return <NotFoundState />;

  const listing = match.listing;

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
    const query =
      listing?.address ?? `${listing?.city} ${listing?.neighborhood ?? ""}`;
    Linking.openURL(
      `https://maps.google.com/?q=${encodeURIComponent(query.trim())}`
    );
  }

  const images: string[] = listing?.images ?? [];

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        <ImageGallery images={images} height={256} />

        <View className="flex-row items-center px-4 pt-4 pb-2">
          <MatchBadge percentage={match.matchPercentage} />
          <Text className="ml-2 text-sm text-gray-500">match score</Text>
        </View>

        <PriceSection
          price={listing.price}
          pricePerSqm={listing.pricePerSqm}
          avgPricePerSqm={listing.avgPricePerSqmInArea}
        />

        <AICommentBox comment={match.aiComment} />

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
          <ExpandableDescription text={listing.description} />
        ) : null}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 flex-row gap-3">
        <View className="flex-1">
          <Button
            label="Nazovi agenta"
            variant="primary"
            onPress={handleCallAgent}
            disabled={!listing.agentPhone}
            accessibilityLabel={
              listing.agentPhone
                ? `Nazovi agenta na ${listing.agentPhone}`
                : "Broj telefona nije dostupan"
            }
          />
        </View>
        <View className="flex-1">
          <Button
            label="Posalji upit"
            variant="outline"
            onPress={handleEmailAgent}
            disabled={!listing.agentEmail}
            accessibilityLabel={
              listing.agentEmail
                ? `Posalji upit na ${listing.agentEmail}`
                : "Email nije dostupan"
            }
          />
        </View>
      </View>
    </View>
  );
}
