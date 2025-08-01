import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';

export default function WelcomeScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);
  
  const handleSignIn = () => {
    router.push('/(auth)/signin');
  };
  
  const handleSignUp = () => {
    router.push('/(auth)/signup');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1545370331-9c11c3acc1b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80' }}
          style={styles.logo}
          resizeMode="cover"
        />
        
        <Text style={styles.title}>Fish Finder</Text>
        <Text style={styles.subtitle}>Identify fish with AI and share your catches</Text>
        
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>• Identify fish species with AI</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>• Share your catches with friends</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>• Learn about different fish species</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>• Track your fishing history</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureText}>• Find nearby fishing spots</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]} 
          onPress={handleSignUp}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={handleSignIn}
        >
          <Text style={styles.secondaryButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
  },
  buttons: {
    padding: 20,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});