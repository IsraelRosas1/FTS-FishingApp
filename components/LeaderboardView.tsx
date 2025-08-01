import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy, Users, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function LeaderboardView() {
  const router = useRouter();
  
  // Mock competitive data
  const competitiveData = [
    {
      id: '1',
      rank: 1,
      username: 'FishMaster2024',
      score: 2450,
      fishCount: 127,
      biggestCatch: 'Northern Pike - 8.5 lbs',
      streak: 15
    },
    {
      id: '2',
      rank: 2,
      username: 'AngleAce',
      score: 2380,
      fishCount: 119,
      biggestCatch: 'Largemouth Bass - 6.2 lbs',
      streak: 12
    },
    {
      id: '3',
      rank: 3,
      username: 'CatchKing',
      score: 2290,
      fishCount: 105,
      biggestCatch: 'Steelhead - 7.8 lbs',
      streak: 8
    },
    {
      id: '4',
      rank: 4,
      username: 'You',
      score: 1850,
      fishCount: 78,
      biggestCatch: 'Brown Trout - 4.3 lbs',
      streak: 5
    }
  ];

  const handleJoinLeagues = () => {
    router.push('/leagues/register');
  };

  const handleHostTournament = () => {
    router.push('/leagues/host-tournament');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.competitiveHeader}>
        <Trophy size={24} color={Colors.accent} />
        <Text style={styles.competitiveTitle}>Monthly Leaderboard</Text>
        <Text style={styles.competitiveSubtitle}>Compete with other anglers in your area</Text>
      </View>

      <FlatList
        data={competitiveData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.leaderboardCard,
            item.username === 'You' && styles.currentUserCard
          ]}>
            <View style={styles.rankContainer}>
              <View style={[
                styles.rankBadge,
                item.rank === 1 && styles.goldBadge,
                item.rank === 2 && styles.silverBadge,
                item.rank === 3 && styles.bronzeBadge
              ]}>
                <Text style={[
                  styles.rankText,
                  item.rank <= 3 && styles.medalRankText
                ]}>#{item.rank}</Text>
              </View>
            </View>
            
            <View style={styles.userInfo}>
              <Text style={[
                styles.username,
                item.username === 'You' && styles.currentUsername
              ]}>{item.username}</Text>
              <Text style={styles.biggestCatch}>{item.biggestCatch}</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.score}</Text>
                <Text style={styles.statLabel}>Score</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.fishCount}</Text>
                <Text style={styles.statLabel}>Fish</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{item.streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
            </View>
          </View>
        )}
        scrollEnabled={false}
      />

      <View style={styles.leaguesSection}>
        <Text style={styles.leaguesHeader}>Leagues FTS Crew</Text>
        
        <View style={styles.leagueOption}>
          <View style={styles.leagueOptionContent}>
            <Users size={20} color={Colors.primary} />
            <Text style={styles.leagueOptionText}>Interested in joining leagues</Text>
          </View>
          <TouchableOpacity 
            style={styles.leagueButton}
            onPress={handleJoinLeagues}
          >
            <Text style={styles.leagueButtonText}>Join</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.leagueOption}>
          <View style={styles.leagueOptionContent}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.leagueOptionText}>Looking to host a tournament</Text>
          </View>
          <TouchableOpacity 
            style={styles.leagueButton}
            onPress={handleHostTournament}
          >
            <Text style={styles.leagueButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  competitiveHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  competitiveTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  competitiveSubtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  leaderboardCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  currentUserCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  rankContainer: {
    marginRight: 16,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldBadge: {
    backgroundColor: '#FFD700',
  },
  silverBadge: {
    backgroundColor: '#C0C0C0',
  },
  bronzeBadge: {
    backgroundColor: '#CD7F32',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  medalRankText: {
    color: Colors.card,
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  currentUsername: {
    color: Colors.primary,
  },
  biggestCatch: {
    fontSize: 12,
    color: Colors.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginLeft: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },
  leaguesSection: {
    marginTop: 32,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
  },
  leaguesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  leagueOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  leagueOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leagueOptionText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 12,
  },
  leagueButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  leagueButtonText: {
    color: Colors.card,
    fontSize: 14,
    fontWeight: '600',
  },
});