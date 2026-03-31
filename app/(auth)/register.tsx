import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { YStack, XStack, Text, Input, Button, Spinner, Sheet } from "tamagui";
import { Link, router } from "expo-router";
import { Eye, EyeOff, Activity, Check, X } from "@tamagui/lucide-icons";
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
      .min(2, t("validation.nameMin"))
      .max(100, t("validation.nameMax")),
    email: z
      .string()
      .min(1, t("validation.required"))
      .email(t("validation.invalidEmail"))
      .max(256, t("validation.emailMax")),
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
        const yearDiff = today.getFullYear() - date.getFullYear();
        const notYetBirthday =
          today.getMonth() < date.getMonth() ||
          (today.getMonth() === date.getMonth() &&
            today.getDate() < date.getDate());
        const age = yearDiff - (notYetBirthday ? 1 : 0);
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
    termsAccepted: z
      .boolean()
      .refine((val) => val === true, t("validation.termsRequired")),
  });
};

type RegisterFormData = z.infer<ReturnType<typeof useRegisterSchema>>;

export default function Register() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [sheetPosition, setSheetPosition] = useState(0);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

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
      termsAccepted: false,
    },
  });

  const currentSex = watch("sex") ?? "male";
  const termsAccepted = watch("termsAccepted") ?? false;

  function parseBirthDate(dateStr: string): string {
    const [day, month, year] = dateStr.split("/");
    return `${year}-${month}-${day}`;
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isCloseToBottom) {
      setHasScrolledToEnd(true);
    }
  }

  function handleAcceptTerms() {
    setValue("termsAccepted", true, { shouldValidate: true });
    setTermsModalOpen(false);
    setHasScrolledToEnd(false);
  }

  function handleDeclineTerms() {
    setValue("termsAccepted", false, { shouldValidate: true });
    setTermsModalOpen(false);
    setHasScrolledToEnd(false);
  }

  function openTermsModal() {
    setHasScrolledToEnd(false);
    setTermsModalOpen(true);
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
    <>
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
                onPress={() =>
                  setValue("sex", "male", { shouldValidate: true })
                }
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
                onPress={() =>
                  setValue("sex", "female", { shouldValidate: true })
                }
              >
                <Text color={currentSex === "female" ? "white" : "#6B7280"}>
                  {t("register.female")}
                </Text>
              </Button>
            </XStack>

            {/* Terms Button */}
            <YStack style={{ gap: 2 }}>
              <Button
                size="$4"
                bg={termsAccepted ? "#ECFDF5" : "white"}
                borderColor={
                  errors.termsAccepted
                    ? "#DC2626"
                    : termsAccepted
                      ? "#059669"
                      : "#E5E7EB"
                }
                borderWidth={1}
                pressStyle={{ bg: "#F3F4F6" }}
                onPress={openTermsModal}
              >
                <XStack style={{ alignItems: "center", gap: 8 }}>
                  {termsAccepted ? <Check size={20} color="#059669" /> : null}
                  <Text color={termsAccepted ? "#059669" : "#6B7280"}>
                    {termsAccepted
                      ? t("register.termsAccepted")
                      : t("register.readTerms")}
                  </Text>
                </XStack>
              </Button>
              {errors.termsAccepted && (
                <Text color="#DC2626" fontSize="$2" style={{ marginLeft: 2 }}>
                  {errors.termsAccepted.message}
                </Text>
              )}
            </YStack>

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

      {/* Terms Modal */}
      <Sheet
        modal
        open={termsModalOpen}
        onOpenChange={setTermsModalOpen}
        snapPoints={[85]}
        dismissOnSnapToBottom
        dismissOnOverlayPress={false}
        position={sheetPosition}
        onPositionChange={setSheetPosition}
      >
        <Sheet.Overlay />
        <Sheet.Frame
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <Sheet.Handle />
          <YStack style={{ flex: 1, padding: 20 }}>
            <Text
              fontSize="$6"
              fontWeight="bold"
              color="#111827"
              style={{ textAlign: "center", marginBottom: 16 }}
            >
              {t("register.termsTitle")}
            </Text>

            <ScrollView
              style={{
                flex: 1,
                backgroundColor: "#F9FAFB",
                borderRadius: 10,
                padding: 16,
                marginBottom: 16,
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              <Text color="#374151" style={{ lineHeight: 24 }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
                {"\n\n"}
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
                {"\n\n"}
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
                quae ab illo inventore veritatis et quasi architecto beatae
                vitae dicta sunt explicabo.
                {"\n\n"}
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit
                aut fugit, sed quia consequuntur magni dolores eos qui ratione
                voluptatem sequi nesciunt.
                {"\n\n"}
                Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
                consectetur, adipisci velit, sed quia non numquam eius modi
                tempora incidunt ut labore et dolore magnam aliquam quaerat
                voluptatem.
                {"\n\n"}
                Ut enim ad minima veniam, quis nostrum exercitationem ullam
                corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
                consequatur? Quis autem vel eum iure reprehenderit qui in ea
                voluptate velit esse quam nihil molestiae consequatur.
                {"\n\n"}
                At vero eos et accusamus et iusto odio dignissimos ducimus qui
                blanditiis praesentium voluptatum deleniti atque corrupti quos
                dolores et quas molestias excepturi sint occaecati cupiditate
                non provident.
                {"\n\n"}
                Similique sunt in culpa qui officia deserunt mollitia animi, id
                est laborum et dolorum fuga. Et harum quidem rerum facilis est
                et expedita distinctio.
                {"\n\n"}
                Nam libero tempore, cum soluta nobis est eligendi optio cumque
                nihil impedit quo minus id quod maxime placeat facere possimus,
                omnis voluptas assumenda est, omnis dolor repellendus.
              </Text>
            </ScrollView>

            {!hasScrolledToEnd && (
              <Text
                color="#6B7280"
                fontSize="$2"
                style={{ textAlign: "center", marginBottom: 12 }}
              >
                {t("register.scrollToEnd")}
              </Text>
            )}

            <XStack style={{ gap: 12 }}>
              <Button
                flex={1}
                size="$4"
                bg="white"
                borderColor="#DC2626"
                borderWidth={1}
                pressStyle={{ bg: "#FEF2F2" }}
                onPress={handleDeclineTerms}
                disabled={!hasScrolledToEnd}
                opacity={hasScrolledToEnd ? 1 : 0.5}
              >
                <XStack style={{ alignItems: "center", gap: 6 }}>
                  <X size={18} color="#DC2626" />
                  <Text color="#DC2626">{t("register.decline")}</Text>
                </XStack>
              </Button>
              <Button
                flex={1}
                size="$4"
                bg="#059669"
                pressStyle={{ bg: "#047857" }}
                onPress={handleAcceptTerms}
                disabled={!hasScrolledToEnd}
                opacity={hasScrolledToEnd ? 1 : 0.5}
              >
                <XStack style={{ alignItems: "center", gap: 6 }}>
                  <Check size={18} color="white" />
                  <Text color="white">{t("register.confirm")}</Text>
                </XStack>
              </Button>
            </XStack>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
