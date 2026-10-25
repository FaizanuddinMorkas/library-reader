import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import ArrowLeft from "lucide-react-native/icons/arrow-left";
import { Screen } from "@/components/ui/Screen";
import { borrowRequestsApi } from "@/lib/api/borrowRequestsApi";
import type { BorrowRequest } from "@/types/reader";

export default function BorrowRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(0);
  const load = useCallback(async () => {
    try { setRequests(await borrowRequestsApi.list()); } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  useEffect(() => { const interval = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(interval); }, []);
  const cancel = async (id: string) => { await borrowRequestsApi.cancel(id); await load(); };

  return <Screen refreshing={loading} onRefresh={load}>
    <View className="pt-10 pb-5 flex-row items-center"><TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full bg-white border border-border items-center justify-center"><ArrowLeft size={20} stroke="#181713" /></TouchableOpacity><Text className="text-xl font-black text-ink ml-4">Borrow requests</Text></View>
    {requests.length === 0 && !loading ? <View className="rounded-2xl bg-white border border-border p-6"><Text className="text-sm text-ink-muted text-center">No borrow requests yet. Scan a physical copy QR at the library to request it.</Text></View> : requests.map((request) => {
      const seconds = Math.max(0, Math.ceil((new Date(request.expiresAt).getTime() - now) / 1000));
      const pending = request.status === "pending";
      return <View key={request.id} className="rounded-2xl bg-white border border-border p-4 mb-3"><Text className="text-base font-bold text-ink">{request.bookTitle}</Text><Text className="text-xs text-ink-muted mt-1">Copy {request.requestedCopyBarcode}</Text><Text className={`text-xs font-bold mt-3 ${pending ? "text-amber-700" : "text-ink-soft"}`}>{pending ? `HELD · ${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s remaining` : request.status.toUpperCase()}</Text>{request.rejectionReason ? <Text className="text-xs text-danger-600 mt-2">{request.rejectionReason}</Text> : null}{pending ? <TouchableOpacity onPress={() => void cancel(request.id)} className="self-start mt-3 px-3 py-2 rounded-xl bg-muted-50"><Text className="text-xs font-bold text-ink">Cancel request</Text></TouchableOpacity> : null}</View>;
    })}
  </Screen>;
}
