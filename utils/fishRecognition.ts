import { Platform } from 'react-native';
import { useTempCatchStore } from '@/store/tempCatchStore';
import { extractVideoFrames } from './videoFrameExtraction';
import * as FileSystem from 'expo-file-system/legacy';

type ContentPart = 
  | { type: 'text'; text: string; }
  | { type: 'image'; image: string; }

type CoreMessage = 
  | { role: 'system'; content: string; }  
  | { role: 'user'; content: string | Array<ContentPart>; }
  | { role: 'assistant'; content: string | Array<ContentPart>; };

export async function recognizeFish(imageBase64: string): Promise<{ 
  name: string; 
  scientificName: string; 
  description: string; 
  habitat: string;
  confidence: number;
  improvementTips?: string[];
}> {
  try {
    console.log('Starting fish recognition...');
    
    const messages: CoreMessage[] = [
      {
        role: 'system',
        content: 'You are an expert ichthyologist specializing in fish identification. Analyze the ENTIRE provided fish image carefully and return a JSON object with the following fields: name (common name of the fish), scientificName, description (brief description of the fish), habitat (where this fish typically lives). Examine the full image thoroughly - look at all parts of the photo for fish presence, not just the center.'
      },
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Identify the fish species from this complete image. Please examine the entire photo carefully for any fish present:' 
          },
          { 
            type: 'image', 
            image: imageBase64 
          }
        ]
      }
    ];

    console.log('Sending request to AI...');
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      console.error('AI request failed:', response.status, response.statusText);
      throw new Error('Failed to recognize fish');
    }

    const data = await response.json();
    console.log('AI response received:', data);
    
    // Parse the JSON response from the AI
    try {
      const result = JSON.parse(data.completion);
      console.log('Parsed AI result:', result);
      
      const fishData = {
        name: result.name || 'Unknown Fish',
        scientificName: result.scientificName || 'Unknown',
        description: result.description || 'No description available',
        habitat: result.habitat || 'Unknown habitat',
        confidence: result.confidence || 50,
        improvementTips: result.improvementTips || [],
      };

      console.log('Fish identification successful:', fishData);
      return fishData;
    } catch (e) {
      console.log('Failed to parse JSON, trying text extraction:', e);
      // If parsing fails, try to extract information from the text response
      const text = data.completion;
      return {
        name: extractField(text, 'name') || 'Unknown Fish',
        scientificName: extractField(text, 'scientificName') || 'Unknown',
        description: extractField(text, 'description') || 'No description available',
        habitat: extractField(text, 'habitat') || 'Unknown habitat',
        confidence: Number(extractField(text, 'confidence')) || 50,
        improvementTips: [],
      };
    }
  } catch (error) {
    console.error('Error recognizing fish:', error);
    throw error;
  }
}

