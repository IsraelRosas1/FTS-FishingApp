import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Grid, List, Settings } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useSocialStore } from '@/store/socialStore';
import { useCatchStore } from '@/store/catchStore';
import ProfileHeader from '@/components/ProfileHeader';
import PostCard from '@/components/PostCard';
import CatchCard from '@/components/CatchCard';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { Catch } from '@/types/fish';
import { Post } from '@/types/user';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const posts = useSocialStore((state) => 
    state.posts.filter((post) => post.userId === user?.id)
  );
  const catches = useCatchStore((state) => state.catches);
  
  const [activeTab, setActiveTab] = useState<'catchbook' | 'posts'>('catchbook');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.notAuthenticatedContainer}>
          <Text style={styles.notAuthenticatedText}>Please sign in to view your profile</Text>
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/signin')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  const handleEditProfile = () => {
    router.push('/edit-profile');
  };
  
  const renderGridItem = ({ item }: { item: Catch | Post }) => {
    if (activeTab === 'posts') {
      const post = item as Post;
      return (
        <TouchableOpacity 
          style={styles.gridItem}
          onPress={() => router.push(`/post/${post.id}`)}
        >
          <Image 
            source={{ uri: post.imageUrl }} 
            style={styles.gridImage}
          />
        </TouchableOpacity>
      );
    } else {
      const catchItem = item as Catch;
      return (
        <TouchableOpacity 
          style={styles.gridItem}
          onPress={() => router.push(`/catch/${catchItem.id}`)}
        >
          <Image 
            source={{ uri: catchItem.imageUri }} 
            style={styles.gridImage}
          />
          <View style={styles.gridOverlay}>
            <Text style={styles.gridFishName} numberOfLines={1}>
              {catchItem.fishName || 'Unknown'}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };
  
  const renderListItem = ({ item }: { item: Catch | Post }) => {
    if (activeTab === 'catchbook') {
      return <CatchCard item={item as Catch} />;
    } else {
      return <PostCard post={item as Post} />;
    }
  };
  
  // Get the correct data based on active tab with proper typing
  const getCurrentData = (): (Catch | Post)[] => {
    return activeTab === 'catchbook' ? catches : posts;
  };
  
  const currentData = getCurrentData();
  const isEmpty = currentData.length === 0;
  
  return (
    <View style={styles.container}>
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        renderItem={viewMode === 'list' ? renderListItem : renderGridItem}
        numColumns={viewMode === 'grid' ? 3 : 1}
        key={`${viewMode}-${activeTab}`}
        ListHeaderComponent={
          <>
            <ProfileHeader 
              user={user} 
              isCurrentUser={true}
              onEditProfile={handleEditProfile}
            />
            
            <View style={styles.tabsContainer}>
              <TouchableOpacity 
                style={[
                  styles.tab, 
                  activeTab === 'catchbook' && styles.activeTab
                ]}
                onPress={() => setActiveTab('catchbook')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'catchbook' && styles.activeTabText
                ]}>
                  Catchbook ({catches.length})
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.tab, 
                  activeTab === 'posts' && styles.activeTab
                ]}
                onPress={() => setActiveTab('posts')}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === 'posts' && styles.activeTabText
                ]}>
                  Posts ({posts.length})
                </Text>
              </TouchableOpacity>
              
              <View style={styles.viewModeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.viewModeButton,
                    viewMode === 'list' && styles.activeViewMode
                  ]}
                  onPress={() => setViewMode('list')}
                >
                  <List size={20} color={viewMode === 'list' ? Colors.primary : Colors.textLight} />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.viewModeButton,
                    viewMode === 'grid' && styles.activeViewMode
                  ]}
                  onPress={() => setViewMode('grid')}
                >
                  <Grid size={20} color={viewMode === 'grid' ? Colors.primary : Colors.textLight} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          isEmpty ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'catchbook' 
                  ? "You haven't caught any fish yet" 
                  : "You haven't shared any posts yet"}
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/history')}
              >
                <Text style={styles.emptyButtonText}>
                  {activeTab === 'catchbook' 
                    ? "Identify Your First Fish" 
                    : "Share a Catch"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        contentContainerStyle={[
          styles.listContent,
          isEmpty && styles.emptyListContent
        ]}
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
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notAuthenticatedText: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  signInButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 40,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: Colors.background,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
  },
  viewModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeViewMode: {
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  gridItem: {
    flex: 1/3,
    aspectRatio: 1,
    margin: 1,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
  },
  gridFishName: {
    color: Colors.card,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});