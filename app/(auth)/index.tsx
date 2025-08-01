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
          source={{ uri: 'https://img1.wsimg.com/isteam/ip/1be5c267-be0b-4756-8f8e-82fbb9471481/blob-b92c89d.png/:/rs=w:622,h:350,cg:true,m/cr=w:622,h:350/qt=q:95' }}
          style={styles.logo}
          resizeMode="cover"
        />
        
        <Text style={styles.title}>FTS-Fishing</Text>
        <Text style={styles.subtitle}>Join our community of From-The-Shore anglers!</Text>

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
    width: 220,
    height: 140,
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