import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Trash2, MapPin, Package, Play, Pause, X, Maximize2 } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import Colors from '@/constants/colors';
import { Post } from '@/types/user';
import { useSocialStore } from '@/store/socialStore';
import { useAuthStore } from '@/store/authStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  showComments?: boolean;
}

export default function PostCard({ post, showComments = false }: PostCardProps) {
  const router = useRouter();
  const { likePost, unlikePost, deletePost } = useSocialStore();
  const user = useAuthStore((state) => state.user);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Create video players for main and fullscreen videos
  const videoPlayer = post.videoUrl ? useVideoPlayer(post.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  }) : null;
  
  const fullscreenVideoPlayer = post.videoUrl ? useVideoPlayer(post.videoUrl, (player) => {
    player.loop = true;
    player.muted = false;
  }) : null;
  
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  const handleLike = () => {
    if (!user?.id) return;
    
    if (post.isLiked) {
      unlikePost(post.id, user.id);
    } else {
      likePost(post.id, user.id);
    }
  };
  
  const handleCommentPress = () => {
    router.push(`/post/${post.id}`);
  };
  
  const handleDelete = () => {
    deletePost(post.id);
  };
  
  const handleProfilePress = () => {
    if (post.userId === user?.id) {
      router.push('/profile');
    } else {
      router.push(`/user/${post.userId}`);
    }
  };

  const handleVideoPress = () => {
    if (!videoPlayer) return;
    
    if (videoPlayer.playing) {
      videoPlayer.pause();
    } else {
      videoPlayer.play();
    }
  };

  const handleFullscreenOpen = () => {
    if (videoPlayer) {
      videoPlayer.pause();
    }
    setIsFullscreen(true);
  };

  const handleFullscreenClose = () => {
    if (fullscreenVideoPlayer) {
      fullscreenVideoPlayer.pause();
    }
    setIsFullscreen(false);
  };

  const handleFullscreenVideoPress = () => {
    if (!fullscreenVideoPlayer) return;
    
    if (fullscreenVideoPlayer.playing) {
      fullscreenVideoPlayer.pause();
    } else {
      fullscreenVideoPlayer.play();
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
        {post.userId === user?.id && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Trash2 size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </View>
      
      {post.imageUrl && (
        <Image 
          source={{ uri: post.imageUrl }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      )}
      
      {post.videoUrl && videoPlayer && (
        <View style={styles.videoContainer}>
          <VideoView
            player={videoPlayer}
            style={styles.video}
            nativeControls={false}
            contentFit="contain"
          />
          <TouchableOpacity 
            style={styles.videoPlayButton} 
            onPress={handleVideoPress}
          >
            {videoPlayer.playing ? (
              <Pause size={40} color={Colors.card} />
            ) : (
              <Play size={40} color={Colors.card} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.videoExpandButton} 
            onPress={handleFullscreenOpen}
          >
            <Maximize2 size={24} color={Colors.card} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.content}>
        {post.fishDetected && post.fishDetected.length > 0 && (
          <View style={styles.fishDetectedBanner}>
            <View style={styles.fishDetectedInfo}>
              <Text style={styles.fishSpeciesName}>
                {post.fishDetected[0].species}
              </Text>

            </View>
          </View>
        )}
        
        <Text style={styles.caption}>{post.caption}</Text>
        
        {post.lure && (
          <View style={styles.lureContainer}>
            <Package size={16} color={Colors.primary} />
            <Text style={styles.lureText}>
              {post.lure.name} • {post.lure.type} • {post.lure.color}
            </Text>
          </View>
        )}
        
        {post.location && (
          <View style={styles.locationContainer}>
            <MapPin size={16} color={Colors.textLight} />
            <Text style={styles.locationText}>
              {post.location.latitude.toFixed(4)}, {post.location.longitude.toFixed(4)}
            </Text>
          </View>
        )}
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Heart 
              size={18} 
              color={post.isLiked ? Colors.error : Colors.textLight} 
              fill={post.isLiked ? Colors.error : 'transparent'}
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
            style={[styles.actionButton, post.isLiked && styles.likedButton]} 
            onPress={handleLike}
          >
            <Heart 
              size={20} 
              color={post.isLiked ? Colors.card : Colors.textLight} 
              fill={post.isLiked ? Colors.card : 'transparent'}
            />
            <Text style={[styles.actionText, post.isLiked && styles.likedText]}>
              {post.isLiked ? 'Liked' : 'Like'}
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

      {/* Fullscreen Video Modal */}
      {fullscreenVideoPlayer && (
        <Modal
          visible={isFullscreen}
          transparent={true}
          animationType="fade"
          onRequestClose={handleFullscreenClose}
        >
          <View style={styles.fullscreenContainer}>
            <TouchableOpacity 
              style={styles.fullscreenCloseButton} 
              onPress={handleFullscreenClose}
            >
              <X size={30} color={Colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.fullscreenVideoWrapper}
              onPress={handleFullscreenVideoPress}
              activeOpacity={1}
            >
              <VideoView
                player={fullscreenVideoPlayer}
                style={styles.fullscreenVideo}
                nativeControls={false}
                contentFit="contain"
              />
              {!fullscreenVideoPlayer.playing && (
                <View style={styles.fullscreenPlayButton}>
                  <Play size={60} color={Colors.card} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </Modal>
      )}
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
  deleteButton: {
    padding: 8,
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
  videoContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoExpandButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 16,
    color: Colors.textLight,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  fishDetectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 157, 244, 0.15)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  fishIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  fishDetectedInfo: {
    flex: 1,
  },
  fishSpeciesName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  fishConfidence: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  caption: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 12,
  },
  fishDetectedContainer: {
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  fishDetectedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  fishDetectedText: {
    fontSize: 13,
    color: Colors.primary,
    marginLeft: 8,
  },
  lureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  lureText: {
    fontSize: 13,
    color: Colors.text,
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 4,
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
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideoWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideo: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  fullscreenPlayButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});