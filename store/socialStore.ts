import { create } from 'zustand';
import { Post, Comment } from '@/types/user';
import { generateUniqueId } from '@/utils/fishRecognition';
import { useCatchStore } from './catchStore';

interface SocialState {
  posts: Post[];
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  createPost: (userId: string, userDisplayName: string, userProfileImage: string | null, catchId: string, caption: string, imageUrl: string) => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  addComment: (postId: string, userId: string, userDisplayName: string, userProfileImage: string | null, text: string) => void;
  deletePost: (postId: string) => void;
  deleteComment: (commentId: string) => void;
  fetchPostComments: (postId: string) => Comment[];
}

// Mock posts for demo
const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    userId: 'user-2',
    userDisplayName: 'Sarah Waters',
    userProfileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    catchId: 'catch-1',
    caption: 'Beautiful rainbow trout caught in Lake Michigan! #fishing #trout',
    imageUrl: 'https://images.unsplash.com/photo-1583766395091-2eb9994ed094?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    likes: 42,
    comments: 5,
    createdAt: '2025-06-10T14:30:00Z',
  },
  {
    id: 'post-2',
    userId: 'user-3',
    userDisplayName: 'Mike Rivers',
    userProfileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    catchId: 'catch-2',
    caption: 'Caught this massive bass today! Personal best. #bassfishing',
    imageUrl: 'https://images.unsplash.com/photo-1598111497309-326fa864a213?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    likes: 78,
    comments: 12,
    createdAt: '2025-06-11T09:15:00Z',
  },
  {
    id: 'post-3',
    userId: 'user-4',
    userDisplayName: 'Emma Fisher',
    userProfileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1361&q=80',
    catchId: 'catch-3',
    caption: 'Early morning catch on the pier. The AI identified this as a Yellowtail Snapper!',
    imageUrl: 'https://images.unsplash.com/photo-1531930961384-9b1e6db3a5d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    likes: 56,
    comments: 8,
    createdAt: '2025-06-12T07:45:00Z',
  }
];

// Mock comments for demo
const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-1',
    userId: 'user-3',
    userDisplayName: 'Mike Rivers',
    userProfileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80',
    text: 'Beautiful catch! What bait did you use?',
    createdAt: '2025-06-10T15:10:00Z',
  },
  {
    id: 'comment-2',
    postId: 'post-1',
    userId: 'user-4',
    userDisplayName: 'Emma Fisher',
    userProfileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1361&q=80',
    text: 'Lake Michigan has been great this season!',
    createdAt: '2025-06-10T16:22:00Z',
  },
  {
    id: 'comment-3',
    postId: 'post-2',
    userId: 'user-1',
    userDisplayName: 'Joe Fisher',
    userProfileImage: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    text: "That's a monster! Congrats on the PB!",
    createdAt: '2025-06-11T10:05:00Z',
  },
];

export const useSocialStore = create<SocialState>((set, get) => ({
  posts: MOCK_POSTS,
  comments: MOCK_COMMENTS,
  isLoading: false,
  error: null,
  
  createPost: (userId, userDisplayName, userProfileImage, catchId, caption, imageUrl) => {
    const newPost: Post = {
      id: generateUniqueId(),
      userId,
      userDisplayName,
      userProfileImage,
      catchId,
      caption,
      imageUrl,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      posts: [newPost, ...state.posts],
    }));
  },
  
  likePost: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) => 
        post.id === postId 
          ? { ...post, likes: post.likes + 1, isLiked: true } 
          : post
      ),
    }));
  },
  
  unlikePost: (postId) => {
    set((state) => ({
      posts: state.posts.map((post) => 
        post.id === postId 
          ? { ...post, likes: Math.max(0, post.likes - 1), isLiked: false } 
          : post
      ),
    }));
  },
  
  addComment: (postId, userId, userDisplayName, userProfileImage, text) => {
    const newComment: Comment = {
      id: generateUniqueId(),
      postId,
      userId,
      userDisplayName,
      userProfileImage,
      text,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      comments: [...state.comments, newComment],
      posts: state.posts.map((post) => 
        post.id === postId 
          ? { ...post, comments: post.comments + 1 } 
          : post
      ),
    }));
  },
  
  deletePost: (postId) => {
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
      comments: state.comments.filter((comment) => comment.postId !== postId),
    }));
  },
  
  deleteComment: (commentId) => {
    const comment = get().comments.find((c) => c.id === commentId);
    if (!comment) return;
    
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== commentId),
      posts: state.posts.map((post) => 
        post.id === comment.postId 
          ? { ...post, comments: Math.max(0, post.comments - 1) } 
          : post
      ),
    }));
  },
  
  fetchPostComments: (postId) => {
    return get().comments.filter((comment) => comment.postId === postId);
  },
}));