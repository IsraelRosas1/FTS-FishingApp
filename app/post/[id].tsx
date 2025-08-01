import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Send } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useSocialStore } from '@/store/socialStore';
import { useAuthStore } from '@/store/authStore';
import PostCard from '@/components/PostCard';
import CommentItem from '@/components/CommentItem';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [commentText, setCommentText] = useState('');
  
  const post = useSocialStore((state) => 
    state.posts.find((p) => p.id === id)
  );
  const comments = useSocialStore((state) => 
    state.fetchPostComments(id || '')
  );
  const addComment = useSocialStore((state) => state.addComment);
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!post) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }
  
  const handleAddComment = () => {
    if (!commentText.trim() || !user || !isAuthenticated) return;
    
    addComment(
      post.id,
      user.id,
      user.displayName,
      user.profileImageUrl,
      commentText.trim()
    );
    
    setCommentText('');
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommentItem comment={item} />}
        ListHeaderComponent={
          <>
            <PostCard post={post} showComments={true} />
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>
                Comments ({comments.length})
              </Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyComments}>
            <Text style={styles.emptyCommentsText}>
              No comments yet. Be the first to comment!
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
      
      {isAuthenticated && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Add a comment..."
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              !commentText.trim() && styles.disabledButton
            ]}
            onPress={handleAddComment}
            disabled={!commentText.trim()}
          >
            <Send size={20} color={Colors.card} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  commentsHeader: {
    marginTop: 20,
    marginBottom: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  emptyComments: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
});