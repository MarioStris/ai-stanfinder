import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { useStore } from "@lib/store";

function TabIcon({
  focused,
  label,
  icon,
}: {
  focused: boolean;
  label: string;
  icon: string;
}) {
  return (
    <View className="items-center justify-center pt-1">
      <Text className={`text-xl ${focused ? "opacity-100" : "opacity-50"}`}>
        {icon}
      </Text>
      <Text
        className={`text-xs mt-0.5 ${
          focused ? "text-blue-600 font-semibold" : "text-gray-500"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

function NotificationTabIcon({ focused }: { focused: boolean }) {
  const unreadCount = useStore((s) => s.unreadCount);

  return (
    <View className="items-center justify-center pt-1">
      <View>
        <Text className={`text-xl ${focused ? "opacity-100" : "opacity-50"}`}>
          🔔
        </Text>
        {unreadCount > 0 ? (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        className={`text-xs mt-0.5 ${
          focused ? "text-blue-600 font-semibold" : "text-gray-500"
        }`}
      >
        Obavijesti
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          backgroundColor: "#FFFFFF",
          height: 60,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Matchevi" icon="🏠" />
          ),
          tabBarAccessibilityLabel: "Matchevi - glavni ekran",
        }}
      />
      <Tabs.Screen
        name="filter"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Filter" icon="🔍" />
          ),
          tabBarAccessibilityLabel: "Postavi filter pretrage",
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Favoriti" icon="❤️" />
          ),
          tabBarAccessibilityLabel: "Spremljene nekretnine",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          tabBarIcon: ({ focused }) => (
            <NotificationTabIcon focused={focused} />
          ),
          tabBarAccessibilityLabel: "Obavijesti",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Profil" icon="👤" />
          ),
          tabBarAccessibilityLabel: "Profil i postavke",
        }}
      />
    </Tabs>
  );
}
