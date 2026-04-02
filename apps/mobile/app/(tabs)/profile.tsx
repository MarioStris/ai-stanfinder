import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useStore } from "@lib/store";
import { Card } from "@components/ui/Card";
import { Button } from "@components/ui/Button";
import { UserTier } from "@ai-stanfinder/shared-types";

const PRIVACY_URL = "https://stanfinder.hr/privatnost";
const TOS_URL = "https://stanfinder.hr/uvjeti";
const SUPPORT_EMAIL = "podrska@stanfinder.hr";

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
        className={`flex-1 text-base ${danger ? "text-red-500" : "text-gray-800"}`}
      >
        {label}
      </Text>
      {!danger ? <Text className="text-gray-400 text-lg">›</Text> : null}
    </TouchableOpacity>
  );
}

function PremiumUpsellCard({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <View className="mx-4 mt-6">
      <Card elevated>
        <View className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 mb-4">
          <Text className="text-white text-base font-bold mb-1">
            Nadogradi na PREMIUM
          </Text>
          <Text className="text-blue-100 text-sm">
            Dobivaj matcheve svakih 15 min i prioritetnu podrsku.
          </Text>
        </View>
        <View className="mb-4">
          {[
            "Matchevi svakih 15 minuta (FREE: 2x dnevno)",
            "TOP 10 rezultata po filteru",
            "Prioritetna podrska",
            "Napredni AI komentar",
            "Neogranicen broj filtera",
          ].map((feature) => (
            <View key={feature} className="flex-row items-start mb-2">
              <Text className="text-emerald-500 mr-2 font-bold">✓</Text>
              <Text className="text-sm text-gray-700 flex-1">{feature}</Text>
            </View>
          ))}
        </View>
        <Button
          label="Nadogradi — €7.99/mj"
          variant="primary"
          fullWidth
          onPress={onUpgrade}
        />
        <Text className="text-xs text-gray-400 text-center mt-2">
          ili €59.99/god (ustedite 37%)
        </Text>
      </Card>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const user = useStore((s) => s.user);
  const clearAuth = useStore((s) => s.clearAuth);
  const isPremium = user?.tier === UserTier.PREMIUM;

  const displayEmail =
    clerkUser?.primaryEmailAddress?.emailAddress ?? user?.email;
  const initials = displayEmail ? displayEmail.slice(0, 2).toUpperCase() : "?";

  function handleLogout() {
    Alert.alert("Odjava", "Jeste li sigurni da se zelite odjaviti?", [
      { text: "Odustani", style: "cancel" },
      {
        text: "Odjavi se",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {
            // Clerk session may already be expired — proceed with local cleanup
          }
          clearAuth();
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      "Obrisi racun",
      "Ova akcija je nepovratna. Svi vasi podaci ce biti trajno obrisani.",
      [
        { text: "Odustani", style: "cancel" },
        {
          text: "Obrisi",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
            } catch {
              // Continue with local cleanup regardless
            }
            clearAuth();
          },
        },
      ]
    );
  }

  function handlePrivacy() {
    Linking.openURL(PRIVACY_URL);
  }

  function handleToS() {
    Linking.openURL(TOS_URL);
  }

  function handleContact() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=AI%20StanFinder%20-%20Podrska`);
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-6 items-center border-b border-gray-100">
        <View className="w-16 h-16 rounded-full bg-blue-600 items-center justify-center mb-3">
          <Text className="text-white text-xl font-bold">{initials}</Text>
        </View>
        <Text className="text-base font-semibold text-gray-900">
          {displayEmail ?? "Gost korisnik"}
        </Text>
        {isPremium ? (
          <View className="mt-2 px-3 py-1 bg-amber-100 rounded-full">
            <Text className="text-xs font-semibold text-amber-700">
              PREMIUM aktivan
            </Text>
          </View>
        ) : (
          <View className="mt-2 px-3 py-1 bg-gray-100 rounded-full">
            <Text className="text-xs font-semibold text-gray-600">FREE plan</Text>
          </View>
        )}
      </View>

      {!isPremium ? (
        <PremiumUpsellCard
          onUpgrade={() => router.push("/subscription" as Parameters<typeof router.push>[0])}
        />
      ) : null}

      <SectionHeader title="Moj racun" />
      <View>
        <MenuItem icon="🔍" label="Moji filteri" onPress={() => router.push("/(tabs)/filter")} />
        <MenuItem icon="🔔" label="Postavke obavijesti" onPress={() => router.push("/settings/notifications" as Parameters<typeof router.push>[0])} />
        <MenuItem icon="💳" label="Pretplata" onPress={() => router.push("/subscription" as Parameters<typeof router.push>[0])} />
      </View>

      <SectionHeader title="Podrska" />
      <View>
        <MenuItem icon="❓" label="FAQ" onPress={() => router.push("/faq" as Parameters<typeof router.push>[0])} />
        <MenuItem icon="✉️" label="Kontaktiraj nas" onPress={handleContact} />
      </View>

      <SectionHeader title="Pravne informacije" />
      <View>
        <MenuItem icon="📄" label="Uvjeti koristenja" onPress={handleToS} />
        <MenuItem icon="🔒" label="Politika privatnosti" onPress={handlePrivacy} />
      </View>

      <View className="mt-6 mb-2">
        <MenuItem icon="🚪" label="Odjava" onPress={handleLogout} />
      </View>
      <View className="mb-12">
        <MenuItem icon="🗑️" label="Obrisi racun" onPress={handleDeleteAccount} danger />
      </View>
    </ScrollView>
  );
}
