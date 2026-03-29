import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { YStack, XStack, Text, Input, Button, Spinner } from "tamagui";
import { router } from "expo-router";
import { ArrowLeft, Calendar, Scale, Ruler, Info } from "@tamagui/lucide-icons";
import MaskInput from "react-native-mask-input";
import { useTranslation } from "react-i18next";
import { useCreateMeasurement } from "../../../src/hooks/useMeasurements";

export default function NewMeasurement() {
  const { t } = useTranslation();
  const createMutation = useCreateMeasurement();

  const today = new Date().toISOString().split("T")[0];
  const todayFormatted = new Date().toLocaleDateString("pt-BR");

  const [form, setForm] = useState({
    measurementDate: today,
    measurementDateDisplay: todayFormatted,
    weight: "",
    // Skinfolds
    triceps: "",
    subscapular: "",
    chest: "",
    midaxillary: "",
    suprailiac: "",
    abdominal: "",
    thigh: "",
    // Circumferences
    neck: "",
    waist: "",
    hip: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }

  function updateDate(masked: string) {
    updateForm("measurementDateDisplay", masked);

    // Parse DD/MM/YYYY to YYYY-MM-DD
    if (masked.length === 10) {
      const [day, month, year] = masked.split("/");
      if (day && month && year) {
        updateForm("measurementDate", `${year}-${month}-${day}`);
      }
    }
  }

  function setToday() {
    updateForm("measurementDate", today);
    updateForm("measurementDateDisplay", todayFormatted);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.weight) {
      newErrors.weight = t("validation.required");
    } else {
      const weight = parseFloat(form.weight);
      if (weight < 20 || weight > 500) {
        newErrors.weight = t("validation.weightRange");
      }
    }

    if (
      !form.measurementDateDisplay ||
      form.measurementDateDisplay.length !== 10
    ) {
      newErrors.measurementDate = t("validation.required");
    }

    // Check skinfolds: all or nothing
    const skinfolds = [
      form.triceps,
      form.subscapular,
      form.chest,
      form.midaxillary,
      form.suprailiac,
      form.abdominal,
      form.thigh,
    ];
    const filledSkinfolds = skinfolds.filter((s) => s !== "");
    if (filledSkinfolds.length > 0 && filledSkinfolds.length < 7) {
      newErrors.skinfolds = t("validation.allSkinfoldsRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const data: any = {
      measurementDate: form.measurementDate,
      weight: parseFloat(form.weight),
    };

    // Add skinfolds if all filled
    if (form.triceps) data.triceps = parseFloat(form.triceps);
    if (form.subscapular) data.subscapular = parseFloat(form.subscapular);
    if (form.chest) data.chest = parseFloat(form.chest);
    if (form.midaxillary) data.midaxillary = parseFloat(form.midaxillary);
    if (form.suprailiac) data.suprailiac = parseFloat(form.suprailiac);
    if (form.abdominal) data.abdominal = parseFloat(form.abdominal);
    if (form.thigh) data.thigh = parseFloat(form.thigh);

    // Add circumferences
    if (form.neck) data.neck = parseFloat(form.neck);
    if (form.waist) data.waist = parseFloat(form.waist);
    if (form.hip) data.hip = parseFloat(form.hip);

    try {
      await createMutation.mutateAsync(data);
      Alert.alert(t("common.success"), t("measurements.success"));
      router.back();
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("measurements.error"),
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
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
          <Button
            size="$3"
            backgroundColor="transparent"
            pressStyle={{ backgroundColor: "#F3F4F6" }}
            onPress={() => router.back()}
            circular
          >
            <ArrowLeft size={24} color="#111827" />
          </Button>
          <Text fontSize="$6" fontWeight="bold" color="#111827">
            {t("measurements.new")}
          </Text>
        </XStack>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Date & Weight Section */}
          <YStack
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            marginBottom={16}
            borderWidth={1}
            borderColor="#E5E7EB"
            gap={16}
          >
            <XStack alignItems="center" gap={8}>
              <Scale size={20} color="#059669" />
              <Text fontSize="$5" fontWeight="bold" color="#111827">
                {t("measurements.basicInfo")}
              </Text>
            </XStack>

            {/* Date */}
            <YStack gap={4}>
              <Text fontSize="$3" color="#6B7280">
                {t("measurements.date")}
              </Text>
              <XStack gap={8}>
                <YStack
                  flex={1}
                  borderWidth={1}
                  borderColor={errors.measurementDate ? "#DC2626" : "#E5E7EB"}
                  borderRadius={8}
                  backgroundColor="white"
                  height={48}
                  justifyContent="center"
                  paddingHorizontal={12}
                >
                  <MaskInput
                    value={form.measurementDateDisplay}
                    onChangeText={updateDate}
                    mask={[
                      /\d/,
                      /\d/,
                      "/",
                      /\d/,
                      /\d/,
                      "/",
                      /\d/,
                      /\d/,
                      /\d/,
                      /\d/,
                    ]}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    style={{ fontSize: 16, color: "#111827" }}
                  />
                </YStack>
                <Button
                  size="$4"
                  backgroundColor="#ECFDF5"
                  borderColor="#059669"
                  borderWidth={1}
                  pressStyle={{ backgroundColor: "#D1FAE5" }}
                  onPress={setToday}
                >
                  <XStack alignItems="center" gap={6}>
                    <Calendar size={18} color="#059669" />
                    <Text color="#059669">{t("measurements.today")}</Text>
                  </XStack>
                </Button>
              </XStack>
              {errors.measurementDate && (
                <Text color="#DC2626" fontSize="$2">
                  {errors.measurementDate}
                </Text>
              )}
            </YStack>

            {/* Weight */}
            <YStack gap={4}>
              <Text fontSize="$3" color="#6B7280">
                {t("measurements.weight")} (kg) *
              </Text>
              <Input
                value={form.weight}
                onChangeText={(v) => updateForm("weight", v)}
                keyboardType="decimal-pad"
                placeholder="75.5"
                size="$4"
                backgroundColor="white"
                borderColor={errors.weight ? "#DC2626" : "#E5E7EB"}
                placeholderTextColor="#9CA3AF"
              />
              {errors.weight && (
                <Text color="#DC2626" fontSize="$2">
                  {errors.weight}
                </Text>
              )}
            </YStack>
          </YStack>

          {/* Skinfolds Section */}
          <YStack
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            marginBottom={16}
            borderWidth={1}
            borderColor="#E5E7EB"
            gap={16}
          >
            <XStack alignItems="center" gap={8}>
              <Ruler size={20} color="#3B82F6" />
              <Text fontSize="$5" fontWeight="bold" color="#111827">
                {t("measurements.skinfolds")}
              </Text>
            </XStack>

            <XStack
              alignItems="flex-start"
              gap={8}
              backgroundColor="#EFF6FF"
              padding={12}
              borderRadius={8}
            >
              <Info size={16} color="#3B82F6" style={{ marginTop: 2 }} />
              <Text fontSize="$2" color="#1E40AF" flex={1}>
                {t("measurements.skinfoldsHint")}
              </Text>
            </XStack>

            {errors.skinfolds && (
              <Text color="#DC2626" fontSize="$2">
                {errors.skinfolds}
              </Text>
            )}

            <XStack gap={12}>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.triceps")}
                </Text>
                <Input
                  value={form.triceps}
                  onChangeText={(v) => updateForm("triceps", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.subscapular")}
                </Text>
                <Input
                  value={form.subscapular}
                  onChangeText={(v) => updateForm("subscapular", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
            </XStack>

            <XStack gap={12}>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.chest")}
                </Text>
                <Input
                  value={form.chest}
                  onChangeText={(v) => updateForm("chest", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.midaxillary")}
                </Text>
                <Input
                  value={form.midaxillary}
                  onChangeText={(v) => updateForm("midaxillary", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
            </XStack>

            <XStack gap={12}>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.suprailiac")}
                </Text>
                <Input
                  value={form.suprailiac}
                  onChangeText={(v) => updateForm("suprailiac", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.abdominal")}
                </Text>
                <Input
                  value={form.abdominal}
                  onChangeText={(v) => updateForm("abdominal", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
            </XStack>

            <XStack gap={12}>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.thighFold")}
                </Text>
                <Input
                  value={form.thigh}
                  onChangeText={(v) => updateForm("thigh", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
              <YStack flex={1} />
            </XStack>
          </YStack>

          {/* Circumferences Section */}
          <YStack
            backgroundColor="white"
            borderRadius={12}
            padding={16}
            marginBottom={16}
            borderWidth={1}
            borderColor="#E5E7EB"
            gap={16}
          >
            <XStack alignItems="center" gap={8}>
              <Ruler size={20} color="#8B5CF6" />
              <Text fontSize="$5" fontWeight="bold" color="#111827">
                {t("measurements.circumferences")}
              </Text>
            </XStack>

            <XStack
              alignItems="flex-start"
              gap={8}
              backgroundColor="#F5F3FF"
              padding={12}
              borderRadius={8}
            >
              <Info size={16} color="#7C3AED" style={{ marginTop: 2 }} />
              <Text fontSize="$2" color="#5B21B6" flex={1}>
                {t("measurements.circumferencesHint")}
              </Text>
            </XStack>

            <XStack gap={12}>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.neck")}
                </Text>
                <Input
                  value={form.neck}
                  onChangeText={(v) => updateForm("neck", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.waist")}
                </Text>
                <Input
                  value={form.waist}
                  onChangeText={(v) => updateForm("waist", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
            </XStack>

            <XStack gap={12}>
              <YStack flex={1} gap={4}>
                <Text fontSize="$2" color="#6B7280">
                  {t("measurements.hip")}
                </Text>
                <Input
                  value={form.hip}
                  onChangeText={(v) => updateForm("hip", v)}
                  keyboardType="decimal-pad"
                  size="$3"
                  backgroundColor="white"
                  borderColor="#E5E7EB"
                  placeholderTextColor="#9CA3AF"
                />
              </YStack>
              <YStack flex={1} />
            </XStack>
          </YStack>

          {/* Submit Button */}
          <Button
            size="$5"
            backgroundColor="#059669"
            pressStyle={{ backgroundColor: "#047857" }}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <XStack alignItems="center" gap={8}>
                <Spinner color="white" />
                <Text color="white">{t("measurements.saving")}</Text>
              </XStack>
            ) : (
              <Text color="white" fontWeight="bold">
                {t("measurements.save")}
              </Text>
            )}
          </Button>
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  );
}
