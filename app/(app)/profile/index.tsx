import { ScrollView } from "react-native";
import { YStack, XStack, Text, Button, Card, Separator, Spinner } from "tamagui";
import { router } from "expo-router";
import {
  ChevronLeft,
  Mail,
  User,
  Ruler,
  Calendar,
  Star,
  Clock,
  Pencil,
} from "@tamagui/lucide-icons";
import { useTranslation } from "react-i18next";
import { useProfile } from "../../../src/hooks/useUser";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useProfile();

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function calcAge(birthDate: string) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  if (isLoading) {
    return (
      <YStack flex={1} justify="center" items="center" bg="#F9FAFB">
        <Spinner size="large" color="#059669" />
      </YStack>
    );
  }

  if (!profile) return null;

  return (
    <YStack flex={1} bg="#F9FAFB">
      {/* Header */}
      <XStack
        items="center"
        justify="space-between"
        p={16}
        pt={60}
        bg="white"
        borderBottomWidth={1}
        borderColor="#E5E7EB"
      >
        <XStack items="center" gap={12}>
          <Button size="$3" chromeless circular onPress={() => router.back()}>
            <ChevronLeft size={22} color="#111827" />
          </Button>
          <Text fontSize="$6" fontWeight="bold" color="#111827">
            {t("profile.title")}
          </Text>
        </XStack>

        <Button
          size="$3"
          bg="#ECFDF5"
          pressStyle={{ bg: "#D1FAE5" }}
          circular
          onPress={() => router.push("/(app)/profile/edit" as any)}
        >
          <Pencil size={18} color="#059669" />
        </Button>
      </XStack>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <YStack items="center" gap={12} py={24}>
          <YStack
            width={88}
            height={88}
            rounded={44}
            bg="#ECFDF5"
            justify="center"
            items="center"
            borderWidth={3}
            borderColor="#059669"
          >
            <Text fontSize="$8" fontWeight="bold" color="#059669">
              {initials}
            </Text>
          </YStack>

          <YStack items="center" gap={4}>
            <Text fontSize="$6" fontWeight="bold" color="#111827">
              {profile.name}
            </Text>
            <Text fontSize="$3" color="#6B7280">
              @{profile.nickname}
            </Text>

            {/* Plan badge */}
            <YStack
              bg={profile.plan === "premium" ? "#FEF3C7" : "#F3F4F6"}
              px={12}
              py={4}
              rounded={20}
              mt={4}
            >
              <Text
                fontSize="$2"
                fontWeight="bold"
                color={profile.plan === "premium" ? "#D97706" : "#6B7280"}
              >
                {profile.plan === "premium"
                  ? t("home.planPremium")
                  : t("home.planFree")}
              </Text>
            </YStack>
          </YStack>
        </YStack>

        {/* Personal data */}
        <Card bg="white" rounded={16} p={20} borderWidth={1} borderColor="#E5E7EB">
          <Text fontSize="$3" fontWeight="bold" color="#374151" mb={16}>
            {t("profile.personalData")}
          </Text>

          <YStack gap={0}>
            <InfoRow
              icon={<Mail size={16} color="#059669" />}
              label={t("profile.email")}
              value={profile.email}
            />
            <Separator />
            <InfoRow
              icon={<User size={16} color="#059669" />}
              label={t("profile.sex")}
              value={t(`profile.sex_${profile.sex}`)}
            />
            <Separator />
            <InfoRow
              icon={<Calendar size={16} color="#059669" />}
              label={t("profile.birthDate")}
              value={`${formatDate(profile.birthDate)} · ${calcAge(profile.birthDate)} ${t("profile.years")}`}
            />
            <Separator />
            <InfoRow
              icon={<Ruler size={16} color="#059669" />}
              label={t("profile.height")}
              value={`${parseFloat(profile.height).toFixed(0)} cm`}
            />
          </YStack>
        </Card>

        {/* Account info */}
        <Card bg="white" rounded={16} p={20} borderWidth={1} borderColor="#E5E7EB">
          <Text fontSize="$3" fontWeight="bold" color="#374151" mb={16}>
            {t("profile.accountInfo")}
          </Text>

          <YStack gap={0}>
            <InfoRow
              icon={<Star size={16} color="#D97706" />}
              label={t("profile.plan")}
              value={profile.plan === "premium" ? t("home.planPremium") : t("home.planFree")}
            />
            <Separator />
            <InfoRow
              icon={<Clock size={16} color="#6B7280" />}
              label={t("profile.memberSince")}
              value={formatDate(profile.createdAt)}
            />
          </YStack>
        </Card>
      </ScrollView>
    </YStack>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <XStack items="center" gap={12} py={14}>
      <YStack
        width={32}
        height={32}
        rounded={16}
        bg="#F0FDF4"
        justify="center"
        items="center"
      >
        {icon}
      </YStack>
      <YStack flex={1} gap={2}>
        <Text fontSize="$2" color="#9CA3AF">
          {label}
        </Text>
        <Text fontSize="$3" fontWeight="600" color="#111827">
          {value}
        </Text>
      </YStack>
    </XStack>
  );
}
