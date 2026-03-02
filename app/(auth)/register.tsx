import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { YStack, XStack, Text, Input, Button, Spinner } from "tamagui";
import { Link, router } from "expo-router";
import { Eye, EyeOff, Activity } from "@tamagui/lucide-icons";
import MaskInput from "react-native-mask-input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../src/stores/auth.store";

const useRegisterSchema = () => {
  const { t } = useTranslation();

  return z.object({
    name: z
      .string()
      .min(1, t("validation.required"))
      .min(2, t("validation.nameMin")),
    email: z
      .string()
      .min(1, t("validation.required"))
      .email(t("validation.invalidEmail")),
    nickname: z
      .string()
      .min(1, t("validation.required"))
      .min(3, t("validation.nicknameMin"))
      .max(30, t("validation.nicknameMax"))
      .regex(/^[a-zA-Z0-9_]+$/, t("validation.nicknameFormat")),
    password: z
      .string()
      .min(1, t("validation.required"))
      .min(8, t("validation.passwordMin"))
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
        t("validation.passwordFormat"),
      ),
    birthDate: z
      .string()
      .min(1, t("validation.required"))
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, t("validation.birthDateFormat"))
      .refine((val) => {
        const [day, month, year] = val.split("/").map(Number);
        const date = new Date(year, month - 1, day);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      }, t("validation.invalidDate"))
      .refine((val) => {
        const [day, month, year] = val.split("/").map(Number);
        const date = new Date(year, month - 1, day);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        return age >= 10 && age <= 120;
      }, t("validation.ageRange")),
    height: z
      .string()
      .min(1, t("validation.required"))
      .refine((val) => {
        const height = parseInt(val);
        return height >= 50 && height <= 300;
      }, t("validation.heightRange")),
    sex: z.enum(["male", "female"]),
  });
};

type RegisterFormData = z.infer<ReturnType<typeof useRegisterSchema>>;

