import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { X, Image as ImageIcon, Video as VideoIcon, Package, Plus, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { recognizeFish } from '@/utils/fishRecognition';
import { useAuthStore } from '@/store/authStore';
import { useSocialStore } from '@/store/socialStore';
import { uploadImage, uploadVideo, generateImagePath, generateVideoPath } from '@/utils/firebaseStorage';

interface LureOption {
  id: string;
  name: string;
  type: string;
  color: string;
  size: string;
}

const POPULAR_LURES: LureOption[] = [
  { id: '1', name: 'Spinnerbait', type: 'Spinner', color: 'Silver/Blue', size: '3/8 oz' },
  { id: '2', name: 'Crankbait', type: 'Crankbait', color: 'Shad', size: '2.5"' },
  { id: '3', name: 'Soft Plastic Worm', type: 'Soft Plastic', color: 'Green Pumpkin', size: '6"' },
  { id: '4', name: 'Jig', type: 'Jig', color: 'Black/Blue', size: '1/2 oz' },
  { id: '5', name: 'Topwater Popper', type: 'Topwater', color: 'Chrome', size: '3"' },
  { id: '6', name: 'Swimbait', type: 'Swimbait', color: 'Rainbow Trout', size: '4"' },
  { id: '7', name: 'Spoon', type: 'Spoon', color: 'Gold', size: '1/4 oz' },
  { id: '8', name: 'Jerkbait', type: 'Jerkbait', color: 'Pearl', size: '4.5"' },
  { id: '9', name: 'Chatterbait', type: 'Vibrating Jig', color: 'White', size: '3/8 oz' },
  { id: '10', name: 'Texas Rig', type: 'Soft Plastic', color: 'Watermelon', size: '5"' },
];

export default function CreatePostScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const createPost = useSocialStore((state) => state.createPost);

  const [postText, setPostText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [selectedLure, setSelectedLure] = useState<LureOption | null>(null);
  const [showLureMenu, setShowLureMenu] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fishRecognitionResults, setFishRecognitionResults] = useState<any[]>([]);

  const handleClose = () => {
    if (postText || images.length > 0 || videoUri || selectedLure) {
      Alert.alert(
        'Discard Post?',
        'Are you sure you want to discard this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleAddImage = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10 - images.length,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages]);

      // Run fish recognition on the images
      await recognizeFishInImages(newImages);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant permission to access your camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImage = result.assets[0].uri;
      setImages([...images, newImage]);

      // Run fish recognition on the image
      await recognizeFishInImages([newImage]);
    }
  };

  const recognizeFishInImages = async (imageUris: string[]) => {
    setIsProcessing(true);
    const results: any[] = [];

    for (const uri of imageUris) {
      try {
        const manipResult = await manipulateAsync(
          uri,
          [{ resize: { width: 800 } }],
          { format: SaveFormat.JPEG, compress: 0.8, base64: true }
        );

        if (manipResult.base64) {
          const fishData = await recognizeFish(manipResult.base64);
          results.push({
            uri,
            fishData,
          });
        }
      } catch (error) {
        console.error('Error recognizing fish in image:', error);
      }
    }

    setFishRecognitionResults([...fishRecognitionResults, ...results]);
    setIsProcessing(false);

    // Show fish detection results with option to edit species name
    if (results.length > 0) {
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.fishData.confidence > 30) {
          // Show alert for each detected fish
          await new Promise<void>((resolve) => {
            Alert.prompt(
              'Fish Detected!',
              `Species: ${result.fishData.name}\n\nWould you like to edit the species name?`,
              [
                {
                  text: 'Keep',
                  onPress: () => resolve(),
                  style: 'cancel',
                },
                {
                  text: 'Edit',
                  onPress: (newName?: string) => {
                    if (newName && newName.trim()) {
                      // Update the fish data with new name
                      const updatedResults = [...fishRecognitionResults, ...results];
                      const resultIndex = fishRecognitionResults.length + i;
                      updatedResults[resultIndex] = {
                        ...updatedResults[resultIndex],
                        fishData: {
                          ...updatedResults[resultIndex].fishData,
                          name: newName.trim(),
                        },
                      };
                      setFishRecognitionResults(updatedResults);
                    }
                    resolve();
                  },
                },
              ],
              'plain-text',
              result.fishData.name
            );
          });
        }
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setFishRecognitionResults(fishRecognitionResults.filter((_, i) => i !== index));
  };

  const handleEditFishSpecies = (index: number) => {
    const result = fishRecognitionResults[index];
    if (!result) return;

    Alert.prompt(
      'Edit Fish Species',
      `Current: ${result.fishData.name}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: (newName?: string) => {
            if (newName && newName.trim()) {
              const updatedResults = [...fishRecognitionResults];
              updatedResults[index] = {
                ...updatedResults[index],
                fishData: {
                  ...updatedResults[index].fishData,
                  name: newName.trim(),
                },
              };
              setFishRecognitionResults(updatedResults);
            }
          },
        },
      ],
      'plain-text',
      result.fishData.name
    );
  };

  const handleAddVideo = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'You need to grant permission to access your videos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
    }
  };

  const handleSelectLure = (lure: LureOption) => {
    setSelectedLure(lure);
    setShowLureMenu(false);
  };

  const handleCreatePost = async () => {
    if (!postText && images.length === 0 && !videoUri) {
      Alert.alert('Empty Post', 'Please add some content to your post');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be signed in to create a post');
      return;
    }

    setIsProcessing(true);

    try {
      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          };
        }
      } catch (err) {
        console.log('Error getting location:', err);
      }

      // Upload images to Firebase Storage
      let uploadedImages: string[] = [];
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const imageUri = images[i];
          if (imageUri.startsWith('http')) {
            uploadedImages.push(imageUri);
          } else {
            const imagePath = generateImagePath(user.id, 'post', `image_${i}_${Date.now()}.jpg`);
            const downloadUrl = await uploadImage(imageUri, imagePath);
            uploadedImages.push(downloadUrl);
          }
        }
      }

      // Upload video to Firebase Storage if present
      let uploadedVideoUrl: string | null = null;
      if (videoUri) {
        if (videoUri.startsWith('http')) {
          uploadedVideoUrl = videoUri;
        } else {
          const videoPath = generateVideoPath(user.id, 'post', `video_${Date.now()}.mp4`);
          uploadedVideoUrl = await uploadVideo(videoUri, videoPath);
        }
      }

      // Create post data
      const postData = {
        userId: user.id,
        userDisplayName: user.displayName,
        userProfileImage: user.profileImageUrl,
        content: postText,
        imageUrl: uploadedImages[0] || null, // Main image
        images: uploadedImages, // All images
        videoUrl: uploadedVideoUrl,
        location: location,
        lure: selectedLure ? {
          name: selectedLure.name,
          type: selectedLure.type,
          color: selectedLure.color,
          size: selectedLure.size,
        } : null,
        fishDetected: fishRecognitionResults
          .filter((r) => r.fishData.confidence > 50)
          .map((r) => ({
            species: r.fishData.name,
            confidence: r.fishData.confidence,
          })),
        createdAt: new Date().toISOString(),
      };

      await createPost(postData);

      Alert.alert('Success', 'Your post has been created!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          onPress={handleCreatePost}
          style={[styles.postButton, isProcessing && styles.postButtonDisabled]}
          disabled={isProcessing}
        >
          <Text style={styles.postButtonText}>
            {isProcessing ? 'Posting...' : 'Post'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind?"
          placeholderTextColor={Colors.textLight}
          multiline
          value={postText}
          onChangeText={setPostText}
          maxLength={1000}
        />

        <Text style={styles.characterCount}>{postText.length}/1000</Text>

        {/* Image Grid */}
        {images.length > 0 && (
          <View style={styles.imageGrid}>
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                {fishRecognitionResults[index] &&
                  fishRecognitionResults[index].fishData.confidence > 30 && (
                    <TouchableOpacity 
                      style={styles.fishBadge}
                      onPress={() => handleEditFishSpecies(index)}
                    >
                      <Text style={styles.fishBadgeText}>
                        🐟 {fishRecognitionResults[index].fishData.name}
                      </Text>
                      <Text style={styles.fishBadgeSubtext}>
                        Tap to edit
                      </Text>
                    </TouchableOpacity>
                  )}
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => handleRemoveImage(index)}
                >
                  <X size={16} color={Colors.card} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Video Preview */}
        {videoUri && (
          <View style={styles.videoContainer}>
            <View style={styles.videoPreview}>
              <VideoIcon size={48} color={Colors.primary} />
              <Text style={styles.videoText}>Video attached</Text>
            </View>
            <TouchableOpacity
              style={styles.removeVideoButton}
              onPress={() => setVideoUri(null)}
            >
              <X size={16} color={Colors.card} />
            </TouchableOpacity>
          </View>
        )}

        {/* Selected Lure */}
        {selectedLure && (
          <View style={styles.selectedLureContainer}>
            <Text style={styles.selectedLureTitle}>Lure Used:</Text>
            <View style={styles.lureCard}>
              <View style={styles.lureInfo}>
                <Text style={styles.lureName}>{selectedLure.name}</Text>
                <Text style={styles.lureDetails}>
                  {selectedLure.type} • {selectedLure.color} • {selectedLure.size}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedLure(null)}>
                <Trash2 size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
            <ImageIcon size={24} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleAddImage}>
            <Plus size={24} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Add Images</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleAddVideo}>
            <VideoIcon size={24} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Add Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowLureMenu(!showLureMenu)}
          >
            <Package size={24} color={Colors.primary} />
            <Text style={styles.actionButtonText}>Add Lure</Text>
          </TouchableOpacity>
        </View>

        {/* Lure Selection Menu */}
        {showLureMenu && (
          <View style={styles.lureMenu}>
            <Text style={styles.lureMenuTitle}>Select a Lure</Text>
            {POPULAR_LURES.map((lure) => (
              <TouchableOpacity
                key={lure.id}
                style={styles.lureMenuItem}
                onPress={() => handleSelectLure(lure)}
              >
                <View style={styles.lureMenuItemContent}>
                  <Text style={styles.lureMenuItemName}>{lure.name}</Text>
                  <Text style={styles.lureMenuItemDetails}>
                    {lure.type} • {lure.color} • {lure.size}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>Analyzing images...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  postButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    color: Colors.text,
    padding: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'right',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
  },
  imageContainer: {
    width: '48%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fishBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(42, 157, 244, 0.9)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  fishBadgeText: {
    fontSize: 12,
    color: Colors.card,
    fontWeight: '600',
  },
  fishBadgeSubtext: {
    fontSize: 10,
    color: Colors.card,
    opacity: 0.9,
    marginTop: 2,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    margin: 16,
    position: 'relative',
  },
  videoPreview: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  videoText: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 12,
    fontWeight: '500',
  },
  removeVideoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLureContainer: {
    padding: 16,
  },
  selectedLureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  lureCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lureInfo: {
    flex: 1,
  },
  lureName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  lureDetails: {
    fontSize: 14,
    color: Colors.textLight,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    margin: '1%',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  lureMenu: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lureMenuTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  lureMenuItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lureMenuItemContent: {
    flex: 1,
  },
  lureMenuItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  lureMenuItemDetails: {
    fontSize: 14,
    color: Colors.textLight,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  processingText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 12,
  },
});
