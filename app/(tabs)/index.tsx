import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Trophy } from 'lucide-react-native';
import { useSocialStore } from '@/store/socialStore';
import { useAuthStore } from '@/store/authStore';
import PostCard from '@/components/PostCard';
import EmptyState from '@/components/EmptyState';
import LeaderboardView from '@/components/LeaderboardView';
import Colors from '@/constants/colors';

type FeedMode = 'social' | 'competitive';

export default function FeedScreen() {
  const router = useRouter();
  const [feedMode, setFeedMode] = useState<FeedMode>('social');
  const posts = useSocialStore((state) => state.posts);
  const isLoading = useSocialStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated]);
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  if (!isAuthenticated) {
    return null;
  }
  
  const renderSocialFeed = () => {
    if (posts.length === 0) {
      return (
        <EmptyState 
          title="No posts yet"
          message="Start by identifying a fish and sharing your catch!"
          buttonText="Identify Fish"
          onPress={() => router.push('/history')}
        />
      );
    }
    
    return (
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, feedMode === 'social' && styles.activeToggle]}
          onPress={() => setFeedMode('social')}
        >
          <Users size={20} color={feedMode === 'social' ? Colors.card : Colors.textLight} />
          <Text style={[styles.toggleText, feedMode === 'social' && styles.activeToggleText]}>Social Feed</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleButton, feedMode === 'competitive' && styles.activeToggle]}
          onPress={() => setFeedMode('competitive')}
        >
          <Trophy size={20} color={feedMode === 'competitive' ? Colors.card : Colors.textLight} />
          <Text style={[styles.toggleText, feedMode === 'competitive' && styles.activeToggleText]}>Leaderboard</Text>
        </TouchableOpacity>
      </View>
      
      {feedMode === 'social' ? renderSocialFeed() : <LeaderboardView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
    marginLeft: 6,
  },
  activeToggleText: {
    color: Colors.card,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
});