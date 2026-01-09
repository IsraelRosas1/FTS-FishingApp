import React from "react";
import { View, StyleSheet } from "react-native";
import { Tabs } from "expo-router";
import { Home, Plus, User, Map, Cloud } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function TabLayout() {
  return (
    <View style={styles.container}>
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
          headerShown: false,
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
          name="map"
          options={{
            title: "Fishing Map",
            tabBarLabel: "Map",
            tabBarIcon: ({ color }) => <Map size={24} color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="history"
          options={{
            title: "Identify Fish",
            tabBarLabel: "Add",
            tabBarIcon: ({ color }) => <Plus size={24} color={color} />,
          }}
        />
              
        <Tabs.Screen
          name="weather"
          options={{
            title: "Weather Conditions",
            tabBarLabel: "Weather",
            tabBarIcon: ({ color }) => <Cloud size={24} color={color} />,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40, // Adjust this value to create more spacing
    backgroundColor: Colors.background,
  },
});