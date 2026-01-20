import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';
import { Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Comment } from '@/types/user';
import { useAuthStore } from '@/store/authStore';
import { useSocialStore } from '@/store/socialStore';

interface CommentItemProps {
  comment: Comment;
  onDelete?: () => void;
}

export default function CommentItem({ comment, onDelete }: CommentItemProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const deleteComment = useSocialStore((state) => state.deleteComment);
  const [isDeleting, setIsDeleting] = useState(false);
  const formattedDate = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
  
  const isOwner = comment.userId === user?.id;
  
  const handleProfilePress = () => {
    if (comment.userId === user?.id) {
      router.push('/profile');
    } else {
      router.push(`/user/${comment.userId}`);
    }
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteComment(comment.id);
              if (onDelete) onDelete();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
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
          <View style={styles.commentHeader}>
            <Text style={styles.userName}>{comment.userDisplayName}</Text>
            {isOwner && (
              <TouchableOpacity 
                onPress={handleDelete} 
                disabled={isDeleting}
                style={styles.deleteButton}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <Trash2 size={16} color={Colors.error} />
                )}
              </TouchableOpacity>
            )}
          </View>
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
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
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