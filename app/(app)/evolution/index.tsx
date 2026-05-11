import { ScrollView, Pressable, ActivityIndicator, Dimensions } from "react-native";
import { YStack, XStack, Text, Card } from "tamagui";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { LineChart } from "react-native-gifted-charts";
import {
  useEvolutionSummary,
  type ChartPoint,
  type MetricKey,
  type WeeksParam,
  METRIC_UNIT,
} from "../../../src/hooks/useEvolution";
import { useAuthStore } from "../../../src/stores/auth.store";

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get("window").width;
// screen padding 16×2 + card padding 16×2 + y-axis label area ~45
const CHART_WIDTH = SCREEN_WIDTH - 32 - 32 - 45;

const METRIC_KEYS: MetricKey[] = [
  "weight",
  "bodyFatPercentage",
  "leanMassPercentage",
  "leanMass",
  "fatMass",
  "waistHipRatio",
];

const METRIC_COLORS: Record<MetricKey, string> = {
  weight: "#059669",
  bodyFatPercentage: "#EF4444",
  leanMassPercentage: "#3B82F6",
  leanMass: "#8B5CF6",
  fatMass: "#F97316",
  waistHipRatio: "#EC4899",
};

const WEEKS_OPTIONS: Array<{ label: string; value: WeeksParam }> = [
  { label: "4s", value: 4 },
  { label: "8s", value: 8 },
  { label: "3m", value: 12 },
  { label: "6m", value: 26 },
  { label: "1a", value: 52 },
  { label: "Tudo", value: "all" },
];

const MAX_SELECTED = 3;

