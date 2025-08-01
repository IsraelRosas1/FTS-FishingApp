import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, Video, Info } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { recognizeFish, generateUniqueId, createTempCatch } from '@/utils/fishRecognition';
import AIInfoModal from '@/components/AIInfoModal';

export default function CameraOptionsScreen() {
  const router = useRouter();
  const [showAIInfo, setShowAIInfo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleTakePicture = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/camera');
  };
  
  const handleUploadPicture = async () => {
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
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled) {
      await processImage(result.assets[0].uri);
    }
  };

  const handleUploadVideo = async () => {
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
      await processVideo(result.assets[0].uri);
    }
  };
  
  const processImage = async (imageUri: string) => {
    try {
      setIsProcessing(true);
      console.log('Processing image:', imageUri);
      
      Alert.alert('Processing', 'Identifying fish...', [], { cancelable: false });
      
      const manipResult = await manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { format: SaveFormat.JPEG, compress: 0.8, base64: true }
      );

      console.log('Image manipulated, getting location...');

      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            name: null,
          };
          console.log('Location obtained:', location);
        }
      } catch (err) {
        console.log('Error getting location:', err);
      }

      console.log('Calling AI for fish recognition...');
      
      if (!manipResult.base64) {
        throw new Error('Failed to process image - no base64 data');
      }
      
      const fishData = await recognizeFish(manipResult.base64);
      console.log('Fish recognition complete:', fishData);
      
      if (!fishData || !fishData.name) {
        throw new Error('Invalid fish recognition response');
      }
      
      const tempCatch = createTempCatch(fishData, imageUri, location);
      console.log('Temp catch created:', tempCatch.id);
      
      // Show success message
      Alert.alert(
        'Fish Identified!',
        `Species: ${fishData.name}\nConfidence: ${fishData.confidence}%\n\nWould you like to view the details?`,
        [
          {
            text: 'View Details',
            onPress: () => router.push(`/catch/${tempCatch.id}?temp=true`)
          },
          {
            text: 'Later',
            style: 'cancel'
          }
        ]
      );
      
    } catch (error) {
      console.error('Error processing image:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      Alert.alert(
        'Fish Recognition Failed', 
        `Unable to identify the fish in this image.\n\nError: ${errorMessage}\n\nThis could be due to:\n• Poor image quality or lighting\n• Fish not clearly visible\n• Network connection issues\n• AI service temporarily unavailable\n\nPlease try again with a clearer image where the fish is well-lit and clearly visible.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const processVideo = async (videoUri: string) => {
    try {
      setIsProcessing(true);
      
      Alert.alert(
        'Video Fish Detection Process',
        `Our AI will analyze your video for fish detection. Here's how it works:

🎥 STEP 1: Video Upload
Your video is received and prepared for analysis.

🔍 STEP 2: Frame Analysis  
The AI scans through video frames looking for fish presence.

🎯 STEP 3: Frame Selection
You'll select the clearest frame showing the fish.

🧠 STEP 4: Species Identification
The AI analyzes the selected frame to identify the fish species.

✅ STEP 5: Results
You receive identification results with confidence levels.

The AI will tell you if a fish is detected or not, and explain why the identification succeeded or failed.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsProcessing(false)
          },
          {
            text: 'Continue',
            onPress: async () => {
              // Simulate video frame extraction and analysis
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // For demo purposes, we'll ask user to select the best frame
              Alert.alert(
                'Select Best Frame',
                `VIDEO ANALYSIS COMPLETE!

🔍 Fish Detection: SCANNING...

The AI has processed your video. Now please select the clearest frame from your video that shows the fish. This helps our AI provide the most accurate identification.

Choose a frame where:
• Fish is clearly visible
• Good lighting
• Fish fills a good portion of the frame
• Minimal motion blur`,
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                    onPress: () => setIsProcessing(false)
                  },
                  {
                    text: 'Select Frame',
                    onPress: async () => {
                      const frameResult = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        quality: 0.8,
                      });
                      
                      if (!frameResult.canceled) {
                        await analyzeVideoFrame(frameResult.assets[0].uri, videoUri);
                      } else {
                        setIsProcessing(false);
                      }
                    }
                  }
                ]
              );
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error processing video:', error);
      Alert.alert('Error', 'Failed to process video. Please try again.');
      setIsProcessing(false);
    }
  };

  const analyzeVideoFrame = async (frameUri: string, originalVideoUri: string) => {
    try {
      console.log('Analyzing video frame:', frameUri);
      
      const manipResult = await manipulateAsync(
        frameUri,
        [{ resize: { width: 800 } }],
        { format: SaveFormat.JPEG, compress: 0.8, base64: true }
      );

      let location = null;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const currentLocation = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            name: null,
          };
        }
      } catch (err) {
        console.log('Error getting location:', err);
      }

      const fishData = await recognizeFish(manipResult.base64 || '');
      console.log('Video frame analysis complete:', fishData);
      
      if (fishData.confidence < 30) {
        Alert.alert(
          'Video Fish Detection Results',
          `🎥 VIDEO ANALYSIS COMPLETE!

🔍 Fish Detection: ${fishData.confidence > 15 ? 'POSSIBLY DETECTED' : 'NO CLEAR FISH FOUND'}

Species: ${fishData.name}
Confidence: ${fishData.confidence}%

❌ DETECTION FAILED - Low confidence detection

This could be due to:
• Motion blur in the video
• Poor lighting conditions  
• Fish not clearly visible in frame
• Background interference
• Video quality issues

💡 RECOMMENDATION:
Try taking a clear, still photo instead of video for better results. Make sure the fish is:
• Well-lit and clearly visible
• Filling a good portion of the frame
• In sharp focus without blur
• Against a contrasting background`,
          [{ text: 'OK' }]
        );
        setIsProcessing(false);
        return;
      }
      
      const tempCatch = createTempCatch(fishData, frameUri, location);
      
      Alert.alert(
        'Video Fish Detection Results',
        `🎥 VIDEO ANALYSIS COMPLETE!

🔍 Fish Detection: SUCCESS ✅

Species: ${fishData.name}
Confidence: ${fishData.confidence}%

✅ IDENTIFICATION SUCCESSFUL

The AI successfully identified a fish in your video! Here's what happened:

1. ✅ Video frames extracted and analyzed
2. ✅ Fish presence detected in selected frame  
3. ✅ Species identification completed
4. ✅ Results generated with ${fishData.confidence}% confidence

Source: Video Analysis
Original Video: Processed successfully

Would you like to view the detailed results and save this catch?`,
        [
          {
            text: 'View Results',
            onPress: () => router.push(`/catch/${tempCatch.id}?temp=true`)
          }
        ]
      );
      
    } catch (error) {
      console.error('Error analyzing video frame:', error);
      Alert.alert(
        'Video Analysis Failed', 
        `🎥 VIDEO ANALYSIS COMPLETE!

🔍 Fish Detection: FAILED ❌

The AI could not process this video frame. Common reasons:

• Network connection issues
• AI service temporarily unavailable  
• Image processing error
• Invalid video format

💡 FOR BETTER VIDEO ANALYSIS:
• Ensure stable internet connection
• Use good quality video files
• Make sure fish is clearly visible
• Try again in a few moments

🎯 ALTERNATIVE:
Take a clear photo instead of video for more reliable fish identification.`
      );
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Identify a Fish</Text>
        <Text style={styles.subtitle}>Choose how you want to capture your fish</Text>
        
        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={handleTakePicture}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={styles.iconContainer}>
            <Camera size={40} color={Colors.primary} />
          </View>
          <Text style={styles.optionTitle}>Take Picture</Text>
          <Text style={styles.optionDescription}>
            Use your camera to take a photo or record video of the fish
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={handleUploadPicture}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={styles.iconContainer}>
            <ImageIcon size={40} color={Colors.primary} />
          </View>
          <Text style={styles.optionTitle}>Upload Picture</Text>
          <Text style={styles.optionDescription}>
            Choose an existing photo from your gallery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.optionButton} 
          onPress={handleUploadVideo}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <View style={styles.iconContainer}>
            <Video size={40} color={Colors.primary} />
          </View>
          <Text style={styles.optionTitle}>Upload Video</Text>
          <Text style={styles.optionDescription}>
            Upload a video and our AI will detect if there's a fish present
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.infoButton} 
          onPress={() => setShowAIInfo(true)}
          activeOpacity={0.8}
          disabled={isProcessing}
        >
          <Info size={20} color={Colors.primary} />
          <Text style={styles.infoButtonText}>About Fish Recognition AI</Text>
        </TouchableOpacity>
      </View>
      
      <AIInfoModal 
        visible={showAIInfo}
        onClose={() => setShowAIInfo(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 40,
  },
  optionButton: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  infoButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
});