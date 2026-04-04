import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { YStack, XStack, Text, Input, Button, Spinner } from "tamagui";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Calendar, Scale, Ruler, Info } from "@tamagui/lucide-icons";
import MaskInput from "react-native-mask-input";
import { useTranslation } from "react-i18next";
import {
  useMeasurement,
  useUpdateMeasurement,
} from "../../../src/hooks/useMeasurements";

const CIRC_RANGES: Record<string, { min: number; max: number }> = {
  neck:               { min: 25,  max: 70  },
  waist:              { min: 50,  max: 200 },
  hip:                { min: 60,  max: 200 },
  shoulders:          { min: 60,  max: 200 },
  chestCirc:          { min: 50,  max: 200 },
  leftThigh:          { min: 25,  max: 100 },
  rightThigh:         { min: 25,  max: 100 },
  leftCalf:           { min: 20,  max: 80  },
  rightCalf:          { min: 20,  max: 80  },
  leftBicepRelaxed:   { min: 15,  max: 70  },
  rightBicepRelaxed:  { min: 15,  max: 70  },
  leftBicepFlexed:    { min: 15,  max: 70  },
  rightBicepFlexed:   { min: 15,  max: 70  },
};

export default function EditMeasurement() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: measurement, isLoading } = useMeasurement(id);

  if (isLoading || !measurement) {
    return (
      <YStack flex={1} justify="center" items="center" style={{ backgroundColor: "#F9FAFB" }}>
        <Spinner size="large" color="#059669" />
      </YStack>
    );
  }

  return <EditForm measurement={measurement} id={id!} />;
}

