import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity, Animated, ScrollView, Image, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Plus, Play } from 'lucide-react-native';
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
  const [showTopBar, setShowTopBar] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  
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
  const currentData = activeTab === 'posts' ? userPosts : catches;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event: any) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setShowTopBar(offsetY > 200);
      },
    }
  );

  const renderPostsGrid = () => {
    if (activeTab !== 'posts') return null;
    
    const screenWidth = Dimensions.get('window').width;
    const imageSize = (screenWidth - 3) / 2; // 2 columns with 1px gap in middle
    
    return (
      <View style={styles.postsGrid}>
        {userPosts.map((post) => (
          <TouchableOpacity 
            key={post.id}
            style={[styles.gridItem, { width: imageSize, height: imageSize }]}
            onPress={() => router.push(`/post/${post.id}`)}
          >
            {post.videoUrl ? (
              <>
                <Image
                  source={{ uri: post.videoUrl }}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
                <View style={styles.videoIndicator}>
                  <Play size={24} color={Colors.card} fill={Colors.card} />
                </View>
              </>
            ) : post.imageUrl ? (
              <Image
                source={{ uri: post.imageUrl }}
                style={styles.gridImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.gridPlaceholder}>
                <Text style={styles.gridPlaceholderText}>No Media</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCatchbook = () => {
    if (activeTab !== 'catchbook') return null;
    
    return (
      <View style={styles.catchbookContainer}>
        {catches.map((item) => (
          <CatchCard key={item.id} item={item} showDelete={isOwnProfile} />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Sticky Top Bar - appears on scroll */}
      {showTopBar && (
        <Animated.View style={styles.topBar}>
          <Text style={styles.topBarText}>{profileUser?.username}</Text>
        </Animated.View>
      )}

      <Animated.ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header - Fixed */}
        <View style={styles.stickyHeader}>
          <ProfileHeader 
            user={profileUser!} 
            isCurrentUser={isOwnProfile}
            onEditProfile={handleEditProfile}
          />
        </View>

        {/* Tabs */}
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

        {/* Add Catch Button */}
        {activeTab === 'catchbook' && isOwnProfile && (
          <TouchableOpacity 
            style={styles.addCatchButton}
            onPress={() => router.push('/history')}
          >
            <Plus size={20} color={Colors.card} />
            <Text style={styles.addCatchButtonText}>Add New Catch</Text>
          </TouchableOpacity>
        )}

        {/* Content */}
        {currentData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'posts' 
                ? (isOwnProfile ? "You haven't shared any posts yet" : "This user hasn't shared any posts yet")
                : (isOwnProfile ? "You haven't caught any fish yet" : "This user hasn't caught any fish yet")}
            </Text>
          </View>
        ) : (
          <>
            {renderPostsGrid()}
            {renderCatchbook()}
          </>
        )}
      </Animated.ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  stickyHeader: {
    backgroundColor: Colors.background,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  topBarText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
  },
  gridItem: {
    backgroundColor: Colors.card,
    borderWidth: 0.5,
    borderColor: Colors.background,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  gridPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPlaceholderText: {
    color: Colors.textLight,
    fontSize: 12,
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  catchbookContainer: {
    padding: 16,
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