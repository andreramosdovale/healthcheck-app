import { useState } from "react";
import { KeyboardAvoidingView, Platform, Alert } from "react-native";
import { ScrollView } from "react-native";
import { YStack, XStack, Text, Input, Button, Spinner } from "tamagui";
import { router } from "expo-router";
import { ChevronLeft, User, Ruler } from "@tamagui/lucide-icons";
import { useTranslation } from "react-i18next";
import { useProfile, useUpdateProfile } from "../../../src/hooks/useUser";

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const updateMutation = useUpdateProfile();

  const [name, setName] = useState(profile?.name ?? "");
  const [height, setHeight] = useState(
    profile?.height ? parseFloat(profile.height).toFixed(0) : ""
  );
  const [errors, setErrors] = useState<{ name?: string; height?: string }>({});

  function validate(): boolean {
    const next: typeof errors = {};

    if (!name.trim()) {
      next.name = t("validation.required");
    } else if (name.trim().length < 2) {
      next.name = t("validation.nameMin");
    } else if (name.trim().length > 100) {
      next.name = t("validation.nameMax");
    }

    if (height !== "") {
      const h = parseFloat(height);
      if (isNaN(h) || h < 50 || h > 300) {
        next.height = t("validation.heightRange");
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;

    const input: { name?: string; height?: number } = {};
    if (name.trim() !== profile?.name) input.name = name.trim();
    if (height !== "" && parseFloat(height) !== parseFloat(profile?.height ?? "0")) {
      input.height = parseFloat(height);
    }

    if (Object.keys(input).length === 0) {
      router.back();
      return;
    }

    try {
      await updateMutation.mutateAsync(input);
      router.back();
    } catch (error: any) {
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("profile.updateError")
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
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
              {t("profile.editTitle")}
            </Text>
          </XStack>

          <Button
            size="$3"
            bg="#059669"
            pressStyle={{ bg: "#047857" }}
            onPress={handleSave}
            disabled={updateMutation.isPending}
            rounded={8}
            px={16}
          >
            {updateMutation.isPending ? (
              <Spinner size="small" color="white" />
            ) : (
              <Text color="white" fontWeight="bold" fontSize="$3">
                {t("common.save")}
              </Text>
            )}
          </Button>
        </XStack>

        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Info box */}
          <YStack
            bg="#EFF6FF"
            rounded={12}
            p={14}
            borderWidth={1}
            borderColor="#BFDBFE"
          >
            <Text fontSize="$2" color="#1E40AF">
              {t("profile.editHint")}
            </Text>
          </YStack>

          {/* Name */}
          <YStack gap={6}>
            <XStack items="center" gap={8}>
              <User size={16} color="#059669" />
              <Text fontSize="$3" fontWeight="600" color="#374151">
                {t("profile.name")}
              </Text>
            </XStack>
            <Input
              value={name}
              onChangeText={(v) => {
                setName(v);
                if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
              }}
              placeholder={t("profile.namePlaceholder")}
              size="$4"
              bg="white"
              borderColor={errors.name ? "#DC2626" : "#E5E7EB"}
              placeholderTextColor={"#9CA3AF" as any}
            />
            {errors.name && (
              <Text color="#DC2626" fontSize="$2">{errors.name}</Text>
            )}
          </YStack>

          {/* Height */}
          <YStack gap={6}>
            <XStack items="center" gap={8}>
              <Ruler size={16} color="#059669" />
              <Text fontSize="$3" fontWeight="600" color="#374151">
                {t("profile.height")} (cm)
              </Text>
            </XStack>
            <Input
              value={height}
              onChangeText={(v) => {
                setHeight(v);
                if (errors.height) setErrors((e) => ({ ...e, height: undefined }));
              }}
              keyboardType="decimal-pad"
              placeholder="175"
              size="$4"
              bg="white"
              borderColor={errors.height ? "#DC2626" : "#E5E7EB"}
              placeholderTextColor={"#9CA3AF" as any}
            />
            {errors.height && (
              <Text color="#DC2626" fontSize="$2">{errors.height}</Text>
            )}
          </YStack>

          {/* Read-only fields notice */}
          <YStack
            bg="white"
            rounded={12}
            p={16}
            borderWidth={1}
            borderColor="#E5E7EB"
            gap={8}
          >
            <Text fontSize="$3" fontWeight="bold" color="#374151">
              {t("profile.readOnlyTitle")}
            </Text>
            <Text fontSize="$2" color="#6B7280">
              {t("profile.readOnlyHint")}
            </Text>
            {[
              { label: t("profile.email"), value: profile?.email },
              { label: "Nickname", value: `@${profile?.nickname}` },
              { label: t("profile.sex"), value: t(`profile.sex_${profile?.sex}`) },
              {
                label: t("profile.birthDate"),
                value: profile?.birthDate
                  ? profile.birthDate.split("-").reverse().join("/")
                  : "",
              },
            ].map(({ label, value }) => (
              <XStack key={label} justify="space-between" py={4}>
                <Text fontSize="$2" color="#9CA3AF">{label}</Text>
                <Text fontSize="$2" color="#6B7280" fontWeight="600">{value}</Text>
              </XStack>
            ))}
          </YStack>
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  );
}
