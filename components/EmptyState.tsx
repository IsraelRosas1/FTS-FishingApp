import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface EmptyStateProps {
  title?: string;
  message?: string;
  buttonText?: string;
  onPress?: () => void;
}

export default function EmptyState({
  title = "No catches yet",
  message = "Start by taking a photo of a fish to identify it",
  buttonText = "Take a Photo",
  onPress,
}: EmptyStateProps) {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/camera');
    }
  };
  
  return (
    <View style={styles.container}>
      <Camera size={80} color={Colors.primary} strokeWidth={1.5} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});