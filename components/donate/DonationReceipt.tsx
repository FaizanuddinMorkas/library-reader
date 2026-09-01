import { View, Text } from "react-native";
import Heart from "lucide-react-native/icons/heart";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface DonationReceiptProps {
  amount: number;
  transactionId: string;
  date: string;
  onReset: () => void;
}

export function DonationReceipt({ amount, transactionId, date, onReset }: DonationReceiptProps) {
  return (
    <View className="flex-1 bg-background p-4 items-center justify-center">
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <View className="items-center py-6">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
            <Heart size={40} stroke="#10B981" />
          </View>
          <Text className="text-2xl font-bold text-gray-900">
            Thank You!
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center">
            Your donation of INR {amount.toLocaleString("en-IN")} has been received.
          </Text>
          <View className="mt-4 bg-gray-50 rounded-xl p-4 w-full">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-gray-500">Transaction ID</Text>
              <Text className="text-sm font-medium text-gray-900">
                {transactionId}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Date</Text>
              <Text className="text-sm font-medium text-gray-900">
                {new Date(date).toLocaleDateString("en-IN")}
              </Text>
            </View>
          </View>
          <Button
            title="Make Another Donation"
            onPress={onReset}
            variant="secondary"
            style={{ marginTop: 24 }}
          />
        </View>
      </Card>
    </View>
  );
}
