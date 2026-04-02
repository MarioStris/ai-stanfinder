import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useStore } from "@lib/store";
import { useRouter } from "expo-router";
import type { Notification } from "@ai-stanfinder/shared-types";

const NOTIFICATION_ICONS: Record<string, string> = {
  NEW_MATCH: "🔥",
  AI_SUGGESTION: "💡",
  WEEKLY_DIGEST: "📊",
  SYSTEM: "ℹ️",
};

function NotificationItem({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  const icon = NOTIFICATION_ICONS[notification.type] ?? "🔔";
  const timeAgo = new Date(notification.createdAt).toLocaleDateString("hr-HR");

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row px-4 py-4 border-b border-gray-100 ${
        notification.isRead ? "bg-white" : "bg-blue-50"
      }`}
      accessibilityRole="button"
      accessibilityLabel={notification.title}
    >
      <Text className="text-2xl mr-3 mt-0.5">{icon}</Text>
      <View className="flex-1">
        <View className="flex-row items-start justify-between">
          <Text
            className={`text-sm flex-1 mr-2 ${
              notification.isRead
                ? "font-normal text-gray-700"
                : "font-semibold text-gray-900"
            }`}
          >
            {notification.title}
          </Text>
          {!notification.isRead ? (
            <View className="w-2 h-2 rounded-full bg-blue-600 mt-1.5" />
          ) : null}
        </View>
        <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={2}>
          {notification.body}
        </Text>
        <Text className="text-xs text-gray-400 mt-1">{timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-5xl mb-4">🔔</Text>
      <Text className="text-xl font-semibold text-gray-900 text-center mb-2">
        Nema obavijesti
      </Text>
      <Text className="text-base text-gray-500 text-center">
        Kad AI pronajde novi match, obavijestit cemo te.
      </Text>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const notifications = useStore((s) => s.notifications);
  const markAsRead = useStore((s) => s.markAsRead);
  const markAllAsRead = useStore((s) => s.markAllAsRead);
  const unreadCount = useStore((s) => s.unreadCount);

  function handleNotificationPress(notification: Notification) {
    markAsRead(notification.id);
    if (notification.data?.matchId) {
      router.push(`/match/${notification.data.matchId}`);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white px-4 pt-14 pb-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-gray-900">Obavijesti</Text>
          {unreadCount > 0 ? (
            <TouchableOpacity
              onPress={markAllAsRead}
              accessibilityRole="button"
              accessibilityLabel="Oznaci sve kao procitano"
            >
              <Text className="text-sm text-blue-600 font-medium">
                Sve procitano
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        contentContainerStyle={notifications.length === 0 ? { flex: 1 } : undefined}
      />
    </View>
  );
}
