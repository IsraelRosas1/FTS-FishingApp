import React, { useEffect, useState } from 'react';
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useSocialStore } from '@/store/socialStore';
import { User, Post } from '@/types/user';
import PostCard from '@/components/PostCard';
import ProfileHeader from '@/components/ProfileHeader';
import EmptyState from '@/components/EmptyState';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchUserProfile, loadUserPosts } = useSocialStore();
  
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadUserData();
  }, [id]);
  
  const loadUserData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch user profile
      const userProfile = await fetchUserProfile(id);
      
      if (!userProfile) {
        setError('User not found');
        setIsLoading(false);
        return;
      }
      
      setUser(userProfile);
      
      // Fetch user's posts
      const userPosts = await loadUserPosts(id);
      setPosts(userPosts);
    } catch (err: any) {
      setError(err.message || 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  
  if (error || !user) {
    return (
      <EmptyState 
        title="User not found"
        message={error || "This user doesn't exist"}
      />
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          <ProfileHeader 
            user={user} 
            isCurrentUser={false}
          />
        }
        ListEmptyComponent={
          <EmptyState 
            title="No posts yet"
            message={`${user.displayName} hasn't shared any catches yet`}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
});