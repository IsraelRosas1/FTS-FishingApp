import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, MapPin, User, Mail, Phone } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function HostTournamentScreen() {
  const router = useRouter();
  
  const [tournamentName, setTournamentName] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  const handleSubmit = () => {
    if (!tournamentName || !hostName || !hostEmail || !phoneNumber || !location || !startDate || !startTime || !endDate || !endTime) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    // Here you would typically send the data to your backend
    console.log('Tournament registration:', {
      tournamentName,
      hostName,
      hostEmail,
      phoneNumber,
      location,
      startDate,
      startTime,
      endDate,
      endTime
    });

    Alert.alert(
      'Tournament Registered!',
      'Your tournament has been submitted for review. You will receive a confirmation email shortly.',
      [
        {
          text: 'Continue to League Registration',
          onPress: () => router.push('/leagues/register')
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Host a Tournament</Text>
      <Text style={styles.subtitle}>Fill in the details for your fishing tournament</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tournament Name</Text>
          <TextInput
            style={styles.input}
            value={tournamentName}
            onChangeText={setTournamentName}
            placeholder="Enter tournament name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Host Name</Text>
          <View style={styles.inputWithIcon}>
            <User size={20} color={Colors.textLight} />
            <TextInput
              style={styles.inputText}
              value={hostName}
              onChangeText={setHostName}
              placeholder="Your full name"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Host Email</Text>
          <View style={styles.inputWithIcon}>
            <Mail size={20} color={Colors.textLight} />
            <TextInput
              style={styles.inputText}
              value={hostEmail}
              onChangeText={setHostEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWithIcon}>
            <Phone size={20} color={Colors.textLight} />
            <TextInput
              style={styles.inputText}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWithIcon}>
            <MapPin size={20} color={Colors.textLight} />
            <TextInput
              style={styles.inputText}
              value={location}
              onChangeText={setLocation}
              placeholder="Tournament location"
            />
          </View>
        </View>

        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeSection}>
            <Text style={styles.label}>Start Date & Time</Text>
            <View style={styles.dateTimeRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="MM/DD/YYYY"
              />
              <TextInput
                style={[styles.input, styles.timeInput]}
                value={startTime}
                onChangeText={setStartTime}
                placeholder="HH:MM AM/PM"
              />
            </View>
          </View>

          <View style={styles.dateTimeSection}>
            <Text style={styles.label}>End Date & Time</Text>
            <View style={styles.dateTimeRow}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="MM/DD/YYYY"
              />
              <TextInput
                style={[styles.input, styles.timeInput]}
                value={endTime}
                onChangeText={setEndTime}
                placeholder="HH:MM AM/PM"
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Calendar size={20} color={Colors.card} />
          <Text style={styles.submitButtonText}>Register Tournament</Text>
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  dateTimeSection: {
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 2,
  },
  timeInput: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  submitButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
});