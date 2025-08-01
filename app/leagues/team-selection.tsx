import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Users, Users2, Heart } from 'lucide-react-native';
import Colors from '@/constants/colors';

type TeamType = 'solo' | 'duo' | 'quad' | 'family';

export default function TeamSelectionScreen() {
  const router = useRouter();
  const [selectedTeamType, setSelectedTeamType] = useState<TeamType | null>(null);

  const teamTypes = [
    {
      id: 'solo' as TeamType,
      title: 'Solo Team',
      description: 'Compete individually',
      icon: User,
      members: '1 Member'
    },
    {
      id: 'duo' as TeamType,
      title: '2-Person Team',
      description: 'Team up with a partner',
      icon: Users2,
      members: '2 Members'
    },
    {
      id: 'quad' as TeamType,
      title: '4-Person Team',
      description: 'Form a squad of four',
      icon: Users,
      members: '4 Members'
    },
    {
      id: 'family' as TeamType,
      title: 'Family Team',
      description: 'Fish with your family',
      icon: Heart,
      members: '2-6 Members'
    }
  ];

  const handleTeamSelection = (teamType: TeamType) => {
    setSelectedTeamType(teamType);
  };

  const handleContinue = () => {
    if (!selectedTeamType) {
      Alert.alert('Team Selection Required', 'Please select a team type to continue');
      return;
    }

    Alert.alert(
      'Registration Complete!',
      `You have successfully registered for the Amateur League as a ${teamTypes.find(t => t.id === selectedTeamType)?.title}. Good luck!`,
      [
        {
          text: 'Back to Feed',
          onPress: () => router.push('/(tabs)')
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Choose Your Team Type</Text>
      <Text style={styles.subtitle}>Select how you want to compete in the league</Text>

      <View style={styles.teamTypesContainer}>
        {teamTypes.map((teamType) => {
          const IconComponent = teamType.icon;
          const isSelected = selectedTeamType === teamType.id;
          
          return (
            <TouchableOpacity
              key={teamType.id}
              style={[
                styles.teamTypeCard,
                isSelected && styles.selectedTeamTypeCard
              ]}
              onPress={() => handleTeamSelection(teamType.id)}
            >
              <View style={[
                styles.teamTypeIcon,
                isSelected && styles.selectedTeamTypeIcon
              ]}>
                <IconComponent 
                  size={32} 
                  color={isSelected ? Colors.card : Colors.primary} 
                />
              </View>
              
              <Text style={[
                styles.teamTypeTitle,
                isSelected && styles.selectedTeamTypeTitle
              ]}>
                {teamType.title}
              </Text>
              
              <Text style={[
                styles.teamTypeMembers,
                isSelected && styles.selectedTeamTypeMembers
              ]}>
                {teamType.members}
              </Text>
              
              <Text style={[
                styles.teamTypeDescription,
                isSelected && styles.selectedTeamTypeDescription
              ]}>
                {teamType.description}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity 
        style={[
          styles.continueButton,
          !selectedTeamType && styles.disabledButton
        ]} 
        onPress={handleContinue}
        disabled={!selectedTeamType}
      >
        <Text style={styles.continueButtonText}>Complete Registration</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 32,
  },
  teamTypesContainer: {
    marginBottom: 32,
  },
  teamTypeCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTeamTypeCard: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  teamTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedTeamTypeIcon: {
    backgroundColor: Colors.secondary,
  },
  teamTypeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  selectedTeamTypeTitle: {
    color: Colors.card,
  },
  teamTypeMembers: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 8,
  },
  selectedTeamTypeMembers: {
    color: Colors.card,
  },
  teamTypeDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  selectedTeamTypeDescription: {
    color: Colors.card,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  continueButtonText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '600',
  },
});