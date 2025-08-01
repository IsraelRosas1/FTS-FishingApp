export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  profileImageUrl: string | null;
  followers: number;
  following: number;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userDisplayName: string;
  userProfileImage: string | null;
  catchId: string;
  caption: string;
  imageUrl: string;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userDisplayName: string;
  userProfileImage: string | null;
  text: string;
  createdAt: string;
}