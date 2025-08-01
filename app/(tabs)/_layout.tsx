import React from "react";
import { Tabs } from "expo-router";
import { Home, Plus, User, Map } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
        },
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "FTS-Fishing",
          tabBarLabel: "Feed",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: "Identify Fish",
          tabBarLabel: "Identify",
          tabBarIcon: ({ color }) => <Plus size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="map"
        options={{
          title: "Fishing Map",
          tabBarLabel: "Map",
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}