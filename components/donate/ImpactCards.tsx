import { View, Text } from "react-native";
import { Card } from "@/components/ui/Card";
import BookOpen from "lucide-react-native/icons/book-open";
import Users from "lucide-react-native/icons/users";
import Building from "lucide-react-native/icons/building";

const impacts = [
  {
    icon: BookOpen,
    title: "New Books",
    desc: "Helps us add new titles to our collection",
  },
  {
    icon: Users,
    title: "Community Access",
    desc: "Keeps library access free for everyone",
  },
  {
    icon: Building,
    title: "Infrastructure",
    desc: "Helps maintain servers and digital systems",
  },
];

export function ImpactCards() {
  return (
    <View className="gap-3 mb-6">
      {impacts.map(({ icon: Icon, title, desc }) => (
        <Card key={title}>
          <View className="flex-row items-start">
            <View className="w-10 h-10 rounded-xl bg-primary-50 items-center justify-center">
              <Icon size={20} stroke="#EA580C" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-semibold text-gray-900">
                {title}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">{desc}</Text>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}
