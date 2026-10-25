import { useCallback, useEffect, useRef, useState } from "react";
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import BookOpenCheck from "lucide-react-native/icons/book-open-check";
import Building2 from "lucide-react-native/icons/building-2";
import Check from "lucide-react-native/icons/check";
import CircleAlert from "lucide-react-native/icons/circle-alert";
import KeyRound from "lucide-react-native/icons/key-round";
import Settings2 from "lucide-react-native/icons/settings-2";
import UserRound from "lucide-react-native/icons/user-round";
import { kioskApi, type KioskCirculationMode, type KioskReader } from "@/lib/api/kioskApi";

const KIOSK_CREDENTIAL_KEY = "libraryos_kiosk_device_credential";
type Stage = "loading" | "setup" | "idle" | "reader_scan" | "reader_confirm" | "copy_scan" | "submitting" | "outcome";

function displayReaderType(reader: KioskReader) {
  if (reader.readerType.toLowerCase() === "other" && reader.readerTypeOtherText) return reader.readerTypeOtherText;
  return reader.readerType.charAt(0).toUpperCase() + reader.readerType.slice(1);
}

export default function KioskScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [stage, setStage] = useState<Stage>("loading");
  const [credential, setCredential] = useState("");
  const [credentialInput, setCredentialInput] = useState("");
  const [mode, setMode] = useState<KioskCirculationMode>("take_out");
  const [readerCardValue, setReaderCardValue] = useState("");
  const [reader, setReader] = useState<KioskReader | null>(null);
  const [error, setError] = useState("");
  const scanLock = useRef(false);

  useEffect(() => {
    SecureStore.getItemAsync(KIOSK_CREDENTIAL_KEY)
      .then((saved) => {
        if (saved) {
          setCredential(saved);
          setStage("idle");
        } else {
          setStage("setup");
        }
      })
      .catch(() => {
        setError("Secure storage is unavailable on this device. Restart the kiosk app and try again.");
        setStage("setup");
      });
  }, []);

  useEffect(() => {
    scanLock.current = false;
  }, [stage]);

  const saveCredential = async () => {
    const value = credentialInput.trim();
    if (!value) return;
    try {
      await SecureStore.setItemAsync(KIOSK_CREDENTIAL_KEY, value);
      setCredential(value);
      setCredentialInput("");
      setError("");
      setStage("idle");
    } catch {
      setError("Could not save the device credential securely. Please try again.");
    }
  };

  const beginCheckout = (nextMode: KioskCirculationMode) => {
    setMode(nextMode);
    setReader(null);
    setReaderCardValue("");
    setError("");
    setStage("reader_scan");
  };

  const handleScan = useCallback(async ({ data }: BarcodeScanningResult) => {
    if (scanLock.current) return;
    const scannedValue = data.trim();
    if (!scannedValue || scannedValue.length > 160) {
      setError("This code is not valid. Scan the reader card or book copy again.");
      return;
    }
    scanLock.current = true;
    setError("");

    if (stage === "reader_scan") {
      try {
        const result = await kioskApi.lookupReader(credential, scannedValue);
        setReaderCardValue(scannedValue);
        setReader(result.reader);
        setStage("reader_confirm");
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Reader card could not be verified.");
        setStage("reader_scan");
        scanLock.current = false;
      }
      return;
    }

    if (stage === "copy_scan") {
      setStage("submitting");
      try {
        await kioskApi.checkout(credential, {
          readerCardValue,
          copyBarcode: scannedValue,
          circulationMode: mode,
        });
        setStage("outcome");
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Checkout could not be completed.");
        setStage("copy_scan");
        scanLock.current = false;
      }
    }
  }, [credential, mode, readerCardValue, stage]);

  if (stage === "loading") {
    return <SafeAreaView className="flex-1 items-center justify-center bg-[#F7F5F0]"><ActivityIndicator color="#E66A28" /></SafeAreaView>;
  }

  if (stage === "setup") {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 bg-[#F7F5F0]">
          <ScrollView
            className="flex-1"
            automaticallyAdjustKeyboardInsets
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 24 }}
            keyboardDismissMode="none"
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <View className="w-16 h-16 rounded-2xl bg-[#E66A28] items-center justify-center"><KeyRound size={28} color="#FFFFFF" /></View>
              <Text className="mt-6 text-3xl font-black text-[#211F1B]">Connect this kiosk</Text>
              <Text className="mt-2 text-base leading-6 text-[#716B62]">Paste the device credential shown once when a library admin registers this kiosk in LibraryOS.</Text>
              <TextInput
                value={credentialInput}
                onChangeText={setCredentialInput}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                textContentType="oneTimeCode"
                placeholder="Paste kiosk device credential"
                placeholderTextColor="#9A9388"
                className="mt-7 h-14 rounded-2xl border border-[#DED9D0] bg-white px-4 text-base text-[#211F1B]"
              />
              {error ? <ErrorMessage message={error} /> : null}
              <TouchableOpacity disabled={!credentialInput.trim()} onPress={() => void saveCredential()} className={`mt-4 h-14 rounded-2xl items-center justify-center ${credentialInput.trim() ? "bg-[#E66A28]" : "bg-[#C9C3BA]"}`}>
                <Text className="font-bold text-white">Save securely</Text>
              </TouchableOpacity>
              <Text className="mt-4 text-xs leading-5 text-[#8A8378]">The credential is stored in device secure storage. If it is lost, an admin can rotate it and paste the replacement here.</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  const scanning = stage === "reader_scan" || stage === "copy_scan";
  const stepTitle = stage === "reader_scan" ? "Scan reader card" : "Scan book copy";

  return (
    <SafeAreaView className="flex-1 bg-[#F7F5F0]">
      <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
        <View>
          <Text className="text-xs font-bold uppercase tracking-[2px] text-[#9A5832]">LibraryOS</Text>
          <Text className="mt-1 text-2xl font-black text-[#211F1B]">Self checkout</Text>
        </View>
        {(stage === "idle" || stage === "outcome") && <TouchableOpacity onPress={() => { setError(""); setCredentialInput(""); setStage("setup"); }} className="h-11 w-11 items-center justify-center rounded-full bg-white" accessibilityLabel="Configure kiosk"><Settings2 size={20} color="#5B554C" /></TouchableOpacity>}
        {scanning && <TouchableOpacity onPress={() => { setError(""); setStage(stage === "copy_scan" ? "reader_confirm" : "idle"); }} className="h-11 w-11 items-center justify-center rounded-full bg-white" accessibilityLabel="Go back"><ArrowLeft size={20} color="#5B554C" /></TouchableOpacity>}
      </View>

      {stage === "idle" && (
        <View className="flex-1 px-5 pb-6">
          <View className="rounded-3xl bg-[#24211D] p-5">
            <Text className="text-xl font-extrabold text-white">How will you use this book?</Text>
            <Text className="mt-1 text-sm leading-5 text-white/65">Choose a checkout type, then scan the reader card and copy barcode.</Text>
          </View>
          <ModeOption selected={mode === "take_out"} title="Take out" detail="Request to borrow outside the library" icon="book" onPress={() => setMode("take_out")} />
          <ModeOption selected={mode === "on_premise"} title="Read inside" detail="Check out for on-premise reading" icon="building" onPress={() => setMode("on_premise")} />
          <TouchableOpacity onPress={() => beginCheckout(mode)} className="mt-auto h-14 rounded-2xl bg-[#E66A28] items-center justify-center">
            <Text className="font-extrabold text-white">Start {mode === "take_out" ? "take-out" : "on-premise"} checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { void SecureStore.deleteItemAsync(KIOSK_CREDENTIAL_KEY).catch(() => undefined); setCredential(""); setStage("setup"); }} className="mt-4 items-center py-2">
            <Text className="text-sm font-semibold text-[#8A8378]">Replace device credential</Text>
          </TouchableOpacity>
        </View>
      )}

      {scanning && (
        <View className="flex-1 px-5 pb-5">
          <View className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3">
            <View className="h-10 w-10 rounded-xl bg-[#FFF0E6] items-center justify-center"><Text className="font-black text-[#C65220]">{stage === "reader_scan" ? "1" : "2"}</Text></View>
            <View><Text className="font-bold text-[#211F1B]">{stepTitle}</Text><Text className="mt-0.5 text-xs text-[#8A8378]">{mode === "take_out" ? "Take-out request" : "On-premise checkout"}</Text></View>
          </View>
          {stage === "copy_scan" && reader && <ReaderSummary reader={reader} />}
          {permission?.granted ? (
            <View className="mt-4 flex-1 overflow-hidden rounded-[28px] bg-[#171512]">
              <CameraView
                style={{ flex: 1 }}
                facing="back"
                barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39"] }}
                onBarcodeScanned={handleScan}
              />
              <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
                <View className="h-64 w-64 rounded-[32px] border-2 border-white/90" />
                <Text className="mt-5 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white">Align code inside the frame</Text>
              </View>
            </View>
          ) : (
            <View className="mt-4 flex-1 items-center justify-center rounded-[28px] bg-white px-6">
              <Text className="text-center text-lg font-extrabold text-[#211F1B]">Camera access is needed</Text>
              <Text className="mt-2 text-center leading-6 text-[#716B62]">Allow camera access to scan reader cards and book barcodes.</Text>
              <TouchableOpacity onPress={() => void requestPermission()} className="mt-5 rounded-xl bg-[#E66A28] px-6 py-3"><Text className="font-bold text-white">Allow camera</Text></TouchableOpacity>
            </View>
          )}
          {error ? <ErrorMessage message={error} /> : null}
        </View>
      )}

      {stage === "reader_confirm" && reader && (
        <View className="flex-1 px-5 pb-6">
          <Text className="text-xs font-bold uppercase tracking-[2px] text-[#9A5832]">Reader verified</Text>
          <Text className="mt-2 text-2xl font-black text-[#211F1B]">Confirm this reader</Text>
          <ReaderSummary reader={reader} prominent />
          {error ? <ErrorMessage message={error} /> : null}
          <TouchableOpacity onPress={() => { setError(""); setStage("copy_scan"); }} className="mt-auto h-14 rounded-2xl bg-[#E66A28] items-center justify-center"><Text className="font-extrabold text-white">Continue to book scan</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => { setReader(null); setReaderCardValue(""); setError(""); setStage("reader_scan"); }} className="mt-3 h-12 items-center justify-center"><Text className="font-semibold text-[#716B62]">Scan a different card</Text></TouchableOpacity>
        </View>
      )}

      {stage === "submitting" && <View className="flex-1 items-center justify-center px-6"><ActivityIndicator size="large" color="#E66A28" /><Text className="mt-4 font-semibold text-[#716B62]">Completing checkout…</Text></View>}

      {stage === "outcome" && (
        <View className="flex-1 px-5 pb-6 justify-center">
          <View className="h-16 w-16 rounded-2xl bg-[#E5F3E9] items-center justify-center"><Check size={30} color="#287A45" /></View>
          <Text className="mt-5 text-3xl font-black text-[#211F1B]">{mode === "take_out" ? "Request sent" : "Checkout complete"}</Text>
          <Text className="mt-2 text-base leading-6 text-[#716B62]">{mode === "take_out" ? "The copy is held for this reader. Library staff must approve the take-out request before it can leave the library." : "This copy is checked out for reading inside the library."}</Text>
          {reader ? <ReaderSummary reader={reader} /> : null}
          {error ? <ErrorMessage message={error} /> : null}
          <TouchableOpacity onPress={() => { setReader(null); setReaderCardValue(""); setError(""); setStage("idle"); }} className="mt-auto h-14 rounded-2xl bg-[#E66A28] items-center justify-center"><Text className="font-extrabold text-white">New checkout</Text></TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

function ModeOption({ selected, title, detail, icon, onPress }: { selected: boolean; title: string; detail: string; icon: "book" | "building"; onPress: () => void }) {
  const Icon = icon === "book" ? BookOpenCheck : Building2;
  return (
    <TouchableOpacity onPress={onPress} className={`mt-4 flex-row items-center rounded-2xl border p-4 ${selected ? "border-[#E66A28] bg-[#FFF5EE]" : "border-[#E5E0D7] bg-white"}`}>
      <View className={`h-11 w-11 items-center justify-center rounded-xl ${selected ? "bg-[#FFE5D5]" : "bg-[#F2EFEA]"}`}><Icon size={20} color={selected ? "#C65220" : "#716B62"} /></View>
      <View className="ml-3 flex-1"><Text className="font-extrabold text-[#211F1B]">{title}</Text><Text className="mt-1 text-xs text-[#8A8378]">{detail}</Text></View>
      <View className={`h-5 w-5 items-center justify-center rounded-full border ${selected ? "border-[#E66A28] bg-[#E66A28]" : "border-[#C9C3BA]"}`}>{selected ? <Check size={13} color="#FFFFFF" /> : null}</View>
    </TouchableOpacity>
  );
}

function ReaderSummary({ reader, prominent = false }: { reader: KioskReader; prominent?: boolean }) {
  return (
    <View className={`mt-4 rounded-2xl border border-[#E5E0D7] bg-white p-4 ${prominent ? "mt-6" : ""}`}>
      <View className="flex-row items-center">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-[#FFF0E6]"><UserRound size={20} color="#C65220" /></View>
        <View className="ml-3 flex-1"><Text className="font-extrabold text-[#211F1B]">{reader.fullName}</Text><Text className="mt-1 text-sm text-[#716B62]">{displayReaderType(reader)}</Text></View>
      </View>
      <View className="mt-4 flex-row items-center border-t border-[#F0ECE5] pt-3"><Building2 size={16} color="#8A8378" /><Text className="ml-2 text-sm text-[#716B62]">{reader.branchName}</Text></View>
    </View>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <View className="mt-4 flex-row items-start rounded-xl bg-[#FFF0EF] p-3"><CircleAlert size={17} color="#B93D32" /><Text className="ml-2 flex-1 text-sm leading-5 text-[#9E3027]">{message}</Text></View>;
}
