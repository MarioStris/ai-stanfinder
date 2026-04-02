import React, { useState } from "react";
import {
  View,
  Text,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Button } from "@components/ui/Button";

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
}

const SETTINGS: NotificationSetting[] = [
  {
    key: "newMatches",
    label: "Novi matchevi",
    description: "Obavijest kad se pojavi novi match za vase filtere.",
  },
  {
    key: "priceChanges",
    label: "Promjene cijena",
    description: "Obavijest kad se promijeni cijena spremljenog oglasa.",
  },
  {
    key: "newListings",
    label: "Novi oglasi u podrucju",
    description: "Obavijest o novim oglasima u vasem podrucju pretrage.",
  },
  {
    key: "weeklySummary",
    label: "Tjedni sazetak",
    description: "Pregled novih matcheva i trendova jednom tjedno.",
  },
];

type SettingsState = Record<string, boolean>;

const DEFAULT_STATE: SettingsState = {
  newMatches: true,
  priceChanges: true,
  newListings: false,
  weeklySummary: true,
};

function ToggleRow({
  setting,
  value,
  onToggle,
}: {
  setting: NotificationSetting;
  value: boolean;
  onToggle: (key: string, value: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
      <View className="flex-1 mr-4">
        <Text className="text-base font-medium text-gray-900">
          {setting.label}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          {setting.description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => onToggle(setting.key, v)}
        trackColor={{ false: "#D1D5DB", true: "#93C5FD" }}
        thumbColor={value ? "#2563EB" : "#F3F4F6"}
        accessibilityLabel={setting.label}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
    </View>
  );
}

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_STATE);
  const [isSaving, setIsSaving] = useState(false);

  function handleToggle(key: string, value: boolean) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      // TODO: API call to persist notification preferences
      await new Promise((resolve) => setTimeout(resolve, 500));
      Alert.alert("Spremljeno", "Postavke obavijesti su azurirane.", [
        { text: "U redu", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Greska", "Nije moguce spremiti postavke. Pokusajte ponovo.");
    } finally {
      setIsSaving(false);
    }
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
        <Text className="text-xl font-bold text-gray-900">
          Postavke obavijesti
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
          Push obavijesti
        </Text>

        {SETTINGS.map((setting) => (
          <ToggleRow
            key={setting.key}
            setting={setting}
            value={settings[setting.key] ?? false}
            onToggle={handleToggle}
          />
        ))}

        <View className="px-4 mt-8 mb-12">
          <Button
            label="Spremi postavke"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isSaving}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
    </View>
  );
}
