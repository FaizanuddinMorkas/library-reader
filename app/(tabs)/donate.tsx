import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import Heart from "lucide-react-native/icons/heart";
import BookOpen from "lucide-react-native/icons/book-open";
import Users from "lucide-react-native/icons/users";
import Sparkles from "lucide-react-native/icons/sparkles";
import CreditCard from "lucide-react-native/icons/credit-card";
import Smartphone from "lucide-react-native/icons/smartphone";
import { AppHeader } from "@/components/layout/AppHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { DONATION_PRESETS } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function DonateScreen() {
  const [amount, setAmount] = useState<number | null>(DONATION_PRESETS[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [method, setMethod] = useState<"card" | "wallet">("card");
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState<{
    transactionId: string;
    amount: number;
    date: string;
  } | null>(null);

  const finalAmount = isCustom ? parseInt(customAmount) || 0 : amount ?? 0;

  const handleDonate = async () => {
    if (finalAmount < 10) {
      Alert.alert("Error", "Minimum donation amount is INR 10");
      return;
    }

    setLoading(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);

    setReceipt({
      transactionId: "TXN" + Date.now(),
      amount: finalAmount,
      date: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    setReceipt(null);
    setAmount(DONATION_PRESETS[0]);
    setIsCustom(false);
    setCustomAmount("");
  };

  if (receipt) {
    return (
      <Screen scroll={false}>
        <View className="flex-1 items-center justify-center px-6">
          <Card style={{ width: "100%", maxWidth: 400 }}>
            <View className="items-center py-6">
              <View className="w-20 h-20 rounded-full bg-success-100 items-center justify-center mb-4">
                <Heart size={40} stroke="#10B981" />
              </View>
              <Text className="text-2xl font-bold text-ink">
                Thank You!
              </Text>
              <Text className="text-sm text-ink-muted mt-2 text-center">
                Your donation of INR {receipt.amount} has been received.
              </Text>
              <View className="mt-4 bg-muted-50 rounded-xl p-4 w-full">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-ink-muted">Transaction ID</Text>
                  <Text className="text-sm font-medium text-ink">
                    {receipt.transactionId}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-ink-muted">Date</Text>
                  <Text className="text-sm font-medium text-ink">
                    {new Date(receipt.date).toLocaleDateString("en-IN")}
                  </Text>
                </View>
              </View>
              <Button
                title="Make Another Donation"
                onPress={handleReset}
                variant="gradient"
                style={{ marginTop: 24 }}
              />
            </View>
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <AppHeader
        title="Support the Library"
        subtitle="Your donation helps us grow our collection"
      />

      <Card variant="accent" className="mb-5">
        <View className="flex-row items-center">
          <Heart size={32} stroke="#F59E0B" />
          <View className="ml-4 flex-1">
            <Text className="text-lg font-bold text-ink">
              Every rupee counts
            </Text>
            <Text className="text-sm text-ink-soft">
              Your donations help us purchase new books and keep access free for
              everyone.
            </Text>
          </View>
        </View>
      </Card>

      <View className="gap-3 mb-6">
        {[
          {
            icon: BookOpen,
            title: "New Books",
            desc: "INR 500 buys a new book for the collection",
          },
          {
            icon: Users,
            title: "Community Access",
            desc: "Keeps e-library free for all registered members",
          },
          {
            icon: Sparkles,
            title: "Infrastructure",
            desc: "Helps maintain servers and digital systems",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <Card key={title}>
            <View className="flex-row items-start">
              <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
                <Icon size={20} stroke="#EA580C" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-ink">
                  {title}
                </Text>
                <Text className="text-xs text-ink-muted mt-0.5">{desc}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      <SectionTitle title="Select Amount" />
      <Card className="mb-5">
        <View className="flex-row flex-wrap gap-3 mb-4">
          {DONATION_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset}
              onPress={() => {
                setAmount(preset);
                setIsCustom(false);
              }}
            >
              <View
                className={cn(
                  "px-6 py-3 rounded-xl border",
                  amount === preset && !isCustom
                    ? "bg-brand-gradient border-transparent"
                    : "bg-surface border-border"
                )}
              >
                <Text
                  className={cn(
                    "font-semibold",
                    amount === preset && !isCustom
                      ? "text-white"
                      : "text-ink-soft"
                  )}
                >
                  ₹{preset}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={() => setIsCustom(true)}
        >
          <View
            className={cn(
              "px-4 py-3 rounded-xl border",
              isCustom
                ? "bg-primary-50 border-primary-300"
                : "bg-surface border-border"
            )}
          >
            <Text className="text-sm text-ink-muted">Custom Amount</Text>
            {isCustom && (
              <Input
                placeholder="Enter amount"
                value={customAmount}
                onChangeText={setCustomAmount}
                keyboardType="numeric"
              />
            )}
          </View>
        </TouchableOpacity>
      </Card>

      <SectionTitle title="Payment Method" />
      <Card className="mb-5">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setMethod("card")}
            className="flex-1"
          >
            <View
              className={cn(
                "p-4 rounded-xl border items-center",
                method === "card"
                  ? "bg-primary-50 border-primary-300"
                  : "bg-surface border-border"
              )}
            >
              <CreditCard
                size={24}
                stroke={method === "card" ? "#EA580C" : "#8A857C"}
              />
              <Text
                className={cn(
                  "text-sm font-medium mt-2",
                  method === "card" ? "text-primary-700" : "text-ink-soft"
                )}
              >
                Card
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMethod("wallet")}
            className="flex-1"
          >
            <View
              className={cn(
                "p-4 rounded-xl border items-center",
                method === "wallet"
                  ? "bg-primary-50 border-primary-300"
                  : "bg-surface border-border"
              )}
            >
              <Smartphone
                size={24}
                stroke={method === "wallet" ? "#EA580C" : "#8A857C"}
              />
              <Text
                className={cn(
                  "text-sm font-medium mt-2",
                  method === "wallet" ? "text-primary-700" : "text-ink-soft"
                )}
              >
                Wallet
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Card>

      <View className="bg-brand-gradient-soft rounded-2xl p-4 mb-6">
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-ink-soft">Total Donation</Text>
          <Text className="text-2xl font-bold text-ink">
            INR {finalAmount}
          </Text>
        </View>
      </View>

      <Button
        title={`Donate INR ${finalAmount}`}
        onPress={handleDonate}
        loading={loading}
        disabled={finalAmount < 10}
        size="lg"
        variant="gradient"
      />
    </Screen>
  );
}