function EditForm({
  measurement,
  id,
}: {
  measurement: ReturnType<typeof useMeasurement>["data"] & {};
  id: string;
}) {
  const { t } = useTranslation();
  const updateMutation = useUpdateMeasurement(id);

  // Convert YYYY-MM-DD → DD/MM/YYYY for display
  const isoDate = measurement.measurementDate;
  const [year, month, day] = isoDate.split("-");
  const initialDisplay = `${day}/${month}/${year}`;

  const n = (v: number | null | undefined) => (v != null ? String(v) : "");

  const [form, setForm] = useState({
    measurementDate: isoDate,
    measurementDateDisplay: initialDisplay,
    weight: String(measurement.weight),
    // Skinfolds
    triceps: n(measurement.skinfolds?.triceps),
    subscapular: n(measurement.skinfolds?.subscapular),
    chest: n(measurement.skinfolds?.chest),
    midaxillary: n(measurement.skinfolds?.midaxillary),
    suprailiac: n(measurement.skinfolds?.suprailiac),
    abdominal: n(measurement.skinfolds?.abdominal),
    thigh: n(measurement.skinfolds?.thigh),
    // Circumferences
    neck: n(measurement.circumferences?.neck),
    waist: n(measurement.circumferences?.waist),
    hip: n(measurement.circumferences?.hip),
    shoulders: n(measurement.circumferences?.shoulders),
    chestCirc: n(measurement.circumferences?.chestCirc),
    leftThigh: n(measurement.circumferences?.leftThigh),
    rightThigh: n(measurement.circumferences?.rightThigh),
    leftCalf: n(measurement.circumferences?.leftCalf),
    rightCalf: n(measurement.circumferences?.rightCalf),
    leftBicepRelaxed: n(measurement.circumferences?.leftBicepRelaxed),
    rightBicepRelaxed: n(measurement.circumferences?.rightBicepRelaxed),
    leftBicepFlexed: n(measurement.circumferences?.leftBicepFlexed),
    rightBicepFlexed: n(measurement.circumferences?.rightBicepFlexed),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function updateDate(masked: string) {
    updateField("measurementDateDisplay", masked);
    if (masked.length === 10) {
      const [d, m, y] = masked.split("/");
      if (d && m && y) updateField("measurementDate", `${y}-${m}-${d}`);
    } else {
      updateField("measurementDate", "");
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!form.weight) {
      newErrors.weight = t("validation.required");
    } else {
      const w = parseFloat(form.weight);
      if (isNaN(w) || w < 20 || w > 500) newErrors.weight = t("validation.weightRange");
    }

    if (!form.measurementDateDisplay || form.measurementDateDisplay.length !== 10) {
      newErrors.measurementDate = t("validation.required");
    } else if (!form.measurementDate) {
      newErrors.measurementDate = t("validation.invalidDate");
    } else {
      const parsed = new Date(form.measurementDate);
      if (isNaN(parsed.getTime()) || parsed.toISOString().split("T")[0] !== form.measurementDate) {
        newErrors.measurementDate = t("validation.invalidDate");
      }
    }

    const skinfoldFields = ["triceps", "subscapular", "chest", "midaxillary", "suprailiac", "abdominal", "thigh"] as const;
    const filled = skinfoldFields.filter((f) => form[f] !== "");
    if (filled.length > 0 && filled.length < 7) newErrors.skinfolds = t("validation.allSkinfoldsRequired");

    for (const field of skinfoldFields) {
      if (form[field] !== "") {
        const val = parseFloat(form[field]);
        if (isNaN(val) || val < 2 || val > 100) newErrors[field] = t("validation.skinfoldRange");
      }
    }

    for (const [field, { min, max }] of Object.entries(CIRC_RANGES)) {
      if (form[field] !== "") {
        const val = parseFloat(form[field]);
        if (isNaN(val) || val < min || val > max)
          newErrors[field] = t("validation.circumferenceRange", { min, max });
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;

    const p = (v: string) => v !== "" ? parseFloat(v) : null;

    const data: Record<string, any> = {
      measurementDate: form.measurementDate,
      weight: parseFloat(form.weight),
      triceps: p(form.triceps),
      subscapular: p(form.subscapular),
      chest: p(form.chest),
      midaxillary: p(form.midaxillary),
      suprailiac: p(form.suprailiac),
      abdominal: p(form.abdominal),
      thigh: p(form.thigh),
      neck: p(form.neck),
      waist: p(form.waist),
      hip: p(form.hip),
      shoulders: p(form.shoulders),
      chestCirc: p(form.chestCirc),
      leftThigh: p(form.leftThigh),
      rightThigh: p(form.rightThigh),
      leftCalf: p(form.leftCalf),
      rightCalf: p(form.rightCalf),
      leftBicepRelaxed: p(form.leftBicepRelaxed),
      rightBicepRelaxed: p(form.rightBicepRelaxed),
      leftBicepFlexed: p(form.leftBicepFlexed),
      rightBicepFlexed: p(form.rightBicepFlexed),
    };

    try {
      await updateMutation.mutateAsync(data);
      Alert.alert(t("common.success"), t("measurements.editSuccess"), [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const errData = error.response?.data;
      if (errData?.errorCode === "MEASUREMENT_IMPLAUSIBLE") {
        const details = (errData.details as string[])?.join("\n\n") ?? errData.message;
        Alert.alert(t("validation.implausible"), details);
      } else {
        Alert.alert(t("common.error"), errData?.message || t("measurements.error"));
      }
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <YStack flex={1} style={{ backgroundColor: "#F9FAFB" }}>
        {/* Header */}
        <XStack
          items="center"
          p={16}
          pt={60}
          style={{ backgroundColor: "white" }}
          borderBottomWidth={1}
          borderBottomColor="#E5E7EB"
          gap={12}
        >
          <Button size="$3" chromeless circular onPress={() => router.back()}>
            <ArrowLeft size={24} color="#111827" />
          </Button>
          <Text fontSize="$6" fontWeight="bold" color="#111827">
            {t("measurements.edit")}
          </Text>
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {/* Date & Weight */}
          <YStack style={{ backgroundColor: "white" }} rounded={12} p={16} mb={16} borderWidth={1} borderColor="#E5E7EB" gap={16}>
            <XStack items="center" gap={8}>
              <Scale size={20} color="#059669" />
              <Text fontSize="$5" fontWeight="bold" color="#111827">{t("measurements.basicInfo")}</Text>
            </XStack>

            <YStack gap={4}>
              <Text fontSize="$3" color="#6B7280">{t("measurements.date")}</Text>
              <XStack gap={8}>
                <YStack
                  flex={1}
                  borderWidth={1}
                  borderColor={errors.measurementDate ? "#DC2626" : "#E5E7EB"}
                  rounded={8}
                  style={{ backgroundColor: "white" }}
                  height={48}
                  justify="center"
                  px={12}
                >
                  <MaskInput
                    value={form.measurementDateDisplay}
                    onChangeText={updateDate}
                    mask={[/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/]}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    style={{ fontSize: 16, color: "#111827" }}
                  />
                </YStack>
                <Button
                  size="$4"
                  style={{ backgroundColor: "#ECFDF5" }}
                  borderColor="#059669"
                  borderWidth={1}
                  pressStyle={{ bg: "#D1FAE5" }}
                  onPress={() => {
                    const today = new Date().toISOString().split("T")[0];
                    updateField("measurementDate", today);
                    updateField("measurementDateDisplay", new Date().toLocaleDateString("pt-BR"));
                  }}
                >
                  <XStack items="center" gap={6}>
                    <Calendar size={18} color="#059669" />
                    <Text color="#059669">{t("measurements.today")}</Text>
                  </XStack>
                </Button>
              </XStack>
              {errors.measurementDate && <Text color="#DC2626" fontSize="$2">{errors.measurementDate}</Text>}
            </YStack>

            <YStack gap={4}>
              <Text fontSize="$3" color="#6B7280">{t("measurements.weight")} (kg) *</Text>
              <Input
                value={form.weight}
                onChangeText={(v) => updateField("weight", v)}
                keyboardType="decimal-pad"
                size="$4"
                style={{ backgroundColor: "white", paddingTop: 0, paddingBottom: 0 }}
                borderColor={errors.weight ? "#DC2626" : "#E5E7EB"}
                placeholderTextColor={"#9CA3AF" as any}
              />
              {errors.weight && <Text color="#DC2626" fontSize="$2">{errors.weight}</Text>}
            </YStack>
          </YStack>

          {/* Skinfolds */}
          <YStack style={{ backgroundColor: "white" }} rounded={12} p={16} mb={16} borderWidth={1} borderColor="#E5E7EB" gap={16}>
            <XStack items="center" gap={8}>
              <Ruler size={20} color="#3B82F6" />
              <Text fontSize="$5" fontWeight="bold" color="#111827">{t("measurements.skinfolds")}</Text>
            </XStack>

            <XStack items="flex-start" gap={8} style={{ backgroundColor: "#EFF6FF" }} p={12} rounded={8}>
              <Info size={16} color="#3B82F6" style={{ marginTop: 2 }} />
              <Text fontSize="$2" color="#1E40AF" flex={1}>{t("measurements.skinfoldsHint")}</Text>
            </XStack>

            {errors.skinfolds && <Text color="#DC2626" fontSize="$2">{errors.skinfolds}</Text>}

            <XStack gap={12}>
              <FieldInput label={t("measurements.triceps")} field="triceps" form={form} errors={errors} update={updateField} />
              <FieldInput label={t("measurements.subscapular")} field="subscapular" form={form} errors={errors} update={updateField} />
            </XStack>
            <XStack gap={12}>
              <FieldInput label={t("measurements.chest")} field="chest" form={form} errors={errors} update={updateField} />
              <FieldInput label={t("measurements.midaxillary")} field="midaxillary" form={form} errors={errors} update={updateField} />
            </XStack>
            <XStack gap={12}>
              <FieldInput label={t("measurements.suprailiac")} field="suprailiac" form={form} errors={errors} update={updateField} />
              <FieldInput label={t("measurements.abdominal")} field="abdominal" form={form} errors={errors} update={updateField} />
            </XStack>
            <XStack gap={12}>
              <FieldInput label={t("measurements.thighFold")} field="thigh" form={form} errors={errors} update={updateField} />
              <YStack flex={1} />
            </XStack>
          </YStack>

          {/* Circumferences */}
          <YStack style={{ backgroundColor: "white" }} rounded={12} p={16} mb={16} borderWidth={1} borderColor="#E5E7EB" gap={16}>
            <XStack items="center" gap={8}>
              <Ruler size={20} color="#8B5CF6" />
              <Text fontSize="$5" fontWeight="bold" color="#111827">{t("measurements.circumferences")}</Text>
            </XStack>

            <XStack items="flex-start" gap={8} style={{ backgroundColor: "#F5F3FF" }} p={12} rounded={8}>
              <Info size={16} color="#7C3AED" style={{ marginTop: 2 }} />
              <Text fontSize="$2" color="#5B21B6" flex={1}>{t("measurements.circumferencesHint")}</Text>
            </XStack>

            <XStack gap={12}>
              <FieldInput label={t("measurements.neck")} field="neck" form={form} errors={errors} update={updateField} />
              <FieldInput label={t("measurements.waist")} field="waist" form={form} errors={errors} update={updateField} />
            </XStack>
            <XStack gap={12}>
              <FieldInput label={t("measurements.hip")} field="hip" form={form} errors={errors} update={updateField} />
              <FieldInput label={t("measurements.shoulders")} field="shoulders" form={form} errors={errors} update={updateField} />
            </XStack>
            <XStack gap={12}>
              <FieldInput label={t("measurements.chestCirc")} field="chestCirc" form={form} errors={errors} update={updateField} />
              <YStack flex={1} />
            </XStack>

            <BilateralFields label={t("measurements.circ_thigh")} leftField="leftThigh" rightField="rightThigh" leftLabel={t("measurements.left")} rightLabel={t("measurements.right")} form={form} errors={errors} update={updateField} />
            <BilateralFields label={t("measurements.circ_calf")} leftField="leftCalf" rightField="rightCalf" leftLabel={t("measurements.left")} rightLabel={t("measurements.right")} form={form} errors={errors} update={updateField} />
            <BilateralFields label={t("measurements.circ_bicepRelaxed")} leftField="leftBicepRelaxed" rightField="rightBicepRelaxed" leftLabel={t("measurements.left")} rightLabel={t("measurements.right")} form={form} errors={errors} update={updateField} />
            <BilateralFields label={t("measurements.circ_bicepFlexed")} leftField="leftBicepFlexed" rightField="rightBicepFlexed" leftLabel={t("measurements.left")} rightLabel={t("measurements.right")} form={form} errors={errors} update={updateField} />
          </YStack>

          {/* Submit */}
          <Button
            size="$5"
            style={{ backgroundColor: "#059669" }}
            pressStyle={{ bg: "#047857" }}
            onPress={handleSubmit}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <XStack items="center" gap={8}>
                <Spinner color="white" />
                <Text color="white">{t("measurements.saving")}</Text>
              </XStack>
            ) : (
              <Text color="white" fontWeight="bold">{t("measurements.save")}</Text>
            )}
          </Button>
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

type FormState = Record<string, string>;

function FieldInput({
  label, field, form, errors, update,
}: {
  label: string; field: string; form: FormState; errors: Record<string, string>; update: (f: string, v: string) => void;
}) {
  return (
    <YStack flex={1} gap={4}>
      <Text fontSize="$2" color="#6B7280">{label}</Text>
      <Input
        value={form[field]}
        onChangeText={(v) => update(field, v)}
        keyboardType="decimal-pad"
        size="$3"
        style={{ backgroundColor: "white", paddingTop: 0, paddingBottom: 0 }}
        borderColor={errors[field] ? "#DC2626" : "#E5E7EB"}
        placeholderTextColor={"#9CA3AF" as any}
      />
      {errors[field] && <Text color="#DC2626" fontSize="$1">{errors[field]}</Text>}
    </YStack>
  );
}

function BilateralFields({
  label, leftField, rightField, leftLabel, rightLabel, form, errors, update,
}: {
  label: string; leftField: string; rightField: string; leftLabel: string; rightLabel: string;
  form: FormState; errors: Record<string, string>; update: (f: string, v: string) => void;
}) {
  return (
    <YStack gap={6}>
      <Text fontSize="$2" color="#6B7280">{label}</Text>
      <XStack gap={12}>
        <YStack flex={1} gap={4}>
          <Text fontSize="$1" color="#9CA3AF">{leftLabel}</Text>
          <Input value={form[leftField]} onChangeText={(v) => update(leftField, v)} keyboardType="decimal-pad" size="$3" style={{ backgroundColor: "white", paddingTop: 0, paddingBottom: 0 }} borderColor={errors[leftField] ? "#DC2626" : "#E5E7EB"} placeholderTextColor={"#9CA3AF" as any} />
          {errors[leftField] && <Text color="#DC2626" fontSize="$1">{errors[leftField]}</Text>}
        </YStack>
        <YStack flex={1} gap={4}>
          <Text fontSize="$1" color="#9CA3AF">{rightLabel}</Text>
          <Input value={form[rightField]} onChangeText={(v) => update(rightField, v)} keyboardType="decimal-pad" size="$3" style={{ backgroundColor: "white", paddingTop: 0, paddingBottom: 0 }} borderColor={errors[rightField] ? "#DC2626" : "#E5E7EB"} placeholderTextColor={"#9CA3AF" as any} />
          {errors[rightField] && <Text color="#DC2626" fontSize="$1">{errors[rightField]}</Text>}
        </YStack>
      </XStack>
    </YStack>
  );
}
