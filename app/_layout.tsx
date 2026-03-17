import "../tamagui.generated.css";
import "../src/i18n";

import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, router } from "expo-router";
import { Provider } from "components/Provider";
import { QueryProvider } from "src/providers/query.provider";
import { authEvents } from "src/lib/authEvents";
import { useAuthStore } from "src/stores/auth.store";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return (
    <Provider>
      <QueryProvider>
        <RootLayoutNav />
      </QueryProvider>
    </Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    return authEvents.onSessionExpired(async () => {
      await clearAuth();
      router.replace("/(auth)/login");
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ThemeProvider>
  );
}
