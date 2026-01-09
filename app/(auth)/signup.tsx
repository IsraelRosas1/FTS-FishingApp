import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, isLoading, error, isAuthenticated, checkUsernameAvailability } = useAuthStore();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
  const [usernameTimeout, setUsernameTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (error) {
      Alert.alert('Sign Up Failed', error);
    }
  }, [error]);
  
  // Debounced username validation
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    
    if (usernameTimeout) {
      clearTimeout(usernameTimeout);
    }
    
    setUsernameStatus('checking');
    
    const timeout = setTimeout(async () => {
      const available = await checkUsernameAvailability(username);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 500);
    
    setUsernameTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [username]);
  
  // Debounced username validation
  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameStatus(null);
      return;
    }
    
    // Clear previous timeout
    if (usernameTimeout) {
      clearTimeout(usernameTimeout);
    }
    
    setUsernameStatus('checking');
    
    // Set new timeout for validation
    const timeout = setTimeout(async () => {
      const available = await checkUsernameAvailability(username);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 500);
    
    setUsernameTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [username]);
  
  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }
    
    if (username.length < 3) {
      Alert.alert('Invalid Username', 'Username must be at least 3 characters long');
      return;
    }
    
    if (usernameStatus === 'taken') {
      Alert.alert('Username Taken', 'This username is already taken. Please choose another one.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long');
      return;
    }
    
    try {
      await signUp(email, password, username);
    } catch (err) {
      console.error('Sign up error:', err);
    }
  };
  
  const handleSignIn = () => {
    router.push('/(auth)/signin');
  };
  
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the FTS-Fishing community</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, usernameStatus === 'taken' && styles.inputError]}
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              autoCapitalize="none"
            />
            {usernameStatus === 'checking' && (
              <ActivityIndicator size="small" color={Colors.primary} style={styles.inputIcon} />
            )}
            {usernameStatus === 'available' && (
              <Text style={styles.availableText}>✓ Available</Text>
            )}
            {usernameStatus === 'taken' && (
              <Text style={styles.takenText}>✗ Taken</Text>
            )}
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password (min 6 characters)"
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          style={styles.signUpButton} 
          onPress={handleSignUp}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.card} />
          ) : (
            <Text style={styles.signUpButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.termsText}>
          By signing up, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={handleSignIn}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  availableText: {
    position: 'absolute',
    right: 12,
    top: 14,
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  takenText: {
    position: 'absolute',
    right: 12,
    top: 14,
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  signUpButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  signUpButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: Colors.textLight,
    fontSize: 16,
    marginRight: 4,
  },
  signInText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});