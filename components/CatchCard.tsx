import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { formatDistanceToNow } from 'date-fns';
import { MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Catch } from '@/types/fish';

interface CatchCardProps {
  item: Catch;
}

export default function CatchCard({ item }: CatchCardProps) {
  const router = useRouter();
  
  const formattedDate = formatDistanceToNow(new Date(item.date), { addSuffix: true });
  
  const handlePress = () => {
    router.push(`/catch/${item.id}`);
  };
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.imageUri }} 
        style={styles.image}
        resizeMode="cover"
      />
      
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
    </TouchableOpacity>
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
  image: {
    width: '100%',
    height: 180,
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