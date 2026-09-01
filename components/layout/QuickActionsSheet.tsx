import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import BookOpen from "lucide-react-native/icons/book-open";
import CreditCard from "lucide-react-native/icons/credit-card";
import ScanLine from "lucide-react-native/icons/scan-line";
import Smartphone from "lucide-react-native/icons/smartphone";
import X from "lucide-react-native/icons/x";
import { useAuthStore } from "@/store/authStore";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export interface QuickActionsSheetHandle {
  present: () => void;
  dismiss: () => void;
}

const QR_PATTERN = [
  "11101110111",
  "10101010101",
  "11101110111",
  "00010100000",
  "11011101101",
  "00100111010",
  "11101010111",
  "10111100101",
  "11101011111",
];

export const QuickActionsSheet = forwardRef<QuickActionsSheetHandle>(
  function QuickActionsSheet(_, ref) {
    const sheetRef = useRef<BottomSheetModal>(null);
    const user = useAuthStore((state) => state.user);
    const { getLastReadBook } = useReadingProgress();
    const [showCard, setShowCard] = useState(false);
    const snapPoints = useMemo(() => ["48%"], []);

    useImperativeHandle(ref, () => ({
      present: () => {
        setShowCard(false);
        sheetRef.current?.present();
      },
      dismiss: () => sheetRef.current?.dismiss(),
    }));

    const dismissAndRun = (action: () => void) => {
      sheetRef.current?.dismiss();
      action();
    };

    const actions = [
      {
        label: "Scan book",
        description: "Use a QR or barcode",
        icon: ScanLine,
        color: "#FF6B0A",
        background: "#FFE6D4",
        onPress: () => dismissAndRun(() => router.push("/scan")),
      },
      {
        label: "E-Library",
        description: "Browse digital books",
        icon: Smartphone,
        color: "#3B5998",
        background: "#E8EEF7",
        onPress: () => dismissAndRun(() => router.push("/ebook/eb_001")),
      },
      {
        label: "Reader card",
        description: "Show your member code",
        icon: CreditCard,
        color: "#76508A",
        background: "#EEE2F5",
        onPress: () => dismissAndRun(() => router.push("/reader-card")),
      },
      {
        label: "Continue reading",
        description: "Resume your latest book",
        icon: BookOpen,
        color: "#6C7829",
        background: "#EEF4C8",
        onPress: () => {
          const lastRead = getLastReadBook();
          dismissAndRun(() => router.push(`/ebook/${lastRead?.bookId ?? "eb_001"}`));
        },
      },
    ];

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        backgroundStyle={{
          backgroundColor: "#FFFDF5",
          borderColor: "#E7DFD2",
          borderRadius: 28,
          borderWidth: 1,
        }}
        handleIndicatorStyle={{ backgroundColor: "#D7D0C4", width: 44 }}
        backdropComponent={undefined}
      >
        <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 28 }}>
          {showCard ? (
            <View accessibilityLabel="Library reader card">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-xl font-bold text-ink">Your reader card</Text>
                  <Text className="text-sm text-ink-muted mt-1">Ready to scan at the desk</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowCard(false)}
                  className="w-10 h-10 rounded-full bg-white items-center justify-center"
                  accessibilityLabel="Close reader card"
                >
                  <X size={20} stroke="#57534E" />
                </TouchableOpacity>
              </View>
              <View className="rounded-3xl bg-white border border-border p-5 flex-row items-center">
                <View className="w-28 h-24 bg-white p-1 mr-4">
                  {QR_PATTERN.map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-1 flex-row">
                      {row.split("").map((cell, columnIndex) => (
                        <View
                          key={`${rowIndex}-${columnIndex}`}
                          className="flex-1"
                          style={{ backgroundColor: cell === "1" ? "#181713" : "#FFFFFF" }}
                        />
                      ))}
                    </View>
                  ))}
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-ink" numberOfLines={2}>{user?.name ?? "Library Reader"}</Text>
                  <Text className="text-xs text-ink-muted mt-1">READER ID</Text>
                  <Text className="text-sm font-semibold text-primary-700 mt-0.5">{user?.readerId ?? "READ-2024-001"}</Text>
                  <View className="self-start mt-3 px-3 py-1 rounded-full bg-lime">
                    <Text className="text-xs font-semibold text-ink-soft">Active member</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <>
              <Text className="text-xl font-bold text-ink">What would you like to do?</Text>
              <Text className="text-sm text-ink-muted mt-1 mb-5">Your library shortcuts, all in one place.</Text>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {actions.map(({ label, description, icon: Icon, color, background, onPress }) => (
                  <TouchableOpacity
                    key={label}
                    onPress={onPress}
                    activeOpacity={0.82}
                    className="w-[48%] rounded-3xl p-4 border border-border"
                    style={{ backgroundColor: background }}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                  >
                    <View className="w-10 h-10 rounded-full bg-white/80 items-center justify-center mb-3">
                      <Icon size={20} stroke={color} />
                    </View>
                    <Text className="text-sm font-bold text-ink">{label}</Text>
                    <Text className="text-[11px] text-ink-soft mt-1">{description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);