// WHR risk bands
const WHR_BANDS_MALE = [
  { upTo: 0.9, color: "#D1FAE5", label: "whrLow" },
  { upTo: 1.0, color: "#FEF3C7", label: "whrModerate" },
  { upTo: Infinity, color: "#FEE2E2", label: "whrHigh" },
];
const WHR_BANDS_FEMALE = [
  { upTo: 0.8, color: "#D1FAE5", label: "whrLow" },
  { upTo: 0.85, color: "#FEF3C7", label: "whrModerate" },
  { upTo: Infinity, color: "#FEE2E2", label: "whrHigh" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shortDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function labelEvery(data: ChartPoint[], maxLabels = 5): number {
  if (data.length <= maxLabels) return 1;
  return Math.ceil(data.length / maxLabels);
}

// ─── Single-metric chart ──────────────────────────────────────────────────────

function MetricChart({
  data,
  metric,
}: {
  data: ChartPoint[];
  metric: MetricKey;
}) {
  const color = METRIC_COLORS[metric];
  const unit = METRIC_UNIT[metric];
  const step = labelEvery(data);

  const chartData = data.map((p, i) => {
    const raw = p[metric as keyof ChartPoint] as number | null;
    return {
      value: raw ?? 0,
      hideDataPoint: raw == null,
      label: i % step === 0 ? shortDate(p.date) : "",
      labelTextStyle: { color: "#9CA3AF", fontSize: 9 },
    };
  });

  const values = data
    .map((p) => p[metric as keyof ChartPoint] as number | null)
    .filter((v): v is number => v != null);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = (maxVal - minVal) * 0.15 || 1;

  return (
    <LineChart
      data={chartData}
      width={CHART_WIDTH}
      height={160}
      color={color}
      thickness={2}
      dataPointsColor={color}
      dataPointsRadius={3}
      startFillColor={`${color}30`}
      endFillColor={`${color}00`}
      areaChart
      curved
      hideRules={false}
      rulesColor="#F3F4F6"
      rulesType="solid"
      yAxisColor="#E5E7EB"
      xAxisColor="#E5E7EB"
      yAxisTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
      xAxisLabelTextStyle={{ color: "#9CA3AF", fontSize: 9 }}
      yAxisLabelSuffix={unit ? ` ${unit}` : ""}
      noOfSections={4}
      minValue={Math.floor(minVal - padding)}
      maxValue={Math.ceil(maxVal + padding)}
      initialSpacing={8}
      endSpacing={8}
      pressEnabled
      showStripOnPress
      stripColor="#E5E7EB"
      stripWidth={1}
      showTextOnPress
      textShiftY={-8}
      textShiftX={-4}
      textColor={color}
      textFontSize={11}
    />
  );
}

// ─── WHR chart with risk bands ────────────────────────────────────────────────

function WhrChart({
  data,
  sex,
}: {
  data: ChartPoint[];
  sex: "male" | "female" | null | undefined;
}) {
  const { t } = useTranslation();
  const color = METRIC_COLORS.waistHipRatio;
  const bands = sex === "female" ? WHR_BANDS_FEMALE : WHR_BANDS_MALE;
  const step = labelEvery(data);

  const whrValues = data
    .map((p) => p.waistHipRatio)
    .filter((v): v is number => v != null);

  if (whrValues.length === 0) return null;

  const chartData = data.map((p, i) => ({
    value: p.waistHipRatio ?? 0,
    hideDataPoint: p.waistHipRatio == null,
    label: i % step === 0 ? shortDate(p.date) : "",
    labelTextStyle: { color: "#9CA3AF", fontSize: 9 },
  }));

  const minVal = Math.min(...whrValues);
  const maxVal = Math.max(...whrValues);
  const padding = (maxVal - minVal) * 0.15 || 0.05;

  // Determine risk zone color based on current range
  const currentWhr = whrValues[whrValues.length - 1];
  const currentBand = bands.find((b) => currentWhr < b.upTo) ?? bands[bands.length - 1];

  return (
    <YStack gap={8}>
      <YStack
        rounded={8}
        py={6}
        px={10}
        style={{ backgroundColor: currentBand.color }}
      >
        <Text fontSize="$1" color="#374151">
          {t(`measurements.${currentBand.label}`)} — {currentWhr.toFixed(3)}
        </Text>
      </YStack>

      <LineChart
        data={chartData}
        width={CHART_WIDTH}
        height={160}
        color={color}
        thickness={2}
        dataPointsColor={color}
        dataPointsRadius={3}
        startFillColor={`${color}30`}
        endFillColor={`${color}00`}
        areaChart
        curved
        hideRules={false}
        rulesColor="#F3F4F6"
        rulesType="solid"
        yAxisColor="#E5E7EB"
        xAxisColor="#E5E7EB"
        yAxisTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
        xAxisLabelTextStyle={{ color: "#9CA3AF", fontSize: 9 }}
        noOfSections={4}
        minValue={parseFloat((minVal - padding).toFixed(2))}
        maxValue={parseFloat((maxVal + padding).toFixed(2))}
        stepValue={parseFloat(((maxVal - minVal + 2 * padding) / 4).toFixed(3))}
        initialSpacing={8}
        endSpacing={8}
        pressEnabled
        showStripOnPress
        stripColor="#E5E7EB"
        stripWidth={1}
        showTextOnPress
        textShiftY={-8}
        textShiftX={-4}
        textColor={color}
        textFontSize={11}
      />

      {/* Legend */}
      <XStack gap={12} justify="center" flexWrap="wrap">
        {bands.map((band) => (
          <XStack key={band.label} items="center" gap={4}>
            <YStack
              width={10}
              height={10}
              rounded={2}
              style={{ backgroundColor: band.color }}
              borderWidth={1}
              borderColor="#E5E7EB"
            />
            <Text fontSize="$1" color="#6B7280">
              {t(`measurements.${band.label}`)}
            </Text>
          </XStack>
        ))}
      </XStack>
    </YStack>
  );
}


// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EvolutionScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const sex = (user as any)?.sex as "male" | "female" | null | undefined;

  const [selectedWeeks, setSelectedWeeks] = useState<WeeksParam>("all");
  const [selectedMetrics, setSelectedMetrics] = useState<Set<MetricKey>>(
    new Set(["weight", "bodyFatPercentage", "leanMassPercentage"])
  );

  const { data, isLoading, isError } = useEvolutionSummary(selectedWeeks, sex);

  function toggleMetric(key: MetricKey) {
    setSelectedMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size === 1) return prev;
        next.delete(key);
      } else {
        if (next.size >= MAX_SELECTED) {
          const [first] = next;
          next.delete(first);
        }
        next.add(key);
      }
      return next;
    });
  }

  const hasData = data && data.length >= 2;

  return (
    <YStack flex={1} style={{ backgroundColor: "#F9FAFB" }}>
      {/* Header */}
      <YStack
        style={{
          backgroundColor: "#059669",
          paddingTop: 60,
          paddingBottom: 20,
          paddingHorizontal: 20,
        }}
      >
        <XStack items="center" gap={12}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={24} color="white" />
          </Pressable>
          <Text fontSize="$6" fontWeight="bold" color="white">
            {t("evolution.title")}
          </Text>
        </XStack>
      </YStack>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Range selector */}
        <XStack gap={8} flexWrap="wrap">
          {WEEKS_OPTIONS.map((opt) => {
            const active = selectedWeeks === opt.value;
            return (
              <Pressable
                key={String(opt.value)}
                onPress={() => setSelectedWeeks(opt.value)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: active ? "#059669" : "white",
                  borderWidth: 1,
                  borderColor: active ? "#059669" : "#E5E7EB",
                }}
              >
                <Text
                  fontSize="$2"
                  fontWeight="600"
                  color={active ? "white" : "#374151"}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </XStack>

        {/* Metric chips */}
        <YStack gap={6}>
          <Text fontSize="$1" color="#6B7280">
            {t("evolution.selectHint", { max: MAX_SELECTED })}
          </Text>
          <XStack gap={8} flexWrap="wrap">
            {METRIC_KEYS.map((key) => {
              const active = selectedMetrics.has(key);
              return (
                <Pressable
                  key={key}
                  onPress={() => toggleMetric(key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: active ? `${METRIC_COLORS[key]}20` : "white",
                    borderWidth: 1,
                    borderColor: active ? METRIC_COLORS[key] : "#E5E7EB",
                  }}
                >
                  <YStack
                    width={8}
                    height={8}
                    rounded={4}
                    style={{
                      backgroundColor: active
                        ? METRIC_COLORS[key]
                        : "#D1D5DB",
                    }}
                  />
                  <Text
                    fontSize="$1"
                    fontWeight={active ? "700" : "400"}
                    style={{ color: active ? METRIC_COLORS[key] : "#6B7280" }}
                  >
                    {t(`evolution.metric_${key}`)}
                  </Text>
                </Pressable>
              );
            })}
          </XStack>
        </YStack>

        {/* Content */}
        {isLoading ? (
          <YStack height={200} justify="center" items="center">
            <ActivityIndicator color="#059669" />
          </YStack>
        ) : isError ? (
          <Card bg="white" rounded={16} p={20} borderWidth={1} borderColor="#FCA5A5">
            <Text color="#DC2626" text="center">
              {t("common.error")}
            </Text>
          </Card>
        ) : !hasData ? (
          <Card bg="white" rounded={16} p={20} borderWidth={1} borderColor="#E5E7EB">
            <Text color="#9CA3AF" text="center">
              {t("evolution.noData")}
            </Text>
          </Card>
        ) : (
          <YStack gap={16}>
            {METRIC_KEYS.filter((m) => selectedMetrics.has(m)).map((metric) => {
              const last = data[data.length - 1];
              const lastVal = last
                ? (last[metric as keyof ChartPoint] as number | null)
                : null;
              const unit = METRIC_UNIT[metric];

              return (
                <Card
                  key={metric}
                  bg="white"
                  rounded={16}
                  p={16}
                  borderWidth={1}
                  borderColor="#E5E7EB"
                >
                  <YStack gap={8}>
                    <XStack items="center" justify="space-between">
                      <XStack items="center" gap={6}>
                        <YStack
                          width={10}
                          height={10}
                          rounded={5}
                          style={{ backgroundColor: METRIC_COLORS[metric] }}
                        />
                        <Text fontSize="$2" fontWeight="600" color="#374151">
                          {t(`evolution.metric_${metric}`)}
                        </Text>
                      </XStack>
                      {lastVal != null && (
                        <Text fontSize="$3" fontWeight="700" color="#111827">
                          {metric === "waistHipRatio"
                            ? lastVal.toFixed(3)
                            : lastVal.toFixed(1)}
                          {unit ? (
                            <Text fontSize="$1" color="#9CA3AF"> {unit}</Text>
                          ) : null}
                        </Text>
                      )}
                    </XStack>

                    {metric === "waistHipRatio" ? (
                      <WhrChart data={data} sex={sex} />
                    ) : (
                      <MetricChart data={data} metric={metric} />
                    )}
                  </YStack>
                </Card>
              );
            })}
          </YStack>
        )}
      </ScrollView>
    </YStack>
  );
}
