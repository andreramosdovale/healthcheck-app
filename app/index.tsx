import { useEffect } from "react";
import { YStack, Spinner, Text } from "tamagui";
import { router } from "expo-router";
import { useAuthStore } from "../src/stores/auth.store";

export default function Index() {
  const { isAuthenticated, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/(app)/home");
      } else {
        router.replace("/(auth)/login");
      }
    }
  }, [isLoading, isAuthenticated]);

  return (
    <YStack f={1} jc="center" ai="center" bg="$background" gap="$4">
      <Text fontSize="$8" fontWeight="bold">
        HealthCheck
      </Text>
      <Spinner size="large" />
    </YStack>
  );
}
