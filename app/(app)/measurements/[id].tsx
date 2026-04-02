import { ScrollView } from "react-native";
import { YStack, XStack, Text, Button, Spinner, Card, Separator } from "tamagui";
import { router, useLocalSearchParams } from "expo-router";
import {
  ChevronLeft,
  Scale,
  Droplets,
  Dumbbell,
  Flame,
  Calendar,
  Ruler,
  Activity,
} from "@tamagui/lucide-icons";
import { useTranslation } from "react-i18next";
import {
  useMeasurement,
  useMeasurementDelta,
  getDeltaIndicator,
  type MeasurementDelta,
} from "../../../src/hooks/useMeasurements";

type Delta = MeasurementDelta["delta"];

export default function ViewMeasurement() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: measurement, isLoading: loadingMeasurement } = useMeasurement(id);
  const { data: deltaData, isLoading: loadingDelta } = useMeasurementDelta(id);

  const isLoading = loadingMeasurement || loadingDelta;
  const delta = deltaData?.delta ?? null;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function fmt(value: number | null | undefined, decimals = 1) {
    if (value == null) return "—";
    return value.toFixed(decimals);
  }

  if (isLoading) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="#F9FAFB">
        <Spinner size="large" color="#059669" />
      </YStack>
    );
  }

  if (!measurement) {
    return (
      <YStack flex={1} justifyContent="center" alignItems="center" backgroundColor="#F9FAFB">
        <Text color="#6B7280">{t("measurements.notFound")}</Text>
      </YStack>
    );
  }

  const { calculated, skinfolds, circumferences } = measurement;

  return (
    <YStack flex={1} backgroundColor="#F9FAFB">
      {/* Header */}
      <XStack
        alignItems="center"
        padding={16}
        paddingTop={60}
        backgroundColor="white"
        borderBottomWidth={1}
        borderBottomColor="#E5E7EB"
        gap={12}
      >
        <Button size="$3" chromeless circular onPress={() => router.back()}>
          <ChevronLeft size={22} color="#111827" />
        </Button>
        <Text fontSize="$6" fontWeight="bold" color="#111827">
          {t("measurements.viewTitle")}
        </Text>
      </XStack>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* Date */}
        <Card backgroundColor="white" borderRadius={12} padding={16} borderWidth={1} borderColor="#E5E7EB">
          <XStack alignItems="center" gap={10}>
            <IconBadge color="#ECFDF5">
              <Calendar size={20} color="#059669" />
            </IconBadge>
            <YStack>
              <Text fontSize="$2" color="#6B7280">{t("measurements.date")}</Text>
              <Text fontSize="$5" fontWeight="bold" color="#111827">
                {formatDate(measurement.measurementDate)}
              </Text>
            </YStack>
          </XStack>
        </Card>

        {/* Weight */}
        <Card backgroundColor="white" borderRadius={12} padding={16} borderWidth={1} borderColor="#E5E7EB">
          <XStack alignItems="center" gap={10}>
            <IconBadge color="#ECFDF5">
              <Scale size={20} color="#059669" />
            </IconBadge>
            <YStack flex={1}>
              <Text fontSize="$2" color="#6B7280">{t("measurements.weight")}</Text>
              <XStack alignItems="baseline" gap={6}>
                <Text fontSize="$8" fontWeight="bold" color="#111827">
                  {measurement.weight.toFixed(1)}
                </Text>
                <Text fontSize="$4" color="#6B7280">{t("measurements.kg")}</Text>
                <DeltaArrow field="weight" delta={delta} />
              </XStack>
            </YStack>
          </XStack>
        </Card>

        {/* Calculated */}
        {calculated.bodyFatPercentage != null && (
          <Card backgroundColor="white" borderRadius={12} padding={16} borderWidth={1} borderColor="#E5E7EB">
            <XStack alignItems="center" gap={8} marginBottom={12}>
              <IconBadge color="#EFF6FF">
                <Activity size={20} color="#3B82F6" />
              </IconBadge>
              <YStack>
                <Text fontSize="$4" fontWeight="bold" color="#111827">
                  {t("measurements.composition")}
                </Text>
                {calculated.bodyFatMethod && (
                  <Text fontSize="$2" color="#6B7280">
                    {t(`measurements.method_${calculated.bodyFatMethod}`)}
                  </Text>
                )}
              </YStack>
            </XStack>
            <Separator marginBottom={12} />
            <YStack gap={10}>
              <DataRow
                label={t("measurements.bodyFat")}
                value={`${fmt(calculated.bodyFatPercentage)} %`}
                icon={<Droplets size={14} color="#3B82F6" />}
                field="bodyFatPercentage"
                delta={delta}
              />
              {calculated.leanMassPercentage != null && (
                <DataRow
                  label={t("measurements.leanMassPercentage")}
                  value={`${fmt(calculated.leanMassPercentage)} %`}
                  icon={<Dumbbell size={14} color="#8B5CF6" />}
                  field="leanMass"
                  delta={delta}
                />
              )}
              {calculated.leanMass != null && (
                <DataRow
                  label={t("measurements.leanMass")}
                  value={`${fmt(calculated.leanMass)} ${t("measurements.kg")}`}
                  icon={<Dumbbell size={14} color="#8B5CF6" />}
                  field="leanMass"
                  delta={delta}
                />
              )}
              {calculated.fatMass != null && (
                <DataRow
                  label={t("measurements.fatMass")}
                  value={`${fmt(calculated.fatMass)} ${t("measurements.kg")}`}
                  icon={<Flame size={14} color="#F97316" />}
                  field="fatMass"
                  delta={delta}
                />
              )}
            </YStack>
          </Card>
        )}

        {/* Skinfolds */}
        {skinfolds && (
          <Card backgroundColor="white" borderRadius={12} padding={16} borderWidth={1} borderColor="#E5E7EB">
            <XStack alignItems="center" gap={8} marginBottom={12}>
              <IconBadge color="#FFF7ED">
                <Droplets size={20} color="#F97316" />
              </IconBadge>
              <YStack flex={1}>
                <Text fontSize="$4" fontWeight="bold" color="#111827">
                  {t("measurements.skinfolds")}
                </Text>
              </YStack>
              {/* skinfoldSum indicator on the section header */}
              <DeltaArrow field="skinfoldSum" delta={delta} size="$4" />
            </XStack>
            <Separator marginBottom={12} />
            <YStack gap={10}>
              <DataRow label={t("measurements.skinfold_triceps")} value={`${fmt(skinfolds.triceps)} mm`} field="triceps" delta={delta} />
              <DataRow label={t("measurements.skinfold_subscapular")} value={`${fmt(skinfolds.subscapular)} mm`} field="subscapular" delta={delta} />
              <DataRow label={t("measurements.skinfold_chest")} value={`${fmt(skinfolds.chest)} mm`} field="chest" delta={delta} />
              <DataRow label={t("measurements.skinfold_midaxillary")} value={`${fmt(skinfolds.midaxillary)} mm`} field="midaxillary" delta={delta} />
              <DataRow label={t("measurements.skinfold_suprailiac")} value={`${fmt(skinfolds.suprailiac)} mm`} field="suprailiac" delta={delta} />
              <DataRow label={t("measurements.skinfold_abdominal")} value={`${fmt(skinfolds.abdominal)} mm`} field="abdominal" delta={delta} />
              <DataRow label={t("measurements.skinfold_thigh")} value={`${fmt(skinfolds.thigh)} mm`} field="thigh" delta={delta} />
            </YStack>
          </Card>
        )}

        {/* Circumferences */}
        {circumferences && (
          <Card backgroundColor="white" borderRadius={12} padding={16} borderWidth={1} borderColor="#E5E7EB">
            <XStack alignItems="center" gap={8} marginBottom={12}>
              <IconBadge color="#F5F3FF">
                <Ruler size={20} color="#8B5CF6" />
              </IconBadge>
              <Text fontSize="$4" fontWeight="bold" color="#111827">
                {t("measurements.circumferences")}
              </Text>
            </XStack>
            <Separator marginBottom={12} />
            <YStack gap={10}>
              {circumferences.neck != null && (
                <DataRow
                  label={t("measurements.circ_neck")}
                  value={`${fmt(circumferences.neck)} cm`}
                  field="neck"
                  delta={delta}
                />
              )}
              {circumferences.shoulders != null && (
                <DataRow
                  label={t("measurements.circ_shoulders")}
                  value={`${fmt(circumferences.shoulders)} cm`}
                  field="shoulders"
                  delta={delta}
                />
              )}
              {circumferences.chestCirc != null && (
                <DataRow
                  label={t("measurements.circ_chest")}
                  value={`${fmt(circumferences.chestCirc)} cm`}
                  field="chestCirc"
                  delta={delta}
                />
              )}
              {circumferences.waist != null && (
                <DataRow
                  label={t("measurements.circ_waist")}
                  value={`${fmt(circumferences.waist)} cm`}
                  field="waist"
                  delta={delta}
                />
              )}
              {circumferences.hip != null && (
                <DataRow
                  label={t("measurements.circ_hip")}
                  value={`${fmt(circumferences.hip)} cm`}
                  field="hip"
                  delta={delta}
                />
              )}
              {(circumferences.leftThigh != null || circumferences.rightThigh != null) && (
                <DataRowPair
                  label={t("measurements.circ_thigh")}
                  leftLabel={t("measurements.left")}
                  rightLabel={t("measurements.right")}
                  leftValue={`${fmt(circumferences.leftThigh)} cm`}
                  rightValue={`${fmt(circumferences.rightThigh)} cm`}
                  leftField="leftThigh"
                  rightField="rightThigh"
                  delta={delta}
                />
              )}
              {(circumferences.leftCalf != null || circumferences.rightCalf != null) && (
                <DataRowPair
                  label={t("measurements.circ_calf")}
                  leftLabel={t("measurements.left")}
                  rightLabel={t("measurements.right")}
                  leftValue={`${fmt(circumferences.leftCalf)} cm`}
                  rightValue={`${fmt(circumferences.rightCalf)} cm`}
                  leftField="leftCalf"
                  rightField="rightCalf"
                  delta={delta}
                />
              )}
              {(circumferences.leftBicepRelaxed != null || circumferences.rightBicepRelaxed != null) && (
                <DataRowPair
                  label={t("measurements.circ_bicepRelaxed")}
                  leftLabel={t("measurements.left")}
                  rightLabel={t("measurements.right")}
                  leftValue={`${fmt(circumferences.leftBicepRelaxed)} cm`}
                  rightValue={`${fmt(circumferences.rightBicepRelaxed)} cm`}
                  leftField="leftBicepRelaxed"
                  rightField="rightBicepRelaxed"
                  delta={delta}
                />
              )}
              {(circumferences.leftBicepFlexed != null || circumferences.rightBicepFlexed != null) && (
                <DataRowPair
                  label={t("measurements.circ_bicepFlexed")}
                  leftLabel={t("measurements.left")}
                  rightLabel={t("measurements.right")}
                  leftValue={`${fmt(circumferences.leftBicepFlexed)} cm`}
                  rightValue={`${fmt(circumferences.rightBicepFlexed)} cm`}
                  leftField="leftBicepFlexed"
                  rightField="rightBicepFlexed"
                  delta={delta}
                />
              )}
            </YStack>
          </Card>
        )}
      </ScrollView>
    </YStack>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DeltaArrow({
  field,
  delta,
  size = "$3",
}: {
  field: string;
  delta: Delta;
  size?: string;
}) {
  if (!delta) return null;
  const direction = (delta as Record<string, any>)[field] ?? null;
  const indicator = getDeltaIndicator(field, direction);
  if (!indicator) return null;
  return (
    <Text fontSize={size as any} fontWeight="bold" style={{ color: indicator.color }}>
      {indicator.arrow}
    </Text>
  );
}

