import { ScrollView, Alert } from "react-native";
import { YStack, XStack, Text, Button, Card, Spinner } from "tamagui";
import { router } from "expo-router";
import {
  Scale,
  ClipboardList,
  Plus,
  LogOut,
  Droplets,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Minus,
  User,
} from "@tamagui/lucide-icons";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/auth.store";
import { useEvolutionLatest } from "../../src/hooks/useEvolution";

export default function Home() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { data: latest, isLoading: loadingLatest } = useEvolutionLatest();

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  function handleLogout() {
    Alert.alert(t("home.logoutTitle"), t("home.logoutMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("auth.logout"),
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const TrendIcon =
    latest?.trend === "improving"
      ? TrendingUp
      : latest?.trend === "worsening"
        ? TrendingDown
        : Minus;

  const trendColor =
    latest?.trend === "improving"
      ? "#059669"
      : latest?.trend === "worsening"
        ? "#EF4444"
        : "#6B7280";

  return (
    <YStack flex={1} bg="#F9FAFB">
      {/* Header */}
      <YStack bg="#059669" pt={60} pb={24} px={20} gap={4}>
        <Text fontSize="$3" color="#D1FAE5">
          {t("home.greeting")} 👋
        </Text>
        <Text fontSize="$7" fontWeight="bold" color="white">
          {user?.name?.split(" ")[0] ?? ""}
        </Text>
      </YStack>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <Card
          bg="white"
          rounded={16}
          p={20}
          borderWidth={1}
          borderColor="#E5E7EB"
        >
          <XStack items="center" gap={16}>
            {/* Avatar */}
            <YStack
              width={56}
              height={56}
              rounded={28}
              bg="#ECFDF5"
              justify="center"
              items="center"
            >
              <Text fontSize="$5" fontWeight="bold" color="#059669">
                {initials}
              </Text>
            </YStack>

            {/* Info */}
            <YStack flex={1} gap={2}>
              <Text fontSize="$5" fontWeight="bold" color="#111827">
                {user?.name}
              </Text>
              <Text fontSize="$2" color="#6B7280">
                @{user?.nickname}
              </Text>
              <Text fontSize="$2" color="#9CA3AF">
                {user?.email}
              </Text>
            </YStack>

            {/* Plan badge */}
            <YStack
              bg={user?.plan === "premium" ? "#FEF3C7" : "#F3F4F6"}
              px={10}
              py={4}
              rounded={20}
            >
              <Text
                fontSize="$1"
                fontWeight="bold"
                color={user?.plan === "premium" ? "#D97706" : "#6B7280"}
              >
                {user?.plan === "premium"
                  ? t("home.planPremium")
                  : t("home.planFree")}
              </Text>
            </YStack>
          </XStack>
        </Card>

        {/* Latest measurement */}
        <YStack gap={8}>
          <Text fontSize="$3" fontWeight="bold" color="#374151">
            {t("home.lastMeasurement")}
          </Text>

          {loadingLatest ? (
            <Card bg="white" rounded={16} p={20} borderWidth={1} borderColor="#E5E7EB">
              <YStack justify="center" items="center" p={8}>
                <Spinner color="#059669" />
              </YStack>
            </Card>
          ) : latest?.current ? (
            <Card
              bg="white"
              rounded={16}
              p={20}
              borderWidth={1}
              borderColor="#E5E7EB"
              pressStyle={{ bg: "#F9FAFB" }}
              onPress={() =>
                router.push({
                  pathname: "/(app)/measurements/[id]",
                  params: { id: latest.current.id },
                })
              }
            >
              <YStack gap={12}>
                <XStack justify="space-between" items="center">
                  <Text fontSize="$2" color="#6B7280">
                    {formatDate(latest.current.measurementDate)}
                  </Text>
                  {latest.trend && (
                    <XStack items="center" gap={4}>
                      <TrendIcon size={14} color={trendColor} />
                      <Text fontSize="$2" color={trendColor} fontWeight="600">
                        {t(`home.trend_${latest.trend}`)}
                      </Text>
                    </XStack>
                  )}
                </XStack>

                <XStack gap={20} flexWrap="wrap">
                  <XStack items="center" gap={6}>
                    <Scale size={18} color="#059669" />
                    <Text fontSize="$6" fontWeight="bold" color="#111827">
                      {parseFloat(String(latest.current.weight)).toFixed(1)}
                    </Text>
                    <Text fontSize="$2" color="#6B7280">kg</Text>
                  </XStack>

                  {(latest.current.bodyFatPercentage ?? latest.current.navyBodyFatPercentage) != null && (
                    <XStack items="center" gap={6}>
                      <Droplets size={18} color="#3B82F6" />
                      <Text fontSize="$6" fontWeight="bold" color="#111827">
                        {parseFloat(
                          (latest.current.bodyFatPercentage ?? latest.current.navyBodyFatPercentage)!
                        ).toFixed(1)}
                      </Text>
                      <Text fontSize="$2" color="#6B7280">%</Text>
                    </XStack>
                  )}

                  {latest.current.leanMass != null && (
                    <XStack items="center" gap={6}>
                      <Dumbbell size={18} color="#8B5CF6" />
                      <Text fontSize="$6" fontWeight="bold" color="#111827">
                        {parseFloat(latest.current.leanMass).toFixed(1)}
                      </Text>
                      <Text fontSize="$2" color="#6B7280">kg</Text>
                    </XStack>
                  )}
                </XStack>
              </YStack>
            </Card>
          ) : (
            <Card bg="white" rounded={16} p={20} borderWidth={1} borderColor="#E5E7EB">
              <YStack items="center" gap={8} p={8}>
                <User size={32} color="#D1D5DB" />
                <Text fontSize="$3" color="#9CA3AF" text="center">
                  {t("home.noMeasurements")}
                </Text>
              </YStack>
            </Card>
          )}
        </YStack>

        {/* Actions */}
        <YStack gap={8}>
          <Text fontSize="$3" fontWeight="bold" color="#374151">
            {t("home.actions")}
          </Text>

          <XStack gap={12}>
            {/* Measurements list */}
            <Card
              flex={1}
              bg="white"
              rounded={16}
              p={20}
              borderWidth={1}
              borderColor="#E5E7EB"
              pressStyle={{ bg: "#F9FAFB" }}
              onPress={() => router.push("/(app)/measurements")}
            >
              <YStack items="center" gap={10}>
                <YStack
                  width={48}
                  height={48}
                  rounded={24}
                  bg="#ECFDF5"
                  justify="center"
                  items="center"
                >
                  <ClipboardList size={24} color="#059669" />
                </YStack>
                <Text fontSize="$3" fontWeight="600" color="#111827" text="center">
                  {t("home.measurements")}
                </Text>
              </YStack>
            </Card>

            {/* New measurement */}
            <Card
              flex={1}
              bg="#059669"
              rounded={16}
              p={20}
              pressStyle={{ bg: "#047857" }}
              onPress={() => router.push("/(app)/measurements/new")}
            >
              <YStack items="center" gap={10}>
                <YStack
                  width={48}
                  height={48}
                  rounded={24}
                  bg="rgba(255,255,255,0.2)"
                  justify="center"
                  items="center"
                >
                  <Plus size={24} color="white" />
                </YStack>
                <Text fontSize="$3" fontWeight="600" color="white" text="center">
                  {t("home.newMeasurement")}
                </Text>
              </YStack>
            </Card>
          </XStack>
        </YStack>

        {/* Logout */}
        <Button
          size="$4"
          bg="white"
          borderWidth={1}
          borderColor="#FCA5A5"
          pressStyle={{ bg: "#FEF2F2" }}
          onPress={handleLogout}
          mt={8}
        >
          <XStack items="center" gap={8}>
            <LogOut size={18} color="#DC2626" />
            <Text color="#DC2626" fontWeight="600">
              {t("auth.logout")}
            </Text>
          </XStack>
        </Button>
      </ScrollView>
    </YStack>
  );
}
