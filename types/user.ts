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
  anglerQuestionnaireCompleted?: boolean;
  anglerQuestionnaire?: {
    state: string;
    bodyOfWater: string;
    dateOfBirth: string;
    region: string;
    email: string;
    phone?: string;
  };
}

export interface Post {
  id: string;
  userId: string;
  userDisplayName: string;
  userProfileImage: string | null;
  catchId?: string | null;
  caption: string;
  imageUrl: string | null;
  images?: string[];
  videoUrl?: string | null;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
  lure?: {
    name: string;
    type: string;
    color: string;
    size: string;
  } | null;
  fishDetected?: Array<{
    species: string;
    confidence: number;
  }>;
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