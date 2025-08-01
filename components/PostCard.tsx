import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Post } from '@/types/user';
import { useSocialStore } from '@/store/socialStore';
import { useAuthStore } from '@/store/authStore';

interface PostCardProps {
  post: Post;
  showComments?: boolean;
}

export default function PostCard({ post, showComments = false }: PostCardProps) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const { likePost, unlikePost } = useSocialStore();
  const user = useAuthStore((state) => state.user);
  
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  const handleLike = () => {
    if (isLiked) {
      unlikePost(post.id);
    } else {
      likePost(post.id);
    }
    setIsLiked(!isLiked);
  };
  
  const handleCommentPress = () => {
    router.push(`/post/${post.id}`);
  };
  
  const handleProfilePress = () => {
    if (post.userId === user?.id) {
      router.push('/profile');
    } else {
      router.push(`/user/${post.userId}`);
    }
  };
  
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo} onPress={handleProfilePress}>
          <Image 
            source={{ 
              uri: post.userProfileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
            }} 
            style={styles.profileImage}
          />
          <View>
            <Text style={styles.userName}>{post.userDisplayName}</Text>
            <Text style={styles.postTime}>{formattedDate}</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <Image 
        source={{ uri: post.imageUrl }} 
        style={styles.postImage}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.caption}>{post.caption}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Heart 
              size={18} 
              color={isLiked ? Colors.error : Colors.textLight} 
              fill={isLiked ? Colors.error : 'transparent'}
            />
            <Text style={styles.statText}>{post.likes}</Text>
          </View>
          
          <View style={styles.stat}>
            <MessageCircle size={18} color={Colors.textLight} />
            <Text style={styles.statText}>{post.comments}</Text>
          </View>
        </View>
        
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.likedButton]} 
            onPress={handleLike}
          >
            <Heart 
              size={20} 
              color={isLiked ? Colors.card : Colors.textLight} 
              fill={isLiked ? Colors.card : 'transparent'}
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleCommentPress}
          >
            <MessageCircle size={20} color={Colors.textLight} />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Share2 size={20} color={Colors.textLight} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  postTime: {
    fontSize: 12,
    color: Colors.textLight,
  },
  postImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  caption: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  likedButton: {
    backgroundColor: Colors.primary,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  likedText: {
    color: Colors.card,
  },
});