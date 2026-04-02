import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@components/ui/Button";

interface TierInfo {
  id: string;
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  highlighted?: boolean;
}

const TIERS: TierInfo[] = [
  {
    id: "free",
    name: "Free",
    price: "Besplatno",
    priceNote: "Zauvijek",
    features: [
      "2 pretrage dnevno",
      "Top 3 rezultata po filteru",
      "Osnovni AI komentar",
      "1 aktivni filter",
      "Email obavijesti",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "49.99 kn/mj",
    priceNote: "ili 449.99 kn/god (ustedite 25%)",
    highlighted: true,
    features: [
      "Matchevi svakih 15 minuta",
      "Top 10 rezultata po filteru",
      "Napredni AI komentar",
      "5 aktivnih filtera",
      "Push obavijesti u realnom vremenu",
      "Prioritetna podrska",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "99.99 kn/mj",
    priceNote: "ili 899.99 kn/god (ustedite 25%)",
    features: [
      "Sve iz Premium plana",
      "Neogranicen broj filtera",
      "API pristup",
      "Detaljni trendovi cijena",
      "Izvoz podataka (CSV/PDF)",
      "Personalizirani agent za pretragu",
      "Prioritetna podrska 24/7",
    ],
  },
];

function TierCard({
  tier,
  selected,
  onSelect,
}: {
  tier: TierInfo;
  selected: boolean;
  onSelect: () => void;
}) {
  const borderColor = selected
    ? "border-blue-600"
    : tier.highlighted
      ? "border-blue-300"
      : "border-gray-200";

  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`border-2 rounded-xl p-4 mb-4 bg-white ${borderColor}`}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${tier.name} plan - ${tier.price}`}
    >
      {tier.highlighted ? (
        <View className="bg-blue-600 self-start px-3 py-1 rounded-full mb-3">
          <Text className="text-white text-xs font-bold">NAJPOPULARNIJI</Text>
        </View>
      ) : null}

      <Text className="text-lg font-bold text-gray-900 mb-1">{tier.name}</Text>
      <Text className="text-2xl font-bold text-blue-600 mb-1">
        {tier.price}
      </Text>
      <Text className="text-xs text-gray-400 mb-4">{tier.priceNote}</Text>

      {tier.features.map((feature) => (
        <View key={feature} className="flex-row items-start mb-2">
          <Text className="text-emerald-500 mr-2 font-bold">&#10003;</Text>
          <Text className="text-sm text-gray-700 flex-1">{feature}</Text>
        </View>
      ))}
    </TouchableOpacity>
  );
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>("premium");

  function handleSubscribe() {
    Alert.alert(
      "Dolazi uskoro!",
      "Pretplata ce biti dostupna u sljedecoj verziji aplikacije. Hvala na strpljenju!",
      [{ text: "U redu" }]
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-1"
          accessibilityLabel="Natrag"
          accessibilityRole="button"
        >
          <Text className="text-blue-600 text-2xl">&#8249;</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Pretplata</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <Text className="text-base text-gray-600 mb-6 text-center">
          Odaberite plan koji vam najvise odgovara
        </Text>

        {TIERS.map((tier) => (
          <TierCard
            key={tier.id}
            tier={tier}
            selected={selectedTier === tier.id}
            onSelect={() => setSelectedTier(tier.id)}
          />
        ))}

        <View className="mb-8">
          <Button
            label={
              selectedTier === "free"
                ? "Trenutni plan"
                : "Pretplati se"
            }
            variant="primary"
            size="lg"
            fullWidth
            disabled={selectedTier === "free"}
            onPress={handleSubscribe}
          />
          <Text className="text-xs text-gray-400 text-center mt-3">
            Mozete otkazati pretplatu u bilo kojem trenutku.{"\n"}
            Naplacuje se putem App Store / Google Play.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
