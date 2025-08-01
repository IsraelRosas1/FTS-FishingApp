import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Platform, Linking, Dimensions } from 'react-native';
import { MapPin, Fish, Navigation, Map as MapIcon, List, Maximize } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Colors from '@/constants/colors';

interface FishingSpot {
  id: string;
  name: string;
  distance: number;
  fishTypes: string[];
  bestTime: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export default function FishingMapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [fishingSpots, setFishingSpots] = useState<FishingSpot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFullScreenMap, setShowFullScreenMap] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<FishingSpot | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) {
      loadFishingSpots();
    }
  }, [location]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to find nearby fishing spots'
        );
        setIsLoading(false);
        return;
      }

      console.log('Getting current location...');
      const currentLocation = await Location.getCurrentPositionAsync({});
      console.log('Location obtained:', currentLocation.coords);
      setLocation(currentLocation);
      
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Unable to get your current location');
      setIsLoading(false);
    }
  };

  const loadFishingSpots = async () => {
    try {
      console.log('Loading fishing spots...');
      
      // Mock fishing spots data - in a real app, this would come from an API
      const mockSpots: FishingSpot[] = [
        {
          id: '1',
          name: 'Lake Michigan - Grand Haven',
          distance: 12.5,
          fishTypes: ['Salmon', 'Trout', 'Steelhead'],
          bestTime: '6:00 AM - 9:00 AM',
          coordinates: { latitude: 43.0642, longitude: -86.2284 }
        },
        {
          id: '2',
          name: 'Muskegon River',
          distance: 8.3,
          fishTypes: ['Steelhead', 'Brown Trout'],
          bestTime: '5:30 AM - 8:30 AM',
          coordinates: { latitude: 43.2342, longitude: -86.2484 }
        },
        {
          id: '3',
          name: 'White Lake',
          distance: 15.7,
          fishTypes: ['Bass', 'Pike', 'Bluegill'],
          bestTime: '7:00 AM - 10:00 AM',
          coordinates: { latitude: 43.3542, longitude: -86.3284 }
        },
        {
          id: '4',
          name: 'Pere Marquette River',
          distance: 22.1,
          fishTypes: ['Steelhead', 'Salmon'],
          bestTime: '6:00 AM - 9:30 AM',
          coordinates: { latitude: 43.9642, longitude: -86.1284 }
        },
        {
          id: '5',
          name: 'Spring Lake',
          distance: 6.8,
          fishTypes: ['Bass', 'Walleye', 'Perch'],
          bestTime: '6:30 AM - 9:00 AM',
          coordinates: { latitude: 43.1342, longitude: -86.1984 }
        },
        {
          id: '6',
          name: 'Kalamazoo River',
          distance: 18.4,
          fishTypes: ['Steelhead', 'Salmon', 'Brown Trout'],
          bestTime: '5:00 AM - 8:00 AM',
          coordinates: { latitude: 42.6642, longitude: -86.2584 }
        },
        {
          id: '7',
          name: 'Gun Lake',
          distance: 25.3,
          fishTypes: ['Bass', 'Pike', 'Bluegill'],
          bestTime: '7:00 AM - 10:30 AM',
          coordinates: { latitude: 42.4642, longitude: -85.4284 }
        },
        {
          id: '8',
          name: 'Manistee River',
          distance: 35.2,
          fishTypes: ['Steelhead', 'Salmon', 'Brown Trout'],
          bestTime: '5:30 AM - 8:30 AM',
          coordinates: { latitude: 44.2442, longitude: -85.8711 }
        }
      ];
      
      setFishingSpots(mockSpots);
      console.log(`Loaded ${mockSpots.length} fishing spots`);
    } catch (error) {
      console.error('Error loading fishing spots:', error);
      Alert.alert('Error', 'Unable to load fishing spots');
    } finally {
      setIsLoading(false);
    }
  };

  const openInMaps = (spot: FishingSpot) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${spot.coordinates.latitude},${spot.coordinates.longitude}`,
      android: `geo:0,0?q=${spot.coordinates.latitude},${spot.coordinates.longitude}(${spot.name})`,
      web: `https://www.google.com/maps/search/?api=1&query=${spot.coordinates.latitude},${spot.coordinates.longitude}`
    });
    
    if (Platform.OS === 'web' && url) {
      window.open(url, '_blank');
    } else if (url) {
      Linking.openURL(url);
    }
  };

  const handleMarkerPress = (spot: FishingSpot) => {
    setSelectedSpot(spot);
  };

  const renderMapView = () => {
    if (!location) return null;

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {fishingSpots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={spot.coordinates}
              title={spot.name}
              description={`${spot.fishTypes.join(', ')} - ${spot.bestTime}`}
              onPress={() => handleMarkerPress(spot)}
            />
          ))}
        </MapView>
        
        <TouchableOpacity 
          style={styles.fullScreenButton}
          onPress={() => setShowFullScreenMap(true)}
        >
          <Maximize size={20} color={Colors.card} />
        </TouchableOpacity>

        {selectedSpot && (
          <View style={styles.mapSpotCard}>
            <Text style={styles.mapSpotName}>{selectedSpot.name}</Text>
            <Text style={styles.mapSpotDistance}>{selectedSpot.distance} miles away</Text>
            <Text style={styles.mapSpotFish}>Fish: {selectedSpot.fishTypes.join(', ')}</Text>
            <Text style={styles.mapSpotTime}>Best Time: {selectedSpot.bestTime}</Text>
            <TouchableOpacity 
              style={styles.mapDirectionsButton}
              onPress={() => openInMaps(selectedSpot)}
            >
              <Navigation size={16} color={Colors.card} />
              <Text style={styles.mapDirectionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading fishing spots...</Text>
        <Text style={styles.loadingSubtext}>Finding the best places to fish near you</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MapPin size={24} color={Colors.primary} />
        <Text style={styles.headerTitle}>Nearby Fishing Spots</Text>
      </View>
      
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
          onPress={() => setViewMode('list')}
        >
          <List size={20} color={viewMode === 'list' ? Colors.card : Colors.textLight} />
          <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>List View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
          onPress={() => setViewMode('map')}
        >
          <MapIcon size={20} color={viewMode === 'map' ? Colors.card : Colors.textLight} />
          <Text style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>Map View</Text>
        </TouchableOpacity>
      </View>
      
      {location && (
        <View style={styles.locationInfo}>
          <Navigation size={16} color={Colors.textLight} />
          <Text style={styles.locationText}>
            Your location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
          </Text>
        </View>
      )}
      
      {viewMode === 'map' ? (
        renderMapView()
      ) : (
        <ScrollView style={styles.spotsContainer} contentContainerStyle={styles.spotsContent}>
          {fishingSpots.map((spot) => (
            <TouchableOpacity 
              key={spot.id} 
              style={styles.spotCard}
              onPress={() => openInMaps(spot)}
            >
              <View style={styles.spotHeader}>
                <View>
                  <Text style={styles.spotName}>{spot.name}</Text>
                  <Text style={styles.spotDistance}>{spot.distance} miles away</Text>
                </View>
                <TouchableOpacity 
                  style={styles.directionsButton}
                  onPress={() => openInMaps(spot)}
                >
                  <Navigation size={16} color={Colors.card} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.fishTypesContainer}>
                <Fish size={16} color={Colors.primary} />
                <Text style={styles.fishTypesLabel}>Fish Types:</Text>
              </View>
              
              <View style={styles.fishTypesList}>
                {spot.fishTypes.map((fish, index) => (
                  <View key={index} style={styles.fishTypeTag}>
                    <Text style={styles.fishTypeText}>{fish}</Text>
                  </View>
                ))}
              </View>
              
              <Text style={styles.spotTime}>Best Time: {spot.bestTime}</Text>
            </TouchableOpacity>
          ))}
          
          {fishingSpots.length === 0 && !isLoading && (
            <View style={styles.loadingContainer}>
              <Fish size={48} color={Colors.textLight} />
              <Text style={styles.loadingText}>No fishing spots found</Text>
              <Text style={styles.loadingSubtext}>
                Enable location services to find nearby fishing spots
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Full Screen Map Modal */}
      {showFullScreenMap && location && (
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenHeader}>
            <Text style={styles.fullScreenTitle}>Fishing Spots Map</Text>
            <TouchableOpacity 
              style={styles.closeFullScreenButton}
              onPress={() => setShowFullScreenMap(false)}
            >
              <Text style={styles.closeFullScreenText}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <MapView
            style={styles.fullScreenMap}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {fishingSpots.map((spot) => (
              <Marker
                key={spot.id}
                coordinate={spot.coordinates}
                title={spot.name}
                description={`${spot.fishTypes.join(', ')} - ${spot.bestTime}`}
                onPress={() => handleMarkerPress(spot)}
              />
            ))}
          </MapView>
          
          {selectedSpot && (
            <View style={styles.fullScreenSpotCard}>
              <Text style={styles.fullScreenSpotName}>{selectedSpot.name}</Text>
              <Text style={styles.fullScreenSpotDistance}>{selectedSpot.distance} miles away</Text>
              <Text style={styles.fullScreenSpotFish}>Fish: {selectedSpot.fishTypes.join(', ')}</Text>
              <Text style={styles.fullScreenSpotTime}>Best Time: {selectedSpot.bestTime}</Text>
              <TouchableOpacity 
                style={styles.fullScreenDirectionsButton}
                onPress={() => openInMaps(selectedSpot)}
              >
                <Navigation size={16} color={Colors.card} />
                <Text style={styles.fullScreenDirectionsText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeToggle: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textLight,
    marginLeft: 6,
  },
  activeToggleText: {
    color: Colors.card,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textLight,
    marginLeft: 8,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  fullScreenButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapSpotCard: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapSpotName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  mapSpotDistance: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  mapSpotFish: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  mapSpotTime: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
  },
  mapDirectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
  },
  mapDirectionsText: {
    color: Colors.card,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  spotsContainer: {
    flex: 1,
  },
  spotsContent: {
    padding: 16,
    paddingBottom: 40,
  },
  spotCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  spotName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  spotDistance: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  spotTime: {
    fontSize: 14,
    color: Colors.textLight,
  },
  fishTypesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fishTypesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginLeft: 6,
  },
  fishTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  fishTypeTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  fishTypeText: {
    fontSize: 12,
    color: Colors.text,
  },
  directionsButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    zIndex: 1000,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  fullScreenTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeFullScreenButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeFullScreenText: {
    color: Colors.card,
    fontSize: 14,
    fontWeight: '500',
  },
  fullScreenMap: {
    flex: 1,
  },
  fullScreenSpotCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: 200,
  },
  fullScreenSpotName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  fullScreenSpotDistance: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 4,
  },
  fullScreenSpotFish: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  fullScreenSpotTime: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 12,
  },
  fullScreenDirectionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
  },
  fullScreenDirectionsText: {
    color: Colors.card,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 6,
  },
});