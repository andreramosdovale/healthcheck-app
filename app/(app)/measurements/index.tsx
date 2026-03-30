import { useState } from "react";
import { FlatList, RefreshControl, Alert } from "react-native";
import { YStack, XStack, Text, Button, Spinner, Card } from "tamagui";
import { router } from "expo-router";
import { Plus, Trash2, Scale, Droplets, Dumbbell, Eye } from "@tamagui/lucide-icons";
import { useTranslation } from "react-i18next";
import {
  useMeasurements,
  useDeleteMeasurement,
} from "../../../src/hooks/useMeasurements";

export default function MeasurementsList() {
  const { t } = useTranslation();
  const { data: measurements, isLoading, refetch } = useMeasurements();
  const deleteMutation = useDeleteMeasurement();
  const [refreshing, setRefreshing] = useState(false);

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
        onPress: () => deleteMutation.mutate(id),
      },
    ]);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  if (isLoading) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor="#F9FAFB"
      >
        <Spinner size="large" color="#059669" />
      </YStack>
    );
  }

  if (!measurements || measurements.length === 0) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        padding={20}
        backgroundColor="#F9FAFB"
        gap={16}
      >
        <Scale size={64} color="#9CA3AF" />
        <Text
          fontSize="$6"
          fontWeight="bold"
          color="#111827"
          textAlign="center"
        >
          {t("measurements.empty")}
        </Text>
        <Text fontSize="$3" color="#6B7280" textAlign="center">
          {t("measurements.emptySubtitle")}
        </Text>
        <Button
          size="$4"
          backgroundColor="#059669"
          pressStyle={{ backgroundColor: "#047857" }}
          onPress={() => router.push("/(app)/measurements/new")}
          marginTop={8}
        >
          <XStack alignItems="center" gap={8}>
            <Plus size={20} color="white" />
            <Text color="white">{t("measurements.addFirst")}</Text>
          </XStack>
        </Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="#F9FAFB">
      {/* Header */}
      <XStack
        justifyContent="space-between"
        alignItems="center"
        padding={16}
        paddingTop={60}
        backgroundColor="white"
        borderBottomWidth={1}
        borderBottomColor="#E5E7EB"
      >
        <Text fontSize="$7" fontWeight="bold" color="#111827">
          {t("measurements.title")}
        </Text>
        <Button
          size="$3"
          backgroundColor="#059669"
          pressStyle={{ backgroundColor: "#047857" }}
          onPress={() => router.push("/(app)/measurements/new")}
          circular
        >
          <Plus size={20} color="white" />
        </Button>
      </XStack>

      {/* List */}
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
          <Card
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            borderWidth={1}
            borderColor="#E5E7EB"
          >
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack gap={12} flex={1}>
                {/* Date */}
                <Text fontSize="$2" color="#6B7280">
                  {formatDate(item.measurementDate)}
                </Text>

                {/* Metrics */}
                <XStack gap={16} flexWrap="wrap">
                  {/* Weight */}
                  <XStack alignItems="center" gap={6}>
                    <Scale size={16} color="#059669" />
                    <Text fontSize="$5" fontWeight="bold" color="#111827">
                      {parseFloat(item.weight).toFixed(1)}
                    </Text>
                    <Text fontSize="$3" color="#6B7280">
                      {t("measurements.kg")}
                    </Text>
                  </XStack>

                  {/* Body Fat */}
                  {(item.bodyFatPercentage || item.navyBodyFatPercentage) && (
                    <XStack alignItems="center" gap={6}>
                      <Droplets size={16} color="#3B82F6" />
                      <Text fontSize="$5" fontWeight="bold" color="#111827">
                        {parseFloat(
                          item.bodyFatPercentage ||
                            item.navyBodyFatPercentage ||
                            "0",
                        ).toFixed(1)}
                      </Text>
                      <Text fontSize="$3" color="#6B7280">
                        %
                      </Text>
                    </XStack>
                  )}

                  {/* Lean Mass */}
                  {item.leanMass && (
                    <XStack alignItems="center" gap={6}>
                      <Dumbbell size={16} color="#8B5CF6" />
                      <Text fontSize="$5" fontWeight="bold" color="#111827">
                        {parseFloat(item.leanMass).toFixed(1)}
                      </Text>
                      <Text fontSize="$3" color="#6B7280">
                        {t("measurements.kg")}
                      </Text>
                    </XStack>
                  )}
                </XStack>
              </YStack>

              {/* Actions */}
              <XStack gap={4}>
                <Button
                  size="$2"
                  background="transparent"
                  pressStyle={{ background: "#ECFDF5" }}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/measurements/[id]",
                      params: { id: item.id },
                    })
                  }
                >
                  <Eye size={18} color="#059669" />
                </Button>
                <Button
                  size="$2"
                  background="transparent"
                  pressStyle={{ background: "#FEE2E2" }}
                  onPress={() => handleDelete(item.id)}
                >
                  <Trash2 size={18} color="#DC2626" />
                </Button>
              </XStack>
            </XStack>
          </Card>
        )}
      />
    </YStack>
  );
}
