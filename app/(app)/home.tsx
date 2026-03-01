import { YStack, Text, Button } from "tamagui";
import { router } from "expo-router";
import { useAuthStore } from "../../src/stores/auth.store";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  async function handleLogout() {
    await logout();
    router.replace("/(auth)/login");
  }

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      padding="$4"
      gap="$4"
      background="$background"
    >
      <Text fontSize="$6" fontWeight="bold">
        Welcome, {user?.name || "User"}!
      </Text>

      <Text color="$gray10">Plan: {user?.plan || "free"}</Text>

      <Button onPress={handleLogout} theme="red">
        Logout
      </Button>
    </YStack>
  );
}
