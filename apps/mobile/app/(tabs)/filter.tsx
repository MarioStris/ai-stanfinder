import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@components/ui/Button";
import { Card } from "@components/ui/Card";
import { FilterChip } from "@components/FilterChip";
import { RangeInput } from "@components/RangeInput";
import { filtersApi } from "@lib/api";
import { useStore } from "@lib/store";
import type { CreateFilterPayload } from "@lib/api";

const CITIES = ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar"];

const PROPERTY_TYPES = [
  { label: "Stan", icon: "🏢", value: "APARTMENT" },
  { label: "Kuca", icon: "🏠", value: "HOUSE" },
  { label: "Zemljiste", icon: "🏗️", value: "LAND" },
];

export default function FilterScreen() {
  const router = useRouter();
  const authToken = useStore((s) => s.authToken);
  const activeFilter = useStore((s) => s.activeFilter);
  const addFilter = useStore((s) => s.addFilter);
  const updateFilter = useStore((s) => s.updateFilter);
  const setActiveFilter = useStore((s) => s.setActiveFilter);

  const [selectedCities, setSelectedCities] = useState<string[]>(
    activeFilter?.cities ?? []
  );
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    activeFilter?.propertyTypes ?? []
  );
  const [priceMin, setPriceMin] = useState(
    activeFilter?.priceMin ? String(activeFilter.priceMin) : ""
  );
  const [priceMax, setPriceMax] = useState(
    activeFilter?.priceMax ? String(activeFilter.priceMax) : ""
  );
  const [areaMin, setAreaMin] = useState(
    activeFilter?.areaMin ? String(activeFilter.areaMin) : ""
  );
  const [areaMax, setAreaMax] = useState(
    activeFilter?.areaMax ? String(activeFilter.areaMax) : ""
  );
  const [freeText, setFreeText] = useState(activeFilter?.freeText ?? "");
  const [isLoading, setIsLoading] = useState(false);

  function toggleCity(city: string) {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  }

  function toggleType(value: string) {
    setSelectedTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  async function handleSubmit() {
    if (selectedCities.length === 0) {
      Alert.alert("Odaberi grad", "Molimo odaberi barem jedan grad.");
      return;
    }
    if (selectedTypes.length === 0) {
      Alert.alert("Odaberi tip", "Molimo odaberi barem jedan tip nekretnine.");
      return;
    }
    if (!authToken) {
      Alert.alert("Greska", "Nisi prijavljen/a.");
      return;
    }

    const payload: CreateFilterPayload = {
      name: `${selectedCities.join(", ")} — ${selectedTypes.join(", ")}`,
      cities: selectedCities,
      propertyTypes: selectedTypes,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      areaMin: areaMin ? Number(areaMin) : undefined,
      areaMax: areaMax ? Number(areaMax) : undefined,
      freeText: freeText.trim() || undefined,
    };

    setIsLoading(true);
    try {
      let result;
      if (activeFilter) {
        result = await filtersApi.update(activeFilter.id, payload, authToken);
      } else {
        result = await filtersApi.create(payload, authToken);
      }

      if (result && "data" in result && result.data) {
        if (activeFilter) {
          updateFilter(result.data as Parameters<typeof updateFilter>[0]);
        } else {
          addFilter(result.data as Parameters<typeof addFilter>[0]);
          setActiveFilter(result.data as Parameters<typeof setActiveFilter>[0]);
        }
        router.push("/(tabs)/");
      } else {
        Alert.alert("Greska", "Nije moguce kreirati filter. Pokusaj ponovo.");
      }
    } catch {
      Alert.alert("Greska", "Mrežna greska. Provjeri internet vezu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="bg-white px-4 pt-14 pb-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Sto trazite?</Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          AI ce analizirati 500+ oglasa za vas
        </Text>
      </View>

      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-4 pt-4">
          <Card className="mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Grad
            </Text>
            <View className="flex-row flex-wrap">
              {CITIES.map((city) => (
                <FilterChip
                  key={city}
                  label={city}
                  selected={selectedCities.includes(city)}
                  onPress={() => toggleCity(city)}
                />
              ))}
            </View>
            {selectedCities.length === 0 && (
              <Text className="text-xs text-red-400 mt-1">
                Odaberi barem jedan grad
              </Text>
            )}
          </Card>

          <Card className="mb-4">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Tip nekretnine
            </Text>
            <View className="flex-row gap-3">
              {PROPERTY_TYPES.map((type) => (
                <View
                  key={type.value}
                  className="flex-1"
                >
                  <FilterChip
                    label={`${type.icon} ${type.label}`}
                    selected={selectedTypes.includes(type.value)}
                    onPress={() => toggleType(type.value)}
                    accessibilityLabel={`Tip nekretnine: ${type.label}`}
                  />
                </View>
              ))}
            </View>
            {selectedTypes.length === 0 && (
              <Text className="text-xs text-red-400 mt-1">
                Odaberi barem jedan tip
              </Text>
            )}
          </Card>

          <Card className="mb-4">
            <RangeInput
              label="Cijena"
              unit="EUR"
              minValue={priceMin}
              maxValue={priceMax}
              minPlaceholder="100.000"
              maxPlaceholder="300.000"
              onMinChange={setPriceMin}
              onMaxChange={setPriceMax}
            />
          </Card>

          <Card className="mb-4">
            <RangeInput
              label="Kvadratura"
              unit="m²"
              minValue={areaMin}
              maxValue={areaMax}
              minPlaceholder="40"
              maxPlaceholder="120"
              onMinChange={setAreaMin}
              onMaxChange={setAreaMax}
            />
          </Card>

          <Card className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              Opisi sto trazis
            </Text>
            <Text className="text-xs text-gray-400 mb-2">
              AI razumije prirodni jezik
            </Text>
            <TextInput
              value={freeText}
              onChangeText={setFreeText}
              placeholder="npr. blizu tramvaja, balkon, mirna ulica"
              multiline
              numberOfLines={3}
              className="border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-900 bg-gray-50"
              textAlignVertical="top"
              accessibilityLabel="Slobodni opis zahtjeva"
              placeholderTextColor="#9CA3AF"
            />
          </Card>

          <View className="mb-10">
            <Button
              label={
                isLoading
                  ? "Generiranje..."
                  : activeFilter
                  ? "Azuriraj i generiraj"
                  : "Generiraj matcheve"
              }
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
