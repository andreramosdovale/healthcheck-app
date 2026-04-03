import { useState } from "react";
import { FlatList, RefreshControl, Alert, TouchableOpacity } from "react-native";
import { YStack, XStack, Text, Button, Spinner, Card, Separator, Popover } from "tamagui";
import { router } from "expo-router";
import { Plus, Trash2, Scale, Droplets, Dumbbell, Flame, ChevronRight, ChevronLeft, Info } from "@tamagui/lucide-icons";
import { useTranslation } from "react-i18next";
import {
  useMeasurements,
  useDeleteMeasurement,
  type Measurement,
} from "../../../src/hooks/useMeasurements";
import { useProfile } from "../../../src/hooks/useUser";

export default function MeasurementsList() {
  const { t } = useTranslation();
  const { data: measurements, isLoading, refetch } = useMeasurements();
  const { data: profile } = useProfile();
  const deleteMutation = useDeleteMeasurement();
  const sex = profile?.sex ?? null;
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  function handleDelete(id: string) {
    Alert.alert(t("measurements.delete"), t("measurements.deleteConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("measurements.delete"),
        style: "destructive",
        onPress: () => {
          setDeletingId(id);
          deleteMutation.mutate(id, {
            onSettled: () => setDeletingId(null),
          });
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <YStack flex={1} justify="center" items="center" bg="#F9FAFB">
        <Spinner size="large" color="#059669" />
      </YStack>
    );
  }

  if (!measurements || measurements.length === 0) {
    return (
      <YStack flex={1} justify="center" items="center" p={20} bg="#F9FAFB" gap={16}>
        <Scale size={64} color="#9CA3AF" />
        <Text fontSize="$6" fontWeight="bold" color="#111827" text="center">
          {t("measurements.empty")}
        </Text>
        <Text fontSize="$3" color="#6B7280" text="center">
          {t("measurements.emptySubtitle")}
        </Text>
        <Button
          size="$4"
          bg="#059669"
          pressStyle={{ bg: "#047857" }}
          onPress={() => router.push("/(app)/measurements/new")}
          mt={8}
        >
          <XStack items="center" gap={8}>
            <Plus size={20} color="white" />
            <Text color="white">{t("measurements.addFirst")}</Text>
          </XStack>
        </Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg="#F9FAFB">
      {/* Header */}
      <XStack
        justify="space-between"
        items="center"
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
          <Text fontSize="$7" fontWeight="bold" color="#111827">
            {t("measurements.title")}
          </Text>
        </XStack>
        <Button
          size="$3"
          bg="#059669"
          pressStyle={{ bg: "#047857" }}
          onPress={() => router.push("/(app)/measurements/new")}
          circular
        >
          <Plus size={20} color="white" />
        </Button>
      </XStack>

      <FlatList
        data={measurements}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#059669"]}
            tintColor="#059669"
          />
        }
        renderItem={({ item }) => (
          <MeasurementCard
            item={item}
            t={t}
            sex={sex}
            deleting={deletingId === item.id}
            onView={() =>
              router.push({
                pathname: "/(app)/measurements/[id]",
                params: { id: item.id },
              })
            }
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />
    </YStack>
  );
}

function MeasurementCard({
  item,
  t,
  sex,
  deleting,
  onView,
  onDelete,
}: {
  item: Measurement;
  t: (key: string) => string;
  sex: "male" | "female" | null;
  deleting: boolean;
  onView: () => void;
  onDelete: () => void;
}) {
  const { bodyFatPercentage, bodyFatMethod, leanMass, fatMass, leanMassPercentage, waistHipRatio } = item.calculated;
  const hasComposition = !!(bodyFatPercentage != null || leanMass != null || fatMass != null);
  const methodLabel = bodyFatMethod ? t(`measurements.method_${bodyFatMethod}`) : null;

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Card
      bg="white"
      rounded={14}
      borderWidth={1}
      borderColor="#E5E7EB"
      pressStyle={deleting ? {} : { bg: "#F9FAFB" }}
      onPress={deleting ? undefined : onView}
      opacity={deleting ? 0.5 : 1}
    >
      {/* Top row: date + actions */}
      <XStack justify="space-between" items="center" px={16} pt={14} pb={10}>
        <XStack items="center" gap={6}>
          <Text fontSize="$3" fontWeight="600" color="#374151">
            {formatDate(item.measurementDate)}
          </Text>
          {methodLabel && (
            <YStack bg="#EFF6FF" px={8} py={2} rounded={10}>
              <Text fontSize="$1" color="#3B82F6" fontWeight="600">
                {methodLabel}
              </Text>
            </YStack>
          )}
        </XStack>

        <XStack items="center" gap={2}>
          {deleting ? (
            <Spinner size="small" color="#DC2626" />
          ) : (
            <TouchableOpacity onPress={onDelete} style={{ padding: 8, borderRadius: 20 }}>
              <Trash2 size={16} color="#DC2626" />
            </TouchableOpacity>
          )}
          <ChevronRight size={18} color="#9CA3AF" />
        </XStack>
      </XStack>

      <Separator borderColor="#F3F4F6" />

      {/* Weight + WHR */}
      <XStack px={16} py={12} gap={8}>
        <CompositionCell
          flex={1}
          icon={<Scale size={14} color="#059669" />}
          iconBg="#ECFDF5"
          label={t("measurements.weight")}
          value={`${item.weight.toFixed(1)} ${t("measurements.kg")}`}
        />
        {waistHipRatio != null ? (
          <XStack flex={1} items="center" gap={8} p={10}>
            <YStack flex={1}>
              <XStack items="center" gap={4}>
                <Text fontSize="$1" color="#9CA3AF">{t("measurements.waistHipRatio")}</Text>
                <Popover size="$5" allowFlip placement="top">
                  <Popover.Trigger asChild>
                    <Button size="$1" chromeless circular p={0}>
                      <Info size={12} color="#9CA3AF" />
                    </Button>
                  </Popover.Trigger>
                  <Popover.Content
                    bg="white"
                    borderWidth={1}
                    borderColor="#E5E7EB"
                    rounded={12}
                    p={14}
                    style={{ maxWidth: 240 }}
                    elevate
                  >
                    <Popover.Arrow bg="white" borderColor="#E5E7EB" borderWidth={1} />
                    <YStack gap={6}>
                      <Text fontSize="$3" fontWeight="bold" color="#111827">
                        {t("measurements.waistHipRatio")}
                      </Text>
                      <Text fontSize="$2" color="#6B7280">
                        {t(`measurements.whrInfo_${sex ?? "male"}`)}
                      </Text>
                    </YStack>
                  </Popover.Content>
                </Popover>
              </XStack>
              <XStack items="center" gap={6}>
                <Text fontSize="$3" fontWeight="bold" color="#111827">
                  {waistHipRatio.value.toFixed(2)}
                </Text>
                {waistHipRatio.risk != null && (
                  <WhrBadge risk={waistHipRatio.risk} t={t} />
                )}
              </XStack>
            </YStack>
          </XStack>
        ) : (
          <YStack flex={1} />
        )}
      </XStack>

      {/* Composition */}
      {hasComposition && (
        <>
          <Separator borderColor="#F3F4F6" />
          <YStack px={16} pt={12} pb={14} gap={10}>
            <Text fontSize="$2" fontWeight="600" color="#374151">
              {t("measurements.composition")}
            </Text>
            {/* Row 1: % gordura | % massa magra */}
            <XStack gap={8}>
              <CompositionCell
                flex={1}
                icon={<Droplets size={14} color="#3B82F6" />}
                iconBg="#EFF6FF"
                label={t("measurements.bodyFat")}
                value={bodyFatPercentage != null ? `${bodyFatPercentage.toFixed(1)} %` : "—"}
              />
              <CompositionCell
                flex={1}
                icon={<Dumbbell size={14} color="#8B5CF6" />}
                iconBg="#F5F3FF"
                label={t("measurements.leanMassPercentage")}
                value={leanMassPercentage != null ? `${leanMassPercentage.toFixed(1)} %` : "—"}
              />
            </XStack>
            {/* Row 2: massa magra kg | massa gorda kg */}
            <XStack gap={8}>
              <CompositionCell
                flex={1}
                icon={<Dumbbell size={14} color="#8B5CF6" />}
                iconBg="#F5F3FF"
                label={t("measurements.leanMass")}
                value={leanMass != null ? `${leanMass.toFixed(1)} ${t("measurements.kg")}` : "—"}
              />
              <CompositionCell
                flex={1}
                icon={<Flame size={14} color="#F97316" />}
                iconBg="#FFF7ED"
                label={t("measurements.fatMass")}
                value={fatMass != null ? `${fatMass.toFixed(1)} ${t("measurements.kg")}` : "—"}
              />
            </XStack>
          </YStack>
        </>
      )}
    </Card>
  );
}

const WHR_STYLE: Record<"low" | "moderate" | "high", { bg: string; color: string; key: string }> = {
  low:      { bg: "#ECFDF5", color: "#059669", key: "measurements.whrLow" },
  moderate: { bg: "#FEF3C7", color: "#D97706", key: "measurements.whrModerate" },
  high:     { bg: "#FEE2E2", color: "#DC2626", key: "measurements.whrHigh" },
};

function CompositionCell({
  flex,
  icon,
  iconBg,
  label,
  value,
}: {
  flex: number;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <XStack flex={flex} items="center" gap={8} p={10}>
      <YStack
        width={28}
        height={28}
        rounded={14}
        style={{ backgroundColor: iconBg }}
        justify="center"
        items="center"
      >
        {icon}
      </YStack>
      <YStack>
        <Text fontSize="$1" color="#9CA3AF">{label}</Text>
        <Text fontSize="$3" fontWeight="bold" color="#111827">{value}</Text>
      </YStack>
    </XStack>
  );
}

function WhrBadge({
  risk,
  t,
}: {
  risk: "low" | "moderate" | "high";
  t: (key: string) => string;
}) {
  const s = WHR_STYLE[risk];
  return (
    <YStack style={{ backgroundColor: s.bg }} px={6} py={2} rounded={8}>
      <Text fontSize="$1" fontWeight="bold" style={{ color: s.color }}>
        {t(s.key)}
      </Text>
    </YStack>
  );
}
