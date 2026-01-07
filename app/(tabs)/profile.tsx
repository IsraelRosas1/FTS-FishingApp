import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useSocialStore } from '@/store/socialStore';
import { useCatchStore } from '@/store/catchStore';
import ProfileHeader from '@/components/ProfileHeader';
import PostCard from '@/components/PostCard';
import CatchCard from '@/components/CatchCard';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { Post } from '@/types/user';
import { Catch } from '@/types/fish';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/firebaseConfig';

export default function ProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { posts, loadPosts } = useSocialStore();
  const { catches, loadCatches } = useCatchStore();
  
  const [profileUser, setProfileUser] = useState(currentUser);
  const [isOwnProfile, setIsOwnProfile] = useState(!id);
  const [activeTab, setActiveTab] = useState<'posts' | 'catchbook'>('posts');
  
  const loadOtherUserProfile = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileUser({
          id: userId,
          email: userData.email,
          displayName: userData.displayName,
          profileImageUrl: userData.profileImageUrl,
          bio: userData.bio,
          username: userData.username || userData.displayName?.toLowerCase().replace(/\s+/g, ''),
          followers: userData.followers || 0,
          following: userData.following || 0,
          createdAt: userData.createdAt?.toDate()?.toISOString() || new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)');
      return;
    }
    
    if (id && id !== currentUser?.id) {
      // Load other user's profile
      loadOtherUserProfile(id);
      setIsOwnProfile(false);
    } else {
      setProfileUser(currentUser);
      setIsOwnProfile(true);
    }
  }, [id, currentUser, isAuthenticated]);
  
  useEffect(() => {
    if (currentUser?.id) {
      loadPosts(currentUser.id);
    }
    if (profileUser?.id) {
      loadCatches(profileUser.id);
    }
  }, [currentUser?.id, profileUser?.id]);
  
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
  
  if (!profileUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  const handleEditProfile = () => {
    router.push('/edit-profile');
  };
  
  const userPosts = posts.filter(post => post.userId === profileUser?.id);
  
  const renderItem = ({ item }: { item: Post | Catch }) => {
    if (activeTab === 'posts') {
      return <PostCard post={item as Post} />;
    } else {
      return <CatchCard item={item as Catch} showDelete={isOwnProfile} />;
    }
  };
  
  const getCurrentData = (): (Post | Catch)[] => {
    return activeTab === 'posts' ? userPosts : catches;
  };
  
  const currentData = getCurrentData();
  const isEmpty = currentData.length === 0;
  
  const renderHeader = () => (
    <>
      <ProfileHeader 
        user={profileUser!} 
        isCurrentUser={isOwnProfile}
        onEditProfile={handleEditProfile}
      />
      <View style={styles.tabsContainer}>
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
            Posts ({userPosts.length})
          </Text>
        </TouchableOpacity>
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
            Catchbook 
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'catchbook' && isOwnProfile && (
        <TouchableOpacity 
          style={styles.addCatchButton}
          onPress={() => router.push('/history')}
        >
          <Plus size={20} color={Colors.card} />
          <Text style={styles.addCatchButtonText}>Add New Catch</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          isEmpty ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'posts' 
                  ? (isOwnProfile ? "You haven't shared any posts yet" : "This user hasn't shared any posts yet")
                  : (isOwnProfile ? "You haven't caught any fish yet" : "This user hasn't caught any fish yet")}
              </Text>
            </View>
          ) : null
        }
        contentContainerStyle={[
          styles.listContent,
          isEmpty && styles.emptyListContent
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
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
    paddingBottom: 40,
  },
  sectionsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  section: {
    flex: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
  },
  activeTabText: {
    color: Colors.primary,
  },
  addCatchButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  addCatchButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  emptyListContent: {
    flexGrow: 1,
  },
});