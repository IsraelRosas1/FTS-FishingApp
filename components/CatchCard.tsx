import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Catch } from '@/types/fish';
import { useCatchStore } from '@/store/catchStore';
import { useAuthStore } from '@/store/authStore';

interface CatchCardProps {
  item: Catch;
  showDelete?: boolean;
}

export default function CatchCard({ item, showDelete = false }: CatchCardProps) {
  const router = useRouter();
  const { deleteCatch } = useCatchStore();
  const user = useAuthStore((state) => state.user);
  const [hasImageError, setHasImageError] = useState(false);
  
  const formattedDate = formatDistanceToNow(new Date(item.date), { addSuffix: true });
  
  if (hasImageError) return null;
  
  const handlePress = () => {
    router.push(`/catch/${item.id}`);
  };
  
  const handleDelete = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert(
      'Delete Catch',
      'Are you sure you want to delete this catch? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          onPress: async () => {
            if (!user?.id) {
              Alert.alert('Error', 'You must be logged in to delete catches');
              return;
            }
            
            try {
              await deleteCatch(item.id, user.id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete catch');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };
  
  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.imageContainer} 
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.imageUri }} 
          style={styles.image}
          resizeMode="cover"
          onError={() => setHasImageError(true)}
        />
        
        {showDelete && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash2 size={20} color={Colors.error} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      <View style={styles.infoContainer}>
        <Text style={styles.fishName}>{item.fishName || 'Unknown Fish'}</Text>
        
        <View style={styles.detailsRow}>
          <Text style={styles.date}>{formattedDate}</Text>
          
          {item.location?.name && (
            <View style={styles.locationContainer}>
              <MapPin size={14} color={Colors.textLight} />
              <Text style={styles.location}>{item.location.name}</Text>
            </View>
          )}
        </View>
        
        {item.confidence !== undefined && (
          <View style={[
            styles.confidenceBadge, 
            item.confidence > 80 ? styles.highConfidence : 
            item.confidence > 50 ? styles.mediumConfidence : 
            styles.lowConfidence
          ]}>
            <Text style={styles.confidenceText}>
              {item.confidence > 80 ? 'High' : 
               item.confidence > 50 ? 'Medium' : 
               'Low'} confidence
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  fishName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: Colors.textLight,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 4,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
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
    fontSize: 12,
    fontWeight: '500',
  },
});