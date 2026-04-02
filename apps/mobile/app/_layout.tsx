import { useEffect, useRef } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider, ClerkLoaded, useAuth } from "@clerk/clerk-expo";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import {
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from "@lib/notifications";
import { tokenCache } from "@lib/auth";
import { Config } from "@constants/config";
import "../global.css";

SplashScreen.preventAutoHideAsync();

/**
 * Auth guard — redirects unauthenticated users to /auth/login
 * and authenticated users away from auth screens.
 */
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === "auth";

    if (!isSignedIn && !inAuthGroup) {
      router.replace("/auth/login" as Parameters<typeof router.replace>[0]);
    } else if (isSignedIn && inAuthGroup) {
      router.replace("/(tabs)" as Parameters<typeof router.replace>[0]);
    }
  }, [isSignedIn, isLoaded, segments, router]);

  return <>{children}</>;
}

function RootNavigation() {
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    SplashScreen.hideAsync();

    registerForPushNotifications().then((token) => {
      if (token) {
        // TODO: send token to backend for push delivery
        console.log("Push token:", token);
      }
    });

    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification.request.identifier);
      }
    );

    responseListener.current = addNotificationResponseListener((response) => {
      console.log(
        "Notification tapped:",
        response.notification.request.identifier
      );
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <AuthGuard>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/forgot-password"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="match/[id]"
          options={{
            headerShown: true,
            title: "",
            headerBackTitle: "Natrag",
            headerTintColor: "#2563EB",
          }}
        />
        <Stack.Screen
          name="subscription"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings/notifications"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="faq"
          options={{ headerShown: false }}
        />
      </Stack>
    </AuthGuard>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={Config.clerkPublishableKey}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
        <GestureHandlerRootView className="flex-1">
          <StatusBar style="dark" />
          <RootNavigation />
        </GestureHandlerRootView>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
