import * as VideoThumbnails from 'expo-video-thumbnails';
import { Video } from 'expo-av';
import { Asset } from 'expo-asset';

export interface FrameExtractionResult {
  frameUris: string[];
  success: boolean;
  error?: string;
}

/**
 * Extract multiple frames from a video at different timestamps
 * @param videoUri - The URI of the video file
 * @param numFrames - Number of frames to extract (default: 5)
 * @returns Array of frame URIs
 */
export async function extractVideoFrames(
  videoUri: string,
  numFrames: number = 5
): Promise<FrameExtractionResult> {
  try {
    const frameUris: string[] = [];
    
    // Extract frames at fixed intervals that should work for most videos
    // Using absolute times: 1s, 2s, 3s, 4s, 5s
    const timePositions = [1000, 2000, 3000, 4000, 5000]; // milliseconds
    
    for (let i = 0; i < Math.min(numFrames, timePositions.length); i++) {
      try {
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
          time: timePositions[i],
          quality: 0.8, // High quality for better fish detection
        });
        frameUris.push(uri);
        console.log(`Extracted frame ${i + 1} at ${timePositions[i]}ms:`, uri);
      } catch (frameError: any) {
        console.warn(`Failed to extract frame ${i} at ${timePositions[i]}ms:`, frameError.message);
        // If we fail at a specific time, try the first frame as fallback
        if (i === 0) {
          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
              time: 0,
              quality: 0.8,
            });
            frameUris.push(uri);
            console.log('Extracted fallback frame at 0ms:', uri);
          } catch (fallbackError) {
            console.warn('Fallback frame extraction also failed');
          }
        }
      }
    }
    
    if (frameUris.length === 0) {
      return {
        frameUris: [],
        success: false,
        error: 'Failed to extract any frames from video',
      };
    }
    
    console.log(`Successfully extracted ${frameUris.length} frames from video`);
    return {
      frameUris,
      success: true,
    };
  } catch (error: any) {
    console.error('Error extracting video frames:', error);
    return {
      frameUris: [],
      success: false,
      error: error.message || 'Failed to extract frames',
    };
  }
}

/**
 * Extract a single thumbnail from a video
 * @param videoUri - The URI of the video file
 * @param timeMs - Time in milliseconds to extract the frame (default: 1000ms)
 * @returns Frame URI
 */
export async function extractSingleFrame(
  videoUri: string,
  timeMs: number = 1000
): Promise<string | null> {
  try {
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: timeMs,
      quality: 0.8,
    });
    return uri;
  } catch (error) {
    console.error('Error extracting single frame:', error);
    return null;
  }
}
