import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { YStack, XStack, Text, Input, Button, Spinner } from "tamagui";
import { Link, router } from "expo-router";
import { Eye, EyeOff, Activity } from "@tamagui/lucide-icons";
import MaskInput from "react-native-mask-input";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "../../src/stores/auth.store";

const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  nickname: z
    .string()
    .min(1, "Nickname is required")
    .min(3, "Nickname must be at least 3 characters")
    .max(30, "Nickname must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscore"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      "Must contain: uppercase, lowercase, number and special character",
    ),
  birthDate: z
    .string()
    .min(1, "Birth date is required")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use format DD/MM/YYYY")
    .refine((val) => {
      const [day, month, year] = val.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }, "Invalid date")
    .refine((val) => {
      const [day, month, year] = val.split("/").map(Number);
      const date = new Date(year, month - 1, day);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      return age >= 10 && age <= 120;
    }, "Age must be between 10 and 120 years"),
  height: z
    .string()
    .min(1, "Height is required")
    .refine((val) => {
      const height = parseInt(val);
      return height >= 50 && height <= 300;
    }, "Height must be between 50 and 300 cm"),
  sex: z.enum(["male", "female"]),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const register = useAuthStore((state) => state.register);

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
      await register({
        ...data,
        birthDate: parseBirthDate(data.birthDate),
        height: parseFloat(data.height),
        termsAccepted: true,
      });
      router.replace("/(app)/home");
    } catch (err: any) {
      setApiError(err.response?.data?.message || "Registration failed");
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
          flex={1}
          justifyContent="center"
          padding="$4"
          gap="$3"
          backgroundColor="#F9FAFB"
        >
          <YStack alignItems="center" gap="$2" marginBottom="$2">
            <Activity size={40} color="#059669" />
            <Text fontSize="$7" fontWeight="bold" color="#111827">
              Create Account
            </Text>
            <Text fontSize="$3" color="#6B7280">
              Start tracking your progress
            </Text>
          </YStack>

          {apiError && (
            <YStack backgroundColor="#FEF2F2" padding="$3" borderRadius="$2">
              <Text color="#DC2626" textAlign="center">
                {apiError}
              </Text>
            </YStack>
          )}

          <YStack gap="$1">
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Name"
                  value={value}
                  onChangeText={onChange}
                  size="$4"
                  backgroundColor="white"
                  borderColor={errors.name ? "#DC2626" : "#E5E7EB"}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.name && (
              <Text color="#DC2626" fontSize="$2" marginLeft="$1">
                {errors.name.message}
              </Text>
            )}
          </YStack>

          <YStack gap="$1">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Email"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  size="$4"
                  backgroundColor="white"
                  borderColor={errors.email ? "#DC2626" : "#E5E7EB"}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.email && (
              <Text color="#DC2626" fontSize="$2" marginLeft="$1">
                {errors.email.message}
              </Text>
            )}
          </YStack>

          <YStack gap="$1">
            <Controller
              control={control}
              name="nickname"
              render={({ field: { onChange, value } }) => (
                <Input
                  placeholder="Nickname"
                  value={value}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  size="$4"
                  backgroundColor="white"
                  borderColor={errors.nickname ? "#DC2626" : "#E5E7EB"}
                  placeholderTextColor="#9CA3AF"
                />
              )}
            />
            {errors.nickname && (
              <Text color="#DC2626" fontSize="$2" marginLeft="$1">
                {errors.nickname.message}
              </Text>
            )}
          </YStack>

          <YStack gap="$1">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <XStack alignItems="center">
                  <Input
                    placeholder="Password"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry={!showPassword}
                    size="$4"
                    flex={1}
                    backgroundColor="white"
                    borderColor={errors.password ? "#DC2626" : "#E5E7EB"}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Button
                    position="absolute"
                    right={0}
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
              <Text color="#DC2626" fontSize="$2" marginLeft="$1">
                {errors.password.message}
              </Text>
            )}
          </YStack>

          <XStack gap="$3">
            <YStack flex={1} gap="$1">
              <Controller
                control={control}
                name="birthDate"
                render={({ field: { onChange, value } }) => (
                  <YStack
                    borderWidth={1}
                    borderColor={errors.birthDate ? "#DC2626" : "#E5E7EB"}
                    borderRadius="$4"
                    backgroundColor="white"
                    height={50}
                    justifyContent="center"
                    paddingHorizontal="$3"
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
                      placeholderTextColor="#9CA3AF"
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
                <Text color="#DC2626" fontSize="$2" marginLeft="$1">
                  {errors.birthDate.message}
                </Text>
              )}
            </YStack>

            <YStack flex={1} gap="$1">
              <Controller
                control={control}
                name="height"
                render={({ field: { onChange, value } }) => (
                  <YStack
                    borderWidth={1}
                    borderColor={errors.height ? "#DC2626" : "#E5E7EB"}
                    borderRadius="$4"
                    backgroundColor="white"
                    height={50}
                    justifyContent="center"
                    paddingHorizontal="$3"
                  >
                    <MaskInput
                      value={value}
                      onChangeText={onChange}
                      mask={[/\d/, /\d/, /\d/]}
                      placeholder="Height (cm)"
                      placeholderTextColor="#9CA3AF"
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
                <Text color="#DC2626" fontSize="$2" marginLeft="$1">
                  {errors.height.message}
                </Text>
              )}
            </YStack>
          </XStack>

          <XStack gap="$2">
            <Button
              flex={1}
              size="$4"
              backgroundColor={currentSex === "male" ? "#059669" : "white"}
              borderColor="#E5E7EB"
              borderWidth={1}
              pressStyle={{
                backgroundColor: currentSex === "male" ? "#047857" : "#F3F4F6",
              }}
              onPress={() => setValue("sex", "male")}
            >
              <Text color={currentSex === "male" ? "white" : "#6B7280"}>
                Male
              </Text>
            </Button>
            <Button
              flex={1}
              size="$4"
              backgroundColor={currentSex === "female" ? "#059669" : "white"}
              borderColor="#E5E7EB"
              borderWidth={1}
              pressStyle={{
                backgroundColor:
                  currentSex === "female" ? "#047857" : "#F3F4F6",
              }}
              onPress={() => setValue("sex", "female")}
            >
              <Text color={currentSex === "female" ? "white" : "#6B7280"}>
                Female
              </Text>
            </Button>
          </XStack>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            size="$4"
            backgroundColor="#059669"
            pressStyle={{ backgroundColor: "#047857" }}
            marginTop="$2"
          >
            {isLoading ? (
              <Spinner color="white" />
            ) : (
              <Text color="white">Register</Text>
            )}
          </Button>

          <XStack justifyContent="center" gap="$2">
            <Text color="#6B7280">Already have an account?</Text>
            <Link href="/(auth)/login">
              <Text color="#059669" fontWeight="bold">
                Login
              </Text>
            </Link>
          </XStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
