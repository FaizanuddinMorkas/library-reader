import { useState } from "react";
import { Alert, Switch, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import Bell from "lucide-react-native/icons/bell";
import ChevronRight from "lucide-react-native/icons/chevron-right";
import CircleHelp from "lucide-react-native/icons/circle-question-mark";
import Contact from "lucide-react-native/icons/contact";
import FileText from "lucide-react-native/icons/file-text";
import Globe from "lucide-react-native/icons/globe";
import Heart from "lucide-react-native/icons/heart";
import Info from "lucide-react-native/icons/info";
import Lock from "lucide-react-native/icons/lock";
import LogOut from "lucide-react-native/icons/log-out";
import Mail from "lucide-react-native/icons/mail";
import MapPin from "lucide-react-native/icons/map-pin";
import Moon from "lucide-react-native/icons/moon";
import Phone from "lucide-react-native/icons/phone";
import ShieldCheck from "lucide-react-native/icons/shield-check";
import Sun from "lucide-react-native/icons/sun";
import { AppHeader } from "@/components/layout/AppHeader";
import { ChangePasswordModal } from "@/components/profile/ChangePasswordModal";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { LibraryCard } from "@/components/profile/LibraryCard";
import { useAuthStore } from "@/store/authStore";
import { useAppTheme } from "@/hooks/useTheme";
import { mockBorrowingHistory, mockLoans } from "@/lib/mockData";

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isDark, setTheme } = useAppTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("") ?? "LR";

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to leave LibraryOS Reader?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const notificationItems = [
    {
      label: "Push notifications",
      description: "Get alerts for due dates and new books",
      icon: Bell,
      color: "#DDF3F7",
      value: pushEnabled,
      onToggle: setPushEnabled,
    },
    {
      label: "Email notifications",
      description: "Receive updates via email",
      icon: Globe,
      color: "#EEF4C8",
      value: emailEnabled,
      onToggle: setEmailEnabled,
    },
  ];

  const appearanceItems = [
    {
      label: "Dark mode",
      description: isDark ? "Dark theme is active" : "Light theme is active",
      icon: isDark ? Moon : Sun,
      color: "#EEE2F5",
      value: isDark,
      onToggle: (val: boolean) => setTheme(val ? "dark" : "light"),
    },
  ];

  const securityItems = [
    {
      label: "Biometric login",
      description: "Use fingerprint or face to sign in",
      icon: ShieldCheck,
      color: "#EEF4C8",
      value: biometricEnabled,
      onToggle: setBiometricEnabled,
    },
    {
      label: "Change password",
      description: "Update your account password",
      icon: Lock,
      color: "#FFE6D4",
      onPress: () => setShowChangePassword(true),
    },
  ];

  const contactItems = [
    {
      label: "Help & support",
      description: "FAQ, contact us, report an issue",
      icon: CircleHelp,
      color: "#FFE6D4",
      onPress: () => Alert.alert("Help & support", "Contact us at support@libraryos.com"),
    },
  ];

  const legalItems = [
    {
      label: "Privacy policy",
      description: "How we handle your data",
      icon: FileText,
      color: "#EEE2F5",
      onPress: () => Alert.alert("Privacy policy", "LibraryOS Reader v1.0.0\nYour data is handled with care and in compliance with applicable privacy laws."),
    },
    {
      label: "Terms & conditions",
      description: "Usage agreement",
      icon: FileText,
      color: "#DDF3F7",
      onPress: () => Alert.alert("Terms & conditions", "LibraryOS Reader v1.0.0\nBy using this app you agree to our terms of service."),
    },
  ];

  const renderToggleRow = (
    item: { label: string; description: string; icon: typeof Bell; color: string; value: boolean; onToggle: (val: boolean) => void },
    isLast: boolean
  ) => {
    const Icon = item.icon;
    return (
      <View
        key={item.label}
        className={`flex-row items-center py-4 ${isLast ? "" : "border-b border-border"}`}
      >
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center"
          style={{ backgroundColor: item.color }}
        >
          <Icon size={18} stroke="#57534E" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-ink">{item.label}</Text>
          <Text className="text-[11px] text-ink-muted mt-0.5">{item.description}</Text>
        </View>
        <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: "#E5E7EB", true: "#FDBA74" }}
          thumbColor={item.value ? "#FF6B0A" : "#9CA3AF"}
        />
      </View>
    );
  };

  const renderLinkRow = (
    item: { label: string; description: string; icon: typeof Bell; color: string; onPress: () => void },
    isLast: boolean
  ) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity
        key={item.label}
        onPress={item.onPress}
        className={`flex-row items-center py-4 ${isLast ? "" : "border-b border-border"}`}
      >
        <View
          className="w-10 h-10 rounded-2xl items-center justify-center"
          style={{ backgroundColor: item.color }}
        >
          <Icon size={18} stroke="#57534E" />
        </View>
        <View className="ml-3 flex-1">
          <Text className="text-sm font-semibold text-ink">{item.label}</Text>
          <Text className="text-[11px] text-ink-muted mt-0.5">{item.description}</Text>
        </View>
        <ChevronRight size={18} stroke="#B1AAA0" />
      </TouchableOpacity>
    );
  };

  const renderSettingsGroup = (
    title: string,
    items: { label: string; description: string; icon: typeof Bell; color: string; value?: boolean; onToggle?: (val: boolean) => void; onPress?: () => void }[],
    variant: "toggle" | "link" | "mixed"
  ) => (
    <View className="mb-5">
      <Text className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2 px-1">
        {title}
      </Text>
      <View className="rounded-[28px] bg-white border border-border px-4">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const renderAsLink = variant === "link" || (variant === "mixed" && !!item.onPress);
          return renderAsLink
            ? renderLinkRow(
                item as { label: string; description: string; icon: typeof Bell; color: string; onPress: () => void },
                isLast
              )
            : renderToggleRow(
                item as { label: string; description: string; icon: typeof Bell; color: string; value: boolean; onToggle: (val: boolean) => void },
                isLast
              );
        })}
      </View>
    </View>
  );

  return (
    <Screen>
      <AppHeader title="Profile" subtitle="Your membership and preferences" />

      <View className="rounded-[30px] bg-peach p-5 mb-6 overflow-hidden">
        <View className="absolute -right-8 -top-10 w-36 h-36 rounded-full bg-butter/70" />
        <View className="flex-row items-center">
          <View className="w-20 h-20 rounded-[28px] bg-primary items-center justify-center shadow-glow">
            <Text className="text-2xl font-black text-white">{initials}</Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-xl font-black text-ink">{user?.name ?? "Library Reader"}</Text>
            <Text className="text-sm text-ink-soft mt-1">{user?.email}</Text>
            <View className="self-start mt-2 px-3 py-1 rounded-full bg-white/80"><Text className="text-[10px] font-bold text-primary-700">ACTIVE MEMBER</Text></View>
          </View>
        </View>
        <View className="flex-row mt-5 pt-4 border-t border-white/70">
          {[
            { label: "Borrowed", value: mockLoans.length },
            { label: "Returned", value: mockBorrowingHistory.length },
            { label: "Saved", value: 4 },
          ].map(({ label, value }, index) => (
            <View key={label} className={`flex-1 items-center ${index ? "border-l border-white/70" : ""}`}>
              <Text className="text-xl font-black text-ink">{value}</Text>
              <Text className="text-[10px] text-ink-soft mt-1">{label}</Text>
            </View>
          ))}
        </View>
      </View>

      <SectionTitle title="Library card" />
      <View className="mb-7">
        <LibraryCard
          readerId={user?.readerId ?? "READ-2024-001"}
          readerName={user?.name ?? "Library Reader"}
          memberSince="Sept 2026"
          branchName="Main Branch"
          libraryName="Ahmedabad Library"
        />
      </View>

      <SectionTitle title="Personal details" />
      <View className="rounded-[28px] bg-white border border-border px-4 mb-7">
        {[
          { label: user?.email ?? "faizan@library.com", icon: Mail },
          { label: "+91 98765 43210", icon: Phone },
          { label: "Central Library, Mumbai", icon: MapPin },
        ].map(({ label, icon: Icon }, index) => (
          <View key={label} className={`flex-row items-center py-4 ${index < 2 ? "border-b border-border" : ""}`}>
            <View className="w-10 h-10 rounded-2xl bg-primary-50 items-center justify-center"><Icon size={18} stroke="#EA580C" /></View>
            <Text className="ml-3 flex-1 text-sm font-medium text-ink-soft">{label}</Text>
            <ChevronRight size={18} stroke="#B1AAA0" />
          </View>
        ))}
      </View>

      <SectionTitle title="Support your library" />
      <TouchableOpacity onPress={() => router.push("/(tabs)/donate")} className="rounded-[28px] bg-lime p-5 mb-7 flex-row items-center" accessibilityRole="button">
        <View className="w-12 h-12 rounded-2xl bg-white items-center justify-center"><Heart size={22} stroke="#EA580C" /></View>
        <View className="ml-3 flex-1"><Text className="text-base font-black text-ink">Make a difference</Text><Text className="text-xs text-ink-soft mt-1">Help us add more books to every shelf.</Text></View>
        <ChevronRight size={20} stroke="#57534E" />
      </TouchableOpacity>

      <SectionTitle title="Settings" />
      {renderSettingsGroup("Notifications", notificationItems, "toggle")}
      {renderSettingsGroup("Appearance", appearanceItems, "toggle")}
      {renderSettingsGroup("Privacy & security", securityItems, "mixed")}
      {renderSettingsGroup("Contact us", contactItems, "link")}
      {renderSettingsGroup("Legal", legalItems, "link")}

      <TouchableOpacity onPress={handleLogout} className="h-14 rounded-2xl border border-danger-100 bg-danger-50 items-center justify-center flex-row mb-8">
        <LogOut size={19} stroke="#DC2626" /><Text className="ml-2 text-sm font-bold text-danger-600">Log out</Text>
      </TouchableOpacity>

      <ChangePasswordModal
        visible={showChangePassword}
        email={user?.email}
        onClose={() => setShowChangePassword(false)}
      />
    </Screen>
  );
}
