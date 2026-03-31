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
    shoulders: "",
    chestCirc: "",
    leftThigh: "",
    rightThigh: "",
    leftCalf: "",
    rightCalf: "",
    leftBicepRelaxed: "",
    rightBicepRelaxed: "",
    leftBicepFlexed: "",
    rightBicepFlexed: "",
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

    if (masked.length === 10) {
      const [day, month, year] = masked.split("/");
      if (day && month && year) {
        updateForm("measurementDate", `${year}-${month}-${day}`);
      }
    } else {
      updateForm("measurementDate", "");
    }
  }

  function setToday() {
    updateForm("measurementDate", today);
    updateForm("measurementDateDisplay", todayFormatted);
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    // Weight
    if (!form.weight) {
      newErrors.weight = t("validation.required");
    } else {
      const weight = parseFloat(form.weight);
      if (isNaN(weight) || weight < 20 || weight > 500) {
        newErrors.weight = t("validation.weightRange");
      }
    }

    // Date — check display length AND that it's a real calendar date
    if (!form.measurementDateDisplay || form.measurementDateDisplay.length !== 10) {
      newErrors.measurementDate = t("validation.required");
    } else if (!form.measurementDate) {
      newErrors.measurementDate = t("validation.invalidDate");
    } else {
      const parsed = new Date(form.measurementDate);
      if (
        isNaN(parsed.getTime()) ||
        parsed.toISOString().split("T")[0] !== form.measurementDate
      ) {
        newErrors.measurementDate = t("validation.invalidDate");
      }
    }

    // Skinfolds: all or nothing
    const skinfoldFields = [
      "triceps",
      "subscapular",
      "chest",
      "midaxillary",
      "suprailiac",
      "abdominal",
      "thigh",
    ] as const;
    const filledSkinfolds = skinfoldFields.filter((f) => form[f] !== "");
    if (filledSkinfolds.length > 0 && filledSkinfolds.length < 7) {
      newErrors.skinfolds = t("validation.allSkinfoldsRequired");
    }

    // Skinfold range: 1–100 mm
    for (const field of skinfoldFields) {
      if (form[field] !== "") {
        const val = parseFloat(form[field]);
        if (isNaN(val) || val < 1 || val > 100) {
          newErrors[field] = t("validation.skinfoldRange");
        }
      }
    }

    // Circumference range: 10–200 cm
    const circumferenceFields = [
      "neck",
      "waist",
      "hip",
      "shoulders",
      "chestCirc",
      "leftThigh",
      "rightThigh",
      "leftCalf",
      "rightCalf",
      "leftBicepRelaxed",
      "rightBicepRelaxed",
      "leftBicepFlexed",
      "rightBicepFlexed",
    ] as const;
    for (const field of circumferenceFields) {
      if (form[field] !== "") {
        const val = parseFloat(form[field]);
        if (isNaN(val) || val < 10 || val > 200) {
          newErrors[field] = t("validation.circumferenceRange");
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const data: Record<string, string | number> = {
      measurementDate: form.measurementDate,
      weight: parseFloat(form.weight),
    };

    // Skinfolds
    if (form.triceps) data.triceps = parseFloat(form.triceps);
    if (form.subscapular) data.subscapular = parseFloat(form.subscapular);
    if (form.chest) data.chest = parseFloat(form.chest);
    if (form.midaxillary) data.midaxillary = parseFloat(form.midaxillary);
    if (form.suprailiac) data.suprailiac = parseFloat(form.suprailiac);
    if (form.abdominal) data.abdominal = parseFloat(form.abdominal);
    if (form.thigh) data.thigh = parseFloat(form.thigh);

    // Circumferences
    if (form.neck) data.neck = parseFloat(form.neck);
    if (form.waist) data.waist = parseFloat(form.waist);
    if (form.hip) data.hip = parseFloat(form.hip);
    if (form.shoulders) data.shoulders = parseFloat(form.shoulders);
    if (form.chestCirc) data.chestCirc = parseFloat(form.chestCirc);
    if (form.leftThigh) data.leftThigh = parseFloat(form.leftThigh);
    if (form.rightThigh) data.rightThigh = parseFloat(form.rightThigh);
    if (form.leftCalf) data.leftCalf = parseFloat(form.leftCalf);
    if (form.rightCalf) data.rightCalf = parseFloat(form.rightCalf);
    if (form.leftBicepRelaxed) data.leftBicepRelaxed = parseFloat(form.leftBicepRelaxed);
    if (form.rightBicepRelaxed) data.rightBicepRelaxed = parseFloat(form.rightBicepRelaxed);
    if (form.leftBicepFlexed) data.leftBicepFlexed = parseFloat(form.leftBicepFlexed);
    if (form.rightBicepFlexed) data.rightBicepFlexed = parseFloat(form.rightBicepFlexed);

    try {
      const result = await createMutation.mutateAsync(data as any);
      const calc = (result as any)?.calculated;

      let message = t("measurements.success");
      if (calc?.bodyFatPercentage != null) {
        const method = calc.bodyFatMethod === "pollock"
          ? t("measurements.method_pollock")
          : t("measurements.method_navy");
        message += `\n\n${t("measurements.bodyFat")}: ${calc.bodyFatPercentage.toFixed(1)}%`;
        message += `\n${method}`;
        if (calc.leanMass != null) {
          message += `\n${t("measurements.leanMass")}: ${calc.leanMass.toFixed(1)} kg`;
        }
        if (calc.fatMass != null) {
          message += `\n${t("measurements.fatMass")}: ${calc.fatMass.toFixed(1)} kg`;
        }
      }

      Alert.alert(t("common.success"), message);
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
              <SkinfoldInput
                label={t("measurements.triceps")}
                field="triceps"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
              <SkinfoldInput
                label={t("measurements.subscapular")}
                field="subscapular"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
            </XStack>

            <XStack gap={12}>
              <SkinfoldInput
                label={t("measurements.chest")}
                field="chest"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
              <SkinfoldInput
                label={t("measurements.midaxillary")}
                field="midaxillary"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
            </XStack>

            <XStack gap={12}>
              <SkinfoldInput
                label={t("measurements.suprailiac")}
                field="suprailiac"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
              <SkinfoldInput
                label={t("measurements.abdominal")}
                field="abdominal"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
            </XStack>

            <XStack gap={12}>
              <SkinfoldInput
                label={t("measurements.thighFold")}
                field="thigh"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
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
              <CircInput
                label={t("measurements.neck")}
                field="neck"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
              <CircInput
                label={t("measurements.waist")}
                field="waist"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
            </XStack>

            <XStack gap={12}>
              <CircInput
                label={t("measurements.hip")}
                field="hip"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
              <CircInput
                label={t("measurements.shoulders")}
                field="shoulders"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
            </XStack>

            <XStack gap={12}>
              <CircInput
                label={t("measurements.chestCirc")}
                field="chestCirc"
                form={form}
                errors={errors}
                updateForm={updateForm}
              />
              <YStack flex={1} />
            </XStack>

            {/* Bilateral: Thigh */}
            <BilateralInputs
              label={t("measurements.circ_thigh")}
              leftField="leftThigh"
              rightField="rightThigh"
              leftLabel={t("measurements.left")}
              rightLabel={t("measurements.right")}
              form={form}
              errors={errors}
              updateForm={updateForm}
            />

            {/* Bilateral: Calf */}
            <BilateralInputs
              label={t("measurements.circ_calf")}
              leftField="leftCalf"
              rightField="rightCalf"
              leftLabel={t("measurements.left")}
              rightLabel={t("measurements.right")}
              form={form}
              errors={errors}
              updateForm={updateForm}
            />

            {/* Bilateral: Bicep relaxed */}
            <BilateralInputs
              label={t("measurements.circ_bicepRelaxed")}
              leftField="leftBicepRelaxed"
              rightField="rightBicepRelaxed"
              leftLabel={t("measurements.left")}
              rightLabel={t("measurements.right")}
              form={form}
              errors={errors}
              updateForm={updateForm}
            />

            {/* Bilateral: Bicep flexed */}
            <BilateralInputs
              label={t("measurements.circ_bicepFlexed")}
              leftField="leftBicepFlexed"
              rightField="rightBicepFlexed"
              leftLabel={t("measurements.left")}
              rightLabel={t("measurements.right")}
              form={form}
              errors={errors}
              updateForm={updateForm}
            />
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

// ─── Sub-components ──────────────────────────────────────────────────────────

type FormState = Record<string, string>;

function SkinfoldInput({
  label,
  field,
  form,
  errors,
  updateForm,
}: {
  label: string;
  field: string;
  form: FormState;
  errors: Record<string, string>;
  updateForm: (f: string, v: string) => void;
}) {
  return (
    <YStack flex={1} gap={4}>
      <Text fontSize="$2" color="#6B7280">{label}</Text>
      <Input
        value={form[field]}
        onChangeText={(v) => updateForm(field, v)}
        keyboardType="decimal-pad"
        size="$3"
        backgroundColor="white"
        borderColor={errors[field] ? "#DC2626" : "#E5E7EB"}
        placeholderTextColor="#9CA3AF"
      />
      {errors[field] && (
        <Text color="#DC2626" fontSize="$1">{errors[field]}</Text>
      )}
    </YStack>
  );
}

function CircInput({
  label,
  field,
  form,
  errors,
  updateForm,
}: {
  label: string;
  field: string;
  form: FormState;
  errors: Record<string, string>;
  updateForm: (f: string, v: string) => void;
}) {
  return (
    <YStack flex={1} gap={4}>
      <Text fontSize="$2" color="#6B7280">{label}</Text>
      <Input
        value={form[field]}
        onChangeText={(v) => updateForm(field, v)}
        keyboardType="decimal-pad"
        size="$3"
        backgroundColor="white"
        borderColor={errors[field] ? "#DC2626" : "#E5E7EB"}
        placeholderTextColor="#9CA3AF"
      />
      {errors[field] && (
        <Text color="#DC2626" fontSize="$1">{errors[field]}</Text>
      )}
    </YStack>
  );
}

function BilateralInputs({
  label,
  leftField,
  rightField,
  leftLabel,
  rightLabel,
  form,
  errors,
  updateForm,
}: {
  label: string;
  leftField: string;
  rightField: string;
  leftLabel: string;
  rightLabel: string;
  form: FormState;
  errors: Record<string, string>;
  updateForm: (f: string, v: string) => void;
}) {
  return (
    <YStack gap={6}>
      <Text fontSize="$2" color="#6B7280">{label}</Text>
      <XStack gap={12}>
        <YStack flex={1} gap={4}>
          <Text fontSize="$1" color="#9CA3AF">{leftLabel}</Text>
          <Input
            value={form[leftField]}
            onChangeText={(v) => updateForm(leftField, v)}
            keyboardType="decimal-pad"
            size="$3"
            backgroundColor="white"
            borderColor={errors[leftField] ? "#DC2626" : "#E5E7EB"}
            placeholderTextColor="#9CA3AF"
          />
          {errors[leftField] && (
            <Text color="#DC2626" fontSize="$1">{errors[leftField]}</Text>
          )}
        </YStack>
        <YStack flex={1} gap={4}>
          <Text fontSize="$1" color="#9CA3AF">{rightLabel}</Text>
          <Input
            value={form[rightField]}
            onChangeText={(v) => updateForm(rightField, v)}
            keyboardType="decimal-pad"
            size="$3"
            backgroundColor="white"
            borderColor={errors[rightField] ? "#DC2626" : "#E5E7EB"}
            placeholderTextColor="#9CA3AF"
          />
          {errors[rightField] && (
            <Text color="#DC2626" fontSize="$1">{errors[rightField]}</Text>
          )}
        </YStack>
      </XStack>
    </YStack>
  );
}
