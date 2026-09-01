import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import QRCode from "react-native-qrcode-svg";

interface LibraryCardProps {
  readerId: string;
  readerName: string;
  branchName?: string;
  libraryName?: string;
  memberSince?: string;
  branchAddress?: string;
  branchCity?: string;
  branchState?: string;
  branchPhone?: string;
}

// Slightly taller display ratio gives the mobile card content more breathing room.
// The exported PDF keeps the CR80 ratio separately.
const CARD_ASPECT = 1.52;

const SELECTED_TOGGLE_STYLE = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.12,
  shadowRadius: 2,
  elevation: 2,
};

export function LibraryCard({
  readerId,
  readerName,
  branchName = "Central Library",
  libraryName = "LibraryOS",
  memberSince,
  branchAddress = "123 Library Lane",
  branchCity = "Mumbai",
  branchState = "Maharashtra",
  branchPhone = "+91 22 2345 6789",
}: LibraryCardProps) {
  const [side, setSide] = useState<"front" | "back">("front");

  return (
    <View>
      {/* Front / Back toggle */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row rounded-lg border border-border bg-muted-50 p-0.5">
          {(["front", "back"] as const).map((value) => (
            <TouchableOpacity
              key={value}
              onPress={() => setSide(value)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${value} of reader card`}
              style={side === value ? SELECTED_TOGGLE_STYLE : undefined}
              className={`rounded-md px-3 py-1 ${
                side === value ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-xs font-medium capitalize ${
                  side === value ? "text-ink" : "text-ink-muted"
                }`}
              >
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-[10px] text-ink-muted">PDF includes front & back</Text>
      </View>

      {/* Card */}
      <View
        className="w-full max-w-[420px] self-center overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm"
        style={{ aspectRatio: CARD_ASPECT }}
      >
        {side === "front" ? (
          <CardFront
            readerId={readerId}
            readerName={readerName}
            branchName={branchName}
            libraryName={libraryName}
            memberSince={memberSince}
          />
        ) : (
          <CardBack
            readerId={readerId}
            branchName={branchName}
            libraryName={libraryName}
            branchAddress={branchAddress}
            branchCity={branchCity}
            branchState={branchState}
            branchPhone={branchPhone}
          />
        )}
      </View>
    </View>
  );
}

/* ─── Front ──────────────────────────────────────────── */

function CardFront({
  readerId,
  readerName,
  branchName,
  libraryName,
  memberSince,
}: {
  readerId: string;
  readerName: string;
  branchName: string;
  libraryName: string;
  memberSince?: string;
}) {
  return (
    <View className="flex-1">
      {/* Header — amber gradient */}
      <View className="h-[26%] shrink-0">
        <LinearGradient
          colors={["#d97706", "#92400e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-center px-3">
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1 pr-2">
                <Text className="text-[15px] font-bold text-white leading-tight" numberOfLines={1}>
                  {libraryName}
                </Text>
                <Text className="text-xs text-amber-100" numberOfLines={1}>
                  {branchName}
                </Text>
              </View>
              <View className="shrink-0 rounded bg-white px-1.5 py-0.5">
                <Text className="text-[8px] font-bold tracking-wide text-amber-900">
                  MEMBER CARD
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Bottom border accent */}
      <View style={{ height: 2 }} className="bg-amber-800" />

      {/* Body */}
      <View className="flex-1 flex-row items-center gap-2 px-3 py-2 bg-white">
        <View className="min-w-0 flex-1">
          <Text className="text-[8px] font-medium uppercase tracking-wide text-stone-500">
            Reader
          </Text>
          <Text className="text-sm font-semibold text-stone-900 truncate" numberOfLines={1}>
            {readerName}
          </Text>
          {memberSince && (
            <Text className="text-[9px] text-stone-600 mt-0.5">
              Member since {memberSince}
            </Text>
          )}

          <Text className="text-[8px] font-medium uppercase tracking-wide text-stone-500 mt-2">
            Reader ID
          </Text>
          <View className="mt-0.5 self-start rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5">
            <Text className="font-mono text-[10px] font-semibold text-amber-900">
              {readerId}
            </Text>
          </View>
        </View>

        {/* QR Code */}
        <View className="shrink-0 rounded-md border border-stone-200 bg-white p-1">
          <QRCode
            value={readerId}
            size={56}
            color="#78350f"
            backgroundColor="white"
          />
        </View>
      </View>

      {/* Footer */}
      <View className="h-[12%] shrink-0 flex-row items-center justify-between border-t border-stone-200 bg-stone-100 px-3">
        <Text className="text-[9px] font-semibold text-amber-700">
          LibraryOS
        </Text>
        <Text className="text-[8px] text-stone-600" numberOfLines={1}>
          Present at desk · Scan QR to verify
        </Text>
      </View>
    </View>
  );
}

/* ─── Back ───────────────────────────────────────────── */

function CardBack({
  readerId,
  branchName,
  libraryName,
  branchAddress,
  branchCity,
  branchState,
  branchPhone,
}: {
  readerId: string;
  branchName: string;
  libraryName: string;
  branchAddress: string;
  branchCity: string;
  branchState: string;
  branchPhone: string;
}) {
  return (
    <View className="flex-1">
      {/* Header */}
      <View className="h-[26%] shrink-0">
        <LinearGradient
          colors={["#d97706", "#92400e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-center px-3">
            <View className="flex-row items-start justify-between gap-2">
              <View className="min-w-0 flex-1 pr-2">
                <Text className="text-[15px] font-bold text-white leading-tight" numberOfLines={1}>
                  {libraryName}
                </Text>
                <Text className="text-xs text-amber-100" numberOfLines={1}>
                  {branchName}
                </Text>
              </View>
              <View className="shrink-0 rounded bg-white px-1.5 py-0.5">
                <Text className="text-[8px] font-bold tracking-wide text-amber-900">
                  MEMBER INFO
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Bottom border accent */}
      <View style={{ height: 2 }} className="bg-amber-800" />

      {/* Body */}
      <View className="flex-1">
        <View className="flex-1 flex-row gap-2 px-2.5 py-2">
          {/* Branch contact */}
          <View className="flex-[1.2] rounded-md border border-stone-200 bg-stone-50 p-2">
            <Text className="text-[8px] font-bold uppercase tracking-wide text-amber-900">
              Branch Contact
            </Text>
            <Text className="text-[10px] font-semibold text-stone-900 mt-1" numberOfLines={1}>
              {branchName}
            </Text>
            <Text className="text-[9px] text-stone-800 mt-0.5" numberOfLines={1}>
              {branchAddress}
            </Text>
            <Text className="text-[9px] text-stone-800" numberOfLines={1}>
              {branchCity}, {branchState}
            </Text>
            <View className="mt-auto pt-1">
              <Text className="text-[9px] font-semibold text-stone-900">
                Tel: {branchPhone}
              </Text>
            </View>
          </View>

          {/* If Found */}
          <View className="flex-[0.8] rounded-md border border-amber-200 bg-amber-50 p-2">
            <Text className="text-[8px] font-bold uppercase tracking-wide text-amber-900">
              If Found
            </Text>
            <Text className="text-[9px] font-semibold text-amber-900 mt-1" numberOfLines={2}>
              {libraryName}
            </Text>
            <Text className="text-[8px] text-stone-700" numberOfLines={1}>
              {branchName}
            </Text>
            <View className="mt-auto pt-1">
              <Text className="font-mono text-[7px] text-stone-700" numberOfLines={1}>
                {readerId}
              </Text>
            </View>
          </View>
        </View>
        <View className="shrink-0 border-t border-stone-200 bg-stone-100 px-2.5 py-1">
          <Text className="text-[7px] leading-tight text-stone-600" numberOfLines={1}>
            Present for borrow/return · Report lost cards · Non-transferable
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View className="h-[12%] shrink-0 flex-row items-center justify-between gap-2 border-t border-stone-200 bg-stone-100 px-3">
        <Text className="shrink-0 text-[9px] font-semibold text-amber-700">
          LibraryOS
        </Text>
        <Text className="text-right text-[8px] text-stone-600" numberOfLines={1}>
          Property of library · Not for resale
        </Text>
      </View>
    </View>
  );
}
