import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy, Award, Crown } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function LeagueRegisterScreen() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/leagues/team-selection');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Register for Amateur League</Text>
      
      <View style={styles.rulesContainer}>
        <View style={styles.ruleItem}>
          <View style={styles.ruleHeader}>
            <Trophy size={24} color={Colors.accent} />
            <Text style={styles.ruleTitle}>Amateur Angler League</Text>
          </View>
          <Text style={styles.ruleDescription}>
            Finish in the top 100 in your state to advance
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <View style={styles.ruleHeader}>
            <Award size={24} color={Colors.primary} />
            <Text style={styles.ruleTitle}>Semi Pro Angler League</Text>
          </View>
          <Text style={styles.ruleDescription}>
            Finish in the top 100 of the AME division to advance
          </Text>
        </View>

        <View style={styles.ruleItem}>
          <View style={styles.ruleHeader}>
            <Crown size={24} color={Colors.secondary} />
            <Text style={styles.ruleTitle}>Professional Angler United League</Text>
          </View>
          <Text style={styles.ruleDescription}>
            Finish in the top 100 of the semi-pro division to advance
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
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
    marginBottom: 32,
  },
  rulesContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  ruleItem: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ruleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginLeft: 12,
  },
  ruleDescription: {
    fontSize: 16,
    color: Colors.textLight,
    lineHeight: 24,
    marginLeft: 36,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '600',
  },
});