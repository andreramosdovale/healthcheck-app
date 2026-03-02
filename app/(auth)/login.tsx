import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { YStack, XStack, Text, Input, Button, Spinner } from "tamagui";
import { Link, router } from "expo-router";
import { Eye, EyeOff, Activity } from "@tamagui/lucide-icons";
import { useAuthStore } from "../../src/stores/auth.store";

export default function Login() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const authLogin = useAuthStore((state) => state.login);

  async function handleLogin() {
    if (!login || !password) {
      setError("Fill in all fields");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await authLogin(login, password);
      router.replace("/(app)/home");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <YStack
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 18,
          gap: 18,
          backgroundColor: "#F9FAFB",
        }}
      >
        <YStack style={{ alignItems: "center", gap: 7, marginBottom: 18 }}>
          <Activity size={48} color="#059669" />
          <Text fontSize="$8" fontWeight="bold" color="#111827">
            HealthCheck
          </Text>
          <Text fontSize="$4" color="#6B7280">
            Track your body composition
          </Text>
        </YStack>

        {error && (
          <YStack
            style={{
              backgroundColor: "#FEF2F2",
              padding: 13,
              borderRadius: 5,
            }}
          >
            <Text color="#DC2626" style={{ textAlign: "center" }}>
              {error}
            </Text>
          </YStack>
        )}

        <Input
          placeholder="Email or nickname"
          value={login}
          onChangeText={setLogin}
          autoCapitalize="none"
          keyboardType="email-address"
          size="$4"
          bg="white"
          borderColor="#E5E7EB"
          placeholderTextColor={"#9CA3AF" as any}
        />

        <XStack style={{ alignItems: "center" }}>
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            size="$4"
            flex={1}
            bg="white"
            borderColor="#E5E7EB"
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

        <Button
          onPress={handleLogin}
          disabled={isLoading}
          size="$4"
          bg="#059669"
          pressStyle={{ bg: "#047857" }}
        >
          {isLoading ? (
            <Spinner color="white" />
          ) : (
            <Text color="white">Login</Text>
          )}
        </Button>

        <XStack style={{ justifyContent: "center", gap: 7 }}>
          <Text color="#6B7280">Don't have an account?</Text>
          <Link href="/(auth)/register">
            <Text color="#059669" fontWeight="bold">
              Register
            </Text>
          </Link>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  );
}