function IconBadge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <YStack
      width={40}
      height={40}
      borderRadius={20}
      backgroundColor={color}
      justifyContent="center"
      alignItems="center"
    >
      {children}
    </YStack>
  );
}

function DataRow({
  label,
  value,
  icon,
  field,
  delta,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  field?: string;
  delta?: Delta;
}) {
  return (
    <XStack justifyContent="space-between" alignItems="center">
      <XStack alignItems="center" gap={6}>
        {icon}
        <Text fontSize="$3" color="#6B7280">{label}</Text>
      </XStack>
      <XStack alignItems="center" gap={6}>
        <Text fontSize="$3" fontWeight="600" color="#111827">{value}</Text>
        {field && delta ? <DeltaArrow field={field} delta={delta} /> : null}
      </XStack>
    </XStack>
  );
}

function DataRowPair({
  label,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  leftField,
  rightField,
  delta,
}: {
  label: string;
  leftLabel: string;
  rightLabel: string;
  leftValue: string;
  rightValue: string;
  leftField?: string;
  rightField?: string;
  delta?: Delta;
}) {
  return (
    <YStack gap={4}>
      <Text fontSize="$3" color="#6B7280">{label}</Text>
      <XStack justifyContent="space-between">
        <XStack gap={4} alignItems="center">
          <Text fontSize="$2" color="#9CA3AF">{leftLabel}</Text>
          <Text fontSize="$3" fontWeight="600" color="#111827">{leftValue}</Text>
          {leftField && delta ? <DeltaArrow field={leftField} delta={delta} /> : null}
        </XStack>
        <XStack gap={4} alignItems="center">
          <Text fontSize="$2" color="#9CA3AF">{rightLabel}</Text>
          <Text fontSize="$3" fontWeight="600" color="#111827">{rightValue}</Text>
          {rightField && delta ? <DeltaArrow field={rightField} delta={delta} /> : null}
        </XStack>
      </XStack>
    </YStack>
  );
}
