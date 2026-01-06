import { create } from 'zustand';
import { Post, Comment } from '@/types/user';
import { generateUniqueId } from '@/utils/fishRecognition';
import { useCatchStore } from './catchStore';
// FIREBASE IMPORTS
import { db } from '@/src/firebaseConfig';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, where, orderBy, getDoc } from 'firebase/firestore';

interface SocialState {
  posts: Post[];
  comments: Comment[];
  isLoading: boolean;
  error: string | null;
  loadPosts: (userId?: string) => Promise<void>;
  createPost: (userId: string, userDisplayName: string, userProfileImage: string | null, catchId: string, caption: string, imageUrl: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  unlikePost: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, userId: string, userDisplayName: string, userProfileImage: string | null, text: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  deleteComment: (commentId: string) => void;
  fetchPostComments: (postId: string) => Promise<Comment[]>;
}

// Mock posts for demo
const MOCK_POSTS: Post[] = [
  {
    id: 'post-1',
    userId: 'user-2',
    userDisplayName: 'Ricky ',
    userProfileImage: 'https://images.fishbrain.com/6C_V0frY_1JmjctxCCsQFe_egg4PiEj0w3U8jJ8Dc20/rs:fill-down:1680:1680/g:sm/f:webp/plain/s3://fishbrain/7pt3bvslhvb9xeel6ssyhdzvqd49',
    catchId: 'catch-1',
    caption: 'Beautiful Silverfish my dad caught in Lake Michigan! #fishing',
    imageUrl: 'https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?q=80&w=2370&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    likes: 42,
    comments: 5,
    createdAt: '2025-06-10T14:30:00Z',
  },
  {
    id: 'post-2',
    userId: 'user-3',
    userDisplayName: 'Joe Schmoe',
    userProfileImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhcFKPS1PQXIiEptbNIMX1vzAHvfyKPUtICoDhlwztrdL2tdiXmcrsiCuSmdYRLqMoMGk&usqp=CAU',
    catchId: 'catch-2',
    caption: 'Caught this massive bass today! Personal best. #bassfishing',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRL6rAyknLEjVNK0rFbDm0RYeLvzR-VIV3rUw&s',
    likes: 78,
    comments: 12,
    createdAt: '2025-06-11T09:15:00Z',
  },
  
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

export const useSocialStore = create<SocialState>()((set, get) => ({
  posts: [],
  comments: MOCK_COMMENTS,
  isLoading: false,
  error: null,
  
  loadPosts: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const postsQuery = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(postsQuery);
      
      // Get liked posts for current user if logged in
      let likedPostIds = new Set<string>();
      if (userId) {
        const likesQuery = query(collection(db, 'postLikes'), where('userId', '==', userId));
        const likesSnapshot = await getDocs(likesQuery);
        likedPostIds = new Set(likesSnapshot.docs.map(doc => doc.data().postId));
      }
      
      const posts: Post[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        isLiked: likedPostIds.has(doc.id),
      } as Post));
      
      set({ posts, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  createPost: async (userId, userDisplayName, userProfileImage, catchId, caption, imageUrl) => {
    const newPost: Omit<Post, 'id'> = {
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
    
    try {
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      const postWithId: Post = { id: docRef.id, ...newPost };
      set((state) => ({
        posts: [postWithId, ...state.posts],
      }));
    } catch (error) {
      console.error('Error creating post:', error);
    }
  },
  
  likePost: async (postId, userId) => {
    try {
      // Check if user already liked this post
      const likeQuery = query(
        collection(db, 'postLikes'), 
        where('userId', '==', userId), 
        where('postId', '==', postId)
      );
      const likeSnapshot = await getDocs(likeQuery);
      
      if (!likeSnapshot.empty) {
        // User already liked this post
        return;
      }
      
      // Add like to postLikes collection
      await addDoc(collection(db, 'postLikes'), {
        userId,
        postId,
        createdAt: new Date().toISOString(),
      });
      
      // Update post likes count
      const postRef = doc(db, 'posts', postId);
      const post = get().posts.find(p => p.id === postId);
      if (!post) return;
      
      const newLikes = post.likes + 1;
      await updateDoc(postRef, { likes: newLikes });
      
      set((state) => ({
        posts: state.posts.map((p) => 
          p.id === postId 
            ? { ...p, likes: newLikes, isLiked: true } 
            : p
        ),
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  },
  
  unlikePost: async (postId, userId) => {
    try {
      // Find and delete the like document
      const likeQuery = query(
        collection(db, 'postLikes'), 
        where('userId', '==', userId), 
        where('postId', '==', postId)
      );
      const likeSnapshot = await getDocs(likeQuery);
      
      if (likeSnapshot.empty) {
        // User hasn't liked this post
        return;
      }
      
      // Delete the like document
      await deleteDoc(likeSnapshot.docs[0].ref);
      
      // Update post likes count
      const postRef = doc(db, 'posts', postId);
      const post = get().posts.find(p => p.id === postId);
      if (!post) return;
      
      const newLikes = Math.max(0, post.likes - 1);
      await updateDoc(postRef, { likes: newLikes });
      
      set((state) => ({
        posts: state.posts.map((p) => 
          p.id === postId 
            ? { ...p, likes: newLikes, isLiked: false } 
            : p
        ),
      }));
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  },
  
  addComment: async (postId, userId, userDisplayName, userProfileImage, text) => {
    const newComment: Omit<Comment, 'id'> = {
      postId,
      userId,
      userDisplayName,
      userProfileImage,
      text,
      createdAt: new Date().toISOString(),
    };
    
    try {
      const docRef = await addDoc(collection(db, 'comments'), newComment);
      const commentWithId: Comment = { id: docRef.id, ...newComment };
      
      set((state) => ({
        comments: [...state.comments, commentWithId],
        posts: state.posts.map((post) => 
          post.id === postId 
            ? { ...post, comments: post.comments + 1 } 
            : post
        ),
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  },
  
  deletePost: async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== postId),
        comments: state.comments.filter((comment) => comment.postId !== postId),
      }));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
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
  
  fetchPostComments: async (postId) => {
    try {
      const commentsQuery = query(collection(db, 'comments'), where('postId', '==', postId), orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(commentsQuery);
      const comments: Comment[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Comment));
      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },
}));