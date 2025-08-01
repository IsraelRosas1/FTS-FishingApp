import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { Comment } from '@/types/user';
import { useAuthStore } from '@/store/authStore';

interface CommentItemProps {
  comment: Comment;
}

export default function CommentItem({ comment }: CommentItemProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  const handleProfilePress = () => {
    if (comment.userId === user?.id) {
      router.push('/profile');
    } else {
      router.push(`/user/${comment.userId}`);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleProfilePress}>
        <Image 
          source={{ 
            uri: comment.userProfileImage || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
          }} 
          style={styles.profileImage}
        />
      </TouchableOpacity>
      
      <View style={styles.commentContent}>
        <View style={styles.commentBubble}>
          <Text style={styles.userName}>{comment.userDisplayName}</Text>
          <Text style={styles.commentText}>{comment.text}</Text>
        </View>
        <Text style={styles.timeText}>{formattedDate}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentBubble: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 12,
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: Colors.text,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textLight,
    marginLeft: 12,
  },
});