// New function for real-time video frame analysis
export async function analyzeFishInVideoFrame(imageBase64: string): Promise<{ 
  name: string;
  confidence: number;
}> {
  try {
    const messages: CoreMessage[] = [
      {
        role: 'system',
        content: 'You are an expert in fish identification. Analyze the provided video  and return a JSON object with only two fields: name (common name of the fish) and confidence (a number between 0-100). Be very concise and respond quickly as this is for real-time video analysis. Examine the entire frame for fish presence.'
      },
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Quick identification of fish in this video :' 
          },
          { 
            type: 'image', 
            image: imageBase64 
          }
        ]
      }
    ];

    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze video frame');
    }

    const data = await response.json();
    
    console.log('AI frame analysis response:', data.completion);
    
    try {
      // Remove markdown code block markers if present
      let jsonString = data.completion.trim();
      if (jsonString.startsWith('```json')) {
        jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (jsonString.startsWith('```')) {
        jsonString = jsonString.replace(/```\n?/g, '').trim();
      }
      
      const result = JSON.parse(jsonString);
      console.log('Parsed frame result:', result);
      return {
        name: result.name || 'Analyzing...',
        confidence: result.confidence || 0,
      };
    } catch (e) {
      console.log('Failed to parse frame response, raw text:', data.completion);
      return {
        name: 'Analyzing...',
        confidence: 0,
      };
    }
  } catch (error) {
    console.error('Error analyzing video frame:', error);
    return {
      name: 'Error analyzing',
      confidence: 0,
    };
  }
}

function extractField(text: string, fieldName: string): string | null {
  const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([^"]*)"`, 'i');
  const match = text.match(regex);
  return match ? match[1] : null;
}

export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Helper function to create temp catch with proper data
export function createTempCatch(fishData: any, imageUri: string, location: any) {
  const tempCatch = {
    id: generateUniqueId(),
    fishId: null,
    fishName: fishData.name,
    location: location || {
      latitude: null,
      longitude: null,
      name: null,
    },
    date: new Date().toISOString(),
    imageUri,
    notes: `${fishData.description}

Habitat: ${fishData.habitat}

Scientific Name: ${fishData.scientificName}`,
    confidence: fishData.confidence,
    improvementTips: fishData.improvementTips || [],
  };

  console.log('Creating temp catch:', tempCatch);
  
  // Add to temp store
  useTempCatchStore.getState().addTempCatch(tempCatch);
  
  return tempCatch;
}

/**
 * Analyze video frames to detect fish species
 * Aggregates results from multiple frames to determine the most confident detection
 */
export async function analyzeFishInVideo(
  videoUri: string,
  onProgress?: (progress: number, currentFrame: number, totalFrames: number) => void
): Promise<{
  name: string;
  scientificName: string;
  description: string;
  habitat: string;
  confidence: number;
  improvementTips?: string[];
} | null> {
  try {
    console.log('Starting video fish detection...');
    
    // Extract frames from video
    const { frameUris, success, error } = await extractVideoFrames(videoUri, 5);
    
    if (!success || frameUris.length === 0) {
      console.error('Failed to extract frames:', error);
      return null;
    }
    
    console.log(`Extracted ${frameUris.length} frames from video`);
    
    // Analyze each frame
    const detections: Array<{ name: string; confidence: number }> = [];
    
    for (let i = 0; i < frameUris.length; i++) {
      if (onProgress) {
        onProgress(((i + 1) / frameUris.length) * 100, i + 1, frameUris.length);
      }
      
      try {
        // Convert frame to base64
        const base64 = await FileSystem.readAsStringAsync(frameUris[i], {
          encoding: 'base64',
        });
        
        // Analyze this frame
        const detection = await analyzeFishInVideoFrame(base64);
        
        if (detection.confidence > 30) { // Only consider detections with >30% confidence
          detections.push(detection);
          console.log(`Frame ${i + 1}: ${detection.name} (${detection.confidence}%)`);
        }
      } catch (frameError) {
        console.warn(`Failed to analyze frame ${i}:`, frameError);
      }
    }
    
    if (detections.length === 0) {
      console.log('No fish detected in video frames');
      return null;
    }
    
    // Aggregate results - find the most common fish with highest average confidence
    const fishCounts = new Map<string, { count: number; totalConfidence: number }>();
    
    detections.forEach(({ name, confidence }) => {
      if (!fishCounts.has(name)) {
        fishCounts.set(name, { count: 0, totalConfidence: 0 });
      }
      const current = fishCounts.get(name)!;
      current.count++;
      current.totalConfidence += confidence;
    });
    
    // Find the fish with highest score (count * average confidence)
    let bestFish = { name: '', score: 0, avgConfidence: 0 };
    
    fishCounts.forEach(({ count, totalConfidence }, name) => {
      const avgConfidence = totalConfidence / count;
      const score = count * avgConfidence;
      
      if (score > bestFish.score) {
        bestFish = { name, score, avgConfidence };
      }
    });
    
    console.log(`Best detection: ${bestFish.name} with confidence ${bestFish.avgConfidence.toFixed(1)}%`);
    
    // Get full details for the detected fish
    // Use the first frame for detailed analysis
    const base64 = await FileSystem.readAsStringAsync(frameUris[0], {
      encoding: 'base64',
    });
    
    const fullDetails = await recognizeFish(base64);
    
    return {
      ...fullDetails,
      confidence: Math.round(bestFish.avgConfidence),
    };
    
  } catch (error) {
    console.error('Error analyzing fish in video:', error);
    return null;
  }
}
