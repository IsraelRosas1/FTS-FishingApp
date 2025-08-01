import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, Edit2, Trash2, Save, Share2, BookOpen } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useCatchStore } from '@/store/catchStore';
import { useTempCatchStore } from '@/store/tempCatchStore';
import { useAuthStore } from '@/store/authStore';
import { useSocialStore } from '@/store/socialStore';
import ImprovementTips from '@/components/ImprovementTips';

export default function CatchDetailScreen() {
  const { id, showShare, temp } = useLocalSearchParams<{ 
    id: string; 
    showShare?: string; 
    temp?: string; 
  }>();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(showShare === 'true');
  
  const isTemporary = temp === 'true';
  
  // Get catch from appropriate store
  const permanentCatch = useCatchStore((state) => 
    state.catches.find((c) => c.id === id)
  );
  const tempCatch = useTempCatchStore((state) => state.getTempCatch(id || ''));
  
  const catchItem = isTemporary ? tempCatch : permanentCatch;
  
  const updateCatch = useCatchStore((state) => state.updateCatch);
  const deleteCatch = useCatchStore((state) => state.deleteCatch);
  const addCatch = useCatchStore((state) => state.addCatch);
  const removeTempCatch = useTempCatchStore((state) => state.removeTempCatch);
  
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const createPost = useSocialStore((state) => state.createPost);
  
  const [editedName, setEditedName] = useState(catchItem?.fishName || '');
  const [editedNotes, setEditedNotes] = useState(catchItem?.notes || '');
  const [caption, setCaption] = useState('');

  // Add temp catch to temp store when component mounts if it doesn't exist
  useEffect(() => {
    if (isTemporary && !tempCatch && id) {
      // This means we need to create the temp catch from the navigation params
      // In a real app, you'd pass the catch data through navigation
      console.log('Temp catch not found, this should not happen in normal flow');
    }
  }, [isTemporary, tempCatch, id]);
  
  if (!catchItem) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Catch not found</Text>
      </View>
    );
  }
  
  const handleEdit = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setIsEditing(true);
  };
  
  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    if (isTemporary) {
      // If it's temporary, we need to save it to permanent storage first
      const updatedCatch = {
        ...catchItem,
        fishName: editedName,
        notes: editedNotes,
      };
      addCatch(updatedCatch);
      removeTempCatch(id);
      router.replace(`/catch/${id}?showShare=true`);
    } else {
      updateCatch(id, {
        fishName: editedName,
        notes: editedNotes,
      });
    }
    setIsEditing(false);
  };
  
  const handleSaveToCatchbook = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    addCatch(catchItem);
    removeTempCatch(id);
    
    Alert.alert(
      "Saved to Catchbook!",
      "This fish has been saved to your catchbook. You can view it in your profile.",
      [
        {
          text: "View Profile",
          onPress: () => router.push('/profile')
        },
        {
          text: "OK"
        }
      ]
    );
  };
  
  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      "Delete Catch",
      "Are you sure you want to delete this catch? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            if (isTemporary) {
              removeTempCatch(id);
            } else {
              deleteCatch(id);
            }
            router.replace('/history');
          },
          style: "destructive"
        }
      ]
    );
  };
  
  const handleShare = () => {
    if (!isAuthenticated) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to share your catches",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          { 
            text: "Sign In", 
            onPress: () => router.push('/(auth)/signin')
          }
        ]
      );
      return;
    }
    
    setShowShareOptions(true);
  };
  
  const handleSharePost = () => {
    if (!user || !caption) return;
    
    // If it's temporary, save it first
    if (isTemporary) {
      addCatch(catchItem);
      removeTempCatch(id);
    }
    
    createPost(
      user.id,
      user.displayName,
      user.profileImageUrl,
      catchItem.id,
      caption,
      catchItem.imageUri
    );
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    Alert.alert(
      "Shared Successfully",
      "Your catch has been shared to your profile",
      [{ text: "OK" }]
    );
    
    setShowShareOptions(false);
    setCaption('');
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image 
        source={{ uri: catchItem.imageUri }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.detailsContainer}>
        {isTemporary && (
          <View style={styles.tempBanner}>
            <Text style={styles.tempBannerText}>
              Preview Mode - This catch is not saved yet
            </Text>
          </View>
        )}
        
        {isEditing ? (
          <TextInput
            style={styles.nameInput}
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Fish name"
          />
        ) : (
          <Text style={styles.fishName}>{catchItem.fishName || 'Unknown Fish'}</Text>
        )}
        
        <View style={styles.metaContainer}>
          <Text style={styles.date}>{formatDate(catchItem.date)}</Text>
          
          {catchItem.location?.latitude && catchItem.location?.longitude && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color={Colors.textLight} />
              <Text style={styles.locationText}>
                {catchItem.location.name || `${catchItem.location.latitude.toFixed(4)}, ${catchItem.location.longitude.toFixed(4)}`}
              </Text>
            </View>
          )}
        </View>
        
        {catchItem.confidence !== undefined && (
          <View style={[
            styles.confidenceBadge, 
            catchItem.confidence > 80 ? styles.highConfidence : 
            catchItem.confidence > 50 ? styles.mediumConfidence : 
            styles.lowConfidence
          ]}>
            <Text style={styles.confidenceText}>
              AI Confidence: {catchItem.confidence}%
            </Text>
          </View>
        )}
        
        {catchItem.improvementTips && catchItem.improvementTips.length > 0 && (
          <ImprovementTips 
            tips={catchItem.improvementTips} 
            confidence={catchItem.confidence || 0} 
          />
        )}
        
        <View style={styles.notesSection}>
          <Text style={styles.sectionTitle}>Notes</Text>
          
          {isEditing ? (
            <TextInput
              style={styles.notesInput}
              value={editedNotes}
              onChangeText={setEditedNotes}
              placeholder="Add notes about this catch..."
              multiline
              numberOfLines={6}
            />
          ) : (
            <Text style={styles.notesText}>{catchItem.notes}</Text>
          )}
        </View>
        
        {showShareOptions && isAuthenticated && (
          <View style={styles.shareSection}>
            <Text style={styles.sectionTitle}>Share to Feed</Text>
            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="Write a caption for your post..."
              multiline
              numberOfLines={3}
            />
            
            <TouchableOpacity 
              style={[styles.sharePostButton, !caption ? styles.disabledButton : null]} 
              onPress={handleSharePost}
              disabled={!caption}
            >
              <Share2 size={20} color={Colors.card} />
              <Text style={styles.sharePostButtonText}>Share Post</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          {isTemporary && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveToCatchbookButton]} 
              onPress={handleSaveToCatchbook}
            >
              <BookOpen size={20} color={Colors.card} />
              <Text style={styles.actionButtonText}>Save to Catchbook</Text>
            </TouchableOpacity>
          )}
          
          {isEditing ? (
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]} 
              onPress={handleSave}
            >
              <Save size={20} color={Colors.card} />
              <Text style={styles.actionButtonText}>Save Changes</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]} 
                onPress={handleEdit}
              >
                <Edit2 size={20} color={Colors.card} />
                <Text style={styles.actionButtonText}>Edit Details</Text>
              </TouchableOpacity>
              
              {!showShareOptions && !isTemporary && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.shareButton]} 
                  onPress={handleShare}
                >
                  <Share2 size={20} color={Colors.card} />
                  <Text style={styles.actionButtonText}>Share Catch</Text>
                </TouchableOpacity>
              )}
            </>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={handleDelete}
          >
            <Trash2 size={20} color={Colors.card} />
            <Text style={styles.actionButtonText}>
              {isTemporary ? 'Discard' : 'Delete Catch'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 300,
  },
  detailsContainer: {
    padding: 16,
  },
  tempBanner: {
    backgroundColor: Colors.accent,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  tempBannerText: {
    color: Colors.card,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  fishName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingBottom: 4,
  },
  metaContainer: {
    marginBottom: 16,
  },
  date: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 16,
    color: Colors.textLight,
    marginLeft: 6,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  highConfidence: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  mediumConfidence: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
  },
  lowConfidence: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  confidenceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  notesText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  notesInput: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.card,
    textAlignVertical: 'top',
  },
  shareSection: {
    marginBottom: 24,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
  },
  captionInput: {
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.background,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  sharePostButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  sharePostButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionsContainer: {
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  saveToCatchbookButton: {
    backgroundColor: Colors.success,
  },
  editButton: {
    backgroundColor: Colors.primary,
  },
  saveButton: {
    backgroundColor: Colors.success,
  },
  shareButton: {
    backgroundColor: Colors.secondary,
  },
  deleteButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 40,
  },
});