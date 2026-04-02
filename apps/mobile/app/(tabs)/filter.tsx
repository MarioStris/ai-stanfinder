import { View, Text, ScrollView } from "react-native";
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { Card } from "@components/ui/Card";

const CITIES = ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar"];

const PROPERTY_TYPES = [
  { label: "Stan", icon: "🏢", value: "APARTMENT" },
  { label: "Kuca", icon: "🏠", value: "HOUSE" },
  { label: "Zemljiste", icon: "🏗️", value: "LAND" },
];

export default function FilterScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-3 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">Sto trazite?</Text>
        <Text className="text-sm text-gray-500 mt-0.5">
          AI ce analizirati 500+ oglasa za vas
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <Card className="mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Grad
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CITIES.map((city) => (
              <View
                key={city}
                className="px-4 py-2 rounded-full bg-blue-50 border border-blue-200"
              >
                <Text className="text-sm text-blue-700 font-medium">{city}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Tip nekretnine
          </Text>
          <View className="flex-row gap-3">
            {PROPERTY_TYPES.map((type) => (
              <View
                key={type.value}
                className="flex-1 items-center py-4 rounded-xl border border-gray-200 bg-gray-50"
              >
                <Text className="text-2xl mb-1">{type.icon}</Text>
                <Text className="text-xs text-gray-700 font-medium">
                  {type.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Cijena (EUR)
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Od"
                placeholder="100.000"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Do"
                placeholder="300.000"
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Kvadratura (m²)
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Od"
                placeholder="40"
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Input
                label="Do"
                placeholder="120"
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        <Card className="mb-6">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Opisi sto trazis
          </Text>
          <Input
            placeholder="npr. blizu tramvaja, balkon, mirna ulica"
            multiline
            numberOfLines={3}
            hint="AI razumije prirodni jezik"
          />
        </Card>

        <View className="mb-8">
          <Button
            label="Generiraj matcheve"
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    </View>
  );
}
