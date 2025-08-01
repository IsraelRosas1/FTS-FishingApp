import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { CameraView as ExpoCameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { Camera, FlipHorizontal, Video, Image as ImageIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';
import { recognizeFish, analyzeFishInVideoFrame, createTempCatch } from '@/utils/fishRecognition';
import { useAuthStore } from '@/store/authStore';

export default function CameraView() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoAnalysisResult, setVideoAnalysisResult] = useState<{ name: string; confidence: number } | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPermission, requestLocationPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<any>(null);
  const frameAnalysisInterval = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      requestLocationPermission(status === 'granted');
    })();

    return () => {
      if (frameAnalysisInterval.current) {
        clearInterval(frameAnalysisInterval.current);
      }
    };
  }, []);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <TouchableOpacity 
          style={styles.permissionButton} 
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const toggleCameraMode = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    setIsVideoMode(!isVideoMode);
    setVideoAnalysisResult(null);
  };

  const takePicture = async () => {
    if (isCapturing || !cameraRef.current) return;
    
    try {
      setIsCapturing(true);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Take the picture
      const photo = await cameraRef.current.takePictureAsync();
      
      // Resize the image to reduce size for AI processing
      const manipResult = await manipulateAsync(
        photo.uri,
        [{ resize: { width: 800 } }],
        { format: SaveFormat.JPEG, compress: 0.8, base64: true }
      );

      // Get current location if permission granted
      let location = null;
      if (locationPermission) {
        try {
          const currentLocation = await Location.getCurrentPositionAsync({});
          location = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            name: null,
          };
        } catch (err) {
          console.log('Error getting location:', err);
        }
      }

      // Process the image with AI
      const fishData = await recognizeFish(manipResult.base64 || '');
      
      // Create a temp catch entry
      const tempCatch = createTempCatch(fishData, photo.uri, location);
      
      // Navigate to the result screen
      router.push(`/catch/${tempCatch.id}?temp=true`);
    } catch (error) {
      console.error('Error taking picture:', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const startVideoRecording = async () => {
    if (!cameraRef.current || Platform.OS === 'web') return;
    
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      setIsRecording(true);
      
      // Start analyzing frames at regular intervals
      frameAnalysisInterval.current = setInterval(async () => {
        if (!cameraRef.current) return;
        
        try {
          // Take a snapshot of the current frame
          const frame = await cameraRef.current.takePictureAsync({
            quality: 0.5,
            base64: true,
            skipProcessing: true,
          });
          
          // Analyze the frame
          const result = await analyzeFishInVideoFrame(frame.base64 || '');
          setVideoAnalysisResult(result);
        } catch (error) {
          console.error('Error analyzing video frame:', error);
        }
      }, 2000); // Analyze every 2 seconds
      
    } catch (error) {
      console.error('Error starting video recording:', error);
      setIsRecording(false);
      if (frameAnalysisInterval.current) {
        clearInterval(frameAnalysisInterval.current);
      }
    }
  };

  const stopVideoRecording = async () => {
    if (!cameraRef.current || !isRecording) return;
    
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
      
      setIsRecording(false);
      
      // Stop frame analysis
      if (frameAnalysisInterval.current) {
        clearInterval(frameAnalysisInterval.current);
      }
      
      // For now, just take a final picture to simulate video capture
      await takePicture();
      
    } catch (error) {
      console.error('Error stopping video recording:', error);
    }
  };

  const handleCameraAction = () => {
    if (isVideoMode) {
      if (isRecording) {
        stopVideoRecording();
      } else {
        startVideoRecording();
      }
    } else {
      takePicture();
    }
  };

  return (
    <View style={styles.container}>
      <ExpoCameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={toggleCameraFacing}
          >
            <FlipHorizontal color={Colors.card} size={24} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.captureButton,
              isVideoMode && isRecording && styles.recordingButton
            ]} 
            onPress={handleCameraAction}
            disabled={isCapturing && !isVideoMode}
          >
            {isCapturing && !isVideoMode ? (
              <ActivityIndicator color={Colors.primary} size="large" />
            ) : (
              <View style={[
                styles.captureButtonInner,
                isVideoMode && isRecording && styles.recordingButtonInner
              ]} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.modeButton,
              isVideoMode && styles.videoModeActive
            ]} 
            onPress={toggleCameraMode}
          >
            {isVideoMode ? (
              <ImageIcon color={Colors.card} size={24} />
            ) : (
              <Video color={Colors.card} size={24} />
            )}
          </TouchableOpacity>
        </View>
        
        {isVideoMode && videoAnalysisResult && (
          <View style={styles.videoAnalysisContainer}>
            <Text style={styles.videoAnalysisText}>
              {videoAnalysisResult.name}
            </Text>
            <View style={[
              styles.confidenceBar,
              { width: `${videoAnalysisResult.confidence}%` }
            ]} />
          </View>
        )}
      </ExpoCameraView>
      
      {isCapturing && !isVideoMode && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.processingText}>Identifying fish...</Text>
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoModeActive: {
    backgroundColor: 'rgba(255,0,0,0.6)',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.card,
  },
  recordingButton: {
    borderColor: 'rgba(255,0,0,0.8)',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.card,
  },
  recordingButtonInner: {
    width: 30,
    height: 30,
    borderRadius: 5,
    backgroundColor: 'rgba(255,0,0,0.8)',
  },
  message: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '600',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: Colors.card,
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  videoAnalysisContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 12,
  },
  videoAnalysisText: {
    color: Colors.card,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  confidenceBar: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    maxWidth: width - 60,
  },
});