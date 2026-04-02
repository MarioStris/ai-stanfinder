import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useStore } from "@lib/store";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { UserTier } from "@stanfinder/shared-types";

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
      {title}
    </Text>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 bg-white border-b border-gray-100"
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text className="text-lg mr-3">{icon}</Text>
      <Text
        className={`flex-1 text-base ${
          danger ? "text-red-500" : "text-gray-800"
        }`}
      >
        {label}
      </Text>
      {!danger ? (
        <Text className="text-gray-400 text-lg">›</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const user = useStore((s) => s.user);
  const isPremium = user?.tier === UserTier.PREMIUM;

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "?";

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-6 items-center border-b border-gray-100">
        <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center mb-3">
          <Text className="text-white text-xl font-bold">{initials}</Text>
        </View>
        <Text className="text-base font-semibold text-gray-900">
          {user?.email ?? "Gost korisnik"}
        </Text>
        {isPremium ? (
          <View className="mt-2 px-3 py-1 bg-amber-100 rounded-full">
            <Text className="text-xs font-semibold text-amber-700">
              PREMIUM aktivan
            </Text>
          </View>
        ) : (
          <View className="mt-2 px-3 py-1 bg-gray-100 rounded-full">
            <Text className="text-xs font-semibold text-gray-600">
              FREE plan
            </Text>
          </View>
        )}
      </View>

      {!isPremium ? (
        <View className="mx-4 mt-6">
          <Card>
            <Text className="text-base font-bold text-gray-900 mb-1">
              Nadogradi na PREMIUM
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
              Dobivaj matcheve svakih 15 min, TOP 10 rezultata i prioritetnu podrsku.
            </Text>
            <Button
              label="Nadogradi — €7.99/mj"
              variant="primary"
              fullWidth
            />
            <Text className="text-xs text-gray-400 text-center mt-2">
              ili €59.99/god (ustedite 37%)
            </Text>
          </Card>
        </View>
      ) : null}

      <SectionHeader title="Moj racun" />
      <View>
        <MenuItem icon="🔍" label="Moji filteri" onPress={() => {}} />
        <MenuItem icon="🔔" label="Postavke obavijesti" onPress={() => {}} />
        <MenuItem icon="💳" label="Pretplata" onPress={() => {}} />
      </View>

      <SectionHeader title="Podrska" />
      <View>
        <MenuItem icon="❓" label="FAQ" onPress={() => {}} />
        <MenuItem icon="✉️" label="Kontaktiraj nas" onPress={() => {}} />
      </View>

      <SectionHeader title="Pravne informacije" />
      <View>
        <MenuItem icon="📄" label="Uvjeti koristenja" onPress={() => {}} />
        <MenuItem icon="🔒" label="Politika privatnosti" onPress={() => {}} />
      </View>

      <View className="mt-6 mb-2">
        <MenuItem icon="🚪" label="Odjava" onPress={() => {}} />
      </View>
      <View className="mb-12">
        <MenuItem icon="🗑️" label="Obrisi racun" onPress={() => {}} danger />
      </View>
    </ScrollView>
  );
}
