import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import Colors from "@/constants/colors";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="camera" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
          }} 
        />
        <Stack.Screen 
          name="catch/[id]" 
          options={{ 
            title: "Catch Details",
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="post/[id]" 
          options={{ 
            title: "Post",
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="user/[id]" 
          options={{ 
            title: "Profile",
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="edit-profile" 
          options={{ 
            title: "Edit Profile",
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: "Settings",
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="leagues/host-tournament" 
          options={{ 
            title: "Host Tournament",
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="leagues/register" 
          options={{ 
            title: "League Registration",
            presentation: 'card',
          }} 
        />
        <Stack.Screen 
          name="leagues/team-selection" 
          options={{ 
            title: "Team Selection",
            presentation: 'card',
          }} 
        />
      </Stack>
    </>
  );
}