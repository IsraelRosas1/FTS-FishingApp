import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut, Bell, Lock, HelpCircle, Info, Moon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, isAuthenticated } = useAuthStore();
  
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = React.useState(false);
  const [locationEnabled, setLocationEnabled] = React.useState(true);
  
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Sign Out", 
          onPress: () => {
            signOut();
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };
  
  const handleAbout = () => {
    router.push('/about');
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={22} color={Colors.text} />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.card}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Moon size={22} color={Colors.text} />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.card}
          />
        </View>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <MapPin size={22} color={Colors.text} />
            <Text style={styles.settingText}>Location Services</Text>
          </View>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor={Colors.card}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingButton}>
          <View style={styles.settingInfo}>
            <Lock size={22} color={Colors.text} />
            <Text style={styles.settingText}>Privacy</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingButton}>
          <View style={styles.settingInfo}>
            <HelpCircle size={22} color={Colors.text} />
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingButton}
          onPress={handleAbout}
        >
          <View style={styles.settingInfo}>
            <Info size={22} color={Colors.text} />
            <Text style={styles.settingText}>About</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      {isAuthenticated && (
        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <LogOut size={22} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      )}
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

import { MapPin } from 'lucide-react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  signOutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});