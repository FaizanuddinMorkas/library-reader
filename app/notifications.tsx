import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import AlertCircle from "lucide-react-native/icons/circle-alert";
import CheckCircle from "lucide-react-native/icons/circle-check-big";
import Info from "lucide-react-native/icons/info";
import Bell from "lucide-react-native/icons/bell";
import { AppHeader } from "@/components/layout/AppHeader";
import { Screen } from "@/components/ui/Screen";
import { mockNotifications } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";
import type { Notification } from "@/types/user";

const NOTIFICATION_ICONS: Record<Notification["type"], { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "#2563EB", bg: "#DBEAFE" },
  warning: { icon: AlertCircle, color: "#D97706", bg: "#FEF3C7" },
  success: { icon: CheckCircle, color: "#059669", bg: "#D1FAE5" },
  error: { icon: AlertCircle, color: "#DC2626", bg: "#FEE2E2" },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Screen scroll={false}>
      <AppHeader
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
        showBack
        onBack={() => router.back()}
        right={
          notifications.length > 0 ? (
            <TouchableOpacity
              onPress={markAllRead}
              className="w-10 h-10 rounded-full bg-white border border-border items-center justify-center"
              accessibilityLabel="Mark all as read"
            >
              <CheckCircle size={18} stroke="#059669" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      {notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
            <Bell size={36} stroke="#EA580C" />
          </View>
          <Text className="text-lg font-bold text-ink text-center">
            No notifications
          </Text>
          <Text className="text-sm text-ink-muted text-center mt-2">
            You{"'"}re all caught up! New notifications will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingVertical: 10, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {unreadCount > 0 && (
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xs font-bold text-primary-700 uppercase tracking-wider">
                {unreadCount} unread
              </Text>
              <TouchableOpacity onPress={clearAll}>
                <Text className="text-xs font-bold text-danger-600">
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {notifications.map((notification, index) => {
            const { icon: Icon, color, bg } = NOTIFICATION_ICONS[notification.type];
            return (
              <TouchableOpacity
                key={notification.id}
                onPress={() => markRead(notification.id)}
                className={`rounded-[24px] p-4 mb-3 flex-row items-start ${
                  notification.read
                    ? "bg-white border border-border"
                    : "bg-white border border-primary-100 shadow-soft"
                }`}
                activeOpacity={0.7}
              >
                <View
                  className="w-11 h-11 rounded-2xl items-center justify-center shrink-0"
                  style={{ backgroundColor: bg }}
                >
                  <Icon size={20} stroke={color} />
                </View>
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text
                      className={`text-sm flex-1 ${
                        notification.read
                          ? "font-medium text-ink-soft"
                          : "font-bold text-ink"
                      }`}
                      numberOfLines={1}
                    >
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View className="w-2 h-2 rounded-full bg-primary ml-2" />
                    )}
                  </View>
                  <Text
                    className="text-xs text-ink-muted mt-1 leading-4"
                    numberOfLines={2}
                  >
                    {notification.message}
                  </Text>
                  <Text className="text-[10px] text-ink-muted mt-2">
                    {formatDate(notification.createdAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </Screen>
  );
}
