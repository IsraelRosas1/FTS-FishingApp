import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/authStore';

export default function AnglerQuestionnaireScreen() {
  const router = useRouter();
  const { teamTitle } = useLocalSearchParams<{ teamTitle?: string }>();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const existingQuestionnaire = user?.anglerQuestionnaire;

  const [anglerState, setAnglerState] = useState(existingQuestionnaire?.state ?? '');
  const [bodyOfWater, setBodyOfWater] = useState(existingQuestionnaire?.bodyOfWater ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(existingQuestionnaire?.dateOfBirth ?? '');
  const [region, setRegion] = useState(existingQuestionnaire?.region ?? '');
  const [contactEmail, setContactEmail] = useState(
    existingQuestionnaire?.email ?? user?.email ?? ''
  );
  const [phone, setPhone] = useState(existingQuestionnaire?.phone ?? '');

  const handleSubmit = async () => {
    if (!anglerState || !bodyOfWater || !dateOfBirth || !region || !contactEmail) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to complete registration', [
        {
          text: 'Sign In',
          onPress: () => router.push('/(auth)/signin')
        }
      ]);
      return;
    }

    try {
      await updateProfile({
        anglerQuestionnaireCompleted: true,
        anglerQuestionnaire: {
          state: anglerState,
          bodyOfWater,
          dateOfBirth,
          region,
          email: contactEmail,
          phone: phone || undefined,
        }
      });

      const teamLabel = teamTitle ? ` as a ${teamTitle}` : '';
      Alert.alert(
        'Registration Complete!',
        `You have successfully registered for the Amateur League${teamLabel}. Good luck!`,
        [
          {
            text: 'Back to Feed',
            onPress: () => router.push('/(tabs)')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Update Failed', 'Please try again in a moment');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Angler Questionnaire</Text>
      <Text style={styles.subtitle}>Help us personalize your league experience</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            value={anglerState}
            onChangeText={setAnglerState}
            placeholder="State"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Body of Water</Text>
          <TextInput
            style={styles.input}
            value={bodyOfWater}
            onChangeText={setBodyOfWater}
            placeholder="Lake, river, dam, etc"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="MM/DD/YYYY"
            keyboardType="numbers-and-punctuation"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Region (County)</Text>
          <TextInput
            style={styles.input}
            value={region}
            onChangeText={setRegion}
            placeholder="County"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={contactEmail}
            onChangeText={setContactEmail}
            placeholder="your.email@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone (Optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 123-4567"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Questionnaire</Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '600',
  },
});
