import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Edit, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import { User } from '@/types/user';

interface ProfileHeaderProps {
  user: User;
  isCurrentUser?: boolean;
  onEditProfile?: () => void;
}

export default function ProfileHeader({ user, isCurrentUser = false, onEditProfile }: ProfileHeaderProps) {
  const router = useRouter();
  
  const handleSettingsPress = () => {
    router.push('/settings');
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Image 
          source={{ 
            uri: user.profileImageUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
          }} 
          style={styles.profileImage}
        />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.displayName}>{user.displayName}</Text>
      <Text style={styles.username}>@{user.username}</Text>
      
      {user.bio ? (
        <Text style={styles.bio}>{user.bio}</Text>
      ) : null}
      
      <View style={styles.actionsContainer}>
        {isCurrentUser ? (
          <>
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={onEditProfile}
            >
              <Edit size={18} color={Colors.primary} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.settingsButton} 
              onPress={handleSettingsPress}
            >
              <Settings size={20} color={Colors.textLight} />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Follow</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textLight,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  username: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
  },
  followButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
});