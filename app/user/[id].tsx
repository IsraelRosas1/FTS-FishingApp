import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useSocialStore } from '@/store/socialStore';
import PostCard from '@/components/PostCard';
import ProfileHeader from '@/components/ProfileHeader';
import EmptyState from '@/components/EmptyState';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // In a real app, we would fetch the user data from the API
  // For now, we'll use mock data based on the first post by this user
  const posts = useSocialStore((state) => 
    state.posts.filter((post) => post.userId === id)
  );
  
  const firstPost = posts[0];
  
  if (!firstPost) {
    return (
      <EmptyState 
        title="User not found"
        message="This user doesn't exist or hasn't posted anything yet"
      />
    );
  }
  
  // Create a mock user from the post data
  const mockUser = {
    id: firstPost.userId,
    username: firstPost.userDisplayName.toLowerCase().replace(/\s/g, '_'),
    email: `${firstPost.userDisplayName.toLowerCase().replace(/\s/g, '.')}@example.com`,
    displayName: firstPost.userDisplayName,
    bio: `Fishing enthusiast and nature lover. Check out my latest catches!`,
    profileImageUrl: firstPost.userProfileImage,
    followers: Math.floor(Math.random() * 500) + 50,
    following: Math.floor(Math.random() * 300) + 20,
    createdAt: firstPost.createdAt,
  };
  
  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          <ProfileHeader 
            user={mockUser} 
            isCurrentUser={false}
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
});