export default function Register() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const registerUser = useAuthStore((state) => state.register);
  const registerSchema = useRegisterSchema();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      nickname: "",
      password: "",
      birthDate: "",
      height: "",
      sex: "male",
    },
  });

  const currentSex = watch("sex");

  function parseBirthDate(dateStr: string): string {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }

  async function onSubmit(data: RegisterFormData) {
    setApiError("");
    setIsLoading(true);

    try {
      await registerUser({
        ...data,
        birthDate: parseBirthDate(data.birthDate),
        height: parseFloat(data.height),
        termsAccepted: true,
      });
      router.replace("/(app)/home");
    } catch (err: any) {
      setApiError(
        err.response?.data?.message || t("validation.registerFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <YStack
          style={{
            flex: 1,
            justifyContent: "center",
            padding: 18,
            gap: 13,
            backgroundColor: "#F9FAFB",
          }}
        >
          <YStack style={{ alignItems: "center", gap: 7, marginBottom: 7 }}>
            <Activity size={40} color="#059669" />
            <Text fontSize="$7" fontWeight="bold" color="#111827">
              {t("auth.registerTitle")}
            </Text>
            <Text fontSize="$3" color="#6B7280">
              {t("auth.registerSubtitle")}
            </Text>
          </YStack>

          {apiError && (
            <YStack
              style={{
                backgroundColor: "#FEF2F2",
                padding: 13,
                borderRadius: 5,
              }}
            >
              <Text color="#DC2626" style={{ textAlign: "center" }}>
                {apiError}
              </Text>
            </YStack>
          )}

          <YStack style={{ gap: 2 }}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t("register.name")}
                  value={value}
                  onChangeText={onChange}
                  size="$4"
                  bg="white"
                  borderColor={errors.name ? "#DC2626" : "#E5E7EB"}
                  placeholderTextColor={"#9CA3AF" as any}
                />
              )}
            />
            {errors.name && (
              <Text color="#DC2626" fontSize="$2" style={{ marginLeft: 2 }}>
                {errors.name.message}
              </Text>
            )}
          </YStack>

          <YStack style={{ gap: 2 }}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t("auth.email")}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  size="$4"
                  bg="white"
                  borderColor={errors.email ? "#DC2626" : "#E5E7EB"}
                  placeholderTextColor={"#9CA3AF" as any}
                />
              )}
            />
            {errors.email && (
              <Text color="#DC2626" fontSize="$2" style={{ marginLeft: 2 }}>
                {errors.email.message}
              </Text>
            )}
          </YStack>

          <YStack style={{ gap: 2 }}>
            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder={t("auth.nickname")}
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  size="$4"
                  bg="white"
                  borderColor={errors.nickname ? "#DC2626" : "#E5E7EB"}
                  placeholderTextColor={"#9CA3AF" as any}
                />
              )}
            />
            {errors.nickname && (
              <Text color="#DC2626" fontSize="$2" style={{ marginLeft: 2 }}>
                {errors.nickname.message}
              </Text>
            )}
          </YStack>

          <YStack style={{ gap: 2 }}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <XStack style={{ alignItems: "center" }}>
                  <Input
                    placeholder={t("auth.password")}
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    size="$4"
                    flex={1}
                    bg="white"
                    borderColor={errors.password ? "#DC2626" : "#E5E7EB"}
                    placeholderTextColor={"#9CA3AF" as any}
                  />
                  <Button
                    style={{ position: "absolute", right: 0 }}
                    size="$3"
                    chromeless
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#6B7280" />
                    ) : (
                      <Eye size={20} color="#6B7280" />
                    )}
                  </Button>
                </XStack>
              )}
            />
            {errors.password && (
              <Text color="#DC2626" fontSize="$2" style={{ marginLeft: 2 }}>
                {errors.password.message}
              </Text>
            )}
          </YStack>

          <XStack style={{ gap: 13 }}>
            <YStack style={{ flex: 1, gap: 2 }}>
              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, value } }) => (
                  <YStack
                    style={{
                      borderWidth: 1,
                      borderColor: errors.birthDate ? "#DC2626" : "#E5E7EB",
                      borderRadius: 9,
                      backgroundColor: "white",
                      height: 50,
                      justifyContent: "center",
                      paddingHorizontal: 13,
                    }}
                  >
                    <MaskInput
                      value={value}
                      onChangeText={onChange}
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
                      placeholderTextColor={"#9CA3AF" as any}
                      keyboardType="numeric"
                      style={{
                        fontSize: 16,
                        color: "#111827",
                      }}
                    />
                  </YStack>
                )}
              />
              {errors.birthDate && (
                <Text color="#DC2626" fontSize="$2" style={{ marginLeft: 2 }}>
                  {errors.birthDate.message}
                </Text>
              )}
            </YStack>

            <YStack style={{ flex: 1, gap: 2 }}>
              <Controller
                control={control}
                name="height"
                render={({ field: { onChange, value } }) => (
                  <YStack
                    style={{
                      borderWidth: 1,
                      borderColor: errors.height ? "#DC2626" : "#E5E7EB",
                      borderRadius: 9,
                      backgroundColor: "white",
                      height: 50,
                      justifyContent: "center",
                      paddingHorizontal: 13,
                    }}
                  >
                    <MaskInput
                      value={value}
                      onChangeText={onChange}
                      mask={[/\d/, /\d/, /\d/]}
                      placeholder={t("register.height")}
                      placeholderTextColor={"#9CA3AF" as any}
                      keyboardType="numeric"
                      style={{
                        fontSize: 16,
                        color: "#111827",
                      }}
                    />
                  </YStack>
                )}
              />
              {errors.height && (
                <Text color="#DC2626" fontSize="$2" style={{ marginLeft: 2 }}>
                  {errors.height.message}
                </Text>
              )}
            </YStack>
          </XStack>

          <XStack style={{ gap: 7 }}>
            <Button
              flex={1}
              size="$4"
              bg={currentSex === "male" ? "#059669" : "white"}
              borderColor="#E5E7EB"
              borderWidth={1}
              pressStyle={{
                bg: currentSex === "male" ? "#047857" : "#F3F4F6",
              }}
              onPress={() => setValue("sex", "male")}
            >
              <Text color={currentSex === "male" ? "white" : "#6B7280"}>
                {t("register.male")}
              </Text>
            </Button>
            <Button
              flex={1}
              size="$4"
              bg={currentSex === "female" ? "#059669" : "white"}
              borderColor="#E5E7EB"
              borderWidth={1}
              pressStyle={{
                bg: currentSex === "female" ? "#047857" : "#F3F4F6",
              }}
              onPress={() => setValue("sex", "female")}
            >
              <Text color={currentSex === "female" ? "white" : "#6B7280"}>
                {t("register.female")}
              </Text>
            </Button>
          </XStack>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            size="$4"
            bg="#059669"
            pressStyle={{ bg: "#047857" }}
            mt="$2"
          >
            {isLoading ? (
              <Spinner color="white" />
            ) : (
              <Text color="white">{t("auth.register")}</Text>
            )}
          </Button>

          <XStack style={{ justifyContent: "center", gap: 7 }}>
            <Text color="#6B7280">{t("auth.hasAccount")}</Text>
            <Link href="/(auth)/login">
              <Text color="#059669" fontWeight="bold">
                {t("auth.login")}
              </Text>
            </Link>
          </XStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
